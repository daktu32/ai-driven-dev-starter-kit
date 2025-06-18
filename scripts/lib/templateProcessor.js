"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateProcessor = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const mustache_1 = __importDefault(require("mustache"));
const glob_1 = require("glob");
class TemplateProcessor {
    constructor(rootDir = process.cwd()) {
        if (path_1.default.basename(rootDir) === 'scripts') {
            this.rootDir = path_1.default.dirname(rootDir);
        }
        else {
            this.rootDir = rootDir;
        }
        this.templatesDir = path_1.default.join(this.rootDir, 'scripts', 'templates');
    }
    async processAllTemplates(config, dryRun = false) {
        const templateFiles = await this.findTemplateFiles();
        const processedFiles = [];
        for (const template of templateFiles) {
            try {
                const processed = await this.processTemplate(template, config, dryRun);
                if (processed) {
                    processedFiles.push(template.path);
                }
            }
            catch (error) {
                console.error(`Failed to process ${template.path}:`, error);
            }
        }
        return processedFiles;
    }
    async findTemplateFiles() {
        const templatePatterns = [
            'CLAUDE.md',
            'README.md',
            'docs/**/*.md',
            'prompts/**/*.md',
            '.claude/**/*.template',
            'infrastructure/**/*.template',
            '.github/**/*.template',
        ];
        const templates = [];
        for (const pattern of templatePatterns) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.rootDir,
                ignore: ['node_modules/**', 'scripts/**'],
            });
            for (const file of files) {
                const fullPath = path_1.default.join(this.rootDir, file);
                const content = await fs_extra_1.default.readFile(fullPath, 'utf-8');
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
    extractPlaceholders(content) {
        const placeholderRegex = /\[([^\]]+)\]/g;
        const placeholders = [];
        let match;
        while ((match = placeholderRegex.exec(content)) !== null) {
            if (!placeholders.includes(match[1])) {
                placeholders.push(match[1]);
            }
        }
        return placeholders;
    }
    async processTemplate(template, config, dryRun) {
        const mapping = this.createTemplateMapping(config);
        let processedContent = template.content;
        for (const placeholder of template.placeholders) {
            const regex = new RegExp(`\\[${placeholder}\\]`, 'g');
            processedContent = processedContent.replace(regex, `{{${placeholder}}}`);
        }
        const finalContent = mustache_1.default.render(processedContent, mapping);
        if (dryRun) {
            console.log(`Would update: ${template.path}`);
            console.log(`  Placeholders: ${template.placeholders.join(', ')}`);
            return true;
        }
        await this.createBackup(template.path);
        const fullPath = path_1.default.join(this.rootDir, template.path);
        await fs_extra_1.default.writeFile(fullPath, finalContent, 'utf-8');
        return true;
    }
    createTemplateMapping(config) {
        return {
            'Your project name': config.projectName,
            'Your Project Name': config.projectName,
            'project-name': config.projectName.toLowerCase().replace(/\s+/g, '-'),
            PROJECT_NAME: config.projectName.toUpperCase().replace(/\s+/g, '_'),
            'Brief description of your project': config.description,
            'your-repo-url': config.repositoryUrl,
            'your-username': this.extractUsername(config.repositoryUrl),
            'your-project': this.extractProjectName(config.repositoryUrl),
            'Frontend Framework': config.techStack.frontend,
            'Backend Framework': config.techStack.backend,
            Database: config.techStack.database,
            Infrastructure: config.techStack.infrastructure,
            'Deployment Platform': config.techStack.deployment,
            'Monitoring Solution': config.techStack.monitoring,
            'Team Size': config.team.size.toString(),
            'Team Type': config.team.type,
            Industry: config.team.industry,
            'Compliance Level': config.team.complianceLevel,
            'YYYY-MM-DD': new Date().toISOString().split('T')[0],
            'Current Date': new Date().toLocaleDateString(),
            'Current Year': new Date().getFullYear().toString(),
            placeholder: '',
            'Your value here': '',
            TODO: 'TODO',
            TBD: 'TBD',
        };
    }
    extractUsername(url) {
        try {
            const match = url.match(/github\.com\/([^/]+)/);
            return match ? match[1] : 'your-username';
        }
        catch {
            return 'your-username';
        }
    }
    extractProjectName(url) {
        try {
            const match = url.match(/github\.com\/[^/]+\/([^/]+)/);
            return match ? match[1].replace(/\.git$/, '') : 'your-project';
        }
        catch {
            return 'your-project';
        }
    }
    async createBackup(filePath) {
        const fullPath = path_1.default.join(this.rootDir, filePath);
        const backupPath = `${fullPath}.backup.${Date.now()}`;
        if (await fs_extra_1.default.pathExists(fullPath)) {
            await fs_extra_1.default.copy(fullPath, backupPath);
        }
    }
    async copyPromptFile(promptType, dryRun = false) {
        const sourceFile = path_1.default.join(this.rootDir, 'prompts', `${promptType}.md`);
        const targetFile = path_1.default.join(this.rootDir, 'PROMPT.md');
        if (!(await fs_extra_1.default.pathExists(sourceFile))) {
            throw new Error(`Prompt file not found: ${sourceFile}`);
        }
        if (dryRun) {
            console.log(`Would copy ${sourceFile} to ${targetFile}`);
            return true;
        }
        if (await fs_extra_1.default.pathExists(targetFile)) {
            await this.createBackup('PROMPT.md');
        }
        await fs_extra_1.default.copy(sourceFile, targetFile);
        return true;
    }
}
exports.TemplateProcessor = TemplateProcessor;
