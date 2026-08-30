export type PlatformId = 
  | 'google' 
  | 'discord' 
  | 'youtube' 
  | 'tiktok' 
  | 'instagram' 
  | 'facebook' 
  | 'spotify'
  | 'x';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  category: 'social' | 'media' | 'communication' | 'audio';
  color: string;
  accentBg: string;
  iconName: string;
  description: string;
  scopes: string[];
  connected: boolean;
  username?: string;
  avatar?: string;
  lastSynced?: string;
  status: 'active' | 'syncing' | 'disconnected' | 'needs_reauth';
  // Client-side authentication credentials in LocalStorage
  clientId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
  apiKey?: string;
}

export type MessageCategory = 'urgent' | 'social' | 'notification' | 'subscription';

export interface MessageItem {
  id: string;
  platform: PlatformId;
  sender: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
    isVip?: boolean;
  };
  title?: string;
  content: string;
  timestamp: string;
  relativeTime: string;
  category: MessageCategory;
  priorityScore: number;
  isRead: boolean;
  isStarred: boolean;
  summary?: string;
  tags?: string[];
  threadCount?: number;
  threadReplies?: {
    id: string;
    sender: string;
    avatar: string;
    content: string;
    time: string;
    isSelf?: boolean;
  }[];
}

export interface UserPassport {
  id: string;
  handle: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  verifiedStatus: boolean;
  totalConnectedPlatforms: number;
}

export interface SocialPost {
  id: string;
  platform: PlatformId;
  author: {
    name: string;
    handle: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  mediaType: 'image' | 'video' | 'reel' | 'text';
  mediaUrl?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  timestamp: string;
  relativeTime: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  hashtags?: string[];
  musicTrack?: {
    title: string;
    artist: string;
  };
  comments?: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
  }[];
}

export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: string; // e.g. "3:24"
  durationSeconds: number;
  isPlaying?: boolean;
  progressSeconds: number;
  genres?: string[];
  externalUrl?: string;
  previewUrl?: string | null;
  uri?: string;
}

export interface BasicSettings {
  pushNotifications: boolean;
  soundEnabled: boolean;
  autoSyncIntervalMins: number;
  compactInboxView: boolean;
  darkMode: boolean;
  spotifyClientId?: string;
  googleClientId?: string;
  discordClientId?: string;
}
