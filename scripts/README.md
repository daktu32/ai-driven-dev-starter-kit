# AI Driven Dev Starter Kit 開発スクリプト

AI Driven Dev Starter Kit のスクリプトツールです。

## 概要

- 🔧 **project-setup** - 既存プロジェクトのカスタマイズ
- 🏗️ **scaffold-generator** - 新規プロジェクトのスケルトン生成
- 💾 **安全なファイル操作** - 変更前にバックアップを作成
- 🎨 **対話形式CLI** - ユーザーフレンドリーなインターフェース

## クイックスタート

```bash
# scripts ディレクトリでビルド
npm run build

# 既存プロジェクトのカスタマイズ
npm run setup

# 新規プロジェクトのスケルトン生成
npm run scaffold
```

## 機能

### project-setup（既存プロジェクトのカスタマイズ）
- プロジェクト情報の収集（名前、説明、リポジトリURL）
- チーム規模と開発アプローチの選択
- テックスタックの選択（フロントエンド、バックエンド、データベース、インフラ）
- プレースホルダーの自動置換
- 設定ファイルの生成

### scaffold-generator（新規プロジェクトのスケルトン生成）
- プロジェクトタイプの選択（CLI/Rust、Web/Next.js、API/FastAPI）
- テンプレートベースの生成
- プロジェクト管理ファイルの追加
- 開発ツール設定の追加
- .cursorrules の自動生成

## 使用方法

### 既存プロジェクトのカスタマイズ

```bash
npm run setup
```

以下の手順でガイドします：
1. プロジェクト情報の入力
2. チームと開発アプローチの質問
3. テックスタックの選択
4. 設定の確認
5. ファイルの自動処理

### 新規プロジェクトのスケルトン生成

```bash
npm run scaffold
```

以下の手順でガイドします：
1. 生成先パスの指定
2. プロジェクト名の入力
3. プロジェクトタイプの選択
4. 追加ファイルの選択
5. スケルトンの生成

### コマンドラインオプション

```bash
# ドライランモード - ファイルを変更せずにプレビュー
npm run setup:dry-run

# プロンプト選択をスキップ
npm run setup -- --skip-prompt --prompt=basic-development

# 詳細出力
npm run setup -- --verbose

# 利用可能なプロンプト
npm run setup -- --prompt=basic-development
npm run setup -- --prompt=enterprise-development
npm run setup -- --prompt=opensource-development
npm run setup -- --prompt=startup-development
```

### 開発アプローチ

- **Basic Development** - 小規模チーム（1-3人）、シンプルなワークフロー
- **Enterprise Development** - 大規模チーム、高コンプライアンス、複雑なガバナンス
- **Open Source Development** - コミュニティ駆動プロジェクト、コントリビューター管理
- **Startup Development** - 高速イテレーション、MVP重視、迅速なデプロイ

## プロジェクトタイプ

### CLI (Rust)
- Cargo.toml で依存関係を管理
- src/main.rs がエントリーポイント
- tests/ ディレクトリにテストを配置
- clap を使用してCLI引数を処理

### Web (Next.js)
- pages/ または app/ ディレクトリでルーティング
- components/ ディレクトリにReactコンポーネントを配置
- public/ ディレクトリに静的ファイルを配置
- TypeScript を使用

### API (FastAPI)
- src/main.py がエントリーポイント
- requirements.txt で依存関係を管理
- tests/ ディレクトリにテストを配置
- Pydantic を使用してデータバリデーション

## プレースホルダーシステム

以下のプレースホルダーが自動的に置換されます：

### プロジェクトプレースホルダー
- `[Your project name]` → プロジェクト名
- `[Your Project Name]` → タイトルケースのプロジェクト名
- `[project-name]` → ケバブケースのプロジェクト名
- `[PROJECT_NAME]` → 大文字のプロジェクト名
- `[Brief description of your project]` → プロジェクト説明
- `[your-repo-url]` → リポジトリURL

### テックスタックプレースホルダー
- `[Frontend Framework]` → 選択されたフロントエンド
- `[Backend Framework]` → 選択されたバックエンド
- `[Database]` → 選択されたデータベース
- `[Infrastructure]` → 選択されたインフラ

## 開発

### プロジェクト構造
```
scripts/
├── project-setup.ts          # 既存プロジェクトのカスタマイズ
├── scaffold-generator.ts     # 新規プロジェクトのスケルトン生成
├── lib/
│   ├── types.ts               # TypeScriptインターフェース
│   ├── promptSelector.ts      # プロンプト選択ロジック
│   ├── templateProcessor.ts   # テンプレート処理
│   ├── fileManager.ts         # ファイル操作
│   └── validator.ts           # 入力検証
├── package.json               # 依存関係とスクリプト
├── tsconfig.json             # TypeScript設定
└── README.md                 # このファイル
```

### ビルドとテスト

```bash
# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build

# 開発モードで実行
npm run dev

# テスト実行（実装時）
npm test
```

## トラブルシューティング

### よくある問題

**"Missing required file" エラー**
- 正しいディレクトリから実行していることを確認
- 必要なファイルが存在することを確認

**"Project structure validation failed"**
- 必要なディレクトリとファイルがすべて存在することを確認
- プロジェクトルートディレクトリから実行

**権限エラー**
- ファイル権限を確認
- 適切なユーザー権限で実行
- バックアップディレクトリが書き込み可能であることを確認

### デバッグモード

詳細な処理情報を表示するには：
```bash
npm run setup -- --verbose
```

### 元の状態にリセット

最初からやり直す場合：
1. `.backups/` の最新バックアップから復元
2. `.claude/project-config.json` を削除
3. セットアップスクリプトを再実行

## Claude Codeとの統合

このスクリプトツールは Claude Code とシームレスに連携します：

- **構造化された出力** - Claudeが解析できる明確なフィードバック
- **エラーハンドリング** - トラブルシューティング用の包括的なエラーメッセージ
- **設定ストレージ** - 将来のClaudeセッション用にプロジェクト設定を保存
- **拡張性** - 新機能とカスタマイズの追加が容易