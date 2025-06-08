#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const promptSelector_js_1 = require("./lib/promptSelector.js");
const templateProcessor_js_1 = require("./lib/templateProcessor.js");
const fileManager_js_1 = require("./lib/fileManager.js");
const validator_js_1 = require("./lib/validator.js");
class SetupAssistant {
    constructor() {
        this.options = this.parseCliOptions();
        this.fileManager = new fileManager_js_1.FileManager();
        this.templateProcessor = new templateProcessor_js_1.TemplateProcessor();
    }
    parseCliOptions() {
        const args = process.argv.slice(2);
        return {
            dryRun: args.includes('--dry-run'),
            skipPromptSelection: args.includes('--skip-prompt'),
            prompt: args.find(arg => arg.startsWith('--prompt='))?.split('=')[1],
            verbose: args.includes('--verbose') || args.includes('-v')
        };
    }
    async run() {
        try {
            console.log(chalk_1.default.blue('🚀 Claude Code Development Starter Kit Setup Assistant'));
            console.log(chalk_1.default.gray('This will help you customize the starter kit for your project\n'));
            if (this.options.dryRun) {
                console.log(chalk_1.default.yellow('🔍 Running in DRY RUN mode - no files will be modified\n'));
            }
            await this.validateProjectStructure();
            const projectInfo = await this.collectProjectInfo();
            const { prompt, team } = this.options.skipPromptSelection && this.options.prompt
                ? { prompt: this.options.prompt, team: { size: 1, type: 'individual', industry: 'technology', complianceLevel: 'medium' } }
                : await promptSelector_js_1.PromptSelector.selectPrompt();
            const techStack = await this.collectTechStackInfo();
            const config = {
                ...projectInfo,
                prompt,
                team,
                techStack,
                customizations: {}
            };
            await this.validateConfiguration(config);
            if (!this.options.dryRun) {
                await this.showSummaryAndConfirm(config);
            }
            const backupDir = await this.createBackup();
            await this.processTemplates(config);
            await this.copyPromptFile(config.prompt);
            await this.cleanupUnusedFiles(config);
            await this.createProjectConfig(config);
            this.showCompletionMessage(backupDir);
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Setup failed:'), error);
            process.exit(1);
        }
    }
    async validateProjectStructure() {
        const spinner = (0, ora_1.default)('Validating project structure...').start();
        const validation = await this.fileManager.validateProjectStructure();
        if (!validation.valid) {
            spinner.fail('Project structure validation failed');
            console.log(chalk_1.default.red('Issues found:'));
            validation.issues.forEach(issue => console.log(chalk_1.default.red(`  - ${issue}`)));
            throw new Error('Invalid project structure');
        }
        spinner.succeed('Project structure is valid');
    }
    async collectProjectInfo() {
        console.log(chalk_1.default.blue('\n📝 Project Information\n'));
        const questions = [
            {
                type: 'input',
                name: 'projectName',
                message: 'What is your project name?',
                validate: validator_js_1.Validator.validateProjectName,
                filter: (input) => validator_js_1.Validator.sanitizeProjectName(input)
            },
            {
                type: 'input',
                name: 'description',
                message: 'Provide a brief description of your project:',
                validate: validator_js_1.Validator.validateDescription,
                filter: (input) => validator_js_1.Validator.sanitizeDescription(input)
            },
            {
                type: 'input',
                name: 'repositoryUrl',
                message: 'What is your GitHub repository URL?',
                validate: validator_js_1.Validator.validateRepositoryUrl,
                default: (answers) => `https://github.com/your-username/${validator_js_1.Validator.generateSlugFromName(answers.projectName)}`
            }
        ];
        return await inquirer_1.default.prompt(questions);
    }
    async collectTechStackInfo() {
        console.log(chalk_1.default.blue('\n🛠️  Technology Stack\n'));
        const questions = [
            {
                type: 'list',
                name: 'frontend',
                message: 'Choose your frontend framework:',
                choices: [
                    { name: 'Next.js (React)', value: 'Next.js' },
                    { name: 'React', value: 'React' },
                    { name: 'Vue.js', value: 'Vue.js' },
                    { name: 'Angular', value: 'Angular' },
                    { name: 'Svelte', value: 'Svelte' },
                    { name: 'Other', value: 'Other' }
                ]
            },
            {
                type: 'list',
                name: 'backend',
                message: 'Choose your backend framework:',
                choices: [
                    { name: 'Node.js + Express', value: 'Node.js + Express' },
                    { name: 'Node.js + Fastify', value: 'Node.js + Fastify' },
                    { name: 'AWS Lambda', value: 'AWS Lambda' },
                    { name: 'Python + FastAPI', value: 'Python + FastAPI' },
                    { name: 'Python + Django', value: 'Python + Django' },
                    { name: 'Other', value: 'Other' }
                ]
            },
            {
                type: 'list',
                name: 'database',
                message: 'Choose your database:',
                choices: [
                    { name: 'PostgreSQL', value: 'PostgreSQL' },
                    { name: 'MySQL', value: 'MySQL' },
                    { name: 'MongoDB', value: 'MongoDB' },
                    { name: 'DynamoDB', value: 'DynamoDB' },
                    { name: 'SQLite', value: 'SQLite' },
                    { name: 'Other', value: 'Other' }
                ]
            },
            {
                type: 'list',
                name: 'infrastructure',
                message: 'Choose your infrastructure platform:',
                choices: [
                    { name: 'AWS (CDK)', value: 'AWS CDK' },
                    { name: 'AWS (Terraform)', value: 'AWS Terraform' },
                    { name: 'Google Cloud', value: 'Google Cloud' },
                    { name: 'Azure', value: 'Azure' },
                    { name: 'Vercel', value: 'Vercel' },
                    { name: 'Netlify', value: 'Netlify' },
                    { name: 'Other', value: 'Other' }
                ]
            },
            {
                type: 'list',
                name: 'deployment',
                message: 'Choose your deployment method:',
                choices: [
                    { name: 'GitHub Actions', value: 'GitHub Actions' },
                    { name: 'AWS CodePipeline', value: 'AWS CodePipeline' },
                    { name: 'GitLab CI', value: 'GitLab CI' },
                    { name: 'Jenkins', value: 'Jenkins' },
                    { name: 'Other', value: 'Other' }
                ]
            },
            {
                type: 'list',
                name: 'monitoring',
                message: 'Choose your monitoring solution:',
                choices: [
                    { name: 'CloudWatch (AWS)', value: 'CloudWatch' },
                    { name: 'DataDog', value: 'DataDog' },
                    { name: 'New Relic', value: 'New Relic' },
                    { name: 'Sentry', value: 'Sentry' },
                    { name: 'Basic logging', value: 'Basic logging' },
                    { name: 'Other', value: 'Other' }
                ]
            }
        ];
        return await inquirer_1.default.prompt(questions);
    }
    async validateConfiguration(config) {
        const spinner = (0, ora_1.default)('Validating configuration...').start();
        const validation = validator_js_1.Validator.validateProjectConfig(config);
        if (!validation.valid) {
            spinner.fail('Configuration validation failed');
            console.log(chalk_1.default.red('Validation errors:'));
            validation.errors.forEach(error => console.log(chalk_1.default.red(`  - ${error}`)));
            throw new Error('Invalid configuration');
        }
        spinner.succeed('Configuration is valid');
    }
    async showSummaryAndConfirm(config) {
        console.log(chalk_1.default.blue('\n📋 Configuration Summary\n'));
        console.log(chalk_1.default.white('Project:'));
        console.log(`  Name: ${chalk_1.default.green(config.projectName)}`);
        console.log(`  Description: ${chalk_1.default.green(config.description)}`);
        console.log(`  Repository: ${chalk_1.default.green(config.repositoryUrl)}`);
        console.log(chalk_1.default.white('\nDevelopment Approach:'));
        console.log(`  Prompt: ${chalk_1.default.green(config.prompt)}`);
        console.log(`  Team Size: ${chalk_1.default.green(config.team.size)}`);
        console.log(`  Industry: ${chalk_1.default.green(config.team.industry)}`);
        console.log(chalk_1.default.white('\nTechnology Stack:'));
        console.log(`  Frontend: ${chalk_1.default.green(config.techStack.frontend)}`);
        console.log(`  Backend: ${chalk_1.default.green(config.techStack.backend)}`);
        console.log(`  Database: ${chalk_1.default.green(config.techStack.database)}`);
        console.log(`  Infrastructure: ${chalk_1.default.green(config.techStack.infrastructure)}`);
        const confirm = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Proceed with the setup using this configuration?',
                default: true
            }
        ]);
        if (!confirm.proceed) {
            console.log(chalk_1.default.yellow('Setup cancelled by user'));
            process.exit(0);
        }
    }
    async createBackup() {
        if (this.options.dryRun) {
            console.log(chalk_1.default.yellow('Would create backup directory'));
            return 'dry-run-backup';
        }
        const spinner = (0, ora_1.default)('Creating backup of existing files...').start();
        const backupDir = await this.fileManager.backupAllTemplates();
        spinner.succeed(`Backup created: ${backupDir}`);
        return backupDir;
    }
    async processTemplates(config) {
        const spinner = (0, ora_1.default)('Processing template files...').start();
        try {
            const processedFiles = await this.templateProcessor.processAllTemplates(config, this.options.dryRun);
            if (this.options.dryRun) {
                spinner.succeed(`Would process ${processedFiles.length} files`);
            }
            else {
                spinner.succeed(`Processed ${processedFiles.length} template files`);
            }
            if (this.options.verbose) {
                console.log(chalk_1.default.gray('Processed files:'));
                processedFiles.forEach(file => console.log(chalk_1.default.gray(`  - ${file}`)));
            }
        }
        catch (error) {
            spinner.fail('Failed to process templates');
            throw error;
        }
    }
    async copyPromptFile(promptType) {
        const spinner = (0, ora_1.default)(`Setting up ${promptType} prompt...`).start();
        try {
            await this.templateProcessor.copyPromptFile(promptType, this.options.dryRun);
            if (this.options.dryRun) {
                spinner.succeed(`Would copy ${promptType} prompt to PROMPT.md`);
            }
            else {
                spinner.succeed(`Copied ${promptType} prompt to PROMPT.md`);
            }
        }
        catch (error) {
            spinner.fail('Failed to copy prompt file');
            throw error;
        }
    }
    async cleanupUnusedFiles(config) {
        const spinner = (0, ora_1.default)('Cleaning up unused files...').start();
        try {
            if (!this.options.dryRun) {
                const removedFiles = await this.fileManager.removeUnusedInfrastructure(config.techStack);
                if (removedFiles.length > 0) {
                    spinner.succeed(`Removed ${removedFiles.length} unused infrastructure files`);
                }
                else {
                    spinner.succeed('No unused files to remove');
                }
            }
            else {
                spinner.succeed('Would clean up unused files');
            }
        }
        catch (error) {
            spinner.fail('Failed to clean up files');
            throw error;
        }
    }
    async createProjectConfig(config) {
        if (this.options.dryRun) {
            console.log(chalk_1.default.yellow('Would create .claude/project-config.json'));
            return;
        }
        const spinner = (0, ora_1.default)('Creating project configuration...').start();
        try {
            await this.fileManager.createProjectConfigFile(config);
            await this.fileManager.updateGitignore(['.claude/project-config.json']);
            spinner.succeed('Created project configuration file');
        }
        catch (error) {
            spinner.fail('Failed to create project configuration');
            throw error;
        }
    }
    showCompletionMessage(backupDir) {
        console.log(chalk_1.default.green('\n✅ Setup completed successfully!\n'));
        if (!this.options.dryRun) {
            console.log(chalk_1.default.white('What was done:'));
            console.log(chalk_1.default.gray('  ✓ Created backup of original files'));
            console.log(chalk_1.default.gray('  ✓ Processed all template files with your configuration'));
            console.log(chalk_1.default.gray('  ✓ Copied selected development prompt'));
            console.log(chalk_1.default.gray('  ✓ Cleaned up unused infrastructure files'));
            console.log(chalk_1.default.gray('  ✓ Created project configuration file'));
            console.log(chalk_1.default.white('\nNext steps:'));
            console.log(chalk_1.default.gray('  1. Review the updated files'));
            console.log(chalk_1.default.gray('  2. Install project dependencies'));
            console.log(chalk_1.default.gray('  3. Set up your development environment'));
            console.log(chalk_1.default.gray('  4. Start developing with Claude Code!'));
            console.log(chalk_1.default.white(`\nBackup location: ${chalk_1.default.blue(backupDir)}`));
            console.log(chalk_1.default.gray('You can restore from backup if needed'));
        }
        else {
            console.log(chalk_1.default.yellow('This was a dry run - no files were actually modified.'));
            console.log(chalk_1.default.gray('Run without --dry-run to apply the changes.'));
        }
        console.log(chalk_1.default.blue('\n🤖 Ready for Claude Code development!'));
    }
}
if (require.main === module) {
    const assistant = new SetupAssistant();
    assistant.run().catch(error => {
        console.error(chalk_1.default.red('Fatal error:'), error);
        process.exit(1);
    });
}
exports.default = SetupAssistant;
