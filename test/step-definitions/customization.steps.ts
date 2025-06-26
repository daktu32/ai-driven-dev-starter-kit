import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect } from 'chai';
import * as path from 'path';

Given('プロジェクトが生成済み', async function(this: CustomWorld) {
  // テスト用プロジェクトを作成
  this.context.projectName = 'test-project';
  this.context.projectType = 'Web (Next.js)';
  
  const projectPath = path.join(this.context.tempDir, this.context.projectName);
  await this.createMockProjectStructure(this.context.projectType, projectPath);
});

Given('プロジェクトディレクトリに移動済み', function(this: CustomWorld) {
  this.context.lastCommand = `cd ${this.getProjectPath()}`;
});

When('README.mdを開く', async function(this: CustomWorld) {
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  expect(await this.fileExists(readmePath)).to.be.true;
});

When('プロジェクト名を{string}に変更する', async function(this: CustomWorld, newName: string) {
  const fs = require('fs-extra');
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  
  const content = await this.readFile(readmePath);
  const updatedContent = content.replace(/# .+/, `# ${newName}`);
  
  await fs.writeFile(readmePath, updatedContent);
  this.context.projectName = newName;
});

When('プロジェクトの説明を追加する:', async function(this: CustomWorld, description: string) {
  const fs = require('fs-extra');
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  
  const content = await this.readFile(readmePath);
  const updatedContent = content + '\n\n' + description.trim();
  
  await fs.writeFile(readmePath, updatedContent);
});

When('package.jsonのnameフィールドを{string}に更新する', async function(this: CustomWorld, newName: string) {
  const fs = require('fs-extra');
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  packageJson.name = newName;
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
});

When('.env.exampleファイルが存在する', async function(this: CustomWorld) {
  const fs = require('fs-extra');
  const envExamplePath = path.join(this.getProjectPath(), '.env.example');
  
  const envContent = `DATABASE_URL=postgresql://localhost/example_db
API_KEY=your-api-key-here
NODE_ENV=development`;
  
  await fs.writeFile(envExamplePath, envContent);
  expect(await this.fileExists(envExamplePath)).to.be.true;
});

When('.envファイルを作成する', async function(this: CustomWorld) {
  const fs = require('fs-extra');
  const envPath = path.join(this.getProjectPath(), '.env');
  
  await fs.writeFile(envPath, '# Environment variables\n');
  expect(await this.fileExists(envPath)).to.be.true;
});

When('以下の環境変数を設定する:', async function(this: CustomWorld, dataTable: any) {
  const fs = require('fs-extra');
  const envPath = path.join(this.getProjectPath(), '.env');
  
  let envContent = '';
  for (const row of dataTable.hashes()) {
    envContent += `${row['変数名']}=${row['値']}\n`;
  }
  
  await fs.writeFile(envPath, envContent);
});

When('プロジェクトがNext.jsベースである', function(this: CustomWorld) {
  expect(this.context.projectType).to.equal('Web (Next.js)');
});

When('追加のライブラリが必要である', function(this: CustomWorld) {
  // 追加ライブラリの必要性を設定
  this.context.lastCommand = 'require-additional-libraries';
});

When('以下のコマンドを実行する:', async function(this: CustomWorld, command: string) {
  // npm installコマンドをモック
  if (command.includes('npm install')) {
    await this.mockNpmInstall(command);
  }
});

When('package.jsonを編集する', async function(this: CustomWorld) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  expect(await this.fileExists(packageJsonPath)).to.be.true;
});

When('scriptsセクションに以下を追加する:', async function(this: CustomWorld, dataTable: any) {
  const fs = require('fs-extra');
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  for (const row of dataTable.hashes()) {
    packageJson.scripts[row['スクリプト名']] = row['コマンド'];
  }
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
});

When('追加のディレクトリが必要である', function(this: CustomWorld) {
  this.context.lastCommand = 'require-additional-directories';
});

When('以下のディレクトリを作成する:', async function(this: CustomWorld, dataTable: any) {
  const fs = require('fs-extra');
  
  for (const row of dataTable.hashes()) {
    const dirPath = path.join(this.getProjectPath(), row['ディレクトリ']);
    await fs.ensureDir(dirPath);
    
    // README.mdを各ディレクトリに作成
    const readmePath = path.join(dirPath, 'README.md');
    await fs.writeFile(readmePath, `# ${row['ディレクトリ']}\n\n${row['用途']}`);
  }
});

When('各ディレクトリにREADME.mdを追加する', async function(this: CustomWorld) {
  // 上記のステップで既に実装済み
  this.context.lastCommand = 'add-readme-to-directories';
});

When('.github/workflows/ci.ymlが存在する', async function(this: CustomWorld) {
  const fs = require('fs-extra');
  const workflowPath = path.join(this.getProjectPath(), '.github', 'workflows', 'ci.yml');
  
  await fs.ensureDir(path.dirname(workflowPath));
  const ciContent = `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test`;
  
  await fs.writeFile(workflowPath, ciContent);
});

When('テストカバレッジの閾値を設定する:', async function(this: CustomWorld, yamlContent: string) {
  const fs = require('fs-extra');
  const workflowPath = path.join(this.getProjectPath(), '.github', 'workflows', 'ci.yml');
  
  const content = await this.readFile(workflowPath);
  const updatedContent = content + '\n' + yamlContent.trim();
  
  await fs.writeFile(workflowPath, updatedContent);
});

When('デプロイ環境を追加する:', async function(this: CustomWorld, dataTable: any) {
  const fs = require('fs-extra');
  const deployPath = path.join(this.getProjectPath(), 'deploy-config.yml');
  
  let deployContent = 'environments:\n';
  for (const row of dataTable.hashes()) {
    deployContent += `  ${row['環境']}:\n    branch: ${row['ブランチ']}\n    url: ${row['URL']}\n`;
  }
  
  await fs.writeFile(deployPath, deployContent);
});

Then('プロジェクト情報が正しく更新される', async function(this: CustomWorld) {
  const readmePath = path.join(this.getProjectPath(), 'README.md');
  const content = await this.readFile(readmePath);
  
  expect(content).to.include('AI-Powered Task Manager');
  expect(content).to.include('AIを活用したタスク管理ツール');
});

Then('全ての設定ファイルで一貫性が保たれる', async function(this: CustomWorld) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  expect(packageJson.name).to.equal('ai-task-manager');
});

Then('アプリケーションが環境変数を正しく読み込める', async function(this: CustomWorld) {
  const envPath = path.join(this.getProjectPath(), '.env');
  const content = await this.readFile(envPath);
  
  expect(content).to.include('DATABASE_URL=postgresql://localhost/db');
  expect(content).to.include('API_KEY=your-api-key-here');
  expect(content).to.include('NODE_ENV=development');
});

Then('.envファイルは.gitignoreに含まれている', async function(this: CustomWorld) {
  const gitignorePath = path.join(this.getProjectPath(), '.gitignore');
  const content = await this.readFile(gitignorePath);
  
  expect(content).to.include('.env');
});

Then('package.jsonに依存関係が追加される', async function(this: CustomWorld) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  expect(packageJson.dependencies).to.have.property('@tanstack/react-query');
  expect(packageJson.dependencies).to.have.property('axios');
  expect(packageJson.dependencies).to.have.property('zod');
});

Then('node_modulesがインストールされる', async function(this: CustomWorld) {
  const nodeModulesPath = path.join(this.getProjectPath(), 'node_modules');
  expect(await this.directoryExists(nodeModulesPath)).to.be.true;
});

Then('TypeScriptの型定義が利用可能になる', async function(this: CustomWorld) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  expect(packageJson.devDependencies).to.have.property('@types/node');
});

Then('{string}でマイグレーションが実行できる', async function(this: CustomWorld, command: string) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  expect(packageJson.scripts).to.have.property('db:migrate');
});

Then('カスタムスクリプトが開発ワークフローに統合される', async function(this: CustomWorld) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  expect(packageJson.scripts).to.have.property('db:seed');
  expect(packageJson.scripts).to.have.property('analyze');
  expect(packageJson.scripts).to.have.property('check-types');
});

Then('プロジェクト構造が組織のニーズに合致する', async function(this: CustomWorld) {
  const expectedDirs = ['src/features/', 'src/shared/', 'src/utils/', 'scripts/'];
  
  for (const dir of expectedDirs) {
    const dirPath = path.join(this.getProjectPath(), dir);
    expect(await this.directoryExists(dirPath)).to.be.true;
  }
});

Then('開発者が適切な場所にコードを配置できる', async function(this: CustomWorld) {
  const featuresReadmePath = path.join(this.getProjectPath(), 'src/features/README.md');
  const content = await this.readFile(featuresReadmePath);
  
  expect(content).to.include('機能別モジュール');
});

Then('CI/CDパイプラインがプロジェクト要件に適合する', async function(this: CustomWorld) {
  const workflowPath = path.join(this.getProjectPath(), '.github', 'workflows', 'ci.yml');
  const content = await this.readFile(workflowPath);
  
  expect(content).to.include('COVERAGE_THRESHOLD: 80');
  
  const deployPath = path.join(this.getProjectPath(), 'deploy-config.yml');
  const deployContent = await this.readFile(deployPath);
  
  expect(deployContent).to.include('staging');
  expect(deployContent).to.include('production');
});

// ヘルパーメソッドの実装
declare module '../support/world' {
  interface CustomWorld {
    mockNpmInstall(command: string): Promise<void>;
  }
}

CustomWorld.prototype.mockNpmInstall = async function(command: string) {
  const fs = require('fs-extra');
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  
  if (!packageJson.dependencies) packageJson.dependencies = {};
  if (!packageJson.devDependencies) packageJson.devDependencies = {};
  
  // コマンドから依存関係を抽出
  const packages = command.split(' ').slice(2); // 'npm install'を除く
  
  for (const pkg of packages) {
    if (pkg.startsWith('-D') || pkg.startsWith('--save-dev')) continue;
    
    if (command.includes('--save-dev') || command.includes('-D')) {
      packageJson.devDependencies[pkg] = '^1.0.0';
    } else {
      packageJson.dependencies[pkg] = '^1.0.0';
    }
  }
  
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // node_modulesディレクトリを作成
  const nodeModulesPath = path.join(this.getProjectPath(), 'node_modules');
  await fs.ensureDir(nodeModulesPath);
  
  this.context.lastCommandOutput = 'Dependencies installed successfully';
};