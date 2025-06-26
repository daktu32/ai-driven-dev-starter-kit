import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomWorld } from './world';
import * as fs from 'fs-extra';
import * as path from 'path';

BeforeAll(async function() {
  // テストレポートディレクトリを作成
  const reportsDir = path.join(process.cwd(), 'test', 'reports');
  await fs.ensureDir(reportsDir);
  
  console.log('E2E テストセットアップ開始...');
});

Before(async function(this: CustomWorld) {
  // 各シナリオ前のセットアップ
  await this.setup();
  console.log(`テストシナリオ開始: ${this.context.tempDir}`);
});

After(async function(this: CustomWorld, scenario) {
  // 各シナリオ後のクリーンアップ
  if (scenario.result?.status === 'FAILED') {
    // テスト失敗時は一時ファイルを保持してデバッグ情報を出力
    const debugInfo = {
      scenario: scenario.pickle.name,
      tempDir: this.context.tempDir,
      lastCommand: this.context.lastCommand,
      lastOutput: this.context.lastCommandOutput,
      lastError: this.context.lastCommandError,
      generatedFiles: this.context.generatedFiles
    };
    
    const debugFile = path.join(this.context.tempDir, 'debug-info.json');
    await fs.writeFile(debugFile, JSON.stringify(debugInfo, null, 2));
    
    console.log(`テスト失敗 - デバッグ情報: ${debugFile}`);
    console.log(`最後のコマンド: ${this.context.lastCommand}`);
    console.log(`エラー: ${this.context.lastCommandError}`);
  } else {
    // テスト成功時は一時ファイルを削除
    try {
      await fs.remove(this.context.tempDir);
    } catch (error) {
      console.warn(`一時ディレクトリの削除に失敗: ${error}`);
    }
  }
});

AfterAll(async function() {
  console.log('E2E テスト完了');
  
  // 最終クリーンアップ
  const tempDir = path.join(process.cwd(), 'test', 'temp');
  try {
    const dirs = await fs.readdir(tempDir);
    for (const dir of dirs) {
      if (dir.startsWith('test-')) {
        const dirPath = path.join(tempDir, dir);
        await fs.remove(dirPath);
      }
    }
  } catch (error) {
    // エラーは無視
  }
});