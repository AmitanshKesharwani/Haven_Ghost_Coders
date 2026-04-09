import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ValidationMessageProps {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  details?: string[];
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ type, message, details }) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 border rounded-xl ${getStyles()}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium text-sm">{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 text-sm space-y-1">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start space-x-1">
                  <span className="text-xs mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Email validation
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'ईमेल आवश्यक है / Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'कृपया वैध ईमेल दर्ज करें / Please enter a valid email' };
  }
  
  return { isValid: true };
};

// Name validation
export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name || name.trim().length < 2) {
    return { isValid: false, message: 'नाम कम से कम 2 अक्षर का होना चाहिए / Name must be at least 2 characters' };
  }
  
  if (name.length > 50) {
    return { isValid: false, message: 'नाम 50 अक्षर से कम होना चाहिए / Name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password: string): { 
  isValid: boolean; 
  message?: string; 
  strength: number;
  requirements: { [key: string]: boolean };
} => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const strength = (metRequirements / 5) * 100;
  
  if (!password) {
    return { 
      isValid: false, 
      message: 'पासवर्ड आवश्यक है / Password is required',
      strength: 0,
      requirements
    };
  }
  
  if (metRequirements < 3) {
    return { 
      isValid: false, 
      message: 'पासवर्ड बहुत कमजोर है / Password is too weak',
      strength,
      requirements
    };
  }
  
  return { isValid: true, strength, requirements };
};

// Real-time validation hook
export const useFormValidation = () => {
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  
  const validateField = (field: string, value: string, confirmValue?: string) => {
    let validation;
    
    switch (field) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'name':
      case 'displayName':
        validation = validateName(value);
        break;
      case 'password':
        validation = validatePassword(value);
        break;
      case 'confirmPassword':
        if (value !== confirmValue) {
          validation = { isValid: false, message: 'पासवर्ड मेल नहीं खाते / Passwords do not match' };
        } else {
          validation = { isValid: true };
        }
        break;
      default:
        validation = { isValid: true };
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? '' : validation.message || ''
    }));
    
    return validation.isValid;
  };
  
  const clearError = (field: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };
  
  const clearAllErrors = () => {
    setErrors({});
  };
  
  return {
    errors,
    validateField,
    clearError,
    clearAllErrors,
    hasErrors: Object.values(errors).some(error => error !== '')
  };
};