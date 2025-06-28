---
name: Add Transaction and Rollback
about: スケルトン生成のトランザクション処理とロールバック機能
title: "[機能追加] スケルトン生成のトランザクション処理とロールバック機能"
labels: enhancement, reliability
assignees: ''

---

## 📋 概要

スケルトン生成処理にトランザクション機能を追加し、エラー発生時に部分的に生成されたファイルを自動的にロールバックする機能を実装します。

## 🎯 目的

- 生成処理の原子性（Atomicity）を保証
- 中途半端な状態のプロジェクトが残らないようにする
- エラー時の復旧を容易にする

## 💡 提案する実装

### 1. ScaffoldTransaction クラス

```typescript
export class ScaffoldTransaction {
  private steps: TransactionStep[] = [];
  private completedSteps: TransactionStep[] = [];
  private targetPath: string;
  
  constructor(targetPath: string) {
    this.targetPath = targetPath;
  }
  
  addStep(step: TransactionStep): void {
    this.steps.push(step);
  }
  
  async execute(): Promise<void> {
    console.log(chalk.blue(`🔄 ${this.steps.length}個のステップを実行します...`));
    
    for (const step of this.steps) {
      try {
        console.log(chalk.gray(`  ▶ ${step.name}...`));
        await step.execute();
        this.completedSteps.push(step);
        console.log(chalk.green(`  ✓ ${step.name}`));
      } catch (error) {
        console.error(chalk.red(`  ✗ ${step.name}: ${error.message}`));
        await this.rollback();
        throw new Error(`ステップ「${step.name}」で失敗: ${error.message}`);
      }
    }
  }
  
  private async rollback(): Promise<void> {
    console.log(chalk.yellow('\n⏮ ロールバックを開始します...'));
    
    // 逆順でロールバック
    for (const step of this.completedSteps.reverse()) {
      try {
        if (step.rollback) {
          console.log(chalk.gray(`  ↩ ${step.name}をロールバック...`));
          await step.rollback();
        }
      } catch (error) {
        console.error(chalk.red(`  ⚠ ロールバック失敗: ${step.name}`));
      }
    }
    
    // 最終的にターゲットディレクトリを削除
    if (await fs.pathExists(this.targetPath)) {
      await fs.remove(this.targetPath);
      console.log(chalk.yellow('  🗑 ターゲットディレクトリを削除しました'));
    }
  }
}

interface TransactionStep {
  name: string;
  execute: () => Promise<void>;
  rollback?: () => Promise<void>;
}
```

### 2. スケルトン生成への適用

```typescript
private async generateScaffold(): Promise<void> {
  const spinner = ora('スケルトンを生成中...').start();
  const targetPath = path.resolve(this.options.targetPath);
  
  const transaction = new ScaffoldTransaction(targetPath);
  
  // ステップを登録
  transaction.addStep({
    name: 'ディレクトリ作成',
    execute: async () => {
      await fs.ensureDir(targetPath);
    }
  });
  
  transaction.addStep({
    name: 'プロジェクト構造のコピー',
    execute: async () => {
      await this.copyProjectStructure(targetPath);
    },
    rollback: async () => {
      // 個別のファイルを削除する必要がある場合
      const copiedFiles = await this.getProjectFiles();
      for (const file of copiedFiles) {
        await fs.remove(path.join(targetPath, file));
      }
    }
  });
  
  if (this.options.includeProjectManagement) {
    transaction.addStep({
      name: 'プロジェクト管理ファイルのコピー',
      execute: async () => {
        await this.copyProjectManagementFiles(targetPath);
      }
    });
  }
  
  transaction.addStep({
    name: 'ドキュメントテンプレートの処理',
    execute: async () => {
      await this.processDocumentTemplates(targetPath);
    }
  });
  
  transaction.addStep({
    name: '生成結果の検証',
    execute: async () => {
      await this.verifyGeneratedProject(targetPath);
    }
  });
  
  try {
    await transaction.execute();
    spinner.succeed('スケルトンの生成が完了しました');
  } catch (error) {
    spinner.fail('スケルトンの生成に失敗しました');
    throw error;
  }
}
```

### 3. 状態管理の追加

```typescript
export class GenerationState {
  private state: Map<string, any> = new Map();
  
  set(key: string, value: any): void {
    this.state.set(key, value);
  }
  
  get<T>(key: string): T | undefined {
    return this.state.get(key);
  }
  
  clear(): void {
    this.state.clear();
  }
  
  // 生成されたファイルのトラッキング
  addGeneratedFile(filePath: string): void {
    const files = this.get<string[]>('generatedFiles') || [];
    files.push(filePath);
    this.set('generatedFiles', files);
  }
  
  getGeneratedFiles(): string[] {
    return this.get<string[]>('generatedFiles') || [];
  }
}
```

## 📊 期待される効果

1. **信頼性の向上**: 部分的な生成物が残らない
2. **デバッグの容易化**: どのステップで失敗したかが明確
3. **ユーザー体験の改善**: エラー時のクリーンな状態維持

## 🔗 関連Issue

- #16 エラーハンドリング・型安全性の向上
- #18 fs-extra インポートエラーの緊急修正

## ✅ 完了条件

- [ ] ScaffoldTransaction クラスの実装
- [ ] すべての生成ステップのトランザクション化
- [ ] ロールバック機能の実装とテスト
- [ ] エラー時の動作確認
- [ ] ドキュメントの更新