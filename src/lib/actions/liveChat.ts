'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LiveChat from '@/lib/models/LiveChat';
import LiveChatMessage from '@/lib/models/LiveChatMessage';
import User from '@/lib/models/User';
import {
  sendAdminNewLiveChatAlert,
  sendLiveChatAcceptedEmail,
  sendLiveChatMessageEmail,
} from '@/lib/email';
import { revalidatePath } from 'next/cache';

const THREE_DAYS_HOURS = 72;

export async function requestLiveChat(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: 'You must be logged in to request a live chat' };
  }

  const topic = (formData.get('topic') as string)?.trim();
  const initialMessage = (formData.get('initialMessage') as string)?.trim();

  if (!topic) {
    return { success: false, error: 'Please enter a topic or brief summary of your question' };
  }

  try {
    await connectDB();

    // Check if user already has a pending or active live chat
    const existingChat = await LiveChat.findOne({
      user: session.user.id,
      status: { $in: ['WAITING', 'ACCEPTED'] },
    });

    if (existingChat) {
      return {
        success: true,
        chatId: existingChat._id.toString(),
        alreadyExists: true,
      };
    }

    // Exact 72 hours (3 days) TTL
    const expiresAt = new Date(Date.now() + THREE_DAYS_HOURS * 60 * 60 * 1000);

    const chat = await LiveChat.create({
      topic,
      user: session.user.id,
      status: 'WAITING',
      userAlias: 'Anonymous User',
      adminAlias: 'SupportTeam',
      expiresAt,
    });

    if (initialMessage) {
      await LiveChatMessage.create({
        chat: chat._id,
        sender: session.user.id,
        senderRole: 'USER',
        alias: 'Anonymous User',
        text: initialMessage,
        expiresAt,
      });
    }

    // Alert Admin notification inbox of incoming Live Chat request
    await sendAdminNewLiveChatAlert(topic, initialMessage || topic, chat._id.toString());

    revalidatePath('/live');
    revalidatePath('/admin');
    return { success: true, chatId: chat._id.toString() };
  } catch (error: any) {
    console.error('Request live chat error:', error);
    return { success: false, error: 'Failed to request live chat. Please try again.' };
  }
}

export async function acceptLiveChat(chatId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin access required' };
  }

  try {
    await connectDB();

    const chat = await LiveChat.findById(chatId);
    if (!chat) {
      return { success: false, error: 'Live chat request not found' };
    }

    if (chat.status !== 'WAITING') {
      return { success: false, error: 'This chat has already been accepted or closed' };
    }

    chat.status = 'ACCEPTED';
    chat.admin = session.user.id as any;
    chat.acceptedAt = new Date();
    await chat.save();

    // Post an automated system greeting from SupportTeam
    await LiveChatMessage.create({
      chat: chat._id,
      sender: session.user.id,
      senderRole: 'ADMIN',
      alias: 'SupportTeam',
      text: 'Hello! A Support Team member has joined the live chat. How may we assist you today?',
      expiresAt: chat.expiresAt,
    });

    // Notify user by email if they registered an email address
    const chatUser = await User.findById(chat.user);
    if (chatUser?.email) {
      await sendLiveChatAcceptedEmail(chatUser.email, chat.topic, chatId);
    }

    revalidatePath(`/live/${chatId}`);
    revalidatePath('/live');
    revalidatePath('/admin');

    return { success: true, chatId };
  } catch (error: any) {
    console.error('Accept live chat error:', error);
    return { success: false, error: 'Failed to accept live chat' };
  }
}

export async function closeLiveChat(chatId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await connectDB();

    const chat = await LiveChat.findById(chatId);
    if (!chat) {
      return { success: false, error: 'Live chat not found' };
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = chat.user.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Unauthorized to close this chat' };
    }

    chat.status = 'CLOSED';
    chat.closedAt = new Date();
    await chat.save();

    revalidatePath(`/live/${chatId}`);
    revalidatePath('/live');
    revalidatePath('/admin');

    return { success: true };
  } catch (error: any) {
    console.error('Close live chat error:', error);
    return { success: false, error: 'Failed to close chat' };
  }
}

export async function sendLiveMessage(chatId: string, text: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return { success: false, error: 'Message cannot be empty' };
  }

  if (cleanText.length > 3000) {
    return { success: false, error: 'Message cannot exceed 3000 characters' };
  }

  try {
    await connectDB();

    const chat = await LiveChat.findById(chatId);
    if (!chat) {
      return { success: false, error: 'Live chat not found' };
    }

    if (chat.status !== 'ACCEPTED') {
      return { success: false, error: 'This live chat is not currently active' };
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = chat.user.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: 'Unauthorized to participate in this chat' };
    }

    const senderRole = isAdmin ? 'ADMIN' : 'USER';
    const alias = isAdmin ? 'SupportTeam' : (chat.userAlias || 'Anonymous User');

    const msg = await LiveChatMessage.create({
      chat: chatId,
      sender: session.user.id,
      senderRole,
      alias,
      text: cleanText,
      expiresAt: chat.expiresAt,
    });

    // If Admin replied, email the user if they registered an email address
    if (isAdmin) {
      const chatUser = await User.findById(chat.user);
      if (chatUser?.email) {
        await sendLiveChatMessageEmail(chatUser.email, chat.topic, chatId, cleanText);
      }
    }

    return {
      success: true,
      message: JSON.parse(JSON.stringify(msg)),
    };
  } catch (error: any) {
    console.error('Send live message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

export async function getLiveChatData(chatId: string) {
  try {
    await connectDB();

    const chat = await LiveChat.findById(chatId).populate('user', 'username').lean();
    if (!chat) return null;

    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = (chat.user as any)?._id?.toString() === session.user.id || chat.user?.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return null;
    }

    const messages = await LiveChatMessage.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean();

    return {
      chat: JSON.parse(JSON.stringify(chat)),
      messages: JSON.parse(JSON.stringify(messages)),
      isAdmin,
      isOwner,
    };
  } catch (error: any) {
    console.error('Get live chat error:', error);
    return null;
  }
}

export async function getWaitingLiveChats() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') return [];

  try {
    await connectDB();
    const chats = await LiveChat.find({ status: 'WAITING' })
      .populate('user', 'username')
      .sort({ createdAt: 1 })
      .lean();

    return JSON.parse(JSON.stringify(chats));
  } catch (error) {
    console.error('Get waiting live chats error:', error);
    return [];
  }
}

export async function getActiveLiveChats() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') return [];

  try {
    await connectDB();
    const chats = await LiveChat.find({ status: 'ACCEPTED' })
      .populate('user', 'username')
      .sort({ updatedAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(chats));
  } catch (error) {
    console.error('Get active live chats error:', error);
    return [];
  }
}

export async function getUserCurrentLiveChat() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  try {
    await connectDB();
    const chat = await LiveChat.findOne({
      user: session.user.id,
      status: { $in: ['WAITING', 'ACCEPTED'] },
    })
      .sort({ createdAt: -1 })
      .lean();

    return chat ? JSON.parse(JSON.stringify(chat)) : null;
  } catch (error) {
    console.error('Get user current live chat error:', error);
    return null;
  }
}
