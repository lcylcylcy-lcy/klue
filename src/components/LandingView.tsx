import React, { useState } from 'react';
import { PlatformConfig, PlatformId } from '../types';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Lock,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { OAuthProviders } from '../services/oauth';
import { SpotifyService } from '../services/spotify';
import { GoogleService } from '../services/google';
import { GOOGLE_CLIENT_ID, SPOTIFY_CLIENT_ID, REDIRECT_URI, isConfigured } from '../config';

interface LandingViewProps {
  platforms: PlatformConfig[];
  onConnectSuccess: (platformId: PlatformId, credentials: any) => void;
  onEnterHub: () => void;
  onOpenConnectModal: (platformId: PlatformId) => void;
  onShowConfigGuide?: (service: 'google' | 'spotify') => void;
}

export function LandingView({
  platforms,
  onConnectSuccess,
  onEnterHub,
  onOpenConnectModal,
  onShowConfigGuide,
}: LandingViewProps) {
  const [connectingId, setConnectingId] = useState<PlatformId | null>(null);

  const connectedCount = platforms.filter(p => p.connected).length;

  // Seamless 1-Click OAuth Redirect Handler
  const handleSeamlessOAuth = async (platform: PlatformConfig) => {
    setConnectingId(platform.id);

    try {
      const redirectUri = REDIRECT_URI || (window.location.origin + window.location.pathname);

      if (platform.id === 'spotify') {
        // Direct Spotify PKCE Flow
        const clientId = platform.clientId || SpotifyService.getStoredClientId() || SPOTIFY_CLIENT_ID;
        if (!isConfigured(clientId)) {
          if (onShowConfigGuide) {
            onShowConfigGuide('spotify');
          } else {
            onOpenConnectModal('spotify');
          }
          return;
        }

        try {
          await SpotifyService.startPkceLogin(clientId);
          return;
        } catch {
          onOpenConnectModal('spotify');
        }
      } else if (platform.id === 'google') {
        // Direct Google Identity Services popup/token flow
        const clientId = platform.clientId || GoogleService.getStoredClientId() || GOOGLE_CLIENT_ID;
        if (!isConfigured(clientId)) {
          if (onShowConfigGuide) {
            onShowConfigGuide('google');
          } else {
            onOpenConnectModal('google');
          }
          return;
        }

        if (window.google?.accounts?.oauth2) {
          try {
            const token = await GoogleService.requestToken(clientId);
            const user = await GoogleService.getUserInfo(token);
            onConnectSuccess('google', {
              accessToken: token,
              username: user?.name || user?.email || 'Google 使用者',
              avatar: user?.picture,
            });
            return;
          } catch (err: any) {
            console.warn('Google GIS login failed or cancelled:', err);
            onOpenConnectModal('google');
          }
        } else {
          // Fallback redirect
          const authUrl = OAuthProviders.google.getAuthUrl(redirectUri, clientId);
          window.location.href = authUrl;
          return;
        }
      } else if (platform.id === 'discord') {
        const authUrl = OAuthProviders.discord.getAuthUrl(redirectUri);
        window.location.href = authUrl;
        return;
      } else {
        // For other platforms (Instagram, TikTok, YouTube, X), trigger direct OAuth URL or open connection assistant
        const provider = OAuthProviders[platform.id];
        if (provider) {
          const authUrl = provider.getAuthUrl(redirectUri);
          window.location.href = authUrl;
          return;
        }
      }
    } catch (err) {
      console.error('OAuth trigger error:', err);
      onOpenConnectModal(platform.id);
    } finally {
      setConnectingId(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#07080B] select-none">
      
      {/* Dynamic Ambient Fluid Light Orb Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px] animate-ambient-pulse" />
        <div className="absolute bottom-[15%] right-[20%] w-[450px] h-[450px] rounded-full bg-purple-600/08 blur-[140px] animate-ambient-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/05 blur-[160px] animate-ambient-pulse" style={{ animationDelay: '6s' }} />
      </div>

      {/* Main Liquid Glass Landing Card */}
      <div className="relative z-10 w-full max-w-2xl liquid-glass rounded-[32px] sm:rounded-[38px] p-6 sm:p-10 md:p-12 flex flex-col items-center text-center shadow-2xl border border-white/10">
        
        {/* Brand Logo & Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] mb-6 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-[11px] font-medium text-white/70 tracking-wider uppercase">Liquid Glass Hub</span>
        </div>

        {/* Big Klue Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-3">
          Klue
        </h1>

        {/* Low Saturation Elegant Tagline */}
        <p className="text-sm sm:text-base text-white/60 max-w-md font-light leading-relaxed mb-8 sm:mb-10">
          跨平台社群與即時串流，匯聚於純粹微光。
          <br />
          <span className="text-white/40 text-xs sm:text-sm">零伺服器架構 · 純前端安全驗證 · 本機數據隔離</span>
        </p>

        {/* 1-Click Platform OAuth Buttons Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 mb-8">
          {platforms.map((platform) => {
            const isConnecting = connectingId === platform.id;
            const isConnected = platform.connected;

            return (
              <div
                key={platform.id}
                onClick={() => isConnected ? onEnterHub() : handleSeamlessOAuth(platform)}
                className={`group relative overflow-hidden rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all duration-300 cursor-pointer border ${
                  isConnected
                    ? 'bg-emerald-500/[0.08] border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-white/[0.035] hover:bg-white/[0.07] border-white/[0.08] hover:border-white/[0.18]'
                } backdrop-blur-xl shadow-lg`}
              >
                {/* Left: Platform Icon & Name */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                    style={{ 
                      backgroundColor: isConnected ? `${platform.color}25` : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isConnected ? platform.color : 'rgba(255, 255, 255, 0.1)'}` 
                    }}
                  >
                    <span 
                      className="text-base font-bold"
                      style={{ color: isConnected ? platform.color : '#E5E7EB' }}
                    >
                      {platform.name.charAt(0)}
                    </span>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-semibold text-white/90">
                        {platform.name}
                      </span>
                      {isConnected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-white/40 block">
                      {isConnected ? (platform.username || '已成功連動') : '一鍵跳轉授權'}
                    </span>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-1.5">
                  {isConnected ? (
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                      已就緒
                    </span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        title="進階 Client ID 設定"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenConnectModal(platform.id);
                        }}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>

                      <div className="w-7 h-7 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/15 transition-all">
                        {isConnecting ? (
                          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enter Hub Main CTA Button */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={onEnterHub}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white text-black font-semibold text-xs sm:text-sm tracking-wide shadow-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{connectedCount > 0 ? `進入極簡主介面 (${connectedCount} 個平台已連動)` : '直接進入極簡主介面'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {connectedCount === 0 && (
            <button
              onClick={() => {
                // Quick test mode with Spotify & Google enabled
                onConnectSuccess('spotify', {
                  accessToken: 'demo_token',
                  username: 'Spotify 試聽會員',
                  avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
                });
                onConnectSuccess('google', {
                  accessToken: 'demo_token',
                  username: 'Google 會員',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                });
                onEnterHub();
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] text-white/70 hover:text-white font-medium text-xs sm:text-sm border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>快速載入展示預覽</span>
            </button>
          )}
        </div>

        {/* Footer Security Badges */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] w-full flex items-center justify-center gap-4 text-[11px] text-white/40">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-white/40" />
            <span>OAuth 2.0 PKCE 協議</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-white/40" />
            <span>無伺服器直接串接</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-white/40" />
            <span>GitHub Pages 相容</span>
          </div>
        </div>

      </div>

    </div>
  );
}
