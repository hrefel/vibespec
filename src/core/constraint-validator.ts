/**
 * Constraint validator
 * Checks if requirements have sufficient constraints defined
 * Triggers wizard if constraints are missing or unclear
 */

import {
  RequirementSpec,
  RequirementType,
  ConstraintCheck,
  Constraint,
} from '../types/requirement-spec';
import { getTemplateGenerator } from './templates';

export class ConstraintValidator {
  private templateGenerator = getTemplateGenerator();

  /**
   * Check if requirement has complete constraints
   */
  checkConstraints(spec: Partial<RequirementSpec>): ConstraintCheck {
    const hasBusiness =
      spec.business_constraints && spec.business_constraints.length > 0;
    const hasTechnical =
      spec.technical_constraints && spec.technical_constraints.length > 0;

    const missing: ('business' | 'technical')[] = [];
    const suggestions: string[] = [];

    // Check business constraints
    if (!hasBusiness) {
      missing.push('business');
      suggestions.push(
        'Business constraints define domain rules and business logic requirements.'
      );
      suggestions.push(
        'Examples: authentication rules, data retention policies, user permissions.'
      );
    }

    // Check technical constraints
    if (!hasTechnical) {
      missing.push('technical');
      suggestions.push(
        'Technical constraints define system limitations and technology requirements.'
      );
      suggestions.push(
        'Examples: performance targets, browser compatibility, API rate limits.'
      );
    }

    // Additional checks for constraint quality
    if (hasBusiness) {
      const businessIssues = this.checkConstraintQuality(
        spec.business_constraints!,
        'business'
      );
      suggestions.push(...businessIssues);
    }

    if (hasTechnical) {
      const technicalIssues = this.checkConstraintQuality(
        spec.technical_constraints!,
        'technical'
      );
      suggestions.push(...technicalIssues);
    }

    return {
      has_business_constraints: !!hasBusiness,
      has_technical_constraints: !!hasTechnical,
      is_complete: !!(hasBusiness && hasTechnical),
      missing,
      suggestions,
    };
  }

  /**
   * Check quality of constraints
   */
  private checkConstraintQuality(
    constraints: Constraint[],
    constraintType: 'business' | 'technical'
  ): string[] {
    const issues: string[] = [];

    // Check if constraints are too vague
    const vagueKeywords = [
      'good',
      'better',
      'appropriate',
      'reasonable',
      'adequate',
    ];
    const vagueConstraints = constraints.filter((c) =>
      vagueKeywords.some((keyword) => c.rule.toLowerCase().includes(keyword))
    );

    if (vagueConstraints.length > 0) {
      issues.push(
        `Some ${constraintType} constraints are vague. Be specific with measurable criteria.`
      );
    }

    // Check if constraints have severity
    const missingSeverity = constraints.filter((c) => !c.severity);
    if (missingSeverity.length > 0) {
      issues.push(
        `${missingSeverity.length} ${constraintType} constraint(s) missing severity level.`
      );
    }

    // Check if mandatory constraints are properly marked
    const mandatoryKeywords = ['must', 'required', 'mandatory', 'shall'];
    const likelyMandatory = constraints.filter(
      (c) =>
        mandatoryKeywords.some((keyword) =>
          c.rule.toLowerCase().includes(keyword)
        ) && c.severity !== 'mandatory'
    );

    if (likelyMandatory.length > 0) {
      issues.push(
        `${likelyMandatory.length} ${constraintType} constraint(s) seem mandatory but not marked as such.`
      );
    }

    return issues;
  }

  /**
   * Check if requirement type needs specific constraints
   */
  needsConstraintWizard(
    spec: Partial<RequirementSpec>,
    rawInput: string
  ): boolean {
    const check = this.checkConstraints(spec);

    // Always need wizard if constraints are completely missing
    if (!check.is_complete) {
      return true;
    }

    // Check if raw input mentions constraints but they weren't extracted
    const hasConstraintMentions = this.detectConstraintMentions(rawInput);
    if (hasConstraintMentions && check.suggestions.length > 0) {
      return true;
    }

    // For certain requirement types, always validate constraints
    if (spec.type && ['api-endpoint', 'entity'].includes(spec.type)) {
      if (
        !spec.business_constraints ||
        spec.business_constraints.length < 2
      ) {
        return true;
      }
      if (
        !spec.technical_constraints ||
        spec.technical_constraints.length < 2
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Detect if raw input mentions constraints
   */
  private detectConstraintMentions(input: string): boolean {
    const constraintKeywords = [
      'must',
      'should',
      'required',
      'constraint',
      'rule',
      'limit',
      'maximum',
      'minimum',
      'only',
      'cannot',
      'forbidden',
      'allowed',
      'restricted',
    ];

    const lower = input.toLowerCase();
    return constraintKeywords.some((keyword) => lower.includes(keyword));
  }

  /**
   * Analyze raw input and suggest constraint categories
   */
  suggestConstraintCategories(
    rawInput: string,
    type: RequirementType
  ): {
    likely_business: string[];
    likely_technical: string[];
    ambiguous: string[];
  } {
    const sentences = this.extractSentences(rawInput);

    const businessPatterns = [
      /\b(?:user|customer|client|admin|role)\b/i,
      /\b(?:permission|access|authorize|authenticate)\b/i,
      /\b(?:policy|rule|regulation|compliance)\b/i,
      /\b(?:business|domain|workflow)\b/i,
      /\b(?:data retention|audit|privacy)\b/i,
    ];

    const technicalPatterns = [
      /\b(?:performance|latency|throughput|response time)\b/i,
      /\b(?:database|index|query|transaction)\b/i,
      /\b(?:api|endpoint|request|response|status code)\b/i,
      /\b(?:browser|device|platform|compatibility)\b/i,
      /\b(?:memory|cpu|storage|bandwidth)\b/i,
      /\b(?:cache|session|cookie|token)\b/i,
      /\b(?:format|encoding|charset|locale)\b/i,
    ];

    const likelyBusiness: string[] = [];
    const likelyTechnical: string[] = [];
    const ambiguous: string[] = [];

    for (const sentence of sentences) {
      const matchesBusiness = businessPatterns.some((pattern) =>
        pattern.test(sentence)
      );
      const matchesTechnical = technicalPatterns.some((pattern) =>
        pattern.test(sentence)
      );

      if (matchesBusiness && matchesTechnical) {
        ambiguous.push(sentence);
      } else if (matchesBusiness) {
        likelyBusiness.push(sentence);
      } else if (matchesTechnical) {
        likelyTechnical.push(sentence);
      }
    }

    return {
      likely_business: likelyBusiness,
      likely_technical: likelyTechnical,
      ambiguous,
    };
  }

  /**
   * Extract sentences from text
   */
  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }

  /**
   * Get constraint suggestions based on requirement type
   */
  getConstraintSuggestions(type: RequirementType): {
    business: string[];
    technical: string[];
  } {
    return this.templateGenerator.getExampleConstraints(type);
  }

  /**
   * Validate constraint format
   */
  validateConstraintFormat(constraint: Constraint): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!constraint.id || constraint.id.trim().length === 0) {
      errors.push('Constraint ID is required');
    }

    if (!constraint.rule || constraint.rule.trim().length < 10) {
      errors.push('Constraint rule must be at least 10 characters');
    }

    if (!constraint.severity) {
      errors.push('Constraint severity is required');
    }

    // Check if rule is too vague
    const vagueWords = [
      'good',
      'better',
      'nice',
      'appropriate',
      'reasonable',
    ];
    if (
      vagueWords.some((word) => constraint.rule.toLowerCase().includes(word))
    ) {
      errors.push(
        'Constraint rule is vague. Use specific, measurable criteria.'
      );
    }

    // Check if rule is actually a constraint (imperative)
    const imperativeWords = [
      'must',
      'should',
      'shall',
      'required',
      'cannot',
      'forbidden',
      'only',
      'always',
      'never',
    ];
    const hasImperative = imperativeWords.some((word) =>
      constraint.rule.toLowerCase().includes(word)
    );

    if (!hasImperative) {
      errors.push(
        'Constraint should use imperative language (must, should, cannot, etc.)'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate constraint ID
   */
  generateConstraintId(
    type: 'business' | 'technical',
    existingIds: string[]
  ): string {
    const prefix = type === 'business' ? 'BC' : 'TC';
    let counter = 1;
    let id = `${prefix}${counter.toString().padStart(3, '0')}`;

    while (existingIds.includes(id)) {
      counter++;
      id = `${prefix}${counter.toString().padStart(3, '0')}`;
    }

    return id;
  }
}

/**
 * Singleton instance
 */
let constraintValidatorInstance: ConstraintValidator | null = null;

export function getConstraintValidator(): ConstraintValidator {
  if (!constraintValidatorInstance) {
    constraintValidatorInstance = new ConstraintValidator();
  }
  return constraintValidatorInstance;
}
