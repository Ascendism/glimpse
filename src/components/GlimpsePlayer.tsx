import { useEffect, useRef, useCallback, useState } from "react";
import videojs from "video.js";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface GlimpsePlayerProps {
  youtubeId: string;
  playing: boolean;
  positionSec: number;
  isController: boolean;
  onReport?: (state: { playing: boolean; positionSec: number }) => void;
  onReady?: () => void; // Called when video is loaded and ready to play
}

/**
 * GlimpsePlayer: Video.js YouTube player with host-authoritative sync.
 * 
 * Based on qbot player.js sync algorithm:
 * - Host (controller): drives play/pause locally, reports position to shared state
 * - Non-host (followers): sync to shared state with ~1-2s tolerance (withinPos)
 */
export function GlimpsePlayer({
  youtubeId,
  playing,
  positionSec,
  isController,
  onReport,
  onReady,
}: GlimpsePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const reportIntervalRef = useRef<number | null>(null);
  const lastYoutubeIdRef = useRef<string>("");
  const readyReportedRef = useRef<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize or recreate player when YouTube ID changes
  useEffect(() => {
    if (!videoRef.current) return;

    // Skip if already initializing
    if (isInitializing) return;

    // Dispose old player if YouTube ID changed
    if (lastYoutubeIdRef.current && lastYoutubeIdRef.current !== youtubeId) {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (err) {
          console.warn("[GlimpsePlayer] Error disposing player:", err);
        }
        playerRef.current = null;
      }
      readyReportedRef.current = false;
    }

    lastYoutubeIdRef.current = youtubeId;

    // Skip if already initialized for this video
    if (playerRef.current) return;

    // Initialize Video.js with YouTube tech (qbot-style)
    setIsInitializing(true);

    // Delay initialization slightly to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      if (!videoRef.current) {
        setIsInitializing(false);
        return;
      }

      try {
        const player = videojs(videoRef.current, {
          techOrder: ["youtube"],
          autoplay: false,
          controls: true,
          youtube: {
            iv_load_policy: 3, // Disable annotations
            modestbranding: 1,
            rel: 0,
          },
          sources: [
            {
              type: "video/youtube",
              src: `https://www.youtube.com/watch?v=${youtubeId}`,
            },
          ],
        });

        playerRef.current = player;

        // Report ready when video can play
        const handleReady = () => {
          if (!readyReportedRef.current && onReady) {
            readyReportedRef.current = true;
            onReady();
          }
        };

        const handleLoadedData = () => {
          console.log("[GlimpsePlayer] Video loaded:", youtubeId);
          handleReady();
        };

        const handleCanPlay = () => {
          console.log("[GlimpsePlayer] Video can play:", youtubeId);
          handleReady();
        };

        const handleError = (err: unknown) => {
          console.error("[GlimpsePlayer] Video error:", youtubeId, err);
        };

        // Video.js 'loadeddata' or 'canplay' indicates video is ready
        player.on("loadeddata", handleLoadedData);
        player.on("canplay", handleCanPlay);
        player.on("error", handleError);

        // YouTube tech specific ready event
        player.ready(() => {
          console.log("[GlimpsePlayer] Player ready:", youtubeId);
          setIsInitializing(false);
        });
      } catch (err) {
        console.error("[GlimpsePlayer] Error initializing player:", err);
        setIsInitializing(false);
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup on unmount or video change
    return () => {
      clearTimeout(initTimeout);
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (err) {
          console.warn("[GlimpsePlayer] Error in cleanup:", err);
        }
        playerRef.current = null;
      }
      setIsInitializing(false);
    };
  }, [youtubeId, onReady]);

  // Controller (host): report position periodically
  useEffect(() => {
    if (!isController || !playerRef.current || !onReport) return;

    // Report current position every 500ms while controller
    reportIntervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;
      
      try {
        const currentTime = playerRef.current.currentTime() || 0;
        const paused = playerRef.current.paused();
        
        onReport({
          playing: !paused,
          positionSec: currentTime,
        });
      } catch (err) {
        // Video.js may not be ready yet
        console.debug("Player not ready for position report:", err);
      }
    }, 500);

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current);
      }
    };
  }, [isController, onReport]);

  // Follower (non-host): sync to shared state with qbot withinPos tolerance
  useEffect(() => {
    if (isController || !playerRef.current) return;

    // qbot-style sync check: keep within ~2 seconds of target
    const withinPos = (ourPos: number, targetPos: number, within: number = 2): boolean => {
      const start = targetPos - within;
      const end = targetPos + within;
      return ourPos >= start && ourPos <= end;
    };

    syncIntervalRef.current = window.setInterval(() => {
      if (!playerRef.current) return;

      try {
        const currentTime = playerRef.current.currentTime() || 0;
        const paused = playerRef.current.paused();

        // Check if we're out of sync with target position
        if (!withinPos(currentTime, positionSec, 2)) {
          // Seek to target position
          playerRef.current.currentTime(positionSec);
          
          // Match play/pause state
          if (playing && paused) {
            playerRef.current.play().catch(() => {
              // Autoplay may be blocked
            });
          } else if (!playing && !paused) {
            playerRef.current.pause();
          }
        }

        // Always match play/pause state (qbot does this every loop)
        if (playing && paused) {
          playerRef.current.play().catch(() => {
            // Autoplay may be blocked
          });
        } else if (!playing && !paused) {
          playerRef.current.pause();
        }
      } catch (err) {
        // Video.js may not be ready yet
        console.debug("Player not ready for sync:", err);
      }
    }, 1000); // Check every 1 second

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isController, playing, positionSec]);

  return (
    <div data-vjs-player className="vjs-glimpse-player">
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
    </div>
  );
}
