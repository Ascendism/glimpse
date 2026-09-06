'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function dbPath(root) {
  return path.join(root, 'identity.sqlite');
}

function credsPath(root) {
  return path.join(root, 'discord.json');
}

function openIdentityDb(root) {
  fs.mkdirSync(root, { recursive: true });
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath(root));
    db.pragma('journal_mode = WAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS identities (
        player_id TEXT PRIMARY KEY,
        discord_id TEXT UNIQUE,
        username TEXT,
        display_name TEXT,
        avatar TEXT,
        updated_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS oauth_state (
        state TEXT PRIMARY KEY,
        invite TEXT,
        created_at INTEGER
      );
      CREATE TABLE IF NOT EXISTS chat (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        player_id TEXT,
        display_name TEXT,
        text TEXT NOT NULL,
        at INTEGER
      );
      CREATE INDEX IF NOT EXISTS chat_room_at ON chat(room_id, at);
    `);
    return db;
  } catch {
    return openMemoryIdentityDb();
  }
}

function openMemoryIdentityDb() {
  const identities = new Map();
  const byDiscord = new Map();
  const sessions = new Map();
  const oauth = new Map();
  const chat = [];
  let nextChatId = 1;

  function identRow(playerId) {
    const r = identities.get(playerId);
    return r ? { ...r } : null;
  }

  return {
    memory: true,
    pragma() {
      return 'memory';
    },
    exec() {},
    close() {},
    prepare(sql) {
      const s = String(sql);
      return {
        get(...args) {
          if (/FROM identities WHERE discord_id/.test(s) && /SELECT player_id/.test(s)) {
            const pid = byDiscord.get(String(args[0]));
            return pid ? { player_id: pid } : undefined;
          }
          if (/FROM identities WHERE player_id/.test(s)) {
            return identRow(args[0]) || undefined;
          }
          if (/FROM identities WHERE discord_id/.test(s)) {
            const pid = byDiscord.get(String(args[0]));
            return pid ? identRow(pid) : undefined;
          }
          if (/FROM sessions s JOIN identities/.test(s)) {
            const sess = sessions.get(args[0]);
            if (!sess) return undefined;
            const ident = identRow(sess.player_id);
            return ident ? { sid: sess.sid, ...ident } : undefined;
          }
          if (/FROM oauth_state WHERE state/.test(s)) {
            return oauth.get(args[0]) || undefined;
          }
          return undefined;
        },
        run(...args) {
          if (/INSERT INTO identities/.test(s)) {
            const row = args[0] || {};
            const rec = {
              player_id: row.player_id,
              discord_id: row.discord_id,
              username: row.username,
              display_name: row.display_name,
              avatar: row.avatar,
              updated_at: row.updated_at
            };
            identities.set(rec.player_id, rec);
            if (rec.discord_id) byDiscord.set(String(rec.discord_id), rec.player_id);
            return { lastInsertRowid: rec.player_id, changes: 1 };
          }
          if (/INSERT INTO sessions/.test(s)) {
            sessions.set(args[0], { sid: args[0], player_id: args[1], created_at: args[2] });
            return { lastInsertRowid: args[0], changes: 1 };
          }
          if (/INSERT INTO oauth_state/.test(s)) {
            oauth.set(args[0], { state: args[0], invite: args[1], created_at: args[2] });
            return { lastInsertRowid: args[0], changes: 1 };
          }
          if (/DELETE FROM oauth_state/.test(s)) {
            oauth.delete(args[0]);
            return { changes: 1 };
          }
          if (/INSERT INTO chat/.test(s)) {
            const id = nextChatId;
            nextChatId += 1;
            chat.push({
              id,
              room_id: args[0],
              player_id: args[1],
              display_name: args[2],
              text: args[3],
              at: args[4]
            });
            return { lastInsertRowid: id, changes: 1 };
          }
          return { lastInsertRowid: 0, changes: 0 };
        },
        all(...args) {
          if (/FROM chat WHERE room_id/.test(s)) {
            const roomId = String(args[0]);
            const limit = Number(args[1]) || 40;
            return chat
              .filter((c) => String(c.room_id) === roomId)
              .sort((a, b) => b.id - a.id)
              .slice(0, limit);
          }
          return [];
        }
      };
    }
  };
}

function newSid() {
  return crypto.randomBytes(24).toString('hex');
}

function upsertIdentity(db, row) {
  const playerId = String(row.playerId || `disc_${row.discordId || newSid()}`);
  const now = Date.now();
  const existing = row.discordId
    ? db.prepare('SELECT player_id FROM identities WHERE discord_id = ?').get(String(row.discordId))
    : null;
  const id = existing ? existing.player_id : playerId;
  db.prepare(
    `INSERT INTO identities (player_id, discord_id, username, display_name, avatar, updated_at)
     VALUES (@player_id, @discord_id, @username, @display_name, @avatar, @updated_at)
     ON CONFLICT(player_id) DO UPDATE SET
       discord_id = excluded.discord_id,
       username = excluded.username,
       display_name = excluded.display_name,
       avatar = excluded.avatar,
       updated_at = excluded.updated_at`
  ).run({
    player_id: id,
    discord_id: row.discordId ? String(row.discordId) : null,
    username: row.username || null,
    display_name: String(row.displayName || row.username || 'Player').slice(0, 40),
    avatar: row.avatar || null,
    updated_at: now
  });
  return getIdentity(db, id);
}

function getIdentity(db, playerId) {
  const row = db.prepare('SELECT * FROM identities WHERE player_id = ?').get(playerId);
  return row ? mapIdent(row) : null;
}

function getByDiscord(db, discordId) {
  const row = db.prepare('SELECT * FROM identities WHERE discord_id = ?').get(String(discordId));
  return row ? mapIdent(row) : null;
}

function mapIdent(row) {
  return {
    playerId: row.player_id,
    discordId: row.discord_id,
    username: row.username,
    displayName: row.display_name,
    avatar: row.avatar
  };
}

function createSession(db, playerId) {
  const sid = newSid();
  db.prepare('INSERT INTO sessions (sid, player_id, created_at) VALUES (?, ?, ?)').run(sid, playerId, Date.now());
  return sid;
}

function getSession(db, sid) {
  if (!sid) return null;
  const row = db.prepare(
    'SELECT s.sid, i.* FROM sessions s JOIN identities i ON i.player_id = s.player_id WHERE s.sid = ?'
  ).get(sid);
  return row ? { sid: row.sid, ...mapIdent(row) } : null;
}

function putOauthState(db, invite) {
  const state = newSid();
  db.prepare('INSERT INTO oauth_state (state, invite, created_at) VALUES (?, ?, ?)').run(
    state,
    String(invite || ''),
    Date.now()
  );
  return state;
}

function takeOauthState(db, state) {
  const row = db.prepare('SELECT * FROM oauth_state WHERE state = ?').get(state);
  if (!row) return null;
  db.prepare('DELETE FROM oauth_state WHERE state = ?').run(state);
  if (Date.now() - Number(row.created_at) > 15 * 60 * 1000) return null;
  return { invite: row.invite };
}

function appendChat(db, msg) {
  const info = db.prepare(
    'INSERT INTO chat (room_id, player_id, display_name, text, at) VALUES (?, ?, ?, ?, ?)'
  ).run(
    String(msg.roomId),
    msg.playerId || null,
    String(msg.displayName || 'Player').slice(0, 40),
    String(msg.text || '').slice(0, 400),
    Date.now()
  );
  return {
    id: info.lastInsertRowid,
    roomId: msg.roomId,
    playerId: msg.playerId,
    displayName: String(msg.displayName || 'Player').slice(0, 40),
    text: String(msg.text || '').slice(0, 400),
    at: Date.now()
  };
}

function listChat(db, roomId, limit = 40) {
  const rows = db.prepare(
    'SELECT * FROM chat WHERE room_id = ? ORDER BY id DESC LIMIT ?'
  ).all(String(roomId), Math.min(100, Number(limit) || 40));
  return rows.reverse().map((r) => ({
    id: r.id,
    playerId: r.player_id,
    displayName: r.display_name,
    text: r.text,
    at: r.at
  }));
}

module.exports = {
  dbPath,
  credsPath,
  openIdentityDb,
  openMemoryIdentityDb,
  upsertIdentity,
  getIdentity,
  getByDiscord,
  createSession,
  getSession,
  putOauthState,
  takeOauthState,
  appendChat,
  listChat
};
