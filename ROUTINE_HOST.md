# Glimpse — Routine Orchestration

## Overview

The **Routine Orchestration** system transforms host controls from manual button-farm operations into automated, server-driven game flow. The host configures multi-clip playlists and timers once, then the server automatically advances through phases without requiring Lock Guesses / Reveal Title / Next Round clicks.

## Core Concepts

### Routine

A routine consists of two parts:

1. **Configuration** (editable when idle):
   - `playlist`: Array of clip IDs from `GLIMPSE_CLIPS`
   - `guessDurationSec`: Seconds for playing/guessing phase (default: 45)
   - `judgingDurationSec`: Seconds for host to judge guesses (default: 10)
   - `revealDurationSec`: Seconds to show revealed title (default: 8)
   - `autoAdvance`: Whether to automatically proceed to next clip (default: true)
   - `pointsCorrect` (optional): Points to award for correct guesses

2. **Runtime** (managed by server):
   - `status`: `idle` | `running` | `paused` | `stopped`
   - `currentIndex`: Current position in playlist
   - `phaseDeadline`: Epoch milliseconds when current phase expires
   - `pausedRemainingMs`: Remaining time when paused
   - `config`: Snapshot of active configuration

### Server Orchestration

A global tick (250ms interval, HMR-safe) runs on the server:

```
globalThis.__glimpseOrchestrationInterval
```

For each table where `routine.status === "running"` and `Date.now() >= routine.phaseDeadline`:

1. **playing** → **judging**: Lock guesses, stop clip, set judging deadline
2. **judging** → **reveal**: Reveal title, set reveal deadline
3. **reveal** → **next clip** (if autoAdvance and more clips): Start next clip in playlist
4. **reveal** → **idle** (if last clip or !autoAdvance): Return to lobby

### Phase Transition Logic

```javascript
switch (phase) {
  case "playing":
    // Advance to judging after guessDurationSec
    // Lock all guesses, stop clip
    break;
    
  case "judging":
    // Advance to reveal after judgingDurationSec
    // Reveal title, start tile animation
    break;
    
  case "reveal":
    // After revealDurationSec:
    if (nextIndex < playlist.length && autoAdvance) {
      // Start next clip
    } else {
      // Return to idle/lobby
    }
    break;
}
```

## Host UI — Operator Console

The host interface is divided into functional sections:

### 1. Configure (when idle)

**Shown when**: `routine === null` or `routine.status === "idle"`

Host can:
- Select clips for playlist (click to toggle, shows selection order)
- Set timers: Guess duration, Judging duration, Reveal duration
- Toggle auto-advance checkbox
- Click "Configure Routine" to save settings
- Click "Start Routine" to begin

### 2. Monitor (when running/paused)

**Shown when**: `routine.status !== "idle"`

Real-time display:
- **Status**: Badge showing RUNNING/PAUSED/STOPPED
- **Round**: Current position (e.g., "2 / 5")
- **Phase**: Current game phase (PLAYING/JUDGING/REVEAL)
- **Time Left**: Countdown in seconds
- **Locked In**: Players who locked their guesses (e.g., "3 / 5")

### 3. Run Controls

**Primary actions**:
- **Start**: Begin configured routine (idle → running)
- **Pause**: Freeze timer and clip (running → paused)
- **Resume**: Continue from paused state (paused → running)
- **Stop**: End routine and return to lobby (→ stopped → idle)

### 4. Overrides (collapsed by default)

**Secondary controls** for edge cases:
- **Skip Phase**: Force immediate phase transition
- Score adjustments remain in player sidebar (±100 per player)

## API Actions

New host actions in `game-actions.ts` (via `performHostAction`):

| Action | Payload | Description |
|--------|---------|-------------|
| `configure_routine` | `{ config: RoutineConfig }` | Set playlist and timers |
| `start_routine` | — | Begin configured routine |
| `pause_routine` | — | Pause running routine |
| `resume_routine` | — | Resume paused routine |
| `stop_routine` | — | Stop and return to lobby |
| `skip_phase` | — | Force immediate phase advance |

## Game State Extensions

### Added to `GameState` type:

```typescript
routine: RoutineRuntime | null;

type RoutineConfig = {
  playlist: string[];
  guessDurationSec: number;
  revealDurationSec: number;
  judgingDurationSec: number;
  autoAdvance: boolean;
  pointsCorrect?: number;
};

type RoutineRuntime = {
  status: RoutineStatus;
  currentIndex: number;
  phaseDeadline: number | null;
  pausedRemainingMs: number | null;
  config: RoutineConfig;
};

type RoutineStatus = "idle" | "running" | "paused" | "stopped";
```

## Host Workflow Example

1. **Create table** → Host joins
2. **Configure**: Select 3 clips, set timers (guess: 30s, judge: 10s, reveal: 8s)
3. **Start**: Click "Start Routine"
4. Server automatically:
   - Starts clip 1, sets 30s deadline
   - After 30s: locks guesses, moves to judging, sets 10s deadline
   - After 10s: reveals title, sets 8s deadline
   - After 8s: starts clip 2 (if autoAdvance)
   - Repeats for all clips
5. **Monitor**: Host watches progress, can Pause/Resume/Stop anytime
6. **Override** (optional): Skip Phase if needed
7. **Completion**: Routine ends, returns to configuration UI

## Technical Notes

- **HMR-safe**: Orchestration interval persists on `globalThis` across hot reloads
- **Deadline storage**: Phase deadlines are epoch milliseconds for accuracy
- **Pause behavior**: Stores remaining time, restores on resume
- **Early advance**: Optional enhancement to lock when all players submit (not yet implemented)
- **Persistence**: Current in-memory state; replace with DB for production

## Player Experience

**No changes** to player workflow:
- Still watch synced clips
- Still submit/lock guesses
- Still see chat and scores
- Still see PuzzleBoard tile reveal

The routine system only changes **host orchestration** — everything else remains intact.

## Future Enhancements

- **Close Enough matching**: Fuzzy string matching in judging phase
- **Escalating points**: Award more points for faster/accurate guesses
- **Early lock advance**: Proceed to judging when all players lock in
- **Real-time updates**: Replace polling with WebSocket/SSE
- **Routine templates**: Save/load common configurations
- **Multiple routines**: Queue next routine before current ends
