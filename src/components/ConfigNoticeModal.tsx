import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  Key,
  Check
} from 'lucide-react';
import { GoogleService } from '../services/google';
import { SpotifyService } from '../services/spotify';
import { GOOGLE_CLIENT_ID, SPOTIFY_CLIENT_ID } from '../config';

interface ConfigNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetService: 'google' | 'spotify' | 'general';
  customTitle?: string;
  customMessage?: string;
  onConfigSaved?: (service: string, newClientId: string) => void;
  onContinueDemo?: () => void;
}

export const ConfigNoticeModal: React.FC<ConfigNoticeModalProps> = ({
  isOpen,
  onClose,
  targetService,
  customTitle,
  customMessage,
  onConfigSaved,
  onContinueDemo,
}) => {
  const [inputValue, setInputValue] = useState<string>(() => {
    if (targetService === 'google') return GoogleService.getStoredClientId();
    if (targetService === 'spotify') return SpotifyService.getStoredClientId();
    return '';
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const isGoogle = targetService === 'google';
  const isSpotify = targetService === 'spotify';

  const defaultTitle = isGoogle
    ? 'Google OAuth 2.0 授權設定提醒'
    : isSpotify
    ? 'Spotify PKCE Client ID 設定提醒'
    : 'API Client ID 設定提醒';

  const defaultDesc = isGoogle
    ? '當前 Google Web Client ID 尚未設定或未將此網址加入 Google Cloud Console 許可的 JavaScript 來源。您可以直接輸入您的 Client ID，或使用展示模式體驗。'
    : '當前 SPOTIFY_CLIENT_ID 尚未填入您的 Client ID。您可以在下方直接輸入，或以 Spotify Embed Widget 嵌入播放器免費版模式進行體驗。';

  const handleSave = () => {
    if (!inputValue.trim()) return;
    const val = inputValue.trim();
    if (isGoogle) {
      GoogleService.setStoredClientId(val);
    } else if (isSpotify) {
      SpotifyService.setStoredClientId(val);
    }
    setIsSaved(true);
    if (onConfigSaved) {
      onConfigSaved(targetService, val);
    }
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg liquid-glass-card rounded-[32px] p-6 sm:p-7 shadow-2xl space-y-5 border border-white/15 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {customTitle || defaultTitle}
              </h3>
              <p className="text-[11px] text-white/50">
                純前端 GitHub Pages 設定指引
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl liquid-glass text-white/50 hover:text-white transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-xs text-white/70 leading-relaxed">
            {customMessage || defaultDesc}
          </p>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2 text-[11px] text-white/60">
            <div className="flex items-center gap-1.5 font-semibold text-white/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>快速設定方式：</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-white/50 pl-1">
              {isGoogle ? (
                <>
                  <li>至 <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Google Cloud Console</a> 建立「網頁應用程式」OAuth 用戶端 ID。</li>
                  <li>將 <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded font-mono">https://klue-eight.vercel.app</code> 及 <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded font-mono">{typeof window !== 'undefined' ? window.location.origin : 'https://klue-eight.vercel.app'}</code> 加至「已授權的 JavaScript 來源」。</li>
                </>
              ) : isSpotify ? (
                <>
                  <li>至 <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">Spotify Developer Dashboard</a> 建立 App。</li>
                  <li>將 Redirect URI 設定為 <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded font-mono">https://klue-eight.vercel.app/</code> (以及當前網域 <code className="text-white/80 bg-white/10 px-1 py-0.5 rounded font-mono">{typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://klue-eight.vercel.app/'}</code>)。</li>
                  <li>免費版帳號將自動啟用 Spotify Embed Widget 嵌入播放器模式！</li>
                </>
              ) : (
                <li>請填入相應平台的 OAuth Client ID。</li>
              )}
            </ul>
          </div>
        </div>

        {/* Input box */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-white/70 flex items-center justify-between">
            <span>輸入或更新 {isGoogle ? 'Google Web Client ID' : isSpotify ? 'Spotify Client ID' : 'Client ID'}:</span>
            <span className="text-[10px] text-white/40 font-mono">儲存於本機 LocalStorage</span>
          </label>
          <input
            type="text"
            placeholder={isGoogle ? '例如：550835801293-xxx.apps.googleusercontent.com' : '例如：a78d067b578c4305bd364e5251786520'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all font-mono"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-white/[0.08]">
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="w-full sm:flex-1 py-2.5 rounded-2xl bg-white text-black hover:bg-white/90 disabled:opacity-40 font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Settings className="w-3.5 h-3.5" />}
            <span>{isSaved ? '已保存！立即套用' : '保存並立即套用'}</span>
          </button>

          {onContinueDemo && (
            <button
              onClick={() => {
                onContinueDemo();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>以展示模式體驗</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
