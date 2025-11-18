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

export type OutputFormat = 'json' | 'yaml' | 'toon';

export type AIProvider = 'openai' | 'claude' | 'glm' | 'openrouter';

/**
 * Entity field definition for data models
 */
export interface EntityField {
  name: string;
  type: string; // string, number, boolean, date, datetime, uuid, enum, etc.
  required: boolean;
  unique?: boolean;
  default?: any;
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string; // Regex pattern for validation
  enum_values?: string[]; // For enum types
  description?: string;
}

/**
 * Entity relationship definition
 */
export interface EntityRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target_entity: string;
  foreign_key?: string;
  description?: string;
}

/**
 * Entity definition for database models
 */
export interface EntityDefinition {
  name: string;
  description?: string;
  fields: EntityField[];
  relationships?: EntityRelationship[];
  indexes?: string[];
}

/**
 * API Response definition
 */
export interface APIResponse {
  status: number;
  description: string;
  body?: any; // JSON schema or example
}

/**
 * API Contract definition
 */
export interface APIContract {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  authentication?: 'none' | 'bearer' | 'api-key' | 'session';
  description?: string;
  request?: {
    headers?: Record<string, any>;
    query_params?: Record<string, any>;
    path_params?: Record<string, any>;
    body?: any; // JSON schema or example
  };
  responses: APIResponse[];
  validation_rules?: {
    field: string;
    rules: string[];
    custom_message?: string;
  }[];
}

/**
 * Data mapping configuration
 */
export interface DataMapping {
  naming_convention?: {
    database?: string; // snake_case, camelCase, PascalCase
    api?: string;
    frontend?: string;
  };
  date_handling?: {
    database?: string;
    api_format?: string;
    frontend_display?: string;
  };
  transformations?: {
    entity: string;
    mappings: Record<string, string>;
  }[];
}

/**
 * Type definitions for frontend and backend
 */
export interface TypeDefinitions {
  frontend?: Record<string, string>; // TypeScript interfaces
  backend?: Record<string, any>; // Database schemas, DTOs, etc.
}

/**
 * Microservice definition for backend architecture
 */
export interface MicroserviceDefinition {
  name: string;
  domain: string;
  description: string;
  responsibilities: string[];
  database?: string;
  api_endpoints: string[];
  dependencies?: string[];
  communication?: 'REST' | 'gRPC' | 'GraphQL' | 'Message Queue' | 'Event-Driven';
  scalability?: 'horizontal' | 'vertical';
}

/**
 * Backend architecture pattern types
 */
export type ArchitecturePattern = 'microservices' | 'monolithic' | 'modular-monolith' | 'serverless';

/**
 * Backend architecture configuration
 */
export interface BackendArchitecture {
  pattern: ArchitecturePattern;
  services?: MicroserviceDefinition[];
  shared_infrastructure?: {
    api_gateway?: string;
    service_discovery?: string;
    message_broker?: string;
    distributed_tracing?: string;
    caching?: string;
    load_balancer?: string;
  };
  data_consistency?: {
    pattern: 'strong-consistency' | 'eventual-consistency';
    saga_orchestration?: boolean;
    event_sourcing?: boolean;
  };
}

/**
 * Architecture decision rationale
 */
export interface ArchitectureDecision {
  pattern: ArchitecturePattern;
  rationale: string[];
  trade_offs: {
    benefits: string[];
    challenges: string[];
  };
  decision_drivers?: {
    scalability_requirements?: string;
    team_structure?: string;
    domain_complexity?: string;
    deployment_frequency?: string;
  };
}

/**
 * Service deployment configuration
 */
export interface ServiceDeployment {
  name: string;
  replicas: number;
  resources: {
    cpu: string;
    memory: string;
  };
  health_check?: string;
  auto_scaling?: {
    min: number;
    max: number;
    target_cpu: string;
  };
}

/**
 * Deployment configuration
 */
export interface DeploymentConfig {
  container_orchestration?: string;
  services?: ServiceDeployment[];
  infrastructure?: {
    load_balancer?: string;
    service_mesh?: string;
    monitoring?: string;
    logging?: string;
  };
}

/**
 * Enhanced AI guidance structure
 */
export interface EnhancedAIGuidance {
  type_safety?: string;
  naming_conventions?: string;
  date_handling?: string;
  validation?: string;
  error_handling?: string;
  security?: string;
  performance?: string;
  testing?: string;
  [key: string]: string | undefined;
}

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
  ai_guidance?: string | EnhancedAIGuidance;
  metadata?: SpecMetadata;

  // Enhanced fields for fullstack specs
  entities?: EntityDefinition[];
  api_endpoints?: APIContract[];
  data_mapping?: DataMapping;
  type_definitions?: TypeDefinitions;

  // Backend architecture fields
  backend_architecture?: BackendArchitecture;
  architecture_decision?: ArchitectureDecision;
  deployment?: DeploymentConfig;
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
  architecture_decision?: ArchitectureDecision;
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
