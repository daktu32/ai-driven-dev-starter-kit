---
name: Implementation Plan
about: エラーハンドリング改善の詳細実装計画
title: "[実装計画] Scaffold Generator 改善プロジェクト"
labels: project, planning
assignees: ''

---

# 🎯 Scaffold Generator 改善プロジェクト実装計画

## 📅 スケジュール概要

### Phase 1: 基盤整備 (2日間)
- Day 1: エラーハンドリング強化
- Day 2: 型安全性向上・基本テストセットアップ

### Phase 2: 機能改善 (3日間)
- Day 3: 設定検証機能
- Day 4: パス展開ユーティリティ・Inquirerエラー対策
- Day 5: 統合・動作確認

### Phase 3: 品質保証 (2日間)
- Day 6: 単体テスト実装
- Day 7: 統合テスト・ドキュメント更新

## 📋 詳細タスクリスト

### 🔧 タスク1: エラーハンドリング強化

**ファイル**: `scripts/scaffold-generator.ts`

```typescript
// 実装内容
class ScaffoldGenerator {
  private async handleError(error: any, context: string): Promise<never> {
    const errorMessage = this.formatError(error, context);
    console.error(chalk.red.bold(`\n❌ ${context}でエラーが発生しました:`));
    console.error(chalk.red(errorMessage));
    
    if (this.options?.verbose) {
      console.error(chalk.gray('\nスタックトレース:'));
      console.error(chalk.gray(error.stack));
    }
    
    throw new ScaffoldError(errorMessage, error);
  }
  
  private formatError(error: any, context: string): string {
    if (error.code === 'ENOENT') {
      return `ファイルまたはディレクトリが見つかりません: ${error.path}`;
    }
    if (error.code === 'EACCES') {
      return `アクセス権限がありません: ${error.path}`;
    }
    if (error.code === 'EEXIST') {
      return `既に存在します: ${error.path}`;
    }
    return error.message || '不明なエラー';
  }
}
```

### 🔧 タスク2: 型安全性向上

**新規ファイル**: `scripts/lib/types/guards.ts`

```typescript
import { ProjectConfig } from '../types.js';

export const PROJECT_TYPES = ['cli-rust', 'web-nextjs', 'api-fastapi', 'mcp-server'] as const;
export type ProjectType = typeof PROJECT_TYPES[number];

export function isValidProjectType(value: unknown): value is ProjectType {
  return typeof value === 'string' && PROJECT_TYPES.includes(value as any);
}

export function assertProjectConfig(config: unknown): asserts config is ProjectConfig {
  if (!config || typeof config !== 'object') {
    throw new TypeError('設定はオブジェクトである必要があります');
  }
  
  const c = config as any;
  
  if (!c.projectName || typeof c.projectName !== 'string') {
    throw new TypeError('projectName は必須の文字列です');
  }
  
  if (!isValidProjectType(c.projectType)) {
    throw new TypeError(`projectType は次のいずれかである必要があります: ${PROJECT_TYPES.join(', ')}`);
  }
  
  // 他のフィールドも検証...
}
```

### 🔧 タスク3: 設定検証機能

**更新ファイル**: `scripts/lib/validator.ts`

```typescript
export class ConfigValidator {
  private errors: ValidationError[] = [];
  
  validateProjectConfig(config: Partial<ProjectConfig>): ValidationResult {
    this.errors = [];
    
    this.validateRequired('projectName', config.projectName);
    this.validateRequired('projectType', config.projectType);
    this.validateUrl('repositoryUrl', config.repositoryUrl);
    this.validateTechStack(config.techStack);
    this.validateTeam(config.team);
    
    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      sanitized: this.sanitizeConfig(config)
    };
  }
  
  private validateRequired(field: string, value: unknown): void {
    if (!value || (typeof value === 'string' && !value.trim())) {
      this.errors.push({
        field,
        message: `${field} は必須項目です`,
        type: 'required'
      });
    }
  }
  
  private validateUrl(field: string, value: unknown): void {
    if (value && typeof value === 'string') {
      try {
        new URL(value);
      } catch {
        this.errors.push({
          field,
          message: `${field} は有効なURLである必要があります`,
          type: 'format'
        });
      }
    }
  }
}
```

### 🔧 タスク4: パス展開ユーティリティ

**新規ファイル**: `scripts/lib/utils/pathUtils.ts`

```typescript
import { homedir } from 'os';
import { resolve, normalize } from 'path';

export class PathUtils {
  /**
   * チルダ(~)を含むパスを展開
   */
  static expandTilde(inputPath: string): string {
    if (inputPath.startsWith('~/')) {
      return resolve(homedir(), inputPath.slice(2));
    }
    return inputPath;
  }
  
  /**
   * 環境変数を含むパスを展開
   */
  static expandEnvVars(inputPath: string): string {
    return inputPath.replace(/\$([A-Z_]+[A-Z0-9_]*)/gi, (_, envVar) => {
      return process.env[envVar] || '';
    });
  }
  
  /**
   * 完全なパス展開
   */
  static expandPath(inputPath: string): string {
    let expanded = this.expandTilde(inputPath);
    expanded = this.expandEnvVars(expanded);
    return normalize(resolve(expanded));
  }
}
```

### 🔧 タスク5: テスト実装

**テストファイル例**: `test/unit/pathUtils.test.ts`

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { PathUtils } from '../../scripts/lib/utils/pathUtils.js';
import { homedir } from 'os';

describe('PathUtils', () => {
  describe('expandTilde', () => {
    it('should expand ~ to home directory', () => {
      const result = PathUtils.expandTilde('~/Documents');
      expect(result).toBe(`${homedir()}/Documents`);
    });
    
    it('should not modify paths without ~', () => {
      const result = PathUtils.expandTilde('/usr/local/bin');
      expect(result).toBe('/usr/local/bin');
    });
  });
  
  describe('expandEnvVars', () => {
    beforeEach(() => {
      process.env.TEST_VAR = '/test/path';
    });
    
    it('should expand environment variables', () => {
      const result = PathUtils.expandEnvVars('$TEST_VAR/file');
      expect(result).toBe('/test/path/file');
    });
  });
});
```

## 📈 進捗管理

### Week 1
- [ ] Phase 1 完了
- [ ] Phase 2 開始

### Week 2
- [ ] Phase 2 完了
- [ ] Phase 3 完了
- [ ] リリース準備

## 🎯 成果物

1. **改善されたコード**
   - エラーハンドリング強化版
   - 型安全な実装
   - 検証機能付き

2. **テストスイート**
   - 単体テスト (カバレッジ 80%+)
   - 統合テスト
   - E2Eテスト

3. **ドキュメント**
   - 更新されたREADME
   - エラーハンドリングガイド
   - 型定義ドキュメント

## 📊 リスクと対策

| リスク | 可能性 | 影響 | 対策 |
|--------|--------|------|------|
| 既存コードの破壊的変更 | 中 | 高 | 段階的移行・後方互換性維持 |
| テスト実装の遅延 | 低 | 中 | 早期着手・並行実装 |
| 新規バグの混入 | 低 | 高 | 徹底的なレビュー・テスト |

## ✅ 完了基準

- [ ] すべてのタスクが完了
- [ ] テストがすべてパス
- [ ] レビュー承認
- [ ] ドキュメント更新完了