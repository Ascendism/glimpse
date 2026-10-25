import { getDb, leaderboardDb } from "./db";

// One transaction makes retries and server restarts safe.
export function saveGameResults(
  gameId: string,
  tableId: string,
  players: Array<{ discordId?: string | null; score: number; isHost: boolean }>,
): void {
  const db = getDb();
  db.exec(
    "CREATE TABLE IF NOT EXISTS completed_games (game_id TEXT PRIMARY KEY, completed_at INTEGER NOT NULL)",
  );
  db.transaction(() => {
    const now = Date.now();
    const inserted = db
      .prepare("INSERT OR IGNORE INTO completed_games VALUES (?, ?)")
      .run(gameId, now);
    if (!inserted.changes) return;
    const contestants = players.filter((p) => !p.isHost);
    const seen = new Set<string>();
    for (const player of contestants) {
      if (!player.discordId || seen.has(player.discordId)) continue;
      seen.add(player.discordId);
      leaderboardDb.addEntry({
        discord_id: player.discordId,
        table_id: tableId,
        points_earned: player.score,
        placement: 1 + contestants.filter((p) => p.score > player.score).length,
        game_completed_at: now,
      });
    }
  })();
}
