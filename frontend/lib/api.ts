const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; url: string }[];
  thinking?: string;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  messages: Message[];
}

export async function createChat(title: string = 'New Chat'): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) throw new Error('Failed to create chat');
  return response.json();
}

export async function getChat(chatId: string): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`);
  
  if (!response.ok) throw new Error('Failed to fetch chat');
  return response.json();
}

export async function getChats(): Promise<Chat[]> {
  const response = await fetch(`${API_BASE_URL}/api/chats`);
  
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
}

export async function updateChatTitle(chatId: string, title: string): Promise<Chat> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  
  if (!response.ok) throw new Error('Failed to update chat title');
  return response.json();
}

export async function deleteChat(chatId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to delete chat');
}

export async function clearAllChats(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/chats`, {
    method: 'DELETE',
  });
  
  if (!response.ok) throw new Error('Failed to clear chats');
}

// Generate a short title from user's query
export function generateTitleFromQuery(query: string): string {
  // Remove extra whitespace and truncate
  const cleaned = query.trim().replace(/\s+/g, ' ');
  
  // If query is short enough, use it
  if (cleaned.length <= 40) {
    return cleaned;
  }
  
  // Try to cut at a word boundary
  const truncated = cleaned.substring(0, 40);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 20) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

export interface StreamChunk {
  type: 'text' | 'thinking' | 'done' | 'complete' | 'error';
  content?: string;
  sources?: { title: string; url: string }[];
  thinking?: string;
}

export async function* sendMessage(
  chatId: string,
  content: string
): AsyncGenerator<StreamChunk> {
  const response = await fetch(`${API_BASE_URL}/api/chat/${chatId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error('Failed to send message');
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          yield data;
        } catch (e) {
          console.error('Failed to parse SSE data:', e);
        }
      }
    }
  }
}