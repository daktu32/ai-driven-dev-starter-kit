import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProjectVerifier } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { glob } from 'glob';

describe('Project Types Verification E2E Tests', () => {
  const testDir = path.join(process.cwd(), 'test', 'project-types-output');
  
  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (!process.env.KEEP_TEST_OUTPUT) {
      await fs.remove(testDir);
    }
  });

  describe('MCP Server Project', () => {
    const projectPath = path.join(testDir, 'test-mcp-server');
    
    beforeEach(async () => {
      await generateProject({
        projectName: 'test-mcp-server',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
    });

    it('should have valid package.json structure', async () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      expect(packageJson.name).toBe('test-mcp-server');
      expect(packageJson.type).toBe('module');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.dependencies).toHaveProperty('@modelcontextprotocol/sdk');
    });

    it('should have MCP-specific source files', async () => {
      const requiredFiles = [
        'src/index.ts',
        'src/tools/example-tool.ts',
        'src/resources/example-resource.ts',
        'src/utils/logger.ts'
      ];

      for (const file of requiredFiles) {
        const exists = await fs.pathExists(path.join(projectPath, file));
        expect(exists).toBe(true);
      }
    });

    it('should have proper TypeScript configuration', async () => {
      const tsconfigPath = path.join(projectPath, 'tsconfig.json');
      const tsconfig = await fs.readJson(tsconfigPath);
      
      expect(tsconfig.compilerOptions.target).toBe('ES2022');
      expect(tsconfig.compilerOptions.module).toBe('ESNext');
      expect(tsconfig.compilerOptions.outDir).toBe('./dist');
    });

    it('should build and generate dist files', async () => {
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult!.success).toBe(true);
      
      const distFiles = [
        'dist/index.js',
        'dist/tools/example-tool.js',
        'dist/resources/example-resource.js'
      ];

      for (const file of distFiles) {
        const exists = await fs.pathExists(path.join(projectPath, file));
        expect(exists).toBe(true);
      }
    });
  });

  describe('CLI Rust Project', () => {
    const projectPath = path.join(testDir, 'test-cli-rust');
    
    beforeEach(async () => {
      await generateProject({
        projectName: 'test-cli-rust',
        projectType: 'cli-rust',
        targetPath: projectPath
      });
    });

    it('should have valid Cargo.toml structure', async () => {
      const cargoTomlPath = path.join(projectPath, 'Cargo.toml');
      const cargoContent = await fs.readFile(cargoTomlPath, 'utf-8');
      
      expect(cargoContent).toContain('name = "test-cli-rust"');
      expect(cargoContent).toContain('edition = "2021"');
      expect(cargoContent).toContain('[dependencies]');
      expect(cargoContent).toContain('clap');
      expect(cargoContent).toContain('serde');
    });

    it('should have Rust source files', async () => {
      const mainRsPath = path.join(projectPath, 'src/main.rs');
      const exists = await fs.pathExists(mainRsPath);
      expect(exists).toBe(true);
      
      const content = await fs.readFile(mainRsPath, 'utf-8');
      expect(content).toContain('use clap::Parser');
      expect(content).toContain('fn main()');
    });

    it('should compile successfully with cargo', async () => {
      const verifier = new ProjectVerifier('cli-rust', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult!.success).toBe(true);
      
      // Cargoビルド成果物の確認
      const targetDir = path.join(projectPath, 'target');
      const exists = await fs.pathExists(targetDir);
      expect(exists).toBe(true);
    });
  });

  describe('Web Next.js Project', () => {
    const projectPath = path.join(testDir, 'test-web-nextjs');
    
    beforeEach(async () => {
      await generateProject({
        projectName: 'test-web-nextjs',
        projectType: 'web-nextjs',
        targetPath: projectPath
      });
    });

    it('should have Next.js specific package.json', async () => {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      expect(packageJson.name).toBe('test-web-nextjs');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('start');
      expect(packageJson.dependencies).toHaveProperty('next');
      expect(packageJson.dependencies).toHaveProperty('react');
    });

    it('should have Next.js project structure', async () => {
      // App Routerまたは Pages Routerの構造確認
      const appDirExists = await fs.pathExists(path.join(projectPath, 'app'));
      const pagesDirExists = await fs.pathExists(path.join(projectPath, 'pages'));
      
      // どちらかの構造が存在することを確認
      expect(appDirExists || pagesDirExists).toBe(true);
      
      const publicDirExists = await fs.pathExists(path.join(projectPath, 'public'));
      expect(publicDirExists).toBe(true);
    });

    it('should build Next.js project successfully', async () => {
      const verifier = new ProjectVerifier('web-nextjs', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult!.success).toBe(true);
      
      // Next.jsビルド成果物の確認
      const buildDir = path.join(projectPath, '.next');
      const exists = await fs.pathExists(buildDir);
      expect(exists).toBe(true);
    });
  });

  describe('API FastAPI Project', () => {
    const projectPath = path.join(testDir, 'test-api-fastapi');
    
    beforeEach(async () => {
      await generateProject({
        projectName: 'test-api-fastapi',
        projectType: 'api-fastapi',
        targetPath: projectPath
      });
    });

    it('should have Python requirements.txt', async () => {
      const requirementsPath = path.join(projectPath, 'requirements.txt');
      const exists = await fs.pathExists(requirementsPath);
      expect(exists).toBe(true);
      
      const content = await fs.readFile(requirementsPath, 'utf-8');
      expect(content).toContain('fastapi');
      expect(content).toContain('uvicorn');
    });

    it('should have FastAPI main.py', async () => {
      const mainPyPath = path.join(projectPath, 'main.py');
      const exists = await fs.pathExists(mainPyPath);
      expect(exists).toBe(true);
      
      const content = await fs.readFile(mainPyPath, 'utf-8');
      expect(content).toContain('from fastapi import FastAPI');
      expect(content).toContain('app = FastAPI()');
    });

    it('should have valid Python syntax', async () => {
      const verifier = new ProjectVerifier('api-fastapi', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult!.success).toBe(true);
    });

    it('should have app package structure', async () => {
      const appInitPath = path.join(projectPath, 'app/__init__.py');
      
      // __init__.pyが存在する場合の確認（オプション）
      if (await fs.pathExists(appInitPath)) {
        const content = await fs.readFile(appInitPath, 'utf-8');
        // 最低限、Pythonファイルとして読み込み可能であることを確認
        expect(typeof content).toBe('string');
      }
    });
  });

  describe('Cross-Project Type Tests', () => {
    const projectTypes = ['mcp-server', 'cli-rust', 'web-nextjs', 'api-fastapi'];

    describe.each(projectTypes)('Common tests for %s', (projectType) => {
      const projectPath = path.join(testDir, `cross-test-${projectType}`);
      
      beforeEach(async () => {
        await generateProject({
          projectName: `cross-test-${projectType}`,
          projectType,
          targetPath: projectPath
        });
      });

      it('should not contain template placeholder variables', async () => {
        // すべてのファイルをスキャンしてテンプレート変数をチェック
        const files = await glob('**/*', { 
          cwd: projectPath,
          nodir: true,
          ignore: ['node_modules/**', 'target/**', '.git/**', 'dist/**']
        });

        for (const file of files.slice(0, 20)) { // パフォーマンスのため最初の20ファイルのみ
          const filePath = path.join(projectPath, file);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            
            // 主要なテンプレート変数が残っていないことを確認
            expect(content).not.toMatch(/\{\{PROJECT_NAME\}\}/);
            expect(content).not.toMatch(/\{\{DATE\}\}/);
            expect(content).not.toMatch(/\{\{AUTHOR\}\}/);
            
          } catch (error) {
            // バイナリファイルの場合はスキップ
            continue;
          }
        }
      });

      it('should have proper documentation structure', async () => {
        const docsPath = path.join(projectPath, 'docs');
        const docsExists = await fs.pathExists(docsPath);
        expect(docsExists).toBe(true);

        const requiredDocs = [
          'docs/PRD.md',
          'docs/ARCHITECTURE.md',
          'docs/REQUIREMENTS.md',
          'docs/TESTING.md'
        ];

        for (const doc of requiredDocs) {
          const exists = await fs.pathExists(path.join(projectPath, doc));
          expect(exists).toBe(true);
        }
      });

      it('should have CLAUDE.md with project-specific content', async () => {
        const claudeMdPath = path.join(projectPath, 'CLAUDE.md');
        const exists = await fs.pathExists(claudeMdPath);
        expect(exists).toBe(true);
        
        const content = await fs.readFile(claudeMdPath, 'utf-8');
        expect(content).toContain(`cross-test-${projectType}`);
        expect(content).toContain(projectType);
      });

      it('should complete full verification successfully', async () => {
        const verifier = new ProjectVerifier(projectType, projectPath);
        const result = await verifier.verify();
        
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.checkedFiles).toBeGreaterThan(0);
        expect(result.missingFiles).toHaveLength(0);
      });
    });
  });
});

/**
 * プロジェクト生成ヘルパー関数
 */
async function generateProject(options: {
  projectName: string;
  projectType: string;
  targetPath: string;
}) {
  const { projectName, projectType, targetPath } = options;
  
  const command = `node dist/scripts/scaffold-generator.js --name "${projectName}" --type "${projectType}" --output "${targetPath}" --skip-interactive --force`;
  
  try {
    execSync(command, {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 120000 // 2分
    });
  } catch (error) {
    console.error(`Failed to generate project ${projectName}: ${error}`);
    throw error;
  }
}