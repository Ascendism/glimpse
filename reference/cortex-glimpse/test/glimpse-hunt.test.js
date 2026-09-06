'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { planHuntQuery, mintHuntItem, mergeHits, extractWatchIdsFromText } = require('../lib/cortexGlimpse/hunt');
const { ensureHuntRoutines, youtubeSearchUrl } = require('../lib/cortexGlimpse/flingHunt');
const { loadLiveCatalog, saveLiveItems, findLiveOrSeed } = require('../lib/cortexGlimpse/liveCatalog');
const { emptyProfile } = require('../lib/cortexGlimpse/knowledge');
const { createRoomService } = require('../lib/cortexGlimpse/room');

describe('glimpse hunt planner', () => {
  it('builds a typed YouTube query from the room frontier', () => {
    const tony = emptyProfile('tony');
    tony.people['Arnold Schwarzenegger'] = 0.9;
    tony.concepts['action'] = 0.8;
    const music = planHuntQuery({ pool: 'music', profiles: [tony] });
    assert.match(music.query, /official|audio|music/i);
    const movies = planHuntQuery({ pool: 'movies', profiles: [tony] });
    assert.match(movies.query, /arnold|action|trailer/i);
    assert.equal(movies.type, 'movie');
  });

  it('mints a playable catalog item from a YouTube hit without leaking into seed', () => {
    const item = mintHuntItem(
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Astley - Never Gonna Give You Up (Official Video)',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        channel: 'Rick Astley'
      },
      { type: 'song' }
    );
    assert.equal(item.type, 'song');
    assert.equal(item.source.youtubeVideoId, 'dQw4w9WgXcQ');
    assert.ok(item.candidateClips.length >= 1);
    assert.ok(item.artist);
    const parsed = mintHuntItem(
      { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up (Official Video)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      { type: 'song' }
    );
    assert.equal(parsed.title, 'Never Gonna Give You Up');
    assert.match(parsed.artist, /Rick/i);
  });

  it('extracts watch ids from Fling page text and dedupes', () => {
    const ids = extractWatchIdsFromText(
      'https://www.youtube.com/watch?v=aaaaaaaaaaa and youtu.be/bbbbbbbbbbb and watch?v=aaaaaaaaaaa'
    );
    assert.deepEqual(ids, ['aaaaaaaaaaa', 'bbbbbbbbbbb']);
    const merged = mergeHits(
      [{ id: 'aaaaaaaaaaa', title: 'A', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' }],
      [{ id: 'aaaaaaaaaaa', title: 'A2' }, { id: 'ccccccccccc', title: 'C', url: 'https://youtu.be/ccccccccccc' }]
    );
    assert.equal(merged.length, 2);
  });
});

describe('glimpse live catalog + routines', () => {
  let tmp;
  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-hunt-'));
  });
  after(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('writes Fling hunt routines under operator home, not the repo', () => {
    const out = ensureHuntRoutines({ operatorHome: tmp });
    assert.equal(out.routines.length, 3);
    for (const r of out.routines) {
      assert.equal(fs.existsSync(r.path), true);
      const body = JSON.parse(fs.readFileSync(r.path, 'utf8'));
      assert.ok(body.nodes.some((n) => n.type === 'fling_tab_open'));
      assert.equal(body.nodes.find((n) => n.type === 'fling_tab_open').config.active, false);
    }
    assert.match(youtubeSearchUrl('arnold trailer', 'movies'), /youtube\.com\/results/);
  });

  it('persists hunted items in live catalog and finds them', () => {
    const item = mintHuntItem(
      { id: 'ccccccccccc', title: 'Demo Clip', url: 'https://youtu.be/ccccccccccc', channel: 'Demo' },
      { type: 'movie' }
    );
    saveLiveItems({ operatorHome: tmp }, [item]);
    const live = loadLiveCatalog({ operatorHome: tmp });
    assert.ok(live.some((x) => x.id === item.id));
    const found = findLiveOrSeed(item.id, { operatorHome: tmp });
    assert.equal(found.title, 'Demo Clip');
  });

  it('room hunt uses injected search and does not require Fling', async () => {
    const svc = createRoomService({
      operatorHome: tmp,
      now: () => Date.now(),
      searchYoutube: async () => [
        {
          id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          channel: 'Rick Astley'
        }
      ]
    });
    const room = svc.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'music' });
    const hunt = await svc.huntContent(room.roomId, { useFling: false });
    assert.equal(hunt.ok, true);
    assert.equal(hunt.via, 'ytsearch');
    assert.ok(hunt.items.length >= 1);
    assert.ok(svc.findItem(hunt.items[0].id));
    assert.ok(svc.getRoom(room.roomId).queueCount >= 1);
    const planned = svc.queueAhead(room.roomId, { count: 4 });
    assert.ok(planned.some((p) => p.reason && String(p.reason).startsWith('hunt')));
    assert.equal(hunt.fling.attempted, false);
    if (svc.close) svc.close();
  });

  it('does not hide a Fling-offline hunt behind a silent ytsearch success', async () => {
    const svc = createRoomService({
      operatorHome: tmp,
      now: () => Date.now(),
      runFling: async () => {
        const e = new Error('Fling browser offline');
        e.code = 'fling_offline';
        throw e;
      },
      searchYoutube: async () => [
        {
          id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          channel: 'Rick Astley'
        }
      ]
    });
    const room = svc.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'music' });
    const hunt = await svc.huntContent(room.roomId, { useFling: true });
    assert.equal(hunt.ok, true);
    assert.equal(hunt.via, 'ytsearch_fallback');
    assert.equal(hunt.fling.attempted, true);
    assert.equal(hunt.fling.ok, false);
    assert.equal(hunt.fling.code, 'fling_offline');
    assert.ok(hunt.items.length >= 1);
    if (svc.close) svc.close();
  });

  it('marks Fling ok when the background hunt returns watch ids', async () => {
    const svc = createRoomService({
      operatorHome: tmp,
      now: () => Date.now(),
      runFling: async () => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      searchYoutube: async () => []
    });
    const room = svc.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'music' });
    const hunt = await svc.huntContent(room.roomId, { useFling: true });
    assert.equal(hunt.via, 'fling');
    assert.equal(hunt.fling.ok, true);
    assert.equal(hunt.fling.attempted, true);
    assert.ok(hunt.items.length >= 1);
    if (svc.close) svc.close();
  });
});
