
import { Button } from './ui/button';
import { Card } from './ui/card';
import { BarChart, BookOpen, MessageCircle, Bot } from 'lucide-react';
// Import the meditation icon
const meditationIcon = new URL('../assets/819e0f5f94733abaa2536b7d855c8a7c099ea006.png', import.meta.url).href;
import type { Screen, UserData } from '../types';

interface PostQuizHomeProps {
  navigateTo: (screen: Screen) => void;
  userData: UserData;
}

export function PostQuizHome({ navigateTo, userData }: PostQuizHomeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 70) return 'You\'re doing great!';
    if (score >= 40) return 'You\'re managing well';
    return 'Let\'s work together';
  };

  return (
    <div className="relative min-h-screen p-6">
      {/* Stats button in top-right */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateTo('stats')}
          className="rounded-full border-primary/30 hover:bg-primary/5"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Stats
        </Button>
      </div>

      {/* Central content */}
      <div className="flex flex-col items-center justify-center min-h-screen max-w-lg mx-auto px-6">
        {/* App name and central meditation icon with score */}
        <div className="text-center mb-16 w-full">
          <h1 className="app-title text-5xl mb-8 text-foreground">Haven</h1>
          <div className="w-full max-w-sm mx-auto mb-8 logo-container">
            <img
              src={meditationIcon}
              alt="Haven Logo"
              className="w-full h-80 object-contain logo-image"
            />
          </div>
          <h2 className="text-3xl mb-4 text-foreground">Welcome back</h2>
          <div className={`text-3xl mb-3 ${getScoreColor(userData.overallScore)}`}>
            {userData.overallScore}%
          </div>
          <p className="text-muted-foreground text-lg">{getScoreMessage(userData.overallScore)}</p>
        </div>

        {/* Action buttons */}
        <div className="w-full space-y-4 max-w-sm">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('ai-companion')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">AI मित्र / AI Companion</h3>
                <p className="text-sm text-muted-foreground">आपका सहायक साथी / Your supportive friend</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('calm-down')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Calm-Down Session</h3>
                <p className="text-sm text-muted-foreground">5-minute guided breathing</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-card border-primary/20"
            onClick={() => navigateTo('journal')}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-accent/50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Journal & Vent</h3>
                <p className="text-sm text-muted-foreground">Express your thoughts</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Dashboard and retake quiz links at bottom */}
        <div className="mt-10 flex flex-col items-center space-y-2">
          <Button
            variant="ghost"
            onClick={() => navigateTo('dashboard')}
            className="text-primary hover:bg-primary/10"
          >
            View Dashboard
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('quiz')}
            className="text-muted-foreground hover:text-primary"
          >
            Retake Wellness Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PostQuizHome;