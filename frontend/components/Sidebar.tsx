'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2,
  Home
} from 'lucide-react';
import { getChats, createChat, deleteChat, clearAllChats, Chat } from '@/lib/api';
import { toast } from 'sonner';

interface SidebarProps {
  currentChatId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentChatId, isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChats();
  }, [currentChatId]);

  const loadChats = async () => {
    try {
      const fetchedChats = await getChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const newChat = await createChat('New Chat');
      setChats([newChat, ...chats]);
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      toast.success('Chat deleted');
      if (chatId === currentChatId) {
        router.push('/');
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const handleClearHistory = async () => {
    if (chats.length === 0) return;
    try {
      await clearAllChats();
      setChats([]);
      toast.success('All chats cleared');
      router.push('/');
    } catch (error) {
      toast.error('Failed to clear chats');
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    const date = new Date(chat.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let group: string;
    if (date.toDateString() === today.toDateString()) {
      group = 'TODAY';
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = 'YESTERDAY';
    } else {
      group = 'OLDER';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(chat);
    return groups;
  }, {} as Record<string, Chat[]>);

  if (!isOpen) return null;

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-screen flex-shrink-0">
      {/* New Chat Button */}
      <div className="p-4 flex items-center gap-2">
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl font-medium text-[15px] transition-colors disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#141414] border border-[#1f1f1f] rounded-xl text-sm text-white placeholder:text-[#555] focus:outline-none focus:border-[#e11d48]/50"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {['TODAY', 'YESTERDAY', 'OLDER'].map((group) => {
          const groupChats = groupedChats[group];
          if (!groupChats?.length) return null;

          return (
            <div key={group} className="mb-4">
              <h3 className="px-3 py-2 text-[11px] font-bold text-[#444] tracking-widest">
                {group}
              </h3>
              <div className="space-y-1">
                {groupChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => router.push(`/chat/${chat.id}`)}
                    className={`group w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-all cursor-pointer ${
                      currentChatId === chat.id
                        ? 'bg-[#1a1a1a] text-white'
                        : 'text-[#888] hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                      currentChatId === chat.id ? 'text-[#e11d48]' : 'text-[#555]'
                    }`} />
                    <span className="flex-1 truncate text-[14px]">{chat.title}</span>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredChats.length === 0 && (
          <div className="text-center py-8 text-[#555] text-sm">
            {searchQuery ? 'No chats found' : 'No conversations yet'}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1f1f1f] space-y-1">
        <button 
          onClick={handleClearHistory}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear history</span>
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
      </div>
    </aside>
  );
}