# Iteration 8: Segment Playback Hardening & Vote Thresholds

## Shipped Features

### 1. Segment Playback Hardening ✅

**Problem:** Original implementation used 100ms polling to detect segment boundaries, which caused:
- Drift from exact boundaries (could miss loop points)
- No handling for buffering/seeking races
- Followers didn't respect segment bounds

**Solution:**
- **Video.js Event-Based Looping**: Replaced polling with Video.js `timeupdate`, `seeking`, and `seeked` events
- **Seek Race Prevention**: Added `isSeeking` flag to prevent re-entrant seeks during segment loops
- **Boundary Enforcement**: Both YouTube and HTML5 video sources now loop reliably at `[timeStart, min(timeStart + segmentDuration, timeEnd)]`
- **Follower Segment Bounds**: Updated follower sync logic to respect segment window, preventing drift when host loops back

**Code Changes:**
- `src/components/GlimpsePlayer.tsx`:
  - Removed 100ms `setInterval` polling
  - Added Video.js event handlers: `on('timeupdate')`, `on('seeking')`, `on('seeked')`
  - Added `isSeeking` flag to prevent concurrent seeks
  - Updated follower sync to clamp position within segment bounds before syncing to host

**Result:** Segment loops fire reliably on event boundaries (not polling drift). Works consistently for both YouTube tech and uploaded HTML5 videos.

---

### 2. Live Vote Thresholds ✅

**Problem:** Vote system existed but lacked:
- Proper threshold enforcement
- Protection against duplicate votes
- Dynamic threshold adjustment when players join/leave
- Clear UI feedback for threshold state

**Solution:**

#### Server-Side Validation
- **Idempotent Votes**: `castVote` now returns success for duplicate votes (no-op, not error)
- **Dynamic Threshold Recalculation**: Threshold recalculates on every vote based on current eligible players (`Math.ceil(eligibleCount / 2)`)
- **Auto-Clear on Segment Advance**: `advanceToNextSegment` clears advance votes whether triggered by vote or host override
- **Threshold Met Execution**: When votes reach threshold, system executes action (advance segment or hint) and clears votes

#### UI Improvements
- **Vote State Highlight**: Voted buttons show brighter background and checkmark (✓)
- **Threshold Indicator**: Shows vote count like "Next Segment (2/3)" 
- **PASSED Indicator**: Animated "PASSED!" text appears when threshold met
- **Host Monitor Display**: Added vote counts to Operator Console with checkmarks when passed

**Code Changes:**
- `src/lib/game-state.ts`:
  - Enhanced `castVote` with idempotent logic, threshold recalculation, and execution flow
  - Added `recalculateVoteThreshold` helper function
  - Updated `advanceToNextSegment` to clear advance votes
- `src/lib/game-actions.ts`:
  - Exported `recalculateVoteThreshold`
- `src/routes/index.tsx`:
  - Updated vote button UI with conditional styling and "PASSED!" indicator
  - Added vote count display to host monitor with threshold checkmarks

**Result:** 
- Votes enforce majority threshold live
- Immediate UI feedback (counts, "PASSED!", reset after execute)
- Host override still works independently
- Hint vote threshold path is wired (reveal can be implemented in 9/10)

---

## Technical Details

### Segment Loop Algorithm (Hardened)

```typescript
// Event-based (not polling)
player.on("timeupdate", () => {
  if (isSeeking) return; // Prevent re-entrant seeks
  
  const currentTime = player.currentTime();
  const segmentEnd = Math.min(timeStart + segmentDuration, timeEnd);
  
  if (currentTime >= segmentEnd) {
    isSeeking = true;
    player.currentTime(timeStart); // Loop back
  } else if (currentTime < timeStart - 0.5) {
    isSeeking = true;
    player.currentTime(timeStart); // Clamp to start
  }
});

player.on("seeked", () => {
  isSeeking = false; // Reset flag once seek completes
});
```

### Vote Threshold Enforcement

```typescript
// Dynamic threshold recalculation
const eligibleCount = table.players.filter(p => !p.joinedMidRound).length;
table.voteState.threshold = Math.ceil(eligibleCount / 2);

// Threshold execution
if (votes.length >= threshold) {
  if (voteType === "advance") {
    advanceToNextSegment(tableId);
    table.voteState.advanceVotes = []; // Clear votes
  } else {
    // Hint reveal (stub for 9/10)
    table.voteState.hintVotes = [];
  }
}
```

---

## Observed Behavior

### Segment Playback ✅
- ✅ 1s segment loops reliably at boundary (YouTube + upload)
- ✅ Advance to 2s → loops at 2s boundary
- ✅ Followers stay within segment window during host loop
- ✅ No drift observed during multi-segment playback
- ✅ Buffering/seeking races handled by `isSeeking` flag

### Vote Thresholds ✅
- ✅ Majority threshold enforced (3 players → need 2 votes)
- ✅ Vote counts update immediately in UI
- ✅ "PASSED!" indicator appears when threshold met
- ✅ Segment advances automatically when advance vote passes
- ✅ Votes clear after execution
- ✅ Host can still manually advance segment (independent of votes)
- ✅ Host monitor shows live vote counts

### Edge Cases Handled
- ✅ Duplicate votes (idempotent - no-op success)
- ✅ Players joining/leaving during round (threshold recalculates)
- ✅ Host override doesn't break vote state (clears votes on advance)
- ✅ Mid-round joiners can't vote (filtered from threshold calculation)

---

## Still Open / Future Work

1. **Hint Reveal Implementation** (deferred to 9/10):
   - Threshold logic is wired
   - Actual letter reveal from title needs implementation
   - Placeholder: system message "Vote passed: revealing hint"

2. **Upload Progress/Validation**:
   - File picker accepts video/* but no upload progress bar
   - No validation for corrupt/unsupported codecs
   - Object URLs cleared on page refresh (fine for dev/local)

3. **Segment Ladder UX Polish**:
   - Could add visual progress bar for current segment duration
   - Could show segment history (which segments have been played)

---

## Build Status

✅ **Build: PASSED**
```
vite v8.1.5 building client environment for production...
✓ 246 modules transformed.
✓ built in 749ms

vite v8.1.5 building ssr environment for production...
✓ 76 modules transformed.
✓ built in 345ms

[nitro] ✔ Generated public .output/public
✓ 304 modules transformed.
✓ built in 280ms
```

✅ **Dev Server: RUNNING** (localhost:8080)

---

## Files Changed

- `src/components/GlimpsePlayer.tsx` — Event-based segment looping, follower bounds enforcement
- `src/lib/game-state.ts` — Vote validation, threshold recalculation, vote clearing
- `src/lib/game-actions.ts` — Export vote threshold helper
- `src/routes/index.tsx` — Vote UI feedback, host monitor vote display

---

## Commit

```
7fa8fb3 Iteration 8: Harden segment playback and vote thresholds

- Replace segment polling with Video.js events (timeupdate, seeking, seeked)
- Add seek race handling with isSeeking flag to prevent re-entrant seeks
- Enforce segment bounds for both host and follower players
- Add server-side vote validation: idempotent votes, threshold recalculation
- Clear advance votes automatically when segment changes (vote or host override)
- Improve vote UI: highlight voted state, show PASSED indicator when threshold met
- Add vote counts to host monitor display with threshold checkmarks
- Segment loops now fire reliably on event boundaries instead of polling drift
```

---

## Ready for Review

PR: https://github.com/Ascendism/glimpse/pull/new/cursor/harden-segments-votes-iter8-1318

Branch: `cursor/harden-segments-votes-iter8-1318`
Base: `main`
