import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

export interface VerificationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checkedFiles: number;
  missingFiles: string[];
  templateVariablesFound: string[];
}

export interface FileRequirement {
  path: string;
  required: boolean;
  description: string;
}

export class ProjectVerifier {
  private projectType: string;
  private targetPath: string;

  constructor(projectType: string, targetPath: string) {
    this.projectType = projectType;
    this.targetPath = targetPath;
  }

  async verify(): Promise<VerificationResult> {
    const result: VerificationResult = {
      valid: true,
      errors: [],
      warnings: [],
      checkedFiles: 0,
      missingFiles: [],
      templateVariablesFound: []
    };

    console.log(`🔍 プロジェクト検証開始: ${this.projectType} at ${this.targetPath}`);

    // 1. 必須ファイルの確認
    await this.verifyRequiredFiles(result);

    // 2. ファイル内容の検証
    await this.verifyFileContents(result);

    // 3. プロジェクト固有の検証
    await this.verifyProjectSpecific(result);

    // 4. テンプレート変数の残存チェック
    await this.verifyTemplateVariables(result);

    // 結果の判定
    result.valid = result.errors.length === 0;

    console.log(`✅ 検証完了: ${result.valid ? '成功' : '失敗'} (エラー: ${result.errors.length}, 警告: ${result.warnings.length})`);

    return result;
  }

  private async verifyRequiredFiles(result: VerificationResult): Promise<void> {
    const requirements = this.getFileRequirements();

    for (const req of requirements) {
      const filePath = path.join(this.targetPath, req.path);
      const exists = await fs.pathExists(filePath);
      
      result.checkedFiles++;

      if (!exists) {
        if (req.required) {
          result.errors.push(`必須ファイルが見つかりません: ${req.path} (${req.description})`);
          result.missingFiles.push(req.path);
        } else {
          result.warnings.push(`推奨ファイルが見つかりません: ${req.path} (${req.description})`);
        }
      }
    }
  }

  private async verifyFileContents(result: VerificationResult): Promise<void> {
    // package.jsonの検証（該当プロジェクトタイプの場合）
    if (['mcp-server', 'web-nextjs'].includes(this.projectType)) {
      await this.verifyPackageJson(result);
    }

    // Cargo.tomlの検証（Rustプロジェクトの場合）
    if (this.projectType === 'cli-rust') {
      await this.verifyCargoToml(result);
    }

    // TypeScript設定の検証
    if (['mcp-server', 'web-nextjs'].includes(this.projectType)) {
      await this.verifyTsConfig(result);
    }
  }

  private async verifyPackageJson(result: VerificationResult): Promise<void> {
    const packageJsonPath = path.join(this.targetPath, 'package.json');
    
    if (!(await fs.pathExists(packageJsonPath))) {
      return; // 既にverifyRequiredFilesでチェック済み
    }

    try {
      const packageJson = await fs.readJson(packageJsonPath);
      
      // 基本的なフィールドの確認
      const requiredFields = ['name', 'version', 'scripts'];
      for (const field of requiredFields) {
        if (!packageJson[field]) {
          result.errors.push(`package.json: 必須フィールド '${field}' がありません`);
        }
      }

      // プロジェクトタイプ固有の確認
      if (this.projectType === 'mcp-server') {
        if (!packageJson.scripts?.build) {
          result.errors.push('package.json: MCP Serverプロジェクトにはbuildスクリプトが必要です');
        }
        if (!packageJson.scripts?.dev) {
          result.warnings.push('package.json: devスクリプトの追加を推奨します');
        }
      }

      // スターターキット情報が残っていないかチェック
      if (packageJson.name === 'ai-driven-dev-starter-kit') {
        result.errors.push('package.json: プロジェクト名がスターターキットのままです');
      }

    } catch (error) {
      result.errors.push(`package.json: JSON形式が不正です - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async verifyCargoToml(result: VerificationResult): Promise<void> {
    const cargoTomlPath = path.join(this.targetPath, 'Cargo.toml');
    
    if (!(await fs.pathExists(cargoTomlPath))) {
      return;
    }

    try {
      const content = await fs.readFile(cargoTomlPath, 'utf-8');
      
      // 基本的な構造の確認
      if (!content.includes('[package]')) {
        result.errors.push('Cargo.toml: [package]セクションがありません');
      }
      
      if (!content.includes('name =')) {
        result.errors.push('Cargo.toml: nameフィールドがありません');
      }
      
      if (!content.includes('version =')) {
        result.errors.push('Cargo.toml: versionフィールドがありません');
      }

    } catch (error) {
      result.errors.push(`Cargo.toml: 読み込みエラー - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async verifyTsConfig(result: VerificationResult): Promise<void> {
    const tsConfigPath = path.join(this.targetPath, 'tsconfig.json');
    
    if (!(await fs.pathExists(tsConfigPath))) {
      return;
    }

    try {
      const tsConfig = await fs.readJson(tsConfigPath);
      
      if (!tsConfig.compilerOptions) {
        result.errors.push('tsconfig.json: compilerOptionsがありません');
      }

    } catch (error) {
      result.errors.push(`tsconfig.json: JSON形式が不正です - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async verifyProjectSpecific(result: VerificationResult): Promise<void> {
    switch (this.projectType) {
      case 'mcp-server':
        await this.verifyMcpServer(result);
        break;
      case 'cli-rust':
        await this.verifyCliRust(result);
        break;
      case 'web-nextjs':
        await this.verifyWebNextjs(result);
        break;
      case 'api-fastapi':
        await this.verifyApiFastapi(result);
        break;
    }
  }

  private async verifyMcpServer(result: VerificationResult): Promise<void> {
    // src/index.tsの基本構造確認
    const indexPath = path.join(this.targetPath, 'src/index.ts');
    if (await fs.pathExists(indexPath)) {
      const content = await fs.readFile(indexPath, 'utf-8');
      
      if (!content.includes('Server')) {
        result.warnings.push('src/index.ts: MCPサーバーの基本構造が見つかりません');
      }
    }

    // tools/とresources/ディレクトリの確認
    const toolsPath = path.join(this.targetPath, 'src/tools');
    const resourcesPath = path.join(this.targetPath, 'src/resources');
    
    if (!(await fs.pathExists(toolsPath))) {
      result.warnings.push('src/tools/ディレクトリが見つかりません');
    }
    
    if (!(await fs.pathExists(resourcesPath))) {
      result.warnings.push('src/resources/ディレクトリが見つかりません');
    }
  }

  private async verifyCliRust(result: VerificationResult): Promise<void> {
    // src/main.rsの確認
    const mainPath = path.join(this.targetPath, 'src/main.rs');
    if (await fs.pathExists(mainPath)) {
      const content = await fs.readFile(mainPath, 'utf-8');
      
      if (!content.includes('fn main()')) {
        result.errors.push('src/main.rs: main関数が見つかりません');
      }
    }
  }

  private async verifyWebNextjs(result: VerificationResult): Promise<void> {
    // Next.js固有のディレクトリ構造確認
    const pagesPath = path.join(this.targetPath, 'pages');
    const appPath = path.join(this.targetPath, 'app');
    
    if (!(await fs.pathExists(pagesPath)) && !(await fs.pathExists(appPath))) {
      result.warnings.push('pages/またはapp/ディレクトリが見つかりません');
    }
  }

  private async verifyApiFastapi(result: VerificationResult): Promise<void> {
    // main.pyの確認
    const mainPath = path.join(this.targetPath, 'main.py');
    if (await fs.pathExists(mainPath)) {
      const content = await fs.readFile(mainPath, 'utf-8');
      
      if (!content.includes('FastAPI')) {
        result.warnings.push('main.py: FastAPIのインポートが見つかりません');
      }
    }
  }

  private async verifyTemplateVariables(result: VerificationResult): Promise<void> {
    try {
      // 全てのテキストファイルを検索
      const files = await glob('**/*.{md,ts,tsx,js,jsx,py,rs,toml,json,yml,yaml,txt}', {
        cwd: this.targetPath,
        ignore: ['node_modules/**', 'dist/**', 'target/**', '.git/**']
      });

      for (const file of files) {
        const filePath = path.join(this.targetPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // テンプレート変数のパターンをチェック
        const patterns = [
          /\{\{[^}]+\}\}/g,  // {{VARIABLE}}形式
          /\[[A-Z_][A-Z0-9_]*\]/g  // [VARIABLE]形式
        ];

        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            const uniqueMatches = [...new Set(matches)];
            result.templateVariablesFound.push(...uniqueMatches.map(match => `${file}: ${match}`));
            
            // Layer 3のガイダンス付きプレースホルダーは警告、それ以外はエラー
            for (const match of uniqueMatches) {
              if (match.startsWith('[YOUR_') || match.includes('<!-- 例:')) {
                result.warnings.push(`テンプレート変数が残っています（ユーザー記入用）: ${file}: ${match}`);
              } else {
                result.errors.push(`未置換のテンプレート変数が見つかりました: ${file}: ${match}`);
              }
            }
          }
        }
      }

    } catch (error) {
      result.warnings.push(`テンプレート変数チェック中にエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getFileRequirements(): FileRequirement[] {
    const commonFiles: FileRequirement[] = [
      { path: 'CLAUDE.md', required: true, description: 'AI エージェント開発ガイダンス' },
      { path: 'docs/PRD.md', required: true, description: 'プロダクト要求仕様書' },
      { path: 'docs/ARCHITECTURE.md', required: true, description: 'アーキテクチャ設計書' },
      { path: 'docs/API.md', required: false, description: 'API仕様書' },
      { path: 'docs/TESTING.md', required: false, description: 'テスト仕様書' },
      { path: 'README.md', required: true, description: 'プロジェクト概要' }
    ];

    const projectSpecificFiles: Record<string, FileRequirement[]> = {
      'mcp-server': [
        { path: 'package.json', required: true, description: 'Node.js パッケージ設定' },
        { path: 'tsconfig.json', required: true, description: 'TypeScript設定' },
        { path: 'src/index.ts', required: true, description: 'MCPサーバーエントリーポイント' },
        { path: 'src/tools/example-tool.ts', required: false, description: 'ツール実装例' },
        { path: 'src/resources/example-resource.ts', required: false, description: 'リソース実装例' },
        { path: 'src/utils/logger.ts', required: false, description: 'ログユーティリティ' }
      ],
      'cli-rust': [
        { path: 'Cargo.toml', required: true, description: 'Rust プロジェクト設定' },
        { path: 'src/main.rs', required: true, description: 'Rust エントリーポイント' },
        { path: '.gitignore', required: false, description: 'Git除外設定' }
      ],
      'web-nextjs': [
        { path: 'package.json', required: true, description: 'Node.js パッケージ設定' },
        { path: 'tsconfig.json', required: true, description: 'TypeScript設定' },
        { path: 'next.config.js', required: false, description: 'Next.js設定' }
      ],
      'api-fastapi': [
        { path: 'requirements.txt', required: true, description: 'Python依存関係' },
        { path: 'main.py', required: true, description: 'FastAPI エントリーポイント' },
        { path: 'app/__init__.py', required: false, description: 'Pythonパッケージ初期化' }
      ]
    };

    return [...commonFiles, ...(projectSpecificFiles[this.projectType] || [])];
  }
}