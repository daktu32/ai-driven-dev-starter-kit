# AI Driven Dev Starter Kit - ユーザーシナリオ

このディレクトリには、AI Driven Dev Starter Kitの主要な使用シナリオをGherkin形式で記述したfeatureファイルが含まれています。

## 📂 ディレクトリ構造

```
features/
├── project-setup/              # プロジェクトセットアップ関連のシナリオ
│   └── project-initialization.feature
├── template-selection/         # テンプレート選択関連のシナリオ
│   ├── development-prompt-selection.feature
│   └── architecture-template-selection.feature
├── customization/             # カスタマイズ関連のシナリオ
│   └── project-customization.feature
├── ai-tools/                  # AI開発ツール設定関連のシナリオ
│   └── ai-development-tools-setup.feature
└── README.md                  # このファイル
```

## 🎯 主要なユーザーペルソナ

### 1. 個人開発者
- 小規模プロジェクトを素早く開始したい
- シンプルな設定で開発を始めたい
- 基本的なAI支援機能を活用したい

### 2. スタートアップ開発者
- スケーラブルなプロジェクト構造が必要
- 迅速な開発とイテレーションを重視
- チーム開発に対応した設定が必要

### 3. エンタープライズ開発者
- 大規模組織の標準に準拠した構造が必要
- 包括的なドキュメントとテストが必須
- セキュリティとコンプライアンスを重視

### 4. オープンソース開発者
- コミュニティ貢献を前提とした構造
- 透明性の高い開発プロセス
- 協調的な開発環境の構築

## 📋 シナリオ一覧

### プロジェクト初期化
- CLIプロジェクトの新規作成
- Webアプリケーションの新規作成
- APIサーバーの新規作成
- 既存プロジェクトのセットアップ

### テンプレート選択
- 開発プロンプトの選択（Basic/Startup/Enterprise/Open Source）
- アーキテクチャテンプレートの選択（Monolithic/Microservices/Serverless/Event-Driven）
- 複数テンプレートの組み合わせ

### プロジェクトカスタマイズ
- プロジェクト情報の更新
- 環境変数の設定
- 依存関係の追加
- カスタムスクリプトの追加
- ディレクトリ構造のカスタマイズ
- CI/CD設定のカスタマイズ

### AI開発ツール設定
- Claude Codeの設定
- GitHub Copilotの設定
- Cursorの設定
- 複数AIツールの統合設定
- カスタムAIプロンプトの作成

## 🚀 使用方法

これらのシナリオは以下の目的で使用できます：

1. **機能理解**: スターターキットの機能を理解する
2. **テスト作成**: E2Eテストの基盤として使用
3. **ドキュメント**: ユーザーガイドの参考資料
4. **改善提案**: 新機能の要件定義

## 🧪 テスト実行

これらのシナリオをCucumberなどのBDDフレームワークで実行する場合：

```bash
# 依存関係のインストール
npm install --save-dev @cucumber/cucumber

# テスト実行
npm run test:features
```

## 📝 シナリオの記述ガイドライン

新しいシナリオを追加する際は：

1. **明確な目的**: 各シナリオは1つの明確な目的を持つ
2. **具体的な手順**: 実行可能な具体的なステップを記述
3. **期待される結果**: 明確な成功条件を定義
4. **日本語での記述**: 読みやすさを優先し日本語で記述

## 🤝 貢献方法

新しいシナリオや改善案がある場合：

1. 適切なディレクトリにfeatureファイルを作成
2. Gherkin形式に従って記述
3. プルリクエストを作成

詳細はプロジェクトのCONTRIBUTING.mdを参照してください。