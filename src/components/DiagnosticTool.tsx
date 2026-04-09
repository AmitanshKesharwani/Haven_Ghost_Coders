import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { firebaseService } from '../services/firebaseService';
import { CheckCircle, XCircle, AlertCircle, Database, User, Settings } from 'lucide-react';

interface DiagnosticResult {
  category: string;
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export function DiagnosticTool() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Authentication
    addResult({
      category: 'Authentication',
      test: 'User Login Status',
      status: currentUser ? 'success' : 'error',
      message: currentUser ? `Logged in as ${currentUser.email}` : 'No user logged in'
    });

    if (!currentUser) {
      setIsRunning(false);
      return;
    }

    // Test 2: User Profile
    try {
      const profile = await firebaseService.getUserProfile(currentUser.uid);
      addResult({
        category: 'Database',
        test: 'User Profile Retrieval',
        status: profile ? 'success' : 'warning',
        message: profile ? 'Profile loaded successfully' : 'No profile found',
        details: profile ? { onboardingComplete: profile.onboardingComplete } : null
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'User Profile Retrieval',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 3: Journal Entries
    try {
      const entries = await firebaseService.getJournalEntries(currentUser.uid, 5);
      addResult({
        category: 'Database',
        test: 'Journal Entries',
        status: 'success',
        message: `Found ${entries.length} journal entries`,
        details: { count: entries.length }
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'Journal Entries',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 4: Mood Entries
    try {
      const moods = await firebaseService.getMoodEntries(currentUser!.uid, 5);
      addResult({
        category: 'Database',
        test: 'Mood Entries',
        status: 'success',
        message: `Found ${moods.length} mood entries`,
        details: { count: moods.length }
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'Mood Entries',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 5: Chat Conversations
    try {
      const conversations = await firebaseService.getChatConversations(currentUser!.uid, 5);
      addResult({
        category: 'Database',
        test: 'Chat Conversations',
        status: 'success',
        message: `Found ${conversations.length} conversations`,
        details: { count: conversations.length }
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'Chat Conversations',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 6: Progress Data
    try {
      const progress = await firebaseService.getProgressData(currentUser!.uid, 5);
      addResult({
        category: 'Database',
        test: 'Progress Data',
        status: 'success',
        message: `Found ${progress.length} progress entries`,
        details: { count: progress.length }
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'Progress Data',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 7: App Settings
    try {
      const settings = await firebaseService.getAppSettings(currentUser.uid);
      addResult({
        category: 'Database',
        test: 'App Settings',
        status: settings ? 'success' : 'warning',
        message: settings ? 'Settings loaded' : 'No settings found',
        details: settings ? { theme: settings.theme } : null
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'App Settings',
        status: 'error',
        message: `Error: ${error}`
      });
    }

    // Test 8: Create Test Data
    try {
      const testJournal = await firebaseService.createJournalEntry({
        userId: currentUser.uid,
        title: 'Diagnostic Test Entry',
        content: 'This is a test entry created by the diagnostic tool.',
        mood: 'neutral',
        emotions: ['calm'],
        tags: ['test', 'diagnostic'],
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      addResult({
        category: 'Database',
        test: 'Create Test Data',
        status: 'success',
        message: 'Successfully created test journal entry',
        details: { entryId: testJournal }
      });
    } catch (error) {
      addResult({
        category: 'Database',
        test: 'Create Test Data',
        status: 'error',
        message: `Error creating test data: ${error}`
      });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <User className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'Settings':
        return <Settings className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const summary = {
    total: results.length,
    success: results.filter(r => r.status === 'success').length,
    error: results.filter(r => r.status === 'error').length,
    warning: results.filter(r => r.status === 'warning').length
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">System Diagnostic Tool</h1>
        
        <div className="mb-6">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
          >
            {isRunning ? 'Running Diagnostics...' : 'Run Full Diagnostic'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{summary.total}</div>
                <div>Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.success}</div>
                <div>Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.error}</div>
                <div>Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
                <div>Warnings</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(result.category)}
                  <span className="font-medium">{result.category}</span>
                  <span className="text-gray-500">•</span>
                  <span>{result.test}</span>
                </div>
                {getStatusIcon(result.status)}
              </div>
              
              <p className="text-gray-700 mb-2">{result.message}</p>
              
              {result.details && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>

        {results.length === 0 && !isRunning && (
          <div className="text-center py-8 text-gray-500">
            Click "Run Full Diagnostic" to test your system
          </div>
        )}
      </div>
    </div>
  );
}