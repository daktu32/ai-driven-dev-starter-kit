# AI Driven Dev Starter Kit

AI駆動開発のための**エンタープライズレベル**プラグインシステム。**PRDベース開発フロー**により、プロダクト要件定義から実装まで、AIエージェントとシームレスに協働できます。

## ✨ v1.0 完成機能

### 🔌 プラグインベースアーキテクチャ
- **拡張可能設計** - 新しいプロジェクトタイプを簡単追加
- **品質保証システム** - 自動検証・認証・パフォーマンス監視
- **コミュニティエコシステム** - プラグイン共有・貢献受け入れ

### 📋 コアプラグイン（4種類）
- **MCP Server** - Model Context Protocol サーバー開発
- **CLI（Rust）** - 高性能コマンドラインツール
- **Web（Next.js）** - フルスタックWebアプリケーション  
- **API（FastAPI）** - RESTful API・マイクロサービス

### 🎯 PRD駆動開発フロー
- **構造化要件定義** - プロダクト要件ドキュメント(PRD)ベース
- **AI自動最適化** - 要件に基づく最適なアーキテクチャ提案
- **継続的改善** - 要件変更に応じた自動再最適化

### 🛡️ エンタープライズ品質
- **自動品質検証** - セキュリティ・パフォーマンス・コード品質
- **リアルタイム監視** - プラグイン動作・パフォーマンス追跡  
- **包括的ドキュメント** - 開発者・ユーザー向け完備

## 🎯 PRDベース開発フロー

### Step 1: プロジェクト生成

**プラグインベース生成**（推奨）:
```bash
npm run scaffold:plugin
```

**従来の生成方法**:
```bash
cd scripts
npm install
npm run scaffold
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

### Step 4: 自動最適化

Claudeが以下を自動実行：
- **PRD分析**: 要件の理解・優先順位付け
- **アーキテクチャ設計**: 技術スタック最適化
- **スケルトン生成**: ファイル構造・基本実装
- **開発ガイダンス**: 継続開発の指針提供

## ✨ PRDベース開発フローの利点

### 🎯 要件の明確化
- **プロダクトビジョンの共有**: チーム全体で一貫した理解
- **MVP機能の特定**: 優先度に基づく段階的開発
- **成功指標の設定**: 測定可能なKPIの定義

### 🤖 AI協働の最適化
- **コンテキスト理解**: AIが要件を深く理解
- **自動アーキテクチャ設計**: 要件に最適な技術選択
- **実装ガイダンス**: プロダクト成功を目指した戦略的判断

### 🚀 開発効率の向上
- **環境構築時間削減**: 即座に実装開始可能
- **設計ミス防止**: 要件に基づく一貫したアーキテクチャ
- **品質保証**: 最初から適切なテスト・セキュリティ考慮

### 📈 継続的改善
- **フィードバック統合**: PRD更新→自動再最適化
- **スケール対応**: 成長に応じたアーキテクチャ進化
- **ドキュメント同期**: 要件と実装の整合性保持

## 📋 従来セットアップ手順（レガシー）

<details>
<summary>従来の手動セットアップ手順（非推奨）</summary>

### レガシーセットアップ
- 開発プロンプトの調整
- 技術スタックの詳細設定
- CI/CDパイプラインの設定

</details>

## 🛠️ カスタマイゼーションガイド

### プロジェクト情報の更新

以下のファイルでプロジェクト固有の情報に置き換えてください：

```markdown
# README.md
- プロジェクトタイトルとdescription
- セットアップ手順をプロジェクトに合わせて調整
- リポジトリURLの更新

# package.json / Cargo.toml
- プロジェクト名とバージョン
- 依存関係の調整
- スクリプトの設定
```

### 技術スタックの定義

プロジェクトに適した技術を選択：

```markdown
# フレームワーク
- CLI: Rust + clap
- Web: Next.js + TypeScript + Tailwind CSS
- API: FastAPI + SQLAlchemy + Pydantic

# 開発ツール
- ESLint + Prettier
- Jest + Testing Library
- GitHub Actions
```

### インフラストラクチャの設定

プロジェクトの規模に応じてインフラを選択：

- **小規模**: 単一サーバー、Vercel、Netlify
- **中規模**: AWS、GCP、Azure
- **大規模**: マイクロサービス、Kubernetes

## 📁 プロジェクト構造

### 生成されるプロジェクトの例（CLI Rust）

```
project-name/
├── src/
│   ├── main.rs              # エントリーポイント
│   ├── lib.rs               # ライブラリエントリーポイント
│   ├── cli.rs               # CLI引数処理
│   ├── commands/            # サブコマンド
│   ├── config/              # 設定関連
│   ├── utils/               # ユーティリティ
│   └── error.rs             # エラーハンドリング
├── tests/                   # 統合テスト
├── examples/                # 使用例
├── docs/                    # ドキュメント
├── Cargo.toml               # 依存関係
├── .gitignore
└── README.md
```

### 生成されるプロジェクトの例（Web Next.js）

```
project-name/
├── src/
│   ├── app/                 # App Router
│   ├── components/          # 再利用可能コンポーネント
│   ├── lib/                 # ユーティリティ・ライブラリ
│   ├── hooks/               # カスタムフック
│   ├── types/               # TypeScript型定義
│   └── styles/              # スタイルファイル
├── public/                  # 静的ファイル
├── tests/                   # テストファイル
├── docs/                    # ドキュメント
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## 🔧 開発ワークフロー

### 1. プロジェクト初期化
```bash
# project-setupでプロジェクトカスタマイズ
cd scripts
npm run setup

# または、scaffold-generatorで新規プロジェクト生成
npm run scaffold

# 生成されたプロジェクトに移動
cd your-project-name

# 依存関係インストール
npm install  # または cargo build
```

### 2. 開発開始
```bash
# 開発サーバー起動
npm run dev  # または cargo run

# テスト実行
npm test     # または cargo test

# コード品質チェック
npm run lint # または cargo clippy
```

### 3. デプロイ
```bash
# ビルド
npm run build # または cargo build --release

# デプロイ
npm run deploy # または cargo install
```

## 📚 ドキュメント

### 🏗️ アーキテクチャ
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) - システムアーキテクチャ全体
- [`docs/architecture/PLUGIN-SYSTEM.md`](docs/architecture/PLUGIN-SYSTEM.md) - プラグインシステム設計
- [`docs/architecture/PLUGIN-REGISTRY.md`](docs/architecture/PLUGIN-REGISTRY.md) - プラグインレジストリ設計

### 👥 開発者向け
- [`docs/development/PROGRESS.md`](docs/development/PROGRESS.md) - 開発進捗・完了機能
- [`docs/development/DEVELOPMENT_ROADMAP.md`](docs/development/DEVELOPMENT_ROADMAP.md) - 開発ロードマップ
- [`docs/community/PLUGIN-DEVELOPMENT-GUIDE.md`](docs/community/PLUGIN-DEVELOPMENT-GUIDE.md) - プラグイン開発ガイド

### 📖 サンプル・例
- [`docs/examples/plugin-development-example.md`](docs/examples/plugin-development-example.md) - React Native プラグイン開発例

### 🔌 プラグイン開発
- [`CONTRIBUTING.md`](CONTRIBUTING.md) - コントリビューションガイド

## 🚀 プラグイン開発

新しいプロジェクトタイプのプラグインを開発して、エコシステムに貢献できます：

### クイックスタート
```bash
# プラグイン開発ガイドを確認
cat docs/community/PLUGIN-DEVELOPMENT-GUIDE.md

# React Native プラグイン例を参照
cat docs/examples/plugin-development-example.md
```

### 求められているプラグイン
- **Frontend**: Vue.js, Angular, Svelte
- **Mobile**: Flutter, Ionic, React Native (Windows)
- **Backend**: Spring Boot, Django, Laravel
- **DevOps**: Terraform, Kubernetes, Docker Compose
- **Database**: PostgreSQL, MongoDB, Redis

## 🎯 プロジェクト状況

### ✅ 完成済み（Phase 1-5）
- プラグインベースアーキテクチャ
- PRD駆動開発フロー
- 品質保証・監視システム
- コミュニティエコシステム

### 🚧 今後の展開（各生成プロジェクト内）
- **Phase 6+**: 高度なAI統合機能
- AIエージェント間協働
- 自動テスト・デプロイパイプライン

## 🤝 コントリビューション

プラグイン開発、バグ修正、ドキュメント改善など、あらゆる貢献を歓迎します。

詳細は [`CONTRIBUTING.md`](CONTRIBUTING.md) と [`docs/community/PLUGIN-DEVELOPMENT-GUIDE.md`](docs/community/PLUGIN-DEVELOPMENT-GUIDE.md) を参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

- **Issues**: バグ報告・機能要求は [GitHub Issues](https://github.com/daktu32/ai-driven-dev-starter-kit/issues)
- **Discussions**: 質問・アイデア交換は [GitHub Discussions](https://github.com/daktu32/ai-driven-dev-starter-kit/discussions)

---

**AI Driven Dev Starter Kit v1.0** - エンタープライズレベルのAI駆動開発プラットフォーム 🚀 