/**
 * バリデーション機能の単体テスト
 */

import { describe, it, expect } from '@jest/globals';
import {
  ValidationError,
  isValidProjectType,
  validateProjectConfig,
  validateFilePath,
  validateScaffoldOptions,
} from '../../scripts/lib/validator.js';
import { mockProjectConfig, mockScaffoldOptions } from '../setup.js';

describe('ValidationError', () => {
  it('should create error with multiple messages', () => {
    const errors = ['Error 1', 'Error 2'];
    const error = new ValidationError(errors);
    
    expect(error.name).toBe('ValidationError');
    expect(error.errors).toEqual(errors);
    expect(error.message).toBe('検証エラー: Error 1, Error 2');
  });
});

describe('isValidProjectType', () => {
  it('should return true for valid project types', () => {
    const validTypes = [
      'cli-rust',
      'web-nextjs',
      'web-react',
      'web-vue',
      'api-fastapi',
      'serverless-lambda',
      'mcp-server'
    ];
    
    validTypes.forEach(type => {
      expect(isValidProjectType(type)).toBe(true);
    });
  });
  
  it('should return false for invalid project types', () => {
    const invalidTypes = [
      'invalid-type',
      'web-angular',
      'mobile-react-native',
      '',
      'CLI-RUST',  // 大文字
    ];
    
    invalidTypes.forEach(type => {
      expect(isValidProjectType(type)).toBe(false);
    });
  });
});

describe('validateProjectConfig', () => {
  it('should pass validation for valid config', () => {
    expect(() => validateProjectConfig(mockProjectConfig)).not.toThrow();
  });
  
  it('should throw error for missing project name', () => {
    const config = { ...mockProjectConfig };
    delete (config as any).projectName;
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('プロジェクト名は必須です');
  });
  
  it('should throw error for empty project name', () => {
    const config = { ...mockProjectConfig, projectName: '   ' };
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('プロジェクト名は空文字にできません');
  });
  
  it('should throw error for too long project name', () => {
    const config = { ...mockProjectConfig, projectName: 'a'.repeat(101) };
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('プロジェクト名は100文字以内で入力してください');
  });
  
  it('should throw error for invalid project name characters', () => {
    const invalidNames = [
      '123project',  // 数字から始まる
      'project with spaces',  // スペース
      'project@name',  // 特殊文字
      'プロジェクト',  // 日本語
    ];
    
    invalidNames.forEach(name => {
      const config = { ...mockProjectConfig, projectName: name };
      expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    });
  });
  
  it('should throw error for missing project type', () => {
    const config = { ...mockProjectConfig };
    delete (config as any).projectType;
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('プロジェクトタイプは必須です');
  });
  
  it('should throw error for invalid project type', () => {
    const config = { ...mockProjectConfig, projectType: 'invalid-type' as any };
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('無効なプロジェクトタイプ: invalid-type');
  });
  
  it('should throw error for invalid repository URL', () => {
    const config = { ...mockProjectConfig, repositoryUrl: 'not-a-url' };
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('有効なリポジトリ URL を指定してください');
  });
  
  it('should throw error for too long description', () => {
    const config = { ...mockProjectConfig, description: 'a'.repeat(501) };
    
    expect(() => validateProjectConfig(config)).toThrow(ValidationError);
    expect(() => validateProjectConfig(config)).toThrow('説明は500文字以内で入力してください');
  });
});

describe('validateFilePath', () => {
  it('should pass validation for valid file paths', () => {
    const validPaths = [
      './project',
      '/home/user/project',
      'project-name',
      'nested/project/path',
    ];
    
    validPaths.forEach(path => {
      expect(() => validateFilePath(path)).not.toThrow();
    });
  });
  
  it('should throw error for empty or invalid file paths', () => {
    const invalidPaths = [
      '',
      '   ',
      null as any,
      undefined as any,
    ];
    
    invalidPaths.forEach(path => {
      expect(() => validateFilePath(path)).toThrow(ValidationError);
    });
  });
  
  it('should throw error for dangerous file paths', () => {
    const dangerousPaths = [
      '../../../etc/passwd',
      '/',
      'C:\\',
      'c:\\windows',
    ];
    
    dangerousPaths.forEach(path => {
      expect(() => validateFilePath(path)).toThrow(ValidationError);
      expect(() => validateFilePath(path)).toThrow('危険なファイルパスが指定されています');
    });
  });
});

describe('validateScaffoldOptions', () => {
  it('should pass validation for valid scaffold options', () => {
    expect(() => validateScaffoldOptions(mockScaffoldOptions)).not.toThrow();
  });
  
  it('should throw error for missing target path', () => {
    const options = { ...mockScaffoldOptions };
    delete (options as any).targetPath;
    
    expect(() => validateScaffoldOptions(options)).toThrow(ValidationError);
    expect(() => validateScaffoldOptions(options)).toThrow('生成先パスは必須です');
  });
  
  it('should throw error for invalid boolean options', () => {
    const options = { 
      ...mockScaffoldOptions, 
      includeProjectManagement: 'true' as any  // 文字列ではなくブール値が必要
    };
    
    expect(() => validateScaffoldOptions(options)).toThrow(ValidationError);
    expect(() => validateScaffoldOptions(options)).toThrow('includeProjectManagement はブール値である必要があります');
  });
  
  it('should handle multiple validation errors', () => {
    const options = {
      targetPath: '',  // 空のパス
      projectName: '',  // 空の名前
      projectType: 'invalid' as any,  // 無効なタイプ
      includeProjectManagement: 'true' as any,  // 無効な型
      includeArchitecture: true,
      includeTools: true,
      customCursorRules: true,
    };
    
    try {
      validateScaffoldOptions(options);
      fail('Should have thrown ValidationError');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.errors.length).toBeGreaterThan(1);
    }
  });
});