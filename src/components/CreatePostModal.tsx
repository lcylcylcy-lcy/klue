import React, { useState } from 'react';
import { PlatformConfig, PlatformId, SocialPost, UserPassport } from '../types';
import { 
  X, 
  Send, 
  Sparkles, 
  Image, 
  Film, 
  Type
} from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: PlatformConfig[];
  passport: UserPassport;
  onPublishPost: (newPost: SocialPost) => void;
}

export function CreatePostModal({
  isOpen,
  onClose,
  passport,
  onPublishPost,
}: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>('instagram');
  const [mediaType, setMediaType] = useState<'image' | 'reel' | 'text'>('image');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const handlePublish = () => {
    if (!content.trim()) return;
    setIsPublishing(true);

    setTimeout(() => {
      const newPost: SocialPost = {
        id: `post_${Date.now()}`,
        platform: selectedPlatform,
        author: {
          name: passport.name || 'Klue 使用者',
          handle: passport.handle || '@klue.user',
          avatar: passport.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
          verified: passport.verifiedStatus,
        },
        content: content.trim(),
        mediaType,
        mediaUrl: mediaType !== 'text' ? imageUrl : undefined,
        aspectRatio: mediaType === 'reel' ? 'portrait' : 'landscape',
        timestamp: new Date().toISOString(),
        relativeTime: '剛剛',
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        hashtags: ['#Klue', '#LiquidGlass'],
        comments: [],
      };

      onPublishPost(newPost);
      setIsPublishing(false);
      setContent('');
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg liquid-glass-card rounded-[32px] p-6 shadow-2xl space-y-4 relative overflow-hidden border border-white/15">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">發表跨平台動態</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl liquid-glass text-white/50 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Picker */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/60">目標平台標籤:</label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'instagram', name: 'Instagram', color: '#E1306C' },
              { id: 'tiktok', name: 'TikTok', color: '#00F2FE' },
              { id: 'youtube', name: 'YouTube', color: '#FF0000' },
              { id: 'facebook', name: 'Facebook', color: '#1877F2' },
              { id: 'x', name: 'X', color: '#FFFFFF' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlatform(p.id as PlatformId)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedPlatform === p.id
                    ? 'bg-white text-black shadow-sm border-white'
                    : 'bg-white/[0.03] text-white/50 hover:text-white border-white/[0.05]'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="撰寫最新動態或靈感筆記..."
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all resize-none leading-relaxed"
        />

        {/* Media type toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setMediaType('image'); setShowImageInput(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                mediaType === 'image' ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-white/40 border-white/[0.04]'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>圖片</span>
            </button>

            <button
              onClick={() => { setMediaType('reel'); setShowImageInput(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                mediaType === 'reel' ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-white/40 border-white/[0.04]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>短影音 (Reel)</span>
            </button>

            <button
              onClick={() => { setMediaType('text'); setShowImageInput(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer border ${
                mediaType === 'text' ? 'bg-white/10 text-white border-white/20' : 'bg-white/[0.02] text-white/40 border-white/[0.04]'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>純文字</span>
            </button>
          </div>

          {showImageInput && mediaType !== 'text' && (
            <input
              type="text"
              placeholder="輸入圖片/封面網址 URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handlePublish}
            disabled={isPublishing || !content.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-40 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? '發布中...' : '立即發布'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
