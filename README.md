# Claude Code Development Starter Kit

このスターターキットは、Claude CodeやAIエージェントを活用した開発のための包括的なテンプレート集です。setup-assistantを使用することで、プロジェクトの規模や用途に応じた最適な開発環境をscaffoldできます。

## 🚀 主要機能

### プロジェクトテンプレート
- **CLI（Rust）** - コマンドラインツール開発
- **Web（Next.js）** - フルスタックWebアプリケーション
- **API（FastAPI）** - RESTful API開発

### 開発プロンプト
- **Basic Development** - 小規模プロジェクト・チーム向け
- **Startup Development** - スタートアップ向け
- **Enterprise Development** - エンタープライズ向け
- **Open Source Development** - オープンソース向け

### 支援ツール
- **Coding Agents** - Claude Code、GitHub Copilot、Cursor設定
- **Architectures** - AWS Serverless、マイクロサービス等
- **Development Tools** - ESLint、Prettier、Jest、CI/CD設定

## 📋 セットアップ手順

### Step 1: プロジェクトセットアップの実行

```bash
# ローカルで実行（推奨）
cd scripts
npm install
npm run setup

# または、スケルトン生成
npm run scaffold
```

### Step 2: プロジェクトタイプの選択

project-setupが以下の選択肢を提示します：

1. **プロジェクトタイプ**
   - CLI（Rust）
   - Web（Next.js）
   - API（FastAPI）

2. **開発プロンプト**
   - Basic Development
   - Startup Development
   - Enterprise Development
   - Open Source Development

3. **追加設定**
   - Coding Agent設定
   - アーキテクチャ選択
   - 開発ツール設定

### Step 3: プロジェクトのカスタマイズ

生成されたプロジェクトで以下のファイルを更新：

#### 必須カスタマイゼーション
- `README.md` - プロジェクト名と概要
- `package.json` / `Cargo.toml` - プロジェクト情報
- 環境変数設定
- インフラ設定

#### 推奨カスタマイゼーション
- 開発プロンプトの調整
- 技術スタックの詳細設定
- CI/CDパイプラインの設定

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

**Claude Code Development Starter Kit** - AIを活用した効率的な開発環境を構築しましょう！ 