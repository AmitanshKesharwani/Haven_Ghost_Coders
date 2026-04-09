import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, TestTube, CheckCircle, XCircle, AlertCircle, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface DebugEmotionTestProps {
  navigateTo?: (screen: string) => void;
}

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const DebugEmotionTest: React.FC<DebugEmotionTestProps> = ({ navigateTo }) => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (test: string, status: 'success' | 'error', message: string, details?: any) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.details = details;
        return [...prev];
      } else {
        return [...prev, { test, status, message, details }];
      }
    });
  };

  const runDebugTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Camera Access
    try {
      console.log('🧪 Testing camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      updateResult('camera', 'success', 'Camera access granted');
    } catch (error) {
      console.error('❌ Camera test failed:', error);
      updateResult('camera', 'error', `Camera failed: ${error.message}`, error);
    }

    // Test 2: Firebase Functions Connection
    try {
      console.log('🧪 Testing Firebase Functions...');
      const functions = getFunctions();
      updateResult('firebase-init', 'success', 'Firebase Functions initialized');

      // Test 3: Vision Function Availability
      try {
        console.log('🧪 Testing Vision Function...');
        const analyzeFaceEmotion = httpsCallable(functions, 'analyzeFaceEmotion');
        
        // Create a test image (1x1 pixel base64)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        console.log('🧪 Calling analyzeFaceEmotion with test image...');
        const result = await analyzeFaceEmotion({ imageBytes: testImageBase64 });
        
        console.log('✅ Vision function response:', result);
        updateResult('vision-function', 'success', 'Vision function callable', result.data);
        
      } catch (visionError) {
        console.error('❌ Vision function test failed:', visionError);
        updateResult('vision-function', 'error', `Vision function failed: ${visionError.message}`, visionError);
      }

    } catch (firebaseError) {
      console.error('❌ Firebase test failed:', firebaseError);
      updateResult('firebase-init', 'error', `Firebase failed: ${firebaseError.message}`, firebaseError);
    }

    // Test 4: Environment Variables
    const envTests = [
      { key: 'VITE_FIREBASE_PROJECT_ID', value: import.meta.env.VITE_FIREBASE_PROJECT_ID },
      { key: 'VITE_FIREBASE_API_KEY', value: import.meta.env.VITE_FIREBASE_API_KEY },
      { key: 'VITE_GOOGLE_CLOUD_VISION_API_KEY', value: import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY }
    ];

    envTests.forEach(({ key, value }) => {
      if (value) {
        updateResult(`env-${key}`, 'success', `${key} is set`);
      } else {
        updateResult(`env-${key}`, 'error', `${key} is missing`);
      }
    });

    setIsRunning(false);
    toast.success('Debug tests completed');
  };

  const testRealImage = async () => {
    try {
      console.log('📸 Testing with real camera image...');
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;

      // Wait for video to load
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const imageBase64 = imageDataUrl.split(',')[1];

      console.log('📸 Captured image:', { 
        width: canvas.width, 
        height: canvas.height, 
        base64Length: imageBase64.length 
      });

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Call Firebase Function
      const functions = getFunctions();
      const analyzeFaceEmotion = httpsCallable(functions, 'analyzeFaceEmotion');
      
      console.log('🧠 Analyzing real image...');
      const result = await analyzeFaceEmotion({ imageBytes: imageBase64 });
      
      console.log('✅ Real image analysis result:', result.data);
      updateResult('real-image-test', 'success', 'Real image analysis successful', result.data);
      
      toast.success('Real image test completed successfully!');

    } catch (error) {
      console.error('❌ Real image test failed:', error);
      updateResult('real-image-test', 'error', `Real image test failed: ${error.message}`, error);
      toast.error(`Real image test failed: ${error.message}`);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50/30 to-purple-50/20">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {navigateTo && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateTo('dashboard')}
              className="rounded-xl hover:bg-white/50"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Debug Emotion Detection
            </h1>
            <p className="text-gray-600 mt-1">Detailed debugging and testing for emotion detection issues</p>
          </div>
        </div>

        {/* Test Controls */}
        <div className="flex gap-3">
          <Button
            onClick={runDebugTests}
            disabled={isRunning}
            className="rounded-xl"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isRunning ? 'Running Tests...' : 'Run Debug Tests'}
          </Button>

          <Button
            onClick={testRealImage}
            variant="outline"
            className="rounded-xl"
          >
            <Camera className="w-4 h-4 mr-2" />
            Test Real Image
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.test}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                      </div>
                    </div>
                  </div>
                  
                  {result.details && (
                    <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                      <p className="text-xs font-medium text-gray-700 mb-1">Details:</p>
                      <pre className="text-xs text-gray-600 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3">Debug Instructions</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>1. Run Debug Tests:</strong> Check system compatibility and Firebase connection</p>
            <p><strong>2. Test Real Image:</strong> Capture and analyze an actual camera frame</p>
            <p><strong>3. Check Console:</strong> Open browser console (F12) for detailed logs</p>
            <p><strong>4. Verify Results:</strong> Look for specific error messages in the test results</p>
          </div>
        </Card>

        {/* Common Issues */}
        <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-3">Common Issues & Solutions</h3>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>Camera Access Denied:</strong> Check browser permissions and use HTTPS</p>
            <p><strong>Firebase Function Error:</strong> Ensure functions are deployed and API keys are correct</p>
            <p><strong>Vision API Error:</strong> Check Google Cloud Vision API is enabled and has quota</p>
            <p><strong>Authentication Error:</strong> Make sure user is logged in to Firebase</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DebugEmotionTest;