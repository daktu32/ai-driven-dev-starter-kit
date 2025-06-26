# プロジェクト構造

このドキュメントはClaude Code Development Starter Kitのファイル構成を説明します。

## ルートレベルのファイル

### コア設定
- **`CLAUDE.md`** - AIエージェントガイド・プロジェクト概要
- **`README.md`** - プロジェクト概要・セットアップ手順
- **`PROMPT.md`** - メイン開発プロンプト（簡易版）

### プロジェクト管理
- **`PROGRESS.md`** - 開発進捗管理テンプレート
- **`DEVELOPMENT_ROADMAP.md`** - 戦略的ロードマップテンプレート
- **`CONTRIBUTING.md`** - 貢献ガイドライン

### セットアップ・カスタマイズ
- **`CUSTOMIZATION_GUIDE.md`** - カスタマイズ手順ガイド
- **`PROJECT_STRUCTURE.md`** - 本ファイル

## ディレクトリ構成

```
/
├── README.md                              # プロジェクト概要
├── CLAUDE.md                              # AIエージェントガイド
├── PROMPT.md                              # メイン開発プロンプト
├── PROGRESS.md                            # 進捗管理テンプレート
├── DEVELOPMENT_ROADMAP.md                 # ロードマップテンプレート
├── CONTRIBUTING.md                        # 貢献ガイドライン
├── CUSTOMIZATION_GUIDE.md                 # カスタマイズガイド
├── PROJECT_STRUCTURE.md                   # 本ファイル
│
├── .claude/                               # Claude Code設定
│   └── settings.json.template             # 設定テンプレート
│
├── .github/                               # GitHub設定
│   └── workflows/                         # GitHub Actionsワークフロー
│       ├── ci.yml                         # メインCIパイプライン
│       ├── test.yml                       # E2Eテスト用
│       └── deploy.yml.template            # デプロイ用テンプレート
│
├── prompts/                               # 開発プロンプトテンプレート
│   ├── README.md                          # プロンプト選択ガイド
│   ├── README-ja.md                       # 日本語ガイド
│   ├── basic-development.md               # 基本開発プロンプト
│   ├── basic-development-ja.md            # 基本開発プロンプト（日本語）
│   ├── enterprise-development.md          # エンタープライズプロンプト
│   ├── opensource-development.md          # オープンソースプロンプト
│   └── startup-development.md             # スタートアッププロンプト
│
├── docs/                                  # ドキュメント
│   ├── tech-stack.md                      # 技術スタック定義
│   ├── architecture.md                    # システムアーキテクチャテンプレート
│   ├── implementation-plan.md             # 実装計画テンプレート
│   ├── prd.md                             # 要件定義テンプレート
│   ├── templates/
│   │   └── requirements.md.template       # 要件仕様テンプレート
│   ├── setup-guide.md                     # セットアップ手順
│   │
│   ├── adr/                               # アーキテクチャ決定記録
│   │   └── template.md                    # ADRテンプレート
│   │
│   └── phase-reports/                     # フェーズ完了レポート
│       └── phase1-requirements.md.template
│
├── decisions/                             # アーキテクチャ決定記録
│   └── templates/
│       └── aws-serverless-architecture.md.template
│
├── infrastructure/                        # インフラ（IaC）
│   ├── README.md                          # インフラ概要
│   ├── deployment-env.yaml.template       # 環境設定
│   ├── cdk.json                           # AWS CDK設定
│   ├── package.json                       # 依存関係
│   ├── tsconfig.json                      # TypeScript設定
│   │
│   ├── bin/                              # CDK application entry points
│   ├── lib/                              # CDK stack definitions
│   │   ├── infrastructure-stack.ts
│   │   ├── stacks/                       # Individual stacks
│   │   │   ├── api-stack.ts
│   │   │   ├── auth-stack.ts
│   │   │   ├── frontend-stack.ts
│   │   │   ├── monitoring-stack.ts
│   │   │   └── storage-stack.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   └── test/                             # Infrastructure tests
│       └── infrastructure.test.ts
│
└── packages/                             # Monorepo structure (optional)
    ├── frontend/                         # Frontend application
    ├── backend/                          # Backend services
    └── shared/                           # Shared utilities
```

## File Categories

### Templates
Files ending with `.template` are meant to be copied and customized:
- `.claude/settings.json.template`
- `infrastructure/deployment-env.yaml.template`
- `.github/workflows/deploy.yml.template`
- `docs/phase-reports/*.template`

### Language Variants
Some files have Japanese variants:
- `prompts/README.md` / `prompts/README-ja.md`
- `prompts/basic-development.md` / `prompts/basic-development-ja.md`

### Configuration Files
- **`.claude/settings.json`** - Claude Code configuration
- **`infrastructure/cdk.json`** - AWS CDK configuration
- **`infrastructure/package.json`** - Infrastructure dependencies
- **`.github/workflows/`** - CI/CD pipeline configuration

## Usage Patterns

### For New Projects
1. Copy template files and remove `.template` extension
2. Customize placeholders marked with `[brackets]`
3. Choose appropriate prompt from `prompts/` directory
4. Update file paths in chosen prompt
5. Set up infrastructure configuration

### For Existing Projects
1. Review existing project structure
2. Adopt relevant templates and guidelines
3. Integrate CI/CD workflows
4. Implement progress tracking
5. Add architecture documentation

## Maintenance

### 新しいプロンプトの追加
1. `prompts/` に新しいプロンプトファイルを作成
2. 既存の命名規則に従う
3. `prompts/README.md` に選択基準を追記
4. 必要に応じて日本語版も追加

### 新しいテンプレートの追加
1. `.template` 拡張子でテンプレートファイルを作成
2. カスタマイズ値は `[placeholder]` 形式で記述
3. 利用方法を該当READMEに記載
4. この構造ガイドも更新

### バージョン管理
- すべての `.template` ファイルはコミット対象
- 実際の設定ファイル（.templateなし）はgitignore推奨
- 環境依存要件は必ずドキュメント化

## ベストプラクティス

### ファイル命名
- ファイルはkebab-case推奨: `file-name.md`
- 重要なルートファイルはUPPER_CASE: `README.md`
- テンプレートファイルは `.template` サフィックス
- 翻訳は `-ja.md` サフィックス

### ドキュメント
- ドキュメントは関連コードの近くに配置
- ドキュメント間は相対リンク推奨
- 書式を統一
- 新規ディレクトリ追加時は本ガイドも更新

### 組織原則
- ファイル種別より機能単位でグルーピング
- テンプレートは利用文脈とセットで管理
- 設定とドキュメントは分離
- 明確な階層と命名規則を維持