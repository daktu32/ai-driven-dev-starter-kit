/**
 * Web Next.js プラグイン
 * 
 * Next.js Webアプリケーションプロジェクトのテンプレートを提供するプラグイン
 */

import * as path from 'path';
import {
  Plugin,
  PluginMetadata,
  ProjectTemplate,
  ScaffoldOptions,
  ScaffoldResult,
  PluginContext,
  TemplateCategory,
  NextStep,
  ConfigOption
} from '../../src/plugin/types.js';

/**
 * Web Next.js プラグインのメタデータ
 */
const metadata: PluginMetadata = {
  id: 'web-nextjs',
  name: 'Next.js Web Application',
  version: '1.0.0',
  description: 'Next.js を使用したWebアプリケーションプロジェクトのテンプレートを提供します',
  author: 'AI Driven Dev Starter Kit',
  license: 'MIT',
  tags: ['web', 'nextjs', 'react', 'typescript'],
  minimumKitVersion: '1.0.0'
};

/**
 * Web Next.js プラグイン実装
 */
class WebNextjsPlugin implements Plugin {
  readonly metadata = metadata;
  private context!: PluginContext;
  private templatePath!: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.templatePath = path.resolve(__dirname, 'templates');
    
    context.logger.info(`Web Next.jsプラグインが初期化されました: v${this.metadata.version}`);
    
    // テンプレートディレクトリの存在確認
    if (!(await context.fileSystem.exists(this.templatePath))) {
      // 開発時は既存パスから参照
      this.templatePath = path.resolve(__dirname, '../../templates/project-structures/web-nextjs');
    }
  }

  async cleanup(): Promise<void> {
    this.context.logger.info('Web Next.jsプラグインのクリーンアップが完了しました');
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'web-nextjs',
        name: 'Next.js Web Application',
        description: 'Next.js を使用したモダンWebアプリケーションのプロジェクトテンプレート',
        category: 'web' as TemplateCategory,
        templatePath: this.templatePath,
        requirements: [
          {
            type: 'runtime',
            name: 'Node.js',
            versionRange: '>=18.0.0',
            required: true,
            installInstructions: 'https://nodejs.org から Node.js をインストールしてください'
          },
          {
            type: 'tool',
            name: 'npm',
            versionRange: '>=8.0.0',
            required: true,
            installInstructions: 'Node.js と一緒にインストールされます'
          }
        ],
        configOptions: [
          {
            name: 'uiFramework',
            type: 'select',
            description: 'UIフレームワークの選択',
            defaultValue: 'tailwindcss',
            required: true,
            choices: [
              { value: 'tailwindcss', label: 'Tailwind CSS', description: 'ユーティリティファーストCSS' },
              { value: 'mui', label: 'Material-UI', description: 'Googleのマテリアルデザイン' },
              { value: 'chakra', label: 'Chakra UI', description: 'シンプルで使いやすいUI' },
              { value: 'none', label: 'なし', description: 'CSSフレームワークを使用しない' }
            ]
          },
          {
            name: 'stateManagement',
            type: 'select',
            description: '状態管理ライブラリの選択',
            defaultValue: 'zustand',
            required: false,
            choices: [
              { value: 'zustand', label: 'Zustand', description: '軽量な状態管理' },
              { value: 'redux', label: 'Redux Toolkit', description: '大規模アプリ向け' },
              { value: 'context', label: 'React Context', description: 'React標準' },
              { value: 'none', label: 'なし', description: '状態管理ライブラリを使用しない' }
            ]
          },
          {
            name: 'authentication',
            type: 'boolean',
            description: '認証機能を含めるか',
            defaultValue: false,
            required: false
          },
          {
            name: 'database',
            type: 'select',
            description: 'データベース連携の選択',
            defaultValue: 'none',
            required: false,
            choices: [
              { value: 'prisma', label: 'Prisma + PostgreSQL', description: 'TypeScript ORM' },
              { value: 'supabase', label: 'Supabase', description: 'Firebase代替' },
              { value: 'firebase', label: 'Firebase', description: 'Googleのバックエンドサービス' },
              { value: 'none', label: 'なし', description: 'データベースを使用しない' }
            ]
          },
          {
            name: 'testing',
            type: 'boolean',
            description: 'テスト設定を含めるか',
            defaultValue: true,
            required: false
          }
        ]
      }
    ];
  }

  async generateScaffold(
    template: ProjectTemplate,
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<ScaffoldResult> {
    const progress = context.userInterface.showProgress('Next.js Webアプリケーションを生成中...');
    
    try {
      const generatedFiles: string[] = [];
      const warnings: string[] = [];
      
      // プレースホルダー変数の準備
      const variables = this.prepareTemplateVariables(options);
      
      // テンプレートディレクトリの処理
      progress.update('テンプレートファイルをコピー中...');
      await context.templateProcessor.processTemplateDirectory(
        template.templatePath,
        options.targetPath,
        variables
      );
      
      // 生成されたファイルリストを収集
      await this.collectGeneratedFiles(options.targetPath, generatedFiles, context);
      
      // プロジェクト固有の設定適用
      progress.update('プロジェクト固有の設定を適用中...');
      await this.applyProjectSpecificConfig(options, context, warnings);
      
      // 次のステップ情報を準備
      const nextSteps = this.prepareNextSteps(options);
      
      progress.succeed('Next.js Webアプリケーションの生成が完了しました');
      
      return {
        success: true,
        generatedFiles,
        nextSteps,
        warnings
      };
      
    } catch (error) {
      progress.fail('Next.js Webアプリケーションの生成に失敗しました');
      
      return {
        success: false,
        generatedFiles: [],
        error: error instanceof Error ? error.message : String(error),
        warnings: []
      };
    }
  }

  private prepareTemplateVariables(options: ScaffoldOptions): Record<string, string> {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const className = options.projectName
      .replace(/-/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (c) => c.toUpperCase());
    
    return {
      PROJECT_NAME: options.projectName,
      PROJECT_CLASS_NAME: className,
      PROJECT_DESCRIPTION: `${options.projectName} - Next.js Web Application generated by AI Driven Dev Starter Kit`,
      DATE: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
      AUTHOR: 'Your Name',
      UI_FRAMEWORK: options.options.uiFramework || 'tailwindcss',
      STATE_MANAGEMENT: options.options.stateManagement || 'zustand',
      DATABASE: options.options.database || 'none',
      AUTHENTICATION: options.options.authentication ? 'true' : 'false',
      TESTING: options.options.testing ? 'true' : 'false'
    };
  }

  private async collectGeneratedFiles(
    targetPath: string, 
    fileList: string[], 
    context: PluginContext
  ): Promise<void> {
    const collectFilesRecursively = async (dirPath: string) => {
      const entries = await context.fileSystem.readDir(dirPath);
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        if (await context.fileSystem.exists(fullPath)) {
          const relativePath = path.relative(targetPath, fullPath);
          fileList.push(relativePath);
          
          try {
            await collectFilesRecursively(fullPath);
          } catch (error) {
            // ファイルの場合はスキップ
          }
        }
      }
    };
    
    await collectFilesRecursively(targetPath);
  }

  private async applyProjectSpecificConfig(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // package.json の更新
    const packageJsonPath = path.join(options.targetPath, 'package.json');
    
    if (await context.fileSystem.exists(packageJsonPath)) {
      const packageJsonContent = await context.fileSystem.readFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonContent);
      
      packageJson.name = options.projectName.toLowerCase().replace(/\s+/g, '-');
      packageJson.description = `${options.projectName} - Next.js Web Application`;
      
      // UIフレームワークに応じた依存関係の追加
      packageJson.dependencies = packageJson.dependencies || {};
      packageJson.devDependencies = packageJson.devDependencies || {};
      
      switch (options.options.uiFramework) {
        case 'tailwindcss':
          packageJson.devDependencies['tailwindcss'] = '^3.4.0';
          packageJson.devDependencies['postcss'] = '^8.4.0';
          packageJson.devDependencies['autoprefixer'] = '^10.4.0';
          break;
        case 'mui':
          packageJson.dependencies['@mui/material'] = '^5.15.0';
          packageJson.dependencies['@emotion/react'] = '^11.11.0';
          packageJson.dependencies['@emotion/styled'] = '^11.11.0';
          break;
        case 'chakra':
          packageJson.dependencies['@chakra-ui/react'] = '^2.8.0';
          packageJson.dependencies['@emotion/react'] = '^11.11.0';
          packageJson.dependencies['@emotion/styled'] = '^11.11.0';
          break;
      }
      
      // 状態管理ライブラリの追加
      switch (options.options.stateManagement) {
        case 'zustand':
          packageJson.dependencies['zustand'] = '^4.5.0';
          break;
        case 'redux':
          packageJson.dependencies['@reduxjs/toolkit'] = '^2.0.0';
          packageJson.dependencies['react-redux'] = '^9.0.0';
          break;
      }
      
      // データベース連携の追加
      switch (options.options.database) {
        case 'prisma':
          packageJson.dependencies['prisma'] = '^5.7.0';
          packageJson.dependencies['@prisma/client'] = '^5.7.0';
          break;
        case 'supabase':
          packageJson.dependencies['@supabase/supabase-js'] = '^2.38.0';
          break;
        case 'firebase':
          packageJson.dependencies['firebase'] = '^10.7.0';
          break;
      }
      
      // 認証機能の追加
      if (options.options.authentication) {
        packageJson.dependencies['next-auth'] = '^4.24.0';
      }
      
      // テスト設定の追加
      if (options.options.testing) {
        packageJson.devDependencies['@testing-library/react'] = '^14.1.0';
        packageJson.devDependencies['@testing-library/jest-dom'] = '^6.1.0';
        packageJson.devDependencies['jest'] = '^29.7.0';
        packageJson.devDependencies['jest-environment-jsdom'] = '^29.7.0';
      }
      
      // リポジトリ情報をクリア
      delete packageJson.repository;
      delete packageJson.bugs;
      delete packageJson.homepage;
      
      await context.fileSystem.writeFile(
        packageJsonPath, 
        JSON.stringify(packageJson, null, 2)
      );
    }

    // 設定ファイルの生成
    await this.generateConfigFiles(options, context, warnings);
  }

  private async generateConfigFiles(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // Tailwind CSS設定
    if (options.options.uiFramework === 'tailwindcss') {
      const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
      
      await context.fileSystem.writeFile(
        path.join(options.targetPath, 'tailwind.config.js'),
        tailwindConfig
      );

      const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
      
      await context.fileSystem.writeFile(
        path.join(options.targetPath, 'postcss.config.js'),
        postcssConfig
      );
    }

    // Jest設定
    if (options.options.testing) {
      const jestConfig = `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)`;
      
      await context.fileSystem.writeFile(
        path.join(options.targetPath, 'jest.config.js'),
        jestConfig
      );

      const jestSetup = `import '@testing-library/jest-dom'`;
      
      await context.fileSystem.writeFile(
        path.join(options.targetPath, 'jest.setup.js'),
        jestSetup
      );
    }

    // .env.local.example
    let envContent = `# Next.js Environment Variables
NEXT_PUBLIC_APP_NAME=${options.projectName}
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;

    if (options.options.authentication) {
      envContent += `
# NextAuth.js
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
`;
    }

    if (options.options.database === 'prisma') {
      envContent += `
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
`;
    } else if (options.options.database === 'supabase') {
      envContent += `
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
`;
    } else if (options.options.database === 'firebase') {
      envContent += `
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
`;
    }

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.env.local.example'),
      envContent
    );
  }

  private prepareNextSteps(options: ScaffoldOptions): NextStep[] {
    const steps: NextStep[] = [
      {
        title: 'プロジェクトディレクトリに移動',
        description: `生成されたプロジェクトディレクトリに移動してください`,
        command: `cd ${options.targetPath}`,
        required: true
      },
      {
        title: 'PRD.mdの完成',
        description: 'プロダクト要件定義を詳細に記述してください',
        required: true
      },
      {
        title: '依存関係のインストール',
        description: 'Node.js の依存関係をインストールします',
        command: 'npm install',
        required: true
      },
      {
        title: '環境設定',
        description: '環境変数ファイルを設定します',
        command: 'cp .env.local.example .env.local',
        required: true
      },
      {
        title: '開発サーバーの起動',
        description: 'Next.js 開発サーバーを起動します',
        command: 'npm run dev',
        required: false
      },
      {
        title: 'Git リポジトリの初期化',
        description: '新しい Git リポジトリとして初期化します',
        command: 'git init && git add . && git commit -m "Initial commit"',
        required: false
      }
    ];

    // データベース設定の追加
    if (options.options.database === 'prisma') {
      steps.splice(4, 0, {
        title: 'Prisma データベース設定',
        description: '.env.local でデータベースURLを設定し、Prismaを初期化してください',
        command: 'npx prisma generate && npx prisma db push',
        required: true
      });
    }

    return steps;
  }

  async healthCheck(context: PluginContext): Promise<{ healthy: boolean; message?: string; details?: Record<string, any> }> {
    const details: Record<string, any> = {};
    
    try {
      const templateExists = await context.fileSystem.exists(this.templatePath);
      details.templatePath = this.templatePath;
      details.templateExists = templateExists;
      
      if (!templateExists) {
        return {
          healthy: false,
          message: 'テンプレートディレクトリが見つかりません',
          details
        };
      }
      
      return {
        healthy: true,
        message: 'Web Next.jsプラグインは正常に動作しています',
        details
      };
      
    } catch (error) {
      return {
        healthy: false,
        message: `ヘルスチェック中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
        details
      };
    }
  }
}

export default new WebNextjsPlugin();