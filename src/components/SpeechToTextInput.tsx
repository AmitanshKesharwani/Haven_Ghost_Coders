// Reactive Speech-to-Text Input Component with Google Chirp 3 HD
// Provides real-time speech recognition with multilingual support

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Languages, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { speechToTextService } from '../services/speechToTextService';
import { toast } from 'sonner';

interface SpeechToTextInputProps {
  onTranscript?: (transcript: string, confidence: number) => void;
  onLanguageChange?: (language: string) => void;
  placeholder?: string;
  className?: string;
  showLanguageSelector?: boolean;
  showConfidence?: boolean;
  autoStart?: boolean;
  defaultLanguage?: string;
  disabled?: boolean;
}

export const SpeechToTextInput: React.FC<SpeechToTextInputProps> = ({
  onTranscript,
  onLanguageChange,
  placeholder = "Click the microphone to start speaking...",
  className = "",
  showLanguageSelector = true,
  showConfidence = true,
  autoStart = false,
  defaultLanguage = 'en-IN',
  disabled = false
}) => {
  const {
    isRecording,
    transcript,
    confidence,
    language,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported
  } = useSpeechToText();

  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'error'>('idle');

  // Get supported languages
  const supportedLanguages = speechToTextService.getSupportedLanguages();

  // Update status based on hook state
  useEffect(() => {
    if (error) {
      setStatus('error');
    } else if (isProcessing) {
      setStatus('processing');
    } else if (isRecording) {
      setStatus('listening');
    } else if (transcript) {
      setStatus('success');
    } else {
      setStatus('idle');
    }
  }, [isRecording, isProcessing, transcript, error]);

  // Call onTranscript callback when transcript changes
  useEffect(() => {
    if (transcript && onTranscript) {
      onTranscript(transcript, confidence);
    }
  }, [transcript, confidence, onTranscript]);

  // Call onLanguageChange callback when language changes
  useEffect(() => {
    if (language && onLanguageChange) {
      onLanguageChange(language);
    }
  }, [language, onLanguageChange]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && isSupported && !disabled) {
      handleStartRecording();
    }
  }, [autoStart, isSupported, disabled]);

  // Handle start recording
  const handleStartRecording = async () => {
    if (disabled || !isSupported) return;

    try {
      const options = speechToTextService.getOptimalLanguageSettings();
      options.language = selectedLanguage;
      
      await startRecording(options);
      toast.success(`🎤 Listening in ${supportedLanguages.find(l => l.code === selectedLanguage)?.name || 'selected language'}`);
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start speech recognition');
    }
  };

  // Handle stop recording
  const handleStopRecording = () => {
    stopRecording();
  };

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    setShowLanguageDropdown(false);
    
    const langName = supportedLanguages.find(l => l.code === langCode)?.name || langCode;
    toast.info(`🌍 Language changed to ${langName}`);
  };

  // Handle clear transcript
  const handleClear = () => {
    clearTranscript();
    setStatus('idle');
  };

  // Get status icon and color
  const getStatusDisplay = () => {
    switch (status) {
      case 'listening':
        return { icon: Mic, color: 'text-red-500', bgColor: 'bg-red-50', pulse: true };
      case 'processing':
        return { icon: Loader2, color: 'text-blue-500', bgColor: 'bg-blue-50', pulse: false };
      case 'success':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50', pulse: false };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50', pulse: false };
      default:
        return { icon: MicOff, color: 'text-gray-500', bgColor: 'bg-gray-50', pulse: false };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  if (!isSupported) {
    return (
      <div className={`p-4 border border-red-200 rounded-lg bg-red-50 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Speech recognition not supported</span>
        </div>
        <p className="text-sm text-red-500 mt-1">
          Please use a modern browser with microphone support.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Input Area */}
      <div className={`
        border-2 rounded-lg p-4 transition-all duration-200
        ${status === 'listening' ? 'border-red-300 bg-red-50' : 
          status === 'processing' ? 'border-blue-300 bg-blue-50' :
          status === 'success' ? 'border-green-300 bg-green-50' :
          status === 'error' ? 'border-red-300 bg-red-50' :
          'border-gray-200 bg-white hover:border-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}>
        
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Microphone Button */}
            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={disabled || isProcessing}
              className={`
                p-2 rounded-full transition-all duration-200
                ${statusDisplay.bgColor} ${statusDisplay.color}
                ${statusDisplay.pulse ? 'animate-pulse' : ''}
                ${disabled ? 'cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
              `}
            >
              <StatusIcon className={`w-5 h-5 ${status === 'processing' ? 'animate-spin' : ''}`} />
            </button>

            {/* Status Text */}
            <div className="flex flex-col">
              <span className={`text-sm font-medium ${statusDisplay.color}`}>
                {status === 'listening' ? 'Listening...' :
                 status === 'processing' ? 'Processing...' :
                 status === 'success' ? 'Transcribed' :
                 status === 'error' ? 'Error' :
                 'Ready to listen'}
              </span>
              {showConfidence && confidence > 0 && (
                <span className="text-xs text-gray-500">
                  Confidence: {Math.round(confidence * 100)}%
                </span>
              )}
            </div>
          </div>

          {/* Language Selector */}
          {showLanguageSelector && (
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                disabled={disabled}
                className="flex items-center gap-1 px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors"
              >
                <Languages className="w-4 h-4" />
                <span>{supportedLanguages.find(l => l.code === selectedLanguage)?.nativeName || 'EN'}</span>
              </button>

              {/* Language Dropdown */}
              {showLanguageDropdown && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {supportedLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`
                        w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors
                        ${selectedLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}
                      `}
                    >
                      <div className="font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transcript Display */}
        <div className="min-h-[60px]">
          {transcript ? (
            <div className="space-y-2">
              <div className="p-3 bg-white rounded border text-gray-800">
                {transcript}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Volume2 className="w-4 h-4" />
                  <span>Language: {supportedLanguages.find(l => l.code === language)?.name || language}</span>
                </div>
                <button
                  onClick={handleClear}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60px] text-gray-500">
              {error ? (
                <div className="text-center">
                  <AlertCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : (
                <p className="text-sm">{placeholder}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showLanguageDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowLanguageDropdown(false)}
        />
      )}
    </div>
  );
};

export default SpeechToTextInput;