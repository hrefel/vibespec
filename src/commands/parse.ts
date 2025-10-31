/**
 * Parse command implementation
 * Converts raw requirements into structured specs
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { Processor } from '../core/processor';
import { readInput, writeSpec, generateOutputPath } from '../utils/file-io';
import { AIProvider, OutputFormat, ParseOptions } from '../types';

export function createParseCommand(): Command {
  const command = new Command('parse');

  command
    .description('Convert raw text or file into structured spec')
    .argument('<input>', 'Input file path or raw text')
    .option('--output <file>', 'Output file path')
    .option('--format <json|yaml|toon>', 'Output format (json, yaml, or toon)', 'json')
    .option('--provider <openai|claude|openrouter|glm>', 'AI provider to use')
    .option('--model <model>', 'AI model to use (e.g., gpt-4o-mini, claude-3-haiku-20240307, meta-llama/llama-3.1-8b-instruct:free)')
    .option('--token <apiKey>', 'API key for the provider')
    .option('--interactive', 'Enable interactive mode', false)
    .option('--no-cache', 'Disable caching')
    .option('--no-wizard', 'Disable wizard mode fallback on AI failure')
    .action(async (input: string, options: any) => {
      try {
        console.log(chalk.bold('\n🔮 Vibes CLI - Parsing Requirement\n'));

        // Read input
        console.log('→ Reading input...');
        const inputText = readInput(input);

        if (inputText.length < 20) {
          console.error(chalk.red('✗ Input too short. Minimum 20 characters required.'));
          process.exit(1);
        }

        console.log(chalk.gray(`  Input length: ${inputText.length} characters\n`));

        // Process input
        const processor = new Processor();
        const processorOptions: ParseOptions = {
          provider: options.provider as AIProvider,
          token: options.token,
          format: options.format as OutputFormat,
          interactive: options.interactive,
          noCache: !options.cache, // Commander converts --no-cache to options.cache = false
        };

        const spec = await processor.process(inputText, {
          provider: processorOptions.provider,
          model: options.model,
          token: processorOptions.token,
          useCache: !processorOptions.noCache,
          enableWizard: options.wizard !== false, // Commander converts --no-wizard to options.wizard = false
        });

        console.log(chalk.green('\n✓ Spec generated successfully!\n'));

        // Display spec preview
        console.log(chalk.bold('Preview:'));
        console.log(chalk.cyan(`  Title: ${spec.title}`));
        console.log(chalk.cyan(`  Domain: ${spec.domain}`));
        console.log(chalk.cyan(`  Requirements: ${spec.requirements.length} items`));
        if (spec.tech_stack && spec.tech_stack.length > 0) {
          console.log(chalk.cyan(`  Tech Stack: ${spec.tech_stack.join(', ')}`));
        }

        // Determine output path
        let outputPath: string;
        if (options.output) {
          outputPath = options.output;
        } else {
          outputPath = generateOutputPath('./specs', options.format);
        }

        // Write to file
        const writtenPath = writeSpec(spec, outputPath, options.format);
        console.log(chalk.green(`\n✓ Spec saved to: ${writtenPath}\n`));

        // Show metadata
        if (spec.metadata) {
          console.log(chalk.gray('Metadata:'));
          console.log(chalk.gray(`  Provider: ${spec.metadata.processing.provider}`));
          console.log(chalk.gray(`  Model: ${spec.metadata.processing.model}`));
          console.log(chalk.gray(`  AI Refinement: ${spec.metadata.processing.ai_refinement_applied ? 'Yes' : 'No'}`));
          if (spec.metadata.processing.refinement_method) {
            console.log(chalk.gray(`  Refinement Method: ${spec.metadata.processing.refinement_method}`));
          }
          console.log(chalk.gray(`  Cache Hit: ${spec.metadata.processing.cache_hit ? 'Yes' : 'No'}`));
          if (spec.metadata.processing.heuristic_confidence !== undefined) {
            console.log(
              chalk.gray(
                `  Heuristic Confidence: ${(spec.metadata.processing.heuristic_confidence * 100).toFixed(0)}%`
              )
            );
          }
        }

        console.log(); // Empty line at end
      } catch (error) {
        console.error(chalk.red(`\n✗ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });

  return command;
}
