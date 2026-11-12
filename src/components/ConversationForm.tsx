'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitConversation } from '@/lib/actions/conversations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Clock, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ConversationForm() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await submitConversation(formData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
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
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl bg-[#27293d] border border-white/10 p-6 sm:p-8 pt-8 shadow-2xl shadow-black/30 mt-6">
      {/* Floating Header Banner */}
      <div className="-mt-12 mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] shadow-lg shadow-purple-500/40 flex items-center justify-center text-white mb-3">
        <Send className="h-7 w-7" />
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-white tracking-tight">Submit New Request</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Private and anonymous. Reviewed by SupportTeam before activation. Auto-deletes in 72 hours.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Subject / Title
          </Label>
          <Input
            id="title"
            name="title"
            placeholder="Brief summary of your question or situation..."
            maxLength={150}
            required
            disabled={loading}
            className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Be as descriptive as you like</span>
            <span>Max 150 chars</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Details & Context
          </Label>
          <Textarea
            id="body"
            name="body"
            placeholder="Describe your situation or question in full detail..."
            rows={5}
            maxLength={5000}
            required
            disabled={loading}
            className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
          />
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Keep confidential info private; you remain anonymous</span>
            <span>Max 5000 chars</span>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-3 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Request submitted successfully! Directing to dashboard...</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || success}
          className="w-full h-11 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-95 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting for Review...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Submit Confidential Request
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
