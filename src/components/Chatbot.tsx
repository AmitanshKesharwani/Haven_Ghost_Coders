import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import type { Screen } from '../types';

interface ChatbotProps {
  navigateTo: (screen: Screen) => void;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

function Chatbot({ navigateTo }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your wellness companion. I'm here to support you on your mental health journey. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const botResponses = {
    stressed: "I understand you're feeling stressed. That's completely normal. Have you tried our breathing exercises? They can be really helpful for managing stress in the moment.",
    sad: "I'm sorry you're feeling sad. Your feelings are valid, and it's okay to have difficult days. Would you like to talk about what's contributing to these feelings?",
    anxious: "Anxiety can be overwhelming. Remember that you're safe right now. Try focusing on your breathing - in for 4, hold for 4, out for 6. What's making you feel anxious?",
    good: "That's wonderful to hear! I'm glad you're feeling good today. What's been contributing to your positive mood?",
    default: "Thank you for sharing that with me. I'm here to listen and support you. Can you tell me more about how you're feeling right now?"
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('stress') || message.includes('overwhelm')) {
      return botResponses.stressed;
    } else if (message.includes('sad') || message.includes('down') || message.includes('depressed')) {
      return botResponses.sad;
    } else if (message.includes('anxious') || message.includes('worry') || message.includes('panic')) {
      return botResponses.anxious;
    } else if (message.includes('good') || message.includes('great') || message.includes('happy') || message.includes('better')) {
      return botResponses.good;
    } else {
      return botResponses.default;
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="relative min-h-screen p-6 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('post-quiz-home')}
            className="mr-4 hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-medium">Wellness Bot</h1>
              <p className="text-xs text-muted-foreground">Always here to listen</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' 
                    ? 'bg-primary/20' 
                    : 'bg-secondary/50'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-3 h-3 text-primary" />
                  ) : (
                    <Bot className="w-3 h-3 text-primary" />
                  )}
                </div>
                <div>
                  <Card className={`p-3 ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-card border-primary/20'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </Card>
                  <p className={`text-xs text-muted-foreground mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-[80%]">
                <div className="w-6 h-6 bg-secondary/50 rounded-full flex items-center justify-center">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <Card className="p-3 bg-card border-primary/20">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border-primary/20 focus:border-primary/40"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick responses */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['I feel stressed', 'I feel good today', 'I need help', 'I feel anxious'].map((response) => (
            <Button
              key={response}
              variant="outline"
              size="sm"
              onClick={() => {
                setInputValue(response);
                setTimeout(handleSendMessage, 100);
              }}
              className="text-xs border-primary/30 hover:bg-primary/5"
            >
              {response}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chatbot;