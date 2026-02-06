'use client';

import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

export default function ToastProvider() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Toaster
      position="top-right"
      theme={theme}
      toastOptions={{
        style: {
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        },
      }}
    />
  );
}
