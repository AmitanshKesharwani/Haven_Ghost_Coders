// Enhanced Cultural Intelligence Service - Provides culturally-aware adaptations for therapeutic activities
// Specializes in Indian cultural contexts, family dynamics, and regional variations
// Implements comprehensive cultural context analysis and therapeutic content adaptation

import type { CulturalContext, UserContext } from './aiOrchestrator';

// Enhanced interfaces for cultural intelligence
export interface CulturalProfile {
  primaryCulture: 'north_indian' | 'south_indian' | 'east_indian' | 'west_indian' | 'mixed';
  subCultures: string[];
  languages: LanguageProfile[];
  familyStructure: 'nuclear' | 'joint' | 'extended' | 'single_parent';
  familyRoles: FamilyRole[];
  familyExpectations: Expectation[];
  educationalBackground: EducationalContext;
  socioeconomicStatus: SocioeconomicContext;
  religiousBackground?: ReligiousContext;
  communicationStyle: CommunicationStyle;
  conflictResolutionStyle: ConflictStyle;
  emotionalExpressionNorms: EmotionalNorms;
}

export interface LanguageProfile {
  language: string;
  proficiency: 'native' | 'fluent' | 'conversational' | 'basic';
  preference: 'primary' | 'secondary' | 'occasional';
  culturalContext: string[];
}

export interface FamilyRole {
  role: string;
  expectations: string[];
  responsibilities: string[];
  decisionMakingPower: number; // 1-10 scale
}

export interface Expectation {
  category: 'academic' | 'career' | 'marriage' | 'social' | 'religious' | 'financial';
  description: string;
  intensity: number; // 1-10 scale
  source: 'family' | 'society' | 'self' | 'peers';
}

export interface EducationalContext {
  level: 'school' | 'undergraduate' | 'postgraduate' | 'professional' | 'working';
  field?: string;
  pressureLevel: number; // 1-10 scale
  competitiveEnvironment: boolean;
  familyInvolvement: number; // 1-10 scale
}

export interface SocioeconomicContext {
  urbanization: 'urban' | 'semi_urban' | 'rural';
  economicStatus: 'lower' | 'lower_middle' | 'middle' | 'upper_middle' | 'upper';
  socialMobility: 'upward' | 'stable' | 'downward';
  accessToResources: number; // 1-10 scale
}

export interface ReligiousContext {
  religion: string;
  practiceLevel: 'devout' | 'moderate' | 'cultural' | 'non_practicing';
  influence: number; // 1-10 scale on daily life
  conflictAreas?: string[];
}

export interface CommunicationStyle {
  directness: 'direct' | 'indirect' | 'mixed';
  formality: 'formal' | 'casual' | 'contextual';
  emotionalExpression: 'open' | 'reserved' | 'selective';
  hierarchyRespect: number; // 1-10 scale
}

export interface ConflictStyle {
  approach: 'confrontational' | 'avoidant' | 'collaborative' | 'hierarchical';
  familyInvolvement: boolean;
  elderMediation: boolean;
  harmonyPriority: number; // 1-10 scale
}

export interface EmotionalNorms {
  acceptableEmotions: string[];
  restrictedEmotions: string[];
  expressionContexts: { [emotion: string]: string[] };
  genderDifferences: { [gender: string]: string[] };
}

export interface CulturalAdaptation {
  originalContent: string;
  adaptedContent: string;
  adaptationType: 'language' | 'cultural_reference' | 'family_context' | 'religious' | 'regional' | 'generational' | 'socioeconomic';
  confidence: number; // 0-1 scale
  reasoning: string;
  culturalElements: string[];
  sensitivityLevel: 'low' | 'medium' | 'high';
}

export interface CulturalInsight {
  category: 'family_dynamics' | 'academic_pressure' | 'social_expectations' | 'religious_values' | 'generational_gap' | 'gender_roles' | 'economic_stress';
  insight: string;
  relevance: number; // 0-1 scale
  therapeuticImplication: string;
  culturalSensitivity: string[];
  actionableRecommendations: string[];
}

export interface CulturalValidation {
  isAppropriate: boolean;
  concerns: CulturalConcern[];
  suggestions: CulturalSuggestion[];
  overallScore: number; // 0-1 scale
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CulturalConcern {
  type: 'language' | 'religious' | 'family' | 'gender' | 'social' | 'generational';
  severity: 'minor' | 'moderate' | 'major';
  description: string;
  potentialImpact: string;
}

export interface CulturalSuggestion {
  type: 'language_adaptation' | 'cultural_reference' | 'sensitivity_adjustment' | 'context_modification';
  priority: 'low' | 'medium' | 'high';
  suggestion: string;
  expectedImprovement: string;
}

export class CulturalIntelligenceService {
  private culturalPatterns: Map<string, any> = new Map();
  private regionalAdaptations: Map<string, any> = new Map();
  private familyDynamicsPatterns: Map<string, any> = new Map();
  private languagePatterns: Map<string, any> = new Map();
  private religiousPatterns: Map<string, any> = new Map();
  private generationalPatterns: Map<string, any> = new Map();
  private therapeuticAdaptations: Map<string, any> = new Map();
  private culturalSensitivityRules: Map<string, any> = new Map();

  constructor() {
    this.initializeCulturalPatterns();
    this.initializeRegionalAdaptations();
    this.initializeFamilyDynamics();
    this.initializeLanguagePatterns();
    this.initializeReligiousPatterns();
    this.initializeGenerationalPatterns();
    this.initializeTherapeuticAdaptations();
    this.initializeCulturalSensitivityRules();
    console.log('🌍 Enhanced Cultural Intelligence Service initialized with comprehensive analysis capabilities');
  }

  // Enhanced comprehensive cultural context analysis
  async analyzeCulturalContext(userContext: UserContext, conversationHistory: any[] = []): Promise<CulturalContext> {
    console.log('🔍 Analyzing comprehensive cultural context for user:', userContext.userId);

    // Build comprehensive cultural profile
    const culturalProfile = await this.buildCulturalProfile(userContext, conversationHistory);
    
    const culturalContext: CulturalContext = {
      primaryCulture: culturalProfile.primaryCulture,
      languagePreference: this.inferLanguagePreference(userContext, conversationHistory),
      familyStructure: culturalProfile.familyStructure,
      communicationStyle: culturalProfile.communicationStyle.directness === 'direct' ? 'direct' : 
                         culturalProfile.communicationStyle.directness === 'indirect' ? 'indirect' : 'hierarchical',
      socioeconomicContext: culturalProfile.socioeconomicStatus.urbanization,
      generationalFactors: this.identifyGenerationalFactors(userContext),
      culturalSensitivities: this.identifyCulturalSensitivities(userContext),
      ...(culturalProfile.religiousBackground?.religion && { religiousBackground: culturalProfile.religiousBackground.religion })
    };

    // Store cultural profile for future reference
    this.storeCulturalProfile(userContext.userId, culturalProfile);

    console.log('✅ Cultural context analysis completed:', culturalContext);
    return culturalContext;
  }

  // Build comprehensive cultural profile
  async buildCulturalProfile(userContext: UserContext, conversationHistory: any[] = []): Promise<CulturalProfile> {
    const religiousBackground = this.analyzeReligiousContext(userContext, conversationHistory);
    
    const profile: CulturalProfile = {
      primaryCulture: this.inferPrimaryCulture(userContext),
      subCultures: this.identifySubCultures(userContext, conversationHistory),
      languages: this.analyzeLanguageProfile(userContext, conversationHistory),
      familyStructure: this.inferFamilyStructure(userContext),
      familyRoles: this.analyzeFamilyRoles(userContext, conversationHistory),
      familyExpectations: this.identifyFamilyExpectations(userContext, conversationHistory),
      educationalBackground: this.analyzeEducationalContext(userContext, conversationHistory),
      socioeconomicStatus: this.analyzeSocioeconomicContext(userContext),
      communicationStyle: this.analyzeCommunicationStyle(userContext, conversationHistory),
      conflictResolutionStyle: this.analyzeConflictStyle(userContext, conversationHistory),
      emotionalExpressionNorms: this.analyzeEmotionalNorms(userContext, conversationHistory),
      ...(religiousBackground && { religiousBackground })
    };

    return profile;
  }

  // Enhanced therapeutic content adaptation with comprehensive cultural intelligence
  async adaptContentForCulture(content: string, culturalContext: CulturalContext): Promise<CulturalAdaptation> {
    console.log('🎨 Adapting therapeutic content for cultural context');

    let adaptedContent = content;
    const culturalElements: string[] = [];
    let adaptationType: CulturalAdaptation['adaptationType'] = 'cultural_reference';
    let reasoning = '';
    let sensitivityLevel: 'low' | 'medium' | 'high' = 'medium';

    // Multi-layered adaptation approach
    const adaptations = await Promise.all([
      this.adaptLanguage(content, culturalContext),
      this.adaptFamilyContext(content, culturalContext),
      this.adaptRegionalContext(content, culturalContext),
      this.adaptReligiousContext(content, culturalContext),
      this.adaptGenerationalContext(content, culturalContext),
      this.adaptSocioeconomicContext(content, culturalContext)
    ]);

    // Apply adaptations in order of priority
    for (const adaptation of adaptations) {
      if (adaptation && adaptation.confidence > 0.6) {
        adaptedContent = adaptation.adaptedContent;
        culturalElements.push(...adaptation.culturalElements);
        reasoning += (reasoning ? ' | ' : '') + adaptation.reasoning;
        
        if (adaptation.sensitivityLevel === 'high') {
          sensitivityLevel = 'high';
        } else if (adaptation.sensitivityLevel === 'medium' && sensitivityLevel !== 'high') {
          sensitivityLevel = 'medium';
        }
      }
    }

    // Apply therapeutic terminology adaptations
    adaptedContent = this.adaptTherapeuticTerminology(adaptedContent, culturalContext);
    culturalElements.push('therapeutic_terminology');

    // Final cultural sensitivity check
    const sensitivityCheck = await this.validateCulturalSensitivity(adaptedContent, culturalContext);
    if (!sensitivityCheck.isAppropriate) {
      adaptedContent = this.applySensitivityCorrections(adaptedContent, sensitivityCheck.suggestions);
      reasoning += ' | Applied sensitivity corrections';
      sensitivityLevel = 'high';
    }

    return {
      originalContent: content,
      adaptedContent,
      adaptationType,
      confidence: this.calculateAdaptationConfidence(culturalContext),
      reasoning: reasoning || 'General cultural adaptation applied',
      culturalElements: [...new Set(culturalElements)],
      sensitivityLevel
    };
  }

  // Generate cultural insights for therapeutic planning
  async generateCulturalInsights(userContext: UserContext, concerns: string[]): Promise<CulturalInsight[]> {
    const insights: CulturalInsight[] = [];
    const culturalContext = await this.analyzeCulturalContext(userContext);

    // Family dynamics insights
    if (culturalContext.familyStructure === 'joint') {
      insights.push({
        category: 'family_dynamics',
        insight: 'User lives in joint family structure where individual decisions often involve family consultation',
        relevance: 0.9,
        therapeuticImplication: 'Consider family involvement in therapeutic goals and respect collective decision-making',
        culturalSensitivity: ['family_hierarchy', 'collective_decision_making'],
        actionableRecommendations: ['Include family in therapy planning', 'Respect family consultation process']
      });
    }

    // Academic pressure insights
    if (concerns.includes('academic_stress') || concerns.includes('career_pressure')) {
      insights.push({
        category: 'academic_pressure',
        insight: 'Academic and career success are highly valued in Indian families, creating significant pressure',
        relevance: 0.8,
        therapeuticImplication: 'Address perfectionism and family expectations while honoring cultural values',
        culturalSensitivity: ['family_expectations', 'academic_achievement'],
        actionableRecommendations: ['Balance achievement with wellbeing', 'Communicate with family about pressure']
      });
    }

    // Social expectations insights
    if (culturalContext.generationalFactors.includes('traditional_values')) {
      insights.push({
        category: 'social_expectations',
        insight: 'Traditional social expectations may conflict with modern individual aspirations',
        relevance: 0.7,
        therapeuticImplication: 'Help navigate balance between tradition and personal growth',
        culturalSensitivity: ['traditional_values', 'modern_aspirations'],
        actionableRecommendations: ['Find middle ground between values', 'Gradual change approach']
      });
    }

    // Generational gap insights
    if (userContext.demographics.age && userContext.demographics.age < 30) {
      insights.push({
        category: 'generational_gap',
        insight: 'Young adults may experience conflict between traditional family values and modern lifestyle choices',
        relevance: 0.8,
        therapeuticImplication: 'Address intergenerational communication and value conflicts with sensitivity',
        culturalSensitivity: ['generational_differences', 'value_conflicts'],
        actionableRecommendations: ['Facilitate intergenerational dialogue', 'Respect both perspectives']
      });
    }

    return insights;
  }

  // Comprehensive cultural sensitivity validation for therapeutic responses
  async validateCulturalSensitivity(content: string, culturalContext: CulturalContext): Promise<CulturalValidation> {
    console.log('🛡️ Validating cultural sensitivity of therapeutic content');

    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Comprehensive sensitivity analysis
    const analyses = await Promise.all([
      this.analyzeLanguageSensitivity(content, culturalContext),
      this.analyzeReligiousSensitivity(content, culturalContext),
      this.analyzeFamilySensitivity(content, culturalContext),
      this.analyzeGenderSensitivity(content, culturalContext),
      this.analyzeSocialSensitivity(content, culturalContext),
      this.analyzeGenerationalSensitivity(content, culturalContext)
    ]);

    // Aggregate concerns and suggestions
    analyses.forEach(analysis => {
      concerns.push(...analysis.concerns);
      suggestions.push(...analysis.suggestions);
    });

    // Calculate overall appropriateness score
    const overallScore = this.calculateSensitivityScore(concerns);
    const riskLevel = this.determineRiskLevel(concerns);

    const validation: CulturalValidation = {
      isAppropriate: concerns.length === 0 || concerns.every(c => c.severity === 'minor'),
      concerns,
      suggestions: this.prioritizeSuggestions(suggestions),
      overallScore,
      riskLevel
    };

    console.log('✅ Cultural sensitivity validation completed:', validation);
    return validation;
  }

  // Analyze language sensitivity
  private async analyzeLanguageSensitivity(content: string, culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Check for language appropriateness
    if (culturalContext.languagePreference === 'hindi' || culturalContext.languagePreference === 'mixed') {
      const hasHindiElements = /[\u0900-\u097F]/.test(content) || 
        /\b(namaste|dhanyawad|parivaar|mata-ji|papa-ji)\b/i.test(content);
      
      if (!hasHindiElements) {
        suggestions.push({
          type: 'language_adaptation',
          priority: 'medium',
          suggestion: 'Include Hindi terms or phrases for better cultural connection',
          expectedImprovement: 'Increased cultural relevance and user comfort'
        });
      }
    }

    // Check for overly formal or informal language
    const formalityLevel = this.assessFormalityLevel(content);
    if (culturalContext.communicationStyle === 'hierarchical' && formalityLevel < 0.6) {
      concerns.push({
        type: 'language',
        severity: 'minor',
        description: 'Language may be too informal for hierarchical communication style',
        potentialImpact: 'May seem disrespectful or inappropriate'
      });
    }

    return { concerns, suggestions };
  }

  // Analyze religious sensitivity
  private async analyzeReligiousSensitivity(content: string, culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    if (culturalContext.religiousBackground) {
      // Check for potentially offensive religious content
      const religiousTerms = ['god', 'prayer', 'faith', 'spiritual', 'divine'];
      const hasReligiousContent = religiousTerms.some(term => 
        content.toLowerCase().includes(term)
      );

      if (hasReligiousContent) {
        // Validate appropriateness for specific religion
        const religiousValidation = this.validateReligiousContent(content, culturalContext.religiousBackground);
        if (!religiousValidation.appropriate) {
          concerns.push({
            type: 'religious',
            severity: 'major',
            description: religiousValidation.concern,
            potentialImpact: 'May offend religious beliefs or cause distress'
          });
        }
      } else {
        // Suggest incorporating spiritual elements if appropriate
        suggestions.push({
          type: 'cultural_reference',
          priority: 'low',
          suggestion: 'Consider incorporating spiritual/religious coping mechanisms',
          expectedImprovement: 'Better alignment with user\'s spiritual values'
        });
      }
    }

    return { concerns, suggestions };
  }

  // Analyze family sensitivity
  private async analyzeFamilySensitivity(content: string, culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Check for individualistic vs collectivistic approach
    const individualisticPatterns = [
      /\byou should.*independent/i,
      /\bignore.*family/i,
      /\byour.*decision.*alone/i,
      /\bindividual.*above.*family/i
    ];

    individualisticPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        concerns.push({
          type: 'family',
          severity: culturalContext.familyStructure === 'joint' ? 'major' : 'moderate',
          description: 'Content promotes individualistic approach that may conflict with family values',
          potentialImpact: 'May create family conflict or guilt'
        });
      }
    });

    // Suggest family-inclusive approaches
    if (culturalContext.familyStructure === 'joint' || culturalContext.familyStructure === 'extended') {
      suggestions.push({
        type: 'context_modification',
        priority: 'high',
        suggestion: 'Frame therapeutic recommendations in family-inclusive terms',
        expectedImprovement: 'Better acceptance and family support for therapeutic goals'
      });
    }

    return { concerns, suggestions };
  }

  // Analyze gender sensitivity
  private async analyzeGenderSensitivity(content: string, _culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Check for gender-specific assumptions
    const genderAssumptions = [
      /\bgirls should/i,
      /\bboys should/i,
      /\bwomen are/i,
      /\bmen are/i
    ];

    genderAssumptions.forEach(pattern => {
      if (pattern.test(content)) {
        concerns.push({
          type: 'gender',
          severity: 'moderate',
          description: 'Content contains gender stereotypes or assumptions',
          potentialImpact: 'May reinforce harmful gender roles or exclude non-binary individuals'
        });
      }
    });

    return { concerns, suggestions };
  }

  // Analyze social sensitivity
  private async analyzeSocialSensitivity(content: string, _culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Check for socioeconomic assumptions
    const economicAssumptions = [
      /\bbuy.*expensive/i,
      /\bprivate.*therapy/i,
      /\btravel.*vacation/i
    ];

    economicAssumptions.forEach(pattern => {
      if (pattern.test(content)) {
        concerns.push({
          type: 'social',
          severity: 'moderate',
          description: 'Content assumes higher socioeconomic status',
          potentialImpact: 'May make user feel excluded or inadequate'
        });
      }
    });

    return { concerns, suggestions };
  }

  // Analyze generational sensitivity
  private async analyzeGenerationalSensitivity(content: string, _culturalContext: CulturalContext): Promise<{ concerns: CulturalConcern[]; suggestions: CulturalSuggestion[] }> {
    const concerns: CulturalConcern[] = [];
    const suggestions: CulturalSuggestion[] = [];

    // Check for generational assumptions
    const generationalPatterns = [
      /\byoung people.*always/i,
      /\bolder generation.*never/i,
      /\btraditional.*outdated/i
    ];

    generationalPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        concerns.push({
          type: 'generational',
          severity: 'minor',
          description: 'Content contains generational stereotypes',
          potentialImpact: 'May create intergenerational conflict or misunderstanding'
        });
      }
    });

    return { concerns, suggestions };
  }

  // New initialization methods for enhanced cultural intelligence
  private initializeLanguagePatterns(): void {
    this.languagePatterns.set('hindi', {
      commonWords: ['namaste', 'dhanyawad', 'parivaar', 'mata-ji', 'papa-ji', 'bhai', 'didi'],
      formalTerms: ['aap', 'ji', 'sahib', 'madam'],
      emotionalTerms: ['khushi', 'udaasi', 'chinta', 'tension', 'sukh', 'dukh'],
      therapeuticTerms: ['mansik swasthya', 'chikitsa', 'sahayata', 'samadhan']
    });

    this.languagePatterns.set('mixed', {
      patterns: ['hinglish', 'code_switching'],
      indicators: ['hai', 'nahi', 'acha', 'theek', 'kya', 'kaise'],
      formality: 'contextual'
    });
  }

  private initializeReligiousPatterns(): void {
    this.religiousPatterns.set('hindu', {
      concepts: ['dharma', 'karma', 'moksha', 'ahimsa'],
      practices: ['puja', 'meditation', 'yoga', 'pilgrimage'],
      values: ['respect_for_elders', 'family_duty', 'spiritual_growth'],
      therapeuticIntegration: ['mindfulness', 'yoga_therapy', 'spiritual_counseling']
    });

    this.religiousPatterns.set('muslim', {
      concepts: ['iman', 'taqwa', 'sabr', 'shukr'],
      practices: ['salah', 'dhikr', 'dua', 'hajj'],
      values: ['community_support', 'patience', 'gratitude'],
      therapeuticIntegration: ['prayer_therapy', 'community_healing', 'patience_building']
    });

    this.religiousPatterns.set('christian', {
      concepts: ['faith', 'hope', 'love', 'forgiveness'],
      practices: ['prayer', 'worship', 'fellowship', 'service'],
      values: ['compassion', 'forgiveness', 'community'],
      therapeuticIntegration: ['faith_based_counseling', 'forgiveness_therapy', 'community_support']
    });
  }

  private initializeGenerationalPatterns(): void {
    this.generationalPatterns.set('gen_z', {
      ageRange: [16, 25],
      characteristics: ['digital_native', 'social_media_influenced', 'globally_aware', 'environmentally_conscious'],
      stressors: ['academic_pressure', 'career_uncertainty', 'social_media_comparison', 'climate_anxiety'],
      communication: ['direct', 'visual', 'brief', 'emoji_rich'],
      therapeuticPreferences: ['app_based', 'gamified', 'peer_support', 'immediate_feedback']
    });

    this.generationalPatterns.set('millennial', {
      ageRange: [26, 35],
      characteristics: ['tech_savvy', 'work_life_balance_focused', 'experience_oriented'],
      stressors: ['work_pressure', 'financial_stress', 'relationship_challenges', 'family_planning'],
      communication: ['balanced', 'detailed', 'research_oriented'],
      therapeuticPreferences: ['evidence_based', 'flexible_scheduling', 'holistic_approach']
    });
  }

  private initializeTherapeuticAdaptations(): void {
    this.therapeuticAdaptations.set('family_therapy', {
      joint_family: {
        approach: 'inclusive',
        considerations: ['hierarchy_respect', 'collective_decision_making', 'elder_involvement'],
        techniques: ['family_meetings', 'role_clarification', 'boundary_setting_with_respect']
      },
      nuclear_family: {
        approach: 'focused',
        considerations: ['parent_child_dynamics', 'sibling_relationships', 'external_pressures'],
        techniques: ['communication_skills', 'conflict_resolution', 'stress_management']
      }
    });

    this.therapeuticAdaptations.set('cbt_adaptations', {
      cultural_modifications: {
        thought_challenging: 'respect_cultural_values',
        behavioral_experiments: 'family_appropriate',
        homework_assignments: 'culturally_relevant'
      }
    });
  }

  private initializeCulturalSensitivityRules(): void {
    this.culturalSensitivityRules.set('prohibited_content', [
      'disrespect_to_elders',
      'religious_insensitivity',
      'cultural_superiority',
      'family_dismissal',
      'gender_stereotyping'
    ]);

    this.culturalSensitivityRules.set('required_considerations', [
      'family_involvement',
      'religious_respect',
      'cultural_values',
      'social_harmony',
      'generational_differences'
    ]);
  }

  // Enhanced helper methods
  private storeCulturalProfile(userId: string, _profile: CulturalProfile): void {
    // Store cultural profile for future reference
    // In a real implementation, this would be stored in a database
    console.log(`📝 Storing cultural profile for user ${userId}`);
  }

  private identifySubCultures(_userContext: UserContext, conversationHistory: any[]): string[] {
    const subCultures: string[] = [];
    
    // Analyze conversation for subcultural indicators
    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();
    
    if (content.includes('urban') || content.includes('city')) {
      subCultures.push('urban');
    }
    if (content.includes('traditional') || content.includes('village')) {
      subCultures.push('traditional');
    }
    if (content.includes('modern') || content.includes('progressive')) {
      subCultures.push('modern');
    }

    return subCultures;
  }

  private analyzeLanguageProfile(userContext: UserContext, conversationHistory: any[]): LanguageProfile[] {
    const profiles: LanguageProfile[] = [];
    
    // Analyze primary language
    const primaryLang = userContext.demographics.language || 'mixed';
    profiles.push({
      language: primaryLang,
      proficiency: 'native',
      preference: 'primary',
      culturalContext: ['therapeutic', 'family', 'social']
    });

    // Detect secondary languages from conversation
    const content = conversationHistory.map(msg => msg.content).join(' ');
    if (/[\u0900-\u097F]/.test(content)) {
      profiles.push({
        language: 'hindi',
        proficiency: 'conversational',
        preference: 'secondary',
        culturalContext: ['family', 'emotional']
      });
    }

    return profiles;
  }

  private analyzeFamilyRoles(userContext: UserContext, _conversationHistory: any[]): FamilyRole[] {
    const roles: FamilyRole[] = [];
    const age = userContext.demographics.age || 25;

    // Infer roles based on age and cultural context
    if (age < 25) {
      roles.push({
        role: 'young_adult_child',
        expectations: ['academic_success', 'career_preparation', 'family_respect'],
        responsibilities: ['studies', 'family_support', 'cultural_values'],
        decisionMakingPower: 3
      });
    } else {
      roles.push({
        role: 'adult_child',
        expectations: ['career_success', 'marriage_consideration', 'family_support'],
        responsibilities: ['financial_contribution', 'family_decisions', 'elder_care'],
        decisionMakingPower: 6
      });
    }

    return roles;
  }

  private identifyFamilyExpectations(_userContext: UserContext, conversationHistory: any[]): Expectation[] {
    const expectations: Expectation[] = [];
    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    // Academic expectations
    if (content.includes('study') || content.includes('exam') || content.includes('marks')) {
      expectations.push({
        category: 'academic',
        description: 'High academic performance and educational achievement',
        intensity: 8,
        source: 'family'
      });
    }

    // Career expectations
    if (content.includes('career') || content.includes('job') || content.includes('engineer') || content.includes('doctor')) {
      expectations.push({
        category: 'career',
        description: 'Prestigious career in traditional fields',
        intensity: 9,
        source: 'family'
      });
    }

    return expectations;
  }

  private analyzeEducationalContext(userContext: UserContext, conversationHistory: any[]): EducationalContext {
    const age = userContext.demographics.age || 25;
    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    let level: EducationalContext['level'] = 'working';
    if (age < 18) level = 'school';
    else if (age < 22) level = 'undergraduate';
    else if (age < 25) level = 'postgraduate';

    const pressureIndicators = ['exam', 'competition', 'marks', 'rank', 'iit', 'neet'];
    const pressureLevel = pressureIndicators.filter(indicator => 
      content.includes(indicator)
    ).length * 2;

    const field = this.inferEducationalField(content);
    
    return {
      level,
      pressureLevel: Math.min(10, pressureLevel),
      competitiveEnvironment: pressureLevel > 4,
      familyInvolvement: 8, // High in Indian context
      ...(field && { field })
    };
  }

  private analyzeSocioeconomicContext(userContext: UserContext): SocioeconomicContext {
    const location = userContext.demographics.location?.toLowerCase() || '';
    
    let urbanization: SocioeconomicContext['urbanization'] = 'urban';
    if (location.includes('village') || location.includes('rural')) {
      urbanization = 'rural';
    } else if (location.includes('town') || location.includes('district')) {
      urbanization = 'semi_urban';
    }

    return {
      urbanization,
      economicStatus: 'middle', // Default assumption
      socialMobility: 'upward', // Common aspiration in Indian context
      accessToResources: urbanization === 'urban' ? 7 : urbanization === 'semi_urban' ? 5 : 3
    };
  }

  private analyzeReligiousContext(_userContext: UserContext, conversationHistory: any[]): ReligiousContext | undefined {
    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();
    
    const religiousIndicators = {
      'hindu': ['temple', 'puja', 'bhagwan', 'dharma', 'karma'],
      'muslim': ['mosque', 'allah', 'namaz', 'ramadan', 'inshallah'],
      'christian': ['church', 'jesus', 'prayer', 'christmas', 'god'],
      'sikh': ['gurdwara', 'waheguru', 'guru', 'langar']
    };

    for (const [religion, indicators] of Object.entries(religiousIndicators)) {
      const matches = indicators.filter(indicator => content.includes(indicator));
      if (matches.length > 0) {
        return {
          religion,
          practiceLevel: matches.length > 2 ? 'devout' : 'moderate',
          influence: matches.length * 2,
          conflictAreas: this.identifyReligiousConflicts(content, religion)
        };
      }
    }

    return undefined;
  }

  private analyzeCommunicationStyle(userContext: UserContext, conversationHistory: any[]): CommunicationStyle {
    const content = conversationHistory.map(msg => msg.content).join(' ');
    const age = userContext.demographics.age || 25;

    // Analyze directness
    const directIndicators = ['I want', 'I need', 'directly', 'clearly', 'honestly'];
    const indirectIndicators = ['maybe', 'perhaps', 'might', 'could be', 'I suppose'];
    
    const directCount = directIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    const indirectCount = indirectIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;

    return {
      directness: directCount > indirectCount ? 'direct' : 'indirect',
      formality: age > 30 ? 'formal' : 'casual',
      emotionalExpression: this.analyzeEmotionalExpression(content),
      hierarchyRespect: age < 25 ? 8 : 6
    };
  }

  private analyzeConflictStyle(_userContext: UserContext, conversationHistory: any[]): ConflictStyle {
    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();
    
    const conflictIndicators = {
      'confrontational': ['argue', 'fight', 'confront', 'directly address'],
      'avoidant': ['avoid', 'ignore', 'stay away', 'don\'t want to deal'],
      'collaborative': ['discuss', 'work together', 'find solution', 'compromise'],
      'hierarchical': ['ask elders', 'family decision', 'respect authority']
    };

    let dominantStyle: ConflictStyle['approach'] = 'avoidant' as ConflictStyle['approach']; // Default for Indian context
    let maxCount = 0;

    Object.entries(conflictIndicators).forEach(([style, indicators]) => {
      const count = indicators.filter(indicator => content.includes(indicator)).length;
      if (count > maxCount) {
        maxCount = count;
        dominantStyle = style as ConflictStyle['approach'];
      }
    });

    return {
      approach: dominantStyle,
      familyInvolvement: true, // Common in Indian context
      elderMediation: dominantStyle === 'hierarchical' || dominantStyle === 'collaborative',
      harmonyPriority: 8 // High in Indian culture
    };
  }

  private analyzeEmotionalNorms(_userContext: UserContext, _conversationHistory: any[]): EmotionalNorms {
    
    // Default emotional norms for Indian context
    const baseNorms: EmotionalNorms = {
      acceptableEmotions: ['happiness', 'gratitude', 'respect', 'concern'],
      restrictedEmotions: ['anger_towards_elders', 'disrespect', 'rebellion'],
      expressionContexts: {
        'sadness': ['family', 'close_friends'],
        'anger': ['peers', 'private'],
        'joy': ['family', 'social', 'public'],
        'fear': ['family', 'trusted_adults']
      },
      genderDifferences: {
        'male': ['emotional_restraint', 'strength_display'],
        'female': ['emotional_expression_allowed', 'family_emotional_support']
      }
    };

    return baseNorms;
  }

  // Helper methods for adaptation
  private async adaptLanguage(content: string, culturalContext: CulturalContext): Promise<any> {
    if (culturalContext.languagePreference === 'hindi' || culturalContext.languagePreference === 'mixed') {
      return {
        adaptedContent: this.addHindiElements(content),
        confidence: 0.8,
        culturalElements: ['hindi_terms'],
        reasoning: 'Added Hindi elements for language preference',
        sensitivityLevel: 'low' as const
      };
    }
    return null;
  }

  private async adaptFamilyContext(content: string, culturalContext: CulturalContext): Promise<any> {
    if (culturalContext.familyStructure === 'joint') {
      return {
        adaptedContent: this.adaptForJointFamily(content),
        confidence: 0.9,
        culturalElements: ['family_inclusive'],
        reasoning: 'Adapted for joint family structure',
        sensitivityLevel: 'high' as const
      };
    }
    return null;
  }

  private async adaptRegionalContext(content: string, culturalContext: CulturalContext): Promise<any> {
    const regionalAdaptation = this.getRegionalAdaptation(content, culturalContext.primaryCulture);
    if (regionalAdaptation) {
      return {
        adaptedContent: regionalAdaptation.content,
        confidence: 0.7,
        culturalElements: ['regional_references'],
        reasoning: regionalAdaptation.reasoning,
        sensitivityLevel: 'medium' as const
      };
    }
    return null;
  }

  private async adaptReligiousContext(content: string, culturalContext: CulturalContext): Promise<any> {
    if (culturalContext.religiousBackground) {
      const religiousAdaptation = this.adaptForReligiousContext(content, culturalContext.religiousBackground);
      if (religiousAdaptation) {
        return {
          adaptedContent: religiousAdaptation,
          confidence: 0.8,
          culturalElements: ['religious_sensitivity'],
          reasoning: 'Added religious sensitivity',
          sensitivityLevel: 'high' as const
        };
      }
    }
    return null;
  }

  private async adaptGenerationalContext(content: string, culturalContext: CulturalContext): Promise<any> {
    // Adapt based on generational factors
    const generationalTerms = this.getGenerationalTerms(culturalContext.generationalFactors);
    if (generationalTerms.length > 0) {
      let adaptedContent = content;
      generationalTerms.forEach(term => {
        adaptedContent = adaptedContent.replace(new RegExp(`\\b${term.old}\\b`, 'gi'), term.new);
      });
      
      if (adaptedContent !== content) {
        return {
          adaptedContent,
          confidence: 0.6,
          culturalElements: ['generational_terms'],
          reasoning: 'Adapted terminology for generational context',
          sensitivityLevel: 'medium' as const
        };
      }
    }
    return null;
  }

  private async adaptSocioeconomicContext(content: string, culturalContext: CulturalContext): Promise<any> {
    // Check for socioeconomic assumptions and adapt
    const economicAssumptions = ['expensive therapy', 'private counselor', 'luxury'];
    const hasAssumptions = economicAssumptions.some(assumption => 
      content.toLowerCase().includes(assumption)
    );

    if (hasAssumptions && culturalContext.socioeconomicContext !== 'urban') {
      const adaptedContent = content
        .replace(/expensive therapy/gi, 'accessible support')
        .replace(/private counselor/gi, 'mental health support')
        .replace(/luxury/gi, 'self-care');

      return {
        adaptedContent,
        confidence: 0.7,
        culturalElements: ['socioeconomic_sensitivity'],
        reasoning: 'Removed socioeconomic assumptions',
        sensitivityLevel: 'medium' as const
      };
    }
    return null;
  }

  private adaptTherapeuticTerminology(content: string, _culturalContext: CulturalContext): string {
    const terminologyMap = {
      'therapy': 'counseling support',
      'mental illness': 'mental health challenges',
      'disorder': 'condition',
      'patient': 'person',
      'treatment': 'support'
    };

    let adaptedContent = content;
    Object.entries(terminologyMap).forEach(([clinical, friendly]) => {
      adaptedContent = adaptedContent.replace(new RegExp(`\\b${clinical}\\b`, 'gi'), friendly);
    });

    return adaptedContent;
  }

  private applySensitivityCorrections(content: string, suggestions: CulturalSuggestion[]): string {
    let correctedContent = content;
    
    suggestions.forEach(suggestion => {
      if (suggestion.priority === 'high') {
        // Apply high-priority corrections
        switch (suggestion.type) {
          case 'language_adaptation':
            correctedContent = this.addHindiElements(correctedContent);
            break;
          case 'cultural_reference':
            correctedContent = this.addCulturalReferences(correctedContent);
            break;
          case 'sensitivity_adjustment':
            correctedContent = this.adjustSensitivity(correctedContent);
            break;
        }
      }
    });

    return correctedContent;
  }

  // Additional helper methods
  private calculateSensitivityScore(concerns: CulturalConcern[]): number {
    if (concerns.length === 0) return 1.0;
    
    const severityWeights = { minor: 0.1, moderate: 0.3, major: 0.6 };
    const totalPenalty = concerns.reduce((sum, concern) => 
      sum + severityWeights[concern.severity], 0
    );
    
    return Math.max(0, 1 - totalPenalty);
  }

  private determineRiskLevel(concerns: CulturalConcern[]): 'low' | 'medium' | 'high' {
    const hasMajor = concerns.some(c => c.severity === 'major');
    const moderateCount = concerns.filter(c => c.severity === 'moderate').length;
    
    if (hasMajor || moderateCount > 2) return 'high';
    if (moderateCount > 0) return 'medium';
    return 'low';
  }

  private prioritizeSuggestions(suggestions: CulturalSuggestion[]): CulturalSuggestion[] {
    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private assessFormalityLevel(content: string): number {
    const formalIndicators = ['please', 'kindly', 'respectfully', 'sir', 'madam'];
    const informalIndicators = ['hey', 'yeah', 'cool', 'awesome', 'dude'];
    
    const formalCount = formalIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    const informalCount = informalIndicators.filter(indicator => 
      content.toLowerCase().includes(indicator)
    ).length;
    
    return formalCount / (formalCount + informalCount + 1);
  }

  private validateReligiousContent(content: string, religion: string): { appropriate: boolean; concern: string } {
    const religiousValidation = this.religiousPatterns.get(religion);
    if (!religiousValidation) return { appropriate: true, concern: '' };

    // Check for potentially offensive content
    const offensivePatterns = {
      'hindu': [/idol worship.*wrong/i, /caste.*system.*good/i],
      'muslim': [/allah.*not/i, /islam.*violent/i],
      'christian': [/jesus.*myth/i, /bible.*false/i]
    };

    const patterns = offensivePatterns[religion as keyof typeof offensivePatterns] || [];
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        return { 
          appropriate: false, 
          concern: `Content may be offensive to ${religion} beliefs` 
        };
      }
    }

    return { appropriate: true, concern: '' };
  }

  private inferEducationalField(content: string): string | undefined {
    const fieldIndicators = {
      'engineering': ['engineer', 'iit', 'technology', 'coding'],
      'medicine': ['doctor', 'medical', 'neet', 'mbbs'],
      'business': ['mba', 'management', 'business', 'commerce'],
      'arts': ['literature', 'history', 'arts', 'humanities']
    };

    for (const [field, indicators] of Object.entries(fieldIndicators)) {
      if (indicators.some(indicator => content.includes(indicator))) {
        return field;
      }
    }

    return undefined;
  }

  private identifyReligiousConflicts(content: string, _religion: string): string[] {
    const conflicts: string[] = [];
    
    // Common religious conflicts in Indian context
    if (content.includes('modern') && content.includes('traditional')) {
      conflicts.push('modernity_vs_tradition');
    }
    if (content.includes('family') && content.includes('individual')) {
      conflicts.push('individual_vs_community');
    }
    
    return conflicts;
  }

  private analyzeEmotionalExpression(content: string): CommunicationStyle['emotionalExpression'] {
    const emotionalWords = ['feel', 'emotion', 'happy', 'sad', 'angry', 'worried'];
    const emotionalCount = emotionalWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    
    if (emotionalCount > 3) return 'open';
    if (emotionalCount > 1) return 'selective';
    return 'reserved';
  }

  private getGenerationalTerms(generationalFactors: string[]): Array<{ old: string; new: string }> {
    const terms: Array<{ old: string; new: string }> = [];
    
    if (generationalFactors.includes('digital_native')) {
      terms.push({ old: 'technology', new: 'digital tools' });
      terms.push({ old: 'computer', new: 'device' });
    }
    
    if (generationalFactors.includes('social_media_influence')) {
      terms.push({ old: 'friends', new: 'connections' });
      terms.push({ old: 'communication', new: 'staying connected' });
    }
    
    return terms;
  }

  private addCulturalReferences(content: string): string {
    // Add appropriate cultural references
    return content
      .replace(/\bfamily\b/g, 'family (parivaar)')
      .replace(/\brespect\b/g, 'respect (sammaan)')
      .replace(/\bpeace\b/g, 'peace (shanti)');
  }

  private adjustSensitivity(content: string): string {
    // Make content more culturally sensitive
    return content
      .replace(/\byou should\b/g, 'you might consider')
      .replace(/\bmust\b/g, 'could')
      .replace(/\bwrong\b/g, 'challenging');
  }

  // Private helper methods
  private initializeCulturalPatterns(): void {
    this.culturalPatterns.set('north_indian', {
      languages: ['hindi', 'punjabi', 'urdu'],
      greetings: ['namaste', 'sat sri akal', 'adab'],
      familyTerms: ['mata-ji', 'papa-ji', 'bhai-sahib', 'didi'],
      culturalValues: ['respect_for_elders', 'family_honor', 'hospitality'],
      commonConcerns: ['academic_pressure', 'marriage_expectations', 'career_success']
    });

    this.culturalPatterns.set('south_indian', {
      languages: ['tamil', 'telugu', 'kannada', 'malayalam'],
      greetings: ['vanakkam', 'namaskara', 'namasthe'],
      familyTerms: ['amma', 'appa', 'anna', 'akka'],
      culturalValues: ['education_importance', 'tradition_preservation', 'spiritual_practices'],
      commonConcerns: ['academic_excellence', 'cultural_preservation', 'migration_stress']
    });

    this.culturalPatterns.set('east_indian', {
      languages: ['bengali', 'odia', 'assamese'],
      greetings: ['namaskar', 'adab'],
      familyTerms: ['ma', 'baba', 'dada', 'didi'],
      culturalValues: ['intellectual_pursuits', 'artistic_expression', 'social_consciousness'],
      commonConcerns: ['intellectual_pressure', 'political_awareness', 'cultural_identity']
    });

    this.culturalPatterns.set('west_indian', {
      languages: ['marathi', 'gujarati', 'rajasthani'],
      greetings: ['namaskar', 'namaste'],
      familyTerms: ['aai', 'baba', 'tai', 'bhau'],
      culturalValues: ['business_acumen', 'community_service', 'festival_celebrations'],
      commonConcerns: ['business_pressure', 'community_expectations', 'modernization_balance']
    });
  }

  private initializeRegionalAdaptations(): void {
    this.regionalAdaptations.set('north_indian', {
      foodReferences: ['roti', 'dal', 'sabzi'],
      festivalReferences: ['diwali', 'holi', 'karva_chauth'],
      culturalPractices: ['touching_feet', 'joint_family_meals', 'arranged_marriages']
    });

    this.regionalAdaptations.set('south_indian', {
      foodReferences: ['rice', 'sambar', 'rasam'],
      festivalReferences: ['pongal', 'onam', 'ugadi'],
      culturalPractices: ['classical_music', 'temple_visits', 'education_focus']
    });
  }

  private initializeFamilyDynamics(): void {
    this.familyDynamicsPatterns.set('joint_family', {
      decisionMaking: 'collective',
      privacyLevel: 'limited',
      supportSystem: 'strong',
      conflictStyle: 'hierarchical_resolution',
      therapeuticConsiderations: ['family_involvement', 'respect_hierarchy', 'collective_goals']
    });

    this.familyDynamicsPatterns.set('nuclear_family', {
      decisionMaking: 'parental_or_individual',
      privacyLevel: 'moderate',
      supportSystem: 'moderate',
      conflictStyle: 'direct_communication',
      therapeuticConsiderations: ['individual_focus', 'parent_child_dynamics', 'peer_influence']
    });
  }

  private inferPrimaryCulture(userContext: UserContext): CulturalContext['primaryCulture'] {
    const location = userContext.demographics.location?.toLowerCase() || '';
    const culturalBackground = userContext.demographics.culturalBackground?.toLowerCase() || '';

    // Check location indicators
    if (location.includes('delhi') || location.includes('punjab') || location.includes('haryana') || 
        location.includes('rajasthan') || location.includes('uttar pradesh')) {
      return 'north_indian';
    }
    
    if (location.includes('tamil') || location.includes('kerala') || location.includes('karnataka') || 
        location.includes('andhra') || location.includes('telangana')) {
      return 'south_indian';
    }
    
    if (location.includes('bengal') || location.includes('odisha') || location.includes('assam') || 
        location.includes('tripura')) {
      return 'east_indian';
    }
    
    if (location.includes('maharashtra') || location.includes('gujarat') || location.includes('goa')) {
      return 'west_indian';
    }

    // Check cultural background
    if (culturalBackground.includes('north') || culturalBackground.includes('punjabi') || culturalBackground.includes('hindi')) {
      return 'north_indian';
    }
    
    if (culturalBackground.includes('south') || culturalBackground.includes('tamil') || culturalBackground.includes('malayali')) {
      return 'south_indian';
    }

    return 'mixed';
  }

  private inferLanguagePreference(userContext: UserContext, conversationHistory: any[]): CulturalContext['languagePreference'] {
    const userLanguage = userContext.demographics.language?.toLowerCase() || '';
    
    // Check explicit language preference
    if (userLanguage.includes('hindi')) return 'hindi';
    if (userLanguage.includes('english')) return 'english';
    
    // Analyze conversation history for language mixing
    if (conversationHistory.length > 0) {
      const hasHindiWords = conversationHistory.some(msg => 
        /[\u0900-\u097F]/.test(msg.content) || 
        /\b(acha|theek|hai|nahi|kya|kaise|kahan)\b/i.test(msg.content)
      );
      
      if (hasHindiWords) return 'mixed';
    }
    
    return 'mixed'; // Default for Indian context
  }

  private inferFamilyStructure(userContext: UserContext): CulturalContext['familyStructure'] {
    // This would ideally be determined from user profile or assessment
    // For now, using cultural patterns as indicators
    const age = userContext.demographics.age || 25;
    const location = userContext.demographics.location?.toLowerCase() || '';
    
    // Urban areas more likely to have nuclear families
    if (location.includes('mumbai') || location.includes('delhi') || location.includes('bangalore')) {
      return age < 25 ? 'joint' : 'nuclear';
    }
    
    // Default assumption for Indian context
    return 'joint';
  }

  // Legacy method - removed as unused

  private inferSocioeconomicContext(userContext: UserContext): CulturalContext['socioeconomicContext'] {
    const location = userContext.demographics.location?.toLowerCase() || '';
    
    // Major metropolitan areas
    if (location.includes('mumbai') || location.includes('delhi') || location.includes('bangalore') || 
        location.includes('hyderabad') || location.includes('chennai') || location.includes('pune')) {
      return 'urban';
    }
    
    // Tier 2 cities
    if (location.includes('city') || location.includes('nagar')) {
      return 'semi_urban';
    }
    
    return 'rural';
  }

  private identifyGenerationalFactors(userContext: UserContext): string[] {
    const age = userContext.demographics.age || 25;
    const factors: string[] = [];
    
    if (age < 25) {
      factors.push('digital_native', 'social_media_influence', 'global_exposure', 'career_uncertainty');
    } else if (age < 35) {
      factors.push('work_life_balance', 'relationship_pressure', 'financial_independence', 'family_planning');
    } else {
      factors.push('traditional_values', 'family_responsibilities', 'career_stability', 'health_awareness');
    }
    
    return factors;
  }

  private identifyCulturalSensitivities(userContext: UserContext): string[] {
    const sensitivities = ['family_honor', 'academic_achievement', 'marriage_expectations', 'career_success'];
    
    // Add age-specific sensitivities
    const age = userContext.demographics.age || 25;
    if (age < 25) {
      sensitivities.push('peer_pressure', 'identity_formation');
    } else {
      sensitivities.push('social_status', 'financial_security');
    }
    
    return sensitivities;
  }

  private inferReligiousBackground(_userContext: UserContext, conversationHistory: any[]): string | undefined {
    // Look for religious indicators in conversation
    const religiousTerms = {
      'hindu': ['bhagwan', 'temple', 'puja', 'dharma', 'karma'],
      'muslim': ['allah', 'mosque', 'namaz', 'ramadan', 'inshallah'],
      'christian': ['jesus', 'church', 'prayer', 'christmas', 'god'],
      'sikh': ['waheguru', 'gurdwara', 'guru', 'langar'],
      'buddhist': ['buddha', 'meditation', 'dharma', 'sangha'],
      'jain': ['ahimsa', 'jain', 'tirthankara']
    };
    
    for (const [religion, terms] of Object.entries(religiousTerms)) {
      const hasReligiousTerms = conversationHistory.some(msg =>
        terms.some(term => msg.content.toLowerCase().includes(term))
      );
      
      if (hasReligiousTerms) return religion;
    }
    
    return undefined;
  }

  private addHindiElements(content: string): string {
    const hindiTranslations = {
      'Hello': 'Namaste',
      'How are you': 'Aap kaise hain',
      'Thank you': 'Dhanyawad',
      'Good': 'Accha',
      'Yes': 'Haan',
      'No': 'Nahi',
      'Family': 'Parivaar',
      'Mother': 'Mata-ji',
      'Father': 'Papa-ji',
      'Brother': 'Bhai',
      'Sister': 'Didi',
      'Stress': 'Tension',
      'Worry': 'Chinta',
      'Happy': 'Khush',
      'Sad': 'Udaas'
    };

    let adaptedContent = content;
    Object.entries(hindiTranslations).forEach(([english, hindi]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, `${english} (${hindi})`);
    });

    return adaptedContent;
  }

  private adaptForJointFamily(content: string): string {
    return content
      .replace(/\byour decision\b/g, 'your family\'s decision')
      .replace(/\byou should\b/g, 'you and your family might consider')
      .replace(/\byour choice\b/g, 'your family\'s choice')
      .replace(/\bindividual needs\b/g, 'needs that balance individual and family wellbeing');
  }

  private getRegionalAdaptation(content: string, culture: CulturalContext['primaryCulture']): { content: string; reasoning: string } | null {
    const adaptations = this.regionalAdaptations.get(culture);
    if (!adaptations) return null;

    let adaptedContent = content;
    let hasAdaptation = false;

    // Add regional food references if discussing comfort or stress relief
    if (content.toLowerCase().includes('comfort') || content.toLowerCase().includes('stress relief')) {
      const foodRef = adaptations.foodReferences[0];
      adaptedContent = content.replace(/comfort food/gi, `comfort food like ${foodRef}`);
      hasAdaptation = true;
    }

    // Add festival references if discussing celebration or joy
    if (content.toLowerCase().includes('celebrate') || content.toLowerCase().includes('joy')) {
      const festivalRef = adaptations.festivalReferences[0];
      adaptedContent = content.replace(/celebration/gi, `celebration like ${festivalRef}`);
      hasAdaptation = true;
    }

    return hasAdaptation ? {
      content: adaptedContent,
      reasoning: `Added ${culture} regional references`
    } : null;
  }

  private adaptForReligiousContext(content: string, religiousBackground: string): string | null {
    const religiousAdaptations = {
      'hindu': {
        'strength': 'inner strength (shakti)',
        'peace': 'peace (shanti)',
        'wisdom': 'wisdom (gyan)',
        'meditation': 'meditation (dhyana)'
      },
      'muslim': {
        'peace': 'peace (salaam)',
        'strength': 'strength (quwwat)',
        'patience': 'patience (sabr)',
        'hope': 'hope (umeed)'
      },
      'christian': {
        'peace': 'peace (shalom)',
        'strength': 'strength through faith',
        'hope': 'hope in God',
        'love': 'divine love'
      }
    };

    const adaptations = religiousAdaptations[religiousBackground as keyof typeof religiousAdaptations];
    if (!adaptations) return null;

    let adaptedContent = content;
    Object.entries(adaptations).forEach(([english, religious]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      adaptedContent = adaptedContent.replace(regex, religious);
    });

    return adaptedContent !== content ? adaptedContent : null;
  }

  private calculateAdaptationConfidence(culturalContext: CulturalContext): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available cultural information
    if (culturalContext.primaryCulture !== 'mixed') confidence += 0.2;
    if (culturalContext.languagePreference !== 'mixed') confidence += 0.1;
    if (culturalContext.religiousBackground) confidence += 0.1;
    if (culturalContext.generationalFactors.length > 0) confidence += 0.1;

    return Math.min(1, confidence);
  }
}

// Export singleton instance
export const culturalIntelligence = new CulturalIntelligenceService();