#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { PromptSelector } from './lib/promptSelector.js';
import { TemplateProcessor } from './lib/templateProcessor.js';
import { FileManager } from './lib/fileManager.js';
import { ValidationError, validateProjectConfig, validateProjectName, sanitizeProjectName, validateDescription, sanitizeDescription, validateRepositoryUrl, generateSlugFromName } from './lib/validator.js';
import { ProjectConfig, SetupOptions, TechStackConfig, PromptType, TeamConfig } from './lib/types.js';

class ProjectSetup {
  private options: SetupOptions;
  private fileManager: FileManager;
  private templateProcessor: TemplateProcessor;
  private projectDir: string;

  constructor() {
    this.options = this.parseCliOptions();
    this.projectDir = process.cwd();
    this.fileManager = new FileManager(this.projectDir);
    this.templateProcessor = new TemplateProcessor(this.projectDir);
  }

  private parseCliOptions(): SetupOptions {
    const args = process.argv.slice(2);
    return {
      dryRun: args.includes('--dry-run'),
      skipPromptSelection: args.includes('--skip-prompt'),
      prompt: args.find((arg) => arg.startsWith('--prompt='))?.split('=')[1] as
        | PromptType
        | undefined,
      verbose: args.includes('--verbose') || args.includes('-v'),
    };
  }

  async run(): Promise<void> {
    try {
      console.log(chalk.blue('🔧 Claude Code Development Starter Kit - プロジェクト設定'));
      console.log(chalk.gray('既存プロジェクトをカスタマイズします\n'));

      if (this.options.dryRun) {
        console.log(chalk.yellow('🔍 DRY RUN モード - ファイルは変更されません\n'));
      }

      // プロジェクト情報を収集
      const projectInfo = await this.collectProjectInfo();

      // プロンプトを選択または確認
      const { prompt, team } =
        this.options.skipPromptSelection && this.options.prompt
          ? {
              prompt: this.options.prompt,
              team: {
                size: 1,
                type: 'individual',
                industry: 'technology',
                complianceLevel: 'medium',
              } as TeamConfig,
            }
          : await PromptSelector.selectPrompt();

      // 技術スタック情報を収集
      const techStack = await this.collectTechStackInfo();

      // プロジェクト設定を作成
      const config: ProjectConfig = {
        ...projectInfo,
        prompt,
        team,
        techStack,
        customizations: {},
      };

      // 設定を検証
      await this.validateConfiguration(config);

      // サマリーを表示して確認
      if (!this.options.dryRun) {
        await this.showSummaryAndConfirm(config);
      }

      // プロジェクトをカスタマイズ
      await this.customizeProject(config);

      // 完了メッセージを表示
      this.showCompletionMessage();
    } catch (error) {
      console.error(chalk.red('❌ プロジェクト設定に失敗しました:'), error);
      process.exit(1);
    }
  }

  private async collectProjectInfo(): Promise<
    Omit<ProjectConfig, 'prompt' | 'team' | 'techStack' | 'customizations'>
  > {
    console.log(chalk.blue('\n📝 プロジェクト情報\n'));

    const questions = [
      {
        type: 'input',
        name: 'projectName',
        message: 'プロジェクト名を入力してください:',
        validate: validateProjectName,
        filter: (input: string) => sanitizeProjectName(input),
      },
      {
        type: 'input',
        name: 'description',
        message: 'プロジェクトの説明を入力してください:',
        validate: validateDescription,
        filter: (input: string) => sanitizeDescription(input),
      },
      {
        type: 'input',
        name: 'repositoryUrl',
        message: 'GitHubリポジトリのURLを入力してください:',
        validate: validateRepositoryUrl,
        default: (answers: { projectName: string }) =>
          `https://github.com/your-username/${generateSlugFromName(answers.projectName)}`,
      },
    ];

    return await inquirer.prompt(questions);
  }

  private async collectTechStackInfo(): Promise<TechStackConfig> {
    console.log(chalk.blue('\n🛠️  技術スタック\n'));

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
        message: 'デプロイメントプラットフォームを選択してください:',
        choices: [
          { name: 'GitHub Actions', value: 'GitHub Actions' },
          { name: 'GitLab CI/CD', value: 'GitLab CI/CD' },
          { name: 'Jenkins', value: 'Jenkins' },
          { name: 'CircleCI', value: 'CircleCI' },
          { name: 'その他', value: 'Other' },
        ],
      },
      {
        type: 'list',
        name: 'monitoring',
        message: 'モニタリングソリューションを選択してください:',
        choices: [
          { name: 'CloudWatch', value: 'CloudWatch' },
          { name: 'DataDog', value: 'DataDog' },
          { name: 'New Relic', value: 'New Relic' },
          { name: 'Sentry', value: 'Sentry' },
          { name: 'その他', value: 'Other' },
        ],
      },
    ];

    return await inquirer.prompt(questions);
  }

  private async validateConfiguration(config: ProjectConfig): Promise<void> {
    const spinner = ora('設定を検証中...').start();

    try {
      // プロジェクト構造の検証
      const requiredFiles = ['package.json', 'README.md'];
      for (const file of requiredFiles) {
        if (!await fs.pathExists(path.join(this.projectDir, file))) {
          throw new Error(`必要なファイルが見つかりません: ${file}`);
        }
      }

      // 設定の検証
      if (!config.projectName || !config.description) {
        throw new Error('プロジェクト名と説明は必須です');
      }

      spinner.succeed('設定の検証が完了しました');
    } catch (error) {
      spinner.fail('設定の検証に失敗しました');
      throw error;
    }
  }

  private async showSummaryAndConfirm(config: ProjectConfig): Promise<void> {
    console.log(chalk.blue('\n📋 設定サマリー\n'));
    console.log(chalk.white(`プロジェクト名: ${chalk.cyan(config.projectName)}`));
    console.log(chalk.white(`説明: ${chalk.cyan(config.description)}`));
    console.log(chalk.white(`リポジトリ: ${chalk.cyan(config.repositoryUrl)}`));
    console.log(chalk.white(`プロンプト: ${chalk.cyan(config.prompt)}`));
    console.log(chalk.white(`フロントエンド: ${chalk.cyan(config.techStack.frontend)}`));
    console.log(chalk.white(`バックエンド: ${chalk.cyan(config.techStack.backend)}`));
    console.log(chalk.white(`データベース: ${chalk.cyan(config.techStack.database)}`));
    console.log(chalk.white(`インフラ: ${chalk.cyan(config.techStack.infrastructure)}`));

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'この設定でプロジェクトをカスタマイズしますか？',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('キャンセルされました'));
      process.exit(0);
    }
  }

  private async customizeProject(config: ProjectConfig): Promise<void> {
    const spinner = ora('プロジェクトをカスタマイズ中...').start();

    try {
      // バックアップを作成
      await this.fileManager.backupAllTemplates();

      // テンプレートを処理
      await this.templateProcessor.processAllTemplates(config);

      // プロジェクト設定ファイルを作成
      await this.createProjectConfig(config);

      // プロンプトファイルをコピー
      await this.copyPromptFile(config.prompt);

      // .cursorrules を生成
      await this.generateCursorRules(config);

      spinner.succeed('プロジェクトのカスタマイズが完了しました');
    } catch (error) {
      spinner.fail('プロジェクトのカスタマイズに失敗しました');
      throw error;
    }
  }

  private async createProjectConfig(config: ProjectConfig): Promise<void> {
    const configPath = path.join(this.projectDir, '.claude', 'project-config.json');
    await fs.ensureDir(path.dirname(configPath));
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  private async copyPromptFile(promptType: string): Promise<void> {
    const sourcePath = path.join(this.projectDir, 'templates', 'prompts', `${promptType}.md`);
    const targetPath = path.join(this.projectDir, 'PROMPT.md');

    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, targetPath);
    }
  }

  private async generateCursorRules(config: ProjectConfig): Promise<void> {
    const cursorRulesContent = `# Cursor Rules - ${config.projectName}

## プロジェクト概要
- プロジェクト名: ${config.projectName}
- 説明: ${config.description}
- 技術スタック: ${config.techStack.frontend}, ${config.techStack.backend}, ${config.techStack.database}

## 開発ガイドライン
- 常に日本語でコミュニケーションする
- テスト駆動開発（TDD）を実践する
- コードレビューを必ず行う
- ドキュメントを適切に更新する

## 技術スタック
- フロントエンド: ${config.techStack.frontend}
- バックエンド: ${config.techStack.backend}
- データベース: ${config.techStack.database}
- インフラ: ${config.techStack.infrastructure}
- デプロイ: ${config.techStack.deployment}
- モニタリング: ${config.techStack.monitoring}

## ファイル命名規則
- コンポーネント: PascalCase.tsx
- ユーティリティ: camelCase.ts
- APIハンドラー: kebab-case.ts
- テストファイル: *.test.ts(x)
- 型定義: *.types.ts

## 品質チェックリスト
実装完了前に以下を確認：
- [ ] TypeScriptコンパイルが成功
- [ ] すべてのテストが通過
- [ ] リンティングが通過
- [ ] ドキュメントが更新済み
- [ ] セキュリティ設定が検証済み
`;

    const cursorRulesPath = path.join(this.projectDir, '.cursorrules');
    await fs.writeFile(cursorRulesPath, cursorRulesContent);
  }

  private showCompletionMessage(): void {
    console.log(chalk.green.bold('\n✅ プロジェクト設定が完了しました！'));
    console.log(chalk.blue('\n📝 次のステップ:'));
    console.log(chalk.white('1. プロジェクト設定を確認してください'));
    console.log(chalk.white('2. 必要に応じて追加のカスタマイズを行ってください'));
    console.log(chalk.white('3. 開発を開始してください'));
    console.log(chalk.gray('\n詳細については README.md を参照してください'));
  }
}

// メイン実行
if (require.main === module) {
  const setup = new ProjectSetup();
  setup.run().catch((error) => {
    console.error(chalk.red('致命的なエラーが発生しました:'), error);
    process.exit(1);
  });
}
