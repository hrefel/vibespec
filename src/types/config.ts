/**
 * Configuration type definitions
 */

import { AIProvider, OutputFormat } from './spec';

/**
 * User configuration stored in vibes.config.json
 */
export interface VibesConfig {
  provider: AIProvider;
  model: string;
  useCache: boolean;
  outputPath?: string;
  defaultFormat?: OutputFormat;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: VibesConfig = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  useCache: true,
  outputPath: './specs',
  defaultFormat: 'json',
};

/**
 * AI provider configuration
 */
export interface ProviderConfig {
  provider: AIProvider;
  env: string;
  model: string;
  apiBase?: string;
  timeout?: number;
  maxTokens?: number;
  temperature?: number;
}

/**
 * Available provider configurations
 */
export const PROVIDER_CONFIGS: Record<AIProvider, ProviderConfig> = {
  openai: {
    provider: 'openai',
    env: 'OPENAI_API_KEY',
    model: 'gpt-4o-mini',
    apiBase: 'https://api.openai.com/v1',
    timeout: 30000,
    maxTokens: 2000,
    temperature: 0.3,
  },
  claude: {
    provider: 'claude',
    env: 'ANTHROPIC_API_KEY',
    model: 'claude-3-haiku-20240307',
    apiBase: 'https://api.anthropic.com/v1',
    timeout: 30000,
    maxTokens: 2000,
    temperature: 0.3,
  },
  glm: {
    provider: 'glm',
    env: 'ZAI_API_KEY',
    model: 'glm-4.0',
    timeout: 30000,
    maxTokens: 2000,
    temperature: 0.3,
  },
  openrouter: {
    provider: 'openrouter',
    env: 'OPENROUTER_API_KEY',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    apiBase: 'https://openrouter.ai/api/v1',
    timeout: 30000,
    maxTokens: 2000,
    temperature: 0.2,
  },
};

/**
 * Parse command options
 */
export interface ParseOptions {
  output?: string;
  format?: OutputFormat;
  provider?: AIProvider;
  token?: string;
  interactive?: boolean;
  noCache?: boolean;
}

/**
 * Token resolution order
 */
export type TokenSource = 'cli-flag' | 'global-env' | 'dotenv' | 'config';
