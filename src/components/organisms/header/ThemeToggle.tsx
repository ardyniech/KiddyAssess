import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';

export const ThemeToggle = ({ theme, resolvedTheme, onToggle }: any) => (
  <button onClick={onToggle} className="flex items-center justify-center w-7 h-7 md:w-9 md:h-9 rounded-lg glass-card hover:bg-white/10 border-black/5 dark:border-white/10 relative">
    {theme.appearance === "system" ? (
      <Monitor className="w-3.5 h-3.5 text-sky-500" />
    ) : resolvedTheme === "dark" ? (
      <Moon className="w-3.5 h-3.5 text-sky-300" />
    ) : (
      <Sun className="w-3.5 h-3.5 text-amber-500" />
    )}
    {theme.appearance === 'system' && <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-sky-500 rounded-full" />}
  </button>
);
