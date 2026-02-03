'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SourceCard from './SourceCard';
import { Message } from '@/lib/api';

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      {/* Role label */}
      <div className="text-xs font-medium text-[#A8A29E] mb-2">
        {isUser ? 'You' : 'Assistant'}
      </div>

      {/* Content */}
      <div className="text-[#F5F3F0]">
        {isUser ? (
          <p className="whitespace-pre-wrap leading-7">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-invert max-w-none [&_p]:mb-4 [&_p]:last:mb-0 [&_p]:leading-7 [&_a]:text-[#D97706] [&_a]:underline [&_a]:decoration-[#D97706]/30 [&_a]:underline-offset-2 hover:[&_a]:decoration-[#D97706] [&_code]:bg-[#3C3834] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-[#F5F3F0] [&_pre]:bg-[#1C1917] [&_pre]:border [&_pre]:border-[#44403C] [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#E7E5E4] [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:space-y-1 [&_ol]:my-4 [&_strong]:font-semibold [&_strong]:text-[#F5F3F0] [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Sources */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <div className="mt-4">
          <SourceCard sources={message.sources} />
        </div>
      )}

      {/* Thinking process */}
      {!isUser && message.thinking && (
        <details className="mt-3 group/details">
          <summary className="text-xs text-[#78716C] hover:text-[#A8A29E] cursor-pointer select-none transition-colors">
            Show reasoning
          </summary>
          <div className="mt-2 p-3 bg-[#1C1917] border border-[#44403C] rounded-lg">
            <pre className="text-xs text-[#A8A29E] whitespace-pre-wrap font-mono">
              {message.thinking}
            </pre>
          </div>
        </details>
      )}
    </motion.div>
  );
}