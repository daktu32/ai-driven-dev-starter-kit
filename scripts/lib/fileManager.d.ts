import { ProjectConfig } from './types.js';
export declare class FileManager {
    private readonly rootDir;
    constructor(rootDir?: string);
    createBackup(filePath: string): Promise<string>;
    createBackupDirectory(): Promise<string>;
    backupAllTemplates(): Promise<string>;
    validateProjectStructure(): Promise<{
        valid: boolean;
        issues: string[];
    }>;
    removeUnusedInfrastructure(techStack: {
        infrastructure: string;
    }): Promise<string[]>;
    updateGitignore(additionalPatterns?: string[]): Promise<void>;
    createProjectConfigFile(config: ProjectConfig): Promise<void>;
    getFilesToProcess(): Promise<string[]>;
    restoreFromBackup(backupDir: string): Promise<void>;
}
//# sourceMappingURL=fileManager.d.ts.map