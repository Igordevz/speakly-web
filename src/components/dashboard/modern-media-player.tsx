"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  FastForward,
  Rewind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModernMediaPlayerProps {
  src: string;
  type: "audio" | "video";
  onTimeUpdate?: (time: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function ModernMediaPlayer({
  src,
  type,
  onTimeUpdate,
  onPlayStateChange,
}: ModernMediaPlayerProps) {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const parts = [
      hours > 0 ? hours.toString().padStart(2, "0") : null,
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].filter(Boolean);
    return parts.join(":");
  };

  const hideControls = () => {
    if (type === "video" && isPlaying) {
      setShowControls(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const setMediaData = () => setDuration(media.duration);
    const updateCurrentTime = () => {
      setCurrentTime(media.currentTime);
      if (onTimeUpdate) onTimeUpdate(media.currentTime);
    };
    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    media.addEventListener("loadedmetadata", setMediaData);
    media.addEventListener("timeupdate", updateCurrentTime);
    media.addEventListener("play", handlePlay);
    media.addEventListener("pause", handlePause);
    media.addEventListener("ended", handlePause);

    return () => {
      media.removeEventListener("loadedmetadata", setMediaData);
      media.removeEventListener("timeupdate", updateCurrentTime);
      media.removeEventListener("play", handlePlay);
      media.removeEventListener("pause", handlePause);
      media.removeEventListener("ended", handlePause);
    };
  }, [onTimeUpdate, onPlayStateChange]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const media = mediaRef.current;
    if (!media) return;
    if (media.paused) {
      media.play();
    } else {
      media.pause();
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (mediaRef.current) mediaRef.current.volume = newVolume;
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    const newMutedState = !isMuted;
    media.muted = newMutedState;
    setIsMuted(newMutedState);
    if (!newMutedState) {
      setVolume(media.volume > 0 ? media.volume : 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const time = (parseFloat(e.target.value) / 100) * duration;
    media.currentTime = time;
    setCurrentTime(time);
  };

  const toggleFullScreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!isFullScreen) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (mediaRef.current) mediaRef.current.playbackRate = nextRate;
  };

  const seek = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const playerControls = (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
        type === "audio" && "static bg-transparent from-transparent",
        showControls ? "opacity-100" : "opacity-0",
      )}
      onMouseEnter={() => {
        if (controlsTimeoutRef.current)
          clearTimeout(controlsTimeoutRef.current);
      }}
      onMouseLeave={() => {
        controlsTimeoutRef.current = setTimeout(hideControls, 500);
      }}
    >
      {/* Progress Bar */}
      <div className="flex items-center gap-2 group">
        <span className="text-white text-xs font-mono">
          {formatTime(currentTime)}
        </span>
        <div className="relative w-full h-1.5 bg-gray-200/20 rounded-full flex items-center">
          <div
            className="absolute h-full bg-red-500 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          <div
            className="absolute h-3 w-3 bg-red-500 rounded-full -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
          <input
            ref={progressBarRef}
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={(currentTime / duration) * 100 || 0}
            onChange={handleSeek}
            className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10 opacity-0"
          />
        </div>
        <span className="text-white text-xs font-mono">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <div className="flex items-center group">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={toggleMute}
            >
              <VolumeIcon size={24} />
            </Button>
            <div className="relative w-0 group-hover:w-20 h-1.5 bg-gray-200/20 rounded-full flex items-center transition-all duration-300">
              <div
                className="absolute h-full bg-white rounded-full"
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <div
                className="absolute h-3 w-3 bg-white rounded-full -translate-x-1/2"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="relative w-full h-full appearance-none bg-transparent cursor-pointer z-10 opacity-0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => seek(-10)}
          >
            <Rewind size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => seek(10)}
          >
            <FastForward size={20} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10 text-xs font-bold"
            onClick={changePlaybackRate}
          >
            {playbackRate}x
          </Button>
          {type === "video" && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          )}
          <a href={src} download>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Download size={20} />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );

  if (type === "video") {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          controlsTimeoutRef.current = setTimeout(hideControls, 1000);
        }}
      >
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          className="w-full h-full"
          onClick={togglePlay}
          onDoubleClick={toggleFullScreen}
        />
        {playerControls}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none",
            isPlaying ? "opacity-0" : "opacity-100",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-white bg-black/50 w-20 h-20 rounded-full pointer-events-auto"
            onClick={togglePlay}
          >
            <Play size={40} className="ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-xl border bg-card/50 backdrop-blur">
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        src={src}
        className="hidden"
      />
      <div className="text-sm font-medium text-foreground mb-2 truncate">
        Reproduzindo áudio
      </div>
      {playerControls}
    </div>
  );
}
