import type { LibraryClip, Playlist, SegmentLadder, VoteState } from "./library";
import { migrateClipsToLibrary, resetSegmentLadder } from "./library";

export type Player = {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  lockedIn: boolean;
  joinedMidRound: boolean;  // True if joined after round started, cleared on round reset
  ready: boolean; // Client reports video loaded and ready to play
};

export type Guess = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  locked: boolean;
};

export type ChatMessage = {
  id: string;
  playerId: string | null;
  playerName: string;
  text: string;
  timestamp: number;
  isSystem: boolean;
};

export type GamePhase =
  | "lobby"
  | "playing"
  | "guessing"
  | "judging"
  | "reveal";

// Phase duration configuration (in milliseconds)
export const PHASE_DURATIONS = {
  playing: 60000,  // 60 seconds to watch clip
  judging: 45000,  // 45 seconds for host to judge
  reveal: 30000,   // 30 seconds to show answer
} as const;

export type RoutineStatus = "idle" | "running" | "paused" | "stopped";

export type RoutineConfig = {
  playlist: string[]; // Array of clip IDs from library
  guessDurationSec: number;
  revealDurationSec: number;
  judgingDurationSec: number;
  autoAdvance: boolean;
  pointsCorrect?: number;
};

export type RoutineRuntime = {
  status: RoutineStatus;
  currentIndex: number; // Current position in playlist
  phaseDeadline: number | null; // Epoch ms when current phase expires
  pausedRemainingMs: number | null; // Remaining ms when paused
  config: RoutineConfig; // Snapshot of active config
};

export type GameState = {
  tableId: string;
  players: Player[];
  currentClipId: string | null;
  phase: GamePhase;
  guesses: Guess[];
  chat: ChatMessage[];
  clipPlaying: boolean;
  clipPosition: number;
  revealedTitle: boolean;
  sessionPaused: boolean;
  phaseStartTime: number | null;  // Timestamp when current phase started
  phaseDeadline: number | null;   // Timestamp when phase should auto-advance (optional)
  routine: RoutineRuntime | null;
  waitingForReady: boolean; // True when waiting for all clients to report ready
  readyDeadline: number | null; // Epoch milliseconds when ready wait expires
  segmentLadder: SegmentLadder | null; // Progressive duration segments
  voteState: VoteState | null; // Player votes during round
  library: {
    clips: LibraryClip[];
    playlists: Playlist[];
  };
};

// Configuration constants
const READY_TIMEOUT_SEC = 15; // Default timeout for ready handshake

// In-memory game state (replace with a database in production)
// File-backed Map to survive Nitro worker reloads in dev
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const STORAGE_DIR = join(tmpdir(), "glimpse-dev-state");
const STORAGE_FILE = join(STORAGE_DIR, "tables.json");

// Ensure storage directory exists
if (typeof process !== "undefined" && !existsSync(STORAGE_DIR)) {
  try {
    mkdirSync(STORAGE_DIR, { recursive: true });
  } catch (err) {
    console.warn("[Glimpse] Could not create storage directory:", err);
  }
}

// Load tables from file on module initialization
function loadTablesFromDisk(): Map<string, GameState> {
  if (typeof process === "undefined") return new Map();
  
  try {
    if (existsSync(STORAGE_FILE)) {
      const data = readFileSync(STORAGE_FILE, "utf-8");
      const parsed = JSON.parse(data) as Array<[string, GameState]>;
      return new Map(parsed);
    }
  } catch (err) {
    console.warn("[Glimpse] Could not load tables from disk:", err);
  }
  return new Map();
}

// Save tables to file (debounced to avoid excessive writes)
let saveTimer: NodeJS.Timeout | null = null;
function saveTablesToDisk(): void {
  if (typeof process === "undefined") return;
  
  if (saveTimer) clearTimeout(saveTimer);
  
  saveTimer = setTimeout(() => {
    try {
      const data = JSON.stringify(Array.from(tables.entries()));
      writeFileSync(STORAGE_FILE, data, "utf-8");
    } catch (err) {
      console.warn("[Glimpse] Could not save tables to disk:", err);
    }
  }, 100); // Debounce 100ms
}

// Initialize tables from disk or globalThis (for HMR compatibility)
declare global {
  // eslint-disable-next-line no-var
  var __glimpseTables: Map<string, GameState> | undefined;
}

const tables = globalThis.__glimpseTables ?? loadTablesFromDisk();
if (!globalThis.__glimpseTables) {
  globalThis.__glimpseTables = tables;
  console.log(`[Glimpse] Initialized with ${tables.size} table(s) from disk`);
}

export function createTable(): string {
  // Generate uppercase table code
  const tableId = Math.random().toString(36).substring(2, 8).toUpperCase();
  tables.set(tableId, {
    tableId,
    players: [],
    currentClipId: null,
    phase: "lobby",
    guesses: [],
    chat: [],
    clipPlaying: false,
    clipPosition: 0,
    revealedTitle: false,
    sessionPaused: false,
    phaseStartTime: null,
    phaseDeadline: null,
    routine: null,
    waitingForReady: false,
    readyDeadline: null,
    segmentLadder: null,
    voteState: null,
    library: {
      clips: migrateClipsToLibrary(), // Seed with migrated clips
      playlists: [],
    },
  });
  saveTablesToDisk();
  return tableId;
}

export function getTable(tableId: string): GameState | undefined {
  // Normalize lookup to uppercase
  return tables.get(tableId.toUpperCase());
}

function addSystemMessage(tableId: string, text: string): void {
  const table = getTable(tableId);
  if (!table) return;

  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    playerId: null,
    playerName: "System",
    text,
    timestamp: Date.now(),
    isSystem: true,
  };

  table.chat.push(message);
}

export function joinTable(tableId: string, playerName: string): Player | null {
  const table = getTable(tableId);
  if (!table) return null;

  const playerId = Math.random().toString(36).substring(2, 15);
  const isFirstPlayer = table.players.length === 0;
  const isMidRound = table.phase !== "lobby" && table.currentClipId !== null;
  
  const player: Player = {
    id: playerId,
    name: playerName,
    score: 0,
    isHost: isFirstPlayer,
    lockedIn: false,
    joinedMidRound: isMidRound,
    ready: false,
  };

  table.players.push(player);
  
  if (isMidRound) {
    addSystemMessage(tableId, `${playerName} joined (will play next round)`);
  } else {
    addSystemMessage(tableId, `${playerName} joined the table`);
  }
  
  saveTablesToDisk();
  return player;
}

export function updateTable(tableId: string, updates: Partial<GameState>): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  Object.assign(table, updates);
  saveTablesToDisk();
  return true;
}

export function addGuess(tableId: string, playerId: string, text: string, locked: boolean = false): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;
  
  // If player is already locked in, reject (no-op false)
  if (player.lockedIn) return false;
  
  // If player joined mid-round, they cannot participate in current clip
  if (player.joinedMidRound) return false;

  // Remove previous guess from this player
  table.guesses = table.guesses.filter((g) => g.playerId !== playerId);

  const guess: Guess = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
    locked,
  };

  table.guesses.push(guess);

  if (locked) {
    player.lockedIn = true;
    addSystemMessage(tableId, `${player.name} locked in`);
  }

  saveTablesToDisk();
  return true;
}

export function addChatMessage(
  tableId: string,
  playerId: string,
  text: string,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const message: ChatMessage = {
    id: Math.random().toString(36).substring(2, 15),
    playerId,
    playerName: player.name,
    text,
    timestamp: Date.now(),
    isSystem: false,
  };

  table.chat.push(message);
  saveTablesToDisk();
  return true;
}

export function updatePlayerScore(
  tableId: string,
  playerId: string,
  score: number,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  const oldScore = player.score;
  player.score = score;
  
  if (score !== oldScore) {
    const delta = score - oldScore;
    addSystemMessage(
      tableId,
      `${player.name} ${delta > 0 ? "+" : ""}${delta} → ${score}`,
    );
  }
  
  saveTablesToDisk();
  return true;
}

export function startRound(tableId: string, clipId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = clipId;
  table.phase = "playing";
  table.guesses = [];
  table.clipPlaying = false; // Don't start playing until all clients ready
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  table.waitingForReady = true; // Wait for ready handshake
  table.readyDeadline = Date.now() + READY_TIMEOUT_SEC * 1000; // Set timeout
  
  // Initialize segment ladder for progressive playback
  table.segmentLadder = resetSegmentLadder();
  
  // Initialize vote state
  const eligibleCount = table.players.filter((p) => !p.joinedMidRound).length;
  table.voteState = {
    advanceVotes: [],
    hintVotes: [],
    threshold: Math.ceil(eligibleCount / 2),
  };
  
  // Set phase timing (will start counting when all players ready)
  const now = Date.now();
  table.phaseStartTime = now;
  table.phaseDeadline = now + PHASE_DURATIONS.playing;
  
  // Reset all players' locked-in state, clear mid-round join flags, and reset ready
  table.players.forEach((p) => {
    p.lockedIn = false;
    p.joinedMidRound = false;
    p.ready = false;
  });
  
  addSystemMessage(tableId, "Round started — waiting for all players to load...");
  saveTablesToDisk();
  return true;
}

export function setClipState(
  tableId: string,
  playing: boolean,
  position: number,
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.clipPlaying = playing;
  table.clipPosition = position;
  saveTablesToDisk();
  return true;
}

export function lockGuesses(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.phase = "judging";
  table.clipPlaying = false;
  
  // Set phase timing
  const now = Date.now();
  table.phaseStartTime = now;
  table.phaseDeadline = now + PHASE_DURATIONS.judging;
  
  // Lock all submitted guesses
  table.guesses.forEach((g) => (g.locked = true));
  table.players.forEach((p) => {
    if (table.guesses.some((g) => g.playerId === p.id)) {
      p.lockedIn = true;
    }
  });
  
  addSystemMessage(tableId, "Guesses locked — judging");
  saveTablesToDisk();
  return true;
}

export function revealTitle(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.phase = "reveal";
  table.revealedTitle = true;
  
  // Set phase timing
  const now = Date.now();
  table.phaseStartTime = now;
  table.phaseDeadline = now + PHASE_DURATIONS.reveal;
  
  addSystemMessage(tableId, "Title revealed");
  saveTablesToDisk();
  return true;
}

export function resetRound(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = null;
  table.phase = "lobby";
  table.guesses = [];
  table.clipPlaying = false;
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  table.phaseStartTime = null;
  table.phaseDeadline = null;
  table.waitingForReady = false;
  table.readyDeadline = null;
  
  // Reset all players' locked-in state, clear mid-round flags, and reset ready
  table.players.forEach((p) => {
    p.lockedIn = false;
    p.joinedMidRound = false;
    p.ready = false;
  });
  
  addSystemMessage(tableId, "Round reset — back to lobby");
  saveTablesToDisk();
  return true;
}

export function pauseSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.sessionPaused = true;
  table.clipPlaying = false;
  
  addSystemMessage(tableId, "Session paused");
  saveTablesToDisk();
  return true;
}

export function resumeSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.sessionPaused = false;
  
  addSystemMessage(tableId, "Session resumed");
  saveTablesToDisk();
  return true;
}

export function restartSession(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.currentClipId = null;
  table.phase = "lobby";
  table.guesses = [];
  table.clipPlaying = false;
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  table.phaseStartTime = null;
  table.phaseDeadline = null;
  table.waitingForReady = false;
  table.readyDeadline = null;
  
  // Reset all players' locked-in state, mid-round flags, and ready state but keep scores
  table.players.forEach((p) => {
    p.lockedIn = false;
    p.joinedMidRound = false;
    p.ready = false;
  });
  
  addSystemMessage(tableId, "Session restarted");
  saveTablesToDisk();
  return true;
}

// ============================================================================
// READY HANDSHAKE - Multiplayer sync before playback
// ============================================================================

export function reportPlayerReady(
  tableId: string,
  playerId: string
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false;

  player.ready = true;

  // Check if all participating players are now ready (exclude mid-round joiners)
  const participatingPlayers = table.players.filter((p) => !p.joinedMidRound);
  if (table.waitingForReady && participatingPlayers.every((p) => p.ready)) {
    // All participating players ready - start playback!
    table.waitingForReady = false;
    table.readyDeadline = null; // Clear timeout
    table.clipPlaying = true;

    // If running a routine, set the phase deadline now
    if (table.routine && table.routine.status === "running") {
      table.routine.phaseDeadline =
        Date.now() + table.routine.config.guessDurationSec * 1000;
    }

    addSystemMessage(tableId, "All players ready — clip playing!");
  }

  saveTablesToDisk();
  return true;
}

export function forceStartAnyway(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;
  
  // Only works if actually waiting for ready
  if (!table.waitingForReady) return false;
  
  // Force start even if not all players ready
  table.waitingForReady = false;
  table.readyDeadline = null;
  table.clipPlaying = true;
  
  // If running a routine, set the phase deadline now
  if (table.routine && table.routine.status === "running") {
    table.routine.phaseDeadline =
      Date.now() + table.routine.config.guessDurationSec * 1000;
  }
  
  // Count only participating players for accurate ready status
  const participatingPlayers = table.players.filter((p) => !p.joinedMidRound);
  const readyCount = participatingPlayers.filter((p) => p.ready).length;
  addSystemMessage(
    tableId,
    `Host started anyway (${readyCount}/${participatingPlayers.length} ready)`
  );
  
  saveTablesToDisk();
  return true;
}

// ============================================================================
// ROUTINE ORCHESTRATION
// ============================================================================

export function configureRoutine(
  tableId: string,
  config: RoutineConfig
): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  // Only allow configuration when idle or not running
  if (table.routine?.status === "running") {
    return false;
  }

  // Create or update routine with idle status
  table.routine = {
    status: "idle",
    currentIndex: 0,
    phaseDeadline: null,
    pausedRemainingMs: null,
    config,
  };

  addSystemMessage(
    tableId,
    `Routine configured: ${config.playlist.length} clips, ${config.guessDurationSec}s guess time`
  );
  saveTablesToDisk();
  return true;
}

export function startRoutine(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  if (!table.routine || table.routine.config.playlist.length === 0) {
    return false;
  }

  // Reset to beginning if idle/stopped
  if (table.routine.status === "idle" || table.routine.status === "stopped") {
    table.routine.currentIndex = 0;
  }

  table.routine.status = "running";

  // Start first clip but wait for ready handshake
  const clipId = table.routine.config.playlist[table.routine.currentIndex];
  if (!clipId) return false;

  table.currentClipId = clipId;
  table.phase = "playing";
  table.guesses = [];
  table.clipPlaying = false; // Don't start playing until all clients ready
  table.clipPosition = 0;
  table.revealedTitle = false;
  table.sessionPaused = false;
  table.waitingForReady = true; // Wait for ready handshake
  table.readyDeadline = Date.now() + READY_TIMEOUT_SEC * 1000; // Set timeout
  table.players.forEach((p) => {
    p.lockedIn = false;
    p.ready = false;
  });

  // Don't set deadline yet - will be set when all clients are ready
  table.routine.phaseDeadline = null;
  table.routine.pausedRemainingMs = null;

  addSystemMessage(
    tableId,
    `Routine started: Round ${table.routine.currentIndex + 1}/${table.routine.config.playlist.length} — waiting for all players to load...`
  );
  saveTablesToDisk();
  return true;
}

export function pauseRoutine(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  if (table.routine?.status !== "running") return false;

  // Store remaining time
  if (table.routine.phaseDeadline) {
    table.routine.pausedRemainingMs = table.routine.phaseDeadline - Date.now();
    if (table.routine.pausedRemainingMs < 0) {
      table.routine.pausedRemainingMs = 0;
    }
  }

  table.routine.status = "paused";
  table.routine.phaseDeadline = null;
  table.clipPlaying = false;
  table.sessionPaused = true;

  addSystemMessage(tableId, "Routine paused");
  saveTablesToDisk();
  return true;
}

export function resumeRoutine(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  if (table.routine?.status !== "paused") return false;

  // Restore deadline
  if (table.routine.pausedRemainingMs !== null) {
    table.routine.phaseDeadline = Date.now() + table.routine.pausedRemainingMs;
    table.routine.pausedRemainingMs = null;
  }

  table.routine.status = "running";
  table.sessionPaused = false;

  // Resume clip if in playing phase
  if (table.phase === "playing") {
    table.clipPlaying = true;
  }

  addSystemMessage(tableId, "Routine resumed");
  saveTablesToDisk();
  return true;
}

export function stopRoutine(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  if (!table.routine) return false;

  table.routine.status = "stopped";
  table.routine.phaseDeadline = null;
  table.routine.pausedRemainingMs = null;
  table.routine.currentIndex = 0;

  // Return to idle state
  table.phase = "lobby";
  table.clipPlaying = false;
  table.sessionPaused = false;
  table.waitingForReady = false;
  table.readyDeadline = null;
  table.players.forEach((p) => {
    p.lockedIn = false;
    p.ready = false;
  });

  addSystemMessage(tableId, "Routine stopped");
  saveTablesToDisk();
  return true;
}

export function skipPhase(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  if (table.routine?.status !== "running") return false;

  // Force immediate phase advance by setting deadline to now
  table.routine.phaseDeadline = Date.now();

  addSystemMessage(tableId, "Phase skipped");
  saveTablesToDisk();
  return true;
}

// ============================================================================
// ORCHESTRATION TICK - Server-driven phase advancement
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var __glimpseOrchestrationInterval: NodeJS.Timeout | undefined;
}

function advanceRoutinePhase(table: GameState): void {
  if (!table.routine || table.routine.status !== "running") return;

  const { phase } = table;
  const { config, currentIndex } = table.routine;

  switch (phase) {
    case "playing": {
      // Advance to judging
      table.phase = "judging";
      table.clipPlaying = false;

      // Lock all guesses
      table.guesses.forEach((g) => (g.locked = true));
      table.players.forEach((p) => {
        if (table.guesses.some((g) => g.playerId === p.id)) {
          p.lockedIn = true;
        }
      });

      table.routine.phaseDeadline =
        Date.now() + config.judgingDurationSec * 1000;

      addSystemMessage(table.tableId, "Guesses locked — judging");
      saveTablesToDisk();
      break;
    }

    case "judging": {
      // Advance to reveal
      table.phase = "reveal";
      table.revealedTitle = true;

      table.routine.phaseDeadline =
        Date.now() + config.revealDurationSec * 1000;

      addSystemMessage(table.tableId, "Title revealed");
      saveTablesToDisk();
      break;
    }

    case "reveal": {
      // Check if there are more clips
      const nextIndex = currentIndex + 1;

      if (nextIndex < config.playlist.length && config.autoAdvance) {
        // Advance to next clip
        table.routine.currentIndex = nextIndex;
        const nextClipId = config.playlist[nextIndex];
        if (!nextClipId) {
          // Shouldn't happen, but handle gracefully
          table.routine.status = "idle";
          table.phase = "lobby";
          addSystemMessage(table.tableId, "Routine complete");
          return;
        }

        // Start next clip but wait for ready handshake
        table.currentClipId = nextClipId;
        table.phase = "playing";
        table.guesses = [];
        table.clipPlaying = false; // Don't play until all clients ready
        table.clipPosition = 0;
        table.revealedTitle = false;
        table.waitingForReady = true;
        table.readyDeadline = Date.now() + READY_TIMEOUT_SEC * 1000; // Set timeout
        table.players.forEach((p) => {
          p.lockedIn = false;
          p.ready = false;
        });

        // Don't set deadline yet - will be set when all clients are ready
        table.routine.phaseDeadline = null;

        addSystemMessage(
          table.tableId,
          `Round ${nextIndex + 1}/${config.playlist.length} — waiting for all players to load...`
        );
        saveTablesToDisk();
      } else {
        // End of routine or autoAdvance disabled
        table.routine.status = "idle";
        table.phase = "lobby";
        table.routine.phaseDeadline = null;

        addSystemMessage(table.tableId, "Routine complete — back to lobby");
        saveTablesToDisk();
      }
      break;
    }

    default:
      // Shouldn't happen during routine
      break;
  }
}

function allEligiblePlayersLocked(table: GameState): boolean {
  const eligiblePlayers = table.players.filter((p) => !p.joinedMidRound);
  if (eligiblePlayers.length === 0) return false;
  
  return eligiblePlayers.every((p) => p.lockedIn);
}

export function tickOrchestration(): void {
  const now = Date.now();

  for (const table of tables.values()) {
    if (!table.routine || table.routine.status !== "running") continue;
    if (!table.routine.phaseDeadline) continue;

    // Early advance: if all eligible players locked in during playing phase, skip to judging
    if (table.phase === "playing" && allEligiblePlayersLocked(table)) {
      addSystemMessage(table.tableId, "All players locked in — advancing to judging");
      advanceRoutinePhase(table);
      continue;
    }

    // Check if deadline has passed
    if (now >= table.routine.phaseDeadline) {
      advanceRoutinePhase(table);
    }
  }
}

// Start global orchestration tick (HMR-safe)
if (typeof globalThis !== "undefined" && !globalThis.__glimpseOrchestrationInterval) {
  globalThis.__glimpseOrchestrationInterval = setInterval(tickOrchestration, 250);
  console.log("[Glimpse] Orchestration tick started");
}

// ============================================================================
// LIBRARY MANAGEMENT - Clip CRUD operations
// ============================================================================

export function addClipToLibrary(tableId: string, clip: LibraryClip): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  // Check for duplicate ID
  if (table.library.clips.some((c) => c.id === clip.id)) {
    return false;
  }

  table.library.clips.push(clip);
  addSystemMessage(tableId, `Clip added: ${clip.title}`);
  saveTablesToDisk();
  return true;
}

export function updateClipInLibrary(tableId: string, clipId: string, updates: Partial<LibraryClip>): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const clipIndex = table.library.clips.findIndex((c) => c.id === clipId);
  if (clipIndex === -1) return false;

  table.library.clips[clipIndex] = {
    ...table.library.clips[clipIndex]!,
    ...updates,
    updatedAt: Date.now(),
  };

  saveTablesToDisk();
  return true;
}

export function removeClipFromLibrary(tableId: string, clipId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const initialLength = table.library.clips.length;
  table.library.clips = table.library.clips.filter((c) => c.id !== clipId);

  if (table.library.clips.length === initialLength) {
    return false; // Clip not found
  }

  // Remove from all playlists
  table.library.playlists.forEach((playlist) => {
    playlist.clipIds = playlist.clipIds.filter((id) => id !== clipId);
  });

  addSystemMessage(tableId, `Clip removed from library`);
  saveTablesToDisk();
  return true;
}

export function createPlaylist(tableId: string, name: string, clipIds: string[] = []): string | null {
  const table = getTable(tableId);
  if (!table) return null;

  const playlistId = `playlist_${Math.random().toString(36).substring(2, 15)}`;
  const now = Date.now();

  const playlist: Playlist = {
    id: playlistId,
    name,
    clipIds,
    createdAt: now,
    updatedAt: now,
  };

  table.library.playlists.push(playlist);
  saveTablesToDisk();
  return playlistId;
}

export function updatePlaylist(tableId: string, playlistId: string, updates: Partial<Omit<Playlist, "id" | "createdAt">>): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const playlistIndex = table.library.playlists.findIndex((p) => p.id === playlistId);
  if (playlistIndex === -1) return false;

  table.library.playlists[playlistIndex] = {
    ...table.library.playlists[playlistIndex]!,
    ...updates,
    updatedAt: Date.now(),
  };

  saveTablesToDisk();
  return true;
}

export function removePlaylist(tableId: string, playlistId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const initialLength = table.library.playlists.length;
  table.library.playlists = table.library.playlists.filter((p) => p.id !== playlistId);

  if (table.library.playlists.length === initialLength) {
    return false;
  }

  saveTablesToDisk();
  return true;
}

// ============================================================================
// SEGMENT LADDER - Progressive duration playback
// ============================================================================

export function initializeSegmentLadder(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.segmentLadder = resetSegmentLadder();
  saveTablesToDisk();
  return true;
}

export function advanceToNextSegment(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table || !table.segmentLadder) return false;

  const { currentSegmentIndex, segmentDurations } = table.segmentLadder;
  if (currentSegmentIndex >= segmentDurations.length - 1) {
    return false; // Already at max
  }

  table.segmentLadder.currentSegmentIndex += 1;
  const newDuration = segmentDurations[table.segmentLadder.currentSegmentIndex];

  // Clear advance votes when segment changes (whether by vote or host override)
  if (table.voteState) {
    table.voteState.advanceVotes = [];
  }

  addSystemMessage(tableId, `Advanced to ${newDuration}s segment`);
  saveTablesToDisk();
  return true;
}

export function recalculateVoteThreshold(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table || !table.voteState) return false;

  const eligibleCount = table.players.filter((p) => !p.joinedMidRound).length;
  table.voteState.threshold = Math.ceil(eligibleCount / 2);

  saveTablesToDisk();
  return true;
}

export function resetSegmentLadderState(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.segmentLadder = null;
  saveTablesToDisk();
  return true;
}

// ============================================================================
// VOTING SYSTEM - Player votes for segment advance and hints
// ============================================================================

export function initializeVoteState(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  const eligibleCount = table.players.filter((p) => !p.joinedMidRound).length;
  const threshold = Math.ceil(eligibleCount / 2); // Majority

  table.voteState = {
    advanceVotes: [],
    hintVotes: [],
    threshold,
  };

  saveTablesToDisk();
  return true;
}

export function castVote(tableId: string, playerId: string, voteType: "advance" | "hint"): boolean {
  const table = getTable(tableId);
  if (!table || !table.voteState) return false;

  // Validate player eligibility
  const player = table.players.find((p) => p.id === playerId);
  if (!player) return false; // Player not found
  if (player.joinedMidRound) return false; // Mid-round joiners can't vote
  
  // Prevent duplicate votes (idempotent - same vote = no-op, not error)
  const voteArray = voteType === "advance" ? table.voteState.advanceVotes : table.voteState.hintVotes;
  if (voteArray.includes(playerId)) {
    // Already voted - this is a no-op success
    return true;
  }

  // Add vote
  if (voteType === "advance") {
    table.voteState.advanceVotes.push(playerId);
  } else if (voteType === "hint") {
    table.voteState.hintVotes.push(playerId);
  }

  // Recalculate threshold based on current eligible players
  // (in case players joined/left since vote state was initialized)
  const eligibleCount = table.players.filter((p) => !p.joinedMidRound).length;
  table.voteState.threshold = Math.ceil(eligibleCount / 2);

  // Check if threshold reached
  const votes = voteType === "advance" ? table.voteState.advanceVotes : table.voteState.hintVotes;
  const thresholdMet = votes.length >= table.voteState.threshold;
  
  if (thresholdMet) {
    if (voteType === "advance") {
      // Auto-advance segment if possible
      const advanceSuccess = advanceToNextSegment(tableId);
      if (advanceSuccess) {
        addSystemMessage(
          tableId, 
          `Vote passed (${votes.length}/${table.voteState.threshold}): advancing segment`
        );
      } else {
        addSystemMessage(
          tableId, 
          `Vote passed but already at final segment`
        );
      }
      // Reset advance votes after execution (successful or not)
      table.voteState.advanceVotes = [];
    } else {
      // Reveal hint
      addSystemMessage(
        tableId, 
        `Vote passed (${votes.length}/${table.voteState.threshold}): revealing hint`
      );
      // TODO: Wire actual hint reveal (e.g., reveal one letter from title)
      // For now, stub as a system message
      table.voteState.hintVotes = [];
    }
  }

  saveTablesToDisk();
  return true;
}

export function resetVoteState(tableId: string): boolean {
  const table = getTable(tableId);
  if (!table) return false;

  table.voteState = null;
  saveTablesToDisk();
  return true;
}
