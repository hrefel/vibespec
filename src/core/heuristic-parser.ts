/**
 * Heuristic parser for basic requirement analysis
 * Performs keyword extraction and rule-based structuring before AI refinement
 */

import { Domain, HeuristicOutput } from '../types';

// Known technology keywords
const TECH_KEYWORDS = [
  'react', 'vue', 'angular', 'svelte', 'next', 'nuxt',
  'node', 'express', 'nestjs', 'fastify', 'koa',
  'django', 'flask', 'fastapi', 'spring', 'laravel',
  'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp',
  'typescript', 'javascript', 'python', 'java', 'go', 'rust',
  'graphql', 'rest', 'grpc', 'websocket',
  'jest', 'mocha', 'pytest', 'junit',
];

// Domain classification patterns
const DOMAIN_PATTERNS: Record<Domain, string[]> = {
  frontend: ['ui', 'component', 'dashboard', 'page', 'responsive', 'interface', 'form', 'button', 'modal', 'layout'],
  backend: ['api', 'endpoint', 'database', 'authentication', 'service', 'server', 'auth', 'jwt', 'session'],
  fullstack: ['fullstack', 'full-stack', 'full stack', 'end-to-end', 'e2e'],
  mobile: ['mobile', 'ios', 'android', 'app', 'native', 'react native', 'flutter'],
  infrastructure: ['deployment', 'ci/cd', 'docker', 'kubernetes', 'infrastructure', 'devops', 'cloud'],
  testing: ['test', 'testing', 'qa', 'validation', 'coverage', 'unit test', 'integration test'],
  devops: ['pipeline', 'automation', 'monitoring', 'logging', 'deployment', 'cicd'],
  data: ['analytics', 'etl', 'data pipeline', 'warehouse', 'bigquery', 'spark', 'airflow'],
};

// Action verbs for requirement extraction
const ACTION_VERBS = [
  'add', 'create', 'build', 'implement', 'develop',
  'update', 'modify', 'change', 'edit',
  'delete', 'remove',
  'display', 'show', 'render', 'visualize',
  'handle', 'process', 'manage',
  'validate', 'verify', 'check',
  'integrate', 'connect',
  'support', 'enable', 'allow',
];

export class HeuristicParser {
  /**
   * Parse raw input text and extract structured information
   */
  parse(input: string): HeuristicOutput {
    const normalized = input.trim();

    if (normalized.length < 20) {
      throw new Error('Input too short. Minimum 20 characters required.');
    }

    const sentences = this.splitIntoSentences(normalized);
    const words = normalized.toLowerCase().split(/\s+/);

    return {
      title: this.extractTitle(sentences),
      domain: this.detectDomain(normalized),
      description: this.generateDescription(sentences),
      requirements: this.extractRequirements(sentences),
      components: this.extractComponents(normalized),
      tech_stack: this.detectTechStack(words),
      acceptance_criteria: this.extractAcceptanceCriteria(sentences),
      confidence: this.calculateConfidence(normalized),
    };
  }

  /**
   * Split text into sentences
   */
  private splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Extract a title from the first sentence or generate from keywords
   */
  private extractTitle(sentences: string[]): string {
    if (sentences.length === 0) return 'Untitled Requirement';

    const first = sentences[0];

    // If first sentence is short enough, use it as title
    if (first.length <= 60) {
      return this.capitalizeFirst(first);
    }

    // Extract first few words as title
    const words = first.split(/\s+/).slice(0, 8);
    return this.capitalizeFirst(words.join(' ')) + '...';
  }

  /**
   * Detect the domain based on keyword patterns
   */
  private detectDomain(text: string): Domain | undefined {
    const lower = text.toLowerCase();
    const scores: Record<Domain, number> = {
      frontend: 0,
      backend: 0,
      fullstack: 0,
      mobile: 0,
      infrastructure: 0,
      testing: 0,
      devops: 0,
      data: 0,
    };

    // Score each domain based on keyword matches
    for (const [domain, keywords] of Object.entries(DOMAIN_PATTERNS)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          scores[domain as Domain] += 1;
        }
      }
    }

    // Return domain with highest score (if any score > 0)
    const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    if (entries[0][1] > 0) {
      return entries[0][0] as Domain;
    }

    return undefined;
  }

  /**
   * Generate a description from the first few sentences
   */
  private generateDescription(sentences: string[]): string {
    if (sentences.length === 0) return '';

    // Use first 2-3 sentences as description
    const descSentences = sentences.slice(0, 3);
    const desc = descSentences.join('. ');

    if (desc.length <= 500) {
      return desc;
    }

    return desc.substring(0, 497) + '...';
  }

  /**
   * Extract requirements by finding sentences with action verbs
   */
  private extractRequirements(sentences: string[]): string[] {
    const requirements: string[] = [];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // Check if sentence contains action verbs
      const hasActionVerb = ACTION_VERBS.some(verb => {
        const pattern = new RegExp(`\\b${verb}\\b`, 'i');
        return pattern.test(lower);
      });

      if (hasActionVerb && sentence.length >= 10) {
        requirements.push(this.capitalizeFirst(sentence));
      }
    }

    // If no requirements found, use all sentences
    if (requirements.length === 0) {
      return sentences.map(s => this.capitalizeFirst(s));
    }

    return requirements;
  }

  /**
   * Extract component names using noun phrase patterns
   */
  private extractComponents(text: string): string[] {
    const components: Set<string> = new Set();

    // Look for capitalized words that might be components
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)*\b/g) || [];
    capitalizedWords.forEach(word => components.add(word));

    // Look for common component suffixes
    const patterns = [
      /(\w+)(?:Form|Table|List|Card|Modal|Panel|Service|Manager|Handler|Controller|View)/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        components.add(match[0]);
      }
    }

    return Array.from(components).slice(0, 10); // Limit to 10 components
  }

  /**
   * Detect technology stack from known keywords
   */
  private detectTechStack(words: string[]): string[] {
    const detected: Set<string> = new Set();

    for (const word of words) {
      const lower = word.toLowerCase();
      if (TECH_KEYWORDS.includes(lower)) {
        // Capitalize properly (e.g., "react" -> "React")
        detected.add(this.capitalizeFirst(lower));
      }
    }

    return Array.from(detected);
  }

  /**
   * Extract acceptance criteria from sentences with specific patterns
   */
  private extractAcceptanceCriteria(sentences: string[]): string[] {
    const criteria: string[] = [];

    for (const sentence of sentences) {
      const lower = sentence.toLowerCase();

      // Look for criteria indicators
      if (
        lower.includes('should') ||
        lower.includes('must') ||
        lower.includes('needs to') ||
        lower.includes('has to') ||
        lower.includes('required to')
      ) {
        criteria.push(this.capitalizeFirst(sentence));
      }
    }

    return criteria;
  }

  /**
   * Calculate confidence score based on information extracted
   */
  private calculateConfidence(text: string): number {
    let score = 0;
    const lower = text.toLowerCase();

    // More detail = higher confidence
    if (text.length > 100) score += 0.2;
    if (text.length > 200) score += 0.1;

    // Tech keywords found
    const techCount = TECH_KEYWORDS.filter(k => lower.includes(k)).length;
    score += Math.min(techCount * 0.1, 0.3);

    // Action verbs found
    const actionCount = ACTION_VERBS.filter(v => lower.includes(v)).length;
    score += Math.min(actionCount * 0.05, 0.2);

    // Domain keywords found
    const domainKeywords = Object.values(DOMAIN_PATTERNS).flat();
    const domainCount = domainKeywords.filter(k => lower.includes(k)).length;
    score += Math.min(domainCount * 0.05, 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * Capitalize first letter of a string
   */
  private capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
