"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
class Validator {
    static validateProjectName(name) {
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
    static validateDescription(description) {
        if (!description || description.trim().length === 0) {
            return 'Project description is required';
        }
        if (description.length > 200) {
            return 'Description should be 200 characters or less';
        }
        return true;
    }
    static validateRepositoryUrl(url) {
        if (!url || url.trim().length === 0) {
            return 'Repository URL is required';
        }
        try {
            new URL(url);
        }
        catch {
            return 'Please enter a valid URL';
        }
        if (!url.includes('github.com')) {
            return 'Currently only GitHub repositories are supported';
        }
        return true;
    }
    static validateTechStack(techStack) {
        const errors = [];
        const requiredFields = [
            'frontend',
            'backend',
            'database',
            'infrastructure',
            'deployment',
            'monitoring',
        ];
        for (const field of requiredFields) {
            if (!techStack[field] ||
                techStack[field]?.trim().length === 0) {
                errors.push(`${field} is required`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static validateProjectConfig(config) {
        const errors = [];
        const nameValidation = this.validateProjectName(config.projectName || '');
        if (nameValidation !== true) {
            errors.push(nameValidation);
        }
        const descValidation = this.validateDescription(config.description || '');
        if (descValidation !== true) {
            errors.push(descValidation);
        }
        const urlValidation = this.validateRepositoryUrl(config.repositoryUrl || '');
        if (urlValidation !== true) {
            errors.push(urlValidation);
        }
        if (config.techStack) {
            const techStackValidation = this.validateTechStack(config.techStack);
            errors.push(...techStackValidation.errors);
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static sanitizeProjectName(name) {
        return name
            .trim()
            .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
            .substring(0, 50);
    }
    static sanitizeDescription(description) {
        return description.trim().substring(0, 200);
    }
    static generateSlugFromName(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    static isValidGitHubUrl(url) {
        const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/;
        return githubRegex.test(url);
    }
    static extractRepoInfo(url) {
        try {
            const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
            if (match) {
                return {
                    owner: match[1],
                    repo: match[2].replace(/\.git$/, ''),
                };
            }
        }
        catch {
        }
        return null;
    }
    static validateEnvironmentVariables(envVars) {
        const required = ['NODE_ENV'];
        const missing = required.filter((key) => !envVars[key]);
        return {
            valid: missing.length === 0,
            missing,
        };
    }
    static validateFilePermissions(_filePath) {
        return Promise.resolve(true);
    }
}
exports.Validator = Validator;
