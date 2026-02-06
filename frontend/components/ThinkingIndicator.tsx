'use client';

import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';

interface ThinkingIndicatorProps {
  text?: string;
}

export default function ThinkingIndicator({ text }: ThinkingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Header - same as assistant message */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e11d48] to-[#be123c] flex items-center justify-center">
          <span className="text-white text-[12px] font-bold">A</span>
        </div>
        <span className="text-[14px] font-medium text-[#888]">Research Agent</span>
        <Loader2 className="w-4 h-4 animate-spin text-[#e11d48]" />
      </div>

      <div className="ml-9">
        <div className="flex items-center gap-2 text-[14px] text-[#888]">
          <ChevronRight className="w-4 h-4" />
          <span>Thinking</span>
        </div>
        
        {text && (
          <div className="mt-3 p-4 bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl">
            <p className="text-[13px] text-[#666] font-mono">{text}</p>
          </div>
        )}

        {/* Animated dots */}
        <div className="flex items-center gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-[#e11d48] rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}