'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, X } from 'lucide-react';
import { getChats, createChat, Chat } from '@/lib/api';

interface SidebarProps {
  currentChatId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ currentChatId, isOpen, onToggle }: SidebarProps) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isCreating, setIsCreating] = useState(false);

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

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const newChat = await createChat('New conversation');
      setChats([newChat, ...chats]);
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#2C2825] border-r border-[#44403C]/30 flex flex-col"
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-[#44403C]/30">
          <button
            onClick={handleNewChat}
            disabled={isCreating}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#F5F3F0] hover:bg-[#3C3834] rounded-md transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>New chat</span>
          </button>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 text-[#A8A29E] hover:bg-[#3C3834] rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {chats.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#78716C]">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    router.push(`/chat/${chat.id}`);
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left ${
                    currentChatId === chat.id
                      ? 'bg-[#3C3834] text-[#F5F3F0]'
                      : 'text-[#A8A29E] hover:bg-[#3C3834]/50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}