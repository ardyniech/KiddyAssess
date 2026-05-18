import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppTheme {
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
  primaryColor: '#38bdf8',
  light: {
    textMain: '#0f172a',
    textMuted: '#64748b',
    background: '#f8fafc',
    cardBg: 'rgba(255, 255, 255, 0.7)',
    aspectTitle: '#0f172a',
    indicatorText: '#64748b',
  },
  dark: {
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    background: '#020617',
    cardBg: 'rgba(15, 23, 42, 0.5)',
    aspectTitle: '#f8fafc',
    indicatorText: '#94a3b8',
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

  useEffect(() => {
    const root = document.documentElement;
    
    // Primary
    root.style.setProperty('--color-primary', theme.primaryColor);
    
    // Light Group
    root.style.setProperty('--light-text-main', theme.light.textMain);
    root.style.setProperty('--light-text-muted', theme.light.textMuted);
    root.style.setProperty('--light-bg', theme.light.background);
    root.style.setProperty('--light-card-bg', theme.light.cardBg);
    root.style.setProperty('--light-aspect-title', theme.light.aspectTitle);
    root.style.setProperty('--light-indicator-text', theme.light.indicatorText);

    // Dark Group
    root.style.setProperty('--dark-text-main', theme.dark.textMain);
    root.style.setProperty('--dark-text-muted', theme.dark.textMuted);
    root.style.setProperty('--dark-bg', theme.dark.background);
    root.style.setProperty('--dark-card-bg', theme.dark.cardBg);
    root.style.setProperty('--dark-aspect-title', theme.dark.aspectTitle);
    root.style.setProperty('--dark-indicator-text', theme.dark.indicatorText);

    // Global
    root.style.setProperty('--app-radius', theme.borderRadius);
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

    localStorage.setItem('kiddyassess-theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (updates: Partial<AppTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => setTheme(defaultTheme);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within ThemeProvider');
  return context;
};
