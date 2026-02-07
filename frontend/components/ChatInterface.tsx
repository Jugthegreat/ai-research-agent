'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  PanelLeftClose, 
  PanelLeft, 
  ArrowDown,
  Search,
  Square,
  ArrowUpRight
} from 'lucide-react';
import MessageBubble from './MessageBubble';
import ThinkingIndicator from './ThinkingIndicator';
import Sidebar from './Sidebar';
import VoiceInput from './VoiceInput';
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
      setTimeout(() => handleSubmitWithQuery(initialQuery), 100);
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
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmitWithQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

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

  const handleSubmit = (e: React.FormEvent) => {
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

  const handleShare = () => {
    const url = `${window.location.origin}/chat/${chatId}`;
    navigator.clipboard.writeText(url);
    toast.success('Chat link copied!');
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
        <header className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4 bg-[#0a0a0a]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors text-[#888]"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-[#e11d48]" />
            <span className="font-semibold text-white">Research Agent</span>
          </div>
          
          <button
            onClick={handleShare}
            className="px-3 py-1.5 text-sm text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            Share
          </button>
        </header>

        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 && !streamingContent ? (
            <div className="h-full flex items-center justify-center p-8">
              <motion.div 
                className="text-center max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#252525] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-8">
                  <Search className="w-10 h-10 text-[#e11d48]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Start a conversation</h2>
                <p className="text-[#666] mb-8">
                  Ask anything and I'll search the web for accurate, up-to-date answers.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Explain quantum computing', 'Latest AI news', 'Best coding practices'].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmitWithQuery(prompt)}
                      className="px-4 py-2.5 text-sm text-[#888] bg-[#141414] hover:bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-6 py-8">
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

              <div ref={messagesEndRef} className="h-8" />
            </div>
          )}

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollToBottom()}
                className="fixed bottom-32 left-1/2 -translate-x-1/2 p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full shadow-lg hover:bg-[#252525] transition-colors"
              >
                <ArrowDown className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="border-t border-[#1f1f1f] bg-[#0a0a0a] p-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="relative bg-[#141414] border-2 border-[#2a2a2a] rounded-2xl focus-within:border-[#e11d48]/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-5 py-4 bg-transparent text-white placeholder:text-[#555] focus:outline-none resize-none text-[16px] min-h-[56px] max-h-[200px]"
                  style={{ color: 'white' }}
                />
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#222]">
                  <span className="text-[13px] text-[#444]">{input.length}/5000</span>
                  <div className="flex items-center gap-2">
                    <VoiceInput 
                      onTranscript={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                      disabled={isLoading}
                    />
                    {isLoading ? (
                      <button
                        type="button"
                        onClick={handleStop}
                        className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                      >
                        <Square className="w-5 h-5 text-red-400" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!input.trim()}
                        className="p-2.5 bg-[#1a1a1a] hover:bg-[#252525] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors"
                      >
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
            <p className="text-center text-[12px] text-[#444] mt-4">
              AI powered Research agent · Can make mistakes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}