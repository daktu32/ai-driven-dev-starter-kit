/**
 * プラグインシステム エントリーポイント
 * 
 * プラグインシステムの主要コンポーネントをエクスポートします。
 */

// 型定義のエクスポート
export * from './types.js';

// プラグインマネージャーのエクスポート
export { PluginManager, type PluginManagerConfig } from './PluginManager.js';

// プラグインコンテキストのエクスポート
export { PluginContextImpl } from './PluginContext.js';

// 便利な関数やユーティリティ
export { createPluginManager, loadPlugin } from './utils.js';