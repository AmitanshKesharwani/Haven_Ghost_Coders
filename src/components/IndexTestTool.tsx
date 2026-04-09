import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { firebaseService } from '../services/firebaseService';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function IndexTestTool() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runIndexTests = async () => {
    if (!currentUser) return;
    
    setIsRunning(true);
    setResults([]);

    const tests = [
      {
        name: 'Mood Entries Query',
        test: () => firebaseService.getMoodEntries(currentUser.uid)
      },
      {
        name: 'Latest Mood Entry',
        test: () => firebaseService.getLatestMoodEntry(currentUser.uid)
      },
      {
        name: 'Progress Analytics',
        test: () => firebaseService.getUserProgressAnalytics(currentUser.uid, 'month')
      },
      {
        name: 'Chat Conversations',
        test: () => firebaseService.getChatConversations(currentUser!.uid)
      },
      {
        name: 'Progress Data',
        test: () => firebaseService.getProgressData(currentUser.uid)
      }
    ];

    for (const testCase of tests) {
      try {
        const result = await testCase.test();
        setResults(prev => [...prev, {
          name: testCase.name,
          status: 'success',
          message: `Success - returned ${Array.isArray(result) ? result.length : 'data'} items`,
          data: result
        }]);
      } catch (error: any) {
        setResults(prev => [...prev, {
          name: testCase.name,
          status: 'error',
          message: error.message,
          data: null
        }]);
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please log in to run index tests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">Firebase Index Test Tool</h1>
        
        <div className="mb-6">
          <button
            onClick={runIndexTests}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {isRunning ? 'Running Tests...' : 'Test All Queries (No Index Required)'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{result.name}</h3>
                  {getStatusIcon(result.status)}
                </div>
                
                <p className={`text-sm ${result.status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                  {result.message}
                </p>
                
                {result.status === 'error' && result.message.includes('index') && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                    ❌ This query still requires an index. The fix may not be complete.
                  </div>
                )}
                
                {result.status === 'success' && (
                  <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-700">
                    ✅ Query works without composite indexes!
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500">
            Click the button above to test all Firebase queries
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">What This Tests:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Mood entries retrieval (previously required index)</li>
            <li>• Latest mood entry query (previously required index)</li>
            <li>• Progress analytics with date filtering (previously required index)</li>
            <li>• Chat conversations sorting (previously required index)</li>
            <li>• Progress data with date ranges (previously required index)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}