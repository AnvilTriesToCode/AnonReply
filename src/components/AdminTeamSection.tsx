'use client';

import { useState } from 'react';
import { updateAdminPassword, updateAdminTitle } from '@/lib/actions/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Key,
  CheckCircle,
  Building2,
  Lock,
  Mail,
  Edit2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AdminMember {
  _id: string;
  username: string;
  email?: string;
  role: 'ADMIN';
  adminTitle?: string;
  createdAt: string;
}

interface AdminTeamSectionProps {
  currentUsername: string;
  adminTeam: AdminMember[];
}

export default function AdminTeamSection({
  currentUsername,
  adminTeam,
}: AdminTeamSectionProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<AdminMember | null>(null);
  const [actionType, setActionType] = useState<'password' | 'title' | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleOpenPasswordModal = (admin: AdminMember) => {
    setSelectedAdmin(admin);
    setActionType('password');
    setNewPassword('');
    setMessage(null);
  };

  const handleOpenTitleModal = (admin: AdminMember) => {
    setSelectedAdmin(admin);
    setActionType('title');
    setNewTitle(admin.adminTitle || 'Moderation Team Member');
    setMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedAdmin(null);
    setActionType(null);
    setMessage(null);
    setNewPassword('');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !newPassword) return;

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await updateAdminPassword(selectedAdmin._id, newPassword);
      if (res.success) {
        setMessage({ type: 'success', text: `Password updated successfully for @${selectedAdmin.username}` });
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !newTitle) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await updateAdminTitle(selectedAdmin._id, newTitle);
      if (res.success) {
        setMessage({ type: 'success', text: `Role title updated for @${selectedAdmin.username}` });
        selectedAdmin.adminTitle = newTitle;
        setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to update title' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Umbrella Suite Overview Card */}
      <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] p-6 shadow-xl shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">Support Team Umbrella Suite</h3>
                <Badge variant="secondary" className="text-[11px] bg-purple-500/15 text-purple-300 border-purple-500/30">
                  Multi-Seat Architecture
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Centralized organization management with multi-admin team access.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-semibold">
            {adminTeam.length} / {adminTeam.length} Active Seats
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="rounded-xl border border-white/[0.08] bg-[#1e1e2f] p-4 space-y-1.5 shadow-inner">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              Unified Public Identity
            </span>
            <p className="font-bold text-white flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-purple-400" />
              SupportTeam
            </p>
            <p className="text-xs text-slate-400">
              All moderators reply strictly under this verified umbrella brand.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#1e1e2f] p-4 space-y-1.5 shadow-inner">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              Umbrella Owner Account
            </span>
            <p className="font-mono font-bold text-white text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-400" />
              admin
            </p>
            <p className="text-xs text-slate-400">
              Primary administrative root account for the platform.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-[#1e1e2f] p-4 space-y-1.5 shadow-inner">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
              Central Alerts Routing
            </span>
            <p className="font-bold text-white text-sm flex items-center gap-2 truncate">
              <Mail className="h-4 w-4 text-sky-400" />
              notifications@example.com
            </p>
            <p className="text-xs text-slate-400">
              New tickets and live requests dispatch here.
            </p>
          </div>
        </div>
      </div>

      {/* 5 Admin Team Members Card with Creative Tim Floating Header Banner */}
      <div className="relative rounded-2xl bg-[#27293d] border border-white/[0.08] pt-3 pb-4 shadow-xl shadow-black/25 mt-6">
        {/* Signature Floating Banner */}
        <div className="-mt-7 mx-4 rounded-xl bg-gradient-to-r from-[#ba54f5] to-[#e14eca] p-4 text-white shadow-lg shadow-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-white" />
            <div>
              <h4 className="font-bold text-lg text-white">Umbrella Team Members</h4>
              <p className="text-xs text-purple-100 font-medium">
                {adminTeam.length} Individual Admin Accounts under SupportTeam
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/20 text-white">
            Access: /admin/login
          </span>
        </div>

        {/* Member Rows */}
        <div className="divide-y divide-white/[0.06] mt-4">
          {adminTeam.map((admin, idx) => {
            const isCurrentUser =
              admin.username.toLowerCase() === currentUsername.toLowerCase();
            const isOwner =
              admin.username.toLowerCase() === 'admin';

            return (
              <div
                key={admin._id}
                className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isCurrentUser ? 'bg-purple-500/[0.06]' : 'hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600/30 to-fuchsia-600/30 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-sm shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-white tracking-tight">
                        @{admin.username}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="default" className="text-[10px] h-5 px-2 bg-gradient-to-r from-[#ba54f5] to-[#e14eca]">
                          You (Active Session)
                        </Badge>
                      )}
                      {isOwner ? (
                        <Badge variant="warning" className="text-[10px] h-5 px-2">
                          Primary Owner
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5 px-2">
                          Seat {idx + 1}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="text-slate-300">{admin.adminTitle || (isOwner ? 'Primary Account (Owner)' : 'Team Moderator')}</span>
                      {admin.email && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                            <Mail className="h-3 w-3 text-slate-500" />
                            {admin.email}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions for this admin account */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenTitleModal(admin)}
                    className="h-8 gap-1.5 text-xs rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                    Role Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPasswordModal(admin)}
                    className="h-8 gap-1.5 text-xs rounded-lg border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/20"
                  >
                    <Key className="h-3.5 w-3.5 text-purple-400" />
                    Change Password
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="py-3 px-6 bg-[#1e1e2f]/50 border-t border-white/[0.06] flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2">
          <span>Each administrator signs in securely at <strong className="text-slate-300">/admin/login</strong> with their username.</span>
          <span className="font-semibold text-purple-400">All outgoing replies labeled as SupportTeam</span>
        </div>
      </div>

      {/* Modal / Dialog for Updating Password */}
      {actionType === 'password' && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-[#27293d] border border-white/10 p-6 shadow-2xl shadow-black/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-xs text-slate-400">@{selectedAdmin.username} under SupportTeam</p>
              </div>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  New Admin Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !newPassword}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Save New Password'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal / Dialog for Updating Title/Role */}
      {actionType === 'title' && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in-0">
          <div className="w-full max-w-md rounded-2xl bg-[#27293d] border border-white/10 p-6 shadow-2xl shadow-black/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#ba54f5] to-[#e14eca] flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Edit Role Title</h3>
                <p className="text-xs text-slate-400">@{selectedAdmin.username} internal designation</p>
              </div>
            </div>

            <form onSubmit={handleSaveTitle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newTitle" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Role Title
                </Label>
                <Input
                  id="newTitle"
                  type="text"
                  placeholder="e.g. Senior Moderator, Shift A Lead"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  disabled={loading}
                  autoFocus
                />
              </div>

              {message && (
                <div
                  className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                    message.type === 'success'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !newTitle}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Role Title'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
