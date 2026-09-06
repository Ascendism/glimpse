'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  MEDIA_TYPES,
  CHALLENGE_TYPES,
  ACCEPTANCE_PRESETS,
  ROUND_INTENTS
} = require('../lib/cortexGlimpse/constants');
const { normalizeGuess, tokenSet, editDistance } = require('../lib/cortexGlimpse/normalize');
const { validateMediaItem } = require('../lib/cortexGlimpse/mediaItem');
const { seedCatalog, findCatalogItem, queryCatalog, catalogFacets } = require('../lib/cortexGlimpse/catalog');
const { matchAnswer } = require('../lib/cortexGlimpse/matcher');
const { judgeAnswer, extractKnowledgeEvidence } = require('../lib/cortexGlimpse/judge');
const { scoreSubmission, escalatingClipPoints, acceptancePasses } = require('../lib/cortexGlimpse/scoring');
const { selectClip, escalateClips } = require('../lib/cortexGlimpse/clipSelect');
const {
  emptyProfile,
  applyEvidence,
  mergeRoomProfile,
  knowledgeFrontier,
  adjacentCandidates
} = require('../lib/cortexGlimpse/knowledge');
const { planNextRounds, scoreCandidate } = require('../lib/cortexGlimpse/curator');
const { createRoomService } = require('../lib/cortexGlimpse/room');

describe('glimpse normalize', () => {
  it('strips punctuation, feat, and case', () => {
    assert.equal(normalizeGuess('Metallica — Enter Sandman (feat. Nobody)'), 'metallica enter sandman');
    assert.equal(normalizeGuess('T2: Judgment Day'), 't2 judgment day');
  });

  it('computes token overlap and edit distance', () => {
    assert.ok(tokenSet('enter the sandman').has('sandman'));
    assert.equal(editDistance('metalica', 'metallica'), 1);
  });
});

describe('glimpse media + catalog', () => {
  it('validates song/movie/tv items', () => {
    for (const item of seedCatalog()) {
      const v = validateMediaItem(item);
      assert.equal(v.valid, true, v.errors && v.errors.join('; '));
      assert.ok(MEDIA_TYPES.includes(item.type));
      assert.ok(Array.isArray(item.candidateClips));
      assert.ok(item.candidateClips.length >= 1);
    }
  });

  it('includes the spec examples with cues and aliases', () => {
    const sandman = findCatalogItem('song:metallica-enter-sandman');
    assert.ok(sandman.aliases.some((a) => /enter sandman/i.test(a)));
    const t2 = findCatalogItem('movie:terminator-2');
    assert.ok(t2.aliases.includes('T2'));
    assert.ok(t2.cues.some((c) => /liquid metal/i.test(c)));
    const storm = findCatalogItem('song:darude-sandstorm');
    assert.ok(storm.cues.some((c) => /dududu/i.test(c)));
    const bb = findCatalogItem('tv:breaking-bad-crawl-space');
    assert.equal(bb.series, 'Breaking Bad');
    assert.equal(bb.season, 4);
  });

  it('gives every seed item a youtube id and playable clip window', () => {
    const all = seedCatalog();
    assert.ok(all.length >= 300, `catalog too small: ${all.length}`);
    const ids = new Set();
    for (const item of all) {
      assert.equal(ids.has(item.id), false, `duplicate ${item.id}`);
      ids.add(item.id);
      const yt = item.source && item.source.youtubeVideoId;
      assert.match(String(yt || ''), /^[\w-]{11}$/, item.id);
      assert.ok(item.candidateClips.length >= 1, item.id);
      for (const c of item.candidateClips) {
        assert.ok(c.endTime > c.startTime, item.id);
        if (item.type !== 'song') {
          assert.ok(c.endTime <= 90, `${item.id} clip ${c.id} ends at ${c.endTime} — trailer window`);
        }
      }
    }
  });

  it('does not ship placeholder youtube ids in seed packs', () => {
    const fs = require('fs');
    const path = require('path');
    const packs = [
      path.join(__dirname, '../lib/cortexGlimpse/seedPack.js'),
      path.join(__dirname, '../lib/cortexGlimpse/seedPackScreen.js')
    ];
    for (const p of packs) {
      const text = fs.readFileSync(p, 'utf8');
      assert.equal(text.includes('kYzz0FSgpSU'), false, p);
      assert.equal(text.includes('silicone-valley'), false, p);
      assert.equal(text.includes('end-tv'), false, p);
    }
  });

  it('is one catalog with type/genre/era filters and sorts', () => {
    const facets = catalogFacets();
    assert.ok(facets.types.song > 80);
    assert.ok(facets.types.movie > 150); // Adjusted after filtering dead IDs (was 250, now ~164)
    assert.ok(facets.types.tv > 30); // Adjusted after filtering (was 40, now ~36)
    const metal = queryCatalog({ genre: 'metal' });
    assert.ok(metal.length >= 1);
    assert.ok(metal.every((i) => i.genres.includes('metal')));
    const years = queryCatalog({ pool: 'movies', sort: 'year', dir: 'asc' });
    assert.ok(years[0].year <= years[years.length - 1].year);
  });
});

describe('glimpse matcher', () => {
  it('accepts messy Enter Sandman variants without LLM', () => {
    const item = findCatalogItem('song:metallica-enter-sandman');
    for (const guess of [
      'Metallica Enter Sandman',
      'enter sandman',
      'metalica sandman',
      'that fucking Metallica song enter the sandman'
    ]) {
      const m = matchAnswer(guess, item, { challenge: 'identify' });
      assert.ok(m.song_match >= 0.82, `${guess} song_match=${m.song_match}`);
      assert.equal(m.needs_llm, false);
    }
  });

  it('matches Black Dahlia title+artist from a jumbled line', () => {
    const item = findCatalogItem('song:tbdm-horrible-night');
    const m = matchAnswer('black dahlia what a horrible night', item, { challenge: 'identify' });
    assert.ok(m.song_match >= 0.8);
    assert.ok(m.artist_match >= 0.7);
    assert.equal(m.needs_llm, false);
  });

  it('scores specificity for Sandstorm-style answers', () => {
    const item = findCatalogItem('song:darude-sandstorm');
    const full = matchAnswer('Darude - Sandstorm', item, { challenge: 'close_enough' });
    const title = matchAnswer('Sandstorm', item, { challenge: 'close_enough' });
    const artist = matchAnswer('Darude', item, { challenge: 'close_enough' });
    const meme = matchAnswer('that old meme techno song', item, { challenge: 'close_enough' });
    const dudu = matchAnswer('the fucking dududududu song', item, { challenge: 'close_enough' });
    assert.ok(full.specificity >= 0.95);
    assert.ok(title.specificity < full.specificity);
    assert.ok(artist.specificity < title.specificity);
    assert.ok(meme.specificity >= 0.5);
    assert.ok(dudu.specificity >= 0.4);
    assert.ok(dudu.specificity < artist.specificity);
  });

  it('distinguishes franchise from exact film', () => {
    const item = findCatalogItem('movie:lotr-fellowship');
    const exact = matchAnswer('Fellowship of the Ring', item, { challenge: 'identify' });
    const fran = matchAnswer('The Lord of the Rings', item, { challenge: 'identify' });
    assert.ok(exact.song_match >= 0.9);
    assert.ok(fran.franchise_match >= 0.85);
    assert.ok(fran.song_match < exact.song_match);
  });
});

describe('glimpse judge + scoring', () => {
  it('uses deterministic path first and only flags novel phrasing for LLM', async () => {
    const item = findCatalogItem('movie:terminator-2');
    const det = await judgeAnswer('T2', item, { challenge: 'close_enough', acceptance: 'normal' });
    assert.equal(det.source, 'deterministic');
    assert.equal(det.acceptable, true);
    const novel = await judgeAnswer('the mercury cop from that arnold sequel', item, {
      challenge: 'close_enough',
      acceptance: 'casual'
    });
    assert.ok(novel.acceptable);
    assert.ok(novel.specificity > 0.4);
  });

  it('honors acceptance presets', () => {
    const item = findCatalogItem('movie:terminator-2');
    const partial = matchAnswer('Terminator', item, { challenge: 'identify' });
    assert.equal(acceptancePasses(partial, ACCEPTANCE_PRESETS.casual), true);
    assert.equal(acceptancePasses(partial, ACCEPTANCE_PRESETS.exact), false);
  });

  it('applies escalating clip point table', () => {
    assert.equal(escalatingClipPoints(0), 1000);
    assert.equal(escalatingClipPoints(1), 700);
    assert.equal(escalatingClipPoints(2), 400);
    assert.equal(escalatingClipPoints(3), 200);
    assert.equal(escalatingClipPoints(4), 0);
  });

  it('scores TV progressively: show / season / episode / title', () => {
    const item = findCatalogItem('tv:breaking-bad-crawl-space');
    const show = scoreSubmission('Breaking Bad', item, {
      challenge: 'episode',
      clipIndex: 0,
      elapsedMs: 2000
    });
    const full = scoreSubmission('Breaking Bad S4E11 Crawl Space', item, {
      challenge: 'episode',
      clipIndex: 0,
      elapsedMs: 2000
    });
    assert.ok(show.points >= 500);
    assert.ok(full.points > show.points);
  });

  it('extracts knowledge evidence from right and wrong answers', () => {
    const heat = findCatalogItem('movie:heat');
    const miss = extractKnowledgeEvidence('Scarface?', heat, { correct: false });
    assert.equal(miss.correct, false);
    assert.ok(miss.evidence.some((e) => /pacino/i.test(e.concept) || /scarface/i.test(e.concept)));
    assert.ok(miss.confusions.some((c) => c[0] === 'Heat' && /scarface/i.test(c[1])));

    const alien = findCatalogItem('movie:alien');
    const ok = extractKnowledgeEvidence('that old Ridley Scott space horror movie', alien, {
      correct: true
    });
    assert.equal(ok.recognized_media, true);
    assert.equal(ok.knew_exact_title, false);
    assert.equal(ok.recognized_director, true);
  });

  it('can use an injected LLM only for borderline guesses', async () => {
    const item = findCatalogItem('movie:the-thing');
    let called = 0;
    const out = await judgeAnswer(
      'the antarctic camp movie where the dog splits open',
      item,
      {
        challenge: 'close_enough',
        acceptance: 'normal',
        completeChat: async () => {
          called += 1;
          return {
            message: {
              content: JSON.stringify({
                song_match: 0.91,
                artist_match: 0.2,
                acceptable: true,
                interpretation: 'The Thing (1982)',
                confidence: 0.9,
                specificity: 0.72
              })
            }
          };
        }
      }
    );
    assert.equal(called, 1);
    assert.equal(out.source, 'llm');
    assert.equal(out.acceptable, true);
  });
});

describe('glimpse clips', () => {
  it('never picks a silence/fade tagged region when better ones exist', () => {
    const item = findCatalogItem('song:metallica-enter-sandman');
    const clip = selectClip(item, { difficulty: 0.4, rng: () => 0.1 });
    assert.ok(clip);
    assert.ok(!clip.tags.includes('silence'));
    assert.ok(!clip.tags.includes('fade'));
    assert.ok(clip.endTime > clip.startTime);
  });

  it('escalates with non-contiguous additional samples', () => {
    const item = findCatalogItem('song:darude-sandstorm');
    const steps = escalateClips(item, { maxSteps: 3, rng: () => 0.3 });
    assert.equal(steps.length, 3);
    const keys = new Set(steps.map((c) => `${c.startTime}-${c.endTime}`));
    assert.equal(keys.size, 3);
  });
});

describe('glimpse knowledge + curator', () => {
  it('infers adjacent concepts from Arnold hits', () => {
    let profile = emptyProfile('tony');
    for (const id of ['movie:predator', 'movie:terminator-2', 'movie:total-recall', 'movie:true-lies']) {
      const item = findCatalogItem(id);
      profile = applyEvidence(
        profile,
        extractKnowledgeEvidence(item.title, item, { correct: true }),
        item
      );
    }
    assert.ok(profile.people['Arnold Schwarzenegger'] >= 0.8);
    assert.ok(profile.concepts['sci-fi'] >= 0.5 || profile.concepts['action'] >= 0.5);
    const frontier = knowledgeFrontier(profile, seedCatalog());
    const ids = frontier.untested_adjacent.map((x) => x.id);
    assert.ok(ids.includes('movie:the-running-man') || ids.includes('movie:commando'));
  });

  it('plans mixed-intent rounds and balances players', () => {
    const tony = applyEvidence(
      emptyProfile('tony'),
      extractKnowledgeEvidence('Predator', findCatalogItem('movie:predator'), { correct: true }),
      findCatalogItem('movie:predator')
    );
    const alice = applyEvidence(
      emptyProfile('alice'),
      extractKnowledgeEvidence('Breaking Bad', findCatalogItem('tv:breaking-bad-crawl-space'), {
        correct: true
      }),
      findCatalogItem('tv:breaking-bad-crawl-space')
    );
    const room = mergeRoomProfile([tony, alice]);
    const plan = planNextRounds({
      catalog: seedCatalog(),
      profiles: [tony, alice],
      roomProfile: room,
      recentItemIds: ['movie:predator'],
      favorDebt: { tony: 2, alice: 0 },
      count: 8
    });
    assert.ok(plan.length >= 6);
    const intents = new Set(plan.map((p) => p.intent));
    assert.ok([...intents].every((i) => ROUND_INTENTS.includes(i)));
    assert.ok(plan.some((p) => p.intent === 'balance'));
    for (const row of plan) {
      const s = scoreCandidate(row.item, { profiles: [tony, alice], roomProfile: room });
      assert.ok(typeof s.total === 'number');
    }
  });

  it('does not deal a cold mixed table in title order', () => {
    const catalog = queryCatalog({ pool: 'mixed' });
    const plan = planNextRounds({
      catalog,
      profiles: [emptyProfile('host')],
      recentItemIds: [],
      favorDebt: {},
      count: 8,
      pool: 'mixed',
      salt: 'table-1'
    });
    assert.equal(plan.length, 8);
    const titles = plan.map((p) => p.item.title);
    const alphaMovies = catalog
      .filter((i) => i.type === 'movie')
      .map((i) => i.title)
      .slice(0, 8);
    assert.notDeepEqual(titles, alphaMovies);
    const types = new Set(plan.map((p) => p.item.type));
    assert.ok(types.size >= 2, `expected mixed types, got ${[...types]}`);
    const intents = new Set(plan.map((p) => p.intent));
    assert.ok(intents.size >= 3, `expected rotating intents, got ${[...intents]}`);
    assert.ok(!plan.every((p) => p.intent === 'discover'));
  });
});

describe('glimpse room service', () => {
  let tmp;
  let svc;

  before(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'close-enough-'));
    svc = createRoomService({ operatorHome: tmp, now: () => 1_700_000_000_000 });
  });

  after(() => {
    if (svc && svc.close) svc.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('hosts a 3-player mixed round end-to-end', async () => {
    const created = svc.createRoom({
      host: { id: 'host-1', displayName: 'Tony' },
      pool: 'mixed',
      challenge: 'close_enough',
      acceptance: 'normal',
      maxPlayers: 6
    });
    assert.ok(created.inviteToken);
    assert.equal(created.phase, 'lobby');
    assert.match(created.joinPath, /^\/play\/glimpse\//);

    const tony = svc.joinRoom(created.inviteToken, { displayName: 'Tony' });
    const alice = svc.joinRoom(created.inviteToken, { displayName: 'Alice' });
    const bob = svc.joinRoom(created.inviteToken, { displayName: 'Bob' });
    assert.equal(svc.getRoom(created.roomId).players.length, 3);

    const started = await svc.startRound(created.roomId, {
      itemId: 'song:darude-sandstorm',
      playAt: 1_700_000_000_500
    });
    assert.equal(started.phase, 'playing');
    assert.ok(started.clip.duration >= 2);
    assert.ok(!JSON.stringify(svc.guestView(created.inviteToken, alice.playerId)).includes('Sandstorm'));

    svc.submitAnswer(created.inviteToken, alice.playerId, 'the fucking dududududu song');
    svc.submitAnswer(created.inviteToken, bob.playerId, 'Darude - Sandstorm');
    svc.submitAnswer(created.inviteToken, tony.playerId, 'Sandstorm');

    const judged = await svc.lockAndJudge(created.roomId);
    assert.equal(judged.phase, 'reveal');
    const bobScore = judged.scores.find((s) => s.playerId === bob.playerId);
    const aliceScore = judged.scores.find((s) => s.playerId === alice.playerId);
    assert.ok(bobScore.points > aliceScore.points);
    assert.ok(aliceScore.points > 0);
    assert.equal(judged.reveal.title, 'Sandstorm');

    const queued = svc.queueAhead(created.roomId, { count: 5 });
    assert.ok(queued.length >= 3);
    assert.ok(queued.every((r) => r.item && r.intent && r.clip));
  });

  it('tracks locked seats and clip nudges', async () => {
    const created = svc.createRoom({ host: { id: 'h', displayName: 'Host' } });
    const a = svc.joinRoom(created.inviteToken, { displayName: 'Ada' });
    await svc.startRound(created.roomId, { itemId: 'movie:jaws' });
    svc.submitAnswer(created.inviteToken, a.playerId, 'bigger boat');
    const view = svc.guestView(created.inviteToken, a.playerId);
    assert.equal(view.youLocked, true);
    assert.ok(view.lockedIds.includes(a.playerId));
    const n = svc.requestNudge(created.inviteToken, a.playerId);
    assert.equal(n.count, 1);
    assert.equal(svc.getRoom(created.roomId).nudges[0].displayName, 'Ada');
  });

  it('ticks: all-in or expired clock closes the round', async () => {
    let t = 10_000;
    const clocked = createRoomService({
      operatorHome: fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-tick-')),
      now: () => t
    });
    const created = clocked.createRoom({ host: { id: 'h', displayName: 'Host' } });
    const a = clocked.joinRoom(created.inviteToken, { displayName: 'Ada' });
    await clocked.startRound(created.roomId, { itemId: 'movie:jaws' });
    clocked.submitAnswer(created.inviteToken, a.playerId, 'jaws');
    await clocked.tick(created.roomId);
    assert.equal(clocked.getRoom(created.roomId).phase, 'reveal');

    const created2 = clocked.createRoom({ host: { id: 'h2', displayName: 'Host' } });
    clocked.joinRoom(created2.inviteToken, { displayName: 'Bo' });
    await clocked.startRound(created2.roomId, { itemId: 'movie:jaws' });
    t += 120_000;
    await clocked.tick(created2.roomId);
    assert.equal(clocked.getRoom(created2.roomId).phase, 'reveal');
    if (clocked.close) clocked.close();
  });

  it('ticks the next round after reveal instead of waiting for Start', async () => {
    let t = 50_000;
    const tmpAuto = fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-auto-'));
    const clocked = createRoomService({
      operatorHome: tmpAuto,
      now: () => t
    });
    try {
      const created = clocked.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'mixed' });
      const p = clocked.joinRoom(created.inviteToken, { displayName: 'Ada' });
      await clocked.startRound(created.roomId, { itemId: 'movie:jaws' });
      clocked.submitAnswer(created.inviteToken, p.playerId, 'jaws');
      await clocked.tick(created.roomId);
      assert.equal(clocked.getRoom(created.roomId).phase, 'reveal');
      const firstId = clocked.getLive(created.roomId).round.item.id;
      t += 12_000;
      await clocked.tick(created.roomId);
      const live = clocked.getLive(created.roomId);
      assert.equal(live.phase, 'playing');
      assert.ok(live.round.item.id);
      assert.notEqual(live.round.item.id, firstId);
    } finally {
      if (clocked.close) clocked.close();
      fs.rmSync(tmpAuto, { recursive: true, force: true });
    }
  });

  it('does not start until everyone is ready and the host confirms', async () => {
    let t = 80_000;
    const tmpLobby = fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-lobby-'));
    const clocked = createRoomService({
      operatorHome: tmpLobby,
      now: () => t
    });
    try {
      const created = clocked.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'mixed' });
      assert.equal(created.phase, 'lobby');
      const ada = clocked.joinRoom(created.inviteToken, { displayName: 'Ada' });
      t += 3_000;
      await clocked.tick(created.roomId);
      assert.equal(clocked.getLive(created.roomId).phase, 'lobby');
      assert.throws(() => clocked.confirmStart(created.roomId), /ready/i);
      clocked.setReady(created.inviteToken, ada.playerId, true);
      const confirmed = clocked.confirmStart(created.roomId);
      assert.equal(confirmed.phase, 'countdown');
      await clocked.tick(created.roomId);
      assert.equal(clocked.getLive(created.roomId).phase, 'countdown');
      t += 10_000;
      await clocked.tick(created.roomId);
      assert.equal(clocked.getLive(created.roomId).phase, 'playing');
    } finally {
      if (clocked.close) clocked.close();
      fs.rmSync(tmpLobby, { recursive: true, force: true });
    }
  });

  it('pauses every seat on the same clock', async () => {
    let t = 40_000;
    const tmpP = fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-pause-'));
    const clocked = createRoomService({
      operatorHome: tmpP,
      now: () => t
    });
    try {
      const created = clocked.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'mixed' });
      const ada = clocked.joinRoom(created.inviteToken, { displayName: 'Ada' });
      await clocked.startRound(created.roomId, { itemId: 'movie:jaws' });
      const ends = clocked.getLive(created.roomId).round.guessUntil;
      clocked.setTransport(created.roomId, { paused: true });
      t += 20_000;
      await clocked.tick(created.roomId);
      assert.equal(clocked.getLive(created.roomId).phase, 'playing');
      assert.equal(clocked.getLive(created.roomId).paused, true);
      clocked.setTransport(created.roomId, { paused: false });
      assert.ok(clocked.getLive(created.roomId).round.guessUntil >= ends + 20_000);
      assert.equal(clocked.getLive(created.roomId).paused, false);
    } finally {
      if (clocked.close) clocked.close();
      fs.rmSync(tmpP, { recursive: true, force: true });
    }
  });

  it('redeals a persisted A-Z discover dump', async () => {
    let t = 90_000;
    const tmpDump = fs.mkdtempSync(path.join(os.tmpdir(), 'glimpse-dump-'));
    const clocked = createRoomService({
      operatorHome: tmpDump,
      now: () => t
    });
    try {
      const created = clocked.createRoom({ host: { id: 'h', displayName: 'Host' }, pool: 'mixed' });
      const live = clocked.getLive(created.roomId);
      const movies = queryCatalog({ pool: 'movies' }).slice(0, 8);
      live.queue = movies.map((item) => ({
        intent: 'discover',
        item,
        reason: 'discover rec=0.00'
      }));
      await clocked.tick(created.roomId);
      const titles = clocked.getLive(created.roomId).queue.map((q) => q.item.title);
      const alpha = movies.map((m) => m.title);
      assert.notDeepEqual(titles, alpha);
      const intents = new Set(clocked.getLive(created.roomId).queue.map((q) => q.intent));
      assert.ok(![...intents].every((i) => i === 'discover'));
    } finally {
      if (clocked.close) clocked.close();
      fs.rmSync(tmpDump, { recursive: true, force: true });
    }
  });

  it('rejects a 7th player and a bad invite', () => {
    const created = svc.createRoom({
      host: { id: 'h', displayName: 'Host' },
      maxPlayers: 6
    });
    for (let i = 0; i < 6; i += 1) svc.joinRoom(created.inviteToken, { displayName: `P${i}` });
    assert.throws(() => svc.joinRoom(created.inviteToken, { displayName: 'Overflow' }), /full/i);
    assert.throws(() => svc.joinRoom('nope', { displayName: 'X' }), /invite/i);
  });

  it('supports movie and tv adapters in one room', async () => {
    const created = svc.createRoom({
      host: { id: 'h', displayName: 'Host' },
      pool: 'mixed',
      challenge: 'identify'
    });
    const a = svc.joinRoom(created.inviteToken, { displayName: 'A' });
    const movie = await svc.startRound(created.roomId, { itemId: 'movie:terminator-2' });
    assert.equal(movie.item.type, 'movie');
    svc.submitAnswer(created.inviteToken, a.playerId, 'T2');
    const movieReveal = await svc.lockAndJudge(created.roomId);
    assert.ok(movieReveal.scores[0].acceptable);

    const tv = await svc.startRound(created.roomId, { itemId: 'tv:breaking-bad-crawl-space' });
    assert.equal(tv.item.type, 'tv');
    svc.submitAnswer(created.inviteToken, a.playerId, 'Breaking Bad Crawl Space');
    const tvReveal = await svc.lockAndJudge(created.roomId);
    assert.ok(tvReveal.scores[0].points >= 700);
  });

  it('persists knowledge under operator home, not the repo', () => {
    const created = svc.createRoom({ host: { id: 'h', displayName: 'Host' } });
    const root = path.join(tmp, 'glimpse');
    assert.equal(fs.existsSync(root), true);
    const rooms = fs.readdirSync(path.join(root, 'rooms'));
    assert.ok(rooms.length >= 1);
    assert.ok(created.roomId);
  });
});

describe('glimpse challenge vocabulary', () => {
  it('exports the full mode grid', () => {
    assert.deepEqual(
      [...CHALLENGE_TYPES].sort(),
      [
        'actor_artist',
        'character',
        'close_enough',
        'episode',
        'exact',
        'hardcore',
        'identify',
        'quote',
        'year'
      ].sort()
    );
  });
});
