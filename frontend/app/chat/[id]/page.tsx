import { getChat } from '@/lib/api';
import ChatInterface from '@/components/ChatInterface';
import { notFound } from 'next/navigation';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let chat;
  try {
    chat = await getChat(id);
  } catch (error) {
    notFound();
  }

  return <ChatInterface chatId={chat.id} initialMessages={chat.messages} />;
}