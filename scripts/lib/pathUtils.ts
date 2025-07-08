/**
 * パス展開ユーティリティ
 * 
 * クロスプラットフォーム対応のパス操作機能を提供します。
 */

import { homedir } from 'os';
import { resolve, normalize, isAbsolute } from 'path';

/**
 * パス展開エラークラス
 */
export class PathExpansionError extends Error {
  constructor(message: string, public readonly originalPath: string) {
    super(message);
    this.name = 'PathExpansionError';
  }
}

/**
 * パスを展開する
 * - `~/` で始まるパスをホームディレクトリに展開
 * - 相対パスを絶対パスに変換
 * - パスの正規化
 */
export function expandPath(inputPath: string): string {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new PathExpansionError('パスが指定されていません', inputPath);
  }

  const trimmedPath = inputPath.trim();
  if (trimmedPath.length === 0) {
    throw new PathExpansionError('パスは空文字にできません', inputPath);
  }

  let expandedPath: string;

  try {
    // ホームディレクトリの展開
    if (trimmedPath.startsWith('~/')) {
      const homeDir = homedir();
      if (!homeDir) {
        throw new PathExpansionError('ホームディレクトリを取得できません', inputPath);
      }
      expandedPath = resolve(homeDir, trimmedPath.slice(2));
    } else if (trimmedPath === '~') {
      const homeDir = homedir();
      if (!homeDir) {
        throw new PathExpansionError('ホームディレクトリを取得できません', inputPath);
      }
      expandedPath = homeDir;
    } else {
      // 絶対パスまたは相対パスの処理
      expandedPath = isAbsolute(trimmedPath) ? trimmedPath : resolve(trimmedPath);
    }

    // パスの正規化
    expandedPath = normalize(expandedPath);

    return expandedPath;
  } catch (error) {
    if (error instanceof PathExpansionError) {
      throw error;
    }
    throw new PathExpansionError(
      `パスの展開中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      inputPath
    );
  }
}

/**
 * 安全なパスかどうかをチェックする
 */
export function isSafePath(filePath: string): boolean {
  if (!filePath || typeof filePath !== 'string') {
    return false;
  }
  
  try {
    // 元のパスパターンもチェック（Windowsスタイルパス）
    if (/^[a-zA-Z]:[\\\/]?$/.test(filePath) || /^[a-zA-Z]:[\\\/]Windows[\\\/]/i.test(filePath)) {
      return false;
    }
    
    const expandedPath = expandPath(filePath);
    
    // ルートディレクトリのチェック
    if (expandedPath === '/') {
      return false;
    }

    // システムディレクトリのチェック (Unix系)
    const systemDirs = [
      '/bin', '/sbin', '/usr/bin', '/usr/sbin',
      '/etc', '/var', '/tmp', '/dev', '/proc', '/sys'
    ];

    for (const sysDir of systemDirs) {
      if (expandedPath.startsWith(sysDir + '/') || expandedPath === sysDir) {
        return false;
      }
    }

    // パストラバーサル攻撃のチェック（正規化後もチェック）
    if (expandedPath.includes('..')) {
      return false;
    }

    // 危険なパターンのチェック（特に '../../../etc' のような相対パス）
    if (filePath.includes('../../') || filePath.includes('..\\..\\')) {
      return false;
    }

    // Windowsパスが含まれている場合（展開後のパス名に）
    if (expandedPath.includes('C:\\') || expandedPath.includes('C:/')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * パスを安全に展開する（安全性チェック付き）
 */
export function safeExpandPath(inputPath: string): string {
  if (!isSafePath(inputPath)) {
    throw new PathExpansionError('安全でないパスが指定されています', inputPath);
  }
  
  const expandedPath = expandPath(inputPath);
  
  return expandedPath;
}

/**
 * 複数のパスを安全に結合する
 */
export function safejoin(...paths: string[]): string {
  if (paths.length === 0) {
    throw new PathExpansionError('結合するパスが指定されていません', '');
  }
  
  // 最初のパスを基準とし、残りを相対パスとして結合
  const firstPath = paths[0];
  if (!firstPath) {
    throw new PathExpansionError('最初のパスが無効です', '');
  }
  const basePath = expandPath(firstPath);
  const relativePaths = paths.slice(1);
  
  // パスを結合（最初のパスから相対的に結合）
  const joinedPath = resolve(basePath, ...relativePaths);
  
  // 安全性チェック
  if (!isSafePath(joinedPath)) {
    throw new PathExpansionError('結合されたパスが安全ではありません', paths.join(' + '));
  }
  
  return joinedPath;
}

/**
 * パスが存在するかどうかをチェック（安全性チェック付き）
 */
export async function safePathExists(filePath: string): Promise<boolean> {
  try {
    const safePath = safeExpandPath(filePath);
    const fs = await import('fs-extra');
    return await fs.pathExists(safePath);
  } catch {
    return false;
  }
}