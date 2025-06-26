# AI Driven Dev Starter Kit

AI Driven Dev Starter Kit（AI駆動開発スターターキット）は、AIエージェントや自律的な開発のための包括的なスターターキットです。AIエージェント協調パターンやTDD、進捗管理、アーキテクチャ設計、AWSインフラ雛形などを含みます。

## 概要

このスターターキットは以下を提供します：
- AIエージェント向け開発ガイドライン
- 進捗管理テンプレート
- アーキテクチャドキュメントテンプレート
- AWS CDKインフラ雛形
- テスト駆動開発のベストプラクティス

## クイックスタート

### 前提条件
- Node.js 18以上
- AWS CLI v2（クラウドデプロイ時のみ）
- Git

### セットアップ

#### オプション1：対話型セットアップアシスタント（推奨）

```bash
# リポジトリをクローン
git clone https://github.com/daktu32/claude-code-dev-starter-kit.git
cd claude-code-dev-starter-kit

# 対話型セットアップアシスタントを実行
npm run setup
```

セットアップアシスタントは以下をガイドします：
- プロジェクト設定（名前、説明、リポジトリ）
- チーム・要件に応じた開発プロンプト選択
- 技術スタック選択
- プレースホルダー自動置換とファイルカスタマイズ

#### オプション2：手動セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/daktu32/claude-code-dev-starter-kit.git
cd claude-code-dev-starter-kit

# カスタマイズガイドに従う
# 詳細は CUSTOMIZATION_GUIDE.md を参照
```

### プロジェクト構造

```
project-root/
├── CLAUDE.md              # AIエージェントガイドライン・プロジェクト概要
├── PROGRESS.md            # 開発進捗管理
├── DEVELOPMENT_ROADMAP.md # ロードマップ・マイルストーン
├── infrastructure/        # インフラ（AWS CDK）
│   ├── lib/
│   │   └── stacks/       # クラウドインフラスタック
│   └── test/             # インフラテスト
├── packages/             # モノレポパッケージ
│   ├── frontend/         # フロントエンド
│   ├── backend/          # バックエンド
│   └── shared/           # 共有ユーティリティ
├── docs/                 # ドキュメント
│   ├── ARCHITECTURE.md   # システムアーキテクチャ
│   ├── prd.md           # 要件定義
│   └── setup-guide.md   # 詳細セットアップ手順
└── decisions/           # アーキテクチャ決定記録（ADR）
```

## AI開発向け主要ファイル

### CLAUDE.md
Claude Codeの振る舞いを制御する中心ファイルです。以下を記載してください：
- プロジェクト概要・目標
- 技術スタック
- 開発ワークフロー
- コーディング規約
- セキュリティガイドライン

### 開発プロンプト（prompts/）
プロジェクトタイプに応じて最適なプロンプトを選択：
- **Basic Development** - 小規模・MVP・学習用
- **Enterprise Development** - 大規模・コンプライアンス重視
- **Open Source Development** - コミュニティ主導
- **Startup Development** - 高速反復・市場検証

詳細は prompts/README.md を参照してください。

### PROGRESS.md
- 完了タスク
- 現在の作業
- 次のタスク
- ブロッカー・課題
- チームアップデート

### DEVELOPMENT_ROADMAP.md
- フェーズごとの開発計画
- マイルストーン
- 技術的意思決定
- リスク評価
- 成功指標

## 開発ワークフロー

### 1. タスク計画
- 要件を `docs/` に記載
- `DEVELOPMENT_ROADMAP.md` に新フェーズを追加
- `PROGRESS.md` にタスクを記載

### 2. テスト駆動開発
```bash
# まずテストを書く
npm test -- --watch

# 機能実装
npm run dev

# テストが全て通ることを確認
npm test
```

### 3. 品質チェック
```bash
# 型チェック
npm run type-check

# リンティング
npm run lint

# ビルド確認
npm run build
```

### 4. 進捗更新
- 各タスク完了後に `PROGRESS.md` を更新
- マイルストーンは `DEVELOPMENT_ROADMAP.md` で管理
- コミットは分かりやすい日本語メッセージで

## インフラ

本スターターキットには代表的なアーキテクチャのインフラテンプレートが含まれます。詳細は docs/tech-stack.md および infrastructure/ を参照。

### デプロイ例

```bash
cd infrastructure

# 開発環境へデプロイ
npm run deploy:dev

# 本番環境へデプロイ
npm run deploy:prod
```

## カスタマイズガイド

### 1. プロジェクト情報の更新
- `CLAUDE.md` を編集
- `package.json` のプロジェクト名を修正
- このREADMEもプロジェクト固有情報に更新

### 2. 技術スタックの設定
- `infrastructure/lib/stacks/` でインフラを調整
- `package.json` の依存関係を更新
- ビルドツールやリンターを設定

### 3. 開発ルールの設定
- `CLAUDE.md` でワークフローをカスタマイズ
- プロジェクト固有のADRを `decisions/` に追加
- CI/CDパイプラインを設定

## ベストプラクティス

### AIエージェント向け
1. タスク完了ごとに `PROGRESS.md` を必ず更新
2. TDD原則を守る（テストファースト）
3. 機能開発はgit worktreeで分離
4. シークレットや認証情報は絶対にコミットしない
5. ドキュメントとコードを常に同期

### 人間開発者向け
1. AI生成コードは必ずレビュー
2. アーキテクチャ決定は検証
3. コスト・パフォーマンスを監視
4. セキュリティベストプラクティスを遵守
5. `CLAUDE.md` に明確なコンテキストを記載

## よく使うコマンド

```bash
# 開発
npm run setup:dev    # 開発サーバー起動
npm run build        # 本番ビルド
npm run test         # テスト実行
npm run lint         # コードリント
npm run type-check   # 型チェック

# インフラ系はプロジェクトごとに調整してください

# ユーティリティ
npm run clean        # ビルド成果物削除
```

## CI/CDワークフロー

このスターターキットにはGitHub Actionsのワークフローが含まれます：

### 代表的なワークフロー

- **`.github/workflows/ci.yml`** - Lint/型チェック/テスト/ビルド/セキュリティスキャン等を含むCI
- **`.github/workflows/test.yml`** - E2Eテスト用
- **`.github/workflows/deploy.yml.template`** - デプロイ用テンプレート（リネームして利用）

### カスタマイズ方法

1. `package.json` のスクリプトをプロジェクトに合わせて調整
2. GitHubリポジトリのSecretsを設定
3. 必要に応じてNode.jsバージョン等を調整

## コントリビューション

貢献方法は CONTRIBUTING.md を参照してください。

## 参考リソース

- https://docs.anthropic.com/en/docs/claude-code