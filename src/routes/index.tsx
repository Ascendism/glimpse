import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { ALPHABET, PUZZLES, VOWELS, layoutPhrase, type Cell } from "@/lib/puzzle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Puzzle Board — Wheel of Fortune Style Game Show Board" },
      {
        name: "description",
        content:
          "An animated game show puzzle board: load any word or phrase and flip letters open square by square, just like the classic wheel game.",
      },
      { property: "og:title", content: "Puzzle Board — Game Show Letter Board" },
      {
        property: "og:description",
        content:
          "Animated flip-tile puzzle board that loads random words and phrases and reveals letters one square at a time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function usePuzzle() {
  const [index, setIndex] = useState(0);
  const [custom, setCustom] = useState<{ category: string; phrase: string } | null>(null);
  const puzzle = custom ?? PUZZLES[index % PUZZLES.length] ?? PUZZLES[0]!;
  return { puzzle, setIndex, setCustom, index };
}

function Index() {
  const { puzzle, setIndex, setCustom } = usePuzzle();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [delays, setDelays] = useState<Record<string, number>>({});
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState("Pick a letter to reveal it across the board.");
  const [input, setInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const timers = useRef<number[]>([]);

  const rows: Cell[][] = useMemo(() => layoutPhrase(puzzle.phrase), [puzzle.phrase]);

  const totalLetters = useMemo(
    () => rows.flat().filter((c) => c.kind === "letter").length,
    [rows],
  );
  const solved = revealed.size >= totalLetters && totalLetters > 0;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const reset = useCallback(() => {
    clearTimers();
    setRevealed(new Set());
    setDelays({});
    setUsed(new Set());
    setMessage("Pick a letter to reveal it across the board.");
  }, []);

  const revealCells = useCallback((ids: string[], stagger = 220) => {
    if (!ids.length) return;
    const nextDelays: Record<string, number> = {};
    ids.forEach((id, i) => (nextDelays[id] = i * stagger));
    setDelays((d) => ({ ...d, ...nextDelays }));
    setRevealed((prev) => new Set([...prev, ...ids]));
  }, []);

  const guess = useCallback(
    (letter: string) => {
      if (used.has(letter) || solved) return;
      setUsed((u) => new Set([...u, letter]));
      const hits: string[] = [];
      rows.forEach((row, r) =>
        row.forEach((cell, c) => {
          if (cell.kind === "letter" && cell.char === letter) hits.push(`${r}-${c}`);
        }),
      );
      if (hits.length) {
        revealCells(hits);
        setMessage(
          `${hits.length} ${letter}${hits.length > 1 ? "'s" : ""}! ${VOWELS.includes(letter) ? "Vowel bought." : "Nice call."}`,
        );
      } else {
        setMessage(`Sorry — no ${letter}. Bankrupt vibes.`);
      }
    },
    [rows, revealCells, solved, used],
  );

  const revealAll = useCallback(() => {
    const ids: string[] = [];
    rows.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.kind === "letter" && !revealed.has(`${r}-${c}`)) ids.push(`${r}-${c}`);
      }),
    );
    revealCells(ids, 110);
    setUsed(new Set(ALPHABET));
    setMessage("Solved! The full puzzle is on the board.");
  }, [revealCells, revealed, rows]);

  const nextPuzzle = useCallback(() => {
    reset();
    setCustom(null);
    setIndex(Math.floor(Math.random() * PUZZLES.length));
  }, [reset, setCustom, setIndex]);

  const loadCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const phrase = input.trim();
    if (!phrase) return;
    reset();
    setCustom({ category: categoryInput.trim() || "Custom Puzzle", phrase });
    setInput("");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el instanceof HTMLInputElement) return;
      const k = e.key.toUpperCase();
      if (ALPHABET.includes(k)) guess(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess]);

  return (
    <main className="stage-bg min-h-screen font-body text-white/90">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-10 sm:py-14">
        <header className="text-center">
          <div className="marquee-lights mx-auto mb-4 h-1.5 w-40 rounded-full" />
          <h1 className="text-gold-gradient font-display text-5xl tracking-[0.12em] sm:text-7xl">
            PUZZLE BOARD
          </h1>
          <p className="mt-1 text-sm tracking-[0.35em] text-white/50 uppercase">
            Round One · Toss Up
          </p>
        </header>

        <PuzzleBoard rows={rows} revealed={revealed} delays={delays} />

        <div className="flex flex-col items-center gap-2">
          <span className="rounded-full border border-gold/40 bg-black/30 px-5 py-1.5 font-display text-lg tracking-[0.25em] text-gold uppercase">
            {puzzle.category}
          </span>
          <p
            className={cn(
              "min-h-6 text-sm text-white/60",
              solved && "font-semibold text-gold",
            )}
          >
            {message}
          </p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-7 gap-1.5 sm:grid-cols-13 sm:gap-2">
          {ALPHABET.map((letter) => {
            const spent = used.has(letter);
            return (
              <button
                key={letter}
                onClick={() => guess(letter)}
                disabled={spent || solved}
                className={cn(
                  "aspect-square rounded-md border font-display text-lg tracking-wider transition-all duration-200",
                  spent
                    ? "border-white/5 bg-white/5 text-white/20"
                    : VOWELS.includes(letter)
                      ? "border-gold/50 bg-gold/15 text-gold hover:-translate-y-0.5 hover:bg-gold/30"
                      : "border-white/15 bg-white/10 text-white hover:-translate-y-0.5 hover:bg-white/20",
                )}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={nextPuzzle}
            className="rounded-full bg-gradient-to-b from-gold to-gold-deep px-6 py-2.5 font-display text-lg tracking-[0.15em] text-stage-deep uppercase shadow-lg transition-transform hover:-translate-y-0.5"
          >
            New Puzzle
          </button>
          <button
            onClick={revealAll}
            className="rounded-full border border-white/25 px-6 py-2.5 font-display text-lg tracking-[0.15em] text-white/80 uppercase transition-colors hover:bg-white/10"
          >
            Solve It
          </button>
          <button
            onClick={reset}
            className="rounded-full border border-white/15 px-6 py-2.5 font-display text-lg tracking-[0.15em] text-white/50 uppercase transition-colors hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <form
          onSubmit={loadCustom}
          className="mt-2 flex w-full max-w-2xl flex-col gap-2 rounded-xl border border-white/10 bg-black/25 p-4 sm:flex-row"
        >
          <input
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            placeholder="Category"
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm placeholder:text-white/35 focus:border-gold/60 focus:outline-none sm:w-44"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type any word or phrase…"
            className="flex-1 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm placeholder:text-white/35 focus:border-gold/60 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md bg-white/90 px-5 py-2 font-display text-lg tracking-wider text-stage-deep uppercase transition-colors hover:bg-white"
          >
            Load
          </button>
        </form>
      </div>
    </main>
  );
}
