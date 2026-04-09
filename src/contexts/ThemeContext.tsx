import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'whatsapp' | 'forest' | 'ocean';

interface ThemeContextType {
  currentTheme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themes: {
    whatsapp: ThemeConfig;
    forest: ThemeConfig;
    ocean: ThemeConfig;
  };
}

interface ThemeConfig {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    sidebarBg?: string;
    chatBg?: string;
    sidebarText?: string;
  };
  gradients: {
    primary: string;
    background: string;
    card: string;
    sidebar?: string;
  };
  effects: {
    blur: string;
    shadow: string;
  };
}

const themes: { [key in ThemeType]: ThemeConfig } = {
  whatsapp: {
    name: 'whatsapp',
    displayName: 'WhatsApp',
    colors: {
      primary: '#00A884',        // WhatsApp green (new brand color)
      secondary: '#25D366',      // Classic WhatsApp green
      accent: '#128C7E',         // Darker WhatsApp green
      background: '#EFEAE2',     // WhatsApp chat background (beige)
      surface: '#FFFFFF',        // White surfaces
      text: '#111B21',           // Dark text
      textSecondary: '#667781',  // Gray secondary text
      border: '#D1D7DB',         // Light borders
      sidebarBg: '#F0F2F5',      // Sidebar background
      chatBg: '#EFEAE2',         // Chat area background
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00A884 0%, #25D366 100%)',
      background: 'url(/whatsapp-bg.svg)',  // WhatsApp doodle background pattern
      card: '#FFFFFF',           // White cards
      sidebar: '#F0F2F5',        // Light gray sidebar
    },
    effects: {
      blur: '',                  // No blur effects
      shadow: 'shadow-sm',       // Minimal shadows
    },
  },
  forest: {
    name: 'forest',
    displayName: 'Forest',
    colors: {
      primary: '#22C55E',
      secondary: '#16A34A',
      accent: '#84CC16',
      background: '#0F172A',
      surface: 'rgba(34, 197, 94, 0.05)',
      text: '#F8FAFC',
      textSecondary: 'rgba(248, 250, 252, 0.7)',
      border: 'rgba(34, 197, 94, 0.2)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F766E 100%)',
      card: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.1) 100%)',
    },
    effects: {
      blur: 'backdrop-blur-xl',
      shadow: 'shadow-2xl shadow-green-500/25',
    },
  },
  ocean: {
    name: 'ocean',
    displayName: 'Ocean',
    colors: {
      primary: '#ffffff',
      secondary: '#f0f9ff',
      accent: '#0ea5e9',
      background: 'transparent', // Let Vanta.js handle the background
      surface: 'rgba(255, 255, 255, 0.15)',
      text: '#1e293b',
      textSecondary: 'rgba(30, 41, 59, 0.8)',
      border: 'rgba(255, 255, 255, 0.3)',
      sidebarBg: '#326080',
      sidebarText: '#ffffff',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
      background: 'transparent', // Vanta.js will provide the background
      card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(240, 249, 255, 0.15) 100%)',
      sidebar: 'linear-gradient(180deg, #326080 0%, #2d5a7b 100%)',
    },
    effects: {
      blur: 'backdrop-blur-md',
      shadow: 'shadow-lg shadow-blue-200/30',
    },
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(() => {
    // Force WhatsApp theme - clear any saved theme
    localStorage.removeItem('haven-theme');
    localStorage.setItem('haven-theme', 'whatsapp');
    return 'whatsapp';
  });

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem('haven-theme', theme);
    
    // Apply CSS custom properties
    const root = document.documentElement;
    const themeConfig = themes[theme];
    
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    Object.entries(themeConfig.gradients).forEach(([key, value]) => {
      root.style.setProperty(`--gradient-${key}`, value);
    });

    // Apply body classes and styles for theme
    document.body.classList.remove('whatsapp-theme', 'forest-theme', 'ocean-theme');
    document.body.classList.add(`${theme}-theme`);
    
    // Apply theme-specific body styles
    document.body.style.color = themeConfig.colors.text;
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    
    // Set background - let Vanta.js handle ocean theme background
    if (theme === 'ocean') {
      document.body.style.background = 'transparent'; // Let Vanta.js handle it
    } else if (theme === 'whatsapp') {
      document.body.style.background = '#EFEAE2'; // WhatsApp beige background
    } else if (theme === 'forest') {
      document.body.style.background = themeConfig.gradients.background;
    } else {
      document.body.style.background = themeConfig.gradients.background;
    }
  };

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export type { ThemeConfig };