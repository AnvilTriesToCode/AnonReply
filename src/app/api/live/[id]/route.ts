import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import LiveChat from '@/lib/models/LiveChat';
import LiveChatMessage from '@/lib/models/LiveChatMessage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    const chat = await LiveChat.findById(id).lean();
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = chat.user.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await LiveChatMessage.find({ chat: id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      status: chat.status,
      expiresAt: chat.expiresAt,
      topic: chat.topic,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
