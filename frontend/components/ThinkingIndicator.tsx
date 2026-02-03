'use client';

import { motion } from 'framer-motion';

export default function ThinkingIndicator({ text }: { text?: string }) {
  return (
    <div className="group">
      <div className="text-xs font-medium text-[#A8A29E] mb-2">
        Assistant
      </div>
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-[#78716C] rounded-full"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        {text && (
          <span className="text-sm text-[#78716C]">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}