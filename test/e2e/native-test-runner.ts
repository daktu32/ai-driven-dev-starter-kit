#!/usr/bin/env tsx

import { ProjectVerifier, VerificationResult } from '../../scripts/lib/projectVerifier.js';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

interface TestResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
}

class E2ETestRunner {
  private results: TestResult[] = [];
  private testDir = path.join(process.cwd(), 'test', 'e2e-output');

  async run(): Promise<void> {
    console.log(chalk.blue.bold('🧪 E2E Test Suite - AI Driven Dev Starter Kit'));
    console.log(chalk.gray('='.repeat(60)));

    try {
      await this.setup();
      await this.runTests();
      this.printSummary();
    } finally {
      await this.cleanup();
    }

    // 失敗があれば非ゼロで終了
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      process.exit(1);
    }
  }

  private async setup(): Promise<void> {
    console.log(chalk.cyan('🚀 セットアップ開始'));
    
    // ビルド確認
    try {
      execSync('npm run build', { stdio: 'pipe' });
      console.log(chalk.green('✓ TypeScript ビルド成功'));
    } catch (error) {
      throw new Error('TypeScript ビルドに失敗しました');
    }

    // テストディレクトリ準備
    await fs.remove(this.testDir);
    await fs.ensureDir(this.testDir);
    console.log(chalk.green('✓ テストディレクトリ準備完了'));
  }

  private async runTests(): Promise<void> {
    console.log(chalk.cyan('\n📋 テスト実行開始'));

    // Test 1: ProjectVerifier基本動作
    await this.runTest('ProjectVerifier基本動作', this.testProjectVerifierBasics.bind(this));

    // Test 2: MCP Server生成テスト
    await this.runTest('MCP Server プロジェクト生成', () => this.testProjectGeneration('mcp-server'));

    // Test 3: CLI Rust生成テスト  
    await this.runTest('CLI Rust プロジェクト生成', () => this.testProjectGeneration('cli-rust'));

    // Test 4: テンプレート変数確認
    await this.runTest('テンプレート変数検証', this.testTemplateVariables.bind(this));
  }

  private async runTest(name: string, testFunction: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(chalk.yellow(`\n🔍 ${name}`));

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      this.results.push({ name, success: true, duration });
      console.log(chalk.green(`✅ ${name} - 成功 (${duration}ms)`));
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.results.push({ name, success: false, error: errorMessage, duration });
      console.log(chalk.red(`❌ ${name} - 失敗: ${errorMessage}`));
    }
  }

  private async testProjectVerifierBasics(): Promise<void> {
    const testDir = path.join(this.testDir, 'verifier-test');
    await fs.ensureDir(testDir);

    // ProjectVerifierインスタンス作成
    const verifier = new ProjectVerifier('mcp-server', testDir);
    
    // 空ディレクトリでの検証
    const result = await verifier.verify();
    
    if (!result) throw new Error('検証結果が取得できません');
    if (result.valid) throw new Error('空ディレクトリで有効判定されました');
    if (result.errors.length === 0) throw new Error('エラーが検出されませんでした');
    
    console.log(chalk.gray(`    チェックファイル数: ${result.checkedFiles}`));
    console.log(chalk.gray(`    エラー数: ${result.errors.length}`));
  }

  private async testProjectGeneration(projectType: string): Promise<void> {
    const projectName = `e2e-test-${projectType}`;
    const projectPath = path.join(this.testDir, projectName);

    // スケルトン生成
    await this.generateProject(projectName, projectType, projectPath);

    // 生成結果検証
    const verifier = new ProjectVerifier(projectType, projectPath);
    const result = await verifier.verify();

    // 基本ファイルの存在確認
    const requiredFiles = ['README.md', 'CLAUDE.md', 'docs/PRD.md'];
    for (const file of requiredFiles) {
      const filePath = path.join(projectPath, file);
      if (!(await fs.pathExists(filePath))) {
        throw new Error(`必須ファイルが見つかりません: ${file}`);
      }
    }

    console.log(chalk.gray(`    検証結果: ${result.valid ? '有効' : '無効'}`));
    console.log(chalk.gray(`    エラー数: ${result.errors.length}`));
    console.log(chalk.gray(`    警告数: ${result.warnings.length}`));

    // クリティカルエラーがある場合は失敗
    const criticalErrors = result.errors.filter(error => 
      !error.includes('未置換のテンプレート変数') || 
      (!error.includes('[YOUR_') && !error.includes('<!-- 例:'))
    );
    
    if (criticalErrors.length > 0) {
      console.log(chalk.red('    クリティカルエラー:'));
      criticalErrors.forEach(error => console.log(chalk.red(`      - ${error}`)));
      throw new Error(`${criticalErrors.length}個のクリティカルエラーが発生しました`);
    }
  }

  private async testTemplateVariables(): Promise<void> {
    const projectName = 'template-var-test';
    const projectPath = path.join(this.testDir, projectName);

    await this.generateProject(projectName, 'mcp-server', projectPath);

    const verifier = new ProjectVerifier('mcp-server', projectPath);
    const result = await verifier.verify();

    // 技術変数が適切に置換されているかチェック
    const technicalVariableErrors = result.errors.filter(error => 
      error.includes('未置換のテンプレート変数') &&
      !error.includes('[YOUR_') &&
      !error.includes('<!-- 例:')
    );

    if (technicalVariableErrors.length > 0) {
      console.log(chalk.red('    未置換の技術変数:'));
      technicalVariableErrors.forEach(error => console.log(chalk.red(`      - ${error}`)));
      throw new Error(`${technicalVariableErrors.length}個の技術変数が未置換です`);
    }

    console.log(chalk.gray(`    見つかったテンプレート変数: ${result.templateVariablesFound.length}個`));
  }

  private async generateProject(name: string, type: string, targetPath: string): Promise<void> {
    const starterKitRoot = process.cwd();
    const scaffoldScript = path.join(starterKitRoot, 'dist', 'scripts', 'scaffold-generator.js');

    const command = `node "${scaffoldScript}" --name="${name}" --type="${type}" --output="${targetPath}" --skip-interactive --force`;
    
    try {
      execSync(command, {
        cwd: starterKitRoot,
        stdio: 'pipe',
        timeout: 30000
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`スケルトン生成失敗: ${error.message}`);
      }
      throw error;
    }
  }

  private printSummary(): void {
    console.log(chalk.cyan('\n📊 テスト結果サマリー'));
    console.log(chalk.gray('='.repeat(40)));

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log(chalk.green(`✅ 成功: ${successful}`));
    console.log(chalk.red(`❌ 失敗: ${failed}`));
    console.log(chalk.gray(`⏱️  総実行時間: ${totalDuration}ms`));

    if (failed > 0) {
      console.log(chalk.red('\n失敗したテスト:'));
      this.results.filter(r => !r.success).forEach(result => {
        console.log(chalk.red(`  - ${result.name}: ${result.error}`));
      });
    }

    console.log(chalk.cyan('\n🎯 結果'));
    if (failed === 0) {
      console.log(chalk.green.bold('🎉 全てのテストが成功しました！'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed}個のテストが失敗しました`));
    }
  }

  private async cleanup(): Promise<void> {
    if (process.env.KEEP_TEST_OUTPUT !== 'true') {
      await fs.remove(this.testDir);
      console.log(chalk.gray('\n🧹 テストディレクトリをクリーンアップしました'));
    } else {
      console.log(chalk.yellow(`\n📁 テスト結果を保持: ${this.testDir}`));
    }
  }
}

// 実行
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new E2ETestRunner();
  runner.run().catch(error => {
    console.error(chalk.red('E2Eテストランナーでエラーが発生しました:'), error);
    process.exit(1);
  });
}