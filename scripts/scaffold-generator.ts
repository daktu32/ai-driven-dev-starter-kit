#!/usr/bin/env node

import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';

interface ScaffoldOptions {
  targetPath: string;
  projectName: string;
  projectType: 'cli-rust' | 'web-nextjs' | 'api-fastapi';
  includeProjectManagement: boolean;
  includeArchitecture: boolean;
  includeTools: boolean;
  customCursorRules: boolean;
}

class ScaffoldGenerator {
  private sourceDir: string;
  private options!: ScaffoldOptions;

  constructor() {
    this.sourceDir = path.resolve(__dirname, '..');
  }

  async run(): Promise<void> {
    console.log(chalk.blue.bold('🏗️  Claude Code Dev Starter Kit - スケルトン生成ツール'));
    console.log(chalk.gray('新しいプロジェクトのスケルトンを生成します\n'));

    try {
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

  private async promptOptions(): Promise<void> {
    const answers = await inquirer.prompt([
      {
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
      },
      {
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
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'プロジェクトタイプを選択してください:',
        choices: [
          { name: 'CLI (Rust)', value: 'cli-rust' },
          { name: 'Web (Next.js)', value: 'web-nextjs' },
          { name: 'API (FastAPI)', value: 'api-fastapi' },
        ],
      },
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
      },
    ]);

    this.options = answers as ScaffoldOptions;
  }

  private async validateTargetPath(): Promise<void> {
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

  private async generateScaffold(): Promise<void> {
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

      // .cursorrules を生成
      if (this.options.customCursorRules) {
        await this.generateCursorRules(targetPath);
      }

      // package.json を更新
      await this.updatePackageJson(targetPath);

      spinner.succeed('スケルトンの生成が完了しました');
    } catch (error) {
      spinner.fail('スケルトンの生成に失敗しました');
      throw error;
    }
  }

  private async copyProjectStructure(targetPath: string): Promise<void> {
    const templatePath = path.join(this.sourceDir, 'templates', 'project-structures', this.options.projectType);
    const structureFiles = await fs.readdir(templatePath);

    for (const file of structureFiles) {
      const sourcePath = path.join(templatePath, file);
      const targetFilePath = path.join(targetPath, file);

      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, targetFilePath);
      }
    }
  }

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

  private async copyArchitectureFiles(targetPath: string): Promise<void> {
    const archPath = path.join(this.sourceDir, 'templates', 'architectures');
    const targetArchPath = path.join(targetPath, 'docs', 'architecture');

    if (await fs.pathExists(archPath)) {
      await fs.copy(archPath, targetArchPath);
    }
  }

  private async copyToolsFiles(targetPath: string): Promise<void> {
    const toolsPath = path.join(this.sourceDir, 'templates', 'tools');
    const targetToolsPath = path.join(targetPath, 'tools');

    if (await fs.pathExists(toolsPath)) {
      await fs.copy(toolsPath, targetToolsPath);
    }
  }

  private async copyBasicDocuments(targetPath: string): Promise<void> {
    const basicDocs = [
      'README.md',
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

  private async generateCursorRules(targetPath: string): Promise<void> {
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

  private getProjectTypeSpecificRules(): string {
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
      default:
        return '';
    }
  }

  private async updatePackageJson(targetPath: string): Promise<void> {
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

  private async postProcess(): Promise<void> {
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
  }

  private printNextSteps(): void {
    const targetPath = path.resolve(this.options.targetPath);
    
    console.log(chalk.cyan.bold('\n📋 次のステップ:'));
    console.log(chalk.white(`1. プロジェクトディレクトリに移動:`));
    console.log(chalk.gray(`   cd ${targetPath}`));
    
    if (this.options.projectType === 'cli-rust') {
      console.log(chalk.white(`2. Rust プロジェクトを初期化:`));
      console.log(chalk.gray(`   cargo init`));
      console.log(chalk.gray(`   cargo build`));
    } else {
      console.log(chalk.white(`2. 依存関係をインストール:`));
      console.log(chalk.gray(`   npm install`));
    }
    
    console.log(chalk.white(`3. Git リポジトリを初期化:`));
    console.log(chalk.gray(`   git init`));
    console.log(chalk.gray(`   git add .`));
    console.log(chalk.gray(`   git commit -m "Initial commit"`));
    
    console.log(chalk.white(`4. 開発を開始:`));
    console.log(chalk.gray(`   npm run dev`));
    
    console.log(chalk.cyan.bold('\n🎉 新しいプロジェクトの準備が完了しました！'));
  }
}

// メイン実行
if (require.main === module) {
  const generator = new ScaffoldGenerator();
  generator.run().catch((error) => {
    console.error(chalk.red('致命的なエラーが発生しました:'), error);
    process.exit(1);
  });
}
