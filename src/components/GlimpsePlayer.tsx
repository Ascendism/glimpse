import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface GlimpsePlayerProps {
  youtubeId?: string | undefined;
  videoUrl?: string | undefined;
  playing: boolean;
  positionSec: number;
  isController: boolean;
  onReport?: ((state: { playing: boolean; positionSec: number }) => void) | undefined;
  onReady?: (() => void) | undefined;
  timeStart?: number | undefined;
  timeEnd?: number | undefined;
  segmentDuration?: number | undefined;
}

export function GlimpsePlayer(props: GlimpsePlayerProps) {
  const container = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const latest = useRef(props);
  latest.current = props;
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    // Video.js owns and removes this element; React owns only the container.
    const element = document.createElement("video-js");
    element.className = "video-js vjs-default-skin";
    element.setAttribute("playsinline", "");
    container.current.appendChild(element);
    setError(null);
    let disposed = false;
    let ready = false;
    let lastReport = 0;
    const player = videojs(element, {
      controls: false,
      autoplay: false,
      preload: "auto",
      fluid: true,
      ...(props.youtubeId
        ? {
            techOrder: ["youtube"],
            youtube: { iv_load_policy: 3, rel: 0 },
            sources: [
              { type: "video/youtube", src: `https://www.youtube.com/watch?v=${props.youtubeId}` },
            ],
          }
        : { sources: [{ src: props.videoUrl || "" }] }),
    });
    playerRef.current = player;
    const markReady = () => {
      if (ready || disposed) return;
      ready = true;
      player.currentTime(Math.max(latest.current.timeStart ?? 0, latest.current.positionSec));
      latest.current.onReady?.();
    };
    player.on("loadeddata", markReady);
    player.on("canplay", markReady);
    player.on("error", () =>
      setError(
        "This video could not load. The host can choose another clip. Check whether it allows embedding.",
      ),
    );
    const timer = window.setInterval(() => {
      if (!ready || disposed) return;
      const p = latest.current;
      const start = p.timeStart ?? 0;
      const end = Math.min(p.timeEnd ?? Infinity, start + (p.segmentDuration ?? Infinity));
      let position = player.currentTime() ?? start;
      if (position < start || position >= end) {
        player.currentTime(start);
        position = start;
      } else if (!p.isController && Math.abs(position - p.positionSec) > 0.75) {
        player.currentTime(Math.max(start, Math.min(p.positionSec, end - 0.05)));
      }
      if (p.playing && player.paused()) {
        player
          .play()
          ?.then(() => {
            if (!disposed) setBlocked(false);
          })
          .catch(() => {
            if (!disposed) setBlocked(true);
          });
      } else if (!p.playing && !player.paused()) player.pause();
      if (p.isController && Date.now() - lastReport >= 500) {
        lastReport = Date.now();
        p.onReport?.({ playing: p.playing, positionSec: position });
      }
    }, 100);
    return () => {
      disposed = true;
      clearInterval(timer);
      playerRef.current = null;
      player.dispose();
    };
  }, [props.youtubeId, props.videoUrl]);

  const enablePlayback = () => {
    const player = playerRef.current;
    if (!player) return;
    player.muted(false);
    player
      .play()
      ?.then(() => setBlocked(false))
      .catch(() => setBlocked(true));
  };
  return (
    <div className="relative">
      <div ref={container} data-vjs-player />
      {error && (
        <div role="alert" className="absolute inset-0 bg-black/90 p-6 text-red-300">
          {error}
        </div>
      )}
      {blocked && !error && (
        <button onClick={enablePlayback} className="absolute inset-0 bg-black/70 text-gold">
          Tap to enable video and sound
        </button>
      )}
    </div>
  );
}
