"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class FileManager {
    constructor(rootDir = process.cwd()) {
        if (path_1.default.basename(rootDir) === 'scripts') {
            this.rootDir = path_1.default.dirname(rootDir);
        }
        else {
            this.rootDir = rootDir;
        }
    }
    async createBackup(filePath) {
        const fullPath = path_1.default.resolve(this.rootDir, filePath);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = `${fullPath}.backup.${timestamp}`;
        if (await fs_extra_1.default.pathExists(fullPath)) {
            await fs_extra_1.default.copy(fullPath, backupPath);
            return backupPath;
        }
        return '';
    }
    async createBackupDirectory() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path_1.default.join(this.rootDir, '.backups', `setup-${timestamp}`);
        await fs_extra_1.default.ensureDir(backupDir);
        return backupDir;
    }
    async backupAllTemplates() {
        const backupDir = await this.createBackupDirectory();
        const templatePatterns = [
            'CLAUDE.md',
            'README.md',
            'PROMPT.md',
            'docs/**/*.md',
            'prompts/**/*.md',
            '.claude/**/*',
            'infrastructure/**/*',
        ];
        for (const pattern of templatePatterns) {
            const files = await (0, glob_1.glob)(pattern, {
                cwd: this.rootDir,
                ignore: ['node_modules/**', 'scripts/**', '.backups/**'],
            });
            for (const file of files) {
                const sourcePath = path_1.default.join(this.rootDir, file);
                const targetPath = path_1.default.join(backupDir, file);
                if (await fs_extra_1.default.pathExists(sourcePath)) {
                    await fs_extra_1.default.ensureDir(path_1.default.dirname(targetPath));
                    await fs_extra_1.default.copy(sourcePath, targetPath);
                }
            }
        }
        return backupDir;
    }
    async validateProjectStructure() {
        const issues = [];
        const requiredFiles = [
            'CLAUDE.md',
            'README.md',
            'CUSTOMIZATION_GUIDE.md',
            'docs/tech-stack.md',
            'prompts/basic-development.md',
            'prompts/enterprise-development.md',
            'prompts/opensource-development.md',
            'prompts/startup-development.md',
        ];
        for (const file of requiredFiles) {
            const filePath = path_1.default.join(this.rootDir, file);
            if (!(await fs_extra_1.default.pathExists(filePath))) {
                issues.push(`Missing required file: ${file}`);
            }
        }
        const requiredDirs = ['docs', 'prompts', 'infrastructure', '.github/workflows'];
        for (const dir of requiredDirs) {
            const dirPath = path_1.default.join(this.rootDir, dir);
            if (!(await fs_extra_1.default.pathExists(dirPath))) {
                issues.push(`Missing required directory: ${dir}`);
            }
        }
        return {
            valid: issues.length === 0,
            issues,
        };
    }
    async removeUnusedInfrastructure(techStack) {
        const removedFiles = [];
        const infraDir = path_1.default.join(this.rootDir, 'infrastructure', 'lib', 'stacks');
        if (!(await fs_extra_1.default.pathExists(infraDir))) {
            return removedFiles;
        }
        const stackFiles = await fs_extra_1.default.readdir(infraDir);
        const isAWS = techStack.infrastructure.toLowerCase().includes('aws');
        for (const file of stackFiles) {
            const filePath = path_1.default.join(infraDir, file);
            const stats = await fs_extra_1.default.stat(filePath);
            if (stats.isFile() && file.endsWith('.ts')) {
                let shouldRemove = false;
                if (!isAWS && file.includes('aws')) {
                    shouldRemove = true;
                }
                if (file.includes('auth-stack.ts')) {
                }
                if (shouldRemove) {
                    await fs_extra_1.default.remove(filePath);
                    removedFiles.push(file);
                }
            }
        }
        return removedFiles;
    }
    async updateGitignore(additionalPatterns = []) {
        const gitignorePath = path_1.default.join(this.rootDir, '.gitignore');
        if (!(await fs_extra_1.default.pathExists(gitignorePath))) {
            return;
        }
        const content = await fs_extra_1.default.readFile(gitignorePath, 'utf-8');
        const lines = content.split('\n');
        const backupPattern = '.backups/';
        if (!lines.includes(backupPattern)) {
            lines.push('', '# Setup assistant backups', backupPattern);
        }
        for (const pattern of additionalPatterns) {
            if (!lines.includes(pattern)) {
                lines.push(pattern);
            }
        }
        await fs_extra_1.default.writeFile(gitignorePath, lines.join('\n'));
    }
    async createProjectConfigFile(config) {
        const configDir = path_1.default.join(this.rootDir, '.claude');
        const configPath = path_1.default.join(configDir, 'project-config.json');
        await fs_extra_1.default.ensureDir(configDir);
        await fs_extra_1.default.writeFile(configPath, JSON.stringify(config, null, 2));
    }
    async getFilesToProcess() {
        const patterns = ['CLAUDE.md', 'README.md', 'docs/**/*.md', '.claude/**/*.template'];
        const files = [];
        for (const pattern of patterns) {
            const matches = await (0, glob_1.glob)(pattern, {
                cwd: this.rootDir,
                ignore: ['node_modules/**', 'scripts/**', '.backups/**'],
            });
            files.push(...matches);
        }
        return files;
    }
    async restoreFromBackup(backupDir) {
        if (!(await fs_extra_1.default.pathExists(backupDir))) {
            throw new Error(`Backup directory not found: ${backupDir}`);
        }
        const files = await (0, glob_1.glob)('**/*', {
            cwd: backupDir,
            nodir: true,
        });
        for (const file of files) {
            const sourcePath = path_1.default.join(backupDir, file);
            const targetPath = path_1.default.join(this.rootDir, file);
            await fs_extra_1.default.ensureDir(path_1.default.dirname(targetPath));
            await fs_extra_1.default.copy(sourcePath, targetPath);
        }
    }
}
exports.FileManager = FileManager;
