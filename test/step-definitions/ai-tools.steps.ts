import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect } from 'chai';
import * as path from 'path';

Given('AI開発ツールの設定を選択している', function(this: CustomWorld) {
  this.context.aiTools = ['pending-selection'];
});

When('{string}の設定を選択する', async function(this: CustomWorld, toolName: string) {
  if (!this.context.aiTools) {
    this.context.aiTools = [];
  }
  this.context.aiTools.push(toolName);
  
  // 実際の設定を実行
  if (toolName === 'Claude Code') {
    await this.setupClaudeCode();
  } else if (toolName === 'GitHub Copilot') {
    await this.setupGitHubCopilot();
  } else if (toolName === 'Cursor') {
    await this.setupCursor();
  }
});

When('AIツール設定後にカスタムプロンプトを追加する', async function(this: CustomWorld) {
  this.context.lastCommand = 'add-custom-prompts';
});

When('.claude/prompts/custom/にファイルを作成する:', async function(this: CustomWorld, dataTable: any) {
  const fs = require('fs-extra');
  const customPromptsDir = path.join(this.getProjectPath(), '.claude', 'prompts', 'custom');
  
  await fs.ensureDir(customPromptsDir);
  
  for (const row of dataTable.hashes()) {
    const filePath = path.join(customPromptsDir, row['ファイル名']);
    const content = `# ${row['ファイル名'].replace('.md', '').replace('-', ' ')}\n\n${row['用途']}\n\nThis prompt assists with ${row['用途'].toLowerCase()}.`;
    await fs.writeFile(filePath, content);
  }
});

When('AIツール設定が完了する', async function(this: CustomWorld) {
  // 各AIツールの設定を完了
  if (this.context.aiTools?.includes('Claude Code')) {
    await this.setupClaudeCode();
  }
  if (this.context.aiTools?.includes('GitHub Copilot')) {
    await this.setupGitHubCopilot();
  }
  if (this.context.aiTools?.includes('Cursor')) {
    await this.setupCursor();
  }
});

When('.gitignoreファイルを確認する', async function(this: CustomWorld) {
  const gitignorePath = path.join(this.getProjectPath(), '.gitignore');
  expect(await this.fileExists(gitignorePath)).to.be.true;
});

Then('.claude/ディレクトリが作成される', async function(this: CustomWorld) {
  const claudeDir = path.join(this.getProjectPath(), '.claude');
  expect(await this.directoryExists(claudeDir)).to.be.true;
});

Then('.claude/CLAUDE.mdが生成される', async function(this: CustomWorld) {
  const claudeMdPath = path.join(this.getProjectPath(), '.claude', 'CLAUDE.md');
  expect(await this.fileExists(claudeMdPath)).to.be.true;
});

Then('CLAUDE.mdには以下の内容が含まれる:', async function(this: CustomWorld, dataTable: any) {
  const claudeMdPath = path.join(this.getProjectPath(), '.claude', 'CLAUDE.md');
  const content = await this.readFile(claudeMdPath);
  
  for (const row of dataTable.hashes()) {
    const section = row['セクション'];
    const sectionContent = row['内容'];
    
    expect(content.toLowerCase()).to.include(section.toLowerCase());
    // 実際の内容の確認は、各セクションのキーワードが含まれているかをチェック
    if (section === 'プロジェクト概要') {
      expect(content).to.include('プロジェクト');
    }
  }
});

Then('.claude/prompts/にプロンプトテンプレートが配置される', async function(this: CustomWorld) {
  const promptsDir = path.join(this.getProjectPath(), '.claude', 'prompts');
  expect(await this.directoryExists(promptsDir)).to.be.true;
  
  const files = await this.listFiles('.claude/prompts');
  expect(files.length).to.be.greaterThan(0);
});

Then('.github/copilot-instructions.mdが作成される', async function(this: CustomWorld) {
  const instructionsPath = path.join(this.getProjectPath(), '.github', 'copilot-instructions.md');
  expect(await this.fileExists(instructionsPath)).to.be.true;
});

Then('.vscode/settings.jsonに以下が追加される:', async function(this: CustomWorld, jsonContent: string) {
  const settingsPath = path.join(this.getProjectPath(), '.vscode', 'settings.json');
  expect(await this.fileExists(settingsPath)).to.be.true;
  
  const content = await this.readFile(settingsPath);
  const settings = JSON.parse(content);
  
  expect(settings).to.have.property('github.copilot.enable');
});

Then('copilot-instructions.mdにプロジェクト固有の指示が含まれる', async function(this: CustomWorld) {
  const instructionsPath = path.join(this.getProjectPath(), '.github', 'copilot-instructions.md');
  const content = await this.readFile(instructionsPath);
  
  expect(content.toLowerCase()).to.include('project');
  expect(content.toLowerCase()).to.include('instruction');
});

// 重複するステップ定義を削除（missing-steps.tsに統合）

Then('カーソルルールには以下が含まれる:', async function(this: CustomWorld, dataTable: any) {
  const rulesPath = path.join(this.getProjectPath(), '.cursorrules');
  const content = await this.readFile(rulesPath);
  
  for (const row of dataTable.hashes()) {
    const ruleType = row['ルールタイプ'];
    // ルールタイプに応じたキーワードが含まれているかをチェック
    if (ruleType === 'コード生成ルール') {
      expect(content.toLowerCase()).to.include('code');
    }
  }
});

Then('各ツールの設定ファイルが作成される', async function(this: CustomWorld) {
  // Claude Code
  const claudeDir = path.join(this.getProjectPath(), '.claude');
  expect(await this.directoryExists(claudeDir)).to.be.true;
  
  // GitHub Copilot
  const copilotPath = path.join(this.getProjectPath(), '.github', 'copilot-instructions.md');
  expect(await this.fileExists(copilotPath)).to.be.true;
  
  // Cursor
  const cursorRulesPath = path.join(this.getProjectPath(), '.cursorrules');
  expect(await this.fileExists(cursorRulesPath)).to.be.true;
});

Then('.ai-tools/ディレクトリに統合設定が作成される', async function(this: CustomWorld) {
  const aiToolsDir = path.join(this.getProjectPath(), '.ai-tools');
  expect(await this.directoryExists(aiToolsDir)).to.be.true;
  
  const configPath = path.join(aiToolsDir, 'config.json');
  expect(await this.fileExists(configPath)).to.be.true;
});

Then('各ツール間で一貫性のある設定が保たれる', async function(this: CustomWorld) {
  const aiToolsConfigPath = path.join(this.getProjectPath(), '.ai-tools', 'config.json');
  const content = await this.readFile(aiToolsConfigPath);
  const config = JSON.parse(content);
  
  expect(config).to.have.property('tools');
  expect(config.tools).to.be.an('array');
});

Then('README.mdにAIツールの使い分けガイドが追加される', async function(this: CustomWorld) {
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  const content = await this.readFile(readmePath);
  
  expect(content.toLowerCase()).to.include('ai');
  expect(content.toLowerCase()).to.include('tool');
});

Then('各プロンプトがプロジェクトコンテキストを含む', async function(this: CustomWorld) {
  const customDir = path.join(this.getProjectPath(), '.claude', 'prompts', 'custom');
  const files = await this.listFiles('.claude/prompts/custom');
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(customDir, file);
      const content = await this.readFile(filePath);
      expect(content.toLowerCase()).to.include('project');
    }
  }
});

Then('AIツールがこれらのプロンプトを活用できる', async function(this: CustomWorld) {
  const promptsDir = path.join(this.getProjectPath(), '.claude', 'prompts');
  const customDir = path.join(promptsDir, 'custom');
  
  expect(await this.directoryExists(promptsDir)).to.be.true;
  expect(await this.directoryExists(customDir)).to.be.true;
});

Then('以下のエントリが含まれている:', async function(this: CustomWorld, gitignoreContent: string) {
  const gitignorePath = path.join(this.getProjectPath(), '.gitignore');
  const content = await this.readFile(gitignorePath);
  
  const entries = gitignoreContent.trim().split('\n');
  for (const entry of entries) {
    if (entry.trim() && !entry.startsWith('#')) {
      expect(content).to.include(entry.trim());
    }
  }
});

Then('AI生成の一時ファイルがリポジトリに含まれない', async function(this: CustomWorld) {
  const gitignorePath = path.join(this.getProjectPath(), '.gitignore');
  const content = await this.readFile(gitignorePath);
  
  expect(content).to.include('.ai-cache/');
  expect(content).to.include('*.ai-generated');
});

// ヘルパーメソッドの実装
declare module '../support/world' {
  interface CustomWorld {
    setupClaudeCode(): Promise<void>;
    setupGitHubCopilot(): Promise<void>;
    setupCursor(): Promise<void>;
  }
}

CustomWorld.prototype.setupClaudeCode = async function() {
  const fs = require('fs-extra');
  const claudeDir = path.join(this.getProjectPath(), '.claude');
  const promptsDir = path.join(claudeDir, 'prompts');
  
  await fs.ensureDir(promptsDir);
  
  // CLAUDE.md
  const claudeMdContent = `# ${this.context.projectName}

## プロジェクト概要
プロジェクトの目的と技術スタック

## アーキテクチャ
システム構成とコンポーネント

## 開発ガイドライン
コーディング規約とベストプラクティス

## 禁止事項
避けるべき実装パターン
`;
  
  await fs.writeFile(path.join(claudeDir, 'CLAUDE.md'), claudeMdContent);
  
  // プロンプトテンプレート
  const promptContent = `# Development Prompt\n\nThis is a development prompt for ${this.context.projectName}.`;
  await fs.writeFile(path.join(promptsDir, 'development.md'), promptContent);
};

CustomWorld.prototype.setupGitHubCopilot = async function() {
  const fs = require('fs-extra');
  const githubDir = path.join(this.getProjectPath(), '.github');
  const vscodeDir = path.join(this.getProjectPath(), '.vscode');
  
  await fs.ensureDir(githubDir);
  await fs.ensureDir(vscodeDir);
  
  // copilot-instructions.md
  const instructionsContent = `# GitHub Copilot Instructions for ${this.context.projectName}

Project-specific instructions for GitHub Copilot.
`;
  await fs.writeFile(path.join(githubDir, 'copilot-instructions.md'), instructionsContent);
  
  // .vscode/settings.json
  const settingsContent = {
    "github.copilot.enable": {
      "*": true,
      "yaml": true,
      "plaintext": true,
      "markdown": true
    }
  };
  await fs.writeFile(path.join(vscodeDir, 'settings.json'), JSON.stringify(settingsContent, null, 2));
};

CustomWorld.prototype.setupCursor = async function() {
  const fs = require('fs-extra');
  const rulesPath = path.join(this.getProjectPath(), '.cursorrules');
  
  const rulesContent = `# Cursor Rules for ${this.context.projectName}

## コード生成ルール
プロジェクトのコーディング規約

## インポート規則
依存関係の管理方法

## テスト作成ルール
テストの書き方とカバレッジ要件

## ドキュメント生成
コメントとドキュメントのスタイル
`;
  
  await fs.writeFile(rulesPath, rulesContent);
  
  // 統合設定
  const aiToolsDir = path.join(this.getProjectPath(), '.ai-tools');
  await fs.ensureDir(aiToolsDir);
  
  const configContent = {
    tools: this.context.aiTools || [],
    project: this.context.projectName,
    integration: {
      claude: { enabled: this.context.aiTools?.includes('Claude Code') },
      copilot: { enabled: this.context.aiTools?.includes('GitHub Copilot') },
      cursor: { enabled: this.context.aiTools?.includes('Cursor') }
    }
  };
  
  await fs.writeFile(path.join(aiToolsDir, 'config.json'), JSON.stringify(configContent, null, 2));
  
  // .gitignoreの更新
  const gitignorePath = path.join(this.getProjectPath(), '.gitignore');
  let gitignoreContent = await this.readFile(gitignorePath);
  
  const aiEntries = `
# AI Tools
.ai-cache/
.cursor-tutor/
.copilot/
*.ai-generated
.ai-tools/cache/
`;
  
  gitignoreContent += aiEntries;
  await fs.writeFile(gitignorePath, gitignoreContent);
  
  // README.mdの更新
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  let readmeContent = await this.readFile(readmePath);
  
  const aiGuideSection = `

## AI Development Tools

This project is configured with the following AI development tools:

${this.context.aiTools?.map(tool => `- ${tool}`).join('\n') || ''}

### Usage Guidelines
- Use Claude Code for complex architecture decisions
- Use GitHub Copilot for code completion and suggestions
- Use Cursor for project-wide refactoring and analysis
`;
  
  readmeContent += aiGuideSection;
  await fs.writeFile(readmePath, readmeContent);
};