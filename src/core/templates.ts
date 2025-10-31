/**
 * Pre-defined templates for different requirement types
 * Provides structure and guidance for AI code generation
 */

import {
  RequirementType,
  RequirementSpec,
  Constraint,
  AcceptanceCriterion,
  RequirementExample,
} from '../types/requirement-spec';
import { Domain } from '../types/spec';

/**
 * Template configuration for each requirement type
 */
export interface TemplateConfig {
  type: RequirementType;
  title: string;
  description: string;
  required_sections: string[];
  optional_sections: string[];
  example_business_constraints: string[];
  example_technical_constraints: string[];
  prompt_guidance: string;
}

/**
 * Template registry
 */
export const TEMPLATES: Record<RequirementType, TemplateConfig> = {
  'api-endpoint': {
    type: 'api-endpoint',
    title: 'API Endpoint Requirement',
    description: 'Specification for creating or modifying API endpoints',
    required_sections: [
      'context',
      'api_contract',
      'business_constraints',
      'technical_constraints',
      'validation_rules',
      'acceptance_criteria',
      'examples',
    ],
    optional_sections: ['entities', 'non_functional'],
    example_business_constraints: [
      'Only authenticated users can access this endpoint',
      'Response must include pagination for lists > 100 items',
      'Rate limit: 100 requests per minute per user',
    ],
    example_technical_constraints: [
      'Response time must be < 200ms for 95th percentile',
      'Endpoint must be idempotent (for POST/PUT)',
      'Must return proper HTTP status codes (200, 400, 401, 404, 500)',
    ],
    prompt_guidance:
      'Focus on endpoint path, HTTP method, authentication, request/response schemas, error handling, and validation rules.',
  },

  entity: {
    type: 'entity',
    title: 'Database Entity Requirement',
    description: 'Specification for database models and schemas',
    required_sections: [
      'context',
      'entities',
      'business_constraints',
      'technical_constraints',
      'validation_rules',
      'examples',
    ],
    optional_sections: ['api_contract', 'acceptance_criteria'],
    example_business_constraints: [
      'Email must be unique across all users',
      'Username cannot be changed after creation',
      'Soft delete required - no hard deletes',
    ],
    example_technical_constraints: [
      'Primary key must be UUID v4',
      'All timestamps stored in UTC',
      'Maximum varchar length: 255 characters',
      'Indexes required on frequently queried fields',
    ],
    prompt_guidance:
      'Define entity fields, data types, constraints (unique, required, default), relationships, and indexes.',
  },

  feature: {
    type: 'feature',
    title: 'Feature Requirement',
    description: 'Complete feature specification with user stories',
    required_sections: [
      'context',
      'scope',
      'user_stories',
      'business_constraints',
      'technical_constraints',
      'acceptance_criteria',
      'examples',
    ],
    optional_sections: [
      'entities',
      'api_contract',
      'validation_rules',
      'non_functional',
    ],
    example_business_constraints: [
      'Feature must be accessible to premium users only',
      'Data must be retained for 90 days',
      'Users must explicitly consent before data collection',
    ],
    example_technical_constraints: [
      'Must work offline with sync capability',
      'Responsive design for mobile, tablet, desktop',
      'Browser support: Chrome 90+, Firefox 88+, Safari 14+',
    ],
    prompt_guidance:
      'Describe user needs, workflows, business rules, and success criteria. Include user stories in actor/action/outcome format.',
  },

  'bug-fix': {
    type: 'bug-fix',
    title: 'Bug Fix Requirement',
    description: 'Specification for fixing bugs and issues',
    required_sections: [
      'context',
      'bug_details',
      'business_constraints',
      'technical_constraints',
      'acceptance_criteria',
      'examples',
    ],
    optional_sections: ['scope', 'validation_rules', 'api_contract'],
    example_business_constraints: [
      'Fix must not break existing functionality',
      'Must maintain backward compatibility',
      'Data integrity must be preserved',
    ],
    example_technical_constraints: [
      'No database schema changes allowed',
      'Must pass all existing tests',
      'Performance must not degrade',
      'Fix must be deployable independently',
    ],
    prompt_guidance:
      'Clearly describe current vs expected behavior, root cause, reproduction steps, and fix approach. Include regression test cases.',
  },

  refactoring: {
    type: 'refactoring',
    title: 'Refactoring Requirement',
    description: 'Specification for code refactoring and improvements',
    required_sections: [
      'context',
      'refactoring_details',
      'business_constraints',
      'technical_constraints',
      'acceptance_criteria',
    ],
    optional_sections: ['scope', 'examples', 'api_contract'],
    example_business_constraints: [
      'Must maintain exact same functionality',
      'No changes to public API surface',
      'Backward compatibility required',
    ],
    example_technical_constraints: [
      'Code coverage must not decrease',
      'Performance must improve or stay same',
      'No new dependencies without approval',
      'Must follow existing code style guide',
    ],
    prompt_guidance:
      'Explain why refactoring is needed, what will change, potential breaking changes, and migration strategy.',
  },
};

/**
 * Template generator class
 */
export class TemplateGenerator {
  /**
   * Generate a template spec based on requirement type
   */
  generateTemplate(
    type: RequirementType,
    domain: Domain,
    title: string
  ): Partial<RequirementSpec> {
    const template = TEMPLATES[type];

    const baseSpec: Partial<RequirementSpec> = {
      id: this.generateId(type),
      type,
      title,
      domain,
      priority: 'medium',
      tags: [type, domain],

      context: {
        problem: '[FILL: What problem does this solve?]',
        background: '[FILL: Additional context]',
        assumptions: ['[FILL: What assumptions are we making?]'],
      },

      business_constraints: [],
      technical_constraints: [],

      acceptance_criteria: [],
      examples: [],

      metadata: {
        spec_version: '1.0.0',
        generated_by: 'vibespec-cli',
        generated_at: new Date().toISOString(),
        constraints_complete: false,
        wizard_used: false,
      },
    };

    // Add type-specific sections
    switch (type) {
      case 'api-endpoint':
        return {
          ...baseSpec,
          api_contract: {
            method: 'GET',
            endpoint: '/api/[FILL]',
            authentication: 'bearer',
            request: {
              body: {},
            },
            responses: [
              {
                status: 200,
                description: 'Success',
                body: {},
              },
              {
                status: 400,
                description: 'Bad Request',
                body: { error: 'string' },
              },
            ],
          },
          validation_rules: [],
        };

      case 'entity':
        return {
          ...baseSpec,
          entities: [
            {
              name: '[FILL: EntityName]',
              description: '[FILL: Entity description]',
              fields: [
                {
                  name: 'id',
                  type: 'uuid',
                  required: true,
                  unique: true,
                  description: 'Primary key',
                },
                {
                  name: 'created_at',
                  type: 'datetime',
                  required: true,
                  description: 'Creation timestamp',
                },
                {
                  name: 'updated_at',
                  type: 'datetime',
                  required: true,
                  description: 'Last update timestamp',
                },
              ],
              relationships: [],
              indexes: ['id', 'created_at'],
            },
          ],
          validation_rules: [],
        };

      case 'feature':
        return {
          ...baseSpec,
          scope: {
            in_scope: ['[FILL: What will be implemented]'],
            out_of_scope: ['[FILL: What will NOT be implemented]'],
            dependencies: ['[FILL: External dependencies]'],
          },
          user_stories: [
            {
              actor: '[FILL: user role]',
              action: '[FILL: what they want to do]',
              outcome: '[FILL: desired result]',
            },
          ],
        };

      case 'bug-fix':
        return {
          ...baseSpec,
          bug_details: {
            current_behavior: '[FILL: What is happening now]',
            expected_behavior: '[FILL: What should happen]',
            root_cause: '[FILL: Why is this happening]',
            reproduction_steps: [
              '[FILL: Step 1]',
              '[FILL: Step 2]',
              '[FILL: Step 3 - Bug occurs]',
            ],
          },
        };

      case 'refactoring':
        return {
          ...baseSpec,
          refactoring_details: {
            current_state: '[FILL: How code works now]',
            desired_state: '[FILL: How code should work]',
            breaking_changes: ['[FILL: Any breaking changes?]'],
            migration_path: '[FILL: How to migrate existing code]',
          },
        };
    }

    return baseSpec;
  }

  /**
   * Get template configuration
   */
  getTemplate(type: RequirementType): TemplateConfig {
    return TEMPLATES[type];
  }

  /**
   * Generate unique ID for requirement
   */
  private generateId(type: RequirementType): string {
    const prefix = type.toUpperCase().replace(/-/g, '_');
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Get example constraints for a requirement type
   */
  getExampleConstraints(
    type: RequirementType
  ): {
    business: string[];
    technical: string[];
  } {
    const template = TEMPLATES[type];
    return {
      business: template.example_business_constraints,
      technical: template.example_technical_constraints,
    };
  }

  /**
   * Check if a section is required for a requirement type
   */
  isRequired(type: RequirementType, section: string): boolean {
    const template = TEMPLATES[type];
    return template.required_sections.includes(section);
  }

  /**
   * Get all requirement types
   */
  getAllTypes(): RequirementType[] {
    return Object.keys(TEMPLATES) as RequirementType[];
  }

  /**
   * Get type-specific prompt guidance
   */
  getPromptGuidance(type: RequirementType): string {
    return TEMPLATES[type].prompt_guidance;
  }
}

/**
 * Singleton instance
 */
let templateGeneratorInstance: TemplateGenerator | null = null;

export function getTemplateGenerator(): TemplateGenerator {
  if (!templateGeneratorInstance) {
    templateGeneratorInstance = new TemplateGenerator();
  }
  return templateGeneratorInstance;
}
