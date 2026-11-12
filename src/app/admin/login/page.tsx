'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, Lock, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#27293d] border border-white/10 p-8 pt-10 shadow-2xl shadow-black/40">
        {/* Signature Floating Offset Icon Tile */}
        <div className="-mt-16 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] shadow-lg shadow-purple-500/40 flex items-center justify-center text-white">
          <Shield className="h-8 w-8" />
        </div>

        <div className="text-center mt-4 mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white">Admin Login</h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with your administrator credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Admin Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="admin"
              required
              disabled={loading}
              autoComplete="username"
              className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
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
            className="w-full h-11 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-95 text-sm transition-all"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In as Admin'
            )}
          </Button>

          <p className="text-[11px] text-center text-slate-400 pt-2 border-t border-white/[0.06]">
            SupportTeam Umbrella Access • All 5 admin team accounts sign in here
          </p>
        </form>
      </div>
    </div>
  );
}
