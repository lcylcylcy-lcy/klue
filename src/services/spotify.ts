/**
 * ============================================================================
 * 【Spotify Service - PKCE Authorization Flow & Embed Widget Fallback】
 * ============================================================================
 */
import { SPOTIFY_CLIENT_ID, REDIRECT_URI, isConfigured } from '../config';
import { SpotifyTrack } from '../types';

const SPOTIFY_CLIENT_ID_KEY = 'klue_spotify_client_id';
const SPOTIFY_TOKEN_KEY = 'klue_spotify_token';
const SPOTIFY_CODE_VERIFIER_KEY = 'klue_spotify_code_verifier';
const SPOTIFY_PRODUCT_KEY = 'klue_spotify_product'; // 'free' | 'premium' | 'unknown'

// PKCE Web Crypto Helpers
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values).map(x => possible[x % possible.length]).join('');
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64encode(input: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export const SpotifyService = {
  getStoredClientId(): string {
    const stored = localStorage.getItem(SPOTIFY_CLIENT_ID_KEY);
    return stored || SPOTIFY_CLIENT_ID;
  },

  setStoredClientId(clientId: string): void {
    localStorage.setItem(SPOTIFY_CLIENT_ID_KEY, clientId);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(SPOTIFY_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(SPOTIFY_TOKEN_KEY, token);
  },

  getProductType(): 'free' | 'premium' | 'unknown' {
    return (localStorage.getItem(SPOTIFY_PRODUCT_KEY) as any) || 'unknown';
  },

  setProductType(product: string): void {
    localStorage.setItem(SPOTIFY_PRODUCT_KEY, product);
  },

  clearToken(): void {
    localStorage.removeItem(SPOTIFY_TOKEN_KEY);
    localStorage.removeItem(SPOTIFY_CODE_VERIFIER_KEY);
    localStorage.removeItem(SPOTIFY_PRODUCT_KEY);
  },

  isSpotifyConfigured(): boolean {
    const cid = this.getStoredClientId();
    return isConfigured(cid);
  },

  /**
   * 啟動 Spotify Authorization Code Flow (PKCE)
   */
  async startPkceLogin(clientId?: string): Promise<void> {
    const targetClientId = (clientId || this.getStoredClientId() || SPOTIFY_CLIENT_ID).trim();

    if (!isConfigured(targetClientId)) {
      throw new Error('CONFIG_REQUIRED: SPOTIFY_CLIENT_ID 尚未配置或為預設值，請先填入您的 Spotify Developer Client ID。');
    }

    this.setStoredClientId(targetClientId);
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem(SPOTIFY_CODE_VERIFIER_KEY, codeVerifier);

    const redirectUri = REDIRECT_URI || (window.location.origin + window.location.pathname);
    const scope = [
      'user-read-currently-playing',
      'user-modify-playback-state',
      'user-read-playback-state',
      'user-top-read',
      'playlist-read-private',
      'user-read-email',
      'user-read-private'
    ].join(' ');

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    const params: Record<string, string> = {
      response_type: 'code',
      client_id: targetClientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
      state: 'spotify_auth_' + Date.now(),
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  },

  /**
   * 處理 Redirect 回傳的 Authorization Code 並換取 Access Token
   */
  async handleAuthCallback(code: string): Promise<{ access_token: string; refresh_token?: string } | null> {
    const codeVerifier = localStorage.getItem(SPOTIFY_CODE_VERIFIER_KEY);
    const clientId = this.getStoredClientId();
    const redirectUri = REDIRECT_URI || (window.location.origin + window.location.pathname);

    if (!codeVerifier || !clientId) {
      console.warn('Missing PKCE code verifier or clientId');
      return null;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Spotify token exchange failed', errText);
        return null;
      }

      const data = await response.json();
      if (data.access_token) {
        this.setAccessToken(data.access_token);
        localStorage.removeItem(SPOTIFY_CODE_VERIFIER_KEY);
        // Fetch user profile to check subscription tier (free / premium)
        this.getCurrentUser(data.access_token).catch(() => {});
        return data;
      }
    } catch (err) {
      console.error('Spotify auth callback error:', err);
    }
    return null;
  },

  async exchangeCodeForToken(code: string): Promise<string | null> {
    const res = await this.handleAuthCallback(code);
    return res?.access_token || null;
  },

  async getCurrentUser(token?: string): Promise<{ id: string; display_name: string; email?: string; product?: string; images?: { url: string }[] } | null> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return null;

    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          this.setProductType(data.product); // 'free' or 'premium'
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to get Spotify user profile', e);
    }
    return null;
  },

  async getCurrentlyPlaying(token?: string): Promise<SpotifyTrack | null> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return null;

    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.status === 204) return null;
      if (res.ok) {
        const data = await res.json();
        if (data && data.item) {
          const item = data.item;
          return {
            id: item.id,
            title: item.name,
            artist: item.artists.map((a: { name: string }) => a.name).join(', '),
            album: item.album?.name || '',
            albumArt: item.album?.images?.[0]?.url || '',
            duration: this.formatDuration(item.duration_ms),
            durationSeconds: Math.floor(item.duration_ms / 1000),
            progressSeconds: Math.floor((data.progress_ms || 0) / 1000),
            isPlaying: data.is_playing,
            externalUrl: item.external_urls?.spotify,
            previewUrl: item.preview_url,
            uri: item.uri,
          };
        }
      }
    } catch (e) {
      console.error('Failed to get currently playing Spotify track', e);
    }
    return null;
  },

  async getTopTracks(token?: string, limit = 10): Promise<SpotifyTrack[]> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return [];

    try {
      const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        return (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map((a: { name: string }) => a.name).join(', '),
          album: item.album?.name || '',
          albumArt: item.album?.images?.[0]?.url || '',
          duration: this.formatDuration(item.duration_ms),
          durationSeconds: Math.floor(item.duration_ms / 1000),
          progressSeconds: 0,
          isPlaying: false,
          genres: [],
          externalUrl: item.external_urls?.spotify,
          previewUrl: item.preview_url,
          uri: item.uri,
        }));
      }
    } catch (e) {
      console.error('Failed to get Spotify top tracks', e);
    }
    return [];
  },

  async searchTracks(query: string, token?: string, limit = 8): Promise<SpotifyTrack[]> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken || !query.trim()) return [];

    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        return (data.tracks?.items || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map((a: { name: string }) => a.name).join(', '),
          album: item.album?.name || '',
          albumArt: item.album?.images?.[0]?.url || '',
          duration: this.formatDuration(item.duration_ms),
          durationSeconds: Math.floor(item.duration_ms / 1000),
          progressSeconds: 0,
          isPlaying: false,
          externalUrl: item.external_urls?.spotify,
          previewUrl: item.preview_url,
          uri: item.uri,
        }));
      }
    } catch (e) {
      console.error('Failed to search Spotify tracks', e);
    }
    return [];
  },

  /**
   * 取得 Spotify 官方嵌入播放器 (Embed Widget iFrame) URL
   * 適用於 Spotify Free 會員、無 Web Playback SDK 授權或無法直接播放時的自動降級播放模式
   */
  getEmbedUrl(trackOrUri?: string): string {
    if (!trackOrUri) {
      // Default curated playlist or track embed
      return 'https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0';
    }

    let trackId = trackOrUri;
    if (trackOrUri.includes('spotify.com/track/')) {
      const parts = trackOrUri.split('spotify.com/track/')[1];
      trackId = parts.split('?')[0];
    } else if (trackOrUri.startsWith('spotify:track:')) {
      trackId = trackOrUri.replace('spotify:track:', '');
    }

    return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
  },

  formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
};
