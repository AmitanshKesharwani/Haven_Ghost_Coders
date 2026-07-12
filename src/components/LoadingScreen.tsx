import React from 'react';
import { Heart, Brain, Shield, Users } from 'lucide-react';


interface LoadingScreenProps {
  message?: string;
  submessage?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Haven", 
  submessage = "Initializing AI Mental Health Companion..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <div className="text-center max-w-md mx-auto px-6">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <img src="/logo.jpeg" alt="Haven" className="w-12 h-12 animate-pulse" />
          </div>
          
          {/* Floating Icons */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
            <Brain className="w-4 h-4 text-blue-600" />
          </div>
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-bounce delay-150">
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center animate-bounce delay-300">
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">{message}</h2>
        <p className="text-gray-600 mb-8 text-lg">{submessage}</p>

        {/* Loading Animation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>AI-Powered Mental Health Support</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Crisis Detection & Intervention</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Hindi/English/Hinglish Support</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Culturally Sensitive for Indian Youth</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
};