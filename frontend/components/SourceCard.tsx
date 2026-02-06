'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronRight, Globe, FileText, ChevronDown } from 'lucide-react';

interface Source {
  title: string;
  url: string;
}

interface SourceCardProps {
  sources: Source[];
}

export default function SourceCard({ sources }: SourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  if (!sources || sources.length === 0) return null;

  const displaySources = expanded ? sources : sources.slice(0, 4);
  const hasMore = sources.length > 4;

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getFavicon = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-3 pl-12">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#666]" />
        <span className="text-[14px] font-medium text-[#888]">
          {sources.length} Sources
        </span>
      </div>

      {/* Horizontal scrollable source chips */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {displaySources.map((source, index) => (
            <motion.a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03 }}
              className="group flex items-center gap-2.5 px-4 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] rounded-xl transition-all"
            >
              {/* Number badge */}
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[#1a1a1a] group-hover:bg-[#e11d48]/10 text-[12px] font-semibold text-[#666] group-hover:text-[#e11d48] flex items-center justify-center transition-colors">
                {index + 1}
              </span>

              {/* Favicon */}
              <div className="flex-shrink-0 w-4 h-4 rounded overflow-hidden">
                {getFavicon(source.url) ? (
                  <img
                    src={getFavicon(source.url)!}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-4 h-4 text-[#555]" />
                )}
              </div>

              {/* Domain */}
              <span className="text-[13px] text-[#888] group-hover:text-white truncate max-w-[180px] transition-colors">
                {getDomain(source.url)}
              </span>

              {/* External link icon */}
              <ExternalLink className="w-3.5 h-3.5 text-[#555] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </motion.a>
          ))}
        </AnimatePresence>

        {/* Show more/less button */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] text-[#e11d48] hover:bg-[#e11d48]/10 border border-[#222] rounded-xl transition-colors"
          >
            {expanded ? (
              <>
                <span>Show less</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>+{sources.length - 4} more</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
