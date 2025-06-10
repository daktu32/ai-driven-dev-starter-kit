import fs from 'fs-extra';
import path from 'path';
import Mustache from 'mustache';
import { glob } from 'glob';
import { ProjectConfig, TemplateMapping, FileTemplate } from './types.js';

export class TemplateProcessor {
  private readonly rootDir: string;
  private readonly templatesDir: string;

  constructor(rootDir: string = process.cwd()) {
    // If running from scripts directory, use parent directory as root
    if (path.basename(rootDir) === 'scripts') {
      this.rootDir = path.dirname(rootDir);
    } else {
      this.rootDir = rootDir;
    }
    this.templatesDir = path.join(this.rootDir, 'scripts', 'templates');
  }

  async processAllTemplates(config: ProjectConfig, dryRun: boolean = false): Promise<string[]> {
    const templateFiles = await this.findTemplateFiles();
    const processedFiles: string[] = [];

    for (const template of templateFiles) {
      try {
        const processed = await this.processTemplate(template, config, dryRun);
        if (processed) {
          processedFiles.push(template.path);
        }
      } catch (error) {
        console.error(`Failed to process ${template.path}:`, error);
      }
    }

    return processedFiles;
  }

  private async findTemplateFiles(): Promise<FileTemplate[]> {
    const templatePatterns = [
      'CLAUDE.md',
      'README.md',
      'docs/**/*.md',
      'prompts/**/*.md',
      '.claude/**/*.template',
      'infrastructure/**/*.template',
      '.github/**/*.template',
    ];

    const templates: FileTemplate[] = [];

    for (const pattern of templatePatterns) {
      const files = await glob(pattern, {
        cwd: this.rootDir,
        ignore: ['node_modules/**', 'scripts/**'],
      });

      for (const file of files) {
        const fullPath = path.join(this.rootDir, file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const placeholders = this.extractPlaceholders(content);

        if (placeholders.length > 0) {
          templates.push({
            path: file,
            content,
            placeholders,
          });
        }
      }
    }

    return templates;
  }

  private extractPlaceholders(content: string): string[] {
    const placeholderRegex = /\[([^\]]+)\]/g;
    const placeholders: string[] = [];
    let match;

    while ((match = placeholderRegex.exec(content)) !== null) {
      if (!placeholders.includes(match[1])) {
        placeholders.push(match[1]);
      }
    }

    return placeholders;
  }

  private async processTemplate(
    template: FileTemplate,
    config: ProjectConfig,
    dryRun: boolean,
  ): Promise<boolean> {
    const mapping = this.createTemplateMapping(config);

    // Convert [placeholder] format to {{placeholder}} for Mustache
    let processedContent = template.content;

    // Replace placeholders with Mustache syntax
    for (const placeholder of template.placeholders) {
      const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
      processedContent = processedContent.replace(regex, `{{${placeholder}}}`);
    }

    // Process with Mustache
    const finalContent = Mustache.render(processedContent, mapping);

    if (dryRun) {
      console.log(`Would update: ${template.path}`);
      console.log(`  Placeholders: ${template.placeholders.join(', ')}`);
      return true;
    }

    // Create backup
    await this.createBackup(template.path);

    // Write processed content
    const fullPath = path.join(this.rootDir, template.path);
    await fs.writeFile(fullPath, finalContent, 'utf-8');

    return true;
  }

  private createTemplateMapping(config: ProjectConfig): TemplateMapping {
    return {
      // Project basics
      'Your project name': config.projectName,
      'Your Project Name': config.projectName,
      'project-name': config.projectName.toLowerCase().replace(/\s+/g, '-'),
      PROJECT_NAME: config.projectName.toUpperCase().replace(/\s+/g, '_'),
      'Brief description of your project': config.description,
      'your-repo-url': config.repositoryUrl,
      'your-username': this.extractUsername(config.repositoryUrl),
      'your-project': this.extractProjectName(config.repositoryUrl),

      // Tech stack
      'Frontend Framework': config.techStack.frontend,
      'Backend Framework': config.techStack.backend,
      Database: config.techStack.database,
      Infrastructure: config.techStack.infrastructure,
      'Deployment Platform': config.techStack.deployment,
      'Monitoring Solution': config.techStack.monitoring,

      // Team info
      'Team Size': config.team.size.toString(),
      'Team Type': config.team.type,
      Industry: config.team.industry,
      'Compliance Level': config.team.complianceLevel,

      // Dates
      'YYYY-MM-DD': new Date().toISOString().split('T')[0],
      'Current Date': new Date().toLocaleDateString(),
      'Current Year': new Date().getFullYear().toString(),

      // Common placeholders
      placeholder: '',
      'Your value here': '',
      TODO: 'TODO',
      TBD: 'TBD',
    };
  }

  private extractUsername(url: string): string {
    try {
      const match = url.match(/github\.com\/([^/]+)/);
      return match ? match[1] : 'your-username';
    } catch {
      return 'your-username';
    }
  }

  private extractProjectName(url: string): string {
    try {
      const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
      return match ? match[1].replace(/\.git$/, '') : 'your-project';
    } catch {
      return 'your-project';
    }
  }

  private async createBackup(filePath: string): Promise<void> {
    const fullPath = path.join(this.rootDir, filePath);
    const backupPath = `${fullPath}.backup.${Date.now()}`;

    if (await fs.pathExists(fullPath)) {
      await fs.copy(fullPath, backupPath);
    }
  }

  async copyPromptFile(promptType: string, dryRun: boolean = false): Promise<boolean> {
    const sourceFile = path.join(this.rootDir, 'prompts', `${promptType}.md`);
    const targetFile = path.join(this.rootDir, 'PROMPT.md');

    if (!(await fs.pathExists(sourceFile))) {
      throw new Error(`Prompt file not found: ${sourceFile}`);
    }

    if (dryRun) {
      console.log(`Would copy ${sourceFile} to ${targetFile}`);
      return true;
    }

    // Create backup of existing PROMPT.md
    if (await fs.pathExists(targetFile)) {
      await this.createBackup('PROMPT.md');
    }

    await fs.copy(sourceFile, targetFile);
    return true;
  }
}
