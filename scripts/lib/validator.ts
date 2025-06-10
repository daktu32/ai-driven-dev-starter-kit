import { ProjectConfig, TechStackConfig } from './types.js';

export class Validator {
  static validateProjectName(name: string): string | true {
    if (!name || name.trim().length === 0) {
      return 'Project name is required';
    }

    if (name.length > 50) {
      return 'Project name should be 50 characters or less';
    }

    if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name)) {
      return 'Project name can only contain letters, numbers, spaces, hyphens, underscores, and dots';
    }

    return true;
  }

  static validateDescription(description: string): string | true {
    if (!description || description.trim().length === 0) {
      return 'Project description is required';
    }

    if (description.length > 200) {
      return 'Description should be 200 characters or less';
    }

    return true;
  }

  static validateRepositoryUrl(url: string): string | true {
    if (!url || url.trim().length === 0) {
      return 'Repository URL is required';
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      return 'Please enter a valid URL';
    }

    // GitHub URL validation (optional - could support other platforms)
    if (!url.includes('github.com')) {
      return 'Currently only GitHub repositories are supported';
    }

    return true;
  }

  static validateTechStack(techStack: Partial<TechStackConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const requiredFields = [
      'frontend',
      'backend',
      'database',
      'infrastructure',
      'deployment',
      'monitoring',
    ];

    for (const field of requiredFields) {
      if (
        !techStack[field as keyof TechStackConfig] ||
        techStack[field as keyof TechStackConfig]?.trim().length === 0
      ) {
        errors.push(`${field} is required`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateProjectConfig(config: Partial<ProjectConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate project name
    const nameValidation = this.validateProjectName(config.projectName || '');
    if (nameValidation !== true) {
      errors.push(nameValidation);
    }

    // Validate description
    const descValidation = this.validateDescription(config.description || '');
    if (descValidation !== true) {
      errors.push(descValidation);
    }

    // Validate repository URL
    const urlValidation = this.validateRepositoryUrl(config.repositoryUrl || '');
    if (urlValidation !== true) {
      errors.push(urlValidation);
    }

    // Validate tech stack
    if (config.techStack) {
      const techStackValidation = this.validateTechStack(config.techStack);
      errors.push(...techStackValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static sanitizeProjectName(name: string): string {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
      .substring(0, 50);
  }

  static sanitizeDescription(description: string): string {
    return description.trim().substring(0, 200);
  }

  static generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  static isValidGitHubUrl(url: string): boolean {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
    return githubRegex.test(url);
  }

  static extractRepoInfo(url: string): { owner: string; repo: string } | null {
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace(/\.git$/, ''),
        };
      }
    } catch {
      // Invalid URL
    }
    return null;
  }

  static validateEnvironmentVariables(envVars: Record<string, string>): {
    valid: boolean;
    missing: string[];
  } {
    const required = ['NODE_ENV'];
    const missing = required.filter((key) => !envVars[key]);

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  static validateFilePermissions(_filePath: string): Promise<boolean> {
    // This would need to be implemented based on the specific requirements
    // For now, return true as a placeholder
    return Promise.resolve(true);
  }
}
