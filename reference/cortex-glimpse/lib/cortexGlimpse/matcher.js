'use strict';

const { similarity, bestSimilarity, normalizeGuess, tokenSet } = require('./normalize');
const { titleCandidates, artistCandidates, franchiseCandidates } = require('./mediaItem');

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function tokenCoverage(guess, candidate) {
  const gt = tokenSet(guess);
  const ct = [...tokenSet(candidate)].filter((t) => t.length > 2);
  if (!ct.length) return 0;
  let hit = 0;
  for (const t of ct) if (gt.has(t)) hit += 1;
  return hit / ct.length;
}

function cueScore(guess, item) {
  const g = normalizeGuess(guess);
  if (!g) return { score: 0, hit: '' };
  let best = 0;
  let hit = '';
  for (const cue of item.cues || []) {
    const c = normalizeGuess(cue);
    if (!c) continue;
    if (g.includes(c) || c.includes(g)) {
      const s = 0.55 + 0.35 * (Math.min(g.length, c.length) / Math.max(g.length, c.length));
      if (s > best) {
        best = s;
        hit = cue;
      }
      continue;
    }
    const gt = tokenSet(g);
    const ct = tokenSet(c);
    let inter = 0;
    for (const t of ct) if (gt.has(t)) inter += 1;
    if (ct.size && inter / ct.size >= 0.6) {
      const s = 0.45 + 0.3 * (inter / ct.size);
      if (s > best) {
        best = s;
        hit = cue;
      }
    }
    const sim = similarity(g, c);
    if (sim > best) {
      best = sim * 0.7;
      hit = cue;
    }
  }
  return { score: clamp01(best), hit };
}

function yearScore(guess, item) {
  if (item.year == null) return 0;
  const years = String(guess || '').match(/\b(19|20)\d{2}\b/g) || [];
  if (years.some((y) => Number(y) === Number(item.year))) return 1;
  const era = normalizeGuess(item.era || '');
  if (era && normalizeGuess(guess).includes(era.replace(/\s/g, ''))) return 0.7;
  if (era && normalizeGuess(guess).includes(era)) return 0.75;
  return 0;
}

function episodeBits(guess, item) {
  const g = normalizeGuess(guess);
  const bits = { show: 0, season: 0, episode: 0, episodeTitle: 0 };
  if (item.series) bits.show = similarity(g, item.series);
  if (item.franchise && bits.show < 0.5) bits.show = Math.max(bits.show, similarity(g, item.franchise) * 0.6);
  if (item.season != null) {
    if (
      g.includes(`s${item.season}e`) ||
      g.includes(`season ${item.season}`) ||
      g.includes(`s ${item.season}`)
    ) {
      bits.season = 1;
    }
  }
  if (item.episode != null) {
    if (
      g.includes(`e${item.episode}`) ||
      g.includes(`episode ${item.episode}`) ||
      g.includes(`ep ${item.episode}`)
    ) {
      bits.episode = 1;
    }
  }
  if (item.episodeTitle) bits.episodeTitle = similarity(g, item.episodeTitle);
  return bits;
}

function matchAnswer(guess, item, opts = {}) {
  const challenge = String(opts.challenge || 'identify');
  const titles = titleCandidates(item);
  const artists = artistCandidates(item);
  const franchises = franchiseCandidates(item);
  const titleHit = bestSimilarity(guess, titles);
  const artistHit = bestSimilarity(guess, artists);
  const artistCover = Math.max(0, ...artists.map((a) => tokenCoverage(guess, a)));
  if (artistCover >= 0.66 && artistHit.score < 0.78) artistHit.score = 0.78;
  const franHit = bestSimilarity(guess, franchises);
  const cues = cueScore(guess, item);
  const year = yearScore(guess, item);
  const tv = episodeBits(guess, item);

  let songMatch = Math.max(titleHit.score, cues.score * 0.95);
  if (item.type === 'tv') {
    songMatch = Math.max(songMatch, tv.episodeTitle, tv.show * 0.55);
  }
  const artistMatch = artistHit.score;
  const franchiseMatch = franHit.score;

  let specificity = songMatch;
  if (challenge === 'close_enough' || challenge === 'identify' || challenge === 'identify_anything') {
    const parts = [titleHit.score * 1.0, artistHit.score * 0.55, cues.score * 0.88, franchiseMatch * 0.45];
    specificity = Math.max(...parts);
    if (titleHit.score >= 0.92 && artistHit.score >= 0.7) specificity = 1;
    else if (titleHit.score >= 0.9 && artistHit.score < 0.55) specificity = 0.85;
    else if (titleHit.score >= 0.9) specificity = Math.max(specificity, 0.85);
    if (artistHit.score >= 0.9 && titleHit.score < 0.5) specificity = 0.7;
    if (cues.score >= titleHit.score && titleHit.score < 0.75 && artistHit.score < 0.6) {
      specificity = cues.score >= 0.75 ? 0.58 : 0.45;
    }
  }

  const exactish = titleHit.score >= 0.9 && (item.type !== 'song' || artistHit.score >= 0.55 || challenge === 'close_enough');
  const needsLlm =
    !exactish &&
    songMatch < 0.82 &&
    cues.score < 0.55 &&
    String(guess || '').trim().length > 8;

  return {
    song_match: clamp01(songMatch),
    artist_match: clamp01(artistMatch),
    franchise_match: clamp01(franchiseMatch),
    cue_match: clamp01(cues.score),
    year_match: clamp01(year),
    tv,
    specificity: clamp01(specificity),
    title_hit: titleHit.hit,
    artist_hit: artistHit.hit,
    cue_hit: cues.hit,
    needs_llm: needsLlm,
    challenge
  };
}

module.exports = {
  matchAnswer,
  cueScore,
  episodeBits
};
