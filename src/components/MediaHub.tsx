import React, { useState } from 'react';
import { SpotifyTrack, PlatformConfig, PlatformId } from '../types';
import { 
  Play, 
  Pause, 
  Music2, 
  Headphones, 
  ExternalLink, 
  Heart, 
  Share2, 
  Disc3,
  Video,
  Search,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Tv
} from 'lucide-react';
import { SpotifyService } from '../services/spotify';
import { SPOTIFY_CLIENT_ID } from '../config';

interface MediaHubProps {
  tracks: SpotifyTrack[];
  currentTrack: SpotifyTrack | null;
  isPlaying: boolean;
  onSelectTrack: (track: SpotifyTrack) => void;
  onTogglePlay: () => void;
  platforms: PlatformConfig[];
  onOpenConnectModal?: (platformId: PlatformId) => void;
  onRefreshSpotify?: () => void;
  isFreeAccount?: boolean;
}

export function MediaHub({
  tracks,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
  platforms,
  onOpenConnectModal,
  onRefreshSpotify,
  isFreeAccount,
}: MediaHubProps) {
  const [activeMediaTab, setActiveMediaTab] = useState<'spotify' | 'videos'>('spotify');
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showEmbedWidget, setShowEmbedWidget] = useState(false);

  const spotifyPlatform = platforms.find(p => p.id === 'spotify');
  const isSpotifyConnected = spotifyPlatform?.connected;

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedTrackIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleShare = (title: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText?.(`https://open.spotify.com/track/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchSpotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await SpotifyService.searchTracks(searchQuery.trim());
      setSearchResults(results);
    } catch {
      // Ignore
    } finally {
      setIsSearching(false);
    }
  };

  const displayTracks = searchResults.length > 0 ? searchResults : tracks;

  // Sample curated music list when none are loaded yet
  const sampleFallbackTracks: SpotifyTrack[] = [
    {
      id: '4cOdK2wGLETKBW3PvgPWqT',
      title: 'Liquid Glass (Ambient Serenity)',
      artist: 'Klue Waves',
      album: 'Low Saturation Serenade',
      albumArt: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80',
      duration: '3:45',
      durationSeconds: 225,
      progressSeconds: 0,
      isPlaying: false,
    },
    {
      id: '0VjIjW4GlUZAMYd2vXMi3b',
      title: 'Midnight Reflection',
      artist: 'Aetheria',
      album: 'Prism Soundscapes',
      albumArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
      duration: '4:12',
      durationSeconds: 252,
      progressSeconds: 0,
      isPlaying: false,
    },
    {
      id: '5QTxFnGygVM4jFQiBovmRo',
      title: 'Translucent Horizon',
      artist: 'Nordic Echoes',
      album: 'Pure Frequencies',
      albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
      duration: '2:58',
      durationSeconds: 178,
      progressSeconds: 0,
      isPlaying: false,
    }
  ];

  const tracksToRender = displayTracks.length > 0 ? displayTracks : sampleFallbackTracks;
  const currentEmbedUrl = currentTrack 
    ? SpotifyService.getEmbedUrl(currentTrack.id || currentTrack.uri)
    : 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';

  return (
    <div className="flex-1 overflow-y-auto pb-40 px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full select-none">
      
      {/* Header Liquid Glass Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              影音串流 (Media)
            </h2>
            <span className={`px-2 py-0.5 text-[10px] rounded-full border ${
              isSpotifyConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-white/[0.04] text-white/40 border-white/[0.06]'
            }`}>
              {isSpotifyConnected ? 'Spotify 已就緒' : '待連動 Spotify'}
            </span>
            {isSpotifyConnected && (
              <span className="text-[10px] text-white/40 font-mono">
                {isFreeAccount ? 'Free (Embed 模式)' : 'PKCE Mode'}
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Spotify PKCE 串流播放器與全網即時影音 · 支援 Free 帳號嵌入播放
          </p>
        </div>

        {/* Media Segment Switcher & Connect Button */}
        <div className="flex items-center gap-2">
          {!isSpotifyConnected && onOpenConnectModal && (
            <button
              onClick={() => onOpenConnectModal('spotify')}
              className="px-3 py-1.5 rounded-xl liquid-glass hover:bg-white/10 border border-white/15 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Music2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>連動 Spotify (PKCE)</span>
            </button>
          )}

          <div className="flex items-center p-1 rounded-2xl liquid-glass border border-white/[0.08]">
            <button
              onClick={() => setActiveMediaTab('spotify')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeMediaTab === 'spotify'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>音樂</span>
            </button>

            <button
              onClick={() => setActiveMediaTab('videos')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeMediaTab === 'videos'
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>影音</span>
            </button>
          </div>
        </div>
      </div>

      {activeMediaTab === 'spotify' ? (
        <div className="space-y-6">
          {/* Search Spotify Track Bar */}
          <form onSubmit={handleSearchSpotify} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋 Spotify 歌曲、歌手或專輯名稱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="px-4 py-2 rounded-2xl bg-white text-black disabled:opacity-40 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              <span>搜尋</span>
            </button>
          </form>

          {/* Featured Playing Spotlight Banner (if track selected) */}
          {currentTrack && (
            <div className="relative rounded-[32px] liquid-glass-card border border-white/[0.08] p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-5">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-lg flex-shrink-0 border border-white/15 group">
                <img 
                  src={currentTrack.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80'} 
                  alt={currentTrack.title}
                  className="w-full h-full object-cover" 
                />
                <div 
                  onClick={onTogglePlay}
                  className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[10px] text-white/60">
                    <Disc3 className={`w-3 h-3 ${isPlaying ? 'animate-spin text-emerald-400' : ''}`} />
                    <span>現正選取</span>
                  </div>

                  <button
                    onClick={() => setShowEmbedWidget(!showEmbedWidget)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <Tv className="w-3 h-3" />
                    <span>{showEmbedWidget ? '隱藏嵌入視窗' : '展開 Spotify 嵌入播放器'}</span>
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {currentTrack.title}
                </h3>
                <p className="text-xs text-white/60">
                  {currentTrack.artist} — <span className="text-white/40">{currentTrack.album}</span>
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <button
                    onClick={onTogglePlay}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? '暫停' : '播放'}</span>
                  </button>

                  {currentTrack.externalUrl && (
                    <a
                      href={currentTrack.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3.5 py-2 rounded-xl liquid-glass text-white/70 hover:text-white text-xs transition-colors"
                    >
                      <span>在 Spotify 開啟</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Spotify Official Embed Widget Container (Free / PKCE Fallback) */}
          {(showEmbedWidget || isFreeAccount) && (
            <div className="liquid-glass-card rounded-[28px] p-4 border border-white/15 space-y-2 shadow-xl animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Spotify Embed Widget (Free 免費版 / 全帳號相容播放器)</span>
                </span>
                <span className="text-[10px] text-white/40 font-mono">
                  即時加載歌曲串流
                </span>
              </div>
              <iframe
                src={currentEmbedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-2xl shadow-md w-full"
                title="Spotify Active Embed"
              />
            </div>
          )}

          {/* Playlist Tracks List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-white/60">
                {searchResults.length > 0 ? `搜尋結果 (${searchResults.length})` : `曲目清單 (${tracksToRender.length})`}
              </span>
              {onRefreshSpotify && isSpotifyConnected && (
                <button
                  onClick={onRefreshSpotify}
                  className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>重新整理</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {tracksToRender.map((track, idx) => {
                const isSelected = currentTrack?.id === track.id;
                const isLiked = likedTrackIds.includes(track.id);

                return (
                  <div
                    key={track.id || idx}
                    onClick={() => onSelectTrack(track)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer border ${
                      isSelected 
                        ? 'liquid-glass border-white/20 bg-white/[0.08]' 
                        : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center text-[11px] font-mono text-white/30">
                        {idx + 1}
                      </span>

                      <img 
                        src={track.albumArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&auto=format&fit=crop&q=80'} 
                        alt={track.title}
                        className="w-9 h-9 rounded-xl object-cover border border-white/10 flex-shrink-0"
                      />

                      <div className="min-w-0">
                        <p className={`text-xs truncate ${isSelected ? 'font-bold text-white' : 'font-medium text-white/90'}`}>
                          {track.title}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-white/40 hidden sm:block">
                        {track.duration}
                      </span>

                      <button
                        onClick={(e) => toggleLike(track.id, e)}
                        className={`p-1 rounded transition-colors ${
                          isLiked ? 'text-rose-400' : 'text-white/20 hover:text-white/60'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => handleShare(track.title, track.id, e)}
                        className="p-1 text-white/20 hover:text-white/60 transition-colors"
                      >
                        {copiedId === track.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Video Stream Section */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'v1',
                title: 'Nordic Minimalism & Liquid Design System',
                channel: 'Klue Design',
                views: '124K 次觀看',
                thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                duration: '12:40'
              },
              {
                id: 'v2',
                title: 'Zero-Server Client-Side OAuth 2.0 PKCE in Depth',
                channel: 'Web Arch Lab',
                views: '89K 次觀看',
                thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
                duration: '18:15'
              }
            ].map(vid => (
              <div key={vid.id} className="liquid-glass-card rounded-[28px] overflow-hidden p-4 space-y-3 border border-white/[0.08]">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-white/[0.06] group cursor-pointer">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-md">
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-mono text-white">
                    {vid.duration}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white/90 line-clamp-1">{vid.title}</h4>
                  <p className="text-[10px] text-white/40 mt-0.5">{vid.channel} · {vid.views}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
