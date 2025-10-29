/**
 * Token resolution utility
 * Resolves API keys from multiple sources with priority order:
 * 1. CLI flag (--token)
 * 2. Global env variable
 * 3. .env file
 * 4. vibes.config.json
 */

import dotenv from 'dotenv';
import { AIProvider, PROVIDER_CONFIGS } from '../types';
import { getConfigManager } from './config-manager';

// Load .env file once at module initialization
dotenv.config();

export class TokenResolver {
  /**
   * Resolve API token for a given provider
   * @param provider The AI provider
   * @param cliToken Token passed via CLI flag (highest priority)
   * @returns The resolved token or null if not found
   */
  resolve(provider: AIProvider, cliToken?: string): string | null {
    // Priority 1: CLI flag
    if (cliToken) {
      return cliToken;
    }

    const providerConfig = PROVIDER_CONFIGS[provider];

    // Priority 2: Global environment variable (provider-specific)
    const envToken = process.env[providerConfig.env];
    if (envToken) {
      return envToken;
    }

    // Priority 2b: Alternative environment variables for GLM
    if (provider === 'glm') {
      const zhipuaiToken = process.env.ZHIPUAI_API_KEY;
      if (zhipuaiToken) {
        return zhipuaiToken;
      }
    }

    // Priority 3: Generic VIBES_AI_KEY from .env
    const genericToken = process.env.VIBES_AI_KEY;
    if (genericToken) {
      return genericToken;
    }

    // Priority 4: vibes.config.json (if it contains an apiKey field)
    // Note: For security reasons, we don't recommend storing keys in config
    // This is mainly for backwards compatibility or controlled environments
    try {
      const configManager = getConfigManager();
      const config = configManager.getAll();
      if ((config as any).apiKey) {
        return (config as any).apiKey;
      }
    } catch {
      // Config doesn't exist or couldn't be read
    }

    return null;
  }

  /**
   * Validate that a token exists for the given provider
   * Throws an error if no token is found
   */
  requireToken(provider: AIProvider, cliToken?: string): string {
    const token = this.resolve(provider, cliToken);

    if (!token) {
      const providerConfig = PROVIDER_CONFIGS[provider];
      const envVarList = provider === 'glm'
        ? `${providerConfig.env} or ZHIPUAI_API_KEY`
        : providerConfig.env;

      throw new Error(
        `No API key found for provider '${provider}'.\n\n` +
        `Please provide an API key via one of these methods:\n` +
        `  1. CLI flag: --token YOUR_API_KEY\n` +
        `  2. Environment variable: ${envVarList}=YOUR_API_KEY\n` +
        `  3. .env file: Add ${envVarList}=YOUR_API_KEY\n` +
        `  4. Generic: VIBES_AI_KEY=YOUR_API_KEY`
      );
    }

    return token;
  }

  /**
   * Check if a token is available for the provider
   */
  hasToken(provider: AIProvider, cliToken?: string): boolean {
    return this.resolve(provider, cliToken) !== null;
  }
}

// Singleton instance
let instance: TokenResolver | null = null;

export function getTokenResolver(): TokenResolver {
  if (!instance) {
    instance = new TokenResolver();
  }
  return instance;
}
