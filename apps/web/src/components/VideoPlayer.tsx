"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import videojs from "video.js";
import { buildBackendUrl } from "@/lib/platform-config";

type PlaybackType = "live" | "vod";

type VideoPlayerProps = {
  src: string;
  type: PlaybackType;
  title?: string;
  poster?: string;
  videoId?: string;
  vastTagUrl?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
};

type VideoJsPlayer = ReturnType<typeof videojs>;

const WATCH_HISTORY_INTERVAL_MS = 10_000;

function getSourceType(src: string) {
  return src.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4";
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

export default function VideoPlayer({
  src,
  type,
  title,
  poster,
  videoId,
  vastTagUrl,
  autoPlay = false,
  muted = false,
  className = ""
}: VideoPlayerProps) {
  const playerId = useId();
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const trackingAbortRef = useRef<AbortController | null>(null);
  const initialVolumeRef = useRef(muted ? 0 : 0.85);
  const initialPosterRef = useRef(poster);
  const initialSrcRef = useRef(src);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [volume, setVolume] = useState(muted ? 0 : 0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isLive = type === "live";
  const shouldTrackWatchHistory = type === "vod" && Boolean(videoId);

  const syncFromPlayer = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    setCurrentTime(player.currentTime() ?? 0);
    setDuration(player.duration() ?? 0);
    setIsMuted(player.muted() ?? false);
    setVolume(player.volume() ?? 0);
    setIsPlaying(!player.paused());
  }, []);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.paused()) {
      void player.play();
      return;
    }

    player.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const nextMuted = !player.muted();
    player.muted(nextMuted);

    if (!nextMuted && player.volume() === 0) {
      player.volume(0.65);
    }

    syncFromPlayer();
  }, [syncFromPlayer]);

  const updateVolume = useCallback((nextVolume: number) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const normalizedVolume = Math.min(Math.max(nextVolume, 0), 1);
    player.volume(normalizedVolume);
    player.muted(normalizedVolume === 0);
    setVolume(normalizedVolume);
    setIsMuted(normalizedVolume === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    if (player.isFullscreen()) {
      player.exitFullscreen();
      return;
    }

    player.requestFullscreen();
  }, []);

  useEffect(() => {
    if (!videoElementRef.current || playerRef.current) {
      return;
    }

    const player = videojs(videoElementRef.current, {
      autoplay: autoPlay,
      controls: false,
      fluid: true,
      liveui: isLive,
      muted,
      playsinline: true,
      preload: isLive ? "auto" : "metadata",
      poster: initialPosterRef.current,
      responsive: true,
      sources: [
        {
          src: initialSrcRef.current,
          type: getSourceType(initialSrcRef.current)
        }
      ],
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true
        }
      }
    });

    playerRef.current = player;

    player.ready(() => {
      setIsReady(true);
      player.volume(initialVolumeRef.current);
      syncFromPlayer();
    });

    player.on("play", syncFromPlayer);
    player.on("pause", syncFromPlayer);
    player.on("volumechange", syncFromPlayer);
    player.on("timeupdate", syncFromPlayer);
    player.on("durationchange", syncFromPlayer);
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(player.isFullscreen()));
    };

    player.on("fullscreenchange", handleFullscreenChange);

    return () => {
      trackingAbortRef.current?.abort();
      player.off("play", syncFromPlayer);
      player.off("pause", syncFromPlayer);
      player.off("volumechange", syncFromPlayer);
      player.off("timeupdate", syncFromPlayer);
      player.off("durationchange", syncFromPlayer);
      player.off("fullscreenchange", handleFullscreenChange);
      player.dispose();
      playerRef.current = null;
    };
  }, [autoPlay, isLive, muted, syncFromPlayer]);

  useEffect(() => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    player.src({
      src,
      type: getSourceType(src)
    });

    if (poster) {
      player.poster(poster);
    }
  }, [poster, src]);

  useEffect(() => {
    if (!shouldTrackWatchHistory) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const player = playerRef.current;

      if (!player || player.paused()) {
        return;
      }

      const playbackTime = Math.floor(player.currentTime() ?? 0);

      trackingAbortRef.current?.abort();
      trackingAbortRef.current = new AbortController();

      void fetch(buildBackendUrl("/api/watch-history"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(vastTagUrl ? { "X-Vast-Tag": vastTagUrl } : {})
        },
        body: JSON.stringify({
          videoId,
          currentTime: playbackTime
        }),
        keepalive: true,
        signal: trackingAbortRef.current.signal
      }).catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Unable to update watch history", error);
      });
    }, WATCH_HISTORY_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
      trackingAbortRef.current?.abort();
    };
  }, [shouldTrackWatchHistory, vastTagUrl, videoId]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const progressValue = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section
      aria-label={title ? `${title} video player` : "Video player"}
      className={`group relative overflow-hidden rounded-lg bg-black shadow-player ${className}`}
    >
      <video
        ref={videoElementRef}
        id={playerId}
        className="video-js h-full min-h-[220px] w-full bg-black object-contain"
        playsInline
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 opacity-100 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between gap-3 sm:left-4 sm:right-4 sm:top-4">
        <div className="min-w-0">
          {title ? (
            <h2 className="truncate text-sm font-semibold text-white drop-shadow sm:text-base">
              {title}
            </h2>
          ) : null}
        </div>

        {isLive ? (
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-red-400/40 bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-lg">
            <span className="h-2 w-2 rounded-full bg-white" />
            Live
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-3 sm:p-4">
        {!isLive ? (
          <div className="flex items-center gap-3 text-xs font-medium text-white/80">
            <span className="w-12 tabular-nums">{formatTime(currentTime)}</span>
            <div
              aria-hidden="true"
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20"
            >
              <div
                className="h-full rounded-full bg-stream-red transition-[width] duration-200"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <span className="w-12 text-right tabular-nums">{formatTime(duration)}</span>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/45 px-3 py-2 text-white backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!isReady}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={!isReady}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <VolumeIcon size={20} />
            </button>

            <label className="sr-only" htmlFor={`${playerId}-volume`}>
              Volume
            </label>
            <input
              id={`${playerId}-volume`}
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              disabled={!isReady}
              onChange={(event) => updateVolume(Number(event.currentTarget.value))}
              className="h-1.5 w-24 accent-white disabled:opacity-50 sm:w-32"
            />
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            disabled={!isReady}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
