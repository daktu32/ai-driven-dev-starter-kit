#!/usr/bin/env node
import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class ScaffoldGenerator {
    sourceDir;
    options;
    cliOptions = {};
    constructor() {
        this.sourceDir = path.resolve(__dirname, '..');
        this.parseCLIArgs();
    }
    parseCLIArgs() {
        const args = process.argv.slice(2);
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const [key, value] = arg.slice(2).split('=');
                this.cliOptions[key] = value || true;
            }
        }
    }
    async run() {
        console.log(chalk.blue.bold('🏗️  Claude Code Dev Starter Kit - スケルトン生成ツール'));
        console.log(chalk.gray('新しいプロジェクトのスケルトンを生成します\n'));
        try {
            // ヘルプ表示
            if (this.cliOptions.help) {
                this.printHelp();
                return;
            }
            await this.promptOptions();
            await this.validateTargetPath();
            await this.generateScaffold();
            await this.postProcess();
            console.log(chalk.green.bold('\n✅ スケルトンの生成が完了しました！'));
            this.printNextSteps();
        }
        catch (error) {
            console.error(chalk.red.bold('\n❌ エラーが発生しました:'), error);
            process.exit(1);
        }
    }
    printHelp() {
        console.log(chalk.cyan.bold('使用方法:'));
        console.log(chalk.white('  npm run scaffold'));
        console.log(chalk.white('  npm run scaffold -- --project-name=my-project --project-type=mcp-server'));
        console.log(chalk.cyan.bold('\nオプション:'));
        console.log(chalk.white('  --help                    このヘルプを表示'));
        console.log(chalk.white('  --project-name=NAME       プロジェクト名'));
        console.log(chalk.white('  --project-type=TYPE       プロジェクトタイプ (cli-rust, web-nextjs, api-fastapi, mcp-server)'));
        console.log(chalk.white('  --target-path=PATH        生成先パス'));
        console.log(chalk.cyan.bold('\nプロジェクトタイプ:'));
        console.log(chalk.white('  cli-rust     Rustで書くCLIツール'));
        console.log(chalk.white('  web-nextjs   Next.jsでのWebアプリ'));
        console.log(chalk.white('  api-fastapi  FastAPIでのRESTful API'));
        console.log(chalk.white('  mcp-server   Model Context Protocol サーバー'));
    }
    async promptOptions() {
        // CLI引数から値があればそれを使用、なければプロンプトで入力
        const questions = [];
        if (!this.cliOptions['target-path']) {
            questions.push({
                type: 'input',
                name: 'targetPath',
                message: '生成先のパスを入力してください:',
                default: './my-new-project',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'パスを入力してください';
                    }
                    return true;
                },
            });
        }
        if (!this.cliOptions['project-name']) {
            questions.push({
                type: 'input',
                name: 'projectName',
                message: 'プロジェクト名を入力してください:',
                default: 'my-new-project',
                validate: (input) => {
                    if (!input.trim()) {
                        return 'プロジェクト名を入力してください';
                    }
                    if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                        return 'プロジェクト名は英数字、ハイフン、アンダースコアのみ使用可能です';
                    }
                    return true;
                },
            });
        }
        if (!this.cliOptions['project-type']) {
            questions.push({
                type: 'list',
                name: 'projectType',
                message: 'プロジェクトタイプを選択してください:',
                choices: [
                    { name: 'CLI (Rust)', value: 'cli-rust' },
                    { name: 'Web (Next.js)', value: 'web-nextjs' },
                    { name: 'API (FastAPI)', value: 'api-fastapi' },
                    { name: 'MCP Server', value: 'mcp-server' },
                ],
            });
        }
        if (!this.cliOptions['skip-optional']) {
            questions.push({
                type: 'confirm',
                name: 'includeProjectManagement',
                message: 'プロジェクト管理ファイルを含めますか？（PROGRESS.md, ROADMAP.md, CHANGELOG.md）',
                default: true,
            }, {
                type: 'confirm',
                name: 'includeArchitecture',
                message: 'アーキテクチャテンプレートを含めますか？',
                default: false,
            }, {
                type: 'confirm',
                name: 'includeTools',
                message: '開発ツール設定を含めますか？（linting, testing, CI/CD）',
                default: true,
            }, {
                type: 'confirm',
                name: 'customCursorRules',
                message: 'プロジェクト固有の .cursorrules を生成しますか？',
                default: true,
            });
        }
        const answers = await inquirer.prompt(questions);
        // CLI引数の値とプロンプトの答えをマージ
        this.options = {
            targetPath: this.cliOptions['target-path'] || answers.targetPath,
            projectName: this.cliOptions['project-name'] || answers.projectName,
            projectType: this.cliOptions['project-type'] || answers.projectType,
            includeProjectManagement: this.cliOptions['skip-optional'] ? true : answers.includeProjectManagement ?? true,
            includeArchitecture: this.cliOptions['skip-optional'] ? false : answers.includeArchitecture ?? false,
            includeTools: this.cliOptions['skip-optional'] ? true : answers.includeTools ?? true,
            customCursorRules: this.cliOptions['skip-optional'] ? true : answers.customCursorRules ?? true,
        };
    }
    async validateTargetPath() {
        const targetPath = path.resolve(this.options.targetPath);
        if (await fs.pathExists(targetPath)) {
            const { overwrite } = await inquirer.prompt([
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
    }
    async generateScaffold() {
        const spinner = ora('スケルトンを生成中...').start();
        const targetPath = path.resolve(this.options.targetPath);
        try {
            // 基本ディレクトリ構造を作成
            await fs.ensureDir(targetPath);
            // プロジェクト構造テンプレートをコピー
            await this.copyProjectStructure(targetPath);
            // オプションに基づいて追加ファイルをコピー
            if (this.options.includeProjectManagement) {
                await this.copyProjectManagementFiles(targetPath);
            }
            if (this.options.includeArchitecture) {
                await this.copyArchitectureFiles(targetPath);
            }
            if (this.options.includeTools) {
                await this.copyToolsFiles(targetPath);
            }
            // 基本ドキュメントをコピー
            await this.copyBasicDocuments(targetPath);
            // docsディレクトリをコピー
            await this.copyDocsFiles(targetPath);
            // .cursorrules を生成
            if (this.options.customCursorRules) {
                await this.generateCursorRules(targetPath);
            }
            // package.json を更新
            await this.updatePackageJson(targetPath);
            spinner.succeed('スケルトンの生成が完了しました');
        }
        catch (error) {
            spinner.fail('スケルトンの生成に失敗しました');
            throw error;
        }
    }
    async copyProjectStructure(targetPath) {
        const templatePath = path.join(this.sourceDir, 'templates', 'project-structures', this.options.projectType);
        if (!(await fs.pathExists(templatePath))) {
            throw new Error(`テンプレートディレクトリが見つかりません: ${templatePath}`);
        }
        await this.copyDirectoryRecursively(templatePath, targetPath);
    }
    async copyDirectoryRecursively(sourcePath, targetPath) {
        const items = await fs.readdir(sourcePath, { withFileTypes: true });
        for (const item of items) {
            const sourceItemPath = path.join(sourcePath, item.name);
            let targetFileName = item.name;
            // .templateファイルは拡張子を除去
            if (item.name.endsWith('.template')) {
                targetFileName = item.name.replace('.template', '');
            }
            const targetItemPath = path.join(targetPath, targetFileName);
            if (item.isFile()) {
                // ファイルをコピーし、プロジェクト名などを置換
                let content = await fs.readFile(sourceItemPath, 'utf8');
                const className = this.options.projectName
                    .replace(/-/g, '')
                    .replace(/[^a-zA-Z0-9]/g, '')
                    .replace(/^[0-9]/, '')
                    .replace(/^./, (c) => c.toUpperCase());
                const currentDate = new Date().toISOString().split('T')[0];
                content = content.replace(/\{\{PROJECT_NAME\}\}/g, this.options.projectName);
                content = content.replace(/\{\{PROJECT_CLASS_NAME\}\}/g, className);
                content = content.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, `${this.options.projectName} - Generated by Claude Code Dev Starter Kit`);
                content = content.replace(/\{\{AUTHOR\}\}/g, 'Your Name');
                content = content.replace(/\{\{DATE\}\}/g, currentDate);
                await fs.ensureDir(path.dirname(targetItemPath));
                await fs.writeFile(targetItemPath, content);
            }
            else if (item.isDirectory()) {
                await fs.ensureDir(targetItemPath);
                await this.copyDirectoryRecursively(sourceItemPath, targetItemPath);
            }
        }
    }
    async copyProjectManagementFiles(targetPath) {
        const pmPath = path.join(this.sourceDir, 'templates', 'project-management');
        const pmFiles = ['PROGRESS.md', 'ROADMAP.md', 'CHANGELOG.md'];
        for (const file of pmFiles) {
            const sourcePath = path.join(pmPath, file);
            const targetFilePath = path.join(targetPath, file);
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, targetFilePath);
            }
        }
    }
    async copyArchitectureFiles(targetPath) {
        const archPath = path.join(this.sourceDir, 'templates', 'architectures');
        const targetArchPath = path.join(targetPath, 'docs', 'architecture');
        if (await fs.pathExists(archPath)) {
            await fs.copy(archPath, targetArchPath);
        }
    }
    async copyToolsFiles(targetPath) {
        const toolsPath = path.join(this.sourceDir, 'templates', 'tools');
        const targetToolsPath = path.join(targetPath, 'tools');
        if (await fs.pathExists(toolsPath)) {
            await fs.copy(toolsPath, targetToolsPath);
        }
    }
    async copyBasicDocuments(targetPath) {
        const basicDocs = [
            'CONTRIBUTING.md',
            'CLAUDE.md',
        ];
        for (const doc of basicDocs) {
            const sourcePath = path.join(this.sourceDir, doc);
            const targetFilePath = path.join(targetPath, doc);
            if (await fs.pathExists(sourcePath)) {
                await fs.copy(sourcePath, targetFilePath);
            }
        }
        // PRD.mdテンプレートをコピー
        await this.copyPRDTemplate(targetPath);
    }
    async copyPRDTemplate(targetPath) {
        const prdTemplatePath = path.join(this.sourceDir, 'templates', 'PRD.md.template');
        const targetPRDPath = path.join(targetPath, 'PRD.md');
        if (await fs.pathExists(prdTemplatePath)) {
            let content = await fs.readFile(prdTemplatePath, 'utf8');
            // プレースホルダーを置換
            const currentDate = new Date().toISOString().split('T')[0];
            content = content.replace(/\{\{PROJECT_NAME\}\}/g, this.options.projectName);
            content = content.replace(/\{\{PROJECT_TYPE\}\}/g, this.options.projectType);
            content = content.replace(/\{\{DATE\}\}/g, currentDate);
            await fs.writeFile(targetPRDPath, content);
        }
    }
    async copyDocsFiles(targetPath) {
        const docsPath = path.join(this.sourceDir, 'templates', 'docs');
        const targetDocsPath = path.join(targetPath, 'docs');
        if (await fs.pathExists(docsPath)) {
            await fs.ensureDir(targetDocsPath);
            const docsFiles = await fs.readdir(docsPath);
            for (const file of docsFiles) {
                const sourcePath = path.join(docsPath, file);
                let targetFileName = file;
                // .templateファイルは拡張子を除去
                if (file.endsWith('.template')) {
                    targetFileName = file.replace('.template', '');
                }
                const targetFilePath = path.join(targetDocsPath, targetFileName);
                if ((await fs.stat(sourcePath)).isFile()) {
                    // ファイルをコピーし、プロジェクト名などを置換
                    let content = await fs.readFile(sourcePath, 'utf8');
                    content = content.replace(/\{\{PROJECT_NAME\}\}/g, this.options.projectName);
                    content = content.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, `${this.options.projectName} - Generated by Claude Code Dev Starter Kit`);
                    content = content.replace(/\{\{AUTHOR\}\}/g, 'Your Name');
                    await fs.writeFile(targetFilePath, content);
                }
            }
        }
    }
    async generateCursorRules(targetPath) {
        const cursorRulesContent = `# Cursor Rules - ${this.options.projectName}

## プロジェクト概要
- プロジェクト名: ${this.options.projectName}
- プロジェクトタイプ: ${this.options.projectType}

## 開発ガイドライン
- 常に日本語でコミュニケーションする
- テスト駆動開発（TDD）を実践する
- コードレビューを必ず行う
- ドキュメントを適切に更新する

## プロジェクトタイプ固有の設定
${this.getProjectTypeSpecificRules()}

## ファイル命名規則
- コンポーネント: PascalCase.tsx
- ユーティリティ: camelCase.ts
- APIハンドラー: kebab-case.ts
- テストファイル: *.test.ts(x)
- 型定義: *.types.ts

## 品質チェックリスト
実装完了前に以下を確認：
- [ ] コンパイルが成功
- [ ] すべてのテストが通過
- [ ] リンティングが通過
- [ ] ドキュメントが更新済み
- [ ] セキュリティ設定が検証済み
`;
        const cursorRulesPath = path.join(targetPath, '.cursorrules');
        await fs.writeFile(cursorRulesPath, cursorRulesContent);
    }
    getProjectTypeSpecificRules() {
        switch (this.options.projectType) {
            case 'cli-rust':
                return `## Rust CLI プロジェクト
- Cargo.toml で依存関係を管理
- src/main.rs がエントリーポイント
- tests/ ディレクトリにテストを配置
- clap を使用してCLI引数を処理`;
            case 'web-nextjs':
                return `## Next.js Web プロジェクト
- pages/ または app/ ディレクトリでルーティング
- components/ ディレクトリにReactコンポーネントを配置
- public/ ディレクトリに静的ファイルを配置
- TypeScript を使用`;
            case 'api-fastapi':
                return `## FastAPI API プロジェクト
- src/main.py がエントリーポイント
- requirements.txt で依存関係を管理
- tests/ ディレクトリにテストを配置
- Pydantic を使用してデータバリデーション`;
            case 'mcp-server':
                return `## MCP Server プロジェクト
- src/index.ts がエントリーポイント
- Model Context Protocol (MCP) 仕様に準拠
- tools/, resources/, prompts/ でMCP機能を実装
- TypeScript + Node.js で開発`;
            default:
                return '';
        }
    }
    async updatePackageJson(targetPath) {
        const packageJsonPath = path.join(targetPath, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            // プロジェクト名を更新
            packageJson.name = this.options.projectName.toLowerCase().replace(/\s+/g, '-');
            packageJson.description = `${this.options.projectName} - Generated by Claude Code Dev Starter Kit`;
            // リポジトリ情報をクリア
            delete packageJson.repository;
            delete packageJson.bugs;
            delete packageJson.homepage;
            await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        }
    }
    async postProcess() {
        const targetPath = path.resolve(this.options.targetPath);
        // .git ディレクトリを削除（新しいリポジトリとして初期化するため）
        const gitPath = path.join(targetPath, '.git');
        if (await fs.pathExists(gitPath)) {
            await fs.remove(gitPath);
        }
        // node_modules を削除（新しくインストールするため）
        const nodeModulesPath = path.join(targetPath, 'node_modules');
        if (await fs.pathExists(nodeModulesPath)) {
            await fs.remove(nodeModulesPath);
        }
        console.log(chalk.gray(`   git commit -m "初回コミット"`));
    }
    printNextSteps() {
        const targetPath = path.resolve(this.options.targetPath);
        console.log(chalk.cyan.bold('\n📋 PRDベース開発フロー:'));
        console.log(chalk.white(`1. プロジェクトディレクトリに移動:`));
        console.log(chalk.gray(`   cd ${targetPath}`));
        console.log(chalk.white(`2. PRD.mdを完成させる:`));
        console.log(chalk.gray(`   # プロダクト要件を詳細に記述してください`));
        console.log(chalk.gray(`   # ユーザーストーリー、機能要件、技術要件など`));
        if (this.options.projectType === 'cli-rust') {
            console.log(chalk.white(`3. Rust プロジェクトを初期化:`));
            console.log(chalk.gray(`   cargo init`));
            console.log(chalk.gray(`   cargo build`));
        }
        else {
            console.log(chalk.white(`3. 依存関係をインストール:`));
            console.log(chalk.gray(`   npm install`));
            if (this.options.projectType === 'mcp-server') {
                console.log(chalk.white(`4. 環境設定:`));
                console.log(chalk.gray(`   cp .env.example .env`));
            }
        }
        console.log(chalk.white(`4. Git リポジトリを初期化:`));
        console.log(chalk.gray(`   git init`));
        console.log(chalk.gray(`   git add .`));
        console.log(chalk.gray(`   git commit -m "Initial commit"`));
        console.log(chalk.white(`5. Claude Code を起動:`));
        console.log(chalk.gray(`   # プロジェクトディレクトリでClaude Codeを起動`));
        console.log(chalk.white(`6. スケルトンの自動アレンジ:`));
        console.log(chalk.gray(`   # Claude に以下を指示:`));
        console.log(chalk.gray(`   "PRD.mdの内容に基づいてプロジェクトのスケルトンをアレンジして"`));
        console.log(chalk.cyan.bold('\n🎉 PRDベース開発の準備が完了しました！'));
        console.log(chalk.yellow('💡 PRD.mdを完成させてからClaude Codeで開発を開始してください'));
    }
}
// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new ScaffoldGenerator();
    generator.run().catch((error) => {
        console.error(chalk.red('致命的なエラーが発生しました:'), error);
        process.exit(1);
    });
}
//# sourceMappingURL=scaffold-generator.js.map