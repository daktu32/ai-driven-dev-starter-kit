#!/usr/bin/env node

import fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { glob } from 'glob';
import { DocumentTemplateProcessor } from './lib/documentTemplateProcessor.js';
import { ProjectConfig } from './lib/types.js';
import { ValidationError, validateScaffoldOptions, ScaffoldOptions } from './lib/validator.js';
import { safeExpandPath, PathExpansionError } from './lib/pathUtils.js';
import { ScaffoldEngine } from './lib/ScaffoldEngine.js';
import { TemplateRegistry } from './lib/TemplateRegistry.js';
import { execSync } from 'child_process';

// ValidatedScaffoldOptionsをインポートしているため、ローカルのインターフェースは削除

class ScaffoldGenerator {
  private sourceDir: string;
  private options!: ScaffoldOptions;
  private cliOptions: { [key: string]: string | boolean } = {};
  private scaffoldEngine: ScaffoldEngine;
  private templateRegistry: TemplateRegistry;

  constructor() {
    this.sourceDir = path.resolve(process.cwd());
    this.scaffoldEngine = new ScaffoldEngine(this.sourceDir);
    this.templateRegistry = new TemplateRegistry();
    this.parseCLIArgs();
    this.setupGracefulShutdown();
  }

  private parseCLIArgs(): void {
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg && arg.startsWith('--')) {
        const [key, value] = arg.slice(2).split('=');
        if (key) {
          this.cliOptions[key] = value || true;
        }
      }
    }
  }

  private setupGracefulShutdown(): void {
    const cleanup = () => {
      console.log(chalk.yellow('\n👋 終了しています...'));
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('uncaughtException', (error) => {
      console.error(chalk.red.bold('\n❌ 予期しないエラーが発生しました:'));
      console.error(chalk.red(error.message));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error(chalk.red.bold('\n❌ 未処理のPromise拒否が発生しました:'));
      console.error(chalk.red(String(reason)));
      console.error(chalk.gray(`Promise: ${promise}`));
      process.exit(1);
    });
  }

  async run(): Promise<void> {
    console.log(chalk.blue.bold('🏗️  Claude Code Dev Starter Kit - スケルトン生成ツール'));
    console.log(chalk.gray('新しいプロジェクトのスケルトンを生成します\n'));

    try {
      // ヘルプ表示
      if (this.cliOptions.help) {
        this.printHelp();
        return;
      }

      // テンプレート管理コマンド処理
      if (this.cliOptions['list-templates']) {
        await this.listTemplates();
        return;
      }

      if (this.cliOptions['add-template']) {
        const templatePath = this.cliOptions['add-template'] as string;
        await this.addTemplate(templatePath);
        return;
      }

      await this.promptOptions();
      await this.validateTargetPath();
      await this.generateScaffold();
      await this.postProcess();

      console.log(chalk.green.bold('\n✅ スケルトンの生成が完了しました！'));
      this.printNextSteps();
    } catch (error) {
      console.error(chalk.red.bold('\n❌ エラーが発生しました:'), error);
      process.exit(1);
    }
  }

  private printHelp(): void {
    console.log(chalk.cyan.bold('使用方法:'));
    console.log(chalk.white('  npm run scaffold'));
    console.log(chalk.white('  npm run scaffold -- --project-name=my-project --project-type=mcp-server'));
    console.log(chalk.cyan.bold('\nプロジェクト生成オプション:'));
    console.log(chalk.white('  --help                    このヘルプを表示'));
    console.log(chalk.white('  --project-name=NAME       プロジェクト名 (短縮形: --name)'));
    console.log(chalk.white('  --project-type=TYPE       プロジェクトタイプ (短縮形: --type)'));
    console.log(chalk.white('  --template=NAME           カスタムテンプレート名を指定'));
    console.log(chalk.white('  --target-path=PATH        生成先パス (短縮形: --output)'));
    console.log(chalk.white('  --skip-interactive        すべての対話をスキップ (E2Eテスト用)'));
    console.log(chalk.white('  --force                   既存ディレクトリの上書き確認をスキップ'));
    console.log(chalk.white('  --skip-optional           オプション項目の選択をスキップ'));
    console.log(chalk.cyan.bold('\nテンプレート管理オプション:'));
    console.log(chalk.white('  --list-templates          利用可能なテンプレート一覧を表示'));
    console.log(chalk.white('  --add-template=PATH       カスタムテンプレートを追加'));
    console.log(chalk.white('                            (ローカルパス、Git URL、NPMパッケージ対応)'));
    console.log(chalk.cyan.bold('\nプロジェクトタイプ:'));
    console.log(chalk.white('  cli-rust     Rustで書くCLIツール'));
    console.log(chalk.white('  web-nextjs   Next.jsでのWebアプリ'));
    console.log(chalk.white('  api-fastapi  FastAPIでのRESTful API'));
    console.log(chalk.white('  mcp-server   Model Context Protocol サーバー'));
    console.log(chalk.cyan.bold('\nカスタムテンプレート例:'));
    console.log(chalk.white('  # ローカルテンプレート追加'));
    console.log(chalk.gray('  npm run scaffold -- --add-template=./my-template'));
    console.log(chalk.white('  # GitHubテンプレート追加'));
    console.log(chalk.gray('  npm run scaffold -- --add-template=https://github.com/user/template.git'));
    console.log(chalk.white('  # カスタムテンプレートでプロジェクト生成'));
    console.log(chalk.gray('  npm run scaffold -- --template=my-custom-template'));
  }

  private async promptOptions(): Promise<void> {
    // --skip-interactive または --non-interactive オプションがある場合は対話をスキップ
    if (this.cliOptions['skip-interactive'] || this.cliOptions['non-interactive']) {
      await this.setDefaultOptionsForNonInteractive();
      return;
    }

    // CLI引数から値があればそれを使用、なければプロンプトで入力
    const questions = [];

    if (!this.cliOptions['target-path']) {
      questions.push({
        type: 'input',
        name: 'targetPath',
        message: '生成先のパスを入力してください:',
        default: './my-new-project',
        validate: (input: string) => {
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
        validate: (input: string) => {
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

    if (!this.cliOptions['project-type'] && !this.cliOptions['template']) {
      // テンプレート選択肢を動的に生成
      const choices = await this.buildTemplateChoices();
      
      questions.push({
        type: 'list',
        name: 'projectType',
        message: 'プロジェクトタイプまたはテンプレートを選択してください:',
        choices: choices,
      });
    }

    if (!this.cliOptions['skip-optional']) {
      questions.push(
        {
          type: 'confirm',
          name: 'includeProjectManagement',
          message: 'プロジェクト管理ファイルを含めますか？（PROGRESS.md, ROADMAP.md, CHANGELOG.md）',
          default: true,
        },
        {
          type: 'confirm',
          name: 'includeArchitecture',
          message: 'アーキテクチャテンプレートを含めますか？',
          default: false,
        },
        {
          type: 'confirm',
          name: 'includeTools',
          message: '開発ツール設定を含めますか？（linting, testing, CI/CD）',
          default: true,
        },
        {
          type: 'confirm',
          name: 'customCursorRules',
          message: 'プロジェクト固有の .cursorrules を生成しますか？',
          default: true,
        }
      );
    }

    const answers = await inquirer.prompt(questions);

    // CLI引数の値とプロンプトの答えをマージ
    const selectedTemplate = this.cliOptions['template'] as string || answers.projectType;
    const rawOptions = {
      targetPath: this.cliOptions['target-path'] as string || answers.targetPath,
      projectName: this.cliOptions['project-name'] as string || answers.projectName,
      projectType: (this.cliOptions['project-type'] as string || selectedTemplate) as ScaffoldOptions['projectType'],
      includeProjectManagement: this.cliOptions['skip-optional'] ? true : answers.includeProjectManagement ?? true,
      includeArchitecture: this.cliOptions['skip-optional'] ? false : answers.includeArchitecture ?? false,
      includeTools: this.cliOptions['skip-optional'] ? true : answers.includeTools ?? true,
      customCursorRules: this.cliOptions['skip-optional'] ? true : answers.customCursorRules ?? true,
    };

    try {
      // パス展開（空でない場合のみ）
      if (rawOptions.targetPath && rawOptions.targetPath.trim()) {
        rawOptions.targetPath = safeExpandPath(rawOptions.targetPath);
      }
      
      // カスタムテンプレート使用時は基本的な検証のみ実行
      if (this.cliOptions['template']) {
        // テンプレートレジストリの初期化と検証
        await this.templateRegistry.initialize();
        const templateName = this.cliOptions['template'] as string;
        const template = await this.templateRegistry.findTemplate(templateName);
        if (!template) {
          throw new Error(`テンプレート '${templateName}' が見つかりません`);
        }
        
        // 基本的な検証のみ実行
        if (!rawOptions.projectName || !rawOptions.targetPath) {
          throw new ValidationError([
            !rawOptions.projectName ? 'プロジェクト名は必須です' : '',
            !rawOptions.targetPath ? '生成先パスは必須です' : ''
          ].filter(Boolean));
        }
        
        // プロジェクトタイプをテンプレート名に設定
        rawOptions.projectType = templateName as any;
      } else {
        // 通常のプロジェクトタイプの検証
        validateScaffoldOptions(rawOptions);
      }
      
      this.options = rawOptions;
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(chalk.red.bold('\n❌ 入力データの検証エラー:'));
        for (const err of error.errors) {
          console.error(chalk.red(`  • ${err}`));
        }
        throw new Error('入力データが無効です。上記のエラーを修正してください。');
      }
      if (error instanceof PathExpansionError) {
        throw new Error(`パス展開エラー: ${error.message}`);
      }
      throw error;
    }
  }

  private async setDefaultOptionsForNonInteractive(): Promise<void> {
    // 非対話モードでのデフォルト設定
    const selectedTemplate = this.cliOptions['template'] as string || this.cliOptions['project-type'] as string || this.cliOptions['type'] as string || 'mcp-server';
    const rawOptions = {
      targetPath: this.cliOptions['target-path'] as string || this.cliOptions['output'] as string || './my-new-project',
      projectName: this.cliOptions['project-name'] as string || this.cliOptions['name'] as string || 'my-new-project',
      projectType: selectedTemplate as ScaffoldOptions['projectType'],
      includeProjectManagement: true,
      includeArchitecture: false,
      includeTools: true,
      customCursorRules: true,
    };

    try {
      // パス展開（空でない場合のみ）
      if (rawOptions.targetPath && rawOptions.targetPath.trim()) {
        rawOptions.targetPath = safeExpandPath(rawOptions.targetPath);
      }
      
      // カスタムテンプレート使用時は基本的な検証のみ実行
      if (this.cliOptions['template']) {
        // テンプレートレジストリの初期化と検証
        await this.templateRegistry.initialize();
        const templateName = this.cliOptions['template'] as string;
        const template = await this.templateRegistry.findTemplate(templateName);
        if (!template) {
          throw new Error(`テンプレート '${templateName}' が見つかりません`);
        }
        
        // 基本的な検証のみ実行
        if (!rawOptions.projectName || !rawOptions.targetPath) {
          throw new ValidationError([
            !rawOptions.projectName ? 'プロジェクト名は必須です' : '',
            !rawOptions.targetPath ? '生成先パスは必須です' : ''
          ].filter(Boolean));
        }
        
        // プロジェクトタイプをテンプレート名に設定
        rawOptions.projectType = templateName as any;
      } else {
        // 通常のプロジェクトタイプの検証
        validateScaffoldOptions(rawOptions);
      }
      
      this.options = rawOptions;
      
      console.log(chalk.gray(`非対話モード: ${this.options.projectType} プロジェクト "${this.options.projectName}" を "${this.options.targetPath}" に生成します`));
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new Error(`非対話モードの設定エラー:\n${error.errors.map(err => `  - ${err}`).join('\n')}`);
      }
      if (error instanceof PathExpansionError) {
        throw new Error(`パス展開エラー: ${error.message}`);
      }
      throw error;
    }
  }

  private async validateTargetPath(): Promise<void> {
    const targetPath = path.resolve(this.options.targetPath);

    if (await fs.pathExists(targetPath)) {
      // --force オプションがある場合は確認をスキップ
      if (this.cliOptions['force'] || this.cliOptions['overwrite']) {
        console.log(chalk.yellow(`❗ 既存ディレクトリ "${targetPath}" を上書きします (--force)`));
        await fs.remove(targetPath);
        return;
      }

      // 非対話モードで --force がない場合はエラー
      if (this.cliOptions['skip-interactive'] || this.cliOptions['non-interactive']) {
        throw new Error(`ディレクトリ "${targetPath}" は既に存在します。非対話モードでは --force オプションを使用してください。`);
      }

      // 通常の対話モード（非対話モードでない場合のみ）
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

  private async generateScaffold(): Promise<void> {
    try {
      // テンプレートレジストリを初期化
      await this.templateRegistry.initialize();
      
      // テンプレートを検索（カスタムテンプレート対応）
      const templateName = this.cliOptions['template'] as string || this.options.projectType;
      const template = await this.templateRegistry.findTemplate(templateName);
      if (!template) {
        throw new Error(`テンプレート '${templateName}' が見つかりません`);
      }
      
      // テンプレートパスを解決
      const templatePath = template.source === 'builtin' 
        ? path.join(this.sourceDir, template.path!)
        : template.path!;
      
      console.log(chalk.gray(`使用するテンプレート: ${template.name} (${template.source})`));
      
      // ScaffoldEngineで生成
      const scaffoldOptions: ScaffoldOptions = {
        targetPath: this.options.targetPath,
        projectName: this.options.projectName,
        projectType: this.options.projectType,
        includeProjectManagement: this.options.includeProjectManagement,
        includeArchitecture: this.options.includeArchitecture,
        includeTools: this.options.includeTools,
        customCursorRules: this.options.customCursorRules
      };
      
      const result = await this.scaffoldEngine.generateProject(templatePath, scaffoldOptions);
      
      // ドキュメントテンプレートを処理
      await this.processDocumentTemplates(path.resolve(this.options.targetPath));
      
      // package.json を更新
      await this.updatePackageJson(path.resolve(this.options.targetPath));
      
      // テンプレートファイルのクリーンアップ
      await this.cleanupTemplateFiles(path.resolve(this.options.targetPath));
      
      // 生成結果を検証
      await this.verifyGeneratedProject(path.resolve(this.options.targetPath));
      
      // 結果の表示
      if (result.errors.length > 0) {
        console.log(chalk.yellow('\n⚠️  以下のエラーが発生しました:'));
        result.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
      }
      
      if (result.warnings.length > 0) {
        console.log(chalk.yellow('\n📝 以下の警告があります:'));
        result.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
      }
      
      console.log(chalk.green(`\n✅ ${result.generatedFiles.length}個のファイルが生成されました`));
      
    } catch (error) {
      console.error(chalk.red('\n❌ エラーの詳細:'));
      console.error(chalk.red((error as Error).message));
      console.error(chalk.yellow('\n💡 失敗した状態のファイルはデバッグのため保持されます'));
      
      throw error;
    }
  }






  private async processDocumentTemplates(targetPath: string): Promise<void> {
    const processor = new DocumentTemplateProcessor(this.sourceDir);
    const config = this.createProjectConfig();

    try {
      // ドキュメントテンプレートを処理
      const processedFiles = await processor.processDocumentTemplates(config, targetPath);
      console.log(chalk.green(`✓ ${processedFiles.length}個のドキュメントテンプレートを処理しました`));

      // プロジェクト用CLAUDE.mdを生成
      await processor.createProjectCLAUDE(config, targetPath);
      console.log(chalk.green('✓ CLAUDE.mdを生成しました'));

    } catch (error) {
      console.warn(chalk.yellow('⚠ ドキュメントテンプレートの処理中にエラーが発生しました:'), error);
      // フォールバック: 基本ドキュメントのみコピー
      await this.copyBasicDocumentsFallback(targetPath);
    }
  }

  private createProjectConfig(): ProjectConfig {
    return {
      projectName: this.options.projectName,
      projectType: this.options.projectType,
      description: `${this.options.projectName} - AI駆動開発スターターキットで生成`,
      repositoryUrl: `https://github.com/your-username/${this.options.projectName.toLowerCase().replace(/\s+/g, '-')}`,
      prompt: 'basic-development',
      techStack: {
        frontend: this.getDefaultTechStack('frontend'),
        backend: this.getDefaultTechStack('backend'),
        database: this.getDefaultTechStack('database'),
        infrastructure: this.getDefaultTechStack('infrastructure'),
        deployment: this.getDefaultTechStack('deployment'),
        monitoring: this.getDefaultTechStack('monitoring'),
      },
      team: {
        size: 1,
        type: 'individual',
        industry: 'Technology',
        complianceLevel: 'low',
      },
      customizations: {},
    };
  }

  private getDefaultTechStack(category: string): string {
    const defaults: { [key: string]: { [key: string]: string } } = {
      'cli-rust': {
        frontend: 'Terminal UI',
        backend: 'Rust',
        database: 'SQLite',
        infrastructure: 'Docker',
        deployment: 'GitHub Releases',
        monitoring: 'Logs',
      },
      'web-nextjs': {
        frontend: 'Next.js/React',
        backend: 'Next.js API Routes',
        database: 'PostgreSQL',
        infrastructure: 'Vercel',
        deployment: 'Vercel',
        monitoring: 'Vercel Analytics',
      },
      'api-fastapi': {
        frontend: 'N/A',
        backend: 'FastAPI/Python',
        database: 'PostgreSQL',
        infrastructure: 'Docker/AWS',
        deployment: 'AWS ECS',
        monitoring: 'CloudWatch',
      },
      'mcp-server': {
        frontend: 'N/A',
        backend: 'Node.js/TypeScript',
        database: 'JSON Files',
        infrastructure: 'Docker',
        deployment: 'npm Registry',
        monitoring: 'Logs',
      },
    };

    return defaults[this.options.projectType]?.[category] || 'TBD';
  }

  private async copyBasicDocumentsFallback(targetPath: string): Promise<void> {
    console.log(chalk.yellow('フォールバック: 基本ドキュメントをコピーしています...'));
    
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
  }



  private async updatePackageJson(targetPath: string): Promise<void> {
    const packageJsonPath = path.join(targetPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // プロジェクト名を更新
      packageJson.name = this.options.projectName.toLowerCase().replace(/\s+/g, '-');
      packageJson.description = `${this.options.projectName} - AI-driven development project`;
      
      // スターターキット情報をクリア
      delete packageJson.repository;
      delete packageJson.bugs;
      delete packageJson.homepage;
      delete packageJson.keywords;
      
      // 新しいプロジェクト用情報を設定
      packageJson.author = "Your Name";
      packageJson.repository = {
        type: "git",
        url: `git+https://github.com/your-username/${this.options.projectName.toLowerCase().replace(/\s+/g, '-')}.git`
      };
      packageJson.bugs = {
        url: `https://github.com/your-username/${this.options.projectName.toLowerCase().replace(/\s+/g, '-')}/issues`
      };
      packageJson.homepage = `https://github.com/your-username/${this.options.projectName.toLowerCase().replace(/\s+/g, '-')}#readme`;
      
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  private async postProcess(): Promise<void> {
    // ScaffoldEngineの後処理に委譲済み
    console.log(chalk.gray(`   git commit -m "初回コミット"`));
  }

  /**
   * テンプレート選択肢の構築
   */
  private async buildTemplateChoices(): Promise<Array<{ name: string; value: string }>> {
    try {
      await this.templateRegistry.initialize();
      const templates = await this.templateRegistry.listTemplates();
      
      const choices: Array<{ name: string; value: string }> = [];
      
      // 公式テンプレート
      const builtinTemplates = templates.filter(t => t.source === 'builtin');
      if (builtinTemplates.length > 0) {
        choices.push({ name: chalk.blue('--- 公式テンプレート ---'), value: '---' });
        for (const template of builtinTemplates) {
          const displayName = this.getTemplateDisplayName(template);
          choices.push({ name: displayName, value: template.name });
        }
      }
      
      // カスタムテンプレート
      const customTemplates = templates.filter(t => t.source !== 'builtin');
      if (customTemplates.length > 0) {
        choices.push({ name: chalk.magenta('--- カスタムテンプレート ---'), value: '---' });
        for (const template of customTemplates) {
          const displayName = this.getTemplateDisplayName(template);
          choices.push({ name: displayName, value: template.name });
        }
      }
      
      // 区切り線を除去
      return choices.filter(choice => choice.value !== '---');
    } catch (error) {
      // エラーが発生した場合は公式テンプレートのみ返す
      console.warn(chalk.yellow('⚠️  カスタムテンプレートの読み込みに失敗しました。公式テンプレートのみ表示します。'));
      return [
        { name: 'CLI (Rust)', value: 'cli-rust' },
        { name: 'Web (Next.js)', value: 'web-nextjs' },
        { name: 'API (FastAPI)', value: 'api-fastapi' },
        { name: 'MCP Server', value: 'mcp-server' },
      ];
    }
  }

  /**
   * テンプレート表示名の生成
   */
  private getTemplateDisplayName(template: import('./lib/TemplateRegistry.js').TemplateMetadata): string {
    const typeMap: Record<string, string> = {
      'cli-rust': 'CLI (Rust)',
      'web-nextjs': 'Web (Next.js)',
      'api-fastapi': 'API (FastAPI)',
      'mcp-server': 'MCP Server'
    };
    
    const displayType = typeMap[template.name] || template.name;
    const sourceIcon = template.source === 'builtin' ? '🏢' : '⚙️';
    
    if (template.source === 'builtin') {
      return `${sourceIcon} ${displayType}`;
    } else {
      return `${sourceIcon} ${displayType} (${template.source})`;
    }
  }

  /**
   * テンプレート一覧表示
   */
  private async listTemplates(): Promise<void> {
    try {
      await this.templateRegistry.initialize();
      const templates = await this.templateRegistry.listTemplates();
      const stats = await this.templateRegistry.getStats();

      console.log(chalk.cyan.bold('📋 利用可能なテンプレート一覧'));
      console.log(chalk.gray(`合計: ${stats.total}個のテンプレート\n`));

      // ソース別にグループ化
      const builtin = templates.filter(t => t.source === 'builtin');
      const custom = templates.filter(t => t.source !== 'builtin');

      // 公式テンプレート
      if (builtin.length > 0) {
        console.log(chalk.blue.bold('🏢 公式テンプレート'));
        for (const template of builtin) {
          console.log(`  ${chalk.green(template.name)}`);
          console.log(`    ${chalk.gray(template.description)}`);
          console.log(`    ${chalk.yellow(`タイプ: ${template.projectType || 'N/A'}`)} ${chalk.gray(`| バージョン: ${template.version}`)}`);
          console.log(`    ${chalk.gray(`作成者: ${template.author}`)}`);
          if (template.tags && template.tags.length > 0) {
            console.log(`    ${chalk.cyan(`タグ: ${template.tags.join(', ')}`)}`);
          }
          console.log();
        }
      }

      // カスタムテンプレート
      if (custom.length > 0) {
        console.log(chalk.magenta.bold('⚙️ カスタムテンプレート'));
        for (const template of custom) {
          console.log(`  ${chalk.green(template.name)}`);
          console.log(`    ${chalk.gray(template.description)}`);
          console.log(`    ${chalk.yellow(`ソース: ${template.source}`)} ${chalk.gray(`| バージョン: ${template.version}`)}`);
          console.log(`    ${chalk.gray(`作成者: ${template.author}`)}`);
          if (template.path) {
            console.log(`    ${chalk.gray(`パス: ${template.path}`)}`);
          }
          if (template.url) {
            console.log(`    ${chalk.gray(`URL: ${template.url}`)}`);
          }
          if (template.tags && template.tags.length > 0) {
            console.log(`    ${chalk.cyan(`タグ: ${template.tags.join(', ')}`)}`);
          }
          console.log();
        }
      }

      // 統計情報
      console.log(chalk.cyan.bold('📊 統計情報'));
      console.log(`  ${chalk.gray(`ソース別: ${Object.entries(stats.bySource).map(([key, value]) => `${key}=${value}`).join(', ')}`)}`);
      console.log(`  ${chalk.gray(`タイプ別: ${Object.entries(stats.byProjectType).map(([key, value]) => `${key}=${value}`).join(', ')}`)}`);
      
      console.log(chalk.green.bold('\n✅ テンプレート一覧表示完了'));
    } catch (error) {
      console.error(chalk.red.bold('❌ テンプレート一覧の取得に失敗しました:'));
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  }

  /**
   * カスタムテンプレートの追加
   */
  private async addTemplate(templatePath: string): Promise<void> {
    try {
      await this.templateRegistry.initialize();
      
      console.log(chalk.cyan.bold('📦 カスタムテンプレートを追加中...'));
      console.log(chalk.gray(`ソース: ${templatePath}`));

      // テンプレートの種類を判定
      const templateType = this.detectTemplateType(templatePath);
      console.log(chalk.gray(`検出されたタイプ: ${templateType}`));

      // テンプレートの検証と追加
      const metadata = await this.processTemplate(templatePath, templateType);
      await this.templateRegistry.addTemplate(metadata);

      console.log(chalk.green.bold('\n✅ カスタムテンプレートの追加が完了しました！'));
      console.log(chalk.cyan(`テンプレート名: ${metadata.name}`));
      console.log(chalk.gray(`説明: ${metadata.description}`));
      console.log(chalk.gray(`バージョン: ${metadata.version}`));
      console.log(chalk.gray(`作成者: ${metadata.author}`));
      
      console.log(chalk.yellow('\n💡 使用方法:'));
      console.log(chalk.white(`  npm run scaffold -- --template=${metadata.name}`));
      
    } catch (error) {
      console.error(chalk.red.bold('❌ カスタムテンプレートの追加に失敗しました:'));
      console.error(chalk.red((error as Error).message));
      process.exit(1);
    }
  }

  /**
   * テンプレートタイプの検出
   */
  private detectTemplateType(templatePath: string): 'local' | 'git' | 'npm' {
    if (templatePath.startsWith('http://') || templatePath.startsWith('https://') || templatePath.endsWith('.git')) {
      return 'git';
    }
    
    if (templatePath.includes('/') || templatePath.includes('\\\\') || templatePath.startsWith('.') || templatePath.startsWith('~')) {
      return 'local';
    }
    
    return 'npm';
  }

  /**
   * テンプレートの処理
   */
  private async processTemplate(templatePath: string, templateType: 'local' | 'git' | 'npm'): Promise<Omit<import('./lib/TemplateRegistry.js').TemplateMetadata, 'lastUpdated'>> {
    switch (templateType) {
      case 'local':
        return this.processLocalTemplate(templatePath);
      case 'git':
        return this.processGitTemplate(templatePath);
      case 'npm':
        return this.processNpmTemplate(templatePath);
      default:
        throw new Error(`未対応のテンプレートタイプ: ${templateType}`);
    }
  }

  /**
   * ローカルテンプレートの処理
   */
  private async processLocalTemplate(templatePath: string): Promise<Omit<import('./lib/TemplateRegistry.js').TemplateMetadata, 'lastUpdated'>> {
    // パスの解決
    const resolvedPath = path.resolve(templatePath);
    
    // ディレクトリの存在確認
    if (!(await fs.pathExists(resolvedPath))) {
      throw new Error(`テンプレートディレクトリが見つかりません: ${resolvedPath}`);
    }

    // メタデータファイルの読み込み
    const metadataPath = path.join(resolvedPath, 'template.json');
    let metadata: any = {};
    
    if (await fs.pathExists(metadataPath)) {
      const content = await fs.readFile(metadataPath, 'utf8');
      metadata = JSON.parse(content);
    }

    // デフォルト値の設定
    const templateName = metadata.name || path.basename(resolvedPath);
    
    return {
      name: templateName,
      version: metadata.version || '1.0.0',
      description: metadata.description || `Local template: ${templateName}`,
      author: metadata.author || 'Unknown',
      source: 'local',
      path: resolvedPath,
      projectType: metadata.projectType,
      tags: metadata.tags || ['custom', 'local']
    };
  }

  /**
   * Gitテンプレートの処理
   */
  private async processGitTemplate(templateUrl: string): Promise<Omit<import('./lib/TemplateRegistry.js').TemplateMetadata, 'lastUpdated'>> {
    // リポジトリ名の抽出
    const repoName = templateUrl.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    const tempDir = path.join(process.cwd(), '.temp', repoName);
    
    try {
      // 一時ディレクトリのクリーンアップ
      await fs.remove(tempDir);
      await fs.ensureDir(tempDir);

      // Gitクローン
      console.log(chalk.gray(`Gitリポジトリをクローン中: ${templateUrl}`));
      execSync(`git clone ${templateUrl} ${tempDir}`, { stdio: 'inherit' });

      // メタデータファイルの読み込み
      const metadataPath = path.join(tempDir, 'template.json');
      let metadata: any = {};
      
      if (await fs.pathExists(metadataPath)) {
        const content = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(content);
      }

      // テンプレートを永続化ディレクトリにコピー
      const templateRegistry = new TemplateRegistry();
      const cacheDir = templateRegistry.getCacheDir();
      const finalPath = path.join(cacheDir, repoName);
      
      await fs.ensureDir(cacheDir);
      await fs.copy(tempDir, finalPath);

      // デフォルト値の設定
      const templateName = metadata.name || repoName;
      
      return {
        name: templateName,
        version: metadata.version || '1.0.0',
        description: metadata.description || `Git template: ${templateName}`,
        author: metadata.author || 'Unknown',
        source: 'git',
        path: finalPath,
        url: templateUrl,
        projectType: metadata.projectType,
        tags: metadata.tags || ['custom', 'git']
      };
    } finally {
      // 一時ディレクトリのクリーンアップ
      await fs.remove(tempDir);
    }
  }

  /**
   * NPMテンプレートの処理
   */
  private async processNpmTemplate(packageName: string): Promise<Omit<import('./lib/TemplateRegistry.js').TemplateMetadata, 'lastUpdated'>> {
    const tempDir = path.join(process.cwd(), '.temp', packageName);
    
    try {
      // 一時ディレクトリのクリーンアップ
      await fs.remove(tempDir);
      await fs.ensureDir(tempDir);

      // NPMパッケージのインストール
      console.log(chalk.gray(`NPMパッケージをインストール中: ${packageName}`));
      execSync(`npm install ${packageName}`, { 
        cwd: tempDir, 
        stdio: 'inherit' 
      });

      // インストールされたパッケージのパス
      const packagePath = path.join(tempDir, 'node_modules', packageName);
      
      // メタデータファイルの読み込み
      const metadataPath = path.join(packagePath, 'template.json');
      const packageJsonPath = path.join(packagePath, 'package.json');
      
      let metadata: any = {};
      let packageJson: any = {};
      
      if (await fs.pathExists(metadataPath)) {
        const content = await fs.readFile(metadataPath, 'utf8');
        metadata = JSON.parse(content);
      }
      
      if (await fs.pathExists(packageJsonPath)) {
        const content = await fs.readFile(packageJsonPath, 'utf8');
        packageJson = JSON.parse(content);
      }

      // テンプレートを永続化ディレクトリにコピー
      const templateRegistry = new TemplateRegistry();
      const cacheDir = templateRegistry.getCacheDir();
      const finalPath = path.join(cacheDir, packageName);
      
      await fs.ensureDir(cacheDir);
      await fs.copy(packagePath, finalPath);

      // デフォルト値の設定
      const templateName = metadata.name || packageName;
      
      return {
        name: templateName,
        version: metadata.version || packageJson.version || '1.0.0',
        description: metadata.description || packageJson.description || `NPM template: ${templateName}`,
        author: metadata.author || packageJson.author || 'Unknown',
        source: 'npm',
        path: finalPath,
        url: `https://npmjs.com/package/${packageName}`,
        projectType: metadata.projectType,
        tags: metadata.tags || ['custom', 'npm']
      };
    } finally {
      // 一時ディレクトリのクリーンアップ
      await fs.remove(tempDir);
    }
  }

  private async verifyGeneratedProject(targetPath: string): Promise<void> {
    const projectTypeFiles: { [key: string]: string[] } = {
      'mcp-server': ['package.json', 'tsconfig.json', 'src/index.ts'],
      'cli-rust': ['Cargo.toml', 'src/main.rs'],
      'web-nextjs': ['package.json', 'tsconfig.json'],
      'api-fastapi': ['requirements.txt', 'main.py']
    };
    
    const requiredFiles = projectTypeFiles[this.options.projectType] || [];
    const commonFiles = ['CLAUDE.md'];
    const allRequiredFiles = [...commonFiles, ...requiredFiles];
    
    const missingFiles: string[] = [];
    
    for (const file of allRequiredFiles) {
      const filePath = path.join(targetPath, file);
      if (!(await fs.pathExists(filePath))) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length > 0) {
      throw new Error(
        `プロジェクト生成が不完全です。以下のファイルが見つかりません:\n` +
        missingFiles.map(f => `  - ${f}`).join('\n')
      );
    }
  }

  private printNextSteps(): void {
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
    } else {
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

  private async cleanupTemplateFiles(targetPath: string): Promise<void> {
    try {
      // .template ファイルを再帰的に検索
      const templateFiles = await glob('**/*.template', { 
        cwd: targetPath,
        absolute: true 
      });
      
      let removedCount = 0;
      for (const templateFile of templateFiles) {
        const cleanFile = templateFile.replace('.template', '');
        
        // .template ファイルを削除（対応するファイルが存在する場合のみ）
        if (await fs.pathExists(cleanFile)) {
          await fs.remove(templateFile);
          removedCount++;
          console.log(chalk.gray(`  削除: ${path.relative(targetPath, templateFile)}`));
        } else {
          console.warn(chalk.yellow(`⚠ 処理されていないテンプレートファイル: ${path.relative(targetPath, templateFile)}`));
        }
      }
      
      if (removedCount > 0) {
        console.log(chalk.green(`✓ ${removedCount}個のテンプレートファイルを削除しました`));
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠ テンプレートファイルのクリーンアップ中にエラー:'), error);
    }
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
