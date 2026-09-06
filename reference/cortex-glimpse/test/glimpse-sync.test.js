'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { planPlayback, isSaneTime, calculateDriftCorrection } = require('../lib/cortexGlimpse/videoSync');

describe('Glimpse video sync', () => {
  it('planPlayback calculates correct seek position for all states', () => {
    // Test 1: Before playback starts (wait)
    const spec1 = {
      playAt: 10000,
      start: 0,
      duration: 8,
      clipEndsAt: 18000,
      receivedAt: 9000,
      serverNow: 9000
    };
    const plan1 = planPlayback(spec1, 9500);
    assert.equal(plan1.action, 'wait');
    assert.equal(plan1.delay, 500);
    assert.equal(plan1.seek, 0);

    // Test 2: During playback (2 seconds in)
    const plan2 = planPlayback(spec1, 12000);
    assert.equal(plan2.action, 'play');
    assert.equal(plan2.seek, 2);
    assert.ok(plan2.remaining > 0);

    // Test 3: After clip ends (stop)
    const plan3 = planPlayback(spec1, 19000);
    assert.equal(plan3.action, 'stop');

    // Test 4: Late joiner (joins 3 seconds after playback started)
    const spec2 = {
      playAt: 10000,
      start: 0,
      duration: 8,
      clipEndsAt: 18000,
      receivedAt: 13000,
      serverNow: 13000
    };
    const plan4 = planPlayback(spec2, 13000);
    assert.equal(plan4.action, 'play');
    assert.equal(plan4.seek, 3);

    // Test 5: Clock skew correction
    const spec3 = {
      playAt: 10000,
      start: 0,
      duration: 8,
      clipEndsAt: 18000,
      receivedAt: 9500,
      serverNow: 9000
    };
    const plan5 = planPlayback(spec3, 12500);
    assert.equal(plan5.action, 'play');
    assert.equal(plan5.seek, 2); // Adjusted for 500ms skew
  });

  it('isSaneTime detects invalid player states (buffering)', () => {
    // Sane values
    assert.ok(isSaneTime(2.0, 2.0, 10));
    assert.ok(isSaneTime(2.1, 2.0, 10));
    assert.ok(isSaneTime(5.5, 5.0, 10));

    // Invalid: zero or negative (buffering)
    assert.equal(isSaneTime(0, 2.0, 10), false);
    assert.equal(isSaneTime(-1, 2.0, 10), false);

    // Invalid: NaN
    assert.equal(isSaneTime(NaN, 2.0, 10), false);
    assert.equal(isSaneTime(Infinity, 2.0, 10), false);

    // Invalid: wildly off from expected (drift > duration)
    assert.equal(isSaneTime(500, 2.0, 10), false);
    assert.equal(isSaneTime(20, 2.0, 10), false);
  });

  it('isSaneTime handles offset clips correctly', () => {
    // Offset clip: expected=45s (clip starts 45s into video), duration=8s
    // current=45.2 should be SANE (only 0.2s drift)
    assert.ok(isSaneTime(45.2, 45.0, 8));
    assert.ok(isSaneTime(44.8, 45.0, 8));
    assert.ok(isSaneTime(45.5, 45.0, 8));
    
    // Large drift from expected should still be insane
    assert.equal(isSaneTime(55.0, 45.0, 8), false); // 10s drift > 8s duration
    assert.equal(isSaneTime(35.0, 45.0, 8), false); // 10s drift > 8s duration
    
    // Edge case: right at the boundary
    assert.ok(isSaneTime(52.9, 45.0, 8)); // 7.9s drift, just under 8s
    assert.equal(isSaneTime(53.1, 45.0, 8), false); // 8.1s drift, over 8s
  });

  it('calculateDriftCorrection: offset clip correction works', () => {
    // Offset clip at 45s, small drift should trigger nudge
    const offsetNudge = calculateDriftCorrection(45.2, 45.0, 8, true);
    assert.equal(offsetNudge.action, 'nudge');
    assert.ok(Math.abs(offsetNudge.drift - 0.2) < 0.01);
    
    // Offset clip at 45s, large drift should trigger seek
    const offsetSeek = calculateDriftCorrection(46.5, 45.0, 8, true);
    assert.equal(offsetSeek.action, 'seek');
    assert.equal(offsetSeek.seek, 45.0);
  });

  it('calculateDriftCorrection: below threshold no seek', () => {
    // No correction needed (< 150ms drift)
    const noCorrect = calculateDriftCorrection(2.0, 2.0, 8, true);
    assert.equal(noCorrect.action, 'none');

    const smallDrift = calculateDriftCorrection(2.1, 2.0, 8, true);
    assert.equal(smallDrift.action, 'none');

    const justBelow = calculateDriftCorrection(2.14, 2.0, 8, true);
    assert.equal(justBelow.action, 'none');
  });

  it('calculateDriftCorrection: above threshold triggers correction', () => {
    // Nudge for medium drift (150ms - 1s)
    const mediumDrift = calculateDriftCorrection(2.3, 2.0, 8, true);
    assert.equal(mediumDrift.action, 'nudge');
    assert.ok(mediumDrift.rate < 1.0); // Should slow down (ahead)
    assert.ok(Math.abs(mediumDrift.drift - 0.3) < 0.01);

    const mediumBehind = calculateDriftCorrection(1.7, 2.0, 8, true);
    assert.equal(mediumBehind.action, 'nudge');
    assert.ok(mediumBehind.rate > 1.0); // Should speed up (behind)

    // Seek for large drift (>= 1s)
    const largeDrift = calculateDriftCorrection(3.5, 2.0, 8, true);
    assert.equal(largeDrift.action, 'seek');
    assert.equal(largeDrift.seek, 2.0);
    assert.ok(Math.abs(largeDrift.drift - 1.5) < 0.01);
  });

  it('calculateDriftCorrection: skip when buffering', () => {
    // No correction when currentTime is insane (buffering)
    const buffering = calculateDriftCorrection(0, 2.0, 8, true);
    assert.equal(buffering.action, 'none');

    const bufferingNaN = calculateDriftCorrection(NaN, 2.0, 8, true);
    assert.equal(bufferingNaN.action, 'none');

    const bufferingWild = calculateDriftCorrection(500, 2.0, 8, true);
    assert.equal(bufferingWild.action, 'none');
  });

  it('calculateDriftCorrection: skip when not playing', () => {
    // No correction when not playing
    const notPlaying = calculateDriftCorrection(2.5, 2.0, 8, false);
    assert.equal(notPlaying.action, 'none');

    const paused = calculateDriftCorrection(3.0, 2.0, 8, false);
    assert.equal(paused.action, 'none');
  });

  it('drift correction handles edge cases', () => {
    // Rate adjustment capped at ±15%
    const hugeDrift = calculateDriftCorrection(2.8, 2.0, 8, true);
    assert.equal(hugeDrift.action, 'nudge');
    assert.ok(hugeDrift.rate >= 0.85 && hugeDrift.rate <= 1.15);

    // Near threshold boundary (just at 1.0s)
    const atThreshold = calculateDriftCorrection(3.0, 2.0, 8, true);
    assert.equal(atThreshold.action, 'seek');
    
    // Just below seek threshold (0.99s)
    const justBelowSeek = calculateDriftCorrection(2.99, 2.0, 8, true);
    assert.equal(justBelowSeek.action, 'nudge');
  });

  it('sync interval cleared on stop and wait states', () => {
    // This tests the contract: syncDrift returns early when action !== 'play'
    const stopSpec = {
      playAt: 10000,
      start: 0,
      duration: 8,
      clipEndsAt: 18000,
      receivedAt: 10000,
      serverNow: 10000
    };
    
    // After clip ends
    const stopPlan = planPlayback(stopSpec, 19000);
    assert.equal(stopPlan.action, 'stop');
    // syncDrift would clearInterval and return early
    
    // Before clip starts
    const waitPlan = planPlayback(stopSpec, 9000);
    assert.equal(waitPlan.action, 'wait');
    // syncDrift would clearInterval and return early
  });
});
