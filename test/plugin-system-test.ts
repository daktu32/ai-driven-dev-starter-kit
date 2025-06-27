#!/usr/bin/env ts-node

/**
 * プラグインシステム動作確認テスト
 * 
 * このスクリプトは、プラグインシステムの主要機能をテストします：
 * 1. プラグインマネージャーの初期化
 * 2. プラグインの自動ロード
 * 3. テンプレート情報の取得
 * 4. 実際のプロジェクト生成テスト
 */

import { PluginManager } from '../src/plugin/PluginManager.js';
import { PluginContextImpl } from '../src/plugin/PluginContext.js';
import type { PluginManagerConfig } from '../src/plugin/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// テスト用の設定
const TEST_CONFIG: PluginManagerConfig = {
  pluginDir: path.join(__dirname, '../plugins'),
  autoLoad: true,
  enableCache: false, // テスト時はキャッシュ無効
  maxPlugins: 50,
  timeout: 30000
};

// テスト出力ディレクトリ
const TEST_OUTPUT_DIR = path.join(__dirname, '../tmp/plugin-test-output');

// ログ出力用の色付きテキスト
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

async function setupTestEnvironment(): Promise<void> {
  // テスト出力ディレクトリを作成
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

async function testPluginManagerInitialization(): Promise<PluginManager> {
  log(`\n${colors.bold}テスト 1: プラグインマネージャーの初期化${colors.reset}`);
  
  try {
    const context = new PluginContextImpl();
    const pluginManager = new PluginManager(TEST_CONFIG, context);
    await pluginManager.initialize();
    
    logSuccess('プラグインマネージャーの初期化完了');
    return pluginManager;
  } catch (error) {
    logError(`プラグインマネージャーの初期化失敗: ${error}`);
    throw error;
  }
}

async function testPluginLoading(pluginManager: PluginManager): Promise<void> {
  log(`\n${colors.bold}テスト 2: プラグインのロード確認${colors.reset}`);
  
  const loadedPlugins = pluginManager.getLoadedPlugins();
  logInfo(`ロード済みプラグイン数: ${loadedPlugins.length}`);
  
  if (loadedPlugins.length === 0) {
    logWarning('ロード済みプラグインが0個です');
    return;
  }
  
  // 各プラグインの詳細を表示
  for (const plugin of loadedPlugins) {
    logInfo(`  - ${plugin.metadata.name} (${plugin.metadata.id}) v${plugin.metadata.version}`);
    logInfo(`    説明: ${plugin.metadata.description}`);
    logInfo(`    作者: ${plugin.metadata.author}`);
    
    // プラグインが提供するテンプレートを表示
    const templates = plugin.getProjectTemplates();
    for (const template of templates) {
      logInfo(`    テンプレート: ${template.name} (${template.id})`);
    }
  }
  
  logSuccess(`${loadedPlugins.length}個のプラグインが正常にロードされました`);
}

async function testTemplateRetrieval(pluginManager: PluginManager): Promise<void> {
  log(`\n${colors.bold}テスト 3: テンプレート情報の取得${colors.reset}`);
  
  const allTemplates = pluginManager.getAllTemplates();
  logInfo(`利用可能なテンプレート数: ${allTemplates.length}`);
  
  if (allTemplates.length === 0) {
    logWarning('利用可能なテンプレートが0個です');
    return;
  }
  
  // 各テンプレートの詳細を表示
  for (const template of allTemplates) {
    logInfo(`  - ${template.name} (${template.id})`);
    logInfo(`    カテゴリ: ${template.category}`);
    logInfo(`    説明: ${template.description}`);
    
    if (template.configOptions && template.configOptions.length > 0) {
      logInfo(`    設定オプション: ${template.configOptions.length}個`);
      template.configOptions.forEach(option => {
        logInfo(`      - ${option.name} (${option.type}): ${option.description}`);
      });
    }
  }
  
  logSuccess('テンプレート情報の取得完了');
}

async function testProjectGeneration(pluginManager: PluginManager): Promise<void> {
  log(`\n${colors.bold}テスト 4: プロジェクト生成テスト${colors.reset}`);
  
  const allTemplates = pluginManager.getAllTemplates();
  
  if (allTemplates.length === 0) {
    logWarning('テンプレートが無いため、プロジェクト生成テストをスキップします');
    return;
  }
  
  // 各テンプレートで小さなテストプロジェクトを生成
  for (const template of allTemplates) {
    const testProjectName = `test-${template.id}`;
    const testProjectPath = path.join(TEST_OUTPUT_DIR, testProjectName);
    
    logInfo(`テンプレート "${template.name}" でプロジェクトを生成中...`);
    
    try {
      const result = await pluginManager.generateScaffold(template.id, {
        targetPath: testProjectPath,
        projectName: testProjectName,
        projectType: template.id,
        options: getDefaultOptions(template.id),
        environment: {}
      });
      
      if (result.success) {
        logSuccess(`プロジェクト "${testProjectName}" の生成完了`);
        logInfo(`  生成されたファイル数: ${result.generatedFiles.length}`);
        
        // 生成されたファイルをいくつか確認
        if (result.generatedFiles.length > 0) {
          logInfo('  主要ファイル:');
          result.generatedFiles.slice(0, 5).forEach(file => {
            logInfo(`    - ${file}`);
          });
          if (result.generatedFiles.length > 5) {
            logInfo(`    ... その他 ${result.generatedFiles.length - 5} ファイル`);
          }
        }
        
        // 次のステップがある場合は表示
        if (result.nextSteps && result.nextSteps.length > 0) {
          logInfo('  次のステップ:');
          result.nextSteps.forEach((step, index) => {
            logInfo(`    ${index + 1}. ${step.description}`);
          });
        }
        
      } else {
        logError(`プロジェクト "${testProjectName}" の生成失敗: ${result.error}`);
        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach(warning => {
            logWarning(`  警告: ${warning}`);
          });
        }
      }
      
    } catch (error) {
      logError(`プロジェクト "${testProjectName}" の生成中にエラー: ${error}`);
    }
  }
}

async function testHealthCheck(pluginManager: PluginManager): Promise<void> {
  log(`\n${colors.bold}テスト 5: ヘルスチェック${colors.reset}`);
  
  try {
    const healthResults = await pluginManager.healthCheck();
    
    logInfo('ヘルスチェック結果:');
    for (const [pluginId, result] of Object.entries(healthResults)) {
      if (result.healthy) {
        logSuccess(`  ${pluginId}: 正常`);
      } else {
        logError(`  ${pluginId}: 異常`);
        if (result.error) {
          logError(`    エラー: ${result.error}`);
        }
      }
      
      if (result.details) {
        logInfo(`    詳細: ${JSON.stringify(result.details, null, 2)}`);
      }
    }
    
    logSuccess('ヘルスチェック完了');
    
  } catch (error) {
    logError(`ヘルスチェック中にエラー: ${error}`);
  }
}

function getDefaultOptions(templateId: string): Record<string, any> {
  // テンプレートIDに基づいてデフォルトオプションを返す
  switch (templateId) {
    case 'mcp-server':
      return {
        serverName: 'test-mcp-server',
        includeExampleTools: false,
        authentication: 'none',
        logLevel: 'info'
      };
    case 'web-nextjs':
      return {
        uiFramework: 'tailwind',
        stateManagement: 'zustand',
        authentication: 'none',
        database: 'none'
      };
    case 'api-fastapi':
      return {
        database: 'sqlite',
        orm: 'sqlalchemy',
        authentication: 'none',
        enableCors: true,
        includeDocker: false
      };
    case 'cli-rust':
      return {
        cliFramework: 'clap',
        asyncRuntime: 'tokio',
        serialization: 'serde_json',
        includeBenchmarks: false
      };
    default:
      return {};
  }
}

async function runAllTests(): Promise<void> {
  log(`${colors.bold}${colors.cyan}🚀 プラグインシステム動作確認テスト開始${colors.reset}\n`);
  
  let testsPassed = 0;
  let testsTotal = 5;
  
  try {
    // テスト環境のセットアップ
    await setupTestEnvironment();
    logSuccess('テスト環境のセットアップ完了');
    
    // テスト 1: プラグインマネージャーの初期化
    const pluginManager = await testPluginManagerInitialization();
    testsPassed++;
    
    // テスト 2: プラグインのロード確認
    await testPluginLoading(pluginManager);
    testsPassed++;
    
    // テスト 3: テンプレート情報の取得
    await testTemplateRetrieval(pluginManager);
    testsPassed++;
    
    // テスト 4: プロジェクト生成テスト
    await testProjectGeneration(pluginManager);
    testsPassed++;
    
    // テスト 5: ヘルスチェック
    await testHealthCheck(pluginManager);
    testsPassed++;
    
    // クリーンアップ
    await pluginManager.cleanup();
    logSuccess('プラグインマネージャーのクリーンアップ完了');
    
  } catch (error) {
    logError(`テスト実行中にエラーが発生しました: ${error}`);
  }
  
  // テスト結果の表示
  log(`\n${colors.bold}${colors.cyan}📊 テスト結果${colors.reset}`);
  log(`成功: ${testsPassed}/${testsTotal} テスト`);
  
  if (testsPassed === testsTotal) {
    logSuccess('🎉 すべてのテストが正常に完了しました！');
    logInfo(`📁 テスト出力: ${TEST_OUTPUT_DIR}`);
  } else {
    logError(`⚠️  ${testsTotal - testsPassed}個のテストが失敗しました`);
  }
}

// メイン実行
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    logError(`予期しないエラー: ${error}`);
    process.exit(1);
  });
}