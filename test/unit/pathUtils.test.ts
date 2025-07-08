/**
 * パス展開ユーティリティの単体テスト
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { homedir } from 'os';
import { resolve } from 'path';
import {
  PathExpansionError,
  expandPath,
  isSafePath,
  safeExpandPath,
  safejoin,
} from '../../scripts/lib/pathUtils.js';

describe('PathExpansionError', () => {
  it('should create error with original path', () => {
    const originalPath = '~/invalid-path';
    const error = new PathExpansionError('Test error', originalPath);
    
    expect(error.name).toBe('PathExpansionError');
    expect(error.originalPath).toBe(originalPath);
    expect(error.message).toBe('Test error');
  });
});

describe('expandPath', () => {
  it('should expand home directory paths', () => {
    const homeDir = homedir();
    const testCases = [
      { input: '~/', expected: homeDir },
      { input: '~/documents', expected: resolve(homeDir, 'documents') },
      { input: '~/projects/test', expected: resolve(homeDir, 'projects/test') },
    ];
    
    testCases.forEach(({ input, expected }) => {
      expect(expandPath(input)).toBe(expected);
    });
  });
  
  it('should handle standalone home path', () => {
    const homeDir = homedir();
    expect(expandPath('~')).toBe(homeDir);
  });
  
  it('should resolve relative paths to absolute', () => {
    const testCases = [
      './test',
      'test/nested',
      '../parent',
    ];
    
    testCases.forEach(input => {
      const result = expandPath(input);
      expect(result).toBe(resolve(input));
    });
  });
  
  it('should return absolute paths as-is (normalized)', () => {
    const testCases = [
      '/absolute/path',
      '/home/user/project',
    ];
    
    testCases.forEach(input => {
      const result = expandPath(input);
      expect(result).toBe(resolve(input));
    });
  });
  
  it('should throw error for invalid inputs', () => {
    const invalidInputs = [
      '',
      '   ',
      null as any,
      undefined as any,
    ];
    
    invalidInputs.forEach(input => {
      expect(() => expandPath(input)).toThrow(PathExpansionError);
    });
  });
});

describe('isSafePath', () => {
  it('should return true for safe paths', () => {
    const safePaths = [
      '/home/user/project',
      './project',
      'project-name',
      '~/documents/project',
    ];
    
    safePaths.forEach(path => {
      expect(isSafePath(path)).toBe(true);
    });
  });
  
  it('should return false for unsafe paths', () => {
    const unsafePaths = [
      '/',
      '/bin',
      '/etc/passwd',
      '/usr/bin',
      '../../../etc',
      'C:\\',
      'C:\\Windows\\System32',
    ];
    
    unsafePaths.forEach(path => {
      const result = isSafePath(path);
      if (result !== false) {
        try {
          const expanded = expandPath(path);
          console.log(`Expected ${path} to be unsafe, but got safe. Expanded to: ${expanded}`);
        } catch (e) {
          console.log(`Expected ${path} to be unsafe, but got safe. Expansion failed: ${e}`);
        }
      }
      expect(result).toBe(false);
    });
  });
  
  it('should return false for invalid paths', () => {
    const invalidPaths = [
      '',
      null as any,
      undefined as any,
    ];
    
    invalidPaths.forEach(path => {
      expect(isSafePath(path)).toBe(false);
    });
  });
});

describe('safeExpandPath', () => {
  it('should expand safe paths successfully', () => {
    const safePath = './test-project';
    const result = safeExpandPath(safePath);
    
    expect(result).toBe(resolve(safePath));
  });
  
  it('should throw error for unsafe paths', () => {
    const unsafePaths = [
      '../../../etc',
      '/bin',
      '/',
    ];
    
    unsafePaths.forEach(path => {
      expect(() => safeExpandPath(path)).toThrow(PathExpansionError);
      expect(() => safeExpandPath(path)).toThrow('安全でないパスが指定されています');
    });
  });
});

describe('safejoin', () => {
  it('should join safe paths successfully', () => {
    const result = safejoin('./projects', 'test-project');
    expect(result).toBe(resolve('./projects', 'test-project'));
  });
  
  it('should throw error for no paths', () => {
    expect(() => safejoin()).toThrow(PathExpansionError);
    expect(() => safejoin()).toThrow('結合するパスが指定されていません');
  });
  
  it('should throw error when result is unsafe', () => {
    expect(() => safejoin('/', 'bin')).toThrow(PathExpansionError);
    expect(() => safejoin('/', 'bin')).toThrow('結合されたパスが安全ではありません');
  });
  
  it('should handle multiple path segments', () => {
    const result = safejoin('./projects', 'nested', 'test-project');
    expect(result).toBe(resolve('./projects', 'nested', 'test-project'));
  });
});