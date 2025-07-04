/**
 * プラグイン品質検証・認証システム
 * 
 * プラグインの品質基準への適合性を検証し、
 * セキュリティ・パフォーマンス・コード品質をチェックします。
 */

import type { 
  Plugin, 
  PluginMetadata, 
  ProjectTemplate, 
  PluginContext,
  HealthCheckResult 
} from './types.js';
import fs from 'fs-extra';
import * as path from 'path';

export interface ValidationResult {
  valid: boolean;
  score: number; // 0-100のスコア
  level: QualityLevel;
  issues: ValidationIssue[];
  recommendations: string[];
  timestamp: string;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: ValidationCategory;
  message: string;
  details?: string;
  location?: string;
}

export type ValidationCategory = 
  | 'metadata'
  | 'interface'
  | 'security'
  | 'performance' 
  | 'code-quality'
  | 'documentation'
  | 'testing';

export type QualityLevel = 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';

export interface PluginCertification {
  pluginId: string;
  version: string;
  certificationLevel: QualityLevel;
  validationDate: string;
  expiryDate: string;
  validator: string;
  signature: string;
}

/**
 * プラグイン品質検証器
 */
export class PluginValidator {
  private context: PluginContext;
  private config: ValidationConfig;

  constructor(context: PluginContext, config?: Partial<ValidationConfig>) {
    this.context = context;
    this.config = {
      strictMode: false,
      minScore: 70,
      maxExecutionTime: 30000,
      requireDocumentation: true,
      requireTests: false,
      securityChecks: true,
      ...config
    };
  }

  /**
   * プラグインの包括的品質検証
   */
  async validatePlugin(plugin: Plugin, pluginPath: string): Promise<ValidationResult> {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    let score = 100;

    this.context.logger.info('Starting plugin validation', {
      pluginId: plugin.metadata.id,
      strictMode: this.config.strictMode
    });

    try {
      // 1. メタデータ検証
      const metadataIssues = await this.validateMetadata(plugin.metadata);
      issues.push(...metadataIssues);

      // 2. インターフェース適合性検証
      const interfaceIssues = await this.validateInterface(plugin);
      issues.push(...interfaceIssues);

      // 3. セキュリティ検証
      if (this.config.securityChecks) {
        const securityIssues = await this.validateSecurity(plugin, pluginPath);
        issues.push(...securityIssues);
      }

      // 4. パフォーマンス検証
      const performanceIssues = await this.validatePerformance(plugin);
      issues.push(...performanceIssues);

      // 5. コード品質検証
      const codeQualityIssues = await this.validateCodeQuality(pluginPath);
      issues.push(...codeQualityIssues);

      // 6. ドキュメント検証
      if (this.config.requireDocumentation) {
        const docIssues = await this.validateDocumentation(pluginPath);
        issues.push(...docIssues);
      }

      // 7. テスト検証
      if (this.config.requireTests) {
        const testIssues = await this.validateTesting(pluginPath);
        issues.push(...testIssues);
      }

      // スコア計算
      score = this.calculateScore(issues);
      const level = this.determineQualityLevel(score);

      // 推奨事項生成
      const recommendations = this.generateRecommendations(issues, score);

      const result: ValidationResult = {
        valid: score >= this.config.minScore,
        score,
        level,
        issues,
        recommendations,
        timestamp: new Date().toISOString()
      };

      const duration = Date.now() - startTime;
      this.context.logger.info('Plugin validation completed', {
        pluginId: plugin.metadata.id,
        score,
        level,
        issueCount: issues.length,
        duration
      });

      return result;

    } catch (error) {
      this.context.logger.error('Plugin validation failed', {
        pluginId: plugin.metadata.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        valid: false,
        score: 0,
        level: 'unacceptable',
        issues: [{
          severity: 'error',
          category: 'interface',
          message: 'Validation process failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }],
        recommendations: ['Fix validation errors and retry'],
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * メタデータ検証
   */
  private async validateMetadata(metadata: PluginMetadata): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // 必須フィールドチェック
    const requiredFields = ['id', 'name', 'version', 'description', 'author'];
    for (const field of requiredFields) {
      if (!metadata[field as keyof PluginMetadata]) {
        issues.push({
          severity: 'error',
          category: 'metadata',
          message: `Required field '${field}' is missing`,
          location: 'metadata'
        });
      }
    }

    // ID形式チェック
    if (metadata.id && !/^[a-z][a-z0-9-]*$/.test(metadata.id)) {
      issues.push({
        severity: 'error',
        category: 'metadata',
        message: 'Plugin ID must follow kebab-case format',
        details: 'Use lowercase letters, numbers, and hyphens only',
        location: 'metadata.id'
      });
    }

    // バージョン形式チェック
    if (metadata.version && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/.test(metadata.version)) {
      issues.push({
        severity: 'error',
        category: 'metadata',
        message: 'Version must follow semantic versioning (semver)',
        details: 'Format: MAJOR.MINOR.PATCH(-PRERELEASE)',
        location: 'metadata.version'
      });
    }

    // 説明の長さチェック
    if (metadata.description && metadata.description.length < 10) {
      issues.push({
        severity: 'warning',
        category: 'metadata',
        message: 'Description is too short',
        details: 'Provide a meaningful description (at least 10 characters)',
        location: 'metadata.description'
      });
    }

    // タグの妥当性チェック
    if (metadata.tags) {
      const validTags = ['web', 'mobile', 'api', 'cli', 'tool', 'framework', 'library'];
      const invalidTags = metadata.tags.filter(tag => !validTags.includes(tag));
      if (invalidTags.length > 0) {
        issues.push({
          severity: 'info',
          category: 'metadata',
          message: 'Some tags are not recognized',
          details: `Invalid tags: ${invalidTags.join(', ')}`,
          location: 'metadata.tags'
        });
      }
    }

    return issues;
  }

  /**
   * インターフェース適合性検証
   */
  private async validateInterface(plugin: Plugin): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // 必須メソッドの存在確認
    const requiredMethods = ['initialize', 'getProjectTemplates', 'generateScaffold'];
    for (const method of requiredMethods) {
      if (typeof plugin[method as keyof Plugin] !== 'function') {
        issues.push({
          severity: 'error',
          category: 'interface',
          message: `Required method '${method}' is not implemented`,
          location: `plugin.${method}`
        });
      }
    }

    // テンプレート検証
    try {
      const templates = plugin.getProjectTemplates();
      if (!Array.isArray(templates)) {
        issues.push({
          severity: 'error',
          category: 'interface',
          message: 'getProjectTemplates must return an array',
          location: 'plugin.getProjectTemplates'
        });
      } else {
        templates.forEach((template, index) => {
          if (!template.id || !template.name || !template.description) {
            issues.push({
              severity: 'error',
              category: 'interface',
              message: `Template ${index} is missing required fields`,
              details: 'Templates must have id, name, and description',
              location: `templates[${index}]`
            });
          }
        });
      }
    } catch (error) {
      issues.push({
        severity: 'error',
        category: 'interface',
        message: 'getProjectTemplates method failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        location: 'plugin.getProjectTemplates'
      });
    }

    // ヘルスチェック（オプション）
    if (typeof plugin.healthCheck === 'function') {
      try {
        const healthResult = await plugin.healthCheck(this.context);
        if (!healthResult.healthy) {
          issues.push({
            severity: 'warning',
            category: 'interface',
            message: 'Plugin health check failed',
            details: healthResult.message || 'Health check returned unhealthy status',
            location: 'plugin.healthCheck'
          });
        }
      } catch (error) {
        issues.push({
          severity: 'warning',
          category: 'interface',
          message: 'Health check method failed',
          details: error instanceof Error ? error.message : 'Unknown error',
          location: 'plugin.healthCheck'
        });
      }
    }

    return issues;
  }

  /**
   * セキュリティ検証
   */
  private async validateSecurity(plugin: Plugin, pluginPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    try {
      // ファイル内容の読み取り
      const indexPath = path.join(pluginPath, 'index.ts');
      if (await fs.pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');

        // 危険なパターンの検出
        const dangerousPatterns = [
          { pattern: /eval\s*\(/g, message: 'Use of eval() is dangerous' },
          { pattern: /new\s+Function\s*\(/g, message: 'Dynamic function creation is dangerous' },
          { pattern: /process\.exit\s*\(/g, message: 'Direct process.exit calls should be avoided' },
          { pattern: /child_process/g, message: 'Child process execution needs security review' },
          { pattern: /fs\.unlinkSync|fs\.rmSync/g, message: 'File deletion operations need security review' },
          { pattern: /https?:\/\/[^"'\s]+/g, message: 'External URLs should be reviewed for security' }
        ];

        for (const { pattern, message } of dangerousPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            issues.push({
              severity: 'warning',
              category: 'security',
              message,
              details: `Found ${matches.length} occurrence(s)`,
              location: indexPath
            });
          }
        }

        // 入力検証の確認
        if (!content.includes('validation') && !content.includes('validate')) {
          issues.push({
            severity: 'info',
            category: 'security',
            message: 'No input validation patterns detected',
            details: 'Consider adding input validation for user inputs',
            location: indexPath
          });
        }
      }

      // package.json依存関係チェック
      const packagePath = path.join(pluginPath, 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        
        // 既知の脆弱な依存関係チェック（簡易版）
        const vulnerableDeps = ['lodash@<4.17.19', 'express@<4.17.1'];
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const dep of Object.keys(deps || {})) {
          if (vulnerableDeps.some(vuln => vuln.startsWith(dep + '@'))) {
            issues.push({
              severity: 'warning',
              category: 'security',
              message: `Potentially vulnerable dependency: ${dep}`,
              details: 'Please update to the latest secure version',
              location: packagePath
            });
          }
        }
      }

    } catch (error) {
      issues.push({
        severity: 'warning',
        category: 'security',
        message: 'Security validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return issues;
  }

  /**
   * パフォーマンス検証
   */
  private async validatePerformance(plugin: Plugin): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    try {
      // 初期化時間測定
      const startTime = Date.now();
      await plugin.initialize(this.context);
      const initTime = Date.now() - startTime;

      if (initTime > 5000) {
        issues.push({
          severity: 'warning',
          category: 'performance',
          message: 'Plugin initialization is slow',
          details: `Initialization took ${initTime}ms (recommended: <5000ms)`,
          location: 'plugin.initialize'
        });
      }

      // テンプレート取得時間測定
      const templateStartTime = Date.now();
      const templates = plugin.getProjectTemplates();
      const templateTime = Date.now() - templateStartTime;

      if (templateTime > 1000) {
        issues.push({
          severity: 'warning',
          category: 'performance',
          message: 'Template retrieval is slow',
          details: `Template retrieval took ${templateTime}ms (recommended: <1000ms)`,
          location: 'plugin.getProjectTemplates'
        });
      }

      // テンプレート数チェック
      if (templates.length > 10) {
        issues.push({
          severity: 'info',
          category: 'performance',
          message: 'Large number of templates',
          details: `Plugin provides ${templates.length} templates (consider grouping)`,
          location: 'plugin.getProjectTemplates'
        });
      }

    } catch (error) {
      issues.push({
        severity: 'warning',
        category: 'performance',
        message: 'Performance validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return issues;
  }

  /**
   * コード品質検証
   */
  private async validateCodeQuality(pluginPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    try {
      const indexPath = path.join(pluginPath, 'index.ts');
      if (await fs.pathExists(indexPath)) {
        const content = await fs.readFile(indexPath, 'utf8');

        // 基本的な品質チェック
        const lines = content.split('\n');
        
        // コメント密度チェック
        const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('*'));
        const commentRatio = commentLines.length / lines.length;
        
        if (commentRatio < 0.1) {
          issues.push({
            severity: 'info',
            category: 'code-quality',
            message: 'Low comment density',
            details: `Comment ratio: ${(commentRatio * 100).toFixed(1)}% (recommended: >10%)`,
            location: indexPath
          });
        }

        // ファイルサイズチェック
        if (content.length > 50000) {
          issues.push({
            severity: 'warning',
            category: 'code-quality',
            message: 'Large plugin file',
            details: `File size: ${content.length} characters (consider splitting)`,
            location: indexPath
          });
        }

        // console.log使用チェック
        const consoleMatches = content.match(/console\.(log|warn|error)/g);
        if (consoleMatches && consoleMatches.length > 5) {
          issues.push({
            severity: 'info',
            category: 'code-quality',
            message: 'Excessive console usage',
            details: `Found ${consoleMatches.length} console statements (use logger instead)`,
            location: indexPath
          });
        }

        // TODO/FIXMEチェック
        const todoMatches = content.match(/(TODO|FIXME|XXX)/g);
        if (todoMatches && todoMatches.length > 0) {
          issues.push({
            severity: 'info',
            category: 'code-quality',
            message: 'Unresolved TODO/FIXME items',
            details: `Found ${todoMatches.length} unresolved items`,
            location: indexPath
          });
        }
      }

    } catch (error) {
      issues.push({
        severity: 'warning',
        category: 'code-quality',
        message: 'Code quality validation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return issues;
  }

  /**
   * ドキュメント検証
   */
  private async validateDocumentation(pluginPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    // 必須ドキュメントファイル
    const requiredDocs = ['README.md'];
    const recommendedDocs = ['docs/configuration.md', 'docs/examples.md'];

    for (const doc of requiredDocs) {
      const docPath = path.join(pluginPath, doc);
      if (!(await fs.pathExists(docPath))) {
        issues.push({
          severity: 'error',
          category: 'documentation',
          message: `Required documentation file missing: ${doc}`,
          location: docPath
        });
      } else {
        // README.md内容チェック
        const content = await fs.readFile(docPath, 'utf8');
        if (content.length < 200) {
          issues.push({
            severity: 'warning',
            category: 'documentation',
            message: 'README.md is too short',
            details: 'Provide comprehensive documentation (at least 200 characters)',
            location: docPath
          });
        }
      }
    }

    for (const doc of recommendedDocs) {
      const docPath = path.join(pluginPath, doc);
      if (!(await fs.pathExists(docPath))) {
        issues.push({
          severity: 'info',
          category: 'documentation',
          message: `Recommended documentation file missing: ${doc}`,
          location: docPath
        });
      }
    }

    return issues;
  }

  /**
   * テスト検証
   */
  private async validateTesting(pluginPath: string): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    const testPaths = [
      path.join(pluginPath, 'test'),
      path.join(pluginPath, 'tests'),
      path.join(pluginPath, '__tests__')
    ];

    let hasTests = false;
    for (const testPath of testPaths) {
      if (await fs.pathExists(testPath)) {
        hasTests = true;
        break;
      }
    }

    if (!hasTests) {
      issues.push({
        severity: 'warning',
        category: 'testing',
        message: 'No test directory found',
        details: 'Add tests to ensure plugin reliability',
        location: pluginPath
      });
    }

    return issues;
  }

  /**
   * スコア計算
   */
  private calculateScore(issues: ValidationIssue[]): number {
    let score = 100;

    for (const issue of issues) {
      switch (issue.severity) {
        case 'error':
          score -= 15;
          break;
        case 'warning':
          score -= 5;
          break;
        case 'info':
          score -= 1;
          break;
      }
    }

    return Math.max(0, score);
  }

  /**
   * 品質レベル判定
   */
  private determineQualityLevel(score: number): QualityLevel {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'acceptable';
    if (score >= 50) return 'poor';
    return 'unacceptable';
  }

  /**
   * 推奨事項生成
   */
  private generateRecommendations(issues: ValidationIssue[], score: number): string[] {
    const recommendations: string[] = [];

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push(`Fix ${errorCount} critical error(s) to improve plugin reliability`);
    }

    if (warningCount > 0) {
      recommendations.push(`Address ${warningCount} warning(s) to enhance plugin quality`);
    }

    if (score < 70) {
      recommendations.push('Improve overall plugin quality to meet minimum standards');
    }

    // カテゴリ別推奨事項
    const categories = Array.from(new Set(issues.map(i => i.category)));
    if (categories.includes('documentation')) {
      recommendations.push('Improve documentation to help users understand the plugin');
    }
    if (categories.includes('testing')) {
      recommendations.push('Add comprehensive tests to ensure plugin stability');
    }
    if (categories.includes('security')) {
      recommendations.push('Review and address security concerns');
    }
    if (categories.includes('performance')) {
      recommendations.push('Optimize plugin performance for better user experience');
    }

    return recommendations;
  }

  /**
   * プラグイン認証発行
   */
  async generateCertification(
    plugin: Plugin, 
    validationResult: ValidationResult
  ): Promise<PluginCertification | null> {
    if (!validationResult.valid || validationResult.level === 'unacceptable') {
      return null;
    }

    const cert: PluginCertification = {
      pluginId: plugin.metadata.id,
      version: plugin.metadata.version,
      certificationLevel: validationResult.level,
      validationDate: validationResult.timestamp,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90日後
      validator: 'AI Driven Dev Starter Kit Validator v1.0',
      signature: this.generateSignature(plugin.metadata, validationResult)
    };

    this.context.logger.info('Plugin certification generated', {
      pluginId: cert.pluginId,
      level: cert.certificationLevel,
      expiryDate: cert.expiryDate
    });

    return cert;
  }

  /**
   * 認証署名生成（簡易版）
   */
  private generateSignature(metadata: PluginMetadata, result: ValidationResult): string {
    const data = `${metadata.id}:${metadata.version}:${result.score}:${result.timestamp}`;
    return Buffer.from(data).toString('base64');
  }
}

interface ValidationConfig {
  strictMode: boolean;
  minScore: number;
  maxExecutionTime: number;
  requireDocumentation: boolean;
  requireTests: boolean;
  securityChecks: boolean;
}