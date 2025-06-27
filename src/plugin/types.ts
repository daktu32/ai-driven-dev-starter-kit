/**
 * プラグインシステム型定義
 * 
 * AI Driven Dev Starter Kit のプラグインシステムで使用される
 * 基本的な型定義とインターフェースを提供します。
 */

/**
 * プラグインメタデータ
 */
export interface PluginMetadata {
  /** プラグイン識別子 */
  id: string;
  /** プラグイン名 */
  name: string;
  /** プラグインバージョン */
  version: string;
  /** プラグイン説明 */
  description: string;
  /** 作成者情報 */
  author: string;
  /** ライセンス */
  license?: string;
  /** プラグインタグ（検索用） */
  tags?: string[];
  /** 依存関係 */
  dependencies?: PluginDependency[];
  /** 最小サポートKit版本 */
  minimumKitVersion?: string;
}

/**
 * プラグイン依存関係
 */
export interface PluginDependency {
  /** 依存プラグインID */
  pluginId: string;
  /** 必要バージョン範囲 */
  versionRange: string;
  /** 必須かオプションか */
  required: boolean;
}

/**
 * プロジェクトテンプレート情報
 */
export interface ProjectTemplate {
  /** テンプレート識別子 */
  id: string;
  /** テンプレート名 */
  name: string;
  /** テンプレート説明 */
  description: string;
  /** カテゴリ（cli, web, api, など） */
  category: TemplateCategory;
  /** テンプレートパス */
  templatePath: string;
  /** 必要な依存関係 */
  requirements?: TemplateRequirement[];
  /** サポートする設定オプション */
  configOptions?: ConfigOption[];
}

/**
 * テンプレートカテゴリ
 */
export type TemplateCategory = 
  | 'cli' 
  | 'web' 
  | 'api' 
  | 'mobile' 
  | 'desktop' 
  | 'mcp-server'
  | 'library'
  | 'tool'
  | 'other';

/**
 * テンプレート要件
 */
export interface TemplateRequirement {
  /** 要件タイプ */
  type: 'runtime' | 'tool' | 'dependency';
  /** 要件名 */
  name: string;
  /** バージョン範囲 */
  versionRange?: string;
  /** 必須かオプションか */
  required: boolean;
  /** インストール手順 */
  installInstructions?: string;
}

/**
 * 設定オプション
 */
export interface ConfigOption {
  /** オプション名 */
  name: string;
  /** オプションタイプ */
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  /** 説明 */
  description: string;
  /** デフォルト値 */
  defaultValue?: any;
  /** 必須かオプションか */
  required: boolean;
  /** 選択肢（selectタイプの場合） */
  choices?: ConfigChoice[];
  /** 検証ルール */
  validation?: ValidationRule;
}

/**
 * 設定選択肢
 */
export interface ConfigChoice {
  /** 選択肢値 */
  value: string;
  /** 表示名 */
  label: string;
  /** 説明 */
  description?: string;
}

/**
 * 検証ルール
 */
export interface ValidationRule {
  /** 最小値/最小長 */
  min?: number;
  /** 最大値/最大長 */
  max?: number;
  /** 正規表現パターン */
  pattern?: string;
  /** カスタム検証関数 */
  customValidator?: (value: any) => boolean | string;
}

/**
 * プラグインコンテキスト
 * プラグインが利用できるKit機能へのアクセスを提供
 */
export interface PluginContext {
  /** Kit のバージョン */
  kitVersion: string;
  /** ログ機能 */
  logger: PluginLogger;
  /** ファイルシステム操作 */
  fileSystem: PluginFileSystem;
  /** ユーザー設定アクセス */
  config: PluginConfig;
  /** テンプレート処理機能 */
  templateProcessor: TemplateProcessor;
  /** ユーザーインタラクション */
  userInterface: PluginUI;
}

/**
 * プラグインログ機能
 */
export interface PluginLogger {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
}

/**
 * プラグインファイルシステム操作
 */
export interface PluginFileSystem {
  /** ファイル存在確認 */
  exists(path: string): Promise<boolean>;
  /** ファイル読み込み */
  readFile(path: string, encoding?: string): Promise<string>;
  /** ファイル書き込み */
  writeFile(path: string, content: string, encoding?: string): Promise<void>;
  /** ディレクトリ作成 */
  ensureDir(path: string): Promise<void>;
  /** ファイル・ディレクトリコピー */
  copy(src: string, dest: string): Promise<void>;
  /** ファイル・ディレクトリ削除 */
  remove(path: string): Promise<void>;
  /** ディレクトリ内容取得 */
  readDir(path: string): Promise<string[]>;
}

/**
 * プラグイン設定アクセス
 */
export interface PluginConfig {
  /** 設定値取得 */
  get<T = any>(key: string, defaultValue?: T): T;
  /** 設定値設定 */
  set(key: string, value: any): Promise<void>;
  /** 設定値削除 */
  delete(key: string): Promise<void>;
  /** 全設定取得 */
  getAll(): Record<string, any>;
}

/**
 * テンプレート処理機能
 */
export interface TemplateProcessor {
  /** プレースホルダー置換 */
  replacePlaceholders(content: string, variables: Record<string, string>): string;
  /** テンプレートファイル処理 */
  processTemplateFile(sourcePath: string, targetPath: string, variables: Record<string, string>): Promise<void>;
  /** テンプレートディレクトリ処理 */
  processTemplateDirectory(sourcePath: string, targetPath: string, variables: Record<string, string>): Promise<void>;
}

/**
 * プラグインUI機能
 */
export interface PluginUI {
  /** ユーザーへの質問 */
  prompt(questions: UIQuestion[]): Promise<Record<string, any>>;
  /** 情報表示 */
  showInfo(message: string): void;
  /** 警告表示 */
  showWarning(message: string): void;
  /** エラー表示 */
  showError(message: string): void;
  /** 進捗表示 */
  showProgress(message: string): ProgressIndicator;
}

/**
 * UI質問
 */
export interface UIQuestion {
  /** 質問タイプ */
  type: 'input' | 'confirm' | 'list' | 'checkbox';
  /** 質問名（結果のキー） */
  name: string;
  /** 質問文 */
  message: string;
  /** デフォルト値 */
  default?: any;
  /** 選択肢（list, checkboxタイプ） */
  choices?: UIChoice[];
  /** 検証関数 */
  validate?: (input: any) => boolean | string;
  /** 条件関数（trueの場合のみ質問） */
  when?: (answers: Record<string, any>) => boolean;
}

/**
 * UI選択肢
 */
export interface UIChoice {
  /** 選択肢値 */
  value: string;
  /** 表示名 */
  name: string;
  /** 説明 */
  description?: string;
}

/**
 * 進捗表示インターフェース
 */
export interface ProgressIndicator {
  /** 進捗更新 */
  update(message: string): void;
  /** 成功で終了 */
  succeed(message?: string): void;
  /** 失敗で終了 */
  fail(message?: string): void;
  /** 停止 */
  stop(): void;
}

/**
 * スケルトン生成オプション
 */
export interface ScaffoldOptions {
  /** 生成先パス */
  targetPath: string;
  /** プロジェクト名 */
  projectName: string;
  /** プロジェクトタイプ（テンプレートID） */
  projectType: string;
  /** 追加オプション */
  options: Record<string, any>;
  /** 環境変数 */
  environment?: Record<string, string>;
}

/**
 * スケルトン生成結果
 */
export interface ScaffoldResult {
  /** 成功/失敗 */
  success: boolean;
  /** 生成されたファイル一覧 */
  generatedFiles: string[];
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 警告メッセージ */
  warnings?: string[];
  /** 次のステップ情報 */
  nextSteps?: NextStep[];
}

/**
 * 次のステップ情報
 */
export interface NextStep {
  /** ステップタイトル */
  title: string;
  /** ステップ説明 */
  description: string;
  /** 実行コマンド（任意） */
  command?: string;
  /** 必須かオプションか */
  required: boolean;
}

/**
 * プラグインメイン インターフェース
 * 
 * 全てのプラグインはこのインターフェースを実装する必要があります。
 */
export interface Plugin {
  /** プラグインメタデータ */
  readonly metadata: PluginMetadata;

  /**
   * プラグイン初期化
   * プラグインロード時に一度だけ呼ばれます。
   */
  initialize(context: PluginContext): Promise<void>;

  /**
   * プラグイン終了処理
   * プラグインアンロード時に呼ばれます。
   */
  cleanup?(): Promise<void>;

  /**
   * 提供するプロジェクトテンプレート一覧
   */
  getProjectTemplates(): ProjectTemplate[];

  /**
   * スケルトン生成実行
   * 
   * @param template 使用するテンプレート
   * @param options 生成オプション
   * @param context プラグインコンテキスト
   */
  generateScaffold(
    template: ProjectTemplate,
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<ScaffoldResult>;

  /**
   * カスタムコマンド実行（任意）
   * プラグイン固有のコマンドがある場合に実装
   */
  executeCommand?(
    command: string,
    args: string[],
    context: PluginContext
  ): Promise<any>;

  /**
   * 設定スキーマ取得（任意）
   * プラグイン固有の設定がある場合に実装
   */
  getConfigSchema?(): ConfigOption[];

  /**
   * ヘルスチェック（任意）
   * プラグインの動作確認
   */
  healthCheck?(context: PluginContext): Promise<HealthCheckResult>;
}

/**
 * ヘルスチェック結果
 */
export interface HealthCheckResult {
  /** 正常/異常 */
  healthy: boolean;
  /** チェック結果メッセージ */
  message?: string;
  /** 詳細情報 */
  details?: Record<string, any>;
}

/**
 * プラグインエラー
 */
export class PluginError extends Error {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PluginError';
  }
}

/**
 * プラグインロードエラー
 */
export class PluginLoadError extends PluginError {
  constructor(
    message: string,
    pluginId: string,
    cause?: Error
  ) {
    super(message, pluginId, cause);
    this.name = 'PluginLoadError';
  }
}

/**
 * プラグイン実行エラー
 */
export class PluginExecutionError extends PluginError {
  constructor(
    message: string,
    pluginId: string,
    cause?: Error
  ) {
    super(message, pluginId, cause);
    this.name = 'PluginExecutionError';
  }
}