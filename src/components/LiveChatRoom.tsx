'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sendLiveMessage, closeLiveChat } from '@/lib/actions/liveChat';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Shield, User, Clock, Loader2, PhoneOff, Radio } from 'lucide-react';

interface MessageItem {
  _id: string;
  senderRole: 'USER' | 'ADMIN';
  alias: string;
  text: string;
  createdAt: string;
}

interface LiveChatRoomProps {
  chatId: string;
  initialTopic: string;
  initialStatus: 'WAITING' | 'ACCEPTED' | 'CLOSED';
  initialExpiresAt: string;
  initialMessages: MessageItem[];
  isAdmin: boolean;
  isOwner: boolean;
}

export default function LiveChatRoom({
  chatId,
  initialTopic,
  initialStatus,
  initialExpiresAt,
  initialMessages,
  isAdmin,
}: LiveChatRoomProps) {
  const [status, setStatus] = useState(initialStatus);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling for live updates every 2.5 seconds
  useEffect(() => {
    if (status === 'CLOSED') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/live/${chatId}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
        }
        if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [chatId, status]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || sending || status !== 'ACCEPTED') return;

    setInputText('');
    setSending(true);

    // Optimistic message append
    const tempMsg: MessageItem = {
      _id: `temp-${Date.now()}`,
      senderRole: isAdmin ? 'ADMIN' : 'USER',
      alias: isAdmin ? 'SupportTeam' : 'Anonymous User',
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const result = await sendLiveMessage(chatId, text);
      if (!result.success) {
        alert(result.error || 'Failed to send message');
      }
    } catch {
      alert('Network error while sending');
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to end this live conversation?')) return;
    setClosing(true);
    const res = await closeLiveChat(chatId);
    if (res.success) {
      setStatus('CLOSED');
      router.refresh();
    }
    setClosing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 py-2">
      {/* Live Chat Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    status === 'ACCEPTED'
                      ? 'bg-emerald-400'
                      : status === 'WAITING'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    status === 'ACCEPTED'
                      ? 'bg-emerald-500'
                      : status === 'WAITING'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
              </span>
              <h2 className="text-xl font-bold text-white">Live: {initialTopic}</h2>
            </div>
            <p className="text-xs text-slate-400">
              {status === 'WAITING' && 'Waiting for Support Team to accept your request...'}
              {status === 'ACCEPTED' && 'Connected live with SupportTeam. Session is confidential.'}
              {status === 'CLOSED' && 'This live conversation has ended.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {status === 'WAITING' && <Badge variant="warning">Waiting for Admin</Badge>}
            {status === 'ACCEPTED' && <Badge variant="success">Live Session</Badge>}
            {status === 'CLOSED' && <Badge variant="secondary">Ended</Badge>}
            <CountdownTimer expiresAt={initialExpiresAt} />

            {status !== 'CLOSED' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={closing}
                className="gap-1.5 text-xs rounded-xl bg-[#1e1e2f] border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-500/20"
              >
                <PhoneOff className="h-3.5 w-3.5 text-rose-400" />
                End Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Waiting Screen for User */}
      {status === 'WAITING' && !isAdmin && (
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-[#27293d] py-14 px-6 text-center shadow-xl shadow-black/25 space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center animate-pulse">
              <Radio className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">Connecting You to Support Team...</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              An administrator has been notified. As soon as they accept, your live conversation
              starts here automatically.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-purple-300">
            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
            <span>Checking for acceptance in real time...</span>
          </div>
        </div>
      )}

      {/* Messages Stream Container */}
      {(status === 'ACCEPTED' || status === 'CLOSED' || (status === 'WAITING' && isAdmin)) && (
        <div className="rounded-2xl border border-white/10 bg-[#27293d] flex flex-col h-[540px] shadow-2xl shadow-black/30 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#1e1e2f]/50">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No messages yet. Say hello to begin!
              </div>
            ) : (
              messages.map((msg) => {
                const isMsgAdmin =
                  msg.senderRole === 'ADMIN' ||
                  msg.alias === 'SupportTeam' ||
                  msg.alias === 'Admin';
                const isMyMessage = isAdmin ? isMsgAdmin : !isMsgAdmin;

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                      {isMsgAdmin ? (
                        <span className="flex items-center gap-1 font-bold text-purple-300">
                          <Shield className="h-3 w-3 text-purple-400" />
                          SupportTeam
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-slate-300">
                          <User className="h-3 w-3 text-slate-400" />
                          Anonymous User
                        </span>
                      )}
                      <span>•</span>
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed shadow-md ${
                        isMsgAdmin
                          ? 'bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white shadow-purple-500/20'
                          : 'bg-[#1e1e2f] border border-white/10 text-slate-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          {status === 'ACCEPTED' ? (
            <div className="p-3.5 border-t border-white/[0.08] bg-[#27293d]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isAdmin ? 'Reply as SupportTeam...' : 'Type your message...'
                  }
                  disabled={sending}
                  className="flex-1 bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500 h-10"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="h-10 px-4 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-md shadow-purple-500/30"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          ) : (
            <div className="p-3 border-t border-white/[0.08] bg-[#1e1e2f] text-center text-xs text-slate-400">
              {status === 'WAITING'
                ? 'Chat will be unlocked once accepted by an administrator.'
                : 'This chat has ended. Conversation will auto-delete in 72 hours.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
