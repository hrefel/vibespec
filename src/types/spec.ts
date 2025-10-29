/**
 * Core type definitions for vibes-cli specs
 */

export type Domain =
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'infrastructure'
  | 'testing'
  | 'devops'
  | 'data';

export type OutputFormat = 'json' | 'yaml';

export type AIProvider = 'openai' | 'claude' | 'glm' | 'openrouter';

/**
 * The core spec structure that gets generated
 */
export interface VibeSpec {
  title: string;
  domain: Domain;
  description: string;
  requirements: string[];
  components?: string[];
  tech_stack?: string[];
  acceptance_criteria?: string[];
  ai_guidance?: string;
  metadata?: SpecMetadata;
}

/**
 * Metadata added to each generated spec
 */
export interface SpecMetadata {
  spec_version: string;
  generated_by: string;
  generated_at: string;
  input_hash: string;
  processing: ProcessingMetadata;
}

/**
 * Processing metadata for tracking how the spec was generated
 */
export interface ProcessingMetadata {
  provider: AIProvider;
  model: string;
  heuristic_confidence?: number;
  ai_refinement_applied: boolean;
  cache_hit: boolean;
  refinement_method?: 'ai' | 'wizard' | 'heuristic'; // Method used for refinement
}

/**
 * Heuristic parsing output (before AI refinement)
 */
export interface HeuristicOutput {
  title?: string;
  domain?: Domain;
  description?: string;
  requirements: string[];
  components: string[];
  tech_stack: string[];
  acceptance_criteria: string[];
  confidence: number;
}

/**
 * Validation result for specs
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}
