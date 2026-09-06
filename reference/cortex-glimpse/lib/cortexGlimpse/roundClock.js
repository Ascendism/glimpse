'use strict';

const { DEFAULT_GUESS_MS, DEFAULT_CLIP_SECONDS } = require('./constants');

const PRE_ROLL_MS = 2500;
const GUESS_AFTER_CLIP_MS = 12000;
const ESCALATE_PRE_ROLL_MS = 800;

function clipDurationSec() {
  return DEFAULT_CLIP_SECONDS;
}

function clipStartSec(clip) {
  const s = Number(clip && clip.startTime);
  return Number.isFinite(s) && s > 0 ? s : 0;
}

function scheduleRound(nowMs, clip, extra = {}) {
  const now = Number(nowMs) || Date.now();
  const pre = extra.escalate ? ESCALATE_PRE_ROLL_MS : PRE_ROLL_MS;
  const playAt = Number(extra.playAt) || now + pre;
  const clipDuration = clipDurationSec(clip);
  const clipEndsAt = playAt + clipDuration * 1000;
  const guessUntil = Math.max(
    Number(extra.guessUntil) || 0,
    clipEndsAt + GUESS_AFTER_CLIP_MS,
    playAt + (Number(extra.guessMs) || DEFAULT_GUESS_MS)
  );
  return {
    playAt,
    clipEndsAt,
    guessUntil,
    clipDuration,
    clipStart: clipStartSec(clip)
  };
}

function beatAt(nowMs, round) {
  if (!round || round.playAt == null) return 'idle';
  const t = Number(nowMs);
  if (t < Number(round.playAt)) return 'countdown';
  if (t < Number(round.clipEndsAt || round.playAt)) return 'clip';
  if (t < Number(round.guessUntil || 0)) return 'guessing';
  return 'closed';
}

function planPlayback(spec, wallNow) {
  const receivedAt = Number(spec && spec.receivedAt) || wallNow;
  const serverNow = Number(spec && spec.serverNow) || receivedAt;
  const skew = receivedAt - serverNow;
  const t = wallNow - skew;
  const playAt = Number(spec && spec.playAt) || t;
  const start = Number(spec && spec.start) || 0;
  const dur = Math.max(0.5, Number(spec && spec.duration) || 8);
  const clipEndsAt = Number(spec && spec.clipEndsAt) || playAt + dur * 1000;
  if (t >= clipEndsAt) return { action: 'stop', t, playAt, clipEndsAt };
  if (t < playAt) {
    return { action: 'wait', delay: playAt - t, seek: start, remaining: clipEndsAt - playAt, t, playAt };
  }
  const into = (t - playAt) / 1000;
  return {
    action: 'play',
    seek: start + into,
    remaining: clipEndsAt - t,
    t,
    playAt,
    clipEndsAt
  };
}

module.exports = {
  PRE_ROLL_MS,
  GUESS_AFTER_CLIP_MS,
  ESCALATE_PRE_ROLL_MS,
  clipDurationSec,
  clipStartSec,
  scheduleRound,
  beatAt,
  planPlayback
};
