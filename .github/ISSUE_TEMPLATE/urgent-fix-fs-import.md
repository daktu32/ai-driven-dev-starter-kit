---
name: Urgent Fix - fs-extra Import
about: scaffold-generator.ts の fs-extra インポート問題の緊急修正
title: "[緊急修正] fs-extra インポートエラーによるプロジェクト生成失敗"
labels: bug, urgent
assignees: ''

---

## 🚨 問題の概要

Scaffold Generator でプロジェクトを生成すると、ドキュメントのみが生成され、実際のプロジェクトファイル（package.json、src/など）がコピーされない致命的な問題が発生しています。

## 🔍 原因

`fs.readdir` が関数として認識されないエラーが発生し、プロジェクト構造のコピーが失敗しているが、エラーハンドリングが不適切なため処理が継続され、不完全なプロジェクトが生成されます。

```
TypeError: fs.readdir is not a function
    at ScaffoldGenerator.copyDirectoryRecursively
```

## 🎯 影響範囲

- **重大度**: 🔴 Critical
- **影響**: すべてのプロジェクトタイプで実際のコードが生成されない
- **ユーザー体験**: 最悪（ドキュメントだけのプロジェクトが生成される）

## 📋 修正内容

### 1. fs-extra の正しいインポート方法

```typescript
// 現在（問題あり）
import fs from 'fs-extra';
const items = await fs.readdir(sourcePath, { withFileTypes: true });

// 修正案1: fs/promises を使用
import fs from 'fs-extra';
import { readdir } from 'fs/promises';
const items = await readdir(sourcePath, { withFileTypes: true });

// 修正案2: fs-extra の readdir を直接使用
import { readdir } from 'fs-extra';
const items = await readdir(sourcePath, { withFileTypes: true });
```

### 2. エラー時の処理停止

```typescript
private async generateScaffold(): Promise<void> {
  const spinner = ora('スケルトンを生成中...').start();
  const targetPath = path.resolve(this.options.targetPath);

  try {
    await fs.ensureDir(targetPath);
    
    // 重要: エラーが発生したら即座に停止
    await this.copyProjectStructure(targetPath);
    
    if (this.options.includeProjectManagement) {
      await this.copyProjectManagementFiles(targetPath);
    }
    
    // ドキュメント処理は最後に
    await this.processDocumentTemplates(targetPath);
    
    spinner.succeed('スケルトンの生成が完了しました');
  } catch (error) {
    spinner.fail('スケルトンの生成に失敗しました');
    console.error(chalk.red('\n❌ エラーの詳細:'));
    console.error(chalk.red(error.message));
    
    // クリーンアップ（部分的に生成されたファイルを削除）
    if (await fs.pathExists(targetPath)) {
      console.log(chalk.yellow('\n🧹 生成途中のファイルをクリーンアップしています...'));
      await fs.remove(targetPath);
    }
    
    throw error;
  }
}
```

### 3. 生成結果の検証

```typescript
private async verifyGeneratedProject(targetPath: string): Promise<void> {
  const projectTypeFiles = {
    'mcp-server': ['package.json', 'tsconfig.json', 'src/index.ts'],
    'cli-rust': ['Cargo.toml', 'src/main.rs'],
    'web-nextjs': ['package.json', 'tsconfig.json', 'pages/index.tsx'],
    'api-fastapi': ['requirements.txt', 'main.py']
  };
  
  const requiredFiles = projectTypeFiles[this.options.projectType];
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!(await fs.pathExists(path.join(targetPath, file)))) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    throw new Error(
      `プロジェクト生成が不完全です。以下のファイルが見つかりません:\n` +
      missingFiles.map(f => `  - ${f}`).join('\n')
    );
  }
}
```

## ✅ 完了条件

- [ ] fs-extra のインポートエラーが解消される
- [ ] プロジェクト生成時にすべての必要なファイルがコピーされる
- [ ] エラー発生時に適切なエラーメッセージが表示される
- [ ] 部分的に生成されたファイルがクリーンアップされる
- [ ] E2Eテストで検証される

## 🔗 関連Issue

- #16 エラーハンドリング・型安全性の向上（中長期的な改善）
- #17 実装計画（包括的な改善プロジェクト）