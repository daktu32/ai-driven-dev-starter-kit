---
name: Error Handling Improvements
about: Scaffold Generator のエラーハンドリング強化
title: "[改善] Scaffold Generator のエラーハンドリング・型安全性の向上"
labels: enhancement, quality
assignees: ''

---

## 📋 概要

Scaffold Generator の動作確認で発見されたエラーハンドリングと型安全性の問題を改善する。

## 🎯 目的

- エラー発生時の原因特定を容易にする
- 不正な入力に対する堅牢性を向上させる
- 開発者体験（DX）を改善する

## 📝 改善項目

### 1. エラーハンドリングの強化

**現状の問題点**:
- fs操作のエラーが適切にキャッチされていない
- エラーメッセージが不親切

**改善内容**:
```typescript
// scripts/scaffold-generator.ts
private async copyDirectoryRecursively(sourcePath: string, targetPath: string): Promise<void> {
  try {
    const items = await fs.readdir(sourcePath, { withFileTypes: true });
    // ...
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`ソースディレクトリが見つかりません: ${sourcePath}`);
    }
    throw new Error(`ディレクトリ読み込みエラー: ${sourcePath}\n${error.message}`);
  }
}
```

### 2. 型安全性の向上

**現状の問題点**:
- プロジェクトタイプの検証が不十分
- 実行時エラーの可能性

**改善内容**:
```typescript
// scripts/lib/documentTemplateProcessor.ts
private isValidProjectType(type: string): type is ProjectType {
  return ['cli-rust', 'web-nextjs', 'api-fastapi', 'mcp-server'].includes(type);
}

private getProjectTypeDefaults(projectType: string): ProjectTypeDefaults {
  if (!this.isValidProjectType(projectType)) {
    throw new Error(`無効なプロジェクトタイプ: ${projectType}`);
  }
  // ...
}
```

### 3. 設定検証機能の実装

**現状の問題点**:
- 必須パラメータのチェックが不足
- 不正な設定での実行が可能

**改善内容**:
```typescript
// scripts/lib/validator.ts に追加
export function validateProjectConfig(config: Partial<ProjectConfig>): asserts config is ProjectConfig {
  const errors: string[] = [];
  
  if (!config.projectName?.trim()) {
    errors.push('プロジェクト名は必須です');
  }
  
  if (!config.projectType) {
    errors.push('プロジェクトタイプは必須です');
  }
  
  if (!config.repositoryUrl?.match(/^https?:\/\/.+/)) {
    errors.push('有効なリポジトリURLを指定してください');
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}
```

### 4. パス展開ユーティリティの実装

**現状の問題点**:
- `~/` で始まるパスが展開されない
- クロスプラットフォーム対応が不十分

**改善内容**:
```typescript
// scripts/lib/utils.ts に追加
import { homedir } from 'os';
import { resolve } from 'path';

export function expandPath(inputPath: string): string {
  if (inputPath.startsWith('~/')) {
    return resolve(homedir(), inputPath.slice(2));
  }
  return resolve(inputPath);
}
```

### 5. Inquirer エラー対策

**現状の問題点**:
- プロセス終了時にreadlineエラーが発生
- SIGINT処理が不適切

**改善内容**:
```typescript
// scripts/scaffold-generator.ts
constructor() {
  this.sourceDir = path.resolve(process.cwd());
  this.parseCLIArgs();
  this.setupGracefulShutdown();
}

private setupGracefulShutdown(): void {
  const cleanup = () => {
    console.log('\n👋 終了します...');
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}
```

### 6. 単体テストの追加

**テスト対象**:
- DocumentTemplateProcessor
- パス展開ユーティリティ
- 設定検証機能
- エラーハンドリング

**テストファイル構成**:
```
test/
├── unit/
│   ├── documentTemplateProcessor.test.ts
│   ├── pathUtils.test.ts
│   ├── configValidator.test.ts
│   └── scaffoldGenerator.test.ts
└── integration/
    └── scaffold-generation.test.ts
```

## 🚀 実装手順

1. **フェーズ1: 基盤整備** (優先度: 高)
   - [ ] エラーハンドリング強化
   - [ ] 型安全性向上
   - [ ] 単体テストのセットアップ

2. **フェーズ2: 機能改善** (優先度: 中)
   - [ ] 設定検証機能の実装
   - [ ] パス展開ユーティリティ
   - [ ] Inquirerエラー対策

3. **フェーズ3: 品質保証** (優先度: 高)
   - [ ] 単体テストの実装
   - [ ] 統合テストの追加
   - [ ] CI/CDパイプラインでの自動テスト

## 📊 成功指標

- エラー発生時の原因特定時間: 5分以内
- テストカバレッジ: 80%以上
- 不正入力に対するエラー率: 0%

## 🔗 関連情報

- 元の動作確認結果: #[PR番号]
- TypeScript Best Practices
- Node.js Error Handling Guide

## ✅ 完了条件

- [ ] すべてのエラーケースで適切なメッセージが表示される
- [ ] 型チェックがすべて通過する
- [ ] テストカバレッジが目標値を達成
- [ ] ドキュメントが更新されている