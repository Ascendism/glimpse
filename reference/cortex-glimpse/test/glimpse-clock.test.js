'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  scheduleRound,
  beatAt,
  planPlayback,
  PRE_ROLL_MS,
  GUESS_AFTER_CLIP_MS
} = require('../lib/cortexGlimpse/roundClock');

describe('glimpse round clock', () => {
  it('schedules countdown, then clip, then guess, then closed', () => {
    const now = 1_000_000;
    const clip = { startTime: 10, endTime: 18 };
    const s = scheduleRound(now, clip);
    assert.equal(s.playAt, now + PRE_ROLL_MS);
    assert.equal(s.clipEndsAt, s.playAt + s.clipDuration * 1000);
    assert.ok(s.guessUntil >= s.clipEndsAt + GUESS_AFTER_CLIP_MS);
    assert.equal(beatAt(now, s), 'countdown');
    assert.equal(beatAt(s.playAt, s), 'clip');
    assert.equal(beatAt(s.clipEndsAt, s), 'guessing');
    assert.equal(beatAt(s.guessUntil, s), 'closed');
  });

  it('late clients seek into the window instead of restarting the clip', () => {
    const playAt = 10_000;
    const spec = {
      playAt,
      start: 12,
      duration: 8,
      clipEndsAt: playAt + 8000,
      serverNow: 12_000,
      receivedAt: 12_000
    };
    const plan = planPlayback(spec, 12_000);
    assert.equal(plan.action, 'play');
    assert.equal(plan.seek, 14);
    assert.equal(plan.remaining, 6000);
  });

  it('waits when the table is still in pre-roll', () => {
    const playAt = 5_000;
    const spec = {
      playAt,
      start: 3,
      duration: 8,
      clipEndsAt: playAt + 8000,
      serverNow: 4_000,
      receivedAt: 4_000
    };
    const plan = planPlayback(spec, 4_000);
    assert.equal(plan.action, 'wait');
    assert.equal(plan.delay, 1000);
    assert.equal(plan.seek, 3);
  });

  it('plays every catalog window for the same duration', () => {
    const { DEFAULT_CLIP_SECONDS } = require('../lib/cortexGlimpse/constants');
    const long = scheduleRound(0, { startTime: 10, endTime: 18 });
    const short = scheduleRound(0, { startTime: 40, endTime: 43 });
    assert.equal(long.clipDuration, DEFAULT_CLIP_SECONDS);
    assert.equal(short.clipDuration, DEFAULT_CLIP_SECONDS);
    assert.equal(long.clipEndsAt - long.playAt, short.clipEndsAt - short.playAt);
  });
});
