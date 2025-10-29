/**
 * Interactive wizard for refining specs when AI is unavailable
 * Guides users through questions to create clean, executable requirements
 */

import inquirer from 'inquirer';
import { VibeSpec, HeuristicOutput } from '../types';

export class SpecWizard {
  /**
   * Run interactive wizard to refine heuristic output
   */
  async refine(input: string, heuristicOutput: HeuristicOutput): Promise<VibeSpec> {
    console.log('\n🧙 Launching Wizard Mode...');
    console.log('Let\'s refine your requirement together!\n');

    // Step 1: Confirm or edit title
    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Project title:',
        default: heuristicOutput.title || this.extractTitle(input),
        validate: (input: string) => input.length >= 5 || 'Title must be at least 5 characters',
      },
    ]);

    // Step 2: Select domain
    const { domain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'domain',
        message: 'Select the domain:',
        default: heuristicOutput.domain || 'fullstack',
        choices: [
          { name: 'Frontend (UI, components, dashboards)', value: 'frontend' },
          { name: 'Backend (APIs, services, databases)', value: 'backend' },
          { name: 'Fullstack (End-to-end features)', value: 'fullstack' },
          { name: 'Mobile (iOS, Android, React Native)', value: 'mobile' },
          { name: 'Infrastructure (DevOps, cloud, deployment)', value: 'infrastructure' },
          { name: 'Testing (QA, test suites)', value: 'testing' },
          { name: 'DevOps (CI/CD, automation)', value: 'devops' },
          { name: 'Data (Analytics, ETL, data pipelines)', value: 'data' },
        ],
      },
    ]);

    // Step 3: Confirm or edit description
    const { description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: heuristicOutput.description || input.substring(0, 200),
        validate: (input: string) =>
          (input.length >= 10 && input.length <= 500) || 'Description must be 10-500 characters',
      },
    ]);

    // Step 4: Edit requirements
    console.log('\nCurrent requirements detected:');
    const detectedReqs = heuristicOutput.requirements || this.extractRequirements(input);
    detectedReqs.forEach((req: string, idx: number) => {
      console.log(`  ${idx + 1}. ${req}`);
    });

    const { editRequirements } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'editRequirements',
        message: 'Do you want to edit the requirements?',
        default: false,
      },
    ]);

    let requirements = detectedReqs;
    if (editRequirements) {
      const { newRequirements } = await inquirer.prompt([
        {
          type: 'editor',
          name: 'newRequirements',
          message: 'Edit requirements (one per line):',
          default: detectedReqs.join('\n'),
        },
      ]);
      requirements = newRequirements
        .split('\n')
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0);
    }

    // Step 5: Tech stack
    const detectedTech = heuristicOutput.tech_stack || [];
    const { techStack } = await inquirer.prompt([
      {
        type: 'input',
        name: 'techStack',
        message: 'Tech stack (comma-separated):',
        default: detectedTech.join(', '),
        filter: (input: string) =>
          input.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0),
      },
    ]);

    // Step 6: Components
    const detectedComponents = heuristicOutput.components || [];
    const { components } = await inquirer.prompt([
      {
        type: 'input',
        name: 'components',
        message: 'Key components (comma-separated):',
        default: detectedComponents.slice(0, 10).join(', '),
        filter: (input: string) =>
          input.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0),
      },
    ]);

    // Step 7: Acceptance criteria
    const { addAcceptanceCriteria } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addAcceptanceCriteria',
        message: 'Add acceptance criteria?',
        default: true,
      },
    ]);

    let acceptanceCriteria: string[] = [];
    if (addAcceptanceCriteria) {
      const { criteria } = await inquirer.prompt([
        {
          type: 'input',
          name: 'criteria',
          message: 'Acceptance criteria (comma-separated):',
          default: 'All features implemented, Tests pass, Documentation complete',
          filter: (input: string) =>
            input.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0),
        },
      ]);
      acceptanceCriteria = criteria;
    }

    // Step 8: AI guidance (optional hints)
    const { aiGuidance } = await inquirer.prompt([
      {
        type: 'input',
        name: 'aiGuidance',
        message: 'Implementation hints or best practices (optional):',
        default: this.generateGuidance(domain, techStack),
      },
    ]);

    // Build final spec
    const spec: VibeSpec = {
      title,
      domain,
      description,
      requirements,
      components,
      tech_stack: techStack,
      acceptance_criteria: acceptanceCriteria,
      ai_guidance: aiGuidance,
    };

    console.log('\n✨ Wizard refinement complete!\n');
    return spec;
  }

  /**
   * Extract title from input text
   */
  private extractTitle(input: string): string {
    // Take first sentence or first 100 chars
    const firstSentence = input.split(/[.!?]/)[0].trim();
    return firstSentence.length > 100
      ? firstSentence.substring(0, 97) + '...'
      : firstSentence;
  }

  /**
   * Extract basic requirements from input
   */
  private extractRequirements(input: string): string[] {
    const requirements: string[] = [];

    // Look for bullet points or numbered lists
    const bulletPoints = input.match(/^[\s]*[-*•]\s+(.+)$/gm);
    if (bulletPoints) {
      requirements.push(...bulletPoints.map(bp => bp.replace(/^[\s]*[-*•]\s+/, '').trim()));
    }

    // Look for numbered lists
    const numberedItems = input.match(/^[\s]*\d+[.)]\s+(.+)$/gm);
    if (numberedItems) {
      requirements.push(...numberedItems.map(ni => ni.replace(/^[\s]*\d+[.)]\s+/, '').trim()));
    }

    // If no structured list found, split by sentences
    if (requirements.length === 0) {
      const sentences = input
        .split(/[.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 20);
      requirements.push(...sentences.slice(0, 5));
    }

    return requirements.length > 0 ? requirements : ['Implement core functionality'];
  }

  /**
   * Generate implementation guidance based on domain and tech
   */
  private generateGuidance(domain: string, techStack: string[]): string {
    const guidance: Record<string, string> = {
      frontend: 'Focus on responsive design, component reusability, and user experience.',
      backend: 'Ensure proper API design, error handling, and database optimization.',
      fullstack: 'Maintain clear separation between frontend and backend concerns.',
      mobile: 'Optimize for performance and follow platform-specific guidelines.',
      infrastructure: 'Prioritize security, scalability, and monitoring.',
      testing: 'Aim for high code coverage and include integration tests.',
      devops: 'Automate repetitive tasks and ensure reproducible deployments.',
      data: 'Focus on data quality, pipeline reliability, and efficient processing.',
    };

    const baseGuidance = guidance[domain] || 'Follow best practices and maintain code quality.';

    if (techStack.length > 0) {
      return `${baseGuidance} Consider ${techStack.slice(0, 3).join(', ')} best practices.`;
    }

    return baseGuidance;
  }
}

/**
 * Singleton instance
 */
let wizardInstance: SpecWizard | null = null;

export function getWizard(): SpecWizard {
  if (!wizardInstance) {
    wizardInstance = new SpecWizard();
  }
  return wizardInstance;
}
