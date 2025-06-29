import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { ProjectVerifier, VerificationResult } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

// テスト対象のプロジェクトタイプ
const PROJECT_TYPES = ['mcp-server', 'cli-rust', 'web-nextjs', 'api-fastapi'] as const;
type ProjectType = typeof PROJECT_TYPES[number];

interface TestProjectConfig {
  projectName: string;
  projectType: ProjectType;
  repositoryUrl: string;
  description: string;
}

describe('🧪 Scaffold Generation E2E Tests', () => {
  const testDir = path.join(process.cwd(), 'test', 'e2e-output');
  const starterKitRoot = process.cwd();

  beforeAll(async () => {
    console.log(chalk.blue('🚀 E2Eテスト開始'));
    console.log(chalk.gray(`テストディレクトリ: ${testDir}`));
    
    // TypeScriptコンパイル確認
    try {
      execSync('npm run build', { cwd: starterKitRoot, stdio: 'pipe' });
      console.log(chalk.green('✓ TypeScriptコンパイル成功'));
    } catch (error) {
      console.error(chalk.red('✗ TypeScriptコンパイル失敗'));
      throw error;
    }
  });

  beforeEach(async () => {
    // テストディレクトリのクリーンアップと作成
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // テスト後のクリーンアップ（デバッグ用に残すかどうかはオプション）
    if (process.env.KEEP_TEST_OUTPUT !== 'true') {
      await fs.remove(testDir);
    }
  });

  describe('📋 プロジェクトタイプ別生成テスト', () => {
    const testConfigs: TestProjectConfig[] = PROJECT_TYPES.map(type => ({
      projectName: `e2e-test-${type}`,
      projectType: type,
      repositoryUrl: `https://github.com/test/e2e-test-${type}`,
      description: `E2Eテスト用の${type}プロジェクト`
    }));

    it.each(testConfigs)('should generate complete $projectType project', 
      async (config: TestProjectConfig) => {
        const projectPath = path.join(testDir, config.projectName);
        
        console.log(chalk.cyan(`\n🔨 ${config.projectType} プロジェクト生成開始`));

        // スケルトン生成実行
        await generateProject(config, projectPath);

        // 生成結果の検証
        const verifier = new ProjectVerifier(config.projectType, projectPath);
        const result = await verifier.verify();

        // 結果の詳細出力
        logVerificationResult(config.projectType, result);

        // アサーション
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.checkedFiles).toBeGreaterThan(0);
        
        // プロジェクトが実際に生成されていることを確認
        expect(await fs.pathExists(projectPath)).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'README.md'))).toBe(true);
        expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(true);

        console.log(chalk.green(`✅ ${config.projectType} プロジェクト生成・検証完了`));
      },
      30000 // 30秒タイムアウト
    );
  });

  describe('📄 ファイル内容検証テスト', () => {
    it('should have valid package.json for Node.js projects', async () => {
      const nodeProjects: ProjectType[] = ['mcp-server', 'web-nextjs'];
      
      for (const projectType of nodeProjects) {
        const config: TestProjectConfig = {
          projectName: `package-test-${projectType}`,
          projectType,
          repositoryUrl: `https://github.com/test/package-test-${projectType}`,
          description: `package.json検証用${projectType}プロジェクト`
        };

        const projectPath = path.join(testDir, config.projectName);
        
        await generateProject(config, projectPath);

        const packageJsonPath = path.join(projectPath, 'package.json');
        expect(await fs.pathExists(packageJsonPath)).toBe(true);

        const packageJson = await fs.readJson(packageJsonPath);
        
        // 基本フィールドの確認
        expect(packageJson.name).toBe(config.projectName);
        expect(packageJson.version).toBeDefined();
        expect(packageJson.scripts).toBeDefined();
        expect(packageJson.scripts.build).toBeDefined();

        // スターターキット情報が除去されていることを確認
        expect(packageJson.name).not.toBe('ai-driven-dev-starter-kit');
        expect(packageJson.description).not.toContain('ai-driven-dev-starter-kit');

        console.log(chalk.green(`✓ ${projectType}: package.json 検証完了`));
      }
    });

    it('should have valid Cargo.toml for Rust projects', async () => {
      const config: TestProjectConfig = {
        projectName: 'cargo-test-cli-rust',
        projectType: 'cli-rust',
        repositoryUrl: 'https://github.com/test/cargo-test-cli-rust',
        description: 'Cargo.toml検証用CLIプロジェクト'
      };

      const projectPath = path.join(testDir, config.projectName);
      
      await generateProject(config, projectPath);

      const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
      expect(await fs.pathExists(cargoTomlPath)).toBe(true);

      const cargoContent = await fs.readFile(cargoTomlPath, 'utf-8');
      
      // 基本セクションの確認
      expect(cargoContent).toContain('[package]');
      expect(cargoContent).toContain('name =');
      expect(cargoContent).toContain('version =');
      expect(cargoContent).toContain(config.projectName);

      console.log(chalk.green('✓ cli-rust: Cargo.toml 検証完了'));
    });
  });

  describe('🔍 テンプレート変数検証テスト', () => {
    it('should not contain unresolved template variables', async () => {
      const config: TestProjectConfig = {
        projectName: 'template-var-test-mcp-server',
        projectType: 'mcp-server',
        repositoryUrl: 'https://github.com/test/template-var-test',
        description: 'テンプレート変数検証用プロジェクト'
      };

      const projectPath = path.join(testDir, config.projectName);
      
      await generateProject(config, projectPath);

      const verifier = new ProjectVerifier(config.projectType, projectPath);
      const result = await verifier.verify();

      // Layer 3のユーザー記入用プレースホルダーは許容するが、
      // 未置換の技術変数は存在しないことを確認
      const technicalVariableErrors = result.errors.filter(error => 
        error.includes('未置換のテンプレート変数') && 
        !error.includes('[YOUR_') &&
        !error.includes('<!-- 例:')
      );

      expect(technicalVariableErrors).toHaveLength(0);

      // 結果の詳細出力
      if (result.templateVariablesFound.length > 0) {
        console.log(chalk.yellow('⚠️ 見つかったテンプレート変数:'));
        result.templateVariablesFound.forEach(variable => 
          console.log(chalk.gray(`  - ${variable}`))
        );
      }

      console.log(chalk.green('✓ テンプレート変数検証完了'));
    });
  });

  describe('⚠️ エラーケーステスト', () => {
    it('should handle invalid project type gracefully', async () => {
      const invalidConfig = {
        projectName: 'invalid-project',
        projectType: 'invalid-type' as ProjectType,
        repositoryUrl: 'https://github.com/test/invalid-project',
        description: '無効なプロジェクトタイプのテスト'
      };

      const projectPath = path.join(testDir, invalidConfig.projectName);

      await expect(generateProject(invalidConfig, projectPath)).rejects.toThrow();

      // エラー時にディレクトリが作成されていないことを確認
      // （Issue #19で決定：失敗時の状態は保持すべき）
      console.log(chalk.yellow('ℹ️ エラーケース: 無効なプロジェクトタイプ処理確認済み'));
    });
  });
});

// ヘルパー関数
async function generateProject(config: TestProjectConfig, targetPath: string): Promise<void> {
  // スケルトン生成器を直接呼び出す代わりに、
  // 実際のscaffold-generator.jsを使用
  const starterKitRoot = process.cwd();
  const scaffoldScript = path.join(starterKitRoot, 'scripts', 'scaffold-generator.js');

  try {
    const command = `node "${scaffoldScript}" --name="${config.projectName}" --type="${config.projectType}" --output="${targetPath}" --skip-interactive --force`;
    
    execSync(command, {
      cwd: starterKitRoot,
      stdio: 'pipe',
      timeout: 30000 // 30秒タイムアウト
    });

  } catch (error) {
    console.error(chalk.red(`スケルトン生成エラー: ${config.projectType}`));
    if (error instanceof Error) {
      throw new Error(`Failed to generate ${config.projectType} project: ${error.message}`);
    }
    throw error;
  }
}

function logVerificationResult(projectType: string, result: VerificationResult): void {
  console.log(chalk.cyan(`\n📊 ${projectType} 検証結果:`));
  console.log(chalk.gray(`  チェックファイル数: ${result.checkedFiles}`));
  console.log(chalk.gray(`  エラー数: ${result.errors.length}`));
  console.log(chalk.gray(`  警告数: ${result.warnings.length}`));
  
  if (result.errors.length > 0) {
    console.log(chalk.red('  エラー:'));
    result.errors.forEach(error => console.log(chalk.red(`    - ${error}`)));
  }
  
  if (result.warnings.length > 0) {
    console.log(chalk.yellow('  警告:'));
    result.warnings.forEach(warning => console.log(chalk.yellow(`    - ${warning}`)));
  }

  if (result.missingFiles.length > 0) {
    console.log(chalk.red('  不足ファイル:'));
    result.missingFiles.forEach(file => console.log(chalk.red(`    - ${file}`)));
  }
}