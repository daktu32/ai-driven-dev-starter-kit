import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProjectVerifier, type VerificationResult, type BuildResult } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Project Verification E2E Tests', () => {
  const testDir = path.join(process.cwd(), 'test', 'verification-output');
  
  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // 環境変数でテスト結果を保持するかどうかを制御
    if (!process.env.KEEP_TEST_OUTPUT) {
      await fs.remove(testDir);
    }
  });

  describe('ProjectVerifier Core Functionality', () => {
    const projectPath = path.join(testDir, 'test-verification-mcp');
    
    beforeEach(async () => {
      // テスト用MCPサーバープロジェクトを生成
      await generateTestProject({
        projectName: 'test-verification-mcp',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
    });

    it('should verify complete MCP server project', async () => {
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.checkedFiles).toBeGreaterThan(0);
      expect(result.missingFiles).toHaveLength(0);
    });

    it('should have BuildResult when verification succeeds', async () => {
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult).toBeDefined();
      expect(result.buildResult!.success).toBe(true);
      expect(result.buildResult!.duration).toBeGreaterThan(0);
      expect(result.buildResult!.output).toBeDefined();
    });

    it('should skip build verification when skipBuild option is true', async () => {
      const result = await ProjectVerifier.verifyGenerated('mcp-server', projectPath, {
        skipBuild: true
      });
      
      expect(result.valid).toBe(true);
      expect(result.buildResult).toBeDefined();
      expect(result.buildResult!.output).toBe('Build verification skipped');
    });

    it('should detect missing required files', async () => {
      // 必須ファイルを削除
      await fs.remove(path.join(projectPath, 'package.json'));
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missingFiles).toContain('package.json');
    });

    it('should detect template variables in files', async () => {
      // テンプレート変数を含むファイルを作成
      const testFilePath = path.join(projectPath, 'test-template-vars.md');
      await fs.writeFile(testFilePath, 'Project: {{PROJECT_NAME}}\nAuthor: [YOUR_NAME]');
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.templateVariablesFound.length).toBeGreaterThan(0);
    });
  });

  describe('Build Verification Tests', () => {
    it('should build MCP server project successfully', async () => {
      const projectPath = path.join(testDir, 'test-build-mcp');
      
      await generateTestProject({
        projectName: 'test-build-mcp',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.buildResult!.success).toBe(true);
      expect(result.buildResult!.error).toBeUndefined();
      
      // ビルド成果物の確認
      const distExists = await fs.pathExists(path.join(projectPath, 'dist'));
      expect(distExists).toBe(true);
    });

    it('should handle build failures gracefully', async () => {
      const projectPath = path.join(testDir, 'test-build-failure');
      
      await generateTestProject({
        projectName: 'test-build-failure',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // package.jsonを壊してビルドを失敗させる
      const packageJsonPath = path.join(projectPath, 'package.json');
      await fs.writeFile(packageJsonPath, '{ invalid json }');
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
      expect(result.buildResult!.error).toBeDefined();
      expect(result.errors.some(error => error.includes('ビルドに失敗しました'))).toBe(true);
    });
  });

  describe('Project Type Specific Tests', () => {
    const projectTypes = ['mcp-server', 'cli-rust', 'web-nextjs', 'api-fastapi'] as const;

    describe.each(projectTypes)('Project Type: %s', (projectType) => {
      const projectPath = path.join(testDir, `test-${projectType}`);
      
      beforeEach(async () => {
        await generateTestProject({
          projectName: `test-${projectType}`,
          projectType,
          targetPath: projectPath
        });
      });

      it('should have all required documentation', async () => {
        const verifier = new ProjectVerifier(projectType, projectPath);
        const result = await verifier.verify();
        
        // 基本的なドキュメントファイルの存在確認
        const requiredDocs = [
          'CLAUDE.md',
          'docs/PRD.md',
          'docs/ARCHITECTURE.md'
        ];
        
        for (const doc of requiredDocs) {
          const exists = await fs.pathExists(path.join(projectPath, doc));
          expect(exists).toBe(true);
        }
      });

      it('should have project type specific files', async () => {
        const verifier = new ProjectVerifier(projectType, projectPath);
        const result = await verifier.verify();
        
        expect(result.valid).toBe(true);
        expect(result.missingFiles).toHaveLength(0);
      });

      it('should not contain unprocessed template placeholders', async () => {
        const verifier = new ProjectVerifier(projectType, projectPath);
        const result = await verifier.verify();
        
        // 重要なテンプレート変数が処理されていることを確認
        expect(result.templateVariablesFound.filter(v => 
          v.includes('{{PROJECT_NAME}}') || 
          v.includes('{{DATE}}') ||
          v.includes('{{AUTHOR}}')
        )).toHaveLength(0);
      });
    });
  });

  describe('Error Cases and Edge Cases', () => {
    it('should handle non-existent project directory', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent');
      
      const verifier = new ProjectVerifier('mcp-server', nonExistentPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle invalid project type', async () => {
      const projectPath = path.join(testDir, 'test-invalid-type');
      await fs.ensureDir(projectPath);
      
      const verifier = new ProjectVerifier('invalid-type' as any, projectPath);
      const result = await verifier.verify();
      
      // 無効なプロジェクトタイプでも基本的な検証は実行される
      expect(result).toBeDefined();
      expect(result.checkedFiles).toBeDefined();
    });

    it('should handle permission errors gracefully', async () => {
      const projectPath = path.join(testDir, 'test-permission');
      await generateTestProject({
        projectName: 'test-permission',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // ファイルを読み取り専用にする（Windowsでは動作しない可能性があります）
      if (process.platform !== 'win32') {
        await fs.chmod(path.join(projectPath, 'package.json'), 0o444);
      }
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // 権限エラーがあってもクラッシュしないことを確認
      expect(result).toBeDefined();
    });
  });
});

/**
 * テスト用プロジェクト生成ヘルパー関数
 */
async function generateTestProject(options: {
  projectName: string;
  projectType: string;
  targetPath: string;
}) {
  const { projectName, projectType, targetPath } = options;
  
  // scaffold-generatorを使用してプロジェクトを生成
  const command = `node dist/scripts/scaffold-generator.js --name "${projectName}" --type "${projectType}" --output "${targetPath}" --skip-interactive --force`;
  
  try {
    execSync(command, {
      cwd: process.cwd(),
      stdio: 'pipe',
      timeout: 60000 // 1分
    });
  } catch (error) {
    console.error(`Failed to generate test project: ${error}`);
    throw error;
  }
}