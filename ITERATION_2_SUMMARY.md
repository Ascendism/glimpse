# Iteration 2: Ready Timeout + Start Anyway

## ✅ Completed

### Must-Have Features Implemented

1. **Explicit Timeout (15s default)**
   - `READY_TIMEOUT_SEC` constant in `game-state.ts`
   - `readyDeadline` field on `GameState` (epoch milliseconds)
   - Applied to both manual `start_round` and routine-driven clips

2. **Host "Start Anyway" Override**
   - New `forceStartAnyway()` function in backend
   - Exposed via `force_start_anyway` host action
   - Forces clip start even if some players not ready
   - System message shows N/M ready count

3. **Timeout UI Behavior**
   - Countdown timer shows remaining seconds in ready wait
   - Visual warning when ≤5s (red text, pulsing animation)
   - Shows "Timed out" when 0s reached
   - Host "Start Anyway" button appears when ≤10s remaining
   - Timed-out players marked with red "Timed out" badge

4. **Clean State Management**
   - `readyDeadline` properly cleared when all ready
   - Cleared on force start, round reset, session restart, routine stop
   - Timeout does NOT auto-start (requires host action)

## Build Status

✅ `npm run build` passes without errors  
✅ Dev server starts successfully on http://localhost:8080

## Testing Checklist

### Manual Smoke Tests Needed

1. **Single Clip Flow**
   - [ ] Host creates table, starts clip
   - [ ] Player 1 joins, reports ready quickly
   - [ ] Verify countdown shows and updates
   - [ ] Verify auto-start when all ready

2. **Timeout Scenario**
   - [ ] Host starts clip with 2+ players
   - [ ] One player doesn't load video (simulate by not opening second tab)
   - [ ] Verify "Start Anyway" button appears at 10s
   - [ ] Host clicks "Start Anyway"
   - [ ] Verify clip starts, system message shows X/Y ready
   - [ ] Verify timed-out player shows red badge

3. **Routine Flow**
   - [ ] Configure routine with 2 clips
   - [ ] Start routine
   - [ ] Verify timeout on first clip
   - [ ] Verify timeout on subsequent clips

4. **Edge Cases**
   - [ ] All players ready before timeout (should auto-start)
   - [ ] Host uses "Start Anyway" before timeout (should work anytime)
   - [ ] Mid-game join during timeout (player state correct)

## Implementation Details

### Backend Changes

**`game-state.ts`**
- Line 72: Added `READY_TIMEOUT_SEC = 15` constant
- Line 67: Added `readyDeadline: number | null` to `GameState`
- Lines 231-243: Updated `startRound()` to set deadline
- Lines 389-392: Clear deadline in `reportPlayerReady()` when all ready
- Lines 397-425: New `forceStartAnyway()` function
- Lines 306-318, 350-362, 491-493, 572, 666: Clear deadline in reset/restart/stop

**`game-actions.ts`**
- Line 18: Import `forceStartAnyway`
- Lines 199-201: Add `force_start_anyway` case in `performHostAction`

### Frontend Changes

**`index.tsx`**
- Line 71: Added `readyTimeRemaining` state
- Lines 124-136: useEffect to calculate countdown from `readyDeadline`
- Line 217: Added `forceStartAnyway()` helper
- Lines 471-497: Enhanced ready wait UI with countdown and button
- Lines 822-835: Updated player badges to show timed-out status

## Notes

- **Design Choice**: Timeout does NOT auto-start; host must click "Start Anyway"
  - Rationale: Prefer explicit host control over automatic behavior
  - "Start Anyway" visible early (10s) gives host time to decide

- **Visual Polish**: All styling follows Lovable design system
  - Gold buttons for host actions
  - Red pulsing text for timeout warning
  - Color-coded player badges (green/red/gray)

- **Future Enhancements** (not in scope):
  - Configurable timeout duration (currently hardcoded 15s)
  - Auto-start option (configurable behavior)
  - Mid-routine join policy (out of scope this iteration)
  - Visual countdown warnings for phase auto-advance (if time)

## PR

- Branch: `cursor/ready-timeout-start-anyway-73c7`
- PR: [#7](https://github.com/Ascendism/glimpse/pull/7)
- Status: Draft (ready for review after manual testing)
