import { createServerFn } from "@tanstack/react-start";
import {
  createTable as createTableInMemory,
  getTable,
  joinTable as joinTableInMemory,
  addGuess as addGuessInMemory,
  addChatMessage as addChatMessageInMemory,
  updatePlayerScore,
  startRound as startRoundInMemory,
  lockGuesses as lockGuessesInMemory,
  revealTitle as revealTitleInMemory,
  resetRound as resetRoundInMemory,
  setClipState as setClipStateInMemory,
  pauseSession as pauseSessionInMemory,
  resumeSession as resumeSessionInMemory,
  restartSession as restartSessionInMemory,
  reportPlayerReady as reportPlayerReadyInMemory,
  forceStartAnyway as forceStartAnywayInMemory,
  configureRoutine as configureRoutineInMemory,
  startRoutine as startRoutineInMemory,
  pauseRoutine as pauseRoutineInMemory,
  resumeRoutine as resumeRoutineInMemory,
  stopRoutine as stopRoutineInMemory,
  skipPhase as skipPhaseInMemory,
  addClipToLibrary as addClipToLibraryInMemory,
  updateClipInLibrary as updateClipInLibraryInMemory,
  removeClipFromLibrary as removeClipFromLibraryInMemory,
  createPlaylist as createPlaylistInMemory,
  updatePlaylist as updatePlaylistInMemory,
  removePlaylist as removePlaylistInMemory,
  advanceToNextSegment as advanceToNextSegmentInMemory,
  castVote as castVoteInMemory,
  recalculateVoteThreshold as recalculateVoteThresholdInMemory,
  type RoutineConfig,
} from "./game-state";
import type { LibraryClip, Playlist } from "./library";

export const createTable = createServerFn({ method: "POST" })
  .validator((data: { hostName?: string }) => data)
  .handler(async ({ data }) => {
    const { hostName } = data;
    const tableId = createTableInMemory();
    
    // If hostName provided, auto-join the host
    if (hostName && hostName.trim()) {
      const player = joinTableInMemory(tableId, hostName.trim());
      if (player) {
        return { tableId, player };
      }
    }
    
    return { tableId, player: null };
  });

export const fetchGameState = createServerFn({ method: "GET" })
  .validator((data: string) => data)
  .handler(async ({ data: tableId }) => {
    // Normalize table code to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const table = getTable(normalizedTableId);
    if (!table) {
      throw new Error("Table not found");
    }
    return { table };
  });

export const joinTable = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerName: string }) => data)
  .handler(async ({ data }) => {
    const { tableId, playerName } = data;
    // Normalize table code to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const player = joinTableInMemory(normalizedTableId, playerName);
    if (!player) {
      throw new Error("Table not found");
    }
    return { player, tableId: normalizedTableId };
  });

export const submitGuess = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; text: string; locked?: boolean }) => data)
  .handler(async ({ data }) => {
    const { tableId, playerId, text, locked } = data;
    // Normalize tableId to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const table = getTable(normalizedTableId);
    if (!table) {
      throw new Error("Table not found");
    }
    
    // Server-side guards
    if (table.phase !== "playing") {
      throw new Error("Cannot guess: game is not in playing phase");
    }
    
    if (table.sessionPaused) {
      throw new Error("Cannot guess: session is paused");
    }
    
    const player = table.players.find((p) => p.id === playerId);
    // If already locked in, reject ANY further guess (update or lock)
    if (player?.lockedIn) {
      throw new Error("Cannot guess: you are already locked in");
    }
    
    // If player joined mid-round, they can't participate in current clip
    if (player?.joinedMidRound) {
      throw new Error("Cannot guess: you joined mid-round, wait for next clip");
    }
    
    const success = addGuessInMemory(normalizedTableId, playerId, text, locked ?? false);
    if (!success) {
      throw new Error("Failed to add guess");
    }
    return { success: true };
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; text: string }) => data)
  .handler(async ({ data }) => {
    const { tableId, playerId, text } = data;
    if (!text || !text.trim()) {
      throw new Error("Cannot send empty message");
    }
    
    // Normalize tableId to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const success = addChatMessageInMemory(normalizedTableId, playerId, text.trim());
    if (!success) {
      throw new Error("Failed to send message");
    }
    return { success: true };
  });

export const reportReady = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string }) => data)
  .handler(async ({ data }) => {
    const { tableId, playerId } = data;
    
    // Normalize tableId to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const success = reportPlayerReadyInMemory(normalizedTableId, playerId);
    if (!success) {
      throw new Error("Failed to report ready");
    }
    return { success: true };
  });

export const performHostAction = createServerFn({ method: "POST" })
  .validator((data: {
    tableId: string;
    action: string;
    payload?: Record<string, unknown>;
    playerId: string;
  }) => data)
  .handler(async ({ data }) => {
    const { tableId, action, payload, playerId } = data;
    // Verify player is host (required authorization)
    if (!playerId) {
      throw new Error("Unauthorized: playerId is required");
    }
    
    // Normalize tableId to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const table = getTable(normalizedTableId);
    if (!table) {
      throw new Error("Table not found");
    }
    
    const player = table.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error("Unauthorized: Player not found");
    }
    
    if (!player.isHost) {
      throw new Error("Unauthorized: Only host can perform this action");
    }

    let success = false;

    switch (action) {
      case "start_round":
        success = startRoundInMemory(normalizedTableId, payload?.clipId as string);
        break;
      case "lock_guesses":
        success = lockGuessesInMemory(normalizedTableId);
        break;
      case "reveal_title":
        success = revealTitleInMemory(normalizedTableId);
        break;
      case "reset_round":
        success = resetRoundInMemory(normalizedTableId);
        break;
      case "update_score":
        success = updatePlayerScore(normalizedTableId, payload?.playerId as string, payload?.score as number);
        break;
      case "set_clip_state":
        success = setClipStateInMemory(
          normalizedTableId,
          payload?.playing as boolean,
          payload?.position as number,
        );
        break;
      case "pause_session":
        success = pauseSessionInMemory(normalizedTableId);
        break;
      case "resume_session":
        success = resumeSessionInMemory(normalizedTableId);
        break;
      case "restart_session":
        success = restartSessionInMemory(normalizedTableId);
        break;
      case "force_start_anyway":
        success = forceStartAnywayInMemory(normalizedTableId);
        break;
      case "configure_routine":
        success = configureRoutineInMemory(normalizedTableId, payload?.config as RoutineConfig);
        break;
      case "start_routine":
        success = startRoutineInMemory(normalizedTableId);
        break;
      case "pause_routine":
        success = pauseRoutineInMemory(normalizedTableId);
        break;
      case "resume_routine":
        success = resumeRoutineInMemory(normalizedTableId);
        break;
      case "stop_routine":
        success = stopRoutineInMemory(normalizedTableId);
        break;
      case "skip_phase":
        success = skipPhaseInMemory(normalizedTableId);
        break;
      default:
        throw new Error("Unknown action");
    }

    if (!success) {
      throw new Error("Action failed");
    }

    return { success: true };
  });

// ============================================================================
// LIBRARY MANAGEMENT
// ============================================================================

export const addClipToLibrary = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; clip: LibraryClip }) => data)
  .handler(async ({ data }) => {
    const { tableId, clip } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = addClipToLibraryInMemory(normalizedTableId, clip);
    if (!success) {
      throw new Error("Failed to add clip");
    }
    return { success: true };
  });

export const updateClipInLibrary = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; clipId: string; updates: Partial<LibraryClip> }) => data)
  .handler(async ({ data }) => {
    const { tableId, clipId, updates } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = updateClipInLibraryInMemory(normalizedTableId, clipId, updates);
    if (!success) {
      throw new Error("Failed to update clip");
    }
    return { success: true };
  });

export const removeClipFromLibrary = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; clipId: string }) => data)
  .handler(async ({ data }) => {
    const { tableId, clipId } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = removeClipFromLibraryInMemory(normalizedTableId, clipId);
    if (!success) {
      throw new Error("Failed to remove clip");
    }
    return { success: true };
  });

export const createPlaylist = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; name: string; clipIds?: string[] }) => data)
  .handler(async ({ data }) => {
    const { tableId, name, clipIds } = data;
    const normalizedTableId = tableId.toUpperCase();
    const playlistId = createPlaylistInMemory(normalizedTableId, name, clipIds);
    if (!playlistId) {
      throw new Error("Failed to create playlist");
    }
    return { playlistId };
  });

export const updatePlaylist = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playlistId: string; updates: Partial<Omit<Playlist, "id" | "createdAt">> }) => data)
  .handler(async ({ data }) => {
    const { tableId, playlistId, updates } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = updatePlaylistInMemory(normalizedTableId, playlistId, updates);
    if (!success) {
      throw new Error("Failed to update playlist");
    }
    return { success: true };
  });

export const removePlaylist = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playlistId: string }) => data)
  .handler(async ({ data }) => {
    const { tableId, playlistId } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = removePlaylistInMemory(normalizedTableId, playlistId);
    if (!success) {
      throw new Error("Failed to remove playlist");
    }
    return { success: true };
  });

// ============================================================================
// SEGMENT LADDER
// ============================================================================

export const advanceSegment = createServerFn({ method: "POST" })
  .validator((data: { tableId: string }) => data)
  .handler(async ({ data }) => {
    const { tableId } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = advanceToNextSegmentInMemory(normalizedTableId);
    if (!success) {
      throw new Error("Cannot advance segment");
    }
    return { success: true };
  });

// ============================================================================
// VOTING
// ============================================================================

export const castVote = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; voteType: "advance" | "hint" }) => data)
  .handler(async ({ data }) => {
    const { tableId, playerId, voteType } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = castVoteInMemory(normalizedTableId, playerId, voteType);
    if (!success) {
      throw new Error("Failed to cast vote");
    }
    return { success: true };
  });
