import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { AuthFlow } from './components/auth/AuthFlow';
import AppRouter from './components/AppRouter';
import VantaBackground from './components/VantaBackground';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OceanThemeProvider } from './components/OceanThemeProvider';

const AppGate = () => {
  const { loading, userProfile, signOut } = useAuth();
  const { currentTheme, setTheme } = useTheme();

  // Load theme from user profile when user logs in
  React.useEffect(() => {
    if (userProfile?.preferences?.theme) {
      const savedTheme = userProfile.preferences.theme;
      if (savedTheme !== currentTheme) {
        setTheme(savedTheme as any);
      }
    }
  }, [userProfile, setTheme, currentTheme]);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh'
      }}>
        <div>Loading…</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <OceanThemeProvider>
        <AuthFlow onAuthSuccess={() => { /* AuthProvider will re-render */ }} />
      </OceanThemeProvider>
    );
  }

  return (
    <OceanThemeProvider>
      <AppRouter currentUser={userProfile} onLogout={signOut} />
    </OceanThemeProvider>
  );
};

const Root = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <VantaBackground variant="fixed" />
          <AppGate />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default Root;