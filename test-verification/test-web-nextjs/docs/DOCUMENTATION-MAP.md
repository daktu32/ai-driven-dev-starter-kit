# ドキュメント体系マップ

## 概要

test-web-nextjsのドキュメント体系を可視化し、各ドキュメントの役割と相互関係を明確にします。

## ドキュメント関係図

```mermaid
graph TB
    subgraph "📋 要求層"
        PRD[PRD.md<br/>📄 プロジェクト要求仕様書<br/>・ビジネス要求<br/>・機能要求<br/>・非機能要求<br/>・MVP定義]
        
        REQ[REQUIREMENTS.md<br/>📋 システム要件定義書<br/>・機能要件詳細<br/>・非機能要件<br/>・技術制約<br/>・外部連携]
    end
    
    subgraph "🏗️ 設計層"
        ARCH[ARCHITECTURE.md<br/>🏛️ システム設計<br/>・全体アーキテクチャ<br/>・コンポーネント構成<br/>・技術的制約]
        
        TECH[TECH-STACH.md<br/>⚙️ 技術選定<br/>・選定技術一覧<br/>・選定理由<br/>・バージョン管理]
        
        FEAT[FEATURE-SPEC.md<br/>📝 機能仕様書<br/>・[YOUR_MVP_FEATURES] <!-- 例: ツール実行、リソース取得、基本監視 --><br/>・コア・拡張機能<br/>・実装仕様]
        
        API[API.md<br/>🔌 API仕様書<br/>・REST API, WebSocket API<br/>・エラーコード]
        
        FLOW[DATA-FLOW.md<br/>🔄 データフロー設計<br/>・システムデータフロー<br/>・状態管理<br/>・エラーハンドリング]
        
        SEC[SECURITY.md<br/>🔒 セキュリティ設計<br/>・脅威モデル<br/>・認証・認可<br/>・セキュア実装]
    end
    
    subgraph "⚡ 実装層"
        TEST[TESTING.md<br/>🧪 テスト戦略<br/>・テスト設計<br/>・品質基準<br/>・実装ガイド]
        
        CONTRIB[CONTRIBUTING.md<br/>👥 開発ガイド<br/>・開発ワークフロー<br/>・コーディング規約<br/>・レビュープロセス]
    end
    
    subgraph "🚀 運用層"
        README[README.md<br/>📖 プロジェクト概要<br/>・機能紹介<br/>・インストール<br/>・基本使用方法]
        
        DEPLOY[DEPLOYMENT.md<br/>🔧 デプロイメント<br/>・システム要件<br/>・設定方法<br/>・運用手順]
    end
    
    subgraph "📊 進捗管理"
        PROG[PROGRESS.md<br/>📈 開発進捗<br/>・実装状況<br/>・テスト結果<br/>・更新履歴]
        
        ROAD[DEVELOPMENT_ROADMAP.md<br/>🗺️ 開発計画<br/>・フェーズ計画<br/>・マイルストーン<br/>・優先順位]
    end
    
    subgraph "🗺️ メタドキュメント"
        DOCMAP[DOCUMENTATION-MAP.md<br/>📋 ドキュメント体系<br/>・相互関係<br/>・メンテナンスガイド<br/>・整合性分析]
    end
    
    %% 主要な依存関係
    PRD -.->|要求定義| ARCH
    PRD -.->|技術要件| TECH
    PRD -.->|機能要求| FEAT
    PRD -.->|詳細化| REQ
    REQ -.->|技術要件| TECH
    REQ -.->|機能詳細| FEAT
    
    ARCH -.->|設計基盤| API
    ARCH -.->|設計基盤| FLOW
    ARCH -.->|設計基盤| SEC
    
    FEAT -.->|詳細仕様| API
    FEAT -.->|データ仕様| FLOW
    FEAT -.->|機能実装| TEST
    
    TECH -.->|技術基盤| ARCH
    
    API -.->|テスト対象| TEST
    FLOW -.->|テスト対象| TEST
    SEC -.->|テスト対象| TEST
    
    TEST -.->|開発基準| CONTRIB
    SEC -.->|セキュリティ基準| CONTRIB
    
    ARCH -.->|概要情報| README
    FEAT -.->|機能説明| README
    API -.->|使用方法| README
    
    DEPLOY -.->|運用情報| README
    
    PRD -.->|進捗基準| PROG
    ROAD -.->|計画実績| PROG
    
    %% メタドキュメントの関係
    DOCMAP -.->|体系管理| PRD
    DOCMAP -.->|体系管理| REQ
    DOCMAP -.->|体系管理| ARCH
    DOCMAP -.->|体系管理| FEAT
    DOCMAP -.->|体系管理| API
    
    %% スタイル
    classDef requirement fill:#e1f5fe
    classDef design fill:#f3e5f5
    classDef implementation fill:#e8f5e8
    classDef operation fill:#fff3e0
    classDef progress fill:#fce4ec
    classDef meta fill:#f5f5f5
    
    class PRD,REQ requirement
    class ARCH,TECH,FEAT,API,FLOW,SEC design
    class TEST,CONTRIB implementation
    class README,DEPLOY operation
    class PROG,ROAD progress
    class DOCMAP meta
```

## 各ドキュメントの内容と責務

### 1. 要求層

#### **PRD.md** (プロジェクト要求仕様書)
- **目的**: ビジネス要求と機能要求の定義
- **内容**:
  - プロダクト概要（目的、スコープ）
  - 機能要求（[CORE_FEATURES]）
  - 非機能要求（性能、可用性、保守性、セキュリティ）
  - ユーザーストーリー
  - 受け入れ基準
  - MVP実装状況
- **参照元**: なし（最上位）
- **参照先**: ARCHITECTURE.md, TECH-STACH.md, PROGRESS.md, REQUIREMENTS.md

#### **REQUIREMENTS.md** (システム要件定義書)
- **目的**: 機能要件と非機能要件の詳細定義
- **内容**:
  - 機能要件の詳細仕様
  - 非機能要件（可用性、性能、セキュリティ、拡張性）
  - 技術構成
  - 外部連携・インターフェース仕様
  - 制約・リスク分析
- **参照元**: PRD.md
- **参照先**: TECH-STACH.md, FEATURE-SPEC.md

### 2. 設計層

#### **ARCHITECTURE.md** (アーキテクチャ仕様書)
- **目的**: システムの全体構造と設計思想
- **内容**:
  - システム全体アーキテクチャ図
  - コンポーネント構成
  - レイヤー設計
  - データフロー概要
  - 技術的制約
- **参照元**: PRD.md, REQUIREMENTS.md, TECH-STACH.md
- **参照先**: API.md, DATA-FLOW.md, SECURITY.md

#### **TECH-STACH.md** (技術スタック)
- **目的**: 技術選定の理由と詳細
- **内容**:
  - 選定技術一覧（Frontend: Next.js/React, Backend: Next.js API Routes, Database: PostgreSQL）
  - 選定理由
  - バージョン情報
  - 依存関係
- **参照元**: PRD.md, REQUIREMENTS.md
- **参照先**: ARCHITECTURE.md

#### **FEATURE-SPEC.md** (機能仕様書)
- **目的**: 詳細な機能仕様の定義
- **内容**:
  - MVP機能の詳細仕様（[MVP_FEATURES_LIST]）
  - コア機能・拡張機能の仕様
  - 入出力・制約・実装状況
  - 非機能要求・セキュリティ要件
  - テスト仕様・運用仕様
- **参照元**: PRD.md, REQUIREMENTS.md, ARCHITECTURE.md
- **参照先**: API.md, DATA-FLOW.md, TESTING.md

#### **API.md** (API仕様書)
- **目的**: 外部インターフェースの詳細定義
- **内容**:
  - RESTful API、リアルタイムWebSocket通信
  - メッセージフォーマット
  - エラーコード
- **参照元**: ARCHITECTURE.md
- **参照先**: TESTING.md, README.md

#### **DATA-FLOW.md** (データフロー設計書)
- **目的**: データの流れと状態管理の詳細
- **内容**:
  - システム全体のデータフロー
  - [SPECIFIC_FLOWS]
  - 状態管理
  - エラーハンドリングフロー
- **参照元**: ARCHITECTURE.md
- **参照先**: TESTING.md

#### **SECURITY.md** (セキュリティ設計書)
- **目的**: セキュリティ要件の実装方法
- **内容**:
  - セキュリティ原則
  - 脅威モデル
  - 認証・認可
  - 入力検証
  - 監査・ログ
- **参照元**: PRD.md, REQUIREMENTS.md (セキュリティ要求), ARCHITECTURE.md
- **参照先**: TESTING.md, CONTRIBUTING.md

### 3. 実装層

#### **TESTING.md** (テスト戦略・設計書)
- **目的**: 品質保証の方法論
- **内容**:
  - テスト戦略（ピラミッド）
  - テスト実装ガイド
  - [FEATURE_TESTS]
  - パフォーマンステスト
  - テスト実行方法
- **参照元**: API.md, DATA-FLOW.md, SECURITY.md
- **参照先**: CONTRIBUTING.md

#### **CONTRIBUTING.md** (コントリビューションガイド)
- **目的**: 開発者向けの貢献方法
- **内容**:
  - 開発環境セットアップ
  - コーディング規約
  - テスト作成
  - レビュープロセス
  - コミュニティガイドライン
- **参照元**: TESTING.md, SECURITY.md
- **参照先**: なし

### 4. 運用層

#### **README.md** (プロジェクト概要)
- **目的**: ユーザー向けの導入ガイド
- **内容**:
  - プロジェクト概要
  - [MAIN_FEATURES]
  - インストール方法
  - 基本的な使い方
  - システム情報
- **参照元**: ARCHITECTURE.md, API.md
- **参照先**: DEPLOYMENT.md

#### **DEPLOYMENT.md** (デプロイメントガイド)
- **目的**: 詳細な導入・運用手順
- **内容**:
  - システム要件
  - インストール手順
  - 初期設定
  - トラブルシューティング
  - アップデート方法
- **参照元**: README.md
- **参照先**: なし

### 5. 進捗管理

#### **PROGRESS.md** (開発進捗レポート)
- **目的**: 現在の開発状況の記録
- **内容**:
  - フェーズ進捗
  - 完了タスク
  - テスト結果
  - 更新ログ
- **参照元**: PRD.md, DEVELOPMENT_ROADMAP.md
- **参照先**: なし

#### **DEVELOPMENT_ROADMAP.md** (開発ロードマップ)
- **目的**: 将来の開発計画
- **内容**:
  - フェーズ計画
  - マイルストーン
  - 優先順位
- **参照元**: PRD.md
- **参照先**: PROGRESS.md

## 開発者向けドキュメントメンテナンスガイド

### 📋 基本原則

#### 1. Single Source of Truth (信頼できる唯一の情報源)
各情報は1つのドキュメントで管理し、他は参照のみ：

```yaml
主要情報の管理責任:
  ビジネス要求: PRD.md
  システム要件: REQUIREMENTS.md
  MVP定義: FEATURE-SPEC.md
  テスト数: TESTING.md
  実装規模: PROGRESS.md
  デプロイ要件: DEPLOYMENT.md
  API仕様: API.md
  技術選定: TECH-STACH.md
```

#### 2. 更新の伝播ルール
情報を更新する際は、参照先も確認・更新：

```mermaid
graph LR
    Update[情報更新] --> Check[参照先確認]
    Check --> Sync[関連ドキュメント同期]
    Sync --> Validate[整合性検証]
```

#### 3. 定期的な整合性チェック
月1回、以下を確認：
- [ ] テスト数の一致
- [ ] 実装規模の正確性
- [ ] MVP機能の記載統一
- [ ] リンク切れの確認

### 🔄 ドキュメント更新ワークフロー

#### 機能追加時のドキュメント更新手順

1. **要求変更時**
   ```bash
   # 更新順序
   1. PRD.md          # ビジネス要求更新
   2. REQUIREMENTS.md # システム要件詳細化
   3. FEATURE-SPEC.md # 機能仕様詳細化
   4. API.md          # インターフェース定義
   5. TESTING.md      # テスト要件追加
   6. README.md       # ユーザー向け説明更新
   ```

2. **実装完了時**
   ```bash
   # 更新順序
   1. FEATURE-SPEC.md # 実装状況更新 (❌→✅)
   2. TESTING.md      # テスト結果更新
   3. PROGRESS.md     # 進捗状況更新
   4. README.md       # 機能紹介更新
   ```

3. **バグ修正時**
   ```bash
   # 更新順序
   1. FEATURE-SPEC.md # 制約・仕様の明確化
   2. TESTING.md      # テストケース追加
   3. PROGRESS.md     # 修正履歴記録
   ```

#### コミットメッセージルール

ドキュメント更新時は以下の形式を使用：

```
📝 Update <ドキュメント名> - <変更概要>

- 具体的な変更内容1
- 具体的な変更内容2

Affected docs: <影響を受ける他のドキュメント>
```

**例**:
```
📝 Update FEATURE-SPEC.md - Add [FEATURE_NAME] specification

- Add [COMPONENT_NAME] component detailed specification
- Update implementation status for MVP features
- Add performance requirements for [FEATURE_NAME]

Affected docs: API.md, TESTING.md, PROGRESS.md
```

### 📊 品質管理チェックリスト

#### 新機能追加時
- [ ] FEATURE-SPEC.mdに機能ID付きで仕様を追加
- [ ] API.mdにインターフェース仕様を追加
- [ ] TESTING.mdにテスト要件を追加
- [ ] 実装完了後にPROGRESS.mdを更新
- [ ] ユーザー向け機能はREADME.mdに反映

#### ドキュメント品質チェック
- [ ] 全てのリンクが正常に動作する
- [ ] コードブロックの構文が正しい
- [ ] 数値データ（テスト数、行数等）が最新
- [ ] 英数字・記号の使い方が統一されている
- [ ] 敬語・表現レベルが統一されている

#### 月次メンテナンス
- [ ] 実装規模の再測定・更新
- [ ] テスト結果の正確性確認
- [ ] リンク切れの確認・修正
- [ ] 廃止予定機能のマーク更新
- [ ] 新機能の実装状況更新

### ⚡ 効率的なメンテナンス方法

#### 1. 自動化ツールの活用

```bash
# 実装規模の自動測定（例：複数言語対応）
echo "[LANG1]: $(find . -name "*.[EXT1]" -not -path "./[EXCLUDE_PATH]/*" | xargs wc -l | tail -1 | awk '{print $1}') lines"
echo "[LANG2]: $(find . -name "*.[EXT2]" | xargs wc -l | tail -1 | awk '{print $1}') lines"

# テスト結果の取得
[TEST_COMMAND] 2>&1 | grep "test result:"

# リンク切れチェック（将来実装）
# markdown-link-check docs/*.md
```

#### 2. テンプレート活用

**新機能仕様テンプレート**:
```yaml
## X.X <機能名> ([ISSUE_REF])

**機能ID**: <ID>
**概要**: <1行説明>

**詳細仕様**:
入力: <データ形式>
処理: <処理内容>
出力: <結果形式>
制約: <制限事項>

**実装状況**: ❌ 未実装 / ⏳ 実装中 / ✅ 完了
```

#### 3. 変更影響範囲の把握

```yaml
変更タイプ別影響範囲:
  ビジネス要求変更:
    影響: PRD.md, REQUIREMENTS.md, FEATURE-SPEC.md, README.md, PROGRESS.md
    
  MVP機能変更:
    影響: REQUIREMENTS.md, FEATURE-SPEC.md, API.md, README.md, PROGRESS.md
    
  API変更:
    影響: API.md, FEATURE-SPEC.md, TESTING.md, README.md
    
  技術スタック変更:
    影響: TECH-STACH.md, ARCHITECTURE.md, DEPLOYMENT.md, README.md
    
  テスト変更:
    影響: TESTING.md, PROGRESS.md, README.md
    
  設定変更:
    影響: DEPLOYMENT.md, README.md, FEATURE-SPEC.md
```

### 🚨 注意事項

#### 必須ルール
1. **数値データは測定ベース**: 推測で更新しない
2. **実装状況は正確に**: 過大評価・虚偽記載禁止
3. **参照整合性維持**: 関連ドキュメントも同時更新
4. **用語統一**: 専門用語は全ドキュメントで統一

#### 禁止事項
- ❌ 未確認情報の記載
- ❌ 他ドキュメントとの矛盾放置
- ❌ リンク切れの放置
- ❌ テスト結果の改ざん

---

**注意**: `[VARIABLE_NAME]`の部分は、プロジェクト固有の内容に置き換えてください。