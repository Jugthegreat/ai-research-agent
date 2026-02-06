'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { 
  Copy, 
  Check, 
  ChevronDown,
  ChevronRight,
  Share,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import SourceCard from './SourceCard';
import { Message } from '@/lib/api';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  chatId?: string;
}

export default function MessageBubble({ message, isStreaming = false, chatId }: MessageBubbleProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const copyFullResponse = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopiedCode('full');
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShare = () => {
    if (chatId) {
      const url = `${window.location.origin}/chat/${chatId}`;
      navigator.clipboard.writeText(url);
      toast.success('Chat link copied!');
    }
  };

  // User message - same side (left), nicer box with gradient border
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#e11d48] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[14px] font-medium text-[#888]">You</span>
        </div>
        <div className="relative ml-9">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e11d48]/20 to-[#e11d48]/5 rounded-2xl blur-sm" />
          <div className="relative px-5 py-4 bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-lg">
            <p className="text-[15px] text-white leading-relaxed">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant message - same side (left), with thinking, sources, copy & share
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e11d48] to-[#be123c] flex items-center justify-center">
          <span className="text-white text-[12px] font-bold">A</span>
        </div>
        <span className="text-[14px] font-medium text-[#888]">Research Agent</span>
        {isStreaming && (
          <span className="text-[12px] text-[#e11d48] animate-pulse">thinking...</span>
        )}
      </div>

      <div className="ml-9">
        {/* Thinking/Reasoning - View reasoning button */}
        {message.thinking && (
          <div className="mb-4">
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="flex items-center gap-2 text-[14px] text-[#888] hover:text-white transition-colors"
            >
              {showThinking ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <span>View reasoning</span>
              <span className="px-2 py-0.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full text-[11px] text-[#e11d48]">
                {message.thinking.split('\n').length} steps
              </span>
            </button>
            
            {showThinking && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden"
              >
                <pre className="text-[13px] text-[#777] whitespace-pre-wrap font-mono leading-relaxed">
                  {message.thinking}
                </pre>
              </motion.div>
            )}
          </div>
        )}

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="mb-4">
            <SourceCard sources={message.sources} />
          </div>
        )}

        {/* Main content */}
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                
                if (match) {
                  return (
                    <div className="relative group my-6 rounded-xl overflow-hidden border border-[#2a2a2a]">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
                        <span className="text-[12px] font-medium text-[#888]">
                          {match[1]}
                        </span>
                        <button
                          onClick={() => copyToClipboard(codeString, codeId)}
                          className="flex items-center gap-1.5 text-[12px] text-[#666] hover:text-white transition-colors"
                        >
                          {copiedCode === codeId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark as { [key: string]: React.CSSProperties }}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          background: '#0d0d0d',
                          fontSize: '14px',
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[14px] font-mono text-[#e11d48]" {...props}>
                    {children}
                  </code>
                );
              },
              a({ href, children }) {
                return (
                  <a 
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#e11d48] hover:underline"
                  >
                    {children}
                  </a>
                );
              },
              p({ children }) {
                return <p className="mb-4 last:mb-0 text-[15px] text-[#e0e0e0] leading-[1.8]">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-outside ml-5 space-y-2 mb-4 text-[15px] text-[#e0e0e0]">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-outside ml-5 space-y-2 mb-4 text-[15px] text-[#e0e0e0]">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-[1.8] text-[#e0e0e0]">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-[28px] font-bold text-white mt-8 mb-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-[22px] font-bold text-white mt-6 mb-3">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-[18px] font-bold text-white mt-5 mb-2">{children}</h3>;
              },
              strong({ children }) {
                return <strong className="font-bold text-white">{children}</strong>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-4 border-[#e11d48] pl-4 my-4 text-[#888] italic">
                    {children}
                  </blockquote>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-6 rounded-xl border border-[#2a2a2a]">
                    <table className="min-w-full divide-y divide-[#2a2a2a]">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-4 py-3 bg-[#1a1a1a] text-left text-[14px] font-semibold text-white">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-4 py-3 text-[14px] text-[#ccc] border-t border-[#2a2a2a]">
                    {children}
                  </td>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>

          {isStreaming && (
            <span className="inline-block w-0.5 h-5 bg-[#e11d48] ml-0.5 animate-pulse" />
          )}
        </div>

        {/* Action buttons - Copy and Share only */}
        {!isStreaming && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1a1a1a]">
            <button
              onClick={copyFullResponse}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              {copiedCode === 'full' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>Copy</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#666] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}