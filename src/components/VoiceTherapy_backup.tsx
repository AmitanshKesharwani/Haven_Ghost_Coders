// Backup of the original VoiceTherapy component
// This file contains the theme-aware background implementation
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, RotateCcw, Heart, CheckCircle, ArrowRight, Home } from 'lucide-react';
import { AVAILABLE_VOICES, type VoiceOption } from '../services/speechServices';
import { useAuth } from './auth/AuthProvider';
import { firebaseService } from '../services/firebaseService';
import { httpsCallable, getFunctions } from 'firebase/functions';
import { useTheme } from '../contexts/ThemeContext';
import VantaBackground from './VantaBackground';

// Component implementation will be restored from working backup
export default function VoiceTherapy() {
  const { currentTheme } = useTheme();

  return (
    <div className={`min-h-screen relative overflow-hidden ${currentTheme === 'whatsapp'
      ? 'bg-[#EFEAE2]'
      : '' // VantaBackground will handle ocean and forest
      }`}>
      {/* Use VantaBackground for ocean and forest themes */}
      {(currentTheme === 'ocean' || currentTheme === 'forest') && (
        <VantaBackground variant="fixed" />
      )}

      {/* Plain background orbs only for WhatsApp theme */}
      {currentTheme === 'whatsapp' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00A884]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#25D366]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-[#00A884]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      )}

      {/* Content Container - positioned above VantaBackground */}
      <div className="relative z-10">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 ${currentTheme === 'ocean'
              ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
              : currentTheme === 'forest'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : currentTheme === 'whatsapp'
                  ? 'bg-gradient-to-br from-[#00A884] to-[#25D366]'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
              <Mic className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h1 className={`text-2xl md:text-4xl font-bold mb-3 md:mb-4 ${currentTheme === 'ocean'
              ? 'text-white'
              : currentTheme === 'forest'
                ? 'text-gray-900'
                : currentTheme === 'whatsapp'
                  ? 'text-gray-900'
                  : 'text-gray-900'
              }`}>Voice Therapy</h1>
            <p className={`text-base md:text-xl max-w-2xl mx-auto px-4 ${currentTheme === 'ocean'
              ? 'text-white/80'
              : currentTheme === 'forest'
                ? 'text-gray-600'
                : currentTheme === 'whatsapp'
                  ? 'text-gray-600'
                  : 'text-gray-600'
              }`}>
              Choose a guided voice exercise to improve your emotional well-being and self-expression
            </p>
          </div>

          {/* Placeholder for voice therapy content */}
          <div className={`p-8 rounded-xl text-center ${currentTheme === 'ocean'
            ? 'bg-white/20 backdrop-blur-md border border-white/30 text-white'
            : currentTheme === 'forest'
              ? 'bg-white shadow-lg border border-green-200 text-gray-900'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-lg border border-[#00A884]/20 text-gray-900'
                : 'bg-white shadow-lg border border-gray-200 text-gray-900'
            }`}>
            <h2 className="text-xl font-semibold mb-4">Voice Therapy Features</h2>
            <p className="mb-4">The full Voice Therapy component will be restored from backup.</p>
            <p className="text-sm opacity-75">Theme-aware background integration is now working correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}