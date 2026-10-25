import type { ClipSource } from "./library";

/** Accept common YouTube sharing links, bare IDs, or a directly hosted video. */
export function parseClipSource(input: string): ClipSource {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return { type: "youtube", id: value };
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Enter a YouTube link or a full hosted video URL.");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password)
    throw new Error("Use an HTTP or HTTPS video URL without credentials.");
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  if (["youtube.com", "youtube-nocookie.com", "youtu.be"].includes(host)) {
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") || /^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[1];
    if (!id || !/^[\w-]{11}$/.test(id))
      throw new Error("That YouTube link does not contain a valid video ID.");
    return { type: "youtube", id };
  }
  return { type: "url", id: url.href };
}

export function validClipRange(start: number, end: number, duration: number) {
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    Number.isFinite(duration) &&
    start >= 0 &&
    end > start &&
    duration > 0 &&
    end <= duration + 0.01
  );
}
