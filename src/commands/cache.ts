/**
 * Cache command implementation
 * Manage in-memory cache (view or clear)
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { getCache } from '../utils/cache';

export function createCacheCommand(): Command {
  const command = new Command('cache');

  command
    .description('Manage in-memory cache (view or clear)')
    .argument('[action]', 'Action: status or clear')
    .action(async (action?: string) => {
      try {
        const cache = getCache();

        // Default to 'status' if no action specified
        if (!action || action === 'status') {
          console.log(chalk.bold('\n💾 Vibes CLI Cache Status\n'));

          const stats = cache.getStats();
          const hitRate = cache.getHitRate();

          console.log(chalk.cyan('Cache Statistics:'));
          console.log(`  Current Size: ${chalk.yellow(String(stats.size))} / ${chalk.yellow(String(stats.maxSize))} entries`);
          console.log(`  Total Hits: ${chalk.yellow(String(stats.hits))}`);
          console.log(`  Total Misses: ${chalk.yellow(String(stats.misses))}`);
          console.log(`  Hit Rate: ${chalk.yellow(hitRate.toFixed(1))}%`);
          console.log(`  Evictions: ${chalk.yellow(String(stats.evictions))}`);

          console.log();

          if (stats.size === 0) {
            console.log(chalk.gray('Cache is empty. Run some parse commands to populate it.'));
          } else {
            console.log(
              chalk.gray(
                `Cache is using ${((stats.size / stats.maxSize) * 100).toFixed(0)}% of capacity.`
              )
            );
          }

          console.log();
          return;
        }

        if (action === 'clear') {
          const statsBefore = cache.getStats();

          if (statsBefore.size === 0) {
            console.log(chalk.yellow('\n⚠ Cache is already empty.\n'));
            return;
          }

          cache.clear();

          console.log(chalk.green('\n✓ Cache cleared successfully!\n'));
          console.log(`Removed ${chalk.yellow(String(statsBefore.size))} cached entries.\n`);
          return;
        }

        console.error(chalk.red(`\n✗ Error: Unknown action "${action}"\n`));
        console.log('Available actions: status, clear\n');
        process.exit(1);
      } catch (error) {
        console.error(chalk.red(`\n✗ Error: ${(error as Error).message}\n`));
        process.exit(1);
      }
    });

  return command;
}
