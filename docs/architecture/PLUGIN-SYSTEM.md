# プラグインシステム ドキュメント

AI Driven Dev Starter Kit のプラグインシステムは、プロジェクトテンプレートを拡張可能な方式で管理・提供するためのアーキテクチャです。

## 概要

プラグインシステムにより、以下が可能になります：

- **拡張性**: 新しいプロジェクトタイプのテンプレートを独立したプラグインとして追加
- **モジュール性**: 各テンプレートが独立したプラグインとして動作
- **設定可能性**: プラグインごとに柔軟な設定オプションを提供
- **保守性**: プラグインの個別開発・更新・デバッグが容易

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                 PluginScaffoldGenerator                    │
│                    (CLI インターフェース)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                  PluginManager                             │
│              (プラグイン管理・実行)                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                 PluginContext                              │
│               (共通機能・API提供)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Plugin                                  │
│              (各テンプレート実装)                             │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│  │ mcp-server  │ web-nextjs  │ api-fastapi │ cli-rust    │   │
│  │   Plugin    │   Plugin    │   Plugin    │   Plugin    │   │
│  └─────────────┴─────────────┴─────────────┴─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 主要コンポーネント

### 1. Plugin Interface (src/plugin/types.ts)

すべてのプラグインが実装する必要がある基本インターフェース：

```typescript
interface Plugin {
  readonly metadata: PluginMetadata;
  
  initialize(context: PluginContext): Promise<void>;
  cleanup?(): Promise<void>;
  
  getProjectTemplates(): ProjectTemplate[];
  generateScaffold(template: ProjectTemplate, options: ScaffoldOptions, context: PluginContext): Promise<ScaffoldResult>;
  
  executeCommand?(command: string, args: string[], context: PluginContext): Promise<any>;
  getConfigSchema?(): ConfigOption[];
  healthCheck?(context: PluginContext): Promise<HealthCheckResult>;
}
```

### 2. PluginManager (src/plugin/PluginManager.ts)

プラグインのロード、管理、実行を担当：

- **プラグインの自動検索・ロード**
- **プラグインライフサイクル管理**
- **テンプレート登録・管理**
- **スケルトン生成の実行**
- **エラーハンドリング**

### 3. PluginContext (src/plugin/PluginContext.ts)

プラグインが利用できる共通機能を提供：

- **ログ機能**: 構造化ログ出力
- **ファイルシステム**: 安全なファイル操作
- **設定管理**: プラグイン設定の読み書き
- **テンプレート処理**: プレースホルダー置換
- **ユーザーインターフェース**: プロンプト・進捗表示

### 4. PluginScaffoldGenerator (src/PluginScaffoldGenerator.ts)

プラグインシステム対応のCLIインターフェース：

- **プラグインマネージャーの初期化**
- **対話的なテンプレート選択**
- **設定オプションの収集**
- **スケルトン生成の実行**

## 利用可能なプラグイン

### 1. MCP Server Plugin (plugins/mcp-server-plugin/)

Model Context Protocol サーバーのテンプレート：

- **技術スタック**: TypeScript + Node.js
- **特徴**: MCP仕様準拠、Tools/Resources実装
- **設定オプション**: サーバー名、サンプル機能、認証、ログレベル

### 2. Web Next.js Plugin (plugins/web-nextjs-plugin/)

Next.js Webアプリケーションのテンプレート：

- **技術スタック**: Next.js + TypeScript + React
- **特徴**: App Router、レスポンシブ対応
- **設定オプション**: UIフレームワーク、状態管理、認証、データベース

### 3. API FastAPI Plugin (plugins/api-fastapi-plugin/)

FastAPI REST APIのテンプレート：

- **技術スタック**: FastAPI + Python
- **特徴**: OpenAPI自動生成、async対応
- **設定オプション**: データベース、ORM、認証、CORS、Docker

### 4. CLI Rust Plugin (plugins/cli-rust-plugin/)

Rust CLI ツールのテンプレート：

- **技術スタック**: Rust + Clap
- **特徴**: 高性能、クロスプラットフォーム
- **設定オプション**: CLIフレームワーク、非同期ランタイム、シリアライゼーション

## 使用方法

### 基本的な使用

```bash
# プラグインシステム対応の生成ツールを使用
npm run scaffold:plugin

# コマンドライン引数での指定
npm run scaffold:plugin -- --project-name=my-api --template-id=api-fastapi
```

### 利用可能なテンプレートの確認

```bash
# プラグインマネージャーの初期化時にロード済みプラグインが表示される
npm run scaffold:plugin
```

### プラグイン固有の設定

各プラグインは独自の設定オプションを提供します：

- **mcp-server**: サーバー名、サンプル機能の有無、認証設定
- **web-nextjs**: UIフレームワーク、状態管理ライブラリ、データベース連携
- **api-fastapi**: データベース種類、ORM選択、Docker設定
- **cli-rust**: CLIフレームワーク、非同期ランタイム、ベンチマーク設定

## プラグイン開発

### 新しいプラグインの作成

1. **プラグインディレクトリの作成**:
   ```
   plugins/my-plugin/
   ├── index.ts          # プラグインエントリーポイント
   ├── templates/        # テンプレートファイル（オプション）
   └── package.json      # プラグインメタデータ（オプション）
   ```

2. **プラグインクラスの実装**:
   ```typescript
   import { Plugin, PluginMetadata, ProjectTemplate, /* ... */ } from '../../src/plugin/types.js';

   class MyPlugin implements Plugin {
     readonly metadata: PluginMetadata = {
       id: 'my-plugin',
       name: 'My Plugin',
       version: '1.0.0',
       description: 'My custom project template',
       author: 'Your Name',
       license: 'MIT'
     };

     async initialize(context: PluginContext): Promise<void> {
       // プラグイン初期化処理
     }

     getProjectTemplates(): ProjectTemplate[] {
       // 提供するテンプレートの定義
     }

     async generateScaffold(template: ProjectTemplate, options: ScaffoldOptions, context: PluginContext): Promise<ScaffoldResult> {
       // スケルトン生成ロジック
     }
   }

   export default new MyPlugin();
   ```

### プラグインのベストプラクティス

1. **エラーハンドリング**: 適切なエラーメッセージとログ出力
2. **設定検証**: ユーザー入力の妥当性検証
3. **ヘルスチェック**: プラグインの動作確認機能実装
4. **テンプレート最適化**: プレースホルダーの適切な使用
5. **ドキュメント**: プラグイン固有の使用方法とオプションの説明

## 設定とカスタマイズ

### プラグインマネージャー設定

```typescript
const config: PluginManagerConfig = {
  pluginDir: './plugins',           // プラグインディレクトリ
  autoLoad: true,                   // 自動ロード有効
  enableCache: true,                // キャッシュ有効
  maxPlugins: 50,                   // 最大プラグイン数
  timeout: 30000                    // タイムアウト時間（ms）
};
```

### 環境変数

- `PLUGIN_CONFIG_FILE`: プラグイン設定ファイルパス
- `LOG_LEVEL`: ログレベル (debug, info, warn, error)

## トラブルシューティング

### よくある問題

1. **プラグインロードエラー**:
   - プラグインファイルの構文エラー
   - 必須メソッドの未実装
   - 依存関係の不足

2. **テンプレート生成エラー**:
   - テンプレートファイルの不足
   - プレースホルダーの不正な形式
   - ファイル権限の問題

3. **設定エラー**:
   - 不正な設定値
   - 必須設定の未入力
   - 型の不一致

### デバッグ方法

1. **ログレベルの設定**:
   ```bash
   DEBUG=* npm run scaffold:plugin
   ```

2. **ヘルスチェックの実行**:
   ```typescript
   const healthResults = await pluginManager.healthCheck();
   ```

3. **個別プラグインのテスト**:
   ```typescript
   const plugin = await loadPlugin('./plugins/my-plugin/index.ts');
   ```

## 今後の拡張予定

- **プラグインレジストリ**: 外部プラグインの管理・配布
- **プラグインバージョニング**: プラグインのバージョン管理
- **動的ロード**: 実行時のプラグイン追加・削除
- **依存関係管理**: プラグイン間の依存関係解決
- **設定UI**: Webベースの設定インターフェース

## APIリファレンス

詳細なAPI仕様については、以下のファイルを参照してください：

- [型定義](../../src/plugin/types.ts)
- [プラグインマネージャー](../../src/plugin/PluginManager.ts)
- [プラグインコンテキスト](../../src/plugin/PluginContext.ts)
- [ユーティリティ](../../src/plugin/utils.ts)

## ライセンス

このプラグインシステムは MIT ライセンスの下で提供されています。