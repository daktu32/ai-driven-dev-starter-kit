/**
 * ScaffoldEngine - テンプレートカスタマイズ対応の核となる生成エンジン
 * 
 * 既存のscaffold-generator.tsから生成ロジックを抽出し、
 * カスタムテンプレートとの統合を可能にする。
 */

import fs from 'fs-extra';
import { readdir } from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectConfig } from './types.js';
import { ValidationError, ScaffoldOptions } from './validator.js';
import { safeExpandPath } from './pathUtils.js';
import { ScaffoldTransaction, GenerationState, CommonSteps, TransactionStep } from './ScaffoldTransaction.js';


export interface TemplateContext {
  projectName: string;
  projectType: string;
  className: string;
  description: string;
  author: string;
  date: string;
  [key: string]: any;
}

export interface GenerationResult {
  generatedFiles: string[];
  errors: string[];
  warnings: string[];
  transaction?: ScaffoldTransaction;
}

/**
 * ScaffoldEngine - テンプレート生成の核となるエンジン
 */
export class ScaffoldEngine {
  private sourceDir: string;
  private useTransaction: boolean;

  constructor(sourceDir?: string, options: { useTransaction?: boolean } = {}) {
    this.sourceDir = sourceDir || path.resolve(process.cwd());
    this.useTransaction = options.useTransaction !== false; // デフォルトでトランザクション使用
  }

  /**
   * メインの生成処理
   */
  async generateProject(
    templatePath: string,
    options: ScaffoldOptions
  ): Promise<GenerationResult> {
    const targetPath = path.resolve(options.targetPath);
    const result: GenerationResult = {
      generatedFiles: [],
      errors: [],
      warnings: []
    };

    if (this.useTransaction) {
      return this.generateProjectWithTransaction(templatePath, targetPath, options, result);
    } else {
      return this.generateProjectLegacy(templatePath, targetPath, options, result);
    }
  }

  /**
   * トランザクション機能付きの生成処理
   */
  private async generateProjectWithTransaction(
    templatePath: string,
    targetPath: string,
    options: ScaffoldOptions,
    result: GenerationResult
  ): Promise<GenerationResult> {
    const transaction = new ScaffoldTransaction(targetPath, { verbose: false });
    const state = transaction.getState();
    const context = this.createTemplateContext(options);

    result.transaction = transaction;

    // ステップ1: ディレクトリ作成
    transaction.addStep(CommonSteps.createDirectory(targetPath, state));

    // ステップ2: テンプレートファイルのコピー・処理
    transaction.addStep({
      name: 'テンプレートファイルのコピー・処理',
      description: `テンプレートから ${templatePath} をコピー`,
      execute: async () => {
        await this.processTemplate(templatePath, targetPath, context, result, state);
      }
    });

    // ステップ3: オプション機能の追加
    if (options.includeProjectManagement) {
      transaction.addStep({
        name: 'プロジェクト管理ファイルの追加',
        description: 'PROGRESS.md、ROADMAP.md、CHANGELOG.mdの生成',
        execute: async () => {
          await this.addProjectManagementFiles(targetPath, context, result, state);
        }
      });
    }

    if (options.includeArchitecture) {
      transaction.addStep({
        name: 'アーキテクチャファイルの追加',
        description: 'docs/architecture/ 配下のファイル生成',
        execute: async () => {
          await this.addArchitectureFiles(targetPath, context, result, state);
        }
      });
    }

    if (options.includeTools) {
      transaction.addStep({
        name: '開発ツールファイルの追加',
        description: 'tools/ 配下のファイル生成',
        execute: async () => {
          await this.addToolsFiles(targetPath, context, result, state);
        }
      });
    }

    if (options.customCursorRules) {
      transaction.addStep({
        name: 'Cursor Rules生成',
        description: '.cursorrules ファイルの生成',
        execute: async () => {
          await this.generateCursorRules(targetPath, context, result, state);
        }
      });
    }

    // ステップ4: 生成後処理
    transaction.addStep({
      name: '生成後処理',
      description: '.git、node_modules の削除',
      execute: async () => {
        await this.postProcess(targetPath, result);
      }
    });

    try {
      await transaction.execute();
      return result;
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * 従来の生成処理（トランザクション無し）
   */
  private async generateProjectLegacy(
    templatePath: string,
    targetPath: string,
    options: ScaffoldOptions,
    result: GenerationResult
  ): Promise<GenerationResult> {
    const spinner = ora('プロジェクトを生成中...').start();

    try {
      // ターゲットディレクトリ作成
      await fs.ensureDir(targetPath);

      // テンプレートコンテキスト作成
      const context = this.createTemplateContext(options);

      // テンプレートファイルのコピー・処理
      await this.processTemplate(templatePath, targetPath, context, result);

      // オプション機能の追加
      if (options.includeProjectManagement) {
        await this.addProjectManagementFiles(targetPath, context, result);
      }

      if (options.includeArchitecture) {
        await this.addArchitectureFiles(targetPath, context, result);
      }

      if (options.includeTools) {
        await this.addToolsFiles(targetPath, context, result);
      }

      if (options.customCursorRules) {
        await this.generateCursorRules(targetPath, context, result);
      }

      // 生成後処理
      await this.postProcess(targetPath, result);

      spinner.succeed('プロジェクトの生成が完了しました');
      return result;

    } catch (error) {
      spinner.fail('プロジェクトの生成に失敗しました');
      result.errors.push(error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  /**
   * テンプレートコンテキストの作成
   */
  private createTemplateContext(options: ScaffoldOptions): TemplateContext {
    const className = options.projectName
      .replace(/-/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (c) => c.toUpperCase());

    const currentDate = new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);

    return {
      projectName: options.projectName,
      projectType: options.projectType,
      className,
      description: `${options.projectName} - Generated by Claude Code Dev Starter Kit`,
      author: 'Your Name',
      date: currentDate,
      // 追加のコンテキスト変数
      ...this.getProjectTypeDefaults(options.projectType)
    };
  }

  /**
   * プロジェクトタイプ別のデフォルト値
   */
  private getProjectTypeDefaults(projectType: string): Record<string, any> {
    const defaults: Record<string, Record<string, any>> = {
      'cli-rust': {
        language: 'Rust',
        framework: 'Clap',
        buildTool: 'Cargo'
      },
      'web-nextjs': {
        language: 'TypeScript',
        framework: 'Next.js',
        buildTool: 'npm'
      },
      'api-fastapi': {
        language: 'Python',
        framework: 'FastAPI',
        buildTool: 'pip'
      },
      'mcp-server': {
        language: 'TypeScript',
        framework: 'Node.js',
        buildTool: 'npm'
      }
    };

    return defaults[projectType] || {};
  }

  /**
   * テンプレートの処理（コピー・変数置換）
   */
  private async processTemplate(
    templatePath: string,
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    if (!(await fs.pathExists(templatePath))) {
      throw new Error(`テンプレートディレクトリが見つかりません: ${templatePath}`);
    }

    await this.copyDirectoryRecursively(templatePath, targetPath, context, result, state);
  }

  /**
   * ディレクトリの再帰コピー（変数置換付き）
   */
  private async copyDirectoryRecursively(
    sourcePath: string,
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    try {
      const items = await readdir(sourcePath, { withFileTypes: true });

      for (const item of items) {
        const sourceItemPath = path.join(sourcePath, item.name);
        let targetFileName = item.name;

        // .templateファイルは拡張子を除去
        if (item.name.endsWith('.template')) {
          targetFileName = item.name.replace('.template', '');
        }

        const targetItemPath = path.join(targetPath, targetFileName);

        try {
          if (item.isFile()) {
            await this.processFile(sourceItemPath, targetItemPath, context);
            result.generatedFiles.push(path.relative(targetPath, targetItemPath));
            
            // トランザクション状態にファイルを追加
            if (state) {
              state.addGeneratedFile(targetItemPath);
            }
          } else if (item.isDirectory()) {
            await fs.ensureDir(targetItemPath);
            
            // トランザクション状態にディレクトリを追加
            if (state) {
              state.addGeneratedDirectory(targetItemPath);
            }
            
            await this.copyDirectoryRecursively(sourceItemPath, targetItemPath, context, result, state);
          }
        } catch (error) {
          const errorMsg = `ファイル処理エラー: ${item.name} - ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          console.error(chalk.red(errorMsg));
        }
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        const fsError = error as { code?: string };
        if (fsError.code === 'ENOENT') {
          throw new Error(`ソースディレクトリが見つかりません: ${sourcePath}`);
        }
        if (fsError.code === 'EACCES') {
          throw new Error(`ディレクトリへのアクセス権限がありません: ${sourcePath}`);
        }
      }
      throw new Error(`ディレクトリ読み込みエラー: ${sourcePath}\n${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * ファイルの処理（読み込み・変数置換・書き込み）
   */
  private async processFile(
    sourcePath: string,
    targetPath: string,
    context: TemplateContext
  ): Promise<void> {
    try {
      let content = await fs.readFile(sourcePath, 'utf8');

      // 変数置換
      content = this.replaceVariables(content, context);

      await fs.ensureDir(path.dirname(targetPath));
      await fs.writeFile(targetPath, content);
    } catch (error) {
      throw new Error(`ファイル処理失敗: ${sourcePath} -> ${targetPath}\n${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 変数置換処理
   */
  private replaceVariables(content: string, context: TemplateContext): string {
    // 基本的な変数置換（{{VAR}}形式）
    let result = content;
    
    for (const [key, value] of Object.entries(context)) {
      const pattern = new RegExp(`\\{\\{${key.toUpperCase()}\\}\\}`, 'g');
      result = result.replace(pattern, String(value));
    }

    // 従来の形式も維持（{{PROJECT_NAME}}等）
    result = result.replace(/\{\{PROJECT_NAME\}\}/g, context.projectName);
    result = result.replace(/\{\{PROJECT_CLASS_NAME\}\}/g, context.className);
    result = result.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, context.description);
    result = result.replace(/\{\{AUTHOR\}\}/g, context.author);
    result = result.replace(/\{\{DATE\}\}/g, context.date);

    return result;
  }

  /**
   * プロジェクト管理ファイルの追加
   */
  private async addProjectManagementFiles(
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    const pmPath = path.join(this.sourceDir, 'templates', 'project-management');
    const pmFiles = ['PROGRESS.md', 'ROADMAP.md', 'CHANGELOG.md'];

    for (const file of pmFiles) {
      const sourcePath = path.join(pmPath, file);
      const targetFilePath = path.join(targetPath, file);

      try {
        if (await fs.pathExists(sourcePath)) {
          await this.processFile(sourcePath, targetFilePath, context);
          result.generatedFiles.push(file);
          
          // トランザクション状態にファイルを追加
          if (state) {
            state.addGeneratedFile(targetFilePath);
          }
        }
      } catch (error) {
        result.warnings.push(`プロジェクト管理ファイルのコピーに失敗しました: ${file}`);
      }
    }
  }

  /**
   * アーキテクチャファイルの追加
   */
  private async addArchitectureFiles(
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    const archPath = path.join(this.sourceDir, 'templates', 'architectures');
    const targetArchPath = path.join(targetPath, 'docs', 'architecture');

    if (await fs.pathExists(archPath)) {
      await fs.ensureDir(targetArchPath);
      
      // トランザクション状態にディレクトリを追加
      if (state) {
        state.addGeneratedDirectory(targetArchPath);
      }
      
      await this.copyDirectoryRecursively(archPath, targetArchPath, context, result, state);
    }
  }

  /**
   * 開発ツールファイルの追加
   */
  private async addToolsFiles(
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    const toolsPath = path.join(this.sourceDir, 'templates', 'tools');
    const targetToolsPath = path.join(targetPath, 'tools');

    if (await fs.pathExists(toolsPath)) {
      await fs.ensureDir(targetToolsPath);
      
      // トランザクション状態にディレクトリを追加
      if (state) {
        state.addGeneratedDirectory(targetToolsPath);
      }
      
      await this.copyDirectoryRecursively(toolsPath, targetToolsPath, context, result, state);
    }
  }

  /**
   * Cursor Rules生成
   */
  private async generateCursorRules(
    targetPath: string,
    context: TemplateContext,
    result: GenerationResult,
    state?: GenerationState
  ): Promise<void> {
    const cursorRulesContent = `# Cursor Rules - ${context.projectName}

## プロジェクト概要
- プロジェクト名: ${context.projectName}
- プロジェクトタイプ: ${context.projectType}
- 言語: ${context.language || 'N/A'}
- フレームワーク: ${context.framework || 'N/A'}

## 開発ガイドライン
- 常に日本語でコミュニケーションする
- テスト駆動開発（TDD）を実践する
- コードレビューを必ず行う
- ドキュメントを適切に更新する

## ファイル命名規則
- コンポーネント: PascalCase
- ユーティリティ: camelCase
- テストファイル: *.test.*
- 型定義: *.types.*

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
    result.generatedFiles.push('.cursorrules');
    
    // トランザクション状態にファイルを追加
    if (state) {
      state.addGeneratedFile(cursorRulesPath);
    }
  }

  /**
   * 生成後処理
   */
  private async postProcess(targetPath: string, result: GenerationResult): Promise<void> {
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
}