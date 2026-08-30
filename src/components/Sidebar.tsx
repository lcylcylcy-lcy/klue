import React from 'react';
import { 
  Compass,
  Inbox, 
  Headphones, 
  User, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Plus
} from 'lucide-react';
import { UserPassport, PlatformConfig } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unreadCount: number;
  passport: UserPassport;
  platforms: PlatformConfig[];
  onOpenConnectModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadCount,
  passport,
  platforms,
  onOpenConnectModal,
}) => {
  const connectedCount = platforms.filter(p => p.connected).length;

  const navItems = [
    {
      id: 'feed',
      label: '社群動態',
      subtitle: 'Feed',
      icon: Compass,
      badge: '最新',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    },
    {
      id: 'inbox',
      label: '統一訊息',
      subtitle: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : undefined,
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'media',
      label: '影音專區',
      subtitle: 'Media',
      icon: Headphones,
      badge: 'Spotify',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
    {
      id: 'profile',
      label: '個人帳號',
      subtitle: 'Profile',
      icon: User,
      badge: `${connectedCount}/${platforms.length}`,
      badgeColor: 'bg-white/10 text-white/80',
    },
  ];

  return (
    <aside className="w-full md:w-60 lg:w-64 flex-shrink-0 flex flex-col justify-between border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl p-4 lg:p-5 h-full select-none">
      {/* Navigation List */}
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 px-3 mb-2.5 flex items-center justify-between">
            <span>核心導航</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/20 shadow-md backdrop-blur-md font-bold'
                      : 'text-white/60 hover:bg-white/[0.04] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                          : 'bg-white/5 text-white/60 group-hover:text-white group-hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">
                        {item.label}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono leading-tight">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono flex-shrink-0 backdrop-blur-md ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Platform Status Bar */}
        <div className="pt-3 border-t border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-white/40 px-3 mb-2 flex items-center justify-between">
            <span>連動狀態</span>
            <button
              onClick={() => onSelectTab('profile')}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-sans"
            >
              管理
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1.5 px-1">
            {platforms.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => onSelectTab('profile')}
                title={`${p.name}: ${p.connected ? '已連動' : '未連動'}`}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all cursor-pointer backdrop-blur-md ${
                  p.connected
                    ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                    : 'bg-white/[0.02] border-white/5 text-white/20 opacity-40 hover:opacity-75'
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full mb-1" 
                  style={{ backgroundColor: p.color }}
                />
                <span className="text-[9px] truncate max-w-full font-mono text-center">
                  {p.name.split(' ')[0]}
                </span>
                {p.connected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0A0B]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Korean Modern Aesthetics Philosophy Note */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Web-First 輕量架構</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            單一網頁驅動全平台社群，直覺佈局與極致順暢體驗。
          </p>
        </div>
      </div>

      {/* Bottom Profile Snapshot */}
      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => onSelectTab('profile')}
          className="w-full text-left p-2.5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 hover:border-white/20 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={passport.avatar}
              alt={passport.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {passport.name}
              </div>
              <div className="text-[10px] font-mono text-indigo-300 truncate">
                {passport.handle}
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>
        </button>
      </div>
    </aside>
  );
};
