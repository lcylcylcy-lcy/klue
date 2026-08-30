import React, { useState } from 'react';
import { SocialPost, PlatformConfig, PlatformId } from '../types';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play, 
  Pause, 
  Send, 
  Plus, 
  Check, 
  Music2, 
  Sparkles,
  Link2,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface FeedViewProps {
  posts: SocialPost[];
  platforms: PlatformConfig[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onOpenCreatePost: () => void;
  onOpenConnectModal: (platformId: PlatformId) => void;
  onRefreshFeed?: () => void;
  isSyncing?: boolean;
}

export function FeedView({
  posts,
  platforms,
  onToggleLike,
  onAddComment,
  onOpenCreatePost,
  onOpenConnectModal,
}: FeedViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === 'all') return true;
    return post.platform === selectedFilter;
  });

  const handleCopyLink = (postId: string) => {
    navigator.clipboard?.writeText?.(`${window.location.origin}/#post-${postId}`);
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const handleToggleSave = (postId: string) => {
    setSavedPosts(prev => 
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const getPlatformLabel = (pid: PlatformId) => {
    switch (pid) {
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'youtube': return 'YouTube';
      case 'facebook': return 'Facebook';
      case 'x': return 'X';
      default: return pid.toUpperCase();
    }
  };

  const connectedSocialPlatforms = platforms.filter(p => p.connected);

  return (
    <div className="flex-1 overflow-y-auto pb-32 px-4 sm:px-8 py-6 space-y-6 max-w-2xl mx-auto w-full select-none">
      
      {/* Top Stories & Platform Shortcuts (Liquid Glass Pills) */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {/* Create Post Action */}
        <div 
          onClick={onOpenCreatePost}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl liquid-glass border border-white/15 group-hover:border-white/30 transition-all flex items-center justify-center shadow-sm">
            <Plus className="w-4 h-4 text-white/70 group-hover:text-white" />
          </div>
          <span className="text-[10px] font-medium text-white/50 group-hover:text-white transition-colors">
            發布動態
          </span>
        </div>

        {/* Connected Platforms */}
        {connectedSocialPlatforms.map((p) => (
          <div 
            key={p.id}
            onClick={() => setSelectedFilter(p.id)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-2xl p-[1px] transition-all flex items-center justify-center ${
              selectedFilter === p.id 
                ? 'liquid-glass border-2 border-white/40 scale-105 shadow-md' 
                : 'liquid-glass border border-white/10 group-hover:scale-105'
            }`}>
              <div 
                className="w-full h-full rounded-[14px] flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${p.color}15`, color: p.color }}
              >
                {p.name.charAt(0)}
              </div>
            </div>
            <span className="text-[10px] font-medium text-white/70 truncate max-w-[56px]">
              {p.name}
            </span>
          </div>
        ))}

        {/* Add Connect Platform Button */}
        <div 
          onClick={() => onOpenConnectModal('instagram')}
          className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
        >
          <div className="w-12 h-12 rounded-2xl liquid-glass border border-white/[0.08] flex items-center justify-center">
            <Link2 className="w-3.5 h-3.5 text-white/50" />
          </div>
          <span className="text-[10px] font-medium text-white/40">
            新增連動
          </span>
        </div>
      </div>

      {/* Filter Tabs (Liquid Glass Pill Bar) */}
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { id: 'all', label: '全部' },
            { id: 'instagram', label: 'Instagram' },
            { id: 'tiktok', label: 'TikTok' },
            { id: 'youtube', label: 'YouTube' },
            { id: 'facebook', label: 'Facebook' },
            { id: 'x', label: 'X' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreatePost}
          className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full liquid-glass text-white/80 hover:text-white text-xs font-medium transition-all cursor-pointer whitespace-nowrap border border-white/10"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>新發布</span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          /* Empty State - Minimalist Liquid Glass Card */
          <div className="py-14 text-center space-y-4 liquid-glass rounded-[28px] p-6 sm:p-8 border border-white/[0.08]">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/70">
              <Compass className="w-6 h-6" />
            </div>
            
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-white/90">動態牆尚未載入內容</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                本系統為純靜態無伺服器架構。請連動社群平台或撰寫你的第一則跨平台動態。
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
              <button
                onClick={() => onOpenConnectModal('instagram')}
                className="px-3.5 py-1.5 rounded-xl liquid-glass hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-colors cursor-pointer"
              >
                連動 Instagram
              </button>
              <button
                onClick={() => onOpenConnectModal('youtube')}
                className="px-3.5 py-1.5 rounded-xl liquid-glass hover:bg-white/10 border border-white/10 text-white/80 text-xs font-medium transition-colors cursor-pointer"
              >
                連動 YouTube
              </button>
              <button
                onClick={onOpenCreatePost}
                className="px-4 py-1.5 rounded-xl bg-white text-black text-xs font-semibold shadow-md hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>撰寫動態</span>
              </button>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isPlayingThis = playingVideoId === post.id;
            const isSaved = savedPosts.includes(post.id);
            const commentsOpen = activeCommentPostId === post.id;

            return (
              <article 
                key={post.id}
                id={`post-${post.id}`}
                className="liquid-glass-card rounded-[28px] overflow-hidden p-4 sm:p-5 space-y-3 border border-white/[0.08]"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.author.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover border border-white/10" 
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">
                          {post.author.name}
                        </span>
                        <span className="text-[10px] text-white/40 px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/[0.06]">
                          {getPlatformLabel(post.platform)}
                        </span>
                      </div>
                      <div className="text-[10px] text-white/40">
                        {post.author.handle} · {post.relativeTime}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleCopyLink(post.id)}
                    className="p-1.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    title="分享動態連結"
                  >
                    {copiedPostId === post.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Post Media (Image / Video / Text) */}
                {post.mediaUrl && (
                  <div className="relative rounded-2xl overflow-hidden bg-black/40 border border-white/[0.06] group">
                    <img 
                      src={post.mediaUrl} 
                      alt="Post Media"
                      className={`w-full object-cover transition-transform duration-500 ${
                        post.aspectRatio === 'landscape' ? 'aspect-video max-h-[360px]' : 'aspect-square sm:aspect-[4/5] max-h-[480px]'
                      }`}
                    />

                    {(post.mediaType === 'video' || post.mediaType === 'reel') && (
                      <div 
                        onClick={() => setPlayingVideoId(isPlayingThis ? null : post.id)}
                        className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer transition-opacity"
                      >
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform">
                          {isPlayingThis ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          )}
                        </div>
                      </div>
                    )}

                    {post.musicTrack && (
                      <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] flex items-center gap-1.5">
                        <Music2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="truncate max-w-[180px]">{post.musicTrack.artist} - {post.musicTrack.title}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Post Caption */}
                <div className="space-y-1">
                  <p className="text-xs text-white/80 leading-relaxed font-normal whitespace-pre-line">
                    {post.content}
                  </p>

                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {post.hashtags.map((h, i) => (
                        <span key={i} className="text-[11px] text-white/50 hover:text-white cursor-pointer">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Bar (Likes, Comments, Share, Save) */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.05] text-xs text-white/50">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.isLiked ? 'text-rose-400 font-bold' : 'hover:text-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-400' : ''}`} />
                      <span>{post.likesCount + (post.isLiked ? 1 : 0)}</span>
                    </button>

                    <button 
                      onClick={() => setActiveCommentPostId(commentsOpen ? null : post.id)}
                      className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentsCount + (post.comments ? post.comments.length : 0)}</span>
                    </button>
                  </div>

                  <button 
                    onClick={() => handleToggleSave(post.id)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      isSaved ? 'text-white' : 'hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                  </button>
                </div>

                {/* Comments Expand Drawer */}
                {commentsOpen && (
                  <div className="pt-2.5 border-t border-white/[0.06] space-y-2.5">
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2 text-xs bg-white/[0.02] p-2 rounded-xl border border-white/[0.04]">
                            <img src={c.avatar} alt={c.author} className="w-5 h-5 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-white/90 text-[11px]">{c.author}</span>
                                <span className="text-[9px] text-white/40">{c.time}</span>
                              </div>
                              <p className="text-white/70 text-xs mt-0.5">{c.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-white/40 text-center py-1">尚無留言，留下第一則回應吧！</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        placeholder="撰寫回應..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit(post.id);
                        }}
                        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>送出</span>
                      </button>
                    </div>
                  </div>
                )}

              </article>
            );
          })
        )}
      </div>

    </div>
  );
}
