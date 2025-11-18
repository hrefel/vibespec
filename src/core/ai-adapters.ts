/**
 * AI adapter system for multiple providers
 * Provides unified interface for OpenAI, Claude, and GLM
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, HeuristicOutput, VibeSpec, PROVIDER_CONFIGS } from '../types';
import { buildDomainPrompt } from './fullstack-prompts';

export interface AIAdapter {
  refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec>;
}

/**
 * OpenAI adapter using GPT models
 */
export class OpenAIAdapter implements AIAdapter {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec> {
    const prompt = this.buildPrompt(input, heuristicOutput);

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a requirement analyzer. Output valid JSON only, no markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000, // Increased for detailed specs
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return this.parseResponse(content);
    } catch (error) {
      throw new Error(`OpenAI API error: ${(error as Error).message}`);
    }
  }

  private buildPrompt(input: string, heuristic: HeuristicOutput): string {
    // Use enhanced prompts for fullstack/backend domains
    return buildDomainPrompt(heuristic.domain, input, heuristic);
  }

  private parseResponse(content: string): VibeSpec {
    try {
      const parsed = JSON.parse(content);

      // Validate required fields
      if (!parsed.title || !parsed.domain || !parsed.description || !parsed.requirements) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed as VibeSpec;
    } catch (error) {
      throw new Error(`Failed to parse OpenAI response: ${(error as Error).message}`);
    }
  }
}

/**
 * Anthropic Claude adapter
 */
export class ClaudeAdapter implements AIAdapter {
  private client: any;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-haiku-20240307') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec> {
    const prompt = this.buildPrompt(input, heuristicOutput);

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4000, // Increased for detailed specs
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      return this.parseResponse(content.text);
    } catch (error) {
      throw new Error(`Claude API error: ${(error as Error).message}`);
    }
  }

  private buildPrompt(input: string, heuristic: HeuristicOutput): string {
    // Use enhanced prompts for fullstack/backend domains
    return buildDomainPrompt(heuristic.domain, input, heuristic);
  }

  private parseResponse(content: string): VibeSpec {
    try {
      // Claude might wrap in markdown, so extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.title || !parsed.domain || !parsed.description || !parsed.requirements) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed as VibeSpec;
    } catch (error) {
      throw new Error(`Failed to parse Claude response: ${(error as Error).message}`);
    }
  }
}

/**
 * GLM (ZhipuAI) adapter
 * Uses ZhipuAI's chat completion API
 */
export class GLMAdapter implements AIAdapter {
  private apiKey: string;
  private model: string;
  private apiBase: string = 'https://api.z.ai/api/paas/v4/';

  constructor(apiKey: string, model: string = 'glm-4.0') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec> {
    const prompt = this.buildPrompt(input, heuristicOutput);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a requirement analyzer. Output valid JSON only, no markdown.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 4000, // Increased for detailed specs
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GLM API error  (${response.status}): ${errorText} (api): ${this.apiBase}/chat/completions`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from GLM API');
      }

      return this.parseResponse(content);
    } catch (error) {
      throw new Error(`GLM API error: ${(error as Error).message} (api): ${this.apiBase}/chat/completions`);
    }
  }

  private buildPrompt(input: string, heuristic: HeuristicOutput): string {
    // Use enhanced prompts for fullstack/backend domains
    return buildDomainPrompt(heuristic.domain, input, heuristic);
  }

  private parseResponse(content: string): VibeSpec {
    try {
      // GLM might wrap in markdown code blocks, so extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.title || !parsed.domain || !parsed.description || !parsed.requirements) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed as VibeSpec;
    } catch (error) {
      throw new Error(`Failed to parse GLM response: ${(error as Error).message}`);
    }
  }
}

/**
 * OpenRouter adapter
 * Uses OpenRouter's unified API to access multiple models
 */
export class OpenRouterAdapter implements AIAdapter {
  private apiKey: string;
  private model: string;
  private apiBase: string = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string, model: string = 'meta-llama/llama-3.1-8b-instruct:free') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec> {
    const prompt = this.buildPrompt(input, heuristicOutput);

    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': 'https://github.com/vibespec-cli',
          'X-Title': 'VibeSpec CLI',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a requirement analyzer. Output valid JSON only, no markdown or code blocks. Ensure all strings are properly escaped and terminated. Complete the entire JSON structure.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 8000, // Increased to avoid truncation
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      // Parse response - handle potential JSON errors from API
      let data: any;
      let content: string;

      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
        content = data.choices?.[0]?.message?.content;
      } catch (parseError) {
        // If the API response itself is invalid JSON, this is a critical error
        const errorMsg = (parseError as Error).message;
        throw new Error(`OpenRouter API returned invalid JSON response: ${errorMsg}`);
      }

      if (!content) {
        throw new Error('Empty response from OpenRouter API');
      }

      // Log the raw response for debugging (first 500 chars)
      if (process.env.DEBUG_OPENROUTER) {
        console.log('\n[DEBUG] OpenRouter raw response:', content.substring(0, 500));
      }

      return this.parseResponse(content);
    } catch (error) {
      throw new Error(`OpenRouter API error: ${(error as Error).message}`);
    }
  }

  private buildPrompt(input: string, heuristic: HeuristicOutput): string {
    // Use simplified prompts for OpenRouter (free models have lower capacity)
    return buildDomainPrompt(heuristic.domain, input, heuristic, true);
  }

  private parseResponse(content: string): VibeSpec {
    try {
      // Remove markdown code blocks if present
      let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      // Try to extract JSON object
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      let jsonStr = jsonMatch ? jsonMatch[0] : cleanedContent;

      // Try to fix common JSON issues
      // Remove any trailing commas before closing braces/brackets
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');

      // Fix unescaped quotes within string values
      // This regex finds string values and escapes any unescaped quotes within them
      jsonStr = this.fixUnescapedQuotes(jsonStr);

      // Fix common string issues: remove unescaped newlines in strings
      // This handles cases like: "description": "text\nmore text"
      jsonStr = this.fixStringLiterals(jsonStr);

      // Attempt to parse - if it fails due to unterminated strings, try repairs
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        const errorMsg = (firstError as Error).message;

        // Check if it's an unterminated string or unexpected character error
        if (errorMsg.includes('Unterminated string') ||
            errorMsg.includes('Unexpected end') ||
            errorMsg.includes('Expected') ||
            errorMsg.includes('after array element')) {
          console.warn('⚠️  Detected incomplete/malformed JSON from OpenRouter, attempting repair...');

          // Strategy 1: Try to truncate at last complete structure
          let repairedJson = this.truncateToLastValidStructure(jsonStr);

          try {
            parsed = JSON.parse(repairedJson);
            console.log('✓ Successfully repaired JSON by truncation');
          } catch (secondError) {
            // Strategy 2: Try to close unterminated strings and objects
            repairedJson = this.repairIncompleteJson(jsonStr);

            try {
              parsed = JSON.parse(repairedJson);
              console.log('✓ Successfully repaired JSON by closure');
            } catch (thirdError) {
              // Strategy 3: Find the last valid complete object
              parsed = this.extractLastValidJson(jsonStr);

              if (!parsed) {
                // Log detailed error for debugging
                console.error('\n[OpenRouter Parse Error]');
                console.error('Error:', errorMsg);
                console.error('Raw content (first 500 chars):', content.substring(0, 500));
                console.error('Extracted JSON (first 500 chars):', jsonStr.substring(0, 500));
                console.error('Around error position 11876:', jsonStr.substring(11800, 11950));
                throw firstError;
              }
            }
          }
        } else {
          throw firstError;
        }
      }

      // Validate required fields with better error messages
      const missingFields: string[] = [];
      if (!parsed.title) missingFields.push('title');
      if (!parsed.domain) missingFields.push('domain');
      if (!parsed.description) missingFields.push('description');
      if (!parsed.requirements) missingFields.push('requirements');

      if (missingFields.length > 0) {
        console.error('\n[Missing Required Fields]');
        console.error('Missing:', missingFields.join(', '));
        console.error('Parsed object keys:', Object.keys(parsed).join(', '));
        console.error('First 300 chars of response:', content.substring(0, 300));
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      return parsed as VibeSpec;
    } catch (error) {
      throw new Error(`Failed to parse OpenRouter response: ${(error as Error).message}. Raw content preview: ${content.substring(0, 200)}`);
    }
  }

  /**
   * Fix unescaped quotes within string values
   * This handles cases where AI generates: "description": "This is a "quoted" word"
   */
  private fixUnescapedQuotes(jsonStr: string): string {
    // Find all string values and fix unescaped quotes
    // This is a more aggressive approach: find key-value pairs and fix their values
    return jsonStr.replace(/"([^"]+)":\s*"([^"]*)"/g, (match, key, value) => {
      // If value contains quote marks that aren't escaped, escape them
      // But be careful not to double-escape already escaped quotes
      if (value.includes('"') && !value.includes('\\"')) {
        const fixedValue = value.replace(/"/g, '\\"');
        return `"${key}": "${fixedValue}"`;
      }
      return match;
    });
  }

  /**
   * Fix invalid string literals (unescaped newlines, control characters)
   */
  private fixStringLiterals(jsonStr: string): string {
    // Match string literals and fix unescaped newlines/control chars
    return jsonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (match, content) => {
      // If the string contains actual newlines (not \n), replace them
      if (content.includes('\n') || content.includes('\r') || content.includes('\t')) {
        content = content
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        return `"${content}"`;
      }
      return match;
    });
  }

  /**
   * Truncate JSON at the last valid complete structure (before corruption starts)
   * This is more aggressive but often works better than trying to repair
   */
  private truncateToLastValidStructure(jsonStr: string): string {
    // Find all positions where we have a comma followed by a closing brace/bracket
    // These are safe truncation points
    const safePoints: number[] = [];

    for (let i = jsonStr.length - 1; i >= jsonStr.length / 3; i--) {
      const char = jsonStr[i];
      const prevChars = jsonStr.substring(Math.max(0, i - 10), i);

      // Look for patterns like:  "field": "value"  } or "field": "value"  ]
      // After a complete field-value pair
      if ((char === '}' || char === ']') && prevChars.includes('"')) {
        // Try to parse from beginning to this point
        const testStr = jsonStr.substring(0, i + 1);
        try {
          JSON.parse(testStr);
          // This is a valid truncation point!
          return testStr;
        } catch (e) {
          // Continue searching
        }
      }
    }

    // If no valid point found, return original
    return jsonStr;
  }

  /**
   * Attempt to repair incomplete JSON by closing unterminated strings and objects
   */
  private repairIncompleteJson(jsonStr: string): string {
    let repaired = jsonStr.trim();

    // Count opening and closing braces/brackets
    const openBraces = (repaired.match(/\{/g) || []).length;
    const closeBraces = (repaired.match(/\}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/\]/g) || []).length;

    // Check for unterminated strings
    const quotes = (repaired.match(/"/g) || []).length;
    if (quotes % 2 !== 0) {
      // Odd number of quotes, add closing quote
      repaired += '"';
    }

    // Close any unclosed arrays
    for (let i = 0; i < (openBrackets - closeBrackets); i++) {
      repaired += ']';
    }

    // Close any unclosed objects
    for (let i = 0; i < (openBraces - closeBraces); i++) {
      repaired += '}';
    }

    return repaired;
  }

  /**
   * Extract the last valid JSON object by searching backwards
   */
  private extractLastValidJson(jsonStr: string): any | null {
    // Work backwards from the end to find a valid closing point
    for (let i = jsonStr.length - 1; i >= jsonStr.length / 2; i--) {
      if (jsonStr[i] === '}') {
        const testStr = jsonStr.substring(0, i + 1);
        try {
          return JSON.parse(testStr);
        } catch (e) {
          // Continue searching
        }
      }
    }
    return null;
  }
}

/**
 * Factory function to create appropriate AI adapter
 */
export function createAIAdapter(
  provider: AIProvider,
  apiKey: string,
  model?: string
): AIAdapter {
  const config = PROVIDER_CONFIGS[provider];
  const selectedModel = model || config.model;

  switch (provider) {
    case 'openai':
      return new OpenAIAdapter(apiKey, selectedModel);
    case 'claude':
      return new ClaudeAdapter(apiKey, selectedModel);
    case 'glm':
      return new GLMAdapter(apiKey, selectedModel);
    case 'openrouter':
      return new OpenRouterAdapter(apiKey, selectedModel);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
