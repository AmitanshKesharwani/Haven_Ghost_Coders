// React Hook for Speech-to-Text using self-hosted backend
// Provides reactive speech recognition with real-time updates

import { useState, useEffect, useCallback } from 'react';
import { speechToTextService, type SpeechToTextResult, type SpeechToTextOptions } from '../services/speechToTextService';
import { toast } from 'sonner';

interface UseSpeechToTextReturn {
  // State
  isRecording: boolean;
  transcript: string;
  confidence: number;
  language: string;
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  startRecording: (options?: SpeechToTextOptions) => Promise<void>;
  stopRecording: () => void;
  clearTranscript: () => void;
  
  // Status
  isSupported: boolean;
}

export function useSpeechToText(): UseSpeechToTextReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if speech-to-text is supported
  const isSupported = typeof navigator !== 'undefined' && 
                     'mediaDevices' in navigator && 
                     'getUserMedia' in navigator.mediaDevices;

  // Handle transcription results
  const handleTranscript = useCallback((result: SpeechToTextResult) => {
    console.log('📝 Transcription received:', result);
    
    setTranscript(result.transcript);
    setConfidence(result.confidence);
    setLanguage(result.language);
    setIsProcessing(false);
    setError(null);
    
    // Show success toast
    if (result.transcript) {
      toast.success(`🎤 Transcribed: "${result.transcript.substring(0, 50)}${result.transcript.length > 50 ? '...' : ''}"`);
    }
  }, []);

  // Handle errors
  const handleError = useCallback((err: Error) => {
    console.error('❌ Speech-to-text error:', err);
    
    const errorMessage = err.message;
    setError(errorMessage);
    setIsRecording(false);
    setIsProcessing(false);
    
    // Show user-friendly error messages
    if (errorMessage.includes('not-allowed') || errorMessage.includes('permission')) {
      toast.error('🎤 Microphone permission denied. Please allow microphone access.');
    } else if (errorMessage.includes('not supported') || errorMessage.includes('unavailable')) {
      toast.error('🚫 Speech recognition not supported in this browser. Try Chrome or Edge.');
    } else if (errorMessage.includes('network') || errorMessage.includes('API')) {
      toast.error('🌐 Network error. Please check your internet connection.');
    } else {
      toast.error(`Speech recognition failed: ${errorMessage}`);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    speechToTextService.onTranscript(handleTranscript);
    speechToTextService.onError(handleError);

    return () => {
      speechToTextService.cleanup();
    };
  }, [handleTranscript, handleError]);

  // Start recording function
  const startRecording = useCallback(async (options: SpeechToTextOptions = {}) => {
    if (!isSupported) {
      const error = new Error('Speech-to-text is not supported in this browser');
      handleError(error);
      return;
    }

    try {
      setError(null);
      setIsRecording(true);
      setIsProcessing(false);
      
      // Get optimal options or use provided ones
      const optimalOptions = speechToTextService.getOptimalLanguageSettings();
      const finalOptions: SpeechToTextOptions = {
        ...optimalOptions,
        ...options
      };

      console.log('🎤 Starting recording with options:', finalOptions);
      console.log('🔧 Service status:', speechToTextService.getStatus());
      
      await speechToTextService.startRecording(finalOptions);
      
      toast.info('🎤 Recording started - speak now!');
      
    } catch (err) {
      handleError(err as Error);
    }
  }, [isSupported, handleError]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      
      speechToTextService.stopRecording();
      
      toast.info('🔄 Processing speech...');
      console.log('🛑 Stopped recording, processing audio');
    }
  }, [isRecording]);

  // Clear transcript function
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setLanguage('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        speechToTextService.stopRecording();
      }
    };
  }, [isRecording]);

  return {
    // State
    isRecording,
    transcript,
    confidence,
    language,
    isProcessing,
    error,
    
    // Actions
    startRecording,
    stopRecording,
    clearTranscript,
    
    // Status
    isSupported
  };
}

export default useSpeechToText;