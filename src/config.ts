/**
 * ============================================================================
 * 【Klue 跨平台全域 API 配置專區 (Config Zone)】
 * 適用於 Vercel / GitHub Pages 靜態部署與 Client-Side OAuth 2.0 PKCE 授權
 * ============================================================================
 */

// 1. Google OAuth 2.0 Web Client ID (用於 Gmail 郵件讀取、YouTube 訂閱與個人資料)
export const GOOGLE_CLIENT_ID = "550835801293-msqf5o8ghf4p8v6q8urvr22779i14if9.apps.googleusercontent.com";

// 2. Spotify OAuth 2.0 PKCE Client ID (Spotify Developer Dashboard Client ID)
export const SPOTIFY_CLIENT_ID = "b7aaeac00c874373985feb960738c222";

// 3. Vercel 部署網域與 OAuth 授權完成後的重定向網址 (預設 https://klue-eight.vercel.app/)
export const VERCEL_DOMAIN = "https://klue-eight.vercel.app/";

export const REDIRECT_URI = typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
  ? (window.location.origin + (window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/'))
  : "https://klue-eight.vercel.app/";

/**
 * 取得最佳重定向網址 (適配 Vercel 與當前瀏覽器環境)
 */
export function getRedirectUri(): string {
  if (typeof window !== 'undefined') {
    if (window.location.origin.includes('klue-eight.vercel.app')) {
      return 'https://klue-eight.vercel.app/';
    }
    return window.location.origin + window.location.pathname;
  }
  return REDIRECT_URI;
}

/**
 * 檢查 Client ID 是否已完成有效設定 (非空值且非預設占位符)
 */
export function isConfigured(clientId?: string | null): boolean {
  if (!clientId) return false;
  const trimmed = clientId.trim();
  if (
    trimmed === '' || 
    trimmed === 'YOUR_SPOTIFY_CLIENT_ID_HERE' || 
    trimmed.startsWith('YOUR_') || 
    trimmed.includes('demo.apps')
  ) {
    return false;
  }
  return true;
}

export function isGoogleConfigured(clientId?: string | null): boolean {
  const id = clientId || GOOGLE_CLIENT_ID;
  return isConfigured(id);
}

export function isSpotifyConfigured(clientId?: string | null): boolean {
  const id = clientId || SPOTIFY_CLIENT_ID;
  return isConfigured(id);
}

