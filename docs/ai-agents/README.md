# AI Agents Compatibility Guide

AI Driven Dev Starter Kit を様々なAIエージェントで使用するためのガイド集です。

## 対応AIエージェント一覧

### 💯 高い互換性（85%以上）

| AIエージェント | 互換性 | 主な用途 | ガイド |
|---|---|---|---|
| **Cursor** | ⭐⭐⭐⭐⭐ 95% | 総合的な開発支援 | [Cursor Guide](cursor-guide.md) |
| **GitHub Copilot** | ⭐⭐⭐⭐ 85% | コード生成・補完 | [GitHub Copilot Guide](github-copilot-guide.md) |

### ⭐ 中程度の互換性（70-85%）

| AIエージェント | 互換性 | 主な用途 | ガイド |
|---|---|---|---|
| **ChatGPT** | ⭐⭐⭐⭐ 80% | 設計・実装支援 | [ChatGPT Guide](chatgpt-guide.md) |
| **V0 (Vercel)** | ⭐⭐⭐ 70% | UI/フロントエンド特化 | [V0 Guide](v0-guide.md) |
| **Bolt.new** | ⭐⭐⭐ 70% | プロジェクト構造生成 | [Bolt.new Guide](bolt-guide.md) |

### 🔧 部分的互換性（50-70%）

| AIエージェント | 互換性 | 主な用途 | 対応状況 |
|---|---|---|---|
| **Replit AI** | ⭐⭐ 65% | ブラウザ環境開発 | 準備中 |
| **Claude (Web)** | ⭐⭐ 60% | テンプレート活用 | 準備中 |
| **Perplexity** | ⭐⭐ 55% | 調査・分析支援 | 準備中 |

## クイックスタート

### 1. あなたのAIエージェントを選ぶ

**質問**: どのAIエージェントを使用していますか？

- **Cursor** → [Cursor Guide](cursor-guide.md) - 最も簡単
- **GitHub Copilot** → [GitHub Copilot Guide](github-copilot-guide.md) - コード生成特化
- **ChatGPT** → [ChatGPT Guide](chatgpt-guide.md) - 設計支援
- **V0** → [V0 Guide](v0-guide.md) - UIプロトタイピング
- **その他** → [汎用ガイド](../README-UNIVERSAL.md)

### 2. 共通の使用手順

```bash
# 1. プロジェクト生成
npm run scaffold:plugin

# 2. プロジェクトタイプ選択
# - MCP Server
# - Web (Next.js) 
# - API (FastAPI)
# - CLI (Rust)

# 3. PRD.md 作成
# 4. AI エージェントで開発開始
```

### 3. AIエージェント向けプロンプト

各AIエージェントで使用できる基本プロンプト：

```
AI Driven Dev Starter Kit で生成したプロジェクトの実装を支援してください。

【プロジェクト情報】
- プロジェクトタイプ: [選択したタイプ]
- プロジェクト名: [your-project-name]

【PRD要件】
[PRD.mdの内容をコピー]

【アーキテクチャ指針】  
[ARCHITECTURE.mdの内容をコピー]

PRDの要件に基づいて段階的に実装してください。
```

## AIエージェント別特徴

### Cursor - 統合開発環境として最強
- **強み**: ファイル操作、プロジェクト理解、コンテキスト保持
- **用途**: 大規模プロジェクト、継続的開発
- **最適なプロジェクト**: すべて

### GitHub Copilot - コード生成の専門家
- **強み**: リアルタイムコード補完、パターン認識
- **用途**: 実装フェーズ、リファクタリング
- **最適なプロジェクト**: TypeScript/Rust プロジェクト

### ChatGPT - 設計コンサルタント
- **強み**: 要件分析、アーキテクチャ設計、問題解決
- **用途**: 設計フェーズ、技術的相談
- **最適なプロジェクト**: 複雑な要件のプロジェクト

### V0 - UIデザインスペシャリスト
- **強み**: モダンUI生成、レスポンシブデザイン
- **用途**: プロトタイピング、フロントエンド開発
- **最適なプロジェクト**: Web (Next.js) プロジェクト

### Bolt.new - 迅速プロトタイピング
- **強み**: 即座のプロジェクト生成、デプロイ
- **用途**: MVP開発、概念実証
- **最適なプロジェクト**: シンプルなWebアプリ

## 組み合わせ戦略

### パターン1: フェーズ別使い分け

1. **設計フェーズ**: ChatGPT でPRD分析・アーキテクチャ設計
2. **プロトタイプフェーズ**: V0 でUI作成 or Bolt.new で MVP
3. **実装フェーズ**: Cursor or GitHub Copilot で本格実装
4. **リファクタリング**: Cursor で品質向上

### パターン2: 機能別使い分け

- **フロントエンド**: V0 → Cursor
- **バックエンドAPI**: ChatGPT → GitHub Copilot  
- **CLI**: ChatGPT → Cursor
- **MCP Server**: Cursor のみ

### パターン3: チーム開発

- **アーキテクト**: ChatGPT で設計
- **フロントエンド開発者**: V0 + Cursor
- **バックエンド開発者**: GitHub Copilot + Cursor
- **DevOps**: Cursor + Bolt.new

## トラブルシューティング

### 共通の問題

#### Q: PRDテンプレートがAIエージェントに認識されない
**A**: PRD.mdの内容を直接コピー&ペーストして使用してください。ファイル形式ではなくテキストとして提供することが重要です。

#### Q: アーキテクチャパターンが維持されない  
**A**: 各実装時にARCHITECTURE.mdの関連部分を明示的に参照してください。

#### Q: 生成されたコードが一貫していない
**A**: プロジェクト固有の設定ファイル（.cursorrules など）を作成し、コーディング規約を明示してください。

### AIエージェント固有の問題

詳細は各AIエージェントのガイドを参照してください：

- [Cursor固有の問題](cursor-guide.md#トラブルシューティング)
- [GitHub Copilot固有の問題](github-copilot-guide.md#トラブルシューティング)
- [ChatGPT固有の問題](chatgpt-guide.md#トラブルシューティング)
- [V0固有の問題](v0-guide.md#制限事項と回避策)

## 制限事項と回避策

### Claude Code 固有機能の代替

| Claude Code機能 | 代替アプローチ |
|---|---|
| ファイル操作 | 手動コピー&ペースト、IDEのファイル操作 |
| プロジェクト構造理解 | ディレクトリ構造を明示的に提供 |
| 継続的文脈保持 | 定期的な文脈再提供、設定ファイル活用 |
| 思考タグ | プロンプトに思考プロセスを明示 |

### 環境固有の制約

- **ローカル環境**: Cursor, GitHub Copilot - 制約なし
- **ブラウザ環境**: V0, Bolt.new - ファイルダウンロード必要
- **チャット環境**: ChatGPT - コード分割・段階的実装必要

## 将来の拡張

### 追加予定のガイド

- **Replit AI Guide** - ブラウザ環境での完結型開発
- **Claude (Web) Guide** - 詳細な設計支援活用
- **Perplexity Guide** - 技術調査・情報収集支援
- **CodeWhisperer Guide** - AWS環境特化開発

### 統合ツール開発

- **AI Agent Detector** - 使用中のAIエージェントを自動判定
- **Cross-Agent Template** - 複数AIで共有可能なテンプレート
- **Compatibility Checker** - AIエージェント間のコード互換性チェック

## 貢献方法

新しいAIエージェントのガイド追加や既存ガイドの改善に貢献できます：

1. 新しいAIエージェントでの検証
2. 使用事例の共有
3. 問題点と解決策の報告
4. ガイドの翻訳・改善

詳細: [`CONTRIBUTING.md`](../../CONTRIBUTING.md)

---

**AI Driven Dev Starter Kit** - すべてのAIエージェントで使える開発テンプレート