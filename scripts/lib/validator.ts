/**
 * バリデーションユーティリティ
 * 
 * Scaffold Generator で使用される入力データの検証機能を提供します。
 */

import { ProjectConfig } from './types.js';

/**
 * バリデーションエラークラス
 */
export class ValidationError extends Error {
  public readonly errors: string[];

  constructor(errors: string[]) {
    super(`検証エラー: ${errors.join(', ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * プロジェクトタイプの型ガード
 */
export function isValidProjectType(type: string): type is ProjectConfig['projectType'] {
  const validTypes: ProjectConfig['projectType'][] = [
    'cli-rust', 
    'web-nextjs', 
    'web-react', 
    'web-vue', 
    'api-fastapi', 
    'serverless-lambda', 
    'mcp-server'
  ];
  return validTypes.includes(type as ProjectConfig['projectType']);
}

/**
 * プロジェクト設定の検証
 */
export function validateProjectConfig(config: Partial<ProjectConfig>): asserts config is ProjectConfig {
  const errors: string[] = [];
  
  // プロジェクト名の検証
  if (!config.projectName || typeof config.projectName !== 'string') {
    errors.push('プロジェクト名は必須です');
  } else {
    const trimmedName = config.projectName.trim();
    if (trimmedName.length === 0) {
      errors.push('プロジェクト名は空文字にできません');
    } else if (trimmedName.length > 100) {
      errors.push('プロジェクト名は100文字以内で入力してください');
    } else if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(trimmedName)) {
      errors.push('プロジェクト名は英字で始まり、英数字、ハイフン、アンダースコアのみ使用可能です');
    }
  }
  
  // プロジェクトタイプの検証
  if (!config.projectType) {
    errors.push('プロジェクトタイプは必須です');
  } else if (!isValidProjectType(config.projectType)) {
    errors.push(`無効なプロジェクトタイプ: ${config.projectType}`);
  }
  
  // リポジトリ URL の検証
  if (config.repositoryUrl && !config.repositoryUrl.match(/^https?:\/\/.+/)) {
    errors.push('有効なリポジトリ URL を指定してください (例: https://github.com/user/repo)');
  }
  
  // 説明の検証
  if (config.description && typeof config.description === 'string') {
    if (config.description.length > 500) {
      errors.push('説明は500文字以内で入力してください');
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * ファイルパスの検証
 */
export function validateFilePath(filePath: string): void {
  if (!filePath || typeof filePath !== 'string') {
    throw new ValidationError(['ファイルパスが指定されていません']);
  }
  
  const trimmedPath = filePath.trim();
  if (trimmedPath.length === 0) {
    throw new ValidationError(['ファイルパスは空文字にできません']);
  }
  
  // 危険なパスのチェック
  const dangerousPatterns = [
    /\.\./,  // 親ディレクトリへの遷移
    /^\/$/,  // ルートディレクトリ
    /^[a-zA-Z]:\\/i,  // Windowsのルート
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmedPath)) {
      throw new ValidationError(['危険なファイルパスが指定されています']);
    }
  }
}

/**
 * スカフォールドオプションの検証
 */
export interface ScaffoldOptions {
  targetPath: string;
  projectName: string;
  projectType: ProjectConfig['projectType'];
  includeProjectManagement: boolean;
  includeArchitecture: boolean;
  includeTools: boolean;
  customCursorRules: boolean;
}

export function validateScaffoldOptions(options: Partial<ScaffoldOptions>): asserts options is ScaffoldOptions {
  const errors: string[] = [];
  
  // ターゲットパスの検証
  try {
    if (options.targetPath) {
      validateFilePath(options.targetPath);
    } else {
      errors.push('生成先パスは必須です');
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      errors.push(...error.errors.map(err => `生成先パス: ${err}`));
    }
  }
  
  // プロジェクト名の検証
  if (!options.projectName || typeof options.projectName !== 'string') {
    errors.push('プロジェクト名は必須です');
  } else {
    const trimmedName = options.projectName.trim();
    if (trimmedName.length === 0) {
      errors.push('プロジェクト名は空文字にできません');
    } else if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(trimmedName)) {
      errors.push('プロジェクト名は英字で始まり、英数字、ハイフン、アンダースコアのみ使用可能です');
    }
  }
  
  // プロジェクトタイプの検証
  if (!options.projectType) {
    errors.push('プロジェクトタイプは必須です');
  } else if (!isValidProjectType(options.projectType)) {
    errors.push(`無効なプロジェクトタイプ: ${options.projectType}`);
  }
  
  // ブールオプションの検証
  const booleanOptions = [
    'includeProjectManagement',
    'includeArchitecture', 
    'includeTools',
    'customCursorRules'
  ] as const;
  
  for (const option of booleanOptions) {
    if (options[option] !== undefined && typeof options[option] !== 'boolean') {
      errors.push(`${option} はブール値である必要があります`);
    }
  }
  
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

/**
 * プロジェクト名のバリデーション（inquirer用）
 */
export function validateProjectName(input: string): boolean | string {
  if (!input || typeof input !== 'string') {
    return 'プロジェクト名は必須です';
  }
  
  const trimmedName = input.trim();
  if (trimmedName.length === 0) {
    return 'プロジェクト名は空文字にできません';
  }
  
  if (trimmedName.length > 100) {
    return 'プロジェクト名は100文字以内で入力してください';
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(trimmedName)) {
    return 'プロジェクト名は英字で始まり、英数字、ハイフン、アンダースコアのみ使用可能です';
  }
  
  return true;
}

/**
 * プロジェクト名のサニタイズ
 */
export function sanitizeProjectName(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.trim();
}

/**
 * 説明のバリデーション（inquirer用）
 */
export function validateDescription(input: string): boolean | string {
  if (!input || typeof input !== 'string') {
    return true; // 説明は任意
  }
  
  if (input.length > 500) {
    return '説明は500文字以内で入力してください';
  }
  
  return true;
}

/**
 * 説明のサニタイズ
 */
export function sanitizeDescription(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.trim();
}

/**
 * リポジトリURLのバリデーション（inquirer用）
 */
export function validateRepositoryUrl(input: string): boolean | string {
  if (!input || typeof input !== 'string') {
    return 'リポジトリURLは必須です';
  }
  
  const trimmedUrl = input.trim();
  if (trimmedUrl.length === 0) {
    return 'リポジトリURLは空文字にできません';
  }
  
  if (!trimmedUrl.match(/^https?:\/\/.+/)) {
    return '有効なリポジトリURL を指定してください (例: https://github.com/user/repo)';
  }
  
  return true;
}

/**
 * プロジェクト名からスラッグを生成
 */
export function generateSlugFromName(projectName: string): string {
  if (!projectName || typeof projectName !== 'string') {
    return 'untitled-project';
  }
  
  return projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}