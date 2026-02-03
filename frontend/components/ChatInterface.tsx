'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Menu } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import Sidebar from './Sidebar';
import { Message, sendMessage } from '@/lib/api';

interface ChatInterfaceProps {
  chatId: string;
  initialMessages: Message[];
}

export default function ChatInterface({ chatId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [thinkingText, setThinkingText] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    setThinkingText('');

    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      let fullContent = '';
      let sources: { title: string; url: string }[] = [];
      let thinking = '';

      for await (const chunk of sendMessage(chatId, userMessage)) {
        if (chunk.type === 'text' && chunk.content) {
          fullContent += chunk.content;
          setStreamingContent(fullContent);
        } else if (chunk.type === 'thinking' && chunk.content) {
          setThinkingText(chunk.content);
        } else if (chunk.type === 'done') {
          if (chunk.sources) sources = chunk.sources;
          if (chunk.thinking) thinking = chunk.thinking;
        } else if (chunk.type === 'complete') {
          const assistantMessage: Message = {
            id: Date.now() + 1,
            role: 'assistant',
            content: fullContent,
            sources: sources.length > 0 ? sources : undefined,
            thinking: thinking || undefined,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setStreamingContent('');
          setThinkingText('');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen bg-[#2C2825]">
      <Sidebar 
        currentChatId={chatId} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 flex items-center px-4 border-b border-[#44403C]/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 -ml-2 text-[#A8A29E] hover:bg-[#3C3834] rounded-md transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-[#D97706] flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✨
                </div>
                <h2 className="text-xl text-[#F5F3F0] mb-2">
                  How can I help you research today?
                </h2>
                <p className="text-[#78716C]">
                  Ask me anything and I'll search the web for answers
                </p>
              </div>
            )}

            <div className="space-y-8">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {streamingContent && (
                <MessageBubble 
                  message={{
                    id: 9999,
                    role: 'assistant',
                    content: streamingContent,
                    created_at: new Date().toISOString(),
                  }}
                />
              )}

              {isLoading && !streamingContent && (
                <ThinkingIndicator text={thinkingText} />
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-[#44403C]/30 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-[#3C3834] border border-[#44403C]/50 focus:border-[#D97706]/50 rounded-lg text-[#F5F3F0] placeholder-[#78716C] focus:outline-none resize-none min-h-[48px] max-h-[200px]"
                style={{ fieldSizing: 'content' } as any}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 text-[#A8A29E] hover:text-[#F5F3F0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}