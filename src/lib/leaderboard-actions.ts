import { createServerFn } from "@tanstack/react-start";
import { leaderboardDb, userDb, type LeaderboardStats } from "./db";

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
    results: Array<{ discordId: string; points: number; placement: number }>;
  }) => data)
  .handler(async ({ data }) => {
    const now = Date.now();

    for (const result of data.results) {
      leaderboardDb.addEntry({
        discord_id: result.discordId,
        table_id: data.tableId,
        points_earned: result.points,
        placement: result.placement,
        game_completed_at: now,
      });
    }

    return { success: true };
  });
