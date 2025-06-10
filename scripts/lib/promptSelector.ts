import inquirer from 'inquirer';
import { PromptType, TeamConfig } from './types.js';

export class PromptSelector {
  static async selectPrompt(): Promise<{ prompt: PromptType; team: TeamConfig }> {
    console.log('\n🎯 Prompt Selection - Choose the development approach that fits your project\n');

    const teamQuestions = [
      {
        type: 'number',
        name: 'teamSize',
        message: 'How many developers will work on this project?',
        default: 1,
        validate: (input: number) => input > 0 || 'Team size must be greater than 0',
      },
      {
        type: 'list',
        name: 'industry',
        message: 'What industry/domain is this project for?',
        choices: [
          { name: 'Technology/Software', value: 'technology' },
          { name: 'Finance/Banking', value: 'finance' },
          { name: 'Healthcare', value: 'healthcare' },
          { name: 'Education', value: 'education' },
          { name: 'E-commerce/Retail', value: 'ecommerce' },
          { name: 'Government/Public', value: 'government' },
          { name: 'Entertainment/Media', value: 'entertainment' },
          { name: 'Other', value: 'other' },
        ],
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project is this?',
        choices: [
          { name: 'Personal/Learning project', value: 'personal' },
          { name: 'Open source project', value: 'opensource' },
          { name: 'Startup/MVP', value: 'startup' },
          { name: 'Enterprise application', value: 'enterprise' },
          { name: 'Client project', value: 'client' },
        ],
      },
      {
        type: 'list',
        name: 'complianceLevel',
        message: 'What level of compliance/governance do you need?',
        choices: [
          { name: 'Low - Minimal documentation, fast iteration', value: 'low' },
          { name: 'Medium - Standard practices, moderate documentation', value: 'medium' },
          { name: 'High - Strict compliance, comprehensive documentation', value: 'high' },
        ],
      },
    ];

    const answers = await inquirer.prompt(teamQuestions);

    const team: TeamConfig = {
      size: answers.teamSize,
      type: this.getTeamType(answers.teamSize),
      industry: answers.industry,
      complianceLevel: answers.complianceLevel,
    };

    const recommendedPrompt = this.recommendPrompt(team, answers.projectType);

    console.log(`\n💡 Recommended prompt: ${recommendedPrompt}`);
    console.log(this.getPromptDescription(recommendedPrompt));

    const confirmPrompt = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useRecommended',
        message: 'Use the recommended prompt?',
        default: true,
      },
    ]);

    let selectedPrompt = recommendedPrompt;

    if (!confirmPrompt.useRecommended) {
      const manualSelection = await inquirer.prompt([
        {
          type: 'list',
          name: 'prompt',
          message: 'Choose a different prompt:',
          choices: [
            {
              name: 'Basic Development - Small teams, simple workflow',
              value: 'basic-development',
            },
            {
              name: 'Enterprise Development - Large teams, compliance focus',
              value: 'enterprise-development',
            },
            {
              name: 'Open Source Development - Community-driven projects',
              value: 'opensource-development',
            },
            {
              name: 'Startup Development - Fast iteration, MVP focus',
              value: 'startup-development',
            },
          ],
        },
      ]);
      selectedPrompt = manualSelection.prompt;
    }

    return { prompt: selectedPrompt, team };
  }

  private static getTeamType(size: number): TeamConfig['type'] {
    if (size === 1) return 'individual';
    if (size <= 3) return 'small';
    if (size <= 10) return 'medium';
    return 'large';
  }

  private static recommendPrompt(team: TeamConfig, projectType: string): PromptType {
    // Enterprise prompt for high compliance or large teams
    if (team.complianceLevel === 'high' || team.size > 10) {
      return 'enterprise-development';
    }

    // Open source prompt for open source projects
    if (projectType === 'opensource') {
      return 'opensource-development';
    }

    // Startup prompt for MVP/startup projects
    if (projectType === 'startup' || projectType === 'personal') {
      return 'startup-development';
    }

    // Default to basic for most other cases
    return 'basic-development';
  }

  private static getPromptDescription(prompt: PromptType): string {
    const descriptions = {
      'basic-development':
        '  → Perfect for small teams (1-3 developers) with straightforward workflow needs',
      'enterprise-development':
        '  → Designed for large teams with compliance requirements and complex governance',
      'opensource-development':
        '  → Optimized for community-driven projects with contributor management',
      'startup-development':
        '  → Focused on rapid iteration, MVP development, and fast time-to-market',
    };

    return descriptions[prompt];
  }
}
