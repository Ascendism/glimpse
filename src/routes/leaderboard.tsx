import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/leaderboard-actions";
import { getAuthState } from "@/lib/discord-oauth";
import type { LeaderboardStats } from "@/lib/db";
import type { AuthState } from "@/lib/discord-oauth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Glimpse" },
      {
        name: "description",
        content: "Top players and stats for Glimpse party game.",
      },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardStats[]>([]);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getLeaderboard({ data: { limit: 100 } }),
      getAuthState({ data: undefined }),
    ]).then(([lb, auth]) => {
      setLeaderboard(lb);
      setAuthState(auth);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <main className="stage-bg min-h-screen font-body text-white/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
          <div className="text-center text-white/50">Loading leaderboard...</div>
        </div>
      </main>
    );
  }

  const userRank = authState?.user
    ? leaderboard.findIndex((p) => p.discord_id === authState.user!.id) + 1
    : null;

  return (
    <main className="stage-bg min-h-screen font-body text-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="marquee-lights h-1 w-20 rounded-full" />
            <h1 className="text-gold-gradient font-display text-3xl tracking-[0.12em] sm:text-5xl">
              LEADERBOARD
            </h1>
          </div>
          <Button
            onClick={() => window.location.href = "/"}
            className="rounded-full border border-white/25 px-6 py-2 font-display text-lg uppercase"
          >
            Back to Game
          </Button>
        </header>

        {authState?.isAuthenticated && authState.user && userRank && userRank > 0 && (
          <div className="rounded-xl border border-gold/30 bg-gold/10 p-4">
            <div className="flex items-center gap-4">
              {authState.user.avatar && (
                <img
                  src={`https://cdn.discordapp.com/avatars/${authState.user.id}/${authState.user.avatar}.png?size=64`}
                  alt={authState.user.username}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <div className="font-display text-lg text-gold">Your Rank: #{userRank}</div>
                <div className="text-sm text-white/70">
                  {leaderboard[userRank - 1]?.total_points ?? 0} points · {leaderboard[userRank - 1]?.games_played ?? 0} games
                </div>
              </div>
            </div>
          </div>
        )}

        {!authState?.isAuthenticated && (
          <div className="rounded-xl border border-white/20 bg-white/5 p-4 text-center">
            <p className="text-sm text-white/60 mb-3">
              Login with Discord to see your ranking and track your stats!
            </p>
            <Button
              onClick={() => window.location.href = "/?discord_login=1"}
              className="rounded-full bg-[#5865F2] hover:bg-[#4752C4] px-6 py-2 font-display text-white"
            >
              <svg className="inline-block w-5 h-5 mr-2" viewBox="0 0 71 55" fill="currentColor">
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" />
              </svg>
              Login with Discord
            </Button>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-black/25 overflow-hidden">
          <div className="bg-gold/10 border-b border-gold/30 px-6 py-3">
            <h2 className="font-display text-xl text-gold uppercase tracking-wider">
              Top Players
            </h2>
          </div>

          {leaderboard.length === 0 ? (
            <div className="p-12 text-center text-white/40">
              <p className="text-lg">No games played yet!</p>
              <p className="text-sm mt-2">Be the first to complete a game and claim your spot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="px-6 py-3 text-left">Rank</th>
                    <th className="px-6 py-3 text-left">Player</th>
                    <th className="px-6 py-3 text-center">Total Points</th>
                    <th className="px-6 py-3 text-center">Games</th>
                    <th className="px-6 py-3 text-center">Wins</th>
                    <th className="px-6 py-3 text-center">Avg Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const isCurrentUser = authState?.user?.id === player.discord_id;
                    return (
                      <tr
                        key={player.discord_id}
                        className={cn(
                          "border-b border-white/5 transition-colors hover:bg-white/5",
                          isCurrentUser && "bg-gold/10"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div
                            className={cn(
                              "font-display text-lg",
                              index === 0 && "text-[#FFD700]",
                              index === 1 && "text-[#C0C0C0]",
                              index === 2 && "text-[#CD7F32]",
                              index > 2 && "text-white/70"
                            )}
                          >
                            {index < 3 ? "🏆" : ""} #{index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {player.avatar ? (
                              <img
                                src={`https://cdn.discordapp.com/avatars/${player.discord_id}/${player.avatar}.png?size=64`}
                                alt={player.username}
                                className="h-10 w-10 rounded-full"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white/50 font-display">
                                {player.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-white">
                                {player.username}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-gold">(You)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="font-display text-gold text-lg">
                            {player.total_points.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-white/70">
                          {player.games_played}
                        </td>
                        <td className="px-6 py-4 text-center text-white/70">
                          {player.wins}
                        </td>
                        <td className="px-6 py-4 text-center text-white/70">
                          {player.avg_points.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-white/40 mt-4">
          <p>Leaderboard tracks Discord-authenticated players across all games.</p>
          <p className="mt-1">Guest players can still play but won't appear on the leaderboard.</p>
        </div>
      </div>
    </main>
  );
}
