'use strict';

const fs = require('fs');
const path = require('path');

const FAKE = new Set(['kYzz0FSgpSU', '3kYzz0FSgpS']);
const DIR = path.join(__dirname, '..', 'lib', 'cortexGlimpse');

function ytOk(id) {
  return typeof id === 'string' && /^[\w-]{11}$/.test(id) && !FAKE.has(id);
}

function slugOk(slug) {
  const s = String(slug || '');
  if (!s) return false;
  return !/(skip|already|end-tv|end-movies|end-batch|end-ok|dup-skip)/i.test(s);
}

function songOk(row) {
  return Array.isArray(row) && row.length >= 5 && slugOk(row[0]) && ytOk(row[4]) && row[1];
}

function movieOk(row) {
  return Array.isArray(row) && row.length >= 5 && slugOk(row[0]) && ytOk(row[4]) && row[1];
}

function tvOk(row) {
  return Array.isArray(row) && row.length >= 7 && slugOk(row[0]) && ytOk(row[6]) && row[1];
}

function writeModule(file, exportsObj) {
  const parts = Object.entries(exportsObj).map(
    ([k, v]) => `const ${k} = ${JSON.stringify(v, null, 2)};`
  );
  const keys = Object.keys(exportsObj).join(', ');
  fs.writeFileSync(
    file,
    `'use strict';\n\n${parts.join('\n\n')}\n\nmodule.exports = { ${keys} };\n`
  );
}

function dedupe(rows, idIndex) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const id = row[idIndex];
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(row);
  }
  return out;
}

const songs = require(path.join(DIR, 'seedPack.js'));
const songs2 = require(path.join(DIR, 'seedPackSongs2.js'));
const screen = require(path.join(DIR, 'seedPackScreen.js'));
const m2 = require(path.join(DIR, 'seedPackMovies2.js'));
const m3 = require(path.join(DIR, 'seedPackMovies3.js'));
const m4 = require(path.join(DIR, 'seedPackMovies4.js'));
const m5 = require(path.join(DIR, 'seedPackMovies5.js'));
const tv2 = require(path.join(DIR, 'seedPackTv2.js'));

const SONGS = dedupe([...songs.SONGS, ...songs2.SONGS_MORE].filter(songOk), 0);
const MOVIES = dedupe(
  [...screen.MOVIES, ...m2.MOVIES_MORE, ...m3.MOVIES_MORE_B, ...m4.MOVIES_MORE_C, ...m5.MOVIES_MORE_D].filter(movieOk),
  0
);
const TV = dedupe([...screen.TV, ...tv2.TV_MORE].filter(tvOk), 0);

writeModule(path.join(DIR, 'seedPack.js'), { SONGS });
writeModule(path.join(DIR, 'seedPackScreen.js'), { MOVIES, TV });

for (const extra of ['seedPackSongs2.js', 'seedPackMovies2.js', 'seedPackMovies3.js', 'seedPackMovies4.js', 'seedPackMovies5.js', 'seedPackTv2.js']) {
  fs.unlinkSync(path.join(DIR, extra));
}

process.stdout.write(JSON.stringify({ songs: SONGS.length, movies: MOVIES.length, tv: TV.length, total: SONGS.length + MOVIES.length + TV.length }) + '\n');
