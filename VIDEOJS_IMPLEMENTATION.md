# Video.js Player Implementation Summary

## Overview

Replaced raw YouTube iframe embeds with a proper Video.js + videojs-youtube player stack featuring **host-authoritative synchronization** based on the qbot `player.js` algorithm.

## Implementation Details

### Component: `src/components/GlimpsePlayer.tsx`

A React wrapper for Video.js with two operational modes:

#### Controller Mode (Host)
- Drives play/pause/seek locally
- Reports position and play state every 500ms (throttled)
- Uses `onReport` callback to update shared game state
- Natural video playback without artificial constraints

#### Follower Mode (Non-Host Players & Stage View)
- Syncs to shared game state with qbot-style `withinPos` algorithm
- Checks position every 1 second
- Seeks and adjusts play/pause when outside ~2 second tolerance
- Automatic drift correction

### Key Features

1. **Video.js Configuration** (qbot reference)
   ```js
   {
     techOrder: ["html5", "youtube"],
     autoplay: false,
     controls: true,
     youtube: { iv_load_policy: 3 },
     sources: [{ type: "video/youtube", src: "https://www.youtube.com/watch?v={id}" }]
   }
   ```

2. **Host Position Reporting** (Throttled)
   - Reports only when:
     - Play/pause state changes, OR
     - Position drifts more than 0.5 seconds AND at least 500ms since last report
   - Prevents excessive API calls
   - Updates via `hostAction("set_clip_state", { playing, position })`

3. **Follower Sync Loop** (qbot withinPos algorithm)
   ```js
   const withinPos = (ourPos, targetPos, within = 2) => {
     const start = targetPos - within;
     const end = targetPos + within;
     return ourPos >= start && ourPos <= end;
   };
   
   if (!withinPos(currentTime, gameState.clipPosition, 2)) {
     player.currentTime(gameState.clipPosition);
     if (gameState.clipPlaying) player.play();
     else player.pause();
   }
   ```

4. **Clean Disposal**
   - Disposes and recreates player when YouTube ID changes
   - Cleans up intervals on unmount
   - Prevents memory leaks

### Integration Points

#### `src/routes/index.tsx` (Main Game View)
- Host: `isController={true}` with `onReport={reportClipState}`
- Non-host: `isController={false}` (follower mode)
- Replaced iframe at lines 380-396

#### `src/routes/stage.tsx` (Stage/OBS View)
- Always follower: `isController={false}`
- No onReport callback (read-only sync)
- Replaced iframe at lines 130-142

### Styling: `src/styles.css`

Added Video.js custom styles:
- `.vjs-glimpse-player`: Full width/height container
- `.board-frame` integration: Fits within existing game chrome
- Gold-themed big play button to match Lovable UI

### Dependencies

```json
{
  "video.js": "^8.x",
  "videojs-youtube": "^3.x",
  "@types/video.js": "^7.x"
}
```

## Synchronization Flow

### 1. Host Starts Clip
```
Host → Video.js player loads
     → User presses play
     → onReport fires
     → hostAction("set_clip_state", {playing: true, position: 0})
     → gameState.clipPlaying = true, clipPosition = 0
     → All clients poll and receive new state
```

### 2. Followers Sync
```
Every 1 second:
  Follower polls gameState
  → Reads clipPlaying & clipPosition
  → Checks withinPos(currentTime, clipPosition, 2)
  → If outside tolerance:
      - Seek to clipPosition
      - Match play/pause state
```

### 3. Host Position Updates
```
Every 500ms (throttled):
  Host reports current position
  → Only if drift >0.5s or play state changed
  → Updates gameState.clipPosition
  → Followers receive on next poll (within 1s)
```

## Testing Verification

### ✅ Confirmed Working
1. Host starts round → Video.js player loads on all clients
2. Host plays video → followers sync within ~1-2 seconds
3. Host pauses → followers pause within ~1-2 seconds
4. Host seeks → followers seek to match position
5. Stage view syncs identically to player view
6. Player disposal on round reset/video change
7. No memory leaks or interval buildup

### ✅ Build Status
- `npm run build` passes
- Video.js and videojs-youtube bundled correctly
- Client bundle: ~756 KB (includes Video.js)
- Server bundle: includes Video.js SSR stubs

## Differences from qbot

### Similarities
- Same `withinPos` tolerance algorithm
- Same Video.js + YouTube tech configuration
- Same sync frequency (~1-2s check interval)
- Same play/pause state enforcement

### Adaptations for React
- React component lifecycle (useEffect for setup/cleanup)
- React refs for player instance and intervals
- Props-driven configuration instead of Vue data
- Callback-based reporting instead of direct state mutation

### Improvements
- Throttled position reporting (reduces API calls)
- Separate controller/follower modes via prop
- Cleaner disposal on video ID change
- TypeScript types for better safety

## Known Limitations

1. **Autoplay Policy**: Browsers may block autoplay
   - Mitigated: Controls always visible, user can manually start
   - Host drives initial play state

2. **Network Latency**: Sync tolerance is ~2 seconds
   - Acceptable for party game use case
   - Can be tightened if needed (reduce `within` parameter)

3. **YouTube API Loading**: Slight delay on first load
   - Video.js handles this gracefully
   - Player shows loading state

## Future Enhancements (Optional)

- [ ] Add visual sync indicator for followers (e.g., "syncing...")
- [ ] Host play/pause buttons in UI (currently relies on Video.js controls)
- [ ] Tighter sync tolerance (1s instead of 2s) if needed
- [ ] Predictive position extrapolation using timestamp + elapsed time

## References

- **qbot player.js**: Ascendism/qbot `web/player.js` (sync algorithm reference)
- **qbot Youtube.js**: Ascendism/qbot `web/Youtube.js` (YouTube tech implementation)
- **Carapace QPlayer**: pulse-control `QPlayer.tsx` (React port reference)
- **Video.js Docs**: https://videojs.com/
- **videojs-youtube**: https://github.com/videojs/videojs-youtube
