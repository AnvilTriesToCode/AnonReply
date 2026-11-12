'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { sendConversationApprovedEmail, sendConversationDeniedEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

interface AdminActionResult {
  success: boolean;
  error?: string;
  processed?: number;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export async function getPendingConversations() {
  try {
    await requireAdmin();
    await connectDB();

    const conversations = await Conversation.find({ status: 'PENDING' })
      .populate('author', 'username')
      .sort({ createdAt: 1 })
      .lean();

    return JSON.parse(JSON.stringify(conversations));
  } catch (error: any) {
    console.error('Get pending conversations error:', error);
    return [];
  }
}

export async function getAllConversations() {
  try {
    await requireAdmin();
    await connectDB();

    const conversations = await Conversation.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(conversations));
  } catch (error: any) {
    console.error('Get all conversations error:', error);
    return [];
  }
}

export async function approveConversation(conversationId: string): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.status !== 'PENDING') {
      return { success: false, error: 'Conversation is not in pending status' };
    }

    conversation.status = 'APPROVED';
    await conversation.save();

    // Send email notification if user has email
    const author = await User.findById(conversation.author);
    if (author?.email) {
      await sendConversationApprovedEmail(
        author.email,
        conversation.title,
        conversationId
      );
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    revalidatePath('/');

    return { success: true };
  } catch (error: any) {
    console.error('Approve conversation error:', error);
    return { success: false, error: 'Failed to approve conversation' };
  }
}

export async function denyConversation(
  conversationId: string,
  reason?: string
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.status !== 'PENDING') {
      return { success: false, error: 'Conversation is not in pending status' };
    }

    conversation.status = 'DENIED';
    conversation.denialReason = reason || undefined;
    await conversation.save();

    // Send email notification if user has email
    const author = await User.findById(conversation.author);
    if (author?.email) {
      await sendConversationDeniedEmail(author.email, conversation.title, reason);
    }

    revalidatePath('/admin');
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Deny conversation error:', error);
    return { success: false, error: 'Failed to deny conversation' };
  }
}

export async function bulkApprove(conversationIds: string[]): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    let processed = 0;

    for (const id of conversationIds) {
      const result = await approveConversation(id);
      if (result.success) processed++;
    }

    revalidatePath('/admin');
    return { success: true, processed };
  } catch (error: any) {
    console.error('Bulk approve error:', error);
    return { success: false, error: 'Failed to process bulk approval' };
  }
}

export async function bulkDeny(
  conversationIds: string[],
  reason?: string
): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    let processed = 0;

    for (const id of conversationIds) {
      const result = await denyConversation(id, reason);
      if (result.success) processed++;
    }

    revalidatePath('/admin');
    return { success: true, processed };
  } catch (error: any) {
    console.error('Bulk deny error:', error);
    return { success: false, error: 'Failed to process bulk denial' };
  }
}

export async function getAdminStats() {
  try {
    await requireAdmin();
    await connectDB();

    const [pending, approved, denied, resolved, totalUsers] = await Promise.all([
      Conversation.countDocuments({ status: 'PENDING' }),
      Conversation.countDocuments({ status: 'APPROVED' }),
      Conversation.countDocuments({ status: 'DENIED' }),
      Conversation.countDocuments({ status: 'RESOLVED' }),
      User.countDocuments({ role: 'USER' }),
    ]);

    return { pending, approved, denied, resolved, totalUsers };
  } catch (error) {
    console.error('Get admin stats error:', error);
    return { pending: 0, approved: 0, denied: 0, resolved: 0, totalUsers: 0 };
  }
}

export async function getAdminTeam() {
  try {
    await requireAdmin();
    await connectDB();

    const admins = await User.find({ role: 'ADMIN' })
      .select('_id username email role adminTitle createdAt')
      .sort({ createdAt: 1 })
      .lean();

    return JSON.parse(JSON.stringify(admins));
  } catch (error) {
    console.error('Get admin team error:', error);
    return [];
  }
}

export async function updateAdminPassword(adminId: string, newPassword: string): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return { success: false, error: 'Admin account not found' };
    }

    adminUser.password = newPassword;
    await adminUser.save();

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Update admin password error:', error);
    return { success: false, error: 'Failed to update admin password' };
  }
}

export async function updateAdminTitle(adminId: string, newTitle: string): Promise<AdminActionResult> {
  try {
    await requireAdmin();
    await connectDB();

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return { success: false, error: 'Admin account not found' };
    }

    adminUser.adminTitle = newTitle.trim();
    await adminUser.save();

    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('Update admin title error:', error);
    return { success: false, error: 'Failed to update title' };
  }
}
