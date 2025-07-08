/**
 * TemplateRegistry - テンプレートの登録・管理・検索機能
 * 
 * ローカルJSONファイルでテンプレートのメタ情報を管理し、
 * 公式テンプレートとカスタムテンプレートを統一的に扱う。
 */

import fs from 'fs-extra';
import * as path from 'path';
import { homedir } from 'os';
import chalk from 'chalk';

export interface TemplateMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  source: 'builtin' | 'local' | 'git' | 'npm';
  path?: string;
  url?: string;
  checksum?: string;
  lastUpdated: string;
  projectType?: string;
  tags?: string[];
}

export interface TemplateRegistryConfig {
  templates: Record<string, TemplateMetadata>;
  lastSync: string;
  version: string;
}

/**
 * TemplateRegistry - テンプレートレジストリ管理クラス
 */
export class TemplateRegistry {
  private registryDir: string;
  private registryFile: string;
  private cacheDir: string;

  constructor(customDir?: string) {
    this.registryDir = customDir || path.join(homedir(), '.ai-dev-kit');
    this.registryFile = path.join(this.registryDir, 'templates', 'index.json');
    this.cacheDir = path.join(this.registryDir, 'template-cache');
  }

  /**
   * レジストリの初期化
   */
  async initialize(): Promise<void> {
    await fs.ensureDir(this.registryDir);
    await fs.ensureDir(path.dirname(this.registryFile));
    await fs.ensureDir(this.cacheDir);

    // 初回作成時は公式テンプレートを登録
    if (!(await fs.pathExists(this.registryFile))) {
      await this.initializeWithBuiltinTemplates();
    }
  }

  /**
   * 公式テンプレートでレジストリを初期化
   */
  private async initializeWithBuiltinTemplates(): Promise<void> {
    const initialRegistry: TemplateRegistryConfig = {
      version: '1.0.0',
      lastSync: new Date().toISOString(),
      templates: {
        'mcp-server': {
          name: 'mcp-server',
          version: '1.0.0',
          description: 'Model Context Protocol Server template',
          author: 'AI Driven Dev Starter Kit',
          source: 'builtin',
          path: 'templates/project-structures/mcp-server',
          lastUpdated: new Date().toISOString(),
          projectType: 'mcp-server',
          tags: ['typescript', 'node', 'mcp']
        },
        'web-nextjs': {
          name: 'web-nextjs',
          version: '1.0.0',
          description: 'Next.js Web Application template',
          author: 'AI Driven Dev Starter Kit',
          source: 'builtin',
          path: 'templates/project-structures/web-nextjs',
          lastUpdated: new Date().toISOString(),
          projectType: 'web-nextjs',
          tags: ['typescript', 'react', 'nextjs', 'web']
        },
        'api-fastapi': {
          name: 'api-fastapi',
          version: '1.0.0',
          description: 'FastAPI REST API template',
          author: 'AI Driven Dev Starter Kit',
          source: 'builtin',
          path: 'templates/project-structures/api-fastapi',
          lastUpdated: new Date().toISOString(),
          projectType: 'api-fastapi',
          tags: ['python', 'fastapi', 'api', 'rest']
        },
        'cli-rust': {
          name: 'cli-rust',
          version: '1.0.0',
          description: 'Rust CLI Application template',
          author: 'AI Driven Dev Starter Kit',
          source: 'builtin',
          path: 'templates/project-structures/cli-rust',
          lastUpdated: new Date().toISOString(),
          projectType: 'cli-rust',
          tags: ['rust', 'cli', 'clap']
        }
      }
    };

    await this.saveRegistry(initialRegistry);
    console.log(chalk.green('✓ テンプレートレジストリを初期化しました'));
  }

  /**
   * レジストリの読み込み
   */
  async loadRegistry(): Promise<TemplateRegistryConfig> {
    try {
      if (!(await fs.pathExists(this.registryFile))) {
        await this.initialize();
      }
      
      const content = await fs.readFile(this.registryFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`レジストリの読み込みに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * レジストリの保存
   */
  async saveRegistry(registry: TemplateRegistryConfig): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.registryFile));
      await fs.writeFile(this.registryFile, JSON.stringify(registry, null, 2));
    } catch (error) {
      throw new Error(`レジストリの保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * テンプレートの登録
   */
  async addTemplate(metadata: Omit<TemplateMetadata, 'lastUpdated'>): Promise<void> {
    const registry = await this.loadRegistry();
    
    if (registry.templates[metadata.name]) {
      throw new Error(`テンプレート '${metadata.name}' は既に登録されています`);
    }

    registry.templates[metadata.name] = {
      ...metadata,
      lastUpdated: new Date().toISOString()
    };
    
    registry.lastSync = new Date().toISOString();
    await this.saveRegistry(registry);
    
    console.log(chalk.green(`✓ テンプレート '${metadata.name}' を登録しました`));
  }

  /**
   * テンプレートの削除
   */
  async removeTemplate(name: string): Promise<void> {
    const registry = await this.loadRegistry();
    
    if (!registry.templates[name]) {
      throw new Error(`テンプレート '${name}' が見つかりません`);
    }

    // ビルトインテンプレートは削除不可
    if (registry.templates[name].source === 'builtin') {
      throw new Error(`ビルトインテンプレート '${name}' は削除できません`);
    }

    delete registry.templates[name];
    registry.lastSync = new Date().toISOString();
    await this.saveRegistry(registry);

    // キャッシュも削除
    const cachePath = path.join(this.cacheDir, name);
    if (await fs.pathExists(cachePath)) {
      await fs.remove(cachePath);
    }

    console.log(chalk.green(`✓ テンプレート '${name}' を削除しました`));
  }

  /**
   * テンプレートの検索
   */
  async findTemplate(name: string): Promise<TemplateMetadata | null> {
    const registry = await this.loadRegistry();
    return registry.templates[name] || null;
  }

  /**
   * 全テンプレートの一覧取得
   */
  async listTemplates(filter?: { source?: string; projectType?: string; tag?: string }): Promise<TemplateMetadata[]> {
    const registry = await this.loadRegistry();
    let templates = Object.values(registry.templates);

    if (filter) {
      if (filter.source) {
        templates = templates.filter(t => t.source === filter.source);
      }
      if (filter.projectType) {
        templates = templates.filter(t => t.projectType === filter.projectType);
      }
      if (filter.tag) {
        templates = templates.filter(t => t.tags?.includes(filter.tag!));
      }
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * テンプレートの存在確認
   */
  async exists(name: string): Promise<boolean> {
    const template = await this.findTemplate(name);
    return template !== null;
  }

  /**
   * テンプレートの更新
   */
  async updateTemplate(name: string, updates: Partial<TemplateMetadata>): Promise<void> {
    const registry = await this.loadRegistry();
    
    if (!registry.templates[name]) {
      throw new Error(`テンプレート '${name}' が見つかりません`);
    }

    registry.templates[name] = {
      ...registry.templates[name],
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    registry.lastSync = new Date().toISOString();
    await this.saveRegistry(registry);
    
    console.log(chalk.green(`✓ テンプレート '${name}' を更新しました`));
  }

  /**
   * レジストリの統計情報
   */
  async getStats(): Promise<{
    total: number;
    bySource: Record<string, number>;
    byProjectType: Record<string, number>;
  }> {
    const templates = await this.listTemplates();
    
    const bySource: Record<string, number> = {};
    const byProjectType: Record<string, number> = {};
    
    templates.forEach(template => {
      bySource[template.source] = (bySource[template.source] || 0) + 1;
      if (template.projectType) {
        byProjectType[template.projectType] = (byProjectType[template.projectType] || 0) + 1;
      }
    });

    return {
      total: templates.length,
      bySource,
      byProjectType
    };
  }

  /**
   * キャッシュディレクトリのパス取得
   */
  getCacheDir(): string {
    return this.cacheDir;
  }

  /**
   * レジストリファイルのパス取得
   */
  getRegistryPath(): string {
    return this.registryFile;
  }
}