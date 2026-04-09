
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BarChart, BookOpen, MessageCircle, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Screen, UserData } from '../types';

interface HomePageProps {
  navigateTo?: (screen: Screen) => void;
  userData?: UserData;
}

export function HomePage({ navigateTo }: HomePageProps = {}) {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  
  const go = (screen: string) => {
    switch (screen) {
      case 'stats':
        navigate('/analytics');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'calm-down':
        navigate('/calm-down');
        break;
      case 'ai-companion':
        navigate('/companion');
        break;
      case 'journal':
        navigate('/journal');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const onNav = (screen: string) => (navigateTo ? navigateTo(screen as any) : go(screen));

  return (
    <div className="relative min-h-screen p-6">
      {/* Stats button in top-right */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNav('stats')}
          className={`rounded-full backdrop-blur-sm border-0 shadow-sm hover:shadow-md transition-all duration-200 ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 text-white hover:bg-white/30' 
              : 'bg-white/80 hover:bg-white/90'
          }`}
        >
          <BarChart className="w-4 h-4 mr-2" />
          Stats
        </Button>
      </div>

      {/* Central content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-lg mx-auto px-6">
        {/* App name and central meditation icon */}
        <div className="text-center mb-16 w-full mt-20">
          <div className="flex justify-center mb-16">
            {/* Circular background container with soft green glow like in reference */}
            <div className={`relative w-80 h-80 rounded-full flex items-center justify-center shadow-xl ${
              currentTheme === 'ocean' 
                ? 'bg-gradient-to-br from-green-100/40 to-green-200/30 backdrop-blur-sm' 
                : 'bg-gradient-to-br from-green-100/60 to-green-200/40'
            }`}
            style={{
              boxShadow: currentTheme === 'ocean' 
                ? '0 0 60px rgba(134, 239, 172, 0.3), 0 0 120px rgba(134, 239, 172, 0.15)' 
                : '0 0 60px rgba(134, 239, 172, 0.4), 0 0 120px rgba(134, 239, 172, 0.2)'
            }}>
              <div className="flex items-center justify-center">
                <img 
                  src="/mann-mitra-logo.PNG" 
                  alt="Haven Logo" 
                  className={`w-48 h-48 object-contain ${
                    currentTheme === 'ocean' 
                      ? 'filter brightness-75 contrast-125' 
                      : 'filter brightness-90 contrast-110'
                  }`}
                />
              </div>
            </div>
          </div>
          <h2 className={`text-4xl mb-6 font-medium ${
            currentTheme === 'ocean' ? 'text-slate-800' : 'text-gray-700'
          }`}>Welcome back</h2>
          <p className={`text-xl mb-1 ${
            currentTheme === 'ocean' ? 'text-slate-600' : 'text-gray-600'
          }`}>How are you feeling today?</p>
        </div>

        {/* Action buttons - positioned below the central element */}
        <div className="w-full space-y-4 max-w-md">
          <Card className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 rounded-2xl shadow-sm ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30' 
              : currentTheme === 'whatsapp'
                ? 'whatsapp-nav-button'
                : 'bg-white/80 backdrop-blur-sm'
          }`}
            onClick={() => onNav('quiz')}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'ocean' ? 'bg-blue-100/80' : 'bg-green-100'
              }`}>
                <Activity className={`w-6 h-6 ${
                  currentTheme === 'ocean' ? 'text-blue-600' : 'text-green-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg ${
                  currentTheme === 'ocean' ? 'text-slate-800' : 'text-gray-800'
                }`}>Get Started Quiz</h3>
                <p className={`${
                  currentTheme === 'ocean' ? 'text-slate-600' : 'text-gray-600'
                }`}>Quick wellness check-in</p>
              </div>
            </div>
          </Card>

          <Card className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 rounded-2xl shadow-sm ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30' 
              : currentTheme === 'whatsapp'
                ? 'whatsapp-nav-button'
                : 'bg-white/80 backdrop-blur-sm'
          }`}
            onClick={() => onNav('calm-down')}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'ocean' ? 'bg-cyan-100/80' : 'bg-blue-100'
              }`}>
                <MessageCircle className={`w-6 h-6 ${
                  currentTheme === 'ocean' ? 'text-cyan-600' : 'text-blue-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg ${
                  currentTheme === 'ocean' ? 'text-slate-800' : 'text-gray-800'
                }`}>Calm-Down Session</h3>
                <p className={`${
                  currentTheme === 'ocean' ? 'text-slate-600' : 'text-gray-600'
                }`}>5-minute guided breathing</p>
              </div>
            </div>
          </Card>

          <Card className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 rounded-2xl shadow-sm ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30' 
              : currentTheme === 'whatsapp'
                ? 'whatsapp-nav-button'
                : 'bg-white/80 backdrop-blur-sm'
          }`}
            onClick={() => onNav('ai-companion')}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'ocean' ? 'bg-indigo-100/80' : 'bg-purple-100'
              }`}>
                <MessageCircle className={`w-6 h-6 ${
                  currentTheme === 'ocean' ? 'text-indigo-600' : 'text-purple-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg ${
                  currentTheme === 'ocean' ? 'text-slate-800' : 'text-gray-800'
                }`}>AI मित्र / AI Companion</h3>
                <p className={`${
                  currentTheme === 'ocean' ? 'text-slate-600' : 'text-gray-600'
                }`}>आपका सहायक साथी / Your supportive friend</p>
              </div>
            </div>
          </Card>

          <Card className={`p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-0 rounded-2xl shadow-sm ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border border-white/30' 
              : currentTheme === 'whatsapp'
                ? 'whatsapp-nav-button'
                : 'bg-white/80 backdrop-blur-sm'
          }`}
            onClick={() => onNav('journal')}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'ocean' ? 'bg-amber-100/80' : 'bg-orange-100'
              }`}>
                <BookOpen className={`w-6 h-6 ${
                  currentTheme === 'ocean' ? 'text-amber-600' : 'text-orange-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg ${
                  currentTheme === 'ocean' ? 'text-slate-800' : 'text-gray-800'
                }`}>Journal & Vent</h3>
                <p className={`${
                  currentTheme === 'ocean' ? 'text-slate-600' : 'text-gray-600'
                }`}>Express your thoughts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard link at bottom */}
        <div className="mt-10">
          <Button
            variant="ghost"
            onClick={() => onNav('dashboard')}
            className={`${
              currentTheme === 'ocean' 
                ? 'text-slate-700 hover:bg-white/10' 
                : currentTheme === 'whatsapp'
                  ? 'whatsapp-nav-button !text-black font-semibold'
                  : 'text-primary hover:bg-primary/10'
            }`}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;