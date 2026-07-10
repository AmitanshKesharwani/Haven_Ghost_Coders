import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { AssessmentForm } from './AssessmentForm';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Import components

import HomePage from './HomePage';
import AICompanion from './AICompanion';
import Journal from './Journal';
import PostQuizHome from './PostQuizHome';
import { AdvancedDashboard } from './AdvancedDashboard';
import VoiceTherapy from './VoiceTherapy';
import EmotionDetection from './EmotionDetection';
import { Settings } from './Settings';
import { useTheme } from '../contexts/ThemeContext';


import { DebugEmotionTest } from './DebugEmotionTest';

// import { Dashboard } from './Dashboard';
import Chatbot from './Chatbot';
import { QuizPage } from './QuizPage';
import { CalmDownSession } from './CalmDownSession';
import { AdminDashboard } from './admin/AdminDashboard';
import { FirebaseSetup } from './setup/FirebaseSetup';
// import { QuickNav } from './admin/QuickNav'; // Unused import
import { LaunchChecklist } from './launch/LaunchChecklist';
import { LaunchInstructions } from './launch/LaunchInstructions';
import { SimpleChecklist } from './launch/SimpleChecklist';
import { DiagnosticTool } from './DiagnosticTool';
import { IndexTestTool } from './IndexTestTool';
import { MobileTestPage } from './MobileTestPage';
import { SpeechToTextTest } from './SpeechToTextTest';
import { SpeechDebugTest } from './SpeechDebugTest';
import ConfidenceBuilderSession from './therapy/ConfidenceBuilderSession';
import AnxietyWarriorSession from './therapy/AnxietyWarriorSession';
import EmotionExplorerSession from './therapy/EmotionExplorerSession';
import StressBusterSession from './therapy/StressBusterSession';

// Import services
import { emotionDetection } from '../services/emotionDetection';
import { useAuth } from './auth/AuthProvider';
import { UserProfile } from '../services/supabaseService';

interface AppRouterProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({ currentUser, onLogout }) => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const [systemStatus, setSystemStatus] = useState({
    aiOrchestrator: false,
    voiceAnalysis: false,
    emotionDetection: false,
    sessionManager: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const { signOut, updateUserProfile } = useAuth();

  useEffect(() => {
    // Check system status with a slight delay to ensure services are initialized
    const checkSystemStatus = () => {
      const status = {
        aiOrchestrator: true, // AI Orchestrator is always available
        voiceAnalysis: true, // Voice analysis now handled by backend STT
        emotionDetection: emotionDetection.isServiceAvailable(),
        sessionManager: true // Session manager is always available
      };

      console.log('System Status Check:', status);
      setSystemStatus(status);
    };

    // Check immediately
    checkSystemStatus();

    // Also check after a short delay to ensure services are fully initialized
    const timer = setTimeout(checkSystemStatus, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay - very subtle */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-10 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex h-screen relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden md:block">
          <NavigationSidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            systemStatus={systemStatus}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentTheme={currentTheme}
          />
        </div>
        
        {/* Mobile Sidebar - Slides in from left */}
        <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <NavigationSidebar 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            systemStatus={systemStatus}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentTheme={currentTheme}
          />
        </div>
        
        <div className={`flex-1 w-full overflow-auto ${
          currentTheme === 'whatsapp' 
            ? 'bg-[#EFEAE2]' 
            : currentTheme === 'ocean' || currentTheme === 'forest'
              ? '' 
              : ''
        }`}>
          {/* Mobile header */}
          <div className={`md:hidden border-b p-4 flex items-center justify-between sticky top-0 z-30 ${
            currentTheme === 'ocean'
              ? 'bg-white/10 backdrop-blur-md border-white/20'
              : currentTheme === 'forest'
                ? 'bg-white/10 backdrop-blur-md border-white/20'
                : currentTheme === 'whatsapp'
                  ? 'bg-white border-[#D1D7DB]'
                  : 'bg-white border-green-100'
          }`}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center p-1">
                <img src="/mann-mitra-logo.PNG" alt="Haven" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
              <h1 className="font-bold text-lg text-green-600">Haven</h1>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
          
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/dashboard" element={<AdvancedDashboard userId={currentUser.uid} navigateTo={(screen) => navigate(`/${screen === 'ai-companion' ? 'companion' : screen === 'calm-down' ? 'voice' : screen}`)} />} />
            <Route path="/companion" element={<AICompanion userData={currentUser as any} />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/analytics" element={<AdvancedAnalytics userId={currentUser.uid} />} />
            <Route path="/voice" element={<VoiceTherapy />} />
            <Route path="/emotion" element={<EmotionDetection />} />
            <Route path="/settings" element={<Settings navigateTo={(screen) => navigate(`/${screen}`)} />} />

           
            <Route path="/debug-emotion" element={<DebugEmotionTest navigateTo={(screen) => navigate(`/${screen}`)} />} />
            
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/setup" element={<FirebaseSetup />} />
            <Route path="/launch-check" element={<LaunchChecklist />} />
            <Route path="/launch-ready" element={<SimpleChecklist />} />
            <Route path="/launch-guide" element={<LaunchInstructions />} />
            <Route path="/diagnostic" element={<DiagnosticTool />} />
            <Route path="/index-test" element={<IndexTestTool />} />
            <Route path="/mobile-test" element={<MobileTestPage />} />
            <Route path="/speech-test" element={<SpeechToTextTest />} />
            <Route path="/speech-debug" element={<SpeechDebugTest />} />
            <Route path="/confidence-builder-session" element={<ConfidenceBuilderSession />} />
            <Route path="/anxiety-warrior-session" element={<AnxietyWarriorSession />} />
            <Route path="/emotion-explorer-session" element={<EmotionExplorerSession />} />
            <Route path="/stress-buster-session" element={<StressBusterSession />} />
            <Route path="/chatbot" element={<Chatbot navigateTo={() => { }} />} />
            <Route path="/quiz" element={<QuizRouteWrapper updateUserProfile={updateUserProfile} />} />
            <Route path="/calm-down" element={<CalmDownRouteWrapper />} />
            <Route path="/post-quiz-home" element={<PostQuizHomeWrapper />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/assessment"
              element={
                <AssessmentFormWrapper /> // Use a wrapper to handle props
              }
            />
          </Routes>
        </div>
      </div>
      

      
      <Toaster position="top-right" />
    </>
  );
};

// Navigation Sidebar Component
const NavigationSidebar: React.FC<{
  currentUser: UserProfile;
  onLogout: () => void;
  systemStatus: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentTheme: string;
}> = ({ currentUser, onLogout, systemStatus, sidebarOpen, setSidebarOpen, currentTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: 'BarChart3', label: 'Dashboard', route: '/dashboard', premium: false },
    { icon: 'MessageCircle', label: 'AI Companion', route: '/companion', premium: false },
    { icon: 'BookOpen', label: 'Journal', route: '/journal', premium: false },
    { icon: 'Home', label: 'Home', route: '/home', premium: false },
    { icon: 'Brain', label: 'Advanced Analytics', route: '/analytics', premium: false },
    { icon: 'Mic', label: 'Voice Therapy', route: '/voice', premium: false },
    { icon: 'Camera', label: 'Emotion Detection', route: '/emotion', premium: false },
    { icon: 'Settings', label: 'Settings', route: '/settings', premium: false }
  ];

  const sidebarStyle = currentTheme === 'ocean' ? {
    background: '#326080', // Solid blue background like first image
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(50, 96, 128, 0.3), 0 2px 8px rgba(0,0,0,0.1)'
  } : currentTheme === 'forest' ? {
    background: 'linear-gradient(180deg, #2F9064 0%, #267A54 50%, #1E6B47 100%)', // Forest gradient matching the image
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '4px 0 20px rgba(47, 144, 100, 0.25), 0 0 40px rgba(47, 144, 100, 0.1)',
    borderRight: '1px solid rgba(255, 255, 255, 0.15)'
  } : currentTheme === 'whatsapp' ? {
    background: '#F0F2F5', // WhatsApp sidebar background
    borderRight: '1px solid #D1D7DB',
    boxShadow: 'none'
  } : {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 253, 249, 0.95) 50%, rgba(240, 253, 244, 0.92) 100%)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: '0 8px 32px rgba(34, 197, 94, 0.12), 0 2px 8px rgba(0,0,0,0.04)'
  };

  return (
    <div className={`w-64 h-screen flex flex-col ${
      currentTheme === 'ocean' 
        ? 'border-r border-white/20' 
        : currentTheme === 'forest'
          ? 'border-r border-white/20'
          : currentTheme === 'whatsapp'
            ? 'bg-[#F0F2F5] border-r border-[#D1D7DB]'
            : 'bg-white border-r border-gray-200 shadow-lg'
    }`} style={sidebarStyle}>
      {/* Header */}
      <div className="p-4 md:p-6 relative" style={{ 
        borderBottom: currentTheme === 'ocean' 
          ? '1px solid rgba(255, 255, 255, 0.2)' 
          : currentTheme === 'forest'
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(34, 197, 94, 0.15)' 
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden ${
              currentTheme === 'ocean' 
                ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600' 
                : 'bg-gradient-to-br from-green-400 via-green-500 to-green-600'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <img src="/mann-mitra-logo.PNG" alt="Haven" className="w-6 h-6 md:w-8 md:h-8 relative z-10 filter brightness-0 invert" />
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse ${
                currentTheme === 'ocean' ? 'bg-blue-300' : 'bg-green-300'
              }`}></div>
            </div>
            <div>
              <h1 className={`font-bold text-lg md:text-xl bg-gradient-to-r bg-clip-text text-transparent ${
                currentTheme === 'ocean' 
                  ? 'from-white to-blue-100' 
                  : 'from-green-600 to-green-700'
              }`}>Haven</h1>
              <p className={`text-xs md:text-sm font-medium ${
                currentTheme === 'ocean' ? 'text-blue-100' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' ? '#e0f2fe' : '#059669' 
              }}>AI Mental Health Companion</p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              currentTheme === 'ocean' 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-green-50 text-green-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={`absolute bottom-0 left-4 right-4 md:left-6 md:right-6 h-px bg-gradient-to-r from-transparent to-transparent ${
          currentTheme === 'ocean' ? 'via-white/30' : 'via-green-200'
        }`}></div>
      </div>

      {/* User Profile */}
      {currentUser && (
        <div className="p-3 md:p-4 relative" style={{ 
          borderBottom: currentTheme === 'ocean' 
            ? '1px solid rgba(255, 255, 255, 0.2)' 
            : '1px solid rgba(34, 197, 94, 0.15)' 
        }}>
          <div className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl border ${
            currentTheme === 'ocean' 
              ? 'bg-white/10 border-white/20' 
              : 'bg-gradient-to-r from-green-50/80 to-emerald-50/60 border-green-100/50'
          }`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm border ${
              currentTheme === 'ocean' 
                ? 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-200/50' 
                : 'bg-gradient-to-br from-green-100 to-green-200 border-green-200/50'
            }`}>
              <span className={`text-sm md:text-lg ${
                currentTheme === 'ocean' ? 'text-blue-600' : 'text-green-600'
              }`}>👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-xs md:text-sm truncate ${
                currentTheme === 'ocean' || currentTheme === 'forest' ? 'text-white' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' || currentTheme === 'forest' ? '#ffffff' : '#065f46' 
              }}>{currentUser.displayName}</p>
              <p className={`text-xs font-medium truncate ${
                currentTheme === 'ocean' || currentTheme === 'forest' ? 'text-blue-100' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' || currentTheme === 'forest' ? '#e0f2fe' : '#059669' 
              }}>{currentUser.email}</p>
            </div>
            <div className={`w-2 h-2 rounded-full animate-pulse flex-shrink-0 ${
              currentTheme === 'ocean' ? 'bg-blue-300' : 'bg-green-400'
            }`}></div>
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-3 md:p-4 relative" style={{ 
        borderBottom: currentTheme === 'ocean' 
          ? '1px solid rgba(255, 255, 255, 0.2)' 
          : '1px solid rgba(34, 197, 94, 0.15)' 
      }}>
        <h3 className={`text-xs font-bold mb-2 md:mb-3 uppercase tracking-wider ${
          currentTheme === 'ocean' ? 'text-blue-100' : ''
        }`} style={{ 
          color: currentTheme === 'ocean' ? '#e0f2fe' : '#059669' 
        }}>System Status</h3>
        <div className="space-y-2 md:space-y-3">
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            currentTheme === 'ocean' 
              ? 'bg-white/10' 
              : 'bg-gradient-to-r from-green-50/50 to-emerald-50/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.aiOrchestrator ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
              <span className={`text-xs font-medium ${
                currentTheme === 'ocean' || currentTheme === 'forest' ? 'text-white' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' || currentTheme === 'forest' ? '#ffffff' : '#065f46' 
              }}>AI Services</span>
            </div>
            <span className={`text-xs px-1.5 md:px-2 py-1 rounded-full font-semibold ${
              systemStatus.aiOrchestrator 
                ? currentTheme === 'ocean' || currentTheme === 'forest'
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {systemStatus.aiOrchestrator ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            currentTheme === 'ocean' 
              ? 'bg-white/10' 
              : 'bg-gradient-to-r from-green-50/50 to-emerald-50/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.voiceAnalysis ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-xs font-medium ${
                currentTheme === 'ocean' || currentTheme === 'forest' ? 'text-white' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' || currentTheme === 'forest' ? '#ffffff' : '#065f46' 
              }}>Voice Analysis</span>
            </div>
            <span className={`text-xs px-1.5 md:px-2 py-1 rounded-full font-semibold ${
              systemStatus.voiceAnalysis 
                ? currentTheme === 'ocean' || currentTheme === 'forest'
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {systemStatus.voiceAnalysis ? 'Ready' : 'Unavailable'}
            </span>
          </div>
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            currentTheme === 'ocean' 
              ? 'bg-white/10' 
              : 'bg-gradient-to-r from-green-50/50 to-emerald-50/30'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${systemStatus.emotionDetection ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className={`text-xs font-medium ${
                currentTheme === 'ocean' || currentTheme === 'forest' ? 'text-white' : ''
              }`} style={{ 
                color: currentTheme === 'ocean' || currentTheme === 'forest' ? '#ffffff' : '#065f46' 
              }}>Emotion Detection</span>
            </div>
            <span className={`text-xs px-1.5 md:px-2 py-1 rounded-full font-semibold ${
              systemStatus.emotionDetection 
                ? currentTheme === 'ocean' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              {systemStatus.emotionDetection ? 'Ready' : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 p-3 md:p-4 overflow-y-auto ${
        currentTheme === 'ocean' 
          ? '' 
          : currentTheme === 'whatsapp'
            ? 'bg-[#F0F2F5]'
            : 'bg-white'
      }`}>
        <div className="space-y-1 md:space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.route}
              className={`w-full text-left px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                location.pathname === item.route
                  ? currentTheme === 'ocean'
                    ? 'bg-white/20 text-white shadow-md border border-white/30 backdrop-blur-sm'
                    : currentTheme === 'forest'
                      ? 'bg-white/20 text-white shadow-md border border-white/30 backdrop-blur-sm'
                      : currentTheme === 'whatsapp'
                        ? 'bg-white text-[#00A884] shadow-sm border border-[#00A884]/20'
                        : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-md border border-green-200'
                  : currentTheme === 'ocean'
                    ? 'hover:bg-white/10 text-white/80 hover:text-white hover:shadow-sm'
                    : currentTheme === 'forest'
                      ? 'hover:bg-white/10 text-white/80 hover:text-white hover:shadow-sm'
                      : currentTheme === 'whatsapp'
                        ? 'hover:bg-white/50 text-[#111B21] hover:text-[#00A884] hover:shadow-sm'
                        : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-700 hover:shadow-sm'
              } ${(item.route === '/voice' || item.route === '/emotion')}`}
              style={{
                pointerEvents: 'auto',
                zIndex: 1,
                position: 'relative',
                display: 'block',
                minHeight: '36px'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Button clicked! Navigating to:', item.route, 'Label:', item.label);

                // Special handling for voice and emotion buttons
                if (item.route === '/voice') {
                  console.log('🎤 Voice Therapy button clicked!');
                } else if (item.route === '/emotion') {
                  console.log('📷 Emotion Detection button clicked!');
                }

                // Add visual feedback
                const target = e.currentTarget;
                target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                  if (target) {
                    target.style.transform = 'scale(1)';
                  }
                }, 100);

                // Close sidebar on mobile after navigation
                setSidebarOpen(false);
                navigate(item.route);
              }}
            >
              <span className="flex items-center gap-2 md:gap-3 relative z-10">
                <span className="text-lg md:text-xl transition-transform duration-200 group-hover:scale-110 flex-shrink-0">{getIcon(item.icon)}</span>
                <span className="font-medium truncate" style={{ 
                  color: currentTheme === 'ocean' 
                    ? location.pathname === item.route ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'
                    : location.pathname === item.route ? '#15803d' : '#374151' 
                }}>{item.label}</span>
                {location.pathname === item.route && (
                  <div className="absolute right-0 w-1 h-4 md:h-6 bg-green-500 rounded-full"></div>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 md:p-4" style={{ borderTop: '1px solid rgba(34, 197, 94, 0.15)' }}>
        <button
          className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-600 hover:border-red-500 hover:text-white hover:shadow-lg hover:scale-105 group relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#ffffff',
            border: '2px solid #dc2626',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}
          onClick={onLogout}
        >
          <span className="flex items-center justify-center gap-2 relative z-10">
            <span className="transition-transform duration-200 group-hover:scale-110">🚪</span>
            Logout
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </button>
      </div>
    </div>
  );
};

// Helper function to get icons
const getIcon = (iconName: string): string => {
  const icons: { [key: string]: string } = {
    BarChart3: '📊',
    MessageCircle: '💬',
    BookOpen: '📖',
    Home: '🏠',
    Brain: '🧠',
    Mic: '🎤',
    Camera: '📷',
    Video: '📹',
    TestTube: '🧪',
    Play: '▶️',
    Bug: '🐛',
    Monitor: '📺',
    Smartphone: '📱',
    Settings: '⚙️'
  };
  return icons[iconName] || '📄';
};

// Advanced Analytics Component
const AdvancedAnalytics: React.FC<{ userId: string }> = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-green-50/30 to-emerald-50/20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white/95 to-green-50/80 rounded-2xl shadow-xl p-8 border border-green-100/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-200/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100/30 to-emerald-100/20 rounded-full translate-y-12 -translate-x-12"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              <span className="text-3xl">📈</span>
              Advanced Analytics
            </h2>
            <div className="inline-block px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-semibold rounded-full mb-6 border border-green-200">
              Premium Feature
            </div>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Get detailed insights into your mental health journey with advanced AI analytics and personalized recommendations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group p-6 border rounded-2xl bg-gradient-to-br from-white to-green-50/50 shadow-lg hover:shadow-xl transition-all duration-300 border-green-100/60 cursor-pointer hover:-translate-y-1" onClick={() => navigate('/dashboard')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    🔮
                  </div>
                  <h4 className="font-bold text-lg text-gray-800">Predictive Insights</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  AI-powered predictions about your emotional patterns and potential triggers to help you stay ahead of challenges.
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
                  <span>Learn more</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>

              <div className="group p-6 border rounded-2xl bg-gradient-to-br from-white to-green-50/50 shadow-lg hover:shadow-xl transition-all duration-300 border-green-100/60 cursor-pointer hover:-translate-y-1" onClick={() => navigate('/dashboard')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                    🎯
                  </div>
                  <h4 className="font-bold text-lg text-gray-800">Personalized Recommendations</h4>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Customized therapeutic interventions and wellness strategies tailored specifically to your unique mental health profile.
                </p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:text-green-700 transition-colors">
                  <span>Explore features</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Settings Panel
const SettingsPanel: React.FC<{ user: any; onUpdate: (user: any) => void }> = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-green-50/30 to-emerald-50/20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gradient-to-br from-white/95 to-green-50/80 rounded-2xl shadow-xl p-8 border border-green-100/50 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-200/10 rounded-full -translate-y-16 translate-x-16"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                ⚙️
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 border rounded-2xl bg-gradient-to-br from-white to-green-50/30 shadow-lg border-green-100/60">
                <label className="block text-sm font-bold mb-3 text-green-700 uppercase tracking-wide">Language Preference</label>
                <select
                  className="w-full p-4 border rounded-xl bg-white/80 border-green-200/60 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-200 font-medium"
                  value={user.preferences.language}
                  onChange={(e) => {
                    const updatedUser = {
                      ...user,
                      preferences: {
                        ...user.preferences,
                        language: e.target.value as 'hindi' | 'english' | 'mixed' | 'bengali' | 'marathi' | 'telugu' | 'tamil' | 'gujarati' | 'kannada' | 'malayalam' | 'urdu' | 'punjabi' | 'odia' | 'assamese'
                      }
                    };
                    onUpdate(updatedUser);
                    localStorage.setItem('haven_user', JSON.stringify(updatedUser));
                  }}
                >
                  <option value="mixed">🌐 Hindi + English (Mixed)</option>
                  <option value="hindi">🇮🇳 Hindi (हिंदी)</option>
                  <option value="english">🇺🇸 English</option>
                  <option value="bengali">🇧🇩 Bengali (বাংলা)</option>
                  <option value="marathi">🇮🇳 Marathi (मराठी)</option>
                  <option value="telugu">🇮🇳 Telugu (తెలుగు)</option>
                  <option value="tamil">🇮🇳 Tamil (தமிழ்)</option>
                  <option value="gujarati">🇮🇳 Gujarati (ગુજરાતી)</option>
                  <option value="kannada">🇮🇳 Kannada (ಕನ್ನಡ)</option>
                  <option value="malayalam">🇮🇳 Malayalam (മലയാളം)</option>
                  <option value="urdu">🇵🇰 Urdu (اردو)</option>
                  <option value="punjabi">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
                  <option value="odia">🇮🇳 Odia (ଓଡ଼ିଆ)</option>
                  <option value="assamese">🇮🇳 Assamese (অসমীয়া)</option>
                </select>
              </div>

              <div className="p-6 border rounded-2xl bg-gradient-to-br from-white to-green-50/30 shadow-lg border-green-100/60">
                <label className="block text-sm font-bold mb-3 text-green-700 uppercase tracking-wide">Communication Style</label>
                <select
                  className="w-full p-4 border rounded-xl bg-white/80 border-green-200/60 focus:border-green-400 focus:ring-2 focus:ring-green-200 transition-all duration-200 font-medium"
                  value={user.preferences.communicationStyle}
                  onChange={(e) => {
                    const updatedUser = {
                      ...user,
                      preferences: {
                        ...user.preferences,
                        communicationStyle: e.target.value as 'formal' | 'casual'
                      }
                    };
                    onUpdate(updatedUser);
                    localStorage.setItem('haven_user', JSON.stringify(updatedUser));
                  }}
                >
                  <option value="casual">😊 Casual & Friendly</option>
                  <option value="formal">🎩 Formal & Professional</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  className="w-full px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <span>💾</span>
                  Save Settings & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppRouter;

// ----- Route Wrappers to adapt existing components to react-router -----
const AssessmentFormWrapper: React.FC = () => {
  const navigate = useNavigate();
  // *** MODIFIED: Use state for assessment type ***
  const [selectedType, setSelectedType] = useState<'phq9' | 'gad7' | 'custom_wellness' | null>(null);

  const handleComplete = (results: any) => {
    console.log('Assessment Completed:', results);
    const completedType = selectedType;
    setSelectedType(null); // Reset selection after completion
    navigate('/dashboard');
    toast.success(`Completed ${completedType?.toUpperCase()} assessment!`);
  };

  const handleCancel = () => {
    setSelectedType(null); // Reset selection on cancel
    navigate('/dashboard');
  };

  // --- Render Selection Buttons if no type is selected ---
  if (!selectedType) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Choose Assessment</h1>
          <div className="space-y-4">
            <Button
              onClick={() => setSelectedType('phq9')}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg"
            >
              PHQ-9 (Depression)
            </Button>
            <Button
              onClick={() => setSelectedType('gad7')}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-3 text-lg"
            >
              GAD-7 (Anxiety)
            </Button>
            <Button
              onClick={() => setSelectedType('custom_wellness')}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-3 text-lg"
            >
              Wellness Check-in
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full mt-4 py-3 text-lg"
            >
              Cancel
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // --- Render the AssessmentForm once a type is selected ---
  return (
    <AssessmentForm
      assessmentType={selectedType} // Pass the selected type
      onComplete={handleComplete}
      onCancel={handleCancel} // Pass handleCancel which now also resets state
    />
  );
};
const QuizRouteWrapper: React.FC<{
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}> = ({ updateUserProfile }) => {
  const navigate = useNavigate();
  // *** NEW *** Get the full userProfile from the auth context
  const { userProfile } = useAuth();
  const defaultUserData = {
    onboardingCompleted: true,
    preferences: undefined,
    quizCompleted: false,
    currentQuizQuestion: 0,
    quizAnswers: Array(5).fill(0),
    overallScore: 0,
    metrics: { stress: 0, sleep: 0, happiness: 0, productivity: 0, activity: 0, phq9: 0, gad7: 0 },
    streaks: { current: 0, longest: 0 },
    milestones: []
  };

  const [userData, setUserData] = React.useState(() => {
    const saved = localStorage.getItem('quiz_user_data');
    if (!saved) {
      return defaultUserData;
    }
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Invalid quiz_user_data in localStorage, clearing it:', error);
      localStorage.removeItem('quiz_user_data');
      return defaultUserData;
    }
  });

  const updateUserData = (data: Partial<typeof userData>) => {
    const updated = { ...userData, ...data };
    setUserData(updated);
    localStorage.setItem('quiz_user_data', JSON.stringify(updated));

    // *** MODIFIED ***:
    // Check if quiz is complete AND we have the userProfile to update
    if (updated.quizCompleted && updated.overallScore !== undefined && updated.overallScore !== null && userProfile) {
      console.log('Quiz completed, saving score to Firebase:', updated.overallScore);

      // 1. Create the full new mentalHealthProfile object
      const newMentalHealthProfile = {
        ...userProfile.mentalHealthProfile, // Spread all existing properties
        wellnessScore: updated.overallScore, // Add/overwrite the wellness score
        lastAssessmentDate: new Date() // Also good to update this
      };

      // 2. Call updateUserProfile with the *complete* nested object
      updateUserProfile({
        mentalHealthProfile: newMentalHealthProfile
      }).catch(error => {
        console.error("Failed to save quiz score to Firebase:", error);
      });

    } else if (!userProfile) {
      console.warn("Quiz completed but no userProfile found in AuthContext. Cannot save score.");
    }
  };

  const navigateTo = (screen: string) => {
    switch (screen) {
      case 'post-quiz-home':
        navigate('/post-quiz-home');
        break;
      case 'home':
        navigate('/home');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <QuizPage
      navigateTo={navigateTo as any}
      userData={userData}
      updateUserData={updateUserData}
    />
  );
};

const CalmDownRouteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const navigateTo = (screen: string) => {
    switch (screen) {
      case 'home':
        navigate('/home');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
    }
  };
  return <CalmDownSession navigateTo={navigateTo as any} />;
};

const PostQuizHomeWrapper: React.FC = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem('quiz_user_data');
  let userData: any = undefined;
  if (saved) {
    try {
      userData = JSON.parse(saved);
    } catch (error) {
      console.error('Invalid quiz_user_data in localStorage, clearing it:', error);
      localStorage.removeItem('quiz_user_data');
      userData = undefined;
    }
  }

  const navigateTo = (screen: string) => {
    switch (screen) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'stats':
        navigate('/analytics');
        break;
      case 'ai-companion':
        navigate('/companion');
        break;
      case 'calm-down':
        navigate('/calm-down');
        break;
      case 'journal':
        navigate('/journal');
        break;
      default:
        navigate('/');
    }
  };

  if (!userData) {
    return <Navigate to="/quiz" replace />;
  }

  return <PostQuizHome navigateTo={navigateTo as any} userData={userData} />;
};
