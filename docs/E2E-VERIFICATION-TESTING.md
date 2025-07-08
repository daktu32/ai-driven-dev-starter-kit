# E2E検証テストドキュメント

## 概要

AI Driven Dev Starter Kit のE2E検証テストスイートは、生成されたプロジェクトの品質と完全性を保証するための包括的なテストシステムです。

## テストスイート構成

### 1. 検証E2Eテスト (`verification-e2e.test.ts`)

#### 目的
- ProjectVerifierクラスのコア機能テスト
- ビルド検証機能のテスト
- 基本的なプロジェクト検証フローのテスト

#### テストケース
- **プロジェクト完全性検証**: 生成されたMCPサーバープロジェクトの検証
- **ビルド結果確認**: BuildResultオブジェクトの正常な生成確認
- **スキップオプション**: ビルド検証のスキップ機能テスト
- **ファイル不足検出**: 必須ファイルの欠損検出テスト
- **テンプレート変数検出**: 未処理テンプレート変数の検出テスト

#### 実行方法
```bash
npm run test:verification
```

### 2. プロジェクトタイプ別検証テスト (`project-types-verification.test.ts`)

#### 目的
- 全プロジェクトタイプの個別検証
- プロジェクトタイプ固有の要件検証
- クロスプロジェクトタイプの共通テスト

#### 対象プロジェクトタイプ
1. **MCP Server** (`mcp-server`)
   - package.json構造検証
   - MCP固有ソースファイル確認
   - TypeScript設定検証
   - ビルド・dist生成確認

2. **CLI Rust** (`cli-rust`)
   - Cargo.toml構造検証
   - Rustソースファイル確認
   - Cargoビルド成功確認

3. **Web Next.js** (`web-nextjs`)
   - Next.js固有package.json検証
   - プロジェクト構造確認（App Router/Pages Router）
   - Next.jsビルド成功確認

4. **API FastAPI** (`api-fastapi`)
   - requirements.txt確認
   - FastAPI main.py検証
   - Python構文チェック
   - appパッケージ構造確認

#### 共通テスト項目
- テンプレートプレースホルダー変数の除去確認
- ドキュメント構造の検証
- CLAUDE.mdの プロジェクト固有コンテンツ確認
- 完全検証プロセスの成功確認

#### 実行方法
```bash
npm run test:project-types
```

### 3. エラーケーステスト (`error-cases.test.ts`)

#### 目的
- 異常系・エラー状況での挙動テスト
- エラーハンドリングの検証
- エッジケースの処理確認

#### テストカテゴリ

##### ProjectVerifierエラーハンドリング
- 存在しないプロジェクトディレクトリ
- 無効なプロジェクトタイプ
- 破損ファイルコンテンツ
- 権限拒否エラー

##### ビルド失敗シナリオ
- npm installの失敗
- TypeScriptコンパイルエラー
- Rustコンパイルエラー
- Python構文エラー

##### テンプレート変数問題
- 大量の未処理テンプレート変数
- バイナリファイルのテンプレートスキャン

##### リソース制約
- ビルド検証のタイムアウト
- 大量ファイルを含むプロジェクト

##### ネットワーク・環境問題
- npmレジストリ接続問題

#### 実行方法
```bash
npm run test:error-cases
```

## CI/CD統合

### GitHub Actions ワークフロー

`.github/workflows/verification-tests.yml` で以下のジョブを実行：

#### 1. verification-tests
- Node.js 18, 20 のマトリックステスト
- 全E2Eテストスイートの実行
- カバレッジレポート生成
- Codecovへのアップロード

#### 2. build-verification
- プロジェクトタイプ別のビルド検証
- 実際のプロジェクト生成・ビルドテスト
- ProjectVerifierによる検証実行

#### 3. security-scan
- npm audit実行
- ライセンススキャン

#### 4. quality-gates
- 全ジョブの結果確認
- 品質ゲートの判定

### 品質指標

#### カバレッジ目標
- **総合カバレッジ**: 85%以上
- **ProjectVerifier**: 90%以上
- **scaffold-generator**: 80%以上

#### テスト網羅性
- **全プロジェクトタイプ**: 100%カバー
- **主要エラーケース**: 90%以上
- **ビルド検証**: 全プロジェクトタイプで実行

## ローカル開発でのテスト実行

### 前提条件
```bash
# 依存関係のインストール
npm install

# プロジェクトのビルド
npm run build
```

### 個別テスト実行
```bash
# 検証テストのみ
npm run test:verification

# プロジェクトタイプテストのみ
npm run test:project-types

# エラーケーステストのみ
npm run test:error-cases

# 全E2Eテスト（ビルドテスト含む）
npm run test:e2e:build
```

### テスト結果の保持
```bash
# テスト結果を保持して実行
KEEP_TEST_OUTPUT=true npm run test:verification
```

### カバレッジ付きテスト
```bash
# カバレッジレポート生成
npm run test:jest:coverage

# カバレッジレポートの確認
open test/coverage/lcov-report/index.html
```

## トラブルシューティング

### よくある問題

#### 1. ビルドタイムアウト
```bash
# タイムアウト時間を延長
npm run test:e2e:build -- --timeout=600000
```

#### 2. 権限エラー (Unix系)
```bash
# テスト実行前に権限を確認
ls -la test/
chmod -R 755 test/
```

#### 3. 依存関係の問題
```bash
# node_modulesの再インストール
rm -rf node_modules
npm install
npm run build
```

#### 4. 一時ファイルの残存
```bash
# テスト用一時ファイルのクリーンアップ
npm run clean:test
```

### デバッグ方法

#### 詳細ログの有効化
```bash
# Jest詳細モード
npm run test:verification -- --verbose

# デバッグログ付きスケルトン生成
DEBUG_CLI=true npm run test:verification
```

#### テスト結果の保持・確認
```bash
# テスト結果を保持
KEEP_TEST_OUTPUT=true npm run test:project-types

# 生成されたプロジェクトの確認
ls -la test/project-types-output/
```

## 拡張・カスタマイズ

### 新しいプロジェクトタイプのテスト追加

1. `project-types-verification.test.ts` にテストケース追加
2. ProjectVerifierの対応プロジェクトタイプ拡張
3. CI ワークフローのマトリックス更新

### カスタム検証ルールの追加

1. ProjectVerifierクラスの拡張
2. 新しい検証メソッドの実装
3. 対応テストケースの追加

### パフォーマンス最適化

1. 並列実行の活用
2. テストデータのキャッシュ
3. ビルド検証のスキップオプション活用

## 関連ドキュメント

- [E2E-TESTING.md](./E2E-TESTING.md) - E2Eテスト全般
- [QUALITY-GATE.md](./QUALITY-GATE.md) - 品質ゲート
- [DEPENDENCY-LOCKFILE-GUIDE.md](./DEPENDENCY-LOCKFILE-GUIDE.md) - 依存関係管理