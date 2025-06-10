# Customization Guide

このスターターキットを新しいプロジェクト用にカスタマイズする方法を説明します。

## 必須カスタマイゼーション

### 1. 開発プロンプトの選択

まず、プロジェクトに適した開発プロンプトを選択：

#### プロンプト選択基準
- **チーム規模**: 1-3名 → Basic, 4-10名 → Startup/OSS, 10名以上 → Enterprise
- **業界**: 規制業界 → Enterprise, スタートアップ → Startup, OSS → Open Source
- **コンプライアンス**: 高 → Enterprise, 中 → Basic, 低 → Startup

詳細は [prompts/README.md](prompts/README.md) を参照。

### 2. プロジェクト情報の更新

以下のファイルでプロジェクト固有の情報に置き換えてください：

#### 選択したプロンプトファイル
- `<file_paths>` セクションを実際のファイルパスに更新
- プロジェクト固有の品質ゲートを調整

#### `.claude/settings.json`
- `.claude/settings.json.template` をコピーして設定
- プロジェクト名、チーム情報、通知設定を更新

#### `CLAUDE.md`
- `[Your project name]` → 実際のプロジェクト名
- `[Brief description...]` → プロジェクトの概要
- 各セクションの `[placeholder]` を実際の内容に置き換え

#### `README.md`
- プロジェクトタイトルとdescription
- セットアップ手順をプロジェクトに合わせて調整
- `[your-repo-url]` → 実際のリポジトリURL

#### `docs/prd.md`
- `[Your Product Name]` → 実際の製品名
- すべてのプレースホルダーを実際の要件に置き換え

### 2. 技術スタックの定義

#### `docs/tech-stack.md`
- 各技術カテゴリーで使用する具体的な技術を選択
- バージョン要件を指定
- 技術選択の理由を記載

例：
```markdown
### Framework
- **Primary**: Next.js 14
- **Version**: ≥14.0.0
- **Rationale**: Server Components support and App Router
```

### 3. インフラストラクチャの設定

#### `infrastructure/` フォルダ
- CDKスタックファイルをプロジェクトニーズに合わせて修正
- 不要なスタックは削除、必要なスタックは追加
- 環境変数と設定値を更新

#### 例：認証不要なプロジェクトの場合
```bash
rm infrastructure/lib/stacks/auth-stack.ts
# infrastructure-stack.tsからauth-stackの参照を削除
```

## セクション別カスタマイゼーション

### プロジェクト計画ファイル

#### `DEVELOPMENT_ROADMAP.md`
- フェーズ期間を実際のタイムラインに調整
- プロジェクト固有のマイルストーンに変更
- リスク項目をプロジェクトに合わせて更新

#### `PROGRESS.md`
- 現在のプロジェクト状況に合わせて初期化
- 不要なセクションは削除
- プロジェクト固有のメトリクスに変更

### 技術ドキュメント

#### `docs/ARCHITECTURE.md`
- システム図をプロジェクトアーキテクチャに更新
- データモデルを実際のエンティティに変更
- セキュリティ要件をプロジェクトに合わせて調整

#### `docs/implementation-plan.md`
- 実装フェーズをプロジェクトスコープに合わせて調整
- API設計を実際のエンドポイントに変更
- テスト戦略をプロジェクトに適応

## カスタマイゼーションチェックリスト

### 必須項目 (プロジェクト開始前)
- [ ] `CLAUDE.md` - プロジェクト概要と技術スタック
- [ ] `README.md` - プロジェクト名とセットアップ手順
- [ ] `docs/tech-stack.md` - 使用技術の確定
- [ ] `docs/prd.md` - プロダクト要件の定義
- [ ] `DEVELOPMENT_ROADMAP.md` - プロジェクトタイムライン

### 開発開始時
- [ ] インフラストラクチャスタックの選定と設定
- [ ] 不要なファイルの削除
- [ ] CI/CDパイプラインの設定
- [ ] 開発環境の構築手順確認

### 継続的更新
- [ ] `PROGRESS.md` - 開発進捗の定期更新
- [ ] `DEVELOPMENT_ROADMAP.md` - マイルストーン達成状況
- [ ] `docs/ARCHITECTURE.md` - 設計変更の反映

## テンプレートファイルの識別

以下のファイルは完全なテンプレートとして設計されています：

### 完全テンプレート（要カスタマイゼーション）
- `docs/prd.md`
- `docs/implementation-plan.md`
- `DEVELOPMENT_ROADMAP.md`
- `PROGRESS.md`

### 部分テンプレート（一部カスタマイゼーション）
- `CLAUDE.md` - プロジェクト情報セクション
- `README.md` - プロジェクト名と概要
- `docs/ARCHITECTURE.md` - システム設計部分
- `docs/tech-stack.md` - 技術選択部分

### 参考資料（そのまま使用可能）
- `CONTRIBUTING.md`
- `infrastructure/` の基本構造
- `decisions/` のADRテンプレート

## 段階的カスタマイゼーション

### フェーズ1：基本設定（1-2時間）
1. プロジェクト名とdescriptionの更新
2. 技術スタックの基本選択
3. 不要ファイルの削除

### フェーズ2：詳細設定（2-4時間）
1. PRDの詳細記入
2. アーキテクチャ図の作成
3. 実装計画の調整

### フェーズ3：環境構築（4-8時間）
1. インフラストラクチャの設定
2. CI/CDパイプラインの構築
3. 開発環境のテスト

## よくある質問

### Q: すべてのテンプレートファイルが必要ですか？
A: いいえ。プロジェクトの規模や性質に応じて不要なファイルは削除してください。小規模プロジェクトの場合、`docs/prd.md`や詳細な実装計画は不要かもしれません。

### Q: 技術スタックを大幅に変更する場合は？
A: `docs/tech-stack.md`を最初に更新し、それに合わせて`infrastructure/`フォルダのCDKスタックを調整してください。

### Q: チーム開発の場合の注意点は？
A: `CLAUDE.md`の開発ルールとワークフローをチームで合意してから開始することをお勧めします。

## カスタマイゼーション例

### 小規模プロジェクト（個人開発）
```bash
# 不要ファイルの削除
rm docs/prd.md
rm docs/implementation-plan.md
rm DEVELOPMENT_ROADMAP.md

# シンプルな構成に調整
# README.md と CLAUDE.md のみでスタート
```

### 大規模プロジェクト（企業開発）
```bash
# 追加ドキュメントの作成
mkdir docs/compliance
mkdir docs/security
mkdir docs/operations

# より詳細な計画ファイルを使用
# すべてのテンプレートファイルを活用
```

---

カスタマイゼーション完了後、このファイルは削除または`docs/`フォルダに移動することをお勧めします。