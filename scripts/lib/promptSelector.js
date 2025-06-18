"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptSelector = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
class PromptSelector {
    static async selectPrompt() {
        console.log('\n🎯 Prompt Selection - Choose the development approach that fits your project\n');
        const teamQuestions = [
            {
                type: 'number',
                name: 'teamSize',
                message: 'How many developers will work on this project?',
                default: 1,
                validate: (input) => input > 0 || 'Team size must be greater than 0',
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
        const answers = await inquirer_1.default.prompt(teamQuestions);
        const team = {
            size: answers.teamSize,
            type: this.getTeamType(answers.teamSize),
            industry: answers.industry,
            complianceLevel: answers.complianceLevel,
        };
        const recommendedPrompt = this.recommendPrompt(team, answers.projectType);
        console.log(`\n💡 Recommended prompt: ${recommendedPrompt}`);
        console.log(this.getPromptDescription(recommendedPrompt));
        const confirmPrompt = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'useRecommended',
                message: 'Use the recommended prompt?',
                default: true,
            },
        ]);
        let selectedPrompt = recommendedPrompt;
        if (!confirmPrompt.useRecommended) {
            const manualSelection = await inquirer_1.default.prompt([
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
    static getTeamType(size) {
        if (size === 1)
            return 'individual';
        if (size <= 3)
            return 'small';
        if (size <= 10)
            return 'medium';
        return 'large';
    }
    static recommendPrompt(team, projectType) {
        if (team.complianceLevel === 'high' || team.size > 10) {
            return 'enterprise-development';
        }
        if (projectType === 'opensource') {
            return 'opensource-development';
        }
        if (projectType === 'startup' || projectType === 'personal') {
            return 'startup-development';
        }
        return 'basic-development';
    }
    static getPromptDescription(prompt) {
        const descriptions = {
            'basic-development': '  → Perfect for small teams (1-3 developers) with straightforward workflow needs',
            'enterprise-development': '  → Designed for large teams with compliance requirements and complex governance',
            'opensource-development': '  → Optimized for community-driven projects with contributor management',
            'startup-development': '  → Focused on rapid iteration, MVP development, and fast time-to-market',
        };
        return descriptions[prompt];
    }
}
exports.PromptSelector = PromptSelector;
