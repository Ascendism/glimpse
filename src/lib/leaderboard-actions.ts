import { createServerFn } from "@tanstack/react-start";
import { leaderboardDb, userDb, sessionDb, type LeaderboardStats } from "./db";
import { getTable } from "./game-state";

function getSessionIdFromCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("glimpse_session="));
  if (!sessionCookie) return null;

  return sessionCookie.split("=")[1] || null;
}

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((data: { limit?: number }) => data)
  .handler(async ({ data }): Promise<LeaderboardStats[]> => {
    const limit = data.limit ?? 100;
    return leaderboardDb.getTopPlayers(limit);
  });

export const getPlayerStats = createServerFn({ method: "GET" })
  .validator((data: { discordId: string }) => data)
  .handler(async ({ data }): Promise<LeaderboardStats | null> => {
    return leaderboardDb.getPlayerStats(data.discordId);
  });

export const recordGameCompletion = createServerFn({ method: "POST" })
  .validator((data: {
    tableId: string;
    playerId: string;
  }) => data)
  .handler(async ({ data, request }) => {
    const { tableId, playerId } = data;

    // Require authenticated session
    const sessionId = getSessionIdFromCookie(request);
    if (!sessionId) {
      throw new Error("Unauthorized: Authentication required");
    }

    const session = sessionDb.getBySessionId(sessionId);
    if (!session) {
      throw new Error("Unauthorized: Invalid or expired session");
    }

    // Normalize tableId to uppercase
    const normalizedTableId = tableId.toUpperCase();
    const table = getTable(normalizedTableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // Verify caller is the host
    const caller = table.players.find((p) => p.id === playerId);
    if (!caller) {
      throw new Error("Unauthorized: Player not found in table");
    }

    if (!caller.isHost) {
      throw new Error("Unauthorized: Only the host can record game completion");
    }

    // Use server-authoritative game state for scoring
    // Only record for Discord-linked players
    const now = Date.now();
    const recordedCount = new Map<string, boolean>(); // Track to prevent duplicates

    for (const player of table.players) {
      if (!player.discordId) continue; // Skip guests
      
      // Basic idempotency: check if this table/discord combo was recently recorded (within last 60 seconds)
      const recentGames = leaderboardDb.getRecentGames(player.discordId, 5);
      const alreadyRecorded = recentGames.some(
        entry => entry.table_id === normalizedTableId && 
                 (now - entry.game_completed_at) < 60000
      );
      
      if (alreadyRecorded) {
        continue; // Skip duplicate submission
      }

      // Determine placement (1 = first place, etc.)
      const sortedPlayers = [...table.players].sort((a, b) => b.score - a.score);
      const placement = sortedPlayers.findIndex(p => p.id === player.id) + 1;

      leaderboardDb.addEntry({
        discord_id: player.discordId,
        table_id: normalizedTableId,
        points_earned: player.score,
        placement,
        game_completed_at: now,
      });

      recordedCount.set(player.discordId, true);
    }

    return { 
      success: true, 
      recordedCount: recordedCount.size 
    };
  });
