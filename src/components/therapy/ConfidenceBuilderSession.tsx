// Confidence Builder Therapy Session - Interactive UI
// Builds self-confidence through voice exercises and challenges

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Play, CheckCircle, ArrowRight, Volume2, Trophy } from 'lucide-react';
import { SpeechToTextInput } from '../SpeechToTextInput';
import { AVAILABLE_VOICES, type VoiceOption } from '../../services/speechServices';
import { useAuth } from '../auth/AuthProvider';
import { toast } from 'sonner';
import { havenSpeak, havenSpeakStop } from '../../services/havenTTS';

interface ConfidenceStep {
  id: number;
  title: string;
  instruction: string;
  voiceGuide: string;
  type: 'voice' | 'choice' | 'breathing' | 'affirmation';
  challenge?: string;
  choices?: Array<{
    id: string;
    text: string;
    emoji: string;
    points: number;
  }>;
  affirmations?: string[];
  points: number;
}

// Multilingual voice guidance for confidence building
const getMultilingualVoiceGuide = (stepId: number, language: string) => {
  const guides = {
    1: {
      'en-IN': "Welcome to your confidence building journey! I'm here to help you unlock your inner strength. Let's begin by talking about how confident you feel right now.",
      'hi-IN': "आत्मविश्वास निर्माण की यात्रा में आपका स्वागत है! मैं यहाँ आपकी आंतरिक शक्ति को जगाने में मदद करने के लिए हूँ। आइए बात करते हैं कि आप अभी कितना आत्मविश्वास महसूस करते हैं।",
      'bn-IN': "আত্মবিশ্বাস গড়ার যাত্রায় আপনাকে স্বাগতম! আমি এখানে আপনার অন্তর্নিহিত শক্তি জাগাতে সাহায্য করতে এসেছি। আসুন কথা বলি যে আপনি এখন কতটা আত্মবিশ্বাসী বোধ করছেন।",
      'mr-IN': "आत्मविश्वास निर्माणाच्या प्रवासात तुमचे स्वागत आहे! मी तुमची अंतर्गत शक्ती जागृत करण्यासाठी येथे आहे। तुम्ही सध्या किती आत्मविश्वास अनुभवता याबद्दल बोलूया।",
      'ta-IN': "நம்பிக்கை வளர்ப்பு பயணத்திற்கு உங்களை வரவேற்கிறேன்! உங்கள் உள்ளார்ந்த வலிமையை வெளிப்படுத்த நான் இங்கே இருக்கிறேன். நீங்கள் இப்போது எவ்வளவு நம்பிக்கையுடன் உணர்கிறீர்கள் என்பதைப் பற்றி பேசுவோம்।",
      'te-IN': "ఆత్మవిశ్వాస నిర్మాణ ప్రయాణానికి మిమ్మల్ని స్వాగతం! మీ అంతర్గత శక్తిని వెలికితీసేందుకు నేను ఇక్కడ ఉన్నాను. మీరు ఇప్పుడు ఎంత ఆత్మవిశ్వాసంతో ఉన్నారో మాట్లాడుకుందాం।",
      'gu-IN': "આત્મવિશ્વાસ નિર્માણની યાત્રામાં તમારું સ્વાગત છે! તમારી આંતરિક શક્તિને જગાડવા માટે હું અહીં છું. તમે અત્યારે કેટલો આત્મવિશ્વાસ અનુભવો છો તે વિશે વાત કરીએ।",
      'kn-IN': "ಆತ್ಮವಿಶ್ವಾಸ ನಿರ್ಮಾಣದ ಪ್ರಯಾಣಕ್ಕೆ ನಿಮಗೆ ಸ್ವಾಗತ! ನಿಮ್ಮ ಆಂತರಿಕ ಶಕ್ತಿಯನ್ನು ಬಿಡುಗಡೆ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ನೀವು ಈಗ ಎಷ್ಟು ಆತ್ಮವಿಶ್ವಾಸ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂಬುದರ ಬಗ್ಗೆ ಮಾತನಾಡೋಣ।",
      'ml-IN': "ആത്മവിശ്വാസ നിർമ്മാണ യാത്രയിലേക്ക് സ്വാഗതം! നിങ്ങളുടെ ആന്തരിക ശക്തി ഉണർത്താൻ ഞാൻ ഇവിടെയുണ്ട്. നിങ്ങൾ ഇപ്പോൾ എത്രമാത്രം ആത്മവിശ്വാസം അനുഭവിക്കുന്നു എന്നതിനെക്കുറിച്ച് സംസാരിക്കാം।"
    },
    2: {
      'en-IN': "Now let's work on your power posture. Stand up straight, shoulders back, and speak these affirmations with confidence and strength.",
      'hi-IN': "अब आइए अपनी शक्तिशाली मुद्रा पर काम करते हैं। सीधे खड़े हों, कंधे पीछे करें, और इन सकारात्मक वाक्यों को आत्मविश्वास और शक्ति के साथ बोलें।",
      'bn-IN': "এখন আসুন আপনার শক্তিশালী ভঙ্গিতে কাজ করি। সোজা হয়ে দাঁড়ান, কাঁধ পিছনে রাখুন, এবং এই ইতিবাচক বাক্যগুলি আত্মবিশ্বাস ও শক্তির সাথে বলুন।",
      'mr-IN': "आता आपल्या सामर्थ्यवान मुद्रेवर काम करूया। सरळ उभे राहा, खांदे मागे करा, आणि हे सकारात्मक वाक्य आत्मविश्वास आणि शक्तीने बोला।",
      'ta-IN': "இப்போது உங்கள் வலிமையான நிலைப்பாட்டில் வேலை செய்வோம். நேராக நிற்கவும், தோள்களை பின்னால் வைக்கவும், இந்த உறுதிமொழிகளை நம்பிக்கையுடனும் வலிமையுடனும் பேசுங்கள்।",
      'te-IN': "ఇప్పుడు మీ శక్తివంతమైన భంగిమపై పని చేద్దాం. నిటారుగా నిలబడండి, భుజాలను వెనుకకు ఉంచండి, మరియు ఈ ధృవీకరణలను ఆత్మవిశ్వాసంతో మరియు బలంతో మాట్లాడండి।",
      'gu-IN': "હવે આપણે તમારી શક્તિશાળી મુદ્રા પર કામ કરીએ. સીધા ઊભા રહો, ખભા પાછળ રાખો, અને આ સકારાત્મક વાક્યો આત્મવિશ્વાસ અને શક્તિ સાથે બોલો।",
      'kn-IN': "ಈಗ ನಿಮ್ಮ ಶಕ್ತಿಯುತ ಭಂಗಿಯ ಮೇಲೆ ಕೆಲಸ ಮಾಡೋಣ. ನೇರವಾಗಿ ನಿಂತುಕೊಳ್ಳಿ, ಭುಜಗಳನ್ನು ಹಿಂದಕ್ಕೆ ಇರಿಸಿ, ಮತ್ತು ಈ ಧೃಢೀಕರಣಗಳನ್ನು ಆತ್ಮವಿಶ್ವಾಸ ಮತ್ತು ಶಕ್ತಿಯಿಂದ ಮಾತನಾಡಿ।",
      'ml-IN': "ഇപ്പോൾ നിങ്ങളുടെ ശക്തമായ ഭാവത്തിൽ പ്രവർത്തിക്കാം. നേരെ നിൽക്കുക, തോളുകൾ പിന്നിലേക്ക് വയ്ക്കുക, ഈ സ്ഥിരീകരണങ്ങൾ ആത്മവിശ്വാസത്തോടും ശക്തിയോടും കൂടി പറയുക।"
    },
    3: {
      'en-IN': "Great work! Now let's take on a confidence challenge. Choose the approach that resonates most with you right now.",
      'hi-IN': "बहुत बढ़िया काम! अब आइए एक आत्मविश्वास चुनौती लेते हैं। वह तरीका चुनें जो अभी आपके साथ सबसे अधिक मेल खाता है।",
      'bn-IN': "দুর্দান্ত কাজ! এখন আসুন একটি আত্মবিশ্বাসের চ্যালেঞ্জ নিই। এমন পদ্ধতি বেছে নিন যা এখন আপনার সাথে সবচেয়ে বেশি মিলে।",
      'mr-IN': "उत्कृष्ट काम! आता आत्मविश्वासाचे आव्हान घेऊया। असा दृष्टिकोन निवडा जो सध्या तुमच्याशी सर्वात जास्त जुळतो।",
      'ta-IN': "அருமையான வேலை! இப்போது ஒரு நம்பிக்கை சவாலை எடுத்துக்கொள்வோம். இப்போது உங்களுடன் மிகவும் பொருந்தும் அணுகுமுறையைத் தேர்ந்தெடுக்கவும்।",
      'te-IN': "అద్భుతమైన పని! ఇప్పుడు ఆత్మవిశ్వాస సవాలును తీసుకుందాం. ఇప్పుడు మీతో అత్యంత సరిపోయే విధానాన్ని ఎంచుకోండి।",
      'gu-IN': "શાનદાર કામ! હવે આત્મવિશ્વાસનો પડકાર લઈએ. એવો અભિગમ પસંદ કરો જે અત્યારે તમારી સાથે સૌથી વધુ મેળ ખાય છે।",
      'kn-IN': "ಅದ್ಭುತ ಕೆಲಸ! ಈಗ ಆತ್ಮವಿಶ್ವಾಸದ ಸವಾಲನ್ನು ತೆಗೆದುಕೊಳ್ಳೋಣ. ಇದೀಗ ನಿಮ್ಮೊಂದಿಗೆ ಹೆಚ್ಚು ಹೊಂದಿಕೆಯಾಗುವ ವಿಧಾನವನ್ನು ಆರಿಸಿ।",
      'ml-IN': "മികച്ച പ്രവർത്തനം! ഇപ്പോൾ ഒരു ആത്മവിശ്വാസ വെല്ലുവിളി ഏറ്റെടുക്കാം. ഇപ്പോൾ നിങ്ങളുമായി ഏറ്റവും കൂടുതൽ പൊരുത്തപ്പെടുന്ന സമീപനം തിരഞ്ഞെടുക്കുക।"
    },
    4: {
      'en-IN': "You've done amazing work! Let's reflect on what you've learned about your confidence today.",
      'hi-IN': "आपने अद्भुत काम किया है! आइए सोचते हैं कि आज आपने अपने आत्मविश्वास के बारे में क्या सीखा है।",
      'bn-IN': "আপনি অসাধারণ কাজ করেছেন! আসুন ভাবি যে আজ আপনি আপনার আত্মবিশ্বাস সম্পর্কে কী শিখেছেন।",
      'mr-IN': "तुम्ही अप्रतिम काम केले आहे! आज तुम्ही तुमच्या आत्मविश्वासाबद्दल काय शिकलात यावर विचार करूया।",
      'ta-IN': "நீங்கள் அற்புதமான வேலை செய்துள்ளீர்கள்! இன்று உங்கள் நம்பிக்கையைப் பற்றி நீங்கள் கற்றுக்கொண்டதைப் பற்றி சிந்திப்போம்।",
      'te-IN': "మీరు అద్భుతమైన పని చేశారు! ఈరోజు మీ ఆత్మవిశ్వాసం గురించి మీరు నేర్చుకున్న దాని గురించి ఆలోచిద్దాం।",
      'gu-IN': "તમે અદ્ભુત કામ કર્યું છે! આજે તમે તમારા આત્મવિશ્વાસ વિશે શું શીખ્યા તેના પર વિચાર કરીએ।",
      'kn-IN': "ನೀವು ಅದ್ಭುತ ಕೆಲಸ ಮಾಡಿದ್ದೀರಿ! ಇಂದು ನಿಮ್ಮ ಆತ್ಮವಿಶ್ವಾಸದ ಬಗ್ಗೆ ನೀವು ಕಲಿತದ್ದನ್ನು ಪ್ರತಿಬಿಂಬಿಸೋಣ।",
      'ml-IN': "നിങ്ങൾ അത്ഭുതകരമായ പ്രവർത്തനം ചെയ്തു! ഇന്ന് നിങ്ങളുടെ ആത്മവിശ്വാസത്തെക്കുറിച്ച് നിങ്ങൾ പഠിച്ചതിനെക്കുറിച്ച് ചിന്തിക്കാം।"
    }
  };

  const languageKey = language.split('-')[0]; // 'hi-IN' -> 'hi'
  return guides[stepId as keyof typeof guides]?.[language] || 
         guides[stepId as keyof typeof guides]?.['en-IN'] || 
         "Let's continue with your confidence building journey.";
};

const CONFIDENCE_STEPS: ConfidenceStep[] = [
  {
    id: 1,
    title: "Welcome to Confidence Building",
    instruction: "Let's start by understanding your current confidence level",
    voiceGuide: "", // Will be set dynamically based on selected voice
    type: 'voice',
    challenge: "Tell me about a situation where you felt really confident. What made you feel that way?",
    points: 20
  },
  {
    id: 2,
    title: "Power Posture & Voice",
    instruction: "Stand tall and speak with authority",
    voiceGuide: "", // Will be set dynamically based on selected voice
    type: 'affirmation',
    affirmations: [
      "I am confident and capable",
      "I believe in myself and my abilities", 
      "I speak with clarity and conviction",
      "I am worthy of success and respect"
    ],
    points: 30
  },
  {
    id: 3,
    title: "Confidence Challenge",
    instruction: "Choose your confidence-building approach",
    voiceGuide: "", // Will be set dynamically based on selected voice
    type: 'choice',
    choices: [
      {
        id: 'public-speaking',
        text: 'Practice Public Speaking',
        emoji: '🎤',
        points: 40
      },
      {
        id: 'self-advocacy',
        text: 'Self-Advocacy Exercise',
        emoji: '💪',
        points: 40
      },
      {
        id: 'leadership',
        text: 'Leadership Scenario',
        emoji: '👑',
        points: 40
      }
    ],
    points: 40
  },
  {
    id: 4,
    title: "Confidence Reflection",
    instruction: "Reflect on your confidence journey",
    voiceGuide: "", // Will be set dynamically based on selected voice
    type: 'voice',
    challenge: "What's one thing you'll do differently tomorrow to show more confidence?",
    points: 30
  }
];

export default function ConfidenceBuilderSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();
  
  // Get voice and exercise data from navigation state
  const navigationState = location.state as { exercise?: any; selectedVoice?: VoiceOption };
  
  // Session state
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  // Voice state - use passed voice or fallback
  const [selectedVoice] = useState<VoiceOption>(() => {
    // Prefer voice passed via navigation if it has backend support
    if (navigationState?.selectedVoice && navigationState.selectedVoice.backendVoiceId) {
      return navigationState.selectedVoice;
    }

    // Try saved user preference that has backend support
    const savedVoiceURI = userProfile?.preferences?.selectedVoice;
    if (savedVoiceURI) {
      const savedVoice = AVAILABLE_VOICES.find(
        v => (v.id === savedVoiceURI || v.name === savedVoiceURI) && v.backendVoiceId
      );
      if (savedVoice) return savedVoice;
    }

    // Fallback to first voice with backendVoiceId
    const fallback = AVAILABLE_VOICES.find(v => v.backendVoiceId);
    return fallback ?? AVAILABLE_VOICES[0]!;
  });

  // Timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Speak welcome message in selected voice language
    const welcomeMessage = getMultilingualVoiceGuide(1, selectedVoice.language);
    speakText(welcomeMessage);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      havenSpeakStop();
    };
  }, [selectedVoice.language]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const speakText = async (text: string) => {
    havenSpeakStop();
    await havenSpeak(
      text,
      selectedVoice.language || 'en-IN',
      selectedVoice.rate || 1.0,
      selectedVoice.backendVoiceId
    );
  };

  const handleVoiceResponse = (transcript: string, confidence: number) => {
    if (transcript.trim()) {
      const newResponses = [...userResponses];
      newResponses[currentStep] = transcript;
      setUserResponses(newResponses);
      
      const step = CONFIDENCE_STEPS[currentStep];
      setTotalPoints(prev => prev + step.points);
      
      toast.success(`Great response! +${step.points} confidence points`);
      
      // Auto-advance after voice response
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
    toast.success(`${choice.emoji} ${choice.text} - +${choice.points} points!`);
    
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  const handleAffirmationComplete = () => {
    const step = CONFIDENCE_STEPS[currentStep];
    setTotalPoints(prev => prev + step.points);
    toast.success(`Powerful affirmations! +${step.points} confidence points`);
    
    setTimeout(() => {
      nextStep();
    }, 2000);
  };

  const nextStep = () => {
    if (currentStep < CONFIDENCE_STEPS.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      setSessionProgress(((newStep + 1) / CONFIDENCE_STEPS.length) * 100);
      
      // Speak next step in selected voice language
      const nextStepMessage = getMultilingualVoiceGuide(newStep + 1, selectedVoice.language);
      speakText(nextStepMessage);
    } else {
      completeSession();
    }
  };

  const completeSession = () => {
    setIsCompleted(true);
    setSessionProgress(100);
    
    const completionMessage = `Congratulations! You've completed the Confidence Builder session and earned ${totalPoints} confidence points! You're becoming more confident every day.`;
    speakText(completionMessage);
    
    toast.success('🏆 Confidence Builder Session Complete!');
  };

  const currentStepData = CONFIDENCE_STEPS[currentStep];

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">🎉 Session Complete!</h2>
            <p className="text-xl text-gray-600">You've built incredible confidence today!</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{formatTime(sessionTime)}</div>
              <div className="text-sm text-gray-500">Time Invested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{totalPoints}</div>
              <div className="text-sm text-gray-500">Confidence Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{CONFIDENCE_STEPS.length}</div>
              <div className="text-sm text-gray-500">Steps Completed</div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🦁 Your Confidence Achievements</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 p-3 bg-yellow-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800">Completed voice confidence challenges</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-orange-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span className="text-orange-800">Practiced power affirmations</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-3 bg-red-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">Built inner strength and self-belief</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/voice')}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-orange-100">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-yellow-200 p-4">
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
              🦁 Confidence Builder
            </h1>
            <p className="text-gray-600">Unlock your inner strength</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Volume2 className="w-4 h-4" />
              <span>Guided by {selectedVoice.name} ({selectedVoice.language})</span>
            </div>
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
              Step {currentStep + 1} of {CONFIDENCE_STEPS.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(sessionProgress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
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
            <div className="flex items-center justify-center gap-4 p-4 bg-yellow-50 rounded-lg">
              <Volume2 className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 italic">
                "{getMultilingualVoiceGuide(currentStep + 1, selectedVoice.language)}"
              </p>
              <button
                onClick={() => speakText(getMultilingualVoiceGuide(currentStep + 1, selectedVoice.language))}
                className="p-2 bg-yellow-200 rounded-full hover:bg-yellow-300 transition-colors"
              >
                <Play className="w-4 h-4 text-yellow-700" />
              </button>
            </div>
          </div>

          {/* Step Content */}
          {currentStepData.type === 'voice' && (
            <div className="space-y-6">
              {currentStepData.challenge && (
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400">
                  <h3 className="font-semibold text-gray-900 mb-2">💪 Confidence Challenge:</h3>
                  <p className="text-gray-700">{currentStepData.challenge}</p>
                </div>
              )}
              
              <SpeechToTextInput
                onTranscript={handleVoiceResponse}
                placeholder="Click the microphone and speak with confidence..."
                showLanguageSelector={true}
                showConfidence={true}
                className="w-full"
              />
              
              {userResponses[currentStep] && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-600 mb-1">✅ Your Confident Response:</p>
                  <p className="text-gray-800 font-medium">"{userResponses[currentStep]}"</p>
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
                  className="p-6 bg-gradient-to-br from-white to-yellow-50 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 hover:shadow-lg transition-all text-center"
                >
                  <span className="text-4xl mb-3 block">{choice.emoji}</span>
                  <h3 className="font-semibold text-gray-900 mb-2">{choice.text}</h3>
                  <span className="text-sm text-yellow-600 font-medium">+{choice.points} points</span>
                </button>
              ))}
            </div>
          )}

          {currentStepData.type === 'affirmation' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-lg text-gray-700 mb-4">
                  Stand tall, speak clearly, and repeat these powerful affirmations:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentStepData.affirmations?.map((affirmation, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300"
                  >
                    <p className="text-center font-medium text-gray-800">
                      "{affirmation}"
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleAffirmationComplete}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 font-medium"
                >
                  ✨ I've Spoken These Affirmations
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-center mt-8">
            <button
              onClick={nextStep}
              disabled={currentStepData.type === 'voice' && !userResponses[currentStep]}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              {currentStep === CONFIDENCE_STEPS.length - 1 ? 'Complete Session' : 'Next Step'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}