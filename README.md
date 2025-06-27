# AI Driven Dev Starter Kit

AI駆動開発のための包括的なテンプレート集。**PRDベース開発フロー**により、プロダクト要件定義から実装まで、AIエージェントとシームレスに協働できます。

## 🚀 主要機能

### プロジェクトテンプレート
- **CLI（Rust）** - コマンドラインツール開発
- **Web（Next.js）** - フルスタックWebアプリケーション
- **API（FastAPI）** - RESTful API開発
- **MCP Server** - Model Context Protocol サーバー開発

### 開発プロンプト
- **Basic Development** - 小規模プロジェクト・チーム向け
- **Startup Development** - スタートアップ向け
- **Enterprise Development** - エンタープライズ向け
- **Open Source Development** - オープンソース向け

### 支援ツール
- **Coding Agents** - Claude Code、GitHub Copilot、Cursor設定
- **Architectures** - AWS Serverless、マイクロサービス等
- **Development Tools** - ESLint、Prettier、Jest、CI/CD設定

## 🎯 PRDベース開発フロー

### Step 1: プロジェクト生成

```bash
cd scripts
npm install
npm run scaffold
```

プロジェクトタイプを選択：
- **MCP Server** - Model Context Protocol サーバー
- **Web (Next.js)** - フルスタックWebアプリケーション
- **API (FastAPI)** - RESTful API
- **CLI (Rust)** - コマンドラインツール

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

### 開発者向け
- `docs/development/` - 開発者・コーディングエージェント向けドキュメント
- `docs/architecture/` - アーキテクチャ・技術ドキュメント

### プロジェクト概要
- `docs/project/` - プロジェクト概要・ビジネス向けドキュメント

### テンプレート
- `templates/` - scaffold用テンプレート集

## 🤝 コントリビューション

このプロジェクトへの貢献を歓迎します。詳細は `CONTRIBUTING.md` を参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🆘 サポート

問題や質問がある場合は、GitHubのIssuesでお知らせください。

---

**AI Driven Dev Starter Kit** - AIを活用した効率的な開発環境を構築しましょう！ 