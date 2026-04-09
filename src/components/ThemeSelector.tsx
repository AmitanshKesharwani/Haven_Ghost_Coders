import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Check, Palette } from 'lucide-react';
import { useTheme, type ThemeType } from '../contexts/ThemeContext';

interface ThemeSelectorProps {
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
  onThemeChange?: (theme: ThemeType) => void;
  previewMode?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  showTitle = true, 
  compact = false,
  className = "",
  onThemeChange,
  previewMode = false
}) => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [previewTheme, setPreviewTheme] = React.useState<ThemeType | null>(null);
  
  const displayTheme = previewMode && previewTheme ? previewTheme : currentTheme;

  const themeOptions: { key: ThemeType; icon: string; description: string }[] = [
    {
      key: 'whatsapp',
      icon: '💬',
      description: 'Modern dark theme with green accents'
    },
    {
      key: 'forest',
      icon: '🌲',
      description: 'Natural green theme inspired by forests'
    },
    {
      key: 'ocean',
      icon: '🌊',
      description: 'Calming blue theme inspired by the ocean'
    }
  ];

  if (compact) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {themeOptions.map((option) => (
          <Button
            key={option.key}
            variant={displayTheme === option.key ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (previewMode) {
                setPreviewTheme(option.key);
                onThemeChange?.(option.key);
              } else {
                setTheme(option.key);
              }
            }}
            className={`relative ${
              displayTheme === option.key 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400' 
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            <span className="mr-2">{option.icon}</span>
            {themes[option.key].displayName}
            {displayTheme === option.key && (
              <Check className="w-4 h-4 ml-2" />
            )}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Choose Your Theme</h3>
          {previewMode && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Preview Mode
            </span>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themeOptions.map((option) => {
          const isSelected = displayTheme === option.key;
          const themeConfig = themes[option.key];
          
          return (
            <Card
              key={option.key}
              className={`relative p-4 cursor-pointer transition-all duration-300 border-2 ${
                isSelected
                  ? currentTheme === 'ocean'
                    ? 'border-blue-400 ocean-card'
                    : 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50'
                  : currentTheme === 'ocean'
                    ? 'ocean-card hover:border-blue-300'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (previewMode) {
                  setPreviewTheme(option.key);
                  onThemeChange?.(option.key);
                } else {
                  setTheme(option.key);
                }
              }}
            >
              {/* Theme Preview */}
              <div 
                className="w-full h-20 rounded-lg mb-3 relative overflow-hidden"
                style={{ 
                  background: option.key === 'whatsapp' 
                    ? '#EFEAE2' // WhatsApp beige background
                    : option.key === 'forest'
                      ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F766E 100%)' // Forest gradient
                      : option.key === 'ocean'
                        ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)' // Ocean-like gradient
                        : themeConfig.gradients.background
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ background: themeConfig.gradients.primary }}
                  />
                </div>
                <div className="absolute top-2 right-2">
                  <span className="text-2xl">{option.icon}</span>
                </div>
                {/* Add some theme-specific visual elements */}
                {option.key === 'forest' && (
                  <div className="absolute top-1 left-2">
                    <div className="w-3 h-4 bg-green-400 rounded-sm transform rotate-12 opacity-60"></div>
                  </div>
                )}
                {option.key === 'ocean' && (
                  <div className="absolute bottom-2 left-2">
                    <div className="w-4 h-2 bg-blue-200 rounded-full opacity-70"></div>
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="flex items-center justify-between mb-2">
                <h4 className={`font-semibold ${
                  currentTheme === 'ocean' ? 'ocean-text-primary' : 'text-gray-900'
                }`}>{themeConfig.displayName}</h4>
                <div className="flex items-center gap-2">
                  {previewMode && previewTheme === option.key && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Preview
                    </span>
                  )}
                  {isSelected && (
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <p className={`text-sm ${
                currentTheme === 'ocean' ? 'ocean-text-secondary' : 'text-gray-600'
              }`}>{option.description}</p>

              {/* Color Palette Preview */}
              <div className="flex gap-1 mt-3">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ 
                    backgroundColor: option.key === 'whatsapp' 
                      ? '#00A884' // WhatsApp green
                      : option.key === 'forest'
                        ? '#22C55E' // Forest green
                        : option.key === 'ocean'
                          ? '#0ea5e9' // Ocean blue
                          : themeConfig.colors.primary
                  }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ 
                    backgroundColor: option.key === 'whatsapp' 
                      ? '#25D366' // WhatsApp secondary green
                      : option.key === 'forest'
                        ? '#16A34A' // Forest secondary green
                        : option.key === 'ocean'
                          ? '#ffffff' // Ocean white
                          : themeConfig.colors.secondary
                  }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-gray-200"
                  style={{ 
                    backgroundColor: option.key === 'whatsapp' 
                      ? '#128C7E' // WhatsApp accent
                      : option.key === 'forest'
                        ? '#84CC16' // Forest accent lime
                        : option.key === 'ocean'
                          ? '#f0f9ff' // Ocean light blue
                          : themeConfig.colors.accent
                  }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};