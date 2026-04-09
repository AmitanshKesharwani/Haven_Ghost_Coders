import { useEffect, useRef } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - startTime.current;
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${componentName} loaded in ${loadTime}ms`);
      
      // Warn if loading takes too long
      if (loadTime > 1000) {
        console.warn(`⚠️ ${componentName} took ${loadTime}ms to load (>1s)`);
      }
    }
  }, [componentName]);

  return {
    markStart: () => {
      startTime.current = Date.now();
    },
    markEnd: (label?: string) => {
      const duration = Date.now() - startTime.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`⚡ ${componentName}${label ? ` - ${label}` : ''}: ${duration}ms`);
      }
      return duration;
    }
  };
};