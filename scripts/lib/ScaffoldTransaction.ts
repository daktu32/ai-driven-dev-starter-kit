/**
 * スケルトン生成のトランザクション処理とロールバック機能
 * 
 * このクラスは、スケルトン生成プロセスを複数のステップに分割し、
 * 各ステップを順次実行する際の原子性を保証します。
 * エラーが発生した場合は自動的にロールバックを実行します。
 */

import fs from 'fs-extra';
import chalk from 'chalk';
import { performance } from 'perf_hooks';

/**
 * トランザクションステップの定義
 */
export interface TransactionStep {
  /** ステップの名前（ログ表示用） */
  name: string;
  /** ステップの実行処理 */
  execute: () => Promise<void>;
  /** ロールバック処理（任意） */
  rollback?: () => Promise<void>;
  /** ステップの説明（任意） */
  description?: string;
}

/**
 * 生成状態の管理
 */
export class GenerationState {
  private state: Map<string, any> = new Map();
  
  set(key: string, value: any): void {
    this.state.set(key, value);
  }
  
  get<T>(key: string): T | undefined {
    return this.state.get(key);
  }
  
  clear(): void {
    this.state.clear();
  }
  
  /** 生成されたファイルのトラッキング */
  addGeneratedFile(filePath: string): void {
    const files = this.get<string[]>('generatedFiles') || [];
    files.push(filePath);
    this.set('generatedFiles', files);
  }
  
  getGeneratedFiles(): string[] {
    return this.get<string[]>('generatedFiles') || [];
  }
  
  /** 生成されたディレクトリのトラッキング */
  addGeneratedDirectory(dirPath: string): void {
    const dirs = this.get<string[]>('generatedDirectories') || [];
    dirs.push(dirPath);
    this.set('generatedDirectories', dirs);
  }
  
  getGeneratedDirectories(): string[] {
    return this.get<string[]>('generatedDirectories') || [];
  }
}

/**
 * スケルトン生成のトランザクション管理
 */
export class ScaffoldTransaction {
  private steps: TransactionStep[] = [];
  private completedSteps: TransactionStep[] = [];
  private targetPath: string;
  private state: GenerationState;
  private startTime: number = 0;
  private verbose: boolean = false;
  
  constructor(targetPath: string, options: { verbose?: boolean } = {}) {
    this.targetPath = targetPath;
    this.state = new GenerationState();
    this.verbose = options.verbose || false;
  }
  
  /**
   * トランザクションステップを追加
   */
  addStep(step: TransactionStep): void {
    this.steps.push(step);
    if (this.verbose) {
      console.log(chalk.gray(`📋 ステップ追加: ${step.name}`));
    }
  }
  
  /**
   * 生成状態を取得
   */
  getState(): GenerationState {
    return this.state;
  }
  
  /**
   * トランザクションを実行
   */
  async execute(): Promise<void> {
    this.startTime = performance.now();
    
    console.log(chalk.blue.bold(`🔄 ${this.steps.length}個のステップを実行します...`));
    if (this.verbose) {
      console.log(chalk.gray(`対象パス: ${this.targetPath}`));
    }
    
    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (!step) continue;
      
      const stepNumber = i + 1;
      
      try {
        const stepStart = performance.now();
        
        console.log(chalk.gray(`  ${stepNumber}/${this.steps.length} ▶ ${step.name}...`));
        if (this.verbose && step.description) {
          console.log(chalk.gray(`      ${step.description}`));
        }
        
        await step.execute();
        
        const stepEnd = performance.now();
        const stepTime = Math.round(stepEnd - stepStart);
        
        this.completedSteps.push(step);
        console.log(chalk.green(`  ${stepNumber}/${this.steps.length} ✓ ${step.name} (${stepTime}ms)`));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`  ${stepNumber}/${this.steps.length} ✗ ${step.name}: ${errorMessage}`));
        
        // ロールバック実行
        await this.rollback();
        
        // 実行時間を表示
        const totalTime = Math.round(performance.now() - this.startTime);
        console.log(chalk.yellow(`⏱ 実行時間: ${totalTime}ms`));
        
        throw new Error(`ステップ「${step.name}」で失敗: ${errorMessage}`);
      }
    }
    
    const totalTime = Math.round(performance.now() - this.startTime);
    console.log(chalk.green.bold(`✅ 全${this.steps.length}ステップが完了しました (${totalTime}ms)`));
  }
  
  /**
   * ロールバック処理
   */
  private async rollback(): Promise<void> {
    if (this.completedSteps.length === 0) {
      console.log(chalk.yellow('⏮ ロールバック対象がありません'));
      return;
    }
    
    console.log(chalk.yellow.bold(`\n⏮ ロールバックを開始します (${this.completedSteps.length}ステップ)...`));
    
    let rollbackErrors: string[] = [];
    
    // 逆順でロールバック
    for (const step of this.completedSteps.slice().reverse()) {
      try {
        if (step.rollback) {
          console.log(chalk.gray(`  ↩ ${step.name}をロールバック...`));
          await step.rollback();
          console.log(chalk.yellow(`  ✓ ${step.name}のロールバック完了`));
        } else {
          console.log(chalk.gray(`  ⚠ ${step.name}: ロールバック処理なし`));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        rollbackErrors.push(`${step.name}: ${errorMessage}`);
        console.error(chalk.red(`  ✗ ロールバック失敗: ${step.name} - ${errorMessage}`));
      }
    }
    
    // 最終的なクリーンアップ
    await this.performFinalCleanup();
    
    if (rollbackErrors.length > 0) {
      console.error(chalk.red.bold('⚠ 一部のロールバック処理が失敗しました:'));
      for (const error of rollbackErrors) {
        console.error(chalk.red(`  - ${error}`));
      }
    } else {
      console.log(chalk.yellow.bold('✅ ロールバック完了'));
    }
  }
  
  /**
   * 最終的なクリーンアップ処理
   */
  private async performFinalCleanup(): Promise<void> {
    try {
      // 生成されたファイルとディレクトリを削除
      const generatedFiles = this.state.getGeneratedFiles();
      const generatedDirs = this.state.getGeneratedDirectories();
      
      if (generatedFiles.length > 0 || generatedDirs.length > 0) {
        console.log(chalk.gray('  🗑 生成されたファイル・ディレクトリを削除中...'));
        
        // ファイルを削除
        for (const file of generatedFiles) {
          if (await fs.pathExists(file)) {
            await fs.remove(file);
            if (this.verbose) {
              console.log(chalk.gray(`    - ${file}`));
            }
          }
        }
        
        // ディレクトリを削除（逆順）
        for (const dir of generatedDirs.slice().reverse()) {
          if (await fs.pathExists(dir)) {
            await fs.remove(dir);
            if (this.verbose) {
              console.log(chalk.gray(`    - ${dir}/`));
            }
          }
        }
      }
      
      // ターゲットディレクトリが存在し、空の場合は削除
      if (await fs.pathExists(this.targetPath)) {
        const files = await fs.readdir(this.targetPath);
        if (files.length === 0) {
          await fs.remove(this.targetPath);
          console.log(chalk.yellow('  🗑 空のターゲットディレクトリを削除しました'));
        } else {
          console.log(chalk.yellow('  ⚠ ターゲットディレクトリに他のファイルがあるため削除しませんでした'));
        }
      }
      
      // 状態をクリア
      this.state.clear();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`  ✗ 最終クリーンアップ失敗: ${errorMessage}`));
    }
  }
  
  /**
   * 進捗状況を取得
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.completedSteps.length;
    const total = this.steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  }
  
  /**
   * 詳細情報を取得
   */
  getDetails(): {
    steps: TransactionStep[];
    completedSteps: TransactionStep[];
    targetPath: string;
    elapsedTime: number;
  } {
    const elapsedTime = this.startTime > 0 ? Math.round(performance.now() - this.startTime) : 0;
    
    return {
      steps: this.steps,
      completedSteps: this.completedSteps,
      targetPath: this.targetPath,
      elapsedTime
    };
  }
}

/**
 * 便利な事前定義ステップ
 */
export class CommonSteps {
  /**
   * ディレクトリ作成ステップ
   */
  static createDirectory(path: string, state: GenerationState): TransactionStep {
    return {
      name: 'ディレクトリ作成',
      description: `ターゲットディレクトリを作成: ${path}`,
      execute: async () => {
        await fs.ensureDir(path);
        state.addGeneratedDirectory(path);
      },
      rollback: async () => {
        if (await fs.pathExists(path)) {
          await fs.remove(path);
        }
      }
    };
  }
  
  /**
   * ファイルコピーステップ
   */
  static copyFile(source: string, destination: string, state: GenerationState): TransactionStep {
    return {
      name: 'ファイルコピー',
      description: `${source} → ${destination}`,
      execute: async () => {
        await fs.copy(source, destination);
        state.addGeneratedFile(destination);
      },
      rollback: async () => {
        if (await fs.pathExists(destination)) {
          await fs.remove(destination);
        }
      }
    };
  }
  
  /**
   * ファイル作成ステップ
   */
  static createFile(path: string, content: string, state: GenerationState): TransactionStep {
    return {
      name: 'ファイル作成',
      description: `ファイルを作成: ${path}`,
      execute: async () => {
        await fs.writeFile(path, content, 'utf8');
        state.addGeneratedFile(path);
      },
      rollback: async () => {
        if (await fs.pathExists(path)) {
          await fs.remove(path);
        }
      }
    };
  }
}