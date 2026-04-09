import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Home, ArrowRight, CheckCircle, Heart, Volume2 } from 'lucide-react';
import { AVAILABLE_VOICES, type VoiceOption } from '../services/speechServices';
import { useTheme } from '../contexts/ThemeContext';

import { httpsCallable, getFunctions } from 'firebase/functions';
import { toast } from 'sonner';

interface TherapyExercise {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'breathing' | 'grounding' | 'affirmation' | 'mindfulness' | 'expression' | 'interactive';
  icon: string;
  color: string;
  steps: number;
}

interface SessionProps {
  exercise: TherapyExercise;
  selectedVoice: VoiceOption;
  onExit: () => void;
}

interface VoiceAnalysis {
  transcript: string;
  confidence: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
}

export default function InteractiveTherapySession({ exercise, selectedVoice, onExit }: SessionProps) {
  const { currentTheme } = useTheme();
  
  // Session state
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const [userResponses, setUserResponses] = useState<VoiceAnalysis[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Firebase functions
  const functions = getFunctions();
  const synthesizeSpeech = httpsCallable<{ 
    text: string; 
    languageCode?: string; 
    voiceName?: string; 
    speakingRate?: number; 
  }, { audioBase64: string }>(functions, 'synthesizeSpeech');
  
  const transcribeAudio = httpsCallable(functions, 'transcribeAudio');

  // Step content for each exercise
  const stepContent = {
    'confidence-builder': {
      1: {
        instruction: {
          'en-IN': `Welcome to your confidence journey! I'm ${selectedVoice.name}. Let's start by acknowledging your strength. Please say aloud: "I am confident and capable." Take your time and speak with conviction.`,
          'hi-IN': `आपकी आत्मविश्वास यात्रा में आपका स्वागत है! मैं ${selectedVoice.name} हूं। आइए अपनी शक्ति को स्वीकार करके शुरुआत करते हैं। कृपया जोर से कहें: "मैं आत्मविश्वासी और सक्षम हूं।"`,
          'mr-IN': `तुमच्या आत्मविश्वास प्रवासात स्वागत! मी ${selectedVoice.name} आहे। चला तुमची शक्ती मान्य करून सुरुवात करूया। कृपया मोठ्याने म्हणा: "मी आत्मविश्वासी आणि सक्षम आहे।"`
        },
        expectedKeywords: ['confident', 'capable', 'strong', 'आत्मविश्वासी', 'सक्षम', 'मजबूत', 'आत्मविश्वास', 'सक्षम'],
        feedback: {
          positive: {
            'en-IN': `Excellent! I can hear the confidence in your voice. You spoke with real conviction. That's the energy we want to build on!`,
            'hi-IN': `बहुत बढ़िया! मैं आपकी आवाज़ में आत्मविश्वास सुन सकता हूं। आपने वास्तविक दृढ़ता के साथ बोला। यही ऊर्जा हमें बढ़ानी है!`,
            'mr-IN': `उत्कृष्ट! मी तुमच्या आवाजात आत्मविश्वास ऐकू शकतो. तुम्ही खऱ्या दृढतेने बोललात. हीच ऊर्जा आम्हाला वाढवायची आहे!`
          },
          encouraging: {
            'en-IN': `Good start! I can sense you're building confidence. Try saying it again with even more power in your voice.`,
            'hi-IN': `अच्छी शुरुआत! मैं महसूस कर सकता हूं कि आप आत्मविश्वास बना रहे हैं। इसे और भी शक्ति के साथ फिर से कहने की कोशिश करें।`,
            'mr-IN': `चांगली सुरुवात! मी जाणवतं की तुम्ही आत्मविश्वास निर्माण करत आहात. आणखी शक्तीने पुन्हा म्हणून पहा.`
          }
        },
        points: 25
      },
      2: {
        instruction: {
          'en-IN': `Step 2: Now, let's celebrate your achievements. Think of something you accomplished recently, no matter how small. Share it with me by saying: "I am proud that I..." and complete the sentence.`,
          'hi-IN': `चरण 2: अब, आइए अपनी उपलब्धियों का जश्न मनाते हैं। हाल ही में आपने जो कुछ भी हासिल किया है, उसके बारे में सोचें। "मुझे गर्व है कि मैंने..." कहकर वाक्य पूरा करें।`,
          'mr-IN': `पायरी 2: आता, चला आपल्या यशाचा उत्सव करूया. अलीकडे तुम्ही जे काही साध्य केले आहे त्याचा विचार करा. "मला अभिमान आहे की मी..." असे म्हणून वाक्य पूर्ण करा.`
        },
        expectedKeywords: ['proud', 'accomplished', 'achieved', 'गर्व', 'हासिल', 'अभिमान', 'साध्य'],
        feedback: {
          positive: {
            'en-IN': `Beautiful! Acknowledging your achievements is so important. You should be proud of yourself. Every success, big or small, matters!`,
            'hi-IN': `सुंदर! अपनी उपलब्धियों को स्वीकार करना बहुत महत्वपूर्ण है। आपको अपने आप पर गर्व होना चाहिए। हर सफलता, बड़ी या छोटी, मायने रखती है!`,
            'mr-IN': `सुंदर! तुमच्या यशाची कबुली देणे खूप महत्वाचे आहे. तुम्हाला स्वतःचा अभिमान वाटला पाहिजे. प्रत्येक यश, मोठे किंवा लहान, महत्वाचे आहे!`
          },
          encouraging: {
            'en-IN': `That's wonderful! Keep building on these positive experiences. You're doing great!`,
            'hi-IN': `यह अद्भुत है! इन सकारात्मक अनुभवों पर निर्माण करते रहें। आप बहुत अच्छा कर रहे हैं!`,
            'mr-IN': `हे अप्रतिम आहे! या सकारात्मक अनुभवांवर निर्माण करत रहा. तुम्ही खूप चांगले करत आहात!`
          }
        },
        points: 30
      },
      3: {
        instruction: {
          'en-IN': `Final step: Let's set a confidence intention. What's one thing you'll do today with more confidence? Say: "Today, I will confidently..." and share your commitment.`,
          'hi-IN': `अंतिम चरण: आइए एक आत्मविश्वास का इरादा निर्धारित करते हैं। आज आप किस एक काम को अधिक आत्मविश्वास के साथ करेंगे? कहें: "आज, मैं आत्मविश्वास से..." और अपनी प्रतिबद्धता साझा करें।`,
          'mr-IN': `अंतिम पायरी: चला एक आत्मविश्वासाचा हेतू ठेवूया. आज तुम्ही कोणते एक काम अधिक आत्मविश्वासाने कराल? म्हणा: "आज, मी आत्मविश्वासाने..." आणि तुमची वचनबद्धता सामायिक करा.`
        },
        expectedKeywords: ['today', 'will', 'confidently', 'आज', 'करूंगा', 'आत्मविश्वास', 'आज', 'करेन', 'आत्मविश्वासाने'],
        feedback: {
          positive: {
            'en-IN': `Perfect! You've set a powerful intention. Remember this commitment and carry this confidence with you. You've completed the Confidence Builder successfully!`,
            'hi-IN': `बिल्कुल सही! आपने एक शक्तिशाली इरादा निर्धारित किया है। इस प्रतिबद्धता को याद रखें और इस आत्मविश्वास को अपने साथ ले जाएं। आपने कॉन्फिडेंस बिल्डर को सफलतापूर्वक पूरा किया है!`,
            'mr-IN': `परफेक्ट! तुम्ही एक शक्तिशाली हेतू ठेवला आहे. ही वचनबद्धता लक्षात ठेवा आणि हा आत्मविश्वास तुमच्यासोबत घेऊन जा. तुम्ही कॉन्फिडन्स बिल्डर यशस्वीरित्या पूर्ण केले आहे!`
          }
        },
        points: 35
      }
    },
    'anxiety-warrior': {
      1: {
        instruction: {
          'en-IN': `Welcome, brave warrior! I'm ${selectedVoice.name}. Let's face anxiety together. First, acknowledge what you're feeling by saying: "I notice my anxiety, and I accept it without judgment."`,
          'hi-IN': `स्वागत है, बहादुर योद्धा! मैं ${selectedVoice.name} हूं। आइए मिलकर चिंता का सामना करते हैं। पहले, यह कहकर स्वीकार करें कि आप क्या महसूस कर रहे हैं: "मैं अपनी चिंता को देखता हूं, और मैं इसे बिना जजमेंट के स्वीकार करता हूं।"`,
          'mr-IN': `स्वागत आहे, धाडसी योद्धा! मी ${selectedVoice.name} आहे. चला एकत्र चिंतेचा सामना करूया. प्रथम, तुम्हाला काय वाटत आहे ते मान्य करून म्हणा: "मी माझी चिंता लक्षात घेतो, आणि मी ती न्याय न करता स्वीकारतो."`
        },
        expectedKeywords: ['anxiety', 'notice', 'accept', 'चिंता', 'देखता', 'स्वीकार', 'चिंता', 'लक्षात', 'स्वीकार'],
        feedback: {
          positive: {
            'en-IN': `Brave! Acknowledging anxiety without judgment is the first step to conquering it. You're already showing warrior strength!`,
            'hi-IN': `बहादुर! बिना जजमेंट के चिंता को स्वीकार करना इसे जीतने का पहला कदम है। आप पहले से ही योद्धा की शक्ति दिखा रहे हैं!`,
            'mr-IN': `धाडसी! न्याय न करता चिंता मान्य करणे हे त्यावर विजय मिळवण्याचे पहिले पाऊल आहे. तुम्ही आधीच योद्ध्याची शक्ती दाखवत आहात!`
          }
        },
        points: 25
      },
      2: {
        instruction: {
          'en-IN': `Step 2: Now let's use the power of breath. We'll do the 4-7-8 technique together. Say: "I breathe in calm for 4, hold peace for 7, release anxiety for 8." Then let's practice it together.`,
          'hi-IN': `चरण 2: अब आइए सांस की शक्ति का उपयोग करते हैं। हम 4-7-8 तकनीक एक साथ करेंगे। कहें: "मैं 4 के लिए शांति में सांस लेता हूं, 7 के लिए शांति रखता हूं, 8 के लिए चिंता छोड़ता हूं।"`,
          'mr-IN': `पायरी 2: आता चला श्वासाची शक्ती वापरूया. आम्ही 4-7-8 तंत्र एकत्र करू. म्हणा: "मी 4 साठी शांततेत श्वास घेतो, 7 साठी शांतता धरतो, 8 साठी चिंता सोडतो."`
        },
        expectedKeywords: ['breathe', 'calm', 'peace', 'release', 'सांस', 'शांति', 'छोड़ता', 'श्वास', 'शांतता', 'सोडतो'],
        feedback: {
          positive: {
            'en-IN': `Excellent breathing work! You're learning to use your breath as a powerful tool against anxiety. Feel that calm energy building!`,
            'hi-IN': `उत्कृष्ट श्वास कार्य! आप अपनी सांस को चिंता के खिलाफ एक शक्तिशाली उपकरण के रूप में उपयोग करना सीख रहे हैं। उस शांत ऊर्जा को महसूस करें!`,
            'mr-IN': `उत्कृष्ट श्वास कार्य! तुम्ही तुमच्या श्वासाचा चिंतेविरुद्ध शक्तिशाली साधन म्हणून वापर करायला शिकत आहात. ती शांत ऊर्जा जाणवा!`
          }
        },
        points: 30
      },
      3: {
        instruction: {
          'en-IN': `Final warrior step: Transform your anxiety into strength! Say with power: "I am stronger than my fears. I choose courage over comfort. I am an anxiety warrior!"`,
          'hi-IN': `अंतिम योद्धा कदम: अपनी चिंता को शक्ति में बदलें! शक्ति के साथ कहें: "मैं अपने डर से मजबूत हूं। मैं आराम पर साहस चुनता हूं। मैं एक चिंता योद्धा हूं!"`,
          'mr-IN': `अंतिम योद्धा पाऊल: तुमची चिंता शक्तीत रूपांतरित करा! शक्तीने म्हणा: "मी माझ्या भीतीपेक्षा मजबूत आहे. मी आरामापेक्षा धैर्य निवडतो. मी एक चिंता योद्धा आहे!"`
        },
        expectedKeywords: ['stronger', 'fears', 'courage', 'warrior', 'मजबूत', 'डर', 'साहस', 'योद्धा', 'मजबूत', 'भीती', 'धैर्य', 'योद्धा'],
        feedback: {
          positive: {
            'en-IN': `POWERFUL! You've transformed from someone who experiences anxiety to an anxiety warrior! Carry this strength with you always. You've conquered this session!`,
            'hi-IN': `शक्तिशाली! आप चिंता का अनुभव करने वाले से एक चिंता योद्धा में बदल गए हैं! इस शक्ति को हमेशा अपने साथ रखें। आपने इस सत्र को जीत लिया है!`,
            'mr-IN': `शक्तिशाली! तुम्ही चिंता अनुभवणाऱ्यापासून चिंता योद्ध्यात रूपांतरित झालात! ही शक्ती नेहमी तुमच्यासोबत ठेवा. तुम्ही हे सत्र जिंकले आहे!`
          }
        },
        points: 35
      }
    }
    // Add more exercises as needed
  };

  // Initialize session
  useEffect(() => {
    startSession();
  }, []);

  const startSession = async () => {
    try {
      const welcomeMessage = getStepInstruction(1);
      await speakMessage(welcomeMessage);
      setWaitingForResponse(true);
      setSessionProgress(33);
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session');
    }
  };

  const getStepInstruction = (step: number) => {
    const exerciseSteps = stepContent[exercise.id as keyof typeof stepContent];
    const stepData = exerciseSteps?.[step as keyof typeof exerciseSteps];
    const instruction = stepData?.instruction;
    return instruction?.[selectedVoice.language as keyof typeof instruction] || 
           instruction?.['en-IN'] || 
           `Step ${step}: Continue with your ${exercise.title} journey.`;
  };

  const speakMessage = async (message: string) => {
    try {
      setIsPlaying(true);
      const result = await synthesizeSpeech({
        text: message,
        languageCode: selectedVoice.language,
        voiceName: selectedVoice.voiceURI || selectedVoice.name,
        speakingRate: selectedVoice.rate || 1.0
      });

      const audioBase64 = result.data.audioBase64;
      if (audioBase64) {
        await playBase64Audio(audioBase64);
      }
    } catch (error) {
      console.error('Error speaking message:', error);
      toast.error('Voice playback failed');
    } finally {
      setIsPlaying(false);
    }
  };

  const playBase64Audio = async (base64String: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
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
        setIsPlaying(false);
      };
      
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mimeType = 'audio/webm;codecs=opus';
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        stream.getTracks().forEach(track => track.stop());
        
        if (audioBlob.size > 0) {
          await processVoiceInput(audioBlob);
        }
        setIsListening(false);
      };

      mediaRecorderRef.current.start();
      toast.info('🎤 Listening... Speak now!');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast.error('Microphone access failed');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const result = await transcribeAudio({
        audioBytes: audioBase64,
        languageCode: selectedVoice.language,
        alternativeLanguageCodes: ['en-IN'],
        sampleRateHertz: 48000
      });

      const resultData = result.data as { transcription: string; confidence: number };
      const transcript = resultData.transcription;

      if (transcript) {
        const analysis = analyzeResponse(transcript);
        setUserResponses(prev => [...prev, analysis]);
        await provideFeedback(analysis);
        
        // Move to next step or complete session
        if (currentStep < exercise.steps) {
          setTimeout(() => {
            setCurrentStep(prev => prev + 1);
            setSessionProgress(((currentStep + 1) / exercise.steps) * 100);
            nextStep();
          }, 3000);
        } else {
          setTimeout(() => {
            completeSession();
          }, 3000);
        }
      } else {
        toast.error('Could not understand your response. Please try again.');
        setWaitingForResponse(true);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast.error('Failed to process your response');
      setWaitingForResponse(true);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const analyzeResponse = (transcript: string): VoiceAnalysis => {
    const exerciseSteps = stepContent[exercise.id as keyof typeof stepContent];
    const stepData = exerciseSteps?.[currentStep as keyof typeof exerciseSteps];
    const expectedKeywords = stepData?.expectedKeywords || [];
    
    const foundKeywords = expectedKeywords.filter(keyword => 
      transcript.toLowerCase().includes(keyword.toLowerCase())
    );
    
    const confidence = foundKeywords.length / Math.max(expectedKeywords.length, 1);
    const sentiment = confidence > 0.5 ? 'positive' : confidence > 0.2 ? 'neutral' : 'negative';
    
    return {
      transcript,
      confidence,
      sentiment,
      keywords: foundKeywords
    };
  };

  const provideFeedback = async (analysis: VoiceAnalysis) => {
    const exerciseSteps = stepContent[exercise.id as keyof typeof stepContent];
    const stepData = exerciseSteps?.[currentStep as keyof typeof exerciseSteps];
    const feedback = stepData?.feedback;
    
    let feedbackMessage = '';
    let points = 0;
    
    if (analysis.confidence > 0.5) {
      const positiveFeedback = feedback?.positive;
      feedbackMessage = positiveFeedback?.[selectedVoice.language as keyof typeof positiveFeedback] || 
                       positiveFeedback?.['en-IN'] || 
                       'Great job! You\'re doing wonderfully!';
      points = stepData?.points || 20;
    } else {
      const encouragingFeedback = feedback?.encouraging;
      feedbackMessage = encouragingFeedback?.[selectedVoice.language as keyof typeof encouragingFeedback] || 
                       encouragingFeedback?.['en-IN'] || 
                       'Good effort! Keep going, you\'re making progress!';
      points = Math.floor((stepData?.points || 20) * 0.7);
    }
    
    setCurrentFeedback(feedbackMessage);
    setSessionPoints(prev => prev + points);
    setWaitingForResponse(false);
    
    await speakMessage(feedbackMessage);
    toast.success(`+${points} points! Great response!`);
  };

  const nextStep = async () => {
    if (currentStep < exercise.steps) {
      const nextInstruction = getStepInstruction(currentStep);
      await speakMessage(nextInstruction);
      setWaitingForResponse(true);
      setCurrentFeedback('');
    }
  };

  const completeSession = async () => {
    setIsSessionComplete(true);
    setSessionProgress(100);
    
    const completionMessage = {
      'en-IN': `Congratulations! You've completed the ${exercise.title} session brilliantly! You earned ${sessionPoints} points and showed incredible growth. I'm proud of your commitment to your mental wellness journey.`,
      'hi-IN': `बधाई हो! आपने ${exercise.title} सत्र को शानदार तरीके से पूरा किया है! आपने ${sessionPoints} अंक अर्जित किए और अविश्वसनीय विकास दिखाया। मुझे आपकी मानसिक कल्याण यात्रा के प्रति प्रतिबद्धता पर गर्व है।`,
      'mr-IN': `अभिनंदन! तुम्ही ${exercise.title} सत्र उत्कृष्टपणे पूर्ण केले आहे! तुम्ही ${sessionPoints} गुण मिळवले आणि अविश्वसनीय वाढ दाखवली. तुमच्या मानसिक कल्याण प्रवासाच्या वचनबद्धतेचा मला अभिमान आहे.`
    };
    
    const message = completionMessage[selectedVoice.language as keyof typeof completionMessage] || 
                   completionMessage['en-IN'];
    
    await speakMessage(message);
    toast.success('🎉 Session completed successfully!');
  };

  return (
    <div className={`relative ${currentTheme === 'whatsapp' ? 'whatsapp-main-bg' : ''}`}>
      {currentTheme === 'whatsapp' && (
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-[#00A884]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-[#25D366]/10 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className={`p-6 ${currentTheme === 'ocean'
          ? 'bg-white/10 backdrop-blur-md border-b border-white/20'
          : 'bg-white/90 backdrop-blur-md border-b border-gray-200'
          }`}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${exercise.color.replace('from-', 'bg-').split(' ')[0]}`}>
                <span className="text-2xl">{exercise.icon}</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                  {exercise.title}
                </h1>
                <p className={`text-sm ${currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}`}>
                  Guided by {selectedVoice.name} • Step {currentStep}/{exercise.steps}
                </p>
              </div>
            </div>
            <button
              onClick={onExit}
              className={`px-4 py-2 rounded-lg transition-colors ${currentTheme === 'ocean'
                ? 'bg-white/20 text-black hover:bg-white/30'
                : 'bg-gray-100 text-black hover:bg-gray-200'
                }`}
            >
              <Home className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`p-4 ${currentTheme === 'ocean'
          ? 'bg-white/5 backdrop-blur-md'
          : 'bg-gray-50'
          }`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                Session Progress
              </span>
              <span className={`text-sm ${currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}`}>
                {Math.round(sessionProgress)}% • {sessionPoints} points
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${exercise.color} transition-all duration-500`}
                style={{ width: `${sessionProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {!isSessionComplete ? (
              <div className="space-y-6">
                {/* Current Step */}
                <div className={`p-8 rounded-xl text-center ${currentTheme === 'ocean'
                  ? 'bg-white/20 backdrop-blur-md border border-white/30'
                  : 'bg-white shadow-lg border border-gray-200'
                  }`}>
                  <div className="mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${exercise.color.replace('from-', 'bg-').split(' ')[0]}`}>
                      <span className="text-2xl text-white font-bold">{currentStep}</span>
                    </div>
                    <h2 className={`text-2xl font-bold mb-4 ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                      Step {currentStep}: {exercise.title}
                    </h2>
                    <p className={`text-lg ${currentTheme === 'ocean' ? 'text-black/80' : 'text-black/70'}`}>
                      {getStepInstruction(currentStep)}
                    </p>
                  </div>

                  {/* Voice Controls */}
                  <div className="flex justify-center gap-4 mb-6">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isPlaying || !waitingForResponse}
                      className={`px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : waitingForResponse
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          {waitingForResponse ? 'Start Speaking' : 'Processing...'}
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => speakMessage(getStepInstruction(currentStep))}
                      disabled={isPlaying || isListening}
                      className={`px-6 py-4 rounded-xl font-semibold transition-colors ${currentTheme === 'ocean'
                        ? 'bg-white/20 text-black hover:bg-white/30'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        } ${(isPlaying || isListening) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className={currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}>
                        {isPlaying ? 'Speaking...' : 'Ready'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                      <span className={currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}>
                        {isListening ? 'Listening...' : 'Waiting'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {currentFeedback && (
                  <div className={`p-6 rounded-xl ${currentTheme === 'ocean'
                    ? 'bg-green-50/50 border border-green-200'
                    : 'bg-green-50 border border-green-200'
                    }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-800">Feedback from {selectedVoice.name}</h3>
                    </div>
                    <p className="text-green-700">{currentFeedback}</p>
                  </div>
                )}

                {/* User Responses */}
                {userResponses.length > 0 && (
                  <div className={`p-6 rounded-xl ${currentTheme === 'ocean'
                    ? 'bg-white/10 backdrop-blur-md border border-white/20'
                    : 'bg-gray-50 border border-gray-200'
                    }`}>
                    <h3 className={`font-semibold mb-4 ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                      Your Responses
                    </h3>
                    <div className="space-y-3">
                      {userResponses.map((response, index) => (
                        <div key={index} className={`p-3 rounded-lg ${currentTheme === 'ocean'
                          ? 'bg-white/10'
                          : 'bg-white'
                          }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                              Step {index + 1}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              response.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                              response.sentiment === 'neutral' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {Math.round(response.confidence * 100)}% match
                            </span>
                          </div>
                          <p className={`text-sm ${currentTheme === 'ocean' ? 'text-black/80' : 'text-black/70'}`}>
                            "{response.transcript}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Session Complete */
              <div className={`p-8 rounded-xl text-center ${currentTheme === 'ocean'
                ? 'bg-white/20 backdrop-blur-md border border-white/30'
                : 'bg-white shadow-lg border border-gray-200'
                }`}>
                <div className="mb-6">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h2 className={`text-3xl font-bold mb-4 ${currentTheme === 'ocean' ? 'text-black' : 'text-black'}`}>
                    🎉 Session Complete!
                  </h2>
                  <p className={`text-lg mb-6 ${currentTheme === 'ocean' ? 'text-black/80' : 'text-black/70'}`}>
                    Congratulations! You've successfully completed the {exercise.title} session.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className={`p-4 rounded-lg ${currentTheme === 'ocean' ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-green-600">{sessionPoints}</div>
                      <div className={`text-sm ${currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}`}>Points Earned</div>
                    </div>
                    <div className={`p-4 rounded-lg ${currentTheme === 'ocean' ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-blue-600">{exercise.steps}</div>
                      <div className={`text-sm ${currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}`}>Steps Completed</div>
                    </div>
                    <div className={`p-4 rounded-lg ${currentTheme === 'ocean' ? 'bg-white/10' : 'bg-gray-50'}`}>
                      <div className="text-2xl font-bold text-purple-600">{userResponses.length}</div>
                      <div className={`text-sm ${currentTheme === 'ocean' ? 'text-black/70' : 'text-black/60'}`}>Voice Interactions</div>
                    </div>
                  </div>

                  <button
                    onClick={onExit}
                    className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 bg-gradient-to-r ${exercise.color} hover:shadow-lg`}
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-5 h-5" />
                      Return to Voice Therapy
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}