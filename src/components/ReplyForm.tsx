'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addReply } from '@/lib/actions/conversations';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Shield, AlertCircle } from 'lucide-react';

interface ReplyFormProps {
  conversationId: string;
  isAdmin?: boolean;
}

export default function ReplyForm({ conversationId, isAdmin = false }: ReplyFormProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    try {
      const result = await addReply(formData);

      if (result.success) {
        router.refresh();
        const form = document.getElementById('reply-form') as HTMLFormElement;
        form?.reset();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form id="reply-form" action={handleSubmit} className="space-y-3">
      <input type="hidden" name="conversationId" value={conversationId} />
      <Textarea
        name="body"
        placeholder={isAdmin ? 'Write an official response to this user as SupportTeam...' : 'Write your reply...'}
        rows={4}
        maxLength={3000}
        required
        disabled={loading}
        className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500 rounded-xl"
      />

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-md shadow-purple-500/25 px-5 h-10"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : isAdmin ? (
          <>
            <Shield className="h-4 w-4" />
            Send Response as SupportTeam
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Post Reply
          </>
        )}
      </Button>
    </form>
  );
}
