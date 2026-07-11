// Anxiety Warrior Therapy Session - Interactive UI
// Conquers anxiety through breathing, grounding, and voice techniques

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Heart, Wind, CheckCircle, ArrowRight, Volume2, Zap } from 'lucide-react';
import { SpeechToTextInput } from '../SpeechToTextInput';
import { AVAILABLE_VOICES, type VoiceOption } from '../../services/speechServices';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';

interface AnxietyStep {
  id: number;
  title: string;
  instruction: string;
  voiceGuide: string;
  type: 'voice' | 'breathing' | 'grounding' | 'choice';
  breathingPattern?: {
    inhale: number;
    hold: number;
    exhale: number;
    cycles: number;
  };
  groundingExercise?: {
    technique: string;
    steps: string[];
  };
  choices?: Array<{
    id: string;
    text: string;
    emoji: string;
    points: number;
  }>;
  points: number;
}

const ANXIETY_STEPS: AnxietyStep[] = [
  {
    id: 1,
    title: "Anxiety Check-In",
    instruction: "Let's understand your current anxiety level",
    voiceGuide: "Welcome, brave warrior! I'm here to help you conquer anxiety and build resilience. Let's start by checking in with how you're feeling right now.",
    type: 'voice',
    points: 20
  },
  {
    id: 2,
    title: "Warrior Breathing",
    instruction: "Use the power of breath to calm your nervous system",
    voiceGuide: "Now let's practice warrior breathing. This powerful technique will help you regain control and find your center. Follow the breathing pattern on screen.",
    type: 'breathing',
    breathingPattern: {
      inhale: 4,
      hold: 4,
      exhale: 6,
      cycles: 5
    },
    points: 30
  },
  {
    id: 3,
    title: "Grounding Technique",
    instruction: "Connect with the present moment using your senses",
    voiceGuide: "Excellent breathing! Now let's ground ourselves in the present moment. This technique will help you feel safe and centered.",
    type: 'grounding',
    groundingExercise: {
      technique: "5-4-3-2-1 Sensory Grounding",
      steps: [
        "Name 5 things you can see around you",
        "Name 4 things you can touch or feel",
        "Name 3 things you can hear right now",
        "Name 2 things you can smell",
        "Name 1 thing you can taste"
      ]
    },
    points: 35
  },
  {
    id: 4,
    title: "Anxiety Warrior Strategy",
    instruction: "Choose your warrior approach to anxiety",
    voiceGuide: "You're doing amazing! Now let's choose your warrior strategy for dealing with anxiety when it arises.",
    type: 'choice',
    choices: [
      {
        id: 'mindful-warrior',
        text: 'Mindful Warrior',
        emoji: '🧘‍♀️',
        points: 40
      },
      {
        id: 'active-warrior',
        text: 'Active Warrior',
        emoji: '⚡',
        points: 40
      },
      {
        id: 'gentle-warrior',
        text: 'Gentle Warrior',
        emoji: '🌸',
        points: 40
      }
    ],
    points: 40
  },
  {
    id: 5,
    title: "Warrior Affirmation",
    instruction: "Speak your warrior truth with power",
    voiceGuide: "You are a true anxiety warrior! Let's end with a powerful affirmation. Speak these words with strength and conviction.",
    type: 'voice',
    points: 35
  }
];

export default function AnxietyWarriorSession() {
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(0);
  
  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingResponses, setGroundingResponses] = useState<string[]>([]);
  
  // Voice state - use passed voice or fallback
  const [selectedVoice] = useState<VoiceOption>(() => {
    if (navigationState?.selectedVoice) {
      return navigationState.selectedVoice;
    }
    
    const savedVoiceURI = userProfile?.preferences?.selectedVoice;
    if (savedVoiceURI) {
      const savedVoice = AVAILABLE_VOICES.find(v => v.backendVoiceId === savedVoiceURI || v.name === savedVoiceURI);
      if (savedVoice) return savedVoice;
    }
    return AVAILABLE_VOICES[0]!;
  });

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Speak welcome message
    speakText(ANXIETY_STEPS[0].voiceGuide);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
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

  const startBreathingExercise = () => {
    const pattern = ANXIETY_STEPS[currentStep].breathingPattern!;
    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingCount(pattern.inhale);
    setBreathingCycle(0);

    const runBreathingCycle = () => {
      let phase: 'inhale' | 'hold' | 'exhale' = 'inhale';
      let count = pattern.inhale;
      let cycle = 0;

      const timer = setInterval(() => {
        setBreathingCount(count);
        count--;

        if (count < 0) {
          if (phase === 'inhale') {
            phase = 'hold';
            count = pattern.hold;
            setBreathingPhase('hold');
          } else if (phase === 'hold') {
            phase = 'exhale';
            count = pattern.exhale;
            setBreathingPhase('exhale');
          } else {
            cycle++;
            setBreathingCycle(cycle);
            
            if (cycle >= pattern.cycles) {
              clearInterval(timer);
              setBreathingActive(false);
              toast.success('🌬️ Excellent breathing! You are in control.');
              
              const step = ANXIETY_STEPS[currentStep];
              setTotalPoints(prev => prev + step.points);
              
              setTimeout(() => {
                nextStep();
              }, 2000);
              return;
            }
            
            phase = 'inhale';
            count = pattern.inhale;
            setBreathingPhase('inhale');
          }
        }
      }, 1000);

      breathingTimerRef.current = timer;
    };

    runBreathingCycle();
  };

  const handleGroundingResponse = (response: string) => {
    const newResponses = [...groundingResponses];
    newResponses[groundingStep] = response;
    setGroundingResponses(newResponses);
    
    if (groundingStep < 4) {
      setGroundingStep(groundingStep + 1);
      toast.success(`Great awareness! Step ${groundingStep + 2} of 5`);
    } else {
      // Complete grounding exercise
      const step = ANXIETY_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      toast.success('🌟 Grounding complete! You are present and safe.');
      
      setTimeout(() => {
        nextStep();
      }, 2000);
    }
  };

  const handleVoiceResponse = (transcript: string, confidence: number) => {
    if (transcript.trim()) {
      const newResponses = [...userResponses];
      newResponses[currentStep] = transcript;
      setUserResponses(newResponses);
      
      const step = ANXIETY_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      
      if (currentStep === 0) {
        toast.success(`Thank you for sharing. +${step.points} warrior points`);
      } else {
        toast.success(`Powerful warrior affirmation! +${step.points} points`);
      }
      
      setTimeout(() => {
        nextStep();
      }, 2000);
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
    if (currentStep < ANXIETY_STEPS.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setSessionProgress(((newStep + 1) / ANXIETY_STEPS.length) * 100);
      
      // Reset step-specific state
      setGroundingStep(0);
      setGroundingResponses([]);
      
      // Speak next step
      speakText(ANXIETY_STEPS[newStep].voiceGuide);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsCompleted(true);
    setSessionProgress(100);
    
    const completionMessage = `Congratulations, anxiety warrior! You've completed your session and earned ${totalPoints} warrior points! You now have powerful tools to face any challenge.`;
    speakText(completionMessage);
    
    toast.success('🛡️ Anxiety Warrior Session Complete!');
  };

  const currentStepData = ANXIETY_STEPS[currentStep];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Shield className="w-20 h-20 text-blue-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🛡️ Warrior Victory!</h2>
            <p className="text-xl text-gray-600">You've conquered anxiety with courage!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Warrior Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
              <div className="text-sm text-gray-500">Warrior Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{ANXIETY_STEPS.length}</div>
              <div className="text-sm text-gray-500">Battles Won</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Warrior Achievements</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800">Mastered warrior breathing techniques</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-purple-800">Practiced grounding and mindfulness</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-indigo-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-indigo-600" />
                <span className="text-indigo-800">Built resilience and inner strength</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/voice')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-blue-200 p-4">
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
              🛡️ Anxiety Warrior
            </h1>
            <p className="text-gray-600">Conquer your fears with courage</p>
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
              Battle {currentStep + 1} of {ANXIETY_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(sessionProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
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
            <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800 italic">
                "{currentStepData.voiceGuide}"
              </p>
              <button
                onClick={() => speakText(currentStepData.voiceGuide)}
                className="p-2 bg-blue-200 rounded-full hover:bg-blue-300 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-blue-700" />
              </button>
            </div>
          </div>

          {/* Step Content */}
          {currentStepData.type === 'voice' && (
            <div className="space-y-6">
              {currentStep === 0 && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-400">
                  <h3 className="font-semibold text-gray-900 mb-2">🛡️ Warrior Check-In:</h3>
                  <p className="text-gray-700">
                    {currentStep === 0 
                      ? "How are you feeling right now? What anxiety or worries are you carrying today?"
                      : "Speak this warrior affirmation with power: 'I am brave, I am strong, I can handle whatever comes my way.'"
                    }
                  </p>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-purple-400">
                  <h3 className="font-semibold text-gray-900 mb-2">⚡ Warrior Affirmation:</h3>
                  <p className="text-gray-700 text-lg font-medium text-center">
                    "I am brave, I am strong, I can handle whatever comes my way. Anxiety does not control me - I am the warrior of my own life."
                  </p>
                </div>
              )}
              
              <SpeechToTextInput
                onTranscript={handleVoiceResponse}
                placeholder="Speak with the courage of a warrior..."
                showLanguageSelector={true}
                showConfidence={true}
                className="w-full"
              />
              
              {userResponses[currentStep] && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">🛡️ Warrior Response:</p>
                  <p className="text-gray-800 font-medium">"{userResponses[currentStep]}"</p>
                </div>
              )}
            </div>
          )}

          {currentStepData.type === 'breathing' && (
            <div className="space-y-6">
              <div className="text-center">
                {!breathingActive ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-4">🌬️ Warrior Breathing Pattern</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Wind className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="font-medium">Inhale</p>
                          <p className="text-sm text-gray-600">{currentStepData.breathingPattern?.inhale}s</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                          <Heart className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <p className="font-medium">Hold</p>
                          <p className="text-sm text-gray-600">{currentStepData.breathingPattern?.hold}s</p>
                        </div>
                        <div className="p-3 bg-cyan-100 rounded-lg">
                          <Zap className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                          <p className="font-medium">Exhale</p>
                          <p className="text-sm text-gray-600">{currentStepData.breathingPattern?.exhale}s</p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={startBreathingExercise}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-medium text-lg"
                    >
                      🌬️ Start Warrior Breathing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className={`w-32 h-32 mx-auto rounded-full border-8 flex items-center justify-center text-2xl font-bold transition-all duration-1000 ${
                        breathingPhase === 'inhale' ? 'border-blue-400 bg-blue-50 text-blue-600 scale-110' :
                        breathingPhase === 'hold' ? 'border-purple-400 bg-purple-50 text-purple-600 scale-105' :
                        'border-cyan-400 bg-cyan-50 text-cyan-600 scale-95'
                      }`}>
                        {breathingCount}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-2xl font-bold capitalize text-gray-800">
                          {breathingPhase}
                        </p>
                        <p className="text-sm text-gray-600">
                          Cycle {breathingCycle + 1} of {currentStepData.breathingPattern?.cycles}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStepData.type === 'grounding' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">
                  🌍 {currentStepData.groundingExercise?.technique}
                </h3>
                <p className="text-gray-700 mb-4">
                  This grounding technique will help you feel safe and present. Take your time with each step.
                </p>
              </div>
              
              {groundingStep < 5 && (
                <div className="space-y-4">
                  <div className="p-4 bg-white border-l-4 border-green-400 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Step {groundingStep + 1}: {currentStepData.groundingExercise?.steps[groundingStep]}
                    </h4>
                  </div>
                  
                  <SpeechToTextInput
                    onTranscript={(transcript) => handleGroundingResponse(transcript)}
                    placeholder={`Speak what you ${groundingStep === 0 ? 'see' : groundingStep === 1 ? 'feel' : groundingStep === 2 ? 'hear' : groundingStep === 3 ? 'smell' : 'taste'}...`}
                    showLanguageSelector={false}
                    showConfidence={false}
                    className="w-full"
                  />
                </div>
              )}
              
              {groundingResponses.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Your Grounding Responses:</h4>
                  {groundingResponses.map((response, index) => (
                    response && (
                      <div key={index} className="p-2 bg-green-50 rounded border-l-2 border-green-400">
                        <span className="text-sm text-green-600">
                          {['See', 'Feel', 'Hear', 'Smell', 'Taste'][index]}:
                        </span>
                        <span className="ml-2 text-gray-800">{response}</span>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          )}

          {currentStepData.type === 'choice' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentStepData.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoiceSelection(choice)}
                  className="p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all text-center"
                >
                  <span className="text-4xl mb-3 block">{choice.emoji}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{choice.text}</h3>
                  <span className="text-sm text-blue-600 font-medium">+{choice.points} points</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {currentStepData.type !== 'breathing' && currentStepData.type !== 'grounding' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={nextStep}
                disabled={currentStepData.type === 'voice' && !userResponses[currentStep]}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                {currentStep === ANXIETY_STEPS.length - 1 ? 'Complete Session' : 'Next Battle'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}