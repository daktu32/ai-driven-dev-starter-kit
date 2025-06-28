/**
 * CLI Rust プラグイン
 * 
 * Rust を使用した CLI ツールプロジェクトのテンプレートを提供するプラグイン
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
 * CLI Rust プラグインのメタデータ
 */
const metadata: PluginMetadata = {
  id: 'cli-rust',
  name: 'Rust CLI Tool',
  version: '1.0.0',
  description: 'Rust を使用した高性能 CLI ツールプロジェクトのテンプレートを提供します',
  author: 'AI Driven Dev Starter Kit',
  license: 'MIT',
  tags: ['cli', 'rust', 'command-line', 'tool'],
  minimumKitVersion: '1.0.0'
};

/**
 * CLI Rust プラグイン実装
 */
class CliRustPlugin implements Plugin {
  readonly metadata = metadata;
  private context!: PluginContext;
  private templatePath!: string;

  async initialize(context: PluginContext): Promise<void> {
    this.context = context;
    this.templatePath = path.resolve(__dirname, 'templates');
    
    context.logger.info(`CLI Rustプラグインが初期化されました: v${this.metadata.version}`);
    
    // テンプレートディレクトリの存在確認
    if (!(await context.fileSystem.exists(this.templatePath))) {
      // 開発時は既存パスから参照
      this.templatePath = path.resolve(__dirname, '../../templates/project-structures/cli-rust');
    }
  }

  async cleanup(): Promise<void> {
    this.context.logger.info('CLI Rustプラグインのクリーンアップが完了しました');
  }

  getProjectTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'cli-rust',
        name: 'Rust CLI Tool',
        description: 'Rust を使用した高性能 CLI ツールのプロジェクトテンプレート',
        category: 'cli' as TemplateCategory,
        templatePath: this.templatePath,
        requirements: [
          {
            type: 'runtime',
            name: 'Rust',
            versionRange: '>=1.70.0',
            required: true,
            installInstructions: 'https://rustup.rs から Rust をインストールしてください'
          },
          {
            type: 'tool',
            name: 'cargo',
            versionRange: '>=1.70.0',
            required: true,
            installInstructions: 'Rust と一緒にインストールされます'
          }
        ],
        configOptions: [
          {
            name: 'cliFramework',
            type: 'select',
            description: 'CLIフレームワークの選択',
            defaultValue: 'clap',
            required: true,
            choices: [
              { value: 'clap', label: 'Clap', description: 'Rust標準のCLIパーサー' },
              { value: 'structopt', label: 'StructOpt', description: 'Clap v2ベースの構造体派生' },
              { value: 'argh', label: 'Argh', description: '軽量なCLIパーサー' }
            ]
          },
          {
            name: 'asyncRuntime',
            type: 'select',
            description: '非同期ランタイムの選択',
            defaultValue: 'none',
            required: false,
            choices: [
              { value: 'tokio', label: 'Tokio', description: '高性能非同期ランタイム' },
              { value: 'async-std', label: 'async-std', description: 'std風インターフェース' },
              { value: 'smol', label: 'Smol', description: '軽量非同期ランタイム' },
              { value: 'none', label: 'なし', description: '同期処理のみ' }
            ]
          },
          {
            name: 'errorHandling',
            type: 'select',
            description: 'エラーハンドリングライブラリの選択',
            defaultValue: 'anyhow',
            required: true,
            choices: [
              { value: 'anyhow', label: 'Anyhow', description: '簡単なエラーハンドリング' },
              { value: 'thiserror', label: 'ThisError', description: 'カスタムエラー型' },
              { value: 'eyre', label: 'Eyre', description: 'Anyhowフォーク版' },
              { value: 'none', label: 'std::error', description: '標準ライブラリのみ' }
            ]
          },
          {
            name: 'serialization',
            type: 'multiselect',
            description: 'シリアライゼーションサポート',
            defaultValue: ['json'],
            required: false,
            choices: [
              { value: 'json', label: 'JSON', description: 'JSON形式サポート' },
              { value: 'yaml', label: 'YAML', description: 'YAML形式サポート' },
              { value: 'toml', label: 'TOML', description: 'TOML形式サポート' },
              { value: 'csv', label: 'CSV', description: 'CSV形式サポート' }
            ]
          },
          {
            name: 'logging',
            type: 'boolean',
            description: 'ログ機能を含めるか',
            defaultValue: true,
            required: false
          },
          {
            name: 'configuration',
            type: 'boolean',
            description: '設定ファイル機能を含めるか',
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
            name: 'benchmarking',
            type: 'boolean',
            description: 'ベンチマーク設定を含めるか',
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
    const progress = context.userInterface.showProgress('Rust CLI ツールプロジェクトを生成中...');
    
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
      
      progress.succeed('Rust CLI ツールプロジェクトの生成が完了しました');
      
      return {
        success: true,
        generatedFiles,
        nextSteps,
        warnings
      };
      
    } catch (error) {
      progress.fail('Rust CLI ツールプロジェクトの生成に失敗しました');
      
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
    
    // Rustの命名規則に従ったパッケージ名
    const packageName = options.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/^[0-9]/, '_');
    
    const structName = options.projectName
      .replace(/-/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[0-9]/, '')
      .replace(/^./, (c) => c.toUpperCase());
    
    return {
      PROJECT_NAME: options.projectName,
      PACKAGE_NAME: packageName,
      STRUCT_NAME: structName,
      PROJECT_DESCRIPTION: `${options.projectName} - Rust CLI Tool generated by AI Driven Dev Starter Kit`,
      DATE: currentDate,
      AUTHOR: 'Your Name',
      CLI_FRAMEWORK: options.options.cliFramework || 'clap',
      ASYNC_RUNTIME: options.options.asyncRuntime || 'none',
      ERROR_HANDLING: options.options.errorHandling || 'anyhow',
      SERIALIZATION: JSON.stringify(options.options.serialization || ['json']),
      LOGGING: options.options.logging ? 'true' : 'false',
      CONFIGURATION: options.options.configuration ? 'true' : 'false',
      TESTING: options.options.testing ? 'true' : 'false',
      BENCHMARKING: options.options.benchmarking ? 'true' : 'false'
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
    // Cargo.toml の生成
    await this.generateCargoToml(options, context);
    
    // 設定ファイルの生成
    await this.generateConfigFiles(options, context, warnings);
    
    // GitHub Actions の生成
    await this.generateGithubActions(options, context);
  }

  private async generateCargoToml(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    const packageName = options.projectName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/^[0-9]/, '_');

    let cargoToml = `[package]
name = "${packageName}"
version = "0.1.0"
edition = "2021"
description = "${options.projectName} - Rust CLI Tool"
authors = ["Your Name <your.email@example.com>"]
license = "MIT"
repository = "https://github.com/yourusername/${options.projectName}"
homepage = "https://github.com/yourusername/${options.projectName}"
documentation = "https://docs.rs/${packageName}"
readme = "README.md"
keywords = ["cli", "tool"]
categories = ["command-line-utilities"]

[[bin]]
name = "${packageName}"
path = "src/main.rs"

[dependencies]
`;

    // CLIフレームワーク
    switch (options.options.cliFramework) {
      case 'clap':
        cargoToml += `clap = { version = "4.4", features = ["derive"] }\n`;
        break;
      case 'structopt':
        cargoToml += `structopt = "0.3"\n`;
        break;
      case 'argh':
        cargoToml += `argh = "0.1"\n`;
        break;
    }

    // 非同期ランタイム
    switch (options.options.asyncRuntime) {
      case 'tokio':
        cargoToml += `tokio = { version = "1.0", features = ["full"] }\n`;
        break;
      case 'async-std':
        cargoToml += `async-std = { version = "1.12", features = ["attributes"] }\n`;
        break;
      case 'smol':
        cargoToml += `smol = "2.0"\n`;
        break;
    }

    // エラーハンドリング
    switch (options.options.errorHandling) {
      case 'anyhow':
        cargoToml += `anyhow = "1.0"\n`;
        break;
      case 'thiserror':
        cargoToml += `thiserror = "1.0"\n`;
        break;
      case 'eyre':
        cargoToml += `eyre = "0.6"\n`;
        break;
    }

    // シリアライゼーション
    const serialization = options.options.serialization || [];
    if (serialization.includes('json')) {
      cargoToml += `serde = { version = "1.0", features = ["derive"] }\nserde_json = "1.0"\n`;
    }
    if (serialization.includes('yaml')) {
      cargoToml += `serde_yaml = "0.9"\n`;
    }
    if (serialization.includes('toml')) {
      cargoToml += `toml = "0.8"\n`;
    }
    if (serialization.includes('csv')) {
      cargoToml += `csv = "1.3"\n`;
    }

    // ログ機能
    if (options.options.logging) {
      cargoToml += `log = "0.4"\nenv_logger = "0.10"\n`;
    }

    // 設定ファイル機能
    if (options.options.configuration) {
      cargoToml += `config = "0.13"\n`;
      if (!serialization.includes('toml')) {
        cargoToml += `toml = "0.8"\n`;
      }
    }

    // 開発依存関係
    cargoToml += `
[dev-dependencies]
`;

    if (options.options.testing) {
      cargoToml += `assert_cmd = "2.0"\npredicates = "3.0"\ntempfile = "3.8"\n`;
    }

    if (options.options.benchmarking) {
      cargoToml += `criterion = "0.5"\n`;
    }

    // ベンチマーク設定
    if (options.options.benchmarking) {
      cargoToml += `
[[bench]]
name = "benchmarks"
harness = false
`;
    }

    // プロファイル設定
    cargoToml += `
[profile.release]
strip = true
opt-level = "z"
lto = true
codegen-units = 1
panic = "abort"

[profile.dev]
debug = true
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'Cargo.toml'),
      cargoToml
    );
  }

  private async generateConfigFiles(
    options: ScaffoldOptions,
    context: PluginContext,
    warnings: string[]
  ): Promise<void> {
    // rust-toolchain.toml
    const rustToolchain = `[toolchain]
channel = "stable"
components = ["rustfmt", "clippy"]
targets = ["x86_64-unknown-linux-gnu", "x86_64-pc-windows-gnu", "x86_64-apple-darwin"]
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'rust-toolchain.toml'),
      rustToolchain
    );

    // .cargo/config.toml
    await context.fileSystem.ensureDir(path.join(options.targetPath, '.cargo'));
    
    const cargoConfig = `[build]
target-dir = "target"

[alias]
b = "build"
c = "check"
t = "test"
r = "run"
rr = "run --release"
br = "build --release"
cr = "clippy --all-targets --all-features -- -D warnings"
fmt = "fmt -- --check"
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.cargo', 'config.toml'),
      cargoConfig
    );

    // Makefile
    const makefile = `# Rust CLI Development Commands

.PHONY: build test lint format clean install run help

# Default target
help:
\t@echo "Available commands:"
\t@echo "  build    - Build the project"
\t@echo "  test     - Run tests"
\t@echo "  lint     - Run clippy linter"
\t@echo "  format   - Format code with rustfmt"
\t@echo "  clean    - Clean build artifacts"
\t@echo "  install  - Install the binary"
\t@echo "  run      - Run the application"

build:
\tcargo build

build-release:
\tcargo build --release

test:
\tcargo test

lint:
\tcargo clippy --all-targets --all-features -- -D warnings

format:
\tcargo fmt

format-check:
\tcargo fmt -- --check

clean:
\tcargo clean

install:
\tcargo install --path .

run:
\tcargo run

run-release:
\tcargo run --release

check:
\tcargo check

doc:
\tcargo doc --open

update:
\tcargo update
`;

    let finalMakefile = makefile;
    if (options.options.benchmarking) {
      finalMakefile += `
bench:
\tcargo bench
`;
    }

    await context.fileSystem.writeFile(
      path.join(options.targetPath, 'Makefile'),
      finalMakefile
    );

    // .gitignore
    const gitignore = `/target/
Cargo.lock
*.orig
*.rej
*.bak
.DS_Store
.vscode/
.idea/
*.swp
*.swo
*~
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.gitignore'),
      gitignore
    );
  }

  private async generateGithubActions(
    options: ScaffoldOptions,
    context: PluginContext
  ): Promise<void> {
    await context.fileSystem.ensureDir(path.join(options.targetPath, '.github', 'workflows'));

    const ciWorkflow = `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  CARGO_TERM_COLOR: always

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        rust:
          - stable
          - beta
          - nightly

    steps:
    - uses: actions/checkout@v4

    - name: Install Rust
      uses: dtolnay/rust-toolchain@master
      with:
        toolchain: \${{ matrix.rust }}
        components: rustfmt, clippy

    - name: Cache cargo registry
      uses: actions/cache@v3
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          target
        key: \${{ runner.os }}-cargo-\${{ hashFiles('**/Cargo.lock') }}

    - name: Check formatting
      run: cargo fmt -- --check

    - name: Run clippy
      run: cargo clippy --all-targets --all-features -- -D warnings

    - name: Run tests
      run: cargo test --verbose

    - name: Run tests with all features
      run: cargo test --all-features --verbose

  build:
    name: Build
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
    - uses: actions/checkout@v4

    - name: Install Rust
      uses: dtolnay/rust-toolchain@stable

    - name: Cache cargo registry
      uses: actions/cache@v3
      with:
        path: |
          ~/.cargo/registry
          ~/.cargo/git
          target
        key: \${{ runner.os }}-cargo-\${{ hashFiles('**/Cargo.lock') }}

    - name: Build
      run: cargo build --release --verbose

    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: \${{ matrix.os }}-binary
        path: |
          target/release/${options.projectName}*
          !target/release/*.d
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.github', 'workflows', 'ci.yml'),
      ciWorkflow
    );

    // Release workflow
    const releaseWorkflow = `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  create-release:
    name: Create Release
    runs-on: ubuntu-latest
    outputs:
      upload_url: \${{ steps.create_release.outputs.upload_url }}
    steps:
      - uses: actions/checkout@v4
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: \${{ github.ref }}
          release_name: Release \${{ github.ref }}
          draft: false
          prerelease: false

  build-and-upload:
    name: Build and Upload
    needs: create-release
    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: ubuntu-latest
            artifact_name: ${options.projectName}
            asset_name: ${options.projectName}-linux-amd64
          - os: windows-latest
            artifact_name: ${options.projectName}.exe
            asset_name: ${options.projectName}-windows-amd64.exe
          - os: macos-latest
            artifact_name: ${options.projectName}
            asset_name: ${options.projectName}-macos-amd64

    steps:
    - uses: actions/checkout@v4

    - name: Install Rust
      uses: dtolnay/rust-toolchain@stable

    - name: Build
      run: cargo build --release

    - name: Upload Release Asset
      uses: actions/upload-release-asset@v1
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      with:
        upload_url: \${{ needs.create-release.outputs.upload_url }}
        asset_path: ./target/release/\${{ matrix.artifact_name }}
        asset_name: \${{ matrix.asset_name }}
        asset_content_type: application/octet-stream
`;

    await context.fileSystem.writeFile(
      path.join(options.targetPath, '.github', 'workflows', 'release.yml'),
      releaseWorkflow
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
        title: 'Rust ツールチェインの確認',
        description: 'Rust がインストールされていることを確認します',
        command: 'rustc --version && cargo --version',
        required: true
      },
      {
        title: 'プロジェクトのビルド',
        description: 'Rust プロジェクトをビルドします',
        command: 'cargo build',
        required: true
      },
      {
        title: 'テストの実行',
        description: 'プロジェクトのテストを実行します',
        command: 'cargo test',
        required: false
      },
      {
        title: 'アプリケーションの実行',
        description: '生成されたCLIアプリケーションを実行します',
        command: 'cargo run -- --help',
        required: false
      },
      {
        title: 'Git リポジトリの初期化',
        description: '新しい Git リポジトリとして初期化します',
        command: 'git init && git add . && git commit -m "Initial commit"',
        required: false
      }
    ];

    // ベンチマークステップの追加
    if (options.options.benchmarking) {
      steps.splice(-1, 0, {
        title: 'ベンチマークの実行',
        description: 'パフォーマンスベンチマークを実行します',
        command: 'cargo bench',
        required: false
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
        message: 'CLI Rustプラグインは正常に動作しています',
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

export default new CliRustPlugin();