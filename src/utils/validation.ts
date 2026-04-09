// Validation utilities for Haven

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface UserData {
  name: string;
  email: string;
  language?: string;
  culturalBackground?: string;
  communicationStyle?: string;
  concerns?: string[];
  goals?: string[];
  riskFactors?: string[];
  protectiveFactors?: string[];
}

export const validateUserData = (userData: Partial<UserData>): ValidationResult => {
  const errors: string[] = [];

  // Name validation
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (userData.name && userData.name.length > 50) {
    errors.push('Name must be less than 50 characters');
  }

  // Email validation
  if (!userData.email) {
    errors.push('Email is required');
  } else if (!isValidEmail(userData.email)) {
    errors.push('Please enter a valid email address');
  }

  // Language validation
  if (userData.language && !['hindi', 'english', 'mixed'].includes(userData.language)) {
    errors.push('Language must be hindi, english, or mixed');
  }

  // Communication style validation
  if (userData.communicationStyle && !['formal', 'casual'].includes(userData.communicationStyle)) {
    errors.push('Communication style must be formal or casual');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMessage = (message: string): ValidationResult => {
  const errors: string[] = [];

  if (!message || message.trim().length === 0) {
    errors.push('Message cannot be empty');
  }

  if (message && message.length > 1000) {
    errors.push('Message must be less than 1000 characters');
  }

  // Check for potentially harmful content
  const harmfulPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(message)) {
      errors.push('Message contains potentially harmful content');
      break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAPIKey = (apiKey: string): ValidationResult => {
  const errors: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('API key is required');
  }

  if (apiKey && apiKey.length < 20) {
    errors.push('API key appears to be too short');
  }

  if (apiKey && !apiKey.startsWith('gsk_')) {
    errors.push('API key format appears to be incorrect');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEnvironmentVariables = (): ValidationResult => {
  const errors: string[] = [];
  const requiredVars = [
    'VITE_GROQ_API_KEY'
  ];

  const optionalVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID'
  ];

  // Check required variables
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value || value.trim().length === 0) {
      errors.push(`${varName} is required`);
    }
  }

  // Check optional variables (only if Firebase is enabled)
  const firebaseEnabled = import.meta.env.VITE_ENABLE_FIREBASE === 'true';
  if (firebaseEnabled) {
    for (const varName of optionalVars) {
      const value = import.meta.env[varName];
      if (!value || value.trim().length === 0) {
        errors.push(`${varName} is required when Firebase is enabled`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
};

export const validateCrisisLevel = (text: string): { level: string; confidence: number } => {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'want to die',
    'hurt myself', 'self harm', 'cut myself', 'overdose',
    'hang myself', 'not worth living', 'better off dead',
    'आत्महत्या', 'मरना चाहता', 'जीना नहीं चाहता', 'खुद को नुकसान'
  ];

  const lowerText = text.toLowerCase();
  let score = 0;

  for (const keyword of crisisKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      score += 1;
    }
  }

  if (score >= 3) return { level: 'severe', confidence: 0.9 };
  if (score >= 2) return { level: 'high', confidence: 0.8 };
  if (score >= 1) return { level: 'moderate', confidence: 0.6 };
  return { level: 'low', confidence: 0.3 };
};

export const validateFileUpload = (file: File, maxSizeMB: number = 5): ValidationResult => {
  const errors: string[] = [];

  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be an image (JPEG, PNG, GIF, or WebP)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

