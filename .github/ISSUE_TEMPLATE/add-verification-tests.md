---
name: Add Verification and E2E Tests
about: 生成結果の検証機能とE2Eテストの追加
title: "[テスト追加] 生成結果の完全性検証とE2Eテスト"
labels: testing, quality
assignees: ''

---

## 📋 概要

スケルトン生成の結果を検証する機能と、完全なE2Eテストスイートを追加します。

## 🎯 目的

- 生成されたプロジェクトの完全性を保証
- リグレッションの防止
- 各プロジェクトタイプの動作確認

## 🧪 テスト項目

### 1. 生成結果検証機能

```typescript
export class ProjectVerifier {
  private projectType: string;
  private targetPath: string;
  
  constructor(projectType: string, targetPath: string) {
    this.projectType = projectType;
    this.targetPath = targetPath;
  }
  
  async verify(): Promise<VerificationResult> {
    const results: VerificationResult = {
      valid: true,
      errors: [],
      warnings: []
    };
    
    // 必須ファイルの確認
    await this.verifyRequiredFiles(results);
    
    // ファイル内容の検証
    await this.verifyFileContents(results);
    
    // プロジェクト固有の検証
    await this.verifyProjectSpecific(results);
    
    return results;
  }
  
  private async verifyRequiredFiles(results: VerificationResult): Promise<void> {
    const requiredFiles = this.getRequiredFiles();
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.targetPath, file);
      if (!(await fs.pathExists(filePath))) {
        results.valid = false;
        results.errors.push(`必須ファイルが見つかりません: ${file}`);
      }
    }
  }
  
  private getRequiredFiles(): string[] {
    const commonFiles = ['CLAUDE.md', 'docs/PRD.md', 'docs/ARCHITECTURE.md'];
    
    const projectSpecificFiles = {
      'mcp-server': [
        'package.json',
        'tsconfig.json',
        'src/index.ts',
        'src/tools/example-tool.ts',
        'src/resources/example-resource.ts'
      ],
      'cli-rust': [
        'Cargo.toml',
        'src/main.rs',
        '.gitignore'
      ],
      'web-nextjs': [
        'package.json',
        'tsconfig.json',
        'pages/index.tsx',
        'pages/_app.tsx'
      ],
      'api-fastapi': [
        'requirements.txt',
        'main.py',
        'app/__init__.py'
      ]
    };
    
    return [...commonFiles, ...(projectSpecificFiles[this.projectType] || [])];
  }
}
```

### 2. E2Eテストスイート

```typescript
// test/e2e/scaffold-generation.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ScaffoldGenerator } from '../../scripts/scaffold-generator';
import { ProjectVerifier } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('Scaffold Generation E2E Tests', () => {
  const testDir = path.join(process.cwd(), 'test-output');
  
  beforeEach(async () => {
    await fs.ensureDir(testDir);
  });
  
  afterEach(async () => {
    await fs.remove(testDir);
  });
  
  describe('MCP Server Project', () => {
    const projectPath = path.join(testDir, 'test-mcp-server');
    
    it('should generate complete MCP server project', async () => {
      // 生成
      await generateProject({
        projectName: 'test-mcp-server',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // 検証
      const verifier = new ProjectVerifier('mcp-server', projectPath);
      const result = await verifier.verify();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should have valid package.json', async () => {
      await generateProject({
        projectName: 'test-mcp-server',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
      
      expect(packageJson.name).toBe('test-mcp-server');
      expect(packageJson.main).toBe('./dist/index.js');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('dev');
    });
    
    it('should build successfully', async () => {
      await generateProject({
        projectName: 'test-mcp-server',
        projectType: 'mcp-server',
        targetPath: projectPath
      });
      
      // npm install と build を実行
      execSync('npm install', { cwd: projectPath });
      execSync('npm run build', { cwd: projectPath });
      
      // ビルド結果の確認
      const distExists = await fs.pathExists(path.join(projectPath, 'dist/index.js'));
      expect(distExists).toBe(true);
    });
  });
  
  describe('Error Cases', () => {
    it('should rollback on error', async () => {
      // 不正なプロジェクトタイプで生成を試みる
      const invalidPath = path.join(testDir, 'invalid-project');
      
      await expect(generateProject({
        projectName: 'invalid-project',
        projectType: 'invalid-type' as any,
        targetPath: invalidPath
      })).rejects.toThrow();
      
      // ディレクトリが存在しないことを確認
      const exists = await fs.pathExists(invalidPath);
      expect(exists).toBe(false);
    });
  });
});
```

### 3. プロジェクトタイプ別検証

```typescript
// test/e2e/project-types.test.ts
const projectTypes = ['mcp-server', 'cli-rust', 'web-nextjs', 'api-fastapi'];

describe.each(projectTypes)('Project Type: %s', (projectType) => {
  const projectPath = path.join(testDir, `test-${projectType}`);
  
  it('should have all required documentation', async () => {
    await generateProject({
      projectName: `test-${projectType}`,
      projectType: projectType as any,
      targetPath: projectPath
    });
    
    const docs = [
      'docs/PRD.md',
      'docs/REQUIREMENTS.md',
      'docs/ARCHITECTURE.md',
      'docs/API.md',
      'docs/TESTING.md'
    ];
    
    for (const doc of docs) {
      const exists = await fs.pathExists(path.join(projectPath, doc));
      expect(exists).toBe(true);
    }
  });
  
  it('should not contain template placeholders', async () => {
    await generateProject({
      projectName: `test-${projectType}`,
      projectType: projectType as any,
      targetPath: projectPath
    });
    
    // すべてのファイルをチェック
    const files = await glob('**/*', { cwd: projectPath });
    
    for (const file of files) {
      const content = await fs.readFile(path.join(projectPath, file), 'utf-8');
      
      // テンプレート変数が残っていないことを確認
      expect(content).not.toMatch(/\{\{[^}]+\}\}/);
      expect(content).not.toMatch(/\[[A-Z_]+\]/);
    }
  });
});
```

## 📊 カバレッジ目標

- ユニットテスト: 90%以上
- E2Eテスト: すべてのプロジェクトタイプをカバー
- エラーケース: 主要なエラーパターンをカバー

## 🔗 関連Issue

- #16 エラーハンドリング・型安全性の向上
- #18 fs-extra インポートエラーの緊急修正
- #19 トランザクション処理とロールバック機能

## ✅ 完了条件

- [ ] ProjectVerifier クラスの実装
- [ ] E2Eテストスイートの実装
- [ ] すべてのプロジェクトタイプのテスト
- [ ] エラーケースのテスト
- [ ] CI/CDパイプラインへの統合
- [ ] テストドキュメントの作成