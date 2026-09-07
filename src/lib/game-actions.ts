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
  type RoutineConfig,
} from "./game-state";

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
