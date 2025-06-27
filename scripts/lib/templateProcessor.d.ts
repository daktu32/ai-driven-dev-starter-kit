import { ProjectConfig } from './types.js';
export declare class TemplateProcessor {
    private readonly rootDir;
    private readonly templatesDir;
    constructor(rootDir?: string);
    processAllTemplates(config: ProjectConfig, dryRun?: boolean): Promise<string[]>;
    private findTemplateFiles;
    private extractPlaceholders;
    private processTemplate;
    private createTemplateMapping;
    private extractUsername;
    private extractProjectName;
    private createBackup;
    copyPromptFile(promptType: string, dryRun?: boolean): Promise<boolean>;
}
//# sourceMappingURL=templateProcessor.d.ts.map