/**
 * Config command implementation
 * Display or modify vibes configuration
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getConfigManager } from '../utils/config-manager';
import { VibesConfig } from '../types';

export function createConfigCommand(): Command {
  const command = new Command('config');

  command
    .description('Display or modify vibes configuration')
    .argument('[action]', 'Action: list, get, or set')
    .argument('[key]', 'Configuration key')
    .argument('[value]', 'Configuration value (for set action)')
    .action(async (action?: string, key?: string, value?: string) => {
      try {
        const configManager = getConfigManager();

        // Default to 'list' if no action specified
        if (!action || action === 'list') {
          console.log(chalk.bold('\n⚙️  Vibes CLI Configuration\n'));

          const config = configManager.getAll();

          console.log(chalk.cyan('Current Configuration:'));
          console.log(`  provider: ${chalk.yellow(config.provider)}`);
          console.log(`  model: ${chalk.yellow(config.model)}`);
          console.log(`  useCache: ${chalk.yellow(String(config.useCache))}`);
          if (config.outputPath) {
            console.log(`  outputPath: ${chalk.yellow(config.outputPath)}`);
          }
          if (config.defaultFormat) {
            console.log(`  defaultFormat: ${chalk.yellow(config.defaultFormat)}`);
          }

          console.log();

          if (configManager.exists()) {
            console.log(chalk.gray(`Config file: ${configManager.getPath()}`));
          } else {
            console.log(chalk.gray('No config file found. Using defaults.'));
            console.log(chalk.gray(`Create one at: ${configManager.getPath()}`));
          }

          console.log();
          return;
        }

        if (action === 'get') {
          if (!key) {
            console.error(chalk.red('\n✗ Error: Key required for "get" action\n'));
            console.log('Usage: vibes config get <key>');
            console.log('Available keys: provider, model, useCache, outputPath, defaultFormat\n');
            process.exit(1);
          }

          const validKeys = ['provider', 'model', 'useCache', 'outputPath', 'defaultFormat'];
          if (!validKeys.includes(key)) {
            console.error(chalk.red(`\n✗ Error: Invalid key "${key}"\n`));
            console.log(`Available keys: ${validKeys.join(', ')}\n`);
            process.exit(1);
          }

          const configValue = configManager.get(key as keyof VibesConfig);

          console.log(chalk.bold(`\n⚙️  Configuration Value\n`));
          console.log(`${chalk.cyan(key)}: ${chalk.yellow(String(configValue))}\n`);
          return;
        }

        if (action === 'set') {
          if (!key || value === undefined) {
            console.error(chalk.red('\n✗ Error: Key and value required for "set" action\n'));
            console.log('Usage: vibes config set <key> <value>');
            console.log('Available keys: provider, model, useCache, outputPath, defaultFormat\n');
            process.exit(1);
          }

          const validKeys: Record<string, string[]> = {
            provider: ['openai', 'claude', 'glm'],
            model: [], // Any string
            useCache: ['true', 'false'],
            outputPath: [], // Any string
            defaultFormat: ['json', 'yaml'],
          };

          if (!Object.keys(validKeys).includes(key)) {
            console.error(chalk.red(`\n✗ Error: Invalid key "${key}"\n`));
            console.log(`Available keys: ${Object.keys(validKeys).join(', ')}\n`);
            process.exit(1);
          }

          // Validate value for specific keys
          const allowedValues = validKeys[key];
          if (allowedValues.length > 0 && !allowedValues.includes(value)) {
            console.error(chalk.red(`\n✗ Error: Invalid value "${value}" for key "${key}"\n`));
            console.log(`Allowed values: ${allowedValues.join(', ')}\n`);
            process.exit(1);
          }

          // Convert value to appropriate type
          let finalValue: any = value;
          if (key === 'useCache') {
            finalValue = value === 'true';
          }

          configManager.set(key as keyof VibesConfig, finalValue);

          console.log(chalk.green(`\n✓ Configuration updated!\n`));
          console.log(`${chalk.cyan(key)}: ${chalk.yellow(String(finalValue))}`);
          console.log(chalk.gray(`\nSaved to: ${configManager.getPath()}\n`));
          return;
        }

        console.error(chalk.red(`\n✗ Error: Unknown action "${action}"\n`));
        console.log('Available actions: list, get, set\n');
        process.exit(1);
      } catch (error) {
        console.error(chalk.red(`\n✗ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });

  return command;
}
