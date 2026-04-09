import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from '../contexts/ThemeContext';

interface AssessmentQuestion {
  id: string;
  question: {
    en: string;
    hi: string;
  };
  options: {
    en: string[];
    hi: string[];
  };
  scores: number[];
}

interface Assessment {
  id: string;
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  questions: AssessmentQuestion[];
  color: string;
  icon: string;
}

const ASSESSMENTS: Assessment[] = [
  {
    id: 'phq9',
    title: {
      en: 'PHQ-9 (Depression)',
      hi: 'PHQ-9 (अवसाद जांच)'
    },
    description: {
      en: 'Patient Health Questionnaire for Depression Screening',
      hi: 'अवसाद की जांच के लिए रोगी स्वास्थ्य प्रश्नावली'
    },
    color: 'from-blue-500 to-purple-600',
    icon: '🧠',
    questions: [
      {
        id: 'phq9_1',
        question: {
          en: 'Little interest or pleasure in doing things',
          hi: 'काम करने में कम रुचि या खुशी'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_2',
        question: {
          en: 'Feeling down, depressed, or hopeless',
          hi: 'उदास, निराश या हताश महसूस करना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_3',
        question: {
          en: 'Trouble falling or staying asleep, or sleeping too much',
          hi: 'सोने में परेशानी या बहुत ज्यादा सोना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_4',
        question: {
          en: 'Feeling tired or having little energy',
          hi: 'थकान महसूस करना या कम ऊर्जा होना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_5',
        question: {
          en: 'Poor appetite or overeating',
          hi: 'भूख न लगना या ज्यादा खाना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_6',
        question: {
          en: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
          hi: 'अपने बारे में बुरा महसूस करना — या यह कि आप असफल हैं या आपने खुद को या अपने परिवार को निराश किया है'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_7',
        question: {
          en: 'Trouble concentrating on things, such as reading the newspaper or watching television',
          hi: 'चीजों पर ध्यान केंद्रित करने में परेशानी, जैसे अखबार पढ़ना या टेलीविजन देखना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_8',
        question: {
          en: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
          hi: 'इतनी धीमी गति से चलना या बोलना कि दूसरे लोग नोटिस कर सकें? या इसके विपरीत — इतना बेचैन या परेशान होना कि आप सामान्य से बहुत अधिक घूम रहे हों'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'phq9_9',
        question: {
          en: 'Thoughts that you would be better off dead or of hurting yourself in some way',
          hi: 'यह सोचना कि आप मर जाएं तो बेहतर होगा या किसी तरह से खुद को नुकसान पहुंचाने के विचार'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      }
    ]
  },
  {
    id: 'gad7',
    title: {
      en: 'GAD-7 (Anxiety)',
      hi: 'GAD-7 (चिंता जांच)'
    },
    description: {
      en: 'Generalized Anxiety Disorder Assessment',
      hi: 'सामान्यीकृत चिंता विकार मूल्यांकन'
    },
    color: 'from-teal-500 to-cyan-600',
    icon: '😰',
    questions: [
      {
        id: 'gad7_1',
        question: {
          en: 'Feeling nervous, anxious, or on edge',
          hi: 'घबराहट, चिंता या बेचैनी महसूस करना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_2',
        question: {
          en: 'Not being able to stop or control worrying',
          hi: 'चिंता को रोकने या नियंत्रित करने में असमर्थ होना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_3',
        question: {
          en: 'Worrying too much about different things',
          hi: 'अलग-अलग चीजों के बारे में बहुत ज्यादा चिंता करना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_4',
        question: {
          en: 'Trouble relaxing',
          hi: 'आराम करने में परेशानी'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_5',
        question: {
          en: 'Being so restless that it is hard to sit still',
          hi: 'इतना बेचैन होना कि शांत बैठना मुश्किल हो'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_6',
        question: {
          en: 'Becoming easily annoyed or irritable',
          hi: 'आसानी से परेशान या चिड़चिड़ाहट होना'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      },
      {
        id: 'gad7_7',
        question: {
          en: 'Feeling afraid, as if something awful might happen',
          hi: 'डर लगना, जैसे कि कुछ भयानक हो सकता है'
        },
        options: {
          en: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
          hi: ['बिल्कुल नहीं', 'कुछ दिन', 'आधे से ज्यादा दिन', 'लगभग हर दिन']
        },
        scores: [0, 1, 2, 3]
      }
    ]
  },
  {
    id: 'wellness',
    title: {
      en: 'Wellness Check-in',
      hi: 'कल्याण जांच'
    },
    description: {
      en: 'Quick daily wellness assessment',
      hi: 'त्वरित दैनिक कल्याण मूल्यांकन'
    },
    color: 'from-green-500 to-emerald-600',
    icon: '🌱',
    questions: [
      {
        id: 'wellness_1',
        question: {
          en: 'How would you rate your overall mood today?',
          hi: 'आज आप अपने समग्र मूड को कैसे रेट करेंगे?'
        },
        options: {
          en: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
          hi: ['बहुत खराब', 'खराब', 'ठीक', 'अच्छा', 'उत्कृष्ट']
        },
        scores: [1, 2, 3, 4, 5]
      },
      {
        id: 'wellness_2',
        question: {
          en: 'How well did you sleep last night?',
          hi: 'कल रात आपकी नींद कैसी थी?'
        },
        options: {
          en: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
          hi: ['बहुत खराब', 'खराब', 'ठीक', 'अच्छी', 'उत्कृष्ट']
        },
        scores: [1, 2, 3, 4, 5]
      },
      {
        id: 'wellness_3',
        question: {
          en: 'How is your energy level today?',
          hi: 'आज आपका ऊर्जा स्तर कैसा है?'
        },
        options: {
          en: ['Very Low', 'Low', 'Moderate', 'High', 'Very High'],
          hi: ['बहुत कम', 'कम', 'मध्यम', 'उच्च', 'बहुत उच्च']
        },
        scores: [1, 2, 3, 4, 5]
      }
    ]
  }
];

interface AssessmentSystemProps {
  onBack: () => void;
  onComplete: (results: any) => void;
}

export function AssessmentSystem({ onBack, onComplete }: AssessmentSystemProps) {
  const { currentTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'selection' | 'assessment' | 'results'>('selection');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  const handleAssessmentSelect = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setCurrentView('assessment');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswerSelect = (score: number) => {
    if (!selectedAssessment) return;
    
    const currentQuestion = selectedAssessment.questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: score
    }));
  };

  const handleNext = () => {
    if (!selectedAssessment) return;
    
    if (currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Assessment complete
      const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
      const results = {
        assessmentId: selectedAssessment.id,
        title: selectedAssessment.title[language],
        totalScore,
        answers,
        completedAt: new Date().toISOString()
      };
      onComplete(results);
      setCurrentView('results');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setCurrentView('selection');
    }
  };

  const currentQuestion = selectedAssessment?.questions[currentQuestionIndex];
  const progress = selectedAssessment ? ((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100 : 0;
  const hasAnswer = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  if (currentView === 'selection') {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 hover:bg-white/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Choose Assessment</h1>
              <p className="text-gray-600">Select a mental health assessment to begin</p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'hi' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>

          {/* Assessment Options */}
          <div className="grid gap-6 max-w-2xl mx-auto">
            {ASSESSMENTS.map((assessment) => (
              <Card
                key={assessment.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm"
                onClick={() => handleAssessmentSelect(assessment)}
              >
                <div className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${assessment.color} text-white text-center mb-4`}>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{assessment.icon}</span>
                    <h3 className="text-xl font-bold">{assessment.title[language]}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-center">{assessment.description[language]}</p>
              </Card>
            ))}
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              onClick={onBack}
              className="px-8 py-3 bg-white/80 backdrop-blur-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'assessment' && selectedAssessment && currentQuestion) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="hover:bg-white/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedAssessment.title[language]}
              </h1>
              <p className="text-gray-600">
                Over the last 2 weeks, how often have you been bothered by any of the following problems? / 
                पिछले 2 सप्ताह में, आप कितनी बार निम्नलिखित समस्याओं से परेशान हुए हैं?
              </p>
            </div>
            <div className="w-10"></div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-8 text-center">
              {currentQuestion.question[language]}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.options[language].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion.scores[index])}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    answers[currentQuestion.id] === currentQuestion.scores[index]
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === currentQuestion.scores[index]
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion.id] === currentQuestion.scores[index] && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-800 font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm"
            >
              Previous / पिछला
            </Button>
            <Button
              onClick={handleNext}
              disabled={!hasAnswer}
              className={`px-6 py-3 ${
                hasAnswer 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex === selectedAssessment.questions.length - 1 ? 'Complete' : 'Next'} / 
              {currentQuestionIndex === selectedAssessment.questions.length - 1 ? 'पूर्ण' : 'अगला'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AssessmentSystem;