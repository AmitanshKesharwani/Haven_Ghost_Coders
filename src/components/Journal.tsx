import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Save, BookOpen, Clock, Loader2, Edit, Trash2, X, Sparkles, BrainCircuit, Heart, Smile, Meh, Frown, Zap, Lightbulb } from 'lucide-react';
import { useAuth } from './auth/AuthProvider';
import { firebaseService, JournalEntry } from '../services/firebaseService';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import type { Screen } from '../types';

interface JournalProps {
  navigateTo?: (screen: Screen) => void;
}

export function Journal({ navigateTo }: JournalProps = {}) {
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const [currentEntry, setCurrentEntry] = useState('');
  const [mood, setMood] = useState('');
  const [savedEntries, setSavedEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null); // *** NEW ***

  // Component state tracking for development
  // console.log('Journal render:', { editingEntry: !!editingEntry, hasContent: !!currentEntry, mood });

  const moodOptions = ['very_happy', 'happy', 'neutral', 'sad', 'very_sad'];
  const moodLabels = {
    'very_happy': 'Amazing',
    'happy': 'Good',
    'neutral': 'Okay',
    'sad': 'Stressed',
    'very_sad': 'Sad'
  };

  const moodIcons = {
    'very_happy': '😊',
    'happy': '🙂',
    'neutral': '😐',
    'sad': '😔',
    'very_sad': '😢'
  };

  const moodColors = {
    'very_happy': 'from-green-400 to-emerald-500',
    'happy': 'from-blue-400 to-cyan-500',
    'neutral': 'from-gray-400 to-slate-500',
    'sad': 'from-orange-400 to-amber-500',
    'very_sad': 'from-red-400 to-rose-500'
  };

  // Load journal entries on component mount
  useEffect(() => {
    loadJournalEntries();
  }, [currentUser]);



  const loadJournalEntries = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const entries = await firebaseService.getJournalEntries(currentUser.uid, 10);
      setSavedEntries(entries);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      toast.error('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const clearDemoEntries = async () => {
    if (!currentUser) return;

    if (!window.confirm('Are you sure you want to clear all demo entries?')) {
      return;
    }

    try {
      const allEntries = await firebaseService.getJournalEntries(currentUser.uid, 50);
      const demoEntries = allEntries.filter(entry =>
        entry.title.includes('My First Day with Haven') ||
        entry.title.includes('Dealing with Work Stress') ||
        entry.title.includes('Feeling Better Today')
      );

      for (const demoEntry of demoEntries) {
        await firebaseService.deleteJournalEntry(demoEntry.entryId);
      }

      if (demoEntries.length > 0) {
        toast.success(`Removed ${demoEntries.length} demo entries`);
        await loadJournalEntries(); // Refresh the list
      } else {
        toast.info('No demo entries found');
      }
    } catch (error) {
      console.error('Error clearing demo entries:', error);
      toast.error('Failed to clear demo entries. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!currentUser || !currentEntry.trim() || !mood) {
      return;
    }

    setSaving(true);
    try {
      let entryId: string; // To store the ID for logging

      if (editingEntry) {
        // Update existing entry
        const updates: Partial<JournalEntry> = {
          content: currentEntry.trim(),
          mood: mood as 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad',
          emotions: [mood]
        };
        await firebaseService.updateJournalEntry(editingEntry.entryId, updates);
        entryId = editingEntry.entryId; // Get existing ID
        toast.success('Journal entry updated!');
      } else {
        // Create new entry
        const newEntry: Omit<JournalEntry, 'entryId'> = {
          userId: currentUser.uid,
          title: `Journal Entry - ${new Date().toLocaleDateString()}`,
          content: currentEntry.trim(),
          mood: mood as 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad',
          emotions: [mood],
          tags: [],
          isPrivate: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        // createJournalEntry should return the new entry's ID
        entryId = await firebaseService.createJournalEntry(newEntry);
        toast.success('Journal entry saved successfully!');
      }

      // --- NEW: Log this activity ---
      await firebaseService.logUserActivity(
        currentUser.uid,
        'wrote_journal_entry',
        { mood: mood, entryId: entryId }
      );
      // --- END NEW ---

      // Clear form and reload entries
      setCurrentEntry('');
      setMood('');
      setEditingEntry(null);
      await loadJournalEntries();

    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast.error('Failed to save journal entry');
    } finally {
      setSaving(false);
    }
  };
  // ... after handleSave

  const handleEditClick = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setCurrentEntry(entry.content);
    setMood(entry.mood);

    // Scroll to the top to the editor
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setCurrentEntry('');
    setMood('');
  };

  const handleDelete = async (entryId: string) => {
    // Show a confirmation dialog
    if (!window.confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    try {
      await firebaseService.deleteJournalEntry(entryId);
      toast.success('Entry deleted successfully');
      await loadJournalEntries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry. Please try again.');
    }
  };



  // ...
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`relative min-h-screen p-4 md:p-6 ${
      currentTheme === 'whatsapp' 
        ? 'whatsapp-main-bg' 
        : ''
    }`}>
      <div className={`max-w-lg mx-auto ${
        currentTheme === 'forest' 
          ? 'bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20' 
          : currentTheme === 'whatsapp'
            ? 'bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg'
            : ''
      }`}>
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo?.('home')}
              className={`mr-3 md:mr-4 ${
                currentTheme === 'ocean' 
                  ? 'text-white/90 hover:bg-white/10' 
                  : currentTheme === 'forest'
                    ? 'text-gray-700 hover:bg-gray-100'
                    : currentTheme === 'whatsapp'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'hover:bg-primary/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                currentTheme === 'ocean' 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : currentTheme === 'forest'
                    ? 'bg-green-100'
                    : currentTheme === 'whatsapp'
                      ? 'bg-[#00A884]/10'
                      : 'bg-primary/10'
              }`}>
                <BookOpen className={`w-5 h-5 ${
                  currentTheme === 'ocean' 
                    ? 'text-white' 
                    : currentTheme === 'forest'
                      ? 'text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-[#00A884]'
                        : 'text-primary'
                }`} />
              </div>
              <h1 className={`text-lg md:text-xl font-semibold ${
                currentTheme === 'ocean' 
                  ? 'text-white' 
                  : currentTheme === 'forest'
                    ? 'text-gray-900'
                    : currentTheme === 'whatsapp'
                      ? 'text-gray-900'
                      : 'text-gray-900'
              }`}>Journal & Vent</h1>
            </div>
          </div>

          {/* Clear Demo Entries Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={clearDemoEntries}
            className={`text-xs md:text-sm ${
              currentTheme === 'ocean' 
                ? 'text-red-300 border-red-300/50 hover:bg-red-500/20' 
                : currentTheme === 'forest'
                  ? 'text-red-600 border-red-200 hover:bg-red-50'
                  : currentTheme === 'whatsapp'
                    ? 'text-red-600 border-red-200 hover:bg-red-50'
                    : 'text-red-600 border-red-200 hover:bg-red-50'
            }`}
          >
            Clear Demo
          </Button>
        </div>

        {/* Enhanced New Entry Card */}
        <Card className={`p-6 md:p-8 mb-6 md:mb-8 ${
          currentTheme === 'ocean' 
            ? 'bg-white/20 backdrop-blur-md border-white/30' 
            : currentTheme === 'forest'
              ? 'bg-white shadow-lg border-gray-200'
              : currentTheme === 'whatsapp'
                ? 'bg-white shadow-lg border-gray-200'
                : 'bg-card'
        } ${editingEntry ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''} transition-all duration-200`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
            <div className="flex items-center flex-wrap gap-3">
              <div className={`p-2 rounded-xl ${
                editingEntry 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : currentTheme === 'ocean' 
                    ? 'bg-white/20 text-white' 
                    : currentTheme === 'forest'
                      ? 'bg-green-100 text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'bg-[#00A884]/10 text-[#00A884]'
                        : 'bg-primary/10 text-primary'
              }`}>
                {editingEntry ? <Edit className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h2 className={`text-lg md:text-xl font-semibold ${
                  currentTheme === 'ocean' 
                    ? 'text-white' 
                    : currentTheme === 'forest'
                      ? 'text-gray-900'
                      : currentTheme === 'whatsapp'
                        ? 'text-gray-900'
                        : 'text-gray-900'
                }`}>
                  {editingEntry ? 'Edit Your Entry' : 'New Journal Entry'}
                </h2>
                <p className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/70' 
                    : currentTheme === 'forest'
                      ? 'text-gray-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-gray-600'
                        : 'text-gray-600'
                }`}>
                  {editingEntry ? 'Make changes to your journal entry' : 'Express your thoughts and feelings'}
                </p>
              </div>
              {editingEntry && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  Editing Mode
                </span>
              )}
            </div>
            {editingEntry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className={`${
                  currentTheme === 'ocean' 
                    ? 'text-white/70 hover:bg-white/10' 
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
          </div>

          {/* Enhanced Mood Selection */}
          <div className="mb-6">
            <p className={`text-sm font-medium mb-4 ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-gray-900'
                  : currentTheme === 'whatsapp'
                    ? 'text-gray-900'
                    : 'text-gray-900'
            }`}>How are you feeling?</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {moodOptions.map((moodOption) => (
                <Button
                  key={moodOption}
                  variant={mood === moodOption ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMood(moodOption)}
                  className={`relative overflow-hidden transition-all duration-200 ${
                    mood === moodOption 
                      ? `bg-gradient-to-r ${moodColors[moodOption as keyof typeof moodColors]} text-white shadow-lg transform scale-105` 
                      : currentTheme === 'ocean' 
                        ? 'border-white/30 text-white/80 hover:bg-white/10 hover:border-white/50' 
                        : currentTheme === 'forest'
                          ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                          : currentTheme === 'whatsapp'
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                            : 'border-primary/20 hover:border-primary/40'
                  } flex flex-col items-center gap-2 py-4 px-2 min-h-[80px]`}
                >
                  <span className="text-2xl">{moodIcons[moodOption as keyof typeof moodIcons]}</span>
                  <span className="text-sm font-medium">{moodLabels[moodOption as keyof typeof moodLabels]}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Text Area */}
          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-gray-900'
                  : currentTheme === 'whatsapp'
                    ? 'text-gray-900'
                    : 'text-gray-900'
            }`}>What's on your mind?</p>
            <Textarea
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              placeholder="Write about your day, your feelings, or anything you want to express..."
              className={`min-h-40 resize-none transition-all duration-200 ${
                currentTheme === 'ocean' 
                  ? 'bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/20' 
                  : currentTheme === 'forest'
                    ? 'bg-white border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100'
                    : currentTheme === 'whatsapp'
                      ? 'bg-white border-gray-200 focus:border-[#00A884] focus:ring-2 focus:ring-[#00A884]/20'
                      : 'border-primary/20 focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
              }`}
            />
          </div>

          {/* Enhanced Save Button */}
          <Button
            onClick={handleSave}
            disabled={(!currentEntry.trim() && !mood) || saving || !currentUser}
            className={`w-full py-3 text-base font-medium transition-all duration-200 ${
              currentTheme === 'ocean' 
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30' 
                : currentTheme === 'forest'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : currentTheme === 'whatsapp'
                    ? 'bg-[#00A884] hover:bg-[#008069] text-white'
                    : 'bg-primary hover:bg-primary/90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </>
            )}
          </Button>
        </Card>

        {/* Enhanced Recent Entries */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              currentTheme === 'ocean' 
                ? 'bg-white/20 backdrop-blur-sm' 
                : currentTheme === 'forest'
                  ? 'bg-green-100'
                  : currentTheme === 'whatsapp'
                    ? 'bg-[#00A884]/10'
                    : 'bg-primary/10'
            }`}>
              <Clock className={`w-5 h-5 ${
                currentTheme === 'ocean' 
                  ? 'text-white' 
                  : currentTheme === 'forest'
                    ? 'text-green-600'
                    : currentTheme === 'whatsapp'
                      ? 'text-[#00A884]'
                      : 'text-primary'
              }`} />
            </div>
            <h2 className={`text-lg font-semibold ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-gray-900'
                  : currentTheme === 'whatsapp'
                    ? 'text-gray-900'
                    : 'text-gray-900'
            }`}>Recent Entries</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading entries...</span>
            </div>
          ) : savedEntries.length > 0 ? (
            savedEntries.map((entry) => (
              <Card key={entry.entryId} className={`p-6 overflow-hidden transition-all duration-200 hover:shadow-lg ${
                currentTheme === 'ocean' 
                  ? 'bg-white/20 backdrop-blur-md border-white/30' 
                  : currentTheme === 'forest'
                    ? 'bg-white shadow-md border-gray-200'
                    : currentTheme === 'whatsapp'
                      ? 'bg-white shadow-md border-gray-200'
                      : 'bg-card border-primary/20'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      currentTheme === 'ocean' 
                        ? 'bg-white/20' 
                        : currentTheme === 'forest'
                          ? 'bg-gray-100'
                          : currentTheme === 'whatsapp'
                            ? 'bg-gray-100'
                            : 'bg-gray-100'
                    }`}>
                      <Clock className={`w-4 h-4 ${
                        currentTheme === 'ocean' 
                          ? 'text-white/70' 
                          : 'text-gray-500'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium ${
                      currentTheme === 'ocean' 
                        ? 'text-white/80' 
                        : currentTheme === 'forest'
                          ? 'text-gray-600'
                          : currentTheme === 'whatsapp'
                            ? 'text-gray-600'
                            : 'text-gray-600'
                    }`}>
                      {formatDate(entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt))}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    `bg-gradient-to-r ${moodColors[entry.mood as keyof typeof moodColors]}`
                  }`}>
                    <span className="text-sm">{moodIcons[entry.mood as keyof typeof moodIcons]}</span>
                    <span className="text-xs font-medium text-white">
                      {moodLabels[entry.mood as keyof typeof moodLabels]}
                    </span>
                  </div>
                </div>
                <h3 className={`font-semibold text-base mb-3 ${
                  currentTheme === 'ocean' 
                    ? 'text-white' 
                    : currentTheme === 'forest'
                      ? 'text-gray-900'
                      : currentTheme === 'whatsapp'
                        ? 'text-gray-900'
                        : 'text-gray-900'
                }`}>{entry.title}</h3>
                <p className={`text-sm leading-relaxed whitespace-pre-wrap mb-6 ${
                  currentTheme === 'ocean' 
                    ? 'text-white/90' 
                    : currentTheme === 'forest'
                      ? 'text-gray-700'
                      : currentTheme === 'whatsapp'
                        ? 'text-gray-700'
                        : 'text-gray-700'
                }`}>
                  {entry.content}
                </p>

                {/* AI Insights Section */}
                {entry.aiInsights ? (
                  <div className="mt-4 p-3 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-primary/20 rounded-lg -mx-4 mx-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">AI Insights</h4>
                      </div>

                    </div>
                    <div className="space-y-2 text-xs text-primary/90">
                      {/* Enhanced safety check for potentially dangerous misanalysis */}
                      {(() => {
                        const content = entry.content.toLowerCase();
                        const criticalPhrases = [
                          'feel like dying', 'want to die', 'kill myself', 'end it all',
                          'suicide', 'suicidal', 'hurt myself', 'harm myself', 'no point in living'
                        ];
                        const hasCriticalContent = criticalPhrases.some(phrase => content.includes(phrase));
                        const hasPositiveSentiment = entry.aiInsights.sentimentScore && entry.aiInsights.sentimentScore > 0;
                        const hasNoRiskFlags = !entry.aiInsights.riskFlags || entry.aiInsights.riskFlags.length === 0;
                        const hasWrongSummary = entry.aiInsights.summary && (
                          entry.aiInsights.summary.toLowerCase().includes('playful') ||
                          entry.aiInsights.summary.toLowerCase().includes('greeting') ||
                          entry.aiInsights.summary.toLowerCase().includes('positive')
                        );

                        const isDangerous = hasCriticalContent && (hasPositiveSentiment || hasNoRiskFlags || hasWrongSummary);

                        return isDangerous ? (
                          <div className="bg-red-100 border-2 border-red-300 p-3 rounded-lg mb-3">
                            <div className="flex items-center gap-2 text-red-800">
                              <span className="text-lg">🚨</span>
                              <div>
                                <div className="font-bold text-sm">CRITICAL: Analysis Review Required</div>
                                <div className="text-xs">This entry contains concerning content that may need professional attention.</div>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {entry.aiInsights.sentimentScore !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Sentiment:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${entry.aiInsights.sentimentScore > 0.2 ? 'bg-green-100 text-green-700' :
                            entry.aiInsights.sentimentScore < -0.2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {entry.aiInsights.sentimentScore > 0.2 ? 'Positive' :
                              entry.aiInsights.sentimentScore < -0.2 ? 'Negative' : 'Neutral'}
                          </span>
                        </div>
                      )}
                      {entry.aiInsights.keyThemes && entry.aiInsights.keyThemes.length > 0 && (
                        <div>
                          <span className="text-gray-600">Key Themes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.aiInsights.keyThemes.map((theme, index) => (
                              <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {entry.aiInsights.summary && (
                        <p className="italic text-gray-700 bg-white/50 p-2 rounded">
                          "{entry.aiInsights.summary}"
                        </p>
                      )}
                      {entry.aiInsights.riskFlags && entry.aiInsights.riskFlags.length > 0 && (
                        <div className="bg-red-50 border border-red-200 p-2 rounded">
                          <span className="text-red-700 font-medium text-xs">⚠️ Risk Flags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entry.aiInsights.riskFlags.map((flag, index) => (
                              <span key={index} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                                {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 border-t border-gray-100 -mx-4 mx-0 text-center">
                    <p className="text-xs text-gray-400 italic flex items-center justify-center gap-1">
                      <BrainCircuit className="w-3 h-3 animate-pulse" />
                      AI analysis will appear automatically...
                    </p>
                  </div>
                )}

                {/* Enhanced Edit/Delete Buttons */}
                <div className={`flex items-center justify-end space-x-3 mt-6 pt-4 ${
                  currentTheme === 'ocean' 
                    ? 'border-t border-white/20' 
                    : 'border-t border-gray-100'
                }`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(entry)}
                    className={`transition-all duration-200 ${
                      currentTheme === 'ocean' 
                        ? 'border-white/30 text-white/80 hover:bg-white/10 hover:text-white' 
                        : currentTheme === 'forest'
                          ? 'border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300'
                          : currentTheme === 'whatsapp'
                            ? 'border-[#00A884]/30 text-[#00A884] hover:bg-[#00A884]/10'
                            : 'border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <Edit className="w-4 h-4 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entry.entryId)}
                    className={`transition-all duration-200 ${
                      currentTheme === 'ocean' 
                        ? 'border-red-300/50 text-red-300 hover:bg-red-500/20' 
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>

              </Card>
            ))
          ) : (
            <Card className={`p-8 text-center ${
              currentTheme === 'ocean' 
                ? 'bg-white/20 backdrop-blur-md border-white/30' 
                : currentTheme === 'forest'
                  ? 'bg-white shadow-md border-gray-200'
                  : currentTheme === 'whatsapp'
                    ? 'bg-white shadow-md border-gray-200'
                    : 'bg-card border-primary/20'
            }`}>
              <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                currentTheme === 'ocean' 
                  ? 'bg-white/20' 
                  : currentTheme === 'forest'
                    ? 'bg-green-100'
                    : currentTheme === 'whatsapp'
                      ? 'bg-[#00A884]/10'
                      : 'bg-primary/10'
              }`}>
                <BookOpen className={`w-8 h-8 ${
                  currentTheme === 'ocean' 
                    ? 'text-white/70' 
                    : currentTheme === 'forest'
                      ? 'text-green-600'
                      : currentTheme === 'whatsapp'
                        ? 'text-[#00A884]'
                        : 'text-primary'
                }`} />
              </div>
              <p className={`font-medium mb-2 ${
                currentTheme === 'ocean' 
                  ? 'text-white' 
                  : currentTheme === 'forest'
                    ? 'text-gray-900'
                    : currentTheme === 'whatsapp'
                      ? 'text-gray-900'
                      : 'text-gray-900'
              }`}>No journal entries yet.</p>
              <p className={`text-sm ${
                currentTheme === 'ocean' 
                  ? 'text-white/70' 
                  : currentTheme === 'forest'
                    ? 'text-gray-600'
                    : currentTheme === 'whatsapp'
                      ? 'text-gray-600'
                      : 'text-gray-600'
              }`}>Start writing your first entry above!</p>
            </Card>
          )}
        </div>

        {/* Enhanced Tips Section */}
        <Card className={`p-6 mt-8 ${
          currentTheme === 'ocean' 
            ? 'bg-white/20 backdrop-blur-md border-white/30' 
            : currentTheme === 'forest'
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
              : currentTheme === 'whatsapp'
                ? 'bg-gradient-to-br from-[#00A884]/5 to-[#25D366]/5 border-[#00A884]/20'
                : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${
              currentTheme === 'ocean' 
                ? 'bg-white/20' 
                : currentTheme === 'forest'
                  ? 'bg-green-100'
                  : currentTheme === 'whatsapp'
                    ? 'bg-[#00A884]/10'
                    : 'bg-blue-100'
            }`}>
              <Lightbulb className={`w-5 h-5 ${
                currentTheme === 'ocean' 
                  ? 'text-white' 
                  : currentTheme === 'forest'
                    ? 'text-green-600'
                    : currentTheme === 'whatsapp'
                      ? 'text-[#00A884]'
                      : 'text-blue-600'
              }`} />
            </div>
            <h3 className={`font-semibold text-lg ${
              currentTheme === 'ocean' 
                ? 'text-white' 
                : currentTheme === 'forest'
                  ? 'text-green-800'
                  : currentTheme === 'whatsapp'
                    ? 'text-[#00A884]'
                    : 'text-blue-800'
            }`}>Journaling Tips</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: '✍️', text: 'Write freely without worrying about grammar' },
              { icon: '💭', text: 'Focus on your emotions and experiences' },
              { icon: '🧠', text: 'Regular journaling can improve mental clarity' },
              { icon: '🌱', text: 'Be honest with yourself - this is your safe space' }
            ].map((tip, index) => (
              <div key={index} className="flex items-center space-x-3">
                <span className="text-lg">{tip.icon}</span>
                <span className={`text-sm ${
                  currentTheme === 'ocean' 
                    ? 'text-white/90' 
                    : currentTheme === 'forest'
                      ? 'text-green-700'
                      : currentTheme === 'whatsapp'
                        ? 'text-gray-700'
                        : 'text-blue-700'
                }`}>{tip.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Journal;