import { loadPersonalClips, savePersonalClip, deletePersonalClip } from "./personal-library.server";
import { getCookie, setCookie, getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { currentDiscordId } from "./auth-session.server";
import {
  claimHost,
  finishGame,
  authorizeSeat,
  publicState,
  leaveTable as leaveSeat,
} from "./game-state";
import { createServerFn } from "@tanstack/react-start";
import {
  createTable as createTableInMemory,
  getTable,
  joinTable as joinTableInMemory,
  addGuess as addGuessInMemory,
  addChatMessage as addChatMessageInMemory,
  updatePlayerScore,
  adjustPlayerScore,
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
  revealHint as revealHintInMemory,
  type RoutineConfig,
} from "./game-state";
import type { LibraryClip, Playlist } from "./library";

const code = z
  .string()
  .trim()
  .min(1)
  .max(12)
  .transform((s) => s.toUpperCase());
const name = z.string().trim().min(1, "Enter your name").max(40);
const seatSchema = z.object({ tableId: code, playerId: z.string().uuid() });
const roundSchema = seatSchema.extend({ roundId: z.string().uuid() });
function issueSeat(player: NonNullable<ReturnType<typeof joinTableInMemory>>) {
  setCookie("glimpse_seat_" + player.id, player.seatToken!, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(getRequest().url).protocol === "https:",
    path: "/",
    maxAge: 7 * 86400,
  });
  const { seatToken, ...safe } = player;
  return safe;
}
function requireSeat(data: { tableId: string; playerId?: string | undefined }, host = false) {
  return authorizeSeat(
    data.tableId,
    data.playerId || "",
    getCookie("glimpse_seat_" + data.playerId),
    host,
  );
}
export const createTable = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ hostName: name }).parse(data))
  .handler(async ({ data }) => {
    const discordId = currentDiscordId();
    const tableId = createTableInMemory();
    for (const clip of loadPersonalClips()) {
      const existing = getTable(tableId)!.library.clips.find((c) => c.id === clip.id);
      if (existing) updateClipInLibraryInMemory(tableId, clip.id, clip);
      else addClipToLibraryInMemory(tableId, clip);
    }
    const player = joinTableInMemory(tableId, data.hostName, discordId)!;
    return { tableId, player: issueSeat(player) };
  });
export const fetchGameState = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ tableId: code, playerId: z.string().optional() }).parse(data),
  )
  .handler(async ({ data }) => {
    const table = getTable(data.tableId);
    if (!table) throw new Error("Table not found. Check the code or create a new table.");
    const viewer = data.playerId ? requireSeat(data) : undefined;
    if (viewer) viewer.lastSeenAt = Date.now();
    return { table: publicState(table, viewer) };
  });
export const joinTable = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({ tableId: code, playerName: name }).parse(data))
  .handler(async ({ data }) => {
    const table = getTable(data.tableId);
    if (!table) throw new Error("Table not found. Check the code.");
    const discordId = currentDiscordId();
    const existing = table.players.find(
      (p) =>
        (discordId && p.discordId === discordId) ||
        p.name.toLowerCase() === data.playerName.toLowerCase(),
    );
    if (
      existing &&
      ((discordId && existing.discordId === discordId) ||
        (existing.seatToken && getCookie("glimpse_seat_" + existing.id) === existing.seatToken))
    ) {
      existing.lastSeenAt = Date.now();
      return { player: issueSeat(existing), tableId: data.tableId };
    }
    const player = joinTableInMemory(data.tableId, data.playerName, discordId);
    if (!player)
      throw new Error(
        "That name or Discord account already has a seat, or the table is full (32 players).",
      );
    return { player: issueSeat(player), tableId: data.tableId };
  });
export const leaveTable = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string }) => {
    seatSchema.parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data);
    leaveSeat(data.tableId, data.playerId);
    return { success: true };
  });

export const submitGuess = createServerFn({ method: "POST" })
  .validator(
    (data: {
      tableId: string;
      roundId: string;
      playerId: string;
      text: string;
      locked?: boolean;
    }) => {
      roundSchema
        .extend({ text: z.string().trim().min(1).max(200), locked: z.boolean().optional() })
        .parse(data);
      return data;
    },
  )
  .handler(async ({ data }) => {
    requireSeat(data, false);
    if (!data.roundId || data.roundId !== getTable(data.tableId)?.roundId)
      throw new Error("Round changed. Please try again.");
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
  .validator((data: { tableId: string; playerId: string; text: string }) => {
    seatSchema.extend({ text: z.string().trim().min(1).max(500) }).parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, false);
    const { tableId, playerId, text } = data;
    if (typeof text !== "string" || !text.trim() || text.length > 500) {
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
  .validator((data: { tableId: string; roundId: string; playerId: string }) => {
    roundSchema.parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, false);
    if (!data.roundId || data.roundId !== getTable(data.tableId)?.roundId)
      throw new Error("Round changed. Please try again.");
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
  .validator(
    (data: {
      tableId: string;
      action: string;
      payload?: Record<string, unknown>;
      playerId: string;
    }) => {
      seatSchema
        .extend({ action: z.string().min(1).max(40), payload: z.record(z.unknown()).optional() })
        .parse(data);
      return data;
    },
  )
  .handler(async ({ data }) => {
    requireSeat(data, true);
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
      case "finish_game":
        success = finishGame(normalizedTableId);
        break;
      case "start_round":
        success = startRoundInMemory(normalizedTableId, payload?.["clipId"] as string);
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
        success = updatePlayerScore(
          normalizedTableId,
          payload?.["playerId"] as string,
          payload?.["score"] as number,
        );
        break;
      case "adjust_score":
        success = adjustPlayerScore(
          normalizedTableId,
          payload?.["playerId"] as string,
          payload?.["delta"] as number,
        );
        break;
      case "set_clip_state":
        if (!payload?.["roundId"] || payload["roundId"] !== table.roundId)
          throw new Error("Round changed");
        success = setClipStateInMemory(
          normalizedTableId,
          payload?.["playing"] as boolean,
          payload?.["position"] as number,
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
        success = configureRoutineInMemory(normalizedTableId, payload?.["config"] as RoutineConfig);
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
      case "reveal_hint":
        success = revealHintInMemory(normalizedTableId);
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
  .validator((data: { tableId: string; playerId: string; clip: LibraryClip }) => data)
  .handler(async ({ data }) => {
    requireSeat(data, true);
    const { tableId, clip } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = addClipToLibraryInMemory(normalizedTableId, clip);
    if (!success) {
      throw new Error("Failed to add clip");
    }
    savePersonalClip(clip);
    return { success: true };
  });

export const updateClipInLibrary = createServerFn({ method: "POST" })
  .validator(
    (data: { tableId: string; playerId: string; clipId: string; updates: Partial<LibraryClip> }) =>
      data,
  )
  .handler(async ({ data }) => {
    requireSeat(data, true);
    const { tableId, clipId, updates } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = updateClipInLibraryInMemory(normalizedTableId, clipId, updates);
    if (!success) {
      throw new Error("Failed to update clip. Stop the current round before editing its clip.");
    }
    savePersonalClip(getTable(normalizedTableId)!.library.clips.find((c) => c.id === clipId)!);
    return { success: true };
  });

export const removeClipFromLibrary = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; clipId: string }) => {
    seatSchema.extend({ clipId: z.string().min(1).max(100) }).parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, true);
    const { tableId, clipId } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = removeClipFromLibraryInMemory(normalizedTableId, clipId);
    if (!success) {
      throw new Error("Failed to remove clip. Stop the current round before deleting its clip.");
    }
    deletePersonalClip(clipId);
    return { success: true };
  });

export const createPlaylist = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; name: string; clipIds?: string[] }) => {
    seatSchema
      .extend({
        name: z.string().trim().min(1).max(80),
        clipIds: z.array(z.string()).max(100).optional(),
      })
      .parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, true);
    const { tableId, name, clipIds } = data;
    const normalizedTableId = tableId.toUpperCase();
    const playlistId = createPlaylistInMemory(normalizedTableId, name, clipIds);
    if (!playlistId) {
      throw new Error("Failed to create playlist");
    }
    return { playlistId };
  });

export const updatePlaylist = createServerFn({ method: "POST" })
  .validator(
    (data: {
      tableId: string;
      playerId: string;
      playlistId: string;
      updates: Partial<Omit<Playlist, "id" | "createdAt">>;
    }) => {
      seatSchema
        .extend({
          playlistId: z.string(),
          updates: z
            .object({
              name: z.string().trim().min(1).max(80).optional(),
              clipIds: z.array(z.string()).max(100).optional(),
              updatedAt: z.number().optional(),
            })
            .strict(),
        })
        .parse(data);
      return data;
    },
  )
  .handler(async ({ data }) => {
    requireSeat(data, true);
    const { tableId, playlistId, updates } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = updatePlaylistInMemory(normalizedTableId, playlistId, updates);
    if (!success) {
      throw new Error("Failed to update playlist");
    }
    return { success: true };
  });

export const removePlaylist = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string; playlistId: string }) => {
    seatSchema.extend({ playlistId: z.string().min(1).max(100) }).parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, true);
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
  .validator((data: { tableId: string; playerId: string }) => {
    seatSchema.parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data, true);
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
  .validator(
    (data: { tableId: string; roundId: string; playerId: string; voteType: "advance" | "hint" }) =>
      data,
  )
  .handler(async ({ data }) => {
    requireSeat(data, false);
    if (!data.roundId || data.roundId !== getTable(data.tableId)?.roundId)
      throw new Error("Round changed. Please try again.");
    const { tableId, playerId, voteType } = data;
    const normalizedTableId = tableId.toUpperCase();
    const success = castVoteInMemory(normalizedTableId, playerId, voteType);
    if (!success) {
      throw new Error("Failed to cast vote");
    }
    return { success: true };
  });

export const takeOverHost = createServerFn({ method: "POST" })
  .validator((data: { tableId: string; playerId: string }) => {
    seatSchema.parse(data);
    return data;
  })
  .handler(async ({ data }) => {
    requireSeat(data);
    if (!claimHost(data.tableId, data.playerId)) throw new Error("Host is still connected");
    return { success: true };
  });
