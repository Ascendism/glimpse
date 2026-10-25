import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import { leaderboardDb, userDb, type LeaderboardStats } from "./db";

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ limit: z.number().int().min(1).max(100).optional() }).parse(data),
  )
  .handler(async ({ data }): Promise<LeaderboardStats[]> => {
    const limit = data.limit ?? 100;
    return leaderboardDb.getTopPlayers(limit);
  });

export const getPlayerStats = createServerFn({ method: "GET" })
  .validator((data: { discordId: string }) => data)
  .handler(async ({ data }): Promise<LeaderboardStats | null> => {
    return leaderboardDb.getPlayerStats(data.discordId);
  });
