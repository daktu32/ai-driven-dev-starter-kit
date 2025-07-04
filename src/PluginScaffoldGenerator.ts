/**
 * プラグイン対応スケルトンジェネレーター
 * 
 * 既存のScaffoldGeneratorをプラグインシステムに対応させた新しい実装
 */

import fs from 'fs-extra';
import * as path from 'path';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

import { 
  PluginManager, 
  createPluginManager, 
  ProjectTemplate, 
  ScaffoldOptions,
  ScaffoldResult,
  PluginManagerConfig
} from './plugin/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * プラグイン対応スケルトンジェネレーター設定
 */
interface PluginScaffoldGeneratorOptions {
  targetPath?: string;
  projectName?: string;
  templateId?: string;
  includeProjectManagement?: boolean;
  includeArchitecture?: boolean;
  includeTools?: boolean;
  customCursorRules?: boolean;
  pluginDir?: string;
  autoLoadPlugins?: boolean;
}

/**
 * プラグイン対応スケルトンジェネレーター
 */
export class PluginScaffoldGenerator {
  private options!: PluginScaffoldGeneratorOptions;
  private cliOptions: { [key: string]: string | boolean } = {};
  private pluginManager!: PluginManager;
  private sourceDir: string;

  constructor() {
    this.sourceDir = path.resolve(__dirname, '..');
    this.parseCLIArgs();
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

  /**
   * ジェネレーター実行
   */
  async run(): Promise<void> {
    console.log(chalk.blue.bold('🏗️  AI Driven Dev Starter Kit - プラグイン対応スケルトン生成ツール'));
    console.log(chalk.gray('プラグインシステムを使用して新しいプロジェクトのスケルトンを生成します\\n'));

    try {
      // ヘルプ表示
      if (this.cliOptions.help) {
        this.printHelp();
        process.exit(0);
      }

      // プラグインマネージャーの初期化
      await this.initializePluginManager();

      // オプションの収集
      await this.promptOptions();

      // ターゲットパスの検証
      await this.validateTargetPath();

      // スケルトン生成実行
      await this.generateScaffold();

      // 後処理
      await this.postProcess();

      console.log(chalk.green.bold('\\n✅ スケルトンの生成が完了しました！'));
      this.printNextSteps();
      
      // 正常終了
      process.exit(0);

    } catch (error) {
      console.error(chalk.red.bold('\\n❌ エラーが発生しました:'), error);
      process.exit(1);
    } finally {
      // プラグインマネージャーのクリーンアップ
      if (this.pluginManager) {
        await this.pluginManager.shutdown();
      }
    }
  }

  /**
   * プラグインマネージャーの初期化
   */
  private async initializePluginManager(): Promise<void> {
    const spinner = ora('プラグインシステムを初期化中...').start();

    try {
      const pluginDir = this.cliOptions['plugin-dir'] as string || 
                       path.join(this.sourceDir, 'plugins');

      const config: Partial<PluginManagerConfig> = {
        pluginDir,
        autoLoad: this.cliOptions['auto-load-plugins'] !== false,
        enableCache: true
      };

      this.pluginManager = createPluginManager(config);
      await this.pluginManager.initialize();

      const loadedPlugins = this.pluginManager.getLoadedPlugins();
      spinner.succeed(`プラグインシステムが初期化されました (${loadedPlugins.length}個のプラグインがロード済み)`);

      // ロードされたプラグインの一覧表示
      if (loadedPlugins.length > 0) {
        console.log(chalk.gray('ロードされたプラグイン:'));
        for (const plugin of loadedPlugins) {
          console.log(chalk.gray(`  • ${plugin.name} v${plugin.version}`));
        }
        console.log();
      }

    } catch (error) {
      spinner.fail('プラグインシステムの初期化に失敗しました');
      throw error;
    }
  }

  /**
   * オプションの収集
   */
  private async promptOptions(): Promise<void> {
    const questions = [];
    const availableTemplates = this.pluginManager.getAvailableTemplates();

    if (availableTemplates.length === 0) {
      throw new Error('利用可能なプロジェクトテンプレートが見つかりません');
    }

    // ターゲットパス
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

    // プロジェクト名
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

    // テンプレート選択
    if (!this.cliOptions['template-id']) {
      const templateChoices = availableTemplates.map(template => ({
        name: `${template.name} - ${template.description}`,
        value: template.id,
        short: template.name
      }));

      questions.push({
        type: 'list',
        name: 'templateId',
        message: 'プロジェクトテンプレートを選択してください:',
        choices: templateChoices,
      });
    }

    // 追加オプション
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
    this.options = {
      targetPath: this.cliOptions['target-path'] as string || answers.targetPath,
      projectName: this.cliOptions['project-name'] as string || answers.projectName,
      templateId: this.cliOptions['template-id'] as string || answers.templateId,
      includeProjectManagement: this.cliOptions['skip-optional'] ? true : answers.includeProjectManagement ?? true,
      includeArchitecture: this.cliOptions['skip-optional'] ? false : answers.includeArchitecture ?? false,
      includeTools: this.cliOptions['skip-optional'] ? true : answers.includeTools ?? true,
      customCursorRules: this.cliOptions['skip-optional'] ? true : answers.customCursorRules ?? true,
    };

    // 選択されたテンプレートの追加設定がある場合
    await this.promptTemplateSpecificOptions();
  }

  /**
   * テンプレート固有のオプション収集
   */
  private async promptTemplateSpecificOptions(): Promise<void> {
    const template = this.pluginManager.getTemplate(this.options.templateId!);
    if (!template || !template.configOptions || template.configOptions.length === 0) {
      return;
    }

    console.log(chalk.cyan(`\\n${template.name} の追加設定:`));

    const templateQuestions = template.configOptions.map(option => {
      const question: any = {
        type: option.type,
        name: option.name,
        message: option.description,
        default: option.defaultValue
      };

      if (option.choices) {
        question.choices = option.choices.map(choice => ({
          name: choice.description ? `${choice.label} - ${choice.description}` : choice.label,
          value: choice.value,
          short: choice.label
        }));
      }

      if (option.validation) {
        question.validate = (input: any) => {
          const validation = option.validation!;
          
          if (validation.pattern && typeof input === 'string') {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(input)) {
              return `入力が不正な形式です: ${validation.pattern}`;
            }
          }
          
          if (validation.min !== undefined) {
            if (typeof input === 'string' && input.length < validation.min) {
              return `最小文字数: ${validation.min}`;
            }
            if (typeof input === 'number' && input < validation.min) {
              return `最小値: ${validation.min}`;
            }
          }
          
          if (validation.max !== undefined) {
            if (typeof input === 'string' && input.length > validation.max) {
              return `最大文字数: ${validation.max}`;
            }
            if (typeof input === 'number' && input > validation.max) {
              return `最大値: ${validation.max}`;
            }
          }
          
          if (validation.customValidator) {
            const result = validation.customValidator(input);
            if (typeof result === 'string') {
              return result;
            }
            if (!result) {
              return '入力値が無効です';
            }
          }
          
          return true;
        };
      }

      return question;
    });

    const templateAnswers = await inquirer.prompt(templateQuestions);
    
    // テンプレート固有のオプションを保存
    this.options = {
      ...this.options,
      ...templateAnswers
    };
  }

  /**
   * ターゲットパスの検証
   */
  private async validateTargetPath(): Promise<void> {
    const targetPath = path.resolve(this.options.targetPath!);

    if (await fs.pathExists(targetPath)) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `ディレクトリ \"${targetPath}\" は既に存在します。上書きしますか？`,
          default: false,
        },
      ]);

      if (!overwrite) {
        throw new Error('ユーザーによってキャンセルされました');
      }

      await fs.remove(targetPath);
    }
  }

  /**
   * スケルトン生成実行
   */
  private async generateScaffold(): Promise<void> {
    const spinner = ora('スケルトンを生成中...').start();

    try {
      const scaffoldOptions: ScaffoldOptions = {
        targetPath: path.resolve(this.options.targetPath!),
        projectName: this.options.projectName!,
        projectType: this.options.templateId!,
        options: {
          includeProjectManagement: this.options.includeProjectManagement,
          includeArchitecture: this.options.includeArchitecture,
          includeTools: this.options.includeTools,
          customCursorRules: this.options.customCursorRules,
          // テンプレート固有のオプションを含める
          ...Object.fromEntries(
            Object.entries(this.options).filter(([key]) => 
              !['targetPath', 'projectName', 'templateId', 'includeProjectManagement', 
                'includeArchitecture', 'includeTools', 'customCursorRules'].includes(key)
            )
          )
        }
      };

      // プラグインシステムでスケルトン生成
      const result: ScaffoldResult = await this.pluginManager.generateScaffold(
        this.options.templateId!,
        scaffoldOptions
      );

      if (!result.success) {
        throw new Error(result.error || 'スケルトン生成に失敗しました');
      }

      // 追加ファイルの生成
      await this.generateAdditionalFiles(scaffoldOptions.targetPath);

      spinner.succeed(`スケルトンの生成が完了しました (${result.generatedFiles.length}個のファイルを生成)`);

      // 警告があれば表示
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\\n⚠️  警告:'));
        for (const warning of result.warnings) {
          console.log(chalk.yellow(`  • ${warning}`));
        }
      }

    } catch (error) {
      spinner.fail('スケルトンの生成に失敗しました');
      throw error;
    }
  }

  /**
   * 追加ファイルの生成
   */
  private async generateAdditionalFiles(targetPath: string): Promise<void> {
    // プロジェクト管理ファイル
    if (this.options.includeProjectManagement) {
      await this.copyProjectManagementFiles(targetPath);
    }

    // アーキテクチャファイル
    if (this.options.includeArchitecture) {
      await this.copyArchitectureFiles(targetPath);
    }

    // 開発ツール設定
    if (this.options.includeTools) {
      await this.copyToolsFiles(targetPath);
    }

    // 基本ドキュメント
    await this.copyBasicDocuments(targetPath);

    // .cursorrules生成
    if (this.options.customCursorRules) {
      await this.generateCursorRules(targetPath);
    }
  }

  /**
   * プロジェクト管理ファイルのコピー
   */
  private async copyProjectManagementFiles(targetPath: string): Promise<void> {
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

  /**
   * アーキテクチャファイルのコピー
   */
  private async copyArchitectureFiles(targetPath: string): Promise<void> {
    const archPath = path.join(this.sourceDir, 'templates', 'architectures');
    const targetArchPath = path.join(targetPath, 'docs', 'architecture');

    if (await fs.pathExists(archPath)) {
      await fs.copy(archPath, targetArchPath);
    }
  }

  /**
   * 開発ツール設定のコピー
   */
  private async copyToolsFiles(targetPath: string): Promise<void> {
    const toolsPath = path.join(this.sourceDir, 'templates', 'tools');
    const targetToolsPath = path.join(targetPath, 'tools');

    if (await fs.pathExists(toolsPath)) {
      await fs.copy(toolsPath, targetToolsPath);
    }
  }

  /**
   * 基本ドキュメントのコピー
   */
  private async copyBasicDocuments(targetPath: string): Promise<void> {
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

  /**
   * PRDテンプレートのコピー
   */
  private async copyPRDTemplate(targetPath: string): Promise<void> {
    const prdTemplatePath = path.join(this.sourceDir, 'templates', 'PRD.md.template');
    const targetPRDPath = path.join(targetPath, 'PRD.md');

    if (await fs.pathExists(prdTemplatePath)) {
      let content = await fs.readFile(prdTemplatePath, 'utf8');
      
      const currentDate = new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);
      content = content.replace(/\{\{PROJECT_NAME\}\}/g, this.options.projectName!);
      content = content.replace(/\{\{PROJECT_TYPE\}\}/g, this.options.templateId!);
      content = content.replace(/\{\{DATE\}\}/g, currentDate);
      
      await fs.writeFile(targetPRDPath, content);
    }
  }

  /**
   * .cursorrulesの生成
   */
  private async generateCursorRules(targetPath: string): Promise<void> {
    const template = this.pluginManager.getTemplate(this.options.templateId!);
    const templateName = template?.name || this.options.templateId!;
    
    const cursorRulesContent = `# Cursor Rules - ${this.options.projectName}

## プロジェクト概要
- プロジェクト名: ${this.options.projectName}
- テンプレート: ${templateName}

## 開発ガイドライン
- 常に日本語でコミュニケーションする
- テスト駆動開発（TDD）を実践する
- コードレビューを必ず行う
- ドキュメントを適切に更新する

## プロジェクト固有の設定
${this.getTemplateSpecificRules()}

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

  /**
   * テンプレート固有のルール取得
   */
  private getTemplateSpecificRules(): string {
    const template = this.pluginManager.getTemplate(this.options.templateId!);
    
    switch (template?.category) {
      case 'mcp-server':
        return `## MCP Server プロジェクト
- src/index.ts がエントリーポイント
- Model Context Protocol (MCP) 仕様に準拠
- tools/, resources/, prompts/ でMCP機能を実装
- TypeScript + Node.js で開発`;

      case 'web':
        return `## Web アプリケーション
- pages/ または app/ ディレクトリでルーティング
- components/ ディレクトリにReactコンポーネントを配置
- public/ ディレクトリに静的ファイルを配置
- TypeScript を使用`;

      case 'api':
        return `## API プロジェクト
- src/main.py がエントリーポイント
- requirements.txt で依存関係を管理
- tests/ ディレクトリにテストを配置
- Pydantic を使用してデータバリデーション`;

      case 'cli':
        return `## CLI プロジェクト
- Cargo.toml で依存関係を管理
- src/main.rs がエントリーポイント
- tests/ ディレクトリにテストを配置
- clap を使用してCLI引数を処理`;

      default:
        return `## ${template?.name || 'カスタム'} プロジェクト
- プロジェクト固有の開発ガイドラインに従ってください`;
    }
  }

  /**
   * 後処理
   */
  private async postProcess(): Promise<void> {
    const targetPath = path.resolve(this.options.targetPath!);
    
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
  }

  /**
   * 次のステップの表示
   */
  private printNextSteps(): void {
    const targetPath = path.resolve(this.options.targetPath!);
    
    console.log(chalk.cyan.bold('\\n📋 次のステップ:'));
    
    // プラグインから次のステップ情報を取得
    const template = this.pluginManager.getTemplate(this.options.templateId!);
    
    // デフォルトのステップ
    console.log(chalk.white(`1. プロジェクトディレクトリに移動:`));
    console.log(chalk.gray(`   cd ${targetPath}`));
    
    console.log(chalk.white(`2. PRD.mdを完成させる:`));
    console.log(chalk.gray(`   # プロダクト要件を詳細に記述してください`));
    
    console.log(chalk.white(`3. Claude Code を起動:`));
    console.log(chalk.gray(`   # プロジェクトディレクトリでClaude Codeを起動`));
    
    console.log(chalk.white(`4. スケルトンの自動アレンジ:`));
    console.log(chalk.gray(`   # Claude に以下を指示:`));
    console.log(chalk.gray(`   \"PRD.mdの内容に基づいてプロジェクトのスケルトンをアレンジして\"`));
    
    console.log(chalk.cyan.bold('\\n🎉 プラグインベース開発の準備が完了しました！'));
    console.log(chalk.yellow(`💡 ${template?.name || 'プロジェクト'}テンプレートが正常に生成されました`));
  }

  /**
   * ヘルプの表示
   */
  private printHelp(): void {
    console.log(chalk.cyan.bold('使用方法:'));
    console.log(chalk.white('  npm run scaffold:plugin'));
    console.log(chalk.white('  npm run scaffold:plugin -- --project-name=my-project --template-id=mcp-server'));
    console.log(chalk.cyan.bold('\\nオプション:'));
    console.log(chalk.white('  --help                    このヘルプを表示'));
    console.log(chalk.white('  --project-name=NAME       プロジェクト名'));
    console.log(chalk.white('  --template-id=ID          テンプレートID'));
    console.log(chalk.white('  --target-path=PATH        生成先パス'));
    console.log(chalk.white('  --plugin-dir=DIR          プラグインディレクトリ'));
    console.log(chalk.white('  --no-auto-load-plugins    プラグインの自動ロードを無効化'));
    console.log(chalk.white('  --skip-optional           オプション選択をスキップ'));
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new PluginScaffoldGenerator();
  generator.run().catch((error) => {
    console.error(chalk.red('致命的なエラーが発生しました:'), error);
    process.exit(1);
  });
}