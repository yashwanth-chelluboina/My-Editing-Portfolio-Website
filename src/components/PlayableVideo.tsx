import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize2, RotateCcw } from 'lucide-react';
import {
  drawSceneArtwork,
  getProceduralSceneDataUrl,
  PreviewSceneId,
} from '../utils/proceduralMedia';

interface PlayableVideoProps {
  videoUrl?: string;
  posterUrl?: string;
  fallbackSceneId?: PreviewSceneId;
  title: string;
  subtitle?: string;
  isShowreel?: boolean;
}

const SHOWREEL_SEQUENCE: { id: PreviewSceneId; label: string }[] = [
  { id: 'landscape', label: 'SCENE 01 // ANAMORPHIC TWILIGHT GRADE' },
  { id: 'product', label: 'SCENE 02 // MACRO CHRONOGRAPH REVEAL' },
  { id: 'city', label: 'SCENE 03 // NEO-NOIR METROPOLIS VFX' },
  { id: 'ad', label: 'SCENE 04 // ATELIER COMMERCIAL CUT' },
  { id: 'colorgrade', label: 'SCENE 05 // CHIAROSCURO PORTRAIT MASTER' },
];

export const PlayableVideo: React.FC<PlayableVideoProps> = ({
  videoUrl,
  posterUrl,
  fallbackSceneId = 'landscape',
  title,
  subtitle,
  isShowreel = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0); 
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [duration, setDuration] = useState(isShowreel ? 30 : 16);

  const hasExternalVideo = Boolean(videoUrl && videoUrl.trim().length > 0);
  const resolvedPoster =
    posterUrl && posterUrl.trim().length > 0
      ? posterUrl
      : getProceduralSceneDataUrl(fallbackSceneId, 1280, 720);

  useEffect(() => {
    if (hasExternalVideo) return;
    const canvas = streamCanvasRef.current;
    const videoEl = videoRef.current;
    if (!canvas || !videoEl) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawFrame(ctx, canvas.width, canvas.height, 0);
    try {
      const canCapture = typeof (canvas as any).captureStream === 'function';
      if (canCapture && !videoEl.srcObject) {
        const stream = (canvas as any).captureStream(30);
        videoEl.srcObject = stream;
      }
    } catch {}
  }, [hasExternalVideo, fallbackSceneId, isShowreel]);

  useEffect(() => {
    if (hasExternalVideo || !isPlaying) return;
    let rafId = 0;
    let lastTs = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.1);
      lastTs = now;
      setCurrentTimeSec((prev) => {
        const next = prev + dt;
        const wrapped = next >= duration ? 0 : next;
        setProgress((wrapped / duration) * 100);
        const canvas = streamCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawFrame(ctx, canvas.width, canvas.height, wrapped);
          }
        }
        return wrapped;
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [hasExternalVideo, isPlaying, duration, isShowreel, fallbackSceneId]);

  function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number, tSec: number) {
    let activeId: PreviewSceneId = fallbackSceneId;
    let sceneLabel = title.toUpperCase();
    if (isShowreel) {
      const idx = Math.floor((tSec / duration) * SHOWREEL_SEQUENCE.length) % SHOWREEL_SEQUENCE.length;
      activeId = SHOWREEL_SEQUENCE[idx].id;
      sceneLabel = SHOWREEL_SEQUENCE[idx].label;
    }
    drawSceneArtwork(ctx, w, h, activeId, tSec * 1.4);
    ctx.save();
    ctx.fillStyle = 'rgba(5, 5, 10, 0.68)';
    ctx.fillRect(36, h - 94, 460, 44);
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, h - 94, 460, 44);
    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 14px "JetBrains Mono", monospace';
    ctx.fillText(sceneLabel, 52, h - 67);
    const mins = String(Math.floor(tSec / 60)).padStart(2, '0');
    const secs = String(Math.floor(tSec % 60)).padStart(2, '0');
    const frames = String(Math.floor((tSec * 24) % 24)).padStart(2, '0');
    ctx.fillStyle = '#c084fc';
    ctx.fillText(`TC 01:00:${mins}:${secs}:${frames}`, w - 210, h - 67);
    ctx.restore();
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (hasExternalVideo && video) {
      if (video.paused) {
        video.play().then(() => setIsPlaying(true)).catch((err) => setIsPlaying(false));
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } else {
      if (video) {
        if (!isPlaying) video.play().catch(() => {});
        else video.pause();
      }
      setIsPlaying((p) => !p);
    }
  };

  const handleRestart = () => {
    const video = videoRef.current;
    if (hasExternalVideo && video) {
      video.currentTime = 0;
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      setCurrentTimeSec(0);
      setProgress(0);
      const canvas = streamCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawFrame(ctx, canvas.width, canvas.height, 0);
      }
      setIsPlaying(true);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    const targetSec = (val / 100) * duration;
    setCurrentTimeSec(targetSec);
    const video = videoRef.current;
    if (hasExternalVideo && video && Number.isFinite(video.duration)) {
      video.currentTime = targetSec;
    } else {
      const canvas = streamCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawFrame(ctx, canvas.width, canvas.height, targetSec);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !isMuted;
    setIsMuted((m) => !m);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      // REMOVED `aspect-video` to allow the container to match the video's actual dimensions
      className="group relative w-full bg-[#07070c] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
    >
      {!hasExternalVideo && (
        <canvas
          ref={streamCanvasRef}
          width={1280}
          height={720}
          onClick={togglePlay}
          // CHANGED to object-contain
          className="absolute inset-0 w-full h-full object-contain cursor-pointer"
        />
      )}
      <video
        ref={videoRef}
        src={hasExternalVideo ? videoUrl : undefined}
        poster={resolvedPoster}
        muted={isMuted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onLoadedMetadata={(e) => {
          if (hasExternalVideo) setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e) => {
          if (!hasExternalVideo) return;
          const v = e.currentTarget;
          if (v.duration) {
            setCurrentTimeSec(v.currentTime);
            setProgress((v.currentTime / v.duration) * 100);
          }
        }}
        onEnded={() => setIsPlaying(false)}
        // CHANGED to object-contain so actual file size isn't cropped
        className={`w-full h-full object-contain cursor-pointer ${
          hasExternalVideo ? 'relative z-10' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div
        onClick={togglePlay}
        className={`absolute inset-0 z-20 flex flex-col justify-between p-5 sm:p-7 bg-gradient-to-t from-black/85 via-black/25 to-black/45 transition-opacity duration-300 cursor-pointer ${
          isPlaying ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs tracking-wider text-violet-300">
              {subtitle || (isShowreel ? '2026 MASTER SHOWREEL // 4K 60FPS' : 'VIDEO EDITING SHOWCASE')}
            </p>
            <h4 className="font-display text-base sm:text-lg font-semibold text-white">
              {title}
            </h4>
          </div>
          <span className="font-mono text-xs text-zinc-400">
            {hasExternalVideo ? 'CUSTOM SOURCE' : 'PROCEDURAL STUDIO REEL'}
          </span>
        </div>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-950/60 transition-transform duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Play className="w-7 h-7 sm:w-8 sm:h-8 ml-1" />
            )}
          </button>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-2.5 pt-2">
          <input
            type="range"
            min={0}
            max={100}
            step={0.2}
            value={progress || 0}
            onChange={handleScrub}
            aria-label="Seek video timeline"
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex items-center justify-between gap-4 text-xs font-mono text-zinc-300">
            <div className="flex items-center gap-3">
              <button type="button" onClick={togglePlay} className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer">
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button type="button" onClick={handleRestart} aria-label="Restart video" className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Unmute video' : 'Mute video'} className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <span className="tabular-nums text-zinc-300">
                {formatTime(currentTimeSec)} / {formatTime(duration)}
              </span>
            </div>
            <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen video" className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};