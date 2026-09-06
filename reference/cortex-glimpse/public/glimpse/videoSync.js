'use strict';

/**
 * Shared video sync logic for Glimpse player
 * Works in both Node.js and browser contexts
 */

(function (exports) {
  /**
   * Calculate playback plan from server spec and current wall time
   */
  function planPlayback(spec, wallNow) {
    const receivedAt = Number(spec && spec.receivedAt) || wallNow;
    const serverNow = Number(spec && spec.serverNow) || receivedAt;
    const skew = receivedAt - serverNow;
    const t = wallNow - skew;
    const playAt = Number(spec && spec.playAt) || t;
    const start = Number(spec && spec.start) || 0;
    const dur = Math.max(0.5, Number(spec && spec.duration) || 8);
    const clipEndsAt = Number(spec && spec.clipEndsAt) || playAt + dur * 1000;
    
    if (t >= clipEndsAt) {
      return { action: 'stop', t, playAt, clipEndsAt, seek: start };
    }
    if (t < playAt) {
      return { action: 'wait', delay: playAt - t, seek: start, remaining: clipEndsAt - playAt, t, playAt };
    }
    const into = (t - playAt) / 1000;
    return { action: 'play', seek: start + into, remaining: clipEndsAt - t, t, playAt, clipEndsAt };
  }

  /**
   * Check if currentTime value is sane (not 0, not NaN, within reasonable bounds of expected)
   * For offset clips (e.g., starting at 45s in video), current should be near expected, not < duration
   */
  function isSaneTime(current, expected, maxDur) {
    if (!Number.isFinite(current)) return false;
    if (current <= 0) return false; // Buffering or not started
    
    // Check if current is reasonably close to expected (within clip duration window)
    // This handles offset clips where current might be 45s but duration is only 8s
    const drift = Math.abs(current - expected);
    if (drift > (maxDur || 600)) return false; // Wildly off from expected
    
    return true;
  }

  /**
   * Calculate drift correction strategy
   * Returns: { action: 'none' | 'nudge' | 'seek', rate: number, seek: number, drift: number }
   */
  function calculateDriftCorrection(currentTime, expectedTime, duration, isPlaying) {
    if (!isPlaying) {
      return { action: 'none', drift: 0 };
    }
    
    if (!isSaneTime(currentTime, expectedTime, duration)) {
      // Likely buffering or bad state, don't correct
      return { action: 'none', drift: 0 };
    }
    
    const drift = currentTime - expectedTime;
    const absDrift = Math.abs(drift);
    
    // Thresholds
    const NUDGE_THRESHOLD = 0.15; // Start nudging at 150ms
    const SEEK_THRESHOLD = 1.0; // Hard seek at 1s+ drift
    
    if (absDrift < NUDGE_THRESHOLD) {
      return { action: 'none', drift, rate: 1.0 };
    }
    
    if (absDrift >= SEEK_THRESHOLD) {
      // Large drift: hard seek
      return { action: 'seek', seek: expectedTime, drift };
    }
    
    // Medium drift: playback rate nudge
    // drift > 0 means we're ahead, need to slow down
    // drift < 0 means we're behind, need to speed up
    const maxRateAdjust = 0.15; // ±15% rate adjustment
    const rateAdjust = Math.max(-maxRateAdjust, Math.min(maxRateAdjust, -drift / 2));
    const rate = 1.0 + rateAdjust;
    
    return { action: 'nudge', rate, drift };
  }

  exports.planPlayback = planPlayback;
  exports.isSaneTime = isSaneTime;
  exports.calculateDriftCorrection = calculateDriftCorrection;
})(typeof module !== 'undefined' && module.exports ? module.exports : (this.GlimpseVideoSync = {}));
