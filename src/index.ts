#!/usr/bin/env node

/**
 * Vibes CLI Entry Point
 * CLI for transforming raw requirements into structured specs
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createParseCommand } from './commands/parse';
import { createValidateCommand } from './commands/validate';
import { createConfigCommand } from './commands/config';
import { createCacheCommand } from './commands/cache';

const program = new Command();

program
  .name('vibes')
  .description('CLI for transforming raw requirements into structured specs using hybrid parsing (AI + heuristic)')
  .version('5.0.0');

// Add commands
program.addCommand(createParseCommand());
program.addCommand(createValidateCommand());
program.addCommand(createConfigCommand());
program.addCommand(createCacheCommand());

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red(`\n✗ Error: Unknown command "${program.args.join(' ')}"\n`));
  console.log('Available commands:');
  console.log('  parse      - Convert raw text or file into structured spec');
  console.log('  validate   - Validate spec file against schema');
  console.log('  config     - Display or modify configuration');
  console.log('  cache      - Manage in-memory cache\n');
  console.log('Run "vibes --help" for more information.\n');
  process.exit(1);
});

// Show help if no command provided
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

// Parse arguments and execute
program.parse(process.argv);
