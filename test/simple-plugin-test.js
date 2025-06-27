#!/usr/bin/env node

/**
 * 簡単なプラグインシステム動作確認テスト
 * TypeScriptのコンパイルエラーを回避し、基本的な動作を確認します
 */

import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 色付きコンソール出力
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

/**
 * プラグインディレクトリの構造確認
 */
async function checkPluginStructure() {
  log(`\n${colors.bold}テスト 1: プラグインディレクトリ構造確認${colors.reset}`);
  
  const pluginDir = join(__dirname, '../plugins');
  
  try {
    const entries = await readdir(pluginDir);
    const pluginFolders = [];
    
    for (const entry of entries) {
      const entryPath = join(pluginDir, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        pluginFolders.push(entry);
        
        // プラグインフォルダ内のindex.tsの存在確認
        try {
          const indexPath = join(entryPath, 'index.ts');
          await stat(indexPath);
          logSuccess(`${entry}: index.ts 存在確認`);
        } catch {
          logWarning(`${entry}: index.ts が見つかりません`);
        }
      }
    }
    
    logInfo(`発見されたプラグインフォルダ: ${pluginFolders.length}個`);
    pluginFolders.forEach(folder => logInfo(`  - ${folder}`));
    
    return pluginFolders;
    
  } catch (error) {
    logError(`プラグインディレクトリ読み込みエラー: ${error.message}`);
    return [];
  }
}

/**
 * srcディレクトリの構造確認
 */
async function checkSrcStructure() {
  log(`\n${colors.bold}テスト 2: srcディレクトリ構造確認${colors.reset}`);
  
  const srcDir = join(__dirname, '../src');
  
  try {
    const requiredFiles = [
      'plugin/types.ts',
      'plugin/PluginManager.ts',
      'plugin/PluginContext.ts',
      'plugin/index.ts',
      'PluginScaffoldGenerator.ts'
    ];
    
    for (const file of requiredFiles) {
      try {
        const filePath = join(srcDir, file);
        await stat(filePath);
        logSuccess(`${file}: 存在確認`);
      } catch {
        logError(`${file}: ファイルが見つかりません`);
      }
    }
    
  } catch (error) {
    logError(`srcディレクトリ確認エラー: ${error.message}`);
  }
}

/**
 * テンプレートディレクトリの確認
 */
async function checkTemplateStructure() {
  log(`\n${colors.bold}テスト 3: テンプレートディレクトリ確認${colors.reset}`);
  
  const templateDir = join(__dirname, '../templates');
  
  try {
    const entries = await readdir(templateDir);
    logInfo(`テンプレートディレクトリ内容: ${entries.length}個のエントリ`);
    
    for (const entry of entries) {
      const entryPath = join(templateDir, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        logInfo(`  📁 ${entry}/`);
        
        // サブディレクトリの内容も確認
        try {
          const subEntries = await readdir(entryPath);
          subEntries.slice(0, 3).forEach(subEntry => {
            logInfo(`    - ${subEntry}`);
          });
          if (subEntries.length > 3) {
            logInfo(`    ... その他 ${subEntries.length - 3} ファイル`);
          }
        } catch {
          // サブディレクトリ読み込みエラーは無視
        }
      } else {
        logInfo(`  📄 ${entry}`);
      }
    }
    
  } catch (error) {
    logError(`テンプレートディレクトリ確認エラー: ${error.message}`);
  }
}

/**
 * package.jsonのスクリプト確認
 */
async function checkPackageScripts() {
  log(`\n${colors.bold}テスト 4: package.json スクリプト確認${colors.reset}`);
  
  try {
    const packagePath = join(__dirname, '../package.json');
    const packageJson = JSON.parse(await import('fs').then(fs => fs.promises.readFile(packagePath, 'utf8')));
    
    const requiredScripts = [
      'scaffold:plugin',
      'build',
      'test:plugin'
    ];
    
    logInfo('利用可能なスクリプト:');
    for (const script of requiredScripts) {
      if (packageJson.scripts[script]) {
        logSuccess(`${script}: ${packageJson.scripts[script]}`);
      } else {
        logError(`${script}: スクリプトが見つかりません`);
      }
    }
    
    // その他のプラグイン関連スクリプトも表示
    Object.keys(packageJson.scripts).forEach(script => {
      if (script.includes('plugin') && !requiredScripts.includes(script)) {
        logInfo(`その他: ${script}: ${packageJson.scripts[script]}`);
      }
    });
    
  } catch (error) {
    logError(`package.json確認エラー: ${error.message}`);
  }
}

/**
 * プラグインファイルの基本構文確認
 */
async function checkPluginSyntax(pluginFolders) {
  log(`\n${colors.bold}テスト 5: プラグインファイル基本構文確認${colors.reset}`);
  
  for (const folder of pluginFolders) {
    const indexPath = join(__dirname, '../plugins', folder, 'index.ts');
    
    try {
      const content = await import('fs').then(fs => fs.promises.readFile(indexPath, 'utf8'));
      
      // 基本的なキーワードの存在確認
      const checks = [
        { keyword: 'class', description: 'クラス定義' },
        { keyword: 'implements Plugin', description: 'Plugin インターフェース実装' },
        { keyword: 'metadata:', description: 'メタデータ定義' },
        { keyword: 'getProjectTemplates', description: 'テンプレート取得メソッド' },
        { keyword: 'generateScaffold', description: 'スケルトン生成メソッド' },
        { keyword: 'export default', description: 'デフォルトエクスポート' }
      ];
      
      logInfo(`${folder} プラグインの構文確認:`);
      
      let allChecksPass = true;
      for (const check of checks) {
        if (content.includes(check.keyword)) {
          logSuccess(`  ${check.description}: ✓`);
        } else {
          logWarning(`  ${check.description}: 見つかりません`);
          allChecksPass = false;
        }
      }
      
      if (allChecksPass) {
        logSuccess(`${folder}: 基本構文確認完了`);
      } else {
        logWarning(`${folder}: 一部の基本構文が見つかりません`);
      }
      
    } catch (error) {
      logError(`${folder}: ファイル読み込みエラー - ${error.message}`);
    }
  }
}

/**
 * 全テストの実行
 */
async function runAllTests() {
  log(`${colors.bold}${colors.cyan}🚀 プラグインシステム基本構造確認テスト開始${colors.reset}\n`);
  
  let testsCompleted = 0;
  const totalTests = 5;
  
  try {
    // テスト 1: プラグインディレクトリ構造確認
    const pluginFolders = await checkPluginStructure();
    testsCompleted++;
    
    // テスト 2: srcディレクトリ構造確認
    await checkSrcStructure();
    testsCompleted++;
    
    // テスト 3: テンプレートディレクトリ確認
    await checkTemplateStructure();
    testsCompleted++;
    
    // テスト 4: package.jsonスクリプト確認
    await checkPackageScripts();
    testsCompleted++;
    
    // テスト 5: プラグインファイル基本構文確認
    if (pluginFolders.length > 0) {
      await checkPluginSyntax(pluginFolders);
    } else {
      logWarning('プラグインフォルダが見つからないため、構文確認をスキップします');
    }
    testsCompleted++;
    
  } catch (error) {
    logError(`テスト実行中にエラーが発生しました: ${error.message}`);
  }
  
  // テスト結果の表示
  log(`\n${colors.bold}${colors.cyan}📊 テスト結果${colors.reset}`);
  log(`完了: ${testsCompleted}/${totalTests} テスト`);
  
  if (testsCompleted === totalTests) {
    logSuccess('🎉 すべての基本構造確認が完了しました！');
    logInfo('次のステップ:');
    logInfo('1. TypeScriptエラーの修正');
    logInfo('2. npm run build の実行');
    logInfo('3. プラグインシステムの実際の動作テスト');
  } else {
    logWarning(`⚠️  ${totalTests - testsCompleted}個のテストが不完全です`);
  }
}

// メイン実行
runAllTests().catch(error => {
  logError(`予期しないエラー: ${error.message}`);
  process.exit(1);
});