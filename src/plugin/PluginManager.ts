/**
 * プラグインマネージャー実装
 * 
 * プラグインのロード、管理、実行を担当するコアクラス
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { EventEmitter } from 'events';
import {
  Plugin,
  PluginMetadata,
  ProjectTemplate,
  ScaffoldOptions,
  ScaffoldResult,
  PluginContext,
  PluginError,
  PluginLoadError,
  PluginExecutionError,
  HealthCheckResult,
  ConfigOption
} from './types.js';
import { PluginContextImpl } from './PluginContext.js';
import { PluginValidator, ValidationResult } from './PluginValidator.js';
import { PluginMonitor, monitorPerformance } from './PluginMonitor.js';

/**
 * プラグイン登録情報
 */
interface PluginRegistration {
  /** プラグインインスタンス */
  plugin: Plugin;
  /** プラグインファイルパス */
  filePath: string;
  /** ロード時刻 */
  loadedAt: Date;
  /** アクティブ状態 */
  active: boolean;
  /** エラー状態 */
  error?: Error;
  /** 品質検証結果 */
  validationResult?: ValidationResult;
}

/**
 * プラグインマネージャー設定
 */
export interface PluginManagerConfig {
  /** プラグインディレクトリパス */
  pluginDir: string;
  /** 自動ロードを有効にするか */
  autoLoad: boolean;
  /** プラグインキャッシュを有効にするか */
  enableCache: boolean;
  /** 最大プラグイン数 */
  maxPlugins?: number;
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
  /** 品質検証を有効にするか */
  enableValidation?: boolean;
  /** パフォーマンス監視を有効にするか */
  enableMonitoring?: boolean;
}

/**
 * プラグインマネージャー
 */
export class PluginManager extends EventEmitter {
  private plugins: Map<string, PluginRegistration> = new Map();
  private templates: Map<string, { plugin: Plugin; template: ProjectTemplate }> = new Map();
  private config: PluginManagerConfig;
  private context: PluginContext;
  private initialized = false;
  private validator?: PluginValidator;
  private monitor?: PluginMonitor;

  constructor(config: PluginManagerConfig, context?: PluginContext) {
    super();
    this.config = {
      maxPlugins: 50,
      timeout: 30000,
      enableValidation: true,
      enableMonitoring: true,
      ...config
    };
    this.context = context || new PluginContextImpl();
  }

  /**
   * プラグインマネージャー初期化
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.context.logger.info('プラグインマネージャーを初期化中...');

    // 品質検証システムの初期化
    if (this.config.enableValidation) {
      this.validator = new PluginValidator(this.context);
      this.context.logger.info('プラグイン品質検証システムを有効化');
    }

    // パフォーマンス監視システムの初期化
    if (this.config.enableMonitoring) {
      this.monitor = new PluginMonitor(this.context);
      this.context.logger.info('プラグインパフォーマンス監視システムを有効化');
    }

    // プラグインディレクトリの確保
    await fs.ensureDir(this.config.pluginDir);

    // 自動ロードが有効な場合、プラグインを検索・ロード
    if (this.config.autoLoad) {
      await this.loadAllPlugins();
    }

    this.initialized = true;
    this.emit('initialized');
    this.context.logger.info('プラグインマネージャーの初期化が完了しました');
  }

  /**
   * 全プラグインの自動ロード
   */
  async loadAllPlugins(): Promise<void> {
    const pluginFiles = await this.findPluginFiles();
    
    this.context.logger.info(`${pluginFiles.length}個のプラグインファイルが見つかりました`);

    for (const filePath of pluginFiles) {
      try {
        await this.loadPlugin(filePath);
      } catch (error) {
        this.context.logger.error(`プラグインロードに失敗: ${filePath}`, error);
      }
    }
  }

  /**
   * プラグインファイル検索
   */
  private async findPluginFiles(): Promise<string[]> {
    const pluginFiles: string[] = [];
    const entries = await fs.readdir(this.config.pluginDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(this.config.pluginDir, entry.name);
      
      if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
        pluginFiles.push(fullPath);
      } else if (entry.isDirectory()) {
        // ディレクトリ内のindex.js/index.tsを探す
        const indexJs = path.join(fullPath, 'index.js');
        const indexTs = path.join(fullPath, 'index.ts');
        
        if (await fs.pathExists(indexJs)) {
          pluginFiles.push(indexJs);
        } else if (await fs.pathExists(indexTs)) {
          pluginFiles.push(indexTs);
        }
      }
    }

    return pluginFiles;
  }

  /**
   * プラグインロード
   */
  async loadPlugin(filePath: string): Promise<void> {
    try {
      this.context.logger.debug(`プラグインをロード中: ${filePath}`);

      // プラグイン数制限チェック
      if (this.config.maxPlugins && this.plugins.size >= this.config.maxPlugins) {
        throw new PluginLoadError(
          `最大プラグイン数に達しました: ${this.config.maxPlugins}`,
          path.basename(filePath)
        );
      }

      // プラグインファイルのインポート
      const pluginModule = await this.importPlugin(filePath);
      
      if (!pluginModule || typeof pluginModule.default !== 'object') {
        throw new PluginLoadError(
          'プラグインのデフォルトエクスポートが見つかりません',
          path.basename(filePath)
        );
      }

      const plugin: Plugin = pluginModule.default;

      // プラグインインターフェース検証
      this.validatePlugin(plugin);

      // 既存プラグインの重複チェック
      if (this.plugins.has(plugin.metadata.id)) {
        throw new PluginLoadError(
          `プラグインID '${plugin.metadata.id}' は既に登録されています`,
          plugin.metadata.id
        );
      }

      // プラグイン初期化
      await this.initializePlugin(plugin, filePath);

      this.context.logger.info(`プラグインがロードされました: ${plugin.metadata.name} v${plugin.metadata.version}`);
      this.emit('pluginLoaded', plugin.metadata.id, plugin);

    } catch (error) {
      const pluginId = path.basename(filePath, path.extname(filePath));
      this.context.logger.error(`プラグインロードに失敗: ${pluginId}`, error);
      
      if (error instanceof PluginError) {
        throw error;
      } else {
        throw new PluginLoadError(
          `プラグインロードに失敗: ${error instanceof Error ? error.message : String(error)}`,
          pluginId,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * プラグインファイルのインポート
   */
  private async importPlugin(filePath: string): Promise<any> {
    // TypeScriptファイルの場合、動的コンパイルが必要な場合がある
    if (filePath.endsWith('.ts')) {
      // 本番実装では ts-node や esbuild を使用してコンパイル
      throw new PluginLoadError(
        'TypeScriptプラグインのロードは現在サポートされていません',
        path.basename(filePath)
      );
    }

    // ESモジュール形式でインポート
    const pluginModule = await import(filePath);
    return pluginModule;
  }

  /**
   * プラグイン検証
   */
  private validatePlugin(plugin: Plugin): void {
    if (!plugin.metadata) {
      throw new PluginLoadError('プラグインメタデータが不正です', 'unknown');
    }

    const { id, name, version } = plugin.metadata;
    if (!id || !name || !version) {
      throw new PluginLoadError(
        'プラグインメタデータに必須フィールドが不足しています',
        id || 'unknown'
      );
    }

    if (typeof plugin.initialize !== 'function') {
      throw new PluginLoadError(
        'プラグインにinitializeメソッドがありません',
        id
      );
    }

    if (typeof plugin.getProjectTemplates !== 'function') {
      throw new PluginLoadError(
        'プラグインにgetProjectTemplatesメソッドがありません',
        id
      );
    }

    if (typeof plugin.generateScaffold !== 'function') {
      throw new PluginLoadError(
        'プラグインにgenerateScaffoldメソッドがありません',
        id
      );
    }
  }

  /**
   * プラグイン初期化
   */
  private async initializePlugin(plugin: Plugin, filePath: string): Promise<void> {
    const registration: PluginRegistration = {
      plugin,
      filePath,
      loadedAt: new Date(),
      active: false
    };

    try {
      // タイムアウト付きで初期化実行
      await this.executeWithTimeout(
        () => plugin.initialize(this.context),
        this.config.timeout!,
        `プラグイン初期化タイムアウト: ${plugin.metadata.id}`
      );

      registration.active = true;

      // プラグイン登録
      this.plugins.set(plugin.metadata.id, registration);

      // テンプレート登録
      this.registerTemplates(plugin);

    } catch (error) {
      registration.error = error instanceof Error ? error : new Error(String(error));
      registration.active = false;
      this.plugins.set(plugin.metadata.id, registration);
      throw error;
    }
  }

  /**
   * テンプレート登録
   */
  private registerTemplates(plugin: Plugin): void {
    const templates = plugin.getProjectTemplates();
    
    for (const template of templates) {
      if (this.templates.has(template.id)) {
        this.context.logger.warn(
          `テンプレートID '${template.id}' は既に登録されています（プラグイン: ${plugin.metadata.id}）`
        );
        continue;
      }

      this.templates.set(template.id, { plugin, template });
      this.context.logger.debug(`テンプレートが登録されました: ${template.id}`);
    }
  }

  /**
   * プラグインアンロード
   */
  async unloadPlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new PluginError(`プラグインが見つかりません: ${pluginId}`, pluginId);
    }

    try {
      // プラグインのクリーンアップ実行
      if (registration.plugin.cleanup) {
        await this.executeWithTimeout(
          () => registration.plugin.cleanup!(),
          this.config.timeout!,
          `プラグインクリーンアップタイムアウト: ${pluginId}`
        );
      }

      // テンプレート削除
      this.unregisterTemplates(registration.plugin);

      // プラグイン削除
      this.plugins.delete(pluginId);

      this.context.logger.info(`プラグインがアンロードされました: ${pluginId}`);
      this.emit('pluginUnloaded', pluginId);

    } catch (error) {
      this.context.logger.error(`プラグインアンロードに失敗: ${pluginId}`, error);
      throw new PluginError(
        `プラグインアンロードに失敗: ${error instanceof Error ? error.message : String(error)}`,
        pluginId,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * テンプレート削除
   */
  private unregisterTemplates(plugin: Plugin): void {
    const templates = plugin.getProjectTemplates();
    
    for (const template of templates) {
      this.templates.delete(template.id);
      this.context.logger.debug(`テンプレートが削除されました: ${template.id}`);
    }
  }

  /**
   * 利用可能なプロジェクトテンプレート一覧取得
   */
  getAvailableTemplates(): ProjectTemplate[] {
    return Array.from(this.templates.values()).map(({ template }) => template);
  }

  /**
   * テンプレートIDでテンプレート取得
   */
  getTemplate(templateId: string): ProjectTemplate | undefined {
    const registration = this.templates.get(templateId);
    return registration?.template;
  }

  /**
   * スケルトン生成実行
   */
  async generateScaffold(templateId: string, options: ScaffoldOptions): Promise<ScaffoldResult> {
    const registration = this.templates.get(templateId);
    if (!registration) {
      throw new PluginExecutionError(
        `テンプレートが見つかりません: ${templateId}`,
        'unknown'
      );
    }

    const { plugin, template } = registration;
    const pluginRegistration = this.plugins.get(plugin.metadata.id);
    
    if (!pluginRegistration?.active) {
      throw new PluginExecutionError(
        `プラグインが非アクティブです: ${plugin.metadata.id}`,
        plugin.metadata.id
      );
    }

    try {
      this.context.logger.info(`スケルトン生成を開始: ${templateId}`);
      this.emit('scaffoldStart', templateId, options);

      const result = await this.executeWithTimeout(
        () => plugin.generateScaffold(template, options, this.context),
        this.config.timeout!,
        `スケルトン生成タイムアウト: ${templateId}`
      );

      this.context.logger.info(`スケルトン生成が完了: ${templateId}`);
      this.emit('scaffoldComplete', templateId, result);

      return result;

    } catch (error) {
      this.context.logger.error(`スケルトン生成に失敗: ${templateId}`, error);
      this.emit('scaffoldError', templateId, error);
      
      if (error instanceof PluginError) {
        throw error;
      } else {
        throw new PluginExecutionError(
          `スケルトン生成に失敗: ${error instanceof Error ? error.message : String(error)}`,
          plugin.metadata.id,
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * プラグイン一覧取得
   */
  getLoadedPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values())
      .map(registration => registration.plugin.metadata);
  }

  /**
   * プラグイン詳細情報取得
   */
  getPluginInfo(pluginId: string): PluginRegistration | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * プラグインヘルスチェック実行
   */
  async healthCheck(pluginId?: string): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    const pluginsToCheck = pluginId 
      ? [this.plugins.get(pluginId)].filter(Boolean) as PluginRegistration[]
      : Array.from(this.plugins.values());

    for (const registration of pluginsToCheck) {
      try {
        if (registration.plugin.healthCheck) {
          const result = await this.executeWithTimeout(
            () => registration.plugin.healthCheck!(this.context),
            5000, // ヘルスチェックは短めのタイムアウト
            `ヘルスチェックタイムアウト: ${registration.plugin.metadata.id}`
          );
          results.set(registration.plugin.metadata.id, result);
        } else {
          // ヘルスチェックメソッドがない場合はアクティブ状態を返す
          results.set(registration.plugin.metadata.id, {
            healthy: registration.active,
            message: registration.active ? 'プラグインは正常です' : 'プラグインが非アクティブです'
          });
        }
      } catch (error) {
        results.set(registration.plugin.metadata.id, {
          healthy: false,
          message: `ヘルスチェックに失敗: ${error instanceof Error ? error.message : String(error)}`,
          details: { error: error instanceof Error ? error.message : String(error) }
        });
      }
    }

    return results;
  }

  /**
   * タイムアウト付き実行
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeout: number,
    timeoutMessage: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, timeout);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * プラグインマネージャー終了処理
   */
  async shutdown(): Promise<void> {
    this.context.logger.info('プラグインマネージャーをシャットダウン中...');

    const pluginIds = Array.from(this.plugins.keys());
    const shutdownPromises = pluginIds.map(pluginId => 
      this.unloadPlugin(pluginId).catch(error => 
        this.context.logger.error(`プラグインシャットダウンエラー: ${pluginId}`, error)
      )
    );

    await Promise.all(shutdownPromises);

    this.plugins.clear();
    this.templates.clear();
    this.initialized = false;

    this.emit('shutdown');
    this.context.logger.info('プラグインマネージャーのシャットダウンが完了しました');
  }
}