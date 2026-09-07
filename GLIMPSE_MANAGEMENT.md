# Glimpse Management — Library & Progressive Segments

## Overview

Iteration 6 introduces **library-based clip management** and **progressive duration segments** to replace the hard-coded clip array with a flexible, host-controlled content system.

## Data Model

### Core Types (`src/lib/library.ts`)

```typescript
// Clip sources (extensible)
type ClipSourceType = "youtube" | "upload" | "url";

// Adaptive metadata per source
type YouTubeMetadata = {
  youtubeId: string;
  duration: number;
  timeStart: number; // In-point for clip window
  timeEnd: number;   // Out-point for clip window
};

// Library clip with source-adaptive metadata
type LibraryClip = {
  id: string;
  title: string;
  category: string;
  type: "Movie" | "TV Show" | "Song" | "Other";
  source: ClipSource;
  metadata: ClipMetadata; // YouTube | Upload | URL
  createdAt: number;
  updatedAt: number;
};

// Playlists organize clips for routines
type Playlist = {
  id: string;
  name: string;
  clipIds: string[]; // References LibraryClip IDs
  createdAt: number;
  updatedAt: number;
};

// Progressive difficulty ladder
type SegmentLadder = {
  currentSegmentIndex: number; // Index into [1, 2, 3, 5]
  segmentDurations: readonly number[];
};

// Player voting state
type VoteState = {
  advanceVotes: string[]; // Player IDs
  hintVotes: string[];
  threshold: number; // Majority by default
};
```

### GameState Extensions

```typescript
type GameState = {
  // ...existing fields...
  segmentLadder: SegmentLadder | null;
  voteState: VoteState | null;
  library: {
    clips: LibraryClip[];
    playlists: Playlist[];
  };
};
```

## Features Implemented

### 1. Library Management (Host UI)

**Location**: Operator Console → "▶ Glimpse Management"

- **Add YouTube Clip**: Form with title, YouTube ID, category, start/end times
- **Clip Library**: All clips stored per-table (file-backed for dev persistence)
- **Playlist Selection**: Click clips to build playlist for routines
- **Adaptive Metadata**: YouTube clips store `timeStart`, `timeEnd` for segment windowing

**API** (`src/lib/game-actions.ts`):
- `addClipToLibrary` — Add new clip
- `updateClipInLibrary` — Edit clip metadata
- `removeClipFromLibrary` — Delete clip (also removes from playlists)
- `createPlaylist`, `updatePlaylist`, `removePlaylist` — Playlist CRUD

### 2. Progressive Duration Segments

**Playback Ladder**: 1s → 2s → 3s → 5s

- **Start**: Every clip begins at **1-second segment** (hardest)
- **Advance**: Players vote OR host manually advances
- **Window Constraint**: Segments respect `timeStart`/`timeEnd` from metadata
  - Example: `timeStart=10`, `timeEnd=30`, segment=2s → plays 10s–12s looped

**Implementation**:
- `GlimpsePlayer` component accepts `timeStart`, `timeEnd`, `segmentDuration` props
- Seeks to `timeStart` on load
- Loops back to `timeStart` when reaching `timeStart + segmentDuration` (clamped to `timeEnd`)
- Host sees "Segment: 2s → 3s" button in Operator Console

**API**:
- `advanceSegment` — Host override to next segment
- Segment state initialized in `startRound()`, reset on round end

### 3. Player Voting

**During Playing Phase**: Players see two vote buttons:
- **Next Segment** — Vote to advance duration (e.g., 1s → 2s)
- **Hint** — Vote to reveal letter on PuzzleBoard (stub in iter 6, full in 7+)

**Threshold**: Majority of eligible players (excluding mid-round joiners)

**Auto-Execute**: When threshold reached, server immediately:
- **Advance**: Increments `segmentLadder.currentSegmentIndex`, resets votes
- **Hint**: Adds system message (letter reveal deferred to iteration 7+)

**UI**:
- Vote buttons show current count: "Next Segment (2/3)"
- Checkmark when player has voted
- Disabled after voting

**API**:
- `castVote({ tableId, playerId, voteType: "advance" | "hint" })`
- Vote state managed in `game-state.ts`, threshold calculated on init

## Migration from Hard-Coded Clips

Legacy `GLIMPSE_CLIPS` array → `migrateClipsToLibrary()` function:
- Converts each legacy clip to `LibraryClip` with YouTube metadata
- Adds realistic `timeStart`/`timeEnd` windows (e.g., Shawshank: 10s–30s)
- Called in `createTable()` to seed initial library

**Compatibility**: Playlist selection and routine config now reference library clip IDs instead of legacy IDs.

## File-Backed Persistence

- **Storage**: `GameState.library` saved to `/tmp/glimpse-dev-state/tables.json` (dev only)
- **HMR-Safe**: Persists across Nitro HMR reloads
- **Production**: Replace with database (MongoDB, PostgreSQL, etc.)

## Testing

### Basic Flow
1. Create table → host sees 5 migrated clips in library
2. Host clicks "▶ Glimpse Management"
3. Add YouTube clip: title "THE MATRIX", ID "m8e-FF8MsqU", start 20, end 40
4. Select clips for playlist, configure routine, start
5. Clip plays 1s segment (20s–21s looped)
6. Players vote "Next Segment" → auto-advances to 2s (20s–22s looped)
7. Host overrides → advances to 3s, then 5s

### Verified
- ✅ Two-tab smoke test (from iteration 4): table join, YouTube playback
- ✅ Segment ladder: clips loop within window
- ✅ Host override: advances segment manually
- ✅ Voting: majority threshold triggers auto-advance

## Still Open (Iteration 7–10)

### Near-Term (7–8)
- **Upload Support**: File upload for local video clips (needs storage backend)
- **Hint Reveal Logic**: Vote-triggered letter reveal on PuzzleBoard
- **Playlist UI**: Dedicated playlist management (save/load named playlists)
- **Clip Editing**: Update existing clips (metadata, start/end)
- **Clip Deletion**: Remove button in library list

### Mid-Term (9–10)
- **URL Source**: Generic video URLs (HLS/DASH support)
- **Automatic Metadata**: Fetch YouTube duration via API (currently manual)
- **Segment Customization**: Host configures ladder (e.g., 0.5s, 1s, 3s, 10s)
- **Vote Threshold Config**: Adjust majority percentage (50%, 66%, 75%)
- **Letter Pack System**: Pre-configured hint reveal strategies

### Polish
- **Drag-Drop Playlist**: Reorder clips in playlist builder
- **Clip Preview**: Thumbnail + preview button in library
- **Batch Import**: CSV/JSON import for bulk clip addition
- **Search/Filter**: Library search by title, category, type
- **Analytics**: Track which segments triggered most guesses

### Infrastructure
- **Database Migration**: Replace file-backed storage with Postgres/Mongo
- **Blob Storage**: S3/R2 for uploaded video files
- **CDN**: Serve clips via CDN for global playback
- **WebSocket/SSE**: Replace polling with real-time push

## Code Locations

- **Data Model**: `src/lib/library.ts`
- **State Management**: `src/lib/game-state.ts` (CRUD functions at end)
- **API Routes**: `src/lib/game-actions.ts` (library, segment, voting)
- **Player Component**: `src/components/GlimpsePlayer.tsx` (segment loop logic)
- **Host UI**: `src/routes/index.tsx` (Glimpse Management panel)
- **Migration**: `src/lib/library.ts::migrateClipsToLibrary()`

## Design Principles

1. **Intent-First**: Host adds clips via form (YouTube ID + window), not raw JSON
2. **Direct Manipulation**: Click clips to build playlist, not text entry
3. **Portable State**: Library clips are table-scoped, exportable/importable
4. **Live Reflection**: Segment changes immediately visible in all clients
5. **Progressive Disclosure**: Management panel collapsed by default
6. **Agent-Assisted**: Future: AI suggests timeStart/timeEnd from clip analysis

## Notes

- **Segments vs Phases**: Segment ladder is *within* the "playing" phase (guess phase duration unchanged)
- **Voting Auto-Execute**: Server advances automatically when threshold met — host doesn't click "Accept Votes"
- **Host Override Always Available**: Host can advance segment regardless of votes
- **Hint Vote Stub**: UI + API wired, reveal logic deferred (needs PuzzleBoard state integration)
- **Lovable Chrome Preserved**: All styling (`stage-bg`, `text-gold-gradient`, etc.) unchanged

---

**Status**: Foundation shipped. Library management, segment ladder, and voting are playable. Upload/edit/delete and hint reveal are stubbed for iteration 7+.
