import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showDetails?: boolean;
}

interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  showDetails = true 
}) => {
  const checkStrength = (password: string): PasswordStrength => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const strength = checkStrength(password);
  const strengthCount = Object.values(strength).filter(Boolean).length;
  
  const getStrengthLevel = () => {
    if (strengthCount <= 1) return { level: 'Very Weak', color: 'red', width: '20%' };
    if (strengthCount === 2) return { level: 'Weak', color: 'orange', width: '40%' };
    if (strengthCount === 3) return { level: 'Fair', color: 'yellow', width: '60%' };
    if (strengthCount === 4) return { level: 'Good', color: 'blue', width: '80%' };
    return { level: 'Strong', color: 'green', width: '100%' };
  };

  const strengthInfo = getStrengthLevel();

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-semibold ${
            strengthInfo.color === 'red' ? 'text-red-600' :
            strengthInfo.color === 'orange' ? 'text-orange-600' :
            strengthInfo.color === 'yellow' ? 'text-yellow-600' :
            strengthInfo.color === 'blue' ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {strengthInfo.level}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthInfo.color === 'red' ? 'bg-red-500' :
              strengthInfo.color === 'orange' ? 'bg-orange-500' :
              strengthInfo.color === 'yellow' ? 'bg-yellow-500' :
              strengthInfo.color === 'blue' ? 'bg-blue-500' :
              'bg-green-500'
            }`}
            style={{ width: strengthInfo.width }}
          />
        </div>
      </div>

      {/* Detailed Requirements */}
      {showDetails && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center space-x-2">
              {strength.length ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={strength.length ? 'text-green-700' : 'text-gray-500'}>
                कम से कम 8 अक्षर / At least 8 characters
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {strength.uppercase ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={strength.uppercase ? 'text-green-700' : 'text-gray-500'}>
                बड़े अक्षर / Uppercase letter (A-Z)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {strength.lowercase ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={strength.lowercase ? 'text-green-700' : 'text-gray-500'}>
                छोटे अक्षर / Lowercase letter (a-z)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {strength.number ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={strength.number ? 'text-green-700' : 'text-gray-500'}>
                संख्या / Number (0-9)
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {strength.special ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-gray-300" />
              )}
              <span className={strength.special ? 'text-green-700' : 'text-gray-500'}>
                विशेष चिह्न / Special character (!@#$%^&*)
              </span>
            </div>
          </div>

          {/* Security Tips */}
          {strengthCount < 4 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">सुरक्षा सुझाव / Security Tips:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Use a mix of letters, numbers, and symbols</li>
                    <li>• Avoid common words or personal information</li>
                    <li>• Make it unique for Haven</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Strong Password Confirmation */}
          {strengthCount >= 4 && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  बेहतरीन! आपका पासवर्ड मजबूत है / Excellent! Your password is strong
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};