'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Always apply dark mode
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', resolvedTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}