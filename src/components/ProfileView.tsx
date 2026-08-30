import React, { useState } from 'react';
import { UserPassport, PlatformConfig, PlatformId, BasicSettings } from '../types';
import { 
  KeyRound, 
  ShieldCheck, 
  Bell, 
  Volume2, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Camera, 
  Mail, 
  MessageSquare, 
  Music, 
  Video, 
  PlaySquare, 
  Share2, 
  Lock, 
  Edit3, 
  Check, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface ProfileViewProps {
  passport: UserPassport;
  platforms: PlatformConfig[];
  settings: BasicSettings;
  onUpdatePassport: (newPassport: Partial<UserPassport>) => void;
  onUpdateSettings: (newSettings: Partial<BasicSettings>) => void;
  onOpenConnectModal: (platformId: PlatformId) => void;
  onDisconnectPlatform: (platformId: PlatformId) => void;
  onSyncAll: () => void;
  isSyncing: boolean;
  onImportBackup: (jsonStr: string) => void;
  onResetAllData: () => void;
}

export function ProfileView({
  passport,
  platforms,
  settings,
  onUpdatePassport,
  onUpdateSettings,
  onOpenConnectModal,
  onDisconnectPlatform,
  onSyncAll,
  isSyncing,
  onImportBackup,
  onResetAllData,
}: ProfileViewProps) {
  const [disconnectConfirmId, setDisconnectConfirmId] = useState<PlatformId | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(passport.name);
  const [editHandle, setEditHandle] = useState(passport.handle);
  const [editBio, setEditBio] = useState(passport.bio);
  const [editEmail, setEditEmail] = useState(passport.email);
  const [editAvatar, setEditAvatar] = useState(passport.avatar);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveProfile = () => {
    onUpdatePassport({
      name: editName.trim() || 'Klue 使用者',
      handle: editHandle.trim() || '@klue.user',
      bio: editBio.trim(),
      email: editEmail.trim(),
      avatar: editAvatar.trim() || passport.avatar,
    });
    setIsEditingProfile(false);
  };

  const handleExportJSON = () => {
    const dataStr = StorageService.exportAllData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `klue_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
  };

  const getPlatformIcon = (pid: PlatformId) => {
    switch (pid) {
      case 'instagram': return <Camera className="w-4 h-4 text-[#E1306C]" />;
      case 'discord': return <MessageSquare className="w-4 h-4 text-[#5865F2]" />;
      case 'google': return <Mail className="w-4 h-4 text-[#EA4335]" />;
      case 'spotify': return <Music className="w-4 h-4 text-[#1DB954]" />;
      case 'tiktok': return <Video className="w-4 h-4 text-[#00F2FE]" />;
      case 'youtube': return <PlaySquare className="w-4 h-4 text-[#FF0000]" />;
      case 'facebook': return <Share2 className="w-4 h-4 text-[#1877F2]" />;
      default: return <KeyRound className="w-4 h-4 text-indigo-400" />;
    }
  };

  const connectedCount = platforms.filter(p => p.connected).length;

  return (
    <div className="flex-1 overflow-y-auto pb-32 px-4 sm:px-8 py-6 space-y-8 max-w-3xl mx-auto w-full">
      
      {/* Profile Header Card */}
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-[70px] pointer-events-none" />

        {isEditingProfile ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">編輯個人 Klue Passport 資料</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>儲存</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-white/50 block mb-1">姓名 / 暱稱</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">Handle 帳號名稱</label>
                <input
                  type="text"
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">電子信箱 (選填)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-white/50 block mb-1">頭像圖片網址 (URL)</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-white/50 block mb-1">個人簡介 (Bio)</label>
              <textarea
                rows={2}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-white/20 shadow-xl bg-zinc-900">
                  <img 
                    src={passport.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'} 
                    alt={passport.name}
                    className="w-full h-full object-cover" 
                  />
                </div>
                {passport.verifiedStatus && (
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 text-white shadow-md">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    {passport.name}
                  </h2>
                  <span className="text-xs font-mono text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 w-fit mx-auto sm:mx-0">
                    {passport.handle}
                  </span>
                </div>

                <p className="text-xs text-white/60 leading-relaxed max-w-md">
                  {passport.bio || '尚未填寫個人簡介。'}
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-[11px] font-mono text-white/40">
                  {passport.email && <span>{passport.email}</span>}
                  {passport.email && <span>•</span>}
                  <span>已連動 {connectedCount} 個平台</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditName(passport.name);
                setEditHandle(passport.handle);
                setEditBio(passport.bio);
                setEditEmail(passport.email);
                setEditAvatar(passport.avatar);
                setIsEditingProfile(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer flex-shrink-0"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編輯資料</span>
            </button>
          </div>
        )}
      </div>

      {/* Connected Accounts (OAuth 2.0 PKCE Gateway) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>第三方帳號連動管理 (OAuth 2.0 PKCE)</span>
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              一鍵授權綁定與解綁，安全儲存於本機 LocalStorage
            </p>
          </div>

          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>全網同步</span>
          </button>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="p-4 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-2xl bg-white/[0.05] border border-white/10 flex-shrink-0">
                  {getPlatformIcon(p.id)}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{p.name}</span>
                    <span className={`px-2 py-0.2 text-[9px] font-mono rounded-full ${
                      p.connected 
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {p.connected ? '已連動' : '未連動'}
                    </span>
                  </div>

                  <p className="text-[11px] text-white/40 truncate mt-0.5">
                    {p.connected ? (p.username || '已成功授權連線') : p.description}
                  </p>
                </div>
              </div>

              {/* Action button: Connect / Disconnect */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {p.connected ? (
                  disconnectConfirmId === p.id ? (
                    <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                      <button
                        onClick={() => {
                          onDisconnectPlatform(p.id);
                          setDisconnectConfirmId(null);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        確認解除
                      </button>
                      <button
                        onClick={() => setDisconnectConfirmId(null)}
                        className="px-2 py-1 rounded-xl bg-white/10 text-white/60 hover:text-white text-[11px] transition-colors cursor-pointer"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDisconnectConfirmId(p.id)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/40 text-xs font-medium border border-white/5 transition-colors cursor-pointer"
                    >
                      解除連動
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onOpenConnectModal(p.id)}
                    className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>連動</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LocalStorage & GitHub Pages Backup Engine */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>本機備份與資料庫管理 (GitHub Pages 支援)</span>
          </h3>
          <p className="text-xs text-white/40 mt-0.5">
            匯出或匯入您的個人資料、貼文動態與授權 Token，支援不同瀏覽器與裝置無縫遷移。
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>匯出本機備份 (JSON)</span>
            </button>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>匯入備份檔 (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>

            {showClearConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetAllData();
                    setShowClearConfirm(false);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  確認清除所有本機資料
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-3 py-2 rounded-xl bg-white/10 text-white/60 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除本機資料</span>
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
