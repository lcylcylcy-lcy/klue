import { MessageItem, SocialPost } from '../types';

const DISCORD_CLIENT_ID_KEY = 'klue_discord_client_id';
const DISCORD_TOKEN_KEY = 'klue_discord_token';

export const DiscordService = {
  getStoredClientId(): string {
    return localStorage.getItem(DISCORD_CLIENT_ID_KEY) || '';
  },

  setStoredClientId(clientId: string): void {
    localStorage.setItem(DISCORD_CLIENT_ID_KEY, clientId);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(DISCORD_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(DISCORD_TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(DISCORD_TOKEN_KEY);
  },

  startOAuthLogin(clientId: string): void {
    this.setStoredClientId(clientId);
    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'identify email guilds messages.read';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  },

  async getUserInfo(token?: string): Promise<{ id: string; username: string; discriminator: string; avatar?: string } | null> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return null;

    try {
      const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to get Discord user profile', e);
    }
    return null;
  },

  async getUserGuilds(token?: string): Promise<{ id: string; name: string; icon?: string }[]> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return [];

    try {
      const res = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to get Discord guilds', e);
    }
    return [];
  }
};
