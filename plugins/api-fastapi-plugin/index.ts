/**
 * API FastAPI プラグイン
 * 
 * FastAPI を使用した REST API プロジェクトのテンプレートを提供するプラグイン
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
 * API FastAPI プラグインのメタデータ
 */
const metadata: PluginMetadata = {
  id: 'api-fastapi',
  name: 'FastAPI REST API',
  version: '1.0.0',
  description: 'FastAPI を使用した REST API プロジェクトのテンプレートを提供します',
  author: 'AI Driven Dev Starter Kit',
  license: 'MIT',
  tags: ['api', 'fastapi', 'python', 'rest'],
  minimumKitVersion: '1.0.0'
};

/**
 * API FastAPI プラグイン実装
 */
class ApiFastapiPlugin implements Plugin {
  readonly metadata = metadata;
  private context!: PluginContext;
  private templatePath!: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.templatePath = path.resolve(__dirname, 'templates');
    
    context.logger.info(`API FastAPIプラグインが初期化されました: v${this.metadata.version}`);
    
    // テンプレートディレクトリの存在確認
    if (!(await context.fileSystem.exists(this.templatePath))) {
      // 開発時は既存パスから参照
      this.templatePath = path.resolve(__dirname, '../../templates/project-structures/api-fastapi');
    }
  }

  async cleanup(): Promise<void> {
    this.context.logger.info('API FastAPIプラグインのクリーンアップが完了しました');
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'api-fastapi',
        name: 'FastAPI REST API',
        description: 'FastAPI を使用したモダンな REST API プロジェクトのテンプレート',
        category: 'api' as TemplateCategory,
        templatePath: this.templatePath,
        requirements: [
          {
            type: 'runtime',
            name: 'Python',
            versionRange: '>=3.8.0',
            required: true,
            installInstructions: 'https://python.org から Python をインストールしてください'
          },
          {
            type: 'tool',
            name: 'pip',
            versionRange: '>=21.0.0',
            required: true,
            installInstructions: 'Python と一緒にインストールされます'
          }
        ],
        configOptions: [
          {
            name: 'database',
            type: 'select',
            description: 'データベースの選択',
            defaultValue: 'sqlite',
            required: true,
            choices: [
              { value: 'sqlite', label: 'SQLite', description: '軽量なファイルベースDB' },
              { value: 'postgresql', label: 'PostgreSQL', description: '本格的なリレーショナルDB' },
              { value: 'mysql', label: 'MySQL', description: '人気のリレーショナルDB' },
              { value: 'mongodb', label: 'MongoDB', description: 'NoSQLドキュメントDB' }
            ]
          },
          {
            name: 'orm',
            type: 'select',
            description: 'ORM/ODMの選択',
            defaultValue: 'sqlalchemy',
            required: true,
            choices: [
              { value: 'sqlalchemy', label: 'SQLAlchemy', description: 'Python標準ORM' },
              { value: 'tortoise', label: 'Tortoise ORM', description: 'async対応ORM' },
              { value: 'motor', label: 'Motor', description: 'MongoDB async ODM' },
              { value: 'none', label: 'なし', description: 'ORM/ODMを使用しない' }
            ]
          },
          {
            name: 'authentication',
            type: 'boolean',
            description: 'JWT認証機能を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'cors',
            type: 'boolean',
            description: 'CORS設定を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'testing',
            type: 'boolean',
            description: 'テスト設定を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'documentation',
            type: 'boolean',
            description: 'API ドキュメント設定を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'containerization',
            type: 'boolean',
            description: 'Docker設定を含めるか',
            defaultValue: false,
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
    const progress = context.userInterface.showProgress('FastAPI REST APIプロジェクトを生成中...');
    
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
      
      progress.succeed('FastAPI REST APIプロジェクトの生成が完了しました');
      
      return {
        success: true,
        generatedFiles,
        nextSteps,
        warnings
      };
      
    } catch (error) {
      progress.fail('FastAPI REST APIプロジェクトの生成に失敗しました');
      
      return {
        success: false,
        generatedFiles: [],
        error: error instanceof Error ? error.message : String(error),
        warnings: []
      };
    }
  }

  private prepareTemplateVariables(options: ScaffoldOptions): Record<string, string> {
    const currentDate: string = new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10);
    
    const className = options.projectName
      .replace(/-/g, '_')
      .replace(/[^a-zA-Z0-9_]/g, '')
      .replace(/^[0-9]/, '')
      .toLowerCase();
    
    const moduleClass = options.projectName
      .replace(/-/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (c) => c.toUpperCase());
    
    return {
      PROJECT_NAME: options.projectName,
      PROJECT_MODULE: className,
      PROJECT_CLASS_NAME: moduleClass,
      PROJECT_DESCRIPTION: `${options.projectName} - FastAPI REST API generated by AI Driven Dev Starter Kit`,
      DATE: currentDate,
      AUTHOR: 'Your Name',
      DATABASE: options.options.database || 'sqlite',
      ORM: options.options.orm || 'sqlalchemy',
      AUTHENTICATION: options.options.authentication ? 'true' : 'false',
      CORS: options.options.cors ? 'true' : 'false',
      TESTING: options.options.testing ? 'true' : 'false',
      DOCUMENTATION: options.options.documentation ? 'true' : 'false',
      CONTAINERIZATION: options.options.containerization ? 'true' : 'false'
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
    // requirements.txt の生成
    await this.generateRequirementsTxt(options, context);
    
    // pyproject.toml の生成
    await this.generatePyprojectToml(options, context);
    
    // 設定ファイルの生成
    await this.generateConfigFiles(options, context, warnings);
    
    // Dockerファイルの生成
    if (options.options.containerization) {
      await this.generateDockerFiles(options, context);
    }
  }

  private async generateRequirementsTxt(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    let requirements = `# FastAPI core
fastapi>=0.104.0
uvicorn[standard]>=0.24.0
pydantic>=2.5.0
pydantic-settings>=2.1.0
`;

    // データベース依存関係
    switch (options.options.database) {
      case 'postgresql':
        requirements += `
# PostgreSQL
psycopg2-binary>=2.9.0
`;
        break;
      case 'mysql':
        requirements += `
# MySQL
pymysql>=1.1.0
`;
        break;
      case 'mongodb':
        requirements += `
# MongoDB
motor>=3.3.0
beanie>=1.23.0
`;
        break;
    }

    // ORM依存関係
    switch (options.options.orm) {
      case 'sqlalchemy':
        requirements += `
# SQLAlchemy
sqlalchemy>=2.0.0
alembic>=1.13.0
`;
        break;
      case 'tortoise':
        requirements += `
# Tortoise ORM
tortoise-orm[asyncpg]>=0.20.0
`;
        break;
    }

    // 認証依存関係
    if (options.options.authentication) {
      requirements += `
# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.0
python-multipart>=0.0.6
`;
    }

    // CORS依存関係
    if (options.options.cors) {
      requirements += `
# CORS
python-cors>=1.0.0
`;
    }

    // テスト依存関係
    if (options.options.testing) {
      requirements += `
# Testing
pytest>=7.4.0
pytest-asyncio>=0.21.0
httpx>=0.25.0
`;
    }

    requirements += `
# Development
python-dotenv>=1.0.0
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'requirements.txt'),
      requirements
    );
  }

  private async generatePyprojectToml(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    const pyproject = `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "${options.projectName}"
dynamic = ["version"]
description = "${options.projectName} - FastAPI REST API"
authors = [
    {name = "Your Name", email = "your.email@example.com"},
]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "python-dotenv>=1.0.0",
]
requires-python = ">=3.8"
readme = "README.md"
license = {text = "MIT"}
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.urls]
Homepage = "https://github.com/yourusername/${options.projectName}"
Repository = "https://github.com/yourusername/${options.projectName}.git"
Issues = "https://github.com/yourusername/${options.projectName}/issues"

[tool.hatch.version]
path = "src/${options.options.PROJECT_MODULE}/__init__.py"

[tool.hatch.build.targets.wheel]
packages = ["src/${options.options.PROJECT_MODULE}"]

[tool.black]
line-length = 88
target-version = ['py38']
include = '\\.pyi?$'
extend-exclude = '''
/(
  # directories
  \\.eggs
  | \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'pyproject.toml'),
      pyproject
    );
  }

  private async generateConfigFiles(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // .env.example
    let envContent = `# Application settings
APP_NAME=${options.projectName}
APP_VERSION=1.0.0
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Security
SECRET_KEY=your-secret-key-here-change-in-production
`;

    // データベース設定
    switch (options.options.database) {
      case 'sqlite':
        envContent += `
# Database (SQLite)
DATABASE_URL=sqlite:///./app.db
`;
        break;
      case 'postgresql':
        envContent += `
# Database (PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
`;
        break;
      case 'mysql':
        envContent += `
# Database (MySQL)
DATABASE_URL=mysql://username:password@localhost:3306/dbname
`;
        break;
      case 'mongodb':
        envContent += `
# Database (MongoDB)
MONGODB_URL=mongodb://localhost:27017/dbname
`;
        break;
    }

    // 認証設定
    if (options.options.authentication) {
      envContent += `
# JWT Authentication
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
`;
    }

    // CORS設定
    if (options.options.cors) {
      envContent += `
# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
`;
    }

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.env.example'),
      envContent
    );

    // Makefile
    const makefile = `# FastAPI Development Commands

.PHONY: install dev test lint format clean

install:
\tpip install -r requirements.txt

dev:
\tuvicorn src.${options.options.PROJECT_MODULE}.main:app --reload --host 0.0.0.0 --port 8000

test:
\tpytest

lint:
\tflake8 src/
\tmypy src/

format:
\tblack src/
\tisort src/

clean:
\tfind . -type f -name "*.pyc" -delete
\tfind . -type d -name "__pycache__" -delete
\tfind . -type d -name "*.egg-info" -exec rm -rf {} +

docker-build:
\tdocker build -t ${options.projectName} .

docker-run:
\tdocker run -p 8000:8000 ${options.projectName}
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'Makefile'),
      makefile
    );
  }

  private async generateDockerFiles(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    // Dockerfile
    const dockerfile = `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "src.${options.options.PROJECT_MODULE}.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'Dockerfile'),
      dockerfile
    );

    // docker-compose.yml
    let dockerCompose = `version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
    volumes:
      - .:/app
    depends_on:
`;

    if (options.options.database === 'postgresql') {
      dockerCompose += `      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ${options.projectName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;
    } else if (options.options.database === 'mysql') {
      dockerCompose += `      - mysql

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ${options.projectName}
      MYSQL_ROOT_PASSWORD: mysql
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
`;
    } else if (options.options.database === 'mongodb') {
      dockerCompose += `      - mongodb

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
`;
    } else {
      dockerCompose += `      []
`;
    }

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'docker-compose.yml'),
      dockerCompose
    );

    // .dockerignore
    const dockerignore = `__pycache__
*.pyc
*.pyo
*.pyd
.Python
env
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
.DS_Store
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.dockerignore'),
      dockerignore
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
        title: 'Python仮想環境の作成',
        description: 'Python仮想環境を作成・アクティベートします',
        command: 'python -m venv venv && source venv/bin/activate  # Linux/Mac\n# または\n# .\\venv\\Scripts\\activate  # Windows',
        required: true
      },
      {
        title: '依存関係のインストール',
        description: 'Python の依存関係をインストールします',
        command: 'pip install -r requirements.txt',
        required: true
      },
      {
        title: '環境設定',
        description: '環境変数ファイルを設定します',
        command: 'cp .env.example .env',
        required: true
      }
    ];

    // データベース設定の追加
    if (options.options.database !== 'sqlite') {
      steps.push({
        title: 'データベースの設定',
        description: '.env ファイルでデータベース接続情報を設定してください',
        required: true
      });
    }

    // 開発サーバー起動
    steps.push({
      title: '開発サーバーの起動',
      description: 'FastAPI 開発サーバーを起動します',
      command: 'uvicorn src.main:app --reload',
      required: false
    });

    // Docker設定の追加
    if (options.options.containerization) {
      steps.push({
        title: 'Docker での起動',
        description: 'Docker Compose でアプリケーションを起動します',
        command: 'docker-compose up --build',
        required: false
      });
    }

    steps.push({
      title: 'Git リポジトリの初期化',
      description: '新しい Git リポジトリとして初期化します',
      command: 'git init && git add . && git commit -m "Initial commit"',
      required: false
    });

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
        message: 'API FastAPIプラグインは正常に動作しています',
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

export default new ApiFastapiPlugin();