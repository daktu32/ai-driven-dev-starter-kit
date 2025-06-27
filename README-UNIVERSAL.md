# AI Driven Dev Starter Kit - Universal AI Agent Guide

様々なAIエージェント（Cursor、GitHub Copilot、ChatGPT、V0、Bolt.new等）で利用可能なテンプレート集です。

## 対応AIエージェント

### 💯 完全対応
- **Cursor** - VSCode拡張として完全互換
- **GitHub Copilot** - コード生成支援として利用可能
- **ChatGPT (Code Interpreter)** - テンプレート活用可能

### ⭐ 部分対応
- **V0 (Vercel)** - Webプロジェクトテンプレート利用可能
- **Bolt.new** - プロジェクト構造テンプレート利用可能
- **Replit AI** - 環境設定追加で利用可能

## 使い方

### 1. プロジェクト生成

```bash
# プラグインベース（推奨）
npm run scaffold:plugin

# 従来方式
cd scripts && npm install && npm run scaffold
```

### 2. プロジェクトタイプ選択

- **MCP Server** - Model Context Protocol サーバー
- **CLI (Rust)** - コマンドラインツール
- **Web (Next.js)** - Webアプリケーション  
- **API (FastAPI)** - REST API

### 3. PRD.md作成

生成されたプロジェクトの `PRD.md` に要件を記述：

```markdown
# PRD (Product Requirements Document)

## 1. プロダクト概要
- ビジョン・ミッション
- ターゲットユーザー

## 2. 機能要件
- MVP機能
- ユーザーストーリー

## 3. 技術要件
- パフォーマンス要件
- アーキテクチャ方針
```

### 4. AIエージェントで開発開始

**共通の指示:**
```
PRD.mdの内容に基づいてプロジェクトのスケルトンを生成してください
```

## AIエージェント別ガイド

### Cursor の場合

1. プロジェクトをCursorで開く
2. Cursor Composer（⌘⇧I）を起動
3. PRDファイルを参照して開発指示

```
@PRD.md の内容に基づいてプロジェクトを実装してください
```

### GitHub Copilot の場合

1. VS Codeでプロジェクトを開く
2. PRD.mdを参照しながらコード作成
3. Copilot Chatで段階的に実装

```
/fix PRD.mdの要件に基づいてこのファイルを実装してください
```

### ChatGPT の場合

1. PRD.mdの内容をコピー
2. 以下のプロンプトで開始：

```
以下のPRD（プロダクト要件定義）に基づいて、[プロジェクトタイプ]のプロジェクトを実装してください。

[PRD.mdの内容をペースト]

まず、アーキテクチャ設計から始めてください。
```

### V0 (Vercel) の場合

1. Next.jsプロジェクトを選択
2. PRDの機能要件からUIコンポーネント設計
3. 段階的にページを実装

```
以下の要件に基づいてReactコンポーネントを作成してください：
[機能要件の一部をペースト]
```

### Bolt.new の場合

1. プロジェクトテンプレートを新規作成
2. 必要なファイル構造を手動作成
3. PRDに基づいて実装指示

```
以下のプロジェクト構造で開発を始めてください：
[templates/project-structures/の内容を参考]
```

### Replit AI の場合

1. 新規Replを作成
2. 言語を選択（TypeScript/Python/Rust）
3. プロジェクト構造を手動作成

```
以下のPRDに基づいてプロジェクトを実装してください：
[PRD.mdの内容]
```

## テンプレートファイル

### 利用可能なテンプレート

- `templates/project-structures/` - プロジェクト構造
- `templates/prompts/` - AIプロンプト集
- `templates/architectures/` - アーキテクチャ指針
- `templates/examples/` - PRD例

### プロンプトテンプレート

各AIエージェント用に最適化されたプロンプトを用意：

- `templates/prompts/basic-development.md` - 汎用開発プロンプト
- `templates/prompts/mcp-server-development.md` - MCPサーバー開発
- `templates/prompts/prd-driven-development.md` - PRD駆動開発

## カスタマイズ

生成されたプロジェクトの以下を更新：

- `README.md` - プロジェクト情報
- `package.json` / `Cargo.toml` - 依存関係
- 各種設定ファイル

## プラグイン開発

新しいプロジェクトタイプのプラグインを作成可能：

```bash
# プラグイン開発ガイドを確認
cat docs/community/PLUGIN-DEVELOPMENT-GUIDE.md
```

### 求められているプラグイン

- **Frontend**: Vue.js, Angular, Svelte
- **Mobile**: Flutter, Ionic, React Native
- **Backend**: Spring Boot, Django, Laravel
- **DevOps**: Terraform, Kubernetes, Docker Compose

## トラブルシューティング

### 共通の問題

**Q: AIエージェントがテンプレートを認識しない**
A: PRD.mdの内容を直接コピー&ペーストして使用してください

**Q: プロジェクト構造が複雑すぎる**
A: `templates/project-structures/minimal/` のシンプル版を使用してください

**Q: 特定のAIエージェントで動作しない機能がある**
A: そのAIエージェントの制限事項を確認し、手動で適応してください

### AIエージェント固有の制限

- **V0**: バックエンド機能は制限あり
- **Bolt.new**: ローカルファイルアクセス制限
- **ChatGPT**: ファイル操作は手動でコピー&ペースト

## 貢献方法

- プラグイン開発
- AIエージェント対応改善
- ドキュメント修正
- バグ報告

詳細: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## ライセンス

MITライセンス

---

**AI Driven Dev Starter Kit** - 様々なAIエージェントで使える開発テンプレート集