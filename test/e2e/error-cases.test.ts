import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ProjectVerifier } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Error Cases and Edge Cases E2E Tests', () => {
  const testDir = path.join(process.cwd(), 'test', 'error-cases-output');
  
  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    if (!process.env.KEEP_TEST_OUTPUT) {
      await fs.remove(testDir);
    }
  });

  describe('ProjectVerifier Error Handling', () => {
    it('should handle non-existent project directory gracefully', async () => {
      const nonExistentPath = path.join(testDir, 'non-existent-project');
      
      const verifier = new ProjectVerifier('mcp-server', nonExistentPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => 
        error.includes('見つかりません') || error.includes('not found')
      )).toBe(true);
    });

    it('should handle invalid project type gracefully', async () => {
      const projectPath = path.join(testDir, 'invalid-type-project');
      await fs.ensureDir(projectPath);
      
      // 基本的なファイルを作成
      await fs.writeFile(path.join(projectPath, 'CLAUDE.md'), '# Invalid Type Project');
      
      const verifier = new ProjectVerifier('invalid-type' as any, projectPath);
      const result = await verifier.verify();
      
      // 無効なプロジェクトタイプでも検証は実行される
      expect(result).toBeDefined();
      expect(result.checkedFiles).toBeDefined();
      expect(result.valid).toBeDefined();
    });

    it('should handle corrupted file content gracefully', async () => {
      const projectPath = path.join(testDir, 'corrupted-files');
      await generateProject({
        projectName: 'corrupted-files',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // package.jsonを破損させる
      const packageJsonPath = path.join(projectPath, 'package.json');
      await fs.writeFile(packageJsonPath, '{ invalid json content }');
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // エラーは記録されるが、検証プロセスはクラッシュしない
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
    });

    it('should handle permission denied errors', async () => {
      // Windowsでは権限テストをスキップ
      if (process.platform === 'win32') {
        return;
      }

      const projectPath = path.join(testDir, 'permission-denied');
      await generateProject({
        projectName: 'permission-denied',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // ディレクトリを読み取り専用にする
      await fs.chmod(path.join(projectPath, 'src'), 0o444);
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // 権限エラーでもクラッシュしない
      expect(result).toBeDefined();
    });
  });

  describe('Build Failure Scenarios', () => {
    it('should handle npm install failure in MCP project', async () => {
      const projectPath = path.join(testDir, 'npm-install-failure');
      await generateProject({
        projectName: 'npm-install-failure',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // 存在しない依存関係を追加してnpm installを失敗させる
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.dependencies['non-existent-package-12345'] = '^1.0.0';
      await fs.writeJson(packageJsonPath, packageJson);
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
      expect(result.buildResult!.error).toContain('npm build failed');
    });

    it('should handle TypeScript compilation errors', async () => {
      const projectPath = path.join(testDir, 'typescript-error');
      await generateProject({
        projectName: 'typescript-error',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // TypeScriptコンパイルエラーを発生させる
      const indexPath = path.join(projectPath, 'src/index.ts');
      await fs.writeFile(indexPath, `
        // 意図的なTypeScriptエラー
        const invalidCode: string = 123;
        function missingReturnType() {
          return "should be typed";
        }
        console.log(invalidCode);
      `);
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
    });

    it('should handle Rust compilation errors', async () => {
      const projectPath = path.join(testDir, 'rust-error');
      await generateProject({
        projectName: 'rust-error',
        projectType: 'cli-rust',
        targetPath: projectPath
      });
      
      // Rustコンパイルエラーを発生させる
      const mainPath = path.join(projectPath, 'src/main.rs');
      await fs.writeFile(mainPath, `
        // 意図的なRustエラー
        fn main() {
          let invalid_syntax = 
          println!("This will not compile");
        }
      `);
      
      const verifier = new ProjectVerifier('cli-rust', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
      expect(result.buildResult!.error).toContain('cargo build failed');
    });

    it('should handle Python syntax errors', async () => {
      const projectPath = path.join(testDir, 'python-error');
      await generateProject({
        projectName: 'python-error',
        projectType: 'api-fastapi',
        targetPath: projectPath
      });
      
      // Python構文エラーを発生させる
      const mainPath = path.join(projectPath, 'main.py');
      await fs.writeFile(mainPath, `
        # 意図的なPython構文エラー
        from fastapi import FastAPI
        
        app = FastAPI(
        
        @app.get("/")
        def invalid_syntax(
          return {"message": "This will not compile"}
      `);
      
      const verifier = new ProjectVerifier('api-fastapi', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
      expect(result.buildResult!.error).toContain('Python syntax check failed');
    });
  });

  describe('Template Variable Issues', () => {
    it('should detect large amounts of unprocessed template variables', async () => {
      const projectPath = path.join(testDir, 'template-vars');
      await generateProject({
        projectName: 'template-vars',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // 多数のテンプレート変数を含むファイルを作成
      const templateContent = `
        Project: {{PROJECT_NAME}}
        Date: {{DATE}}
        Author: {{AUTHOR}}
        Type: [PROJECT_TYPE]
        Stack: [TECH_STACK_BACKEND]
        KPI: [YOUR_PRIMARY_KPI]
        Goal: [YOUR_BUSINESS_GOAL]
      `;
      
      await fs.writeFile(path.join(projectPath, 'template-test.md'), templateContent);
      await fs.writeFile(path.join(projectPath, 'docs/template-test2.md'), templateContent);
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.templateVariablesFound.length).toBeGreaterThan(5);
    });

    it('should handle binary files gracefully during template scanning', async () => {
      const projectPath = path.join(testDir, 'binary-files');
      await generateProject({
        projectName: 'binary-files',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // バイナリファイルを作成
      const binaryData = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]); // PNG header
      await fs.writeFile(path.join(projectPath, 'test-image.png'), binaryData);
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // バイナリファイルがあってもクラッシュしない
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });

  describe('Resource Constraints', () => {
    it('should handle timeout during build verification', async () => {
      const projectPath = path.join(testDir, 'timeout-test');
      await generateProject({
        projectName: 'timeout-test',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // package.jsonに時間のかかるビルドスクリプトを追加
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = await fs.readJson(packageJsonPath);
      
      // 長時間実行されるビルドスクリプト（実際にはテストのためタイムアウトしやすい設定）
      packageJson.scripts.build = 'sleep 300 && tsc'; // 5分待機
      await fs.writeJson(packageJsonPath, packageJson);
      
      // ProjectVerifierのタイムアウト設定を短くする必要があるが、
      // この例では実際のタイムアウトハンドリングをテスト
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      
      // タイムアウトが適切に処理されることを確認
      const startTime = Date.now();
      const result = await verifier.verify();
      const duration = Date.now() - startTime;
      
      // 60秒以内（タイムアウト設定）に完了することを確認
      expect(duration).toBeLessThan(70000); // 70秒でマージン
    }, 80000); // Jest自体のタイムアウトを80秒に設定

    it('should handle large project with many files', async () => {
      const projectPath = path.join(testDir, 'large-project');
      await generateProject({
        projectName: 'large-project',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // 多数のファイルを作成
      const srcPath = path.join(projectPath, 'src');
      for (let i = 0; i < 100; i++) {
        await fs.writeFile(
          path.join(srcPath, `file-${i}.ts`), 
          `export const value${i} = ${i};`
        );
      }
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // 大量のファイルがあっても検証が完了する
      expect(result).toBeDefined();
      expect(result.checkedFiles).toBeGreaterThan(50);
    });
  });

  describe('Network and Environment Issues', () => {
    it('should handle npm registry connection issues', async () => {
      const projectPath = path.join(testDir, 'network-issue');
      await generateProject({
        projectName: 'network-issue',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // 無効なnpmレジストリを設定
      const npmrcPath = path.join(projectPath, '.npmrc');
      await fs.writeFile(npmrcPath, 'registry=http://invalid-registry-url.example.com/');
      
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      // ネットワークエラーが適切に処理される
      expect(result.valid).toBe(false);
      expect(result.buildResult!.success).toBe(false);
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