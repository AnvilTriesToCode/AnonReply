import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPendingConversations, getAllConversations, getAdminStats, getAdminTeam } from '@/lib/actions/admin';
import { getWaitingLiveChats, getActiveLiveChats } from '@/lib/actions/liveChat';
import AdminQueue from '@/components/AdminQueue';
import AdminLiveSection from '@/components/AdminLiveSection';
import AdminTeamSection from '@/components/AdminTeamSection';
import StatusBadge from '@/components/StatusBadge';
import CountdownTimer from '@/components/CountdownTimer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  ArrowRight,
  User,
  Radio,
  Building2,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [pendingConversations, allConversations, stats, waitingLiveChats, activeLiveChats, adminTeam] = await Promise.all([
    getPendingConversations(),
    getAllConversations(),
    getAdminStats(),
    getWaitingLiveChats(),
    getActiveLiveChats(),
    getAdminTeam(),
  ]);

  const activeConversations = allConversations.filter(
    (c: any) => c.status === 'APPROVED' || c.status === 'RESOLVED'
  );

  return (
    <div className="space-y-10 py-2">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Admin Moderation Suite
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs font-semibold px-2.5 py-0.5">
                SupportTeam
              </Badge>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Central executive management for asynchronous requests and real-time live rooms.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/api/admin/sync-passwords" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#27293d] border-white/10 text-slate-300 hover:text-white rounded-xl text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              Sync DB Passwords
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Creative Tim Floating Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {/* Widget 1: Pending Reviews (Orange) */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ff8d72] to-[#ffb236] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 -mt-8">
              <Clock className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-3xl font-black text-white mt-1">{stats.pending}</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-amber-300 font-medium">Awaiting Action</span>
            <span>Async Queue</span>
          </div>
        </div>

        {/* Widget 2: Live Waiting Rooms (Emerald) */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#00f2c3] to-[#0098f0] flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 -mt-8">
              <Radio className="h-7 w-7 animate-pulse" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live Queue</p>
              <h3 className="text-3xl font-black text-white mt-1">
                {waitingLiveChats.length + activeLiveChats.length}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">{waitingLiveChats.length} In Waiting Room</span>
            <span>Real-Time</span>
          </div>
        </div>

        {/* Widget 3: Active Conversations (Cyan) */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#1d8cf8] to-[#11cdef] flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 -mt-8">
              <MessageSquare className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Threads</p>
              <h3 className="text-3xl font-black text-white mt-1">{activeConversations.length}</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-cyan-300 font-medium">{stats.approved} Approved</span>
            <span>{stats.resolved} Resolved</span>
          </div>
        </div>

        {/* Widget 4: Admin Team Seats (Purple) */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 -mt-8">
              <Users className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moderator Seats</p>
              <h3 className="text-3xl font-black text-white mt-1">{adminTeam.length} / 5</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-purple-300 font-medium">Umbrella Suite</span>
            <span>All Active</span>
          </div>
        </div>
      </div>

      {/* Admin Team Umbrella Architecture Section */}
      <section className="space-y-4">
        <AdminTeamSection currentUsername={session.user.username} adminTeam={adminTeam} />
      </section>

      {/* Live Chat Management Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#00f2c3] to-[#0098f0] flex items-center justify-center text-slate-950 font-bold">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Real-Time Live Chat Center
              {waitingLiveChats.length > 0 && (
                <Badge className="bg-emerald-500 text-slate-950 font-bold text-xs animate-pulse">
                  {waitingLiveChats.length} User Waiting
                </Badge>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Direct 1-on-1 private live chats with users. Chats last for 3 days before auto-deletion.
            </p>
          </div>
        </div>

        <AdminLiveSection waitingChats={waitingLiveChats} activeChats={activeLiveChats} />
      </section>

      {/* Asynchronous Moderation Review Queue */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#ff8d72] to-[#ffb236] flex items-center justify-center text-white font-bold">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Pending Tickets Queue
              {stats.pending > 0 && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                  {stats.pending} pending
                </Badge>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Review and approve incoming user tickets before they become active conversations.
            </p>
          </div>
        </div>

        <AdminQueue conversations={pendingConversations} />
      </section>

      {/* All Active Conversations List */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#1d8cf8] to-[#11cdef] flex items-center justify-center text-white font-bold">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              All Active Discussions
              <Badge variant="secondary" className="bg-slate-800 text-slate-300 text-xs">
                {activeConversations.length}
              </Badge>
            </h2>
            <p className="text-xs text-slate-400">
              You can respond directly to any of these active conversations as SupportTeam.
            </p>
          </div>
        </div>

        {activeConversations.length === 0 ? (
          <Card className="bg-[#27293d] border border-white/10 rounded-2xl">
            <CardContent className="py-8 text-center text-slate-400">
              No active conversations currently on the platform.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {activeConversations.map((conv: any) => (
              <Card key={conv._id} className="bg-[#27293d] border border-white/10 hover:border-purple-500/30 rounded-2xl transition-all shadow-md shadow-black/20">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base text-white">{conv.title}</CardTitle>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-mono text-purple-300">
                          <User className="h-3 w-3" />
                          {conv.author?.username || 'Unknown'}
                        </span>
                        <span>{new Date(conv.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={conv.status} />
                      <CountdownTimer expiresAt={conv.expiresAt} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-300 line-clamp-2">{conv.body}</p>
                  <div className="mt-3 flex justify-end">
                    <Link href={`/conversations/${conv._id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl text-xs gap-1 shadow-md shadow-purple-500/20">
                        View & Respond
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
