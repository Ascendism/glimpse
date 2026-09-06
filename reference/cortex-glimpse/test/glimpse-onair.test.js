'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { packOnAir, interpretAgentCopy } = require('../lib/cortexGlimpse/onAirCopy');

describe('glimpse on-air copy', () => {
  it('slams the reveal title as words, not a prose dump', () => {
    const packed = packOnAir({
      phase: 'reveal',
      reveal: { title: 'Terminator 2: Judgment Day', year: 1991, director: 'James Cameron' },
      lastScores: [
        { displayName: 'Ada', points: 1000, acceptable: true, interpretation: 'CLOSE ENOUGH\nliquid metal cop energy' },
        { displayName: 'Sam', points: 0, acceptable: false, guess: 'predator' }
      ]
    });
    assert.equal(packed.beats.some((b) => b.role === 'slam' && /Terminator/.test(b.text)), true);
    assert.equal(packed.beats.some((b) => b.role === 'hit' && /Ada/.test(b.text)), true);
    assert.equal(packed.beats.some((b) => b.role === 'miss' && /predator/.test(b.text)), true);
    const agent = packed.beats.filter((b) => b.tone === 'agent' || b.role === 'kicker' || b.role === 'agent');
    assert.ok(agent.length >= 1);
  });

  it('interprets agent copy into kicker / slam / desk lines', () => {
    const beats = interpretAgentCopy('BREAKING\n"That riff is Sandstorm"\nA long desk note that should ride the chyron because it is too long for a slam title.');
    assert.equal(beats[0].role, 'kicker');
    assert.equal(beats[1].role, 'slam');
    assert.equal(beats[2].role, 'agent');
  });
});
