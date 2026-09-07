// ============================================================================
// GLIMPSE LIBRARY - Clip source management with adaptive metadata
// ============================================================================

export type ClipSourceType = "youtube" | "upload" | "url";

// Base clip source interface
export type ClipSource = {
  type: ClipSourceType;
  id: string; // Source-specific identifier (YouTube video ID, file path, etc.)
};

// YouTube-specific metadata
export type YouTubeMetadata = {
  youtubeId: string;
  duration: number; // Total duration in seconds
  timeStart: number; // In-point in seconds (default 0)
  timeEnd: number; // Out-point in seconds (default = duration)
};

// Upload/file-specific metadata (extensible for future)
export type UploadMetadata = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  timeStart: number;
  timeEnd: number;
};

// URL-specific metadata (for external video URLs)
export type URLMetadata = {
  url: string;
  duration: number;
  timeStart: number;
  timeEnd: number;
};

// Adaptive metadata union
export type ClipMetadata = YouTubeMetadata | UploadMetadata | URLMetadata;

// Library clip with adaptive metadata
export type LibraryClip = {
  id: string; // Unique library clip ID
  title: string;
  category: string; // "movie", "tv", "music", etc.
  type: "Movie" | "TV Show" | "Song" | "Other";
  source: ClipSource;
  metadata: ClipMetadata;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
};

// Playlist for organizing clips
export type Playlist = {
  id: string;
  name: string;
  clipIds: string[]; // References to LibraryClip IDs
  createdAt: number;
  updatedAt: number;
};

// Segment ladder configuration - progressive difficulty
export const SEGMENT_DURATIONS = [1, 2, 3, 5] as const;
export type SegmentDuration = typeof SEGMENT_DURATIONS[number];

export type SegmentLadder = {
  currentSegmentIndex: number; // Index into SEGMENT_DURATIONS
  segmentDurations: readonly number[]; // [1, 2, 3, 5]
};

// Vote types during round
export type VoteType = "advance" | "hint";

export type Vote = {
  playerId: string;
  voteType: VoteType;
  timestamp: number;
};

export type VoteState = {
  advanceVotes: string[]; // Player IDs who voted to advance
  hintVotes: string[]; // Player IDs who voted for hint
  threshold: number; // Number of votes needed (e.g., majority)
};

// Library storage structure
export type ClipLibrary = {
  clips: Map<string, LibraryClip>;
  playlists: Map<string, Playlist>;
};

// Helper to check if metadata is YouTube
export function isYouTubeMetadata(metadata: ClipMetadata): metadata is YouTubeMetadata {
  return "youtubeId" in metadata;
}

// Helper to get effective clip duration (respecting start/end window)
export function getEffectiveClipDuration(metadata: ClipMetadata): number {
  if ("youtubeId" in metadata) {
    return metadata.timeEnd - metadata.timeStart;
  }
  if ("fileName" in metadata) {
    return metadata.timeEnd - metadata.timeStart;
  }
  if ("url" in metadata) {
    return metadata.timeEnd - metadata.timeStart;
  }
  return 0;
}

// Helper to get current segment duration
export function getCurrentSegmentDuration(ladder: SegmentLadder): number {
  return ladder.segmentDurations[ladder.currentSegmentIndex] || 1;
}

// Helper to check if can advance to next segment
export function canAdvanceSegment(ladder: SegmentLadder): boolean {
  return ladder.currentSegmentIndex < ladder.segmentDurations.length - 1;
}

// Helper to advance to next segment
export function advanceSegment(ladder: SegmentLadder): SegmentLadder {
  if (!canAdvanceSegment(ladder)) return ladder;
  return {
    ...ladder,
    currentSegmentIndex: ladder.currentSegmentIndex + 1,
  };
}

// Helper to reset segment ladder
export function resetSegmentLadder(): SegmentLadder {
  return {
    currentSegmentIndex: 0,
    segmentDurations: SEGMENT_DURATIONS,
  };
}

// Helper to create YouTube library clip from legacy format
export function createYouTubeLibraryClip(
  title: string,
  youtubeId: string,
  category: string,
  type: "Movie" | "TV Show" | "Song" | "Other",
  duration: number = 60,
  timeStart: number = 0,
  timeEnd?: number
): LibraryClip {
  const now = Date.now();
  return {
    id: `clip_${Math.random().toString(36).substring(2, 15)}`,
    title,
    category,
    type,
    source: {
      type: "youtube",
      id: youtubeId,
    },
    metadata: {
      youtubeId,
      duration,
      timeStart,
      timeEnd: timeEnd ?? duration,
    },
    createdAt: now,
    updatedAt: now,
  };
}

// Migration: Convert legacy GLIMPSE_CLIPS to library format
export function migrateClipsToLibrary(): LibraryClip[] {
  // Legacy clips with estimated durations and interesting start/end points
  const legacyClips = [
    {
      id: "1",
      title: "THE SHAWSHANK REDEMPTION",
      type: "movie" as const,
      category: "Classic Drama",
      youtubeId: "6hB3S9bIaco",
      duration: 142, // ~2:22 trailer
      timeStart: 10,
      timeEnd: 30, // Focus on memorable 20s window
    },
    {
      id: "2",
      title: "BREAKING BAD",
      type: "tv" as const,
      category: "Crime Drama",
      youtubeId: "HhesaQXLuRY",
      duration: 134, // ~2:14 trailer
      timeStart: 15,
      timeEnd: 40, // Iconic moments
    },
    {
      id: "3",
      title: "BOHEMIAN RHAPSODY",
      type: "song" as const,
      category: "Rock Anthem",
      youtubeId: "fJ9rUzIMcZQ",
      duration: 354, // Full song ~5:54
      timeStart: 60,
      timeEnd: 80, // Famous vocal section
    },
    {
      id: "4",
      title: "PULP FICTION",
      type: "movie" as const,
      category: "Crime Thriller",
      youtubeId: "s7EdQ4FqbhY",
      duration: 154, // ~2:34 trailer
      timeStart: 20,
      timeEnd: 45, // Memorable sequence
    },
    {
      id: "5",
      title: "STRANGER THINGS",
      type: "tv" as const,
      category: "Sci-Fi Horror",
      youtubeId: "b9EkMc79ZSU",
      duration: 154, // ~2:34 trailer
      timeStart: 30,
      timeEnd: 55, // Key atmospheric moments
    },
  ];

  return legacyClips.map((clip) => {
    const typeMap = {
      movie: "Movie",
      tv: "TV Show",
      song: "Song",
    } as const;

    return createYouTubeLibraryClip(
      clip.title,
      clip.youtubeId,
      clip.category,
      typeMap[clip.type],
      clip.duration,
      clip.timeStart,
      clip.timeEnd
    );
  });
}

