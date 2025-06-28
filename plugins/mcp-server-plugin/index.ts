/**
 * MCP Server プラグイン
 * 
 * Model Context Protocol (MCP) サーバープロジェクトのテンプレートを提供するプラグイン
 */

import * as path from 'path';
import {
  Plugin,
  PluginMetadata,
  ProjectTemplate,
  ScaffoldOptions,
  ScaffoldResult,
  PluginContext,
  TemplateCategory,
  NextStep,
  ConfigOption
} from '../../src/plugin/types.js';

/**
 * MCP Server プラグインのメタデータ
 */
const metadata: PluginMetadata = {
  id: 'mcp-server',
  name: 'MCP Server Template',
  version: '1.0.0',
  description: 'Model Context Protocol (MCP) サーバープロジェクトのテンプレートを提供します',
  author: 'AI Driven Dev Starter Kit',
  license: 'MIT',
  tags: ['mcp', 'server', 'typescript', 'node.js'],
  minimumKitVersion: '1.0.0'
};

/**
 * MCP Server プラグイン実装
 */
class McpServerPlugin implements Plugin {
  readonly metadata = metadata;
  private context!: PluginContext;
  private templatePath!: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.templatePath = path.resolve(__dirname, 'templates');
    
    context.logger.info(`MCPサーバープラグインが初期化されました: v${this.metadata.version}`);
    
    // テンプレートディレクトリの存在確認
    if (!(await context.fileSystem.exists(this.templatePath))) {
      context.logger.warn(`テンプレートディレクトリが見つかりません: ${this.templatePath}`);
      // 開発時はテンプレートを既存パスから参照
      this.templatePath = path.resolve(__dirname, '../../templates/project-structures/mcp-server');
    }
  }

  async cleanup(): Promise<void> {
    this.context.logger.info('MCPサーバープラグインのクリーンアップが完了しました');
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'mcp-server',
        name: 'MCP Server',
        description: 'Model Context Protocol (MCP) サーバーのプロジェクトテンプレート',
        category: 'mcp-server' as TemplateCategory,
        templatePath: this.templatePath,
        requirements: [
          {
            type: 'runtime',
            name: 'Node.js',
            versionRange: '>=18.0.0',
            required: true,
            installInstructions: 'https://nodejs.org から Node.js をインストールしてください'
          },
          {
            type: 'tool',
            name: 'npm',
            versionRange: '>=8.0.0',
            required: true,
            installInstructions: 'Node.js と一緒にインストールされます'
          },
          {
            type: 'dependency',
            name: '@modelcontextprotocol/sdk',
            versionRange: '>=1.0.0',
            required: true,
            installInstructions: 'package.json に自動的に含まれます'
          }
        ],
        configOptions: [
          {
            name: 'serverName',
            type: 'string',
            description: 'MCPサーバーの名前',
            defaultValue: 'my-mcp-server',
            required: true,
            validation: {
              pattern: '^[a-zA-Z0-9-_]+$',
              min: 3,
              max: 50
            }
          },
          {
            name: 'includeExampleTools',
            type: 'boolean',
            description: 'サンプルツール実装を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'includeExampleResources',
            type: 'boolean',
            description: 'サンプルリソース実装を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'authRequired',
            type: 'boolean',
            description: '認証機能を含めるか',
            defaultValue: false,
            required: false
          },
          {
            name: 'logLevel',
            type: 'select',
            description: 'ログレベルの設定',
            defaultValue: 'info',
            required: false,
            choices: [
              { value: 'debug', label: 'Debug', description: '詳細なデバッグ情報' },
              { value: 'info', label: 'Info', description: '通常の情報' },
              { value: 'warn', label: 'Warning', description: '警告のみ' },
              { value: 'error', label: 'Error', description: 'エラーのみ' }
            ]
          }
        ]
      }
    ];
  }

  async generateScaffold(
    template: ProjectTemplate,
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<ScaffoldResult> {
    const progress = context.userInterface.showProgress('MCPサーバープロジェクトを生成中...');
    
    try {
      // 生成されるファイル一覧
      const generatedFiles: string[] = [];
      
      // プレースホルダー変数の準備
      const variables = this.prepareTemplateVariables(options);
      
      // テンプレートディレクトリの処理
      progress.update('テンプレートファイルをコピー中...');
      await context.templateProcessor.processTemplateDirectory(
        template.templatePath,
        options.targetPath,
        variables
      );
      
      // 生成されたファイルリストを収集
      await this.collectGeneratedFiles(options.targetPath, generatedFiles, context);
      
      // プロジェクト固有の後処理
      progress.update('プロジェクト固有の設定を適用中...');
      await this.applyProjectSpecificConfig(options, context);
      
      // 次のステップ情報を準備
      const nextSteps = this.prepareNextSteps(options);
      
      progress.succeed('MCPサーバープロジェクトの生成が完了しました');
      
      return {
        success: true,
        generatedFiles,
        nextSteps,
        warnings: []
      };
      
    } catch (error) {
      progress.fail('MCPサーバープロジェクトの生成に失敗しました');
      
      return {
        success: false,
        generatedFiles: [],
        error: error instanceof Error ? error.message : String(error),
        warnings: []
      };
    }
  }

  /**
   * テンプレート変数の準備
   */
  private prepareTemplateVariables(options: ScaffoldOptions): Record<string, string> {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // プロジェクト名からクラス名を生成
    const className = options.projectName
      .replace(/-/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (c) => c.toUpperCase());
    
    return {
      PROJECT_NAME: options.projectName,
      PROJECT_CLASS_NAME: className,
      PROJECT_DESCRIPTION: `${options.projectName} - MCP Server generated by AI Driven Dev Starter Kit`,
      DATE: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
      AUTHOR: 'Your Name',
      MCP_SERVER_NAME: options.options.serverName || options.projectName,
      LOG_LEVEL: options.options.logLevel || 'info',
      INCLUDE_EXAMPLE_TOOLS: options.options.includeExampleTools ? 'true' : 'false',
      INCLUDE_EXAMPLE_RESOURCES: options.options.includeExampleResources ? 'true' : 'false',
      AUTH_REQUIRED: options.options.authRequired ? 'true' : 'false'
    };
  }

  /**
   * 生成されたファイルの収集
   */
  private async collectGeneratedFiles(
    targetPath: string, 
    fileList: string[], 
    context: PluginContext
  ): Promise<void> {
    const collectFilesRecursively = async (dirPath: string) => {
      const entries = await context.fileSystem.readDir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stat = await context.fileSystem.exists(fullPath);
        
        if (stat) {
          // ファイルパスを相対パスに変換
          const relativePath = path.relative(targetPath, fullPath);
          fileList.push(relativePath);
          
          // ディレクトリの場合は再帰的に処理
          try {
            await collectFilesRecursively(fullPath);
          } catch (error) {
            // ファイルの場合はスキップ
          }
        }
      }
    };
    
    await collectFilesRecursively(targetPath);
  }

  /**
   * プロジェクト固有の設定適用
   */
  private async applyProjectSpecificConfig(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    // package.json の更新
    const packageJsonPath = path.join(options.targetPath, 'package.json');
    
    if (await context.fileSystem.exists(packageJsonPath)) {
      const packageJsonContent = await context.fileSystem.readFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonContent);
      
      // プロジェクト名の更新
      packageJson.name = options.projectName.toLowerCase().replace(/\s+/g, '-');
      packageJson.description = `${options.projectName} - MCP Server generated by AI Driven Dev Starter Kit`;
      
      // オプションに応じた依存関係の調整
      if (!options.options.includeExampleTools) {
        // 例：サンプルツール用の依存関係を削除
        // delete packageJson.dependencies['sample-tool-dependency'];
      }
      
      if (options.options.authRequired) {
        // 認証機能用の依存関係を追加
        packageJson.dependencies = packageJson.dependencies || {};
        packageJson.dependencies['jsonwebtoken'] = '^9.0.0';
        packageJson.dependencies['@types/jsonwebtoken'] = '^9.0.0';
      }
      
      // リポジトリ情報をクリア
      delete packageJson.repository;
      delete packageJson.bugs;
      delete packageJson.homepage;
      
      await context.fileSystem.writeFile(
        packageJsonPath, 
        JSON.stringify(packageJson, null, 2)
      );
    }

    // .env.example の更新
    const envExamplePath = path.join(options.targetPath, '.env.example');
    if (await context.fileSystem.exists(envExamplePath)) {
      let envContent = await context.fileSystem.readFile(envExamplePath);
      
      // ログレベルの設定
      envContent = envContent.replace(/LOG_LEVEL=.*/, `LOG_LEVEL=${options.options.logLevel || 'info'}`);
      
      // 認証設定の追加
      if (options.options.authRequired) {
        envContent += '\n# Authentication settings\nJWT_SECRET=your-secret-key-here\nAUTH_ENABLED=true\n';
      }
      
      await context.fileSystem.writeFile(envExamplePath, envContent);
    }
  }

  /**
   * 次のステップ情報の準備
   */
  private prepareNextSteps(options: ScaffoldOptions): NextStep[] {
    const steps: NextStep[] = [
      {
        title: 'プロジェクトディレクトリに移動',
        description: `生成されたプロジェクトディレクトリに移動してください`,
        command: `cd ${options.targetPath}`,
        required: true
      },
      {
        title: 'PRD.mdの完成',
        description: 'プロダクト要件定義を詳細に記述してください',
        required: true
      },
      {
        title: '依存関係のインストール',
        description: 'Node.js の依存関係をインストールします',
        command: 'npm install',
        required: true
      },
      {
        title: '環境設定',
        description: '環境変数ファイルを設定します',
        command: 'cp .env.example .env',
        required: true
      },
      {
        title: 'プロジェクトのビルド',
        description: 'TypeScript をコンパイルします',
        command: 'npm run build',
        required: true
      },
      {
        title: 'Git リポジトリの初期化',
        description: '新しい Git リポジトリとして初期化します',
        command: 'git init && git add . && git commit -m "Initial commit"',
        required: false
      },
      {
        title: 'Claude Code での開発開始',
        description: 'PRD.md の内容に基づいてプロジェクトのスケルトンをアレンジしてください',
        required: true
      }
    ];

    // オプションに応じたステップの追加
    if (options.options.authRequired) {
      steps.splice(4, 0, {
        title: '認証設定の構成',
        description: '.env ファイルで JWT_SECRET を設定してください',
        required: true
      });
    }

    return steps;
  }

  getConfigSchema(): ConfigOption[] {
    const template = this.getProjectTemplates()[0];
    return template?.configOptions || [];
  }

  async healthCheck(context: PluginContext): Promise<{ healthy: boolean; message?: string; details?: Record<string, any> }> {
    const details: Record<string, any> = {};
    
    try {
      // テンプレートディレクトリの存在確認
      const templateExists = await context.fileSystem.exists(this.templatePath);
      details.templatePath = this.templatePath;
      details.templateExists = templateExists;
      
      if (!templateExists) {
        return {
          healthy: false,
          message: 'テンプレートディレクトリが見つかりません',
          details
        };
      }
      
      // 必要なテンプレートファイルの確認
      const requiredFiles = ['package.json.template', 'tsconfig.json.template', 'src'];
      const missingFiles: string[] = [];
      
      for (const file of requiredFiles) {
        const filePath = path.join(this.templatePath, file);
        const exists = await context.fileSystem.exists(filePath);
        details[`${file}Exists`] = exists;
        
        if (!exists) {
          missingFiles.push(file);
        }
      }
      
      if (missingFiles.length > 0) {
        return {
          healthy: false,
          message: `必要なテンプレートファイルが不足しています: ${missingFiles.join(', ')}`,
          details
        };
      }
      
      return {
        healthy: true,
        message: 'MCPサーバープラグインは正常に動作しています',
        details
      };
      
    } catch (error) {
      return {
        healthy: false,
        message: `ヘルスチェック中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        details
      };
    }
  }
}

// プラグインのデフォルトエクスポート
export default new McpServerPlugin();