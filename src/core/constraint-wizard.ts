/**
 * Constraint wizard
 * Interactive wizard for collecting business and technical constraints
 * Ensures requirements are clear and complete for AI code generation
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import {
  RequirementSpec,
  Constraint,
  ConstraintType,
  ConstraintSeverity,
  RequirementType,
} from '../types/requirement-spec';
import { getConstraintValidator } from './constraint-validator';
import { getTemplateGenerator } from './templates';

export class ConstraintWizard {
  private validator = getConstraintValidator();
  private templateGenerator = getTemplateGenerator();

  /**
   * Run constraint wizard to collect missing constraints
   */
  async run(
    spec: Partial<RequirementSpec>,
    rawInput: string
  ): Promise<{
    business_constraints: Constraint[];
    technical_constraints: Constraint[];
  }> {
    console.log(chalk.cyan('\n🧙 Constraint Wizard'));
    console.log(
      chalk.gray(
        'Requirements need clear constraints for AI to generate correct code.\n'
      )
    );

    // Analyze what constraints might be present in raw input
    const suggestions = this.validator.suggestConstraintCategories(
      rawInput,
      spec.type || 'feature'
    );

    if (
      suggestions.likely_business.length > 0 ||
      suggestions.likely_technical.length > 0
    ) {
      console.log(chalk.yellow('\n📝 Detected potential constraints:'));
      if (suggestions.likely_business.length > 0) {
        console.log(chalk.blue('\nBusiness constraints:'));
        suggestions.likely_business.forEach((s) =>
          console.log(chalk.gray(`  • ${s}`))
        );
      }
      if (suggestions.likely_technical.length > 0) {
        console.log(chalk.blue('\nTechnical constraints:'));
        suggestions.likely_technical.forEach((s) =>
          console.log(chalk.gray(`  • ${s}`))
        );
      }
      if (suggestions.ambiguous.length > 0) {
        console.log(chalk.blue('\nAmbiguous (need clarification):'));
        suggestions.ambiguous.forEach((s) =>
          console.log(chalk.gray(`  • ${s}`))
        );
      }
      console.log();
    }

    // Show examples for this requirement type
    if (spec.type) {
      const examples = this.templateGenerator.getExampleConstraints(spec.type);
      console.log(
        chalk.blue(`\n💡 Example constraints for ${spec.type}:\n`)
      );
      console.log(chalk.green('Business constraints:'));
      examples.business.forEach((ex) => console.log(chalk.gray(`  • ${ex}`)));
      console.log(chalk.green('\nTechnical constraints:'));
      examples.technical.forEach((ex) => console.log(chalk.gray(`  • ${ex}`)));
      console.log();
    }

    // Collect business constraints
    const businessConstraints = await this.collectConstraints(
      'business',
      spec.business_constraints || [],
      spec.type
    );

    // Collect technical constraints
    const technicalConstraints = await this.collectConstraints(
      'technical',
      spec.technical_constraints || [],
      spec.type
    );

    console.log(chalk.green('\n✅ Constraint collection complete!\n'));

    return {
      business_constraints: businessConstraints,
      technical_constraints: technicalConstraints,
    };
  }

  /**
   * Collect constraints of a specific type
   */
  private async collectConstraints(
    constraintType: 'business' | 'technical',
    existing: Constraint[],
    requirementType?: RequirementType
  ): Promise<Constraint[]> {
    console.log(
      chalk.bold(
        `\n${constraintType === 'business' ? '💼' : '⚙️'} ${
          constraintType.charAt(0).toUpperCase() + constraintType.slice(1)
        } Constraints`
      )
    );

    if (constraintType === 'business') {
      console.log(
        chalk.gray(
          'Business constraints define domain rules and business logic requirements.'
        )
      );
      console.log(
        chalk.gray(
          'Examples: user permissions, data policies, business workflows.\n'
        )
      );
    } else {
      console.log(
        chalk.gray(
          'Technical constraints define system limitations and technology requirements.'
        )
      );
      console.log(
        chalk.gray(
          'Examples: performance targets, API limits, platform compatibility.\n'
        )
      );
    }

    const constraints: Constraint[] = [...existing];
    const existingIds = constraints.map((c) => c.id);

    // Ask if user wants to add constraints
    const { shouldAdd } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'shouldAdd',
        message: `Add ${constraintType} constraints?`,
        default: true,
      },
    ]);

    if (!shouldAdd) {
      return constraints;
    }

    // Collect constraints in a loop
    let addMore = true;
    while (addMore) {
      const constraint = await this.collectSingleConstraint(
        constraintType,
        existingIds
      );

      if (constraint) {
        constraints.push(constraint);
        existingIds.push(constraint.id);
        console.log(chalk.green(`✓ Added constraint: ${constraint.id}\n`));
      }

      // Ask if user wants to add more
      const { continueAdding } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAdding',
          message: `Add another ${constraintType} constraint?`,
          default: constraints.length < 3, // Encourage at least 3 constraints
        },
      ]);

      addMore = continueAdding;
    }

    // Minimum constraint recommendation
    if (constraints.length < 2) {
      console.log(
        chalk.yellow(
          `\n⚠️  Only ${constraints.length} ${constraintType} constraint(s) defined.`
        )
      );
      console.log(
        chalk.yellow(
          'Recommendation: Add at least 2-3 constraints for better AI guidance.\n'
        )
      );
    }

    return constraints;
  }

  /**
   * Collect a single constraint
   */
  private async collectSingleConstraint(
    constraintType: 'business' | 'technical',
    existingIds: string[]
  ): Promise<Constraint | null> {
    // Generate ID
    const id = this.validator.generateConstraintId(constraintType, existingIds);

    console.log(chalk.cyan(`\nConstraint ${id}:`));

    // Get constraint rule
    const { rule } = await inquirer.prompt([
      {
        type: 'input',
        name: 'rule',
        message: 'Constraint rule (use imperative: must/should/cannot):',
        validate: (input: string) => {
          if (input.trim().length < 10) {
            return 'Constraint rule must be at least 10 characters';
          }
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
            input.toLowerCase().includes(word)
          );
          if (!hasImperative) {
            return 'Use imperative language: must, should, cannot, etc.';
          }
          return true;
        },
      },
    ]);

    // Get severity
    const { severity } = await inquirer.prompt([
      {
        type: 'list',
        name: 'severity',
        message: 'Severity:',
        choices: [
          {
            name: 'Mandatory - MUST be satisfied (hard requirement)',
            value: 'mandatory',
          },
          {
            name: 'Recommended - SHOULD be satisfied (soft requirement)',
            value: 'recommended',
          },
          {
            name: 'Optional - COULD be satisfied (nice to have)',
            value: 'optional',
          },
        ],
        default: 'mandatory',
      },
    ]);

    // Get rationale (optional)
    const { addRationale } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addRationale',
        message: 'Add rationale (why this constraint exists)?',
        default: false,
      },
    ]);

    let rationale: string | undefined;
    if (addRationale) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'rationale',
          message: 'Rationale:',
        },
      ]);
      rationale = result.rationale;
    }

    // Get examples (optional)
    const { addExamples } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addExamples',
        message: 'Add examples of compliance/violation?',
        default: false,
      },
    ]);

    let examples: string[] | undefined;
    if (addExamples) {
      const result = await inquirer.prompt([
        {
          type: 'input',
          name: 'examples',
          message: 'Examples (comma-separated):',
          filter: (input: string) =>
            input
              .split(',')
              .map((e) => e.trim())
              .filter((e) => e.length > 0),
        },
      ]);
      examples = result.examples;
    }

    const constraint: Constraint = {
      id,
      type: constraintType,
      rule: rule.trim(),
      severity: severity as ConstraintSeverity,
      rationale,
      examples,
    };

    // Validate constraint format
    const validation = this.validator.validateConstraintFormat(constraint);
    if (!validation.valid) {
      console.log(chalk.red('\n⚠️  Constraint validation warnings:'));
      validation.errors.forEach((err) => console.log(chalk.yellow(`  • ${err}`)));

      const { continueAnyway } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continueAnyway',
          message: 'Continue with this constraint anyway?',
          default: true,
        },
      ]);

      if (!continueAnyway) {
        return null;
      }
    }

    return constraint;
  }

  /**
   * Review and edit existing constraints
   */
  async reviewConstraints(
    businessConstraints: Constraint[],
    technicalConstraints: Constraint[]
  ): Promise<{
    business_constraints: Constraint[];
    technical_constraints: Constraint[];
  }> {
    console.log(chalk.cyan('\n📋 Constraint Review\n'));

    if (businessConstraints.length > 0) {
      console.log(chalk.bold('Business Constraints:'));
      businessConstraints.forEach((c) => {
        console.log(chalk.green(`  ${c.id}: `) + chalk.gray(c.rule));
        console.log(
          chalk.gray(`       Severity: ${c.severity}${c.rationale ? ` | ${c.rationale}` : ''}`)
        );
      });
      console.log();
    }

    if (technicalConstraints.length > 0) {
      console.log(chalk.bold('Technical Constraints:'));
      technicalConstraints.forEach((c) => {
        console.log(chalk.green(`  ${c.id}: `) + chalk.gray(c.rule));
        console.log(
          chalk.gray(`       Severity: ${c.severity}${c.rationale ? ` | ${c.rationale}` : ''}`)
        );
      });
      console.log();
    }

    const { satisfied } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'satisfied',
        message: 'Are you satisfied with these constraints?',
        default: true,
      },
    ]);

    if (satisfied) {
      return {
        business_constraints: businessConstraints,
        technical_constraints: technicalConstraints,
      };
    }

    // Allow editing
    const { editType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'editType',
        message: 'What would you like to edit?',
        choices: [
          { name: 'Add more business constraints', value: 'add_business' },
          { name: 'Add more technical constraints', value: 'add_technical' },
          { name: 'Remove a constraint', value: 'remove' },
          { name: 'Start over', value: 'restart' },
        ],
      },
    ]);

    switch (editType) {
      case 'add_business':
        const newBusiness = await this.collectConstraints(
          'business',
          businessConstraints
        );
        return {
          business_constraints: newBusiness,
          technical_constraints: technicalConstraints,
        };

      case 'add_technical':
        const newTechnical = await this.collectConstraints(
          'technical',
          technicalConstraints
        );
        return {
          business_constraints: businessConstraints,
          technical_constraints: newTechnical,
        };

      case 'remove':
        const allConstraints = [
          ...businessConstraints.map((c) => ({ ...c, category: 'business' })),
          ...technicalConstraints.map((c) => ({ ...c, category: 'technical' })),
        ];

        const { toRemove } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'toRemove',
            message: 'Select constraints to remove:',
            choices: allConstraints.map((c) => ({
              name: `${c.id}: ${c.rule}`,
              value: c.id,
            })),
          },
        ]);

        return {
          business_constraints: businessConstraints.filter(
            (c) => !toRemove.includes(c.id)
          ),
          technical_constraints: technicalConstraints.filter(
            (c) => !toRemove.includes(c.id)
          ),
        };

      case 'restart':
        return this.run({ business_constraints: [], technical_constraints: [] }, '');

      default:
        return {
          business_constraints: businessConstraints,
          technical_constraints: technicalConstraints,
        };
    }
  }
}

/**
 * Singleton instance
 */
let constraintWizardInstance: ConstraintWizard | null = null;

export function getConstraintWizard(): ConstraintWizard {
  if (!constraintWizardInstance) {
    constraintWizardInstance = new ConstraintWizard();
  }
  return constraintWizardInstance;
}
