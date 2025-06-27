export class Validator {
    static validateProjectName(name) {
        if (!name || name.trim().length === 0) {
            return 'プロジェクト名は必須です';
        }
        if (name.length > 50) {
            return 'プロジェクト名は50文字以内で入力してください';
        }
        if (!/^[a-zA-Z0-9\s\-_.]+$/.test(name)) {
            return 'プロジェクト名には英数字、スペース、ハイフン、アンダースコア、ドットのみ使用できます';
        }
        return true;
    }
    static validateDescription(description) {
        if (!description || description.trim().length === 0) {
            return 'プロジェクト説明は必須です';
        }
        if (description.length > 200) {
            return '説明は200文字以内で入力してください';
        }
        return true;
    }
    static validateRepositoryUrl(url) {
        if (!url || url.trim().length === 0) {
            return 'リポジトリURLは必須です';
        }
        // URLの基本バリデーション
        try {
            new URL(url);
        }
        catch {
            return '有効なURLを入力してください';
        }
        // GitHub URLバリデーション（現状はGitHubのみ対応）
        if (!url.includes('github.com')) {
            return '現在はGitHubリポジトリのみ対応しています';
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
                errors.push(`${field}は必須項目です`);
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    static validateProjectConfig(config) {
        const errors = [];
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
            // Invalid URL
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
        // This would need to be implemented based on the specific requirements
        // For now, return true as a placeholder
        return Promise.resolve(true);
    }
}
//# sourceMappingURL=validator.js.map