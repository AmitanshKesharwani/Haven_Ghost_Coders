// Emotion Explorer Therapy Session - Interactive UI
// Navigate your inner emotional world with guided exploration

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, Heart, Brain, CheckCircle, ArrowRight, Volume2, Sparkles } from 'lucide-react';
import { SpeechToTextInput } from '../SpeechToTextInput';
import { AVAILABLE_VOICES, type VoiceOption } from '../../services/speechServices';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';

interface EmotionStep {
  id: number;
  title: string;
  instruction: string;
  voiceGuide: string;
  type: 'voice' | 'choice' | 'reflection' | 'emotion-wheel';
  emotionCategories?: string[];
  choices?: Array<{
    id: string;
    text: string;
    emoji: string;
    points: number;
  }>;
  reflectionPrompts?: string[];
  points: number;
}

const EMOTION_STEPS: EmotionStep[] = [
  {
    id: 1,
    title: "Emotional Check-In",
    instruction: "Let's explore your current emotional landscape",
    voiceGuide: "Welcome to your emotional exploration journey! I'm here to help you navigate your inner world with curiosity and compassion. Let's start by checking in with your emotions right now.",
    type: 'voice',
    points: 20
  },
  {
    id: 2,
    title: "Emotion Wheel Discovery",
    instruction: "Identify the emotions you're experiencing",
    voiceGuide: "Now let's dive deeper into your emotional world. Look at these emotion categories and choose the one that resonates most with your current experience.",
    type: 'emotion-wheel',
    emotionCategories: ['Joy & Happiness', 'Sadness & Grief', 'Anger & Frustration', 'Fear & Anxiety', 'Love & Connection', 'Surprise & Wonder'],
    points: 30
  },
  {
    id: 3,
    title: "Emotional Wisdom",
    instruction: "Discover what your emotions are teaching you",
    voiceGuide: "Every emotion carries wisdom and information. Let's explore what your current emotions might be trying to tell you about your needs, values, or situation.",
    type: 'voice',
    points: 35
  },
  {
    id: 4,
    title: "Emotional Expression Choice",
    instruction: "Choose how you'd like to express your emotions",
    voiceGuide: "Beautiful insights! Now let's choose a healthy way to express and honor your emotions. Each path offers a different way to connect with your feelings.",
    type: 'choice',
    choices: [
      {
        id: 'creative-expression',
        text: 'Creative Expression',
        emoji: '🎨',
        points: 40
      },
      {
        id: 'mindful-acceptance',
        text: 'Mindful Acceptance',
        emoji: '🧘‍♀️',
        points: 40
      },
      {
        id: 'emotional-release',
        text: 'Emotional Release',
        emoji: '🌊',
        points: 40
      }
    ],
    points: 40
  },
  {
    id: 5,
    title: "Emotional Integration",
    instruction: "Integrate your emotional insights",
    voiceGuide: "You've done beautiful emotional work! Let's integrate what you've discovered. Share one insight about your emotions that you'll carry forward.",
    type: 'reflection',
    reflectionPrompts: [
      "What did you learn about your emotions today?",
      "How can you honor your emotions in daily life?",
      "What emotional pattern would you like to change?"
    ],
    points: 35
  }
];

export default function EmotionExplorerSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  
  // Get voice data from navigation state
  const navigationState = location.state as { exercise?: any; selectedVoice?: VoiceOption };
  
  // Session state
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Voice state - use passed voice or fallback
  const [selectedVoice] = useState<VoiceOption>(() => {
    if (navigationState?.selectedVoice) {
      return navigationState.selectedVoice;
    }
    
    const savedVoiceURI = userProfile?.preferences?.selectedVoice;
    if (savedVoiceURI) {
      const savedVoice = AVAILABLE_VOICES.find(v => v.voiceURI === savedVoiceURI || v.name === savedVoiceURI);
      if (savedVoice) return savedVoice;
    }
    return AVAILABLE_VOICES[0]!;
  });

  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Speak welcome message
    speakText(EMOTION_STEPS[0].voiceGuide);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.name === selectedVoice.name);
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      utterance.lang = selectedVoice.language;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceResponse = (transcript: string, confidence: number) => {
    if (transcript.trim()) {
      const newResponses = [...userResponses];
      newResponses[currentStep] = transcript;
      setUserResponses(newResponses);
      
      const step = EMOTION_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      
      toast.success(`Beautiful emotional insight! +${step.points} explorer points`);
      
      setTimeout(() => {
        nextStep();
      }, 2000);
    }
  };

  const handleEmotionSelection = (emotion: string) => {
    const newEmotions = [...selectedEmotions];
    if (newEmotions.includes(emotion)) {
      const index = newEmotions.indexOf(emotion);
      newEmotions.splice(index, 1);
    } else {
      newEmotions.push(emotion);
    }
    setSelectedEmotions(newEmotions);
  };

  const completeEmotionWheel = () => {
    if (selectedEmotions.length > 0) {
      const step = EMOTION_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      
      const emotionList = selectedEmotions.join(', ');
      toast.success(`Emotions identified: ${emotionList}. +${step.points} points!`);
      
      setTimeout(() => {
        nextStep();
      }, 2000);
    } else {
      toast.error('Please select at least one emotion category');
    }
  };

  const handleChoiceSelection = (choice: any) => {
    const newResponses = [...userResponses];
    newResponses[currentStep] = choice.text;
    setUserResponses(newResponses);
    
    setTotalPoints(prev => prev + choice.points);
    toast.success(`${choice.emoji} ${choice.text} chosen! +${choice.points} points!`);
    
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < EMOTION_STEPS.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setSessionProgress(((newStep + 1) / EMOTION_STEPS.length) * 100);
      
      // Speak next step
      speakText(EMOTION_STEPS[newStep].voiceGuide);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsCompleted(true);
    setSessionProgress(100);
    
    const completionMessage = `Congratulations, emotional explorer! You've completed your journey and earned ${totalPoints} explorer points! You now have deeper emotional wisdom and self-awareness.`;
    speakText(completionMessage);
    
    toast.success('🧭 Emotion Explorer Session Complete!');
  };

  const currentStepData = EMOTION_STEPS[currentStep];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Compass className="w-20 h-20 text-pink-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🧭 Exploration Complete!</h2>
            <p className="text-xl text-gray-600">You've navigated your emotional landscape beautifully!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Exploration Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-sm text-gray-500">Explorer Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">{EMOTION_STEPS.length}</div>
              <div className="text-sm text-gray-500">Insights Gained</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/voice')}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Voice Therapy
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              🔄 Restart Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-pink-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/voice')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Voice Therapy
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              🧭 Emotion Explorer
            </h1>
            <p className="text-gray-600">Navigate your inner world</p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{formatTime(sessionTime)}</span>
            <span>•</span>
            <span>{totalPoints} points</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Discovery {currentStep + 1} of {EMOTION_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(sessionProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500"
              style={{ width: `${sessionProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {currentStepData.instruction}
            </p>
            
            {/* Voice Guide */}
            <div className="flex items-center justify-center gap-4 p-4 bg-pink-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-pink-600" />
              <p className="text-sm text-pink-800 italic">
                "{currentStepData.voiceGuide}"
              </p>
              <button
                onClick={() => speakText(currentStepData.voiceGuide)}
                className="p-2 bg-pink-200 rounded-full hover:bg-pink-300 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-pink-700" />
              </button>
            </div>
          </div>

          {/* Step Content */}
          {currentStepData.type === 'voice' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-l-4 border-pink-400">
                <h3 className="font-semibold text-gray-900 mb-2">💭 Emotional Exploration:</h3>
                <p className="text-gray-700">
                  {currentStep === 0 
                    ? "How are you feeling emotionally right now? What emotions are present in your heart and mind?"
                    : currentStep === 2
                    ? "What do you think your emotions are trying to tell you? What might they be asking for or pointing toward?"
                    : "What's one important insight about your emotions that you want to remember and carry forward?"
                  }
                </p>
              </div>
              
              <SpeechToTextInput
                onTranscript={handleVoiceResponse}
                placeholder="Share your emotional insights with compassion..."
                showLanguageSelector={true}
                showConfidence={true}
                className="w-full"
              />
              
              {userResponses[currentStep] && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">🌟 Your Emotional Insight:</p>
                  <p className="text-gray-800 font-medium">"{userResponses[currentStep]}"</p>
                </div>
              )}
            </div>
          )}

          {currentStepData.type === 'emotion-wheel' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-4">
                  Select the emotion categories that resonate with your current experience:
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {currentStepData.emotionCategories?.map((emotion, index) => (
                  <button
                    key={emotion}
                    onClick={() => handleEmotionSelection(emotion)}
                    className={`p-4 rounded-xl border-2 transition-all text-center ${
                      selectedEmotions.includes(emotion)
                        ? 'border-pink-400 bg-pink-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {['😊', '😢', '😠', '😰', '❤️', '😲'][index]}
                    </div>
                    <p className="font-medium text-gray-800">{emotion}</p>
                  </button>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={completeEmotionWheel}
                  disabled={selectedEmotions.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  ✨ Continue with Selected Emotions
                </button>
              </div>
            </div>
          )}

          {currentStepData.type === 'choice' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentStepData.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelection(choice)}
                  className="p-6 bg-gradient-to-br from-white to-pink-50 rounded-xl border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all text-center"
                >
                  <span className="text-4xl mb-3 block">{choice.emoji}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{choice.text}</h3>
                  <span className="text-sm text-pink-600 font-medium">+{choice.points} points</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {currentStepData.type !== 'emotion-wheel' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={nextStep}
                disabled={currentStepData.type === 'voice' && !userResponses[currentStep]}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                {currentStep === EMOTION_STEPS.length - 1 ? 'Complete Exploration' : 'Next Discovery'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}