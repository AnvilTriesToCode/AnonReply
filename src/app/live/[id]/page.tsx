import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLiveChatData } from '@/lib/actions/liveChat';
import LiveChatRoom from '@/components/LiveChatRoom';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export default async function LiveChatRoomPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/login?callbackUrl=/live/${id}`);
  }

  const data = await getLiveChatData(id);

  if (!data) {
    notFound();
  }

  const { chat, messages, isAdmin, isOwner } = data;

  return (
    <LiveChatRoom
      chatId={chat._id}
      initialTopic={chat.topic}
      initialStatus={chat.status}
      initialExpiresAt={chat.expiresAt}
      initialMessages={messages}
      isAdmin={isAdmin}
      isOwner={isOwner}
    />
  );
}
