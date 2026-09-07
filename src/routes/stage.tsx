import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GlimpsePlayer } from "@/components/GlimpsePlayer";
import { GLIMPSE_CLIPS, layoutPhrase, type Cell } from "@/lib/puzzle";
import type { GameState } from "@/lib/game-state";
import { fetchGameState as fetchGameStateAction } from "@/lib/game-actions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stage")({
  validateSearch: (search: Record<string, unknown>) => ({
    table: typeof search.table === "string" ? search.table : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Glimpse Stage View" },
      {
        name: "description",
        content: "Stage view for casting or OBS - shows clip, scores, and title reveal",
      },
    ],
  }),
  component: StageView,
});

function StageView() {
  const { table: tableId } = useSearch({ from: "/stage" });
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [delays, setDelays] = useState<Record<string, number>>({});
  const pollInterval = useRef<number | null>(null);

  const currentClip = gameState?.currentClipId
    ? GLIMPSE_CLIPS.find((c) => c.id === gameState.currentClipId)
    : null;

  const rows: Cell[][] = useMemo(
    () => (currentClip ? layoutPhrase(currentClip.title) : []),
    [currentClip],
  );

  const fetchGameState = useCallback(async () => {
    if (!tableId) return;
    try {
      const normalizedId = tableId.toUpperCase();
      const result = await fetchGameStateAction({ data: normalizedId });
      setGameState(result.table);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  }, [tableId]);

  // Auto-reveal when phase is reveal (separate effect for clean logic)
  useEffect(() => {
    if (gameState?.phase === "reveal" && gameState.revealedTitle && currentClip) {
      const ids: string[] = [];
      rows.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell.kind === "letter") ids.push(`${r}-${c}`);
        }),
      );
      const nextDelays: Record<string, number> = {};
      ids.forEach((id, i) => (nextDelays[id] = i * 110));
      setDelays(nextDelays);
      setRevealed(new Set(ids));
    } else if (gameState?.phase !== "reveal") {
      setRevealed(new Set());
      setDelays({});
    }
  }, [gameState?.phase, gameState?.revealedTitle, currentClip, rows]);

  useEffect(() => {
    if (tableId) {
      fetchGameState();
      pollInterval.current = window.setInterval(fetchGameState, 1000);
      return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
      };
    }
  }, [tableId, fetchGameState]);

  if (!tableId) {
    return (
      <main className="stage-bg min-h-screen font-body text-white/90 flex items-center justify-center">
        <div className="text-center">
          <div className="marquee-lights mx-auto mb-4 h-1.5 w-40 rounded-full" />
          <h1 className="text-gold-gradient font-display text-6xl tracking-[0.12em] sm:text-8xl">
            GLIMPSE
          </h1>
          <p className="mt-4 text-white/60 uppercase tracking-wider text-sm">
            Stage View — No table code provided
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="stage-bg min-h-screen font-body text-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="marquee-lights h-1 w-24 rounded-full" />
            <h1 className="text-gold-gradient font-display text-4xl tracking-[0.12em] sm:text-6xl">
              GLIMPSE
            </h1>
            {gameState?.sessionPaused && (
              <div className="rounded-full border-2 border-gold bg-gold/20 px-5 py-2 font-display text-2xl tracking-wider text-gold uppercase animate-pulse">
                PAUSED
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 uppercase tracking-wider">Table</p>
            <p className="font-display text-3xl text-gold tracking-widest">{tableId}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
          <div className="space-y-6">
            {gameState?.phase === "reveal" && currentClip && (
              <div className="space-y-4">
                <PuzzleBoard rows={rows} revealed={revealed} delays={delays} />
                <div className="text-center">
                  <span className="rounded-full border border-gold/40 bg-black/30 px-6 py-2.5 font-display text-2xl tracking-[0.25em] text-gold uppercase">
                    {currentClip.category} · {currentClip.type}
                  </span>
                </div>
              </div>
            )}

            {gameState?.currentClipId &&
              currentClip?.youtubeId &&
              gameState.phase !== "reveal" && (
                <div className="board-frame aspect-video relative">
                  <GlimpsePlayer
                    youtubeId={currentClip.youtubeId}
                    playing={gameState.clipPlaying}
                    positionSec={gameState.clipPosition}
                    isController={false}
                  />
                </div>
              )}

            {gameState?.phase === "lobby" && (
              <div className="board-frame flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="marquee-lights mx-auto mb-6 h-2 w-40 rounded-full" />
                  <p className="text-white/60 uppercase tracking-[0.3em] text-xl">
                    Waiting for round to start...
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-6 space-y-4">
            <h3 className="font-display text-2xl text-gold uppercase tracking-wider border-b border-white/10 pb-3">
              Players
            </h3>
            <div className="space-y-3">
              {gameState?.players.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-lg border px-4 py-3 transition-all",
                    p.lockedIn
                      ? "border-gold/40 bg-gold/10"
                      : "border-white/5 bg-white/5",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-lg flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.isHost && (
                          <span className="text-xs rounded-full border border-gold/40 bg-gold/20 px-2 py-0.5 text-gold uppercase tracking-wider">
                            Host
                          </span>
                        )}
                        {p.lockedIn && (
                          <span className="text-xs rounded-full border border-gold/40 bg-gold/30 px-2 py-0.5 text-gold uppercase tracking-wider">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-display text-3xl text-gold tracking-wider">
                      {p.score}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(!gameState?.players || gameState.players.length === 0) && (
              <div className="text-center py-8 text-white/40 text-sm uppercase tracking-wider">
                No players yet
              </div>
            )}
          </div>
        </div>

        {gameState?.phase === "judging" && gameState.guesses.length > 0 && (
          <div className="rounded-xl border border-gold/30 bg-black/30 p-6">
            <h3 className="font-display text-2xl text-gold uppercase tracking-wider mb-4 border-b border-white/10 pb-3">
              Guesses Submitted
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {gameState.guesses.map((g) => (
                <div
                  key={g.id}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="font-semibold text-gold text-sm mb-1">
                    {g.playerName}
                  </div>
                  <div className="text-white/90 text-lg">{g.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
