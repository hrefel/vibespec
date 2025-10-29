/**
 * Validate command implementation
 * Validates spec files against schema
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { SpecValidator } from '../core/validator';
import { readSpec } from '../utils/file-io';

export function createValidateCommand(): Command {
  const command = new Command('validate');

  command
    .description('Validate spec file against internal schema')
    .argument('<spec-file>', 'Path to spec file (JSON or YAML)')
    .action(async (specFile: string) => {
      try {
        console.log(chalk.bold('\n🔍 Vibes CLI - Validating Spec\n'));

        // Read spec file
        console.log(`→ Reading spec from: ${specFile}`);
        const spec = readSpec(specFile);

        // Validate
        console.log('→ Validating against schema...\n');
        const validator = new SpecValidator();
        const result = validator.validate(spec);

        if (result.valid) {
          console.log(chalk.green('✓ Spec is valid!\n'));

          // Show summary
          console.log(chalk.bold('Summary:'));
          console.log(chalk.cyan(`  Title: ${spec.title}`));
          console.log(chalk.cyan(`  Domain: ${spec.domain}`));
          console.log(chalk.cyan(`  Requirements: ${spec.requirements.length}`));
          if (spec.components) {
            console.log(chalk.cyan(`  Components: ${spec.components.length}`));
          }
          if (spec.tech_stack) {
            console.log(chalk.cyan(`  Tech Stack: ${spec.tech_stack.length}`));
          }
          if (spec.acceptance_criteria) {
            console.log(chalk.cyan(`  Acceptance Criteria: ${spec.acceptance_criteria.length}`));
          }

          console.log(); // Empty line
          process.exit(0);
        } else {
          console.log(chalk.red(`✗ Spec is invalid (${result.errors.length} errors)\n`));

          // Show errors
          console.log(chalk.bold('Validation Errors:'));
          console.log(validator.formatErrors(result.errors));

          console.log(); // Empty line
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red(`\n✗ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });

  return command;
}
