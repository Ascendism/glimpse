import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { GlimpsePlayer } from "@/components/GlimpsePlayer";
import { GLIMPSE_CLIPS, layoutPhrase, type Cell } from "@/lib/puzzle";
import type { GameState } from "@/lib/game-state";
import { PHASE_DURATIONS } from "@/lib/game-state";
import {
  createTable as createTableAction,
  fetchGameState as fetchGameStateAction,
  joinTable as joinTableAction,
  submitGuess as submitGuessAction,
  sendChatMessage as sendChatMessageAction,
  reportReady as reportReadyAction,
  performHostAction,
} from "@/lib/game-actions";
import { getMatchHint } from "@/lib/match-helper";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    table: typeof search.table === "string" ? search.table : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Glimpse — Identify the Clip Party Game" },
      {
        name: "description",
        content:
          "Multiplayer party game: identify movies, TV shows, and songs from clips. Play together in real-time.",
      },
      { property: "og:title", content: "Glimpse — Clip Identification Game" },
      {
        property: "og:description",
        content:
          "Real-time multiplayer game where you guess movies, TV shows, and songs from clips.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { table: tableIdFromUrl } = useSearch({ from: "/" });
  
  // Session storage for seat persistence (client-side only)
  const [tableId, setTableId] = useState<string | null>(() => {
    if (tableIdFromUrl) return tableIdFromUrl.toUpperCase();
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("glimpse_tableId");
    }
    return null;
  });
  const [playerId, setPlayerId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("glimpse_playerId");
    }
    return null;
  });
  const [playerName, setPlayerName] = useState("");
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [guessInput, setGuessInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [delays, setDelays] = useState<Record<string, number>>({});
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [readyTimeRemaining, setReadyTimeRemaining] = useState<number | null>(null);
  const pollInterval = useRef<number | null>(null);

  const currentPlayer = gameState?.players.find((p) => p.id === playerId);
  const isHost = currentPlayer?.isHost ?? false;
  const currentClip = gameState?.currentClipId
    ? GLIMPSE_CLIPS.find((c) => c.id === gameState.currentClipId)
    : null;

  // Calculate time remaining in current phase
  useEffect(() => {
    // Use routine deadline if routine is running, otherwise fall back to manual phase deadline
    const deadline = gameState?.routine?.status === "running" 
      ? gameState.routine.phaseDeadline 
      : gameState?.phaseDeadline;
      
    if (!deadline || gameState?.sessionPaused) {
      setTimeRemaining(null);
      return;
    }
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, deadline - now);
      setTimeRemaining(remaining);
    };
    
    updateTimer();
    const timer = window.setInterval(updateTimer, 100); // Update every 100ms for smooth countdown
    
    return () => clearInterval(timer);
  }, [gameState?.phaseDeadline, gameState?.routine?.phaseDeadline, gameState?.routine?.status, gameState?.sessionPaused]);

  const rows: Cell[][] = useMemo(
    () => (currentClip ? layoutPhrase(currentClip.title) : []),
    [currentClip],
  );

  // Auto-reveal tiles for all clients when phase is reveal
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

  const fetchGameState = useCallback(async () => {
    if (!tableId) return;
    try {
      const data = await fetchGameStateAction({ data: tableId });
      setGameState(data.table);
    } catch (error) {
      console.error("Failed to fetch game state:", error);
    }
  }, [tableId]);

  useEffect(() => {
    if (tableId) {
      fetchGameState();
      pollInterval.current = window.setInterval(fetchGameState, 1000);
      return () => {
        if (pollInterval.current) clearInterval(pollInterval.current);
      };
    }
  }, [tableId, fetchGameState]);

  // Calculate ready timeout countdown
  useEffect(() => {
    if (!gameState?.waitingForReady || !gameState.readyDeadline) {
      setReadyTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, gameState.readyDeadline! - Date.now());
      setReadyTimeRemaining(Math.ceil(remaining / 1000));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 100);
    return () => clearInterval(interval);
  }, [gameState?.waitingForReady, gameState?.readyDeadline]);

  const createTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    try {
      const data = await createTableAction({ data: { hostName: playerName.trim() } });
      const normalizedId = data.tableId.toUpperCase();
      setTableId(normalizedId);
      
      // If host auto-joined, save player ID
      if (data.player) {
        setPlayerId(data.player.id);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("glimpse_tableId", normalizedId);
          sessionStorage.setItem("glimpse_playerId", data.player.id);
          sessionStorage.setItem("glimpse_playerName", data.player.name);
        }
      } else if (typeof window !== "undefined") {
        sessionStorage.setItem("glimpse_tableId", normalizedId);
      }
      
      navigate({ search: { table: normalizedId } });
    } catch (error) {
      console.error("Failed to create table:", error);
    }
  };

  const joinTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId || !playerName.trim()) return;

    try {
      const data = await joinTableAction({ data: { tableId, playerName: playerName.trim() } });
      if (data.player) {
        const normalizedId = data.tableId.toUpperCase();
        setPlayerId(data.player.id);
        setTableId(normalizedId);
        // Save to sessionStorage for refresh persistence
        if (typeof window !== "undefined") {
          sessionStorage.setItem("glimpse_tableId", normalizedId);
          sessionStorage.setItem("glimpse_playerId", data.player.id);
          sessionStorage.setItem("glimpse_playerName", data.player.name);
        }
      }
    } catch (error) {
      console.error("Failed to join table:", error);
    }
  };

  const submitGuess = async (e: React.FormEvent, lockIn: boolean = false) => {
    e.preventDefault();
    if (!tableId || !playerId || !guessInput.trim() || gameState?.phase !== "playing" || gameState?.sessionPaused || currentPlayer?.lockedIn)
      return;

    try {
      await submitGuessAction({ data: { tableId, playerId, text: guessInput.trim(), locked: lockIn } });
      if (lockIn) {
        setGuessInput("");
      }
    } catch (error) {
      console.error("Failed to submit guess:", error);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId || !playerId || !chatInput.trim()) return;

    try {
      await sendChatMessageAction({ data: { tableId, playerId, text: chatInput.trim() } });
      setChatInput("");
    } catch (error) {
      console.error("Failed to send chat:", error);
    }
  };

  // Routine configuration state
  const [selectedPlaylist, setSelectedPlaylist] = useState<string[]>([]);
  const [guessDuration, setGuessDuration] = useState(45);
  const [judgingDuration, setJudgingDuration] = useState(10);
  const [revealDuration, setRevealDuration] = useState(8);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showOverrides, setShowOverrides] = useState(false);

  const hostAction = async (action: string, payload: Record<string, unknown> = {}) => {
    if (!tableId || !isHost || !playerId) return;

    try {
      await performHostAction({ data: { tableId, action, payload, playerId } });
    } catch (error) {
      console.error("Failed to perform host action:", error);
    }
  };

  const forceStartAnyway = () => hostAction("force_start_anyway");

  const configureRoutine = () => {
    if (selectedPlaylist.length === 0) return;
    hostAction("configure_routine", {
      config: {
        playlist: selectedPlaylist,
        guessDurationSec: guessDuration,
        judgingDurationSec: judgingDuration,
        revealDurationSec: revealDuration,
        autoAdvance,
      },
    });
  };

  const startRoutine = () => hostAction("start_routine");
  const pauseRoutine = () => hostAction("pause_routine");
  const resumeRoutine = () => hostAction("resume_routine");
  const stopRoutine = () => {
    if (confirm("Stop routine? This will return to lobby.")) {
      hostAction("stop_routine");
    }
  };
  const skipPhase = () => hostAction("skip_phase");
  
  const updateScore = (pId: string, score: number) =>
    hostAction("update_score", { playerId: pId, score });

  // Toggle clip selection for playlist
  const toggleClipInPlaylist = (clipId: string) => {
    setSelectedPlaylist((prev) =>
      prev.includes(clipId) ? prev.filter((id) => id !== clipId) : [...prev, clipId]
    );
  };

  // Report when video is ready to play
  const reportReady = useCallback(async () => {
    if (!tableId || !playerId) return;
    
    try {
      await reportReadyAction({ data: { tableId, playerId } });
    } catch (error) {
      console.error("Failed to report ready:", error);
    }
  }, [tableId, playerId]);

  // Host reports clip position/state (for Video.js sync)
  // Throttled to avoid excessive API calls - only update if state changed significantly
  const lastReportRef = useRef({ playing: false, positionSec: 0, timestamp: 0 });
  const reportClipState = useCallback(
    (state: { playing: boolean; positionSec: number }) => {
      if (!isHost || !tableId || !playerId) return;
      
      const last = lastReportRef.current;
      const now = Date.now();
      
      // Only report if:
      // 1. Play/pause state changed, OR
      // 2. Position changed by more than 0.5 seconds AND at least 500ms since last report
      const playStateChanged = state.playing !== last.playing;
      const positionDrift = Math.abs(state.positionSec - last.positionSec);
      const shouldReport = playStateChanged || (positionDrift > 0.5 && now - last.timestamp > 500);
      
      if (shouldReport) {
        lastReportRef.current = { ...state, timestamp: now };
        hostAction("set_clip_state", { playing: state.playing, position: state.positionSec });
      }
    },
    [isHost, tableId, playerId]
  );

  const copyJoinLink = () => {
    const url = `${window.location.origin}/?table=${tableId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // Lobby: create or join
  if (!tableId || !playerId) {
    return (
      <main className="stage-bg min-h-screen font-body text-white/90">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 py-20">
          <header className="text-center">
            <div className="marquee-lights mx-auto mb-4 h-1.5 w-40 rounded-full" />
            <h1 className="text-gold-gradient font-display text-6xl tracking-[0.12em] sm:text-8xl">
              GLIMPSE
            </h1>
            <p className="mt-2 text-sm tracking-[0.35em] text-white/60 uppercase">
              Identify the Clip · Party Game
            </p>
          </header>

          <div className="w-full space-y-4">
            {!tableId ? (
              <div className="flex flex-col gap-3">
                <form onSubmit={createTable} className="flex flex-col gap-3">
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Your name (Host)..."
                    className="rounded-full border-white/15 bg-white/5 px-4 py-3 text-center font-display text-xl tracking-wider placeholder:text-white/35"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={!playerName.trim()}
                    className="w-full rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-6 font-display text-2xl tracking-[0.15em] uppercase shadow-lg"
                  >
                    Create Table
                  </Button>
                </form>
                <div className="text-center text-white/50 text-sm uppercase tracking-wider">or</div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const code = (e.currentTarget.elements.namedItem("code") as HTMLInputElement)
                      .value.trim()
                      .toUpperCase();
                    if (code) {
                      setTableId(code);
                      navigate({ search: { table: code } });
                    }
                  }}
                  className="flex gap-2"
                >
                  <Input
                    name="code"
                    placeholder="Enter table code..."
                    className="flex-1 rounded-full border-white/15 bg-white/5 px-4 py-3 text-center font-display text-xl uppercase tracking-wider placeholder:text-white/35"
                  />
                  <Button
                    type="submit"
                    className="rounded-full border border-white/25 px-8 py-3 font-display text-xl uppercase"
                  >
                    Join
                  </Button>
                </form>
              </div>
            ) : (
              <form onSubmit={joinTable} className="flex flex-col gap-3">
                <div className="text-center">
                  <p className="text-sm text-white/50 uppercase tracking-wider">Table Code</p>
                  <p className="font-display text-4xl text-gold tracking-widest">{tableId}</p>
                </div>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name..."
                  className="rounded-full border-white/15 bg-white/5 px-4 py-3 text-center font-display text-xl tracking-wider placeholder:text-white/35"
                />
                <Button
                  type="submit"
                  disabled={!playerName.trim()}
                  className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-8 py-6 font-display text-2xl tracking-[0.15em] uppercase shadow-lg"
                >
                  Join Table
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  // Game table
  return (
    <main className="stage-bg min-h-screen font-body text-white/90">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="marquee-lights h-1 w-20 rounded-full" />
            <h1 className="text-gold-gradient font-display text-3xl tracking-[0.12em] sm:text-5xl">
              GLIMPSE
            </h1>
            {gameState?.sessionPaused && (
              <div className="rounded-full border-2 border-gold bg-gold/20 px-4 py-1 font-display text-xl tracking-wider text-gold uppercase animate-pulse">
                PAUSED
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-white/40 uppercase tracking-wider">Table Code</p>
            <p className="font-display text-2xl text-gold tracking-widest">{tableId}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={copyJoinLink}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-display tracking-wider uppercase transition-colors",
                  copySuccess
                    ? "border-gold bg-gold/20 text-gold"
                    : "border-white/25 text-white/70 hover:bg-white/10"
                )}
              >
                {copySuccess ? "✓ Copied" : "Copy Join Link"}
              </button>
              <a
                href={`/stage?table=${tableId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/25 px-3 py-1 text-xs font-display tracking-wider text-white/70 uppercase hover:bg-white/10 transition-colors"
              >
                Stage View
              </a>
            </div>
          </div>
        </header>

        {/* Phase Countdown Warning */}
        {timeRemaining !== null && timeRemaining <= 10000 && (
          <div
            className={cn(
              "rounded-xl border-2 px-6 py-3 font-display text-center uppercase tracking-wider transition-all",
              timeRemaining <= 5000
                ? "border-red-500 bg-red-500/20 text-red-300 animate-pulse"
                : "border-gold bg-gold/20 text-gold"
            )}
          >
            <span className="text-xl font-bold">
              {timeRemaining <= 5000 ? "⚠️ " : ""}
              {Math.ceil(timeRemaining / 1000)}s remaining
              {timeRemaining <= 5000 ? " ⚠️" : ""}
            </span>
            {gameState?.phase === "playing" && (
              <span className="ml-2 text-sm opacity-90">— Watch carefully!</span>
            )}
            {gameState?.phase === "judging" && (
              <span className="ml-2 text-sm opacity-90">— Host judge & award points</span>
            )}
            {gameState?.phase === "reveal" && (
              <span className="ml-2 text-sm opacity-90">— Get ready for next round</span>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-6">
            {gameState?.phase === "reveal" && currentClip && (
              <div className="space-y-4">
                <PuzzleBoard rows={rows} revealed={revealed} delays={delays} />
                <div className="text-center">
                  <span className="rounded-full border border-gold/40 bg-black/30 px-5 py-2 font-display text-lg tracking-[0.25em] text-gold uppercase">
                    {currentClip.category} · {currentClip.type}
                  </span>
                </div>
              </div>
            )}

            {gameState?.currentClipId && currentClip?.youtubeId && gameState.phase !== "reveal" && (
              <div className="board-frame aspect-video">
                <GlimpsePlayer
                  youtubeId={currentClip.youtubeId}
                  playing={gameState.clipPlaying}
                  positionSec={gameState.clipPosition}
                  isController={isHost}
                  onReport={isHost ? reportClipState : undefined}
                  onReady={reportReady}
                />
              </div>
            )}
            
            {gameState?.waitingForReady && (
              <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 space-y-2">
                <div className="text-center">
                  <p className="text-gold font-display text-lg tracking-wider uppercase">
                    Waiting for all players to load video...
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    {gameState.players.filter(p => !p.joinedMidRound && p.ready).length} / {gameState.players.filter(p => !p.joinedMidRound).length} ready
                  </p>
                  {readyTimeRemaining !== null && (
                    <p className={cn(
                      "text-xs mt-1 font-mono",
                      readyTimeRemaining <= 5 ? "text-red-400 font-semibold animate-pulse" : "text-white/50"
                    )}>
                      {readyTimeRemaining > 0 ? `${readyTimeRemaining}s remaining` : "Timed out"}
                    </p>
                  )}
                </div>
                {isHost && readyTimeRemaining !== null && readyTimeRemaining <= 10 && (
                  <div className="flex justify-center">
                    <Button
                      onClick={forceStartAnyway}
                      className="rounded-full bg-gold/90 hover:bg-gold px-6 py-2 font-display text-sm uppercase tracking-wider"
                    >
                      Start Anyway
                    </Button>
                  </div>
                )}
              </div>
            )}

            {gameState?.phase === "playing" && (
              <form onSubmit={(e) => submitGuess(e, false)} className="flex gap-2">
                <Input
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  placeholder={
                    gameState.sessionPaused
                      ? "Session paused..."
                      : currentPlayer?.joinedMidRound
                        ? "You'll play next round..."
                        : currentPlayer?.lockedIn
                          ? "Locked in — waiting for judging..."
                          : "Type your guess..."
                  }
                  disabled={gameState.sessionPaused || currentPlayer?.lockedIn || currentPlayer?.joinedMidRound}
                  className="flex-1 rounded-full border-white/15 bg-white/5 px-4 py-3 text-lg placeholder:text-white/35 disabled:opacity-50"
                />
                {!currentPlayer?.lockedIn && !gameState.sessionPaused && !currentPlayer?.joinedMidRound && (
                  <>
                    <Button
                      type="submit"
                      disabled={!guessInput.trim()}
                      className="rounded-full border border-white/25 px-6 py-3 font-display text-lg uppercase"
                    >
                      Update
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => submitGuess(e, true)}
                      disabled={!guessInput.trim()}
                      className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-3 font-display text-lg uppercase"
                    >
                      Lock In
                    </Button>
                  </>
                )}
              </form>
            )}

            {gameState?.phase === "judging" && gameState.guesses.length > 0 && currentClip && (
              <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-2">
                <h3 className="font-display text-xl text-gold uppercase tracking-wider">
                  Guesses {isHost && "— Judge & Award Points"}
                </h3>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {gameState.guesses.map((g) => {
                    const hint = getMatchHint(g.text, currentClip.title);
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                      >
                        <span className="text-sm flex-1">
                          <span className="font-semibold text-gold">{g.playerName}:</span>{" "}
                          {g.text}
                        </span>
                        {hint && (
                          <span className="text-xs font-mono text-gold/80 ml-2">
                            {hint}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isHost && (
              <div className="rounded-xl border border-gold/30 bg-black/30 p-4 space-y-3">
                <h3 className="font-display text-xl text-gold uppercase tracking-wider">
                  Operator Console
                </h3>

                {/* Monitor */}
                {gameState?.routine && gameState.routine.status !== "idle" && (
                  <div className="rounded-lg border border-gold/20 bg-gold/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60 uppercase tracking-wider">Status</span>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-display uppercase tracking-wider",
                        gameState.routine.status === "running" && "bg-gold/20 text-gold border border-gold/40",
                        gameState.routine.status === "paused" && "bg-white/10 text-white/60 border border-white/20",
                        gameState.routine.status === "stopped" && "bg-red-500/20 text-red-300 border border-red-500/40"
                      )}>
                        {gameState.routine.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Round</span>
                      <span className="font-display text-gold">
                        {gameState.routine.currentIndex + 1} / {gameState.routine.config.playlist.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Phase</span>
                      <span className="font-display text-white/90 uppercase text-xs">
                        {gameState.phase}
                      </span>
                    </div>
                    {gameState.routine.phaseDeadline && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/60">Time Left</span>
                        <span className="font-mono text-gold">
                          {Math.max(0, Math.ceil((gameState.routine.phaseDeadline - Date.now()) / 1000))}s
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Locked In</span>
                      <span className="font-display text-white/90">
                        {gameState.players.filter(p => p.lockedIn).length} / {gameState.players.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Configure (when idle) */}
                {(!gameState?.routine || gameState.routine.status === "idle") && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm text-white/60 uppercase tracking-wider">
                        Playlist ({selectedPlaylist.length} clips)
                      </label>
                      <div className="grid gap-2 sm:grid-cols-2 max-h-60 overflow-y-auto">
                        {GLIMPSE_CLIPS.map((clip) => (
                          <button
                            key={clip.id}
                            onClick={() => toggleClipInPlaylist(clip.id)}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                              selectedPlaylist.includes(clip.id)
                                ? "border-gold/40 bg-gold/10"
                                : "border-white/15 bg-white/5 hover:bg-white/10"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-gold text-xs">{clip.title}</div>
                                <div className="text-xs text-white/50">
                                  {clip.category} · {clip.type}
                                </div>
                              </div>
                              {selectedPlaylist.includes(clip.id) && (
                                <span className="ml-2 text-gold font-display">
                                  {selectedPlaylist.indexOf(clip.id) + 1}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-white/50">Guess (s)</label>
                        <Input
                          type="number"
                          value={guessDuration}
                          onChange={(e) => setGuessDuration(Number(e.target.value))}
                          min={10}
                          max={300}
                          className="rounded border-white/15 bg-white/5 px-2 py-1 text-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50">Judge (s)</label>
                        <Input
                          type="number"
                          value={judgingDuration}
                          onChange={(e) => setJudgingDuration(Number(e.target.value))}
                          min={5}
                          max={120}
                          className="rounded border-white/15 bg-white/5 px-2 py-1 text-sm text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/50">Reveal (s)</label>
                        <Input
                          type="number"
                          value={revealDuration}
                          onChange={(e) => setRevealDuration(Number(e.target.value))}
                          min={3}
                          max={60}
                          className="rounded border-white/15 bg-white/5 px-2 py-1 text-sm text-center"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-white/70">
                      <input
                        type="checkbox"
                        checked={autoAdvance}
                        onChange={(e) => setAutoAdvance(e.target.checked)}
                        className="rounded"
                      />
                      Auto-advance to next clip
                    </label>

                    <Button
                      onClick={configureRoutine}
                      disabled={selectedPlaylist.length === 0}
                      className="w-full rounded-full bg-gradient-to-b from-gold to-gold-deep"
                    >
                      Configure Routine
                    </Button>
                  </div>
                )}

                {/* Run Controls */}
                {gameState?.routine && gameState.routine.status !== "idle" && (
                  <div className="space-y-2">
                    {gameState.routine.status === "running" && (
                      <Button onClick={pauseRoutine} className="w-full rounded-full border border-white/25">
                        Pause
                      </Button>
                    )}
                    {gameState.routine.status === "paused" && (
                      <Button onClick={resumeRoutine} className="w-full rounded-full bg-gold/90">
                        Resume
                      </Button>
                    )}
                    <Button
                      onClick={stopRoutine}
                      className="w-full rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10"
                    >
                      Stop Routine
                    </Button>
                  </div>
                )}

                {/* Start button when configured but not running */}
                {gameState?.routine && gameState.routine.status === "idle" && (
                  <Button
                    onClick={startRoutine}
                    className="w-full rounded-full bg-gradient-to-b from-gold to-gold-deep"
                  >
                    Start Routine
                  </Button>
                )}

                {/* Overrides (collapsed by default) */}
                {gameState?.routine && gameState.routine.status !== "idle" && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => setShowOverrides(!showOverrides)}
                      className="flex items-center justify-between w-full text-sm text-white/50 hover:text-white/70"
                    >
                      <span className="uppercase tracking-wider">Overrides</span>
                      <span>{showOverrides ? "▲" : "▼"}</span>
                    </button>
                    {showOverrides && (
                      <div className="space-y-2">
                        <Button
                          onClick={skipPhase}
                          disabled={gameState.routine.status !== "running"}
                          className="w-full rounded-full border border-white/15 text-xs"
                        >
                          Skip Phase
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
              <h3 className="font-display text-lg text-gold uppercase tracking-wider">Chat</h3>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {gameState?.chat.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "text-sm",
                      msg.isSystem && "text-center text-white/50 italic text-xs my-1"
                    )}
                  >
                    {msg.isSystem ? (
                      <span>{msg.text}</span>
                    ) : (
                      <>
                        <span className="font-semibold text-gold">{msg.playerName}:</span>{" "}
                        <span className="text-white/80">{msg.text}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={sendChat} className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message..."
                  className="flex-1 rounded-full border-white/15 bg-white/5 px-3 py-2 text-sm placeholder:text-white/35"
                />
                <Button type="submit" size="sm" className="rounded-full">
                  Send
                </Button>
              </form>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/25 p-4 space-y-3">
            <h3 className="font-display text-xl text-gold uppercase tracking-wider">Players</h3>
            <div className="space-y-2">
              {gameState?.players.map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2",
                    p.lockedIn
                      ? "border-gold/40 bg-gold/10"
                      : "border-white/5 bg-white/5"
                  )}
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                      <span>
                        {p.name} {p.isHost && <span className="text-xs text-gold">(HOST)</span>}
                      </span>
                      {gameState.waitingForReady && (
                        <span className={cn(
                          "text-xs rounded-full border px-2 py-0.5 uppercase tracking-wider",
                          p.ready
                            ? "border-green-500/40 bg-green-500/20 text-green-300"
                            : readyTimeRemaining !== null && readyTimeRemaining === 0
                              ? "border-red-500/40 bg-red-500/20 text-red-300"
                              : "border-white/20 bg-white/5 text-white/40"
                        )}>
                          {p.ready 
                            ? "Ready" 
                            : readyTimeRemaining !== null && readyTimeRemaining === 0
                              ? "Timed out"
                              : "Loading..."}
                        </span>
                      )}
                      {p.lockedIn && !gameState.waitingForReady && (
                        <span className="text-xs rounded-full border border-gold/40 bg-gold/20 px-2 py-0.5 text-gold uppercase tracking-wider">
                          Locked
                        </span>
                      )}
                      {p.joinedMidRound && (
                        <span className="text-xs rounded-full border border-white/30 bg-white/10 px-2 py-0.5 text-white/70 uppercase tracking-wider">
                          Next Round
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50">Score: {p.score}</div>
                  </div>
                  {isHost && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateScore(p.id, p.score + 100)}
                        className="rounded bg-gold/20 px-2 py-1 text-xs text-gold hover:bg-gold/30"
                      >
                        +100
                      </button>
                      <button
                        onClick={() => updateScore(p.id, Math.max(0, p.score - 100))}
                        className="rounded bg-white/10 px-2 py-1 text-xs text-white/60 hover:bg-white/20"
                      >
                        -100
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
