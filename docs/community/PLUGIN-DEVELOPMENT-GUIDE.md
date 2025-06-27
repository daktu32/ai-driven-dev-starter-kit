# プラグイン開発ガイド - コミュニティ貢献者向け

AI Driven Dev Starter Kitのプラグインシステムへの貢献を歓迎します！このガイドでは、高品質なプラグインを開発し、コミュニティと共有するための包括的な手順を説明します。

## 🚀 はじめに

### プラグインシステムの価値

- **拡張性**: 新しいプロジェクトタイプやフレームワークのサポート追加
- **再利用性**: 組織やチーム固有のベストプラクティスの共有
- **標準化**: 一貫したプロジェクト構造とワークフローの提供
- **コミュニティ**: 知識とツールの集合的な向上

### 貢献の種類

1. **新しいプロジェクトタイプのプラグイン**
2. **既存プラグインの機能拡張**
3. **ユーティリティプラグイン** (ツール、設定、ワークフロー)
4. **業界特化プラグイン** (金融、医療、教育など)
5. **地域特化プラグイン** (法的要件、言語設定など)

## 📋 事前準備

### 開発環境のセットアップ

```bash
# リポジトリのフォーク・クローン
git clone https://github.com/YOUR-USERNAME/ai-driven-dev-starter-kit.git
cd ai-driven-dev-starter-kit

# 依存関係のインストール
npm install

# 開発環境の確認
npm run test:plugin
```

### 必要な知識・スキル

- **TypeScript**: プラグインはTypeScriptで開発
- **Node.js**: ファイルシステム操作、非同期処理
- **Git**: バージョン管理とコラボレーション
- **対象技術スタック**: 開発するプラグインに関連する技術

## 🏗️ プラグイン開発プロセス

### 1. プラニング・設計フェーズ

#### 1.1 要件定義

プラグイン開発前に以下を明確にしてください：

```markdown
## プラグイン提案テンプレート

### 基本情報
- **プラグイン名**: 
- **対象技術スタック**: 
- **プラグインカテゴリ**: (web, mobile, api, cli, tool, industry-specific)
- **想定ユーザー**: 

### 機能要件
- **コアテンプレート**: 
- **設定オプション**: 
- **生成されるファイル構造**: 
- **依存関係**: 

### 非機能要件
- **パフォーマンス要件**: 
- **セキュリティ考慮事項**: 
- **拡張性**: 

### 成功指標
- **ユーザビリティ**: 
- **保守性**: 
- **コミュニティ受け入れ**: 
```

#### 1.2 既存プラグインの調査

重複や競合を避けるため、既存プラグインを確認：

```bash
# 既存プラグインの一覧確認
ls plugins/
cat plugins/*/index.ts | grep -A5 "metadata:"
```

#### 1.3 設計ドキュメントの作成

`docs/community/proposals/` にプラグイン提案書を作成：

```markdown
# [プラグイン名] プラグイン設計書

## 概要
[プラグインの目的と価値提案]

## アーキテクチャ
[技術設計とコンポーネント構成]

## API設計
[設定オプションとインターフェース]

## ファイル構造
[生成されるプロジェクト構造]

## 実装計画
[開発スケジュールとマイルストーン]
```

### 2. 実装フェーズ

#### 2.1 プラグインディレクトリ構造の作成

```bash
# プラグインディレクトリの作成
mkdir plugins/your-plugin-name-plugin
cd plugins/your-plugin-name-plugin

# 基本ファイルの作成
touch index.ts
mkdir templates test docs
```

推奨ディレクトリ構造：

```
plugins/your-plugin-name-plugin/
├── index.ts                 # メインプラグインファイル
├── README.md               # プラグイン固有のドキュメント
├── package.json            # プラグインメタデータ（オプション）
├── templates/              # テンプレートファイル（オプション）
│   ├── base/              # 基本テンプレート
│   ├── advanced/          # 高度な設定用テンプレート
│   └── examples/          # サンプルファイル
├── test/                   # プラグイン固有のテスト
│   ├── integration.test.ts
│   └── fixtures/
└── docs/                   # 詳細ドキュメント
    ├── configuration.md
    ├── examples.md
    └── troubleshooting.md
```

#### 2.2 プラグインクラスの実装

基本的なプラグイン構造：

```typescript
import type { 
  Plugin, 
  PluginMetadata, 
  ProjectTemplate, 
  ScaffoldOptions, 
  ScaffoldResult, 
  PluginContext,
  ConfigOption,
  HealthCheckResult 
} from '../../src/plugin/types.js';

/**
 * [プラグイン名] プラグイン
 * [プラグインの目的と機能の説明]
 */
class YourPluginNamePlugin implements Plugin {
  readonly metadata: PluginMetadata = {
    id: 'your-plugin-name',
    name: 'Your Plugin Name',
    version: '1.0.0',
    description: 'Brief description of your plugin',
    author: 'Your Name <your.email@example.com>',
    license: 'MIT',
    tags: ['tag1', 'tag2', 'tag3'],
    dependencies: [], // 他プラグインへの依存関係
    minimumKitVersion: '1.0.0'
  };

  private context: PluginContext | null = null;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    
    // 初期化ロジック
    context.logger.info('Plugin initialized', {
      pluginId: this.metadata.id,
      version: this.metadata.version
    });

    // 必要な依存関係の確認
    await this.validateDependencies(context);
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      this.context.logger.info('Plugin cleanup completed', {
        pluginId: this.metadata.id
      });
    }
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'your-template-id',
        name: 'Your Template Name',
        description: 'Template description',
        category: 'web', // or 'mobile', 'api', 'cli', 'tool'
        templatePath: 'templates/project-structures/your-template',
        requirements: this.getRequirements(),
        configOptions: this.getConfigOptions()
      }
      // 複数のテンプレートを提供可能
    ];
  }

  private getRequirements(): TemplateRequirement[] {
    return [
      {
        name: 'Node.js',
        version: '>=18.0.0',
        description: 'JavaScript runtime',
        checkCommand: 'node --version',
        installUrl: 'https://nodejs.org/'
      }
      // 他の要件も追加
    ];
  }

  private getConfigOptions(): ConfigOption[] {
    return [
      {
        name: 'projectName',
        type: 'string',
        description: 'Project name',
        defaultValue: 'my-project',
        required: true,
        validation: {
          pattern: '^[a-z][a-z0-9-]*$',
          message: 'Project name must start with lowercase letter'
        }
      },
      {
        name: 'framework',
        type: 'select',
        description: 'Choose framework',
        defaultValue: 'default',
        required: true,
        options: [
          { label: 'Default Framework', value: 'default' },
          { label: 'Alternative Framework', value: 'alternative' }
        ]
      },
      {
        name: 'features',
        type: 'multiselect',
        description: 'Additional features',
        defaultValue: [],
        required: false,
        options: [
          { label: 'Feature 1', value: 'feature1' },
          { label: 'Feature 2', value: 'feature2' }
        ]
      },
      {
        name: 'enableAdvanced',
        type: 'boolean',
        description: 'Enable advanced configuration',
        defaultValue: false,
        required: false
      }
    ];
  }

  async generateScaffold(
    template: ProjectTemplate,
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<ScaffoldResult> {
    try {
      context.logger.info('Starting scaffold generation', {
        templateId: template.id,
        projectName: options.projectName,
        targetPath: options.targetPath
      });

      const generatedFiles: string[] = [];
      const warnings: string[] = [];

      // 1. ディレクトリ構造の作成
      await this.createDirectoryStructure(options, context);

      // 2. 基本ファイルの生成
      await this.generateBaseFiles(options, context, generatedFiles);

      // 3. 設定に基づく条件的ファイル生成
      await this.generateConditionalFiles(options, context, generatedFiles, warnings);

      // 4. テンプレート処理
      await this.processTemplates(options, context, generatedFiles);

      // 5. 後処理（ファイル権限、最終検証など）
      await this.postProcess(options, context, warnings);

      context.logger.info('Scaffold generation completed', {
        generatedFiles: generatedFiles.length,
        warnings: warnings.length
      });

      return {
        success: true,
        generatedFiles,
        warnings,
        nextSteps: this.getNextSteps(options)
      };

    } catch (error) {
      context.logger.error('Scaffold generation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        templateId: template.id
      });

      return {
        success: false,
        generatedFiles: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async createDirectoryStructure(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    const directories = [
      'src',
      'src/components',
      'src/utils',
      'tests',
      'docs'
      // プロジェクトに必要なディレクトリを定義
    ];

    for (const dir of directories) {
      const dirPath = join(options.targetPath, dir);
      await context.fileSystem.ensureDir(dirPath);
    }
  }

  private async generateBaseFiles(
    options: ScaffoldOptions,
    context: PluginContext,
    generatedFiles: string[]
  ): Promise<void> {
    // package.json
    const packageJson = this.generatePackageJson(options);
    await context.fileSystem.writeFile(
      join(options.targetPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    generatedFiles.push('package.json');

    // README.md
    const readmeContent = this.generateReadme(options);
    await context.fileSystem.writeFile(
      join(options.targetPath, 'README.md'),
      readmeContent
    );
    generatedFiles.push('README.md');

    // その他の基本ファイル
  }

  private async generateConditionalFiles(
    options: ScaffoldOptions,
    context: PluginContext,
    generatedFiles: string[],
    warnings: string[]
  ): Promise<void> {
    // 設定オプションに基づく条件的なファイル生成
    if (options.options.enableAdvanced) {
      await this.generateAdvancedConfiguration(options, context, generatedFiles);
    }

    // 選択された機能に基づくファイル生成
    const features = options.options.features || [];
    for (const feature of features) {
      try {
        await this.generateFeatureFiles(feature, options, context, generatedFiles);
      } catch (error) {
        warnings.push(`Failed to generate feature "${feature}": ${error}`);
      }
    }
  }

  private async processTemplates(
    options: ScaffoldOptions,
    context: PluginContext,
    generatedFiles: string[]
  ): Promise<void> {
    // テンプレートファイルの処理
    const templateVariables = this.getTemplateVariables(options);
    
    // PRD.md の生成
    const prdTemplate = await context.fileSystem.readFile('templates/PRD.md.template');
    const prdContent = context.templateProcessor.processTemplate(prdTemplate, templateVariables);
    await context.fileSystem.writeFile(
      join(options.targetPath, 'PRD.md'),
      prdContent
    );
    generatedFiles.push('PRD.md');

    // ARCHITECTURE.md の生成
    const archTemplate = await context.fileSystem.readFile(
      `templates/project-structures/${template.id}/ARCHITECTURE.md.template`
    );
    const archContent = context.templateProcessor.processTemplate(archTemplate, templateVariables);
    await context.fileSystem.writeFile(
      join(options.targetPath, 'ARCHITECTURE.md'),
      archContent
    );
    generatedFiles.push('ARCHITECTURE.md');
  }

  private async postProcess(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // 生成後の処理（ファイル権限設定、検証など）
    
    // 実行可能ファイルの権限設定
    const executableFiles = ['scripts/start.sh', 'scripts/build.sh'];
    for (const file of executableFiles) {
      const filePath = join(options.targetPath, file);
      if (await context.fileSystem.exists(filePath)) {
        // ファイル権限の設定（Node.jsのfs.chmodを使用）
      }
    }

    // 生成されたファイルの整合性チェック
    await this.validateGeneratedProject(options, context, warnings);
  }

  private getTemplateVariables(options: ScaffoldOptions): Record<string, string> {
    return {
      PROJECT_NAME: options.projectName,
      PROJECT_CLASS_NAME: this.toPascalCase(options.projectName),
      PROJECT_TYPE: 'Your Project Type',
      DATE: new Date().toISOString().split('T')[0],
      // カスタム変数を追加
      FRAMEWORK: options.options.framework,
      FEATURES: JSON.stringify(options.options.features || [])
    };
  }

  private toPascalCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => 
      char ? char.toUpperCase() : ''
    ).replace(/^(.)/, char => char.toUpperCase());
  }

  private getNextSteps(options: ScaffoldOptions): NextStep[] {
    return [
      {
        title: 'Install Dependencies',
        description: 'Install required dependencies',
        command: 'npm install',
        category: 'setup'
      },
      {
        title: 'Review PRD',
        description: 'Complete the Product Requirements Document',
        file: 'PRD.md',
        category: 'planning'
      },
      {
        title: 'Start Development',
        description: 'Begin implementing your project',
        command: 'npm run dev',
        category: 'development'
      }
    ];
  }

  // オプション：カスタムコマンドの実装
  async executeCommand(
    command: string,
    args: string[],
    context: PluginContext
  ): Promise<any> {
    switch (command) {
      case 'validate':
        return this.validateProject(args[0], context);
      case 'upgrade':
        return this.upgradeProject(args[0], context);
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  // オプション：ヘルスチェックの実装
  async healthCheck(context: PluginContext): Promise<HealthCheckResult> {
    try {
      const checks = [
        { name: 'Template Files', status: 'ok' },
        { name: 'Dependencies', status: 'ok' }
      ];

      return {
        healthy: true,
        details: { checks },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // プライベートメソッド（実装詳細）
  private async validateDependencies(context: PluginContext): Promise<void> {
    // 依存関係の検証ロジック
  }

  private generatePackageJson(options: ScaffoldOptions): any {
    // package.json生成ロジック
    return {
      name: options.projectName,
      version: '1.0.0',
      // その他の設定
    };
  }

  private generateReadme(options: ScaffoldOptions): string {
    // README.md生成ロジック
    return `# ${options.projectName}\n\nGenerated by Your Plugin Name`;
  }

  private async generateAdvancedConfiguration(
    options: ScaffoldOptions,
    context: PluginContext,
    generatedFiles: string[]
  ): Promise<void> {
    // 高度な設定ファイルの生成ロジック
  }

  private async generateFeatureFiles(
    feature: string,
    options: ScaffoldOptions,
    context: PluginContext,
    generatedFiles: string[]
  ): Promise<void> {
    // 機能別ファイル生成ロジック
  }

  private async validateGeneratedProject(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // プロジェクト検証ロジック
  }

  private async validateProject(projectPath: string, context: PluginContext): Promise<any> {
    // プロジェクト検証ロジック
  }

  private async upgradeProject(projectPath: string, context: PluginContext): Promise<any> {
    // プロジェクトアップグレードロジック
  }
}

export default new YourPluginNamePlugin();
```

### 3. テスト・検証フェーズ

#### 3.1 単体テストの作成

```typescript
// test/your-plugin.test.ts
import YourPluginNamePlugin from '../index';
import { PluginContextImpl } from '../../../src/plugin/PluginContext';

describe('YourPluginNamePlugin', () => {
  let plugin: typeof YourPluginNamePlugin;
  let context: PluginContextImpl;

  beforeEach(async () => {
    plugin = YourPluginNamePlugin;
    context = new PluginContextImpl();
    await plugin.initialize(context);
  });

  describe('metadata', () => {
    it('should have valid metadata', () => {
      expect(plugin.metadata.id).toBe('your-plugin-name');
      expect(plugin.metadata.name).toBeTruthy();
      expect(plugin.metadata.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('getProjectTemplates', () => {
    it('should return valid templates', () => {
      const templates = plugin.getProjectTemplates();
      expect(templates).toHaveLength(1);
      expect(templates[0].id).toBeTruthy();
      expect(templates[0].configOptions).toBeDefined();
    });
  });

  describe('generateScaffold', () => {
    it('should generate project successfully', async () => {
      const template = plugin.getProjectTemplates()[0];
      const options = {
        targetPath: '/tmp/test-project',
        projectName: 'test-project',
        projectType: template.id,
        options: {
          framework: 'default',
          enableAdvanced: false
        }
      };

      const result = await plugin.generateScaffold(template, options, context);
      
      expect(result.success).toBe(true);
      expect(result.generatedFiles.length).toBeGreaterThan(0);
      expect(result.nextSteps).toBeDefined();
    });
  });
});
```

#### 3.2 統合テストの実行

```bash
# プラグインシステムテストの実行
npm run test:plugin

# 新しいプラグインを含むテスト
npm run scaffold:plugin
```

#### 3.3 品質チェック

```bash
# TypeScriptコンパイル
npm run build

# リンティング
npm run lint

# フォーマット
npm run format
```

### 4. ドキュメント作成

#### 4.1 プラグインREADME.md

```markdown
# Your Plugin Name

Brief description of your plugin and its purpose.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

```bash
npm run scaffold:plugin
# Select "Your Plugin Name" from the list
```

## Configuration Options

### Basic Options

- **projectName** (string, required): Project name
- **framework** (select, required): Choose framework

### Advanced Options

- **enableAdvanced** (boolean): Enable advanced configuration
- **features** (multiselect): Additional features

## Generated Project Structure

```
your-project/
├── src/
├── tests/
├── docs/
├── package.json
└── README.md
```

## Requirements

- Node.js >= 18.0.0
- Additional requirements...

## Examples

### Basic Project

```bash
npm run scaffold:plugin
# Choose basic configuration
```

### Advanced Project

```bash
npm run scaffold:plugin
# Enable advanced features
```

## Troubleshooting

### Common Issues

1. **Issue 1**: Solution description
2. **Issue 2**: Solution description

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../CONTRIBUTING.md).

## License

MIT
```

#### 4.2 設定・例・トラブルシューティングドキュメント

各プラグインに `docs/` ディレクトリを作成し、詳細ドキュメントを追加：

- `configuration.md`: 設定オプションの詳細
- `examples.md`: 使用例とサンプルコード  
- `troubleshooting.md`: よくある問題と解決策
- `migration.md`: バージョン間の移行ガイド

## 🔍 品質ガイドライン

### コード品質

1. **TypeScript最適化**
   - 厳密な型定義
   - null/undefined チェック
   - 適切なエラーハンドリング

2. **パフォーマンス**
   - 大きなファイル処理時のストリーミング
   - 不要な依存関係の回避
   - メモリ効率的な実装

3. **セキュリティ**
   - ユーザー入力の適切な検証
   - パストラバーサル攻撃の防止
   - 機密情報の適切な取り扱い

### ユーザビリティ

1. **設定オプション**
   - 分かりやすい説明文
   - 適切なデフォルト値
   - 入力検証とエラーメッセージ

2. **生成されるプロジェクト**
   - 一貫したファイル構造
   - 明確なドキュメント
   - 即座に動作する状態

3. **エラーハンドリング**
   - 分かりやすいエラーメッセージ
   - 復旧方法の提示
   - 適切なログ出力

### 保守性

1. **ドキュメント**
   - 包括的なREADME
   - インライン comment
   - 変更履歴の管理

2. **テスト**
   - 適切なテストカバレッジ
   - エッジケースの考慮
   - 継続的な検証

## 📤 貢献・公開プロセス

### 1. プルリクエストの準備

```bash
# 機能ブランチの作成
git checkout -b feature/your-plugin-name

# 変更のコミット
git add plugins/your-plugin-name-plugin/
git commit -m "feat: add Your Plugin Name plugin

- Implement basic project generation
- Add configuration options
- Include comprehensive documentation
- Add unit and integration tests"

# プッシュ
git push origin feature/your-plugin-name
```

### 2. プルリクエストの作成

プルリクエストには以下を含めてください：

```markdown
## プラグイン追加: Your Plugin Name

### 概要
[プラグインの目的と機能の説明]

### 変更内容
- [ ] プラグイン実装 (`plugins/your-plugin-name-plugin/`)
- [ ] テストの追加
- [ ] ドキュメントの作成
- [ ] サンプル・例の提供

### テスト結果
- [ ] 単体テスト: PASS
- [ ] 統合テスト: PASS  
- [ ] 品質チェック: PASS

### 追加情報
- 対象技術スタック: [技術名]
- 想定ユーザー: [ユーザータイプ]
- 関連Issue: #[issue番号]

### チェックリスト
- [ ] コードレビュー準備完了
- [ ] ドキュメント作成完了
- [ ] テスト作成・実行完了
- [ ] 品質ガイドライン準拠確認
```

### 3. レビュープロセス

レビューでは以下が確認されます：

1. **機能性**: プラグインが期待通りに動作するか
2. **品質**: コード品質、テスト、ドキュメント
3. **一貫性**: 既存プラグインとの一貫性
4. **セキュリティ**: セキュリティ問題の有無
5. **パフォーマンス**: パフォーマンスへの影響

### 4. リリースプロセス

承認されたプラグインは以下のプロセスでリリースされます：

1. **マージ**: mainブランチへのマージ
2. **ドキュメント更新**: 公式ドキュメントへの追加
3. **リリースノート**: 変更履歴への記載
4. **コミュニティ告知**: 新プラグインの発表

## 📞 サポート・コミュニケーション

### サポートチャネル

1. **GitHub Issues**: バグ報告、機能要求
2. **GitHub Discussions**: 質問、アイデア交換
3. **プルリクエスト**: コードレビュー、議論

### コミュニティガイドライン

1. **尊重**: 他の貢献者を尊重し、建設的なフィードバックを提供
2. **協力**: 知識とアイデアを積極的に共有
3. **継続**: 長期的なプロジェクト改善に貢献
4. **多様性**: 異なる背景と経験を歓迎

## 🎯 貢献アイデア

### 求められているプラグイン

- **Frontend Frameworks**: Vue.js, Angular, Svelte
- **Mobile Development**: Flutter, Ionic, React Native (Windows)
- **Backend Frameworks**: Spring Boot, Django, Laravel
- **DevOps Tools**: Terraform, Kubernetes, Docker Compose
- **Database Solutions**: PostgreSQL, MongoDB, Redis
- **Industry-Specific**: 金融、医療、教育、政府機関向け

### 改善機会

- **国際化**: 多言語サポート
- **アクセシビリティ**: 障害者対応
- **パフォーマンス**: 最適化とスケーラビリティ
- **セキュリティ**: セキュリティ強化

## 📚 参考資料

- [プラグインシステム設計](../architecture/PLUGIN-SYSTEM.md)
- [プラグイン開発例](../examples/plugin-development-example.md)
- [API リファレンス](../../src/plugin/types.ts)
- [既存プラグイン](../../plugins/)
- [コントリビューションガイド](../CONTRIBUTING.md)

---

**貢献をお待ちしています！** 🚀

AI Driven Dev Starter Kit コミュニティの一員として、より良い開発体験を一緒に作り上げましょう。