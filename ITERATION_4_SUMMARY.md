# Iteration 4: Phase Countdown + Ready Handshake Fixes

## ✅ Completed

### Observed
- Ran `npm install`, `npm run build` (✅ passes)
- Started `npm run dev` on http://localhost:8080
- Code review of routine orchestration, ready handshake, and phase timing
- Launched computer-use agent for manual smoke testing (in progress)

### Critical Bugs Fixed

#### Bug #1: Phase Countdown Warnings Missing During Routine Execution
**Severity**: High  
**Impact**: Users miss important 10s/5s time warnings during automated routines

**Root Cause**:  
Countdown timer logic checked `gameState.phaseDeadline`, but routines use `gameState.routine.phaseDeadline`. This caused the warning banner to disappear during routine execution.

**Files Changed**:
- `src/routes/index.tsx` - Updated countdown useEffect to check both deadline sources
- `src/routes/stage.tsx` - Same fix for stage view

**Fix**:
```typescript
const deadline = gameState?.routine?.status === "running" 
  ? gameState.routine.phaseDeadline 
  : gameState?.phaseDeadline;
```

#### Bug #2: Mid-Routine Joiners Block Ready Handshake
**Severity**: High  
**Impact**: Late joiners prevent auto-start, forcing host to click "Start Anyway"

**Root Cause**:  
Players joining during ready-wait were:
1. Correctly marked as `joinedMidRound` (sitting out current clip)
2. Incorrectly counted in "all players ready" check
3. Never reported ready (correct - they're not participating)
4. Result: `table.players.every(p => p.ready)` never passed

**Files Changed**:
- `src/lib/game-state.ts` - Ready check now filters out `joinedMidRound` players
- `src/routes/index.tsx` - UI shows correct participating player count

**Fix**:
```typescript
const participatingPlayers = table.players.filter((p) => !p.joinedMidRound);
if (table.waitingForReady && participatingPlayers.every((p) => p.ready)) {
  // Auto-start when all participating players ready
}
```

### Minor Improvements
- GlimpsePlayer `onReady` added to useEffect dependency array (React best practice)
- "Start Anyway" system message shows accurate participating player count

## Build Status

✅ `npm run build` passes without errors  
✅ Dev server starts successfully on http://localhost:8080  
✅ TypeScript compilation succeeds (strict mode warnings are pre-existing)

## Commits

1. `b78f9ef` - Fix phase countdown warnings during routine execution
2. `bcee3c8` - Fix ready handshake with mid-routine joiners

## PR

- Branch: `cursor/iteration-4-fixes-53b6`
- PR: [#9](https://github.com/Ascendism/glimpse/pull/9)
- Status: Draft (awaiting computer-use smoke test results)

## Deferred / Still Open

**Not bugs** (missing features or edge cases):
- Early lock-all advance when all players submit guesses
- Configurable ready timeout duration (currently hardcoded 15s)
- Pause behavior during ready-wait phase (minor edge case)
- TypeScript strict mode cleanup (pre-existing, not blocking)

## Next Steps

1. Wait for computer-use agent smoke test results
2. Address any additional issues found during manual testing
3. Mark PR ready for review
4. Merge to main

## Testing Notes

**Computer-Use Agent Task**:
- Create table, configure 2-clip routine
- Join as player in second tab
- Test ready handshake, timeout, "Start Anyway"
- Verify countdown warnings appear during routine
- Test late join during ready-wait
- Check console + server logs for errors

**Expected Behavior After Fixes**:
- ✅ Countdown warnings (10s, 5s) show during routine phases
- ✅ Late joiners during ready-wait don't block auto-start
- ✅ UI shows "X/Y ready" counting only participating players
- ✅ Auto-start triggers when all participating players ready
