// Multi-Language Support System
// Implements dynamic language switching for Hindi, English, and mixed conversations
// Creates culturally-appropriate therapeutic terminology in multiple languages
// Builds language-specific emotional expression recognition

import type { CulturalContext, UserContext } from './aiOrchestrator';

// Core interfaces for multi-language support
export interface LanguageProfile {
  primaryLanguage: 'hindi' | 'english' | 'mixed';
  secondaryLanguages: string[];
  proficiencyLevels: { [language: string]: 'native' | 'fluent' | 'conversational' | 'basic' };
  preferredScript: 'devanagari' | 'roman' | 'mixed';
  emotionalExpressionLanguage: 'hindi' | 'english' | 'mixed';
}

export interface LanguageAdaptation {
  originalText: string;
  adaptedText: string;
  targetLanguage: 'hindi' | 'english' | 'mixed';
  adaptationType: 'translation' | 'code_switching' | 'cultural_adaptation';
  confidence: number;
  culturalRelevance: number;
}

export interface TherapeuticTerminology {
  english: string;
  hindi: string;
  hinglish: string;
  culturalContext: string[];
  usage: 'clinical' | 'conversational' | 'family';
}

export class MultiLanguageSupportService {
  private therapeuticTerminology: Map<string, TherapeuticTerminology> = new Map();
  private languagePatterns: Map<string, any> = new Map();
  private emotionalExpressions: Map<string, any> = new Map();

  constructor() {
    this.initializeTherapeuticTerminology();
    this.initializeLanguagePatterns();
    this.initializeEmotionalExpressions();
    console.log('🌐 Multi-Language Support Service initialized');
  }

  // Main method to detect language profile
  async detectLanguageProfile(_userContext: UserContext, conversationHistory: any[]): Promise<LanguageProfile> {
    const textContent = conversationHistory.map(msg => msg.content).join(' ');
    const detectedLanguage = this.detectPrimaryLanguage(textContent);
    
    return {
      primaryLanguage: detectedLanguage,
      secondaryLanguages: this.identifySecondaryLanguages(textContent),
      proficiencyLevels: this.assessLanguageProficiency(textContent),
      preferredScript: this.determinePreferredScript(textContent),
      emotionalExpressionLanguage: this.identifyEmotionalLanguagePreference(conversationHistory)
    };
  }

  // Adapt content for target language
  async adaptLanguageForTherapy(
    content: string,
    targetLanguage: 'hindi' | 'english' | 'mixed',
    culturalContext: CulturalContext
  ): Promise<LanguageAdaptation> {
    let adaptedText = content;

    // Apply language-specific adaptations
    switch (targetLanguage) {
      case 'hindi':
        adaptedText = this.adaptToHindi(content, culturalContext);
        break;
      case 'english':
        adaptedText = this.adaptToEnglish(content, culturalContext);
        break;
      case 'mixed':
        adaptedText = this.adaptToHinglish(content, culturalContext);
        break;
    }

    // Apply therapeutic terminology
    adaptedText = this.applyTherapeuticTerminology(adaptedText, targetLanguage);

    return {
      originalText: content,
      adaptedText,
      targetLanguage,
      adaptationType: targetLanguage === 'mixed' ? 'code_switching' : 'translation',
      confidence: 0.8,
      culturalRelevance: this.calculateCulturalRelevance(adaptedText, culturalContext)
    };
  }

  // Recognize emotional expressions in different languages
  async recognizeEmotionalExpression(text: string, languageContext: 'hindi' | 'english' | 'mixed'): Promise<any[]> {
    const emotions: any[] = [];

    // Hindi emotional expressions
    const hindiEmotions = ['खुश', 'उदास', 'गुस्सा', 'चिंता', 'डर', 'प्रेम'];
    hindiEmotions.forEach(emotion => {
      if (text.includes(emotion)) {
        emotions.push({ emotion, language: 'hindi', intensity: 7 });
      }
    });

    // English emotional expressions
    const englishEmotions = ['happy', 'sad', 'angry', 'worried', 'scared', 'love'];
    englishEmotions.forEach(emotion => {
      if (text.toLowerCase().includes(emotion)) {
        emotions.push({ emotion, language: 'english', intensity: 7 });
      }
    });

    // Hinglish expressions
    const hinglishEmotions = ['khush hun', 'udaas hun', 'tension hai', 'worried hun'];
    hinglishEmotions.forEach(emotion => {
      if (text.toLowerCase().includes(emotion)) {
        emotions.push({ emotion, language: 'mixed', intensity: 7 });
      }
    });

    return emotions.filter(e => languageContext === 'mixed' || e.language === languageContext);
  }

  // Initialize therapeutic terminology
  private initializeTherapeuticTerminology(): void {
    const terms: Array<[string, TherapeuticTerminology]> = [
      ['anxiety', {
        english: 'anxiety',
        hindi: 'चिंता (chinta)',
        hinglish: 'tension/worry',
        culturalContext: ['mental_health'],
        usage: 'clinical'
      }],
      ['stress', {
        english: 'stress',
        hindi: 'तनाव (tanaav)',
        hinglish: 'tension',
        culturalContext: ['daily_life'],
        usage: 'conversational'
      }],
      ['family', {
        english: 'family',
        hindi: 'परिवार (parivaar)',
        hinglish: 'family/ghar waale',
        culturalContext: ['relationships'],
        usage: 'family'
      }],
      ['support', {
        english: 'support',
        hindi: 'सहारा (sahara)',
        hinglish: 'support/sahara',
        culturalContext: ['help'],
        usage: 'conversational'
      }]
    ];

    terms.forEach(([key, term]) => {
      this.therapeuticTerminology.set(key, term);
    });
  }

  private initializeLanguagePatterns(): void {
    this.languagePatterns.set('hindi', {
      commonWords: ['है', 'हूं', 'का', 'की', 'को', 'में', 'से'],
      emotionalMarkers: ['खुश', 'उदास', 'गुस्सा', 'चिंता'],
      formalityMarkers: ['आप', 'जी', 'कृपया', 'धन्यवाद']
    });

    this.languagePatterns.set('english', {
      commonWords: ['the', 'is', 'am', 'are', 'was', 'were'],
      emotionalMarkers: ['happy', 'sad', 'angry', 'worried'],
      formalityMarkers: ['please', 'thank you', 'sir', 'madam']
    });

    this.languagePatterns.set('hinglish', {
      commonPatterns: ['hai na', 'kar raha hun', 'ho gaya', 'aa raha hai'],
      codeSwitchingTriggers: ['emotions', 'emphasis', 'cultural_concepts']
    });
  }

  private initializeEmotionalExpressions(): void {
    this.emotionalExpressions.set('happiness', {
      hindi: ['खुश हूं', 'बहुत अच्छा लग रहा', 'मजा आ रहा'],
      english: ['I am happy', 'feeling great', 'so good'],
      hinglish: ['bahut khush hun', 'feeling good hai', 'maza aa raha hai']
    });

    this.emotionalExpressions.set('sadness', {
      hindi: ['उदास हूं', 'दुख हो रहा', 'मन भारी है'],
      english: ['I am sad', 'feeling down', 'heartbroken'],
      hinglish: ['bahut udaas hun', 'dil heavy hai', 'mood off hai']
    });
  }

  // Language detection methods
  private detectPrimaryLanguage(text: string): 'hindi' | 'english' | 'mixed' {
    const hindiPattern = /[\u0900-\u097F]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hindiMatches = (text.match(hindiPattern) || []).length;
    const englishMatches = (text.match(englishPattern) || []).length;
    const totalChars = text.length;

    const hindiRatio = hindiMatches / totalChars;
    const englishRatio = englishMatches / totalChars;

    if (hindiRatio > 0.6) return 'hindi';
    if (englishRatio > 0.8) return 'english';
    return 'mixed';
  }

  private identifySecondaryLanguages(text: string): string[] {
    const languages: string[] = [];
    if (text.includes('tamil')) languages.push('tamil');
    if (text.includes('bengali')) languages.push('bengali');
    return languages;
  }

  private assessLanguageProficiency(_text: string): { [language: string]: 'native' | 'fluent' | 'conversational' | 'basic' } {
    return {
      'hindi': 'conversational',
      'english': 'fluent'
    };
  }

  private determinePreferredScript(text: string): 'devanagari' | 'roman' | 'mixed' {
    const hasDevanagari = /[\u0900-\u097F]/.test(text);
    const hasRoman = /[a-zA-Z]/.test(text);
    
    if (hasDevanagari && !hasRoman) return 'devanagari';
    if (hasRoman && !hasDevanagari) return 'roman';
    return 'mixed';
  }

  private identifyEmotionalLanguagePreference(conversationHistory: any[]): 'hindi' | 'english' | 'mixed' {
    let hindiEmotionalCount = 0;
    let englishEmotionalCount = 0;

    conversationHistory.forEach(message => {
      const content = message.content.toLowerCase();
      if (content.includes('खुश') || content.includes('उदास')) hindiEmotionalCount++;
      if (content.includes('happy') || content.includes('sad')) englishEmotionalCount++;
    });

    if (hindiEmotionalCount > englishEmotionalCount) return 'hindi';
    if (englishEmotionalCount > hindiEmotionalCount) return 'english';
    return 'mixed';
  }

  // Language adaptation methods
  private adaptToHindi(content: string, culturalContext: CulturalContext): string {
    let adaptedContent = content;

    // Replace English terms with Hindi equivalents
    this.therapeuticTerminology.forEach((term, key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, term.hindi);
    });

    // Add respectful language markers for hierarchical contexts
    if (culturalContext.communicationStyle === 'hierarchical') {
      adaptedContent = adaptedContent.replace(/\bआप\b/g, 'आप जी');
    }

    return adaptedContent;
  }

  private adaptToEnglish(content: string, culturalContext: CulturalContext): string {
    let adaptedContent = content;

    // Explain cultural concepts
    adaptedContent = adaptedContent.replace(/joint family/gi, 'joint family (extended family living together)');
    
    // Adjust formality for Indian English context
    if (culturalContext.communicationStyle === 'hierarchical') {
      adaptedContent = adaptedContent.replace(/\bplease\b/g, 'kindly');
    }

    return adaptedContent;
  }

  private adaptToHinglish(content: string, _culturalContext: CulturalContext): string {
    let adaptedContent = content;

    // Apply natural code-switching patterns
    adaptedContent = adaptedContent.replace(/\bfeeling\b/g, 'feel kar raha hun');
    adaptedContent = adaptedContent.replace(/\bis happening\b/g, 'ho raha hai');

    // Add Hinglish expressions
    adaptedContent = adaptedContent.replace(/right\?/g, 'hai na?');
    adaptedContent = adaptedContent.replace(/you know/g, 'you know na');

    return adaptedContent;
  }

  private applyTherapeuticTerminology(content: string, targetLanguage: 'hindi' | 'english' | 'mixed'): string {
    let adaptedContent = content;

    this.therapeuticTerminology.forEach((term, key) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      
      switch (targetLanguage) {
        case 'hindi':
          adaptedContent = adaptedContent.replace(regex, term.hindi);
          break;
        case 'english':
          adaptedContent = adaptedContent.replace(regex, term.english);
          break;
        case 'mixed':
          adaptedContent = adaptedContent.replace(regex, term.hinglish);
          break;
      }
    });

    return adaptedContent;
  }

  private calculateCulturalRelevance(text: string, _culturalContext: CulturalContext): number {
    let relevance = 0.5;

    // Check for cultural markers
    const culturalMarkers = ['family', 'परिवार', 'respect', 'सम्मान'];
    culturalMarkers.forEach(marker => {
      if (text.toLowerCase().includes(marker.toLowerCase())) {
        relevance += 0.1;
      }
    });

    return Math.min(1, relevance);
  }
}

// Export singleton instance
export const multiLanguageSupport = new MultiLanguageSupportService();