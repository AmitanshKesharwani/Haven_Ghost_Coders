import { useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AVAILABLE_VOICES, type VoiceOption } from '../services/speechServices';
import { useTheme } from '../contexts/ThemeContext';

import { httpsCallable, getFunctions } from 'firebase/functions';
import { toast } from 'sonner';
import { SpeechToTextInput } from './SpeechToTextInput';

export default function VoiceTherapy() {
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  // Basic state for the component
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(AVAILABLE_VOICES[0]!);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [sessionStep, setSessionStep] = useState(0);
  const [userResponse, setUserResponse] = useState<string>('');

  // Complete therapy exercises data
  const THERAPY_EXERCISES = [
    {
      id: 'confidence-builder',
      title: 'Confidence Builder',
      subtitle: 'Unlock your inner strength',
      description: 'Interactive challenges to build unshakeable confidence through voice',
      icon: '🦁',
      color: 'from-green-400 to-emerald-500',
      difficulty: 'beginner' as const,
      benefits: ['Builds self-confidence', 'Improves public speaking', 'Reduces social anxiety'],
      steps: 3
    },
    {
      id: 'anxiety-warrior',
      title: 'Anxiety Warrior',
      subtitle: 'Conquer your fears',
      description: 'Battle anxiety with interactive voice techniques and real-time feedback',
      icon: '🛡️',
      color: 'from-blue-400 to-cyan-500',
      difficulty: 'intermediate' as const,
      benefits: ['Reduces anxiety attacks', 'Builds coping skills', 'Increases resilience'],
      steps: 3
    },
    {
      id: 'emotion-explorer',
      title: 'Emotion Explorer',
      subtitle: 'Understand your feelings',
      description: 'Explore and express your emotions through guided voice exercises',
      icon: '🎭',
      color: 'from-purple-400 to-pink-500',
      difficulty: 'beginner' as const,
      benefits: ['Emotional awareness', 'Better expression', 'Self-understanding'],
      steps: 2
    },
    {
      id: 'stress-buster',
      title: 'Stress Buster',
      subtitle: 'Release tension',
      description: 'Quick stress relief techniques using voice and breathing',
      icon: '🌊',
      color: 'from-teal-400 to-blue-500',
      difficulty: 'beginner' as const,
      benefits: ['Stress relief', 'Relaxation', 'Mental clarity'],
      steps: 2
    }
  ];

  // Helper function to play Base64 audio using Web Audio API
  const playBase64Audio = async (base64String: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const binaryString = window.atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        console.log(`🎵 Finished playing audio`);
        setTestingVoice(null);
      };
      
      source.start(0);
      console.log(`▶️ Started playing audio`);
      
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      toast.error('Failed to play audio');
      setTestingVoice(null);
    }
  };

  const startExercise = (exercise: typeof THERAPY_EXERCISES[0]) => {
    console.log(`Starting ${exercise.title} with ${selectedVoice.name}`);
    
    // Navigate to dedicated session page with selected voice data
    const navigationState = {
      exercise: exercise,
      selectedVoice: selectedVoice
    };
    
    switch (exercise.id) {
      case 'confidence-builder':
        navigate('/confidence-builder-session', { state: navigationState });
        break;
      case 'anxiety-warrior':
        navigate('/anxiety-warrior-session', { state: navigationState });
        break;
      case 'emotion-explorer':
        navigate('/emotion-explorer-session', { state: navigationState });
        break;
      case 'stress-buster':
        navigate('/stress-buster-session', { state: navigationState });
        break;
      default:
        // Fallback to local session
        setActiveSession(exercise.id);
        setSessionStep(1);
        toast.success(`Started ${exercise.title} session with ${selectedVoice.name}`);
    }
  };

  const testVoice = async (voice: VoiceOption) => {
    setTestingVoice(voice.id);
    
    try {
      const functions = getFunctions();
      const synthesizeSpeech = httpsCallable<{ 
        text: string; 
        languageCode?: string; 
        voiceName?: string; 
        speakingRate?: number; 
      }, { audioBase64: string }>(functions, 'synthesizeSpeech');

      // Enhanced test messages for each voice in their native language
      const testMessages = {
        'en-IN': `Hello! I'm ${voice.name}, your AI therapy companion. I speak Indian English with warmth and understanding.`,
        'hi-IN': `नमस्ते! मैं ${voice.name} हूं, आपका AI चिकित्सा साथी। मैं आपकी मानसिक स्वास्थ्य यात्रा में सहायता करूंगा।`,
        'en-GB': `Hello! I'm ${voice.name}, your British AI companion. I'm here to support your wellbeing journey.`,
        'en-US': `Hi there! I'm ${voice.name}, your American AI companion. I'm excited to help you on your wellness journey.`,
        'bn-IN': `নমস্কার! আমি ${voice.name}, আপনার বাংলা AI সঙ্গী। আমি আপনার মানসিক স্বাস্থ্য যাত্রায় সহায়তা করব।`,
        'mr-IN': `नमस्कार! मी ${voice.name} आहे, तुमचा मराठी AI साथी। मी तुमच्या मानसिक आरोग्याच्या प्रवासात मदत करेन।`,
        'ta-IN': `வணக்கம்! நான் ${voice.name}, உங்கள் தமிழ் AI துணை। உங்கள் மன நலப் பயணத்தில் உதவுவேன்.`,
        'te-IN': `నమస్కారం! నేను ${voice.name}, మీ తెలుగు AI సహచరుడిని। మీ మానసిక ఆరోగ్య ప్రయాణంలో సహాయం చేస్తాను.`,
        'gu-IN': `નમસ્તે! હું ${voice.name} છું, તમારો ગુજરાતી AI સાથી। હું તમારી માનસિક સ્વાસ્થ્ય યાત્રામાં મદદ કરીશ.`,
        'kn-IN': `ನಮಸ್ಕಾರ! ನಾನು ${voice.name}, ನಿಮ್ಮ ಕನ್ನಡ AI ಸಹಚರ। ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಪ್ರಯಾಣದಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.`,
        'ml-IN': `നമസ്കാരം! ഞാൻ ${voice.name}, നിങ്ങളുടെ മലയാളം AI കൂട്ടാളി। നിങ്ങളുടെ മാനസികാരോഗ്യ യാത്രയിൽ സഹായിക്കും.`
      };

      const testMessage = testMessages[voice.language as keyof typeof testMessages] || testMessages['en-IN'];

      console.log(`🎤 Testing ${voice.name} with Google Chirp 3 HD (${voice.language})`);

      const result = await synthesizeSpeech({
        text: testMessage,
        languageCode: voice.language,
        voiceName: voice.voiceURI || voice.name,
        speakingRate: voice.rate || 1.0
      });

      const audioBase64 = result.data.audioBase64;
      
      if (audioBase64) {
        console.log(`✅ Received Chirp 3 HD audio for ${voice.name}`);
        await playBase64Audio(audioBase64);
        toast.success(`🎤 Playing ${voice.name} in ${voice.accent}`);
      } else {
        console.warn(`⚠️ No audio data received for ${voice.name}`);
        toast.error(`Could not generate audio for ${voice.name}`);
        setTestingVoice(null);
      }
    } catch (error: any) {
      console.error(`❌ Error testing ${voice.name}:`, error);
      toast.error(`Failed to test ${voice.name}: ${error.message || 'Unknown error'}`);
      setTestingVoice(null);
    }
  };

  return (
    <div className={`relative ${currentTheme === 'whatsapp' ? 'whatsapp-main-bg' : ''}`}>
      {/* Plain background orbs only for WhatsApp theme */}
      {currentTheme === 'whatsapp' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00A884]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#25D366]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-[#00A884]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10">
        <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full mb-4 md:mb-6 p-2 ${currentTheme === 'ocean'
              ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
              : currentTheme === 'forest'
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : currentTheme === 'whatsapp'
                  ? 'bg-gradient-to-br from-[#00A884] to-[#25D366]'
                  : 'bg-gradient-to-br from-blue-500 to-purple-600'
              }`}>
              <img 
                src="/mann-mitra-logo.PNG" 
                alt="Haven Logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-black">Voice Therapy</h1>
            <p className="text-base md:text-xl max-w-2xl mx-auto px-4 text-black/70">
              Choose a guided voice exercise to improve your emotional well-being and self-expression
            </p>
          </div>

          {/* Voice Selection Card */}
          <div className={`p-6 rounded-xl mb-8 ${currentTheme === 'ocean'
            ? 'bg-white/20 backdrop-blur-md border border-white/30'
            : currentTheme === 'forest'
              ? 'bg-white shadow-lg border border-green-200'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-lg border border-[#00A884]/20'
                : 'bg-white shadow-lg border border-gray-200'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-black">Choose Your AI Companion Voice</h3>
                <p className="text-sm text-black/60">{AVAILABLE_VOICES.length} premium voices available</p>
              </div>
              <button
                onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                className="px-3 py-1 text-sm rounded bg-gray-100 text-black hover:bg-gray-200"
              >
                {showVoiceSelector ? '🔼 Hide' : '🔽 Show'} All {AVAILABLE_VOICES.length} Voices
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500">
                <span className="text-white font-bold">{selectedVoice.name[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-black">{selectedVoice.name}</p>
                <p className="text-sm text-black/60">{selectedVoice.description}</p>
              </div>
              <button
                onClick={() => testVoice(selectedVoice)}
                disabled={testingVoice === selectedVoice.id}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  testingVoice === selectedVoice.id
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {testingVoice === selectedVoice.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Test Voice
                  </>
                )}
              </button>
            </div>

            {/* Compact Voice Grid */}
            {showVoiceSelector && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {AVAILABLE_VOICES.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 rounded-lg text-left transition-colors ${selectedVoice.id === voice.id
                      ? 'bg-blue-100 border-2 border-blue-300'
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        voice.gender === 'female' 
                          ? 'bg-pink-100 text-pink-700' 
                          : voice.gender === 'male'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {voice.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-black">{voice.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            voice.personality === 'supportive' ? 'bg-green-100 text-green-700' :
                            voice.personality === 'professional' ? 'bg-blue-100 text-blue-700' :
                            voice.personality === 'friendly' ? 'bg-yellow-100 text-yellow-700' :
                            voice.personality === 'calm' ? 'bg-purple-100 text-purple-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {voice.personality}
                          </span>
                        </div>
                        <p className="text-xs text-black/60">{voice.accent} • {voice.description}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          testVoice(voice);
                        }}
                        disabled={testingVoice === voice.id}
                        className={`ml-2 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          testingVoice === voice.id
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {testingVoice === voice.id ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Playing
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            Test
                          </div>
                        )}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Session Status */}
          {activeSession && (
            <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold text-blue-800">
                      Active Session: {THERAPY_EXERCISES.find(e => e.id === activeSession)?.title}
                    </p>
                    <p className="text-sm text-blue-600">
                      Step {sessionStep}/{THERAPY_EXERCISES.find(e => e.id === activeSession)?.steps} • Guided by {selectedVoice.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveSession(null);
                    setSessionStep(0);
                    setUserResponse('');
                    toast.info('Session ended');
                  }}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  End Session
                </button>
              </div>
              
              {/* Interactive Speech Input */}
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">
                  🎤 Voice Response - Speak your thoughts
                </h4>
                <SpeechToTextInput
                  onTranscript={(transcript, confidence) => {
                    setUserResponse(transcript);
                    toast.success(`Voice captured with ${Math.round(confidence * 100)}% confidence`);
                  }}
                  placeholder="Click the microphone and share your thoughts about this exercise..."
                  showLanguageSelector={true}
                  showConfidence={true}
                  className="w-full"
                />
                {userResponse && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <p className="text-sm text-gray-600 mb-1">Your Response:</p>
                    <p className="text-gray-800">"{userResponse}"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Exercise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {THERAPY_EXERCISES.map((exercise) => (
              <div
                key={exercise.id}
                className="p-8 rounded-xl transition-all duration-200 hover:shadow-lg bg-white shadow-lg border border-gray-200"
              >
                <div className={`h-2 bg-gradient-to-r ${exercise.color} mb-6 rounded`}></div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{exercise.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-black">{exercise.title}</h3>
                    <p className="text-sm font-medium text-black/60">{exercise.subtitle}</p>
                  </div>
                </div>
                <p className="mb-4 leading-relaxed text-black/70">{exercise.description}</p>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 text-black">Benefits:</h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.benefits.map((benefit, index) => (
                      <span key={index} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-black">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-black/60">
                  <span className="flex items-center gap-1">
                    <span>🎯</span>
                    {exercise.steps} Steps
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${exercise.difficulty === 'beginner'
                    ? 'bg-green-100 text-black'
                    : exercise.difficulty === 'intermediate'
                      ? 'bg-yellow-100 text-black'
                      : 'bg-red-100 text-black'
                    }`}>
                    {exercise.difficulty}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>🎤</span>
                    {selectedVoice.name}
                  </span>
                </div>
                
                {/* Voice Guide Notice */}
                <div className="mt-3 p-2 rounded text-xs bg-gray-50 text-black/60">
                  <span className="font-medium">Voice Guide:</span> {selectedVoice.name} will guide you through this exercise in {selectedVoice.accent} with {selectedVoice.personality} support.
                </div>

                {/* Start Session Button */}
                <button
                  onClick={() => startExercise(exercise)}
                  className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                    exercise.id === 'confidence-builder' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' :
                    exercise.id === 'anxiety-warrior' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
                    exercise.id === 'emotion-explorer' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                    'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Session
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Voice Technology Info */}
          <div className="mt-8 p-6 rounded-xl bg-gray-50 border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-center text-black">
              🎤 Premium Voice Technology
            </h3>
            
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm text-green-800 font-medium mb-1">
                🎤 Google Chirp 3 HD Technology
              </p>
              <p className="text-xs text-green-700">
                All "Test" buttons now use Google Chirp 3 HD voices speaking in their native languages! 
                Experience the same premium AI voices that will guide you through therapy sessions 
                with authentic pronunciation and cultural context.
              </p>
            </div>

            <div className="text-sm space-y-1 text-center">
              <p className="text-black/70">
                ✅ {AVAILABLE_VOICES.length} Premium AI Voices with Google Chirp 3 HD Technology
              </p>
              <p className="text-black/70">
                ✅ Real-time Native Language Testing: Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, Malayalam
              </p>
              <p className="text-black/70">
                ✅ Authentic Pronunciation and Cultural Context
              </p>
              <p className="text-black/70">
                ✅ Personality-Based Voice Selection (Supportive, Professional, Friendly, Calm, Energetic)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}