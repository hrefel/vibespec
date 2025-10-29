/**
 * Spec validation module
 * Validates generated specs against schema and rules
 */

import { VibeSpec, ValidationResult, ValidationError, Domain } from '../types';

const VALID_DOMAINS: Domain[] = [
  'frontend',
  'backend',
  'fullstack',
  'mobile',
  'infrastructure',
  'testing',
  'devops',
  'data',
];

export class SpecValidator {
  /**
   * Validate a spec against schema and rules
   */
  validate(spec: any): ValidationResult {
    const errors: ValidationError[] = [];

    // Check required fields
    if (!spec.title) {
      errors.push({
        field: 'title',
        message: 'Title is required',
      });
    } else {
      // Validate title constraints
      if (typeof spec.title !== 'string') {
        errors.push({
          field: 'title',
          message: 'Title must be a string',
          value: spec.title,
        });
      } else {
        if (spec.title.length < 5) {
          errors.push({
            field: 'title',
            message: 'Title must be at least 5 characters',
            value: spec.title,
          });
        }
        if (spec.title.length > 100) {
          errors.push({
            field: 'title',
            message: 'Title must be at most 100 characters',
            value: spec.title,
          });
        }
        if (!/^[A-Z]/.test(spec.title)) {
          errors.push({
            field: 'title',
            message: 'Title should start with a capital letter',
            value: spec.title,
          });
        }
      }
    }

    // Check domain
    if (!spec.domain) {
      errors.push({
        field: 'domain',
        message: 'Domain is required',
      });
    } else if (!VALID_DOMAINS.includes(spec.domain)) {
      errors.push({
        field: 'domain',
        message: `Domain must be one of: ${VALID_DOMAINS.join(', ')}`,
        value: spec.domain,
      });
    }

    // Check description
    if (!spec.description) {
      errors.push({
        field: 'description',
        message: 'Description is required',
      });
    } else {
      if (typeof spec.description !== 'string') {
        errors.push({
          field: 'description',
          message: 'Description must be a string',
          value: spec.description,
        });
      } else {
        if (spec.description.length < 10) {
          errors.push({
            field: 'description',
            message: 'Description must be at least 10 characters',
            value: spec.description,
          });
        }
        if (spec.description.length > 500) {
          errors.push({
            field: 'description',
            message: 'Description must be at most 500 characters',
            value: spec.description,
          });
        }
      }
    }

    // Check requirements
    if (!spec.requirements) {
      errors.push({
        field: 'requirements',
        message: 'Requirements are required',
      });
    } else {
      if (!Array.isArray(spec.requirements)) {
        errors.push({
          field: 'requirements',
          message: 'Requirements must be an array',
          value: spec.requirements,
        });
      } else {
        if (spec.requirements.length === 0) {
          errors.push({
            field: 'requirements',
            message: 'At least one requirement is required',
            value: spec.requirements,
          });
        }
        if (spec.requirements.length > 50) {
          errors.push({
            field: 'requirements',
            message: 'Maximum 50 requirements allowed',
            value: spec.requirements,
          });
        }

        // Validate each requirement
        spec.requirements.forEach((req: any, index: number) => {
          if (typeof req !== 'string') {
            errors.push({
              field: `requirements[${index}]`,
              message: 'Each requirement must be a string',
              value: req,
            });
          } else if (req.length < 5) {
            errors.push({
              field: `requirements[${index}]`,
              message: 'Each requirement must be at least 5 characters',
              value: req,
            });
          }
        });
      }
    }

    // Validate optional fields if present
    if (spec.components !== undefined) {
      if (!Array.isArray(spec.components)) {
        errors.push({
          field: 'components',
          message: 'Components must be an array',
          value: spec.components,
        });
      }
    }

    if (spec.tech_stack !== undefined) {
      if (!Array.isArray(spec.tech_stack)) {
        errors.push({
          field: 'tech_stack',
          message: 'Tech stack must be an array',
          value: spec.tech_stack,
        });
      } else {
        // Validate tech stack items
        spec.tech_stack.forEach((tech: any, index: number) => {
          if (typeof tech !== 'string') {
            errors.push({
              field: `tech_stack[${index}]`,
              message: 'Each tech stack item must be a string',
              value: tech,
            });
          } else if (!/^[a-zA-Z0-9.-]+$/.test(tech)) {
            errors.push({
              field: `tech_stack[${index}]`,
              message: 'Tech stack items must contain only letters, numbers, dots, and hyphens',
              value: tech,
            });
          }
        });

        // Check for duplicates
        const uniqueTech = new Set(spec.tech_stack);
        if (uniqueTech.size !== spec.tech_stack.length) {
          errors.push({
            field: 'tech_stack',
            message: 'Tech stack contains duplicate items',
            value: spec.tech_stack,
          });
        }
      }
    }

    if (spec.acceptance_criteria !== undefined) {
      if (!Array.isArray(spec.acceptance_criteria)) {
        errors.push({
          field: 'acceptance_criteria',
          message: 'Acceptance criteria must be an array',
          value: spec.acceptance_criteria,
        });
      } else if (spec.acceptance_criteria.length > 20) {
        errors.push({
          field: 'acceptance_criteria',
          message: 'Maximum 20 acceptance criteria allowed',
          value: spec.acceptance_criteria,
        });
      }
    }

    if (spec.ai_guidance !== undefined && typeof spec.ai_guidance !== 'string') {
      errors.push({
        field: 'ai_guidance',
        message: 'AI guidance must be a string',
        value: spec.ai_guidance,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format validation errors for display
   */
  formatErrors(errors: ValidationError[]): string {
    if (errors.length === 0) {
      return 'No errors';
    }

    return errors
      .map((err) => {
        let msg = `✗ ${err.field}: ${err.message}`;
        if (err.value !== undefined) {
          msg += ` (got: ${JSON.stringify(err.value)})`;
        }
        return msg;
      })
      .join('\n');
  }
}
