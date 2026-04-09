// Indian Cultural Therapy Modules
// Specialized therapeutic approaches for Indian family dynamics, academic pressure, and cultural conflicts
// Implements culturally-specific interventions and conflict resolution activities

import type { UserContext, ActivitySession } from './aiOrchestrator';
import type { CulturalProfile } from './culturalIntelligence';

// Interfaces for Indian Cultural Therapy
export interface CulturalTherapyModule {
  moduleId: string;
  name: string;
  description: string;
  targetConcerns: string[];
  culturalContext: string[];
  interventions: CulturalIntervention[];
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CulturalIntervention {
  interventionId: string;
  name: string;
  type: 'family_dynamics' | 'academic_pressure' | 'cultural_conflict' | 'generational_gap' | 'social_expectations';
  technique: string;
  culturalAdaptations: string[];
  steps: InterventionStep[];
  expectedOutcomes: string[];
}

export interface InterventionStep {
  stepId: string;
  instruction: string;
  culturalContext: string;
  userPrompt: string;
  expectedResponse: string[];
  adaptations: { [culture: string]: string };
}

export interface FamilyDynamicsAssessment {
  familyStructure: 'nuclear' | 'joint' | 'extended' | 'single_parent';
  hierarchyLevel: number; // 1-10 scale
  decisionMakingStyle: 'authoritarian' | 'democratic' | 'consultative' | 'collective';
  communicationPatterns: string[];
  conflictAreas: string[];
  strengths: string[];
  culturalValues: string[];
}

export interface AcademicPressureProfile {
  pressureLevel: number; // 1-10 scale
  sources: ('family' | 'self' | 'society' | 'peers')[];
  specificConcerns: string[];
  copingStrategies: string[];
  supportSystems: string[];
  culturalExpectations: string[];
}

export interface CulturalConflictAnalysis {
  conflictType: 'traditional_vs_modern' | 'individual_vs_collective' | 'generational' | 'gender_roles' | 'career_choices';
  intensity: number; // 1-10 scale
  stakeholders: string[];
  culturalValues: { traditional: string[]; modern: string[] };
  resolutionStrategies: string[];
}

export class IndianCulturalTherapyService {
  private therapyModules: Map<string, CulturalTherapyModule> = new Map();
  // Removed unused private properties

  constructor() {
    this.initializeFamilyDynamicsModules();
    this.initializeAcademicPressureModules();
    this.initializeCulturalConflictModules();
    this.initializeGenerationalGapModules();
    this.initializeSocialExpectationModules();
    console.log('🏛️ Indian Cultural Therapy Service initialized with specialized modules');
  }

  // Main method to select appropriate cultural therapy module
  async selectCulturalTherapyModule(
    userContext: UserContext,
    primaryConcerns: string[],
    culturalProfile: CulturalProfile
  ): Promise<CulturalTherapyModule[]> {
    console.log('🎯 Selecting cultural therapy modules for concerns:', primaryConcerns);

    const recommendedModules: CulturalTherapyModule[] = [];

    // Analyze concerns and match with appropriate modules
    for (const concern of primaryConcerns) {
      const modules = await this.getModulesForConcern(concern, culturalProfile);
      recommendedModules.push(...modules);
    }

    // Prioritize modules based on cultural relevance and user context
    const prioritizedModules = this.prioritizeModules(recommendedModules, userContext, culturalProfile);

    console.log('✅ Selected cultural therapy modules:', prioritizedModules.map(m => m.name));
    return prioritizedModules;
  }

  // Family dynamics therapy for Indian families
  async conductFamilyDynamicsTherapy(
    _userContext: UserContext,
    familyAssessment: FamilyDynamicsAssessment,
    sessionId: string
  ): Promise<ActivitySession> {
    console.log('👨‍👩‍👧‍👦 Conducting family dynamics therapy session');

    const module = this.therapyModules.get('family_dynamics_indian');
    if (!module) {
      throw new Error('Family dynamics module not found');
    }

    // Select appropriate intervention based on family structure
    const intervention = this.selectFamilyIntervention(familyAssessment);

    const session: ActivitySession = {
      sessionId,
      userId: _userContext.userId,
      activityType: 'family_integration',
      status: 'active',
      startTime: new Date(),
      currentStep: 0,
      totalSteps: intervention.steps.length,
      userEngagement: 0,
      adaptations: [],
      culturalContext: _userContext.culturalProfile,
      realTimeMetrics: {
        emotionalState: 'neutral',
        stressLevel: 5,
        responseTime: 0,
        comprehension: 0
      }
    };

    return session;
  }

  // Academic pressure management for Indian students
  async conductAcademicPressureTherapy(
    _userContext: UserContext,
    pressureProfile: AcademicPressureProfile,
    sessionId: string
  ): Promise<ActivitySession> {
    console.log('📚 Conducting academic pressure therapy session');

    const module = this.therapyModules.get('academic_pressure_indian');
    if (!module) {
      throw new Error('Academic pressure module not found');
    }

    // Select intervention based on pressure level and sources
    const intervention = this.selectAcademicIntervention(pressureProfile);

    const session: ActivitySession = {
      sessionId,
      userId: _userContext.userId,
      activityType: 'cultural_therapy',
      status: 'active',
      startTime: new Date(),
      currentStep: 0,
      totalSteps: intervention.steps.length,
      userEngagement: 0,
      adaptations: [],
      culturalContext: _userContext.culturalProfile,
      realTimeMetrics: {
        emotionalState: 'stressed',
        stressLevel: pressureProfile.pressureLevel,
        responseTime: 0,
        comprehension: 0
      }
    };

    return session;
  }

  // Cultural conflict resolution therapy
  async conductCulturalConflictResolution(
    userContext: UserContext,
    conflictAnalysis: CulturalConflictAnalysis,
    sessionId: string
  ): Promise<ActivitySession> {
    console.log('⚖️ Conducting cultural conflict resolution session');

    const module = this.therapyModules.get('cultural_conflict_resolution');
    if (!module) {
      throw new Error('Cultural conflict resolution module not found');
    }

    // Select resolution strategy based on conflict type
    const intervention = this.selectConflictResolutionIntervention(conflictAnalysis);

    const session: ActivitySession = {
      sessionId,
      userId: userContext.userId,
      activityType: 'cultural_therapy',
      status: 'active',
      startTime: new Date(),
      currentStep: 0,
      totalSteps: intervention.steps.length,
      userEngagement: 0,
      adaptations: [],
      culturalContext: userContext.culturalProfile,
      realTimeMetrics: {
        emotionalState: 'conflicted',
        stressLevel: conflictAnalysis.intensity,
        responseTime: 0,
        comprehension: 0
      }
    };

    return session;
  }

  // Assessment methods
  async assessFamilyDynamics(
    userContext: UserContext,
    conversationHistory: any[]
  ): Promise<FamilyDynamicsAssessment> {
    console.log('🔍 Assessing family dynamics');

    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    // Analyze family structure indicators
    const familyStructure = this.inferFamilyStructure(content, userContext);
    
    // Assess hierarchy level
    const hierarchyLevel = this.assessHierarchyLevel(content);
    
    // Identify decision-making style
    const decisionMakingStyle = this.identifyDecisionMakingStyle(content);
    
    // Analyze communication patterns
    const communicationPatterns = this.analyzeCommunicationPatterns(content);
    
    // Identify conflict areas
    const conflictAreas = this.identifyFamilyConflictAreas(content);
    
    // Identify family strengths
    const strengths = this.identifyFamilyStrengths(content);
    
    // Extract cultural values
    const culturalValues = this.extractFamilyCulturalValues(content);

    const assessment: FamilyDynamicsAssessment = {
      familyStructure,
      hierarchyLevel,
      decisionMakingStyle,
      communicationPatterns,
      conflictAreas,
      strengths,
      culturalValues
    };

    console.log('✅ Family dynamics assessment completed:', assessment);
    return assessment;
  }

  async assessAcademicPressure(
    userContext: UserContext,
    conversationHistory: any[]
  ): Promise<AcademicPressureProfile> {
    console.log('📊 Assessing academic pressure profile');

    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    // Assess pressure level
    const pressureLevel = this.calculatePressureLevel(content);
    
    // Identify pressure sources
    const sources = this.identifyPressureSources(content);
    
    // Extract specific concerns
    const specificConcerns = this.extractAcademicConcerns(content);
    
    // Identify coping strategies
    const copingStrategies = this.identifyAcademicCopingStrategies(content);
    
    // Assess support systems
    const supportSystems = this.identifySupportSystems(content);
    
    // Extract cultural expectations
    const culturalExpectations = this.extractCulturalExpectations(content);

    const profile: AcademicPressureProfile = {
      pressureLevel,
      sources,
      specificConcerns,
      copingStrategies,
      supportSystems,
      culturalExpectations
    };

    console.log('✅ Academic pressure assessment completed:', profile);
    return profile;
  }

  async analyzeCulturalConflict(
    userContext: UserContext,
    conversationHistory: any[]
  ): Promise<CulturalConflictAnalysis> {
    console.log('⚡ Analyzing cultural conflict');

    const content = conversationHistory.map(msg => msg.content).join(' ').toLowerCase();

    // Identify conflict type
    const conflictType = this.identifyConflictType(content);
    
    // Assess conflict intensity
    const intensity = this.assessConflictIntensity(content);
    
    // Identify stakeholders
    const stakeholders = this.identifyConflictStakeholders(content);
    
    // Extract cultural values on both sides
    const culturalValues = this.extractConflictingValues(content);
    
    // Suggest resolution strategies
    const resolutionStrategies = this.suggestResolutionStrategies(conflictType, intensity);

    const analysis: CulturalConflictAnalysis = {
      conflictType,
      intensity,
      stakeholders,
      culturalValues,
      resolutionStrategies
    };

    console.log('✅ Cultural conflict analysis completed:', analysis);
    return analysis;
  }

  // Initialize therapy modules
  private initializeFamilyDynamicsModules(): void {
    // Joint Family Dynamics Module
    const jointFamilyModule: CulturalTherapyModule = {
      moduleId: 'family_dynamics_joint',
      name: 'Joint Family Harmony Therapy',
      description: 'Therapeutic interventions for managing relationships and conflicts in joint family structures',
      targetConcerns: ['family_conflict', 'boundary_issues', 'privacy_concerns', 'role_confusion'],
      culturalContext: ['joint_family', 'hierarchical', 'collective_decision_making'],
      interventions: [
        {
          interventionId: 'joint_family_communication',
          name: 'Family Communication Enhancement',
          type: 'family_dynamics',
          technique: 'structured_family_dialogue',
          culturalAdaptations: ['respect_hierarchy', 'elder_mediation', 'collective_consensus'],
          steps: [
            {
              stepId: 'step1',
              instruction: 'Identify family communication patterns',
              culturalContext: 'Respect for elders and family hierarchy',
              userPrompt: 'Tell me about how decisions are made in your family. Who usually has the final say?',
              expectedResponse: ['elder_authority', 'collective_discussion', 'hierarchical_structure'],
              adaptations: {
                'north_indian': 'Consider the role of family patriarch/matriarch',
                'south_indian': 'Include extended family consultation patterns'
              }
            },
            {
              stepId: 'step2',
              instruction: 'Practice respectful assertiveness within family structure',
              culturalContext: 'Balancing individual needs with family harmony',
              userPrompt: 'How can you express your needs while maintaining respect for family values?',
              expectedResponse: ['respectful_communication', 'timing_consideration', 'elder_consultation'],
              adaptations: {
                'traditional': 'Emphasize gradual approach and patience',
                'modern': 'Focus on finding middle ground between values'
              }
            }
          ],
          expectedOutcomes: ['improved_family_communication', 'reduced_conflict', 'better_boundary_management']
        }
      ],
      duration: 45,
      difficulty: 'intermediate'
    };

    this.therapyModules.set('family_dynamics_indian', jointFamilyModule);
  }

  private initializeAcademicPressureModules(): void {
    // Academic Pressure Management Module
    const academicPressureModule: CulturalTherapyModule = {
      moduleId: 'academic_pressure_indian',
      name: 'Academic Excellence Balance Therapy',
      description: 'Managing academic pressure while honoring family expectations and cultural values',
      targetConcerns: ['exam_anxiety', 'family_expectations', 'career_pressure', 'perfectionism'],
      culturalContext: ['academic_achievement', 'family_honor', 'social_status'],
      interventions: [
        {
          interventionId: 'academic_pressure_management',
          name: 'Balanced Achievement Approach',
          type: 'academic_pressure',
          technique: 'cognitive_restructuring_with_cultural_values',
          culturalAdaptations: ['honor_family_values', 'realistic_expectations', 'cultural_success_redefinition'],
          steps: [
            {
              stepId: 'step1',
              instruction: 'Explore family academic expectations',
              culturalContext: 'Understanding family investment in education',
              userPrompt: 'What are your family\'s hopes and dreams for your education? How do you feel about these expectations?',
              expectedResponse: ['family_pride', 'pressure_acknowledgment', 'personal_goals'],
              adaptations: {
                'high_pressure': 'Validate family love behind expectations',
                'moderate_pressure': 'Explore balance between family and personal goals'
              }
            },
            {
              stepId: 'step2',
              instruction: 'Develop culturally-sensitive coping strategies',
              culturalContext: 'Honoring family while managing stress',
              userPrompt: 'How can you work towards academic success while taking care of your mental health?',
              expectedResponse: ['balanced_approach', 'stress_management', 'family_communication'],
              adaptations: {
                'traditional_family': 'Emphasize gradual family education about mental health',
                'modern_family': 'Focus on open communication about pressure'
              }
            }
          ],
          expectedOutcomes: ['reduced_academic_anxiety', 'improved_family_communication', 'balanced_achievement_mindset']
        }
      ],
      duration: 50,
      difficulty: 'intermediate'
    };

    this.therapyModules.set('academic_pressure_indian', academicPressureModule);
  }

  private initializeCulturalConflictModules(): void {
    // Cultural Conflict Resolution Module
    const culturalConflictModule: CulturalTherapyModule = {
      moduleId: 'cultural_conflict_resolution',
      name: 'Cultural Bridge Building Therapy',
      description: 'Resolving conflicts between traditional values and modern aspirations',
      targetConcerns: ['generational_gap', 'value_conflicts', 'identity_confusion', 'cultural_guilt'],
      culturalContext: ['traditional_vs_modern', 'individual_vs_collective', 'cultural_identity'],
      interventions: [
        {
          interventionId: 'value_integration',
          name: 'Cultural Value Integration',
          type: 'cultural_conflict',
          technique: 'dialectical_thinking_with_cultural_wisdom',
          culturalAdaptations: ['honor_both_perspectives', 'find_middle_path', 'cultural_synthesis'],
          steps: [
            {
              stepId: 'step1',
              instruction: 'Identify conflicting values',
              culturalContext: 'Understanding both traditional and modern perspectives',
              userPrompt: 'What traditional values are important to your family? What modern values are important to you?',
              expectedResponse: ['traditional_values', 'modern_aspirations', 'conflict_areas'],
              adaptations: {
                'high_conflict': 'Validate both sets of values as having merit',
                'moderate_conflict': 'Explore areas of natural overlap'
              }
            },
            {
              stepId: 'step2',
              instruction: 'Find integration opportunities',
              culturalContext: 'Creating harmony between different value systems',
              userPrompt: 'How might you honor your family\'s values while also pursuing your personal goals?',
              expectedResponse: ['integration_strategies', 'compromise_solutions', 'creative_approaches'],
              adaptations: {
                'family_oriented': 'Emphasize how personal growth can benefit family',
                'individual_oriented': 'Show how family values can support personal success'
              }
            }
          ],
          expectedOutcomes: ['reduced_cultural_guilt', 'integrated_identity', 'improved_family_relationships']
        }
      ],
      duration: 60,
      difficulty: 'advanced'
    };

    this.therapyModules.set('cultural_conflict_resolution', culturalConflictModule);
  }

  private initializeGenerationalGapModules(): void {
    // Generational Gap Bridging Module
    const generationalGapModule: CulturalTherapyModule = {
      moduleId: 'generational_gap_bridging',
      name: 'Generational Understanding Therapy',
      description: 'Building bridges between different generational perspectives and values',
      targetConcerns: ['communication_gap', 'misunderstanding', 'technology_divide', 'lifestyle_conflicts'],
      culturalContext: ['intergenerational_respect', 'cultural_continuity', 'adaptive_change'],
      interventions: [
        {
          interventionId: 'generational_dialogue',
          name: 'Cross-Generational Communication',
          type: 'generational_gap',
          technique: 'perspective_taking_with_cultural_respect',
          culturalAdaptations: ['elder_wisdom_acknowledgment', 'youth_perspective_validation', 'mutual_learning'],
          steps: [
            {
              stepId: 'step1',
              instruction: 'Understand generational perspectives',
              culturalContext: 'Appreciating different life experiences and contexts',
              userPrompt: 'What challenges did your parents/elders face that might be different from yours?',
              expectedResponse: ['historical_context', 'different_opportunities', 'shared_values'],
              adaptations: {
                'traditional_elders': 'Emphasize respect for their sacrifices and wisdom',
                'modern_elders': 'Focus on shared goals despite different approaches'
              }
            }
          ],
          expectedOutcomes: ['improved_intergenerational_understanding', 'reduced_family_tension', 'mutual_respect']
        }
      ],
      duration: 40,
      difficulty: 'intermediate'
    };

    this.therapyModules.set('generational_gap_bridging', generationalGapModule);
  }

  private initializeSocialExpectationModules(): void {
    // Social Expectations Management Module
    const socialExpectationsModule: CulturalTherapyModule = {
      moduleId: 'social_expectations_management',
      name: 'Social Pressure Navigation Therapy',
      description: 'Managing societal expectations while maintaining authentic self-expression',
      targetConcerns: ['social_pressure', 'reputation_anxiety', 'conformity_stress', 'authenticity_struggles'],
      culturalContext: ['social_honor', 'community_expectations', 'individual_authenticity'],
      interventions: [
        {
          interventionId: 'social_pressure_navigation',
          name: 'Authentic Social Navigation',
          type: 'social_expectations',
          technique: 'values_clarification_with_social_awareness',
          culturalAdaptations: ['community_respect', 'gradual_change', 'strategic_authenticity'],
          steps: [
            {
              stepId: 'step1',
              instruction: 'Identify core personal values',
              culturalContext: 'Understanding what truly matters to you within cultural context',
              userPrompt: 'What values are most important to you personally? How do these align with your community\'s values?',
              expectedResponse: ['personal_values', 'cultural_values', 'alignment_areas', 'conflict_areas'],
              adaptations: {
                'high_social_pressure': 'Validate the difficulty of maintaining authenticity',
                'moderate_social_pressure': 'Explore gradual authentic expression'
              }
            }
          ],
          expectedOutcomes: ['clearer_personal_identity', 'reduced_social_anxiety', 'authentic_self_expression']
        }
      ],
      duration: 45,
      difficulty: 'intermediate'
    };

    this.therapyModules.set('social_expectations_management', socialExpectationsModule);
  }

  // Helper methods for module selection and assessment
  private async getModulesForConcern(concern: string, culturalProfile: CulturalProfile): Promise<CulturalTherapyModule[]> {
    const relevantModules: CulturalTherapyModule[] = [];

    this.therapyModules.forEach(module => {
      if (module.targetConcerns.includes(concern)) {
        // Check cultural context compatibility
        const culturalMatch = module.culturalContext.some(context => 
          this.isCulturalContextRelevant(context, culturalProfile)
        );
        
        if (culturalMatch) {
          relevantModules.push(module);
        }
      }
    });

    return relevantModules;
  }

  private prioritizeModules(
    modules: CulturalTherapyModule[],
    userContext: UserContext,
    culturalProfile: CulturalProfile
  ): CulturalTherapyModule[] {
    return modules.sort((a, b) => {
      // Prioritize based on cultural relevance and user context
      const aRelevance = this.calculateModuleRelevance(a, userContext, culturalProfile);
      const bRelevance = this.calculateModuleRelevance(b, userContext, culturalProfile);
      return bRelevance - aRelevance;
    }).slice(0, 3); // Return top 3 modules
  }

  private calculateModuleRelevance(
    module: CulturalTherapyModule,
    userContext: UserContext,
    culturalProfile: CulturalProfile
  ): number {
    let relevance = 0;

    // Cultural context match
    module.culturalContext.forEach(context => {
      if (this.isCulturalContextRelevant(context, culturalProfile)) {
        relevance += 2;
      }
    });

    // Concern match
    module.targetConcerns.forEach(concern => {
      if (userContext.mentalHealthHistory.primaryConcerns.includes(concern)) {
        relevance += 3;
      }
    });

    // Difficulty appropriateness
    const userExperience = userContext.mentalHealthHistory.previousSessions;
    if (module.difficulty === 'beginner' && userExperience < 3) relevance += 1;
    if (module.difficulty === 'intermediate' && userExperience >= 3 && userExperience < 10) relevance += 1;
    if (module.difficulty === 'advanced' && userExperience >= 10) relevance += 1;

    return relevance;
  }

  private isCulturalContextRelevant(context: string, culturalProfile: CulturalProfile): boolean {
    switch (context) {
      case 'joint_family':
        return culturalProfile.familyStructure === 'joint' || culturalProfile.familyStructure === 'extended';
      case 'hierarchical':
        return culturalProfile.communicationStyle.hierarchyRespect > 6;
      case 'academic_achievement':
        return culturalProfile.educationalBackground.pressureLevel > 5;
      case 'traditional_vs_modern':
        // Note: generationalFactors not available in current CulturalProfile interface
        return true; // Default to true for traditional vs modern conflicts
      default:
        return true;
    }
  }

  // Assessment helper methods
  private inferFamilyStructure(content: string, _userContext: UserContext): FamilyDynamicsAssessment['familyStructure'] {
    if (content.includes('joint family') || content.includes('grandparents') || content.includes('uncles') || content.includes('aunts')) {
      return 'joint';
    }
    if (content.includes('extended family') || content.includes('relatives living')) {
      return 'extended';
    }
    if (content.includes('single parent') || content.includes('divorced') || content.includes('separated')) {
      return 'single_parent';
    }
    return 'nuclear';
  }

  private assessHierarchyLevel(content: string): number {
    const hierarchyIndicators = ['elder decision', 'father decides', 'mother decides', 'family head', 'respect elders'];
    const democraticIndicators = ['family discussion', 'everyone\'s opinion', 'we decide together'];
    
    const hierarchyCount = hierarchyIndicators.filter(indicator => content.includes(indicator)).length;
    const democraticCount = democraticIndicators.filter(indicator => content.includes(indicator)).length;
    
    return Math.max(1, Math.min(10, 5 + (hierarchyCount - democraticCount) * 2));
  }

  private identifyDecisionMakingStyle(content: string): FamilyDynamicsAssessment['decisionMakingStyle'] {
    if (content.includes('father decides') || content.includes('elder decides') || content.includes('no discussion')) {
      return 'authoritarian';
    }
    if (content.includes('family meeting') || content.includes('everyone decides') || content.includes('collective')) {
      return 'collective';
    }
    if (content.includes('discuss') || content.includes('ask opinion') || content.includes('consider views')) {
      return 'consultative';
    }
    return 'democratic';
  }

  private analyzeCommunicationPatterns(content: string): string[] {
    const patterns: string[] = [];
    
    if (content.includes('direct') || content.includes('straight talk')) patterns.push('direct_communication');
    if (content.includes('indirect') || content.includes('hints') || content.includes('subtle')) patterns.push('indirect_communication');
    if (content.includes('emotional') || content.includes('feelings')) patterns.push('emotional_expression');
    if (content.includes('formal') || content.includes('respectful')) patterns.push('formal_communication');
    if (content.includes('silent') || content.includes('don\'t talk')) patterns.push('avoidant_communication');
    
    return patterns;
  }

  private identifyFamilyConflictAreas(content: string): string[] {
    const conflicts: string[] = [];
    
    if (content.includes('career choice') || content.includes('job')) conflicts.push('career_decisions');
    if (content.includes('marriage') || content.includes('relationship')) conflicts.push('relationship_choices');
    if (content.includes('money') || content.includes('financial')) conflicts.push('financial_matters');
    if (content.includes('lifestyle') || content.includes('modern')) conflicts.push('lifestyle_differences');
    if (content.includes('religion') || content.includes('traditional')) conflicts.push('religious_practices');
    
    return conflicts;
  }

  private identifyFamilyStrengths(content: string): string[] {
    const strengths: string[] = [];
    
    if (content.includes('support') || content.includes('help')) strengths.push('emotional_support');
    if (content.includes('together') || content.includes('unity')) strengths.push('family_unity');
    if (content.includes('love') || content.includes('care')) strengths.push('love_and_care');
    if (content.includes('tradition') || content.includes('values')) strengths.push('cultural_values');
    if (content.includes('guidance') || content.includes('advice')) strengths.push('wisdom_sharing');
    
    return strengths;
  }

  private extractFamilyCulturalValues(content: string): string[] {
    const values: string[] = [];
    
    if (content.includes('respect') || content.includes('honor')) values.push('respect_for_elders');
    if (content.includes('education') || content.includes('study')) values.push('education_importance');
    if (content.includes('family first') || content.includes('family priority')) values.push('family_priority');
    if (content.includes('tradition') || content.includes('culture')) values.push('cultural_preservation');
    if (content.includes('hard work') || content.includes('dedication')) values.push('work_ethic');
    
    return values;
  }

  private calculatePressureLevel(content: string): number {
    const pressureIndicators = ['stress', 'pressure', 'anxiety', 'worried', 'scared', 'overwhelmed'];
    const intensityWords = ['very', 'extremely', 'too much', 'can\'t handle', 'breaking down'];
    
    let pressureScore = 0;
    pressureIndicators.forEach(indicator => {
      if (content.includes(indicator)) pressureScore += 1;
    });
    
    intensityWords.forEach(word => {
      if (content.includes(word)) pressureScore += 2;
    });
    
    return Math.min(10, Math.max(1, pressureScore));
  }

  private identifyPressureSources(content: string): ('family' | 'self' | 'society' | 'peers')[] {
    const sources: ('family' | 'self' | 'society' | 'peers')[] = [];
    
    if (content.includes('family') || content.includes('parents') || content.includes('relatives')) {
      sources.push('family');
    }
    if (content.includes('myself') || content.includes('I expect') || content.includes('perfectionist')) {
      sources.push('self');
    }
    if (content.includes('society') || content.includes('people say') || content.includes('reputation')) {
      sources.push('society');
    }
    if (content.includes('friends') || content.includes('classmates') || content.includes('competition')) {
      sources.push('peers');
    }
    
    return sources;
  }

  private extractAcademicConcerns(content: string): string[] {
    const concerns: string[] = [];
    
    if (content.includes('exam') || content.includes('test')) concerns.push('exam_anxiety');
    if (content.includes('marks') || content.includes('grades') || content.includes('score')) concerns.push('grade_pressure');
    if (content.includes('career') || content.includes('future')) concerns.push('career_uncertainty');
    if (content.includes('competition') || content.includes('rank')) concerns.push('competitive_pressure');
    if (content.includes('failure') || content.includes('disappoint')) concerns.push('failure_fear');
    
    return concerns;
  }

  private identifyAcademicCopingStrategies(content: string): string[] {
    const strategies: string[] = [];
    
    if (content.includes('study plan') || content.includes('schedule')) strategies.push('time_management');
    if (content.includes('break') || content.includes('rest')) strategies.push('taking_breaks');
    if (content.includes('friends') || content.includes('talk')) strategies.push('social_support');
    if (content.includes('exercise') || content.includes('sports')) strategies.push('physical_activity');
    if (content.includes('meditation') || content.includes('breathing')) strategies.push('mindfulness');
    
    return strategies;
  }

  private identifySupportSystems(content: string): string[] {
    const support: string[] = [];
    
    if (content.includes('family') || content.includes('parents')) support.push('family_support');
    if (content.includes('friends') || content.includes('classmates')) support.push('peer_support');
    if (content.includes('teacher') || content.includes('mentor')) support.push('academic_support');
    if (content.includes('counselor') || content.includes('therapist')) support.push('professional_support');
    
    return support;
  }

  private extractCulturalExpectations(content: string): string[] {
    const expectations: string[] = [];
    
    if (content.includes('engineer') || content.includes('doctor') || content.includes('iit')) {
      expectations.push('prestigious_career');
    }
    if (content.includes('top rank') || content.includes('first class') || content.includes('90%')) {
      expectations.push('academic_excellence');
    }
    if (content.includes('family honor') || content.includes('reputation')) {
      expectations.push('family_reputation');
    }
    if (content.includes('secure future') || content.includes('stable job')) {
      expectations.push('financial_security');
    }
    
    return expectations;
  }

  private identifyConflictType(content: string): CulturalConflictAnalysis['conflictType'] {
    if (content.includes('traditional') && content.includes('modern')) {
      return 'traditional_vs_modern';
    }
    if (content.includes('individual') && content.includes('family')) {
      return 'individual_vs_collective';
    }
    if (content.includes('generation') || content.includes('age gap')) {
      return 'generational';
    }
    if (content.includes('gender') || content.includes('boys') || content.includes('girls')) {
      return 'gender_roles';
    }
    if (content.includes('career') || content.includes('job choice')) {
      return 'career_choices';
    }
    
    return 'traditional_vs_modern'; // Default
  }

  private assessConflictIntensity(content: string): number {
    const intensityIndicators = ['fight', 'argue', 'angry', 'upset', 'frustrated', 'can\'t understand'];
    const severeIndicators = ['hate', 'never', 'always', 'completely', 'totally'];
    
    let intensity = 0;
    intensityIndicators.forEach(indicator => {
      if (content.includes(indicator)) intensity += 1;
    });
    
    severeIndicators.forEach(indicator => {
      if (content.includes(indicator)) intensity += 2;
    });
    
    return Math.min(10, Math.max(1, intensity));
  }

  private identifyConflictStakeholders(content: string): string[] {
    const stakeholders: string[] = [];
    
    if (content.includes('parents') || content.includes('mother') || content.includes('father')) {
      stakeholders.push('parents');
    }
    if (content.includes('grandparents') || content.includes('elders')) {
      stakeholders.push('elders');
    }
    if (content.includes('siblings') || content.includes('brother') || content.includes('sister')) {
      stakeholders.push('siblings');
    }
    if (content.includes('friends') || content.includes('peers')) {
      stakeholders.push('peers');
    }
    if (content.includes('society') || content.includes('community')) {
      stakeholders.push('community');
    }
    
    return stakeholders;
  }

  private extractConflictingValues(content: string): { traditional: string[]; modern: string[] } {
    const traditional: string[] = [];
    const modern: string[] = [];
    
    // Traditional values
    if (content.includes('respect elders')) traditional.push('elder_respect');
    if (content.includes('family first')) traditional.push('family_priority');
    if (content.includes('arranged marriage')) traditional.push('arranged_marriage');
    if (content.includes('traditional career')) traditional.push('traditional_careers');
    
    // Modern values
    if (content.includes('individual choice')) modern.push('individual_autonomy');
    if (content.includes('love marriage')) modern.push('love_marriage');
    if (content.includes('new career')) modern.push('modern_careers');
    if (content.includes('personal freedom')) modern.push('personal_freedom');
    
    return { traditional, modern };
  }

  private suggestResolutionStrategies(
    conflictType: CulturalConflictAnalysis['conflictType'],
    intensity: number
  ): string[] {
    const strategies: string[] = [];
    
    // Base strategies for all conflicts
    strategies.push('open_communication', 'mutual_respect', 'gradual_change');
    
    // Specific strategies based on conflict type
    switch (conflictType) {
      case 'traditional_vs_modern':
        strategies.push('value_integration', 'cultural_bridge_building', 'compromise_solutions');
        break;
      case 'individual_vs_collective':
        strategies.push('family_inclusive_decisions', 'individual_space_negotiation', 'collective_benefit_framing');
        break;
      case 'generational':
        strategies.push('intergenerational_dialogue', 'mutual_learning', 'respect_for_experience');
        break;
      case 'gender_roles':
        strategies.push('gender_equality_education', 'role_flexibility', 'progressive_examples');
        break;
      case 'career_choices':
        strategies.push('career_exploration_together', 'success_redefinition', 'practical_considerations');
        break;
    }
    
    // Intensity-based strategies
    if (intensity > 7) {
      strategies.push('professional_mediation', 'cooling_off_period', 'structured_dialogue');
    }
    
    return strategies;
  }

  // Intervention selection methods
  private selectFamilyIntervention(_assessment: FamilyDynamicsAssessment): CulturalIntervention {
    const module = this.therapyModules.get('family_dynamics_indian');
    if (!module || !module.interventions[0]) {
      throw new Error('Family intervention not found');
    }
    
    // Select intervention based on assessment
    return module.interventions[0]; // For now, return the first intervention
  }

  private selectAcademicIntervention(_profile: AcademicPressureProfile): CulturalIntervention {
    const module = this.therapyModules.get('academic_pressure_indian');
    if (!module || !module.interventions[0]) {
      throw new Error('Academic intervention not found');
    }
    
    return module.interventions[0];
  }

  private selectConflictResolutionIntervention(_analysis: CulturalConflictAnalysis): CulturalIntervention {
    const module = this.therapyModules.get('cultural_conflict_resolution');
    if (!module || !module.interventions[0]) {
      throw new Error('Conflict resolution intervention not found');
    }
    
    return module.interventions[0];
  }
}

// Export singleton instance
export const indianCulturalTherapy = new IndianCulturalTherapyService();