'use strict';

const MEDIA_TYPES = Object.freeze(['song', 'movie', 'tv']);
const POOLS = Object.freeze(['music', 'movies', 'television', 'mixed']);
const CHALLENGE_TYPES = Object.freeze([
  'identify',
  'close_enough',
  'exact',
  'character',
  'actor_artist',
  'year',
  'episode',
  'quote',
  'hardcore'
]);
const QUESTION_MODES = Object.freeze([
  'song_title',
  'artist',
  'song_and_artist',
  'album',
  'era',
  'identify_anything',
  'multiple_choice',
  'first_to_identify',
  'one_submission',
  'continuous'
]);
const ACCEPTANCE_PRESETS = Object.freeze({
  casual: { song_match: 0.7, artist_match: 0 },
  normal: { song_match: 0.82, artist_match: 0 },
  strict: { song_match: 0.93, artist_match: 0.7 },
  exact: { song_match: 0.95, artist_match: 0.9 }
});
const ROUND_INTENTS = Object.freeze([
  'confirm',
  'boundary',
  'expand',
  'disambiguate',
  'balance',
  'surprise',
  'reinforce',
  'discover'
]);
const PHASES = Object.freeze([
  'lobby',
  'preparing',
  'playing',
  'guessing',
  'judging',
  'reveal',
  'intermission',
  'ended'
]);
const CLIP_TAGS = Object.freeze([
  'dialogue',
  'action',
  'main-character',
  'supporting-character',
  'opening-scene',
  'iconic',
  'obscure',
  'visual-only',
  'music-heavy',
  'spoiler',
  'credits',
  'intro',
  'verse',
  'chorus',
  'bridge',
  'riff',
  'silence',
  'fade',
  'instrumental'
]);
const ESCALATING_POINTS = Object.freeze([1000, 700, 400, 200, 0]);
const TV_POINTS = Object.freeze({
  show: 500,
  season: 200,
  episode: 300,
  episodeTitle: 200
});
const MIN_PLAYERS = 1;
const MAX_PLAYERS = 6;
const DEFAULT_GUESS_MS = 20000;
const DEFAULT_CLIP_SECONDS = 5;
const REVEAL_DWELL_MS = 8000;
const LOBBY_GO_MS = 2000;
const CONFIRM_COUNTDOWN_MS = 10000;
const FOLDER_NAME = 'glimpse';
const SCHEMA_VERSION = 1;

function poolToTypes(pool) {
  const p = String(pool || 'mixed').toLowerCase();
  if (p === 'music') return ['song'];
  if (p === 'movies') return ['movie'];
  if (p === 'television' || p === 'tv') return ['tv'];
  return ['song', 'movie', 'tv'];
}

module.exports = {
  MEDIA_TYPES,
  POOLS,
  CHALLENGE_TYPES,
  QUESTION_MODES,
  ACCEPTANCE_PRESETS,
  ROUND_INTENTS,
  PHASES,
  CLIP_TAGS,
  ESCALATING_POINTS,
  TV_POINTS,
  MIN_PLAYERS,
  MAX_PLAYERS,
  DEFAULT_GUESS_MS,
  DEFAULT_CLIP_SECONDS,
  REVEAL_DWELL_MS,
  LOBBY_GO_MS,
  CONFIRM_COUNTDOWN_MS,
  FOLDER_NAME,
  SCHEMA_VERSION,
  poolToTypes
};
