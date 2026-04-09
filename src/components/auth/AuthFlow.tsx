import React, { useState } from 'react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthFlowProps {
  onAuthSuccess: () => void;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <>
      {isSignUp ? (
        <SignUpForm
          onSwitchToSignIn={() => setIsSignUp(false)}
          onSuccess={onAuthSuccess}
        />
      ) : (
        <SignInForm
          onSwitchToSignUp={() => setIsSignUp(true)}
          onSuccess={onAuthSuccess}
        />
      )}
    </>
  );
};