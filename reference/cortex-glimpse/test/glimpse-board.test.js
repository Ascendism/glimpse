'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { layoutTitle, publicBoard } = require('../lib/cortexGlimpse/boardState');

describe('glimpse archive board state', () => {
  it('lays a title onto the 12x8 wall without leaking punctuation', () => {
    const cells = layoutTitle('Terminator 2: Judgment Day');
    const letters = cells.filter((c) => c.kind === 'letter');
    assert.ok(letters.length >= 20);
    assert.ok(letters.every((c) => c.col >= 0 && c.col < 12 && c.row >= 0 && c.row < 8));
    assert.ok(letters.every((c) => /[A-Z0-9]/.test(c.ch)));
    assert.ok(letters.some((c) => c.ch === '2'));
    assert.ok(!letters.some((c) => c.ch === ':'));
  });

  it('wraps long titles onto multiple rows', () => {
    const cells = layoutTitle('THE SHAWSHANK REDEMPTION');
    const rows = new Set(cells.map((c) => c.row));
    assert.ok(rows.size >= 2);
  });

  it('hides letters while playing and shows word-shaped blanks', () => {
    const board = publicBoard({
      phase: 'playing',
      item: { title: 'Pulp Fiction', type: 'movie', year: 1994, genres: ['crime'] },
      clipIndex: 0
    });
    assert.equal(board.cols, 12);
    assert.equal(board.rows, 8);
    assert.equal(board.category, 'MOVIE');
    assert.equal(board.year, '');
    assert.equal(board.genre, '');
    assert.ok(board.cells.length > 0);
    assert.ok(board.cells.every((c) => c.ch === ''));
    assert.ok(board.cells.every((c) => c.lit === false));
    assert.ok(!JSON.stringify(board).includes('PULP'));
    assert.ok(!JSON.stringify(board).includes('FICTION'));
  });

  it('flips letters and side pods only on reveal', () => {
    const board = publicBoard({
      phase: 'reveal',
      item: { title: 'Pulp Fiction', type: 'movie', year: 1994, genres: ['crime'] },
      reveal: { title: 'Pulp Fiction', year: 1994, type: 'movie' },
      clipIndex: 1
    });
    const word = board.cells.map((c) => c.ch).join('');
    assert.match(word, /PULP/);
    assert.match(word, /FICTION/);
    assert.ok(board.cells.every((c) => c.lit === true));
    assert.equal(board.year, '1994');
    assert.equal(board.genre, 'CRIME');
    assert.equal(board.category, 'MOVIE');
    assert.equal(board.hints, 1);
  });

  it('is empty in lobby', () => {
    const board = publicBoard({ phase: 'lobby' });
    assert.deepEqual(board.cells, []);
    assert.equal(board.category, '');
  });
});
