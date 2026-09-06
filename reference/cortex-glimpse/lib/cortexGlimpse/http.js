'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const { createRoomService } = require('./room');
const { catalogForPool, seedCatalog, findCatalogItem, queryCatalog, catalogFacets } = require('./catalog');
const { CHALLENGE_TYPES, POOLS, ACCEPTANCE_PRESETS, DEFAULT_CLIP_SECONDS } = require('./constants');
const ident = require('./identityDb');
const discordAuth = require('./discordAuth');
const { publicJoinUrl } = require('./joinHosts');

const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public', 'glimpse');
const THREE_DIR = path.join(__dirname, '..', '..', 'node_modules', 'three', 'build');
const PLAY_HTML = path.join(PUBLIC_DIR, 'play.html');
const STAGE_HTML = path.join(PUBLIC_DIR, 'stage.html');

function missingPage() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Glimpse</title>
<link rel="stylesheet" href="/glimpse/glimpse.css"/></head>
<body class="gl-play"><section class="gl-join-hero"><p class="gl-kicker">Invite expired</p>
<h1>Glimpse</h1><p>Ask the host for a fresh table link.</p></section></body></html>`;
}

function renderGuestPage() {
  try {
    return fs.readFileSync(PLAY_HTML, 'utf8');
  } catch {
    return missingPage();
  }
}

/** @type {ReturnType<typeof createRoomService> | null} */
let singleton = null;

function getService(opts) {
  if (opts && opts.service) return opts.service;
  if (!singleton) {
    singleton = createRoomService({
      operatorHome: process.env.HARNESS_GLIMPSE_HOME || undefined,
      scope: 'personal'
    });
  }
  return singleton;
}

function jsonError(res, status, message, code) {
  return res.status(status).json({ ok: false, error: code || 'error', message });
}

function bodyOf(req) {
  return req && req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
}

function clipPlayOf(started) {
  const item = started && started.item;
  const clip = (started && started.clip) || {};
  const yt = item && item.source && item.source.youtubeVideoId;
  if (!yt) return null;
  const duration = DEFAULT_CLIP_SECONDS;
  const playAt = Number(started.playAt) || Date.now();
  return {
    kind: 'youtube',
    id: yt,
    start: Number(clip.startTime) || 0,
    duration,
    playAt,
    clipEndsAt: Number(started.clipEndsAt) || playAt + duration * 1000,
    guessUntil: started.guessUntil,
    serverNow: Date.now()
  };
}

function joinUrl(req, token) {
  return publicJoinUrl(req, token).joinUrl;
}

function stageUrl(req, token) {
  return publicJoinUrl(req, token, '/stage').joinUrl;
}

function hostQueueOf(live) {
  return ((live && live.queue) || []).map((q) => ({
    intent: q.intent,
    type: q.item && q.item.type,
    title: q.item && q.item.title
  }));
}

function liveClipPlay(live) {
  if (!live || live.phase !== 'playing' || !live.round) return null;
  return clipPlayOf({
    item: live.round.item,
    clip: live.round.clip,
    playAt: live.round.playAt,
    clipEndsAt: live.round.clipEndsAt,
    guessUntil: live.round.guessUntil,
    clipDuration: live.round.clip && live.round.clip.duration
  });
}

function joinPack(req, token) {
  const play = publicJoinUrl(req, token);
  const stage = publicJoinUrl(req, token, '/stage');
  return {
    joinUrl: play.joinUrl,
    phoneUrl: play.phoneUrl,
    requestUrl: play.requestUrl,
    stageUrl: stage.joinUrl
  };
}

function readCookies(req) {
  const out = {};
  for (const part of String((req.headers && req.headers.cookie) || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 1) continue;
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function setSidCookie(res, sid) {
  res.setHeader(
    'Set-Cookie',
    `glimpse_sid=${encodeURIComponent(sid)}; Path=/play/glimpse; Max-Age=2592000; HttpOnly; SameSite=Lax`
  );
}

function discordRedirectUri(req) {
  const host = req.get && req.get('host');
  const proto = (req.get && req.get('x-forwarded-proto')) || req.protocol || 'http';
  return `${proto}://${host}/play/glimpse/auth/discord/callback`;
}

function registerGlimpseHttpRoutes(app, opts = {}) {
  const svc = () => getService(opts);
  app.use('/play/glimpse/static', express.static(PUBLIC_DIR));
  app.use('/play/glimpse/static/vendor', express.static(THREE_DIR));

  // Note: GET /glimpse and GET /glimpse/ registered in server.js BEFORE express.static(public)

  app.get('/play/glimpse/auth/status', (req, res) => {
    const creds = discordAuth.loadDiscordCreds(svc().root);
    const me = ident.getSession(svc().db, readCookies(req).glimpse_sid);
    res.json({
      ok: true,
      configured: Boolean(creds && creds.clientId && creds.clientSecret),
      me: me
        ? { playerId: me.playerId, displayName: me.displayName, discordId: me.discordId }
        : null
    });
  });

  app.get('/play/glimpse/auth/discord', (req, res) => {
    const creds = discordAuth.loadDiscordCreds(svc().root);
    if (!creds || !creds.clientSecret) {
      return jsonError(res, 501, 'Put client_id and client_secret in glimpse/discord.json', 'discord_unconfigured');
    }
    const invite = String(req.query.invite || '');
    const state = ident.putOauthState(svc().db, invite);
    const url = discordAuth.authorizeUrl({
      creds,
      redirectUri: discordRedirectUri(req),
      state
    });
    res.redirect(302, url);
  });

  app.get('/play/glimpse/auth/discord/callback', async (req, res) => {
    try {
      const creds = discordAuth.loadDiscordCreds(svc().root);
      const st = ident.takeOauthState(svc().db, String(req.query.state || ''));
      if (!creds || !st) return res.redirect('/play/glimpse');
      const tok = await discordAuth.exchangeCode({
        creds,
        code: String(req.query.code || ''),
        redirectUri: discordRedirectUri(req),
        fetchFn: opts.discordFetch
      });
      const me = await discordAuth.fetchDiscordMe({
        accessToken: tok.access_token,
        fetchFn: opts.discordFetch
      });
      const row = ident.upsertIdentity(svc().db, {
        discordId: me.discordId,
        username: me.handle || me.username,
        displayName: me.username
      });
      const sid = ident.createSession(svc().db, row.playerId);
      setSidCookie(res, sid);
      const next = st.invite
        ? `/play/glimpse/${encodeURIComponent(st.invite)}?via=discord`
        : '/play/glimpse';
      res.redirect(302, next);
    } catch (e) {
      jsonError(res, 400, e.message, e.code || 'discord');
    }
  });

  app.post('/play/glimpse/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'glimpse_sid=; Path=/play/glimpse; Max-Age=0');
    res.json({ ok: true });
  });

  app.get('/play/glimpse/:invite/stage', (req, res) => {
    const room = svc().byInvite(req.params.invite);
    if (!room) return res.status(404).type('html').send(missingPage());
    res.sendFile(PLAY_HTML);
  });

  app.get('/play/glimpse/:invite', (req, res) => {
    const room = svc().byInvite(req.params.invite);
    if (!room) return res.status(404).type('html').send(missingPage());
    res.sendFile(PLAY_HTML);
  });

  app.get('/play/glimpse/:invite/state', async (req, res) => {
    try {
      await svc().tick(req.params.invite);
    } catch {
      /* still return view */
    }
    const view = svc().guestView(req.params.invite, req.query.playerId);
    if (!view) return jsonError(res, 404, 'Invite not found', 'bad_invite');
    res.json({ ok: true, room: view });
  });

  app.post('/play/glimpse/:invite/join', (req, res) => {
    try {
      const body = bodyOf(req);
      const session = ident.getSession(svc().db, readCookies(req).glimpse_sid);
      const guest = String(body.mode || '') === 'guest';
      const joined = svc().joinRoom(req.params.invite, {
        displayName: body.displayName,
        playerId: body.playerId,
        identity: guest ? null : session
      });
      res.json({ ok: true, ...joined });
    } catch (e) {
      jsonError(res, e.code === 'full' ? 409 : 400, e.message, e.code);
    }
  });

  app.post('/play/glimpse/:invite/ready', (req, res) => {
    try {
      const body = bodyOf(req);
      const out = svc().setReady(req.params.invite, body.playerId, body.ready !== false);
      res.json({ ok: true, ...out });
    } catch (e) {
      jsonError(res, 400, e.message, 'ready');
    }
  });

  app.post('/play/glimpse/:invite/chat', (req, res) => {
    try {
      const body = bodyOf(req);
      const session = ident.getSession(svc().db, readCookies(req).glimpse_sid);
      const playerId = body.playerId || (session && session.playerId);
      const out = svc().postChat(req.params.invite, playerId, body.text);
      res.json({ ok: true, ...out });
    } catch (e) {
      jsonError(res, 400, e.message, e.code || 'chat');
    }
  });

  app.post('/play/glimpse/:invite/answer', async (req, res) => {
    try {
      const body = bodyOf(req);
      const out = svc().submitAnswer(req.params.invite, body.playerId, body.text);
      const judged = await svc().tick(req.params.invite);
      res.json({ ok: true, ...out, phase: judged && judged.phase });
    } catch (e) {
      jsonError(res, 400, e.message, e.code || 'answer');
    }
  });

  app.post('/play/glimpse/:invite/nudge', (req, res) => {
    try {
      const body = bodyOf(req);
      const out = svc().requestNudge(req.params.invite, body.playerId);
      res.json({ ok: true, ...out });
    } catch (e) {
      jsonError(res, 400, e.message, e.code || 'nudge');
    }
  });

  app.get('/play/glimpse/:invite/media', async (req, res) => {
    try {
      const media = await svc().ensureRoundMedia(req.params.invite);
      if (!media || media.kind !== 'host' || !media.filePath) {
        return jsonError(res, 404, 'No clip', 'no_clip');
      }
      return res.sendFile(path.resolve(media.filePath));
    } catch (e) {
      jsonError(res, 400, e.message, 'media');
    }
  });

  app.get('/play/glimpse/:invite/clip', async (req, res) => {
    const room = svc().byInvite(req.params.invite);
    if (!room || !room.round) return jsonError(res, 404, 'No clip', 'no_clip');
    const item = room.round.item;
    const yt = item && item.source && item.source.youtubeVideoId;
    const clip = room.round.clip || {};
    const duration = DEFAULT_CLIP_SECONDS;
    if (yt) {
      return res.json({
        ok: true,
        kind: 'youtube',
        id: yt,
        start: Number(clip.startTime) || 0,
        duration,
        playAt: room.round.playAt || Date.now(),
        clipEndsAt: room.round.clipEndsAt,
        guessUntil: room.round.guessUntil,
        serverNow: Date.now()
      });
    }
    try {
      const media = await svc().ensureRoundMedia(req.params.invite);
      if (media && media.kind === 'host') {
        return res.json({
          ok: true,
          kind: 'host',
          url: `/play/glimpse/${req.params.invite}/media`,
          duration: Number(media.duration) || duration,
          playAt: room.round.playAt || Date.now(),
          clipEndsAt: room.round.clipEndsAt,
          guessUntil: room.round.guessUntil,
          serverNow: Date.now(),
          animation: media.animation || { stack: 'web', mask: true }
        });
      }
    } catch {
      /* none */
    }
    res.status(204).end();
  });

  app.post('/api/glimpse/rooms/:roomId/hunt', async (req, res) => {
    try {
      const body = bodyOf(req);
      const hunt = await svc().huntContent(req.params.roomId, {
        query: body.query,
        useFling: body.use_fling === true || body.useFling === true
      });
      res.json(hunt);
    } catch (e) {
      jsonError(res, 400, e.message, e.code || 'hunt');
    }
  });

  app.get('/play/glimpse/:invite/events', (req, res) => {
    const room = svc().byInvite(req.params.invite);
    if (!room) return jsonError(res, 404, 'Invite not found', 'bad_invite');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const send = (evt) => {
      res.write(`event: ${evt.type}\n`);
      res.write(`data: ${JSON.stringify(evt)}\n\n`);
      res.write(`event: glimpse\n`);
      res.write(`data: ${JSON.stringify(evt)}\n\n`);
    };
    send({ type: 'hello', roomId: room.roomId, phase: room.phase, ts: Date.now() });
    const off = () => svc().bus.off(`invite:${room.inviteToken}`, send);
    svc().bus.on(`invite:${room.inviteToken}`, send);
    req.on('close', off);
  });

  app.post('/api/glimpse/rooms', (req, res) => {
    try {
      const body = bodyOf(req);
      const created = svc().createRoom({
        host: { id: body.hostId || 'host', displayName: body.displayName || 'Host' },
        pool: body.pool,
        era: body.era,
        challenge: body.challenge,
        acceptance: body.acceptance,
        maxPlayers: body.maxPlayers
      });
      res.json({
        ok: true,
        ...created,
        ...joinPack(req, created.inviteToken),
        queue: hostQueueOf(svc().getLive(created.roomId))
      });
    } catch (e) {
      jsonError(res, 500, e && e.message ? e.message : 'failed to open table', 'create_failed');
    }
  });

  app.get('/api/glimpse/rooms/:roomId', async (req, res) => {
    try {
      await svc().tick(req.params.roomId);
    } catch {
      /* still return */
    }
    const room = svc().getRoom(req.params.roomId);
    if (!room) return jsonError(res, 404, 'Room not found', 'missing');
    const live = svc().getLive(req.params.roomId);
    res.json({
      ok: true,
      room,
      inviteToken: live && live.inviteToken,
      joinPath: live ? `/play/glimpse/${live.inviteToken}` : null,
      queue: hostQueueOf(live),
      clipPlay: liveClipPlay(live),
      ...(live ? joinPack(req, live.inviteToken) : {})
    });
  });

  app.post('/api/glimpse/rooms/:roomId/start', async (req, res) => {
    try {
      const body = bodyOf(req);
      const started = await svc().startRound(req.params.roomId, body);
      const payload = {
        ok: true,
        phase: started.phase,
        clip: started.clip,
        playAt: started.playAt,
        clipEndsAt: started.clipEndsAt,
        guessUntil: started.guessUntil,
        mediaType: started.item && started.item.type,
        clipPlay: clipPlayOf(started),
        serverNow: Date.now()
      };
      res.json(payload);
      svc().ensureRoundMedia(req.params.roomId).catch(() => {});
    } catch (e) {
      jsonError(res, 400, e.message);
    }
  });

  app.post('/api/glimpse/rooms/:roomId/confirm', (req, res) => {
    try {
      const out = svc().confirmStart(req.params.roomId);
      res.json({ ok: true, ...out });
    } catch (e) {
      jsonError(res, 400, e.message, 'confirm');
    }
  });

  app.post('/api/glimpse/rooms/:roomId/transport', (req, res) => {
    try {
      const out = svc().setTransport(req.params.roomId, bodyOf(req));
      res.json({ ok: true, ...out });
    } catch (e) {
      jsonError(res, 400, e.message, 'transport');
    }
  });

  app.post('/api/glimpse/rooms/:roomId/escalate', async (req, res) => {
    try {
      const out = await svc().escalateRound(req.params.roomId);
      const live = svc().getLive(req.params.roomId);
      res.json({
        ok: true,
        ...out,
        clipPlay: clipPlayOf({
          item: live && live.round && live.round.item,
          clip: out.clip,
          playAt: out.playAt
        })
      });
    } catch (e) {
      jsonError(res, 400, e.message);
    }
  });

  app.post('/api/glimpse/rooms/:roomId/lock', async (req, res) => {
    try {
      const judged = await svc().lockAndJudge(req.params.roomId);
      res.json({ ok: true, ...judged });
    } catch (e) {
      jsonError(res, 400, e.message);
    }
  });

  app.post('/api/glimpse/rooms/:roomId/kick', (req, res) => {
    try {
      const body = bodyOf(req);
      const result = svc().kickPlayer(req.params.roomId, body.playerId, body.callerId);
      res.json({ ok: true, room: result });
    } catch (e) {
      jsonError(res, e.code === 'not_host' ? 403 : 400, e.message);
    }
  });

  app.post('/api/glimpse/rooms/:roomId/promote', (req, res) => {
    try {
      const body = bodyOf(req);
      const result = svc().promoteToHost(req.params.roomId, body.playerId, body.callerId);
      res.json({ ok: true, room: result });
    } catch (e) {
      jsonError(res, e.code === 'not_host' ? 403 : 400, e.message);
    }
  });

  app.post('/api/glimpse/rooms/:roomId/queue', (req, res) => {
    try {
      const plan = svc().queueAhead(req.params.roomId, bodyOf(req));
      res.json({
        ok: true,
        queue: plan.map((p) => ({
          intent: p.intent,
          itemId: p.item.id,
          title: p.item.title,
          type: p.item.type,
          reason: p.reason
        }))
      });
    } catch (e) {
      jsonError(res, 400, e.message);
    }
  });

  app.get('/api/glimpse/catalog', (req, res) => {
    const pool = req.query.pool || 'mixed';
    const items = queryCatalog({
      pool,
      genre: req.query.genre,
      era: req.query.era,
      sort: req.query.sort,
      dir: req.query.dir
    });
    res.json({
      ok: true,
      pool,
      facets: catalogFacets(items),
      items: items.map((i) => ({
        id: i.id,
        type: i.type,
        title: i.title,
        artist: i.artist,
        director: i.director,
        series: i.series,
        year: i.year,
        era: i.era,
        genres: i.genres
      })),
      challenges: CHALLENGE_TYPES,
      pools: POOLS,
      acceptance: Object.keys(ACCEPTANCE_PRESETS)
    });
  });

  app.get('/api/glimpse/item/:id', (req, res) => {
    const item = findCatalogItem(req.params.id) || seedCatalog().find((x) => x.id === req.params.id);
    if (!item) return jsonError(res, 404, 'Unknown item', 'missing');
    res.json({ ok: true, item });
  });
}

module.exports = {
  registerGlimpseHttpRoutes,
  getService,
  renderGuestPage
};
