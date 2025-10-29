/**
 * Configuration management for vibes-cli
 * Handles loading, saving, and updating vibes.config.json
 */

import fs from 'fs';
import path from 'path';
import { VibesConfig, DEFAULT_CONFIG } from '../types';

const CONFIG_FILE = 'vibes.config.json';

export class ConfigManager {
  private configPath: string;
  private config: VibesConfig | null = null;

  constructor(cwd: string = process.cwd()) {
    this.configPath = path.join(cwd, CONFIG_FILE);
  }

  /**
   * Load configuration from file, or return default if not exists
   */
  load(): VibesConfig {
    if (this.config) {
      return this.config;
    }

    if (fs.existsSync(this.configPath)) {
      try {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
      } catch (error) {
        console.warn(
          `Warning: Failed to parse ${CONFIG_FILE}. Using defaults.`
        );
        this.config = { ...DEFAULT_CONFIG };
      }
    } else {
      this.config = { ...DEFAULT_CONFIG };
    }

    return this.config as VibesConfig;
  }

  /**
   * Save configuration to file
   */
  save(config: VibesConfig): void {
    try {
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8'
      );
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config: ${(error as Error).message}`);
    }
  }

  /**
   * Get a specific config value
   */
  get(key: keyof VibesConfig): any {
    const config = this.load();
    return config[key];
  }

  /**
   * Set a specific config value
   */
  set(key: keyof VibesConfig, value: any): void {
    const config = this.load();
    (config as any)[key] = value;
    this.save(config);
  }

  /**
   * Get all config as key-value pairs
   */
  getAll(): VibesConfig {
    return this.load();
  }

  /**
   * Check if config file exists
   */
  exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Get config file path
   */
  getPath(): string {
    return this.configPath;
  }
}

// Singleton instance
let instance: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!instance) {
    instance = new ConfigManager();
  }
  return instance;
}
