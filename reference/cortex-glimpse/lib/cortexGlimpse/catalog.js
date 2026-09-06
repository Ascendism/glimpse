'use strict';

const { normalizeMediaItem } = require('./mediaItem');
const { DEAD_YOUTUBE_IDS } = require('./deadYouTubeIds');

function clip(id, start, end, difficulty, tags) {
  return {
    id,
    startTime: start,
    endTime: end,
    difficulty,
    informationDensity: Math.max(0.1, 1 - difficulty),
    spoilerRisk: tags.includes('spoiler') ? 0.8 : 0.1,
    tags
  };
}

function item(partial) {
  return normalizeMediaItem(partial);
}

const SEED_RICH = [
  item({
    id: 'song:metallica-enter-sandman',
    type: 'song',
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica',
    year: 1991,
    era: '1990s',
    genres: ['metal'],
    aliases: ['Enter Sandman', 'Enter the Sandman', 'Sandman'],
    cues: ['heavy metal sandman', 'exit light enter night'],
    people: ['Metallica', 'James Hetfield', 'Kirk Hammett'],
    candidateClips: [
      clip('s1', 0, 8, 0.85, ['intro', 'fade']),
      clip('s2', 18, 26, 0.35, ['riff', 'iconic']),
      clip('s3', 55, 63, 0.2, ['chorus', 'iconic']),
      clip('s4', 142, 150, 0.72, ['bridge', 'obscure'])
    ]
  }),
  item({
    id: 'song:tbdm-horrible-night',
    type: 'song',
    title: 'What a Horrible Night to Have a Curse',
    artist: 'The Black Dahlia Murder',
    album: 'Nocturnal',
    year: 2007,
    era: '2000s',
    genres: ['metal', 'melodic death metal'],
    aliases: ['Horrible Night to Have a Curse', 'What a Horrible Night'],
    cues: ['black dahlia horrible night', 'castlevania quote metal'],
    people: ['The Black Dahlia Murder', 'Trevor Strnad'],
    candidateClips: [
      clip('b1', 12, 20, 0.4, ['riff', 'iconic']),
      clip('b2', 48, 56, 0.28, ['chorus']),
      clip('b3', 110, 118, 0.7, ['bridge', 'obscure'])
    ]
  }),
  item({
    id: 'song:darude-sandstorm',
    type: 'song',
    title: 'Sandstorm',
    artist: 'Darude',
    year: 1999,
    era: '1990s',
    genres: ['electronic', 'trance'],
    aliases: ['Sand Storm'],
    cues: ['dudududu', 'dududududu', 'old meme techno', 'finnish guy', 'meme techno song'],
    people: ['Darude'],
    candidateClips: [
      clip('d1', 20, 28, 0.15, ['riff', 'iconic']),
      clip('d2', 55, 63, 0.25, ['chorus', 'iconic']),
      clip('d3', 140, 148, 0.62, ['bridge'])
    ]
  }),
  item({
    id: 'movie:terminator-2',
    type: 'movie',
    title: 'Terminator 2: Judgment Day',
    year: 1991,
    era: '1990s',
    franchise: 'Terminator',
    director: 'James Cameron',
    genres: ['sci-fi', 'action'],
    aliases: ['Terminator 2', 'T2', 'T2 Judgment Day', 'the second Terminator movie'],
    cues: ['liquid metal guy', 't-1000', 'arnold vs the t-1000', 'cop made of mercury', 'mercury cop'],
    people: ['Arnold Schwarzenegger', 'James Cameron', 'Linda Hamilton', 'Robert Patrick'],
    cast: ['Arnold Schwarzenegger', 'Linda Hamilton', 'Robert Patrick'],
    characters: ['T-800', 'T-1000', 'Sarah Connor', 'John Connor'],
    candidateClips: [
      clip('t1', 12, 20, 0.9, ['credits', 'fade']),
      clip('t2', 240, 248, 0.35, ['action', 'iconic', 'main-character']),
      clip('t3', 540, 548, 0.55, ['dialogue', 'main-character']),
      clip('t4', 720, 728, 0.68, ['action', 'obscure'])
    ]
  }),
  item({
    id: 'movie:predator',
    type: 'movie',
    title: 'Predator',
    year: 1987,
    era: '1980s',
    franchise: 'Predator',
    director: 'John McTiernan',
    genres: ['action', 'sci-fi'],
    aliases: ['The Predator'],
    cues: ['if it bleeds we can kill it', 'jungle camouflage hunter'],
    people: ['Arnold Schwarzenegger', 'John McTiernan', 'Carl Weathers'],
    cast: ['Arnold Schwarzenegger', 'Carl Weathers'],
    candidateClips: [
      clip('p1', 80, 88, 0.4, ['action', 'iconic']),
      clip('p2', 300, 308, 0.55, ['dialogue']),
      clip('p3', 520, 528, 0.72, ['obscure'])
    ]
  }),
  item({
    id: 'movie:total-recall',
    type: 'movie',
    title: 'Total Recall',
    year: 1990,
    era: '1990s',
    director: 'Paul Verhoeven',
    genres: ['sci-fi', 'action'],
    aliases: [],
    cues: ['mars implant memory', 'get your ass to mars'],
    people: ['Arnold Schwarzenegger', 'Paul Verhoeven', 'Sharon Stone'],
    cast: ['Arnold Schwarzenegger', 'Sharon Stone'],
    candidateClips: [clip('tr1', 200, 208, 0.45, ['action', 'iconic'])]
  }),
  item({
    id: 'movie:true-lies',
    type: 'movie',
    title: 'True Lies',
    year: 1994,
    era: '1990s',
    director: 'James Cameron',
    genres: ['action', 'comedy'],
    people: ['Arnold Schwarzenegger', 'James Cameron', 'Jamie Lee Curtis'],
    cast: ['Arnold Schwarzenegger', 'Jamie Lee Curtis'],
    candidateClips: [clip('tl1', 400, 408, 0.5, ['action'])]
  }),
  item({
    id: 'movie:the-running-man',
    type: 'movie',
    title: 'The Running Man',
    year: 1987,
    era: '1980s',
    director: 'Paul Michael Glaser',
    genres: ['sci-fi', 'action'],
    people: ['Arnold Schwarzenegger'],
    cast: ['Arnold Schwarzenegger'],
    candidateClips: [clip('rm1', 180, 188, 0.55, ['action'])]
  }),
  item({
    id: 'movie:commando',
    type: 'movie',
    title: 'Commando',
    year: 1985,
    era: '1980s',
    director: 'Mark L. Lester',
    genres: ['action'],
    people: ['Arnold Schwarzenegger'],
    cast: ['Arnold Schwarzenegger'],
    candidateClips: [clip('co1', 90, 98, 0.5, ['action'])]
  }),
  item({
    id: 'movie:alien',
    type: 'movie',
    title: 'Alien',
    year: 1979,
    era: '1970s',
    franchise: 'Alien',
    director: 'Ridley Scott',
    genres: ['sci-fi', 'horror'],
    aliases: ['the Ridley Scott space horror'],
    cues: ['ridley scott space horror', 'sigourney weaver and the alien', 'in space no one can hear you scream'],
    people: ['Ridley Scott', 'Sigourney Weaver'],
    cast: ['Sigourney Weaver'],
    characters: ['Ellen Ripley', 'Xenomorph'],
    candidateClips: [
      clip('al1', 60, 68, 0.5, ['opening-scene']),
      clip('al2', 420, 428, 0.35, ['iconic', 'main-character'])
    ]
  }),
  item({
    id: 'movie:the-thing',
    type: 'movie',
    title: 'The Thing',
    year: 1982,
    era: '1980s',
    director: 'John Carpenter',
    genres: ['horror', 'sci-fi'],
    cues: ['antarctic camp', 'dog splits open', 'blood test movie'],
    people: ['John Carpenter', 'Kurt Russell'],
    cast: ['Kurt Russell'],
    candidateClips: [clip('th1', 200, 208, 0.45, ['iconic'])]
  }),
  item({
    id: 'movie:heat',
    type: 'movie',
    title: 'Heat',
    year: 1995,
    era: '1990s',
    director: 'Michael Mann',
    genres: ['crime', 'action'],
    people: ['Al Pacino', 'Robert De Niro', 'Michael Mann'],
    cast: ['Al Pacino', 'Robert De Niro'],
    confusableWith: ['Scarface'],
    cues: ['pacino deniro diner', 'downtown la shootout'],
    candidateClips: [clip('he1', 300, 308, 0.5, ['action', 'iconic'])]
  }),
  item({
    id: 'movie:lotr-fellowship',
    type: 'movie',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    year: 2001,
    era: '2000s',
    franchise: 'The Lord of the Rings',
    director: 'Peter Jackson',
    genres: ['fantasy', 'adventure'],
    aliases: ['Fellowship of the Ring', 'LOTR Fellowship', 'LOTR 1'],
    people: ['Peter Jackson', 'Elijah Wood', 'Ian McKellen'],
    cast: ['Elijah Wood', 'Ian McKellen', 'Viggo Mortensen'],
    candidateClips: [clip('lf1', 240, 248, 0.4, ['iconic'])]
  }),
  item({
    id: 'tv:breaking-bad-crawl-space',
    type: 'tv',
    title: 'Crawl Space',
    series: 'Breaking Bad',
    season: 4,
    episode: 11,
    episodeTitle: 'Crawl Space',
    year: 2011,
    era: '2010s',
    franchise: 'Breaking Bad',
    genres: ['drama', 'crime'],
    aliases: ['Breaking Bad Crawl Space', 'S4E11', 'Season 4 Episode 11'],
    cues: ['walter white laughing in the crawl space', 'walter desert'],
    people: ['Bryan Cranston', 'Aaron Paul', 'Vince Gilligan'],
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
    characters: ['Walter White', 'Jesse Pinkman', 'Skyler White'],
    candidateClips: [
      clip('bb1', 2400, 2408, 0.35, ['iconic', 'main-character']),
      clip('bb2', 80, 88, 0.55, ['dialogue'])
    ]
  }),
  item({
    id: 'tv:star-trek-tng-best-of-both',
    type: 'tv',
    title: 'The Best of Both Worlds',
    series: 'Star Trek: The Next Generation',
    season: 3,
    episode: 26,
    episodeTitle: 'The Best of Both Worlds',
    year: 1990,
    era: '1990s',
    franchise: 'Star Trek',
    genres: ['sci-fi'],
    aliases: ['TNG', 'Star Trek TNG', 'Best of Both Worlds'],
    people: ['Patrick Stewart'],
    cast: ['Patrick Stewart', 'Jonathan Frakes'],
    characters: ['Jean-Luc Picard', 'Locutus'],
    candidateClips: [clip('st1', 2400, 2408, 0.4, ['iconic'])]
  }),
  item({
    id: 'movie:matrix',
    type: 'movie',
    title: 'The Matrix',
    year: 1999,
    era: '1990s',
    franchise: 'The Matrix',
    director: 'Lana Wachowski',
    genres: ['sci-fi', 'action'],
    aliases: ['Matrix'],
    cues: ['club scene matrix', 'red pill', 'bullet time'],
    people: ['Keanu Reeves', 'Carrie-Anne Moss', 'Laurence Fishburne'],
    cast: ['Keanu Reeves', 'Carrie-Anne Moss', 'Laurence Fishburne'],
    candidateClips: [clip('mx1', 90, 98, 0.35, ['iconic', 'music-heavy'])]
  }),
  item({
    id: 'song:queen-bohemian',
    type: 'song',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    year: 1975,
    era: '1970s',
    genres: ['rock'],
    aliases: ['Bohemian Rap City'],
    cues: ['galileo figaro', 'is this the real life', 'mama just killed a man'],
    people: ['Queen', 'Freddie Mercury'],
    candidateClips: [
      clip('q1', 8, 16, 0.35, ['intro', 'iconic']),
      clip('q2', 180, 188, 0.2, ['chorus', 'iconic']),
      clip('q3', 240, 248, 0.55, ['bridge'])
    ]
  }),
  item({
    id: 'song:nirvana-smells',
    type: 'song',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    year: 1991,
    era: '1990s',
    genres: ['grunge', 'rock'],
    aliases: ['Teen Spirit'],
    cues: ['with the lights out its less dangerous', 'hello hello hello'],
    people: ['Nirvana', 'Kurt Cobain'],
    candidateClips: [clip('n1', 20, 28, 0.2, ['riff', 'iconic']), clip('n2', 60, 68, 0.35, ['chorus'])]
  }),
  item({
    id: 'movie:pulp-fiction',
    type: 'movie',
    title: 'Pulp Fiction',
    year: 1994,
    era: '1990s',
    director: 'Quentin Tarantino',
    genres: ['crime'],
    cues: ['royale with cheese', 'briefcase glow', 'twist contest'],
    people: ['Quentin Tarantino', 'John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
    cast: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
    candidateClips: [clip('pf1', 200, 208, 0.4, ['dialogue', 'iconic'])]
  }),
  item({
    id: 'movie:jaws',
    type: 'movie',
    title: 'Jaws',
    year: 1975,
    era: '1970s',
    director: 'Steven Spielberg',
    genres: ['thriller'],
    cues: ['duunnn dunnn', 'youre gonna need a bigger boat'],
    people: ['Steven Spielberg', 'Roy Scheider'],
    candidateClips: [clip('jw1', 40, 48, 0.25, ['iconic', 'music-heavy'])]
  }),
  item({
    id: 'tv:the-office-dinner-party',
    type: 'tv',
    title: 'Dinner Party',
    series: 'The Office',
    season: 4,
    episode: 13,
    episodeTitle: 'Dinner Party',
    year: 2008,
    era: '2000s',
    franchise: 'The Office',
    genres: ['comedy', 'sitcom'],
    aliases: ['Office Dinner Party'],
    cues: ['foine', 'jan lemon', 'dundie'],
    people: ['Steve Carell', 'Rainn Wilson'],
    cast: ['Steve Carell', 'Rainn Wilson', 'John Krasinski'],
    characters: ['Michael Scott', 'Jan Levinson'],
    candidateClips: [clip('of1', 600, 608, 0.35, ['iconic', 'dialogue'])]
  }),
  item({
    id: 'tv:sopranos-pine-barrens',
    type: 'tv',
    title: 'Pine Barrens',
    series: 'The Sopranos',
    season: 3,
    episode: 11,
    episodeTitle: 'Pine Barrens',
    year: 2001,
    era: '2000s',
    franchise: 'The Sopranos',
    genres: ['drama', 'crime'],
    cues: ['gabagool woods', 'paulie and christopher lost in the woods'],
    people: ['James Gandolfini', 'Michael Imperioli', 'Tony Sirico'],
    cast: ['James Gandolfini', 'Michael Imperioli', 'Tony Sirico'],
    characters: ['Tony Soprano', 'Paulie', 'Christopher'],
    candidateClips: [clip('sp1', 1800, 1808, 0.4, ['iconic'])]
  })
];

const { SONGS } = require('./seedPack');
const { MOVIES, TV } = require('./seedPackScreen');

const BY_ID = new Map(SEED_RICH.map((x) => [x.id, x]));

const YT_IDS = {
  'song:metallica-enter-sandman': 'CD-EBM7QAM0',
  'song:tbdm-horrible-night': 'mEACzoMJuMA',
  'song:darude-sandstorm': 'y6120QOlsfU',
  'song:queen-bohemian': 'fJ9rUzIMcZQ',
  'song:nirvana-smells': 'hTWKbfoikeg',
  'movie:terminator-2': 'lwSysg9o7wE',
  'movie:predator': 'X2hTY_LZy18',
  'movie:total-recall': 'Mw1V8wxtnA0',
  'movie:true-lies': 'e94VCq6rzyE',
  'movie:the-running-man': 'g_QHzV3NVPk',
  'movie:commando': 'pPhISgw3I2w',
  'movie:alien': 'LjLamj-b0I8',
  'movie:the-thing': '5ftmr17M-a4',
  'movie:heat': 'PpAhjOvQVj0',
  'movie:lotr-fellowship': 'V75dMMIW2B4',
  'movie:matrix': 'vKQi3bBA1y8',
  'movie:pulp-fiction': 's7EdQ4FqbhY',
  'movie:jaws': 'U1fu_sA7XhE',
  'tv:breaking-bad-crawl-space': 'HhesaQXLuRY',
  'tv:star-trek-tng-best-of-both': 'AYy8o4nXZEY',
  'tv:the-office-dinner-party': 'af0GMFIlb4Q',
  'tv:sopranos-pine-barrens': 'PLMDSKDJFH4'
};

function ytOk(id) {
  if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id)) return false;
  // Check blacklist of known bad IDs
  if (id === 'kYzz0FSgpSU' || id === '3kYzz0FSgpS') return false;
  // Check full dead ID set
  if (DEAD_YOUTUBE_IDS.has(id)) return false;
  return true;
}

function eraOf(year) {
  const y = Number(year);
  if (!Number.isFinite(y)) return null;
  return `${Math.floor(y / 10) * 10}s`;
}

function sourceOf(yt) {
  return { kind: 'youtube', youtubeVideoId: yt, url: `https://www.youtube.com/watch?v=${yt}` };
}

function songClips() {
  return [
    clip('s1', 18, 26, 0.35, ['riff', 'iconic']),
    clip('s2', 48, 56, 0.22, ['chorus', 'iconic']),
    clip('s3', 90, 98, 0.55, ['verse']),
    clip('s4', 130, 138, 0.72, ['obscure'])
  ];
}

function trailerClips() {
  return [
    clip('tr1', 8, 16, 0.4, ['iconic']),
    clip('tr2', 22, 30, 0.3, ['iconic', 'action']),
    clip('tr3', 42, 50, 0.55, ['dialogue']),
    clip('tr4', 58, 66, 0.7, ['obscure'])
  ];
}

function playableClips(it) {
  const BAD = new Set(['silence', 'fade', 'credits']);
  let clips = (it.candidateClips || []).map((c) => ({ ...c, tags: [...(c.tags || [])] }));
  if (it.type !== 'song') {
    const inRange = clips.filter(
      (c) => Number(c.endTime) <= 90 && !(c.tags || []).some((t) => BAD.has(t))
    );
    clips = inRange.length ? inRange : trailerClips();
  } else if (!clips.length) {
    clips = songClips();
  }
  return clips;
}

function expandSong(row) {
  if (!Array.isArray(row) || row.length < 5) return null;
  const [slug, title, artist, year, yt, genres, aliases, cues] = row;
  if (!ytOk(yt) || !slug || !title) return null;
  return item({
    id: `song:${slug}`,
    type: 'song',
    title,
    artist,
    year,
    era: eraOf(year),
    genres: genres || [],
    aliases: aliases || [],
    cues: cues || [],
    people: artist ? [artist] : [],
    source: sourceOf(yt),
    candidateClips: songClips()
  });
}

function expandMovie(row) {
  if (!Array.isArray(row) || row.length < 5) return null;
  const [slug, title, year, director, yt, genres, aliases, cues, people] = row;
  if (!ytOk(yt) || !slug || !title) return null;
  return item({
    id: `movie:${slug}`,
    type: 'movie',
    title,
    year,
    director,
    era: eraOf(year),
    genres: genres || [],
    aliases: aliases || [],
    cues: cues || [],
    people: [director, ...(people || [])].filter(Boolean),
    cast: people || [],
    source: sourceOf(yt),
    candidateClips: trailerClips()
  });
}

function expandTv(row) {
  if (!Array.isArray(row) || row.length < 7) return null;
  const [slug, series, episodeTitle, season, episode, year, yt, genres, aliases, cues, people] = row;
  if (!ytOk(yt) || !slug || !series) return null;
  const peopleList = typeof people === 'string' ? [people] : people || [];
  return item({
    id: `tv:${slug}`,
    type: 'tv',
    title: episodeTitle || series,
    series,
    season,
    episode,
    episodeTitle,
    year,
    era: eraOf(year),
    franchise: series,
    genres: genres || [],
    aliases: aliases || [],
    cues: cues || [],
    people: peopleList,
    cast: peopleList,
    source: sourceOf(yt),
    candidateClips: trailerClips()
  });
}

// Build final SEED: combine rich overlay + expanded seed packs, filter dead IDs
const SEED_EXPANDED_SONGS = SONGS.map(expandSong).filter(Boolean);
const SEED_EXPANDED_MOVIES = MOVIES.map(expandMovie).filter(Boolean);
const SEED_EXPANDED_TV = TV.map(expandTv).filter(Boolean);

const SEED = [...SEED_RICH, ...SEED_EXPANDED_SONGS, ...SEED_EXPANDED_MOVIES, ...SEED_EXPANDED_TV].filter((it) => {
  const yt = it && it.source && it.source.youtubeVideoId;
  return yt && !DEAD_YOUTUBE_IDS.has(yt);
});

function uniq(list) {
  return [...new Set((list || []).filter(Boolean))];
}

function overlayRich(base, rich) {
  const yt =
    (rich.source && rich.source.youtubeVideoId) ||
    (base && base.source && base.source.youtubeVideoId) ||
    YT_IDS[rich.id];
  if (!ytOk(yt)) return base || null;
  const merged = {
    ...(base || {}),
    ...rich,
    source: rich.source && rich.source.youtubeVideoId ? rich.source : sourceOf(yt),
    aliases: uniq([...(base ? base.aliases : []), ...(rich.aliases || [])]),
    cues: uniq([...(base ? base.cues : []), ...(rich.cues || [])]),
    people: uniq([...(base ? base.people : []), ...(rich.people || [])])
  };
  merged.candidateClips = playableClips(merged);
  return item(merged);
}

function buildCatalog() {
  const byId = new Map();
  for (const row of SONGS) {
    const it = expandSong(row);
    if (it) byId.set(it.id, it);
  }
  for (const row of MOVIES) {
    const it = expandMovie(row);
    if (it) byId.set(it.id, it);
  }
  for (const row of TV) {
    const it = expandTv(row);
    if (it) byId.set(it.id, it);
  }
  for (const rich of SEED_RICH) {
    const next = overlayRich(byId.get(rich.id), rich);
    if (next) byId.set(next.id, next);
  }
  return [...byId.values()];
}

let CATALOG = null;

function seedCatalog() {
  if (!CATALOG) CATALOG = buildCatalog();
  return CATALOG.map((x) => ({
    ...x,
    candidateClips: x.candidateClips.map((c) => ({ ...c, tags: [...c.tags] }))
  }));
}

function findCatalogItem(id) {
  if (!CATALOG) CATALOG = buildCatalog();
  const hit = CATALOG.find((x) => x.id === String(id || '')) || BY_ID.get(String(id || ''));
  if (!hit) return null;
  const sourced = overlayRich(hit, hit);
  return sourced
    ? { ...sourced, candidateClips: sourced.candidateClips.map((c) => ({ ...c, tags: [...c.tags] })) }
    : null;
}

function queryCatalog(opts = {}, items) {
  let out = items || seedCatalog();
  const pool = String(opts.pool || opts.type || '').toLowerCase();
  if (pool === 'music' || pool === 'song' || pool === 'songs') out = out.filter((i) => i.type === 'song');
  else if (pool === 'movies' || pool === 'movie') out = out.filter((i) => i.type === 'movie');
  else if (pool === 'television' || pool === 'tv') out = out.filter((i) => i.type === 'tv');
  const genre = opts.genre ? String(opts.genre).toLowerCase() : '';
  if (genre) out = out.filter((i) => (i.genres || []).some((g) => String(g).toLowerCase() === genre));
  const era = opts.era ? String(opts.era) : '';
  if (era) out = out.filter((i) => i.era === era);
  const sort = String(opts.sort || 'title').toLowerCase();
  const dir = opts.dir === 'desc' ? -1 : 1;
  out = [...out].sort((a, b) => {
    if (sort === 'year') return dir * ((Number(a.year) || 0) - (Number(b.year) || 0));
    if (sort === 'type') return dir * String(a.type).localeCompare(String(b.type));
    if (sort === 'artist') {
      const aa = String(a.artist || a.director || a.series || '');
      const bb = String(b.artist || b.director || b.series || '');
      return dir * aa.localeCompare(bb);
    }
    return dir * String(a.title).localeCompare(String(b.title));
  });
  return out;
}

function catalogForPool(pool) {
  return queryCatalog({ pool });
}

function catalogFacets(items) {
  const list = items || seedCatalog();
  const genres = new Set();
  const eras = new Set();
  const types = { song: 0, movie: 0, tv: 0 };
  for (const i of list) {
    types[i.type] = (types[i.type] || 0) + 1;
    for (const g of i.genres || []) genres.add(g);
    if (i.era) eras.add(i.era);
  }
  return {
    count: list.length,
    types,
    genres: [...genres].sort(),
    eras: [...eras].sort()
  };
}

module.exports = {
  seedCatalog,
  findCatalogItem,
  catalogForPool,
  queryCatalog,
  catalogFacets
};
