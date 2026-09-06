'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const { createRoomService } = require('../lib/cortexGlimpse/room');
const { registerGlimpseHttpRoutes } = require('../lib/cortexGlimpse/http');

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

function req(port, method, url, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: url,
        method,
        headers: data
          ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
          : {}
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
          resolve({ status: res.statusCode, text, json });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

describe('glimpse http + guest join', () => {
  let tmp;
  let server;
  let port;
  let service;

  before(async () => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ce-http-'));
    service = createRoomService({ operatorHome: tmp, now: () => Date.now() });
    const app = express();
    app.use(express.json());
    registerGlimpseHttpRoutes(app, { service });
    const listened = await listen(app);
    server = listened.server;
    port = listened.port;
  });

  after(async () => {
    await new Promise((r) => server.close(r));
    if (service && service.close) service.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('lets a guest join from a public play URL without Cortex auth', async () => {
    const created = await req(port, 'POST', '/api/glimpse/rooms', {
      displayName: 'Tony',
      pool: 'mixed',
      challenge: 'close_enough'
    });
    assert.equal(created.status, 200);
    assert.ok(created.json.joinUrl.includes('/play/glimpse/'));
    const token = created.json.inviteToken;

    const page = await req(port, 'GET', `/play/glimpse/${token}`);
    assert.equal(page.status, 200);
    assert.match(page.text, /Glimpse/);
    assert.match(page.text, /Your name/);
    assert.match(page.text, /\/play\/glimpse\/static\//);
    assert.match(page.text, /onair\.js/);
    assert.match(page.text, /player\.js/);
    assert.match(page.text, /boardStage\.js/);
    assert.match(page.text, /screen-orientation/);

    const css = await req(port, 'GET', '/play/glimpse/static/glimpse.css');
    assert.equal(css.status, 200);
    assert.match(css.text, /--ink/);

    const js = await req(port, 'GET', '/play/glimpse/static/client.js');
    assert.equal(js.status, 200);

    const stage = await req(port, 'GET', `/play/glimpse/${token}/stage`);
    assert.equal(stage.status, 200);
    assert.match(stage.text, /GLIMPSE/);
    assert.match(stage.text, /ROUND/);
    assert.match(stage.text, /boardStage\.js/);
    assert.match(stage.text, /Your name/);
    assert.ok(created.json.stageUrl.includes('/stage'));

    const three = await req(port, 'GET', '/play/glimpse/static/vendor/three.module.js');
    assert.equal(three.status, 200);
    assert.match(three.text, /THREE/);

    const boardJs = await req(port, 'GET', '/play/glimpse/static/archiveBoard.js');
    assert.equal(boardJs.status, 200);

    const join = await req(port, 'POST', `/play/glimpse/${token}/join`, { displayName: 'Phone Friend' });
    assert.equal(join.status, 200);
    assert.ok(join.json.playerId);

    const start = await req(port, 'POST', `/api/glimpse/rooms/${created.json.roomId}/start`, {
      itemId: 'movie:terminator-2'
    });
    assert.equal(start.status, 200);
    assert.equal(start.json.mediaType, 'movie');

    const playing = await req(port, 'GET', `/play/glimpse/${token}/state`);
    assert.equal(playing.status, 200);
    const playBoard = playing.json.room.board;
    assert.equal(playBoard.cols, 12);
    assert.ok(playBoard.cells.length > 0);
    assert.ok(playBoard.cells.every((c) => c.ch === ''));
    assert.ok(!JSON.stringify(playBoard).includes('TERMINATOR'));

    const clip = await req(port, 'GET', `/play/glimpse/${token}/clip`);
    assert.equal(clip.status, 200);
    assert.equal(clip.json.kind, 'youtube');
    assert.ok(clip.json.id);
    assert.ok(Number(clip.json.playAt) > 0);

    const ans = await req(port, 'POST', `/play/glimpse/${token}/answer`, {
      playerId: join.json.playerId,
      text: 'T2'
    });
    assert.equal(ans.status, 200);

    const lock = await req(port, 'POST', `/api/glimpse/rooms/${created.json.roomId}/lock`, {});
    assert.equal(lock.status, 200);
    assert.equal(lock.json.reveal.title, 'Terminator 2: Judgment Day');
    assert.ok(lock.json.scores.some((s) => s.acceptable));

    const revealed = await req(port, 'GET', `/play/glimpse/${token}/state`);
    const revBoard = revealed.json.room.board;
    const spelled = revBoard.cells.map((c) => c.ch).join('');
    assert.match(spelled, /TERMINATOR/);
    assert.equal(revBoard.year, '1991');
  });

  it('serves catalog metadata for the host table', async () => {
    const cat = await req(port, 'GET', '/api/glimpse/catalog?pool=music');
    assert.equal(cat.status, 200);
    assert.ok(cat.json.items.every((i) => i.type === 'song'));
    assert.ok(cat.json.challenges.includes('close_enough'));
  });
});

describe('glimpse create table error shape', () => {
  it('returns JSON when opening a table throws', async () => {
    const app = express();
    app.use(express.json());
    registerGlimpseHttpRoutes(app, {
      service: {
        createRoom() {
          throw new Error('NODE_MODULE_VERSION 130');
        }
      }
    });
    const { server, port } = await listen(app);
    try {
      const created = await req(port, 'POST', '/api/glimpse/rooms', {
        displayName: 'Host',
        pool: 'mixed'
      });
      assert.ok(created.json, 'create table must not return HTML');
      assert.equal(created.json.ok, false);
      assert.match(String(created.json.message || ''), /NODE_MODULE_VERSION|failed|sqlite|identity/i);
    } finally {
      await new Promise((r) => server.close(r));
    }
  });
});
