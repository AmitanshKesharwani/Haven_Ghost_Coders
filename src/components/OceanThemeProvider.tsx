import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const OceanThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { currentTheme } = useTheme();

  useEffect(() => {
    // Remove all theme classes first
    document.body.classList.remove('ocean-theme', 'forest-theme', 'whatsapp-theme');
    
    if (currentTheme === 'ocean') {
      // Apply ocean-specific styles to body
      document.body.style.background = 'linear-gradient(135deg, #0a1628 0%, #1e293b 50%, #334155 100%)';
      document.body.style.color = '#f8fafc';
      document.body.classList.add('ocean-theme');
    } else if (currentTheme === 'forest') {
      // Apply forest-specific styles to body - transparent to show Vanta fog
      document.body.style.background = 'transparent';
      document.body.style.color = '#2d4a2d';
      document.body.classList.add('forest-theme');
    } else if (currentTheme === 'whatsapp') {
      // Apply WhatsApp theme
      document.body.style.background = 'linear-gradient(135deg, #0B141A 0%, #1F2937 50%, #111827 100%)';
      document.body.style.color = '#000000';
      document.body.classList.add('whatsapp-theme');
    } else {
      // Default theme
      document.body.style.background = '';
      document.body.style.color = '';
    }

    return () => {
      document.body.classList.remove('ocean-theme', 'forest-theme', 'whatsapp-theme');
    };
  }, [currentTheme]);

  return <>{children}</>;
};