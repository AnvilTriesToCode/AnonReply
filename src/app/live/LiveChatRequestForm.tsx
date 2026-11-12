'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestLiveChat } from '@/lib/actions/liveChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Radio, Loader2, AlertCircle } from 'lucide-react';

export default function LiveChatRequestForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    try {
      const res = await requestLiveChat(formData);
      if (res.success && res.chatId) {
        router.push(`/live/${res.chatId}`);
      } else {
        setError(res.error || 'Failed to request live chat');
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Topic / What do you need help with?
        </Label>
        <Input
          id="topic"
          name="topic"
          placeholder="e.g. Guidance on confidential personal matters..."
          maxLength={200}
          required
          disabled={loading}
          className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
        />
        <p className="text-[11px] text-slate-400">Max 200 characters</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialMessage" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Initial Message <span className="text-slate-500 font-normal lowercase">(optional)</span>
        </Label>
        <Textarea
          id="initialMessage"
          name="initialMessage"
          placeholder="Provide any initial context for the SupportTeam..."
          rows={3}
          maxLength={3000}
          disabled={loading}
          className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-95 text-sm gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting Request...
          </>
        ) : (
          <>
            <Radio className="h-4 w-4" />
            Request Live Chat Session
          </>
        )}
      </Button>
    </form>
  );
}
