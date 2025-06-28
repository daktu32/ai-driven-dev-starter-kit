---
name: Variable Substitution Strategy
about: 変数置換戦略の改善とプレースホルダー管理
title: "[改善] 3層構造の変数置換戦略とガイダンス付きプレースホルダー"
labels: enhancement, documentation
assignees: ''

---

## 📋 概要

現在のテンプレート生成では変数置換が不完全で、大量のプレースホルダー（`[VARIABLE_NAME]`）がそのまま残っている状態です。適切な変数置換戦略を実装し、ユーザーにとって分かりやすいテンプレートシステムを構築します。

## 🎯 問題の現状

### 発見された問題
1. **未置換プレースホルダーの大量残存**
   ```markdown
   [KPI_1], [TARGET_1], [MEASUREMENT_1]
   [TIME_CONSTRAINT], [BUDGET_CONSTRAINT]
   [MVP_FEATURE_1_DESC], [USER_PERSONA_1]
   ```

2. **変数の分類が不明確**
   - 技術的な情報（自動設定可能）
   - ビジネス情報（ユーザー入力必須）
   - デフォルト値（置換可能だがカスタマイズ推奨）

3. **ユーザーガイダンスの不足**
   - どの変数を変更すべきかが不明
   - 記入例やヒントがない

## 💡 提案する解決策

### 3層構造の変数戦略

#### Layer 1: 技術的変数（完全自動置換）✅
```typescript
const techVariables = {
  PROJECT_NAME: config.projectName,                    // "mcp-tabelog-search"
  PROJECT_CLASS_NAME: toClassName(config.projectName), // "McpTabelogSearch"
  PROJECT_TYPE: config.projectType,                   // "mcp-server"
  TECH_STACK_FRONTEND: config.techStack.frontend,     // "N/A"
  TECH_STACK_BACKEND: config.techStack.backend,       // "Node.js/TypeScript"
  CREATION_DATE: new Date().toISOString().split('T')[0],
  AUTHOR: extractUsername(config.repositoryUrl),
  REPO_URL: config.repositoryUrl
};
```

#### Layer 2: デフォルト値変数（置換+カスタマイズ可能）⚙️
```typescript
const defaultVariables = {
  // 性能目標
  AVAILABILITY_TARGET: "99.9%",
  RESPONSE_TIME_TARGET: "2秒以内",
  ERROR_RATE_TARGET: "0.1%以下",
  
  // 品質基準
  TEST_COVERAGE_TARGET: "80%以上",
  CODE_QUALITY_SCORE: "A以上",
  
  // 運用基準
  UPTIME_TARGET: "99.9%",
  RECOVERY_TIME: "30分以内",
  
  // プロジェクトタイプ別デフォルト
  ...getProjectTypeDefaults(config.projectType)
};
```

#### Layer 3: ガイダンス付きプレースホルダー（ユーザー記入）📝
```markdown
<!-- 明確な指示とコメント付き -->
**主要KPI**: [YOUR_PRIMARY_KPI]
<!-- 例: 月間アクティブユーザー数、処理成功率、売上高 -->

**目標値**: [YOUR_TARGET_VALUE]
<!-- 例: 1000ユーザー/月、99.5%、月額50万円 -->

**制約条件**: [YOUR_CONSTRAINTS]
<!-- 例: 開発期間6ヶ月、予算500万円、レガシーシステム連携必須 -->
```

## 🏗️ 実装内容

### 1. DocumentTemplateProcessor の拡張

```typescript
export class DocumentTemplateProcessor {
  private createDocumentVariables(config: ProjectConfig): DocumentVariables {
    return {
      // Layer 1: 技術的変数（完全自動置換）
      ...this.createTechnicalVariables(config),
      
      // Layer 2: デフォルト値変数
      ...this.createDefaultVariables(config),
      
      // Layer 3: ガイダンス付きプレースホルダー
      ...this.createGuidedPlaceholders(config)
    };
  }
  
  private createTechnicalVariables(config: ProjectConfig) {
    return {
      PROJECT_NAME: config.projectName,
      PROJECT_CLASS_NAME: this.toClassName(config.projectName),
      PROJECT_TYPE: config.projectType,
      TECH_STACK_FRONTEND: config.techStack.frontend || 'N/A',
      TECH_STACK_BACKEND: config.techStack.backend || 'TBD',
      CREATION_DATE: new Date().toISOString().split('T')[0],
      AUTHOR: this.extractUsername(config.repositoryUrl),
      REPO_URL: config.repositoryUrl,
      GITHUB_ISSUES_URL: `${config.repositoryUrl}/issues`,
      GITHUB_DISCUSSIONS_URL: `${config.repositoryUrl}/discussions`
    };
  }
  
  private createDefaultVariables(config: ProjectConfig) {
    const projectDefaults = this.getProjectTypeDefaults(config.projectType);
    
    return {
      // 性能目標
      AVAILABILITY_TARGET: "99.9%",
      RESPONSE_TIME_TARGET: "2秒以内",
      ERROR_RATE_TARGET: "0.1%以下",
      
      // 品質基準
      TEST_COVERAGE_TARGET: "80%以上",
      CODE_QUALITY_SCORE: "A以上",
      
      // 運用基準
      UPTIME_TARGET: "99.9%",
      RECOVERY_TIME: "30分以内",
      BACKUP_FREQUENCY: "日次",
      
      // プロジェクトタイプ固有
      ...projectDefaults.performanceTargets,
      ...projectDefaults.qualityStandards
    };
  }
  
  private createGuidedPlaceholders(config: ProjectConfig) {
    // ガイダンス付きプレースホルダーの生成
    const examples = this.getExamplesByProjectType(config.projectType);
    
    return {
      YOUR_PRIMARY_KPI: `[YOUR_PRIMARY_KPI] <!-- 例: ${examples.kpi} -->`,
      YOUR_TARGET_VALUE: `[YOUR_TARGET_VALUE] <!-- 例: ${examples.target} -->`,
      YOUR_CONSTRAINTS: `[YOUR_CONSTRAINTS] <!-- 例: ${examples.constraints} -->`,
      YOUR_USER_PERSONA: `[YOUR_USER_PERSONA] <!-- 例: ${examples.persona} -->`,
      YOUR_BUSINESS_GOAL: `[YOUR_BUSINESS_GOAL] <!-- 例: ${examples.businessGoal} -->`
    };
  }
}
```

### 2. プロジェクトタイプ別デフォルト値

```typescript
private getProjectTypeDefaults(projectType: string) {
  const defaults = {
    'mcp-server': {
      performanceTargets: {
        MAX_CONCURRENT_CONNECTIONS: "1000",
        TOOL_EXECUTION_TIMEOUT: "30秒",
        RESOURCE_FETCH_TIMEOUT: "10秒"
      },
      qualityStandards: {
        MCP_PROTOCOL_COMPLIANCE: "100%",
        TOOL_SUCCESS_RATE: "99%以上",
        ERROR_LOGGING_COVERAGE: "全エラー"
      },
      examples: {
        kpi: "ツール呼び出し成功率",
        target: "99.5%以上",
        constraints: "MCP仕様準拠必須、JSON-RPC 2.0対応",
        persona: "AI開発者、データサイエンティスト",
        businessGoal: "AI開発効率の向上"
      }
    },
    'cli-rust': {
      performanceTargets: {
        STARTUP_TIME: "100ms以内",
        MEMORY_USAGE: "10MB以下",
        BINARY_SIZE: "20MB以下"
      },
      examples: {
        kpi: "実行速度、メモリ使用量",
        target: "従来ツール比50%高速化",
        constraints: "クロスプラットフォーム対応必須",
        persona: "開発者、システム管理者",
        businessGoal: "開発・運用作業の効率化"
      }
    },
    // 他のプロジェクトタイプも同様...
  };
  
  return defaults[projectType] || defaults['mcp-server'];
}
```

### 3. テンプレート改善例

#### 改善前:
```markdown
## 2.2 成功指標（KPI）
| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| [KPI_1] | [TARGET_1] | [MEASUREMENT_1] |
| [KPI_2] | [TARGET_2] | [MEASUREMENT_2] |
```

#### 改善後:
```markdown
## 2.2 成功指標（KPI）

### 🎯 カスタマイズガイド
以下の表の `[YOUR_XXX]` 部分をあなたのプロジェクトに合わせて編集してください。

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| ツール呼び出し成功率 | 99.5%以上 | アプリケーションログ |
| [YOUR_CUSTOM_KPI] | [YOUR_TARGET] | [YOUR_MEASUREMENT] |
<!-- 例: 月間アクティブユーザー数 | 1000人 | Google Analytics -->

### 📊 技術的KPI（自動設定済み）
| 指標 | 目標値 | 現在値 |
|------|--------|--------|
| システム稼働率 | 99.9% | 測定中 |
| レスポンス時間 | 2秒以内 | 測定中 |
| テストカバレッジ | 80%以上 | 測定中 |
```

### 4. ガイダンスドキュメントの追加

新規ファイル: `docs/CUSTOMIZATION-GUIDE.md`

```markdown
# 🎨 プロジェクトカスタマイズガイド

## このドキュメントについて
mcp-tabelog-searchプロジェクトをあなたの要件に合わせてカスタマイズするためのガイドです。

## ✅ 既に設定済みの項目
- プロジェクト名: mcp-tabelog-search  
- 技術スタック: Node.js/TypeScript (MCP Server)
- 基本的な性能目標: 99.9%稼働率、2秒以内応答
- 品質基準: テストカバレッジ80%以上

## 📝 あなたが記入する項目

### PRD.md で編集が必要な箇所
1. **ビジネス目標** (セクション 2.2)
   - `[YOUR_PRIMARY_KPI]` → 例: "ツール利用者満足度"
   - `[YOUR_TARGET_VALUE]` → 例: "4.5/5.0以上"

2. **制約条件** (セクション 2.3)  
   - `[YOUR_CONSTRAINTS]` → 例: "リリースまで3ヶ月、予算100万円"

3. **ユーザーストーリー** (セクション 5)
   - `[YOUR_USER_PERSONA]` → 例: "データサイエンティスト"
```

## 📊 期待される効果

1. **即座の動作**: 生成直後から技術的に完整なプロジェクト
2. **明確なカスタマイズポイント**: 何を変更すべきかが一目瞭然
3. **実用的なデフォルト値**: そのまま使えるベースライン
4. **段階的カスタマイズ**: 必要に応じて詳細化可能

## 🔗 関連Issue

- #18 fs-extra インポートエラーの修正（完了）
- #19 トランザクション処理とロールバック機能
- #20 生成結果の完全性検証とE2Eテスト

## ✅ 完了条件

- [ ] 3層構造の変数置換システム実装
- [ ] プロジェクトタイプ別デフォルト値の定義
- [ ] ガイダンス付きプレースホルダーの実装
- [ ] CUSTOMIZATION-GUIDE.md の作成
- [ ] 全プロジェクトタイプでの動作確認
- [ ] ドキュメントテンプレートの改善