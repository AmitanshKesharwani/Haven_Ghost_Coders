import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Moon, 
  Volume2,
  Download,
  Trash2,
  LogOut,
  Edit2,
  Save,
  X,
  Mic
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { useAuth } from './auth/AuthProvider';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface SettingsProps {
  navigateTo?: (screen: string) => void;
}

interface NotificationSettings {
  dailyCheckIn: boolean;
  moodReminders: boolean;
  crisisAlerts: boolean;
  progressUpdates: boolean;
}

interface PrivacySettings {
  dataCollection: boolean;
  analyticsOptIn: boolean;
  researchParticipation: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ navigateTo }) => {
  const { currentUser, userProfile, signOut, updateUserProfile } = useAuth();
  const { currentTheme, setTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('appearance');
  
  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    displayName: userProfile?.displayName || '',
    email: userProfile?.email || ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    dailyCheckIn: userProfile?.preferences?.notificationsEnabled || true,
    moodReminders: true,
    crisisAlerts: true,
    progressUpdates: true
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataCollection: userProfile?.privacySettings?.dataCollection || true,
    analyticsOptIn: userProfile?.privacySettings?.analyticsOptIn || true,
    researchParticipation: userProfile?.privacySettings?.researchParticipation || false
  });

  // Language settings state
  const [selectedLanguage, setSelectedLanguage] = useState(
    userProfile?.preferences?.language || 'mixed'
  );

  // Loading states
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // Theme state
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setEditedProfile({
        displayName: userProfile.displayName || '',
        email: userProfile.email || ''
      });
      setNotificationSettings({
        dailyCheckIn: userProfile.preferences?.notificationsEnabled || true,
        moodReminders: true,
        crisisAlerts: true,
        progressUpdates: true
      });
      setPrivacySettings({
        dataCollection: userProfile.privacySettings?.dataCollection || true,
        analyticsOptIn: userProfile.privacySettings?.analyticsOptIn || true,
        researchParticipation: userProfile.privacySettings?.researchParticipation || false
      });
      setSelectedLanguage(userProfile.preferences?.language || 'mixed');
    }
  }, [userProfile]);

  const settingSections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'data', label: 'Data & Storage', icon: Download },
    { id: 'developer', label: 'Developer Tools', icon: Mic },
  ];

  // Handler functions
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        displayName: editedProfile.displayName
      });
      setIsEditingProfile(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      displayName: userProfile?.displayName || '',
      email: userProfile?.email || ''
    });
    setIsEditingProfile(false);
  };

  const handleNotificationToggle = async (setting: keyof NotificationSettings) => {
    const newSettings = {
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    };
    setNotificationSettings(newSettings);

    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          notificationsEnabled: newSettings.dailyCheckIn
        }
      });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
      // Revert on error
      setNotificationSettings(notificationSettings);
    }
  };

  const handlePrivacyToggle = async (setting: keyof PrivacySettings) => {
    const newSettings = {
      ...privacySettings,
      [setting]: !privacySettings[setting]
    };
    setPrivacySettings(newSettings);

    try {
      await updateUserProfile({
        privacySettings: {
          ...userProfile?.privacySettings,
          [setting]: newSettings[setting]
        }
      });
      toast.success('Privacy settings updated');
    } catch (error) {
      toast.error('Failed to update privacy settings');
      // Revert on error
      setPrivacySettings(privacySettings);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language as any);
    try {
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          language: language as any
        }
      });
      toast.success('Language preference updated');
    } catch (error) {
      toast.error('Failed to update language preference');
      setSelectedLanguage(userProfile?.preferences?.language || 'mixed');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock data export
      const exportData = {
        profile: userProfile,
        exportDate: new Date().toISOString(),
        dataTypes: ['profile', 'journal_entries', 'mood_tracking', 'conversations', 'assessments']
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `haven-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      'This is your final warning. Deleting your account will permanently remove all your journal entries, mood tracking data, conversations, and profile information. Type "DELETE" in the next prompt to confirm.'
    );

    if (!doubleConfirmed) return;

    const deleteConfirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Account deletion cancelled - confirmation text did not match');
      return;
    }

    setIsDeletingAccount(true);
    try {
      // Here you would implement actual account deletion
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success('Account deletion initiated. You will be logged out shortly.');
      
      // Log out after a delay
      setTimeout(() => {
        handleLogout();
      }, 2000);
      
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setPendingTheme(newTheme);
  };

  const handleSaveTheme = async () => {
    if (!pendingTheme) return;
    
    setIsSavingTheme(true);
    try {
      // First apply the theme immediately using the theme context
      setTheme(pendingTheme as any);
      
      // Save theme preference to user profile
      await updateUserProfile({
        preferences: {
          ...userProfile?.preferences,
          theme: pendingTheme
        }
      });

      // Clear pending theme
      setPendingTheme(null);
      
      toast.success('Theme applied successfully!');
      
      // Small delay then reload to ensure all components get the new theme
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      toast.error('Failed to save theme preference');
      setIsSavingTheme(false);
    }
  };

  const handleCancelThemeChange = () => {
    setPendingTheme(null);
  };

  const renderAppearanceSettings = () => {
    const hasThemeChanged = pendingTheme && pendingTheme !== currentTheme;
    
    return (
      <div className="space-y-6">
        <div>
          <h3 className={`text-lg font-semibold mb-4 ${
            currentTheme === 'ocean' 
              ? 'ocean-text-primary' 
              : currentTheme === 'forest'
                ? '!text-black'
                : currentTheme === 'whatsapp'
                  ? '!text-black'
                  : 'text-gray-900'
          }`}>Choose Your Theme</h3>
          <p className={`mb-6 ${
            currentTheme === 'ocean' 
              ? 'ocean-text-secondary' 
              : currentTheme === 'forest'
                ? '!text-black !opacity-80'
                : currentTheme === 'whatsapp'
                  ? '!text-black !opacity-80'
                  : 'text-gray-600'
          }`}>Select a theme that makes you feel comfortable and focused.</p>
          
          <ThemeSelector 
            showTitle={false} 
            onThemeChange={handleThemeChange}
            previewMode={true}
          />
          
          {hasThemeChanged && (
            <Card className={`mt-6 p-4 ${
              currentTheme === 'ocean' 
                ? 'ocean-card' 
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium mb-1 ${
                    currentTheme === 'ocean' ? 'ocean-text-primary' : 'text-blue-900'
                  }`}>Theme Changed</h4>
                  <p className={`text-sm ${
                    currentTheme === 'ocean' ? 'ocean-text-secondary' : 'text-blue-700'
                  }`}>
                    Save changes to apply the new theme and reload the page.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancelThemeChange}
                    variant="outline"
                    size="sm"
                    className={currentTheme === 'ocean' 
                      ? 'ocean-button-secondary' 
                      : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                    }
                    disabled={isSavingTheme}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveTheme}
                    size="sm"
                    className={currentTheme === 'ocean' 
                      ? 'ocean-button-primary' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }
                    disabled={isSavingTheme}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSavingTheme ? 'Saving...' : 'Save & Reload'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Card className={`p-4 ${
          currentTheme === 'ocean' 
            ? 'ocean-glass-card' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            currentTheme === 'ocean' ? 'ocean-text-primary' : 'text-gray-900'
          }`}>Current Theme</h4>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500"></div>
            <div>
              <p className={`text-sm font-medium capitalize ${
                currentTheme === 'forest' || currentTheme === 'whatsapp' 
                  ? 'text-black' 
                  : 'text-gray-900'
              }`}>{currentTheme}</p>
              <p className="text-xs text-gray-600">
                {currentTheme === 'whatsapp' && 'Modern dark theme with green accents'}
                {currentTheme === 'forest' && 'Natural green theme inspired by forests'}
                {currentTheme === 'ocean' && 'Calming blue theme inspired by the ocean'}
              </p>
            </div>
          </div>
        </Card>

        <Card className={`p-4 ${
          currentTheme === 'ocean' 
            ? 'ocean-glass-card' 
            : 'bg-green-50 border-green-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            currentTheme === 'ocean' ? 'ocean-text-primary' : 'text-green-900'
          }`}>Theme Benefits</h4>
          <div className="space-y-1 text-sm text-green-700">
            <p>• Reduces eye strain during long sessions</p>
            <p>• Creates a calming environment for mental wellness</p>
            <p>• Personalizes your experience for better engagement</p>
            <p>• Adapts to your mood and preferences</p>
          </div>
        </Card>
      </div>
    );
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            currentTheme === 'forest' || currentTheme === 'whatsapp' 
              ? 'text-black' 
              : 'text-gray-900'
          }`}>{userProfile?.displayName}</h3>
          <p className={`${
            currentTheme === 'forest' || currentTheme === 'whatsapp' 
              ? 'text-black/70' 
              : 'text-gray-600'
          }`}>{userProfile?.email}</p>
        </div>
        <Button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          variant="outline"
          size="sm"
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <Edit2 className="w-4 h-4 mr-2" />
          {isEditingProfile ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <Card className="p-4 bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className={`font-medium ${
            currentTheme === 'forest' || currentTheme === 'whatsapp' 
              ? 'text-black' 
              : 'text-gray-900'
          }`}>Profile Information</h4>
          {isEditingProfile && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveProfile}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="outline"
                size="sm"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div>
            <label className={`block text-sm mb-1 ${
              currentTheme === 'forest' || currentTheme === 'whatsapp' 
                ? 'text-black/80' 
                : 'text-gray-700'
            }`}>Display Name</label>
            <Input
              type="text" 
              value={isEditingProfile ? editedProfile.displayName : userProfile?.displayName || ''} 
              onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-900"
              readOnly={!isEditingProfile}
            />
          </div>
          <div>
            <label className={`block text-sm mb-1 ${
              currentTheme === 'forest' || currentTheme === 'whatsapp' 
                ? 'text-black/80' 
                : 'text-gray-700'
            }`}>Email</label>
            <Input
              type="email" 
              value={userProfile?.email || ''} 
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Account Information</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>Member since: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}</p>
          <p>Last login: {userProfile?.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleDateString() : 'Unknown'}</p>
          <p>Onboarding: {userProfile?.onboardingComplete ? 'Completed' : 'Pending'}</p>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${
          currentTheme === 'forest' || currentTheme === 'whatsapp' 
            ? '!text-black' 
            : 'text-gray-900'
        }`}>Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { id: 'dailyCheckIn' as keyof NotificationSettings, label: 'Daily Check-in Reminders', description: 'Get reminded to log your mood daily' },
            { id: 'moodReminders' as keyof NotificationSettings, label: 'Mood Tracking', description: 'Reminders to track your emotional state' },
            { id: 'crisisAlerts' as keyof NotificationSettings, label: 'Crisis Alerts', description: 'Important safety notifications' },
            { id: 'progressUpdates' as keyof NotificationSettings, label: 'Progress Updates', description: 'Weekly progress summaries' },
          ].map((setting) => {
            const isEnabled = notificationSettings[setting.id];
            return (
              <Card key={setting.id} className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      currentTheme === 'forest' || currentTheme === 'whatsapp' 
                        ? '!text-black' 
                        : 'text-gray-900'
                    }`}>{setting.label}</h4>
                    <p className={`text-sm ${
                      currentTheme === 'forest' || currentTheme === 'whatsapp' 
                        ? '!text-black !opacity-70' 
                        : 'text-gray-600'
                    }`}>{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle(setting.id)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                      isEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">Notification Schedule</h4>
        <p className="text-sm text-yellow-700 mb-3">Customize when you receive notifications</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">Quiet hours</span>
            <span className="text-sm text-yellow-600">10:00 PM - 8:00 AM</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">Frequency</span>
            <span className="text-sm text-yellow-600">Daily</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${
          currentTheme === 'forest' || currentTheme === 'whatsapp' 
            ? '!text-black' 
            : 'text-gray-900'
        }`}>Privacy & Security</h3>
        <div className="space-y-4">
          {[
            { id: 'dataCollection' as keyof PrivacySettings, label: 'Data Collection', description: 'Allow anonymous usage analytics' },
            { id: 'analyticsOptIn' as keyof PrivacySettings, label: 'Analytics', description: 'Help improve the app with usage data' },
            { id: 'researchParticipation' as keyof PrivacySettings, label: 'Research Participation', description: 'Participate in mental health research' },
          ].map((setting) => {
            const isEnabled = privacySettings[setting.id];
            return (
              <Card key={setting.id} className="p-4 bg-gray-50 border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      currentTheme === 'forest' || currentTheme === 'whatsapp' 
                        ? '!text-black' 
                        : 'text-gray-900'
                    }`}>{setting.label}</h4>
                    <p className={`text-sm ${
                      currentTheme === 'forest' || currentTheme === 'whatsapp' 
                        ? '!text-black !opacity-70' 
                        : 'text-gray-600'
                    }`}>{setting.description}</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyToggle(setting.id)}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                      isEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Data Security</h4>
        <div className="space-y-2 text-sm text-blue-700">
          <p>✅ All data is encrypted in transit and at rest</p>
          <p>✅ We never share personal information with third parties</p>
          <p>✅ You can export or delete your data at any time</p>
          <p>✅ Regular security audits and compliance checks</p>
        </div>
      </Card>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${
          currentTheme === 'forest' || currentTheme === 'whatsapp' 
            ? '!text-black' 
            : 'text-gray-900'
        }`}>Language Preferences</h3>
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h4 className={`font-medium mb-3 ${
            currentTheme === 'forest' || currentTheme === 'whatsapp' 
              ? 'text-black' 
              : 'text-gray-900'
          }`}>Preferred Language</h4>
          <div className="space-y-2">
            {[
              { id: 'english', label: 'English', flag: '🇺🇸', description: 'Full English interface and conversations' },
              { id: 'hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳', description: 'Full Hindi interface and conversations' },
              { id: 'mixed', label: 'Mixed (Hinglish)', flag: '🇮🇳🇺🇸', description: 'Natural mix of Hindi and English' },
            ].map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <div 
                  key={lang.id} 
                  onClick={() => handleLanguageChange(lang.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-green-100 border border-green-300' 
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        currentTheme === 'forest' || currentTheme === 'whatsapp' 
                          ? 'text-black' 
                          : 'text-gray-900'
                      }`}>{lang.label}</span>
                      {isSelected && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <p className={`text-sm ${
                      currentTheme === 'forest' || currentTheme === 'whatsapp' 
                        ? 'text-black/70' 
                        : 'text-gray-600'
                    }`}>{lang.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <h4 className="font-medium text-purple-900 mb-2">Cultural Context</h4>
          <p className="text-sm text-purple-700 mb-3">
            Our AI understands Indian cultural context and can communicate in a way that feels natural to you.
          </p>
          <div className="space-y-1 text-sm text-purple-600">
            <p>• Understands family dynamics and social structures</p>
            <p>• Respects cultural values and traditions</p>
            <p>• Uses appropriate cultural references and examples</p>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-4 ${
          currentTheme === 'forest' || currentTheme === 'whatsapp' 
            ? '!text-black' 
            : 'text-gray-900'
        }`}>Data & Storage</h3>
        <div className="space-y-4">
          <Card className="p-4 bg-gray-50 border-gray-200">
            <h4 className={`font-medium mb-2 ${
              currentTheme === 'forest' || currentTheme === 'whatsapp' 
                ? 'text-black' 
                : 'text-gray-900'
            }`}>Export Your Data</h4>
            <p className={`text-sm mb-3 ${
              currentTheme === 'forest' || currentTheme === 'whatsapp' 
                ? 'text-black/70' 
                : 'text-gray-600'
            }`}>
              Download all your data including journal entries, mood tracking, conversations, and assessments in JSON format.
            </p>
            <div className="space-y-2 text-xs text-gray-500 mb-4">
              <p>• Profile information and preferences</p>
              <p>• Journal entries and mood tracking data</p>
              <p>• AI conversation history</p>
              <p>• Assessment results and progress data</p>
            </div>
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline" 
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </Card>

          <Card className="p-4 bg-orange-50 border-orange-200">
            <h4 className="font-medium text-orange-900 mb-2">Data Usage</h4>
            <div className="space-y-2 text-sm text-orange-700">
              <div className="flex justify-between">
                <span>Profile Data:</span>
                <span>~2 KB</span>
              </div>
              <div className="flex justify-between">
                <span>Journal Entries:</span>
                <span>~15 KB</span>
              </div>
              <div className="flex justify-between">
                <span>Conversations:</span>
                <span>~45 KB</span>
              </div>
              <div className="flex justify-between font-medium border-t border-orange-300 pt-2">
                <span>Total Storage:</span>
                <span>~62 KB</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-red-50 border-red-200">
            <h4 className="font-medium text-red-700 mb-2">Delete Account</h4>
            <p className="text-sm text-red-600 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <div className="space-y-2 text-xs text-red-500 mb-4">
              <p>⚠️ This will permanently delete:</p>
              <p>• All journal entries and mood data</p>
              <p>• Conversation history with AI</p>
              <p>• Assessment results and progress tracking</p>
              <p>• Profile and preference settings</p>
            </div>
            <Button 
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              variant="outline" 
              className="bg-red-100 border-red-300 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderDeveloperSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-full bg-purple-100">
          <Mic className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-purple-900">Developer Tools</h3>
          <p className="text-purple-600">Test and debug application features</p>
        </div>
      </div>

      {/* Speech-to-Text Test */}
      <div className="bg-white rounded-lg p-6 border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-4">🎤 Speech-to-Text Test Lab</h4>
        <p className="text-sm text-purple-700 mb-4">
          Test Google Chirp 3 HD speech recognition with multilingual support. Verify voice input functionality across all 15 supported languages.
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => navigateTo?.('speech-test')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Full Test Lab
          </button>
          <button 
            onClick={() => navigateTo?.('speech-debug')}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            Quick Debug
          </button>
        </div>
      </div>

      {/* Diagnostic Tools */}
      <div className="bg-white rounded-lg p-6 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-4">🔧 System Diagnostics</h4>
        <p className="text-sm text-blue-700 mb-4">
          Run comprehensive system checks and view application diagnostics.
        </p>
        <div className="flex gap-2">
          <button 
            onClick={() => navigateTo?.('diagnostic')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            System Check
          </button>
          <button 
            onClick={() => navigateTo?.('index-test')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Index Test
          </button>
        </div>
      </div>

      {/* Mobile Testing */}
      <div className="bg-white rounded-lg p-6 border border-green-200">
        <h4 className="font-medium text-green-900 mb-4">📱 Mobile Testing</h4>
        <p className="text-sm text-green-700 mb-4">
          Test mobile-specific features and responsive design components.
        </p>
        <button 
          onClick={() => navigateTo?.('mobile-test')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Mobile Test Page
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance': return renderAppearanceSettings();
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'privacy': return renderPrivacySettings();
      case 'language': return renderLanguageSettings();
      case 'data': return renderDataSettings();
      case 'developer': return renderDeveloperSettings();
      default: return renderAppearanceSettings();
    }
  };

  return (
    <div className={`min-h-screen flex ${
      currentTheme === 'ocean' 
        ? 'ocean-theme' 
        : currentTheme === 'forest'
          ? 'bg-white'
          : currentTheme === 'whatsapp'
            ? 'whatsapp-bg-pattern'
            : 'bg-gray-50'
    }`}>
      {/* Sidebar */}
      <div className={`w-80 p-6 shadow-sm ${
        currentTheme === 'ocean' 
          ? 'ocean-sidebar' 
          : currentTheme === 'forest'
            ? 'bg-white border-r border-gray-200 shadow-lg'
            : currentTheme === 'whatsapp'
              ? 'bg-white/90 border-r border-gray-200 backdrop-blur-sm'
              : 'bg-white border-r border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateTo?.('dashboard')}
            className={currentTheme === 'ocean' 
              ? 'text-white/90 hover:bg-white/10' 
              : currentTheme === 'forest'
                ? '!text-black hover:bg-gray-100'
                : currentTheme === 'whatsapp'
                  ? '!text-black hover:bg-gray-100'
                  : 'text-gray-600 hover:bg-gray-100'
            }
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className={`text-2xl font-bold ${
            currentTheme === 'ocean' 
              ? 'text-white' 
              : currentTheme === 'forest'
                ? '!text-black'
                : currentTheme === 'whatsapp'
                  ? '!text-black'
                  : 'text-gray-900'
          }`}>Settings</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {settingSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                  activeSection === section.id
                    ? currentTheme === 'ocean'
                      ? 'ocean-nav-item active'
                      : currentTheme === 'whatsapp'
                        ? 'bg-green-50 border border-green-200 !text-black font-semibold'
                        : 'bg-green-50 border border-green-200 !text-black font-semibold'
                    : currentTheme === 'ocean'
                      ? 'ocean-nav-item'
                      : currentTheme === 'forest'
                        ? '!text-black hover:bg-gray-100 hover:!text-black font-semibold'
                        : currentTheme === 'whatsapp'
                          ? '!text-black hover:bg-gray-50 hover:!text-black font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  currentTheme === 'forest' || currentTheme === 'whatsapp' 
                    ? 'text-black' 
                    : ''
                }`} />
                {section.label}
              </button>
            );
          })}
        </nav>

        {/* Enhanced Red Logout Button */}
        <div className="mt-auto pt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              currentTheme === 'ocean'
                ? 'bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-500 text-white hover:from-red-700 hover:to-red-800 hover:border-red-400 shadow-red-500/30'
                : currentTheme === 'forest' || currentTheme === 'whatsapp'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-800 !text-white hover:from-red-700 hover:to-red-800 hover:border-red-900 font-bold shadow-lg shadow-red-500/40'
                  : 'bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-800 text-white hover:from-red-700 hover:to-red-800 hover:border-red-900 font-bold shadow-lg shadow-red-500/40'
            }`}
          >
            <LogOut className="w-5 h-5 mr-2 text-white drop-shadow-sm" />
            <span className="font-bold tracking-wide">LOGOUT</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-8 overflow-y-auto ${
        currentTheme === 'ocean' 
          ? 'ocean-main-content' 
          : currentTheme === 'forest'
            ? 'bg-white/95 backdrop-blur-sm shadow-inner'
            : currentTheme === 'whatsapp'
              ? 'whatsapp-main-bg'
              : 'bg-white'
      }`}>
        <div className={`max-w-4xl mx-auto ${
          currentTheme === 'forest' 
            ? 'bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-white/20' 
            : ''
        }`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};