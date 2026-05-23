import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppTheme {
  appearance: 'light' | 'dark' | 'system';
  isMonochrome: boolean;
  primaryColor: string;
  light: {
    textMain: string;
    textMuted: string;
    background: string;
    cardBg: string;
    aspectTitle: string;
    indicatorText: string;
  };
  dark: {
    textMain: string;
    textMuted: string;
    background: string;
    cardBg: string;
    aspectTitle: string;
    indicatorText: string;
  };
  gradients: {
    from: string;
    via: string;
    to: string;
  };
  layout: {
    paddingScale: number;
    marginScale: number;
    cardOpacity: number;
    cardBlur: number;
    cardFontSize: number;
    cardFontColor: string;
  };
  content: {
    bannerTitle: string;
    bannerSubtitle: string;
  };
  borderRadius: string;
  fontFamily: string;
  glassOpacity: number;
  systemFontSize: number;
}

const defaultTheme: AppTheme = {
  appearance: 'system',
  isMonochrome: false,
  primaryColor: '#38bdf8',
  light: {
    textMain: '#0f172a',
    textMuted: '#475569',
    background: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.75)',
    aspectTitle: '#0f172a',
    indicatorText: '#334155',
  },
  dark: {
    textMain: '#ffffff',
    textMuted: '#cbd5e1',
    background: '#020617',
    cardBg: 'rgba(15, 23, 42, 0.6)',
    aspectTitle: '#ffffff',
    indicatorText: '#e2e8f0',
  },
  gradients: {
    from: '#f8fafc',
    via: '#f1f5f9',
    to: '#f8fafc',
  },
  layout: {
    paddingScale: 1,
    marginScale: 1,
    cardOpacity: 0.7,
    cardBlur: 24,
    cardFontSize: 14,
    cardFontColor: '#0f172a',
  },
  content: {
    bannerTitle: 'Assessment Digital Praktis',
    bannerSubtitle: 'Sistem Penilaian Anak Usia Dini Berbasis Naratif untuk Guru yang Mengutamakan Efisiensi dan Ketelitian.',
  },
  borderRadius: '1.5rem',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  glassOpacity: 0.7,
  systemFontSize: 16,
};

interface ThemeContextType {
  theme: AppTheme;
  resolvedTheme: 'light' | 'dark';
  updateTheme: (updates: Partial<AppTheme>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('kiddyassess-theme');
    if (!saved) return defaultTheme;
    try {
      const parsed = JSON.parse(saved);
      return {
        ...defaultTheme,
        ...parsed,
        light: parsed.light ? { ...defaultTheme.light, ...parsed.light } : defaultTheme.light,
        dark: parsed.dark ? { ...defaultTheme.dark, ...parsed.dark } : defaultTheme.dark
      };
    } catch (e) {
      return defaultTheme;
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    // Resolve Appearance
    let targetTheme: 'light' | 'dark' = 'light';
    if (theme.appearance === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      targetTheme = theme.appearance;
    }
    
    setResolvedTheme(targetTheme);
    root.classList.toggle('dark', targetTheme === 'dark');
    root.classList.toggle('monochrome', theme.isMonochrome);

    const effectiveTheme = theme.isMonochrome ? {
      ...theme,
      primaryColor: '#000000',
      light: {
        textMain: '#000000',
        textMuted: '#666666',
        background: '#ffffff',
        cardBg: '#f0f0f0',
        aspectTitle: '#000000',
        indicatorText: '#333333',
      },
      dark: {
        textMain: '#ffffff',
        textMuted: '#aaaaaa',
        background: '#000000',
        cardBg: '#111111',
        aspectTitle: '#ffffff',
        indicatorText: '#cccccc',
      }
    } : theme;

    // System theme listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.appearance === 'system') {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(newTheme);
        root.classList.toggle('dark', newTheme === 'dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Primary
    root.style.setProperty('--color-primary', effectiveTheme.primaryColor);
    
    // Light Group
    root.style.setProperty('--light-text-main', effectiveTheme.light.textMain);
    root.style.setProperty('--light-text-muted', effectiveTheme.light.textMuted);
    root.style.setProperty('--light-bg', effectiveTheme.light.background);
    root.style.setProperty('--light-card-bg', effectiveTheme.light.cardBg);
    root.style.setProperty('--light-aspect-title', effectiveTheme.light.aspectTitle);
    root.style.setProperty('--light-indicator-text', effectiveTheme.light.indicatorText);

    // Dark Group
    root.style.setProperty('--dark-text-main', effectiveTheme.dark.textMain);
    root.style.setProperty('--dark-text-muted', effectiveTheme.dark.textMuted);
    root.style.setProperty('--dark-bg', effectiveTheme.dark.background);
    root.style.setProperty('--dark-card-bg', effectiveTheme.dark.cardBg);
    root.style.setProperty('--dark-aspect-title', effectiveTheme.dark.aspectTitle);
    root.style.setProperty('--dark-indicator-text', effectiveTheme.dark.indicatorText);

    // Global
    root.style.setProperty('--app-radius', effectiveTheme.borderRadius);
    root.style.setProperty('--font-family', theme.fontFamily);
    root.style.setProperty('--glass-opacity', String(theme.glassOpacity));
    root.style.setProperty('--base-font-size', `${theme.systemFontSize}px`);

    // Gradients
    root.style.setProperty('--bg-gradient-from', theme.gradients.from);
    root.style.setProperty('--bg-gradient-via', theme.gradients.via);
    root.style.setProperty('--bg-gradient-to', theme.gradients.to);

    // Layout
    root.style.setProperty('--padding-scale', String(theme.layout.paddingScale));
    root.style.setProperty('--margin-scale', String(theme.layout.marginScale));
    root.style.setProperty('--card-blur', `${theme.layout.cardBlur}px`);
    root.style.setProperty('--card-opacity', String(theme.layout.cardOpacity));
    root.style.setProperty('--card-font-size', `${theme.layout.cardFontSize}px`);
    root.style.setProperty('--card-font-color', theme.layout.cardFontColor);

    localStorage.setItem('kiddyassess-theme', JSON.stringify(theme));
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = (updates: Partial<AppTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => setTheme(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};
