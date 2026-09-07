export type Cell =
  | { kind: "empty" }
  | { kind: "letter"; char: string }
  | { kind: "punct"; char: string };

export const ROW_WIDTHS = [12, 14, 14, 12];
export const TOTAL_ROWS = ROW_WIDTHS.length;

export type GlimpseClip = {
  id: string;
  title: string;
  type: "movie" | "tv" | "song";
  category: string;
  youtubeId?: string;
  clipUrl?: string;
};

export const GLIMPSE_CLIPS: GlimpseClip[] = [
  {
    id: "1",
    title: "THE SHAWSHANK REDEMPTION",
    type: "movie",
    category: "Classic Drama",
    youtubeId: "6hB3S9bIaco",
  },
  {
    id: "2",
    title: "BREAKING BAD",
    type: "tv",
    category: "Crime Drama",
    youtubeId: "HhesaQXLuRY",
  },
  {
    id: "3",
    title: "BOHEMIAN RHAPSODY",
    type: "song",
    category: "Rock Anthem",
    youtubeId: "fJ9rUzIMcZQ",
  },
  {
    id: "4",
    title: "PULP FICTION",
    type: "movie",
    category: "Crime Thriller",
    youtubeId: "s7EdQ4FqbhY",
  },
  {
    id: "5",
    title: "STRANGER THINGS",
    type: "tv",
    category: "Sci-Fi Horror",
    youtubeId: "b9EkMc79ZSU",
  },
];

const isLetter = (c: string) => /[A-Z]/.test(c);

/** Lay a phrase out on the classic 4-row board, centering each line. */
export function layoutPhrase(phrase: string): Cell[][] {
  const words = phrase.toUpperCase().trim().split(/\s+/);
  const lines: string[][] = [];
  let current: string[] = [];
  let rowIndex = 0;

  const width = () => ROW_WIDTHS[Math.min(rowIndex, TOTAL_ROWS - 1)] ?? 12;
  const len = (ws: string[]) => ws.join(" ").length;

  for (const word of words) {
    const candidate = [...current, word];
    if (len(candidate) > width() && current.length > 0) {
      lines.push(current);
      current = [word];
      rowIndex++;
    } else {
      current = candidate;
    }
  }
  if (current.length) lines.push(current);

  // Prefer vertical centering when the phrase is short.
  const pad = Math.max(0, Math.floor((TOTAL_ROWS - lines.length) / 2));
  const rows: Cell[][] = [];

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const w = ROW_WIDTHS[r] ?? 12;
    const line = lines[r - pad];
    const cells: Cell[] = Array.from({ length: w }, () => ({ kind: "empty" }) as Cell);
    if (line) {
      const text = line.join(" ").slice(0, w);
      const start = Math.floor((w - text.length) / 2);
      for (let i = 0; i < text.length; i++) {
        const ch = text[i] ?? " ";
        if (ch === " ") continue;
        cells[start + i] = isLetter(ch)
          ? { kind: "letter", char: ch }
          : { kind: "punct", char: ch };
      }
    }
    rows.push(cells);
  }
  return rows;
}
