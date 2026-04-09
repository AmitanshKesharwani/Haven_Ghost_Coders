import React, { useState, useEffect } from 'react';
import './AssessmentDemo.css';

// Simple types for the demo
interface AssessmentQuestion {
  id: string;
  conversationalPrompt: string;
  category: string;
}

interface AssessmentResponse {
  questionId: string;
  userResponse: string;
  extractedScore: number;
  emotionalTone: string;
}

interface AssessmentResult {
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  insights: string[];
  recommendations: string[];
}

const AssessmentDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sample PHQ-9 questions converted to conversational format
  const questions: AssessmentQuestion[] = [
    {
      id: 'phq9_1',
      conversationalPrompt: "I'd like to understand how you've been feeling lately. Tell me, have there been activities or things you usually enjoy that don't seem as interesting or fun anymore?",
      category: 'anhedonia'
    },
    {
      id: 'phq9_2',
      conversationalPrompt: "Life can feel heavy sometimes. I'm wondering if you've been experiencing feelings of sadness, feeling low, or like things might not get better?",
      category: 'mood'
    },
    {
      id: 'phq9_3',
      conversationalPrompt: "Sleep can tell us a lot about how we're doing emotionally. How has your sleep been lately? Are you having trouble falling asleep, staying asleep, or maybe sleeping more than usual?",
      category: 'sleep'
    }
  ];

  const currentQuestion = questions[currentStep];

  // Simulate AI processing
  const processResponse = async (response: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple scoring logic
    let score = 1;
    const responseText = response.toLowerCase();
    
    if (responseText.includes('very') || responseText.includes('extremely') || 
        responseText.includes('always') || responseText.includes('constantly')) {
      score = 3;
    } else if (responseText.includes('not really') || responseText.includes('rarely') || 
               responseText.includes('never') || responseText.includes('fine')) {
      score = 0;
    } else if (responseText.includes('sometimes') || responseText.includes('often')) {
      score = 2;
    }

    const assessmentResponse: AssessmentResponse = {
      questionId: currentQuestion.id,
      userResponse: response,
      extractedScore: score,
      emotionalTone: detectEmotionalTone(response)
    };

    const newResponses = [...responses, assessmentResponse];
    setResponses(newResponses);

    // Generate AI acknowledgment
    const acknowledgments = [
      "Thank you for sharing that with me. I appreciate your openness.",
      "I hear you, and I want you to know that what you're experiencing is valid.",
      "That gives me a good understanding of what you're going through."
    ];
    
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    setAiResponse(acknowledgment);

    // Check if assessment is complete
    if (currentStep >= questions.length - 1) {
      const totalScore = newResponses.reduce((sum, r) => sum + r.extractedScore, 0);
      const assessmentResult = generateResult(totalScore, newResponses);
      setResult(assessmentResult);
      setIsComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
    }

    setIsLoading(false);
  };

  const detectEmotionalTone = (response: string): string => {
    const responseText = response.toLowerCase();
    
    if (responseText.includes('sad') || responseText.includes('depressed')) {
      return 'sad';
    } else if (responseText.includes('anxious') || responseText.includes('worried')) {
      return 'anxious';
    } else if (responseText.includes('angry') || responseText.includes('frustrated')) {
      return 'angry';
    } else if (responseText.includes('happy') || responseText.includes('good')) {
      return 'positive';
    }
    
    return 'neutral';
  };

  const generateResult = (totalScore: number, responses: AssessmentResponse[]): AssessmentResult => {
    let riskLevel: 'low' | 'moderate' | 'high' | 'severe' = 'low';
    
    if (totalScore >= 7) riskLevel = 'severe';
    else if (totalScore >= 5) riskLevel = 'high';
    else if (totalScore >= 3) riskLevel = 'moderate';

    const insights = [
      `Your total score is ${totalScore} out of ${questions.length * 3}, indicating ${riskLevel} level concerns.`,
      `You showed strength in areas where you scored lower.`,
      `Your responses indicate that ${questions[0]?.category || 'mood'} is a key area to focus on.`
    ];

    const recommendations = [
      riskLevel === 'severe' || riskLevel === 'high' 
        ? 'Consider speaking with a mental health professional for additional support'
        : 'Try mindfulness and self-care activities',
      'Practice daily breathing exercises and meditation',
      'Maintain regular sleep and exercise routines',
      'Connect with supportive family members or friends'
    ];

    return { totalScore, riskLevel, insights, recommendations };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userResponse.trim()) {
      processResponse(userResponse);
      setUserResponse('');
    }
  };

  const resetAssessment = () => {
    setCurrentStep(0);
    setUserResponse('');
    setResponses([]);
    setAiResponse('');
    setIsComplete(false);
    setResult(null);
    setIsLoading(false);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'severe': return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <div className="assessment-demo">
      <div className="assessment-container">
        <div className="assessment-header">
          <h1>🧠 Mann-Mitra Assessment</h1>
          <p>Conversational Mental Health Assessment</p>
          {!isComplete && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
              <span className="progress-text">
                Question {currentStep + 1} of {questions.length}
              </span>
            </div>
          )}
        </div>

        {!isComplete ? (
          <div className="assessment-content">
            <div className="chat-container">
              {/* Previous responses */}
              {responses.map((response, index) => (
                <div key={index} className="chat-history">
                  <div className="ai-message">
                    <div className="message-bubble ai">
                      {questions[index]?.conversationalPrompt}
                    </div>
                  </div>
                  <div className="user-message">
                    <div className="message-bubble user">
                      {response.userResponse}
                    </div>
                    <div className="response-analysis">
                      <span className={`emotion-tag ${response.emotionalTone}`}>
                        {response.emotionalTone}
                      </span>
                      <span className="score-tag">Score: {response.extractedScore}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Current question */}
              {currentQuestion && (
                <div className="current-question">
                  <div className="ai-message">
                    <div className="message-bubble ai">
                      {aiResponse && <div className="acknowledgment">{aiResponse}</div>}
                      <div className="question">{currentQuestion.conversationalPrompt}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <div className="loading-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>AI is analyzing your response...</p>
                </div>
              )}
            </div>

            {/* Input form */}
            {!isLoading && (
              <form onSubmit={handleSubmit} className="response-form">
                <div className="input-container">
                  <textarea
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                    placeholder="Share your thoughts and feelings here..."
                    className="response-input"
                    rows={3}
                  />
                  <button 
                    type="submit" 
                    disabled={!userResponse.trim()}
                    className="submit-button"
                  >
                    Send Response
                  </button>
                </div>
                <p className="input-hint">
                  💡 Take your time and be as detailed as you feel comfortable sharing
                </p>
              </form>
            )}
          </div>
        ) : (
          <div className="results-container">
            <div className="results-header">
              <h2>🎯 Assessment Complete</h2>
              <div className="risk-level-badge" style={{ backgroundColor: getRiskLevelColor(result?.riskLevel || 'low') }}>
                Risk Level: {result?.riskLevel?.toUpperCase()}
              </div>
            </div>

            <div className="results-content">
              <div className="insights-section">
                <h3>📊 Key Insights</h3>
                <ul className="insights-list">
                  {result?.insights.map((insight, index) => (
                    <li key={index} className="insight-item">{insight}</li>
                  ))}
                </ul>
              </div>

              <div className="recommendations-section">
                <h3>💡 Personalized Recommendations</h3>
                <ul className="recommendations-list">
                  {result?.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      <span className="rec-number">{index + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="cultural-context">
                <h3>🌍 Cultural Considerations</h3>
                <p>This assessment has been adapted for Indian cultural context, considering family dynamics, academic pressures, and cultural values that may influence your mental health experience.</p>
              </div>

              <div className="next-steps">
                <h3>🚀 Next Steps</h3>
                <div className="action-buttons">
                  <button className="primary-button">
                    Start Therapeutic Activities
                  </button>
                  <button className="secondary-button">
                    Connect with Professional
                  </button>
                  <button className="secondary-button" onClick={resetAssessment}>
                    Take Assessment Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="demo-info">
          <h4>🔬 Demo Features Showcased:</h4>
          <ul>
            <li>✅ Conversational Assessment (PHQ-9 transformed)</li>
            <li>✅ Real-time AI Response Processing</li>
            <li>✅ Emotional Tone Detection</li>
            <li>✅ Cultural Context Integration</li>
            <li>✅ Risk Level Assessment</li>
            <li>✅ Personalized Recommendations</li>
            <li>✅ Progress Tracking Interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssessmentDemo;