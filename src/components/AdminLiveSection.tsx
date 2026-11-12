'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { acceptLiveChat } from '@/lib/actions/liveChat';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radio, MessageSquare, Check, ArrowRight, Loader2, User, Clock } from 'lucide-react';

interface LiveChatItem {
  _id: string;
  topic: string;
  user: { _id: string; username: string };
  status: 'WAITING' | 'ACCEPTED' | 'CLOSED';
  createdAt: string;
  expiresAt: string;
}

interface AdminLiveSectionProps {
  waitingChats: LiveChatItem[];
  activeChats: LiveChatItem[];
}

export default function AdminLiveSection({
  waitingChats,
  activeChats,
}: AdminLiveSectionProps) {
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccept = async (chatId: string) => {
    setAcceptingId(chatId);
    try {
      const res = await acceptLiveChat(chatId);
      if (res.success) {
        startTransition(() => {
          router.push(`/live/${chatId}`);
        });
      } else {
        alert(res.error || 'Failed to accept chat');
        setAcceptingId(null);
      }
    } catch {
      alert('An error occurred');
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Waiting Live Chat Requests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {waitingChats.length > 0 && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  waitingChats.length > 0 ? 'bg-amber-400' : 'bg-slate-600'
                }`}
              />
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Incoming Live Chat Requests
              {waitingChats.length > 0 && (
                <Badge variant="warning" className="animate-pulse">
                  {waitingChats.length} waiting
                </Badge>
              )}
            </h3>
          </div>
        </div>

        {waitingChats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#27293d]/50 p-6 text-center text-sm text-slate-400">
            No pending live chat requests at this moment. Incoming requests will appear here.
          </div>
        ) : (
          <div className="grid gap-3">
            {waitingChats.map((chat) => (
              <div
                key={chat._id}
                className="rounded-2xl border border-amber-500/30 bg-[#27293d] p-5 shadow-xl shadow-amber-500/5 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Radio className="h-4 w-4 text-amber-400 animate-pulse" />
                      {chat.topic}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-purple-300">
                        <User className="h-3 w-3" />
                        {chat.user?.username || 'User'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested {new Date(chat.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant="warning">Waiting for Admin</Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    Accepting initiates a 3-day private live chat with this user.
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(chat._id)}
                    disabled={acceptingId === chat._id || isPending}
                    className="gap-1.5 bg-gradient-to-r from-[#00f2c3] to-[#0098f0] text-slate-950 font-bold shadow-lg shadow-emerald-500/25 hover:opacity-95"
                  >
                    {acceptingId === chat._id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Accept & Start Chat
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ongoing Live Chats */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          Active Live Sessions
          <Badge variant="secondary" className="bg-white/10 text-slate-300">
            {activeChats.length}
          </Badge>
        </h3>

        {activeChats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#27293d]/50 p-6 text-center text-sm text-slate-400">
            No live chat sessions currently active.
          </div>
        ) : (
          <div className="grid gap-3">
            {activeChats.map((chat) => (
              <div
                key={chat._id}
                className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/25 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      {chat.topic}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-purple-300">
                        <User className="h-3 w-3" />
                        {chat.user?.username || 'User'}
                      </span>
                      <span>Started {new Date(chat.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="success">Live Session</Badge>
                    <CountdownTimer expiresAt={chat.expiresAt} />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-end">
                  <Link href={`/live/${chat._id}`}>
                    <Button size="sm" className="gap-1.5 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl text-xs">
                      Join Active Room
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
