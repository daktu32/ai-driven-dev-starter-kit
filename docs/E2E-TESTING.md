# E2Eテスト実行ガイド

Issue #20で実装された包括的なE2Eテストシステムの使用方法とトラブルシューティングガイド。

## 📋 概要

このE2Eテストシステムは以下の機能を提供します：

1. **生成結果の完全性検証**: 全プロジェクトタイプの必須ファイル・設定検証
2. **ビルド可能性検証**: 生成されたプロジェクトの実際のビルド実行
3. **テンプレート変数検証**: 未置換変数の自動検出
4. **エラーケース処理**: 異常系動作の確認
5. **パフォーマンス測定**: 検証時間の監視

## 🚀 実行方法

### 基本的なE2Eテスト（高速）

```bash
# ビルド検証なしで全プロジェクトタイプをテスト
npm run test:e2e:fast

# 特定のプロジェクトタイプのみテスト
npm run test:jest -- --testNamePattern="mcp-server"
```

### 完全なE2Eテスト（ビルド含む）

```bash
# ビルド検証ありで全テスト実行（時間がかかります）
npm run test:e2e:build

# テスト出力を保持して実行（デバッグ用）
KEEP_TEST_OUTPUT=true npm run test:e2e:fast
```

### カバレッジ付きテスト

```bash
# カバレッジ測定付きでテスト実行
npm run test:jest:coverage

# カバレッジ閾値確認
npm run test:jest:coverage -- --passWithNoTests
```

## 📊 テストの種類

### 1. スケルトン生成テスト (`scaffold-generation.test.ts`)

```typescript
describe('Scaffold Generation E2E Tests', () => {
  // 各プロジェクトタイプの基本生成テスト
  // ファイル内容検証テスト
  // テンプレート変数検証テスト
  // エラーケーステスト
  // ビルド検証テスト
  // パフォーマンステスト
});
```

**テスト対象**:
- MCP Server プロジェクト生成
- CLI Rust プロジェクト生成  
- Web Next.js プロジェクト生成
- API FastAPI プロジェクト生成

### 2. プロジェクトタイプ別検証テスト (`project-types.test.ts`)

```typescript
describe('Project Type Specific Verification Tests', () => {
  // プロジェクトタイプ別詳細検証
  // 依存関係検証
  // 設定ファイル検証
  // プロジェクト構造検証
  // クロスプロジェクト比較
});
```

**検証項目**:
- 必須ファイル存在確認
- 依存関係の正確性
- 設定ファイルの妥当性
- プロジェクト構造の一貫性

## ⚙️ 設定オプション

### 環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `KEEP_TEST_OUTPUT` | テスト出力ディレクトリを保持 | `false` |
| `RUN_BUILD_TESTS` | ビルド検証を実行 | `false` |
| `CI` | CI環境での実行 | `false` |

### Jest設定カスタマイズ

`jest.config.cjs`で以下の設定が可能：

```javascript
module.exports = {
  // カバレッジ閾値設定
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 85,
      statements: 85
    }
  },
  
  // テストタイムアウト
  testTimeout: 60000,
  
  // 並行実行制御
  maxWorkers: 1
};
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドテストの失敗

**症状**: `npm run test:e2e:build` でタイムアウトエラー

**解決方法**:
```bash
# Rustツールチェインの確認
rustc --version

# Node.jsのバージョン確認
node --version

# 依存関係の再インストール
npm ci
```

#### 2. メモリ不足エラー

**症状**: `JavaScript heap out of memory`

**解決方法**:
```bash
# Node.jsのメモリ制限を増加
NODE_OPTIONS="--max-old-space-size=4096" npm run test:e2e:fast

# または並行実行を無効化
# jest.config.cjs で maxWorkers: 1 に設定
```

#### 3. テンプレート変数検出の誤検知

**症状**: Layer 3変数（`[YOUR_*]`）がエラーとして報告される

**解決方法**:
```typescript
// projectVerifier.ts の verifyTemplateVariables メソッドで
// Layer 3変数の判定ロジックを確認
if (match.startsWith('[YOUR_') || match.includes('<!-- 例:')) {
  result.warnings.push(`テンプレート変数が残っています（ユーザー記入用）: ${file}: ${match}`);
} else {
  result.errors.push(`未置換のテンプレート変数が見つかりました: ${file}: ${match}`);
}
```

#### 4. プロジェクト生成の失敗

**症状**: `generateProject` 関数でエラー

**確認項目**:
1. スケルトン生成スクリプトのパス確認
2. 出力ディレクトリの権限確認
3. 実行コマンドの引数確認

```bash
# スケルトン生成の手動実行で確認
node scripts/scaffold-generator.js --name="test-project" --type="mcp-server" --output="./test-output" --skip-interactive --force
```

## 📈 パフォーマンス最適化

### 実行時間の短縮

1. **ビルド検証のスキップ**:
   ```bash
   # 開発中は高速テストを使用
   npm run test:e2e:fast
   ```

2. **並行実行の制御**:
   ```javascript
   // jest.config.cjs
   maxWorkers: process.env.CI ? 1 : require('os').cpus().length
   ```

3. **テストの分割実行**:
   ```bash
   # プロジェクトタイプ別に実行
   npm run test:jest -- --testNamePattern="mcp-server"
   npm run test:jest -- --testNamePattern="cli-rust"
   ```

### メモリ使用量の最適化

1. **テスト出力の自動クリーンアップ**:
   ```bash
   # 各テスト後にクリーンアップ実行
   npm run clean:test
   ```

2. **大きなファイルの除外**:
   ```javascript
   // jest.config.cjs
   transformIgnorePatterns: [
     'node_modules/(?!(chalk|ora|inquirer)/)',
   ]
   ```

## 🎯 品質ゲートとの連携

E2Eテストの結果は品質ゲートシステムと連携します：

### カバレッジ目標
- **グローバル**: 85%以上
- **ProjectVerifier**: 90%以上
- **E2Eテスト**: 全プロジェクトタイプカバー

### 品質スコアへの寄与
- **コード品質軸**: +3点（テスト網羅率向上）
- **総合品質**: 82点 → 85点（A-ランク達成）

### CI/CDでの自動実行

GitHub Actionsで以下のワークフローが自動実行されます：

1. **Pull Request**: 高速E2Eテスト
2. **Main Push**: 完全E2Eテスト（ビルド含む）
3. **Nightly**: 全プロジェクトタイプの包括的検証

## 📚 関連ドキュメント

- [品質ゲートライン](QUALITY-GATE.md)
- [依存関係管理ガイド](DEPENDENCY-LOCKFILE-GUIDE.md)
- [プロジェクト構造](PROJECT-STRUCTURE.md)
- [コントリビューションガイド](../CONTRIBUTING.md)

## 🔗 参考リンク

- **Issue #20**: [生成結果の完全性検証とE2Eテスト](https://github.com/daktu32/ai-driven-dev-starter-kit/issues/20)
- **Jest公式ドキュメント**: https://jestjs.io/docs/configuration
- **GitHub Actions**: https://docs.github.com/en/actions