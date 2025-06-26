# Setup Assistant

Claude Code Development Starter Kit のプロジェクトカスタマイズとスケルトン生成を行う対話形式のCLIツールです。

## 概要

- 🎯 **プロジェクトカスタマイズ** - プロジェクト情報とテックスタックに基づいて自動設定
- 🔧 **スケルトン生成** - 新しいプロジェクトのスケルトンを任意のパスに生成
- 💾 **安全なファイル操作** - 変更前にバックアップを作成
- 🎨 **対話形式CLI** - ユーザーフレンドリーなインターフェース

## クイックスタート

```bash
# scripts ディレクトリでビルド
npm run build

# プロジェクトカスタマイズ
npm run setup

# スケルトン生成
npx ./skeleton-generator.js
```

## 機能

### プロジェクトカスタマイズ
- プロジェクト情報の収集（名前、説明、リポジトリURL）
- チーム規模と開発アプローチの選択
- テックスタックの選択（フロントエンド、バックエンド、データベース、インフラ）
- プレースホルダーの自動置換
- 設定ファイルの生成

### スケルトン生成
- 対話形式で生成先パスやプロジェクト名を選択
- 含めるファイルの選択
- .cursorrules の自動生成

## 使用方法

### 対話形式セットアップ（推奨）

```bash
npm run setup
```

以下の手順でガイドします：
1. プロジェクト情報の入力
2. チームと開発アプローチの質問
3. テックスタックの選択
4. 設定の確認
5. ファイルの自動処理

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
├── setup-assistant.ts          # メインCLIアプリケーション
├── skeleton-generator.ts       # スケルトン生成ツール
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
- すべてのスターターキットファイルが存在することを確認

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
3. セットアップアシスタントを再実行

## Claude Codeとの統合

このセットアップアシスタントは Claude Code とシームレスに連携します：

- **構造化された出力** - Claudeが解析できる明確なフィードバック
- **エラーハンドリング** - トラブルシューティング用の包括的なエラーメッセージ
- **設定ストレージ** - 将来のClaudeセッション用にプロジェクト設定を保存
- **拡張性** - 新機能とカスタマイズの追加が容易