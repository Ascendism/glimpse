'use strict';

const fs = require('fs');
const path = require('path');
const {
  animationStackSummary,
  resolveAnimationLibrariesForPipeline
} = require('../cortexAnimation/animationStack');
const { understandFromObservation } = require('../cortexSoundDirector/understand');

function safe(id) {
  return String(id || 'x').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

function animationCue() {
  const summary = animationStackSummary();
  return {
    stack: 'web',
    libraries: resolveAnimationLibrariesForPipeline('web'),
    mask: true,
    wipe: true,
    version: summary.version,
    guidance: 'Host-extracted clip in the HTML animation stage — not a YouTube iframe.'
  };
}

function toCandidate(clip, window) {
  const start = Number(window && window.start != null ? window.start : clip.startTime) || 0;
  const end = Number(window && window.end != null ? window.end : clip.endTime) || start + 8;
  return {
    id: String((clip && clip.id) || 'c1'),
    start,
    end: end > start ? end : start + 8,
    score: 1 - (Number(clip && clip.difficulty) || 0.5),
    reason: Array.isArray(window && window.reason) ? window.reason : ['glimpse_round']
  };
}

function defaultUnderstand({ item, clip, observation }) {
  if (observation) {
    const dir = understandFromObservation(observation, {
      duration_s: Number(clip && clip.duration) || 8
    });
    const hooks = (dir && dir.hooks) || (dir && dir.beats) || [];
    const first = Array.isArray(hooks) ? hooks[0] : null;
    if (first && Number.isFinite(Number(first.t))) {
      const start = Number(first.t);
      const end = Number(first.end) > start ? Number(first.end) : start + 8;
      return { start, end, reason: ['understandFromObservation'] };
    }
  }
  return {
    start: Number(clip && clip.startTime) || 0,
    end: Number(clip && clip.endTime) || 8,
    reason: ['catalog_window']
  };
}

async function defaultIngest({ item, root }) {
  const local = item && item.source && item.source.path;
  if (local && fs.existsSync(local)) return { ok: true, path: local };
  const dest = path.join(root, 'media', `${safe(item && item.id)}.mp4`);
  if (fs.existsSync(dest)) return { ok: true, path: dest };
  const yt = item && item.source && item.source.youtubeVideoId;
  if (!yt) return { ok: false, error: 'no_source' };
  try {
    const { ingestClipMediaSource } = require('../cortexClipping/ingestClipMediaSource');
    const r = await ingestClipMediaSource({
      id: safe(item.id),
      input: `https://www.youtube.com/watch?v=${yt}`,
      workspaceRoot: root,
      clippingRoot: root,
      downloadOnly: true
    });
    const p = (r && (r.path || r.media_path || (r.asset && r.asset.path))) || dest;
    if (r && r.ok !== false && fs.existsSync(p)) return { ok: true, path: p };
    return { ok: false, error: (r && r.code) || 'ingest_failed' };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

function defaultCompose(opts) {
  try {
    const { composeClipCandidateWithFfmpeg } = require('../cortexClipping/clipComposerFfmpeg');
    return composeClipCandidateWithFfmpeg(opts);
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

/**
 * Host-authoritative Glimpse clip: ingest → understand window → ffmpeg extract.
 * Inject ingest/compose/understand in tests. Live guests stream the host file.
 */
async function materializeRoundClip(opts = {}) {
  const item = opts.item;
  const clip = opts.clip || {};
  const root = path.resolve(String(opts.root || ''));
  if (!item || !root) return { kind: 'unavailable', error: 'item_and_root_required' };

  const understand = typeof opts.understand === 'function' ? opts.understand : defaultUnderstand;
  const ingest = typeof opts.ingest === 'function' ? opts.ingest : defaultIngest;
  const compose = typeof opts.compose === 'function' ? opts.compose : defaultCompose;

  const window = (await understand({ item, clip, root, observation: opts.observation })) || {};
  const candidate = toCandidate(clip, window);
  const ingested = await ingest({ item, root, clip, candidate });
  if (!ingested || !ingested.ok || !ingested.path) {
    return { kind: 'unavailable', error: (ingested && ingested.error) || 'ingest_failed' };
  }

  const filePath = path.join(root, 'clips', `${safe(item.id)}-${safe(clip.id || candidate.id)}.mp4`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const composed = compose({
    workspaceRoot: root,
    clippingRoot: root,
    inputMediaAbs: ingested.path,
    outputMediaAbs: filePath,
    candidate,
    copyMode: false,
    minClipDurationSec: 0.5,
    maxClipDurationSec: 20
  });
  if (!composed || composed.ok === false || !fs.existsSync(filePath)) {
    return { kind: 'unavailable', error: (composed && composed.error) || 'compose_failed' };
  }
  const duration =
    (composed.window && composed.window.duration) || Math.max(0.5, candidate.end - candidate.start);
  return {
    kind: 'host',
    filePath,
    duration,
    window: composed.window || { start: candidate.start, end: candidate.end, duration },
    animation: animationCue()
  };
}

module.exports = {
  materializeRoundClip,
  animationCue,
  toCandidate,
  defaultUnderstand
};
