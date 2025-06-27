# Cursor での使用ガイド

AI Driven Dev Starter Kit を Cursor で使用するための詳細ガイドです。

## 概要

CursorはAI Driven Dev Starter Kitと非常に相性が良く、ほぼそのまま利用可能です。

**互換性**: ⭐⭐⭐⭐⭐ (95%)

## セットアップ

### 1. プロジェクト作成

```bash
# AI Driven Dev Starter Kit をクローン
git clone https://github.com/daktu32/ai-driven-dev-starter-kit.git
cd ai-driven-dev-starter-kit

# プロジェクト生成
npm run scaffold:plugin
```

### 2. Cursorで開く

```bash
# 生成されたプロジェクトをCursorで開く
cursor your-project-name
```

### 3. .cursorrules ファイル作成（推奨）

プロジェクトルートに `.cursorrules` ファイルを作成：

```
# AI Driven Dev Starter Kit - Cursor Rules

## Project Context
This project was generated using AI Driven Dev Starter Kit.
The project follows PRD-driven development approach.

## Key Files
- PRD.md: Product Requirements Document (PRIMARY REFERENCE)
- ARCHITECTURE.md: Technical architecture and design decisions
- README.md: Project overview and setup instructions

## Development Guidelines

### 1. PRD-First Approach
- Always reference PRD.md for requirements
- Implement features based on user stories in PRD
- Validate implementations against success criteria

### 2. Architecture Compliance
- Follow patterns defined in ARCHITECTURE.md
- Maintain consistency with chosen tech stack
- Respect security and performance requirements

### 3. Code Quality
- Write comprehensive tests for new features
- Follow existing code style and patterns
- Add appropriate documentation

### 4. Implementation Priority
1. MVP features first (defined in PRD.md)
2. Core functionality over nice-to-have features
3. Security and performance considerations
4. User experience optimizations

## AI Assistant Instructions
When helping with this project:
1. Read and understand PRD.md thoroughly
2. Refer to ARCHITECTURE.md for technical decisions
3. Implement features incrementally
4. Ask clarifying questions about requirements
5. Suggest improvements while respecting constraints

## File Organization
Follow the project structure defined in ARCHITECTURE.md
Maintain clean separation of concerns
Keep related files together
```

## 使用方法

### 基本的な開発フロー

1. **PRD分析**: Cursor Composer（⌘⇧I）を起動
   ```
   @PRD.md の内容を分析し、実装すべき機能の優先順位を教えてください
   ```

2. **アーキテクチャ確認**:
   ```
   @ARCHITECTURE.md に基づいて、プロジェクトの技術構成を確認してください
   ```

3. **段階的実装**:
   ```
   PRDのMVP機能から順番に実装を始めてください。まず最初の機能から始めましょう。
   ```

### Cursor の便利機能活用

#### 1. Composer での PRD 参照

```
@PRD.md の要件に基づいて、[機能名] を実装してください。

具体的には：
- ユーザーストーリー: [該当部分]
- 技術要件: [該当部分]
- 成功指標: [該当部分]

実装方針を教えてください。
```

#### 2. コードベース全体参照

```
@codebase このプロジェクトの構造を理解して、PRD.mdの要件に適した新しい[コンポーネント/機能]を追加してください
```

#### 3. ファイル横断的な変更

```
@PRD.md の要件変更に伴い、影響を受けるファイルをすべて更新してください：
- [変更内容の説明]
```

## 実践例

### Web (Next.js) プロジェクトの場合

1. **初期セットアップ**:
   ```
   @PRD.md と @ARCHITECTURE.md を参照して、Next.jsプロジェクトのセットアップを完了してください。
   
   必要な作業：
   1. 依存関係のインストール
   2. 基本的なページ構造の作成
   3. コンポーネント設計
   4. スタイリング設定
   ```

2. **機能実装**:
   ```
   PRD.mdの「ユーザー認証機能」を実装してください。
   
   要件：
   - @PRD.md の該当セクションを参照
   - @ARCHITECTURE.md のセキュリティ要件に従う
   - テストも含めて実装
   ```

### API (FastAPI) プロジェクトの場合

1. **API設計**:
   ```
   @PRD.md のAPI要件に基づいて、FastAPIのエンドポイント設計を行ってください。
   
   @ARCHITECTURE.md のClean Architectureパターンに従って実装してください。
   ```

2. **データモデル実装**:
   ```
   PRD.mdのデータ要件に基づいて、SQLAlchemyモデルを実装してください。
   
   考慮事項：
   - データベース設計
   - バリデーション
   - 関連性の定義
   ```

### CLI (Rust) プロジェクトの場合

1. **コマンド設計**:
   ```
   @PRD.md のCLI要件に基づいて、clapを使用したコマンド構造を設計してください。
   
   @ARCHITECTURE.md のパフォーマンス要件も考慮してください。
   ```

## Cursor固有の最適化

### 1. カスタムコマンド設定

VS Code settings.json に追加：

```json
{
  "cursor.customCommands": [
    {
      "name": "Implement PRD Feature",
      "command": "@PRD.md の要件に基づいて、選択された機能を実装してください。アーキテクチャ指針にも従ってください。"
    },
    {
      "name": "Review Architecture Compliance",
      "command": "@ARCHITECTURE.md の指針に従って、現在のコードをレビューし、改善点を提案してください。"
    }
  ]
}
```

### 2. ワークフロー自動化

```
# 新機能開発フロー
1. @PRD.md で要件確認
2. @ARCHITECTURE.md で技術方針確認
3. 段階的実装（MVP → 追加機能）
4. テスト作成
5. ドキュメント更新
```

## トラブルシューティング

### よくある問題

**Q: Cursorが PRD.md を正しく解釈しない**
A: PRDの該当セクションを直接引用して指示してください

**Q: 複数ファイルの変更が必要な場合の指示方法**
A: `@codebase` を使用して全体的な変更を依頼してください

**Q: アーキテクチャパターンが守られない**
A: `.cursorrules` でより具体的な制約を定義してください

### パフォーマンス最適化

- 大きなプロジェクトでは `@file:` を使って特定ファイルを指定
- Composer の応答が遅い場合は質問を細分化
- 長いPRDの場合は関連セクションのみを参照

## 高度な活用方法

### 1. プロジェクト全体の自動生成

```
@PRD.md の全要件を分析し、@ARCHITECTURE.md に従って完全なプロジェクトを段階的に生成してください。

フェーズ1: 基本構造とMVP機能
フェーズ2: 追加機能
フェーズ3: 最適化とテスト
```

### 2. 継続的改善

```
@PRD.md の成功指標に基づいて、現在の実装を評価し、改善提案をしてください。

評価項目：
- 機能完成度
- パフォーマンス
- ユーザビリティ
- セキュリティ
```

## まとめ

CursorとAI Driven Dev Starter Kitの組み合わせは非常に強力です。PRDベースの開発アプローチとCursorのAI機能が相乗効果を生み、効率的で高品質な開発が可能になります。

`.cursorrules` の設定とファイル参照機能を活用することで、プロジェクト固有の文脈を保持しながら一貫した開発が行えます。