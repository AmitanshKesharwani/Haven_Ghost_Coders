import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowLeft, Smile, Meh, Frown, Battery, Moon, Zap, Users, Target } from 'lucide-react';
import type { Screen, UserData } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface QuizPageProps {
  navigateTo: (screen: Screen) => void;
  userData: UserData;
  updateUserData: (data: Partial<UserData>) => void;
}

const questions = [
  {
    question: "How are you feeling today?",
    options: [
      { text: "Amazing", icon: Smile, value: 100 },
      { text: "Great", icon: Smile, value: 85 },
      { text: "Good", icon: Smile, value: 70 },
      { text: "Okay", icon: Meh, value: 55 },
      { text: "Not great", icon: Frown, value: 30 },
      { text: "Struggling", icon: Frown, value: 10 }
    ]
  },
  {
    question: "How well did you sleep last night?",
    options: [
      { text: "Excellent", icon: Moon, value: 100 },
      { text: "Very well", icon: Moon, value: 85 },
      { text: "Well", icon: Moon, value: 70 },
      { text: "Okay", icon: Moon, value: 55 },
      { text: "Poorly", icon: Moon, value: 30 },
      { text: "Terribly", icon: Moon, value: 10 }
    ]
  },
  {
    question: "What's your energy level?",
    options: [
      { text: "Full of energy", icon: Zap, value: 100 },
      { text: "Energetic", icon: Zap, value: 85 },
      { text: "Good energy", icon: Battery, value: 70 },
      { text: "Average", icon: Battery, value: 55 },
      { text: "Low energy", icon: Battery, value: 30 },
      { text: "Exhausted", icon: Battery, value: 10 }
    ]
  },
  {
    question: "How connected do you feel to others?",
    options: [
      { text: "Very connected", icon: Users, value: 100 },
      { text: "Connected", icon: Users, value: 85 },
      { text: "Somewhat connected", icon: Users, value: 70 },
      { text: "Neutral", icon: Users, value: 55 },
      { text: "Disconnected", icon: Users, value: 30 },
      { text: "Very isolated", icon: Users, value: 10 }
    ]
  },
  {
    question: "How motivated do you feel?",
    options: [
      { text: "Highly motivated", icon: Target, value: 100 },
      { text: "Motivated", icon: Target, value: 85 },
      { text: "Somewhat motivated", icon: Target, value: 70 },
      { text: "Neutral", icon: Target, value: 55 },
      { text: "Unmotivated", icon: Target, value: 30 },
      { text: "No motivation", icon: Target, value: 10 }
    ]
  }
];

export function QuizPage({ navigateTo, userData, updateUserData }: QuizPageProps) {
  const { currentTheme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(userData.currentQuizQuestion);
  const [answers, setAnswers] = useState<number[]>(userData.quizAnswers);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      updateUserData({
        currentQuizQuestion: currentQuestion + 1,
        quizAnswers: newAnswers
      });
    } else {
      // Quiz completed
      const averageScore = Math.round(newAnswers.reduce((sum, answer) => sum + answer, 0) / newAnswers.length);
      
      updateUserData({
        quizCompleted: true,
        quizAnswers: newAnswers,
        overallScore: averageScore,
        currentQuizQuestion: 0
      });

      navigateTo('post-quiz-home');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      updateUserData({ currentQuizQuestion: currentQuestion - 1 });
    } else {
      navigateTo(userData.quizCompleted ? 'post-quiz-home' : 'home');
    }
  };

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className={`relative min-h-screen p-6 ${
      currentTheme === 'whatsapp' ? 'whatsapp-main-bg' : ''
    }`}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-12">
          <h1 className="text-2xl mb-4">{currentQuestionData?.question}</h1>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          {currentQuestionData?.options.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <Card
                key={index}
                className="p-6 cursor-pointer hover:shadow-md hover:scale-105 transition-all bg-card border-primary/20 hover:border-primary/40"
                onClick={() => handleAnswerSelect(option.value)}
              >
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium">{option.text}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}