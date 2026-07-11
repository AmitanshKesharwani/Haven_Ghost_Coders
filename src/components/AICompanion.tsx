import React, { useState, useEffect, useRef, useCallback } from 'react'; // Added useCallback
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Send, User, Heart, AlertTriangle, Phone, Mic, MicOff, Video, VideoOff, List, MessageSquarePlus, Loader2, Volume2, Trash2 } from 'lucide-react'; // Added icons
import type { Screen, UserData } from '../types';
import { type AIResponse } from '../services/googleCloudAI';
import { aiOrchestrator, type ActivityRecommendation, type ConversationContext } from '../services/aiOrchestrator';
import { evaluateCrisis, shouldShowCrisisResources } from '../utils/crisisDetection';
import { useAuth } from './auth/AuthProvider';
import { useFirebaseSession } from '../hooks/useFirebaseSession';

import { emotionDetection } from '../services/emotionDetection';
import { havenSpeak, havenSpeakStop } from '../services/havenTTS';
import { HavenSTT } from '../services/havenSTT';
import { toast } from 'sonner';
import { type ChatConversation, type ChatMessage } from '../services/supabaseService';
import { createConversation, addMessage, getConversationMessages, getUserConversations, clearAllChatHistory } from '../services/localChatStorage';
import { X } from 'lucide-react';
import { AVAILABLE_VOICES, type VoiceOption } from '../services/speechServices';

// Function to strip markdown for voice reading
const stripMarkdownForVoice = (text: string): string => {
  return text
    // Remove bold markers
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code markers
    .replace(/`(.*?)`/g, '$1')
    // Handle headings
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    // Convert bullet points to "bullet point"
    .replace(/^[-•]\s*/gm, '• ')
    // Convert numbered lists to "step"
    .replace(/^(\d+)\.\s*/gm, 'Step $1: ')
    // Remove markdown links, keep only text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove strikethrough
    .replace(/~~(.*?)~~/g, '$1')
    // Remove blockquotes
    .replace(/^>\s*/gm, '')
    // Clean up extra spaces and line breaks
    .replace(/\s+/g, ' ')
    .trim();
};

// ── TTS: Haven AI backend with browser fallback ─────────────────────────────
// havenSpeak() is imported from '../services/havenTTS'
// Usage: await havenSpeak(text, languageCode, rate)

// ── STT: Haven AI backend with browser fallback ─────────────────────────────
// HavenSTT is imported from '../services/havenSTT'
// Usage: sttInstance.start(lang, onResult, onError) / sttInstance.stop()

// Simple markdown renderer component
const MarkdownRenderer = ({ content }: { content: string }) => {
  const formatText = (text: string) => {
    // Split by line breaks and process each line
    return text.split('\n').map((line, index) => {
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={index} className="flex items-start space-x-3 my-3">
            <span className="text-primary mt-1 font-bold text-xl">•</span>
            <span className="flex-1 text-lg font-semibold leading-relaxed text-foreground">{formatInlineText(line.replace(/^[-•]\s*/, ''))}</span>
          </div>
        );
      }

      // Handle numbered lists
      if (line.trim().match(/^\d+\.\s/)) {
        return (
          <div key={index} className="flex items-start space-x-3 my-3">
            <span className="text-primary font-bold mt-1 text-lg">{line.match(/^\d+\./)?.[0]}</span>
            <span className="flex-1 text-lg font-semibold leading-relaxed text-foreground">{formatInlineText(line.replace(/^\d+\.\s*/, ''))}</span>
          </div>
        );
      }

      // Handle regular paragraphs
      if (line.trim()) {
        return (
          <p key={index} className="my-3 text-lg leading-relaxed font-semibold text-foreground">
            {formatInlineText(line)}
          </p>
        );
      }

      // Empty lines
      return <br key={index} />;
    });
  };

  const formatInlineText = (text: string) => {
    // Handle bold text **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground text-lg">$1</strong>');

    // Handle italic text *text*
    text = text.replace(/\*(.*?)\*/g, '<em class="italic text-foreground font-semibold text-lg">$1</em>');

    // Handle code `text`
    text = text.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');

    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return <div className="prose prose-lg max-w-none text-lg leading-relaxed font-semibold">{formatText(content)}</div>;
};


interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  language: string;
  emotionalIndicators: {
    tone: string;
    intensity: number;
    speechRate: string;
    volume: string;
  };
  linguisticFeatures: {
    wordCount: number;
    sentimentScore: number;
    complexityScore: number;
    hesitationMarkers: number;
  };
}

interface EmotionAnalysis {
  faceDetected: boolean;
  emotions: {
    joy: number;
    sorrow: number;
    anger: number;
    surprise: number;
    fear: number;
    disgust: number;
  };
  primary_emotion: string;
  confidence: number;
  wellness_indicators: {
    stress_level: number;
    energy_level: number;
    engagement_level: number;
  };
  facialFeatures: {
    eyeContact: boolean;
    facialTension: number;
    microExpressions: string[];
  };
}

interface AICompanionProps {
  navigateTo?: (screen: Screen) => void;
  userData?: UserData;
}

// Message interface removed - now using ChatMessage from firebaseService

export function AICompanion({ navigateTo, userData }: AICompanionProps = {}) {
  // --- STATE MODIFICATIONS ---
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Use ChatMessage type
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [voiceResponseEnabled, setVoiceResponseEnabled] = useState(true);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionAnalysis | null>(null);

  // *** NEW STATE ***
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationList, setConversationList] = useState<ChatConversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showConversationList, setShowConversationList] = useState(false); // For sidebar toggle
  const [currentRecommendations, setCurrentRecommendations] = useState<ActivityRecommendation[]>([]);
  
  // *** VOICE SELECTION STATE ***
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(AVAILABLE_VOICES[0]); // Default to first voice
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  
  // *** END NEW STATE ***

  const { currentUser, userProfile } = useAuth();
  const {
    isSessionActive,
    startSession,
    addInteraction,
    addEmotionalDataPoint,
    recordCrisisEvent
  } = useFirebaseSession(); // Keep using this for analytics logging

  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messageListenerUnsubscribeRef = useRef<(() => void) | null>(null); // Ref for message listener

  // --- REVISED stopVoiceResponse function ---
  const stopVoiceResponse = () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsVoicePlaying(false); // Force state update
    } catch (error) {
      console.error('Error stopping voice:', error);
      setIsVoicePlaying(false);
    }
  };



  // --- Language Detection Helper ---
  const detectLanguageFromMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Check for Hindi/Devanagari script
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(message)) {
      // Check if it's mixed with English
      const englishPattern = /[a-zA-Z]/;
      if (englishPattern.test(message)) {
        return 'hinglish/mixed';
      }
      return 'hindi';
    }
    
    // Check for other Indian language scripts
    const bengaliPattern = /[\u0980-\u09FF]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    
    if (bengaliPattern.test(message)) return 'bengali';
    if (tamilPattern.test(message)) return 'tamil';
    if (teluguPattern.test(message)) return 'telugu';
    if (gujaratiPattern.test(message)) return 'gujarati';
    
    // Check for common Hindi/Hinglish words in English script
    const hinglishWords = ['hai', 'hoon', 'kya', 'aur', 'mein', 'main', 'kar', 'kaise', 'kya', 'nahi', 'haan', 'theek', 'accha', 'bhai', 'yaar'];
    const hasHinglishWords = hinglishWords.some(word => lowerMessage.includes(word));
    
    if (hasHinglishWords) {
      return 'hinglish/mixed';
    }
    
    // Default to English
    return 'english';
  };

  // --- Language Mapping Helper ---
  const mapDetectedLanguageToTtsCode = (detectedLang: string | undefined): string => {
    const langMap: { [key: string]: string } = {
      "hindi": "hi-IN",
      "bengali": "bn-IN",
      "marathi": "mr-IN",
      "telugu": "te-IN",
      "tamil": "ta-IN",
      "gujarati": "gu-IN",
      "kannada": "kn-IN",
      "malayalam": "ml-IN",
      "urdu": "ur-IN",
      "punjabi": "pa-IN",
      "odia": "or-IN",
      "assamese": "as-IN",
      "english": "en-IN", // Default to Indian English
      "hinglish": "en-IN", // Use Indian English for Hinglish playback
      "hinglish/mixed": "en-IN", // Handle the exact format from AI
      "mixed": "en-IN",    // Use Indian English for Mixed playback
      "unknown": "en-IN",  // Default fallback
    };
    // Default to en-IN if language is undefined or not in map
    return langMap[(detectedLang || 'english').toLowerCase()] || 'en-IN';
  };
  // --- End Helper ---

  // --- UPDATED: Read Aloud function ---
  const handleReadAloud = async (message: ChatMessage) => { // Accept the full message object
    if (isVoicePlaying) {
      stopVoiceResponse();
      return;
    }

    const textToRead = message.content;
    if (!textToRead) return;

    // *** GET LANGUAGE FROM MESSAGE METADATA ***
    const detectedLanguageName = message.metadata?.detectedLanguage;
    const languageCode = mapDetectedLanguageToTtsCode(detectedLanguageName);
    // *** END GET LANGUAGE ***

    try {
      const cleanMessage = stripMarkdownForVoice(textToRead);
      console.log(`Using Haven TTS for Read Aloud (Lang: ${selectedVoice.language})...`);
      setIsVoicePlaying(true);
      await havenSpeak(cleanMessage, selectedVoice.language, selectedVoice.rate);
      setIsVoicePlaying(false);
    } catch (error: any) {
      console.error("Error during Read Aloud TTS:", error);
      toast.error(`AI Voice failed: ${error.message || 'Could not synthesize speech'}`);
      setIsVoicePlaying(false);
    }
  };
  // Debug: Log userData and API key status
  console.log('🔍 AICompanion Debug:', {
    userData: userProfile || userData,
    hasUserData: !!(userProfile || userData),
    currentUser: currentUser?.id,
    apiKey: import.meta.env.VITE_GROQ_API_KEY ? 'Present' : 'Missing',
    apiKeyLength: import.meta.env.VITE_GROQ_API_KEY?.length || 0
  });

  // Crisis helplines for India - Government Approved Only
  const crisisHelplines = [
    { name: 'KIRAN Mental Health (Govt. of India)', number: '1800-599-0019', available: '24/7 Toll-Free' },
    { name: 'Tele MANAS (Govt. of India)', number: '14416', available: '24/7 Toll-Free' },
    { name: 'NIMHANS Helpline (Govt. of India)', number: '08046110007', available: '24/7' }
  ];

  // Removed buildMentalHealthContext - now using simpler context directly in functions

  // Handle voice input with continuous speech recognition
  // --- REVISED handleVoiceInput function ---
  const handleVoiceInput = async () => {
    if (isVoiceMode) {
      // Stop recording
      if (mediaRecorderRef.current && (mediaRecorderRef.current as any).stop) {
        (mediaRecorderRef.current as any).stop();
      }
      setIsVoiceMode(false);
      console.log('Voice recording stopped manually.');
      return;
    }

    try {
      // --- Determine Language Codes ---
      const activeUserData = userProfile || userData;
      const userLanguagePref = (activeUserData?.preferences as any)?.language || 'mixed';

      let languageCode = 'en-IN'; // Default primary

      const prefLower = userLanguagePref.toLowerCase();
      if (prefLower.startsWith('hi')) { // Hindi
        languageCode = 'hi-IN';
      } else if (prefLower.startsWith('en')) { // English
        languageCode = 'en-IN';
      } else if (prefLower.startsWith('bn')) { // Bengali
        languageCode = 'bn-IN';
      } else if (prefLower.startsWith('mr')) { // Marathi
        languageCode = 'mr-IN';
      } else if (prefLower.startsWith('te')) { // Telugu
        languageCode = 'te-IN';
      } else if (prefLower.startsWith('ta')) { // Tamil
        languageCode = 'ta-IN';
      } else if (prefLower.startsWith('gu')) { // Gujarati
        languageCode = 'gu-IN';
      } else if (prefLower.startsWith('kn')) { // Kannada
        languageCode = 'kn-IN';
      } else if (prefLower.startsWith('ml')) { // Malayalam
        languageCode = 'ml-IN';
      } else if (prefLower.startsWith('ur')) { // Urdu
        languageCode = 'ur-IN';
      } else if (prefLower.startsWith('pa')) { // Punjabi
        languageCode = 'pa-IN';
      } else if (prefLower.startsWith('or')) { // Odia
        languageCode = 'or-IN';
      } else if (prefLower.startsWith('as')) { // Assamese
        languageCode = 'as-IN';
      } else { // 'mixed' or default
        languageCode = 'en-IN'; 
      }
      // --- End Language Code Determination ---

      console.log(`Using Haven STT (Lang: ${languageCode})...`);
      setIsVoiceMode(true);
      setInputValue("Listening... / सुन रहा हूँ...");

      const sttInstance = new HavenSTT();
      await sttInstance.start(
        languageCode,
        (result) => {
          console.log(`Transcription received (Conf: ${result.confidence.toFixed(2)}):`, result.transcript);
          if (result.transcript) {
            setInputValue(result.transcript);
          } else {
            setInputValue("");
            toast.info("Could not understand audio, please try speaking clearly.");
          }
          setIsVoiceMode(false);
          setInputValue(prev => prev === "Listening... / सुन रहा हूँ..." ? "" : prev);
        },
        (errMsg) => {
          console.error("STT error:", errMsg);
          let errorMessage = 'Voice input failed';
          if (errMsg.includes('not-allowed')) errorMessage = 'Microphone access denied. Please enable permissions.';
          else if (errMsg.includes('no-speech')) errorMessage = 'No speech detected. Please try again.';
          else errorMessage = `Voice input failed: ${errMsg}`;
          toast.error(errorMessage);
          setInputValue("");
          setIsVoiceMode(false);
        }
      );

      // Store the stop handle so the "stop" button can cancel
      mediaRecorderRef.current = { stop: () => sttInstance.stop() } as any;
      mediaRecorderRef.current = { stop: stopSTT } as any;

    } catch (error) {
      console.error('Error starting voice input:', error);
      setIsVoiceMode(false);
      setInputValue("");
      toast.error("Could not start voice recording. Check microphone.");
    }
  };
  // --- End REVISED handleVoiceInput ---

  // Handle video mood detection with real-time analysis
  const handleVideoMood = async () => {
    if (!emotionDetection.isServiceAvailable()) {
      alert('Camera not supported in this browser');
      return;
    }

    if (isVideoMode) {
      emotionDetection.stopRealTimeAnalysis();
      setIsVideoMode(false);
      setCurrentEmotion(null);
      return;
    }

    try {
      // Request camera permission first
      const hasPermission = await emotionDetection.requestCameraPermission();
      if (!hasPermission) {
        alert('Camera access denied. Please enable camera permissions and try again.');
        return;
      }

      setIsVideoMode(true);
      console.log('Starting real-time emotion detection...');

      // TODO: Fix emotion detection - requires video element
      // The startRealTimeAnalysis function requires a video element as first parameter
      // Need to add video element ref and proper video setup
      console.log('Video mode activated - emotion detection temporarily disabled');
      
      // Temporary mock emotion for testing
      const mockEmotion: EmotionAnalysis = {
        faceDetected: true,
        emotions: { 
          joy: 0.7, 
          sorrow: 0.1, 
          anger: 0.05, 
          surprise: 0.1, 
          fear: 0.05, 
          disgust: 0.0 
        },
        primary_emotion: 'joy',
        confidence: 0.7,
        wellness_indicators: {
          stress_level: 0.3,
          energy_level: 0.7,
          engagement_level: 0.8
        },
        facialFeatures: {
          eyeContact: true,
          facialTension: 0.2,
          microExpressions: ['smile']
        }
      };
      
      setCurrentEmotion(mockEmotion);
      
      /* 
      // Proper implementation would be:
      const videoRef = useRef<HTMLVideoElement>(null);
      
      await emotionDetection.startRealTimeAnalysis(
        videoRef.current!, // Video element required
        (result) => {
          // ... emotion processing logic
        },
        {
          interval: 2000,
          culturalContext: 'indian',
          sensitivity: 'medium'
        }
      );
      */

      // Auto-stop after 15 seconds to avoid overwhelming the user
      setTimeout(() => {
        if (isVideoMode) {
          emotionDetection.stopRealTimeAnalysis();
          setIsVideoMode(false);
          console.log('Emotion detection session completed');
        }
      }, 15000);

    } catch (error) {
      console.error('Emotion detection error:', error);
      setIsVideoMode(false);

      if (error instanceof Error) {
        if (error.message.includes('camera')) {
          alert('Camera access failed. Please check your camera permissions and try again.');
        } else {
          alert('Failed to start emotion detection. Please try again.');
        }
      }
    }
  };



  // --- EFFECT: Load Conversation List ---
  useEffect(() => {
    if (!currentUser) {
      setConversationList([]);
      setIsLoadingConversations(false);
      return;
    }

    setIsLoadingConversations(true);
    (async () => {
      try {
        const conversations = await getUserConversations(currentUser.id);
        setConversationList(conversations);
      } catch (_error) {
        toast.error("Failed to load conversation history.");
      } finally {
        setIsLoadingConversations(false);
      }
    })();
  }, [currentUser]);

  // --- EFFECT: Load Messages for Current Conversation ---
  // --- REVISED EFFECT: Load Messages for Current Conversation ---
  useEffect(() => {
    // Stop any previous audio playback
    stopVoiceResponse();

    // Clean up previous message listener if it exists
    if (messageListenerUnsubscribeRef.current) {
      console.log("Unsubscribing from previous message listener.");
      messageListenerUnsubscribeRef.current();
      messageListenerUnsubscribeRef.current = null; // Clear the ref
    }

    if (!currentUser) {
      setMessages([]); // Clear messages if no user
      setIsLoadingMessages(false);
      return;
    }

    if (!currentConversationId) {
      // Handle "New Chat" state - Show only initial greeting
      console.log("Setting initial greeting for New Chat.");
      const greeting: ChatMessage = {
        messageId: 'initial-greeting',
        conversationId: 'none',
        sender: 'ai',
        content: "Hi! I'm MannMitra. How can I help you today?",
        timestamp: new Date(),
        messageType: 'text',
      };
      setMessages([greeting]);
      setIsLoadingMessages(false);
      return; // No need to set up a listener
    }

    // If a conversation ID is selected, load messages once.
    console.log(`Loading messages for conversation: ${currentConversationId}`);
    setIsLoadingMessages(true);
    (async () => {
      try {
        const loadedMessages = await getConversationMessages(currentConversationId);
        console.log(`Loaded ${loadedMessages.length} messages.`);
        setMessages(loadedMessages);
      } catch (error) {
        toast.error("Failed to load messages for this conversation.");
        console.error("Message load error:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    })();

    return () => {
      if (messageListenerUnsubscribeRef.current) {
        console.log("Cleaning up message listener on effect change/unmount.");
        messageListenerUnsubscribeRef.current();
        messageListenerUnsubscribeRef.current = null;
      }
    };
  }, [currentConversationId, currentUser]); // Re-run when conversationId or currentUser changes

  // --- EFFECT: Scroll to bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]); // Scroll when messages update or typing starts

  // --- EFFECT: Cleanup on unmount ---
  useEffect(() => {
    return () => {
      // Stop any playing voice response
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      // Stop voice recording/STT if active
      if (mediaRecorderRef.current && (mediaRecorderRef.current as any).stop) {
        (mediaRecorderRef.current as any).stop();
      }
      // Stop emotion detection if active
      if (isVideoMode) {
        emotionDetection.stopRealTimeAnalysis();
      }
      // Clean up message listener
      if (messageListenerUnsubscribeRef.current) {
        messageListenerUnsubscribeRef.current();
      }
    };
  }, []); // Run only on unmount

  // --- MODIFIED: handleSendMessage to PERSIST messages ---
  const handleSendMessage = useCallback(async (voiceAnalysis?: VoiceAnalysis) => {
    const messageText = voiceAnalysis?.transcript || inputValue.trim();
    if (!messageText || !currentUser) return;

    // 🚨 Crisis detection (parallel keyword & classifier)
    const { assessment: crisisAssessment, triggeredBy } = await evaluateCrisis(messageText);
    if (import.meta.env.DEV) console.log(`[crisis] assessment triggered by: ${triggeredBy}`);

    // Crisis detection and conversation creation logic will be handled in the new implementation

    setInputValue('');
    setIsTyping(true);

    // 🚨 Show crisis support UI if needed
    if (shouldShowCrisisResources(crisisAssessment)) {
      setShowCrisisSupport(true);
    }

    // Create conversation if needed (for message persistence)
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        conversationId = await createConversation(currentUser.id, 'general', 'supportive');
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to create conversation');
        return;
      }
    }

    // Save user message
    const userMessageData: Omit<ChatMessage, 'messageId'> = {
      conversationId: conversationId,
      sender: 'user',
      content: messageText,
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        riskLevel: crisisAssessment.level
      }
    };

    try {
      // Save User Message
      await addMessage(
        userMessageData.conversationId,
        userMessageData.sender,
        userMessageData.content,
        userMessageData.messageType,
        userMessageData.metadata
      );
      const refreshedAfterUserMessage = await getConversationMessages(userMessageData.conversationId);
      setMessages(refreshedAfterUserMessage);
      const refreshedConversationsAfterUser = await getUserConversations(currentUser.id);
      setConversationList(refreshedConversationsAfterUser);

      // Update Firebase Session (User Interaction)
      if (isSessionActive) {
        try {
          // Create safe metadata object - only include defined values
          const metadata: any = {
            crisisLevel: crisisAssessment.level
          };
          
          // Only add voiceAnalysis if it exists and has valid data
          if (voiceAnalysis && voiceAnalysis.transcript) {
            metadata.voiceAnalysis = {
              transcript: voiceAnalysis.transcript || '',
              confidence: typeof voiceAnalysis.confidence === 'number' ? voiceAnalysis.confidence : 0,
              language: voiceAnalysis.language || 'en-IN'
            };
          }
          
          // Only add emotionAnalysis if it exists
          if (currentEmotion) {
            metadata.emotionAnalysis = currentEmotion;
          }

          await addInteraction({
            type: 'user_message',
            content: messageText,
            metadata
          });

          // Add emotional data point if available
          if (currentEmotion) {
            await addEmotionalDataPoint({
              primaryEmotion: currentEmotion.primary_emotion,
              intensity: currentEmotion.confidence,
              valence: 0, // Would be calculated from emotion
              arousal: currentEmotion.wellness_indicators.stress_level,
              confidence: currentEmotion.confidence,
              source: voiceAnalysis ? 'voice' : 'text'
            });
          }

          // Record crisis event if detected
          if (crisisAssessment.level !== 'none' && crisisAssessment.level !== 'low') {
            await recordCrisisEvent({
              severity: crisisAssessment.level as 'moderate' | 'high' | 'severe',
              triggerMessage: messageText,
              detectedIndicators: crisisAssessment.triggeredKeywords
            });
          }
        } catch (sessionError) {
          console.error('Error updating Firebase session (User Interaction):', sessionError);
          toast.error(`Failed to log interaction: ${(sessionError as Error).message}`);
          // Continue to get AI response even if session logging fails
        }
      }
    } catch (error) {
      console.error('Error saving user message:', error);
      toast.error('Failed to save your message');
      setIsTyping(false);
      return;
    }

    try {
      // Context is now handled by AI Orchestrator

      // ✅ Call AI Orchestrator for therapeutic response
      const therapeuticResponse = await aiOrchestrator.generateTherapeuticResponse(
        messageText,
        currentUser?.id || 'anonymous',
        {
          session: { sessionId: conversationId || 'chat-session' },
          emotionalAnalysis: currentEmotion,
          riskAssessment: crisisAssessment,
          adaptations: []
        }
      );

      // Convert therapeutic response to AI response format for compatibility
      const activeUserData = userProfile || userData;
      const userLanguage = (activeUserData?.preferences as any)?.language || (activeUserData?.preferences as any)?.preferredLanguage || 'mixed';
      
      // Support all Indian languages, fallback to mixed for unsupported ones
      const supportedLanguages = ['english', 'hindi', 'mixed', 'bengali', 'marathi', 'telugu', 'tamil', 'gujarati', 'kannada', 'malayalam', 'urdu', 'punjabi', 'odia', 'assamese'];
      const responseLanguage: string = supportedLanguages.includes(userLanguage.toLowerCase()) ? userLanguage : 'mixed';

      // Detect language from user message for TTS
      const detectedLanguage = detectLanguageFromMessage(messageText);

      const aiResponse: AIResponse = {
        message: therapeuticResponse.message,
        originalLanguage: responseLanguage,
        detectedLanguage: detectedLanguage, // Add detected language for TTS
        emotionalTone: 'supportive',
        suggestedActions: therapeuticResponse.resources.selfHelp.map(action => ({
          action: action,
          priority: 'medium' as const,
          category: 'immediate' as const
        })),
        copingStrategies: therapeuticResponse.emotionalSupport.copingStrategies,
        followUpQuestions: therapeuticResponse.followUp.focus,
        riskAssessment: {
          level: therapeuticResponse.riskAssessment.level,
          indicators: therapeuticResponse.riskAssessment.indicators,
          recommendedIntervention: therapeuticResponse.riskAssessment.immediateActions.join(', ') || 'Continue conversation'
        },
        culturalReferences: therapeuticResponse.culturalAdaptation.culturalReferences,
        confidence: 0.9
      };

      // AI message will be added via Firestore listener, no need to add locally
      setCurrentRecommendations(therapeuticResponse.activityRecommendations || []); // Store recommendations

      // --- REMOVED AUTOMATIC TTS SECTION ---
      // Automatic TTS has been removed - users can now use the "Read Aloud" button per message
      // --- END REMOVED SECTION ---

      // Create AI message data
      const aiMessageData: Omit<ChatMessage, 'messageId'> = {
        conversationId: conversationId,
        sender: 'ai',
        content: aiResponse.message,
        timestamp: new Date(),
        messageType: 'text',
        metadata: {
          riskLevel: aiResponse.riskAssessment.level,
          detectedLanguage: aiResponse.detectedLanguage, // *** SAVE DETECTED LANGUAGE HERE ***
          aiModel: 'groq',
          // responseTime: Date.now()
        }
      };

      // Save AI Message
      await addMessage(
        aiMessageData.conversationId,
        aiMessageData.sender,
        aiMessageData.content,
        aiMessageData.messageType,
        aiMessageData.metadata
      );
      const refreshedAfterAIMessage = await getConversationMessages(aiMessageData.conversationId);
      setMessages(refreshedAfterAIMessage);
      const refreshedConversationsAfterAI = await getUserConversations(currentUser.id);
      setConversationList(refreshedConversationsAfterAI);

      // Update Firebase Session (AI Interaction)
      if (isSessionActive) {
        try {
          await addInteraction({
            type: 'ai_response',
            content: aiResponse.message,
            metadata: {
              interventionType: 'empathic_response',
              moodAssessment: aiResponse.riskAssessment.level,
              suggestedActions: aiResponse.suggestedActions
            }
          });
        } catch (sessionError) {
          console.error('Error updating Firebase session (AI Response):', sessionError);
          // Non-critical, just log it
        }
      }
    } catch (error) {
      console.error('❌ AI error or message saving error:', error);
      setCurrentRecommendations([]);

      // Fallback message removed - using toast notifications instead
      const fallbackMessage = {
        id: Date.now().toString(),
        content:
          "Sorry, I had trouble connecting to my AI service. But I’m still here to listen to you.",
        sender: 'ai',
        timestamp: new Date(),
        mood: 'neutral',
      };

      // Error handling will be done through toast notifications
      toast.error("Failed to get AI response or save message.");
    } finally {
      setIsTyping(false); // Ensure typing indicator always stops
      // Clear recommendations after displaying the next message
      setTimeout(() => setCurrentRecommendations([]), 1000);
    }
  }, [inputValue, currentUser, currentConversationId, userProfile, userData, currentEmotion, isSessionActive, voiceResponseEnabled, addInteraction, addEmotionalDataPoint, recordCrisisEvent]);


  // --- Helper to get a simple title for display ---
  const getConversationTitle = (convo: ChatConversation): string => {
    if (convo.title && convo.title !== "New Chat") return convo.title;
    // Fallback: Generate title from timestamp if needed
    return `Chat from ${convo.startedAt.toLocaleDateString()}`;
  };

  const quickResponses = [
    'मैं stressed feel कर रहा हूँ',
    'I feel anxious',
    'Start Assessment',
    'How are you today?',
    'Need someone to talk',
    'Feeling stressed',
    'Want to share something'
  ];

  return (
    // --- REFINED: Enhanced Sidebar for Conversation History ---
    <div className="flex h-screen relative bg-gradient-to-br from-background via-secondary/30 to-primary/10">
      {/* Mobile Overlay - very subtle */}
      {showConversationList && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-10 z-10 lg:hidden"
          onClick={() => setShowConversationList(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative top-0 left-0 h-full w-64 bg-background/95 backdrop-blur-sm border-r border-border shadow-xl z-20 transition-transform duration-300 ease-in-out ${showConversationList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 flex flex-col h-full">
          {/* --- Fixed Header with Close Button --- */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Chat History</h2>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground hover:text-foreground rounded-lg" // Only show on mobile
              onClick={() => setShowConversationList(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          {/* --- End Fixed Header --- */}
          <Button
            onClick={() => {
              setCurrentConversationId(null);
              setShowConversationList(false); // Close sidebar on new chat
            }}
            variant="outline"
            className="w-full mb-3 border-primary/30 hover:bg-primary/5 text-primary rounded-lg py-3"
          >
            <MessageSquarePlus className="w-4 h-4 mr-2" /> New Chat
          </Button>
          <Button
            variant="outline"
            className="w-full mb-6 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg py-2 text-sm"
            disabled={!currentUser || conversationList.length === 0}
            onClick={async () => {
              if (!currentUser || conversationList.length === 0) return;
              if (
                !window.confirm(
                  "Delete all saved companion chats on this device? This cannot be undone."
                )
              ) {
                return;
              }
              await clearAllChatHistory();
              setCurrentConversationId(null);
              setConversationList([]);
              toast.success("Chat history cleared.");
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear all history
          </Button>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : conversationList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center mt-8">No past conversations.</p>
            ) : (
              conversationList.map((convo) => (
                <Button
                  key={convo.conversationId}
                  variant={currentConversationId === convo.conversationId ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-left h-auto py-3 px-4 rounded-lg transition-all duration-200 ${currentConversationId === convo.conversationId
                    ? 'bg-primary/10 border border-primary/20 shadow-sm'
                    : 'hover:bg-secondary/50'
                    }`}
                  onClick={() => {
                    setCurrentConversationId(convo.conversationId);
                    setShowConversationList(false); // Close sidebar on selection
                  }}
                >
                  <div className="truncate w-full">
                    <p className="text-sm font-medium truncate text-foreground">{getConversationTitle(convo)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{convo.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </Button>
              ))
            )}
          </div>
          {/* Button to close sidebar on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 lg:hidden rounded-lg"
            onClick={() => setShowConversationList(false)}
          >
            Close History
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col h-screen"> {/* Ensure chat area takes full height */}
        {/* Button to toggle sidebar on smaller screens */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-6 left-6 z-30 lg:hidden rounded-lg bg-background/80 backdrop-blur-sm shadow-md"
          onClick={() => setShowConversationList(!showConversationList)}
        >
          <List className="w-5 h-5" />
        </Button>

        {/* Original Chat UI Content */}
        <div className="relative flex-1 p-4 md:p-6 lg:p-8 flex flex-col h-full max-h-screen">
          <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
            {/* Header (adjusted for toggle button) */}
            <div className="flex items-center mb-6 md:mb-8 pl-12 lg:pl-0"> {/* Add padding left for toggle */}
              {/* Removed Back button - use sidebar nav */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-medium">
                    {currentConversationId
                      ? conversationList.find(c => c.conversationId === currentConversationId)?.title || "Chat"
                      : "New Chat"}
                  </h1>
                  <p className="text-xs text-muted-foreground">Always here to listen</p>
                  {/* API Status Indicator */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${import.meta.env.VITE_GROQ_API_KEY && !import.meta.env.VITE_GROQ_API_KEY.startsWith('demo-')
                      ? 'bg-green-500'
                      : 'bg-yellow-500'
                      }`}></div>
                    <span className="text-xs text-gray-500">
                      {import.meta.env.VITE_GROQ_API_KEY && !import.meta.env.VITE_GROQ_API_KEY.startsWith('demo-')
                        ? 'AI Powered'
                        : 'Demo Mode'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Voice Settings Button */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                  className="flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Voice: {selectedVoice.name}</span>
                </Button>
              </div>
            </div>
            
            {/* Voice Settings Panel */}
            {showVoiceSettings && (
              <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 rounded-xl shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">🎤 Voice Settings</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVoiceSettings(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_VOICES.map((voice) => (
                      <div
                        key={voice.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedVoice.id === voice.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedVoice(voice)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{voice.name}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                            {voice.gender}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{voice.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{voice.accent}</span>
                          <span className="capitalize">{voice.personality}</span>
                        </div>
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              const testMessage = voice.language.startsWith('hi') 
                                ? 'नमस्ते! मैं आपकी मानसिक स्वास्थ्य यात्रा में आपकी सहायता करने के लिए यहाँ हूँ।'
                                : 'Hello! I\'m here to support you on your mental health journey.';
                              
                              // Test the voice
                              const testTTS = async () => {
                                try {
                                  setIsVoicePlaying(true);
                                  await havenSpeak(testMessage, voice.language, voice.rate);
                                } catch (error) {
                                  console.error('Voice test failed:', error);
                                  toast.error('Voice test failed');
                                } finally {
                                  setIsVoicePlaying(false);
                                }
                              };
                              testTTS();
                            }}
                            disabled={isVoicePlaying}
                          >
                            {isVoicePlaying ? 'Playing...' : 'Test Voice'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <strong>🚀 Self‑hosted AI Backend:</strong> These voices use our self‑hosted AI backend for high‑quality, emotionally resonant speech.
                  </div>
                </div>
              </Card>
            )}

            {/* Crisis Support Banner */}
            {showCrisisSupport && (
              <Card className="p-6 mb-6 bg-red-50 border-red-200 rounded-xl shadow-lg">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-800 mb-3">तत्काल सहायता / Immediate Support</h3>
                    <p className="text-sm text-red-700 mb-4">
                      आप अकेले नहीं हैं। Professional help available है:
                    </p>
                    <div className="space-y-3">
                      {crisisHelplines.slice(0, 2).map((helpline, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <Phone className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="font-medium">{helpline.name}:</span>
                          <span className="text-red-800 font-mono">{helpline.number}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCrisisSupport(false)}
                      className="mt-4 border-red-300 text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                    >
                      समझ गया / Got it
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* API Key Notice */}
            {(!import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROQ_API_KEY.startsWith('demo-')) && (
              <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200 rounded-xl shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800 font-semibold">Demo Mode Active</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Add your Groq API key to enable real AI responses.
                      <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="underline ml-1 hover:text-yellow-800">
                        Get free API key
                      </a>
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          const testMessage = "Hello, I'm feeling a bit anxious today. Can you help me?";
                          setInputValue(testMessage);
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        className="text-xs bg-yellow-200 hover:bg-yellow-300 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
                      >
                        Test Demo Response
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Messages */}
            <div className="flex-1 space-y-8 mb-8 overflow-y-auto p-6 rounded-xl bg-background/50 backdrop-blur-sm scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.messageId}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : ''
                        }`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${message.sender === 'user'
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-secondary/50 border border-border'
                          }`}>
                          {message.sender === 'user' ? (
                            <User className="w-5 h-5 text-primary" />
                          ) : (
                            <Heart className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Card className={`p-5 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${message.sender === 'user'
                            ? 'bg-primary text-primary-foreground border-primary/20'
                            : 'bg-card border-primary/10 hover:border-primary/20'
                            }`}>
                            {message.sender === 'ai' ? (
                              <MarkdownRenderer content={message.content} />
                            ) : (
                              <p className="text-lg leading-relaxed font-medium">{message.content}</p>
                            )}
                          </Card>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs text-muted-foreground ${message.sender === 'user' ? 'text-right' : 'text-left'
                              }`}>
                              {message.timestamp.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              })}
                            </p>
                            {/* Read Aloud Button for AI messages */}
                            {message.sender === 'ai' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-50 rounded-full transition-all duration-200"
                                title={`Read aloud with ${selectedVoice.name}`}
                                // Pass the entire message object to handleReadAloud
                                onClick={() => handleReadAloud(message)}
                                disabled={isVoicePlaying}
                              >
                                <Volume2 className="w-4 h-4" />
                              </Button>
                            )}
                            {/* --- END: Read Aloud Button --- */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="w-10 h-10 bg-secondary/50 border border-border rounded-full flex items-center justify-center shadow-sm">
                          <Heart className="w-5 h-5 text-primary" />
                        </div>
                        <Card className="p-4 bg-card border-primary/10 rounded-2xl shadow-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200" />
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Voice Playing indicator */}
                  {isVoicePlaying && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[85%]">
                        <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-full flex items-center justify-center shadow-sm">
                          <Volume2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 rounded-2xl shadow-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" />
                              <div className="w-1 h-6 bg-blue-500 rounded-full animate-pulse delay-75" />
                              <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse delay-150" />
                              <div className="w-1 h-5 bg-blue-500 rounded-full animate-pulse delay-225" />
                            </div>
                            <span className="text-sm text-blue-700 font-medium">
                              🎤 {selectedVoice.name} speaking...
                            </span>
                          </div>
                        </Card>
                      </div>
                    </div>
                  )}

                  {/* Scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="space-y-4 pt-6 border-t border-border bg-background/80 backdrop-blur-sm sticky bottom-0 pb-6 px-6 sm:px-0 rounded-t-xl shadow-lg">
              {/* Enhanced Emotion indicator */}
              {currentEmotion && (
                <Card className="p-5 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 rounded-xl shadow-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${currentEmotion.primary_emotion === 'joy' ? 'bg-yellow-100' :
                          currentEmotion.primary_emotion === 'sorrow' ? 'bg-blue-100' :
                            currentEmotion.primary_emotion === 'anger' ? 'bg-red-100' :
                              currentEmotion.primary_emotion === 'fear' ? 'bg-purple-100' :
                                currentEmotion.primary_emotion === 'surprise' ? 'bg-green-100' :
                                  'bg-gray-100'
                          }`}>
                          <span className="text-lg">
                            {currentEmotion.primary_emotion === 'joy' ? '😊' :
                              currentEmotion.primary_emotion === 'sorrow' ? '😢' :
                                currentEmotion.primary_emotion === 'anger' ? '😠' :
                                  currentEmotion.primary_emotion === 'fear' ? '😰' :
                                    currentEmotion.primary_emotion === 'surprise' ? '😲' :
                                      '😐'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-800 capitalize">
                            {currentEmotion.primary_emotion}
                          </p>
                          <p className="text-xs text-blue-600">
                            {Math.round(currentEmotion.confidence * 100)}% confidence
                          </p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full shadow-sm ${currentEmotion.confidence > 0.8 ? 'bg-green-400' :
                        currentEmotion.confidence > 0.6 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                    </div>

                    {/* Wellness indicators */}
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700">
                          {Math.round(currentEmotion.wellness_indicators.stress_level * 100)}%
                        </div>
                        <div className="text-gray-500 mt-1">Stress</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700">
                          {Math.round(currentEmotion.wellness_indicators.energy_level * 100)}%
                        </div>
                        <div className="text-gray-500 mt-1">Energy</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-700">
                          {Math.round(currentEmotion.wellness_indicators.engagement_level * 100)}%
                        </div>
                        <div className="text-gray-500 mt-1">Focus</div>
                      </div>
                    </div>

                    {/* Quick emotion-based suggestions */}
                    {currentEmotion.wellness_indicators.stress_level > 0.6 && (
                      <div className="text-xs text-orange-700 bg-orange-50 p-3 rounded-lg border border-orange-200">
                        💡 High stress detected. Try taking 3 deep breaths.
                      </div>
                    )}
                    {currentEmotion.wellness_indicators.energy_level < 0.3 && (
                      <div className="text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        💡 Low energy detected. Consider a short break or some light movement.
                      </div>
                    )}
                    {currentEmotion.primary_emotion === 'sorrow' && (
                      <div className="text-xs text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        💜 It's okay to feel sad. You're not alone in this.
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Main Input Row */}
              <div className="flex gap-3 items-center">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isVoiceMode ? "Listening... / सुन रहा हूँ..." : "अपनी बात कहें... / Share your thoughts..."}
                  className="flex-1 border-input focus:ring-2 focus:ring-primary focus:ring-offset-2 text-base px-5 py-4 text-gray-900 placeholder:text-gray-500 bg-white rounded-xl shadow-sm transition-all duration-200 focus:shadow-md"
                  style={{
                    color: '#1f2937',
                    backgroundColor: '#ffffff',
                    WebkitTextFillColor: '#1f2937'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && !isVoiceMode && handleSendMessage()}
                  disabled={isVoiceMode}
                />

                {/* Voice input button */}
                <Button
                  onClick={handleVoiceInput}
                  variant={isVoiceMode ? "default" : "outline"}
                  size="icon"
                  className={`rounded-xl transition-all duration-200 ${isVoiceMode
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    : "border-primary/30 hover:bg-primary/5 hover:border-primary/50"
                    }`}
                  title={isVoiceMode ? "Stop listening" : "Start voice input"}
                >
                  {isVoiceMode ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping || isVoiceMode}
                  className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  size="icon"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              {/* Voice/Video/Response Toggles */}
              <div className="flex items-center gap-3 justify-center">



                

                {/* Voice control button */}
                {isVoicePlaying && (
                  <Button
                    onClick={stopVoiceResponse}
                    variant="outline"
                    size="sm"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 rounded-full shadow-md transition-all duration-200"
                  >
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Voice
                  </Button>
                )}
              </div>
              {/* --- NEW: Activity Recommendations --- */}
              {currentRecommendations.length > 0 && (
                <div className="pt-3">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Suggested Activities:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentRecommendations.map((rec, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs border-blue-300 hover:bg-blue-50 text-blue-700 hover:text-blue-800 rounded-full transition-all duration-200 hover:shadow-md"
                        onClick={() => {
                          // TODO: Implement navigation or action based on recommendation
                          console.log("Activity Clicked:", rec.activityType);
                          toast.info(`Starting ${rec.activityType.replace(/_/g, ' ')}... (Navigation not implemented yet)`);
                          // Example: if (rec.activityType === 'breathing_exercise') navigateTo?.('calm-down');
                          setCurrentRecommendations([]); // Clear recommendations after click
                        }}
                      >
                        {/* You might want icons based on activityType */}
                        {rec.activityType === 'breathing_exercise' ? '🌬️ ' :
                          rec.activityType === 'mindfulness_session' ? '🧘 ' : '💡 '}
                        {rec.personalizedReason || rec.activityType.replace(/_/g, ' ')}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {/* --- END: Activity Recommendations --- */}

              {/* Quick Responses */}
              <div className="flex flex-wrap gap-2 pt-3">
                {quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInputValue(response);
                      setTimeout(handleSendMessage, 100);
                    }}
                    className="text-xs border-primary/30 hover:bg-primary/5 hover:border-primary/50 text-muted-foreground hover:text-foreground rounded-full transition-all duration-200"
                  >
                    {response}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AICompanion;