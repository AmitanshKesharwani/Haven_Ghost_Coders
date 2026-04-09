import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { firebaseService } from '../services/firebaseService';
import { toast } from 'sonner';

interface AssessmentFormProps {
  assessmentType: 'phq9' | 'gad7' | 'custom_wellness';
  onComplete: (results: any) => void;
  onCancel: () => void;
}

// PHQ-9 Questions (Depression Screening)
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless", 
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed. Or the opposite being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself"
];

// GAD-7 Questions (Anxiety Screening)
const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

// Custom Wellness Questions
const WELLNESS_QUESTIONS = [
  "How satisfied are you with your current mental health?",
  "How well are you managing stress in your daily life?",
  "How connected do you feel to your family and friends?",
  "How confident are you in your ability to handle problems?",
  "How satisfied are you with your sleep quality?",
  "How much energy do you have for daily activities?",
  "How hopeful do you feel about your future?",
  "How well are you taking care of your physical health?"
];

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all / बिल्कुल नहीं" },
  { value: 1, label: "Several days / कुछ दिन" },
  { value: 2, label: "More than half the days / आधे से ज्यादा दिन" },
  { value: 3, label: "Nearly every day / लगभग हर दिन" }
];

const WELLNESS_OPTIONS = [
  { value: 0, label: "Very Poor / बहुत खराब" },
  { value: 1, label: "Poor / खराब" },
  { value: 2, label: "Fair / ठीक" },
  { value: 3, label: "Good / अच्छा" },
  { value: 4, label: "Excellent / बेहतरीन" }
];

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ 
  assessmentType, 
  onComplete, 
  onCancel 
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  const getQuestions = () => {
    switch (assessmentType) {
      case 'phq9': return PHQ9_QUESTIONS;
      case 'gad7': return GAD7_QUESTIONS;
      case 'custom_wellness': return WELLNESS_QUESTIONS;
      default: return PHQ9_QUESTIONS;
    }
  };

  const getOptions = () => {
    return assessmentType === 'custom_wellness' ? WELLNESS_OPTIONS : RESPONSE_OPTIONS;
  };

  const getTitle = () => {
    switch (assessmentType) {
      case 'phq9': return 'PHQ-9 Depression Screening / अवसाद जांच';
      case 'gad7': return 'GAD-7 Anxiety Screening / चिंता जांच';
      case 'custom_wellness': return 'Wellness Assessment / कल्याण मूल्यांकन';
      default: return 'Mental Health Assessment';
    }
  };

  const getDescription = () => {
    switch (assessmentType) {
      case 'phq9': 
        return 'Over the last 2 weeks, how often have you been bothered by any of the following problems? / पिछले 2 सप्ताह में, आप कितनी बार निम्नलिखित समस्याओं से परेशान हुए हैं?';
      case 'gad7':
        return 'Over the last 2 weeks, how often have you been bothered by the following problems? / पिछले 2 सप्ताह में, आप कितनी बार निम्नलिखित समस्याओं से परेशान हुए हैं?';
      case 'custom_wellness':
        return 'Please rate how you feel about each aspect of your wellbeing / कृपया अपनी भलाई के प्रत्येक पहलू के बारे में बताएं कि आप कैसा महसूस करते हैं';
      default: return '';
    }
  };

  const questions = getQuestions();
  const options = getOptions();

  const handleResponse = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    const totalScore = Object.values(responses).reduce((sum, value) => sum + value, 0);
    let severity = 'minimal';
    let recommendations: string[] = [];

    if (assessmentType === 'phq9') {
      if (totalScore >= 20) {
        severity = 'severe';
        recommendations = [
          'Immediate professional help recommended',
          'Consider contacting a mental health professional',
          'Reach out to crisis helplines if needed'
        ];
      } else if (totalScore >= 15) {
        severity = 'moderately_severe';
        recommendations = [
          'Professional counseling recommended',
          'Consider therapy or medication consultation',
          'Practice self-care and stress management'
        ];
      } else if (totalScore >= 10) {
        severity = 'moderate';
        recommendations = [
          'Consider professional support',
          'Practice regular self-care',
          'Monitor symptoms closely'
        ];
      } else if (totalScore >= 5) {
        severity = 'mild';
        recommendations = [
          'Focus on self-care and wellness',
          'Consider lifestyle improvements',
          'Monitor mood changes'
        ];
      } else {
        recommendations = [
          'Continue healthy habits',
          'Maintain social connections',
          'Practice preventive self-care'
        ];
      }
    } else if (assessmentType === 'gad7') {
      if (totalScore >= 15) {
        severity = 'severe';
        recommendations = [
          'Professional anxiety treatment recommended',
          'Consider therapy or medication',
          'Practice anxiety management techniques'
        ];
      } else if (totalScore >= 10) {
        severity = 'moderate';
        recommendations = [
          'Consider professional support for anxiety',
          'Practice relaxation techniques',
          'Monitor anxiety levels'
        ];
      } else if (totalScore >= 5) {
        severity = 'mild';
        recommendations = [
          'Practice stress management',
          'Use relaxation techniques',
          'Monitor anxiety symptoms'
        ];
      } else {
        recommendations = [
          'Continue healthy coping strategies',
          'Maintain stress management practices',
          'Stay aware of anxiety triggers'
        ];
      }
    } else {
      // Custom wellness scoring
      const averageScore = totalScore / questions.length;
      if (averageScore >= 3.5) {
        severity = 'excellent';
        recommendations = [
          'Excellent wellbeing! Keep up the great work',
          'Continue your current wellness practices',
          'Consider helping others with their wellness journey'
        ];
      } else if (averageScore >= 2.5) {
        severity = 'good';
        recommendations = [
          'Good overall wellbeing',
          'Focus on areas that need improvement',
          'Maintain healthy habits'
        ];
      } else if (averageScore >= 1.5) {
        severity = 'fair';
        recommendations = [
          'Some areas need attention',
          'Consider professional support',
          'Focus on self-care practices'
        ];
      } else {
        severity = 'poor';
        recommendations = [
          'Multiple areas need attention',
          'Professional support recommended',
          'Prioritize mental health care'
        ];
      }
    }

    return { totalScore, severity, recommendations };
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const scores = calculateScore();
      
      // Get previous assessment for comparison
      const previousAssessments = await firebaseService.getUserAssessments(currentUser.uid, assessmentType);
      const previousScore = previousAssessments.length > 0 ? previousAssessments[0]?.scores?.totalScore : null;
      
      const assessmentResult = {
        userId: currentUser.uid,
        assessmentType,
        completedAt: new Date(),
        responses,
        scores: {
          totalScore: scores.totalScore,
          severity: scores.severity as 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe',
          recommendations: scores.recommendations
        },
        ...(previousScore !== null && previousScore !== undefined ? {
          comparedToPrevious: {
            previousScore: previousScore!,
            change: scores.totalScore - previousScore!,
            trend: (scores.totalScore < previousScore! ? 'improving' : 
                   scores.totalScore > previousScore! ? 'declining' : 'stable') as 'improving' | 'declining' | 'stable'
          }
        } : {})
      };

      await firebaseService.saveAssessmentResult(assessmentResult);
      
      // --- NEW: Log this activity ---
      try {
        await firebaseService.logUserActivity(
          currentUser.uid,
          'completed_assessment',
          { 
            assessmentType,
            totalScore: scores.totalScore,
            severity: scores.severity,
            previousScore: previousScore,
            trend: assessmentResult.comparedToPrevious?.trend || 'first_time'
          }
        );
      } catch (activityError) {
        console.warn('Failed to log assessment activity:', activityError);
      }
      // --- END NEW ---
      
      toast.success('Assessment completed successfully! / मूल्यांकन सफलतापूर्वक पूरा हुआ!');
      onComplete(assessmentResult);
      
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Error saving assessment / मूल्यांकन सहेजने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = responses[currentQuestion] !== undefined;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="mr-4 hover:bg-primary/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-gray-600 text-sm mt-1">{getDescription()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 bg-white shadow-lg">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {questions[currentQuestion]}
            </h2>
          </div>

          {/* Response Options */}
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleResponse(option.value)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  responses[currentQuestion] === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    responses[currentQuestion] === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {responses[currentQuestion] === option.value && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous / पिछला
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || loading}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving... / सहेजा जा रहा है...</span>
              </div>
            ) : currentQuestion === questions.length - 1 ? (
              <>
                Complete / पूरा करें
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next / अगला
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <strong>Remember:</strong> This assessment is for informational purposes only and does not replace professional medical advice.
            <br />
            <strong>याद रखें:</strong> यह मूल्यांकन केवल जानकारी के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।
          </p>
        </div>
      </div>
    </div>
  );
};