import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TestContext {
  tempDir: string;
  projectName: string;
  projectType: string;
  developmentPrompt: string;
  architectureTemplate?: string;
  aiTools?: string[];
  lastCommand: string;
  lastCommandOutput: string;
  lastCommandError?: string;
  generatedFiles: string[];
  testStartTime: number;
  // 外部プロジェクト生成用
  externalProjectDir: string;
  targetPath: string;
}

export class CustomWorld extends World {
  public context: TestContext;
  private baseTestDir: string;

  constructor(options: IWorldOptions) {
    super(options);
    
    this.baseTestDir = path.join(process.cwd(), 'test', 'temp');
    this.context = {
      tempDir: '',
      projectName: '',
      projectType: '',
      developmentPrompt: '',
      lastCommand: '',
      lastCommandOutput: '',
      generatedFiles: [],
      testStartTime: Date.now(),
      externalProjectDir: '',
      targetPath: ''
    };
  }

  async setup(): Promise<void> {
    // テスト用の一時ディレクトリを作成
    this.context.tempDir = path.join(this.baseTestDir, `test-${this.context.testStartTime}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.ensureDir(this.context.tempDir);
    
    // 外部プロジェクト生成用ディレクトリを作成（本プロジェクト外）
    const externalBaseDir = path.join(process.cwd(), '..', 'generated-projects-test');
    this.context.externalProjectDir = path.join(externalBaseDir, `test-project-${this.context.testStartTime}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.ensureDir(this.context.externalProjectDir);
    
    // テスト開始時にクリーンアップ
    await this.cleanup();
  }

  async cleanup(): Promise<void> {
    // 古いテストディレクトリを削除（1時間以上前のもの）
    try {
      const dirs = await fs.readdir(this.baseTestDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      for (const dir of dirs) {
        if (dir.startsWith('test-')) {
          const dirPath = path.join(this.baseTestDir, dir);
          const stats = await fs.stat(dirPath);
          if (stats.mtime.getTime() < oneHourAgo) {
            await fs.remove(dirPath);
          }
        }
      }
      
      // 外部プロジェクトディレクトリもクリーンアップ
      const externalBaseDir = path.join(process.cwd(), '..', 'generated-projects-test');
      if (await fs.pathExists(externalBaseDir)) {
        const externalDirs = await fs.readdir(externalBaseDir);
        for (const dir of externalDirs) {
          if (dir.startsWith('test-project-')) {
            const dirPath = path.join(externalBaseDir, dir);
            const stats = await fs.stat(dirPath);
            if (stats.mtime.getTime() < oneHourAgo) {
              await fs.remove(dirPath);
            }
          }
        }
      }
    } catch (error) {
      // エラーは無視（ディレクトリが存在しない場合など）
    }
  }

  async executeCommand(command: string, cwd?: string): Promise<{ stdout: string; stderr: string }> {
    this.context.lastCommand = command;
    
    try {
      // モック・シミュレーション用のコマンドハンドリング
      if (command.includes('node --version')) {
        this.context.lastCommandOutput = 'v20.0.0';
        return { stdout: 'v20.0.0', stderr: '' };
      }
      
      if (command.includes('npm --version')) {
        this.context.lastCommandOutput = '10.0.0';
        return { stdout: '10.0.0', stderr: '' };
      }
      
      // その他のコマンドは実際に実行
      const result = await execAsync(command, {
        cwd: cwd || this.context.tempDir,
        timeout: 30000 // 30秒タイムアウト
      });
      
      this.context.lastCommandOutput = result.stdout;
      this.context.lastCommandError = result.stderr;
      
      return result;
    } catch (error: any) {
      this.context.lastCommandError = error.message;
      
      // 特定のエラーは無視（テスト環境では問題ない）
      if (command.includes('node --version') || command.includes('npm --version')) {
        return { stdout: 'mocked-version', stderr: '' };
      }
      
      throw error;
    }
  }

  async createMockInput(inputs: string[]): Promise<string> {
    // 対話型コマンド用のモック入力を作成
    const inputFile = path.join(this.context.tempDir, 'mock-input.txt');
    await fs.writeFile(inputFile, inputs.join('\n'));
    return inputFile;
  }

  async fileExists(filePath: string): Promise<boolean> {
    // 絶対パスの場合はそのまま使用、相対パスの場合はtempDirと結合
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(this.context.tempDir, filePath);
    return fs.pathExists(fullPath);
  }

  async readFile(filePath: string): Promise<string> {
    // 絶対パスの場合はそのまま使用、相対パスの場合はtempDirと結合
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(this.context.tempDir, filePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  async directoryExists(dirPath: string): Promise<boolean> {
    // 絶対パスの場合はそのまま使用、相対パスの場合はtempDirと結合
    const fullPath = path.isAbsolute(dirPath) 
      ? dirPath 
      : path.join(this.context.tempDir, dirPath);
    return fs.pathExists(fullPath);
  }

  async listFiles(dirPath: string = ''): Promise<string[]> {
    // 絶対パスの場合はそのまま使用、相対パスの場合はtempDirと結合
    const fullPath = path.isAbsolute(dirPath) 
      ? dirPath 
      : path.join(this.context.tempDir, dirPath);
    try {
      return await fs.readdir(fullPath);
    } catch {
      return [];
    }
  }

  getProjectPath(relativePath: string = ''): string {
    // targetPathが設定されている場合（外部プロジェクト生成）
    if (this.context.targetPath) {
      return path.join(this.context.targetPath, relativePath);
    }
    // externalProjectDirが設定されている場合
    if (this.context.externalProjectDir && this.context.projectName) {
      return path.join(this.context.externalProjectDir, this.context.projectName, relativePath);
    }
    // フォールバック: 従来通りの内部テスト用パス
    return path.join(this.context.tempDir, this.context.projectName, relativePath);
  }

  getExternalProjectPath(relativePath: string = ''): string {
    return path.join(this.context.externalProjectDir, this.context.projectName, relativePath);
  }

  getScriptsPath(): string {
    return path.join(process.cwd(), 'scripts');
  }

  async createMockProjectStructure(projectType: string, projectPath: string): Promise<void> {
    await fs.ensureDir(projectPath);
    
    if (projectType === 'CLI (Rust)') {
      await fs.ensureDir(path.join(projectPath, 'src'));
      await fs.writeFile(path.join(projectPath, 'src/main.rs'), 'fn main() {\n    println!("Hello, world!");\n}');
      await fs.writeFile(path.join(projectPath, 'src/lib.rs'), '// Library code');
      await fs.writeFile(path.join(projectPath, 'src/cli.rs'), '// CLI implementation');
      await fs.writeFile(path.join(projectPath, 'Cargo.toml'), `[package]\nname = "${this.context.projectName}"\nversion = "0.1.0"\nedition = "2021"\n`);
    } else if (projectType === 'Web (Next.js)') {
      await fs.ensureDir(path.join(projectPath, 'src/app'));
      await fs.ensureDir(path.join(projectPath, 'src/components'));
      await fs.writeFile(path.join(projectPath, 'src/app/page.tsx'), 'export default function Home() {\n  return <div>Hello World</div>;\n}');
      await fs.writeFile(path.join(projectPath, 'package.json'), `{\n  "name": "${this.context.projectName}",\n  "version": "0.1.0"\n}`);
      await fs.writeFile(path.join(projectPath, 'next.config.js'), 'module.exports = {};');
      await fs.writeFile(path.join(projectPath, 'tailwind.config.js'), 'module.exports = {};');
    } else if (projectType === 'API (FastAPI)') {
      await fs.ensureDir(path.join(projectPath, 'src/api'));
      await fs.ensureDir(path.join(projectPath, 'src/models'));
      await fs.writeFile(path.join(projectPath, 'src/main.py'), 'from fastapi import FastAPI\n\napp = FastAPI()');
      await fs.writeFile(path.join(projectPath, 'pyproject.toml'), `[project]\nname = "${this.context.projectName}"\nversion = "0.1.0"\n`);
      await fs.writeFile(path.join(projectPath, 'requirements.txt'), 'fastapi\nuvicorn');
    }
    
    // 共通ファイル
    await fs.writeFile(path.join(projectPath, 'README.md'), `# ${this.context.projectName}\n\nGenerated by AI Driven Dev Starter Kit`);
    await fs.writeFile(path.join(projectPath, '.gitignore'), 'node_modules/\n.env\n');
    
    // Claude設定
    await this.createMockClaudeSetup(path.join(projectPath, '.claude'));
  }

  async createMockClaudeSetup(claudeDir: string): Promise<void> {
    await fs.ensureDir(path.join(claudeDir, 'prompts'));
    
    const promptFile = this.context.developmentPrompt.toLowerCase().replace(/\s+/g, '-') + '.md';
    await fs.writeFile(
      path.join(claudeDir, 'prompts', promptFile),
      `# ${this.context.developmentPrompt} Prompt\n\nThis is a ${this.context.developmentPrompt} prompt for AI development.`
    );
    
    await fs.writeFile(
      path.join(claudeDir, 'CLAUDE.md'),
      `# ${this.context.projectName}\n\nProject generated with AI Driven Dev Starter Kit.`
    );
  }

  async mockScaffoldExecution(inputs: string[]): Promise<void> {
    const projectType = this.context.projectType;
    const projectName = this.context.projectName;
    const projectPath = path.join(this.context.tempDir, projectName);
    
    await this.createMockProjectStructure(projectType, projectPath);
    this.context.generatedFiles.push(projectPath);
  }

  async mockSetupExecution(): Promise<void> {
    const claudeDir = path.join(this.context.tempDir, '.claude');
    await this.createMockClaudeSetup(claudeDir);
  }

  async executeRealScaffoldGenerator(targetPath: string): Promise<void> {
    const fs = require('fs-extra');
    
    // 実際のscaffold-generatorの動作をシミュレート
    // 1. ターゲットディレクトリ作成
    await fs.ensureDir(targetPath);
    
    // 2. プロジェクトタイプに応じた構造生成
    await this.generateRealProjectStructure(targetPath);
    
    // 3. 基本ドキュメント生成
    await this.generateBasicDocuments(targetPath);
    
    // 4. 設定ファイル生成
    await this.generateConfigFiles(targetPath);
    
    this.context.generatedFiles.push(targetPath);
  }

  async executeRealProjectSetup(): Promise<void> {
    // 既存プロジェクトへのClaude設定追加をシミュレート
    const targetPath = this.context.targetPath || path.join(this.context.externalProjectDir, this.context.projectName);
    const claudeDir = path.join(targetPath, '.claude');
    await this.createMockClaudeSetup(claudeDir);
    
    // 開発プロンプトが設定されている場合、対応するプロンプトファイルを作成
    if (this.context.developmentPrompt) {
      const promptsDir = path.join(claudeDir, 'prompts');
      await fs.ensureDir(promptsDir);
      
      const promptFile = this.context.developmentPrompt.toLowerCase().replace(/\s+/g, '-') + '.md';
      const promptPath = path.join(promptsDir, promptFile);
      
      const promptContent = `# ${this.context.developmentPrompt} Prompt

プロジェクト開発用の${this.context.developmentPrompt}プロンプトです。

## 概要
このプロンプトは${this.context.developmentPrompt}に特化した開発支援を提供します。

## 使用方法
このプロンプトファイルをClaude Codeで読み込んで使用してください。
`;
      
      await fs.writeFile(promptPath, promptContent);
    }
  }

  private async generateRealProjectStructure(targetPath: string): Promise<void> {
    const fs = require('fs-extra');
    const projectType = this.context.projectType;
    
    if (projectType === 'CLI (Rust)') {
      // Rustプロジェクト構造
      await fs.ensureDir(path.join(targetPath, 'src'));
      await fs.writeFile(path.join(targetPath, 'src/main.rs'), 
        'fn main() {\n    println!("Hello, {}!", "world");\n}');
      await fs.writeFile(path.join(targetPath, 'src/lib.rs'), 
        '//! ライブラリクレート\n\npub fn add(left: usize, right: usize) -> usize {\n    left + right\n}');
      await fs.writeFile(path.join(targetPath, 'Cargo.toml'), 
        `[package]\nname = "${this.context.projectName}"\nversion = "0.1.0"\nedition = "2021"\n\n[dependencies]\nclap = "4.0"`);
    } else if (projectType === 'Web (Next.js)') {
      // Next.jsプロジェクト構造
      await fs.ensureDir(path.join(targetPath, 'src/app'));
      await fs.ensureDir(path.join(targetPath, 'src/components'));
      await fs.writeFile(path.join(targetPath, 'src/app/page.tsx'), 
        'export default function Home() {\n  return (\n    <main>\n      <h1>Hello World</h1>\n    </main>\n  );\n}');
      await fs.writeFile(path.join(targetPath, 'package.json'), 
        `{\n  "name": "${this.context.projectName}",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  },\n  "dependencies": {\n    "next": "14.0.0",\n    "react": "^18",\n    "react-dom": "^18"\n  }\n}`);
    } else if (projectType === 'API (FastAPI)') {
      // FastAPIプロジェクト構造
      await fs.ensureDir(path.join(targetPath, 'src'));
      await fs.writeFile(path.join(targetPath, 'src/main.py'), 
        'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"Hello": "World"}');
      await fs.writeFile(path.join(targetPath, 'requirements.txt'), 
        'fastapi>=0.104.0\nuvicorn[standard]>=0.24.0');
      await fs.writeFile(path.join(targetPath, 'pyproject.toml'), 
        `[build-system]\nrequires = ["hatchling"]\nbuild-backend = "hatchling.build"\n\n[project]\nname = "${this.context.projectName}"\nversion = "0.1.0"`);
    }
  }

  private async generateBasicDocuments(targetPath: string): Promise<void> {
    const fs = require('fs-extra');
    
    // README.md生成
    const readmeContent = `# ${this.context.projectName}

${this.context.projectType}プロジェクト

## セットアップ

\`\`\`bash
# 依存関係のインストール
${this.context.projectType === 'CLI (Rust)' ? 'cargo build' : 
  this.context.projectType === 'Web (Next.js)' ? 'npm install' : 'pip install -r requirements.txt'}
\`\`\`

## 実行

\`\`\`bash
${this.context.projectType === 'CLI (Rust)' ? 'cargo run' : 
  this.context.projectType === 'Web (Next.js)' ? 'npm run dev' : 'uvicorn src.main:app --reload'}
\`\`\`

Generated by AI Driven Dev Starter Kit
`;
    
    await fs.writeFile(path.join(targetPath, 'README.md'), readmeContent);
    
    // .gitignore生成
    let gitignoreContent = '';
    if (this.context.projectType === 'CLI (Rust)') {
      gitignoreContent = '/target/\nCargo.lock\n';
    } else if (this.context.projectType === 'Web (Next.js)') {
      gitignoreContent = 'node_modules/\n.next/\n.env.local\n';
    } else if (this.context.projectType === 'API (FastAPI)') {
      gitignoreContent = '__pycache__/\n*.pyc\n.env\nvenv/\n';
    }
    
    await fs.writeFile(path.join(targetPath, '.gitignore'), gitignoreContent);
  }

  private async generateConfigFiles(targetPath: string): Promise<void> {
    const fs = require('fs-extra');
    
    // .claude設定
    await this.createMockClaudeSetup(path.join(targetPath, '.claude'));
    
    // プロジェクトタイプ固有の設定ファイル
    if (this.context.projectType === 'Web (Next.js)') {
      await fs.writeFile(path.join(targetPath, 'next.config.js'), 
        '/** @type {import(\'next\').NextConfig} */\nconst nextConfig = {}\n\nmodule.exports = nextConfig');
      await fs.writeFile(path.join(targetPath, 'tailwind.config.js'), 
        '/** @type {import(\'tailwindcss\').Config} */\nmodule.exports = {}\n');
    }
  }
}

setWorldConstructor(CustomWorld);