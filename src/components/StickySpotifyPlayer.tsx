import React, { useState, useEffect, useRef } from 'react';
import { SpotifyTrack } from '../types';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Heart, 
  ExternalLink,
  Music2,
  Tv,
  Radio,
  Sparkles
} from 'lucide-react';
import { SpotifyService } from '../services/spotify';

interface StickySpotifyPlayerProps {
  currentTrack: SpotifyTrack | null;
  onTogglePlay: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeek: (seconds: number) => void;
  isPlaying: boolean;
  progressSeconds: number;
  onOpenConnectModal?: () => void;
  isFreeAccount?: boolean;
}

export function StickySpotifyPlayer({
  currentTrack,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSeek,
  isPlaying,
  progressSeconds,
  onOpenConnectModal,
  isFreeAccount,
}: StickySpotifyPlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [useEmbedMode, setUseEmbedMode] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto fallback to embed if no previewUrl is available or flagged as free
  useEffect(() => {
    if (currentTrack && !currentTrack.previewUrl && isFreeAccount) {
      setUseEmbedMode(true);
    }
  }, [currentTrack, isFreeAccount]);

  useEffect(() => {
    if (!currentTrack?.previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.previewUrl);
    } else if (audioRef.current.src !== currentTrack.previewUrl) {
      audioRef.current.src = currentTrack.previewUrl;
    }

    audioRef.current.volume = isMuted ? 0 : volume / 100;

    if (isPlaying && !useEmbedMode) {
      audioRef.current.play().catch(() => {
        // Fallback to embed mode if browser autoplay blocked or audio failed
        setUseEmbedMode(true);
      });
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [currentTrack?.previewUrl, isPlaying, useEmbedMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) {
    return (
      <div 
        id="spotify-persistent-player"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl liquid-glass rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl border border-white/[0.08] select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/50">
            <Music2 className="w-4 h-4" />
          </div>
          <span className="text-xs text-white/50">Spotify 串流中心就緒 · 點選曲目即刻啟動</span>
        </div>

        {onOpenConnectModal && (
          <button
            onClick={onOpenConnectModal}
            className="px-3 py-1 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-all cursor-pointer shadow-sm"
          >
            連動 Spotify
          </button>
        )}
      </div>
    );
  }

  const duration = currentTrack.durationSeconds || 180;
  const progressPercent = Math.min(100, Math.max(0, (progressSeconds / duration) * 100));
  const embedUrl = SpotifyService.getEmbedUrl(currentTrack.id || currentTrack.uri);

  return (
    <div 
      id="spotify-persistent-player"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl flex flex-col gap-2 select-none"
    >
      {/* Optional Expandable Spotify Embed Widget (for Free / fallback) */}
      {embedOpen && (
        <div className="liquid-glass rounded-2xl p-2 border border-white/15 shadow-2xl animate-in slide-in-from-bottom-2 duration-200 overflow-hidden">
          <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] text-white/60">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <Sparkles className="w-3 h-3" />
              <span>Spotify 嵌入播放器 (Free 免費版相容模式)</span>
            </span>
            <button 
              onClick={() => setEmbedOpen(false)}
              className="text-white/40 hover:text-white transition-colors"
            >
              收起 ✕
            </button>
          </div>
          <iframe
            src={embedUrl}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
            title="Spotify Embed Player"
          />
        </div>
      )}

      {/* Main Liquid Glass Player Bar */}
      <div className="liquid-glass rounded-2xl sm:rounded-[26px] p-2.5 sm:px-4 sm:py-3 shadow-2xl border border-white/[0.1] flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left Track Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img 
              src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80'} 
              alt={currentTrack.title}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/10 flex-shrink-0"
            />

            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-[10px] text-white/50 truncate">
                {currentTrack.artist}
              </p>
            </div>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`p-1 rounded transition-colors hidden sm:block ${
                isLiked ? 'text-rose-400' : 'text-white/30 hover:text-white/70'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
            </button>
          </div>

          {/* Center Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onPrevTrack}
              className="p-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNextTrack}
              className="p-1.5 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Volume & Embed Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEmbedOpen(!embedOpen)}
              title="切換 Spotify 官方嵌入視窗 (Free 免費版播放模式)"
              className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all cursor-pointer ${
                embedOpen 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-white/[0.04] text-white/50 hover:text-white border-white/[0.08]'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">嵌入視窗</span>
            </button>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/40 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-14 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
              />
            </div>

            {currentTrack.externalUrl && (
              <a
                href={currentTrack.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-white/40 hover:text-white transition-colors hidden sm:block"
                title="在 Spotify 開啟"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Bottom Progress Scrub Bar */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-[9px] font-mono text-white/40 w-6 text-right">
            {formatTime(progressSeconds)}
          </span>

          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPos = (e.clientX - rect.left) / rect.width;
              onSeek(Math.floor(clickPos * duration));
            }}
            className="flex-1 h-1 bg-white/10 hover:h-1.5 rounded-full overflow-hidden cursor-pointer transition-all relative"
          >
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[9px] font-mono text-white/40 w-6">
            {currentTrack.duration || formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
