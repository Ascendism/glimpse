# Glimpse UX Gaps Analysis & Fixes

## Methodology
- Code review of main gameplay flows (host, player, stage, library, routine)
- Analysis of edge cases and error paths
- Focus on non-obvious gaps that would surface in real party play

---

## Gaps Found & Fixed

### 1. **Duplicate Player Names** ✅ FIXED
**Gap**: No validation to prevent duplicate player names at table join. Two players with same name = confusion in guesses/scores.

**Impact**: Medium-High — Breaks attribution in judging phase, scores get mixed up.

**Fix**: 
- Added case-insensitive name duplicate check in `joinTable()`
- Returns null for duplicate, frontend shows user-friendly error: "Name already taken"
- Error clears when user types new name

**Files**: `src/lib/game-state.ts`, `src/routes/index.tsx`

---

### 2. **Clipboard API Failures** ✅ FIXED
**Gap**: `copyJoinLink()` assumes `navigator.clipboard` works. Fails silently on:
- Insecure contexts (non-HTTPS, except localhost)
- Browsers with clipboard disabled
- Permission denied

**Impact**: Medium — Host can't share join link, players can't join easily.

**Fix**:
- Try modern `navigator.clipboard.writeText()` first
- Fallback to legacy `document.execCommand('copy')` if unavailable
- Show alert with manual link if both fail
- Added error handling with try-catch

**Files**: `src/routes/index.tsx`

---

### 3. **YouTube Embed Failures** ✅ FIXED
**Gap**: No user-facing error messages when YouTube videos fail to load:
- Age-gated videos
- Region-locked content
- Private/deleted videos
- Embedding disabled by uploader

**Impact**: High — Round starts, black screen, confusion, timeout, no feedback.

**Fix**:
- Added `videoError` state to `GlimpsePlayer`
- Video.js error event handler with user-friendly messages:
  - Code 4 → "YouTube video unavailable (may be age-restricted, private, or region-locked)"
  - Network/decode errors mapped to clear messages
- Error overlay shown on video player with red alert styling

**Files**: `src/components/GlimpsePlayer.tsx`

---

### 4. **Empty/Deleted Playlist Start** ✅ FIXED
**Gap**: Routine can be configured with clips, then clips deleted from library, routine still tries to start with invalid IDs.

**Impact**: Medium — Runtime error or silent failure when starting routine.

**Fix**:
- `startRoutine()` validates all clip IDs exist in library before starting
- Filters out deleted clips
- Shows system message if clips were removed
- Rejects start if ALL clips deleted

**Files**: `src/lib/game-state.ts`

---

### 5. **Ready Timeout Auto-Start** ✅ FIXED
**Gap**: Ready timeout (`readyDeadline`) set, but no orchestration tick handler to force-start when it expires. Manual "Start Anyway" button is the only way.

**Impact**: Medium — If host is AFK or doesn't notice, game hangs indefinitely waiting for slow clients.

**Fix**:
- Added ready timeout check to `tickOrchestration()`
- Auto force-starts when `now >= readyDeadline`
- Same behavior as manual "Start Anyway" — sets `clipPlaying`, clears wait state
- System message shows ready count at timeout

**Files**: `src/lib/game-state.ts`

---

## Gaps Observed (Not Fixed This PR)

### 6. **SessionStorage Multi-Tab Conflict**
**Gap**: SessionStorage is tab-specific, NOT shared. If player opens same seat in 2 tabs:
- Both tabs have same `playerId` from sessionStorage
- Both tabs poll and send actions as same player
- Race conditions, duplicate guesses, confusing lock state

**Impact**: Low-Medium — Rare, but possible if user refreshes and keeps old tab open.

**Mitigation Ideas**:
- BroadcastChannel to detect multi-tab usage, show warning
- localStorage lock with heartbeat
- Server-side: reject duplicate playerId connections

**Deferred**: Requires architecture changes (WebSocket/SSE for real-time detection).

---

### 7. **Score Edit During Playing Phase**
**Gap**: Host can edit scores at any time via +100/-100 buttons in player list, even during "playing" phase before judging.

**Impact**: Low — Edge case, but could be confusing if host accidentally clicks during play.

**Mitigation**: Could disable score buttons when `phase !== "judging"` and `phase !== "lobby"`.

**Deferred**: Low priority, host controls are assumed intentional.

---

### 8. **System Chat Verbosity**
**Gap**: Every hint vote, segment advance, score change creates system message. In active 5-player game with voting, chat can get spammy.

**Impact**: Low — Doesn't break functionality, just noisy.

**Mitigation**: Batch system messages or rate-limit.

**Deferred**: Low priority, chat scroll works fine.

---

### 9. **Stage View Missing Segments/Votes**
**Gap**: Stage view (`/stage?table=XXX`) doesn't show:
- Segment ladder progress (1s → 2s → 3s → 5s)
- Vote counts (advance/hint)
- Ready status during handshake

**Impact**: Low-Medium — Stage view for casting/OBS is less informative than player view.

**Mitigation**: Add segment/vote UI to stage view to match main view.

**Deferred**: Stage view works for core purpose (clip + title reveal), enhancement only.

---

### 10. **Hint Reveal with Punctuation-Heavy Titles**
**Gap**: Hint system only reveals letters (`cell.kind === "letter"`). Titles like "WHO'S ON FIRST?" have lots of punctuation already visible — revealing 1 letter at a time not very helpful.

**Impact**: Low — Still playable, just less helpful for punctuation-heavy titles.

**Mitigation**: Adjust hint reveal count based on letter density, or reveal words.

**Deferred**: Current behavior is consistent, not broken.

---

### 11. **No Indication When All Hints Exhausted**
**Gap**: If all letters already revealed via hints, voting for hint or host clicking "Give Hint" silently fails or shows temp message.

**Impact**: Low — Message does appear, but could be more prominent.

**Deferred**: Works as-is.

---

## Summary

**Fixed**: 5 high-value gaps
- Duplicate names
- Clipboard errors
- YouTube embed failures
- Empty playlist validation
- Ready timeout auto-start

**Observed**: 6 lower-priority gaps documented for future improvement

**Build Status**: ✅ All changes compile, build passes

**Testing**: Manual smoke test + computerUse subagent comprehensive testing in progress
