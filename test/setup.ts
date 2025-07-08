/**
 * Jest テストセットアップ
 * 
 * 全テストで共通の設定やモックを定義します。
 */

import fs from 'fs-extra';
import { jest, beforeEach, afterEach } from '@jest/globals';

// モック設定
jest.mock('inquirer');
jest.mock('ora');
jest.mock('chalk', () => ({
  blue: { bold: jest.fn((text: string) => text) },
  gray: jest.fn((text: string) => text),
  green: { bold: jest.fn((text: string) => text) },
  red: { 
    bold: jest.fn((text: string) => text),
    __call: jest.fn((text: string) => text)
  },
  yellow: jest.fn((text: string) => text),
  cyan: { bold: jest.fn((text: string) => text) },
  white: jest.fn((text: string) => text),
}));

// テスト用のディレクトリ
export const TEST_FIXTURES_DIR = '/tmp/ai-starter-kit-test';
export const TEST_OUTPUT_DIR = '/tmp/ai-starter-kit-output';

// テスト用のヘルパー関数
export async function ensureTestDirs() {
  await fs.ensureDir(TEST_FIXTURES_DIR);
  await fs.ensureDir(TEST_OUTPUT_DIR);
}

export async function cleanupTestDirs() {
  await fs.remove(TEST_FIXTURES_DIR);
  await fs.remove(TEST_OUTPUT_DIR);
}

// 各テストの前後でクリーンアップ
beforeEach(async () => {
  await ensureTestDirs();
});

afterEach(async () => {
  await cleanupTestDirs();
});

// テスト用のプロジェクト設定
export const mockProjectConfig = {
  projectName: 'test-project',
  projectType: 'mcp-server' as const,
  description: 'Test project description',
  repositoryUrl: 'https://github.com/test/test-project',
  prompt: 'basic-development' as const,
  techStack: {
    frontend: 'N/A',
    backend: 'Node.js/TypeScript',
    database: 'JSON Files',
    infrastructure: 'Docker',
    deployment: 'npm Registry',
    monitoring: 'Logs',
  },
  team: {
    size: 1,
    type: 'individual' as const,
    industry: 'Technology',
    complianceLevel: 'low' as const,
  },
  customizations: {},
};

export const mockScaffoldOptions = {
  targetPath: TEST_OUTPUT_DIR,
  projectName: 'test-project',
  projectType: 'mcp-server' as const,
  includeProjectManagement: true,
  includeArchitecture: false,
  includeTools: true,
  customCursorRules: true,
};