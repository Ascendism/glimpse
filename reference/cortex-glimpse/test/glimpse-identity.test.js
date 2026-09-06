'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const express = require('express');
const {
  openIdentityDb,
  upsertIdentity,
  createSession,
  getSession,
  appendChat,
  listChat,
  credsPath
} = require('../lib/cortexGlimpse/identityDb');
const { loadDiscordCreds, authorizeUrl } = require('../lib/cortexGlimpse/discordAuth');
const { createRoomService } = require('../lib/cortexGlimpse/room');
const { registerGlimpseHttpRoutes } = require('../lib/cortexGlimpse/http');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'gl-id-'));
}

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

function req(port, method, url, body, headers) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: url,
        method,
        headers: Object.assign(
          data ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) } : {},
          headers || {}
        )
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, text, json, headers: res.headers });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

describe('glimpse identity + discord + chat', () => {
  it('correlates discord users in sqlite and keeps chat', () => {
    const root = tmp();
    const db = openIdentityDb(root);
    const a = upsertIdentity(db, { discordId: '99', username: 'ada', displayName: 'Ada' });
    const again = upsertIdentity(db, { discordId: '99', username: 'ada', displayName: 'Ada Prime' });
    assert.equal(a.playerId, again.playerId);
    assert.equal(again.displayName, 'Ada Prime');
    const sid = createSession(db, a.playerId);
    assert.equal(getSession(db, sid).discordId, '99');
    appendChat(db, { roomId: 'r1', playerId: a.playerId, displayName: 'Ada', text: 'hey table' });
    const chat = listChat(db, 'r1');
    assert.equal(chat.length, 1);
    assert.equal(chat[0].text, 'hey table');
    db.close();
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('builds a discord authorize url from the glimpse creds file', () => {
    const root = tmp();
    fs.writeFileSync(
      credsPath(root),
      JSON.stringify({ client_id: 'cid123', client_secret: 'secret' })
    );
    const creds = loadDiscordCreds(root);
    assert.equal(creds.clientId, 'cid123');
    const url = authorizeUrl({
      creds,
      redirectUri: 'http://127.0.0.1:3777/play/glimpse/auth/discord/callback',
      state: 'abc'
    });
    assert.match(url, /client_id=cid123/);
    assert.match(url, /scope=identify/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('lets a named player sit and chat on the public play routes', async () => {
    const root = tmp();
    const service = createRoomService({ operatorHome: root, now: () => Date.now() });
    const app = express();
    app.use(express.json());
    registerGlimpseHttpRoutes(app, { service });
    const { server, port } = await listen(app);
    try {
      const created = await req(port, 'POST', '/api/glimpse/rooms', { displayName: 'Tony', pool: 'mixed' });
      const token = created.json.inviteToken;
      const join = await req(port, 'POST', `/play/glimpse/${token}/join`, { displayName: 'Ada' });
      assert.equal(join.status, 200);
      const chat = await req(port, 'POST', `/play/glimpse/${token}/chat`, {
        playerId: join.json.playerId,
        text: 'lock in'
      });
      assert.equal(chat.status, 200);
      assert.equal(chat.json.message.text, 'lock in');
      const state = await req(port, 'GET', `/play/glimpse/${token}/state?playerId=${join.json.playerId}`);
      assert.ok((state.json.room.chat || []).some((m) => m.text === 'lock in'));
      const status = await req(port, 'GET', `/play/glimpse/auth/status`);
      assert.equal(status.json.configured, false);
    } finally {
      await new Promise((r) => server.close(r));
      if (service.close) service.close();
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it('still opens a table when identity sqlite cannot load', () => {
    const ident = require('../lib/cortexGlimpse/identityDb');
    const orig = ident.openIdentityDb;
    ident.openIdentityDb = () => {
      throw new Error('NODE_MODULE_VERSION 130');
    };
    const root = tmp();
    try {
      const service = createRoomService({ operatorHome: root, now: () => Date.now() });
      const created = service.createRoom({
        host: { id: 'host', displayName: 'Host' },
        pool: 'mixed'
      });
      assert.ok(created.roomId);
      assert.ok(created.inviteToken);
      const seated = service.joinRoom(created.inviteToken, { displayName: 'Ada' });
      const chat = service.postChat(created.inviteToken, seated.playerId, 'table is live');
      assert.equal(chat.message.text, 'table is live');
      if (service.close) service.close();
    } finally {
      ident.openIdentityDb = orig;
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
