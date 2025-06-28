import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { ProjectConfig } from './types.js';

export interface DocumentTemplate {
  sourcePath: string;
  targetPath: string;
  content: string;
  variables: string[];
}

export interface DocumentVariables {
  // Project Info
  PROJECT_NAME: string;
  PROJECT_DESCRIPTION: string;
  PROJECT_TAGLINE: string;
  PROJECT_DETAILED_DESCRIPTION: string;
  PROJECT_PURPOSE: string;
  TARGET_SCOPE: string;
  OUT_OF_SCOPE: string;
  TARGET_USERS: string;

  // Requirements Document specific
  DOCUMENT_PURPOSE: string;
  SYSTEM_SCOPE: string;
  MVP_DEFINITION: string;
  SYSTEM_OVERVIEW: string;
  
  // Terms and Definitions
  TERM_1: string;
  TERM_2: string;
  TERM_3: string;
  DEFINITION_1: string;
  DEFINITION_2: string;
  DEFINITION_3: string;

  // Functional Requirements
  FUNCTIONAL_REQ_1: string;
  FUNCTIONAL_REQ_2: string;
  FUNCTIONAL_REQ_3: string;
  FUNCTIONAL_REQ_4: string;
  FUNCTIONAL_REQ_5: string;
  
  // Requirement details (1.x)
  REQUIREMENT_1_1: string;
  REQUIREMENT_1_2: string;
  REQUIREMENT_1_3: string;
  REQUIREMENT_2_1: string;
  REQUIREMENT_2_2: string;
  REQUIREMENT_2_3: string;
  REQUIREMENT_3_1: string;
  REQUIREMENT_3_2: string;
  REQUIREMENT_3_3: string;
  REQUIREMENT_4_1: string;
  REQUIREMENT_4_2: string;
  REQUIREMENT_4_3: string;
  REQUIREMENT_5_1: string;
  REQUIREMENT_5_2: string;
  REQUIREMENT_5_3: string;

  // Non-functional Requirements
  AVAILABILITY_REQ_1: string;
  AVAILABILITY_REQ_2: string;
  AVAILABILITY_REQ_3: string;
  PERFORMANCE_REQ_1: string;
  PERFORMANCE_REQ_2: string;
  PERFORMANCE_REQ_3: string;
  SECURITY_REQ_1: string;
  SECURITY_REQ_2: string;
  SECURITY_REQ_3: string;
  SCALABILITY_REQ_1: string;
  SCALABILITY_REQ_2: string;
  SCALABILITY_REQ_3: string;
  MAINTENANCE_REQ_1: string;
  MAINTENANCE_REQ_2: string;
  MAINTENANCE_REQ_3: string;

  // Technical Architecture Layers
  LAYER_1: string;
  LAYER_2: string;
  LAYER_3: string;
  LAYER_4: string;
  LAYER_5: string;
  LAYER_6: string;
  LAYER_7: string;
  LAYER_8: string;
  TECH_STACK_1: string;
  TECH_STACK_2: string;
  TECH_STACK_3: string;
  TECH_STACK_4: string;
  TECH_STACK_5: string;
  TECH_STACK_6: string;
  TECH_STACK_7: string;
  TECH_STACK_8: string;
  REASON_1: string;
  REASON_2: string;
  REASON_3: string;
  REASON_4: string;
  REASON_5: string;
  REASON_6: string;
  REASON_7: string;
  REASON_8: string;

  // External Integrations
  EXTERNAL_INTEGRATION_1: string;
  EXTERNAL_INTEGRATION_2: string;
  EXTERNAL_INTEGRATION_3: string;
  INTEGRATION_REQ_1_1: string;
  INTEGRATION_REQ_1_2: string;
  INTEGRATION_REQ_1_3: string;
  INTEGRATION_REQ_2_1: string;
  INTEGRATION_REQ_2_2: string;
  INTEGRATION_REQ_2_3: string;
  INTEGRATION_REQ_3_1: string;
  INTEGRATION_REQ_3_2: string;
  INTEGRATION_REQ_3_3: string;

  // Risks and Constraints
  RISK_1: string;
  RISK_2: string;
  RISK_3: string;
  IMPACT_1: string;
  IMPACT_2: string;
  IMPACT_3: string;
  PROBABILITY_1: string;
  PROBABILITY_2: string;
  PROBABILITY_3: string;
  MITIGATION_1: string;
  MITIGATION_2: string;
  MITIGATION_3: string;

  // Acceptance Criteria
  ACCEPTANCE_CRITERIA_1: string;
  ACCEPTANCE_CRITERIA_2: string;
  ACCEPTANCE_CRITERIA_3: string;
  PERFORMANCE_CRITERIA_1: string;
  PERFORMANCE_CRITERIA_2: string;
  PERFORMANCE_CRITERIA_3: string;
  SECURITY_CRITERIA_1: string;
  SECURITY_CRITERIA_2: string;
  SECURITY_CRITERIA_3: string;

  // Abbreviations and References
  ABBREVIATION_1: string;
  ABBREVIATION_2: string;
  ABBREVIATION_3: string;
  ABBREVIATION_DESC_1: string;
  ABBREVIATION_DESC_2: string;
  ABBREVIATION_DESC_3: string;
  REFERENCE_DOC_1: string;
  REFERENCE_DOC_2: string;
  REFERENCE_DOC_3: string;

  // Version History
  VERSION_1: string;
  VERSION_2: string;
  VERSION_3: string;
  DATE_1: string;
  DATE_2: string;
  DATE_3: string;
  CHANGE_1: string;
  CHANGE_2: string;
  CHANGE_3: string;
  AUTHOR_1: string;
  AUTHOR_2: string;
  AUTHOR_3: string;

  // Business Goals
  BUSINESS_GOAL_1: string;
  BUSINESS_GOAL_2: string;
  BUSINESS_GOAL_3: string;

  // MVP Features
  MVP_FEATURES: string;
  MVP_FEATURE_1: string;
  MVP_FEATURE_2: string;
  ISSUE_REF_1: string;
  ISSUE_REF_2: string;
  MVP_FEATURE_1_BRIEF: string;
  MVP_FEATURE_2_BRIEF: string;

  // Core Features
  CORE_FEATURE_1: string;
  CORE_FEATURE_2: string;
  CORE_FEATURE_3: string;
  CORE_FEATURE_4: string;
  CORE_FEATURE_1_BRIEF: string;
  CORE_FEATURE_2_BRIEF: string;
  CORE_FEATURE_3_BRIEF: string;
  CORE_FEATURE_4_BRIEF: string;

  // Extended Features
  EXT_FEATURE_1: string;
  EXT_FEATURE_2: string;
  EXT_FEATURE_3: string;
  EXT_FEATURE_1_BRIEF: string;
  EXT_FEATURE_2_BRIEF: string;
  EXT_FEATURE_3_BRIEF: string;

  // Technical Stack
  TECH_STACK: string;
  TECH_CATEGORY_1: string;
  TECH_CATEGORY_2: string;
  TECH_CATEGORY_3: string;
  TECH_LIST_1: string;
  TECH_LIST_2: string;
  TECH_LIST_3: string;

  // System Requirements
  MIN_OS: string;
  RECOMMENDED_OS: string;
  MIN_CPU: string;
  RECOMMENDED_CPU: string;
  MIN_MEMORY: string;
  RECOMMENDED_MEMORY: string;
  MIN_STORAGE: string;
  RECOMMENDED_STORAGE: string;

  // API Types
  API_TYPES: string;
  API_TYPES_DETAIL: string;

  // Architecture
  ARCHITECTURE_DIAGRAM: string;
  LAYER_1_NAME: string;
  LAYER_2_NAME: string;
  LAYER_3_NAME: string;

  // Development Status
  IMPLEMENTATION_SIZE: string;
  TEST_STATUS: string;
  COVERAGE_STATUS: string;

  // Contact Info
  GITHUB_ISSUES_URL: string;
  GITHUB_DISCUSSIONS_URL: string;
  CONTACT_EMAIL: string;
  LICENSE_TYPE: string;

  // Dates
  CREATION_DATE: string;
  LAST_UPDATE: string;
  VERSION: string;
  AUTHOR: string;
  APPROVER: string;

  // Project Structure specific
  PROJECT_TYPE: string;
  MAIN_DIRECTORY_1: string;
  MAIN_DIRECTORY_1_DESC: string;
  MAIN_DIRECTORY_1_DETAIL: string;
  MAIN_DIRECTORY_2: string;
  MAIN_DIRECTORY_2_DESC: string;
  MAIN_DIRECTORY_2_DETAIL: string;
  PROJECT_SPECIFIC_STRUCTURE: string;
  ENTRY_POINT_DESC: string;
}

export class DocumentTemplateProcessor {
  private readonly rootDir: string;
  private readonly templatesDir: string;
  private readonly targetDocsDir: string;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.templatesDir = path.join(rootDir, 'templates', 'docs');
    this.targetDocsDir = path.join(rootDir, 'docs');
  }

  async processDocumentTemplates(
    config: ProjectConfig,
    targetProjectDir: string,
    dryRun: boolean = false
  ): Promise<string[]> {
    const templateFiles = await this.findDocumentTemplates();
    const processedFiles: string[] = [];
    const variables = this.createDocumentVariables(config);

    // Ensure target docs directory exists
    const targetDocsPath = path.join(targetProjectDir, 'docs');
    if (!dryRun) {
      await fs.ensureDir(targetDocsPath);
    }

    for (const template of templateFiles) {
      try {
        const processed = await this.processDocumentTemplate(
          template,
          variables,
          targetProjectDir,
          dryRun
        );
        if (processed) {
          processedFiles.push(template.targetPath);
        }
      } catch (error) {
        console.error(`Failed to process ${template.sourcePath}:`, error);
      }
    }

    // プロジェクト構造のARCHITECTURE.mdがあれば統合処理
    await this.mergeProjectArchitecture(config, targetProjectDir, dryRun);

    return processedFiles;
  }

  private async findDocumentTemplates(): Promise<DocumentTemplate[]> {
    const templatePattern = '**/*.template';
    const files = await glob(templatePattern, {
      cwd: this.templatesDir,
      absolute: false,
    });

    const templates: DocumentTemplate[] = [];

    for (const file of files) {
      const sourcePath = path.join(this.templatesDir, file);
      const targetPath = file.replace('.template', '');
      const content = await fs.readFile(sourcePath, 'utf-8');
      const variables = this.extractVariables(content);

      templates.push({
        sourcePath,
        targetPath,
        content,
        variables,
      });
    }

    return templates;
  }

  private extractVariables(content: string): string[] {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      if (match[1] && !variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  private async processDocumentTemplate(
    template: DocumentTemplate,
    variables: DocumentVariables,
    targetProjectDir: string,
    dryRun: boolean
  ): Promise<boolean> {
    let processedContent = template.content;

    // Replace all variables
    for (const variable of template.variables) {
      const value = (variables as any)[variable] || `[${variable}]`;
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, value);
    }

    const targetPath = path.join(targetProjectDir, 'docs', template.targetPath);

    if (dryRun) {
      console.log(`Would create: ${targetPath}`);
      console.log(`  Variables: ${template.variables.join(', ')}`);
      return true;
    }

    // Ensure target directory exists
    await fs.ensureDir(path.dirname(targetPath));

    // Write processed content
    await fs.writeFile(targetPath, processedContent, 'utf-8');

    return true;
  }

  private createDocumentVariables(config: ProjectConfig): DocumentVariables {
    const now = new Date();
    const projectName = config.projectName;
    const currentDate = now.toISOString().split('T')[0] || '2024-01-01';
    const username = this.extractUsername(config.repositoryUrl) || 'developer';
    
    // プロジェクトタイプに基づく適切なデフォルト値を設定
    const projectTypeDefaults = this.getProjectTypeDefaults(config.projectType);
    
    return {
      // Project Info
      PROJECT_NAME: projectName,
      PROJECT_DESCRIPTION: config.description || `${projectName}の説明`,
      PROJECT_TAGLINE: `${projectName} - 効率的な開発を支援するツール`,
      PROJECT_DETAILED_DESCRIPTION: config.description || `${projectName}は、開発者の生産性向上を目的として作られたツールです。`,
      PROJECT_PURPOSE: `${projectName}の主要目的と価値提案`,
      TARGET_SCOPE: `${projectName}が対象とする機能・ユーザー範囲`,
      OUT_OF_SCOPE: `${projectName}の対象外となる範囲`,
      TARGET_USERS: `${projectName}の主要ユーザー`,

      // Requirements Document specific
      DOCUMENT_PURPOSE: `${projectName}のシステム要件を明確に定義し、開発チーム及び関係者間での共通理解を確立する`,
      SYSTEM_SCOPE: `${projectName}の機能範囲と技術的境界を定義`,
      MVP_DEFINITION: '最小限の機能で価値を提供できる製品バージョン',
      SYSTEM_OVERVIEW: projectTypeDefaults.systemOverview,

      // Terms and Definitions
      TERM_1: projectTypeDefaults.terms[0]?.name || 'Terms',
      TERM_2: projectTypeDefaults.terms[1]?.name || 'Framework',
      TERM_3: projectTypeDefaults.terms[2]?.name || 'Protocol',
      DEFINITION_1: projectTypeDefaults.terms[0]?.definition || 'プロジェクト固有の用語',
      DEFINITION_2: projectTypeDefaults.terms[1]?.definition || '使用するフレームワーク',
      DEFINITION_3: projectTypeDefaults.terms[2]?.definition || '通信プロトコル',

      // Functional Requirements
      FUNCTIONAL_REQ_1: projectTypeDefaults.functionalReqs[0] || 'コア機能',
      FUNCTIONAL_REQ_2: projectTypeDefaults.functionalReqs[1] || 'インターフェース',
      FUNCTIONAL_REQ_3: projectTypeDefaults.functionalReqs[2] || 'データ管理',
      FUNCTIONAL_REQ_4: projectTypeDefaults.functionalReqs[3] || '通信機能',
      FUNCTIONAL_REQ_5: projectTypeDefaults.functionalReqs[4] || '監視機能',

      // Requirement details - 各機能要件の詳細
      REQUIREMENT_1_1: `${projectTypeDefaults.functionalReqs[0] || 'コア機能'}の基本実装`,
      REQUIREMENT_1_2: `${projectTypeDefaults.functionalReqs[0] || 'コア機能'}のデータ管理`,
      REQUIREMENT_1_3: `${projectTypeDefaults.functionalReqs[0] || 'コア機能'}のエラーハンドリング`,
      REQUIREMENT_2_1: `${projectTypeDefaults.functionalReqs[1] || 'インターフェース'}のインターフェース設計`,
      REQUIREMENT_2_2: `${projectTypeDefaults.functionalReqs[1] || 'インターフェース'}のユーザビリティ`,
      REQUIREMENT_2_3: `${projectTypeDefaults.functionalReqs[1] || 'インターフェース'}のレスポンシブ対応`,
      REQUIREMENT_3_1: `${projectTypeDefaults.functionalReqs[2] || 'データ管理'}の認証機能`,
      REQUIREMENT_3_2: `${projectTypeDefaults.functionalReqs[2] || 'データ管理'}の認可機能`,
      REQUIREMENT_3_3: `${projectTypeDefaults.functionalReqs[2] || 'データ管理'}のセッション管理`,
      REQUIREMENT_4_1: `${projectTypeDefaults.functionalReqs[3] || '通信機能'}の通信プロトコル`,
      REQUIREMENT_4_2: `${projectTypeDefaults.functionalReqs[3] || '通信機能'}のデータ形式`,
      REQUIREMENT_4_3: `${projectTypeDefaults.functionalReqs[3] || '通信機能'}のエラー処理`,
      REQUIREMENT_5_1: `${projectTypeDefaults.functionalReqs[4] || '監視機能'}の監視機能`,
      REQUIREMENT_5_2: `${projectTypeDefaults.functionalReqs[4] || '監視機能'}のログ出力`,
      REQUIREMENT_5_3: `${projectTypeDefaults.functionalReqs[4] || '監視機能'}のメトリクス収集`,

      // Non-functional Requirements
      AVAILABILITY_REQ_1: '稼働率99.9%以上を目標とする',
      AVAILABILITY_REQ_2: 'メンテナンス時間は月1回、最大2時間以内',
      AVAILABILITY_REQ_3: '障害発生時の復旧時間は30分以内',
      PERFORMANCE_REQ_1: 'レスポンス時間は95%の場合で2秒以内',
      PERFORMANCE_REQ_2: '同時接続ユーザー数1000人まで対応',
      PERFORMANCE_REQ_3: 'スループットは毎秒100リクエスト以上',
      SECURITY_REQ_1: 'HTTPS通信の強制実装',
      SECURITY_REQ_2: 'パスワードの暗号化保存',
      SECURITY_REQ_3: 'セッション管理とCSRF対策',
      SCALABILITY_REQ_1: '水平スケーリング対応',
      SCALABILITY_REQ_2: 'データベースの分散処理対応',
      SCALABILITY_REQ_3: 'キャッシュ機能の実装',
      MAINTENANCE_REQ_1: '自動デプロイメント機能',
      MAINTENANCE_REQ_2: 'ログ監視とアラート機能',
      MAINTENANCE_REQ_3: 'バックアップとリストア機能',

      // Technical Architecture Layers
      LAYER_1: 'プレゼンテーション層',
      LAYER_2: 'アプリケーション層',
      LAYER_3: 'ビジネスロジック層',
      LAYER_4: 'データアクセス層',
      LAYER_5: 'インフラストラクチャ層',
      LAYER_6: 'セキュリティ層',
      LAYER_7: '監視・ログ層',
      LAYER_8: '外部連携層',
      TECH_STACK_1: config.techStack.frontend || projectTypeDefaults.techStack.frontend || 'TBD',
      TECH_STACK_2: config.techStack.backend || projectTypeDefaults.techStack.backend || 'TBD',
      TECH_STACK_3: config.techStack.database || projectTypeDefaults.techStack.database || 'TBD',
      TECH_STACK_4: config.techStack.infrastructure || projectTypeDefaults.techStack.infrastructure || 'TBD',
      TECH_STACK_5: 'Docker/Kubernetes',
      TECH_STACK_6: 'OAuth 2.0/JWT',
      TECH_STACK_7: 'Prometheus/Grafana',
      TECH_STACK_8: 'REST API/gRPC',
      REASON_1: 'ユーザビリティと開発効率を重視',
      REASON_2: 'スケーラビリティと保守性を重視',
      REASON_3: 'データ整合性と性能を重視',
      REASON_4: 'クラウドネイティブ対応',
      REASON_5: 'コンテナ化とオーケストレーション',
      REASON_6: 'セキュアな認証・認可',
      REASON_7: '運用監視とトラブルシューティング',
      REASON_8: '外部システムとの統合',

      // External Integrations
      EXTERNAL_INTEGRATION_1: 'サードパーティAPI連携',
      EXTERNAL_INTEGRATION_2: 'データベース外部連携',
      EXTERNAL_INTEGRATION_3: '通知・メール連携',
      INTEGRATION_REQ_1_1: 'API認証とレート制限対応',
      INTEGRATION_REQ_1_2: 'データ形式の正規化',
      INTEGRATION_REQ_1_3: '障害時のフォールバック機能',
      INTEGRATION_REQ_2_1: 'データ同期処理',
      INTEGRATION_REQ_2_2: 'トランザクション管理',
      INTEGRATION_REQ_2_3: 'データ整合性チェック',
      INTEGRATION_REQ_3_1: 'メール送信機能',
      INTEGRATION_REQ_3_2: 'プッシュ通知機能',
      INTEGRATION_REQ_3_3: 'SMS通知機能（オプション）',

      // Risks and Constraints
      RISK_1: '技術的複雑性による開発遅延',
      RISK_2: '外部API依存による可用性影響',
      RISK_3: 'セキュリティ脆弱性の発見',
      IMPACT_1: '高',
      IMPACT_2: '中',
      IMPACT_3: '高',
      PROBABILITY_1: '中',
      PROBABILITY_2: '低',
      PROBABILITY_3: '低',
      MITIGATION_1: 'プロトタイプ開発と段階的実装',
      MITIGATION_2: 'フォールバック機能の実装',
      MITIGATION_3: '定期的なセキュリティ監査',

      // Acceptance Criteria
      ACCEPTANCE_CRITERIA_1: '全ての機能要件が実装され、テストが通過している',
      ACCEPTANCE_CRITERIA_2: 'パフォーマンス要件を満たしている',
      ACCEPTANCE_CRITERIA_3: 'ユーザビリティテストで80%以上の満足度',
      PERFORMANCE_CRITERIA_1: 'レスポンス時間2秒以内',
      PERFORMANCE_CRITERIA_2: '同時接続1000ユーザー対応',
      PERFORMANCE_CRITERIA_3: 'CPU使用率80%以下',
      SECURITY_CRITERIA_1: 'OWASP Top 10の脆弱性対策完了',
      SECURITY_CRITERIA_2: 'ペネトレーションテスト合格',
      SECURITY_CRITERIA_3: 'データ暗号化の実装確認',

      // Abbreviations and References
      ABBREVIATION_1: 'API',
      ABBREVIATION_2: 'UI/UX',
      ABBREVIATION_3: 'DB',
      ABBREVIATION_DESC_1: 'Application Programming Interface',
      ABBREVIATION_DESC_2: 'User Interface / User Experience',
      ABBREVIATION_DESC_3: 'Database',
      REFERENCE_DOC_1: 'システム設計書',
      REFERENCE_DOC_2: 'API仕様書',
      REFERENCE_DOC_3: 'セキュリティ設計書',

      // Version History
      VERSION_1: '1.0.0',
      VERSION_2: '1.1.0',
      VERSION_3: '1.2.0',
      DATE_1: currentDate,
      DATE_2: currentDate,
      DATE_3: currentDate,
      CHANGE_1: '初版作成',
      CHANGE_2: '要件詳細化',
      CHANGE_3: 'セキュリティ要件追加',
      AUTHOR_1: username,
      AUTHOR_2: username,
      AUTHOR_3: username,

      // Business Goals
      BUSINESS_GOAL_1: '開発効率の向上',
      BUSINESS_GOAL_2: 'コード品質の向上',
      BUSINESS_GOAL_3: 'チーム協業の促進',

      // MVP Features
      MVP_FEATURES: 'コア機能、基本UI、基本API',
      MVP_FEATURE_1: '基本機能システム',
      MVP_FEATURE_2: 'ユーザーインターフェース',
      ISSUE_REF_1: 'Issue #1',
      ISSUE_REF_2: 'Issue #2',
      MVP_FEATURE_1_BRIEF: '基本的な機能を提供',
      MVP_FEATURE_2_BRIEF: '直感的なユーザーインターフェース',

      // Core Features
      CORE_FEATURE_1: 'データ管理',
      CORE_FEATURE_2: 'プロセス制御',
      CORE_FEATURE_3: 'ユーザー管理',
      CORE_FEATURE_4: '通信機能',
      CORE_FEATURE_1_BRIEF: '効率的なデータ管理システム',
      CORE_FEATURE_2_BRIEF: '柔軟なプロセス制御機能',
      CORE_FEATURE_3_BRIEF: '包括的なユーザー管理',
      CORE_FEATURE_4_BRIEF: '高速で信頼性の高い通信',

      // Extended Features
      EXT_FEATURE_1: 'ダッシュボード',
      EXT_FEATURE_2: 'レポート機能',
      EXT_FEATURE_3: '監視・アラート',
      EXT_FEATURE_1_BRIEF: 'リアルタイムダッシュボード',
      EXT_FEATURE_2_BRIEF: '詳細レポート生成',
      EXT_FEATURE_3_BRIEF: 'システム監視とアラート',

      // Technical Stack
      TECH_STACK: this.formatTechStack(config.techStack),
      TECH_CATEGORY_1: 'フロントエンド',
      TECH_CATEGORY_2: 'バックエンド',
      TECH_CATEGORY_3: 'インフラストラクチャ',
      TECH_LIST_1: config.techStack.frontend || 'React/Next.js',
      TECH_LIST_2: config.techStack.backend || 'Node.js/Express',
      TECH_LIST_3: config.techStack.infrastructure || 'AWS/Docker',

      // System Requirements
      MIN_OS: 'macOS 12.0+, Linux (Ubuntu 20.04+), Windows 10+',
      RECOMMENDED_OS: 'macOS 13.0+, Linux (Ubuntu 22.04+), Windows 11+',
      MIN_CPU: '2コア',
      RECOMMENDED_CPU: '4コア以上',
      MIN_MEMORY: '4GB RAM',
      RECOMMENDED_MEMORY: '8GB RAM以上',
      MIN_STORAGE: '500MB',
      RECOMMENDED_STORAGE: '1GB以上（SSD推奨）',

      // API Types
      API_TYPES: 'REST API, WebSocket API',
      API_TYPES_DETAIL: 'RESTful API、リアルタイムWebSocket通信',

      // Architecture
      ARCHITECTURE_DIAGRAM: '[アーキテクチャ図をここに挿入]',
      LAYER_1_NAME: 'プレゼンテーション層',
      LAYER_2_NAME: 'ビジネスロジック層',
      LAYER_3_NAME: 'データアクセス層',

      // Development Status
      IMPLEMENTATION_SIZE: `約${this.estimateCodeSize(config)}行`,
      TEST_STATUS: '基本テスト実装済み',
      COVERAGE_STATUS: '70%以上',

      // Contact Info
      GITHUB_ISSUES_URL: `${config.repositoryUrl}/issues`,
      GITHUB_DISCUSSIONS_URL: `${config.repositoryUrl}/discussions`,
      CONTACT_EMAIL: 'support@example.com',
      LICENSE_TYPE: 'MIT',

      // Dates
      CREATION_DATE: currentDate,
      LAST_UPDATE: currentDate,
      VERSION: '1.0.0',
      AUTHOR: username,
      APPROVER: username,

      // Project Structure specific
      PROJECT_TYPE: config.projectType,
      ...this.getProjectStructureDefaults(config.projectType),
    };
  }

  private formatTechStack(techStack: any): string {
    const parts = [];
    if (techStack.frontend) parts.push(`Frontend: ${techStack.frontend}`);
    if (techStack.backend) parts.push(`Backend: ${techStack.backend}`);
    if (techStack.database) parts.push(`Database: ${techStack.database}`);
    return parts.join(', ') || 'フルスタック開発';
  }

  private estimateCodeSize(config: ProjectConfig): string {
    const multipliers = {
      'cli-rust': 2000,
      'web-nextjs': 5000,
      'api-fastapi': 3000,
      'mcp-server': 1500,
    };
    
    const baseSize = multipliers[config.projectType as keyof typeof multipliers] || 3000;
    return (baseSize + Math.floor(Math.random() * 1000)).toLocaleString();
  }

  private extractUsername(url: string): string {
    try {
      const match = url.match(/github\.com\/([^/]+)/);
      return match?.[1] || 'developer';
    } catch {
      return 'developer';
    }
  }

  async createProjectCLAUDE(
    config: ProjectConfig,
    targetProjectDir: string,
    dryRun: boolean = false
  ): Promise<boolean> {
    const claudeContent = this.generateCLAUDEContent(config);
    const claudePath = path.join(targetProjectDir, 'CLAUDE.md');

    if (dryRun) {
      console.log(`Would create: ${claudePath}`);
      return true;
    }

    await fs.writeFile(claudePath, claudeContent, 'utf-8');
    return true;
  }

  private getProjectTypeDefaults(projectType: string) {
    const defaults = {
      'cli-rust': {
        systemOverview: 'Rustで開発されるコマンドラインツール。高性能で安全性を重視し、システム管理やデータ処理を効率的に行う。',
        terms: [
          { name: 'CLI', definition: 'Command Line Interface - コマンドライン操作インターフェース' },
          { name: 'Cargo', definition: 'Rustのパッケージマネージャー・ビルドシステム' },
          { name: 'crate', definition: 'Rustにおけるライブラリ・バイナリの単位' }
        ],
        functionalReqs: [
          'コマンドライン引数処理',
          'ファイル入出力処理',
          'エラーハンドリング',
          'ログ出力機能',
          'パフォーマンス監視'
        ],
        techStack: {
          frontend: 'Terminal UI',
          backend: 'Rust',
          database: 'SQLite',
          infrastructure: 'Docker'
        }
      },
      'web-nextjs': {
        systemOverview: 'Next.jsで開発されるモダンWebアプリケーション。React基盤でSEO対応、高性能、スケーラブルなユーザーエクスペリエンスを提供する。',
        terms: [
          { name: 'SSR', definition: 'Server-Side Rendering - サーバーサイドレンダリング' },
          { name: 'SSG', definition: 'Static Site Generation - 静的サイト生成' },
          { name: 'ISR', definition: 'Incremental Static Regeneration - 増分静的再生成' }
        ],
        functionalReqs: [
          'ページレンダリング',
          'ユーザー認証',
          'データ取得・表示',
          'フォーム処理',
          'レスポンシブ対応'
        ],
        techStack: {
          frontend: 'Next.js/React',
          backend: 'Next.js API Routes',
          database: 'PostgreSQL',
          infrastructure: 'Vercel'
        }
      },
      'api-fastapi': {
        systemOverview: 'FastAPIで開発されるRESTful API。高性能、自動ドキュメント生成、型安全性を重視したバックエンドサービスを提供する。',
        terms: [
          { name: 'REST', definition: 'Representational State Transfer - アーキテクチャスタイル' },
          { name: 'OpenAPI', definition: 'API仕様記述の標準フォーマット' },
          { name: 'Pydantic', definition: 'Pythonのデータバリデーションライブラリ' }
        ],
        functionalReqs: [
          'API エンドポイント',
          'データバリデーション',
          'データベース操作',
          '認証・認可',
          'API ドキュメント生成'
        ],
        techStack: {
          frontend: 'N/A',
          backend: 'FastAPI/Python',
          database: 'PostgreSQL',
          infrastructure: 'Docker/AWS'
        }
      },
      'mcp-server': {
        systemOverview: 'Model Context Protocol対応サーバー。AIモデルとの効率的な連携を実現し、ツール・リソース・プロンプトを統合管理する。',
        terms: [
          { name: 'MCP', definition: 'Model Context Protocol - AIモデル連携プロトコル' },
          { name: 'Tool', definition: 'AIが実行可能な機能単位' },
          { name: 'Resource', definition: 'AIが参照可能なデータ・情報' }
        ],
        functionalReqs: [
          'MCPプロトコル実装',
          'ツール管理',
          'リソース管理',
          'プロンプト管理',
          'JSON-RPC通信'
        ],
        techStack: {
          frontend: 'N/A',
          backend: 'Node.js/TypeScript',
          database: 'JSON Files',
          infrastructure: 'Docker'
        }
      }
    };

    return defaults[projectType as keyof typeof defaults] || defaults['web-nextjs'];
  }

  private getProjectStructureDefaults(projectType: string) {
    const structureDefaults = {
      'cli-rust': {
        MAIN_DIRECTORY_1: 'commands',
        MAIN_DIRECTORY_1_DESC: 'CLI コマンド実装',
        MAIN_DIRECTORY_1_DETAIL: 'サブコマンドの実装、引数処理、コマンドロジック',
        MAIN_DIRECTORY_2: 'lib',
        MAIN_DIRECTORY_2_DESC: 'ライブラリ・ビジネスロジック',
        MAIN_DIRECTORY_2_DETAIL: 'コア機能、データ処理、外部API連携',
        PROJECT_SPECIFIC_STRUCTURE: `### CLI特有の構造\n\n- **src/main.rs**: アプリケーションエントリーポイント\n- **src/commands/**: サブコマンド実装 (clap使用)\n- **src/lib/**: ビジネスロジック・共通機能\n- **Cargo.toml**: 依存関係・プロジェクト設定`,
        ENTRY_POINT_DESC: 'CLI アプリケーションのメイン実行ポイント、引数パースと初期化'
      },
      'web-nextjs': {
        MAIN_DIRECTORY_1: 'components',
        MAIN_DIRECTORY_1_DESC: 'React コンポーネント',
        MAIN_DIRECTORY_1_DETAIL: 'UI コンポーネント、ページコンポーネント、共通コンポーネント',
        MAIN_DIRECTORY_2: 'pages',
        MAIN_DIRECTORY_2_DESC: 'Next.js ページ・API ルート',
        MAIN_DIRECTORY_2_DETAIL: 'ページコンポーネント、API エンドポイント、ルーティング',
        PROJECT_SPECIFIC_STRUCTURE: `### Next.js特有の構造\n\n- **pages/**: ページルーティング (App Router使用時は app/)\n- **components/**: 再利用可能なReactコンポーネント\n- **public/**: 静的ファイル (画像、アイコン等)\n- **styles/**: CSS・スタイルファイル`,
        ENTRY_POINT_DESC: 'Next.js アプリケーションのルートコンポーネント、レイアウト設定'
      },
      'api-fastapi': {
        MAIN_DIRECTORY_1: 'routers',
        MAIN_DIRECTORY_1_DESC: 'API ルーター・エンドポイント',
        MAIN_DIRECTORY_1_DETAIL: 'REST API エンドポイント、リクエスト・レスポンス処理',
        MAIN_DIRECTORY_2: 'services',
        MAIN_DIRECTORY_2_DESC: 'ビジネスロジック・サービス層',
        MAIN_DIRECTORY_2_DETAIL: 'データ処理、外部API連携、ビジネスルール',
        PROJECT_SPECIFIC_STRUCTURE: `### FastAPI特有の構造\n\n- **routers/**: APIエンドポイント群 (FastAPI Router使用)\n- **models/**: Pydanticモデル・データ検証\n- **services/**: ビジネスロジック・外部連携\n- **database/**: データベース接続・ORM設定`,
        ENTRY_POINT_DESC: 'FastAPI アプリケーションインスタンス、ミドルウェア・ルーター設定'
      },
      'mcp-server': {
        MAIN_DIRECTORY_1: 'tools',
        MAIN_DIRECTORY_1_DESC: 'MCP ツール実装',
        MAIN_DIRECTORY_1_DETAIL: 'AI が実行可能なツール、外部API連携、データ処理機能',
        MAIN_DIRECTORY_2: 'resources',
        MAIN_DIRECTORY_2_DESC: 'MCP リソース提供',
        MAIN_DIRECTORY_2_DETAIL: 'AI が参照可能なデータ・情報、動的リソース生成',
        PROJECT_SPECIFIC_STRUCTURE: `### MCP Server特有の構造\n\n- **tools/**: AI実行可能ツール (Model Context Protocol準拠)\n- **resources/**: AIアクセス可能リソース\n- **prompts/**: 定義済みプロンプトテンプレート (オプション)\n- **types/**: MCP関連型定義・インターフェース`,
        ENTRY_POINT_DESC: 'MCP サーバーインスタンス、JSON-RPC 2.0 ハンドラー設定'
      }
    };

    return structureDefaults[projectType as keyof typeof structureDefaults] || structureDefaults['web-nextjs'];
  }

  private generateCLAUDEContent(config: ProjectConfig): string {
    return `# CLAUDE.md

このファイルは、${config.projectName}でAIエージェントが開発プロセスに参加する際のガイダンスを提供します。

## プロジェクト概要

**${config.projectName}** - ${config.description || 'プロジェクトの説明'}

## 開発哲学

### 基本原則
- **ドキュメント駆動開発**: 包括的なドキュメント体系の維持
- **品質重視**: テスト駆動開発とコードレビュー
- **継続的改善**: 定期的な振り返りと改善

## ドキュメント体系管理

### 📋 必須ドキュメント

AIエージェントは以下のドキュメントを認識し、開発プロセス中で自動更新してください：

#### 要求・仕様ドキュメント
- **docs/PRD.md** - プロジェクト要求仕様書（ビジネス要求の最上位）
- **docs/REQUIREMENTS.md** - システム要件定義書（技術要件の詳細）
- **docs/FEATURE-SPEC.md** - 機能仕様書（実装レベルの詳細）

#### 設計ドキュメント
- **docs/ARCHITECTURE.md** - アーキテクチャ設計書
- **docs/TECH-STACH.md** - 技術スタック選定理由
- **docs/API.md** - API仕様書
- **docs/DATA-FLOW.md** - データフロー設計
- **docs/SECURITY.md** - セキュリティ設計

#### 実装・運用ドキュメント
- **docs/TESTING.md** - テスト戦略・実装ガイド
- **docs/DEPLOYMENT.md** - デプロイメント・運用ガイド
- **docs/CONTRIBUTING.md** - 開発参加ガイド

#### プロジェクト管理
- **README.md** - プロジェクト概要（ユーザー向け）
- **docs/DOCUMENTATION-MAP.md** - ドキュメント体系管理

### 🔄 自動更新ルール

#### 機能実装時
1. **FEATURE-SPEC.md** の実装状況を ❌→⏳→✅ で更新
2. **API.md** に新しいエンドポイント仕様を追加
3. **TESTING.md** にテスト要件・結果を記録
4. **README.md** のユーザー向け機能説明を更新

#### バグ修正時
1. **FEATURE-SPEC.md** の制約・仕様を明確化
2. **TESTING.md** にテストケースを追加
3. 修正内容をコミットメッセージに記録

#### アーキテクチャ変更時
1. **ARCHITECTURE.md** の設計図・説明を更新
2. **TECH-STACH.md** の技術選定理由を更新
3. **API.md** のインターフェース変更を反映
4. **DEPLOYMENT.md** の設定・手順を更新

### 📊 品質管理

#### ドキュメント整合性チェック
- 実装状況の正確性（過大評価禁止）
- 数値データの測定ベース更新
- 参照リンクの正常性
- 用語の統一性

#### 更新タイミング
- [ ] 機能実装完了時
- [ ] テスト完了時
- [ ] バグ修正時
- [ ] アーキテクチャ変更時
- [ ] 月次レビュー時

## 開発ワークフロー

### 開発プロセス統合
1. **機能開発**: Issue作成 → 設計 → 実装 → テスト → ドキュメント更新
2. **ドキュメント更新**: Single Source of Truth原則に従い、関連ドキュメントを連鎖更新
3. **品質保証**: 自動テスト + ドキュメント整合性チェック

### AIエージェント向け指示

#### 必須実行項目
1. **作業前確認**: 関連ドキュメントの現状把握
2. **実装中記録**: 設計判断・制約事項の文書化
3. **完了時更新**: 実装状況・テスト結果の正確な反映
4. **整合性確認**: 関連ドキュメント間の一貫性チェック

#### 禁止事項
- ❌ ドキュメント更新のスキップ
- ❌ 実装状況の過大評価・虚偽記載
- ❌ テスト結果の改ざん
- ❌ 関連ドキュメントとの矛盾放置

## プロジェクト固有の設定

### 技術スタック
- **フロントエンド**: ${config.techStack?.frontend || 'TBD'}
- **バックエンド**: ${config.techStack?.backend || 'TBD'}
- **データベース**: ${config.techStack?.database || 'TBD'}
- **インフラ**: ${config.techStack?.infrastructure || 'TBD'}

### 開発環境
- **プロジェクトタイプ**: ${config.projectType}
- **チームサイズ**: ${config.team?.size || 1}人
- **開発スタイル**: ${config.team?.type || 'individual'}

### 品質基準
- **テストカバレッジ**: 80%以上
- **ドキュメント更新**: 機能実装時必須
- **コードレビュー**: 全変更必須

---

**重要**: このファイルは ${config.projectName} の開発プロセスの中核です。
AIエージェントは必ずこのガイドラインに従って作業してください。
`;
  }

  private async mergeProjectArchitecture(
    config: ProjectConfig,
    targetProjectDir: string,
    dryRun: boolean = false
  ): Promise<boolean> {
    // プロジェクト構造のARCHITECTURE.mdを確認
    const projectArchPath = path.join(targetProjectDir, 'ARCHITECTURE.md');
    const docsArchPath = path.join(targetProjectDir, 'docs', 'ARCHITECTURE.md');

    if (!await fs.pathExists(projectArchPath)) {
      // プロジェクト構造のARCHITECTURE.mdがない場合は何もしない
      return false;
    }

    if (dryRun) {
      console.log(`Would merge: ${projectArchPath} into ${docsArchPath}`);
      return true;
    }

    try {
      // プロジェクト構造のARCHITECTURE.mdを読み込む
      const projectArchContent = await fs.readFile(projectArchPath, 'utf-8');
      
      // docs/ARCHITECTURE.mdが存在する場合
      if (await fs.pathExists(docsArchPath)) {
        const docsArchContent = await fs.readFile(docsArchPath, 'utf-8');
        
        // プロジェクト構造特有のセクションを抽出
        const projectSpecificSections = this.extractProjectSpecificSections(projectArchContent);
        
        // ドキュメントテンプレートの内容に統合
        const mergedContent = this.mergeArchitectureContent(
          docsArchContent,
          projectSpecificSections,
          config
        );
        
        // 統合した内容をdocs/ARCHITECTURE.mdに書き込む
        await fs.writeFile(docsArchPath, mergedContent, 'utf-8');
        
        // ルートのARCHITECTURE.mdを削除
        await fs.remove(projectArchPath);
        
        console.log(chalk.green('✓ ARCHITECTURE.mdの内容を統合しました'));
      } else {
        // docs/ARCHITECTURE.mdがない場合は移動
        await fs.move(projectArchPath, docsArchPath);
        console.log(chalk.green('✓ ARCHITECTURE.mdをdocs/に移動しました'));
      }
      
      return true;
    } catch (error) {
      console.error('ARCHITECTURE.md統合中にエラー:', error);
      return false;
    }
  }

  private extractProjectSpecificSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    
    // 主要なセクションを抽出 (gフラグを追加して全体をキャプチャ)
    const sectionPatterns = [
      { key: 'techStack', pattern: /## 📋 技術スタック[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'architecture', pattern: /## 🎯 アーキテクチャ原則[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'directory', pattern: /## 📁 ディレクトリ構造[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'components', pattern: /## 🔧 コンポーネント設計[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'dataFlow', pattern: /## 🔄 データフロー[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'testing', pattern: /## 🧪 テスト戦略[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'security', pattern: /## 🔒 セキュリティ考慮事項[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'monitoring', pattern: /## 📊 監視・ログ[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'deployment', pattern: /## 🚀 デプロイメント[\s\S]*?(?=\n## |\n---|\nプロジェクトタイプ:|$)/g },
      { key: 'prdGuidance', pattern: /## 🔄 PRD要件対応指針[\s\S]*?(?=\n---|\n$)/g },
    ];
    
    for (const { key, pattern } of sectionPatterns) {
      const match = content.match(pattern);
      if (match && match[0]) {
        sections[key] = match[0].trim();
      }
    }
    
    return sections;
  }

  private mergeArchitectureContent(
    templateContent: string,
    projectSections: Record<string, string>,
    config: ProjectConfig
  ): string {
    let merged = templateContent;
    
    // 技術スタックセクションを置換
    if (projectSections.techStack) {
      merged = merged.replace(
        /## 1\. システム全体アーキテクチャ/,
        `${projectSections.techStack}\n\n## 1. システム全体アーキテクチャ`
      );
    }
    
    // ディレクトリ構造を追加
    if (projectSections.directory) {
      merged = merged.replace(
        /## 2\. コンポーネント詳細設計/,
        `${projectSections.directory}\n\n## 2. コンポーネント詳細設計`
      );
    }
    
    // コンポーネント設計の具体例を追加
    if (projectSections.components) {
      const componentsInsertPoint = merged.indexOf('## 3. データフロー設計');
      if (componentsInsertPoint > -1) {
        merged = merged.slice(0, componentsInsertPoint) + 
                projectSections.components + '\n\n' +
                merged.slice(componentsInsertPoint);
      }
    }
    
    // PRD要件対応指針を最後に追加
    if (projectSections.prdGuidance) {
      merged = merged.replace(
        /---\n\n\*\*注意\*\*: `\[VARIABLE_NAME\]`の部分は、プロジェクト固有の内容に置き換えてください。/,
        `${projectSections.prdGuidance}\n\n---\n\n**注意**: \`[VARIABLE_NAME]\`の部分は、プロジェクト固有の内容に置き換えてください。`
      );
    }
    
    // プロジェクトタイプ固有の情報を更新
    merged = merged.replace(
      /# アーキテクチャ仕様書/,
      `# アーキテクチャ仕様書 - ${config.projectName}\n\nプロジェクトタイプ: ${config.projectType}`
    );
    
    return merged;
  }
}