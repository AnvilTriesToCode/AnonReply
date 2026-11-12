'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, Shield, Sparkles, AlertCircle } from 'lucide-react';
import InstantAccountButton from '@/components/InstantAccountButton';

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError('');
    setLoading(true);

    try {
      const result = await registerUser(formData);

      if (result.success) {
        const username = formData.get('username') as string;

        const signInResult = await signIn('credentials', {
          username,
          redirect: false,
        });

        if (signInResult?.error) {
          router.push('/login');
        } else {
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        setError(result.error || 'Registration failed');
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
        {/* Floating Offset Icon Tile */}
        <div className="-mt-16 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] shadow-lg shadow-purple-500/40 flex items-center justify-center text-white">
          <UserPlus className="h-8 w-8" />
        </div>

        <div className="text-center mt-4 mb-6">
          <h1 className="text-2xl font-black tracking-tight text-white">Create Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Choose your anonymous identity. No password required.
          </p>
        </div>

        <div className="space-y-4">
          {/* Quick Instant Account Access */}
          <div className="space-y-1.5">
            <InstantAccountButton
              className="w-full h-11 bg-gradient-to-r from-[#00f2c3] to-[#0098f0] text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:opacity-95"
              size="lg"
              text="⚡ Use Services Immediately"
            />
            <p className="text-[11px] text-center text-slate-400">
              Don&apos;t want to pick a name? Auto-generate a private handle immediately.
            </p>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#27293d] px-2 text-slate-400 font-semibold tracking-wider text-[10px]">
                or register with
              </span>
            </div>
          </div>

          {/* Google Sign In Option */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 flex items-center justify-center gap-2 bg-[#1e1e2f] border-white/10 text-slate-200 hover:text-white hover:bg-white/5 rounded-xl font-medium text-xs"
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#27293d] px-2 text-slate-400 font-semibold tracking-wider text-[10px]">
                or choose handle
              </span>
            </div>
          </div>

          {/* Form */}
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Choose Anonymous Username
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="e.g. seeker42, humble_voice"
                minLength={3}
                maxLength={30}
                required
                disabled={loading}
                autoComplete="username"
                className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-400">
                3-30 characters, letters, numbers, underscores only.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Email Address <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com (optional)"
                disabled={loading}
                autoComplete="email"
                className="bg-[#1e1e2f] border-white/10 text-white placeholder:text-slate-500"
              />
              <p className="text-[11px] text-slate-400">
                Only used to notify you when an admin replies. Never public.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:opacity-95 text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-white/[0.08] text-center">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold underline-offset-4 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
