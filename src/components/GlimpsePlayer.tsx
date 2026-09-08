import { useEffect, useRef, useCallback, useState } from "react";
import videojs from "video.js";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import type Player from "video.js/dist/types/player";

interface GlimpsePlayerProps {
  youtubeId?: string;
  videoUrl?: string; // For uploaded/local files
  playing: boolean;
  positionSec: number;
  isController: boolean;
  onReport?: (state: { playing: boolean; positionSec: number }) => void;
  onReady?: () => void; // Called when video is loaded and ready to play
  // Segment ladder support
  timeStart?: number; // Start offset in seconds (default 0)
  timeEnd?: number; // End limit in seconds (default = duration)
  segmentDuration?: number; // Current segment duration (1s, 2s, 3s, 5s)
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
  videoUrl,
  playing,
  positionSec,
  isController,
  onReport,
  onReady,
  timeStart = 0,
  timeEnd,
  segmentDuration,
}: GlimpsePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const syncIntervalRef = useRef<number | null>(null);
  const reportIntervalRef = useRef<number | null>(null);
  const lastVideoIdRef = useRef<string>("");
  const readyReportedRef = useRef<boolean>(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // Track if we've seeked to start for current video
  const hasInitialSeekedRef = useRef<boolean>(false);

  // Determine current video ID (YouTube ID or video URL)
  const currentVideoId = youtubeId || videoUrl || "";

  // Initialize or recreate player when video source changes
  useEffect(() => {
    if (!videoRef.current) return;

    // Skip if already initializing
    if (isInitializing) return;

    // Dispose old player if video source changed
    if (lastVideoIdRef.current && lastVideoIdRef.current !== currentVideoId) {
      if (playerRef.current) {
        try {
          playerRef.current.dispose();
        } catch (err) {
          console.warn("[GlimpsePlayer] Error disposing player:", err);
        }
        playerRef.current = null;
      }
      readyReportedRef.current = false;
      hasInitialSeekedRef.current = false; // Reset seek flag
      setVideoError(null); // Clear error for new video
    }

    lastVideoIdRef.current = currentVideoId;

    // Skip if already initialized for this video
    if (playerRef.current) return;

    // Initialize Video.js
    setIsInitializing(true);

    // Delay initialization slightly to ensure DOM is fully ready
    const initTimeout = setTimeout(() => {
      if (!videoRef.current) {
        setIsInitializing(false);
        return;
      }

      try {
        // Configure based on source type
        const isYouTube = !!youtubeId;
        const playerOptions: any = {
          autoplay: false,
          controls: true,
        };

        if (isYouTube) {
          playerOptions.techOrder = ["youtube"];
          playerOptions.youtube = {
            iv_load_policy: 3, // Disable annotations
            modestbranding: 1,
            rel: 0,
          };
          playerOptions.sources = [
            {
              type: "video/youtube",
              src: `https://www.youtube.com/watch?v=${youtubeId}`,
            },
          ];
        } else if (videoUrl) {
          // Native video player for uploads
          playerOptions.sources = [
            {
              src: videoUrl,
            },
          ];
        }

        const player = videojs(videoRef.current, playerOptions);

        playerRef.current = player;

        // Report ready when video can play
        const handleReady = () => {
          if (!readyReportedRef.current && onReady) {
            readyReportedRef.current = true;
            onReady();
            
            // Seek to timeStart when ready
            if (!hasInitialSeekedRef.current && playerRef.current && timeStart > 0) {
              try {
                playerRef.current.currentTime(timeStart);
                hasInitialSeekedRef.current = true;
              } catch (err) {
                console.warn("[GlimpsePlayer] Error seeking to start:", err);
              }
            }
          }
        };

        const handleLoadedData = () => {
          handleReady();
        };

        const handleCanPlay = () => {
          handleReady();
        };

        const handleError = (err: unknown) => {
          console.error("[GlimpsePlayer] Video error:", currentVideoId, err);
          
          // Provide user-friendly error messages
          const error = player.error();
          let errorMessage = "Video failed to load";
          
          if (error) {
            switch (error.code) {
              case 2: // MEDIA_ERR_NETWORK
                errorMessage = "Network error loading video";
                break;
              case 3: // MEDIA_ERR_DECODE
                errorMessage = "Video decode error";
                break;
              case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                errorMessage = isYouTube 
                  ? "YouTube video unavailable (may be age-restricted, private, or region-locked)"
                  : "Video format not supported";
                break;
              case 5: // MEDIA_ERR_ENCRYPTED
                errorMessage = "Video is encrypted";
                break;
            }
          }
          
          setVideoError(errorMessage);
        };

        // Video.js 'loadeddata' or 'canplay' indicates video is ready
        player.on("loadeddata", handleLoadedData);
        player.on("canplay", handleCanPlay);
        player.on("error", handleError);

        // Player ready event
        player.ready(() => {
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
  }, [currentVideoId, onReady, timeStart]);

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
  // Also respects segment bounds for consistent segment loop behavior
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

        // Enforce segment bounds even for followers
        // This prevents drift when host loops back but follower hasn't synced yet
        const effectiveSegmentEnd = segmentDuration 
          ? Math.min(timeStart + segmentDuration, timeEnd || Infinity)
          : Infinity;
        
        let targetPosition = positionSec;
        
        // If we're way out of segment bounds, clamp to segment window before syncing
        if (segmentDuration) {
          if (currentTime >= effectiveSegmentEnd) {
            // Loop back to start
            targetPosition = timeStart;
          } else if (currentTime < timeStart - 0.5) {
            // Clamp to start
            targetPosition = timeStart;
          }
        }

        // Check if we're out of sync with target position
        if (!withinPos(currentTime, targetPosition, 2)) {
          // Seek to target position
          playerRef.current.currentTime(targetPosition);
          
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
  }, [isController, playing, positionSec, segmentDuration, timeStart, timeEnd]);

  // Segment ladder: monitor playback and loop when reaching segment end
  // Hardened with Video.js events for reliable seeking
  useEffect(() => {
    if (!playerRef.current || !segmentDuration) return;

    const player = playerRef.current;
    const segmentEnd = Math.min(timeStart + segmentDuration, timeEnd || Infinity);
    
    // Track if we're currently seeking to prevent re-entrant seeks
    let isSeeking = false;

    const handleTimeUpdate = () => {
      if (!playerRef.current || isSeeking) return;

      try {
        const currentTime = playerRef.current.currentTime() || 0;

        // Enforce segment bounds: loop if we've exceeded the segment window
        if (currentTime >= segmentEnd) {
          isSeeking = true;
          playerRef.current.currentTime(timeStart);
        } else if (currentTime < timeStart - 0.5) {
          // If somehow we're before the start (user manual seek), clamp to start
          isSeeking = true;
          playerRef.current.currentTime(timeStart);
          console.log("[GlimpsePlayer] Clamped to segment start:", timeStart);
        }
      } catch (err) {
        console.debug("Segment timeupdate error:", err);
      }
    };

    const handleSeeked = () => {
      // Reset seeking flag once seek completes
      isSeeking = false;
    };

    const handleSeeking = () => {
      // Mark that we're seeking to prevent concurrent seeks
      // Note: this handles both programmatic seeks and user manual seeks
    };

    // Use Video.js event API
    player.on("timeupdate", handleTimeUpdate);
    player.on("seeked", handleSeeked);
    player.on("seeking", handleSeeking);

    return () => {
      player.off("timeupdate", handleTimeUpdate);
      player.off("seeked", handleSeeked);
      player.off("seeking", handleSeeking);
    };
  }, [segmentDuration, timeStart, timeEnd]);

  return (
    <div data-vjs-player className="vjs-glimpse-player relative">
      {videoError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 rounded-lg">
          <div className="text-center px-6 py-4 max-w-md">
            <p className="text-red-400 font-semibold text-lg mb-2">⚠️ Video Error</p>
            <p className="text-white/80 text-sm">{videoError}</p>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-big-play-centered"
        playsInline
      />
    </div>
  );
}
