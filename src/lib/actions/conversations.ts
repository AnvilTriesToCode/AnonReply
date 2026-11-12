'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import Conversation from '@/lib/models/Conversation';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import { getHelperAlias } from '@/lib/utils';
import { sendNewReplyEmail, sendAdminNewConversationAlert, sendAdminUserReplyAlert } from '@/lib/email';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  error?: string;
  conversationId?: string;
}

const TTL_HOURS = 72;

export async function submitConversation(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to submit a conversation' };
  }

  const title = (formData.get('title') as string)?.trim();
  const body = (formData.get('body') as string)?.trim();

  if (!title || !body) {
    return { success: false, error: 'Title and body are required' };
  }

  if (title.length > 150) {
    return { success: false, error: 'Title cannot exceed 150 characters' };
  }

  if (body.length > 5000) {
    return { success: false, error: 'Body cannot exceed 5000 characters' };
  }

  try {
    await connectDB();

    // Rate limit: max 3 pending requests per user
    const pendingCount = await Conversation.countDocuments({
      author: session.user.id,
      status: 'PENDING',
    });

    if (pendingCount >= 3) {
      return {
        success: false,
        error: 'You can have at most 3 pending requests at a time. Please wait for existing ones to be reviewed.',
      };
    }

    const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000);

    const conversation = await Conversation.create({
      title,
      body,
      author: session.user.id,
      status: 'PENDING',
      expiresAt,
      aliasMap: new Map(),
      aliasCounter: 0,
    });

    // Alert admin notification inbox of incoming pending request
    await sendAdminNewConversationAlert(title, body, conversation._id.toString());

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true, conversationId: conversation._id.toString() };
  } catch (error: any) {
    console.error('Submit conversation error:', error);
    return { success: false, error: 'Failed to submit conversation. Please try again.' };
  }
}

export async function addReply(formData: FormData): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to reply' };
  }

  const conversationId = formData.get('conversationId') as string;
  const body = (formData.get('body') as string)?.trim();

  if (!conversationId || !body) {
    return { success: false, error: 'Conversation ID and reply body are required' };
  }

  if (body.length > 3000) {
    return { success: false, error: 'Reply cannot exceed 3000 characters' };
  }

  try {
    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    const userId = session.user.id;
    const authorId = conversation.author.toString();
    const isAdmin = session.user.role === 'ADMIN';

    // Access control: Only Admins and the conversation author can reply!
    if (!isAdmin && userId !== authorId) {
      return {
        success: false,
        error: 'Unauthorized: Only Admins and the Original Poster can participate in this conversation',
      };
    }

    // For non-admin authors, the conversation must be in APPROVED state
    if (!isAdmin && conversation.status !== 'APPROVED') {
      return { success: false, error: 'This conversation is not currently accepting replies' };
    }

    // Admin replies are labeled "SupportTeam", author replies are "Original Poster"
    const alias = isAdmin ? 'SupportTeam' : 'Original Poster';

    await Message.create({
      conversation: conversationId,
      author: userId,
      alias,
      body,
      expiresAt: conversation.expiresAt,
    });

    // Notify the OP by email if an Admin replied (and author provided email)
    if (isAdmin && userId !== authorId) {
      const author = await User.findById(authorId);
      if (author?.email) {
        await sendNewReplyEmail(author.email, conversation.title, conversationId);
      }
    } else if (!isAdmin) {
      await sendAdminUserReplyAlert(conversation.title, body, conversationId);
    }

    revalidatePath(`/conversations/${conversationId}`);
    revalidatePath('/dashboard');
    revalidatePath('/admin');

    return { success: true };
  } catch (error: any) {
    console.error('Add reply error:', error);
    return { success: false, error: 'Failed to add reply. Please try again.' };
  }
}

export async function markAsResolved(conversationId: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in' };
  }

  try {
    await connectDB();

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    if (conversation.author.toString() !== session.user.id) {
      return { success: false, error: 'Only the original poster can mark as resolved' };
    }

    if (conversation.status !== 'APPROVED') {
      return { success: false, error: 'Only approved conversations can be resolved' };
    }

    conversation.status = 'RESOLVED';
    await conversation.save();

    revalidatePath(`/conversations/${conversationId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Mark as resolved error:', error);
    return { success: false, error: 'Failed to mark as resolved. Please try again.' };
  }
}

export async function getUserConversations() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  try {
    await connectDB();
    const conversations = await Conversation.find({ author: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(conversations));
  } catch (error) {
    console.error('Get user conversations error:', error);
    return [];
  }
}

export async function getApprovedConversations() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    // Only Admins can see the global conversations list
    return [];
  }

  try {
    await connectDB();
    const conversations = await Conversation.find({
      status: { $in: ['APPROVED', 'RESOLVED'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(conversations));
  } catch (error) {
    console.error('Get approved conversations error:', error);
    return [];
  }
}

export async function getConversationWithMessages(conversationId: string) {
  try {
    await connectDB();

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) return null;

    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const isAuthor = session.user.id === conversation.author.toString();
    const isAdmin = session.user.role === 'ADMIN';

    // STRICT ACCESS CONTROL: Only Admins and the Original Poster can see this conversation
    if (!isAdmin && !isAuthor) {
      return null;
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('author', 'username')
      .sort({ createdAt: 1 })
      .lean();

    return {
      conversation: JSON.parse(JSON.stringify(conversation)),
      messages: JSON.parse(JSON.stringify(messages)),
      isAuthor,
      isAdmin,
    };
  } catch (error) {
    console.error('Get conversation error:', error);
    return null;
  }
}
