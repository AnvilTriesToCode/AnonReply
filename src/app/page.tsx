import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getApprovedConversations, getUserConversations } from '@/lib/actions/conversations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CountdownTimer from '@/components/CountdownTimer';
import StatusBadge from '@/components/StatusBadge';
import InstantAccountButton from '@/components/InstantAccountButton';
import {
  MessageCircle,
  Plus,
  Users,
  Shield,
  Clock,
  Lock,
  ArrowRight,
  Radio,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch (err) {
    console.warn('Session retrieval error (guest mode):', err);
  }
  const isAdmin = session?.user?.role === 'ADMIN';

  let adminConversations: any[] = [];
  let userConversations: any[] = [];
  try {
    if (isAdmin) {
      adminConversations = await getApprovedConversations();
    } else if (session?.user) {
      userConversations = await getUserConversations();
    }
  } catch (err) {
    console.warn('Conversations retrieval error:', err);
  }

  return (
    <div className="space-y-10 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-5 pt-6 pb-4 relative">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300 shadow-sm shadow-purple-500/20">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Strictly Private & Anonymous Assistance</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Direct, Confidential Support with{' '}
          <span className="bg-gradient-to-r from-[#ba54f5] via-[#e14eca] to-[#ff8d72] bg-clip-text text-transparent">
            SupportTeam
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Submit help requests and sensitive questions in complete confidence. Only verified
          moderators can view and respond to your threads. Every session purges permanently after 72 hours.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {session?.user ? (
            isAdmin ? (
              <>
                <Link href="/admin">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] hover:opacity-95 text-white font-bold shadow-lg shadow-purple-500/30 rounded-xl px-6">
                    <Shield className="h-5 w-5" />
                    Open Admin Suite
                  </Button>
                </Link>
                <Link href="/live">
                  <Button variant="outline" size="lg" className="gap-2 bg-[#27293d] border-white/10 text-white hover:bg-white/5 rounded-xl px-6">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    Live Chats
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] hover:opacity-95 text-white font-bold shadow-lg shadow-purple-500/30 rounded-xl px-6">
                    <Plus className="h-5 w-5" />
                    Submit New Request
                  </Button>
                </Link>
                <Link href="/live">
                  <Button variant="outline" size="lg" className="gap-2 bg-[#27293d] border-white/10 text-white hover:bg-white/5 rounded-xl px-6">
                    <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
                    Request Live Chat
                  </Button>
                </Link>
              </>
            )
          ) : (
            <>
              <InstantAccountButton
                size="lg"
                className="bg-gradient-to-r from-[#00f2c3] to-[#0098f0] hover:opacity-95 text-slate-950 gap-2 font-bold shadow-lg shadow-emerald-500/25 rounded-xl px-6 transition-all"
                text="⚡ Use Services Immediately"
              />
              <Link href="/register">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] hover:opacity-95 text-white font-bold shadow-lg shadow-purple-500/30 rounded-xl px-6 transition-all"
                >
                  <Users className="h-5 w-5" />
                  Create Named Account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-[#27293d] border-white/10 text-slate-200 hover:text-white hover:bg-white/5 rounded-xl font-semibold px-6"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* 4 Signature Creative Tim Offset Metric / Feature Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        {/* Card 1: Emerald - Live Help Desk */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25 hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#00f2c3] to-[#0098f0] flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 -mt-8">
              <Radio className="h-7 w-7 animate-pulse" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assistance</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">Live Desk</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Real-Time Chat
            </span>
            <span>1-on-1 Session</span>
          </div>
        </div>

        {/* Card 2: Orange - 72h Native TTL */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25 hover:border-orange-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ff8d72] to-[#fd5d93] flex items-center justify-center text-white shadow-lg shadow-orange-500/30 -mt-8">
              <Clock className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Retention</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">72 Hours</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-orange-300 font-medium">Native Database TTL</span>
            <span>Auto-Purge</span>
          </div>
        </div>

        {/* Card 3: Blue/Cyan - 100% Confidential */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25 hover:border-cyan-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#1d8cf8] to-[#11cdef] flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 -mt-8">
              <Lock className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Privacy</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">100% Zero Logs</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-cyan-300 font-medium">Disposable Usernames</span>
            <span>No Email Needed</span>
          </div>
        </div>

        {/* Card 4: Purple/Fuchsia - Support Team Umbrella */}
        <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-5 shadow-xl shadow-black/25 hover:border-purple-500/30 transition-all duration-300">
          <div className="flex items-start justify-between">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-lg shadow-purple-500/30 -mt-8">
              <Shield className="h-7 w-7" />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moderation</p>
              <h3 className="text-2xl font-bold text-white mt-0.5">SupportTeam</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
            <span className="text-purple-300 font-medium">Multi-Admin Suite</span>
            <span>Unified Brand</span>
          </div>
        </div>
      </section>

      {/* Admin View: Active Threads */}
      {isAdmin && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-400" />
                Active Moderation Queue (Admin View)
              </h2>
              <p className="text-sm text-slate-400">
                You can review and respond directly to active conversations as SupportTeam.
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1 bg-[#27293d] border-white/10 text-white rounded-xl">
                Open Admin Suite
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {adminConversations.length === 0 ? (
            <Card className="bg-[#27293d] border border-white/10 rounded-2xl">
              <CardContent className="py-12 text-center text-slate-400">
                No active conversations currently on the platform.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {adminConversations.map((conv: any) => (
                <Link key={conv._id} href={`/conversations/${conv._id}`}>
                  <Card className="bg-[#27293d] border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all cursor-pointer shadow-lg shadow-black/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg text-white">{conv.title}</CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={conv.status} />
                          <CountdownTimer expiresAt={conv.expiresAt} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 line-clamp-2">{conv.body}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                        <span>Submitted {new Date(conv.createdAt).toLocaleDateString()}</span>
                        <span className="text-purple-400 font-semibold flex items-center gap-1">
                          View & Reply <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* User View: Their Conversations */}
      {session?.user && !isAdmin && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-purple-400" />
              Your Private Conversations
            </h2>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-1 bg-[#27293d] border-white/10 text-white rounded-xl">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {userConversations.length === 0 ? (
            <Card className="bg-[#27293d] border border-white/10 rounded-2xl">
              <CardContent className="py-12 text-center space-y-3">
                <p className="text-slate-400">You haven&apos;t submitted any requests yet.</p>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-md shadow-purple-500/25">
                    Submit Your First Request
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userConversations.map((conv: any) => (
                <Link key={conv._id} href={`/conversations/${conv._id}`}>
                  <Card className="bg-[#27293d] border border-white/10 hover:border-purple-500/40 rounded-2xl transition-all cursor-pointer shadow-lg shadow-black/20">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg text-white">{conv.title}</CardTitle>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={conv.status} />
                          {['APPROVED', 'RESOLVED'].includes(conv.status) && (
                            <CountdownTimer expiresAt={conv.expiresAt} />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 line-clamp-2">{conv.body}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Submitted on {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Guest Privacy Assurance Card */}
      {!session?.user && (
        <Card className="bg-[#27293d] border border-white/10 rounded-2xl shadow-xl shadow-black/25">
          <CardHeader className="pb-3 border-b border-white/[0.06]">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#ba54f5]" />
              How Anonymity & Privacy Work
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your identity is protected at every step of the process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">No Public Thread Visibility:</strong> Unlike open internet forums, only verified support administrators have permission to view incoming conversations.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Direct SupportTeam Assistance:</strong> When the team replies, you can continue the thread directly inside your private dashboard.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-white">Strict 72-Hour Auto-Deletion:</strong> MongoDB automatically purges conversations and all related messages precisely 72 hours after creation via native database TTL indexes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
