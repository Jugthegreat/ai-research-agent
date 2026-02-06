'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  PanelLeftClose, 
  PanelLeft, 
  ArrowDown,
  Sparkles,
  StopCircle,
  Share
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import Sidebar from './Sidebar';
import { Message, sendMessage, updateChatTitle, generateTitleFromQuery } from '@/lib/api';
import { toast } from 'sonner';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(initialMessages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const initialQuery = sessionStorage.getItem('initialQuery');
    if (initialQuery && messages.length === 0) {
      sessionStorage.removeItem('initialQuery');
      setInput(initialQuery);
      setTimeout(() => {
        handleSubmitWithQuery(initialQuery);
      }, 100);
    }
  }, []);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmitWithQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    // Update chat title on first message
    if (isFirstMessage) {
      const title = generateTitleFromQuery(query);
      try {
        await updateChatTitle(chatId, title);
      } catch (error) {
        console.error('Failed to update chat title:', error);
      }
      setIsFirstMessage(false);
    }

    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    setThinkingText('');

    const tempUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      let fullContent = '';
      let sources: { title: string; url: string }[] = [];
      let thinking = '';

      abortControllerRef.current = new AbortController();

      for await (const chunk of sendMessage(chatId, query)) {
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
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to send message:', error);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitWithQuery(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setStreamingContent('');
    setThinkingText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <Sidebar 
        currentChatId={chatId} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-[#1f1f1f] bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const url = `${window.location.origin}/chat/${chatId}`;
                navigator.clipboard.writeText(url);
                toast.success('Chat link copied to clipboard!');
              }}
              className="p-2.5 text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-xl transition-colors"
              title="Copy chat link"
            >
              <Share className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="max-w-[800px] mx-auto px-6 py-10">
            {messages.length === 0 && !streamingContent && (
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <Sparkles className="w-12 h-12 text-[#e11d48]" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  What would you like to explore?
                </h2>
                <p className="text-[#666] text-lg max-w-md mx-auto mb-10">
                  I'll search the web, analyze multiple sources, and provide you with a comprehensive answer.
                </p>
                
                {/* Quick action buttons */}
                <div className="flex flex-wrap justify-center gap-3">
                  {['Explain quantum computing', 'Latest AI news', 'Best coding practices'].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmitWithQuery(prompt)}
                      className="px-5 py-3 text-[15px] bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[#888] hover:text-white rounded-xl transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-10">
              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} chatId={chatId} />
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
                  isStreaming
                  chatId={chatId}
                />
              )}

              {isLoading && !streamingContent && (
                <ThinkingIndicator text={thinkingText} />
              )}
            </div>

            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={() => scrollToBottom()}
                className="fixed bottom-36 left-1/2 -translate-x-1/2 p-3.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full shadow-xl hover:bg-[#222] transition-colors z-10"
              >
                <ArrowDown className="w-5 h-5 text-[#888]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t border-[#1f1f1f] bg-[#0a0a0a]">
          <div className="max-w-[800px] mx-auto p-6">
            <form onSubmit={handleSubmit}>
              <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-2xl focus-within:border-[#e11d48]/50 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply...."
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-5 py-5 pr-16 bg-transparent text-xl placeholder-[#555] focus:outline-none resize-none min-h-[60px] max-h-[200px] caret-[#e11d48]"
                  style={{ color: 'white', fontSize: '20px' }}
                />
                <div className="absolute right-3 bottom-3">
                  {isLoading ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors"
                    >
                      <StopCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="p-3 bg-[#e11d48] hover:bg-[#be123c] disabled:bg-[#222] disabled:cursor-not-allowed text-white rounded-xl transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </form>
            <p className="text-center text-[13px] text-[#555] mt-4">
              AI can make mistakes. Always verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}