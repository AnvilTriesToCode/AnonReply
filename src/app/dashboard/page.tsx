import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { getUserConversations } from '@/lib/actions/conversations';
import { getUserCurrentLiveChat } from '@/lib/actions/liveChat';
import ConversationForm from '@/components/ConversationForm';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, MessageCircle, Radio, ArrowRight, Clock, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const [conversations, currentLiveChat] = await Promise.all([
    getUserConversations(),
    getUserCurrentLiveChat(),
  ]);

  return (
    <div className="space-y-8 py-2">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Your Dashboard</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Welcome back, <span className="font-mono font-bold text-purple-300">@{session.user.username}</span>
            </p>
          </div>
        </div>

        <Link href="/live">
          <Button
            variant={currentLiveChat ? 'default' : 'outline'}
            className={
              currentLiveChat
                ? 'gap-2 bg-gradient-to-r from-[#00f2c3] to-[#0098f0] text-slate-950 font-bold shadow-lg shadow-emerald-500/25'
                : 'gap-2 bg-[#27293d] border-white/10 text-white hover:bg-white/5'
            }
          >
            <Radio className="h-4 w-4 animate-pulse text-emerald-400" />
            {currentLiveChat ? 'Open Active Live Chat' : 'Start Live Chat'}
          </Button>
        </Link>
      </div>

      {/* Live Chat Banner if user has an active/waiting session */}
      {currentLiveChat && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#27293d] p-5 shadow-xl shadow-emerald-500/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-white">
                {currentLiveChat.status === 'ACCEPTED'
                  ? 'Live Chat Session Active with Support Team'
                  : 'Live Chat Request Waiting for Admin Acceptance'}
              </p>
              <p className="text-xs text-slate-400">Topic: {currentLiveChat.topic}</p>
            </div>
          </div>
          <Link href={`/live/${currentLiveChat._id}`}>
            <Button size="sm" className="gap-1.5 bg-gradient-to-r from-[#00f2c3] to-[#0098f0] text-slate-950 font-bold rounded-xl text-xs">
              Join Chat Room
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Submit New Asynchronous Ticket */}
      <ConversationForm />

      {/* Your Conversations */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Your Conversations
            <Badge variant="secondary" className="bg-white/10 text-slate-300">
              {conversations.length}
            </Badge>
          </h2>
        </div>

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#27293d] py-12 text-center text-slate-400">
            <p>You haven&apos;t submitted any conversations yet. Use the form above to get started!</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {conversations.map((conv: any) => (
              <Link key={conv._id} href={`/conversations/${conv._id}`}>
                <div className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/20 hover:border-purple-500/40 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white">{conv.title}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(conv.createdAt).toLocaleDateString()} at{' '}
                        {new Date(conv.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={conv.status} />
                      {['APPROVED', 'RESOLVED'].includes(conv.status) && (
                        <CountdownTimer expiresAt={conv.expiresAt} />
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300 line-clamp-2">{conv.body}</p>
                  {conv.status === 'DENIED' && conv.denialReason && (
                    <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-300">
                      <strong className="text-rose-200">Reason:</strong> {conv.denialReason}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
