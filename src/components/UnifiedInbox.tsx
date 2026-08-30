import React, { useState } from 'react';
import { MessageItem, PlatformConfig, PlatformId } from '../types';
import { 
  Search, 
  Star, 
  Send, 
  Mail, 
  MessageSquare, 
  Camera, 
  ArrowLeft,
  Inbox,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface UnifiedInboxProps {
  messages: MessageItem[];
  platforms: PlatformConfig[];
  onReplyMessage: (messageId: string, replyText: string) => void;
  onToggleStar: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onRefreshFeed: () => void;
  onOpenConnectModal?: (platformId: PlatformId) => void;
  isSyncing: boolean;
}

export function UnifiedInbox({
  messages,
  platforms,
  onReplyMessage,
  onToggleStar,
  onMarkAsRead,
  onRefreshFeed,
  onOpenConnectModal,
}: UnifiedInboxProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(messages[0]?.id || null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replyInput, setReplyInput] = useState<string>('');

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || null;

  const filteredMessages = messages.filter(m => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = m.content.toLowerCase().includes(q) || 
                        m.sender.name.toLowerCase().includes(q) || 
                        m.sender.handle.toLowerCase().includes(q) ||
                        (m.title && m.title.toLowerCase().includes(q));
      if (!matchText) return false;
    }

    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !m.isRead;
    if (activeFilter === 'starred') return m.isStarred;
    if (activeFilter === 'instagram') return m.platform === 'instagram';
    if (activeFilter === 'discord') return m.platform === 'discord';
    if (activeFilter === 'google') return m.platform === 'google';
    return true;
  });

  const handleSendReply = () => {
    if (!replyInput.trim() || !selectedMessageId) return;
    onReplyMessage(selectedMessageId, replyInput.trim());
    setReplyInput('');
  };

  const getPlatformIcon = (pid: PlatformId) => {
    switch (pid) {
      case 'instagram':
        return <Camera className="w-3.5 h-3.5 text-[#E1306C]" />;
      case 'discord':
        return <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" />;
      case 'google':
        return <Mail className="w-3.5 h-3.5 text-[#EA4335]" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getPlatformLabel = (pid: PlatformId) => {
    switch (pid) {
      case 'instagram': return 'Instagram DM';
      case 'discord': return 'Discord';
      case 'google': return 'Gmail';
      default: return pid.toUpperCase();
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden pb-32 max-w-5xl mx-auto w-full px-4 sm:px-8 py-4 select-none">
      
      {/* 2-Pane Liquid Glass Container */}
      <div className="w-full flex rounded-[32px] liquid-glass border border-white/[0.08] overflow-hidden shadow-2xl">
        
        {/* Left Message Column */}
        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-white/[0.06] bg-black/20 ${
          selectedMessage ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header Search & Tabs */}
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-white/70" />
                <h2 className="text-sm font-bold text-white">收件匣</h2>
              </div>
              <span className="text-[11px] text-white/40">
                {filteredMessages.length} 則訊息
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="搜尋訊息內容或寄件者..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-8.5 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {[
                { id: 'all', label: '全部' },
                { id: 'unread', label: '未讀' },
                { id: 'starred', label: '星標' },
                { id: 'google', label: 'Gmail' },
                { id: 'discord', label: 'Discord' },
                { id: 'instagram', label: 'Instagram' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-white text-black font-semibold'
                      : 'bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.05]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredMessages.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto text-white/40">
                  <Inbox className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white/70">目前尚無訊息</p>
                  <p className="text-[11px] text-white/40">連動 Gmail 或 Discord 即可即時接收通知</p>
                </div>
                {onOpenConnectModal && (
                  <button
                    onClick={() => onOpenConnectModal('google')}
                    className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold shadow-sm hover:bg-white/90 transition-all cursor-pointer"
                  >
                    連動 Gmail
                  </button>
                )}
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessageId === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      setSelectedMessageId(msg.id);
                      if (!msg.isRead) onMarkAsRead(msg.id);
                    }}
                    className={`p-3.5 transition-all cursor-pointer relative group ${
                      isSelected 
                        ? 'bg-white/[0.08] border-l-2 border-white' 
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <img 
                          src={msg.sender.avatar} 
                          alt={msg.sender.name}
                          className="w-6 h-6 rounded-full object-cover border border-white/10 flex-shrink-0"
                        />
                        <span className={`text-xs truncate ${!msg.isRead ? 'font-bold text-white' : 'text-white/80'}`}>
                          {msg.sender.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 whitespace-nowrap flex-shrink-0">
                        {msg.relativeTime}
                      </span>
                    </div>

                    {msg.title && (
                      <p className={`text-xs truncate mb-0.5 ${!msg.isRead ? 'font-semibold text-white' : 'text-white/70'}`}>
                        {msg.title}
                      </p>
                    )}

                    <p className="text-[11px] text-white/50 line-clamp-1">
                      {msg.content}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <span className="text-[10px] text-white/40 flex items-center gap-1">
                        {getPlatformIcon(msg.platform)}
                        <span>{getPlatformLabel(msg.platform)}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStar(msg.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          msg.isStarred ? 'text-amber-400' : 'text-white/20 hover:text-white/60'
                        }`}
                      >
                        <Star className={`w-3 h-3 ${msg.isStarred ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <div className={`flex-1 flex flex-col bg-transparent ${
          !selectedMessage ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedMessage ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Detail Header */}
              <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedMessageId(null)}
                    className="md:hidden p-1.5 rounded-xl bg-white/[0.05] text-white/60 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img 
                    src={selectedMessage.sender.avatar} 
                    alt={selectedMessage.sender.name}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">
                        {selectedMessage.sender.name}
                      </span>
                      <span className="text-[10px] text-white/40 px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/[0.06]">
                        {getPlatformLabel(selectedMessage.platform)}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40">
                      {selectedMessage.sender.handle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleStar(selectedMessage.id)}
                    className={`p-2 rounded-xl border border-white/[0.08] transition-colors ${
                      selectedMessage.isStarred ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${selectedMessage.isStarred ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Message Content Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {selectedMessage.title && (
                  <h3 className="text-base font-bold text-white/95 leading-snug">
                    {selectedMessage.title}
                  </h3>
                )}

                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/80 leading-relaxed whitespace-pre-line font-normal">
                  {selectedMessage.content}
                </div>

                {/* Thread replies */}
                {selectedMessage.threadReplies && selectedMessage.threadReplies.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-white/40 block">
                      對話紀錄 ({selectedMessage.threadReplies.length})
                    </span>
                    {selectedMessage.threadReplies.map(reply => (
                      <div
                        key={reply.id}
                        className={`p-3 rounded-2xl max-w-sm text-xs ${
                          reply.isSelf 
                            ? 'ml-auto bg-white/[0.08] border border-white/10 text-white' 
                            : 'mr-auto bg-white/[0.03] border border-white/[0.05] text-white/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-semibold text-[10px] text-white/70">{reply.sender}</span>
                          <span className="text-[9px] text-white/40">{reply.time}</span>
                        </div>
                        <p>{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reply Input Bar */}
              <div className="p-4 border-t border-white/[0.06] bg-black/20">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`回覆給 ${selectedMessage.sender.name}...`}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendReply();
                    }}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-all"
                  />
                  <button
                    onClick={handleSendReply}
                    className="px-4 py-2 rounded-2xl bg-white text-black text-xs font-semibold shadow-md hover:bg-white/90 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>送出</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-2 text-white/40">
              <Inbox className="w-8 h-8 stroke-1" />
              <p className="text-xs">請點選左側列表查看訊息內容</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
