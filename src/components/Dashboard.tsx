
import VantaBackground from './VantaBackground';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Flame, Trophy, TrendingUp, Star, Target, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Screen, UserData } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
interface DashboardProps {
  navigateTo: (screen: Screen) => void;
  userData: UserData;
}

export function Dashboard({ navigateTo, userData }: DashboardProps) {
  const { currentTheme } = useTheme();
  const { data, loading, error } = useDashboardData(userData.id ?? "");
  const insights = data?.insights ?? [];

  const weeklyGoals = data?.weeklyGoals ?? [];
  const milestones = data?.milestones ?? [];


  return (
    <div className={`relative min-h-screen p-6 ${
      currentTheme === 'whatsapp' 
        ? 'whatsapp-main-bg' 
        : currentTheme === 'forest'
          ? ''
          : ''
    }`}>
      <VantaBackground variant="local" />
      <div className={`max-w-lg mx-auto ${
        currentTheme === 'forest' 
          ? 'bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20' 
          : currentTheme === 'whatsapp'
            ? 'bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-lg'
            : ''
      }`}>
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(userData.quizCompleted ? 'post-quiz-home' : 'home')}
            className={`mr-4 ${
              currentTheme === 'ocean' 
                ? 'text-white/90 hover:bg-white/10' 
                : currentTheme === 'forest'
                  ? '!text-black hover:bg-gray-100'
                  : currentTheme === 'whatsapp'
                    ? '!text-black hover:bg-gray-100'
                    : 'hover:bg-primary/10'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className={`text-xl font-semibold ${
            currentTheme === 'ocean' 
              ? 'text-white' 
              : currentTheme === 'forest'
                ? '!text-black'
                : currentTheme === 'whatsapp'
                  ? '!text-black'
                  : 'text-gray-900'
          }`}>Your Wellness Dashboard</h1>
        </div>

        {/* Streak Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className={`p-4 ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border-white/30' 
              : currentTheme === 'forest'
                ? 'bg-white shadow-md border-gray-200'
                : currentTheme === 'whatsapp'
                  ? 'bg-white shadow-md border-gray-200'
                  : 'bg-white shadow-md border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/70' 
                    : currentTheme === 'forest'
                      ? '!text-black/70'
                      : currentTheme === 'whatsapp'
                        ? '!text-black/70'
                        : 'text-muted-foreground'
                }`}>Current Streak</p>
                <p className={`text-xl font-semibold ${
                  currentTheme === 'ocean' 
                    ? 'text-white' 
                    : currentTheme === 'forest'
                      ? 'text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-[#00A884]'
                        : 'text-orange-600'
                }`}>{userData.streaks.current} days</p>
              </div>
            </div>
          </Card>

          <Card className={`p-4 ${
            currentTheme === 'ocean' 
              ? 'bg-white/20 backdrop-blur-md border-white/30' 
              : currentTheme === 'forest'
                ? 'bg-white shadow-md border-gray-200'
                : currentTheme === 'whatsapp'
                  ? 'bg-white shadow-md border-gray-200'
                  : 'bg-white shadow-md border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/70' 
                    : currentTheme === 'forest'
                      ? '!text-black/70'
                      : currentTheme === 'whatsapp'
                        ? '!text-black/70'
                        : 'text-muted-foreground'
                }`}>Best Streak</p>
                <p className={`text-xl font-semibold ${
                  currentTheme === 'ocean' 
                    ? 'text-white' 
                    : currentTheme === 'forest'
                      ? 'text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-[#00A884]'
                        : 'text-yellow-600'
                }`}>{userData.streaks.longest} days</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Milestones */}
        <Card className={`p-6 mb-8 ${
          currentTheme === 'ocean' 
            ? 'bg-white/20 backdrop-blur-md border-white/30' 
            : currentTheme === 'forest'
              ? 'bg-white shadow-sm border-gray-200'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-sm border-gray-200'
                : 'bg-card border-primary/20'
        }`}>
          <div className="flex items-center mb-4">
            <Star className={`w-5 h-5 mr-2 ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-green-600'
                  : currentTheme === 'whatsapp'
                    ? 'text-[#00A884]'
                    : 'text-primary'
            }`} />
            <h2 className={`text-lg font-medium ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? '!text-black'
                  : currentTheme === 'whatsapp'
                    ? '!text-black'
                    : 'text-gray-900'
            }`}>Recent Milestones</h2>
          </div>
          <div className="space-y-3">
            {userData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/90' 
                    : currentTheme === 'forest'
                      ? '!text-black/80'
                      : currentTheme === 'whatsapp'
                        ? '!text-black/80'
                        : 'text-gray-700'
                }`}>{milestone}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Goals */}
        <Card className={`p-6 mb-8 ${
          currentTheme === 'ocean' 
            ? 'bg-white/20 backdrop-blur-md border-white/30' 
            : currentTheme === 'forest'
              ? 'bg-white shadow-md border-gray-200'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-md border-gray-200'
                : 'bg-white shadow-md border-gray-200'
        }`}>
          <div className="flex items-center mb-4">
            <Target className={`w-5 h-5 mr-2 ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-green-600'
                  : currentTheme === 'whatsapp'
                    ? 'text-[#00A884]'
                    : 'text-primary'
            }`} />
            <h2 className={`text-lg font-medium ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? '!text-black'
                  : currentTheme === 'whatsapp'
                    ? '!text-black'
                    : 'text-gray-900'
            }`}>This Week's Goals</h2>
          </div>
          <div className="space-y-4">
            {weeklyGoals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${
                    currentTheme === 'ocean' 
                      ? 'text-white/90' 
                      : currentTheme === 'forest'
                        ? '!text-black/80'
                        : currentTheme === 'whatsapp'
                          ? '!text-black/80'
                          : 'text-gray-700'
                  }`}>{goal.name}</span>
                  <Badge variant={goal.progress >= goal.target ? "default" : "secondary"}>
                    {goal.progress}/{goal.target}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights */}
        <Card className={`p-6 mb-8 ${
          currentTheme === 'ocean' 
            ? 'bg-white/20 backdrop-blur-md border-white/30' 
            : currentTheme === 'forest'
              ? 'bg-white shadow-md border-gray-200'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-md border-gray-200'
                : 'bg-white shadow-md border-gray-200'
        }`}>
          <div className="flex items-center mb-4">
            <Lightbulb className={`w-5 h-5 mr-2 ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-green-600'
                  : currentTheme === 'whatsapp'
                    ? 'text-[#00A884]'
                    : 'text-gray-600'
            }`} />
            <h2 className={`text-lg font-medium ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? '!text-black'
                  : currentTheme === 'whatsapp'
                    ? '!text-black'
                    : 'text-blue-800'
            }`}>Personal Insights</h2>
          </div>
          <div className="space-y-3">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <TrendingUp className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  currentTheme === 'ocean' 
                    ? 'text-white/80' 
                    : currentTheme === 'forest'
                      ? 'text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-[#00A884]'
                        : 'text-gray-600'
                }`} />
                <p className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/90' 
                    : currentTheme === 'forest'
                      ? '!text-black/80'
                      : currentTheme === 'whatsapp'
                        ? '!text-black/80'
                        : 'text-gray-700'
                }`}>{insight}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigateTo('stats')}
            variant="card"
            className="h-12"
          >
            View Stats
          </Button>
          <Button
            onClick={() => navigateTo('quiz')}
            variant="card"
            className="h-12"
          >
            Take Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}