/**
 * AI adapter system for multiple providers
 * Provides unified interface for OpenAI, Claude, and GLM
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, HeuristicOutput, VibeSpec, PROVIDER_CONFIGS } from '../types';

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
        max_tokens: 2000,
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
    return `Given the following raw requirement and preliminary heuristic analysis, refine it into a structured spec.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Refine this into a complete spec with the following structure:
{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "One of: frontend, backend, fullstack, mobile, infrastructure, testing, devops, data",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],
  "acceptance_criteria": ["Conditions for completion"],
  "ai_guidance": "Implementation hints or best practices"
}

Ensure all required fields (title, domain, description, requirements) are present.
Output valid JSON only.`;
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
        max_tokens: 2000,
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
    return `You are a requirement analyzer. Given the following raw requirement and preliminary heuristic analysis, refine it into a structured spec.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Refine this into a complete spec with the following JSON structure:
{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "One of: frontend, backend, fullstack, mobile, infrastructure, testing, devops, data",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],
  "acceptance_criteria": ["Conditions for completion"],
  "ai_guidance": "Implementation hints or best practices"
}

Ensure all required fields (title, domain, description, requirements) are present.
Output ONLY valid JSON, no other text or markdown.`;
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
          max_tokens: 2000,
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
    return `Given the following raw requirement and preliminary heuristic analysis, refine it into a structured spec.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Refine this into a complete spec with the following JSON structure:
{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "One of: frontend, backend, fullstack, mobile, infrastructure, testing, devops, data",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],
  "acceptance_criteria": ["Conditions for completion"],
  "ai_guidance": "Implementation hints or best practices"
}

Ensure all required fields (title, domain, description, requirements) are present.
Output ONLY valid JSON, no other text or markdown.`;
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
              content: 'You are a requirement analyzer. Output valid JSON only, no markdown or code blocks. Ensure all strings are properly escaped and terminated.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;

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
    return `Given the following raw requirement and preliminary heuristic analysis, refine it into a structured spec.

Raw Input:
${input}

Heuristic Parse:
${JSON.stringify(heuristic, null, 2)}

Refine this into a complete spec with the following JSON structure:
{
  "title": "Short descriptive title (5-100 chars)",
  "domain": "One of: frontend, backend, fullstack, mobile, infrastructure, testing, devops, data",
  "description": "Concise overview (10-500 chars)",
  "requirements": ["List of concrete functional requirements"],
  "components": ["Logical or UI components involved"],
  "tech_stack": ["Technologies or frameworks detected"],
  "acceptance_criteria": ["Conditions for completion"],
  "ai_guidance": "Implementation hints or best practices"
}

Ensure all required fields (title, domain, description, requirements) are present.
Output ONLY valid JSON, no other text or markdown.`;
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

      // Attempt to parse - if it fails due to unterminated strings, try repairs
      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch (firstError) {
        const errorMsg = (firstError as Error).message;

        // Check if it's an unterminated string error
        if (errorMsg.includes('Unterminated string') || errorMsg.includes('Unexpected end')) {
          console.warn('⚠️  Detected incomplete JSON from OpenRouter, attempting repair...');

          // Strategy 1: Try to close unterminated strings and objects
          let repairedJson = this.repairIncompleteJson(jsonStr);

          try {
            parsed = JSON.parse(repairedJson);
            console.log('✓ Successfully repaired JSON');
          } catch (secondError) {
            // Strategy 2: Find the last valid complete object
            parsed = this.extractLastValidJson(jsonStr);

            if (!parsed) {
              // Log detailed error for debugging
              console.error('\n[OpenRouter Parse Error]');
              console.error('Error:', errorMsg);
              console.error('Raw content (first 500 chars):', content.substring(0, 500));
              console.error('Extracted JSON (first 500 chars):', jsonStr.substring(0, 500));
              throw firstError;
            }
          }
        } else {
          throw firstError;
        }
      }

      // Validate required fields
      if (!parsed.title || !parsed.domain || !parsed.description || !parsed.requirements) {
        throw new Error('Missing required fields in AI response');
      }

      return parsed as VibeSpec;
    } catch (error) {
      throw new Error(`Failed to parse OpenRouter response: ${(error as Error).message}. Raw content preview: ${content.substring(0, 200)}`);
    }
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
