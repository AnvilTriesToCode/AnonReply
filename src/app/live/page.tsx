import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCurrentLiveChat } from '@/lib/actions/liveChat';
import LiveChatRequestForm from './LiveChatRequestForm';
import { Radio, Shield, Clock, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LiveChatLandingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login?callbackUrl=/live');
  }

  // If user is Admin, redirect them to the Admin Live section
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  }

  // If user already has a pending or active live chat, redirect directly to it
  const currentChat = await getUserCurrentLiveChat();
  if (currentChat) {
    redirect(`/live/${currentChat._id}`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold text-emerald-300">
          <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Real-Time Support</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">Live Conversation</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Request a direct, 1-on-1 private live chat with SupportTeam. Once an administrator
          accepts your request, your real-time session begins.
        </p>
      </div>

      {/* 3 Floating Mini Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/20">
          <div className="h-10 w-10 mx-auto rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2.5">
            <Lock className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-white">1-on-1 Confidential</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Only SupportTeam sees this</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/20">
          <div className="h-10 w-10 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2.5">
            <Shield className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-white">Accepted by Admin</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Prompt live assistance</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#27293d] p-5 shadow-xl shadow-black/20">
          <div className="h-10 w-10 mx-auto rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2.5">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-white">72-Hour TTL</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Auto-purges permanently</p>
        </div>
      </div>

      {/* Request Form Card with Floating Header */}
      <div className="relative rounded-2xl bg-[#27293d] border border-white/10 p-6 sm:p-8 pt-8 shadow-2xl shadow-black/30 mt-6">
        <div className="-mt-12 mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00f2c3] to-[#0098f0] shadow-lg shadow-emerald-500/30 flex items-center justify-center text-slate-950 mb-4">
          <Radio className="h-7 w-7 animate-pulse" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Request a Live Session</h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide a brief topic so the Support Team knows what you need help with.
          </p>
        </div>

        <LiveChatRequestForm />
      </div>
    </div>
  );
}
