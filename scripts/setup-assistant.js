#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const promptSelector_js_1 = require("./lib/promptSelector.js");
const templateProcessor_js_1 = require("./lib/templateProcessor.js");
const fileManager_js_1 = require("./lib/fileManager.js");
const validator_js_1 = require("./lib/validator.js");
class SetupAssistant {
    constructor() {
        this.targetDir = '';
        this.options = this.parseCliOptions();
        this.sourceDir = process.cwd();
        this.fileManager = new fileManager_js_1.FileManager(this.sourceDir);
        this.templateProcessor = new templateProcessor_js_1.TemplateProcessor(this.sourceDir);
    }
    parseCliOptions() {
        const args = process.argv.slice(2);
        return {
            dryRun: args.includes('--dry-run'),
            skipPromptSelection: args.includes('--skip-prompt'),
            prompt: args.find((arg) => arg.startsWith('--prompt='))?.split('=')[1],
            verbose: args.includes('--verbose') || args.includes('-v'),
        };
    }
    async run() {
        try {
            console.log(chalk_1.default.blue('🚀 Claude Code Development Starter Kit - 新規プロジェクト作成'));
            console.log(chalk_1.default.gray('新しいプロジェクトディレクトリを作成します\n'));
            if (this.options.dryRun) {
                console.log(chalk_1.default.yellow('🔍 DRY RUN モード - ファイルは変更されません\n'));
            }
            const projectInfo = await this.collectProjectInfo();
            const { prompt, team } = this.options.skipPromptSelection && this.options.prompt
                ? {
                    prompt: this.options.prompt,
                    team: {
                        size: 1,
                        type: 'individual',
                        industry: 'technology',
                        complianceLevel: 'medium',
                    },
                }
                : await promptSelector_js_1.PromptSelector.selectPrompt();
            const techStack = await this.collectTechStackInfo();
            const config = {
                ...projectInfo,
                prompt,
                team,
                techStack,
                customizations: {},
            };
            await this.validateConfiguration(config);
            if (!this.options.dryRun) {
                await this.showSummaryAndConfirm(config);
            }
            await this.createNewProject(config);
            this.showCompletionMessage();
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ プロジェクト作成に失敗しました:'), error);
            process.exit(1);
        }
    }
    async collectProjectInfo() {
        console.log(chalk_1.default.blue('\n📝 プロジェクト情報\n'));
        const questions = [
            {
                type: 'input',
                name: 'projectName',
                message: 'プロジェクト名を入力してください:',
                validate: validator_js_1.Validator.validateProjectName,
                filter: (input) => validator_js_1.Validator.sanitizeProjectName(input),
            },
            {
                type: 'input',
                name: 'description',
                message: 'プロジェクトの説明を入力してください:',
                validate: validator_js_1.Validator.validateDescription,
                filter: (input) => validator_js_1.Validator.sanitizeDescription(input),
            },
            {
                type: 'input',
                name: 'repositoryUrl',
                message: 'GitHubリポジトリのURLを入力してください:',
                validate: validator_js_1.Validator.validateRepositoryUrl,
                default: (answers) => `https://github.com/your-username/${validator_js_1.Validator.generateSlugFromName(answers.projectName)}`,
            },
            {
                type: 'input',
                name: 'targetPath',
                message: 'プロジェクトを作成するパスを入力してください:',
                default: (answers) => `../${answers.projectName}`,
                validate: (input) => {
                    if (!input.trim()) {
                        return 'パスを入力してください';
                    }
                    return true;
                },
            },
        ];
        return await inquirer_1.default.prompt(questions);
    }
    async collectTechStackInfo() {
        console.log(chalk_1.default.blue('\n🛠️  技術スタック\n'));
        const questions = [
            {
                type: 'list',
                name: 'frontend',
                message: 'フロントエンドフレームワークを選択してください:',
                choices: [
                    { name: 'Next.js (React)', value: 'Next.js' },
                    { name: 'React', value: 'React' },
                    { name: 'Vue.js', value: 'Vue.js' },
                    { name: 'Angular', value: 'Angular' },
                    { name: 'Svelte', value: 'Svelte' },
                    { name: 'その他', value: 'Other' },
                ],
            },
            {
                type: 'list',
                name: 'backend',
                message: 'バックエンドフレームワークを選択してください:',
                choices: [
                    { name: 'Node.js + Express', value: 'Node.js + Express' },
                    { name: 'Node.js + Fastify', value: 'Node.js + Fastify' },
                    { name: 'AWS Lambda', value: 'AWS Lambda' },
                    { name: 'Python + FastAPI', value: 'Python + FastAPI' },
                    { name: 'Python + Django', value: 'Python + Django' },
                    { name: 'その他', value: 'Other' },
                ],
            },
            {
                type: 'list',
                name: 'database',
                message: 'データベースを選択してください:',
                choices: [
                    { name: 'PostgreSQL', value: 'PostgreSQL' },
                    { name: 'MySQL', value: 'MySQL' },
                    { name: 'MongoDB', value: 'MongoDB' },
                    { name: 'DynamoDB', value: 'DynamoDB' },
                    { name: 'SQLite', value: 'SQLite' },
                    { name: 'その他', value: 'Other' },
                ],
            },
            {
                type: 'list',
                name: 'infrastructure',
                message: 'インフラストラクチャプラットフォームを選択してください:',
                choices: [
                    { name: 'AWS', value: 'AWS' },
                    { name: 'Google Cloud Platform', value: 'GCP' },
                    { name: 'Microsoft Azure', value: 'Azure' },
                    { name: 'Vercel', value: 'Vercel' },
                    { name: 'Netlify', value: 'Netlify' },
                    { name: 'その他', value: 'Other' },
                ],
            },
            {
                type: 'list',
                name: 'deployment',
                message: 'デプロイ方法を選択してください:',
                choices: [
                    { name: 'GitHub Actions', value: 'GitHub Actions' },
                    { name: 'GitLab CI', value: 'GitLab CI' },
                    { name: 'Jenkins', value: 'Jenkins' },
                    { name: 'Docker', value: 'Docker' },
                    { name: 'その他', value: 'Other' },
                ],
            },
            {
                type: 'list',
                name: 'monitoring',
                message: '監視ソリューションを選択してください:',
                choices: [
                    { name: 'Sentry', value: 'Sentry' },
                    { name: 'DataDog', value: 'DataDog' },
                    { name: 'New Relic', value: 'New Relic' },
                    { name: 'CloudWatch', value: 'CloudWatch' },
                    { name: 'その他', value: 'Other' },
                ],
            },
        ];
        return await inquirer_1.default.prompt(questions);
    }
    async validateConfiguration(config) {
        const spinner = (0, ora_1.default)('設定を検証中...').start();
        try {
            if (!config.projectName || !config.description || !config.repositoryUrl) {
                throw new Error('必須項目が不足しています');
            }
            const targetPath = path.resolve(config.targetPath || `../${config.projectName}`);
            if (await fs.pathExists(targetPath)) {
                const { overwrite } = await inquirer_1.default.prompt([
                    {
                        type: 'confirm',
                        name: 'overwrite',
                        message: `ディレクトリ "${targetPath}" は既に存在します。上書きしますか？`,
                        default: false,
                    },
                ]);
                if (!overwrite) {
                    throw new Error('ユーザーによってキャンセルされました');
                }
                await fs.remove(targetPath);
            }
            spinner.succeed('設定は有効です');
        }
        catch (error) {
            spinner.fail('設定の検証に失敗しました');
            throw error;
        }
    }
    async showSummaryAndConfirm(config) {
        console.log(chalk_1.default.blue('\n📋 設定サマリー\n'));
        console.log(chalk_1.default.white('プロジェクト:'));
        console.log(chalk_1.default.gray(`  名前: ${config.projectName}`));
        console.log(chalk_1.default.gray(`  説明: ${config.description}`));
        console.log(chalk_1.default.gray(`  リポジトリ: ${config.repositoryUrl}`));
        console.log(chalk_1.default.gray(`  作成先: ${config.targetPath || `../${config.projectName}`}`));
        console.log(chalk_1.default.white('\n開発アプローチ:'));
        console.log(chalk_1.default.gray(`  プロンプト: ${config.prompt}`));
        console.log(chalk_1.default.gray(`  チームサイズ: ${config.team.size}`));
        console.log(chalk_1.default.gray(`  業界: ${config.team.industry}`));
        console.log(chalk_1.default.white('\n技術スタック:'));
        console.log(chalk_1.default.gray(`  フロントエンド: ${config.techStack.frontend}`));
        console.log(chalk_1.default.gray(`  バックエンド: ${config.techStack.backend}`));
        console.log(chalk_1.default.gray(`  データベース: ${config.techStack.database}`));
        console.log(chalk_1.default.gray(`  インフラ: ${config.techStack.infrastructure}`));
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'この設定でプロジェクトを作成しますか？',
                default: true,
            },
        ]);
        if (!confirm) {
            throw new Error('ユーザーによってキャンセルされました');
        }
    }
    async createNewProject(config) {
        const spinner = (0, ora_1.default)('新しいプロジェクトを作成中...').start();
        const targetPath = path.resolve(config.targetPath || `../${config.projectName}`);
        this.targetDir = targetPath;
        try {
            await fs.ensureDir(targetPath);
            const copyItems = [
                'README.md',
                'package.json',
                'package-lock.json',
                '.gitignore',
                'CLAUDE.md',
                'CONTRIBUTING.md',
                'CUSTOMIZATION_GUIDE.md',
                'DEVELOPMENT_ROADMAP.md',
                'FEATURE_SUMMARY.md',
                'PROGRESS.md',
                'PROJECT_STRUCTURE.md',
                'docs',
                'prompts',
                'scripts',
                'infrastructure',
                '.github',
                'decisions',
            ];
            for (const item of copyItems) {
                const sourcePath = path.join(this.sourceDir, item);
                const targetItemPath = path.join(targetPath, item);
                if (await fs.pathExists(sourcePath)) {
                    await fs.copy(sourcePath, targetItemPath);
                }
            }
            await this.createProjectConfig(targetPath, config);
            await this.processTemplates(targetPath, config);
            await this.copyPromptFile(targetPath, config.prompt);
            await this.generateCursorRules(targetPath, config);
            await this.updatePackageJson(targetPath, config);
            await this.cleanupFiles(targetPath);
            spinner.succeed('新しいプロジェクトの作成が完了しました');
        }
        catch (error) {
            spinner.fail('プロジェクトの作成に失敗しました');
            throw error;
        }
    }
    async createProjectConfig(targetPath, config) {
        const configDir = path.join(targetPath, '.claude');
        const configPath = path.join(configDir, 'project-config.json');
        await fs.ensureDir(configDir);
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }
    async processTemplates(targetPath, config) {
        const templateProcessor = new templateProcessor_js_1.TemplateProcessor(targetPath);
        await templateProcessor.processAllTemplates(config);
    }
    async copyPromptFile(targetPath, promptType) {
        const sourceFile = path.join(this.sourceDir, 'prompts', `${promptType}.md`);
        const targetFile = path.join(targetPath, 'PROMPT.md');
        if (await fs.pathExists(sourceFile)) {
            await fs.copy(sourceFile, targetFile);
        }
    }
    async generateCursorRules(targetPath, config) {
        const cursorRulesContent = `# Cursor Rules - 日本語コミュニケーション設定

## 会話ガイドライン
- 常に日本語で会話する

## 開発哲学

### テスト駆動開発（TDD）
- 原則としてテスト駆動開発（TDD）で進める
- 期待される入出力に基づき、まずテストを作成する
- 実装コードは書かず、テストのみを用意する
- テストを実行し、失敗を確認する
- テストが正しいことを確認できた段階でコミットする
- その後、テストをパスさせる実装を進める
- 実装中はテストを変更せず、コードを修正し続ける
- すべてのテストが通過するまで繰り返す

### Git Worktree 管理
- 新機能開発やバグ修正は原則としてworktreeでブランチを切ってから開始する
- メインブランチ（main）での直接開発は避ける
- worktree作成手順：
  1. \`git worktree add ../feature/機能名 機能名\`
  2. 開発作業を実施
  3. 完了後、\`git worktree remove ../feature/機能名\` で削除
- 複数の機能を並行開発する場合は、それぞれ別のworktreeを使用する

## 言語設定
- 常に日本語でコミュニケーションを行ってください
- コードコメントも日本語で記述してください
- エラーメッセージやログの説明も日本語で行ってください

## コーディングスタイル
- 変数名や関数名は英語で記述（プログラミングの慣例に従う）
- コメント、ドキュメント、READMEは日本語で記述
- コミットメッセージは日本語で記述

## コミュニケーション
- 技術的な説明は分かりやすい日本語で行ってください
- 専門用語を使用する場合は、必要に応じて説明を加えてください
- 質問や確認は日本語で行ってください

## プロジェクト固有の設定
- このプロジェクトは ${config.projectName} です
- 開発環境のセットアップや設定に関する質問は日本語で対応してください
- ドキュメントの作成や更新も日本語で行ってください

## ファイル命名規則
- 設定ファイルやドキュメントファイルは日本語名も可
- ソースコードファイルは英語名で統一
- ディレクトリ名は英語で統一

## エラーハンドリング
- エラーメッセージの説明は日本語で行ってください
- デバッグ情報も日本語で提供してください
- トラブルシューティングの手順も日本語で説明してください
`;
        await fs.writeFile(path.join(targetPath, '.cursorrules'), cursorRulesContent);
    }
    async updatePackageJson(targetPath, config) {
        const packageJsonPath = path.join(targetPath, 'package.json');
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = config.projectName.toLowerCase().replace(/\s+/g, '-');
        packageJson.description = `${config.projectName} - ${config.description}`;
        delete packageJson.repository;
        delete packageJson.bugs;
        delete packageJson.homepage;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    async cleanupFiles(targetPath) {
        const gitPath = path.join(targetPath, '.git');
        if (await fs.pathExists(gitPath)) {
            await fs.remove(gitPath);
        }
        const nodeModulesPath = path.join(targetPath, 'node_modules');
        if (await fs.pathExists(nodeModulesPath)) {
            await fs.remove(nodeModulesPath);
        }
        const backupPath = path.join(targetPath, '.backups');
        if (await fs.pathExists(backupPath)) {
            await fs.remove(backupPath);
        }
    }
    showCompletionMessage() {
        console.log(chalk_1.default.green.bold('\n✅ 新しいプロジェクトの作成が完了しました！'));
        console.log(chalk_1.default.cyan.bold('\n📋 次のステップ:'));
        console.log(chalk_1.default.white(`1. プロジェクトディレクトリに移動:`));
        console.log(chalk_1.default.gray(`   cd ${this.targetDir || '新しいプロジェクトディレクトリ'}`));
        console.log(chalk_1.default.white(`2. 依存関係をインストール:`));
        console.log(chalk_1.default.gray(`   npm install`));
        console.log(chalk_1.default.white(`3. Git リポジトリを初期化:`));
        console.log(chalk_1.default.gray(`   git init`));
        console.log(chalk_1.default.gray(`   git add .`));
        console.log(chalk_1.default.gray(`   git commit -m "Initial commit"`));
        console.log(chalk_1.default.white(`4. 開発を開始:`));
        console.log(chalk_1.default.gray(`   npm run setup`));
        console.log(chalk_1.default.cyan.bold('\n🎉 新しいプロジェクトの準備が完了しました！'));
    }
}
if (require.main === module) {
    const assistant = new SetupAssistant();
    assistant.run().catch(console.error);
}
exports.default = SetupAssistant;
