use strict';

const crypto = require('crypto');
const { EventEmitter } = require('events');
const {
  MAX_PLAYERS,
  MIN_PLAYERS,
  DEFAULT_GUESS_MS,
  POOLS,
  CHALLENGE_TYPES,
  REVEAL_DWELL_MS,
  LOBBY_GO_MS,
  CONFIRM_COUNTDOWN_MS
} = require('./constants');
const { seedCatalog } = require('./catalog');
const { selectClip, escalateClips, isItemPlayable } = require('./clipSelect');
const { judgeAnswer, extractKnowledgeEvidence } = require('./judge');
const { scoreSubmission, escalatingClipPoints } = require('./scoring');
const { emptyProfile, applyEvidence, mergeRoomProfile } = require('./knowledge');
const { planNextRounds } = require('./curator');
const store = require('./store');
const liveCatalog = require('./liveCatalog');
const { planHuntQuery, mintHuntItem, searchYoutubeYtDlp } = require('./hunt');
const { runFlingYoutubeSearch, ensureHuntRoutines } = require('./flingHunt');
const { materializeRoundClip } = require('./materializeClip');
const { publicBoard } = require('./boardState');
const { packOnAir } = require('./onAirCopy');
const ident = require('./identityDb');
const { scheduleRound, beatAt } = require('./roundClock');

function looksLikeAlphaDump(queue) {
  const rows = Array.isArray(queue) ? queue : [];
  if (rows.length < 4) return false;
  const titles = rows.map((q) => q && q.item && q.item.title).filter(Boolean);
  if (titles.length < 4) return false;
  const alpha = [...titles].sort((a, b) => String(a).localeCompare(String(b)));
  const allDiscover = rows.every((q) => q && q.intent === 'discover');
  const types = new Set(rows.map((q) => q && q.item && q.item.type).filter(Boolean));
  return allDiscover && types.size <= 1 && titles.join('\n') === alpha.join('\n');
}

function makeInvite() {
  return crypto.randomBytes(6).toString('hex');
}

function publicPlayer(p) {
  return {
    playerId: p.playerId,
    displayName: p.displayName,
    isHost: p.isHost === true,
    ready: p.ready === true,
    score: Number(p.score) || 0
  };
}

function clipPublic(clip) {
  if (!clip) return null;
  return {
    id: clip.id,
    startTime: clip.startTime,
    endTime: clip.endTime,
    duration: Math.max(0.5, Number(clip.endTime) - Number(clip.startTime)),
    tags: clip.tags || []
  };
}

function createRoomService(opts = {}) {
  const now = typeof opts.now === 'function' ? opts.now : () => Date.now();
  const materialize = typeof opts.materialize === 'function' ? opts.materialize : materializeRoundClip;
  const ctx = {
    operatorHome: opts.operatorHome,
    workspaceRoot: opts.workspaceRoot,
    scope: opts.scope || 'personal'
  };
  const root = store.resolveRoot(ctx).root;
  store.ensureDir(root);
  let db;
  try {
    db = ident.openIdentityDb(root);
  } catch {
    db = ident.openMemoryIdentityDb();
  }

  const rooms = new Map();
  const invites = new Map();
  const bus = new EventEmitter();
  bus.setMaxListeners(100);

  function catalogOf(pool, era) {
    let list = liveCatalog.mergedCatalog(pool, ctx);
    if (era) list = list.filter((i) => i.era === era);
    return list;
  }

  function findItem(id) {
    return liveCatalog.findLiveOrSeed(id, ctx);
  }

  function persist(room) {
    store.saveRoom(root, serialize(room));
  }

  function serialize(room) {
    return {
      roomId: room.roomId,
      inviteToken: room.inviteToken,
      phase: room.phase,
      pool: room.pool,
      era: room.era || '',
      challenge: room.challenge,
      acceptance: room.acceptance,
      maxPlayers: room.maxPlayers,
      createdAt: room.createdAt,
      hostId: room.hostId,
      players: room.players,
      round: room.round,
      history: room.history,
      queue: room.queue,
      scores: room.players.map((p) => ({ playerId: p.playerId, score: p.score })),
      favorDebt: room.favorDebt,
      lastHunt: room.lastHunt || null,
      autoRun: room.autoRun !== false,
      lobbyGoAt: room.lobbyGoAt || 0,
      countdownEndsAt: room.countdownEndsAt || 0,
      paused: room.paused === true,
      pausedAt: room.pausedAt || 0,
      answers: room.answers instanceof Map ? [...room.answers.values()] : []
    };
  }

  function emit(room, type, extra) {
    const payload = { type, roomId: room.roomId, phase: room.phase, ts: now(), ...(extra || {}) };
    bus.emit(`room:${room.roomId}`, payload);
    bus.emit(`invite:${room.inviteToken}`, payload);
    return payload;
  }

  function getLive(roomId) {
    if (rooms.has(roomId)) return rooms.get(roomId);
    const rec = store.loadRoom(root, roomId);
    if (!rec) return null;
    const live = hydrate(rec);
    rooms.set(live.roomId, live);
    invites.set(live.inviteToken, live.roomId);
    return live;
  }

  function hydrate(rec) {
    return {
      ...rec,
      players: rec.players || [],
      history: rec.history || [],
      queue: rec.queue || [],
      favorDebt: rec.favorDebt || {},
      lastHunt: rec.lastHunt || null,
      autoRun: rec.autoRun !== false,
      lobbyGoAt: rec.lobbyGoAt || 0,
      countdownEndsAt: rec.countdownEndsAt || 0,
      paused: rec.paused === true,
      pausedAt: rec.pausedAt || 0,
      answers: Array.isArray(rec.answers)
        ? new Map(rec.answers.filter((a) => a && a.playerId).map((a) => [a.playerId, a]))
        : rec.round && rec.round.answers instanceof Map
          ? rec.round.answers
          : new Map()
    };
  }

  function byInvite(token) {
    const id = invites.get(String(token || ''));
    if (id) return getLive(id);
    for (const rec of store.listRooms(root)) {
      if (rec && rec.inviteToken === token) {
        invites.set(token, rec.roomId);
        return getLive(rec.roomId);
      }
    }
    return null;
  }

  function createRoom(input = {}) {
    const host = input.host || { id: 'host', displayName: 'Host' };
    const maxPlayers = Math.min(MAX_PLAYERS, Math.max(MIN_PLAYERS, Number(input.maxPlayers) || MAX_PLAYERS));
    const pool = POOLS.includes(input.pool) ? input.pool : 'mixed';
    const challenge = CHALLENGE_TYPES.includes(input.challenge) ? input.challenge : 'close_enough';
    const era = input.era ? String(input.era) : '';
    const room = {
      roomId: store.newId('room'),
      inviteToken: makeInvite(),
      phase: 'lobby',
      pool,
      era,
      challenge,
      acceptance: input.acceptance || 'normal',
      maxPlayers,
      createdAt: now(),
      hostId: host.id,
      players: [],
      round: null,
      history: [],
      queue: [],
      favorDebt: {},
      autoRun: input.autoRun !== false,
      lobbyGoAt: now() + LOBBY_GO_MS,
      answers: new Map()
    };
    rooms.set(room.roomId, room);
    invites.set(room.inviteToken, room.roomId);
    queueAhead(room.roomId, { count: 8 });
    persist(room);
    return {
      ...publicRoom(room),
      inviteToken: room.inviteToken,
      joinPath: `/play/glimpse/${room.inviteToken}`
    };
  }

  function publicRoom(room) {
    return {
      roomId: room.roomId,
      phase: room.phase,
      pool: room.pool,
      era: room.era || '',
      challenge: room.challenge,
      acceptance: room.acceptance,
      maxPlayers: room.maxPlayers,
      players: room.players.map(publicPlayer),
      round: room.round
        ? {
            index: room.round.index,
            clipIndex: room.round.clipIndex,
            playAt: room.round.playAt,
            clipEndsAt: room.round.clipEndsAt,
            guessUntil: room.round.guessUntil,
            beat: beatAt(now(), room.round),
            clip: clipPublic(room.round.clip),
            mediaType: room.round.item && room.round.item.type,
            stake: escalatingClipPoints(room.round.clipIndex)
          }
        : null,
      scores: room.players.map((p) => ({ playerId: p.playerId, displayName: p.displayName, score: p.score })),
      lockedIds: room.answers ? [...room.answers.keys()] : [],
      lockedCount: room.answers ? room.answers.size : 0,
      nudges: (room.nudges || []).map((n) => ({ playerId: n.playerId, displayName: n.displayName })),
      lastScores: room.lastScores || null,
      inviteCode: String(room.inviteToken || '').slice(-4).toUpperCase(),
      board: publicBoard({
        phase: room.phase,
        item: room.round && room.round.item,
        reveal: room.round && room.round.reveal,
        clipIndex: room.round && room.round.clipIndex
      }),
      queueCount: Array.isArray(room.queue) ? room.queue.length : 0,
      allReady: room.players.length > 0 && room.players.every((p) => p.ready === true),
      countdownEndsAt: room.countdownEndsAt || 0,
      paused: room.paused === true,
      chat: ident.listChat(db, room.roomId, 40),
      serverNow: now(),
      onAir: packOnAir({
        phase: room.phase,
        round: room.round,
        reveal: room.round && room.round.reveal,
        lastScores: room.lastScores,
        agentCopy: room.agentCopy
      })
    };
  }

  function joinRoom(token, input = {}) {
    const room = byInvite(token);
    if (!room) {
      const err = new Error('Invalid invite');
      err.code = 'bad_invite';
      throw err;
    }
    const identity = input.identity || null;
    let playerId = (identity && identity.playerId) || input.playerId || store.newId('guest');
    if (room.players.some((p) => p.playerId === playerId)) {
      const seated = room.players.find((p) => p.playerId === playerId);
      if (input.displayName) {
        seated.displayName = String(input.displayName).slice(0, 40);
        persist(room);
      }
      return { playerId, displayName: seated.displayName, room: publicRoom(room) };
    }
    if (room.players.length >= room.maxPlayers) {
      const err = new Error('Room is full');
      err.code = 'full';
      throw err;
    }
    const displayName = String(
      input.displayName || (identity && identity.displayName) || 'Player'
    ).slice(0, 40);
    const player = {
      playerId,
      displayName,
      isHost: false,
      score: 0,
      guest: true,
      ready: false,
      discordId: identity && identity.discordId ? identity.discordId : null
    };
    if (identity && identity.discordId) {
      ident.upsertIdentity(db, {
        playerId,
        discordId: identity.discordId,
        username: identity.username,
        displayName
      });
    }
    room.players.push(player);
    persist(room);
    emit(room, 'player:join', { player: publicPlayer(player) });
    return { playerId, displayName: player.displayName, room: publicRoom(room) };
  }

  function getRoom(roomId) {
    const room = getLive(roomId);
    return room ? publicRoom(room) : null;
  }

  async function startRound(roomId, input = {}) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    const catalog = catalogOf(room.pool, room.era);
    let item = input.itemId ? findItem(input.itemId) : null;
    
    // Validate the requested item first
    if (item) {
      const check = await isItemPlayable(item, { timeoutMs: 3000 });
      if (!check.ok) {
        item = null; // Skip this item, find another
      }
    }
    
    // Try queue items, validating each
    let attempts = 0;
    while (!item && room.queue.length && attempts < 10) {
      const next = room.queue.shift();
      const check = await isItemPlayable(next.item, { timeoutMs: 3000 });
      if (check.ok) {
        item = next.item;
        input.clip = input.clip || next.clip;
        break;
      }
      attempts++;
    }
    
    // Refill queue if needed
    if (!item) {
      queueAhead(room.roomId, { count: 6 });
      attempts = 0;
      while (!item && room.queue.length && attempts < 10) {
        const next = room.queue.shift();
        const check = await isItemPlayable(next.item, { timeoutMs: 3000 });
        if (check.ok) {
          item = next.item;
          input.clip = input.clip || next.clip;
          break;
        }
        attempts++;
      }
    }
    
    // Fallback: try catalog items directly
    if (!item) {
      const sample = catalog.slice(0, 20);
      for (const candidate of sample) {
        const check = await isItemPlayable(candidate, { timeoutMs: 2000 });
        if (check.ok) {
          item = candidate;
          break;
        }
      }
    }
    
    if (!item) {
      throw new Error('No playable items available');
    }
    
    const steps = escalateClips(item, { maxSteps: 4 });
    const clip = input.clip || steps[0] || selectClip(item, { difficulty: 0.4 });
    if (clip && clip.duration == null) {
      clip.duration = Math.max(0.5, Number(clip.endTime) - Number(clip.startTime));
    }
    const clock = scheduleRound(now(), clip, { guessMs: input.guessMs });
    room.phase = 'playing';
    room.answers = new Map();
    room.nudges = [];
    room.round = {
      index: (room.history.length || 0) + 1,
      item,
      clip,
      steps,
      clipIndex: 0,
      playAt: clock.playAt,
      clipEndsAt: clock.clipEndsAt,
      guessUntil: clock.guessUntil,
      answers: [],
      startedAt: now(),
      escalateAttempts: 0
    };
    persist(room);
    emit(room, 'round:start', {
      clip: clipPublic(clip),
      playAt: clock.playAt,
      clipEndsAt: clock.clipEndsAt,
      guessUntil: clock.guessUntil,
      mediaType: item.type,
      serverNow: now()
    });
    return {
      phase: room.phase,
      item,
      clip,
      playAt: clock.playAt,
      clipEndsAt: clock.clipEndsAt,
      guessUntil: clock.guessUntil,
      steps,
      mediaType: item.type
    };
  }

  async function ensureRoundMedia(roomIdOrToken) {
    let room = getLive(roomIdOrToken);
    if (!room) room = byInvite(roomIdOrToken);
    if (!room || !room.round || !room.round.item) return null;
    if (room.round.media && room.round.media.kind === 'host' && room.round.media.filePath) {
      return room.round.media;
    }
    const media = await materialize({
      item: room.round.item,
      clip: room.round.clip,
      root
    });
    if (media && media.kind === 'host') {
      room.round.media = media;
      persist(room);
    }
    return media;
  }

  function submitAnswer(tokenOrRoom, playerId, text) {
    let room = byInvite(tokenOrRoom);
    if (!room) room = getLive(tokenOrRoom);
    if (!room || !room.round) throw new Error('No active round');
    if (!room.players.some((p) => p.playerId === playerId)) throw new Error('Not in room');
    const entry = {
      playerId,
      text: String(text || '').slice(0, 280),
      at: now()
    };
    room.answers.set(playerId, entry);
    persist(room);
    emit(room, 'answer:submit', { playerId });
    return { ok: true, lockedCount: room.answers.size };
  }

  function requestNudge(tokenOrRoom, playerId) {
    let room = byInvite(tokenOrRoom);
    if (!room) room = getLive(tokenOrRoom);
    if (!room || !room.round) throw new Error('No active round');
    if (!room.players.some((p) => p.playerId === playerId)) throw new Error('Not in room');
    if (!Array.isArray(room.nudges)) room.nudges = [];
    if (!room.nudges.some((n) => n.playerId === playerId)) {
      const p = room.players.find((x) => x.playerId === playerId);
      room.nudges.push({ playerId, displayName: p ? p.displayName : 'Player' });
      emit(room, 'clip:nudge', { playerId, count: room.nudges.length });
    }
    return { ok: true, count: room.nudges.length };
  }

  async function lockAndJudge(roomId, judgeOpts = {}) {
    const room = getLive(roomId);
    if (!room || !room.round) throw new Error('No active round');
    if (room.phase === 'reveal' || room.phase === 'judging') {
      return { phase: room.phase, scores: room.lastScores || [], reveal: room.round.reveal || null };
    }
    room.phase = 'judging';
    const item = room.round.item;
    const scores = [];
    for (const player of room.players) {
      const ans = room.answers.get(player.playerId);
      if (!ans) {
        scores.push({
          playerId: player.playerId,
          displayName: player.displayName,
          guess: '',
          points: 0,
          acceptable: false
        });
        continue;
      }
      const judged = await judgeAnswer(ans.text, item, {
        challenge: room.challenge,
        acceptance: room.acceptance,
        completeChat: judgeOpts.completeChat || opts.completeChat
      });
      const scored = scoreSubmission(ans.text, item, {
        challenge: room.challenge,
        judged,
        clipIndex: room.round.clipIndex,
        elapsedMs: Math.max(0, ans.at - room.round.startedAt)
      });
      player.score += scored.points;
      const ev = extractKnowledgeEvidence(ans.text, item, { correct: scored.acceptable });
      let prof = store.loadProfile(root, player.playerId) || emptyProfile(player.playerId);
      prof = applyEvidence(prof, ev, item);
      store.saveProfile(root, prof);
      scores.push({
        playerId: player.playerId,
        displayName: player.displayName,
        guess: ans.text,
        points: scored.points,
        acceptable: scored.acceptable,
        specificity: scored.specificity,
        interpretation: scored.interpretation
      });
    }
    room.phase = 'reveal';
    room.round.reveal = {
      title: item.title,
      artist: item.artist,
      director: item.director,
      series: item.series,
      year: item.year,
      type: item.type
    };
    room.history.push({
      itemId: item.id,
      scores: scores.map((s) => ({ playerId: s.playerId, points: s.points, acceptable: s.acceptable }))
    });
    const winner = [...scores].sort((a, b) => b.points - a.points)[0];
    if (winner) {
      for (const p of room.players) {
        room.favorDebt[p.playerId] = (Number(room.favorDebt[p.playerId]) || 0) + (p.playerId === winner.playerId ? -1 : 1);
      }
    }
    room.lastScores = scores;
    if (room.round) room.round.revealUntil = now() + REVEAL_DWELL_MS;
    persist(room);
    emit(room, 'round:reveal', { reveal: room.round.reveal, scores });
    return {
      phase: room.phase,
      scores,
      reveal: room.round.reveal
    };
  }

  async function escalateRound(roomId) {
    const room = getLive(roomId);
    if (!room || !room.round) throw new Error('No active round');
    
    // Check if this item's YouTube video is dead - if so, skip the entire item
    const ytId = room.round.item && room.round.item.source && room.round.item.source.youtubeVideoId;
    if (ytId) {
      const check = await isItemPlayable(room.round.item, { timeoutMs: 2000 });
      if (!check.ok) {
        // Dead video - start a new round with a different item
        await startRound(roomId, {});
        return { skipped: true, reason: 'dead_youtube_video' };
      }
    }
    
    // Prevent infinite loop: if we've tried too many clips, skip this item
    const attempts = (room.round.escalateAttempts || 0) + 1;
    if (attempts > 5) {
      await startRound(roomId, {});
      return { skipped: true, reason: 'too_many_escalate_attempts' };
    }
    
    room.round.escalateAttempts = attempts;
    const nextIdx = (Number(room.round.clipIndex) || 0) + 1;
    const steps = room.round.steps || escalateClips(room.round.item, { maxSteps: 4 });
    const clip = steps[nextIdx] || selectClip(room.round.item, { excludeIds: [room.round.clip && room.round.clip.id] });
    
    if (!clip) {
      // No more clips for this item, start new round
      await startRound(roomId, {});
      return { skipped: true, reason: 'no_more_clips' };
    }
    
    if (clip && clip.duration == null) {
      clip.duration = Math.max(0.5, Number(clip.endTime) - Number(clip.startTime));
    }
    room.round.clipIndex = nextIdx;
    room.round.clip = clip;
    room.round.steps = steps;
    room.round.media = null;
    const clock = scheduleRound(now(), clip, { escalate: true });
    room.round.playAt = clock.playAt;
    room.round.clipEndsAt = clock.clipEndsAt;
    room.round.guessUntil = Math.max(Number(room.round.guessUntil) || 0, clock.guessUntil, now() + 8000);
    room.nudges = [];
    persist(room);
    emit(room, 'clip:escalate', {
      clip: clipPublic(clip),
      clipIndex: nextIdx,
      playAt: room.round.playAt,
      clipEndsAt: room.round.clipEndsAt,
      guessUntil: room.round.guessUntil,
      serverNow: now()
    });
    return {
      clip,
      clipIndex: nextIdx,
      playAt: room.round.playAt,
      clipEndsAt: room.round.clipEndsAt,
      guessUntil: room.round.guessUntil
    };
  }

  function guestView(token, playerId) {
    const room = byInvite(token);
    if (!room) return null;
    const view = publicRoom(room);
    if (room.phase === 'reveal' && room.round && room.round.reveal) {
      view.reveal = room.round.reveal;
      view.lastScores = room.lastScores || null;
      view.onAir = packOnAir({
        phase: room.phase,
        round: room.round,
        reveal: room.round.reveal,
        lastScores: room.lastScores,
        agentCopy: room.agentCopy
      });
    }
    view.you = playerId || null;
    view.youLocked = Boolean(playerId && room.answers && room.answers.has(playerId));
    return view;
  }

  function queueAhead(roomId, input = {}) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    const profiles = room.players.map((p) => store.loadProfile(root, p.playerId) || emptyProfile(p.playerId));
    const plan = planNextRounds({
      catalog: catalogOf(room.pool, room.era),
      profiles,
      roomProfile: mergeRoomProfile(profiles),
      recentItemIds: room.history.map((h) => h.itemId),
      favorDebt: room.favorDebt,
      count: input.count || 6,
      pool: room.pool,
      salt: room.roomId
    });
    const keep = (room.queue || []).filter((q) => String(q.reason || '').startsWith('hunt'));
    const seen = new Set(keep.map((q) => q.item && q.item.id).filter(Boolean));
    const extra = plan.filter((p) => p.item && !seen.has(p.item.id));
    room.queue = keep.concat(extra);
    persist(room);
    return room.queue;
  }

  async function huntContent(roomId, input = {}) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    const profiles = room.players.map((p) => store.loadProfile(root, p.playerId) || emptyProfile(p.playerId));
    const plan = planHuntQuery({ pool: room.pool, profiles, salt: now() });
    const query = String(input.query || plan.query);
    ensureHuntRoutines(ctx);
    let via = 'ytsearch';
    let hits = [];
    /** @type {{ attempted: boolean, ok: boolean, error: string | null, code: string | null }} */
    const fling = { attempted: false, ok: false, error: null, code: null };
    if (input.useFling) {
      fling.attempted = true;
      try {
        hits = await runFlingYoutubeSearch(query, {
          ...ctx,
          pool: room.pool,
          runFling: opts.runFling
        });
        fling.ok = true;
        if (hits.length) via = 'fling';
        else {
          via = 'ytsearch_fallback';
          fling.error = 'no_hits';
          fling.code = 'no_hits';
        }
      } catch (e) {
        via = 'ytsearch_fallback';
        fling.ok = false;
        fling.error = e && e.message ? String(e.message) : 'Fling hunt failed';
        fling.code = e && e.code ? String(e.code) : 'fling_failed';
      }
    }
    if (!hits.length) {
      hits = await searchYoutubeYtDlp(query, {
        searchYoutube: opts.searchYoutube || input.searchYoutube,
        limit: 6
      });
      if (via !== 'ytsearch_fallback') via = 'ytsearch';
    }
    const items = hits.slice(0, 8).map((h) => mintHuntItem(h, { type: plan.type }));
    
    // Validate hunt results before adding to queue
    const validItems = [];
    for (const item of items) {
      const check = await isItemPlayable(item, { timeoutMs: 3000 });
      if (check.ok) {
        validItems.push(item);
      }
    }
    
    liveCatalog.saveLiveItems(ctx, validItems);
    if (!Array.isArray(room.queue)) room.queue = [];
    for (const it of validItems) {
      room.queue.push({
        intent: 'discover',
        item: it,
        clip: it.candidateClips && it.candidateClips[0],
        reason: `hunt:${via}`
      });
    }
    room.lastHunt = {
      at: now(),
      query,
      via,
      itemIds: validItems.map((i) => i.id),
      fling
    };
    room.agentCopy = validItems.length
      ? `FOUND ${validItems.length}\n${validItems
          .slice(0, 3)
          .map((i) => i.title)
          .filter(Boolean)
          .join('\n')}`
      : 'NO HITS';
    persist(room);
    emit(room, 'hunt:done', { query, via, count: validItems.length });
    return {
      ok: true,
      via,
      query,
      plan,
      fling,
      items: validItems.map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        youtubeVideoId: i.source && i.source.youtubeVideoId,
        url: i.source && i.source.url
      }))
    };
  }

  function setReady(token, playerId, ready) {
    const room = byInvite(token) || getLive(token);
    if (!room) throw new Error('Invite not found');
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) throw new Error('Not in room');
    player.ready = ready === true;
    if (room.phase === 'countdown' && !player.ready) {
      room.phase = 'lobby';
      room.countdownEndsAt = 0;
    }
    persist(room);
    emit(room, 'player:ready', { playerId, ready: player.ready, allReady: room.players.every((p) => p.ready) });
    return { ready: player.ready, allReady: room.players.length > 0 && room.players.every((p) => p.ready) };
  }

  function confirmStart(roomId) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    if (room.phase !== 'lobby') throw new Error('Not in lobby');
    if (!room.players.length) throw new Error('No players');
    if (!room.players.every((p) => p.ready === true)) throw new Error('Not everyone is ready');
    room.phase = 'countdown';
    room.countdownEndsAt = now() + CONFIRM_COUNTDOWN_MS;
    persist(room);
    emit(room, 'countdown:start', { countdownEndsAt: room.countdownEndsAt });
    return { phase: room.phase, countdownEndsAt: room.countdownEndsAt };
  }

  function setTransport(roomId, input = {}) {
    const room = getLive(roomId);
    if (!room || !room.round || (room.phase !== 'playing' && room.phase !== 'countdown')) {
      throw new Error('No live clip');
    }
    const pause = input.paused === true;
    if (pause && !room.paused) {
      room.paused = true;
      room.pausedAt = now();
      persist(room);
      emit(room, 'transport:pause', { pausedAt: room.pausedAt, serverNow: now() });
    } else if (!pause && room.paused) {
      const delta = Math.max(0, now() - Number(room.pausedAt || now()));
      if (room.round.playAt) room.round.playAt += delta;
      if (room.round.clipEndsAt) room.round.clipEndsAt += delta;
      if (room.round.guessUntil) room.round.guessUntil += delta;
      if (room.countdownEndsAt) room.countdownEndsAt += delta;
      room.paused = false;
      room.pausedAt = 0;
      persist(room);
      emit(room, 'transport:play', {
        playAt: room.round.playAt,
        clipEndsAt: room.round.clipEndsAt,
        guessUntil: room.round.guessUntil,
        serverNow: now()
      });
    }
    return {
      paused: room.paused === true,
      playAt: room.round.playAt,
      clipEndsAt: room.round.clipEndsAt,
      guessUntil: room.round.guessUntil,
      serverNow: now()
    };
  }

  async function tick(roomIdOrToken) {
    let room = getLive(roomIdOrToken);
    if (!room) room = byInvite(roomIdOrToken);
    if (!room) return null;
    if (room.paused) return publicRoom(room);
    if (room.phase === 'playing' && room.round) {
      const expired = now() >= Number(room.round.guessUntil || 0);
      const allIn = room.players.length > 0 && room.answers.size >= room.players.length;
      if (expired || allIn) {
        await lockAndJudge(room.roomId);
        room = getLive(room.roomId) || room;
      }
    }
    if (room.phase === 'lobby') {
      if (looksLikeAlphaDump(room.queue)) {
        try {
          queueAhead(room.roomId, { count: 8 });
          room = getLive(room.roomId) || room;
        } catch {
          /* keep dump if deal fails */
        }
      }
    }
    if (room.phase === 'countdown' && now() >= Number(room.countdownEndsAt || 0)) {
      try {
        await startRound(room.roomId, {});
        room = getLive(room.roomId) || room;
        room.countdownEndsAt = 0;
      } catch {
        /* stay on countdown if the first deal fails */
      }
    }
    if (room.autoRun !== false && room.phase === 'reveal') {
      const until = Number(room.round && room.round.revealUntil) || 0;
      if (until && now() >= until) {
        try {
          await startRound(room.roomId, {});
          room = getLive(room.roomId) || room;
        } catch {
          /* stay on reveal if the next deal fails */
        }
      }
    }
    return publicRoom(room);
  }

  function postChat(token, playerId, text) {
    const room = byInvite(token) || getLive(token);
    if (!room) throw new Error('Invite not found');
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) throw new Error('Not in room');
    const line = String(text || '').trim().slice(0, 400);
    if (!line) throw new Error('Empty');
    const message = ident.appendChat(db, {
      roomId: room.roomId,
      playerId,
      displayName: player.displayName,
      text: line
    });
    emit(room, 'chat:message', message);
    return { message, chat: ident.listChat(db, room.roomId, 40) };
  }

  function kickPlayer(roomId, targetPlayerId, callerId) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    if (room.hostId !== callerId) {
      const err = new Error('Only the host can kick players');
      err.code = 'not_host';
      throw err;
    }
    if (targetPlayerId === room.hostId) {
      const err = new Error('Host cannot kick themselves');
      err.code = 'cannot_kick_host';
      throw err;
    }
    const idx = room.players.findIndex((p) => p.playerId === targetPlayerId);
    if (idx < 0) {
      const err = new Error('Player not found');
      err.code = 'player_not_found';
      throw err;
    }
    room.players.splice(idx, 1);
    if (room.answers) room.answers.delete(targetPlayerId);
    persist(room);
    emit(room, 'player:kicked', { playerId: targetPlayerId });
    return publicRoom(room);
  }

  function promoteToHost(roomId, newHostId, callerId) {
    const room = getLive(roomId);
    if (!room) throw new Error('Room not found');
    if (room.hostId !== callerId) {
      const err = new Error('Only the host can promote another player');
      err.code = 'not_host';
      throw err;
    }
    const newHost = room.players.find((p) => p.playerId === newHostId);
    if (!newHost) {
      const err = new Error('Target player not found');
      err.code = 'player_not_found';
      throw err;
    }
    const oldHost = room.players.find((p) => p.playerId === room.hostId);
    if (oldHost) oldHost.isHost = false;
    newHost.isHost = true;
    room.hostId = newHostId;
    persist(room);
    emit(room, 'host:promoted', { playerId: newHostId });
    return publicRoom(room);
  }

  return {
    root,
    db,
    bus,
    createRoom,
    joinRoom,
    getRoom,
    startRound,
    confirmStart,
    setReady,
    setTransport,
    submitAnswer,
    requestNudge,
    lockAndJudge,
    escalateRound,
    guestView,
    queueAhead,
    huntContent,
    tick,
    ensureRoundMedia,
    postChat,
    findItem,
    publicRoom,
    byInvite,
    getLive,
    seedCatalog,
    kickPlayer,
    promoteToHost,
    close() {
      try {
        db.close();
      } catch {
        /* already closed */
      }
    }
  };
}

module.exports = { createRoomService };
