import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import type { ClipSource, LibraryClip } from "@/lib/library";
import { parseClipSource, validClipRange } from "@/lib/clip-source";
import { addClipToLibrary, updateClipInLibrary, removeClipFromLibrary } from "@/lib/game-actions";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ClipLibrary({
  tableId,
  playerId,
  clips,
  refresh,
}: {
  tableId: string;
  playerId: string;
  clips: LibraryClip[];
  refresh: () => Promise<void>;
}) {
  const [editing, setEditing] = useState<LibraryClip | null>(null);
  const [url, setUrl] = useState("");
  const [loadedUrl, setLoadedUrl] = useState("");
  const [source, setSource] = useState<ClipSource | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [kind, setKind] = useState<LibraryClip["type"]>("Other");
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("");
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const previewEnd = useRef<number | null>(null);
  const initialStart = useRef(0);
  const rangeValid =
    start !== "" && end !== "" && validClipRange(Number(start), Number(end), duration);

  useEffect(() => {
    if (!source || !container.current) return;
    setReady(false);
    const element = document.createElement("video-js");
    element.classList.add("video-js", "vjs-big-play-centered");
    container.current.appendChild(element);
    const p = videojs(element, {
      controls: true,
      preload: "auto",
      fluid: true,
      autoplay: false,
      techOrder: source.type === "youtube" ? ["youtube"] : ["html5"],
      sources: [
        {
          src:
            source.type === "youtube" ? `https://www.youtube.com/watch?v=${source.id}` : source.id,
          ...(source.type === "youtube" ? { type: "video/youtube" } : {}),
        },
      ],
      youtube: { ytControls: 0 },
    });
    player.current = p;
    let initialized = false;
    const update = () => {
      const d = p.duration() || 0;
      if (Number.isFinite(d) && d > 0) {
        setDuration(d);
        setReady(true);
        if (!initialized) {
          initialized = true;
          setEnd((value) => value || String(Math.round(d * 1000) / 1000));
          p.currentTime(initialStart.current);
        }
      }
      const now = p.currentTime() || 0;
      setPosition(now);
      if (previewEnd.current !== null && now >= previewEnd.current) {
        const stop = previewEnd.current;
        previewEnd.current = null;
        p.pause();
        p.currentTime(stop);
      }
    };
    p.on("error", () => {
      setReady(false);
      setError("Video could not load. Check that the link is playable and permits embedding.");
    });
    p.on("durationchange", update);
    p.on("loadedmetadata", update);
    const timer = window.setInterval(update, 50);
    const timeout = window.setTimeout(() => {
      if (!initialized)
        setError(
          "No playable duration received. Try pressing Play, or use another video that permits embedding. Live streams are not supported.",
        );
    }, 15000);
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
      previewEnd.current = null;
      player.current = null;
      p.dispose();
    };
  }, [source]);

  function reset() {
    setEditing(null);
    setUrl("");
    setSource(null);
    setTitle("");
    setCategory("");
    setKind("Other");
    setStart("0");
    setEnd("");
    setDuration(0);
    setReady(false);
    setPosition(0);
    setError("");
  }
  function load() {
    try {
      const next = parseClipSource(url);
      if (location.protocol === "https:" && next.type === "url" && next.id.startsWith("http:"))
        throw new Error("Use an HTTPS video URL on this secure site.");
      initialStart.current = 0;
      setStart("0");
      setEnd("");
      setDuration(0);
      setReady(false);
      setError("");
      setNotice("");
      setLoadedUrl(url);
      setSource(next);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function edit(clip: LibraryClip) {
    setEditing(clip);
    setTitle(clip.title);
    setCategory(clip.category);
    setKind(clip.type);
    setUrl(clip.source.id);
    setLoadedUrl(clip.source.id);
    setStart(String(clip.metadata.timeStart));
    setEnd(String(clip.metadata.timeEnd));
    initialStart.current = clip.metadata.timeStart;
    setDuration(0);
    setReady(false);
    setError("");
    setNotice("");
    setSource({ ...clip.source });
  }
  function seek(time: number) {
    previewEnd.current = null;
    player.current?.currentTime(time);
    setPosition(time);
  }
  function mark(which: "start" | "end") {
    const value = String(Math.round((player.current?.currentTime() || 0) * 1000) / 1000);
    if (which === "start") setStart(value);
    else setEnd(value);
    previewEnd.current = null;
  }
  async function preview() {
    if (!rangeValid) return;
    setError("");
    player.current?.currentTime(Number(start));
    previewEnd.current = Number(end);
    try {
      await player.current?.play();
    } catch {
      setError("Press Play in the video to enable playback.");
    }
  }
  async function save() {
    if (!source || !ready || !rangeValid || !title.trim() || url !== loadedUrl) return;
    setBusy(true);
    setError("");
    const metadata = { duration, timeStart: Number(start), timeEnd: Number(end) };
    const clip: LibraryClip = {
      id: editing?.id || `clip_${crypto.randomUUID()}`,
      title: title.trim(),
      category: category.trim() || "Uncategorized",
      type: kind,
      source,
      metadata:
        source.type === "youtube"
          ? { ...metadata, youtubeId: source.id }
          : { ...metadata, url: source.id },
      createdAt: editing?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    try {
      if (editing)
        await updateClipInLibrary({ data: { tableId, playerId, clipId: clip.id, updates: clip } });
      else await addClipToLibrary({ data: { tableId, playerId, clip } });
      await refresh();
      reset();
      setNotice("Clip saved. Select it in the playlist below to play it.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(clip: LibraryClip) {
    if (!confirm(`Delete “${clip.title}” from this table and your saved library?`)) return;
    setBusy(true);
    setError("");
    try {
      await removeClipFromLibrary({ data: { tableId, playerId, clipId: clip.id } });
      await refresh();
      if (editing?.id === clip.id) reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Clip library"
      className="space-y-3 rounded-lg border border-gold/20 bg-black/20 p-3 min-w-0"
    >
      <h4 className="font-display text-gold">{editing ? "Edit clip" : "Create a clip"}</h4>
      <p className="text-xs text-white/60">
        Paste a YouTube link or hosted video URL, load it, then mark your start and stop points.
        Saved clips carry into new tables. Sign in with Discord to keep your library across devices.
      </p>
      <label className="block text-sm">
        Video URL or YouTube ID
        <Input
          aria-label="Video URL or YouTube ID"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/clip.mp4"
        />
      </label>
      <Button onClick={load} disabled={busy || !url.trim()}>
        Load video
      </Button>
      {source && url !== loadedUrl && (
        <p className="text-sm text-gold">Load the changed URL before saving.</p>
      )}
      <div
        ref={container}
        data-testid="clip-preview"
        className="w-full min-w-0 overflow-hidden rounded"
      />
      {source && (
        <div className="space-y-2">
          <p className="text-xs text-white/60">
            {ready
              ? `Playhead ${position.toFixed(3)}s / ${duration.toFixed(3)}s`
              : "Loading video…"}
          </p>
          <input
            aria-label="Video playhead"
            type="range"
            className="w-full"
            min="0"
            max={duration || 1}
            step="0.01"
            value={Math.min(position, duration || 1)}
            disabled={!ready}
            onChange={(e) => seek(Number(e.target.value))}
          />
          {rangeValid && (
            <div aria-hidden="true" className="relative h-3 rounded bg-white/10 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 border-x-2 border-gold bg-gold/40"
                style={{
                  left: `${(Number(start) / duration) * 100}%`,
                  width: `${((Number(end) - Number(start)) / duration) * 100}%`,
                }}
              />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button disabled={!ready} onClick={() => mark("start")}>
              Mark start
            </Button>
            <Button disabled={!ready} onClick={() => mark("end")}>
              Mark stop
            </Button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <label className="text-sm">
          Start (seconds)
          <Input
            aria-label="Start (seconds)"
            type="number"
            min="0"
            step="0.001"
            value={start}
            onChange={(e) => {
              setStart(e.target.value);
              previewEnd.current = null;
            }}
          />
        </label>
        <label className="text-sm">
          Stop (seconds)
          <Input
            aria-label="Stop (seconds)"
            type="number"
            min="0"
            step="0.001"
            value={end}
            onChange={(e) => {
              setEnd(e.target.value);
              previewEnd.current = null;
            }}
          />
        </label>
      </div>
      {ready && !rangeValid && (
        <p role="alert" className="text-sm text-red-300">
          Stop must be after start and within the video duration.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button disabled={!ready || !rangeValid} onClick={() => seek(Number(start))}>
          Go to start
        </Button>
        <Button disabled={!ready || !rangeValid} onClick={() => seek(Number(end))}>
          Go to stop
        </Button>
        <Button disabled={!ready || !rangeValid} onClick={preview}>
          Preview selection
        </Button>
        <Button
          disabled={!ready}
          onClick={() => {
            previewEnd.current = null;
            player.current?.pause();
          }}
        >
          Stop preview
        </Button>
      </div>
      {rangeValid && (
        <p className="text-xs text-gold">
          Selected: {(Number(end) - Number(start)).toFixed(3)} seconds. Game segments stay inside
          these markers.
        </p>
      )}
      <label className="block text-sm">
        Answer / title
        <Input
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
      </label>
      <label className="block text-sm">
        Category
        <Input
          value={category}
          maxLength={100}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
      </label>
      <label className="block text-sm">
        Content type
        <select
          aria-label="Content type"
          className="block w-full bg-black border rounded p-2"
          value={kind}
          onChange={(e) => setKind(e.target.value as LibraryClip["type"])}
        >
          {["Movie", "TV Show", "Song", "Other"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <Button
          disabled={busy || !ready || !rangeValid || !title.trim() || url !== loadedUrl}
          onClick={save}
        >
          {busy ? "Saving…" : editing ? "Save changes" : "Save clip"}
        </Button>
        <Button disabled={busy} onClick={reset}>
          Cancel / new clip
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-gold">
          {notice}
        </p>
      )}
      <h4 className="font-display text-gold">Library ({clips.length})</h4>
      <Input
        aria-label="Search clips"
        placeholder="Search title or category"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-80 overflow-y-auto space-y-2">
        {clips
          .filter((c) => `${c.title} ${c.category}`.toLowerCase().includes(search.toLowerCase()))
          .map((clip) => (
            <div
              key={clip.id}
              className="rounded border border-white/15 p-2"
              data-testid="library-clip"
            >
              <p className="text-gold break-words">{clip.title}</p>
              <p className="text-xs text-white/60">
                {clip.type} · {clip.category} · {clip.metadata.timeStart}s–{clip.metadata.timeEnd}s
              </p>
              <div className="flex gap-2 mt-2">
                <Button disabled={busy} onClick={() => edit(clip)}>
                  Edit
                </Button>
                <Button disabled={busy} onClick={() => remove(clip)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
      </div>
      <p className="text-xs text-white/50">
        Markers reference the original video; they do not download or create a new video file. The
        source must remain accessible to every player.
      </p>
    </section>
  );
}
