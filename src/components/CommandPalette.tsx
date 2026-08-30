import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Inbox, 
  Send, 
  Compass,
  Headphones,
  Link2
} from 'lucide-react';
import { MessageItem, PlatformConfig } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: 'feed' | 'inbox' | 'media') => void;
  messages: MessageItem[];
  platforms: PlatformConfig[];
  onOpenCreatePost: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  messages,
  platforms,
  onOpenCreatePost,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredMessages = query.trim()
    ? messages.filter(
        m =>
          m.content.toLowerCase().includes(query.toLowerCase()) ||
          m.sender.name.toLowerCase().includes(query.toLowerCase()) ||
          (m.title && m.title.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const filteredPlatforms = query.trim()
    ? platforms.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : platforms.slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/70 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-lg liquid-glass-card rounded-[32px] shadow-2xl overflow-hidden border border-white/15">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3">
          <Search className="w-4 h-4 text-white/50" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋跨平台訊息、切換頁籤或發布動態..."
            className="flex-1 bg-transparent text-xs text-white placeholder-white/40 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-white/[0.04] border border-white/[0.08] rounded text-white/40">
            ESC
          </kbd>
        </div>

        {/* Command Body */}
        <div className="max-h-[55vh] overflow-y-auto p-3 space-y-3">
          {/* Quick Actions */}
          <div className="space-y-1">
            <div className="text-[10px] font-medium text-white/40 px-3 py-1">
              快速跳轉與動作
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCreatePost();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-3.5 h-3.5 text-white/60" />
                <span>發表跨平台動態</span>
              </div>
              <span className="text-[10px] text-white/40">New Post</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('feed');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Compass className="w-3.5 h-3.5 text-white/60" />
                <span>前往「動態 (Feed)」</span>
              </div>
              <span className="text-[10px] text-white/40">Tab 1</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('inbox');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-3.5 h-3.5 text-white/60" />
                <span>前往「訊息 (Inbox)」</span>
              </div>
              <span className="text-[10px] text-white/40">Tab 2</span>
            </button>

            <button
              onClick={() => {
                onSelectTab('media');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-2.5">
                <Headphones className="w-3.5 h-3.5 text-white/60" />
                <span>前往「影音 (Media)」</span>
              </div>
              <span className="text-[10px] text-white/40">Tab 3</span>
            </button>
          </div>

          {/* Messages Matching Query */}
          {filteredMessages.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/[0.06]">
              <div className="text-[10px] font-medium text-white/40 px-3 py-1">
                相關訊息
              </div>
              {filteredMessages.slice(0, 3).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    onSelectTab('inbox');
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>{msg.sender.name}</span>
                    <span className="text-[10px] text-white/40">{msg.relativeTime}</span>
                  </div>
                  <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Connected Platforms */}
          <div className="space-y-1 pt-2 border-t border-white/[0.06]">
            <div className="text-[10px] font-medium text-white/40 px-3 py-1">
              已支援平台
            </div>
            <div className="grid grid-cols-2 gap-1.5 px-1">
              {filteredPlatforms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-white/70"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                  <span className="text-[10px] text-white/30 ml-auto font-mono">
                    {p.connected ? '已連動' : '未連動'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
