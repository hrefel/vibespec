/**
 * Markdown formatter
 * Converts RequirementSpec to structured Markdown with YAML frontmatter
 * Optimized for AI code generation readability
 */

import yaml from 'js-yaml';
import {
  RequirementSpec,
  Constraint,
  AcceptanceCriterion,
  RequirementExample,
  APIContract,
  EntityDefinition,
  ValidationRule,
} from '../types/requirement-spec';

export class MarkdownFormatter {
  /**
   * Format RequirementSpec as structured Markdown
   */
  format(spec: RequirementSpec): string {
    const sections: string[] = [];

    // 1. YAML Frontmatter
    sections.push(this.formatFrontmatter(spec));

    // 2. Context
    sections.push(this.formatContext(spec));

    // 3. Scope (if applicable)
    if (spec.scope) {
      sections.push(this.formatScope(spec));
    }

    // 4. User Stories (for features)
    if (spec.user_stories && spec.user_stories.length > 0) {
      sections.push(this.formatUserStories(spec));
    }

    // 5. Entities (if applicable)
    if (spec.entities && spec.entities.length > 0) {
      sections.push(this.formatEntities(spec.entities));
    }

    // 6. Business Constraints
    sections.push(this.formatConstraints('Business', spec.business_constraints));

    // 7. Technical Constraints
    sections.push(
      this.formatConstraints('Technical', spec.technical_constraints)
    );

    // 8. Acceptance Criteria
    if (spec.acceptance_criteria && spec.acceptance_criteria.length > 0) {
      sections.push(this.formatAcceptanceCriteria(spec.acceptance_criteria));
    }

    // 9. Examples
    if (spec.examples && spec.examples.length > 0) {
      sections.push(this.formatExamples(spec.examples));
    }

    // 10. API Contract (if applicable)
    if (spec.api_contract) {
      sections.push(this.formatAPIContract(spec.api_contract));
    }

    // 11. Validation Rules (if applicable)
    if (spec.validation_rules && spec.validation_rules.length > 0) {
      sections.push(this.formatValidationRules(spec.validation_rules));
    }

    // 12. Non-Functional Requirements (if applicable)
    if (spec.non_functional) {
      sections.push(this.formatNonFunctional(spec));
    }

    // 13. Bug Details (if applicable)
    if (spec.bug_details) {
      sections.push(this.formatBugDetails(spec));
    }

    // 14. Refactoring Details (if applicable)
    if (spec.refactoring_details) {
      sections.push(this.formatRefactoringDetails(spec));
    }

    // 15. AI Guidance
    if (spec.ai_guidance) {
      sections.push(this.formatAIGuidance(spec.ai_guidance));
    }

    return sections.join('\n\n');
  }

  /**
   * Format YAML frontmatter
   */
  private formatFrontmatter(spec: RequirementSpec): string {
    const frontmatter = {
      id: spec.id,
      type: spec.type,
      title: spec.title,
      domain: spec.domain,
      priority: spec.priority,
      tags: spec.tags,
      metadata: spec.metadata,
    };

    const yamlStr = yaml.dump(frontmatter, {
      indent: 2,
      lineWidth: 80,
      noRefs: true,
    });

    return `---\n${yamlStr}---`;
  }

  /**
   * Format context section
   */
  private formatContext(spec: RequirementSpec): string {
    let md = '## Context\n\n';
    md += `**Problem:** ${spec.context.problem}\n\n`;

    if (spec.context.background) {
      md += `**Background:** ${spec.context.background}\n\n`;
    }

    if (spec.context.assumptions && spec.context.assumptions.length > 0) {
      md += '**Assumptions:**\n';
      spec.context.assumptions.forEach((assumption) => {
        md += `- ${assumption}\n`;
      });
    }

    return md.trim();
  }

  /**
   * Format scope section
   */
  private formatScope(spec: RequirementSpec): string {
    if (!spec.scope) return '';

    let md = '## Scope\n\n';

    if (spec.scope.in_scope.length > 0) {
      md += '### In Scope\n';
      spec.scope.in_scope.forEach((item) => {
        md += `- ${item}\n`;
      });
      md += '\n';
    }

    if (spec.scope.out_of_scope.length > 0) {
      md += '### Out of Scope\n';
      spec.scope.out_of_scope.forEach((item) => {
        md += `- ${item}\n`;
      });
      md += '\n';
    }

    if (spec.scope.dependencies && spec.scope.dependencies.length > 0) {
      md += '### Dependencies\n';
      spec.scope.dependencies.forEach((dep) => {
        md += `- ${dep}\n`;
      });
      md += '\n';
    }

    if (
      spec.scope.affected_components &&
      spec.scope.affected_components.length > 0
    ) {
      md += '### Affected Components\n';
      spec.scope.affected_components.forEach((comp) => {
        md += `- ${comp}\n`;
      });
    }

    return md.trim();
  }

  /**
   * Format user stories
   */
  private formatUserStories(spec: RequirementSpec): string {
    if (!spec.user_stories || spec.user_stories.length === 0) return '';

    let md = '## User Stories\n\n';

    spec.user_stories.forEach((story, idx) => {
      md += `### Story ${idx + 1}\n`;
      md += `**As a** ${story.actor}  \n`;
      md += `**I want to** ${story.action}  \n`;
      md += `**So that** ${story.outcome}\n\n`;
    });

    return md.trim();
  }

  /**
   * Format entities
   */
  private formatEntities(entities: EntityDefinition[]): string {
    let md = '## Entities\n\n';

    entities.forEach((entity) => {
      md += `### ${entity.name}\n\n`;

      if (entity.description) {
        md += `${entity.description}\n\n`;
      }

      md += '**Fields:**\n\n';
      md += '| Field | Type | Required | Unique | Default | Description |\n';
      md += '|-------|------|----------|--------|---------|-------------|\n';

      entity.fields.forEach((field) => {
        const required = field.required ? '✓' : '';
        const unique = field.unique ? '✓' : '';
        const defaultVal = field.default !== undefined ? `\`${field.default}\`` : '';
        const desc = field.description || '';
        md += `| \`${field.name}\` | ${field.type} | ${required} | ${unique} | ${defaultVal} | ${desc} |\n`;
      });

      md += '\n';

      // Relationships
      if (entity.relationships && entity.relationships.length > 0) {
        md += '**Relationships:**\n';
        entity.relationships.forEach((rel) => {
          md += `- ${rel.type} with \`${rel.target_entity}\``;
          if (rel.description) {
            md += ` - ${rel.description}`;
          }
          md += '\n';
        });
        md += '\n';
      }

      // Indexes
      if (entity.indexes && entity.indexes.length > 0) {
        md += `**Indexes:** ${entity.indexes.map((i) => `\`${i}\``).join(', ')}\n\n`;
      }
    });

    return md.trim();
  }

  /**
   * Format constraints
   */
  private formatConstraints(
    type: 'Business' | 'Technical',
    constraints: Constraint[]
  ): string {
    let md = `## ${type} Constraints\n\n`;

    if (constraints.length === 0) {
      md += `*No ${type.toLowerCase()} constraints defined.*\n`;
      return md;
    }

    constraints.forEach((constraint) => {
      const severityEmoji =
        constraint.severity === 'mandatory'
          ? '🔴'
          : constraint.severity === 'recommended'
          ? '🟡'
          : '🟢';

      md += `### ${constraint.id} ${severityEmoji} [${constraint.severity.toUpperCase()}]\n\n`;
      md += `**Rule:** ${constraint.rule}\n\n`;

      if (constraint.rationale) {
        md += `**Rationale:** ${constraint.rationale}\n\n`;
      }

      if (constraint.examples && constraint.examples.length > 0) {
        md += '**Examples:**\n';
        constraint.examples.forEach((ex) => {
          md += `- ${ex}\n`;
        });
        md += '\n';
      }
    });

    return md.trim();
  }

  /**
   * Format acceptance criteria
   */
  private formatAcceptanceCriteria(criteria: AcceptanceCriterion[]): string {
    let md = '## Acceptance Criteria\n\n';

    criteria.forEach((criterion, idx) => {
      md += `### Criterion ${idx + 1}\n\n`;
      md += `- **Given:** ${criterion.given}\n`;
      md += `- **When:** ${criterion.when}\n`;
      md += `- **Then:** ${criterion.then}\n`;

      if (criterion.and && criterion.and.length > 0) {
        criterion.and.forEach((andClause) => {
          md += `- **And:** ${andClause}\n`;
        });
      }

      md += '\n';
    });

    return md.trim();
  }

  /**
   * Format examples
   */
  private formatExamples(examples: RequirementExample[]): string {
    let md = '## Examples\n\n';

    examples.forEach((example) => {
      const edgeCaseTag = example.edge_case ? ' [EDGE CASE]' : '';
      md += `### ${example.title}${edgeCaseTag}\n\n`;

      if (example.description) {
        md += `${example.description}\n\n`;
      }

      if (example.input !== undefined) {
        md += '**Input:**\n```json\n';
        md += JSON.stringify(example.input, null, 2);
        md += '\n```\n\n';
      }

      if (example.output !== undefined) {
        md += '**Output:**\n```json\n';
        md += JSON.stringify(example.output, null, 2);
        md += '\n```\n\n';
      }

      md += `**Expected Behavior:** ${example.expected_behavior}\n\n`;
    });

    return md.trim();
  }

  /**
   * Format API contract
   */
  private formatAPIContract(contract: APIContract): string {
    let md = '## API Contract\n\n';

    md += `**Method:** \`${contract.method}\`  \n`;
    md += `**Endpoint:** \`${contract.endpoint}\`  \n`;

    if (contract.authentication && contract.authentication !== 'none') {
      md += `**Authentication:** ${contract.authentication}\n`;
    }

    md += '\n';

    // Request
    if (contract.request) {
      md += '### Request\n\n';

      if (contract.request.headers) {
        md += '**Headers:**\n```json\n';
        md += JSON.stringify(contract.request.headers, null, 2);
        md += '\n```\n\n';
      }

      if (contract.request.query_params) {
        md += '**Query Parameters:**\n```json\n';
        md += JSON.stringify(contract.request.query_params, null, 2);
        md += '\n```\n\n';
      }

      if (contract.request.body) {
        md += '**Body:**\n```json\n';
        md += JSON.stringify(contract.request.body, null, 2);
        md += '\n```\n\n';
      }
    }

    // Responses
    md += '### Responses\n\n';

    contract.responses.forEach((response) => {
      md += `#### ${response.status} - ${response.description}\n\n`;

      if (response.body) {
        md += '```json\n';
        md += JSON.stringify(response.body, null, 2);
        md += '\n```\n\n';
      }
    });

    return md.trim();
  }

  /**
   * Format validation rules
   */
  private formatValidationRules(rules: ValidationRule[]): string {
    let md = '## Validation Rules\n\n';

    md += '| Field | Rules | Custom Message |\n';
    md += '|-------|-------|----------------|\n';

    rules.forEach((rule) => {
      const rulesStr = rule.rules.join(', ');
      const message = rule.custom_message || '';
      md += `| \`${rule.field}\` | ${rulesStr} | ${message} |\n`;
    });

    return md.trim();
  }

  /**
   * Format non-functional requirements
   */
  private formatNonFunctional(spec: RequirementSpec): string {
    if (!spec.non_functional) return '';

    let md = '## Non-Functional Requirements\n\n';

    if (spec.non_functional.performance) {
      md += `**Performance:** ${spec.non_functional.performance}\n\n`;
    }

    if (spec.non_functional.security) {
      md += `**Security:** ${spec.non_functional.security}\n\n`;
    }

    if (spec.non_functional.scalability) {
      md += `**Scalability:** ${spec.non_functional.scalability}\n\n`;
    }

    if (spec.non_functional.accessibility) {
      md += `**Accessibility:** ${spec.non_functional.accessibility}\n\n`;
    }

    if (spec.non_functional.error_handling) {
      md += `**Error Handling:** ${spec.non_functional.error_handling}\n\n`;
    }

    return md.trim();
  }

  /**
   * Format bug details
   */
  private formatBugDetails(spec: RequirementSpec): string {
    if (!spec.bug_details) return '';

    let md = '## Bug Details\n\n';

    md += `**Current Behavior:** ${spec.bug_details.current_behavior}\n\n`;
    md += `**Expected Behavior:** ${spec.bug_details.expected_behavior}\n\n`;

    if (spec.bug_details.root_cause) {
      md += `**Root Cause:** ${spec.bug_details.root_cause}\n\n`;
    }

    if (
      spec.bug_details.reproduction_steps &&
      spec.bug_details.reproduction_steps.length > 0
    ) {
      md += '**Reproduction Steps:**\n';
      spec.bug_details.reproduction_steps.forEach((step, idx) => {
        md += `${idx + 1}. ${step}\n`;
      });
      md += '\n';
    }

    return md.trim();
  }

  /**
   * Format refactoring details
   */
  private formatRefactoringDetails(spec: RequirementSpec): string {
    if (!spec.refactoring_details) return '';

    let md = '## Refactoring Details\n\n';

    md += `**Current State:** ${spec.refactoring_details.current_state}\n\n`;
    md += `**Desired State:** ${spec.refactoring_details.desired_state}\n\n`;

    if (
      spec.refactoring_details.breaking_changes &&
      spec.refactoring_details.breaking_changes.length > 0
    ) {
      md += '**Breaking Changes:**\n';
      spec.refactoring_details.breaking_changes.forEach((change) => {
        md += `- ${change}\n`;
      });
      md += '\n';
    }

    if (spec.refactoring_details.migration_path) {
      md += `**Migration Path:** ${spec.refactoring_details.migration_path}\n\n`;
    }

    return md.trim();
  }

  /**
   * Format AI guidance
   */
  private formatAIGuidance(guidance: string): string {
    return `## AI Guidance\n\n${guidance}`;
  }
}

/**
 * Singleton instance
 */
let markdownFormatterInstance: MarkdownFormatter | null = null;

export function getMarkdownFormatter(): MarkdownFormatter {
  if (!markdownFormatterInstance) {
    markdownFormatterInstance = new MarkdownFormatter();
  }
  return markdownFormatterInstance;
}
