
import { Button } from './ui/button';
import { Card } from './ui/card';

import { ArrowLeft, Brain, Moon, Heart, Zap, Activity, AlertTriangle, Smile } from 'lucide-react';
import type { Screen, UserData } from '../types';

interface StatsScreenProps {
  navigateTo: (screen: Screen) => void;
  userData: UserData;
}

export function StatsScreen({ navigateTo, userData }: StatsScreenProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-500';
    if (score >= 40) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 70) return 'bg-emerald-50/50';
    if (score >= 40) return 'bg-orange-50/50';
    return 'bg-rose-50/50';
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-300';
    if (score >= 40) return 'bg-orange-300';
    return 'bg-rose-300';
  };

  const metrics = [
    { name: 'Stress Level', value: userData.metrics.stress, icon: Brain, inverted: true },
    { name: 'Sleep Quality', value: userData.metrics.sleep, icon: Moon },
    { name: 'Happiness', value: userData.metrics.happiness, icon: Heart },
    { name: 'Productivity', value: userData.metrics.productivity, icon: Zap },
    { name: 'Activity Level', value: userData.metrics.activity, icon: Activity },
  ];

  const clinicalMetrics = [
    { name: 'PHQ-9', value: userData.metrics.phq9, icon: AlertTriangle, description: 'Depression screening' },
    { name: 'GAD-7', value: userData.metrics.gad7, icon: Smile, description: 'Anxiety screening' },
  ];

  return (
    <div className="relative min-h-screen p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo(userData.quizCompleted ? 'post-quiz-home' : 'home')}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl">Your Wellness Stats</h1>
        </div>

        {/* Central Overall Score */}
        <Card className={`p-8 mb-8 text-center ${getScoreBackground(userData.overallScore)} border-primary/20`}>
          <div className="mb-4">
            <div className={`text-6xl mb-2 ${getScoreColor(userData.overallScore)}`}>
              {userData.overallScore}%
            </div>
            <p className="text-lg font-medium text-foreground">Overall Wellness Score</p>
            <p className="text-sm text-muted-foreground mt-2">
              {userData.overallScore >= 70 ? 'Excellent progress!' : 
               userData.overallScore >= 40 ? 'You\'re doing well' : 'Let\'s work on this together'}
            </p>
          </div>
        </Card>

        {/* Wellness Metrics */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-medium">Wellness Metrics</h2>
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const displayValue = metric.inverted ? 100 - metric.value : metric.value;
            const colorValue = metric.inverted ? 100 - metric.value : metric.value;
            
            return (
              <Card key={index} className="p-4 bg-card border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className={`font-medium ${getScoreColor(colorValue)}`}>
                    {displayValue}%
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(colorValue)}`}
                    style={{ width: `${displayValue}%` }}
                  />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Clinical Assessments */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-medium">Clinical Assessments</h2>
          {clinicalMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            const severity = metric.value <= 4 ? 'Minimal' : 
                           metric.value <= 9 ? 'Mild' :
                           metric.value <= 14 ? 'Moderate' : 'Severe';
            const severityColor = metric.value <= 4 ? 'text-emerald-500' :
                                 metric.value <= 9 ? 'text-orange-400' : 'text-rose-400';
            
            return (
              <Card key={index} className="p-4 bg-card border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-medium">{metric.name}</span>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{metric.value}/21</div>
                    <div className={`text-sm ${severityColor}`}>{severity}</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Dashboard Link */}
        <div className="text-center">
          <Button 
            onClick={() => navigateTo('dashboard')}
            className="bg-primary hover:bg-primary/90"
          >
            View Full Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}