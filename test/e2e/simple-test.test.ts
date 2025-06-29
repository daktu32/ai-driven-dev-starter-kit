import { describe, it, expect } from '@jest/globals';
import { ProjectVerifier } from '../../scripts/lib/projectVerifier';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

describe('🧪 Simple E2E Test', () => {
  it('should create and verify ProjectVerifier', async () => {
    console.log(chalk.blue('🔍 ProjectVerifierクラスのテスト'));
    
    // 一時的なテストディレクトリを作成
    const testDir = path.join(process.cwd(), 'test', 'temp-simple');
    await fs.ensureDir(testDir);
    
    try {
      // ProjectVerifierインスタンスの作成
      const verifier = new ProjectVerifier('mcp-server', testDir);
      expect(verifier).toBeDefined();
      
      // 空のディレクトリでの検証
      const result = await verifier.verify();
      
      // 空のディレクトリなので多くのエラーが予想される
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.checkedFiles).toBeGreaterThan(0);
      
      console.log(chalk.green('✅ ProjectVerifier基本動作確認完了'));
      console.log(chalk.gray(`   チェックファイル数: ${result.checkedFiles}`));
      console.log(chalk.gray(`   エラー数: ${result.errors.length}`));
      
    } finally {
      // クリーンアップ
      await fs.remove(testDir);
    }
  });

  it('should handle file requirements correctly', async () => {
    console.log(chalk.blue('🔍 ファイル要件チェックのテスト'));
    
    const testDir = path.join(process.cwd(), 'test', 'temp-requirements');
    await fs.ensureDir(testDir);
    
    try {
      // 必須ファイルをいくつか作成
      await fs.writeFile(path.join(testDir, 'README.md'), '# Test Project');
      await fs.writeFile(path.join(testDir, 'CLAUDE.md'), '# Claude Config');
      await fs.ensureDir(path.join(testDir, 'docs'));
      await fs.writeFile(path.join(testDir, 'docs', 'PRD.md'), '# PRD');
      
      const verifier = new ProjectVerifier('mcp-server', testDir);
      const result = await verifier.verify();
      
      // 一部のファイルが存在するので、エラーは減るはず
      expect(result.missingFiles.length).toBeLessThan(10); // 完全には満たしていないが改善されているはず
      
      console.log(chalk.green('✅ ファイル要件チェック確認完了'));
      console.log(chalk.gray(`   不足ファイル数: ${result.missingFiles.length}`));
      
    } finally {
      await fs.remove(testDir);
    }
  });
});