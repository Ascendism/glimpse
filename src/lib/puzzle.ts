export type Cell =
  { kind: "empty" } | { kind: "letter"; char: string } | { kind: "punct"; char: string };

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

const isLetter = (c: string) => /[\p{L}\p{N}]/u.test(c);

/** Keep the classic board shape, adding rows instead of silently dropping title characters. */
export function layoutPhrase(phrase: string): Cell[][] {
  const words = phrase.toUpperCase().trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const letters = Array.from(word);
    if (line && Array.from(line).length + 1 + letters.length > 14) {
      lines.push(line);
      line = "";
    }
    while (letters.length > 14) {
      lines.push(letters.splice(0, 14).join(""));
    }
    if (letters.length) line += (line ? " " : "") + letters.join("");
  }
  if (line) lines.push(line);
  const height = Math.max(TOTAL_ROWS, lines.length);
  const pad = Math.floor((height - lines.length) / 2);
  return Array.from({ length: height }, (_, r) => {
    const text = Array.from(lines[r - pad] ?? "");
    const width = (r === 0 || r === height - 1) && text.length <= 12 ? 12 : 14;
    const cells: Cell[] = Array.from({ length: width }, () => ({ kind: "empty" }));
    const start = Math.floor((width - text.length) / 2);
    text.forEach((char, i) => {
      if (char !== " ") cells[start + i] = { kind: isLetter(char) ? "letter" : "punct", char };
    });
    return cells;
  });
}
