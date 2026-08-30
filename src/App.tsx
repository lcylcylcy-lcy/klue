/**
 * ============================================================================
 * 【Klue - 跨平台極簡 Liquid Glass 社群與串流中心】
 * 零伺服器架構 · 純前端安全驗證 · GitHub Pages 靜態相容
 * ============================================================================
 */
import React, { useState, useEffect } from 'react';
import { 
  GOOGLE_CLIENT_ID, 
  SPOTIFY_CLIENT_ID, 
  REDIRECT_URI, 
  isConfigured 
} from './config';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { UnifiedInbox } from './components/UnifiedInbox';
import { MediaHub } from './components/MediaHub';
import { ProfileView } from './components/ProfileView';
import { LandingView } from './components/LandingView';
import { StickySpotifyPlayer } from './components/StickySpotifyPlayer';
import { ConnectModal } from './components/ConnectModal';
import { CreatePostModal } from './components/CreatePostModal';
import { CommandPalette } from './components/CommandPalette';
import { ConfigNoticeModal } from './components/ConfigNoticeModal';
import { StorageService } from './services/storage';
import { SpotifyService } from './services/spotify';
import { GoogleService } from './services/google';
import { 
  UserPassport, 
  PlatformConfig, 
  MessageItem, 
  SocialPost, 
  SpotifyTrack, 
  BasicSettings, 
  PlatformId 
} from './types';
import { 
  Compass, 
  Inbox, 
  Headphones, 
  User, 
  Sparkles,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation: 'landing' (welcome onboarding) | 'feed' (動態) | 'inbox' (訊息) | 'media' (影音) | 'profile' (個人設定)
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hasVisited = localStorage.getItem('klue_has_entered_hub');
    const platforms = StorageService.loadPlatforms();
    const hasAnyConnected = platforms.some(p => p.connected);
    return hasVisited || hasAnyConnected ? 'feed' : 'landing';
  });
  
  // Persistent Local State (Pure Static SPA / GitHub Pages Architecture)
  const [passport, setPassport] = useState<UserPassport>(() => StorageService.loadPassport());
  const [platforms, setPlatforms] = useState<PlatformConfig[]>(() => StorageService.loadPlatforms());
  const [posts, setPosts] = useState<SocialPost[]>(() => StorageService.loadPosts());
  const [messages, setMessages] = useState<MessageItem[]>(() => StorageService.loadMessages());
  const [settings, setSettings] = useState<BasicSettings>(() => StorageService.loadSettings());
  
  // Spotify Player & Account Type State
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressSeconds, setProgressSeconds] = useState<number>(0);
  const [isFreeAccount, setIsFreeAccount] = useState<boolean>(() => {
    return SpotifyService.getProductType() === 'free';
  });

  // Modals & Overlay states
  const [connectPlatformId, setConnectPlatformId] = useState<PlatformId | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Config Guide Modal State (For Google / Spotify Client ID setup without 401 error)
  const [configModalTarget, setConfigModalTarget] = useState<'google' | 'spotify' | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check URL query parameters for OAuth 2.0 PKCE Callback (e.g. Spotify or Discord)
  useEffect(() => {
    const checkOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        showToast(`⚠️ 授權取消或失敗: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code) {
        setIsSyncing(true);
        // Clean URL without page refresh
        window.history.replaceState({}, document.title, window.location.pathname);

        // Try Spotify PKCE exchange
        try {
          const spotifyToken = await SpotifyService.exchangeCodeForToken(code);
          if (spotifyToken) {
            const userProfile = await SpotifyService.getCurrentUser(spotifyToken);
            const isFree = userProfile?.product === 'free';
            setIsFreeAccount(isFree);

            handleConnectSuccess('spotify', {
              accessToken: spotifyToken,
              username: userProfile?.display_name || 'Spotify 連動帳號',
              avatar: userProfile?.images?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
            });
            showToast(`🎉 Spotify PKCE 授權成功！已切換為 ${isFree ? 'Free (Embed Widget 模式)' : 'Premium 串流模式'}`);
            setActiveTab('media');
            loadSpotifyTopTracks(spotifyToken);
          }
        } catch (err) {
          console.error('OAuth Callback exchange error:', err);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    checkOAuthRedirect();
  }, []);

  // Load Spotify Top Tracks if Spotify is already connected
  const loadSpotifyTopTracks = async (token?: string) => {
    const spotifyPlatform = platforms.find(p => p.id === 'spotify');
    const activeToken = token || spotifyPlatform?.accessToken;
    if (activeToken) {
      try {
        const topTracks = await SpotifyService.getTopTracks(activeToken);
        if (topTracks && topTracks.length > 0) {
          setTracks(topTracks);
          if (!currentTrack) {
            setCurrentTrack(topTracks[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load Spotify top tracks:', err);
      }
    }
  };

  useEffect(() => {
    const spotifyPlatform = platforms.find(p => p.id === 'spotify');
    if (spotifyPlatform?.connected && spotifyPlatform.accessToken) {
      loadSpotifyTopTracks(spotifyPlatform.accessToken);
    }
  }, [platforms]);

  // Persist State Changes
  const updatePassport = (newPassport: Partial<UserPassport>) => {
    const updated = { ...passport, ...newPassport };
    setPassport(updated);
    StorageService.savePassport(updated);
    showToast('✨ 個人資料已儲存更新');
  };

  const updateSettings = (newSettings: Partial<BasicSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const updatePlatforms = (newPlatforms: PlatformConfig[]) => {
    setPlatforms(newPlatforms);
    StorageService.savePlatforms(newPlatforms);
  };

  const updatePosts = (newPosts: SocialPost[]) => {
    setPosts(newPosts);
    StorageService.savePosts(newPosts);
  };

  const updateMessages = (newMessages: MessageItem[]) => {
    setMessages(newMessages);
    StorageService.saveMessages(newMessages);
  };

  // Spotify Playback timer simulation (or HTML5 audio sync)
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgressSeconds(prev => {
          if (currentTrack.durationSeconds && prev >= currentTrack.durationSeconds) {
            handleNextTrack();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, tracks]);

  const unreadCount = messages.filter(m => !m.isRead).length;

  // Track switching
  const handleSelectTrack = (track: SpotifyTrack) => {
    setCurrentTrack(track);
    setProgressSeconds(0);
    setIsPlaying(true);
    showToast(`🎵 現正播放: ${track.artist} - ${track.title}`);
  };

  const handleTogglePlay = () => {
    if (!currentTrack && tracks.length > 0) {
      setCurrentTrack(tracks[0]);
    }
    setIsPlaying(prev => !prev);
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
    setProgressSeconds(0);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
    setProgressSeconds(0);
    setIsPlaying(true);
  };

  const handleSeek = (seconds: number) => {
    setProgressSeconds(seconds);
  };

  // Post handlers
  const handleToggleLikePost = (postId: string) => {
    const updated = posts.map(p =>
      p.id === postId ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 } : p
    );
    updatePosts(updated);
  };

  const handleAddComment = (postId: string, text: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: `c_${Date.now()}`,
          author: passport.name,
          avatar: passport.avatar,
          text,
          time: '剛剛',
        };
        return {
          ...p,
          comments: [...(p.comments || []), newComment],
          commentsCount: p.commentsCount + 1,
        };
      }
      return p;
    });
    updatePosts(updated);
    showToast('💬 留言已即時發布');
  };

  const handlePublishNewPost = (newPost: SocialPost) => {
    const updated = [newPost, ...posts];
    updatePosts(updated);
    showToast('✨ 跨平台新動態已成功發布');
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.3 },
      colors: ['#6366f1', '#a855f7', '#38bdf8'],
    });
  };

  // Message Handlers
  const handleReplyMessage = (messageId: string, replyText: string) => {
    const updated = messages.map(m => {
      if (m.id === messageId) {
        const newReplies = [
          ...(m.threadReplies || []),
          {
            id: `rep_${Date.now()}`,
            sender: passport.name,
            avatar: passport.avatar,
            content: replyText,
            time: '剛剛',
            isSelf: true,
          },
        ];
        return {
          ...m,
          isRead: true,
          threadReplies: newReplies,
          threadCount: newReplies.length,
        };
      }
      return m;
    });
    updateMessages(updated);
    showToast('✉️ 跨平台回覆已即時傳送');
  };

  const handleToggleStarMessage = (messageId: string) => {
    const updated = messages.map(m =>
      m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
    );
    updateMessages(updated);
  };

  const handleMarkAsRead = (messageId: string) => {
    const updated = messages.map(m =>
      m.id === messageId ? { ...m, isRead: true } : m
    );
    updateMessages(updated);
  };

  // Platform Connect / Disconnect Handlers
  const handleConnectSuccess = (
    platformId: PlatformId,
    credentials: { clientId?: string; accessToken?: string; username?: string; avatar?: string }
  ) => {
    const updatedPlatforms = platforms.map(p => {
      if (p.id === platformId) {
        return {
          ...p,
          connected: true,
          status: 'active' as const,
          clientId: credentials.clientId || p.clientId,
          accessToken: credentials.accessToken || p.accessToken,
          username: credentials.username || p.username || `@${platformId}.user`,
          avatar: credentials.avatar || p.avatar || passport.avatar,
          lastSynced: '剛剛',
        };
      }
      return p;
    });
    updatePlatforms(updatedPlatforms);

    // If Google was connected, fetch real Gmail messages & YouTube Feed
    if (platformId === 'google' && credentials.accessToken) {
      GoogleService.fetchGmailMessages(credentials.accessToken).then(newGmailMsgs => {
        if (newGmailMsgs.length > 0) {
          const merged = [...newGmailMsgs, ...messages.filter(m => m.platform !== 'google')];
          updateMessages(merged);
        }
      }).catch(console.error);

      GoogleService.fetchYouTubeFeed(credentials.accessToken).then(newYtPosts => {
        if (newYtPosts.length > 0) {
          const merged = [...newYtPosts, ...posts];
          updatePosts(merged);
        }
      }).catch(console.error);
    }

    // If Spotify was connected, fetch Spotify top tracks
    if (platformId === 'spotify' && credentials.accessToken) {
      loadSpotifyTopTracks(credentials.accessToken);
    }

    showToast(`✅ ${platformId.toUpperCase()} 已成功連動`);
    setConnectPlatformId(null);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.4 },
      colors: ['#10b981', '#6366f1', '#38bdf8'],
    });
  };

  const handleDisconnectPlatform = (platformId: PlatformId) => {
    const updatedPlatforms = platforms.map(p => {
      if (p.id === platformId) {
        return {
          ...p,
          connected: false,
          status: 'disconnected' as const,
          accessToken: undefined,
          lastSynced: undefined,
        };
      }
      return p;
    });
    updatePlatforms(updatedPlatforms);
    showToast(`🔒 已安全解除 ${platformId.toUpperCase()} 連動`);
  };

  // Sync All Data
  const handleSyncAll = async () => {
    setIsSyncing(true);
    showToast('🔄 正在同步全網社群動態與收件匣...');

    try {
      const googlePlat = platforms.find(p => p.id === 'google');
      if (googlePlat?.connected && googlePlat.accessToken) {
        const gmailMsgs = await GoogleService.fetchGmailMessages(googlePlat.accessToken);
        if (gmailMsgs.length > 0) {
          const merged = [...gmailMsgs, ...messages.filter(m => m.platform !== 'google')];
          updateMessages(merged);
        }
      }

      const spotifyPlat = platforms.find(p => p.id === 'spotify');
      if (spotifyPlat?.connected && spotifyPlat.accessToken) {
        await loadSpotifyTopTracks(spotifyPlat.accessToken);
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        showToast('✨ 全平台資料已同步至最新狀態');
      }, 600);
    }
  };

  // Import / Export JSON Backup
  const handleImportBackup = (jsonStr: string) => {
    const success = StorageService.importAllData(jsonStr);
    if (success) {
      setPassport(StorageService.loadPassport());
      setPlatforms(StorageService.loadPlatforms());
      setPosts(StorageService.loadPosts());
      setMessages(StorageService.loadMessages());
      setSettings(StorageService.loadSettings());
      showToast('🎉 備份檔匯入成功！已還原所有社群資料');
    } else {
      showToast('❌ 備份檔格式不符，匯入失敗');
    }
  };

  const handleResetAllData = () => {
    StorageService.clearAll();
    localStorage.removeItem('klue_has_entered_hub');
    setPassport(StorageService.loadPassport());
    setPlatforms(StorageService.loadPlatforms());
    setPosts(StorageService.loadPosts());
    setMessages(StorageService.loadMessages());
    setSettings(StorageService.loadSettings());
    setTracks([]);
    setCurrentTrack(null);
    setActiveTab('landing');
    showToast('🗑️ 已清除所有本機快取與授權憑證');
  };

  const handleEnterHub = () => {
    localStorage.setItem('klue_has_entered_hub', 'true');
    setActiveTab('feed');
  };

  const selectedPlatformForModal = platforms.find(p => p.id === connectPlatformId) || platforms[0];

  // If in Welcome Landing Mode
  if (activeTab === 'landing') {
    return (
      <>
        <LandingView
          platforms={platforms}
          onConnectSuccess={handleConnectSuccess}
          onEnterHub={handleEnterHub}
          onOpenConnectModal={(pid) => setConnectPlatformId(pid)}
          onShowConfigGuide={(svc) => setConfigModalTarget(svc)}
        />

        {connectPlatformId && (
          <ConnectModal
            platform={selectedPlatformForModal}
            onClose={() => setConnectPlatformId(null)}
            onSuccess={handleConnectSuccess}
            onShowConfigGuide={(svc) => setConfigModalTarget(svc)}
          />
        )}

        {configModalTarget && (
          <ConfigNoticeModal
            isOpen={!!configModalTarget}
            onClose={() => setConfigModalTarget(null)}
            targetService={configModalTarget}
            onContinueDemo={() => {
              handleConnectSuccess(configModalTarget as any, {
                accessToken: 'demo_token_' + Date.now(),
                username: `${configModalTarget.toUpperCase()} 體驗帳號`,
              });
              handleEnterHub();
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0A0B] text-[#F0F0F0] font-sans antialiased overflow-hidden selection:bg-indigo-500/30 selection:text-white">
      
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Global Header with 3 Core Minimalist Tabs (Feed, Inbox, Media) */}
      <Header
        passport={passport}
        platforms={platforms}
        unreadCount={unreadCount}
        onOpenCommand={() => setIsCommandOpen(true)}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenConnectModal={() => setConnectPlatformId(platforms[0].id)}
        onSyncAll={handleSyncAll}
        isSyncing={isSyncing}
        activeTab={activeTab as any}
        onSelectTab={(tab) => setActiveTab(tab)}
        onReturnToLanding={() => setActiveTab('landing')}
      />

      {/* Main Responsive Body Layout (Sidebar + Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Desktop Sidebar (Minimalist Liquid Glass Navigation) */}
        <div className="hidden md:flex flex-shrink-0 h-full">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            unreadCount={unreadCount}
            passport={passport}
            platforms={platforms}
            onOpenConnectModal={() => setConnectPlatformId(platforms[0].id)}
          />
        </div>

        {/* Dynamic Viewport Router: 3 Core Liquid Glass Tabs + Profile */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0A0A0B]">
          
          {/* 1. Feed Tab (動態) */}
          {activeTab === 'feed' && (
            <FeedView
              posts={posts}
              platforms={platforms}
              onToggleLike={handleToggleLikePost}
              onAddComment={handleAddComment}
              onOpenCreatePost={() => setIsCreatePostOpen(true)}
              onOpenConnectModal={(pid) => setConnectPlatformId(pid)}
              onRefreshFeed={handleSyncAll}
              isSyncing={isSyncing}
            />
          )}

          {/* 2. Inbox Tab (訊息) */}
          {activeTab === 'inbox' && (
            <UnifiedInbox
              messages={messages}
              platforms={platforms}
              onReplyMessage={handleReplyMessage}
              onToggleStar={handleToggleStarMessage}
              onMarkAsRead={handleMarkAsRead}
              onRefreshFeed={handleSyncAll}
              onOpenConnectModal={(pid) => setConnectPlatformId(pid)}
              isSyncing={isSyncing}
            />
          )}

          {/* 3. Media Tab (影音 - Spotify PKCE & Free Embed Widget) */}
          {activeTab === 'media' && (
            <MediaHub
              tracks={tracks}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onSelectTrack={handleSelectTrack}
              onTogglePlay={handleTogglePlay}
              platforms={platforms}
              onOpenConnectModal={(pid) => setConnectPlatformId(pid)}
              onRefreshSpotify={handleSyncAll}
              isFreeAccount={isFreeAccount}
            />
          )}

          {/* 4. Profile Tab (個人與授權設定) */}
          {activeTab === 'profile' && (
            <ProfileView
              passport={passport}
              platforms={platforms}
              settings={settings}
              onUpdatePassport={updatePassport}
              onUpdateSettings={updateSettings}
              onOpenConnectModal={(pid) => setConnectPlatformId(pid)}
              onDisconnectPlatform={handleDisconnectPlatform}
              onSyncAll={handleSyncAll}
              isSyncing={isSyncing}
              onImportBackup={handleImportBackup}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Persistent Spotify Bottom Player (Embed Widget & Free Downgrade Supported) */}
      <StickySpotifyPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        progressSeconds={progressSeconds}
        onTogglePlay={handleTogglePlay}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSeek={handleSeek}
        onOpenConnectModal={() => setConnectPlatformId('spotify')}
        isFreeAccount={isFreeAccount}
      />

      {/* Mobile 4-Tab Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-14 left-0 right-0 z-30 border-t border-white/10 bg-[#0A0A0B]/90 backdrop-blur-2xl px-2 py-1.5 flex items-center justify-around select-none">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'feed' ? 'text-indigo-400 font-bold bg-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>動態</span>
        </button>

        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer relative ${
            activeTab === 'inbox' ? 'text-indigo-400 font-bold bg-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>訊息</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'media' ? 'text-indigo-400 font-bold bg-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>影音</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'text-indigo-400 font-bold bg-white/10' : 'text-white/40 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>個人</span>
        </button>
      </nav>

      {/* Modals & Overlays */}
      {connectPlatformId && (
        <ConnectModal
          platform={selectedPlatformForModal}
          onClose={() => setConnectPlatformId(null)}
          onSuccess={handleConnectSuccess}
          onShowConfigGuide={(svc) => setConfigModalTarget(svc)}
        />
      )}

      {configModalTarget && (
        <ConfigNoticeModal
          isOpen={!!configModalTarget}
          onClose={() => setConfigModalTarget(null)}
          targetService={configModalTarget}
          onContinueDemo={() => {
            handleConnectSuccess(configModalTarget as any, {
              accessToken: 'demo_token_' + Date.now(),
              username: `${configModalTarget.toUpperCase()} 體驗帳號`,
            });
          }}
        />
      )}

      {isCreatePostOpen && (
        <CreatePostModal
          isOpen={isCreatePostOpen}
          onClose={() => setIsCreatePostOpen(false)}
          platforms={platforms}
          passport={passport}
          onPublishPost={handlePublishNewPost}
        />
      )}

      {isCommandOpen && (
        <CommandPalette
          isOpen={isCommandOpen}
          onClose={() => setIsCommandOpen(false)}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsCommandOpen(false);
          }}
          messages={messages}
          platforms={platforms}
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
        />
      )}

    </div>
  );
}
