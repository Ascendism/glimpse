import Database from "better-sqlite3";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync, mkdirSync } from "fs";

const STORAGE_DIR = join(tmpdir(), "glimpse-dev-state");
const DB_PATH = join(STORAGE_DIR, "glimpse.db");

if (typeof process !== "undefined" && !existsSync(STORAGE_DIR)) {
  try {
    mkdirSync(STORAGE_DIR, { recursive: true });
  } catch (err) {
    console.warn("[Glimpse DB] Could not create storage directory:", err);
  }
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    initSchema();
  }
  return db;
}

function initSchema() {
  if (!db) return;

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      discord_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      discriminator TEXT,
      avatar TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      session_id TEXT PRIMARY KEY,
      discord_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (discord_id) REFERENCES users(discord_id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      discord_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      points_earned INTEGER NOT NULL DEFAULT 0,
      placement INTEGER,
      game_completed_at INTEGER NOT NULL,
      FOREIGN KEY (discord_id) REFERENCES users(discord_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON sessions(discord_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_discord_id ON leaderboard_entries(discord_id);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_table_id ON leaderboard_entries(table_id);
    CREATE INDEX IF NOT EXISTS idx_leaderboard_completed ON leaderboard_entries(game_completed_at);
  `);

  console.log("[Glimpse DB] Schema initialized");
}

export type User = {
  discord_id: string;
  username: string;
  discriminator: string | null;
  avatar: string | null;
  created_at: number;
  updated_at: number;
};

export type Session = {
  session_id: string;
  discord_id: string;
  expires_at: number;
  created_at: number;
};

export type LeaderboardEntry = {
  id: number;
  discord_id: string;
  table_id: string;
  points_earned: number;
  placement: number | null;
  game_completed_at: number;
};

export type LeaderboardStats = {
  discord_id: string;
  username: string;
  avatar: string | null;
  total_points: number;
  games_played: number;
  wins: number;
  avg_points: number;
};

export const userDb = {
  upsert: (user: Omit<User, "created_at" | "updated_at"> & { created_at?: number; updated_at?: number }) => {
    const now = Date.now();
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO users (discord_id, username, discriminator, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(discord_id) DO UPDATE SET
        username = excluded.username,
        discriminator = excluded.discriminator,
        avatar = excluded.avatar,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      user.discord_id,
      user.username,
      user.discriminator ?? null,
      user.avatar ?? null,
      user.created_at ?? now,
      now
    );
    return userDb.getById(user.discord_id)!;
  },

  getById: (discordId: string): User | null => {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM users WHERE discord_id = ?");
    return stmt.get(discordId) as User | null;
  },

  getByIds: (discordIds: string[]): User[] => {
    if (discordIds.length === 0) return [];
    const db = getDb();
    const placeholders = discordIds.map(() => "?").join(",");
    const stmt = db.prepare(`SELECT * FROM users WHERE discord_id IN (${placeholders})`);
    return stmt.all(...discordIds) as User[];
  },
};

export const sessionDb = {
  create: (discordId: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): Session => {
    const db = getDb();
    const sessionId = generateSessionId();
    const now = Date.now();
    const expiresAt = now + expiresInMs;

    const stmt = db.prepare(`
      INSERT INTO sessions (session_id, discord_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(sessionId, discordId, expiresAt, now);

    return { session_id: sessionId, discord_id: discordId, expires_at: expiresAt, created_at: now };
  },

  getBySessionId: (sessionId: string): Session | null => {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM sessions WHERE session_id = ? AND expires_at > ?");
    return stmt.get(sessionId, Date.now()) as Session | null;
  },

  deleteBySessionId: (sessionId: string): void => {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM sessions WHERE session_id = ?");
    stmt.run(sessionId);
  },

  deleteExpired: (): void => {
    const db = getDb();
    const stmt = db.prepare("DELETE FROM sessions WHERE expires_at <= ?");
    stmt.run(Date.now());
  },
};

export const leaderboardDb = {
  addEntry: (entry: Omit<LeaderboardEntry, "id">): LeaderboardEntry => {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO leaderboard_entries (discord_id, table_id, points_earned, placement, game_completed_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      entry.discord_id,
      entry.table_id,
      entry.points_earned,
      entry.placement ?? null,
      entry.game_completed_at
    );
    return { id: result.lastInsertRowid as number, ...entry };
  },

  getTopPlayers: (limit: number = 100): LeaderboardStats[] => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT
        u.discord_id,
        u.username,
        u.avatar,
        SUM(l.points_earned) as total_points,
        COUNT(l.id) as games_played,
        SUM(CASE WHEN l.placement = 1 THEN 1 ELSE 0 END) as wins,
        CAST(AVG(l.points_earned) AS INTEGER) as avg_points
      FROM users u
      INNER JOIN leaderboard_entries l ON u.discord_id = l.discord_id
      GROUP BY u.discord_id
      ORDER BY total_points DESC
      LIMIT ?
    `);
    return stmt.all(limit) as LeaderboardStats[];
  },

  getPlayerStats: (discordId: string): LeaderboardStats | null => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT
        u.discord_id,
        u.username,
        u.avatar,
        SUM(l.points_earned) as total_points,
        COUNT(l.id) as games_played,
        SUM(CASE WHEN l.placement = 1 THEN 1 ELSE 0 END) as wins,
        CAST(AVG(l.points_earned) AS INTEGER) as avg_points
      FROM users u
      LEFT JOIN leaderboard_entries l ON u.discord_id = l.discord_id
      WHERE u.discord_id = ?
      GROUP BY u.discord_id
    `);
    return stmt.get(discordId) as LeaderboardStats | null;
  },

  getRecentGames: (discordId: string, limit: number = 10): LeaderboardEntry[] => {
    const db = getDb();
    const stmt = db.prepare(`
      SELECT * FROM leaderboard_entries
      WHERE discord_id = ?
      ORDER BY game_completed_at DESC
      LIMIT ?
    `);
    return stmt.all(discordId, limit) as LeaderboardEntry[];
  },
};

function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setInterval(() => {
  sessionDb.deleteExpired();
}, 60 * 60 * 1000); // Clean up expired sessions every hour
