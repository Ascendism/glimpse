'use strict';

const { ESCALATING_POINTS, TV_POINTS, ACCEPTANCE_PRESETS } = require('./constants');
const { judgeAnswerSync, acceptancePasses } = require('./judge');
const { matchAnswer } = require('./matcher');

function escalatingClipPoints(clipIndex) {
  const i = Math.max(0, Math.trunc(Number(clipIndex) || 0));
  if (i >= ESCALATING_POINTS.length) return ESCALATING_POINTS[ESCALATING_POINTS.length - 1];
  return ESCALATING_POINTS[i];
}

function speedBonus(elapsedMs, windowMs = 20000) {
  const e = Math.max(0, Number(elapsedMs) || 0);
  const w = Math.max(1, Number(windowMs) || 20000);
  if (e >= w) return 0;
  return Math.round(120 * (1 - e / w));
}

function scoreSubmission(guess, item, opts = {}) {
  const challenge = String(opts.challenge || 'close_enough');
  const judged = opts.judged || judgeAnswerSync(guess, item, opts);
  const clipIndex = Number.isFinite(Number(opts.clipIndex)) ? Number(opts.clipIndex) : 0;
  const base = escalatingClipPoints(clipIndex);
  let multiplier = judged.specificity;
  if (challenge === 'exact') {
    multiplier = judged.acceptable ? 1 : 0;
  } else if (challenge === 'close_enough') {
    multiplier = judged.acceptable ? Math.max(0.35, judged.specificity) : judged.specificity * 0.15;
  } else if (challenge === 'identify') {
    multiplier = judged.acceptable ? Math.max(0.7, judged.song_match) : 0;
  }

  let points = Math.round(base * multiplier);
  if (challenge === 'episode' && item.type === 'tv') {
    const tv = judged.tv || matchAnswer(guess, item, { challenge }).tv;
    points = 0;
    if (tv.show >= 0.75) points += TV_POINTS.show;
    if (tv.season >= 1) points += TV_POINTS.season;
    if (tv.episode >= 1) points += TV_POINTS.episode;
    if (tv.episodeTitle >= 0.8) points += TV_POINTS.episodeTitle;
    points = Math.round(points * (clipIndex === 0 ? 1 : clipIndex === 1 ? 0.7 : 0.4));
  }
  if (challenge === 'year') {
    points = judged.year_match >= 1 ? base : judged.year_match >= 0.7 ? Math.round(base * 0.5) : 0;
  }
  if (challenge === 'actor_artist') {
    points = Math.round(base * judged.artist_match);
  }
  points += speedBonus(opts.elapsedMs, opts.windowMs);
  return {
    ...judged,
    points,
    basePoints: base,
    clipIndex,
    acceptable: judged.acceptable
  };
}

module.exports = {
  scoreSubmission,
  escalatingClipPoints,
  speedBonus,
  acceptancePasses,
  ACCEPTANCE_PRESETS
};
