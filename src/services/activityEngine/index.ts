// Activity Engine - Core framework for therapeutic activity management
// Exports all components for the base activity service architecture

export * from './types';
export { BaseActivityService } from './BaseActivityService';
export { ActivitySessionManager, type SessionStorage } from './ActivitySessionManager';
export { ActivityFactory, type ActivityMetadata, type ActivityServiceConstructor } from './ActivityFactory';
export { ActivityRegistry, type ActivityFilter, type RecommendationCriteria } from './ActivityRegistry';
export { ActivityRecommendationEngine, type RecommendationRequest, type RecommendationResponse } from './ActivityRecommendationEngine';
export { AdaptationEngine, type AdaptationRule, type AdaptationContext, type AdaptationResult } from './AdaptationEngine';
export { DifficultyAdjustmentSystem, type DifficultyMetrics, type DifficultyAdjustment, type DifficultyParameters } from './DifficultyAdjustmentSystem';

// Re-export commonly used types for convenience
export type {
  ActivityType,
  ActivitySession,
  ActivityConfiguration,
  ActivityResult,
  UserContext,
  UserInput,
  ActivityResponse,
  ActivityAdaptation,
  AdaptationTrigger,
  EngagementMetrics,
  TherapeuticInsight,
  ActivityRecommendation
} from './types';