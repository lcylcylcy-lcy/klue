/**
 * ============================================================================
 * 【OAuth Providers & Client Configuration】
 * ============================================================================
 */
import { PlatformId } from '../types';
import { GOOGLE_CLIENT_ID, SPOTIFY_CLIENT_ID, REDIRECT_URI } from '../config';
import { SpotifyService } from './spotify';
import { GoogleService } from './google';

export interface OAuthFlowConfig {
  id: PlatformId;
  name: string;
  authUrl?: string;
  defaultClientId?: string;
}

// Client-Side OAuth Providers
export const OAuthProviders: Record<PlatformId, {
  name: string;
  getAuthUrl: (redirectUri: string, clientId?: string) => string;
  defaultClientId: string;
}> = {
  spotify: {
    name: 'Spotify',
    defaultClientId: SPOTIFY_CLIENT_ID,
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || SpotifyService.getStoredClientId() || SPOTIFY_CLIENT_ID;
      const scopes = [
        'user-read-currently-playing',
        'user-modify-playback-state',
        'user-read-playback-state',
        'user-top-read',
        'playlist-read-private',
        'user-read-email',
        'user-read-private'
      ].join(' ');
      return `https://accounts.spotify.com/authorize?response_type=token&client_id=${encodeURIComponent(cid)}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true`;
    }
  },
  google: {
    name: 'Google / Gmail',
    defaultClientId: GOOGLE_CLIENT_ID,
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || GoogleService.getStoredClientId() || GOOGLE_CLIENT_ID;
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' ');
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&include_granted_scopes=true`;
    }
  },
  discord: {
    name: 'Discord',
    defaultClientId: '112233445566778899',
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || localStorage.getItem('klue_discord_client_id') || '112233445566778899';
      return `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify%20email%20guilds`;
    }
  },
  youtube: {
    name: 'YouTube',
    defaultClientId: GOOGLE_CLIENT_ID,
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || GoogleService.getStoredClientId() || GOOGLE_CLIENT_ID;
      const scopes = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/userinfo.profile';
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;
    }
  },
  instagram: {
    name: 'Instagram',
    defaultClientId: '9876543210',
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || '9876543210';
      return `https://api.instagram.com/oauth/authorize?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
    }
  },
  tiktok: {
    name: 'TikTok',
    defaultClientId: 'awb1234567',
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || 'awb1234567';
      return `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(cid)}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    }
  },
  facebook: {
    name: 'Facebook',
    defaultClientId: 'fb_123456789',
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || 'fb_123456789';
      return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=email,public_profile`;
    }
  },
  x: {
    name: 'X (Twitter)',
    defaultClientId: 'x_oauth_client',
    getAuthUrl: (redirectUri: string, clientId?: string) => {
      const cid = clientId || 'x_oauth_client';
      return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(cid)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20follows.read&state=state&code_challenge=challenge&code_challenge_method=plain`;
    }
  }
};

export class OAuthService {
  public static CLIENT_IDS = {
    spotify: SPOTIFY_CLIENT_ID,
    google: GOOGLE_CLIENT_ID,
    discord: '112233445566778899',
    instagram: '9876543210',
    tiktok: 'awb1234567',
    facebook: 'fb_123456789',
    x: 'x_oauth_client'
  };

  public static getProviderAuthUrl(platformId: PlatformId, clientId?: string): string | null {
    const provider = OAuthProviders[platformId];
    if (!provider) return null;
    const redirectUri = REDIRECT_URI || (window.location.origin + window.location.pathname);
    return provider.getAuthUrl(redirectUri, clientId);
  }
}
