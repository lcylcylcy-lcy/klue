import React from 'react';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Radio, 
  RefreshCw,
  Sliders,
  Compass,
  Inbox,
  Headphones,
  LogOut
} from 'lucide-react';
import { UserPassport, PlatformConfig, PlatformId } from '../types';

interface HeaderProps {
  passport: UserPassport;
  platforms: PlatformConfig[];
  unreadCount: number;
  onOpenCommand: () => void;
  onOpenCreatePost: () => void;
  onOpenConnectModal: (platformId?: PlatformId) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  activeTab: 'feed' | 'inbox' | 'media';
  onSelectTab: (tab: 'feed' | 'inbox' | 'media') => void;
  onReturnToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  passport,
  platforms,
  unreadCount,
  onOpenCommand,
  onOpenCreatePost,
  onOpenConnectModal,
  onSyncAll,
  isSyncing,
  activeTab,
  onSelectTab,
  onReturnToLanding
}) => {
  const connectedPlatforms = platforms.filter(p => p.connected);

  return (
    <header className="sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 select-none bg-transparent">
      
      {/* 1. Left: Klue Brand Logo */}
      <div 
        onClick={() => onSelectTab('feed')}
        className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
      >
        <div className="w-8 h-8 rounded-2xl liquid-glass flex items-center justify-center border border-white/15 shadow-sm group-hover:scale-105 transition-all">
          <span className="font-extrabold text-sm text-white tracking-tight">K</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight text-white/90">Klue</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse hidden sm:block" />
        </div>
      </div>

      {/* 2. Center: 3 Minimalist Liquid Glass Tabs (Feed, Inbox, Media) */}
      <nav className="flex items-center p-1 rounded-2xl liquid-glass border border-white/[0.08] shadow-lg">
        {/* Feed Tab */}
        <button
          id="tab-feed"
          onClick={() => onSelectTab('feed')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-white/[0.12] text-white shadow-sm border border-white/15'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>動態</span>
        </button>

        {/* Inbox Tab */}
        <button
          id="tab-inbox"
          onClick={() => onSelectTab('inbox')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer relative ${
            activeTab === 'inbox'
              ? 'bg-white/[0.12] text-white shadow-sm border border-white/15'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>訊息</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-500/80 text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Media Tab */}
        <button
          id="tab-media"
          onClick={() => onSelectTab('media')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-300 cursor-pointer ${
            activeTab === 'media'
              ? 'bg-white/[0.12] text-white shadow-sm border border-white/15'
              : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
          }`}
        >
          <Headphones className="w-3.5 h-3.5" />
          <span>影音</span>
        </button>
      </nav>

      {/* 3. Right: Small Connected Platforms Pill Bar & Quick Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Connected Platforms Bar (Clickable to manage or add) */}
        <div 
          onClick={() => onOpenConnectModal()}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl liquid-glass border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group shadow-sm"
          title="已連動平台 (點擊可新增或管理授權)"
        >
          {connectedPlatforms.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {connectedPlatforms.slice(0, 4).map(p => (
                <div
                  key={p.id}
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-black/40"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                >
                  {p.name.charAt(0)}
                </div>
              ))}
              {connectedPlatforms.length > 4 && (
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white ring-1 ring-black/40">
                  +{connectedPlatforms.length - 4}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">
              未連動平台
            </span>
          )}

          <div className="w-4 h-4 rounded-full bg-white/[0.08] flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/20 transition-all ml-0.5">
            <Plus className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Global Search Cmd+K button */}
        <button
          onClick={onOpenCommand}
          title="全域快速搜尋 (Cmd+K)"
          className="w-8 h-8 rounded-2xl liquid-glass flex items-center justify-center text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Refresh Sync Button */}
        <button
          onClick={onSyncAll}
          disabled={isSyncing}
          title="即時同步已連動社群數據"
          className="w-8 h-8 rounded-2xl liquid-glass flex items-center justify-center text-white/60 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>

        {/* Post Quick Action */}
        <button
          onClick={onOpenCreatePost}
          title="發布跨平台動態"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>發布</span>
        </button>

        {/* Return to Onboarding / Switch Accounts button */}
        {onReturnToLanding && (
          <button
            onClick={onReturnToLanding}
            title="返回授權歡迎頁 / 切換連動"
            className="w-8 h-8 rounded-2xl liquid-glass flex items-center justify-center text-white/40 hover:text-white border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}

      </div>
    </header>
  );
};
