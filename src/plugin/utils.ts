/**
 * プラグインシステム ユーティリティ関数
 */

import * as path from 'path';
import { PluginManager, PluginManagerConfig } from './PluginManager.js';
import { Plugin } from './types.js';

/**
 * プラグインマネージャーの作成
 */
export function createPluginManager(config?: Partial<PluginManagerConfig>): PluginManager {
  const defaultConfig: PluginManagerConfig = {
    pluginDir: path.resolve(process.cwd(), 'plugins'),
    autoLoad: true,
    enableCache: true,
    maxPlugins: 50,
    timeout: 30000
  };

  const mergedConfig = { ...defaultConfig, ...config };
  return new PluginManager(mergedConfig);
}

/**
 * プラグインの動的ロード
 */
export async function loadPlugin(pluginPath: string): Promise<Plugin> {
  try {
    const pluginModule = await import(pluginPath);
    
    if (!pluginModule.default) {
      throw new Error(`プラグインのデフォルトエクスポートが見つかりません: ${pluginPath}`);
    }

    return pluginModule.default;
  } catch (error) {
    throw new Error(`プラグインのロードに失敗: ${pluginPath} - ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * プラグインディレクトリの検証
 */
export async function validatePluginDirectory(pluginDir: string): Promise<boolean> {
  const fs = await import('fs-extra');
  
  try {
    const stat = await fs.stat(pluginDir);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * プラグインメタデータの検証
 */
export function validatePluginMetadata(metadata: any): boolean {
  const requiredFields = ['id', 'name', 'version'];
  
  for (const field of requiredFields) {
    if (!metadata[field] || typeof metadata[field] !== 'string') {
      return false;
    }
  }
  
  return true;
}