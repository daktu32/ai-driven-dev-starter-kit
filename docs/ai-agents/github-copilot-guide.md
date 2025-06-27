# GitHub Copilot での使用ガイド

AI Driven Dev Starter Kit を GitHub Copilot で使用するための詳細ガイドです。

## 概要

GitHub CopilotはAI Driven Dev Starter Kitのコード生成部分で強力に機能します。

**互換性**: ⭐⭐⭐⭐ (85%)

## セットアップ

### 1. プロジェクト作成

```bash
# AI Driven Dev Starter Kit をクローン
git clone https://github.com/daktu32/ai-driven-dev-starter-kit.git
cd ai-driven-dev-starter-kit

# プロジェクト生成
npm run scaffold:plugin
```

### 2. VS Code でプロジェクトを開く

```bash
# 生成されたプロジェクトを VS Code で開く
code your-project-name
```

### 3. GitHub Copilot 拡張機能確認

- GitHub Copilot
- GitHub Copilot Chat
- GitHub Copilot Labs（オプション）

## 使用方法

### 基本的な開発フロー

#### 1. PRD分析フェーズ

**Copilot Chat での分析**:
```
以下のPRD（プロダクト要件定義）を分析してください：

[PRD.mdの内容をコピー&ペースト]

実装すべき機能の優先順位と技術的な課題を教えてください。
```

#### 2. アーキテクチャ設計フェーズ

**VS Code で ARCHITECTURE.md を開いて**:
```
/explain このアーキテクチャ設計について、実装時の注意点を教えてください
```

#### 3. 段階的実装フェーズ

**コメント駆動開発**:
```typescript
// PRD要件: ユーザー認証機能
// - JWT トークンベース認証
// - ログイン/ログアウト機能
// - パスワードハッシュ化（bcrypt）
// - セッション管理
```

### Copilot Chat の活用パターン

#### パターン1: 機能実装の詳細化

```
#selection の機能について、PRDの以下の要件を満たすように実装してください：

要件：
- [PRDから該当する要件をコピー]
- [技術制約]
- [パフォーマンス要求]

実装方針を提案してください。
```

#### パターン2: コード生成・補完

```
/fix PRDの要件に基づいて、このコンポーネントを完成させてください

要件：
- [具体的な機能要求]
- [UI/UX要件]
- [データ要件]
```

#### パターン3: テスト作成

```
/tests PRDの成功指標に基づいて、この機能のテストケースを作成してください

成功指標：
- [PRDから該当する指標をコピー]
```

## プロジェクトタイプ別ガイド

### Web (Next.js) プロジェクト

#### 1. ページコンポーネント生成

```tsx
// PRD要件: ダッシュボードページ
// 機能: ユーザー情報表示、統計データ、クイックアクション
// UI: レスポンシブデザイン、ダークモード対応
interface DashboardProps {
  user: User;
  stats: DashboardStats;
}

export default function Dashboard({ user, stats }: DashboardProps) {
  // Copilot が自動補完
}
```

#### 2. API Routes 実装

```typescript
// PRD要件: ユーザー管理API
// エンドポイント: GET /api/users, POST /api/users, PUT /api/users/[id]
// 認証: JWT必須
// レスポンス: JSON形式
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Copilot が REST API パターンを提案
}
```

#### 3. スタイリング

```css
/* PRD要件: モダンでクリーンなデザイン */
/* カラーパレット: プライマリ #2563eb, セカンダリ #64748b */
/* タイポグラフィ: Inter フォント */
.dashboard {
  /* Copilot が CSS クラスを補完 */
}
```

### API (FastAPI) プロジェクト

#### 1. データモデル定義

```python
# PRD要件: ユーザー管理システム
# フィールド: id, email, username, created_at, updated_at
# バリデーション: email形式チェック、username一意性
from pydantic import BaseModel, EmailStr
from datetime import datetime

class User(BaseModel):
    # Copilot がモデル定義を補完
```

#### 2. API エンドポイント実装

```python
# PRD要件: RESTful API
# エンドポイント設計: CRUD操作
# レスポンス: 統一されたJSON形式
# エラーハンドリング: 適切なHTTPステータスコード
@app.post("/api/v1/users/", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Copilot がCRUD操作を提案
```

### CLI (Rust) プロジェクト

#### 1. コマンド構造定義

```rust
// PRD要件: 直感的なCLIインターフェース
// サブコマンド: init, build, deploy, status
// フラグ: --verbose, --dry-run, --config
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "myapp")]
#[command(about = "A CLI tool for project management")]
struct Cli {
    // Copilot がCLI構造を補完
}
```

#### 2. エラーハンドリング

```rust
// PRD要件: ユーザーフレンドリーなエラーメッセージ
// エラータイプ: 設定エラー、ネットワークエラー、ファイルエラー
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    // Copilot がエラー型を提案
}
```

### MCP Server プロジェクト

#### 1. MCP ツール実装

```typescript
// PRD要件: ファイル操作ツール
// 機能: read_file, write_file, list_directory
// セキュリティ: サンドボックス化、パス検証
export const fileTools: Tool[] = [
  {
    name: "read_file",
    description: "Read contents of a file",
    inputSchema: {
      // Copilot がMCPスキーマを補完
    }
  }
];
```

## 効率的な開発テクニック

### 1. インラインコメント活用

```typescript
// TODO: PRD要件を満たすログイン機能を実装
// - JWT認証
// - パスワードバリデーション  
// - セッション管理
function authenticateUser(credentials: LoginCredentials) {
  // Copilot が実装を提案
}
```

### 2. テスト駆動開発

```typescript
// PRD要件に基づくテストケース
describe('User Authentication', () => {
  // 成功ケース: 正しい認証情報でログイン成功
  it('should authenticate valid user', () => {
    // Copilot がテストコードを生成
  });
  
  // 失敗ケース: 無効な認証情報でログイン失敗
  it('should reject invalid credentials', () => {
    // Copilot がエラーケースを提案
  });
});
```

### 3. ドキュメント生成

```typescript
/**
 * PRD要件: ユーザー管理機能
 * 
 * このクラスは以下の機能を提供します：
 * - ユーザー作成・更新・削除
 * - 認証とセッション管理
 * - プロフィール情報管理
 */
class UserManager {
  // Copilot がJSDocを自動生成
}
```

## トラブルシューティング

### よくある問題と解決策

#### 1. Copilot の提案が PRD 要件と合わない

**解決策**: より具体的なコメントを書く
```typescript
// ❌ 曖昧
// ユーザー関連の処理

// ✅ 具体的
// PRD要件: JWT認証によるユーザーログイン
// 入力: email, password
// 出力: JWT token + user info
// エラー: 認証失敗時は401エラー
```

#### 2. 複雑な要件の実装

**解決策**: 段階的に分解する
```typescript
// PRD要件を小さな単位に分解
// ステップ1: バリデーション
function validateUserInput(input: UserInput): ValidationResult {
}

// ステップ2: 認証処理
function authenticateCredentials(email: string, password: string): AuthResult {
}

// ステップ3: セッション作成
function createUserSession(user: User): SessionData {
}
```

#### 3. アーキテクチャパターンの維持

**解決策**: ファイル内でパターンを明示
```typescript
// ARCHITECTURE.md要件: Clean Architecture パターン
// レイヤー: Controller → UseCase → Repository
// このファイルは Repository層の実装

interface UserRepository {
  // Copilot がパターンに従った実装を提案
}
```

## 高度な活用方法

### 1. カスタムプロンプト作成

GitHub Copilot Labs の Custom Brushes 機能で専用プロンプトを作成：

```
PRD-based Implementation:
Convert the following requirements into working code following the project's architecture patterns.

Requirements: {selection}
Architecture: Clean Architecture with TypeScript
Testing: Jest with comprehensive test coverage
```

### 2. 継続的な品質向上

```typescript
// PRD要件レビュー用コメント
// TODO: この実装はPRDの以下の要件を満たしているか確認
// - パフォーマンス要件: レスポンス時間 < 200ms
// - セキュリティ要件: 入力検証とサニタイゼーション
// - ユーザビリティ要件: エラーメッセージの明確性
```

### 3. リファクタリング支援

```typescript
// Copilot Chat でリファクタリング依頼
// /fix この実装をPRDの新しい要件に合わせてリファクタリングしてください
// 新要件: [変更された要件を記載]
```

## まとめ

GitHub CopilotとAI Driven Dev Starter Kitを組み合わせることで：

1. **高速な実装**: PRD要件をコメントで明示することで適切なコード生成
2. **一貫性の維持**: アーキテクチャパターンに従った実装の自動提案
3. **品質向上**: テスト駆動開発とドキュメント生成の支援

重要なポイントは、PRDの要件を明確にコメントで表現し、段階的に実装を進めることです。