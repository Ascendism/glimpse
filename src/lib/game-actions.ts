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
} from "./game-state";

export const createTable = createServerFn("POST", async () => {
  const tableId = createTableInMemory();
  return { tableId };
});

export const fetchGameState = createServerFn("GET", async (tableId: string) => {
  const table = getTable(tableId);
  if (!table) {
    throw new Error("Table not found");
  }
  return { table };
});

export const joinTable = createServerFn(
  "POST",
  async ({ tableId, playerName }: { tableId: string; playerName: string }) => {
    const player = joinTableInMemory(tableId, playerName);
    if (!player) {
      throw new Error("Table not found");
    }
    return { player };
  },
);

export const submitGuess = createServerFn(
  "POST",
  async ({ tableId, playerId, text, locked }: { tableId: string; playerId: string; text: string; locked?: boolean }) => {
    const success = addGuessInMemory(tableId, playerId, text, locked ?? false);
    if (!success) {
      throw new Error("Failed to add guess");
    }
    return { success: true };
  },
);

export const sendChatMessage = createServerFn(
  "POST",
  async ({ tableId, playerId, text }: { tableId: string; playerId: string; text: string }) => {
    const success = addChatMessageInMemory(tableId, playerId, text);
    if (!success) {
      throw new Error("Failed to send message");
    }
    return { success: true };
  },
);

export const performHostAction = createServerFn(
  "POST",
  async ({
    tableId,
    action,
    payload,
  }: {
    tableId: string;
    action: string;
    payload?: Record<string, unknown>;
  }) => {
    let success = false;

    switch (action) {
      case "start_round":
        success = startRoundInMemory(tableId, payload?.clipId as string);
        break;
      case "lock_guesses":
        success = lockGuessesInMemory(tableId);
        break;
      case "reveal_title":
        success = revealTitleInMemory(tableId);
        break;
      case "reset_round":
        success = resetRoundInMemory(tableId);
        break;
      case "update_score":
        success = updatePlayerScore(tableId, payload?.playerId as string, payload?.score as number);
        break;
      case "set_clip_state":
        success = setClipStateInMemory(
          tableId,
          payload?.playing as boolean,
          payload?.position as number,
        );
        break;
      case "pause_session":
        success = pauseSessionInMemory(tableId);
        break;
      case "resume_session":
        success = resumeSessionInMemory(tableId);
        break;
      case "restart_session":
        success = restartSessionInMemory(tableId);
        break;
      default:
        throw new Error("Unknown action");
    }

    if (!success) {
      throw new Error("Action failed");
    }

    return { success: true };
  },
);
