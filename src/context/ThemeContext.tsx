import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSchoolProfile } from '../services/settingsService';

export interface AppTheme {
  appearance: 'light';
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
  appearance: 'light',
  isMonochrome: false,
  primaryColor: '#000000',
  light: {
    textMain: '#000000',
    textMuted: '#666666',
    background: '#ffffff',
    cardBg: '#ffffff',
    aspectTitle: '#000000',
    indicatorText: '#333333',
  },
  gradients: {
    from: '#ffffff',
    via: '#fcfcfc',
    to: '#ffffff',
  },
  layout: {
    paddingScale: 1,
    marginScale: 1,
    cardOpacity: 1,
    cardBlur: 0,
    cardFontSize: 14,
    cardFontColor: '#000000',
  },
  content: {
    bannerTitle: 'Assessment Digital Praktis',
    bannerSubtitle: 'Sistem Penilaian Anak Usia Dini Berbasis Naratif untuk Guru yang Mengutamakan Efisiensi dan Ketelitian.',
  },
  borderRadius: '16px',
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  glassOpacity: 1,
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
        appearance: 'light'
      };
    } catch (e) {
      return defaultTheme;
    }
  });

  const [resolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    // Always Light
    root.classList.remove('dark');
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
      }
    } : theme;

    // FETCH ATOMIC SETTINGS FROM DB
    const syncWithProfile = async () => {
        const profile = await getSchoolProfile();
        
        const accent = profile?.accentColor || effectiveTheme.primaryColor;
        root.style.setProperty('--color-primary', accent);
        
        const cardBg = profile?.cardBackgroundColor || '#ffffff';
        root.style.setProperty('--card-bg', cardBg);
        
        const radiusMap: Record<string, string> = {
            none: '0px',
            small: '8px',
            medium: '16px',
            large: '24px',
            full: '9999px'
        };
        const borderRadius = profile?.borderRadius 
            ? (radiusMap[profile.borderRadius] || profile.borderRadius) 
            : effectiveTheme.borderRadius;
        root.style.setProperty('--app-radius', borderRadius);

        if (profile?.cardGlassmorphism === false) {
            root.style.setProperty('--card-blur', '0px');
            root.style.setProperty('--card-opacity', '1');
        } else {
            root.style.setProperty('--card-blur', `${theme.layout.cardBlur}px`);
            root.style.setProperty('--card-opacity', String(theme.layout.cardOpacity));
        }

        // Font Family
        root.style.setProperty('--font-family', theme.fontFamily);
        root.style.setProperty('--base-font-size', `${theme.systemFontSize}px`);
    };

    syncWithProfile();
    window.addEventListener('app-settings-updated', syncWithProfile);
    
    // Light Group mapping (Sync)
    root.style.setProperty('--light-text-main', effectiveTheme.light.textMain);
    root.style.setProperty('--light-text-muted', effectiveTheme.light.textMuted);
    root.style.setProperty('--light-bg', effectiveTheme.light.background);
    root.style.setProperty('--light-card-bg', effectiveTheme.light.cardBg);
    root.style.setProperty('--light-aspect-title', effectiveTheme.light.aspectTitle);
    root.style.setProperty('--light-indicator-text', effectiveTheme.light.indicatorText);

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

    localStorage.setItem('kiddyassess-theme', JSON.stringify({ ...theme, appearance: 'light' }));
    
    return () => {};
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
