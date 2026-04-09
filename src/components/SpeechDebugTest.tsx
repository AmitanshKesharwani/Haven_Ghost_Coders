// Simple Speech-to-Text Debug Test Component
// Quick test to verify speech recognition is working

import React, { useState } from 'react';
import { Mic, MicOff, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { speechToTextService } from '../services/speechToTextService';

export const SpeechDebugTest: React.FC = () => {
  const {
    isRecording,
    transcript,
    confidence,
    language,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported
  } = useSpeechToText();

  const [testResults, setTestResults] = useState<string[]>([]);

  // Get service status
  const serviceStatus = speechToTextService.getStatus();

  // Handle transcript
  const handleTranscript = (transcript: string, confidence: number) => {
    const result = `${new Date().toLocaleTimeString()}: "${transcript}" (${Math.round(confidence * 100)}% confidence)`;
    setTestResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
  };

  // Quick test function
  const runQuickTest = async () => {
    try {
      clearTranscript();
      setTestResults([]);
      
      await startRecording({
        language: 'en-IN',
        alternativeLanguages: ['hi-IN'],
        enableAutomaticPunctuation: true
      });
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 5000);
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🎤 Speech-to-Text Debug Test</h2>
        <p className="text-gray-600">Quick test to verify speech recognition functionality</p>
      </div>

      {/* Service Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">System Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            {isSupported ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            <span>Browser Support: {isSupported ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex items-center gap-2">
            {serviceStatus.hasApiKey ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            )}
            <span>API Key: {serviceStatus.hasApiKey ? 'Configured' : 'Missing'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              serviceStatus.method === 'webspeech' ? 'bg-green-500' :
              serviceStatus.method === 'googleapi' ? 'bg-blue-500' : 'bg-gray-400'
            }`} />
            <span>Method: {serviceStatus.method}</span>
          </div>
          <div className="flex items-center gap-2">
            {serviceStatus.isRecording ? (
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
            )}
            <span>Status: {serviceStatus.isRecording ? 'Recording' : 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Quick Test Button */}
      <div className="mb-6 text-center">
        <button
          onClick={runQuickTest}
          disabled={!isSupported || isRecording}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            !isSupported || isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Play className="w-5 h-5 inline mr-2" />
          {isRecording ? 'Recording...' : 'Run 5-Second Test'}
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Click and speak for 5 seconds to test speech recognition
        </p>
      </div>

      {/* Manual Controls */}
      <div className="mb-6 flex justify-center gap-4">
        <button
          onClick={() => startRecording()}
          disabled={!isSupported || isRecording}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            isRecording
              ? 'bg-red-100 text-red-600 cursor-not-allowed'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          Start
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            !isRecording
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          <MicOff className="w-4 h-4" />
          Stop
        </button>
        <button
          onClick={clearTranscript}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          Clear
        </button>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 border rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            isRecording ? 'bg-red-500 animate-pulse' :
            isProcessing ? 'bg-blue-500 animate-pulse' :
            transcript ? 'bg-green-500' :
            error ? 'bg-red-500' : 'bg-gray-400'
          }`} />
          <span className="font-medium">
            {isRecording ? 'Listening...' :
             isProcessing ? 'Processing...' :
             transcript ? 'Transcribed' :
             error ? 'Error' : 'Ready'}
          </span>
        </div>
        
        {transcript && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">Latest Transcript:</p>
            <p className="font-medium">"{transcript}"</p>
            <p className="text-xs text-gray-500">
              Language: {language} | Confidence: {Math.round(confidence * 100)}%
            </p>
          </div>
        )}
        
        {error && (
          <div className="text-red-600">
            <p className="text-sm font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">Recent Test Results</h4>
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <p key={index} className="text-sm text-green-700 font-mono">
                {result}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Test Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Make sure your microphone is connected and working</li>
          <li>• Allow microphone permissions when prompted</li>
          <li>• Speak clearly in English or Hindi</li>
          <li>• Check the console for detailed logs</li>
          <li>• If Web Speech API fails, it will try Google Cloud API</li>
        </ul>
      </div>
    </div>
  );
};

export default SpeechDebugTest;