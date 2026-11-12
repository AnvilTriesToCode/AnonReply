import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getConversationWithMessages } from '@/lib/actions/conversations';
import ReplyForm from '@/components/ReplyForm';
import CountdownTimer from '@/components/CountdownTimer';
import StatusBadge from '@/components/StatusBadge';
import MarkResolvedButton from './MarkResolvedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User, Shield, Lock, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const data = await getConversationWithMessages(id);

  if (!data) {
    notFound();
  }

  const { conversation, messages, isAuthor, isAdmin } = data;
  const isLocked = conversation.status === 'RESOLVED';
  const canReply = isAdmin || (conversation.status === 'APPROVED' && !isLocked);

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-2">
      {/* Conversation Header Card */}
      <div className="rounded-2xl border border-white/10 bg-[#27293d] p-6 shadow-xl shadow-black/25">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white">{conversation.title}</h1>
            <p className="text-xs text-slate-400">
              Submitted on {new Date(conversation.createdAt).toLocaleDateString()} at{' '}
              {new Date(conversation.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={conversation.status} />
            <CountdownTimer expiresAt={conversation.expiresAt} />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-white/10 text-slate-200">
              <User className="h-3 w-3" />
              Original Poster
            </Badge>
          </div>
          <p className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed">{conversation.body}</p>
        </div>

        {/* Mark as Resolved button */}
        {isAuthor && conversation.status === 'APPROVED' && (
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <MarkResolvedButton conversationId={conversation._id} />
          </div>
        )}
      </div>

      {/* Messages / Replies */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-400" />
            Conversation Thread
            <Badge variant="secondary" className="bg-white/10 text-slate-300">
              {messages.length}
            </Badge>
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#27293d] p-8 text-center text-slate-400 text-sm">
            {isAdmin
              ? 'No replies yet. As an Admin, you can respond below to help this user.'
              : 'Awaiting response from SupportTeam.'}
          </div>
        ) : (
          messages.map((message: any) => {
            const isMsgAdmin =
              message.alias === 'SupportTeam' ||
              message.alias === 'Admin';
            return (
              <div
                key={message._id}
                className={`rounded-2xl p-5 border transition-all shadow-lg ${
                  isMsgAdmin
                    ? 'border-purple-500/30 bg-[#27293d] shadow-purple-500/5'
                    : 'border-white/10 bg-[#1e1e2f] shadow-black/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isMsgAdmin ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="gap-1 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white">
                          <Shield className="h-3 w-3" />
                          SupportTeam
                        </Badge>
                        {isAdmin && message.author?.username && (
                          <span
                            className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/10"
                            title="Internal admin attribution (visible to team only)"
                          >
                            via @{message.author.username}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="secondary" className="gap-1 bg-white/10 text-slate-300">
                        <User className="h-3 w-3 text-slate-400" />
                        Original Poster
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{message.body}</p>
              </div>
            );
          })
        )}
      </section>

      {/* Reply Form */}
      {canReply ? (
        <div className="rounded-2xl border border-white/10 bg-[#27293d] p-6 shadow-xl shadow-black/25 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isAdmin && <Shield className="h-4 w-4 text-purple-400" />}
            {isAdmin ? 'Post Official Response' : 'Reply to Support Team'}
          </h3>
          <ReplyForm conversationId={conversation._id} isAdmin={isAdmin} />
        </div>
      ) : isLocked ? (
        <div className="rounded-2xl border border-white/10 bg-[#27293d] p-6 text-center text-sm text-slate-300 flex items-center justify-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>This conversation has been marked as resolved and is locked from new replies.</span>
        </div>
      ) : null}
    </div>
  );
}
