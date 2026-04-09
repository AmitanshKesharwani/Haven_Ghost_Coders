// src/services/speechServices.ts
// --- UPGRADED TO GOOGLE CHIRP 3 HD VOICES ---
// Latest generative AI-powered Text-to-Speech technology
// Delivers ultra-realistic voices with emotional resonance for mental health therapy

// This interface defines the structure for a voice option
export interface VoiceOption {
  id: string;
  name: string; // The friendly name (e.g., "Sarah")
  gender: 'male' | 'female' | 'neutral';
  language: string; // The BCP-47 language code (e.g., "en-IN")
  accent: string;
  personality: 'calm' | 'energetic' | 'supportive' | 'professional' | 'friendly';
  description: string;
  voiceURI?: string; // The *actual* Google Cloud voice name (e.g., "en-IN-Chirp3-HD-Aoede")
  rate: number; // <-- pitch property removed
  volume: number;
}

// Google Chirp 3 HD Voices - Latest Generative AI TTS Technology
// Ultra-realistic voices with emotional resonance for mental health therapy
export const AVAILABLE_VOICES: VoiceOption[] = [
  // --- English (India) - Chirp 3 HD Voices ---
  {
    id: 'sarah-supportive',
    name: 'Sarah',
    gender: 'female',
    language: 'en-IN',
    accent: 'Indian English',
    personality: 'supportive',
    description: 'Warm, caring therapist voice (Chirp 3 HD)',
    voiceURI: 'en-IN-Chirp3-HD-Aoede', // <-- CORRECTED
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
    description: 'Encouraging friend voice (Chirp 3 HD)',
    voiceURI: 'en-IN-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Professional therapist with emotional depth (Chirp 3 HD)',
    voiceURI: 'en-IN-Chirp3-HD-Kore', // <-- CORRECTED (Used a different speaker)
    rate: 0.85,
    volume: 0.8
  },
  // --- Hindi - Chirp 3 HD Voices ---
  {
    id: 'priya-professional',
    name: 'Dr. Priya',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Hindi',
    personality: 'professional',
    description: 'Professional therapist voice (Chirp 3 HD Hindi)',
    voiceURI: 'hi-IN-Chirp3-HD-Aoede', // <-- CORRECTED
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
    description: 'Confident motivator voice (Chirp 3 HD Hindi)',
    voiceURI: 'hi-IN-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Compassionate guide with emotional warmth (Chirp 3 HD)',
    voiceURI: 'hi-IN-Chirp3-HD-Kore', // <-- CORRECTED (Used a different speaker)
    rate: 0.85,
    volume: 0.8
  },
  // --- English (Global) - Chirp 3 HD Premium ---
  {
    id: 'alex-calm',
    name: 'Alex',
    gender: 'male',
    language: 'en-GB',
    accent: 'British English',
    personality: 'calm',
    description: 'Soothing, meditative guide (Chirp 3 HD)',
    voiceURI: 'en-GB-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Motivational coach voice (Chirp 3 HD)',
    voiceURI: 'en-US-Chirp3-HD-Aoede', // <-- CORRECTED
    rate: 1.1,
    volume: 0.9
  },
  // --- Regional Indian Languages - Chirp 3 HD ---
  {
    id: 'aditi-friendly',
    name: 'Aditi',
    gender: 'female',
    language: 'bn-IN',
    accent: 'Bengali',
    personality: 'friendly',
    description: 'Supportive friend (Chirp 3 HD Bengali)',
    voiceURI: 'bn-IN-Chirp3-HD-Aoede', // <-- CORRECTED
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
    description: 'Calm guide (Chirp 3 HD Marathi)',
    voiceURI: 'mr-IN-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Warm and caring (Chirp 3 HD Tamil)',
    voiceURI: 'ta-IN-Chirp3-HD-Aoede', // <-- CORRECTED
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
    description: 'Motivational guide (Chirp 3 HD Telugu)',
    voiceURI: 'te-IN-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Calm and supportive (Chirp 3 HD Gujarati)',
    voiceURI: 'gu-IN-Chirp3-HD-Puck', // <-- CORRECTED
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
    description: 'Friendly companion (Chirp 3 HD Kannada)',
    voiceURI: 'kn-IN-Chirp3-HD-Aoede', // <-- CORRECTED
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
    description: 'Soothing voice (Chirp 3 HD Malayalam)',
    voiceURI: 'ml-IN-Chirp3-HD-Aoede', // <-- CORRECTED
    rate: 0.9,
    volume: 0.8
  }
];

// We no longer export 'voiceAI' or 'speechService' because
// the components now call the backend functions directly.