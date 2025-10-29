/**
 * Hybrid processing pipeline
 * Orchestrates heuristic parsing and AI refinement with caching
 */

import crypto from 'crypto';
import inquirer from 'inquirer';
import { AIProvider, VibeSpec, SpecMetadata, ParseOptions, PROVIDER_CONFIGS } from '../types';
import { HeuristicParser } from './heuristic-parser';
import { createAIAdapter } from './ai-adapters';
import { getCache } from '../utils/cache';
import { getTokenResolver } from '../utils/token-resolver';
import { getConfigManager } from '../utils/config-manager';
import { getWizard } from './wizard';

export interface ProcessorOptions {
  provider?: AIProvider;
  model?: string;
  token?: string;
  useCache?: boolean;
  enableWizard?: boolean; // Enable wizard mode on AI failure
}

export class Processor {
  private heuristicParser: HeuristicParser;

  constructor() {
    this.heuristicParser = new HeuristicParser();
  }

  /**
   * Process raw input through hybrid pipeline
   */
  async process(input: string, options: ProcessorOptions = {}): Promise<VibeSpec> {
    // Validate input
    if (!input || input.trim().length < 20) {
      throw new Error('Input too short. Minimum 20 characters required.');
    }

    const normalized = input.trim();

    // Load configuration
    const configManager = getConfigManager();
    const config = configManager.load();

    // Determine provider and model
    const provider = options.provider || config.provider;
    // If model is explicitly provided, use it
    // Otherwise, if provider is specified and different from config, use that provider's default model
    // Otherwise, use config model
    const model = options.model ||
                  (options.provider && options.provider !== config.provider
                    ? PROVIDER_CONFIGS[provider].model
                    : config.model);
    const useCache = options.useCache !== undefined ? options.useCache : config.useCache;

    // Check cache first (if enabled)
    if (useCache) {
      const cache = getCache();
      const cached = cache.get(normalized, provider, model);
      if (cached) {
        console.log('✓ Using cached result');
        return cached;
      }
    }

    // Stage 1: Heuristic parsing
    console.log('→ Analyzing requirement with heuristic parser...');
    const heuristicOutput = this.heuristicParser.parse(normalized);

    // Stage 2: AI refinement
    console.log(`→ Refining with ${provider} (${model})...`);

    let spec: VibeSpec;
    let aiRefinementApplied = true;

    try {
      // Get API token
      const tokenResolver = getTokenResolver();
      const apiKey = tokenResolver.requireToken(provider, options.token);

      // Create AI adapter and refine
      const adapter = createAIAdapter(provider, apiKey, model);
      spec = await adapter.refine(normalized, heuristicOutput);

      // Add metadata
      spec.metadata = this.createMetadata(normalized, provider, model, heuristicOutput.confidence, true, false);
      spec.metadata.processing.refinement_method = 'ai';
    } catch (error) {
      // Fallback options on AI failure
      console.warn(`⚠ AI refinement failed: ${(error as Error).message}`);

      // Check if wizard mode should be enabled
      const enableWizard = options.enableWizard !== undefined ? options.enableWizard : true;

      if (enableWizard && process.stdin.isTTY) {
        // Ask user if they want to use wizard mode
        const { useWizard } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'useWizard',
            message: '🧙 Would you like to use Wizard Mode to refine your spec interactively?',
            default: true,
          },
        ]);

        if (useWizard) {
          const wizard = getWizard();
          spec = await wizard.refine(normalized, heuristicOutput);
          spec.metadata = this.createMetadata(normalized, provider, model, heuristicOutput.confidence, true, false);
          spec.metadata.processing.refinement_method = 'wizard';
          aiRefinementApplied = true;
        } else {
          console.warn('⚠ Falling back to heuristic-only parsing (lower accuracy)');
          spec = this.heuristicToSpec(heuristicOutput);
          spec.metadata = this.createMetadata(normalized, provider, model, heuristicOutput.confidence, false, false);
          spec.metadata.processing.refinement_method = 'heuristic';
          aiRefinementApplied = false;
        }
      } else {
        console.warn('⚠ Falling back to heuristic-only parsing (lower accuracy)');
        spec = this.heuristicToSpec(heuristicOutput);
        spec.metadata = this.createMetadata(normalized, provider, model, heuristicOutput.confidence, false, false);
        spec.metadata.processing.refinement_method = 'heuristic';
        aiRefinementApplied = false;
      }
    }

    // Cache the result (if enabled and AI refinement was successful)
    if (useCache && aiRefinementApplied) {
      const cache = getCache();
      cache.set(normalized, provider, model, spec);
    }

    return spec;
  }

  /**
   * Convert heuristic output to full spec (fallback)
   */
  private heuristicToSpec(heuristic: any): VibeSpec {
    return {
      title: heuristic.title || 'Untitled Requirement',
      domain: heuristic.domain || 'fullstack',
      description: heuristic.description || 'No description available',
      requirements: heuristic.requirements || [],
      components: heuristic.components || [],
      tech_stack: heuristic.tech_stack || [],
      acceptance_criteria: heuristic.acceptance_criteria || [],
      ai_guidance: 'Generated using heuristic parsing only. Consider refining manually.',
    };
  }

  /**
   * Create metadata for the generated spec
   */
  private createMetadata(
    input: string,
    provider: AIProvider,
    model: string,
    heuristicConfidence: number,
    aiRefinementApplied: boolean,
    cacheHit: boolean
  ): SpecMetadata {
    const inputHash = crypto
      .createHash('sha256')
      .update(input.trim().toLowerCase())
      .digest('hex');

    return {
      spec_version: '1.0.0',
      generated_by: 'vibes-cli v5.0.0',
      generated_at: new Date().toISOString(),
      input_hash: inputHash,
      processing: {
        provider,
        model,
        heuristic_confidence: heuristicConfidence,
        ai_refinement_applied: aiRefinementApplied,
        cache_hit: cacheHit,
      },
    };
  }

  /**
   * Process with interactive mode (placeholder for now)
   */
  async processInteractive(input: string, options: ProcessorOptions = {}): Promise<VibeSpec> {
    // For now, just use regular processing
    // Interactive prompts will be added in the command layer
    return this.process(input, options);
  }
}
