import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  Sparkles,
  Info,
  KeyRound,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlatformConfig } from '../types';
import { SpotifyService } from '../services/spotify';
import { GoogleService } from '../services/google';
import { DiscordService } from '../services/discord';
import { OAuthService } from '../services/oauth';
import { isConfigured, GOOGLE_CLIENT_ID, SPOTIFY_CLIENT_ID } from '../config';

interface ConnectModalProps {
  platform: PlatformConfig | null;
  onClose: () => void;
  onSuccess: (platformId: string, username: string, details?: { accessToken?: string; clientId?: string }) => void;
  onShowConfigGuide?: (service: 'google' | 'spotify') => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  platform,
  onClose,
  onSuccess,
  onShowConfigGuide,
}) => {
  const [authMethod, setAuthMethod] = useState<'oauth' | 'token'>('oauth');
  const [clientId, setClientId] = useState<string>(() => {
    if (!platform) return '';
    if (platform.id === 'spotify') return SpotifyService.getStoredClientId();
    if (platform.id === 'google' || platform.id === 'youtube') return GoogleService.getStoredClientId();
    if (platform.id === 'discord') return DiscordService.getStoredClientId();
    return platform.clientId || '';
  });
  const [directToken, setDirectToken] = useState<string>('');
  const [customUsername, setCustomUsername] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    platform ? platform.scopes : []
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfigHelper, setShowConfigHelper] = useState(false);

  if (!platform) return null;

  const toggleScope = (s: string) => {
    if (selectedScopes.includes(s)) {
      setSelectedScopes(selectedScopes.filter(item => item !== s));
    } else {
      setSelectedScopes([...selectedScopes, s]);
    }
  };

  const handleOAuthConnect = async () => {
    setErrorMsg(null);
    setShowConfigHelper(false);
    setIsAuthenticating(true);

    try {
      if (platform.id === 'spotify') {
        const idToUse = clientId.trim() || SpotifyService.getStoredClientId();
        if (!isConfigured(idToUse)) {
          setErrorMsg('SPOTIFY_CLIENT_ID 尚未填入您的 Client ID。您可以在上方輸入，或直接使用展示/嵌入模式體驗！');
          setShowConfigHelper(true);
          setIsAuthenticating(false);
          return;
        }
        await SpotifyService.startPkceLogin(idToUse);
        return;
      }

      if (platform.id === 'google' || platform.id === 'youtube') {
        const idToUse = clientId.trim() || GoogleService.getStoredClientId();
        if (!isConfigured(idToUse)) {
          setErrorMsg('GOOGLE_CLIENT_ID 尚未填入您的 Google Web Client ID。您可以在下方直接輸入，或使用展示模式！');
          setShowConfigHelper(true);
          setIsAuthenticating(false);
          return;
        }
        const token = await GoogleService.requestToken(idToUse, selectedScopes);
        const userInfo = await GoogleService.getUserInfo(token);
        
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onSuccess(platform.id, userInfo?.name || userInfo?.email || customUsername || '@google.user', {
          accessToken: token,
          clientId: idToUse,
        });
        return;
      }

      if (platform.id === 'discord') {
        const idToUse = clientId.trim() || DiscordService.getStoredClientId();
        if (!idToUse) {
          setErrorMsg('請輸入 Discord Application Client ID');
          setIsAuthenticating(false);
          return;
        }
        DiscordService.startOAuthLogin(idToUse);
        return;
      }

      // Other redirect OAuths
      const authUrl = OAuthService.getProviderAuthUrl(platform.id as any, clientId.trim());
      if (authUrl) {
        window.location.href = authUrl;
        return;
      }

      // Direct fallback
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      onSuccess(platform.id, customUsername || `@${platform.id}.user`);
    } catch (err: any) {
      const msg = err?.message || '授權過程發生錯誤，請確認 Client ID 或重試';
      if (msg.includes('401') || msg.includes('INVALID_CLIENT') || msg.includes('CONFIG_REQUIRED')) {
        setErrorMsg('【設定提醒】：OAuth Client ID 需要設定或將此網域加入授權來源。您可以直接在上方修改 Client ID，或點擊下方「以展示模式體驗」。');
        setShowConfigHelper(true);
      } else {
        setErrorMsg(msg);
      }
      setIsAuthenticating(false);
    }
  };

  const handleManualTokenSubmit = () => {
    if (!directToken.trim()) {
      setErrorMsg('請輸入有效的 Access Token 或連線金鑰');
      return;
    }

    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    onSuccess(platform.id, customUsername || `@${platform.id}.account`, {
      accessToken: directToken.trim(),
      clientId: clientId.trim() || undefined,
    });
  };

  const handleDemoConnect = () => {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    onSuccess(platform.id, customUsername || `${platform.name} 展示帳號`, {
      accessToken: `demo_token_${platform.id}_${Date.now()}`,
      clientId: clientId.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md liquid-glass-card rounded-[32px] p-6 shadow-2xl space-y-5 border border-white/15 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-sm ring-1 ring-white/20"
              style={{ backgroundColor: `${platform.color}30`, color: platform.color }}
            >
              {platform.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                連動 {platform.name}
              </h3>
              <p className="text-[11px] text-white/40">
                純前端 OAuth 2.0 PKCE / 授權機制
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

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
            {showConfigHelper && (
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDemoConnect}
                  className="px-3 py-1.5 rounded-xl bg-white text-black text-[11px] font-semibold hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span>以展示模式體驗連動</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Method Selector */}
        <div className="flex items-center p-1 rounded-2xl liquid-glass border border-white/[0.08]">
          <button
            onClick={() => { setAuthMethod('oauth'); setErrorMsg(null); setShowConfigHelper(false); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              authMethod === 'oauth'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            一鍵跳轉授權 (OAuth 2.0)
          </button>
          <button
            onClick={() => { setAuthMethod('token'); setErrorMsg(null); setShowConfigHelper(false); }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              authMethod === 'token'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            手動 Token 綁定
          </button>
        </div>

        {authMethod === 'oauth' ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-white/70">
                  {platform.name} Client ID:
                </label>
                <span className="text-[10px] text-white/40 font-mono">
                  {platform.id === 'spotify' ? 'PKCE Flow' : 'OAuth Flow'}
                </span>
              </div>
              <input
                type="text"
                placeholder={
                  platform.id === 'spotify' 
                    ? 'Spotify Developer Client ID' 
                    : platform.id === 'google' || platform.id === 'youtube'
                    ? 'Google Web Client ID'
                    : '輸入 Client ID'
                }
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all font-mono"
              />
            </div>

            {/* Scope Badges */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/70">
                請求授權權限 (Scopes):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {platform.scopes.map(s => {
                  const isChecked = selectedScopes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleScope(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all border ${
                        isChecked 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'bg-white/[0.02] text-white/40 border-white/[0.04]'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleOAuthConnect}
                disabled={isAuthenticating}
                className="w-full py-2.5 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                <span>立即前往授權 {platform.name}</span>
              </button>

              <button
                type="button"
                onClick={handleDemoConnect}
                className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white text-[11px] font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>直接以展示模式連動</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/70">
                直接貼入 Access Token:
              </label>
              <textarea
                rows={3}
                placeholder="貼入 Bearer Access Token 或 API 金鑰..."
                value={directToken}
                onChange={(e) => setDirectToken(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-white/70">
                顯示使用者名稱 (自訂):
              </label>
              <input
                type="text"
                placeholder={`@your_${platform.id}_handle`}
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            <button
              onClick={handleManualTokenSubmit}
              className="w-full py-2.5 rounded-2xl bg-white text-black hover:bg-white/90 font-semibold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>確認保存並連動</span>
            </button>
          </div>
        )}

        <div className="pt-1 text-center">
          <p className="text-[10px] text-white/30">
            Klue 採用本機安全儲存，憑證均存於您的瀏覽器中，不經由第三方伺服器。
          </p>
        </div>

      </div>
    </div>
  );
};
