// Test Component for Speech-to-Text with Google Chirp 3 HD
// Verify multilingual speech recognition functionality

import React, { useState } from 'react';
import { SpeechToTextInput } from './SpeechToTextInput';
import { speechToTextService } from '../services/speechToTextService';
import { TestTube, CheckCircle, AlertCircle, Mic, Languages } from 'lucide-react';

export const SpeechToTextTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{
    language: string;
    transcript: string;
    confidence: number;
    timestamp: Date;
  }>>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  // Test phrases in different languages
  const testPhrases = [
    { language: 'en-IN', phrase: 'Hello, how are you today?', nativeName: 'English' },
    { language: 'hi-IN', phrase: 'नमस्ते, आप कैसे हैं?', nativeName: 'हिन्दी' },
    { language: 'bn-IN', phrase: 'হ্যালো, আপনি কেমন আছেন?', nativeName: 'বাংলা' },
    { language: 'ta-IN', phrase: 'வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?', nativeName: 'தமிழ்' },
    { language: 'mr-IN', phrase: 'नमस्कार, तुम्ही कसे आहात?', nativeName: 'मराठी' }
  ];

  // Handle transcript result
  const handleTranscript = (transcript: string, confidence: number) => {
    if (currentTest && transcript.trim()) {
      const result = {
        language: currentTest,
        transcript,
        confidence,
        timestamp: new Date()
      };
      
      setTestResults(prev => [result, ...prev]);
      setCurrentTest(null);
      
      console.log('✅ Test result:', result);
    }
  };

  // Start language-specific test
  const startLanguageTest = (languageCode: string) => {
    setCurrentTest(languageCode);
  };

  // Get service status
  const serviceStatus = speechToTextService.getStatus();
  const supportedLanguages = speechToTextService.getSupportedLanguages();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <TestTube className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Speech-to-Text Test Lab</h1>
        </div>
        <p className="text-gray-600">Test Google Chirp 3 HD with multilingual support</p>
      </div>

      {/* Service Status */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Service Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            {serviceStatus.isSupported ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm">
              {serviceStatus.isSupported ? 'Supported' : 'Not Supported'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {serviceStatus.hasApiKey ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm">
              {serviceStatus.hasApiKey ? 'API Key OK' : 'No API Key'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.method === 'webspeech' ? 'bg-green-500' :
              serviceStatus.method === 'googleapi' ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm capitalize">{serviceStatus.method}</span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{supportedLanguages.length} Languages</span>
          </div>
        </div>
      </div>

      {/* Main Speech Input */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Live Speech Recognition</h2>
        <SpeechToTextInput
          onTranscript={handleTranscript}
          placeholder="Click the microphone and speak in any supported language..."
          showLanguageSelector={true}
          showConfidence={true}
          className="w-full"
        />
      </div>

      {/* Language-Specific Tests */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Language-Specific Tests</h2>
        <p className="text-sm text-gray-600 mb-4">
          Test speech recognition with specific languages. Try saying the suggested phrases:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testPhrases.map((test) => (
            <div key={test.language} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{test.nativeName}</span>
                <button
                  onClick={() => startLanguageTest(test.language)}
                  disabled={currentTest === test.language}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    currentTest === test.language
                      ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {currentTest === test.language ? 'Testing...' : 'Test'}
                </button>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                "{test.phrase}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-3">Test Results</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {supportedLanguages.find(l => l.code === result.language)?.nativeName || result.language}
                    </span>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      result.confidence > 0.8 ? 'bg-green-100 text-green-700' :
                      result.confidence > 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(result.confidence * 100)}% confidence
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                  "{result.transcript}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supported Languages */}
      <div className="bg-white rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-3">Supported Languages ({supportedLanguages.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {supportedLanguages.map((lang) => (
            <div key={lang.code} className="text-center p-2 border rounded">
              <div className="font-medium text-sm">{lang.nativeName}</div>
              <div className="text-xs text-gray-500">{lang.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextTest;