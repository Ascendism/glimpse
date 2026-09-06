'use strict';

const BAD_TAGS = new Set(['silence', 'fade', 'credits']);
const { checkYouTubeEmbeddable } = require('./youtubeValidation');

// Cache validation results for performance (TTL 1 hour)
const validationCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

function rngFrom(fn) {
  if (typeof fn === 'function') return fn;
  return Math.random;
}

async function isItemPlayable(item, opts = {}) {
  const ytId = item && item.source && item.source.youtubeVideoId;
  if (!ytId) return { ok: false, reason: 'no_youtube_id' };

  const cached = validationCache.get(ytId);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.result;
  }

  const result = await checkYouTubeEmbeddable(ytId, { timeoutMs: opts.timeoutMs || 5000 });
  validationCache.set(ytId, { result, ts: Date.now() });
  return result;
}

function usableClips(item) {
  const all = Array.isArray(item && item.candidateClips) ? item.candidateClips : [];
  return all.filter((c) => !(c.tags || []).some((t) => BAD_TAGS.has(t)));
}

function pickWeighted(clips, difficulty, rng) {
  if (!clips.length) return null;
  const target = Number.isFinite(Number(difficulty)) ? Number(difficulty) : 0.5;
  const scored = clips.map((c) => {
    const d = Math.abs((Number(c.difficulty) || 0.5) - target);
    return { c, w: 1 / (0.08 + d) };
  });
  const total = scored.reduce((s, x) => s + x.w, 0);
  let r = rng() * total;
  for (const row of scored) {
    r -= row.w;
    if (r <= 0) return row.c;
  }
  return scored[scored.length - 1].c;
}

function selectClip(item, opts = {}) {
  const rng = rngFrom(opts.rng);
  const clips = usableClips(item);
  const exclude = new Set(opts.excludeIds || []);
  const filtered = clips.filter((c) => !exclude.has(c.id));
  const pool = filtered.length ? filtered : clips;
  const hit = pickWeighted(pool, opts.difficulty, rng);
  if (!hit) return null;
  return { ...hit, tags: [...(hit.tags || [])] };
}

function escalateClips(item, opts = {}) {
  const maxSteps = Math.max(1, Math.trunc(Number(opts.maxSteps) || 3));
  const used = [];
  const steps = [];
  const difficulties = [0.25, 0.5, 0.75, 0.9];
  for (let i = 0; i < maxSteps; i += 1) {
    const clip = selectClip(item, {
      difficulty: difficulties[i] || 0.6,
      rng: opts.rng,
      excludeIds: used
    });
    if (!clip) break;
    used.push(clip.id);
    steps.push(clip);
  }
  return steps;
}

module.exports = {
  selectClip,
  escalateClips,
  usableClips,
  isItemPlayable
};
