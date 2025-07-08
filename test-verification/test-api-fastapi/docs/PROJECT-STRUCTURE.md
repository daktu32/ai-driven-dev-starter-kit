# プロジェクト構造ガイド - test-api-fastapi

## 📋 プロジェクト概要

**test-api-fastapi** - test-api-fastapi - AI駆動開発スターターキットで生成

プロジェクトタイプ: **api-fastapi**

## 📁 ディレクトリ構造

```
test-api-fastapi/
├── 📂 src/                     # ソースコード
│   ├── 📄 index.ts            # アプリケーションエントリーポイント
│   ├── 📂 routers/ # API ルーター・エンドポイント
│   ├── 📂 services/ # ビジネスロジック・サービス層
│   └── 📂 utils/              # 共通ユーティリティ
│       └── logger.ts          # ログ管理
├── 📂 docs/                   # プロジェクトドキュメント
│   ├── 📄 PRD.md              # プロダクト要求仕様書
│   ├── 📄 ARCHITECTURE.md     # アーキテクチャ設計書
│   ├── 📄 API.md              # API仕様書
│   └── 📄 ...                 # その他ドキュメント
├── 📂 tools/                  # 開発ツール・設定
│   ├── 📂 linting/            # ESLint・Prettier設定
│   ├── 📂 testing/            # テスト設定
│   └── 📂 ci-cd/              # CI/CDパイプライン
├── 📄 package.json            # プロジェクト設定・依存関係
├── 📄 tsconfig.json          # TypeScript設定
├── 📄 .env.example           # 環境変数テンプレート
├── 📄 README.md              # プロジェクト概要（ユーザー向け）
├── 📄 CLAUDE.md              # AI エージェント開発ガイダンス
├── 📄 PROGRESS.md            # 開発進捗管理
├── 📄 ROADMAP.md             # 開発ロードマップ
└── 📄 CHANGELOG.md           # 変更履歴
```

## 🚀 開発ワークフロー

### 初期セットアップ
```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env
# .env ファイルを編集

# 3. 開発サーバー起動
npm run dev
```

### 開発サイクル
```bash
# 開発
npm run dev           # 開発サーバー起動
npm run build         # ビルド
npm run test          # テスト実行
npm run lint          # コード品質チェック

# 品質チェック
npm run type-check    # TypeScript型チェック
npm run test:coverage # テストカバレッジ確認
```

## 🔧 api-fastapi 特有の構造

### FastAPI特有の構造

- **routers/**: APIエンドポイント群 (FastAPI Router使用)
- **models/**: Pydanticモデル・データ検証
- **services/**: ビジネスロジック・外部連携
- **database/**: データベース接続・ORM設定

## 📚 ファイル・ディレクトリの役割

### 📂 ソースコード構造

| パス | 役割 | 説明 |
|------|------|------|
| `src/index.ts` | エントリーポイント | FastAPI アプリケーションインスタンス、ミドルウェア・ルーター設定 |
| `src/routers/` | routers | REST API エンドポイント、リクエスト・レスポンス処理 |
| `src/services/` | services | データ処理、外部API連携、ビジネスルール |
| `src/utils/` | ユーティリティ | ログ管理、共通関数、ヘルパー |

### 📂 ドキュメント構造

| ファイル | 役割 | 更新タイミング |
|----------|------|----------------|
| `docs/PRD.md` | プロダクト要求定義 | プロダクト要件変更時 |
| `docs/ARCHITECTURE.md` | システム設計 | アーキテクチャ変更時 |
| `docs/API.md` | API仕様 | エンドポイント追加・変更時 |
| `docs/FEATURE-SPEC.md` | 機能仕様 | 機能実装・変更時 |

### 📂 設定・ツール

| パス | 役割 | カスタマイズ |
|------|------|--------------|
| `package.json` | プロジェクト設定 | 依存関係・スクリプト管理 |
| `tsconfig.json` | TypeScript設定 | コンパイル設定 |
| `tools/linting/` | コード品質設定 | ESLint・Prettier ルール |
| `tools/testing/` | テスト設定 | Jest・テストツール設定 |

## 🔄 開発プロセス統合

### AI エージェント連携
- **CLAUDE.md**: AI エージェントの動作ルール
- **PROGRESS.md**: 進捗自動更新
- **docs/**: ドキュメント自動メンテナンス

### 品質管理
- **リンティング**: `tools/linting/` の設定
- **テスト**: `tools/testing/` の設定  
- **CI/CD**: `tools/ci-cd/` のパイプライン

### ドキュメント管理
- **Single Source of Truth**: docs/ を真実の情報源
- **相互参照**: DOCUMENTATION-MAP.md で関係管理
- **自動更新**: 実装変更時の連動更新

## 📖 次のステップ

1. **PRD.md を完成させる**: プロダクト要件を詳細に記述
2. **Claude Code で開発開始**: "PRD.mdに基づいてスケルトンをアレンジして"
3. **段階的実装**: MVP → コア機能 → 拡張機能
4. **ドキュメント連動更新**: 実装に応じてドキュメント自動更新

---

**📌 重要**: この構造は test-api-fastapi の開発効率と品質向上のために設計されています。各ディレクトリ・ファイルの役割を理解して効果的に活用してください。