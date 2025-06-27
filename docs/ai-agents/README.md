# AI エージェント対応ガイド

AI Driven Dev Starter Kit は主に Claude Code での使用を想定していますが、Cursor でも利用可能です。

## 対応AIエージェント

### Claude Code（メイン）
- AI Driven Dev Starter Kit のメインターゲット
- 最も最適化された開発体験
- PRDベース開発フローに完全対応

### Cursor（サブ対応）
- Claude Code の代替として利用可能
- 一部機能は手動設定が必要

## クイックスタート

```bash
# 1. プロジェクト生成
npm run scaffold:plugin

# 2. プロジェクトタイプ選択
# - MCP Server, Web (Next.js), API (FastAPI), CLI (Rust)

# 3. PRD.md 作成
# 4. AIエージェントで開発開始
```

### Claude Code（推奨）

```
PRD.mdの内容に基づいてプロジェクトのスケルトンをアレンジして
```

### Cursor の場合

```
@PRD.md の内容に基づいてプロジェクトを実装してください
```

詳細な使用方法は [Cursor Guide](cursor-guide.md) をご覧ください。

---

**AI Driven Dev Starter Kit** - Claude Code メイン、Cursor サブ対応