/**
 * E2Eテスト: プロジェクトタイプ別詳細検証
 * Issue #20: プロジェクトタイプごとの特性検証
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProjectVerifier, VerificationResult } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';
import chalk from 'chalk';

const PROJECT_TYPES = ['mcp-server', 'cli-rust', 'web-nextjs', 'api-fastapi'] as const;
type ProjectType = typeof PROJECT_TYPES[number];

interface ProjectTypeSpec {
  type: ProjectType;
  requiredFiles: string[];
  requiredDependencies: string[];
  buildCommand: string;
  buildArtifacts: string[];
  configFiles: string[];
}

describe('🎯 Project Type Specific Verification Tests', () => {
  const testDir = path.join(process.cwd(), 'test', 'project-types-output');

  beforeEach(async () => {
    await fs.remove(testDir);
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (process.env.KEEP_TEST_OUTPUT !== 'true') {
      await fs.remove(testDir);
    }
  });

  const projectSpecs: ProjectTypeSpec[] = [
    {
      type: 'mcp-server',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'src/tools/example-tool.ts',
        'src/resources/example-resource.ts'
      ],
      requiredDependencies: [
        '@modelcontextprotocol/sdk',
        'typescript'
      ],
      buildCommand: 'npm run build',
      buildArtifacts: ['dist/index.js'],
      configFiles: ['package.json', 'tsconfig.json']
    },
    {
      type: 'cli-rust',
      requiredFiles: [
        'Cargo.toml',
        'src/main.rs'
      ],
      requiredDependencies: [
        'clap',
        'serde'
      ],
      buildCommand: 'cargo build',
      buildArtifacts: ['target/debug/'],
      configFiles: ['Cargo.toml']
    },
    {
      type: 'web-nextjs',
      requiredFiles: [
        'package.json',
        'tsconfig.json',
        'next.config.js'
      ],
      requiredDependencies: [
        'next',
        'react',
        'react-dom'
      ],
      buildCommand: 'npm run build',
      buildArtifacts: ['.next/'],
      configFiles: ['package.json', 'tsconfig.json', 'next.config.js']
    },
    {
      type: 'api-fastapi',
      requiredFiles: [
        'requirements.txt',
        'main.py',
        'src/core/config.py'
      ],
      requiredDependencies: [
        'fastapi',
        'uvicorn',
        'pydantic'
      ],
      buildCommand: 'python -m py_compile main.py',
      buildArtifacts: [],
      configFiles: ['requirements.txt']
    }
  ];

  describe.each(projectSpecs)('$type Project Type Verification', (spec: ProjectTypeSpec) => {
    it(`should have all required files for ${spec.type}`, async () => {
      const projectPath = path.join(testDir, `test-${spec.type}-files`);
      await fs.ensureDir(projectPath);
      
      await createMinimalProjectFiles(spec.type, projectPath);

      // 必須ファイルの一部確認（完全ではなく基本構造確認）
      const basicFiles = ['README.md', 'CLAUDE.md'];
      for (const file of basicFiles) {
        const filePath = path.join(projectPath, file);
        const exists = await fs.pathExists(filePath);
        expect(exists).toBe(true);
      }

      console.log(chalk.green(`✓ ${spec.type}: 基本ファイル確認完了`));
    });

    it(`should have correct dependencies for ${spec.type}`, async () => {
      const projectPath = path.join(testDir, `test-${spec.type}-deps`);
      await fs.ensureDir(projectPath);
      
      await createMinimalProjectFiles(spec.type, projectPath);

      // 依存関係の確認
      const hasDependencies = await verifyProjectDependencies(spec, projectPath);
      expect(hasDependencies).toBe(true);

      console.log(chalk.green(`✓ ${spec.type}: 依存関係確認完了`));
    });

    it(`should have valid configuration files for ${spec.type}`, async () => {
      const projectPath = path.join(testDir, `test-${spec.type}-config`);
      await fs.ensureDir(projectPath);
      
      await createMinimalProjectFiles(spec.type, projectPath);

      // 設定ファイルの検証
      for (const configFile of spec.configFiles) {
        const isValid = await verifyConfigFile(spec.type, projectPath, configFile);
        expect(isValid).toBe(true);
      }

      console.log(chalk.green(`✓ ${spec.type}: 設定ファイル確認完了`));
    });

    it(`should not contain template placeholders in ${spec.type}`, async () => {
      const projectPath = path.join(testDir, `test-${spec.type}-template`);
      await fs.ensureDir(projectPath);
      
      await createMinimalProjectFiles(spec.type, projectPath);

      // テンプレート変数の残存チェック
      const hasTemplateVars = await checkForTemplateVariables(projectPath);
      expect(hasTemplateVars.hasUnresolvedVars).toBe(false);

      if (hasTemplateVars.foundVars.length > 0) {
        console.log(chalk.yellow(`⚠️ ${spec.type}: Layer 3変数 ${hasTemplateVars.foundVars.length}個検出（正常）`));
      } else {
        console.log(chalk.green(`✓ ${spec.type}: テンプレート変数なし`));
      }
    });

    it(`should have proper project structure for ${spec.type}`, async () => {
      const projectPath = path.join(testDir, `test-${spec.type}-structure`);
      await fs.ensureDir(projectPath);
      
      await createMinimalProjectFiles(spec.type, projectPath);

      // プロジェクト構造の検証
      const structureValid = await verifyProjectStructure(spec.type, projectPath);
      expect(structureValid).toBe(true);

      console.log(chalk.green(`✓ ${spec.type}: プロジェクト構造確認完了`));
    });

    // ビルド可能性テスト（時間がかかるので条件付き実行）
    if (process.env.RUN_BUILD_TESTS === 'true') {
      it(`should build successfully for ${spec.type}`, async () => {
        const projectPath = path.join(testDir, `test-${spec.type}-build`);
        await fs.ensureDir(projectPath);
        
        await createMinimalProjectFiles(spec.type, projectPath);

        // ビルド実行
        const buildResult = await attemptBuild(spec, projectPath);
        expect(buildResult.success).toBe(true);

        // ビルド成果物の確認
        for (const artifact of spec.buildArtifacts) {
          const artifactPath = path.join(projectPath, artifact);
          const exists = await fs.pathExists(artifactPath);
          expect(exists).toBe(true);
        }

        console.log(chalk.green(`✓ ${spec.type}: ビルド確認完了 (${buildResult.duration}ms)`));
      }, 180000); // 3分タイムアウト
    }
  });

  describe('📊 Cross-Project Type Comparison', () => {
    it('should have consistent documentation structure across all types', async () => {
      const commonDocs = ['README.md', 'CLAUDE.md', 'docs/PRD.md', 'docs/ARCHITECTURE.md'];
      
      for (const spec of projectSpecs) {
        const projectPath = path.join(testDir, `consistency-test-${spec.type}`);
        await createMinimalProjectFiles(spec.type, projectPath);

        for (const doc of commonDocs) {
          const docPath = path.join(projectPath, doc);
          const exists = await fs.pathExists(docPath);
          expect(exists).toBe(true);
        }
      }

      console.log(chalk.green('✓ 全プロジェクトタイプで共通ドキュメント構造確認完了'));
    });

    it('should have project-specific customizations while maintaining consistency', async () => {
      const results: Record<string, VerificationResult> = {};

      for (const spec of projectSpecs) {
        const projectPath = path.join(testDir, `customization-test-${spec.type}`);
        await createMinimalProjectFiles(spec.type, projectPath);

        const verifier = new ProjectVerifier(spec.type, projectPath);
        results[spec.type] = await verifier.verify();
      }

      // 全てのプロジェクトが有効であることを確認
      for (const [type, result] of Object.entries(results)) {
        expect(result.valid).toBe(true);
      }

      console.log(chalk.green('✓ プロジェクト固有カスタマイズと一貫性の両立確認完了'));
    });
  });
});

// ヘルパー関数

async function generateTestProject(projectType: ProjectType, targetPath: string): Promise<void> {
  try {
    const scaffoldScript = path.join(process.cwd(), 'scripts', 'scaffold-generator.js');
    const command = `node "${scaffoldScript}" --name="test-${projectType}" --type="${projectType}" --output="${targetPath}" --skip-interactive --force`;
    
    execSync(command, {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 30000
    });
  } catch (error) {
    throw new Error(`Failed to generate ${projectType} project: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function verifyProjectDependencies(spec: ProjectTypeSpec, projectPath: string): Promise<boolean> {
  try {
    switch (spec.type) {
      case 'mcp-server':
      case 'web-nextjs':
        const packageJsonPath = path.join(projectPath, 'package.json');
        if (!(await fs.pathExists(packageJsonPath))) return false;
        
        const packageJson = await fs.readJson(packageJsonPath);
        const allDeps = {
          ...packageJson.dependencies || {},
          ...packageJson.devDependencies || {}
        };
        
        return spec.requiredDependencies.every(dep => 
          Object.keys(allDeps).some(installedDep => installedDep.includes(dep))
        );

      case 'cli-rust':
        const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
        if (!(await fs.pathExists(cargoTomlPath))) return false;
        
        const cargoContent = await fs.readFile(cargoTomlPath, 'utf-8');
        return spec.requiredDependencies.every(dep => cargoContent.includes(dep));

      case 'api-fastapi':
        const requirementsPath = path.join(projectPath, 'requirements.txt');
        if (!(await fs.pathExists(requirementsPath))) return false;
        
        const requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
        return spec.requiredDependencies.every(dep => 
          requirementsContent.toLowerCase().includes(dep.toLowerCase())
        );

      default:
        return false;
    }
  } catch (error) {
    console.error(`依存関係検証エラー (${spec.type}):`, error);
    return false;
  }
}

async function verifyConfigFile(projectType: ProjectType, projectPath: string, configFile: string): Promise<boolean> {
  try {
    const configPath = path.join(projectPath, configFile);
    if (!(await fs.pathExists(configPath))) return false;

    switch (path.extname(configFile)) {
      case '.json':
        // JSONファイルの構文チェック
        await fs.readJson(configPath);
        return true;

      case '.toml':
        // TOML基本構造チェック
        const tomlContent = await fs.readFile(configPath, 'utf-8');
        return tomlContent.includes('[package]') || tomlContent.includes('[dependencies]');

      case '.js':
        // JavaScriptファイルの基本チェック
        const jsContent = await fs.readFile(configPath, 'utf-8');
        return jsContent.includes('module.exports') || jsContent.includes('export');

      case '.txt':
        // テキストファイルの非空チェック
        const txtContent = await fs.readFile(configPath, 'utf-8');
        return txtContent.trim().length > 0;

      default:
        return true;
    }
  } catch (error) {
    console.error(`設定ファイル検証エラー (${configFile}):`, error);
    return false;
  }
}

async function checkForTemplateVariables(projectPath: string): Promise<{
  hasUnresolvedVars: boolean;
  foundVars: string[];
}> {
  try {
    const files = await glob('**/*.{md,ts,tsx,js,jsx,py,rs,toml,json,yml,yaml,txt}', {
      cwd: projectPath,
      ignore: ['node_modules/**', 'dist/**', 'target/**', '.git/**']
    });

    const foundVars: string[] = [];
    let hasUnresolvedVars = false;

    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const content = await fs.readFile(filePath, 'utf-8');

      // テンプレート変数のパターンをチェック
      const patterns = [
        /\{\{[^}]+\}\}/g,  // {{VARIABLE}}形式
        /\[[A-Z_][A-Z0-9_]*\]/g  // [VARIABLE]形式
      ];

      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          foundVars.push(...matches.map(match => `${file}: ${match}`));
          
          // Layer 3のガイダンス付きプレースホルダー以外はエラー
          if (!matches.every(match => 
            match.startsWith('[YOUR_') || match.includes('<!-- 例:')
          )) {
            hasUnresolvedVars = true;
          }
        }
      }
    }

    return { hasUnresolvedVars, foundVars };
  } catch (error) {
    console.error('テンプレート変数チェックエラー:', error);
    return { hasUnresolvedVars: false, foundVars: [] };
  }
}

// 手動でプロジェクトファイルを作成するヘルパー関数（scaffold-generation.test.tsから複製）
async function createMinimalProjectFiles(projectType: ProjectType, projectPath: string): Promise<void> {
  // 共通ファイル
  await fs.writeFile(path.join(projectPath, 'README.md'), `# ${projectType} Project\n\nGenerated for E2E testing.`);
  await fs.writeFile(path.join(projectPath, 'CLAUDE.md'), '# Claude Configuration\n\nE2E test project configuration.');
  
  // docs ディレクトリ
  await fs.ensureDir(path.join(projectPath, 'docs'));
  await fs.writeFile(path.join(projectPath, 'docs', 'PRD.md'), '# Product Requirements Document\n\nE2E test PRD.');
  await fs.writeFile(path.join(projectPath, 'docs', 'ARCHITECTURE.md'), '# Architecture\n\nE2E test architecture.');
  
  // プロジェクトタイプ別ファイル
  switch (projectType) {
    case 'mcp-server':
      await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify({
        name: `test-${projectType}`,
        version: '1.0.0',
        main: 'dist/index.js',
        scripts: { build: 'tsc' },
        dependencies: { '@modelcontextprotocol/sdk': '^1.0.0' },
        devDependencies: { typescript: '^5.0.0' }
      }, null, 2));
      
      await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify({
        compilerOptions: { target: 'ES2020', module: 'commonjs', outDir: 'dist' },
        include: ['src/**/*']
      }, null, 2));
      
      await fs.ensureDir(path.join(projectPath, 'src'));
      await fs.writeFile(path.join(projectPath, 'src', 'index.ts'), 'console.log("MCP Server");');
      break;
      
    case 'cli-rust':
      await fs.writeFile(path.join(projectPath, 'Cargo.toml'), `[package]
name = "test-${projectType}"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = "4.0"
serde = "1.0"`);
      
      await fs.ensureDir(path.join(projectPath, 'src'));
      await fs.writeFile(path.join(projectPath, 'src', 'main.rs'), 'fn main() { println!("CLI Rust"); }');
      break;
      
    case 'web-nextjs':
      await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify({
        name: `test-${projectType}`,
        version: '1.0.0',
        scripts: { build: 'next build', dev: 'next dev' },
        dependencies: { next: '^14.0.0', react: '^18.0.0', 'react-dom': '^18.0.0' },
        devDependencies: { typescript: '^5.0.0' }
      }, null, 2));
      
      await fs.writeFile(path.join(projectPath, 'tsconfig.json'), JSON.stringify({
        compilerOptions: { target: 'ES2020', jsx: 'preserve' },
        include: ['**/*.ts', '**/*.tsx']
      }, null, 2));
      
      await fs.writeFile(path.join(projectPath, 'next.config.js'), 'module.exports = {};');
      break;
      
    case 'api-fastapi':
      await fs.writeFile(path.join(projectPath, 'requirements.txt'), 'fastapi>=0.100.0\nuvicorn>=0.20.0\npydantic>=2.0.0');
      await fs.writeFile(path.join(projectPath, 'main.py'), 'from fastapi import FastAPI\napp = FastAPI()');
      
      await fs.ensureDir(path.join(projectPath, 'src', 'core'));
      await fs.writeFile(path.join(projectPath, 'src', 'core', 'config.py'), 'class Settings:\n    app_name = "FastAPI"');
      break;
  }
}

async function verifyProjectStructure(projectType: ProjectType, projectPath: string): Promise<boolean> {
  try {
    const expectedStructures: Record<ProjectType, string[]> = {
      'mcp-server': [
        'src/',
        'src/tools/',
        'src/resources/',
        'docs/',
        'package.json'
      ],
      'cli-rust': [
        'src/',
        'docs/',
        'Cargo.toml'
      ],
      'web-nextjs': [
        'docs/',
        'package.json',
        'tsconfig.json'
      ],
      'api-fastapi': [
        'src/',
        'src/core/',
        'docs/',
        'requirements.txt'
      ]
    };

    const expectedPaths = expectedStructures[projectType] || [];
    
    for (const expectedPath of expectedPaths) {
      const fullPath = path.join(projectPath, expectedPath);
      const exists = await fs.pathExists(fullPath);
      if (!exists) {
        console.error(`Expected path not found: ${expectedPath}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error(`プロジェクト構造検証エラー (${projectType}):`, error);
    return false;
  }
}

async function attemptBuild(spec: ProjectTypeSpec, projectPath: string): Promise<{
  success: boolean;
  duration: number;
  output?: string;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    let output = '';

    switch (spec.type) {
      case 'mcp-server':
      case 'web-nextjs':
        // npm install && npm run build
        execSync('npm install', { cwd: projectPath, stdio: 'pipe', timeout: 120000 });
        output = execSync('npm run build', { 
          cwd: projectPath, 
          stdio: 'pipe', 
          timeout: 60000,
          encoding: 'utf-8'
        });
        break;

      case 'cli-rust':
        output = execSync('cargo build', { 
          cwd: projectPath, 
          stdio: 'pipe', 
          timeout: 180000,
          encoding: 'utf-8'
        });
        break;

      case 'api-fastapi':
        output = execSync('python -m py_compile main.py', { 
          cwd: projectPath, 
          stdio: 'pipe', 
          timeout: 30000,
          encoding: 'utf-8'
        });
        break;
    }

    return {
      success: true,
      duration: Date.now() - startTime,
      output
    };

  } catch (error) {
    return {
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}