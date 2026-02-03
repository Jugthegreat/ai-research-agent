'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { createChat } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    setIsCreating(true);
    try {
      const chat = await createChat();
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2825] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#D97706] flex items-center justify-center text-3xl">
            ✨
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-5xl font-normal text-[#F5F3F0] tracking-tight">
            AI Research Agent
          </h1>
          <p className="text-xl text-[#A8A29E] font-light">
            Ask me anything. I'll search the web and provide detailed answers with sources.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleCreateChat}
          disabled={isCreating}
          className="group inline-flex items-center gap-2 px-6 py-3 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <span>{isCreating ? 'Starting...' : 'Start researching'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Features */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-sm">
          {[
            { label: 'Real-time', sublabel: 'web search' },
            { label: 'Verified', sublabel: 'sources' },
            { label: 'Fast', sublabel: 'responses' }
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[#F5F3F0] font-medium">{item.label}</div>
              <div className="text-[#78716C]">{item.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-sm text-[#57534E] pt-8">
          Powered by Claude Opus 4.5
        </p>
      </motion.div>
    </div>
  );
}