import React from 'react';
import AICompanion from './AICompanion';
import type { Screen, UserData } from '../types';

interface AICompanionWithEmotionProps {
  navigateTo?: (screen: Screen) => void;
  userData?: UserData;
}

export function AICompanionWithEmotion({ navigateTo, userData }: AICompanionWithEmotionProps = {}) {
  return (
    <div className="flex h-screen relative">
      {/* AI Companion Component */}
      <AICompanion navigateTo={navigateTo} userData={userData} />
    </div>
  );
}

export default AICompanionWithEmotion;