// src/services/speechServices.ts
// --- SELF-HOSTED AI BACKEND ---
// Provides Text-to-Speech via the local AI backend.

// This interface defines the structure for a voice option
export interface VoiceOption {
  id: string;
  name: string; // The friendly name (e.g., "Sarah")
  gender: 'male' | 'female' | 'neutral';
  language: string; // The BCP-47 language code (e.g., "en-IN")
  accent: string;
  personality: 'calm' | 'energetic' | 'supportive' | 'professional' | 'friendly';
  description: string;
  voiceURI?: string; // Optional identifier for backend TTS voice
  rate: number; // <-- pitch property removed
  volume: number;
}

// AI Backend Voices - TTS Service
// Speech synthesis via self-hosted backend.
export const AVAILABLE_VOICES: VoiceOption[] = [
  // --- English (India) ---
  {
    id: 'sarah-supportive',
    name: 'Sarah',
    gender: 'female',
    language: 'en-IN',
    accent: 'Indian English',
    personality: 'supportive',
    description: 'Warm, caring therapist voice',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'raj-friendly',
    name: 'Raj',
    gender: 'male',
    language: 'en-IN',
    accent: 'Indian English',
    personality: 'friendly',
    description: 'Encouraging friend voice',
    voiceURI: '',
    rate: 1.0,
    volume: 0.8
  },
  {
    id: 'ananya-empathetic',
    name: 'Dr. Ananya',
    gender: 'female',
    language: 'en-IN',
    accent: 'Indian English',
    personality: 'professional',
    description: 'Professional therapist with emotional depth',
    voiceURI: '',
    rate: 0.85,
    volume: 0.8
  },
  // --- Hindi ---
  {
    id: 'priya-professional',
    name: 'Dr. Priya',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Hindi',
    personality: 'professional',
    description: 'Professional therapist voice (Hindi)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'arjun-confident',
    name: 'Arjun',
    gender: 'male',
    language: 'hi-IN',
    accent: 'Hindi',
    personality: 'energetic',
    description: 'Confident motivator voice (Hindi)',
    voiceURI: '',
    rate: 1.0,
    volume: 0.9
  },
  {
    id: 'meera-compassionate',
    name: 'Meera',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Hindi',
    personality: 'supportive',
    description: 'Compassionate guide with emotional warmth',
    voiceURI: '',
    rate: 0.85,
    volume: 0.8
  },
  // --- English (Global) ---
  {
    id: 'alex-calm',
    name: 'Alex',
    gender: 'male',
    language: 'en-GB',
    accent: 'British English',
    personality: 'calm',
    description: 'Soothing, meditative guide',
    voiceURI: '',
    rate: 0.8,
    volume: 0.7
  },
  {
    id: 'maya-energetic',
    name: 'Maya',
    gender: 'female',
    language: 'en-US',
    accent: 'American English',
    personality: 'energetic',
    description: 'Motivational coach voice',
    voiceURI: '',
    rate: 1.1,
    volume: 0.9
  },
  // --- Regional Indian Languages ---
  {
    id: 'aditi-friendly',
    name: 'Aditi',
    gender: 'female',
    language: 'bn-IN',
    accent: 'Bengali',
    personality: 'friendly',
    description: 'Supportive friend (Bengali)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'rohan-calm',
    name: 'Rohan',
    gender: 'male',
    language: 'mr-IN',
    accent: 'Marathi',
    personality: 'calm',
    description: 'Calm guide (Marathi)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'kavya-supportive',
    name: 'Kavya',
    gender: 'female',
    language: 'ta-IN',
    accent: 'Tamil',
    personality: 'supportive',
    description: 'Warm and caring (Tamil)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'vikram-energetic',
    name: 'Vikram',
    gender: 'male',
    language: 'te-IN',
    accent: 'Telugu',
    personality: 'energetic',
    description: 'Motivational guide (Telugu)',
    voiceURI: '',
    rate: 1.0,
    volume: 0.9
  },
  {
    id: 'advik-supportive',
    name: 'Advik',
    gender: 'male',
    language: 'gu-IN',
    accent: 'Gujarati',
    personality: 'supportive',
    description: 'Calm and supportive (Gujarati)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'deepa-friendly',
    name: 'Deepa',
    gender: 'female',
    language: 'kn-IN',
    accent: 'Kannada',
    personality: 'friendly',
    description: 'Friendly companion (Kannada)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  },
  {
    id: 'nisha-calm',
    name: 'Nisha',
    gender: 'female',
    language: 'ml-IN',
    accent: 'Malayalam',
    personality: 'calm',
    description: 'Soothing voice (Malayalam)',
    voiceURI: '',
    rate: 0.9,
    volume: 0.8
  }
];

// TTS is now handled via the self-hosted AI backend.