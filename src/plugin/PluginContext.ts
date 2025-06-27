/**
 * プラグインコンテキスト実装
 * 
 * プラグインが利用できるKit機能の具体的な実装を提供します。
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import {
  PluginContext,
  PluginLogger,
  PluginFileSystem,
  PluginConfig,
  TemplateProcessor,
  PluginUI,
  UIQuestion,
  ProgressIndicator
} from './types.js';

/**
 * プラグインコンテキスト実装
 */
export class PluginContextImpl implements PluginContext {
  readonly kitVersion: string = '1.0.0';
  readonly logger: PluginLogger = new PluginLoggerImpl();
  readonly fileSystem: PluginFileSystem = new PluginFileSystemImpl();
  readonly config: PluginConfig = new PluginConfigImpl();
  readonly templateProcessor: TemplateProcessor = new TemplateProcessorImpl(this.fileSystem);
  readonly userInterface: PluginUI = new PluginUIImpl();
}

/**
 * プラグインログ機能実装
 */
class PluginLoggerImpl implements PluginLogger {
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    console.debug(chalk.gray(this.formatMessage('debug', message, meta)));
  }

  info(message: string, meta?: any): void {
    console.info(chalk.blue(this.formatMessage('info', message, meta)));
  }

  warn(message: string, meta?: any): void {
    console.warn(chalk.yellow(this.formatMessage('warn', message, meta)));
  }

  error(message: string, meta?: any): void {
    console.error(chalk.red(this.formatMessage('error', message, meta)));
  }
}

/**
 * プラグインファイルシステム操作実装
 */
class PluginFileSystemImpl implements PluginFileSystem {
  async exists(path: string): Promise<boolean> {
    return fs.pathExists(path);
  }

  async readFile(filePath: string, encoding: string = 'utf8'): Promise<string> {
    return fs.readFile(filePath, { encoding: encoding as BufferEncoding });
  }

  async writeFile(filePath: string, content: string, encoding: string = 'utf8'): Promise<void> {
    await fs.ensureFile(filePath);
    return fs.writeFile(filePath, content, { encoding: encoding as BufferEncoding });
  }

  async ensureDir(dirPath: string): Promise<void> {
    return fs.ensureDir(dirPath);
  }

  async copy(src: string, dest: string): Promise<void> {
    return fs.copy(src, dest);
  }

  async remove(targetPath: string): Promise<void> {
    return fs.remove(targetPath);
  }

  async readDir(dirPath: string): Promise<string[]> {
    return fs.readdir(dirPath);
  }
}

/**
 * プラグイン設定アクセス実装
 */
class PluginConfigImpl implements PluginConfig {
  private config: Map<string, any> = new Map();
  private configFile: string;

  constructor() {
    // 設定ファイルパスを環境変数または デフォルトパスから取得
    this.configFile = process.env.PLUGIN_CONFIG_FILE || 
      path.join(process.cwd(), '.ai-driven-dev-config.json');
    this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    try {
      if (await fs.pathExists(this.configFile)) {
        const data = await fs.readJson(this.configFile);
        for (const [key, value] of Object.entries(data)) {
          this.config.set(key, value);
        }
      }
    } catch (error) {
      console.warn(`設定ファイルの読み込みに失敗: ${this.configFile}`, error);
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      const data = Object.fromEntries(this.config);
      await fs.ensureFile(this.configFile);
      await fs.writeJson(this.configFile, data, { spaces: 2 });
    } catch (error) {
      console.error(`設定ファイルの保存に失敗: ${this.configFile}`, error);
      throw error;
    }
  }

  get<T = any>(key: string, defaultValue?: T): T {
    return this.config.has(key) ? this.config.get(key) : (defaultValue as T);
  }

  async set(key: string, value: any): Promise<void> {
    this.config.set(key, value);
    await this.saveConfig();
  }

  async delete(key: string): Promise<void> {
    this.config.delete(key);
    await this.saveConfig();
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.config);
  }
}

/**
 * テンプレート処理機能実装
 */
class TemplateProcessorImpl implements TemplateProcessor {
  constructor(private fileSystem: PluginFileSystem) {}

  replacePlaceholders(content: string, variables: Record<string, string>): string {
    let result = content;
    
    for (const [key, value] of Object.entries(variables)) {
      // {{VARIABLE_NAME}} 形式のプレースホルダーを置換
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(regex, value);
    }
    
    return result;
  }

  async processTemplateFile(
    sourcePath: string, 
    targetPath: string, 
    variables: Record<string, string>
  ): Promise<void> {
    // ソースファイル読み込み
    const content = await this.fileSystem.readFile(sourcePath);
    
    // プレースホルダー置換
    const processedContent = this.replacePlaceholders(content, variables);
    
    // ターゲットファイル書き込み
    await this.fileSystem.writeFile(targetPath, processedContent);
  }

  async processTemplateDirectory(
    sourcePath: string, 
    targetPath: string, 
    variables: Record<string, string>
  ): Promise<void> {
    // ターゲットディレクトリ作成
    await this.fileSystem.ensureDir(targetPath);
    
    // ソースディレクトリ内容取得
    const entries = await this.fileSystem.readDir(sourcePath);
    
    for (const entry of entries) {
      const sourceEntryPath = path.join(sourcePath, entry);
      let targetEntryName = entry;
      
      // ファイル名の.template拡張子を除去
      if (entry.endsWith('.template')) {
        targetEntryName = entry.replace('.template', '');
      }
      
      // ファイル名のプレースホルダーも置換
      targetEntryName = this.replacePlaceholders(targetEntryName, variables);
      
      const targetEntryPath = path.join(targetPath, targetEntryName);
      
      // ディレクトリまたはファイルの判定
      const stat = await fs.stat(sourceEntryPath);
      
      if (stat.isDirectory()) {
        // ディレクトリの場合、再帰処理
        await this.processTemplateDirectory(sourceEntryPath, targetEntryPath, variables);
      } else if (stat.isFile()) {
        // ファイルの場合、テンプレート処理
        await this.processTemplateFile(sourceEntryPath, targetEntryPath, variables);
      }
    }
  }
}

/**
 * プラグインUI機能実装
 */
class PluginUIImpl implements PluginUI {
  async prompt(questions: UIQuestion[]): Promise<Record<string, any>> {
    // inquirer形式に変換
    const inquirerQuestions = questions.map(q => ({
      type: q.type,
      name: q.name,
      message: q.message,
      default: q.default,
      choices: q.choices,
      validate: q.validate,
      when: q.when
    }));
    
    return inquirer.prompt(inquirerQuestions);
  }

  showInfo(message: string): void {
    console.info(chalk.blue('ℹ️ '), message);
  }

  showWarning(message: string): void {
    console.warn(chalk.yellow('⚠️ '), message);
  }

  showError(message: string): void {
    console.error(chalk.red('❌'), message);
  }

  showProgress(message: string): ProgressIndicator {
    return new ProgressIndicatorImpl(message);
  }
}

/**
 * 進捗表示実装
 */
class ProgressIndicatorImpl implements ProgressIndicator {
  private spinner: any;

  constructor(message: string) {
    this.spinner = ora(message).start();
  }

  update(message: string): void {
    this.spinner.text = message;
  }

  succeed(message?: string): void {
    if (message) {
      this.spinner.succeed(message);
    } else {
      this.spinner.succeed();
    }
  }

  fail(message?: string): void {
    if (message) {
      this.spinner.fail(message);
    } else {
      this.spinner.fail();
    }
  }

  stop(): void {
    this.spinner.stop();
  }
}