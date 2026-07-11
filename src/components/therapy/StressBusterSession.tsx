// Stress Buster Therapy Session - Interactive UI
// High-energy session to blast away stress and tension

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Zap, Battery, Flame, CheckCircle, ArrowRight, Volume2, Star } from 'lucide-react';
import { SpeechToTextInput } from '../SpeechToTextInput';
import { AVAILABLE_VOICES, type VoiceOption } from '../../services/speechServices';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';

interface StressStep {
  id: number;
  title: string;
  instruction: string;
  voiceGuide: string;
  type: 'voice' | 'choice' | 'energy-release' | 'power-shout';
  energyExercise?: {
    name: string;
    instructions: string[];
    duration: number;
  };
  powerShouts?: string[];
  choices?: Array<{
    id: string;
    text: string;
    emoji: string;
    points: number;
  }>;
  points: number;
}

const STRESS_STEPS: StressStep[] = [
  {
    id: 1,
    title: "Stress Assessment",
    instruction: "Let's identify your stress and tension points",
    voiceGuide: "Welcome to your stress-busting session! I'm here to help you demolish stress and reclaim your energy. Let's start by talking about what's causing you stress right now.",
    type: 'voice',
    points: 20
  },
  {
    id: 2,
    title: "Energy Release Exercise",
    instruction: "Release physical tension with movement",
    voiceGuide: "Now let's get that stress out of your body! This high-energy exercise will help you shake off tension and boost your energy levels.",
    type: 'energy-release',
    energyExercise: {
      name: "Stress Shake-Off",
      instructions: [
        "Stand up and shake your hands vigorously for 10 seconds",
        "Roll your shoulders backward 5 times",
        "Take 3 deep breaths and stretch your arms up high",
        "Shake your whole body like you're shaking off water",
        "Jump in place 10 times with energy"
      ],
      duration: 60
    },
    points: 30
  },
  {
    id: 3,
    title: "Power Shout Release",
    instruction: "Use your voice to release stress energy",
    voiceGuide: "Excellent! Now let's use the power of your voice to blast away stress. Choose a power shout that feels right for you and say it with full energy!",
    type: 'power-shout',
    powerShouts: [
      "I AM STRONG AND STRESS-FREE!",
      "I RELEASE ALL TENSION NOW!",
      "I CHOOSE PEACE AND ENERGY!",
      "STRESS HAS NO POWER OVER ME!"
    ],
    points: 35
  },
  {
    id: 4,
    title: "Stress-Busting Strategy",
    instruction: "Choose your ongoing stress management approach",
    voiceGuide: "Amazing energy! Now let's choose your personal stress-busting strategy for when stress tries to creep back in.",
    type: 'choice',
    choices: [
      {
        id: 'high-energy',
        text: 'High-Energy Blaster',
        emoji: '⚡',
        points: 40
      },
      {
        id: 'calm-warrior',
        text: 'Calm Warrior',
        emoji: '🧘‍♂️',
        points: 40
      },
      {
        id: 'creative-flow',
        text: 'Creative Flow',
        emoji: '🎨',
        points: 40
      }
    ],
    points: 40
  },
  {
    id: 5,
    title: "Energy Affirmation",
    instruction: "Seal your stress-free state with a powerful affirmation",
    voiceGuide: "You've done incredible work! Let's seal this stress-free, energized state with a powerful affirmation. Speak it with all the energy you've built up!",
    type: 'voice',
    points: 35
  }
];

export default function StressBusterSession() {
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
  
  // Energy exercise state
  const [exerciseActive, setExerciseActive] = useState(false);
  const [exerciseStep, setExerciseStep] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  
  // Power shout state
  const [selectedShout, setSelectedShout] = useState<string>('');
  
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
  const exerciseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Speak welcome message
    speakText(STRESS_STEPS[0].voiceGuide);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (exerciseTimerRef.current) clearInterval(exerciseTimerRef.current);
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

  const startEnergyExercise = () => {
    const exercise = STRESS_STEPS[currentStep].energyExercise!;
    setExerciseActive(true);
    setExerciseStep(0);
    setExerciseTimer(exercise.duration);

    const runExercise = () => {
      let step = 0;
      let timeLeft = exercise.duration;

      const timer = setInterval(() => {
        setExerciseTimer(timeLeft);
        timeLeft--;

        if (timeLeft < 0) {
          if (step < exercise.instructions.length - 1) {
            step++;
            setExerciseStep(step);
            timeLeft = Math.floor(exercise.duration / exercise.instructions.length);
          } else {
            clearInterval(timer);
            setExerciseActive(false);
            toast.success('💥 Stress demolished! You feel energized and free!');
            
            const stepData = STRESS_STEPS[currentStep];
            setTotalPoints(prev => prev + stepData.points);
            
            setTimeout(() => {
              nextStep();
            }, 2000);
          }
        }
      }, 1000);

      exerciseTimerRef.current = timer;
    };

    runExercise();
  };

  const handlePowerShout = (shout: string) => {
    setSelectedShout(shout);
    
    // Encourage user to actually shout it
    toast.success('🔥 Now SHOUT it out loud with all your energy!');
    
    setTimeout(() => {
      const step = STRESS_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      toast.success('⚡ POWERFUL! Stress is blasted away!');
      
      setTimeout(() => {
        nextStep();
      }, 2000);
    }, 3000);
  };

  const handleVoiceResponse = (transcript: string, confidence: number) => {
    if (transcript.trim()) {
      const newResponses = [...userResponses];
      newResponses[currentStep] = transcript;
      setUserResponses(newResponses);
      
      const step = STRESS_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      
      if (currentStep === 0) {
        toast.success(`Stress identified! Time to blast it away. +${step.points} points`);
      } else {
        toast.success(`Powerful energy affirmation! +${step.points} points`);
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
    toast.success(`${choice.emoji} ${choice.text} activated! +${choice.points} points!`);
    
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  const nextStep = () => {
    if (currentStep < STRESS_STEPS.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setSessionProgress(((newStep + 1) / STRESS_STEPS.length) * 100);
      
      // Reset step-specific state
      setExerciseStep(0);
      setSelectedShout('');
      
      // Speak next step
      speakText(STRESS_STEPS[newStep].voiceGuide);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsCompleted(true);
    setSessionProgress(100);
    
    const completionMessage = `Incredible work, stress buster! You've completed your high-energy session and earned ${totalPoints} energy points! You're now stress-free and energized!`;
    speakText(completionMessage);
    
    toast.success('💥 Stress Buster Session Complete!');
  };

  const currentStepData = STRESS_STEPS[currentStep];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Zap className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">💥 Stress Demolished!</h2>
            <p className="text-xl text-gray-600">You're energized and stress-free!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Energy Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
              <div className="text-sm text-gray-500">Energy Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{STRESS_STEPS.length}</div>
              <div className="text-sm text-gray-500">Stress Busted</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/voice')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Voice Therapy
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              🔄 Restart Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-orange-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-red-200 p-4">
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
              💥 Stress Buster
            </h1>
            <p className="text-gray-600">Demolish stress with energy</p>
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
              Energy Blast {currentStep + 1} of {STRESS_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(sessionProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-red-400 to-orange-500 transition-all duration-500"
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
            <div className="flex items-center justify-center gap-4 p-4 bg-red-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800 italic">
                "{currentStepData.voiceGuide}"
              </p>
              <button
                onClick={() => speakText(currentStepData.voiceGuide)}
                className="p-2 bg-red-200 rounded-full hover:bg-red-300 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-red-700" />
              </button>
            </div>
          </div>

          {/* Step Content */}
          {currentStepData.type === 'voice' && (
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-l-4 border-red-400">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {currentStep === 0 ? '🎯 Stress Check:' : '⚡ Energy Affirmation:'}
                </h3>
                <p className="text-gray-700">
                  {currentStep === 0 
                    ? "What's causing you stress right now? What tension are you carrying in your body or mind?"
                    : "Speak this powerful affirmation with all your energy: 'I am energized, I am free, I choose peace and vitality in every moment!'"
                  }
                </p>
              </div>
              
              <SpeechToTextInput
                onTranscript={handleVoiceResponse}
                placeholder="Speak with high energy and power..."
                showLanguageSelector={true}
                showConfidence={true}
                className="w-full"
              />
              
              {userResponses[currentStep] && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">⚡ Your Energized Response:</p>
                  <p className="text-gray-800 font-medium">"{userResponses[currentStep]}"</p>
                </div>
              )}
            </div>
          )}

          {currentStepData.type === 'energy-release' && (
            <div className="space-y-6">
              <div className="text-center">
                {!exerciseActive ? (
                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900 mb-4">💥 {currentStepData.energyExercise?.name}</h3>
                      <div className="space-y-2">
                        {currentStepData.energyExercise?.instructions.map((instruction, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                            <p className="text-gray-800">
                              <span className="font-medium text-red-600">{index + 1}.</span> {instruction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={startEnergyExercise}
                      className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 font-medium text-lg"
                    >
                      💥 Start Energy Release!
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto rounded-full border-8 border-red-400 bg-red-50 flex items-center justify-center text-2xl font-bold text-red-600 animate-pulse">
                        {exerciseTimer}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-gray-800">
                          Step {exerciseStep + 1}
                        </p>
                        <p className="text-lg text-gray-600">
                          {currentStepData.energyExercise?.instructions[exerciseStep]}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStepData.type === 'power-shout' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-4">
                  Choose a power shout and say it with maximum energy and conviction!
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.powerShouts?.map((shout, index) => (
                  <button
                    key={index}
                    onClick={() => handlePowerShout(shout)}
                    className={`p-6 rounded-xl border-2 transition-all text-center ${
                      selectedShout === shout
                        ? 'border-red-400 bg-red-100 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-red-300 hover:bg-red-50'
                    }`}
                  >
                    <div className="text-3xl mb-2">🔥</div>
                    <p className="font-bold text-gray-800 text-lg">"{shout}"</p>
                  </button>
                ))}
              </div>
              
              {selectedShout && (
                <div className="text-center p-6 bg-red-100 rounded-xl border border-red-300">
                  <p className="text-red-800 font-medium mb-2">You selected:</p>
                  <p className="text-xl font-bold text-red-900">"{selectedShout}"</p>
                  <p className="text-sm text-red-700 mt-2">Now SHOUT it out loud with all your energy! 🔥</p>
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
                  className="p-6 bg-gradient-to-br from-white to-red-50 rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all text-center"
                >
                  <span className="text-4xl mb-3 block">{choice.emoji}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{choice.text}</h3>
                  <span className="text-sm text-red-600 font-medium">+{choice.points} points</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          {currentStepData.type !== 'energy-release' && currentStepData.type !== 'power-shout' && (
            <div className="flex justify-center mt-8">
              <button
                onClick={nextStep}
                disabled={currentStepData.type === 'voice' && !userResponses[currentStep]}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                {currentStep === STRESS_STEPS.length - 1 ? 'Complete Session' : 'Next Energy Blast'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}