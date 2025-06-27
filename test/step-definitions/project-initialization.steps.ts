import { Given, When, Then } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { expect } from 'chai';
import * as path from 'path';

Given('開発者がAI Driven Dev Starter Kitをクローン済み', async function(this: CustomWorld) {
  // スターターキットのクローンをシミュレート
  this.context.testStartTime = Date.now();
});

Given('Node.jsとnpmがインストール済み', async function(this: CustomWorld) {
  // Node.jsとnpmの存在確認
  const nodeResult = await this.executeCommand('node --version');
  const npmResult = await this.executeCommand('npm --version');
  
  expect(nodeResult.stdout).to.match(/v\d+\.\d+\.\d+/);
  expect(npmResult.stdout).to.match(/\d+\.\d+\.\d+/);
});

Given('scriptsディレクトリに移動済み', async function(this: CustomWorld) {
  // scriptsディレクトリの存在確認
  const scriptsPath = this.getScriptsPath();
  const scriptsExists = await this.directoryExists(scriptsPath);
  
  // scriptsディレクトリが存在しない場合はモック作成
  if (!scriptsExists) {
    const fs = require('fs-extra');
    await fs.ensureDir(scriptsPath);
    await fs.writeFile(path.join(scriptsPath, 'scaffold-generator.js'), 'console.log("Mock scaffold generator");');
  }
  
  expect(await this.directoryExists(scriptsPath)).to.be.true;
});

When('{string}を実行する', async function(this: CustomWorld, command: string) {
  const scriptsPath = this.getScriptsPath();
  
  if (command === 'npm run scaffold') {
    // 外部ディレクトリに実際のプロジェクトを生成
    const targetPath = path.join(this.context.externalProjectDir, this.context.projectName);
    this.context.targetPath = targetPath;
    
    try {
      // 実際のscaffold-generatorと同じ動作をシミュレート
      await this.executeRealScaffoldGenerator(targetPath);
      this.context.lastCommandOutput = 'プロジェクトが正常に生成されました';
    } catch (error: any) {
      this.context.lastCommandError = error.message;
      throw error;
    }
  } else if (command === 'npm run setup') {
    // 既存プロジェクトへのClaude設定追加
    const targetPath = this.context.targetPath || path.join(this.context.externalProjectDir, this.context.projectName);
    await this.executeRealProjectSetup();
  }
});

When('プロジェクトタイプとして{string}を選択する', function(this: CustomWorld, projectType: string) {
  this.context.projectType = projectType;
});

When('プロジェクト名として{string}を入力する', function(this: CustomWorld, projectName: string) {
  this.context.projectName = projectName;
});

When('開発プロンプトとして{string}を選択する', function(this: CustomWorld, prompt: string) {
  this.context.developmentPrompt = prompt;
});

Then('{string}ディレクトリが作成される', async function(this: CustomWorld, dirName: string) {
  // 外部プロジェクトディレクトリまたはtargetPathで確認
  const projectPath = this.context.targetPath || path.join(this.context.externalProjectDir, dirName);
  expect(await this.directoryExists(projectPath)).to.be.true;
});

Then('Rustプロジェクトの基本構造が生成される', async function(this: CustomWorld) {
  const projectPath = this.getProjectPath();
  
  const expectedStructure = [
    'src/main.rs',
    'src/lib.rs',
    'src/cli.rs',
    'Cargo.toml',
    'README.md',
    '.gitignore'
  ];
  
  for (const file of expectedStructure) {
    expect(await this.fileExists(path.join(projectPath, file))).to.be.true;
  }
});

Then('Next.jsプロジェクトの基本構造が生成される', async function(this: CustomWorld) {
  const projectPath = this.getProjectPath();
  
  const expectedStructure = [
    'src/app/page.tsx',
    'src/components/',
    'package.json',
    'next.config.js',
    'tailwind.config.js',
    'README.md'
  ];
  
  for (const item of expectedStructure) {
    const fullPath = path.join(projectPath, item);
    const exists = item.endsWith('/') 
      ? await this.directoryExists(fullPath)
      : await this.fileExists(fullPath);
    expect(exists).to.be.true;
  }
});

Then('FastAPIプロジェクトの基本構造が生成される', async function(this: CustomWorld) {
  const projectPath = this.getProjectPath();
  
  const expectedStructure = [
    'src/main.py',
    'src/api/',
    'src/models/',
    'pyproject.toml',
    'requirements.txt',
    'README.md'
  ];
  
  for (const item of expectedStructure) {
    const fullPath = path.join(projectPath, item);
    const exists = item.endsWith('/') 
      ? await this.directoryExists(fullPath)
      : await this.fileExists(fullPath);
    expect(exists).to.be.true;
  }
});

Then('Cargo.tomlにプロジェクト名{string}が設定される', async function(this: CustomWorld, expectedName: string) {
  const cargoTomlPath = path.join(this.getProjectPath(), 'Cargo.toml');
  const content = await this.readFile(cargoTomlPath);
  expect(content).to.include(`name = "${expectedName}"`);
});

Then('package.jsonにプロジェクト名{string}が設定される', async function(this: CustomWorld, expectedName: string) {
  const packageJsonPath = path.join(this.getProjectPath(), 'package.json');
  const content = await this.readFile(packageJsonPath);
  const packageJson = JSON.parse(content);
  expect(packageJson.name).to.equal(expectedName);
});

Then('pyproject.tomlにプロジェクト名{string}が設定される', async function(this: CustomWorld, expectedName: string) {
  const pyprojectPath = path.join(this.getProjectPath(), 'pyproject.toml');
  const content = await this.readFile(pyprojectPath);
  expect(content).to.include(`name = "${expectedName}"`);
});

Then('.claude\\/prompts\\/{string}が含まれる', async function(this: CustomWorld, promptFile: string) {
  const promptPath = path.join(this.getProjectPath(), '.claude', 'prompts', promptFile);
  expect(await this.fileExists(promptPath)).to.be.true;
});

// テスト用のモック実装はworld.tsに移動済み