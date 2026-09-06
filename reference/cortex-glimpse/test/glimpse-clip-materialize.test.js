'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const express = require('express');
const { createRoomService } = require('../lib/cortexGlimpse/room');
const { registerGlimpseHttpRoutes } = require('../lib/cortexGlimpse/http');
const { materializeRoundClip } = require('../lib/cortexGlimpse/materializeClip');
const { selectClip } = require('../lib/cortexGlimpse/clipSelect');
const { findCatalogItem } = require('../lib/cortexGlimpse/catalog');

function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      resolve({ server, port: server.address().port });
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
          resolve({ status: res.statusCode, text, json, headers: res.headers });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

describe('glimpse host clip materialize', () => {
  it('never picks credits/fade when a playable window exists', () => {
    const item = findCatalogItem('movie:terminator-2');
    const clip = selectClip(item, { rng: () => 0 });
    assert.ok(clip);
    assert.equal((clip.tags || []).some((t) => t === 'fade' || t === 'credits' || t === 'silence'), false);
  });

  it('understands the window then writes a host file via Cortex clip composer', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-clip-'));
    const item = findCatalogItem('movie:terminator-2');
    const clip = { id: 't1', startTime: 12, endTime: 20, duration: 8, tags: ['iconic'] };
    const out = await materializeRoundClip({
      item,
      clip,
      root: tmp,
      understand: () => ({ start: 8, end: 16, reason: ['audio.energy'] }),
      ingest: async () => {
        const p = path.join(tmp, 'media', 't2.mp4');
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, 'INGEST');
        return { ok: true, path: p };
      },
      compose: ({ inputMediaAbs, outputMediaAbs, candidate }) => {
        assert.equal(candidate.start, 8);
        assert.equal(candidate.end, 16);
        assert.ok(fs.existsSync(inputMediaAbs));
        fs.mkdirSync(path.dirname(outputMediaAbs), { recursive: true });
        fs.writeFileSync(outputMediaAbs, 'CLIPPED');
        return { ok: true, window: { start: 8, end: 16, duration: 8 } };
      }
    });
    assert.equal(out.kind, 'host');
    assert.equal(fs.readFileSync(out.filePath, 'utf8'), 'CLIPPED');
    assert.equal(out.animation.stack, 'web');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('serves a host media clip on the guest play path', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gl-http-clip-'));
    const service = createRoomService({
      operatorHome: tmp,
      now: () => Date.now(),
      materialize: async ({ root, clip }) => {
        const filePath = path.join(root, 'clips', 'round.mp4');
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, Buffer.from('hostclip'));
        return {
          kind: 'host',
          filePath,
          duration: Number(clip.duration) || 8,
          animation: { stack: 'web', libraries: ['motion', 'animejs'], mask: true }
        };
      }
    });
    const app = express();
    app.use(express.json());
    registerGlimpseHttpRoutes(app, { service });
    const { server, port } = await listen(app);
    try {
      const created = await req(port, 'POST', '/api/glimpse/rooms', {
        displayName: 'Tony',
        pool: 'movies',
        challenge: 'close_enough'
      });
      const token = created.json.inviteToken;
      await req(port, 'POST', `/play/glimpse/${token}/join`, { displayName: 'Ada' });
      const start = await req(port, 'POST', `/api/glimpse/rooms/${created.json.roomId}/start`, {
        itemId: 'movie:terminator-2'
      });
      assert.equal(start.status, 200);
      assert.ok(start.json.clipPlay);
      assert.equal(start.json.clipPlay.kind, 'youtube');
      assert.ok(start.json.playAt <= start.json.clipEndsAt);
      const clip = await req(port, 'GET', `/play/glimpse/${token}/clip`);
      assert.equal(clip.status, 200);
      assert.equal(clip.json.kind, 'youtube');
      assert.match(String(clip.json.id), /^[\w-]{11}$/);
      assert.ok(clip.json.playAt);
      assert.ok(clip.json.clipEndsAt >= clip.json.playAt);
      const media = await req(port, 'GET', `/play/glimpse/${token}/media`);
      assert.equal(media.status, 200);
      assert.equal(media.text, 'hostclip');
    } finally {
      await new Promise((r) => server.close(r));
      if (service.close) service.close();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
