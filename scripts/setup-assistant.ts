#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { PromptSelector } from './lib/promptSelector.js';
import { TemplateProcessor } from './lib/templateProcessor.js';
import { FileManager } from './lib/fileManager.js';
import { Validator } from './lib/validator.js';
import { ProjectConfig, SetupOptions, TechStackConfig } from './lib/types.js';

class SetupAssistant {
  private options: SetupOptions;
  private fileManager: FileManager;
  private templateProcessor: TemplateProcessor;

  constructor() {
    this.options = this.parseCliOptions();
    this.fileManager = new FileManager();
    this.templateProcessor = new TemplateProcessor();
  }

  private parseCliOptions(): SetupOptions {
    const args = process.argv.slice(2);
    return {
      dryRun: args.includes('--dry-run'),
      skipPromptSelection: args.includes('--skip-prompt'),
      prompt: args.find(arg => arg.startsWith('--prompt='))?.split('=')[1] as any,
      verbose: args.includes('--verbose') || args.includes('-v')
    };
  }

  async run(): Promise<void> {
    try {
      console.log(chalk.blue('🚀 Claude Code Development Starter Kit Setup Assistant'));
      console.log(chalk.gray('This will help you customize the starter kit for your project\n'));

      if (this.options.dryRun) {
        console.log(chalk.yellow('🔍 Running in DRY RUN mode - no files will be modified\n'));
      }

      // Validate project structure
      await this.validateProjectStructure();

      // Collect project information
      const projectInfo = await this.collectProjectInfo();

      // Select or confirm prompt
      const { prompt, team } = this.options.skipPromptSelection && this.options.prompt
        ? { prompt: this.options.prompt, team: { size: 1, type: 'individual', industry: 'technology', complianceLevel: 'medium' } as any }
        : await PromptSelector.selectPrompt();

      // Collect tech stack information
      const techStack = await this.collectTechStackInfo();

      // Create project configuration
      const config: ProjectConfig = {
        ...projectInfo,
        prompt,
        team,
        techStack,
        customizations: {}
      };

      // Validate configuration
      await this.validateConfiguration(config);

      // Show summary and confirm
      if (!this.options.dryRun) {
        await this.showSummaryAndConfirm(config);
      }

      // Create backup
      const backupDir = await this.createBackup();

      // Process templates
      await this.processTemplates(config);

      // Copy selected prompt file
      await this.copyPromptFile(config.prompt);

      // Clean up unused files
      await this.cleanupUnusedFiles(config);

      // Create project configuration file
      await this.createProjectConfig(config);

      // Show completion message
      this.showCompletionMessage(backupDir);

    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error);
      process.exit(1);
    }
  }

  private async validateProjectStructure(): Promise<void> {
    const spinner = ora('Validating project structure...').start();
    
    const validation = await this.fileManager.validateProjectStructure();
    
    if (!validation.valid) {
      spinner.fail('Project structure validation failed');
      console.log(chalk.red('Issues found:'));
      validation.issues.forEach(issue => console.log(chalk.red(`  - ${issue}`)));
      throw new Error('Invalid project structure');
    }
    
    spinner.succeed('Project structure is valid');
  }

  private async collectProjectInfo(): Promise<Omit<ProjectConfig, 'prompt' | 'team' | 'techStack' | 'customizations'>> {
    console.log(chalk.blue('\n📝 Project Information\n'));

    const questions = [
      {
        type: 'input',
        name: 'projectName',
        message: 'What is your project name?',
        validate: Validator.validateProjectName,
        filter: (input: string) => Validator.sanitizeProjectName(input)
      },
      {
        type: 'input',
        name: 'description',
        message: 'Provide a brief description of your project:',
        validate: Validator.validateDescription,
        filter: (input: string) => Validator.sanitizeDescription(input)
      },
      {
        type: 'input',
        name: 'repositoryUrl',
        message: 'What is your GitHub repository URL?',
        validate: Validator.validateRepositoryUrl,
        default: (answers: any) => `https://github.com/your-username/${Validator.generateSlugFromName(answers.projectName)}`
      }
    ];

    return await inquirer.prompt(questions);
  }

  private async collectTechStackInfo(): Promise<TechStackConfig> {
    console.log(chalk.blue('\n🛠️  Technology Stack\n'));

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

    return await inquirer.prompt(questions);
  }

  private async validateConfiguration(config: ProjectConfig): Promise<void> {
    const spinner = ora('Validating configuration...').start();

    const validation = Validator.validateProjectConfig(config);
    
    if (!validation.valid) {
      spinner.fail('Configuration validation failed');
      console.log(chalk.red('Validation errors:'));
      validation.errors.forEach(error => console.log(chalk.red(`  - ${error}`)));
      throw new Error('Invalid configuration');
    }

    spinner.succeed('Configuration is valid');
  }

  private async showSummaryAndConfirm(config: ProjectConfig): Promise<void> {
    console.log(chalk.blue('\n📋 Configuration Summary\n'));
    
    console.log(chalk.white('Project:'));
    console.log(`  Name: ${chalk.green(config.projectName)}`);
    console.log(`  Description: ${chalk.green(config.description)}`);
    console.log(`  Repository: ${chalk.green(config.repositoryUrl)}`);
    
    console.log(chalk.white('\nDevelopment Approach:'));
    console.log(`  Prompt: ${chalk.green(config.prompt)}`);
    console.log(`  Team Size: ${chalk.green(config.team.size)}`);
    console.log(`  Industry: ${chalk.green(config.team.industry)}`);
    
    console.log(chalk.white('\nTechnology Stack:'));
    console.log(`  Frontend: ${chalk.green(config.techStack.frontend)}`);
    console.log(`  Backend: ${chalk.green(config.techStack.backend)}`);
    console.log(`  Database: ${chalk.green(config.techStack.database)}`);
    console.log(`  Infrastructure: ${chalk.green(config.techStack.infrastructure)}`);

    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with the setup using this configuration?',
        default: true
      }
    ]);

    if (!confirm.proceed) {
      console.log(chalk.yellow('Setup cancelled by user'));
      process.exit(0);
    }
  }

  private async createBackup(): Promise<string> {
    if (this.options.dryRun) {
      console.log(chalk.yellow('Would create backup directory'));
      return 'dry-run-backup';
    }

    const spinner = ora('Creating backup of existing files...').start();
    const backupDir = await this.fileManager.backupAllTemplates();
    spinner.succeed(`Backup created: ${backupDir}`);
    return backupDir;
  }

  private async processTemplates(config: ProjectConfig): Promise<void> {
    const spinner = ora('Processing template files...').start();
    
    try {
      const processedFiles = await this.templateProcessor.processAllTemplates(config, this.options.dryRun);
      
      if (this.options.dryRun) {
        spinner.succeed(`Would process ${processedFiles.length} files`);
      } else {
        spinner.succeed(`Processed ${processedFiles.length} template files`);
      }
      
      if (this.options.verbose) {
        console.log(chalk.gray('Processed files:'));
        processedFiles.forEach(file => console.log(chalk.gray(`  - ${file}`)));
      }
    } catch (error) {
      spinner.fail('Failed to process templates');
      throw error;
    }
  }

  private async copyPromptFile(promptType: string): Promise<void> {
    const spinner = ora(`Setting up ${promptType} prompt...`).start();
    
    try {
      await this.templateProcessor.copyPromptFile(promptType, this.options.dryRun);
      
      if (this.options.dryRun) {
        spinner.succeed(`Would copy ${promptType} prompt to PROMPT.md`);
      } else {
        spinner.succeed(`Copied ${promptType} prompt to PROMPT.md`);
      }
    } catch (error) {
      spinner.fail('Failed to copy prompt file');
      throw error;
    }
  }

  private async cleanupUnusedFiles(config: ProjectConfig): Promise<void> {
    const spinner = ora('Cleaning up unused files...').start();
    
    try {
      if (!this.options.dryRun) {
        const removedFiles = await this.fileManager.removeUnusedInfrastructure(config.techStack);
        if (removedFiles.length > 0) {
          spinner.succeed(`Removed ${removedFiles.length} unused infrastructure files`);
        } else {
          spinner.succeed('No unused files to remove');
        }
      } else {
        spinner.succeed('Would clean up unused files');
      }
    } catch (error) {
      spinner.fail('Failed to clean up files');
      throw error;
    }
  }

  private async createProjectConfig(config: ProjectConfig): Promise<void> {
    if (this.options.dryRun) {
      console.log(chalk.yellow('Would create .claude/project-config.json'));
      return;
    }

    const spinner = ora('Creating project configuration...').start();
    
    try {
      await this.fileManager.createProjectConfigFile(config);
      await this.fileManager.updateGitignore(['.claude/project-config.json']);
      spinner.succeed('Created project configuration file');
    } catch (error) {
      spinner.fail('Failed to create project configuration');
      throw error;
    }
  }

  private showCompletionMessage(backupDir: string): void {
    console.log(chalk.green('\n✅ Setup completed successfully!\n'));
    
    if (!this.options.dryRun) {
      console.log(chalk.white('What was done:'));
      console.log(chalk.gray('  ✓ Created backup of original files'));
      console.log(chalk.gray('  ✓ Processed all template files with your configuration'));
      console.log(chalk.gray('  ✓ Copied selected development prompt'));
      console.log(chalk.gray('  ✓ Cleaned up unused infrastructure files'));
      console.log(chalk.gray('  ✓ Created project configuration file'));
      
      console.log(chalk.white('\nNext steps:'));
      console.log(chalk.gray('  1. Review the updated files'));
      console.log(chalk.gray('  2. Install project dependencies'));
      console.log(chalk.gray('  3. Set up your development environment'));
      console.log(chalk.gray('  4. Start developing with Claude Code!'));
      
      console.log(chalk.white(`\nBackup location: ${chalk.blue(backupDir)}`));
      console.log(chalk.gray('You can restore from backup if needed'));
    } else {
      console.log(chalk.yellow('This was a dry run - no files were actually modified.'));
      console.log(chalk.gray('Run without --dry-run to apply the changes.'));
    }
    
    console.log(chalk.blue('\n🤖 Ready for Claude Code development!'));
  }
}

// Run the setup assistant
if (require.main === module) {
  const assistant = new SetupAssistant();
  assistant.run().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

export default SetupAssistant;