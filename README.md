# AI Driven Dev Starter Kit

AI駆動開発を始めるためのシンプルなテンプレート集です。Cursor での使用に最適化されています。

## 機能

### プラグインベースの構成
- 新しいプロジェクトタイプを追加できます
- プラグインの基本的な検証機能があります
- コミュニティからの貢献を受け入れます

### 4つのプロジェクトタイプ
- **MCP Server** - Model Context Protocol サーバー
- **CLI（Rust）** - コマンドラインツール
- **Web（Next.js）** - Webアプリケーション  
- **API（FastAPI）** - REST API

### PRDベースの開発
- プロダクト要件ドキュメント(PRD)から始めます
- 要件に応じてアーキテクチャを提案します
- 要件が変わったら再調整できます

### 基本的な品質管理
- セキュリティ・パフォーマンス・コード品質をチェックします
- プラグインの動作を監視できます
- 開発者向けのドキュメントを用意しています

## 使い方

### Step 1: プロジェクト生成

```bash
npm run scaffold:plugin
```

プロジェクトタイプを選択：
- **MCP Server** - Model Context Protocol サーバー（TypeScript + Node.js）
- **Web (Next.js)** - フルスタックWebアプリケーション（React + TypeScript）
- **API (FastAPI)** - RESTful API（Python + FastAPI）
- **CLI (Rust)** - 高性能コマンドラインツール（Rust + Clap）

### Step 2: PRD.md完成

生成されたプロジェクトの `PRD.md` に要件を詳細記述：

```markdown
# PRD (Product Requirements Document)

## 1. プロダクト概要
- プロダクトビジョン・ミッション
- ターゲットユーザー・ペルソナ

## 2. 機能要件
- MVP機能 vs 将来機能
- ユーザーストーリー
- 詳細仕様

## 3. 技術要件
- パフォーマンス・セキュリティ
- アーキテクチャ方針
- 技術制約
```

### Step 3: Claude Code起動

プロジェクトディレクトリで Claude Code を起動し、以下を指示：

```
PRD.mdの内容に基づいてプロジェクトのスケルトンをアレンジして
```

### Step 4: Claude Codeで開発

Claudeがサポートします：
- PRD分析と要件整理
- アーキテクチャ設計の提案
- ファイル構造と基本実装の生成
- 継続開発のガイダンス

## カスタマイズ

生成されたプロジェクトの以下のファイルを更新してください：

- `README.md` - プロジェクト名と説明
- `package.json` / `Cargo.toml` - プロジェクト情報
- 各種設定ファイル - 必要に応じて調整

## 開発の流れ

```bash
# 1. プロジェクト生成
npm run scaffold:plugin

# 2. 生成されたプロジェクトに移動
cd your-project-name

# 3. 依存関係インストール
npm install  # または cargo build

# 4. 開発開始
npm run dev  # または cargo run
```

## ドキュメント

### Cursor での使用
- [`docs/ai-agents/cursor-guide.md`](docs/ai-agents/cursor-guide.md) - Cursor での詳細な使用方法

### プラグイン開発
- [`docs/architecture/PLUGIN-SYSTEM.md`](docs/architecture/PLUGIN-SYSTEM.md) - プラグインシステムについて
- [`docs/community/PLUGIN-DEVELOPMENT-GUIDE.md`](docs/community/PLUGIN-DEVELOPMENT-GUIDE.md) - プラグインの作り方
- [`docs/examples/plugin-development-example.md`](docs/examples/plugin-development-example.md) - React Native プラグインの例
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - 貢献方法

## プラグイン開発

新しいプロジェクトタイプのプラグインを作ることができます。

```bash
# プラグイン開発ガイドを確認
cat docs/community/PLUGIN-DEVELOPMENT-GUIDE.md
```

### あると嬉しいプラグイン
- **Frontend**: Vue.js, Angular, Svelte
- **Mobile**: Flutter, Ionic, React Native
- **Backend**: Spring Boot, Django, Laravel
- **DevOps**: Terraform, Kubernetes, Docker Compose
- **Database**: PostgreSQL, MongoDB, Redis

## 貢献について

プラグイン開発、バグ修正、ドキュメント改善など、お気軽にご協力ください。詳細は [`CONTRIBUTING.md`](CONTRIBUTING.md) をご覧ください。

## ライセンス

MITライセンスです。

## サポート

- バグ報告・機能要求: [GitHub Issues](https://github.com/daktu32/ai-driven-dev-starter-kit/issues)
- 質問・アイデア交換: [GitHub Discussions](https://github.com/daktu32/ai-driven-dev-starter-kit/discussions) 