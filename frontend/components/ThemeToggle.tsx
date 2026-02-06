'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-5 h-5 text-[var(--text-secondary)]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 py-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-lg z-50"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  theme === option.value
                    ? 'text-[var(--accent-primary)] bg-[var(--bg-hover)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <option.icon className="w-4 h-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
