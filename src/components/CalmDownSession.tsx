import { useState, useEffect, useRef, useCallback } from 'react';
import VantaBackground from './VantaBackground';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import {
  ArrowLeft,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  ChevronRight,
  Loader2, // *** NEW ***
} from 'lucide-react';
import type { Screen } from '../types';
import { useAuth } from './auth/AuthProvider';
import { supabaseService } from '../services/supabaseService';
import type { JournalEntry } from '../services/supabaseService';
import { useTheme } from '../contexts/ThemeContext';

interface CalmDownSessionProps {
  navigateTo: (screen: Screen) => void;
}

export function CalmDownSession({ navigateTo }: CalmDownSessionProps) {
  const { currentTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for breathing
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [journalText, setJournalText] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSoundscape, setSelectedSoundscape] = useState('rain');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isSaving, setIsSaving] = useState(false); // *** NEW ***
  const { currentUser } = useAuth(); // *** NEW ***

  // Function to properly stop and cleanup audio
  const stopAndCleanupAudio = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.log('Error cleaning up audio:', error);
    }
    setIsAudioPlaying(false);
  }, []);

  // Public-domain/royalty-free ambience loops
  // Fallback-safe: if a URL fails, playback is silently ignored
  const remoteSoundUrls: Record<string, string> = {
    rain: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_6a8d9b3b6c.mp3?filename=rain-ambient-110397.mp3',
    forest:
      'https://cdn.pixabay.com/download/audio/2022/03/10/audio_1b3f2f9bfd.mp3?filename=forest-birds-ambient-109662.mp3',
    ocean:
      'https://cdn.pixabay.com/download/audio/2021/08/08/audio_2ab2a3a812.mp3?filename=ocean-waves-ambient-6103.mp3',
    birds:
      'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9b2a0b1b93.mp3?filename=morning-birds-110398.mp3',
  };

  // Prefer local assets first; place files in src/assets/sounds/
  // Filenames expected: rain.mp3, forest.mp3, ocean.mp3, birds.mp3
  const localSoundUrls: Record<string, string> = {
    rain: new URL('../assets/sounds/rain.mp3', import.meta.url).href,
    forest: new URL('../assets/sounds/forest.mp3', import.meta.url).href,
    ocean: new URL('../assets/sounds/ocean.mp3', import.meta.url).href,
    birds: new URL('../assets/sounds/birds.mp3', import.meta.url).href,
  };

  const steps = [
    {
      title: 'सांस लेना / Breathing',
      subtitle:
        "गहरी सांस के साथ शुरू करते हैं / Let's start with deep breathing",
    },
    {
      title: 'ग्राउंडिंग / Grounding',
      subtitle: '5-4-3-2-1 तकनीक / 5-4-3-2-1 technique',
    },
    {
      title: 'जर्नलिंग / Journaling',
      subtitle: 'अपने विचार लिखें / Write your thoughts',
    },
    {
      title: 'शांत आवाज़ें / Soundscape',
      subtitle: 'आरामदायक आवाज़ें सुनें / Listen to calming sounds',
    },
    {
      title: 'सकारात्मक सोच / Reflection',
      subtitle: 'अपनी प्रगति देखें / Reflect on your progress',
    },
  ];

  const soundscapes = [
    { id: 'rain', name: 'बारिश / Rain', emoji: '🌧️' },
    { id: 'forest', name: 'जंगल / Forest', emoji: '🌲' },
    { id: 'ocean', name: 'समुद्र / Ocean', emoji: '🌊' },
    { id: 'birds', name: 'पक्षी / Birds', emoji: '🐦' },
  ];

  const groundingItems = [
    { count: 5, type: 'चीज़ें जो आप देख सकते हैं / Things you can see' },
    { count: 4, type: 'चीज़ें जो आप छू सकते हैं / Things you can touch' },
    { count: 3, type: 'आवाज़ें जो आप सुन सकते हैं / Sounds you can hear' },
    { count: 2, type: 'खुशबू जो आप सूंघ सकते हैं / Scents you can smell' },
    { count: 1, type: 'स्वाद जो आप चख सकते हैं / Taste you can notice' },
  ];

  const positiveReflections = [
    'आपने आज अपनी देखभाल के लिए समय निकाला है। यह बहुत महत्वपूर्ण है। / You took time for self-care today. This is very important.',
    "हर गहरी सांस के साथ आप शांति के करीब आ रहे हैं। / With every deep breath, you're getting closer to peace.",
    'यह कठिन समय भी गुज़र जाएगा। आप मजबूत हैं। / This difficult time will also pass. You are strong.',
    'आपकी भावनाएं सही हैं, और आप अकेले नहीं हैं। / Your feelings are valid, and you are not alone.',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      setIsActive(false);
    }
  }, [timeLeft]);

  // Handle soundscape playback
  useEffect(() => {
    // 1. Create the audio element ONCE if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio();
      audio.loop = true;
      audio.volume = 0.3;
      audio.preload = 'auto';

      audio.addEventListener('play', () => setIsAudioPlaying(true));
      audio.addEventListener('pause', () => setIsAudioPlaying(false));
      audio.addEventListener('ended', () => setIsAudioPlaying(false));
      audio.addEventListener('canplaythrough', () => console.log('Audio loaded'));
      audio.addEventListener('error', (e) => {
        console.log('Audio error event:', e);
        const currentSrc = audioRef.current?.src;
        const fallbackUrl = remoteSoundUrls[selectedSoundscape];

        if (fallbackUrl && currentSrc !== fallbackUrl) {
          if (audioRef.current) {
            audioRef.current.src = fallbackUrl;
            audioRef.current.load();
          }
        }
      });
      audioRef.current = audio;
    }

    // 2. Now, manage the state of the audio element
    const audio = audioRef.current;
    const shouldBePlaying = (currentStep === 3 && soundEnabled);

    if (shouldBePlaying) {
      const primaryUrl = localSoundUrls[selectedSoundscape];
      const fallbackUrl = remoteSoundUrls[selectedSoundscape];
      const targetUrl = primaryUrl || fallbackUrl || '';

      // 3. Only change the source if it's different
      if (audio.src !== primaryUrl && audio.src !== fallbackUrl) {
        audio.pause();
        setIsAudioPlaying(false);
        audio.src = targetUrl;
        audio.load();
      }
    } else {
      // 4. We are not on the soundscape step or sound is disabled
      if (!audio.paused) {
        audio.pause();
      }
    }
  }, [currentStep, selectedSoundscape, soundEnabled, localSoundUrls, remoteSoundUrls]);

  // Cleanup audio ONLY when component unmounts
  useEffect(() => {
    const audio = audioRef.current; // Capture ref
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(120);
    setCycleCount(0);
    setPhase('inhale');
  };

  // *** NEW ***: Function to save the journal entry
  const handleSaveJournal = async () => {
    if (isSaving) return;
    if (!currentUser) {
      console.error('User not logged in, cannot save journal entry.');
      return;
    }
    if (journalText.trim() === '') {
      console.log('No journal text to save.');
      return;
    }

    setIsSaving(true);

    // Construct the new journal entry
    const newEntry: Omit<JournalEntry, 'entryId' | 'createdAt' | 'updatedAt'> = {
      userId: currentUser.id,
      title: 'Calm Down Session Journal', // Label: Title
      content: journalText.trim(),
      mood: 'neutral', // Default mood, as it's not explicitly asked
      emotions: [], // Default emotions
      tags: ['calm-down-session', 'guided-exercise'], // Label: Tags
      isPrivate: true, // Default to private
      // createdAt and updatedAt will be set by serverTimestamp in firebaseService
      // aiInsights is optional
    };

    try {
      // We pass an object that matches Omit<JournalEntry, 'entryId'>
      // Our createJournalEntry function handles createdAt/updatedAt
      await supabaseService.createJournalEntry(newEntry as Omit<JournalEntry, 'entryId'>);
      console.log('Calm down session journal saved successfully.');
    } catch (error) {
      console.error('Failed to save journal entry:', error);
      // You could show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => { // *** MODIFIED ***: Made async
    // Stop audio when leaving the soundscape step
    if (currentStep === 3) {
      stopAndCleanupAudio();
    }

    // *** NEW ***: Save journal when moving *from* the journaling step
    if (currentStep === 2) {
      await handleSaveJournal();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 0) {
        setIsActive(false); // Stop breathing when moving to next step
      }
    } else {
      // Session complete
      navigateTo('home');
    }
  };
  
  // *** NEW ***: Handle exit logic to also save journal
  const handleExit = async () => {
    if (currentStep === 2) {
      await handleSaveJournal();
    }
    navigateTo('home');
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case 'inhale':
        return 'धीरे-धीरे सांस लें / Breathe in slowly...';
      case 'hold':
        return 'सांस रोकें / Hold your breath...';
      case 'exhale':
        return 'आराम से सांस छोड़ें / Breathe out gently...';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Breathing
        return (
          <Card className={`text-center p-8 ${
            currentTheme === 'whatsapp' ? 'whatsapp-card' : ''
          }`}>
            {/* ... (breathing content unchanged) ... */}
            <div className="mb-8 flex justify-center">
              <div
                className={`w-36 h-36 rounded-full bg-white/60 ring-4 ring-white/80 shadow-[0_0_30px_rgba(255,255,255,0.45)] drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] flex items-center justify-center transition-transform duration-700 ${
                  isActive ? 'scale-110 animate-pulse' : 'scale-100'
                }`}
              >
                <div
                  className={`w-28 h-28 rounded-full bg-white ring-2 ring-white/90 shadow-inner shadow-[inset_0_0_20px_rgba(255,255,255,0.6)] transition-transform duration-700 ${
                    isActive ? 'scale-90 animate-pulse' : 'scale-100'
                  }`}
                />
              </div>
            </div>

            <div className="mb-8">
              <div className={`text-4xl mb-2 font-bold ${
                currentTheme === 'whatsapp' ? '!text-black' : 'text-white'
              }`}>
                {formatTime(timeLeft)}
              </div>
              <p className={`text-lg mb-2 font-medium ${
                currentTheme === 'whatsapp' ? '!text-black' : ''
              }`}>{getPhaseInstruction()}</p>
              <p className={`text-sm ${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                {isActive
                  ? `सांस चक्र / Breathing cycle ${cycleCount + 1}`
                  : 'शुरू करने के लिए तैयार / Ready to begin'}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              {!isActive ? (
                <Button
                  onClick={handleStart}
                  className="bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  शुरू करें / Start
                </Button>
              ) : (
                <Button
                  onClick={handlePause}
                  variant="outline"
                  className="border-primary/30"
                  size="lg"
                >
                  <Pause className="w-5 h-5 mr-2" />
                  रोकें / Pause
                </Button>
              )}

              <Button
                onClick={handleReset}
                variant="ghost"
                className="hover:bg-primary/10"
                size="lg"
              >
                <Square className="w-5 h-5 mr-2" />
                रीसेट / Reset
              </Button>
            </div>
          </Card>
        );

      case 1: // Grounding
        return (
          <div className="space-y-6">
            {/* ... (grounding content unchanged) ... */}
            <div className="text-center mb-6">
              <h3 className={`text-lg font-medium mb-2 ${
                currentTheme === 'whatsapp' ? '!text-black' : ''
              }`}>
                5-4-3-2-1 ग्राउंडिंग तकनीक
              </h3>
              <p className={`${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                अपने आसपास की चीज़ों पर ध्यान दें / Focus on things around you
              </p>
            </div>

            {groundingItems.map((item, index) => (
              <Card key={index} className="p-4 bg-card border-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="font-medium text-primary">
                      {item.count}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${
                    currentTheme === 'whatsapp' ? '!text-black' : ''
                  }`}>{item.type}</span>
                </div>
              </Card>
            ))}

            <div className="text-center mt-6">
              <p className={`text-sm mb-4 ${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                अपना समय लें और हर चीज़ को महसूस करें / Take your time and
                notice each thing
              </p>
            </div>
          </div>
        );

      case 2: // Journaling
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className={`text-lg font-medium mb-2 ${
                currentTheme === 'whatsapp' ? '!text-black' : ''
              }`}>
                अपने विचार साझा करें / Share Your Thoughts
              </h3>
              <p className={`${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                जो भी मन में है, बेझिझक लिखें / Write freely whatever comes to
                mind
              </p>
            </div>

            <Textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="आज मैं महसूस कर रहा हूँ... / Today I am feeling..."
              className="min-h-32 resize-none border-primary/20 focus:border-primary/40"
              disabled={isSaving} // *** NEW ***
            />

            <div className="text-center">
              <p className={`text-xs ${
                currentTheme === 'whatsapp' ? '!text-black/60' : 'text-muted-foreground'
              }`}>
                {isSaving // *** NEW ***
                  ? 'Saving your entry...'
                  : 'आपके विचार सुरक्षित हैं और केवल आपके लिए हैं / Your thoughts are safe and private'}
              </p>
            </div>
          </div>
        );

      case 3: // Soundscape
        return (
          <div className="space-y-6">
            {/* ... (soundscape content, fixed as before) ... */}
            <div className="text-center mb-6">
              <h3 className={`text-lg font-medium mb-2 ${
                currentTheme === 'whatsapp' ? '!text-black' : ''
              }`}>
                शांत आवाज़ें / Calming Sounds
              </h3>
              <p className={`${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                आरामदायक आवाज़ चुनें / Choose a relaxing sound
              </p>
              {isAudioPlaying && (
                <div className="mt-2 flex items-center justify-center space-x-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Playing {soundscapes.find(s => s.id === selectedSoundscape)?.name}</span>
                </div>
              )}
              {soundEnabled && !isAudioPlaying && audioRef.current && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Click "Play Sound" to start the audio
                  </p>
                </div>
              )}
              {soundEnabled && !audioRef.current && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loading audio...
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {soundscapes.map(sound => (
                <Card
                  key={sound.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedSoundscape === sound.id
                      ? 'bg-primary/20 border-primary'
                      : 'bg-card border-primary/20 hover:border-primary/40'
                  }`}
                  onClick={() => {
                    setSelectedSoundscape(sound.id);
                  }}
                >
                  <div className="text-center space-y-2">
                    <span className="text-2xl">{sound.emoji}</span>
                    <p className="text-sm font-medium">{sound.name}</p>
                    {selectedSoundscape === sound.id && isAudioPlaying && (
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  const newSoundEnabled = !soundEnabled;
                  setSoundEnabled(newSoundEnabled);
                  if (!newSoundEnabled) {
                    stopAndCleanupAudio();
                  }
                }}
                className="border-primary/30"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 mr-2" />
                ) : (
                  <VolumeX className="w-4 h-4 mr-2" />
                )}
                {soundEnabled
                  ? 'आवाज़ बंद करें / Mute'
                  : 'आवाज़ चालू करें / Unmute'}
              </Button>
              
              {soundEnabled && (
                <Button
                  onClick={() => {
                    if (audioRef.current) {
                      if (isAudioPlaying) {
                        audioRef.current.pause();
                      } else {
                        audioRef.current.play().catch((err) => {
                          console.log('Manual play failed:', err);
                        });
                      }
                    }
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isAudioPlaying ? (
                    <Pause className="w-4 h-4 mr-2" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isAudioPlaying ? 'Pause' : 'Play'} Sound
                </Button>
              )}
            </div>
          </div>
        );

      case 4: // Reflection
        return (
          <div className="space-y-6 text-center">
            {/* ... (reflection content unchanged) ... */}
            <div className="mb-6">
              <h3 className={`text-lg font-medium mb-2 ${
                currentTheme === 'whatsapp' ? '!text-black' : ''
              }`}>
                बहुत बढ़िया! / Excellent!
              </h3>
              <p className={`${
                currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
              }`}>
                आपने अपनी देखभाल के लिए समय निकाला / You took time for self-care
              </p>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <p className="text-sm leading-relaxed text-center">
                {
                  positiveReflections[
                    Math.floor(Math.random() * positiveReflections.length)
                  ]
                }
              </p>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">🌟</span>
                <span className="font-medium">
                  आपने एक calm-down session पूरा किया!
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                यह आपकी मानसिक स्वास्थ्य यात्रा में एक महत्वपूर्ण कदम है
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative min-h-screen p-6 ${
      currentTheme === 'whatsapp' ? 'whatsapp-main-bg' : ''
    }`}>
      <VantaBackground variant="local" />
      <div className={`relative max-w-lg mx-auto ${
        currentTheme === 'whatsapp' ? 'whatsapp-card p-6' : ''
      }`}>
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExit} // *** MODIFIED ***
            className="mr-4 hover:bg-primary/10"
            disabled={isSaving && currentStep === 2} // *** NEW ***
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className={`text-xl font-semibold ${
              currentTheme === 'whatsapp' ? '!text-black' : ''
            }`}>शांत होने का सत्र / Calm-Down Session</h1>
            <p className={`text-sm ${
              currentTheme === 'whatsapp' ? '!text-black/70' : 'text-muted-foreground'
            }`}>
              चरण {currentStep + 1} / {steps.length}:{' '}
              {steps[currentStep] ? steps[currentStep].title : ''}
            </p>
          </div>
        </div>

        {/* Progress indicator (unchanged) ... */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content (unchanged) ... */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-medium mb-2">
                {steps[currentStep] ? steps[currentStep].title : ''}
              </h2>
              <p className="text-muted-foreground text-sm">
                {steps[currentStep] ? steps[currentStep].subtitle : ''}
              </p>
            </div>

            {renderStepContent()}
          </Card>
        </div>


        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || isSaving} // *** MODIFIED ***
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            पीछे / Back
          </Button>

          <Button
            onClick={handleNextStep}
            className="bg-primary hover:bg-primary/90"
            disabled={isSaving && currentStep === 2} // *** NEW ***
          >
            {isSaving && currentStep === 2 ? ( // *** NEW ***
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isSaving && currentStep === 2 // *** NEW ***
              ? 'Saving...'
              : currentStep === steps.length - 1
                ? 'पूरा / Complete'
                : 'आगे / Next'}
            {!(isSaving && currentStep === 2) && ( // *** NEW ***
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </div>

        {/* Instructions (unchanged) ... */}
        {currentStep === 0 && (
          <Card className="p-6 mt-6 bg-card border-primary/20">
            <h3 className="font-medium mb-4">
              सांस लेने के निर्देश / Breathing Instructions
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>
                  आरामदायक स्थिति में बैठें / Find a comfortable position
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>
                  4 सेकंड तक नाक से सांस लें / Breathe in through nose for 4
                  seconds
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>4 सेकंड सांस रोकें / Hold breath for 4 seconds</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>
                  6 सेकंड तक मुंह से सांस छोड़ें / Exhale through mouth for 6
                  seconds
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
