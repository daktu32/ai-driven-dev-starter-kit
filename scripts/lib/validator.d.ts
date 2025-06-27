import { ProjectConfig, TechStackConfig } from './types.js';
export declare class Validator {
    static validateProjectName(name: string): string | true;
    static validateDescription(description: string): string | true;
    static validateRepositoryUrl(url: string): string | true;
    static validateTechStack(techStack: Partial<TechStackConfig>): {
        valid: boolean;
        errors: string[];
    };
    static validateProjectConfig(config: Partial<ProjectConfig>): {
        valid: boolean;
        errors: string[];
    };
    static sanitizeProjectName(name: string): string;
    static sanitizeDescription(description: string): string;
    static generateSlugFromName(name: string): string;
    static isValidGitHubUrl(url: string): boolean;
    static extractRepoInfo(url: string): {
        owner: string;
        repo: string;
    } | null;
    static validateEnvironmentVariables(envVars: Record<string, string>): {
        valid: boolean;
        missing: string[];
    };
    static validateFilePermissions(_filePath: string): Promise<boolean>;
}
//# sourceMappingURL=validator.d.ts.map