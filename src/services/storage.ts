import { PlatformConfig, UserPassport, SocialPost, MessageItem, BasicSettings, PlatformId } from '../types';

const STORAGE_KEYS = {
  PASSPORT: 'klue_passport_v1',
  PLATFORMS: 'klue_platforms_v1',
  POSTS: 'klue_posts_v1',
  MESSAGES: 'klue_messages_v1',
  SETTINGS: 'klue_settings_v1',
  PKCE_VERIFIER: 'klue_spotify_pkce_verifier',
  SPOTIFY_STATE: 'klue_spotify_state',
  DISCORD_STATE: 'klue_discord_state',
};

export const defaultPlatforms: PlatformConfig[] = [
  {
    id: 'spotify',
    name: 'Spotify',
    category: 'audio',
    color: '#1DB954',
    accentBg: 'rgba(29, 185, 84, 0.12)',
    iconName: 'Music',
    description: '常駐音樂播放器、即時播放控制與熱門歌曲搜尋 (支援 PKCE OAuth2 / Access Token)',
    scopes: ['user-read-currently-playing', 'user-modify-playback-state', 'user-top-read', 'playlist-read-private'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'google',
    name: 'Google / Gmail',
    category: 'communication',
    color: '#EA4335',
    accentBg: 'rgba(234, 67, 53, 0.12)',
    iconName: 'Mail',
    description: 'Gmail 收件匣郵件讀取與 Google 使用者資料即時同步',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'media',
    color: '#FF0000',
    accentBg: 'rgba(255, 0, 0, 0.12)',
    iconName: 'PlaySquare',
    description: 'YouTube 訂閱頻道、最新影片與熱門 Shorts 串流連動',
    scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    color: '#5865F2',
    accentBg: 'rgba(88, 101, 242, 0.14)',
    iconName: 'MessageSquare',
    description: 'Discord 個人伺服器、頻道即時通知與 Webhook 連動',
    scopes: ['identify', 'email', 'guilds'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    color: '#E1306C',
    accentBg: 'rgba(225, 48, 108, 0.14)',
    iconName: 'Camera',
    description: 'Instagram 貼文、限時動態與 Direct Message 私訊連動',
    scopes: ['instagram_basic', 'instagram_manage_messages'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'media',
    color: '#00F2FE',
    accentBg: 'rgba(0, 242, 254, 0.12)',
    iconName: 'Video',
    description: 'TikTok 短影音串流、個人帳號與創作動態連動',
    scopes: ['user.info.basic', 'video.list'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'social',
    color: '#1877F2',
    accentBg: 'rgba(24, 119, 242, 0.12)',
    iconName: 'Share2',
    description: 'Facebook 粉專動態、社團貼文與 Messenger 同步',
    scopes: ['pages_show_list', 'pages_read_engagement'],
    connected: false,
    status: 'disconnected',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'social',
    color: '#E5E7EB',
    accentBg: 'rgba(255, 255, 255, 0.1)',
    iconName: 'Twitter',
    description: 'X (Twitter) 最新推文、個人社群趨勢與文章連動',
    scopes: ['tweet.read', 'users.read'],
    connected: false,
    status: 'disconnected',
  }
];

export const defaultPassport: UserPassport = {
  id: 'usr_' + Math.random().toString(36).substring(2, 9),
  handle: '@klue.user',
  name: 'Klue 使用者',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  bio: 'Klue 智慧社群樞紐使用者。所有跨平台社群軌跡，匯聚於此。',
  joinedDate: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit' }),
  verifiedStatus: false,
  totalConnectedPlatforms: 0,
};

export const defaultSettings: BasicSettings = {
  pushNotifications: true,
  soundEnabled: true,
  autoSyncIntervalMins: 5,
  compactInboxView: false,
  darkMode: true,
  spotifyClientId: '',
  googleClientId: '',
  discordClientId: '',
};

export const StorageService = {
  getPassport(): UserPassport {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PASSPORT);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return defaultPassport;
  },
  loadPassport(): UserPassport {
    return this.getPassport();
  },

  savePassport(passport: UserPassport): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PASSPORT, JSON.stringify(passport));
    } catch {
      // Ignore
    }
  },

  getPlatforms(): PlatformConfig[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLATFORMS);
      if (data) {
        const parsed: PlatformConfig[] = JSON.parse(data);
        return defaultPlatforms.map(def => {
          const found = parsed.find(p => p.id === def.id);
          return found ? { ...def, ...found } : def;
        });
      }
    } catch {
      // Fallback
    }
    return defaultPlatforms;
  },
  loadPlatforms(): PlatformConfig[] {
    return this.getPlatforms();
  },

  savePlatforms(platforms: PlatformConfig[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLATFORMS, JSON.stringify(platforms));
    } catch {
      // Ignore
    }
  },

  getPosts(): SocialPost[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [];
  },
  loadPosts(): SocialPost[] {
    return this.getPosts();
  },

  savePosts(posts: SocialPost[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch {
      // Ignore
    }
  },

  getMessages(): MessageItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (data) return JSON.parse(data);
    } catch {
      // Fallback
    }
    return [];
  },
  loadMessages(): MessageItem[] {
    return this.getMessages();
  },

  saveMessages(messages: MessageItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  },

  getSettings(): BasicSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return { ...defaultSettings, ...JSON.parse(data) };
    } catch {
      // Fallback
    }
    return defaultSettings;
  },
  loadSettings(): BasicSettings {
    return this.getSettings();
  },

  saveSettings(settings: BasicSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  },

  updatePlatform(platformId: PlatformId, updates: Partial<PlatformConfig>): PlatformConfig[] {
    const current = this.getPlatforms();
    const updated = current.map(p => p.id === platformId ? { ...p, ...updates } : p);
    this.savePlatforms(updated);
    return updated;
  },

  disconnectPlatform(platformId: PlatformId): PlatformConfig[] {
    const current = this.getPlatforms();
    const updated = current.map(p => {
      if (p.id === platformId) {
        return {
          ...p,
          connected: false,
          status: 'disconnected' as const,
          username: undefined,
          avatar: undefined,
          accessToken: undefined,
          refreshToken: undefined,
          tokenExpiresAt: undefined,
          apiKey: undefined,
          lastSynced: undefined,
        };
      }
      return p;
    });
    this.savePlatforms(updated);
    return updated;
  },

  exportAllData(): string {
    const exportObj = {
      passport: this.getPassport(),
      platforms: this.getPlatforms(),
      posts: this.getPosts(),
      messages: this.getMessages(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportObj, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.passport) this.savePassport(parsed.passport);
      if (parsed.platforms) this.savePlatforms(parsed.platforms);
      if (parsed.posts) this.savePosts(parsed.posts);
      if (parsed.messages) this.saveMessages(parsed.messages);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.PASSPORT);
    localStorage.removeItem(STORAGE_KEYS.PLATFORMS);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
  clearAll(): void {
    this.clearAllData();
  }
};
