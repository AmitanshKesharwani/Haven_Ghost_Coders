import { useState, useEffect } from 'react';
import { firebaseService, JournalEntry, MoodEntry, ChatConversation, ProgressData, AppSettings } from '../services/firebaseService';
import { createConversation as createLocalConversation, addMessage as addLocalMessage, getConversationMessages as getLocalConversationMessages, getUserConversations as getLocalUserConversations } from '../services/localChatStorage';
import { useAuth } from '../components/auth/AuthProvider';
import { toast } from 'sonner';

export const useFirebaseData = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // ==================== JOURNAL HOOKS ====================
  
  const createJournalEntry = async (entry: Omit<JournalEntry, 'entryId' | 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const entryId = await firebaseService.createJournalEntry({
        ...entry,
        userId: currentUser.uid
      });
      toast.success('Journal entry saved!');
      return entryId;
    } catch (error) {
      toast.error('Failed to save journal entry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getJournalEntries = async (limitCount?: number) => {
    if (!currentUser) return [];
    
    setLoading(true);
    try {
      return await firebaseService.getJournalEntries(currentUser.uid, limitCount);
    } catch (error) {
      toast.error('Failed to load journal entries');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateJournalEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    setLoading(true);
    try {
      await firebaseService.updateJournalEntry(entryId, updates);
      toast.success('Journal entry updated!');
    } catch (error) {
      toast.error('Failed to update journal entry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteJournalEntry = async (entryId: string) => {
    setLoading(true);
    try {
      await firebaseService.deleteJournalEntry(entryId);
      toast.success('Journal entry deleted');
    } catch (error) {
      toast.error('Failed to delete journal entry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ==================== MOOD TRACKING HOOKS ====================

  const createMoodEntry = async (entry: Omit<MoodEntry, 'entryId' | 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const entryId = await firebaseService.createMoodEntry({
        ...entry,
        userId: currentUser.uid
      });
      toast.success('Mood logged!');
      return entryId;
    } catch (error) {
      toast.error('Failed to log mood');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMoodEntries = async (_startDate?: Date, _endDate?: Date) => {
    if (!currentUser) return [];
    
    setLoading(true);
    try {
      return await firebaseService.getMoodEntries(currentUser.uid, 50);
    } catch (error) {
      toast.error('Failed to load mood entries');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getLatestMoodEntry = async () => {
    if (!currentUser) return null;
    
    try {
      return await firebaseService.getLatestMoodEntry(currentUser.uid);
    } catch (error) {
      console.error('Failed to get latest mood entry:', error);
      return null;
    }
  };

  // ==================== CHAT HOOKS ====================

  const createConversation = async (conversation: Omit<ChatConversation, 'conversationId' | 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      const conversationId = await createLocalConversation(
        currentUser.uid,
        conversation.sessionType,
        conversation.aiPersonality
      );
      return conversationId;
    } catch (error) {
      toast.error('Failed to create conversation');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (message: Omit<import('../services/firebaseService').ChatMessage, 'messageId'>) => {
    setLoading(true);
    try {
      const messageId = await addLocalMessage(
        message.conversationId,
        message.sender,
        message.content,
        message.messageType,
        message.metadata
      );
      return messageId;
    } catch (error) {
      toast.error('Failed to send message');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getConversationMessages = async (conversationId: string, limitCount?: number) => {
    try {
      const messages = await getLocalConversationMessages(conversationId);
      return typeof limitCount === 'number' ? messages.slice(0, limitCount) : messages;
    } catch (error) {
      toast.error('Failed to load messages');
      throw error;
    }
  };

  const getUserConversations = async () => {
    if (!currentUser) return [];
    
    try {
      return await getLocalUserConversations(currentUser.uid);
    } catch (error) {
      toast.error('Failed to load conversations');
      throw error;
    }
  };

  // ==================== PROGRESS TRACKING HOOKS ====================

  const saveProgressData = async (progress: Omit<ProgressData, 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await firebaseService.saveProgressData({
        ...progress,
        userId: currentUser.uid
      });
      toast.success('Progress saved!');
    } catch (error) {
      toast.error('Failed to save progress');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProgressData = async (_startDate?: Date, _endDate?: Date) => {
    if (!currentUser) return [];
    
    try {
      return await firebaseService.getProgressData(currentUser.uid, 50);
    } catch (error) {
      toast.error('Failed to load progress data');
      throw error;
    }
  };

  // ==================== SETTINGS HOOKS ====================

  const saveAppSettings = async (settings: Omit<AppSettings, 'userId'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await firebaseService.saveAppSettings({
        ...settings,
        userId: currentUser.uid
      });
      toast.success('Settings saved!');
    } catch (error) {
      toast.error('Failed to save settings');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAppSettings = async () => {
    if (!currentUser) return null;
    
    try {
      return await firebaseService.getAppSettings(currentUser.uid);
    } catch (error) {
      toast.error('Failed to load settings');
      throw error;
    }
  };

  // ==================== ANALYTICS HOOKS ====================

  const getUserAnalytics = async (days?: number) => {
    if (!currentUser) return null;
    
    setLoading(true);
    try {
      return await firebaseService.getUserAnalytics(currentUser.uid, days);
    } catch (error) {
      toast.error('Failed to load analytics');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // Journal
    createJournalEntry,
    getJournalEntries,
    updateJournalEntry,
    deleteJournalEntry,
    // Mood
    createMoodEntry,
    getMoodEntries,
    getLatestMoodEntry,
    // Chat
    createConversation,
    addMessage,
    getConversationMessages,
    getUserConversations,
    // Progress
    saveProgressData,
    getProgressData,
    // Settings
    saveAppSettings,
    getAppSettings,
    // Analytics
    getUserAnalytics
  };
};

// Hook for real-time data (using React state)
export const useRealtimeData = () => {
  const { currentUser } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const [entries, convs, settings] = await Promise.all([
          firebaseService.getJournalEntries(currentUser.uid, 20),
          getLocalUserConversations(currentUser.uid),
          firebaseService.getAppSettings(currentUser.uid)
        ]);

        setJournalEntries(entries);
        setConversations(convs);
        setAppSettings(settings);
      } catch (error) {
        console.error('Error loading realtime data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  return {
    journalEntries,
    conversations,
    appSettings,
    loading,
    refreshData: () => {
      if (currentUser) {
        setLoading(true);
        // Reload data
      }
    }
  };
};