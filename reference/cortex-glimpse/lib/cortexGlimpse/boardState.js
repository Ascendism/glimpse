'use strict';

const COLS = 12;
const ROWS = 8;

const CATEGORY = {
  movie: 'MOVIE',
  song: 'SONG',
  tv: 'SHOW'
};

function cleanWords(title) {
  return String(title || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function chunkWord(word) {
  if (word.length <= COLS) return [word];
  const parts = [];
  for (let i = 0; i < word.length; i += COLS) parts.push(word.slice(i, i + COLS));
  return parts;
}

function layoutTitle(title) {
  const words = cleanWords(title).flatMap(chunkWord);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= COLS) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  const used = lines.slice(0, ROWS);
  const row0 = Math.max(0, Math.floor((ROWS - used.length) / 2));
  const cells = [];
  used.forEach((line, i) => {
    const row = row0 + i;
    const col0 = Math.floor((COLS - line.length) / 2);
    for (let j = 0; j < line.length; j += 1) {
      const ch = line[j];
      if (ch === ' ') continue;
      cells.push({ col: col0 + j, row, ch, kind: 'letter' });
    }
  });
  return cells;
}

function eraLabel(year) {
  const y = Number(year);
  if (!Number.isFinite(y) || y < 1000) return '';
  return String(Math.trunc(y));
}

function genreLabel(item) {
  const g = item && Array.isArray(item.genres) ? item.genres[0] : '';
  return String(g || '').trim().toUpperCase().slice(0, 10);
}

function publicBoard(input = {}) {
  const phase = String(input.phase || 'lobby');
  const item = input.item || (input.reveal ? input.reveal : null);
  const revealed = phase === 'reveal' || phase === 'judging';
  const type = (item && item.type) || (input.reveal && input.reveal.type) || '';
  const title = (item && item.title) || (input.reveal && input.reveal.title) || '';
  const laid = phase === 'lobby' || !title ? [] : layoutTitle(title);
  const cells = laid.map((c) => ({
    col: c.col,
    row: c.row,
    occupied: true,
    lit: revealed,
    ch: revealed ? c.ch : ''
  }));
  return {
    cols: COLS,
    rows: ROWS,
    phase,
    category: CATEGORY[type] || '',
    year: revealed ? eraLabel((input.reveal && input.reveal.year) || (item && item.year)) : '',
    genre: revealed ? genreLabel(item) : '',
    runtime: '',
    hints: Math.max(0, Number(input.clipIndex) || 0),
    cells
  };
}

module.exports = {
  COLS,
  ROWS,
  layoutTitle,
  publicBoard
};
