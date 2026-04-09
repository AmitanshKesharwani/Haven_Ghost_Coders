import { useEffect, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import "./VantaBackground.css";

export default function VantaBackground({ variant = 'fixed' as 'fixed' | 'local' }) {
  const vantaRef = useRef<HTMLDivElement | null>(null);
  const vantaEffect = useRef<any>(null);
  const { currentTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Don't render any Vanta effect for WhatsApp theme - keep it plain
    if (currentTheme === 'whatsapp') {
      return;
    }

    // Lazy load Vanta.js to improve initial page load
    const loadVanta = async () => {
      if (!vantaEffect.current && vantaRef.current && !isLoaded) {
        try {
          // Dynamically import THREE and FOG for better performance
          const [THREE, { default: FOG }] = await Promise.all([
            import('three'),
            import('vanta/dist/vanta.fog.min')
          ]);

          setIsLoaded(true);

          // Ocean theme - Vanta.js FOG effect with darker tones
          if (currentTheme === 'ocean') {
            vantaEffect.current = FOG({
              el: vantaRef.current,
              THREE: THREE,
              minHeight: 200.0,
              minWidth: 200.0,
              highlightColor: 0xd4e8f7,    // Sky blue highlights
              midtoneColor: 0xffffff,     // Medium blue-teal
              lowlightColor: 0xb5d2e6,    // Darker blue-teal
              baseColor: 0xb5d2e6,        // Sidebar color as base (darkest)
              blurFactor: 0.35,            // High blur for dreamy cloud effect
              speed: 0.8,                 // Very slow, peaceful movement
              zoom: 1.5                   // Zoomed in for better cloud detail
            });
          }
          // Forest theme - Enhanced fog visibility
          else if (currentTheme === 'forest') {
            vantaEffect.current = FOG({
              el: vantaRef.current,
              THREE: THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              highlightColor: 0xf2f0e9,   // Light cream highlights - more contrast
              midtoneColor: 0xc2d4c8,     // Soft sage green midtones
              lowlightColor: 0xcfdcd1,    // Pale mint green lowlights
              baseColor: 0xc9d7cb,        // Base sage green
              blurFactor: 0.2,            // Reduced blur for more definition
              speed: 1.5,                 // Increased speed for more movement
              zoom: 0.8,                  // Zoomed out to see more fog patterns
              opacity: 0.9                // Higher opacity for visibility
            });
          }
        } catch (error) {
          console.warn('Failed to initialize Vanta effect:', error);
          // Apply fallback background
          if (vantaRef.current) {
            const element = vantaRef.current;
            if (currentTheme === 'ocean') {
              element.className += ' fallback-ocean';
            } else if (currentTheme === 'forest') {
              element.className += ' fallback-forest';
            }
          }
        }
      }
    };

    // Add a small delay to prioritize main content loading
    const timer = setTimeout(loadVanta, 100);
    return () => clearTimeout(timer);

    return () => {
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
          vantaEffect.current = null;
        } catch (error) {
          console.warn('Error destroying Vanta effect:', error);
        }
      }
    };
  }, [currentTheme, isLoaded]);

  // Don't render anything for WhatsApp theme
  if (currentTheme === 'whatsapp') {
    return null;
  }

  return (
    <div
      ref={vantaRef}
      className={`${variant === 'fixed' ? "vanta-background" : "vanta-background-local"}`}
    />
  );
}

