/**
 * Enhanced requirement spec types for AI-driven code generation
 * Focuses on clean, robust, machine-readable requirements
 */

import { Domain } from './spec';

/**
 * Type of requirement determines template and validation rules
 */
export type RequirementType =
  | 'feature'
  | 'api-endpoint'
  | 'entity'
  | 'bug-fix'
  | 'refactoring';

/**
 * Constraint types for clear separation
 */
export type ConstraintType =
  | 'business'      // Domain/business logic rules
  | 'technical'     // System/technology limitations
  | 'security'      // Security requirements
  | 'performance'   // Performance requirements
  | 'data'          // Data integrity constraints
  | 'ui-ux'         // User interface constraints
  | 'regulatory';   // Legal/compliance requirements

export type ConstraintSeverity = 'mandatory' | 'recommended' | 'optional';

/**
 * Individual constraint definition
 */
export interface Constraint {
  id: string;                      // Unique identifier (e.g., C001, C002)
  type: ConstraintType;
  rule: string;                    // Clear statement of the constraint
  rationale?: string;              // Why this constraint exists
  severity: ConstraintSeverity;
  examples?: string[];             // Examples of compliance/violation
}

/**
 * Scope definition for requirements
 */
export interface RequirementScope {
  in_scope: string[];              // What WILL be implemented
  out_of_scope: string[];          // What will NOT be implemented
  dependencies?: string[];         // External dependencies
  affected_components?: string[];  // Existing components that will be modified
}

/**
 * Entity/data model definition
 */
export interface EntityDefinition {
  name: string;
  description?: string;
  fields: EntityField[];
  relationships?: EntityRelationship[];
  indexes?: string[];
}

export interface EntityField {
  name: string;
  type: string;                    // string, number, boolean, date, etc.
  required: boolean;
  unique?: boolean;
  default?: any;
  min_length?: number;
  max_length?: number;
  pattern?: string;                // Regex pattern for validation
  description?: string;
}

export interface EntityRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target_entity: string;
  foreign_key?: string;
  description?: string;
}

/**
 * Acceptance criteria in Given/When/Then format
 */
export interface AcceptanceCriterion {
  given: string;                   // Precondition
  when: string;                    // Action
  then: string;                    // Expected outcome
  and?: string[];                  // Additional outcomes
}

/**
 * Example with input, output, and expected behavior
 */
export interface RequirementExample {
  title: string;
  description?: string;
  input?: any;
  output?: any;
  expected_behavior: string;
  edge_case?: boolean;
}

/**
 * API contract specification
 */
export interface APIContract {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  authentication?: 'none' | 'bearer' | 'api-key' | 'session';
  request?: {
    headers?: Record<string, string>;
    query_params?: Record<string, string>;
    body?: any;
  };
  responses: APIResponse[];
}

export interface APIResponse {
  status: number;
  description: string;
  body?: any;
}

/**
 * Validation rule definition
 */
export interface ValidationRule {
  field: string;
  rules: string[];                 // e.g., ["required", "email", "min_length:8"]
  custom_message?: string;
}

/**
 * Non-functional requirements
 */
export interface NonFunctionalRequirements {
  performance?: string;            // Performance expectations
  security?: string;               // Security requirements
  scalability?: string;            // Scalability needs
  accessibility?: string;          // Accessibility standards
  error_handling?: string;         // Error handling strategy
}

/**
 * Complete requirement specification
 */
export interface RequirementSpec {
  // Metadata (YAML frontmatter)
  id: string;
  type: RequirementType;
  title: string;
  domain: Domain;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];

  // Core sections
  context: {
    problem: string;               // What problem does this solve?
    background?: string;           // Additional context
    assumptions?: string[];        // Assumptions being made
  };

  scope: RequirementScope;

  entities?: EntityDefinition[];   // Data models involved

  // Constraints (separated by type)
  business_constraints: Constraint[];
  technical_constraints: Constraint[];

  // Acceptance criteria
  acceptance_criteria: AcceptanceCriterion[];

  // Examples and test cases
  examples: RequirementExample[];

  // API specification (if applicable)
  api_contract?: APIContract;

  // Validation rules
  validation_rules?: ValidationRule[];

  // Non-functional requirements
  non_functional?: NonFunctionalRequirements;

  // AI guidance
  ai_guidance?: string;

  // User stories (for features)
  user_stories?: {
    actor: string;
    action: string;
    outcome: string;
  }[];

  // Bug fix specific fields
  bug_details?: {
    current_behavior: string;
    expected_behavior: string;
    root_cause?: string;
    reproduction_steps?: string[];
  };

  // Refactoring specific fields
  refactoring_details?: {
    current_state: string;
    desired_state: string;
    breaking_changes?: string[];
    migration_path?: string;
  };

  // Generation metadata
  metadata?: {
    spec_version: string;
    generated_by: string;
    generated_at: string;
    constraints_complete: boolean;  // Were constraints fully specified?
    wizard_used: boolean;           // Was constraint wizard used?
  };
}

/**
 * Constraint completeness check result
 */
export interface ConstraintCheck {
  has_business_constraints: boolean;
  has_technical_constraints: boolean;
  is_complete: boolean;
  missing: ('business' | 'technical')[];
  suggestions: string[];
}
