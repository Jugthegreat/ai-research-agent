'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface Source {
  title: string;
  url: string;
}

export default function SourceCard({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-[#A8A29E]">
        Sources
      </div>
      <div className="space-y-2">
        {sources.map((source, index) => (
          <motion.a
            key={index}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-start gap-3 p-3 bg-[#3C3834] hover:bg-[#44403C] border border-[#44403C]/50 rounded-lg transition-colors"
          >
            <div className="flex-shrink-0 w-5 h-5 rounded bg-[#2C2825] flex items-center justify-center mt-0.5">
              <ExternalLink className="w-3 h-3 text-[#78716C] group-hover:text-[#D97706] transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#F5F3F0] group-hover:text-white line-clamp-2 mb-1 transition-colors">
                {source.title}
              </p>
              <p className="text-xs text-[#78716C] truncate">
                {getDomain(source.url)}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}