'use strict';

const { extractYouTubeVideoId } = require('../mediaIngest/youtubeCaptions.js');
const { normalizeMediaItem } = require('./mediaItem');
const { poolToTypes } = require('./constants');

const WATCH_ID_RE = /(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/g;

function extractWatchIdsFromText(raw) {
  const s = String(raw || '');
  const out = [];
  const seen = new Set();
  let m;
  const re = new RegExp(WATCH_ID_RE.source, 'g');
  while ((m = re.exec(s))) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    out.push(m[1]);
  }
  return out;
}

function mergeHits(...lists) {
  const seen = new Set();
  const out = [];
  for (const list of lists) {
    for (const hit of list || []) {
      const id = hit && hit.id ? String(hit.id) : extractYouTubeVideoId(hit && hit.url);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push({
        id,
        title: String(hit.title || '').trim(),
        url: hit.url || `https://www.youtube.com/watch?v=${id}`,
        channel: hit.channel ? String(hit.channel) : ''
      });
    }
  }
  return out;
}

function pickFrontierTerms(profiles) {
  const scores = new Map();
  for (const p of profiles || []) {
    for (const bag of [p.people || {}, p.concepts || {}, p.eras || {}]) {
      for (const [k, v] of Object.entries(bag)) {
        if (!k || Number(v) < 0.45) continue;
        scores.set(k, (scores.get(k) || 0) + Number(v));
      }
    }
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((x) => x[0]);
}

function planHuntQuery(input = {}) {
  const pool = String(input.pool || 'mixed').toLowerCase();
  const types = poolToTypes(pool);
  const type = types.length === 1 ? types[0] : types[Math.floor((Number(input.salt) || 0) % types.length)] || 'song';
  const terms = pickFrontierTerms(input.profiles || []);
  const suffix =
    type === 'song' ? 'official audio' : type === 'movie' ? 'trailer' : 'scene clip';
  const core = terms.join(' ').trim() || (type === 'song' ? 'classic rock' : type === 'movie' ? 'action movie' : 'tv show');
  return {
    pool,
    type,
    query: `${core} ${suffix}`.replace(/\s+/g, ' ').trim(),
    terms
  };
}

function defaultClips(durationSec) {
  const d = Number(durationSec);
  const len = Number.isFinite(d) && d > 20 ? d : 180;
  const windows = [
    { id: 'h1', start: Math.min(18, len * 0.12), span: 8, difficulty: 0.35, tags: ['iconic'] },
    { id: 'h2', start: Math.min(len * 0.35, Math.max(40, len - 30)), span: 8, difficulty: 0.5, tags: ['verse'] },
    { id: 'h3', start: Math.min(len * 0.62, Math.max(60, len - 20)), span: 6, difficulty: 0.7, tags: ['obscure'] }
  ];
  return windows
    .filter((w) => w.start + w.span < len - 1)
    .map((w) => ({
      id: w.id,
      startTime: Math.round(w.start),
      endTime: Math.round(w.start + w.span),
      difficulty: w.difficulty,
      informationDensity: 0.5,
      spoilerRisk: 0.2,
      tags: w.tags
    }));
}

function parseYtTitle(raw) {
  let title = String(raw || '').replace(/\s+/g, ' ').trim();
  title = title.replace(/\[[^\]]*\]/g, ' ').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  title = title.replace(/\b(official\s+(video|audio|music video)|lyrics?|hd|4k|remaster(ed)?|visualizer)\b/gi, '').replace(/\s+/g, ' ').trim();
  let artist = '';
  const dash = title.split(/\s[-–—]\s/);
  if (dash.length >= 2) {
    artist = dash[0].trim();
    title = dash.slice(1).join(' - ').trim();
  }
  const aliases = [title];
  if (artist) aliases.push(`${artist} ${title}`, artist);
  return { title: title || String(raw || 'Untitled').trim(), artist, aliases: aliases.filter(Boolean) };
}

function mintHuntItem(hit, opts = {}) {
  const id = hit.id || extractYouTubeVideoId(hit.url);
  const type = opts.type === 'movie' || opts.type === 'tv' || opts.type === 'song' ? opts.type : 'song';
  const parsed = parseYtTitle(hit.title || 'Untitled');
  const channel = String(hit.channel || parsed.artist || '').trim();
  const title = parsed.title;
  return normalizeMediaItem({
    id: `${type}:yt-${id}`,
    type,
    title,
    artist: type === 'song' ? channel || parsed.artist : parsed.artist || null,
    director: type === 'movie' ? channel : null,
    series: type === 'tv' ? channel : null,
    people: channel ? [channel] : [],
    aliases: parsed.aliases,
    cues: parsed.artist ? [parsed.artist] : [],
    source: {
      kind: 'youtube',
      url: hit.url || `https://www.youtube.com/watch?v=${id}`,
      youtubeVideoId: id
    },
    candidateClips: defaultClips(hit.duration)
  });
}

async function searchYoutubeYtDlp(query, opts = {}) {
  if (typeof opts.searchYoutube === 'function') {
    return opts.searchYoutube(query, opts);
  }
  const limit = Math.max(1, Math.min(12, Number(opts.limit) || 6));
  const { pickYtDlpInvocation } = require('../mediaIngest/ytdlpDownload.js');
  const { spawnCaptureAsync } = require('../spawnCapture.js');
  const inv = await pickYtDlpInvocation();
  if (!inv) {
    const e = new Error('yt-dlp not found');
    e.code = 'yt_dlp_missing';
    throw e;
  }
  const target = `ytsearch${limit}:${query}`;
  const args = [...inv.argsPrefix, '--flat-playlist', '--skip-download', '--print-json', target];
  const r = await spawnCaptureAsync(inv.cmd, args, { shell: false, timeoutMs: opts.timeoutMs || 90000 });
  const items = [];
  for (const line of String(r.stdout || '').split(/\r?\n/)) {
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    const id = o && o.id ? String(o.id) : '';
    if (!/^[\w-]{11}$/.test(id)) continue;
    items.push({
      id,
      title: o.title ? String(o.title) : '',
      url: o.webpage_url || o.url || `https://www.youtube.com/watch?v=${id}`,
      channel: o.channel || o.uploader || ''
    });
  }
  return items;
}

module.exports = {
  extractWatchIdsFromText,
  mergeHits,
  planHuntQuery,
  mintHuntItem,
  parseYtTitle,
  defaultClips,
  searchYoutubeYtDlp
};
