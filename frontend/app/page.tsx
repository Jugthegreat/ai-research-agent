'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Search, 
  Globe, 
  Code,
  Cpu,
  Newspaper,
  Trash2,
  MessageSquare,
  Plus
} from 'lucide-react';
import { createChat, getChats, deleteChat, clearAllChats, Chat } from '@/lib/api';
import VoiceInput from '@/components/VoiceInput';
import { toast } from 'sonner';

const suggestions = [
  { 
    icon: Globe, 
    title: "What's new?", 
    description: 'Recent advancement in technology',
    highlight: false
  },
  { 
    icon: Code, 
    title: 'AI Coder', 
    description: 'How AI codes for us?',
    highlight: true
  },
  { 
    icon: Cpu, 
    title: 'AI startups', 
    description: 'Recent startups focusing on AI',
    highlight: false
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const fetchedChats = await getChats();
      setChats(fetchedChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      toast.success('Chat deleted');
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleClearHistory = async () => {
    if (chats.length === 0) {
      toast.info('No chats to clear');
      return;
    }
    
    try {
      await clearAllChats();
      setChats([]);
      toast.success('All chats cleared');
    } catch (error) {
      console.error('Failed to clear chats:', error);
      toast.error('Failed to clear chats');
    }
  };

  const handleCreateChat = async (initialQuery?: string) => {
    setIsCreating(true);
    try {
      const chat = await createChat();
      if (initialQuery) {
        sessionStorage.setItem('initialQuery', initialQuery);
      }
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      setIsCreating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleCreateChat(query.trim());
    } else {
      handleCreateChat();
    }
  };

  // Group chats by date
  const groupedChats = chats.reduce((groups, chat) => {
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar - Full Height */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-screen sticky top-0">
        {/* New Chat Button */}
        <div className="p-4 flex items-center gap-2">
          <button
            onClick={() => handleCreateChat()}
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-xl font-medium text-[15px] transition-colors disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
          <button className="p-3.5 bg-[#1a1a1a] hover:bg-[#252525] rounded-xl transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#888]">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {['TODAY', 'YESTERDAY', 'OLDER'].map((group) => {
            const groupChats = groupedChats[group];
            if (!groupChats?.length) return null;

            return (
              <div key={group} className="mb-6">
                <h3 className="px-3 py-2 text-[11px] font-bold text-[#555] tracking-widest">
                  {group}
                </h3>
                <div className="space-y-1">
                  {groupChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="group w-full flex items-center gap-3 px-3 py-3.5 text-left hover:bg-[#1a1a1a] rounded-xl transition-all cursor-pointer bg-transparent"
                    >
                      <button
                        onClick={() => router.push(`/chat/${chat.id}`)}
                        className="flex items-center gap-3 flex-1 min-w-0 bg-transparent border-none"
                      >
                        <MessageSquare className="w-[18px] h-[18px] flex-shrink-0 text-[#666]" />
                        <span className="flex-1 truncate text-[14px] text-[#aaa]">{chat.title}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#1f1f1f]">
          <button 
            onClick={handleClearHistory}
            className="w-full flex items-center gap-3 px-3 py-3.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
          >
            <Trash2 className="w-[18px] h-[18px]" />
            <span className="text-[14px]">Clear History</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[800px]"
        >
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] flex items-center justify-center shadow-2xl">
              <Search className="w-12 h-12 text-[#e11d48]" />
            </div>
          </div>

          {/* Title - Big like friend's UI */}
          <h1 className="text-[52px] font-bold text-white text-center mb-14 leading-tight">
            Welcome back!!
          </h1>

          {/* Search Input - Large textarea like friend's UI */}
          <form onSubmit={handleSubmit} className="mb-14">
            <div className="relative bg-[#141414] border-2 border-[#e11d48]/40 rounded-2xl overflow-hidden focus-within:border-[#e11d48] transition-all shadow-lg shadow-[#e11d48]/5">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask me anything..."
                rows={4}
                className="w-full px-6 py-6 bg-transparent text-white text-xl placeholder-[#555] focus:outline-none resize-none caret-[#e11d48]"
                style={{ color: 'white', fontSize: '20px' }}
              />
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#222]">
                <span className="text-[14px] text-[#555]">{query.length}/5000</span>
                <div className="flex items-center gap-2">
                  <VoiceInput 
                    onTranscript={(text) => setQuery(prev => prev ? `${prev} ${text}` : text)}
                    disabled={isCreating}
                  />
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="p-3.5 bg-[#222] hover:bg-[#2a2a2a] rounded-xl transition-colors disabled:opacity-50"
                  >
                    <ArrowUpRight className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Suggestion Cards - Big like friend's UI */}
          <div className="grid grid-cols-3 gap-5">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              return (
                <motion.button
                  key={index}
                  onClick={() => handleCreateChat(suggestion.description)}
                  disabled={isCreating}
                  className={`relative p-6 text-left rounded-2xl border transition-all disabled:opacity-50 ${
                    suggestion.highlight 
                      ? 'bg-gradient-to-br from-[#e11d48]/20 to-[#be123c]/10 border-[#e11d48]/40 hover:border-[#e11d48]/60' 
                      : 'bg-[#141414] border-[#222] hover:bg-[#1a1a1a] hover:border-[#333]'
                  }`}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* <ArrowUpRight className="absolute top-5 right-5 w-5 h-5 text-[#555]" /> */}
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-6 h-6 ${suggestion.highlight ? 'text-[#e11d48]' : 'text-white'}`} />
                    <span className="font-semibold text-white text-[17px]">{suggestion.title}</span>
                  </div>
                  <p className="text-[14px] text-[#888] leading-relaxed">
                    {suggestion.description}
                  </p>
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <p className="text-center text-[14px] text-[#555] mt-14">
            AI powered Research agent
          </p>
        </motion.div>
      </main>

    </div>
  );
}