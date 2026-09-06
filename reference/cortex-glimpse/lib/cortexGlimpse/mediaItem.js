'use strict';

const { MEDIA_TYPES } = require('./constants');

function asStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x || '').trim()).filter(Boolean);
}

function validateClip(clip, idx) {
  const errors = [];
  if (!clip || typeof clip !== 'object') {
    errors.push(`candidateClips[${idx}] must be an object`);
    return errors;
  }
  const start = Number(clip.startTime);
  const end = Number(clip.endTime);
  if (!Number.isFinite(start) || start < 0) errors.push(`candidateClips[${idx}].startTime invalid`);
  if (!Number.isFinite(end) || end <= start) errors.push(`candidateClips[${idx}].endTime invalid`);
  return errors;
}

function validateMediaItem(item) {
  const errors = [];
  if (!item || typeof item !== 'object') return { valid: false, errors: ['item must be an object'] };
  if (!item.id || typeof item.id !== 'string') errors.push('id required');
  if (!MEDIA_TYPES.includes(item.type)) errors.push('type must be song|movie|tv');
  if (!item.title || typeof item.title !== 'string') errors.push('title required');
  if (!Array.isArray(item.candidateClips) || item.candidateClips.length < 1) {
    errors.push('candidateClips must be a non-empty array');
  } else {
    item.candidateClips.forEach((c, i) => errors.push(...validateClip(c, i)));
  }
  return errors.length ? { valid: false, errors } : { valid: true };
}

function normalizeMediaItem(raw) {
  const item = raw && typeof raw === 'object' ? raw : {};
  const type = MEDIA_TYPES.includes(item.type) ? item.type : 'song';
  const clips = Array.isArray(item.candidateClips)
    ? item.candidateClips.map((c, i) => ({
        id: String(c.id || `clip-${i}`),
        startTime: Number(c.startTime) || 0,
        endTime: Number(c.endTime) || 5,
        difficulty: Number.isFinite(Number(c.difficulty)) ? Number(c.difficulty) : 0.5,
        informationDensity: Number.isFinite(Number(c.informationDensity))
          ? Number(c.informationDensity)
          : 0.5,
        spoilerRisk: Number.isFinite(Number(c.spoilerRisk)) ? Number(c.spoilerRisk) : 0,
        tags: asStringArray(c.tags)
      }))
    : [];
  return {
    id: String(item.id || ''),
    type,
    title: String(item.title || ''),
    aliases: asStringArray(item.aliases),
    year: item.year == null ? null : Number(item.year),
    source: item.source && typeof item.source === 'object' ? item.source : {},
    candidateClips: clips,
    cues: asStringArray(item.cues),
    people: asStringArray(item.people),
    genres: asStringArray(item.genres),
    tags: asStringArray(item.tags),
    franchise: item.franchise ? String(item.franchise) : null,
    era: item.era ? String(item.era) : null,
    artist: item.artist ? String(item.artist) : null,
    album: item.album ? String(item.album) : null,
    director: item.director ? String(item.director) : null,
    cast: asStringArray(item.cast),
    series: item.series ? String(item.series) : null,
    season: item.season == null ? null : Number(item.season),
    episode: item.episode == null ? null : Number(item.episode),
    episodeTitle: item.episodeTitle ? String(item.episodeTitle) : null,
    characters: asStringArray(item.characters),
    quote: item.quote ? String(item.quote) : null,
    confusableWith: asStringArray(item.confusableWith)
  };
}

function titleCandidates(item) {
  const out = [item.title, ...(item.aliases || [])];
  if (item.episodeTitle) out.push(item.episodeTitle);
  return out.filter(Boolean);
}

function artistCandidates(item) {
  const out = [];
  if (item.artist) out.push(item.artist);
  if (item.director) out.push(item.director);
  out.push(...(item.people || []), ...(item.cast || []));
  return out.filter(Boolean);
}

function franchiseCandidates(item) {
  const out = [];
  if (item.franchise) out.push(item.franchise);
  if (item.series) out.push(item.series);
  return out.filter(Boolean);
}

module.exports = {
  validateMediaItem,
  normalizeMediaItem,
  titleCandidates,
  artistCandidates,
  franchiseCandidates
};
