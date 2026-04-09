import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      toast.success('Connection restored!');
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      toast.error('Connection lost. Please check your network.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show status initially if offline
    if (!navigator.onLine) {
      setShowStatus(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500/20 border-green-500/30 text-green-100' 
        : 'bg-red-500/20 border-red-500/30 text-red-100'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? (
          <Wifi className="w-5 h-5 text-green-400" />
        ) : (
          <WifiOff className="w-5 h-5 text-red-400" />
        )}
        <span className="text-sm font-medium">
          {isOnline ? 'Connected' : 'No Internet Connection'}
        </span>
      </div>
      {!isOnline && (
        <div className="mt-2 text-xs text-red-200">
          Please check your network settings or proxy configuration
        </div>
      )}
    </div>
  );
};