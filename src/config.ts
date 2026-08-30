/**
 * ============================================================================
 * 【Klue 跨平台全域 API 配置專區 (Config Zone)】
 * 適用於純前端 GitHub Pages 靜態部署與 Client-Side OAuth 2.0 PKCE 授權
 * ============================================================================
 */

// 1. Google OAuth 2.0 Web Client ID (用於 Gmail 郵件讀取、YouTube 訂閱與個人資料)
export const GOOGLE_CLIENT_ID = "550835801293-msqf5o8ghf4p8v6q8urvr22779i14if9.apps.googleusercontent.com";

// 2. Spotify OAuth 2.0 PKCE Client ID (請在此填入您的 Spotify Developer Client ID，未設定時自動切換為 Embed Widget 免費版相容模式)
export const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID_HERE";

// 3. OAuth 授權完成後的重定向網址 (自動適配當前網域與 GitHub Pages 路徑，例如 https://username.github.io/klue/)
export const REDIRECT_URI = typeof window !== 'undefined' 
  ? window.location.origin + window.location.pathname 
  : '';

/**
 * 檢查 Client ID 是否已完成有效設定 (非空值且非預設占位符)
 */
export function isConfigured(clientId?: string | null): boolean {
  if (!clientId) return false;
  const trimmed = clientId.trim();
  if (trimmed === '' || trimmed === 'YOUR_SPOTIFY_CLIENT_ID_HERE' || trimmed.startsWith('YOUR_') || trimmed.includes('demo.apps')) {
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
