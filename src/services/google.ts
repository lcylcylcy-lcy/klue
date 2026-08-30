/**
 * ============================================================================
 * 【Google Service - Client-Side OAuth 2.0 & Google Identity Services (GIS)】
 * ============================================================================
 */
import { GOOGLE_CLIENT_ID, isConfigured } from '../config';
import { MessageItem, SocialPost } from '../types';

const GOOGLE_CLIENT_ID_KEY = 'klue_google_client_id';
const GOOGLE_TOKEN_KEY = 'klue_google_token';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

export const GoogleService = {
  getStoredClientId(): string {
    const stored = localStorage.getItem(GOOGLE_CLIENT_ID_KEY);
    return stored || GOOGLE_CLIENT_ID;
  },

  setStoredClientId(clientId: string): void {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(GOOGLE_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    localStorage.setItem(GOOGLE_TOKEN_KEY, token);
  },

  clearToken(): void {
    localStorage.removeItem(GOOGLE_TOKEN_KEY);
  },

  isGoogleClientConfigured(): boolean {
    const cid = this.getStoredClientId();
    return isConfigured(cid);
  },

  /**
   * 觸發 Google Identity Services (GIS) Client-Side Token 授權
   */
  requestToken(
    clientId?: string,
    scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ]
  ): Promise<string> {
    const targetClientId = (clientId || this.getStoredClientId() || GOOGLE_CLIENT_ID).trim();

    if (!isConfigured(targetClientId)) {
      return Promise.reject(
        new Error('CONFIG_REQUIRED: GOOGLE_CLIENT_ID 尚未配置或為預設值，請先設定您的 Google OAuth Web Client ID。')
      );
    }

    this.setStoredClientId(targetClientId);

    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        return reject(new Error('Google Identity Services (GIS) 腳本載入中，請稍候重試或檢查網路連線。'));
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: targetClientId,
          scope: scopes.join(' '),
          callback: (response) => {
            if (response.error) {
              if (response.error === 'invalid_client' || response.error.includes('401')) {
                reject(new Error('INVALID_CLIENT: Google Client ID 無效或未授權當前網域 (401)，請至 Google Cloud Console 新增 JavaScript 來源。'));
              } else {
                reject(new Error(`Google 授權失敗: ${response.error_description || response.error}`));
              }
            } else if (response.access_token) {
              this.setAccessToken(response.access_token);
              resolve(response.access_token);
            } else {
              reject(new Error('Google 未回傳 Access Token。'));
            }
          },
          error_callback: (err) => {
            console.warn('GIS Token Client Error:', err);
            reject(new Error(err?.message || 'Google 授權視窗被關閉或發生錯誤 (401 invalid_client)'));
          }
        });

        client.requestAccessToken({ prompt: 'consent' });
      } catch (err: any) {
        console.error('Google token client init exception:', err);
        reject(err);
      }
    });
  },

  async getUserInfo(token?: string): Promise<{ name: string; email: string; picture?: string } | null> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return null;

    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to get Google user info', e);
    }
    return null;
  },

  async fetchGmailMessages(token?: string, maxResults = 8): Promise<MessageItem[]> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return [];

    try {
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:inbox`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!listRes.ok) {
        if (listRes.status === 401) {
          this.clearToken();
        }
        return [];
      }
      const listData = await listRes.json();
      if (!listData.messages || listData.messages.length === 0) return [];

      const messages: MessageItem[] = [];
      for (const msg of listData.messages.slice(0, maxResults)) {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (detailRes.ok) {
            const detail = await detailRes.json();
            const headers = detail.payload?.headers || [];
            const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '無主旨';
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '未知寄件者';
            const dateStr = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || new Date().toISOString();
            
            const fromMatch = from.match(/^(.*?)(?:<(.+?)>)?$/);
            const senderName = fromMatch ? (fromMatch[1].trim().replace(/['"]/g, '') || fromMatch[2]) : from;
            const senderEmail = fromMatch && fromMatch[2] ? fromMatch[2] : from;

            messages.push({
              id: 'gmail_' + msg.id,
              platform: 'google',
              sender: {
                name: senderName || 'Gmail 寄件者',
                handle: senderEmail,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                verified: true,
              },
              title: subject,
              content: detail.snippet || '無內容預覽',
              timestamp: new Date(dateStr).toISOString(),
              relativeTime: this.formatRelativeTime(new Date(dateStr)),
              category: 'urgent',
              priorityScore: 90,
              isRead: !detail.labelIds?.includes('UNREAD'),
              isStarred: detail.labelIds?.includes('STARRED') || false,
              summary: subject,
              tags: ['Gmail', '重要郵件'],
            });
          }
        } catch {
          // Ignore individual message failure
        }
      }
      return messages;
    } catch (e) {
      console.error('Failed to fetch Gmail messages', e);
      return [];
    }
  },

  async fetchYouTubeFeed(token?: string, maxResults = 6): Promise<SocialPost[]> {
    const accessToken = token || this.getAccessToken();
    if (!accessToken) return [];

    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=${maxResults}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      
      const posts: SocialPost[] = (data.items || []).map((item: any) => {
        const snippet = item.snippet;
        return {
          id: 'yt_' + item.id,
          platform: 'youtube' as const,
          author: {
            name: snippet.title || 'YouTube 頻道',
            handle: '@' + (snippet.resourceId?.channelId || 'channel'),
            avatar: snippet.thumbnails?.default?.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
            verified: true,
          },
          content: snippet.description || '已訂閱頻道的最新動態。',
          mediaType: 'video' as const,
          mediaUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url,
          aspectRatio: 'landscape' as const,
          timestamp: snippet.publishedAt || new Date().toISOString(),
          relativeTime: GoogleService.formatRelativeTime(new Date(snippet.publishedAt || Date.now())),
          likesCount: 0,
          commentsCount: 0,
          sharesCount: 0,
          hashtags: ['#YouTube', '#Subscriptions'],
        };
      });
      return posts;
    } catch (e) {
      console.error('Failed to fetch YouTube subscriptions', e);
      return [];
    }
  },

  formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return '剛剛';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分鐘前`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小時前`;
    return `${Math.floor(diffSec / 86400)} 天前`;
  }
};
