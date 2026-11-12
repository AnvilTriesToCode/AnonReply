'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Shield,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Radio,
  Lock,
  User,
} from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#27293d]/90 backdrop-blur-md border-b border-white/[0.08] shadow-md shadow-black/20">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo with Creative Tim Gradient Icon */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-md shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
              AnonReply
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              Private Support
            </span>
          </div>
        </Link>

        {/* Navigation Elements */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {status === 'loading' ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-800" />
          ) : session?.user ? (
            <>
              {session.user.role !== 'ADMIN' && (
                <Link href="/live">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-emerald-500/30 transition-all"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    Live Chat
                  </Button>
                </Link>
              )}

              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LayoutDashboard className="h-4 w-4 text-purple-400" />
                  Dashboard
                </Button>
              </Link>

              {session.user.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white shadow-md shadow-purple-500/25 hover:opacity-95 transition-all"
                  >
                    <Shield className="h-4 w-4" />
                    Admin Suite
                  </Button>
                </Link>
              )}

              {/* User Session Pill */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1e2f] border border-white/10 text-xs font-medium text-slate-300">
                <div className="h-6 w-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[11px]">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="font-mono text-purple-200">{session.user.username}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs rounded-xl bg-[#1e1e2f] border-white/10 text-slate-300 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/40 transition-all"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogIn className="h-4 w-4 text-slate-400" />
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#ba54f5] to-[#e14eca] text-white shadow-md shadow-purple-500/25 hover:opacity-95 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
