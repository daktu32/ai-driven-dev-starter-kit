# アーキテクチャ仕様書 - test-cli-rust

プロジェクトタイプ: cli-rust

## 📋 技術スタック

### 言語・ランタイム
- **言語**: Rust 2021 Edition
- **最小サポートバージョン**: 1.70+
- **パッケージマネージャー**: Cargo
- **ターゲット**: Cross-platform (Windows, macOS, Linux)

### 主要クレート
- **CLI解析**: clap v4 (Command Line Argument Parser)
- **エラーハンドリング**: anyhow / thiserror
- **非同期ランタイム**: tokio (必要に応じて)
- **シリアライゼーション**: serde + serde_json / serde_yaml
- **HTTP クライアント**: reqwest (API連携時)
- **ファイル I/O**: std::fs + walkdir

### 開発ツール
- **フォーマッター**: rustfmt
- **リンター**: clippy
- **テスト**: cargo test + criterion (ベンチマーク)
- **ドキュメント**: cargo doc
- **リリース**: cargo-release

## 1. システム全体アーキテクチャ

### 1.1 アーキテクチャ概要

```
[アーキテクチャ図をここに挿入]
```

### 1.2 レイヤー構成

#### プレゼンテーション層
- **[COMPONENT_1_1]**: [COMPONENT_1_1_DESC]
- **[COMPONENT_1_2]**: [COMPONENT_1_2_DESC]
- **[COMPONENT_1_3]**: [COMPONENT_1_3_DESC]

#### ビジネスロジック層
- **[COMPONENT_2_1]**: [COMPONENT_2_1_DESC]
- **[COMPONENT_2_2]**: [COMPONENT_2_2_DESC]
- **[COMPONENT_2_3]**: [COMPONENT_2_3_DESC]

#### データアクセス層
- **[COMPONENT_3_1]**: [COMPONENT_3_1_DESC]
- **[COMPONENT_3_2]**: [COMPONENT_3_2_DESC]
- **[COMPONENT_3_3]**: [COMPONENT_3_3_DESC]

## 📁 ディレクトリ構造

```
test-cli-rust/
├── src/
│   ├── main.rs               # エントリーポイント
│   ├── lib.rs                # ライブラリルート（必要に応じて）
│   ├── cli/                  # CLI関連
│   │   ├── mod.rs           # CLIモジュール定義
│   │   ├── args.rs          # 引数定義
│   │   ├── commands/        # サブコマンド実装
│   │   │   ├── mod.rs
│   │   │   ├── init.rs      # init サブコマンド
│   │   │   ├── run.rs       # run サブコマンド
│   │   │   └── [command].rs # PRD要件に応じたコマンド
│   │   └── output.rs        # 出力フォーマット
│   ├── core/                # コアビジネスロジック
│   │   ├── mod.rs
│   │   ├── config.rs        # 設定管理
│   │   ├── [domain].rs      # ドメインロジック
│   │   └── processor.rs     # 主要処理ロジック
│   ├── services/            # 外部サービス連携
│   │   ├── mod.rs
│   │   ├── api_client.rs    # API クライアント
│   │   ├── file_service.rs  # ファイル操作
│   │   └── [service].rs     # PRD要件に応じたサービス
│   ├── utils/               # ユーティリティ
│   │   ├── mod.rs
│   │   ├── error.rs         # エラー定義
│   │   ├── logger.rs        # ログ管理
│   │   ├── validation.rs    # 入力検証
│   │   └── helpers.rs       # ヘルパー関数
│   └── types/               # 型定義
│       ├── mod.rs
│       ├── config.rs        # 設定型
│       ├── result.rs        # 結果型
│       └── [domain].rs      # ドメイン型
├── tests/                   # 統合テスト
│   ├── integration_test.rs
│   ├── cli_test.rs
│   └── fixtures/           # テストデータ
├── benches/                # ベンチマーク
│   └── benchmark.rs
├── docs/                   # ドキュメント
├── examples/               # 使用例
│   └── basic_usage.rs
├── Cargo.toml              # プロジェクト設定
├── Cargo.lock              # 依存関係ロック
├── README.md               # プロジェクト説明
└── .gitignore              # Git除外設定
```

## 2. コンポーネント詳細設計

### 2.1 [COMPONENT_A_NAME]

```[CODE_LANGUAGE_1]
[COMPONENT_A_STRUCTURE]
```

**責務**: ([IMPLEMENTATION_STATUS_A])
- [RESPONSIBILITY_A_1]
- [RESPONSIBILITY_A_2]
- [RESPONSIBILITY_A_3]

**インターフェース**:
- `[METHOD_A_1]`: [METHOD_A_1_DESC]
- `[METHOD_A_2]`: [METHOD_A_2_DESC]
- `[METHOD_A_3]`: [METHOD_A_3_DESC]

### 2.2 [COMPONENT_B_NAME]

```[CODE_LANGUAGE_2]
[COMPONENT_B_STRUCTURE]
```

**責務**: ([IMPLEMENTATION_STATUS_B])
- [RESPONSIBILITY_B_1]
- [RESPONSIBILITY_B_2]
- [RESPONSIBILITY_B_3]

**インターフェース**:
- `[METHOD_B_1]`: [METHOD_B_1_DESC]
- `[METHOD_B_2]`: [METHOD_B_2_DESC]
- `[METHOD_B_3]`: [METHOD_B_3_DESC]

### 2.3 [COMPONENT_C_NAME]

```[CODE_LANGUAGE_3]
[COMPONENT_C_STRUCTURE]
```

**責務**: ([IMPLEMENTATION_STATUS_C])
- [RESPONSIBILITY_C_1]
- [RESPONSIBILITY_C_2]
- [RESPONSIBILITY_C_3]

**通信プロトコル**:
- **[PROTOCOL_1]**: [PROTOCOL_1_DESC]
- **[PROTOCOL_2]**: [PROTOCOL_2_DESC]
- **[PROTOCOL_3]**: [PROTOCOL_3_DESC]

### 2.4 [COMPONENT_D_NAME]

```[CODE_LANGUAGE_4]
[COMPONENT_D_STRUCTURE]
```

**責務**: ([IMPLEMENTATION_STATUS_D])
- [RESPONSIBILITY_D_1]
- [RESPONSIBILITY_D_2]
- [RESPONSIBILITY_D_3]

**ストレージ**:
- **Primary**: [STORAGE_PRIMARY]
- **Backup**: [STORAGE_BACKUP]
- **Location**: [STORAGE_LOCATION]

## 🔧 コンポーネント設計

### Main Entry Point (main.rs)
**責務**: CLI引数解析、ルーティング、エラーハンドリング
```rust
// src/main.rs
use anyhow::Result;
use clap::Parser;

mod cli;
mod core;
mod services;
mod utils;
mod types;

use cli::args::Args;
use cli::commands;

#[tokio::main] // 非同期処理が必要な場合
async fn main() -> Result<()> {
    // ログ初期化
    utils::logger::init();
    
    // CLI引数解析
    let args = Args::parse();
    
    // コマンド実行
    match commands::execute(args).await {
        Ok(_) => Ok(()),
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}
```

### CLI Arguments (cli/args.rs)
**責務**: コマンドライン引数・オプション定義
```rust
// src/cli/args.rs
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "test-cli-rust")]
#[command(version, about, long_about = None)]
pub struct Args {
    /// Verbose output
    #[arg(short, long)]
    pub verbose: bool,
    
    /// Configuration file path
    #[arg(short, long)]
    pub config: Option<String>,
    
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Initialize new project
    Init {
        /// Project name
        name: String,
        /// Template type
        #[arg(short, long)]
        template: Option<String>,
    },
    /// Run the main process
    Run {
        /// Input file path
        #[arg(short, long)]
        input: String,
        /// Output file path
        #[arg(short, long)]
        output: Option<String>,
    },
    // PRD要件に応じた追加コマンド
}
```

### Command Implementation (cli/commands/)
**責務**: サブコマンドの具体的実装
```rust
// src/cli/commands/run.rs
use anyhow::{Context, Result};
use crate::core::processor::Processor;
use crate::types::config::Config;

pub async fn run_command(
    input: &str,
    output: Option<&str>,
    config: &Config
) -> Result<()> {
    // 入力検証
    crate::utils::validation::validate_input_file(input)
        .context("Invalid input file")?;
    
    // プロセッサ初期化
    let processor = Processor::new(config);
    
    // 処理実行
    let result = processor.process_file(input).await
        .context("Failed to process file")?;
    
    // 結果出力
    match output {
        Some(path) => {
            crate::services::file_service::write_result(path, &result)
                .context("Failed to write output")?;
        }
        None => {
            println!("{}", result);
        }
    }
    
    Ok(())
}
```

### Core Business Logic (core/)
**責務**: ドメインロジック、主要な処理フロー
```rust
// src/core/processor.rs
use anyhow::Result;
use serde::{Deserialize, Serialize};
use crate::types::config::Config;

pub struct Processor {
    config: Config,
}

impl Processor {
    pub fn new(config: &Config) -> Self {
        Self {
            config: config.clone(),
        }
    }
    
    pub async fn process_file(&self, input_path: &str) -> Result<ProcessResult> {
        // ファイル読み込み
        let content = tokio::fs::read_to_string(input_path).await?;
        
        // データ解析
        let data = self.parse_input(&content)?;
        
        // ビジネスロジック実行
        let processed = self.apply_business_logic(data)?;
        
        // 結果フォーマット
        Ok(ProcessResult {
            data: processed,
            metadata: self.generate_metadata(),
        })
    }
    
    fn parse_input(&self, content: &str) -> Result<InputData> {
        // 入力データ解析ロジック
        todo!("Implement based on PRD requirements")
    }
    
    fn apply_business_logic(&self, data: InputData) -> Result<OutputData> {
        // ビジネスロジック実装
        todo!("Implement based on PRD requirements")
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessResult {
    pub data: OutputData,
    pub metadata: Metadata,
}
```

### Error Handling (utils/error.rs)
**責務**: アプリケーション固有エラー定義
```rust
// src/utils/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CliError {
    #[error("Configuration error: {0}")]
    Config(String),
    
    #[error("Input validation failed: {0}")]
    Validation(String),
    
    #[error("Processing error: {0}")]
    Processing(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

pub type CliResult<T> = Result<T, CliError>;
```

## 3. データフロー設計

### 3.1 [FLOW_1_NAME]

```
[FLOW_1_DIAGRAM]
```

### 3.2 [FLOW_2_NAME]

```
[FLOW_2_DIAGRAM]
```

### 3.3 [FLOW_3_NAME]

```
[FLOW_3_DIAGRAM]
```

## 4. 設定管理設計

### 4.1 設定ファイル構造

```yaml
# [CONFIG_FILE_PATH]
[CONFIG_STRUCTURE]
```

### 4.2 [FRAMEWORK_NAME]設定統合

```[CONFIG_LANGUAGE]
[FRAMEWORK_INTEGRATION_CODE]
```

## 5. セキュリティ設計

### 5.1 [SECURITY_ASPECT_1]

```[CODE_LANGUAGE_SECURITY_1]
[SECURITY_IMPLEMENTATION_1]
```

### 5.2 [SECURITY_ASPECT_2]

```[CODE_LANGUAGE_SECURITY_2]
[SECURITY_IMPLEMENTATION_2]
```

## 6. パフォーマンス最適化

### 6.1 [PERFORMANCE_ASPECT_1]

```[CODE_LANGUAGE_PERF_1]
[PERFORMANCE_IMPLEMENTATION_1]
```

### 6.2 [PERFORMANCE_ASPECT_2]

```[CODE_LANGUAGE_PERF_2]
[PERFORMANCE_IMPLEMENTATION_2]
```

## 7. モニタリング・ログ設計

### 7.1 [MONITORING_ASPECT_1]

```[CODE_LANGUAGE_MONITOR_1]
[MONITORING_IMPLEMENTATION_1]
```

### 7.2 [MONITORING_ASPECT_2]

```[CODE_LANGUAGE_MONITOR_2]
[MONITORING_IMPLEMENTATION_2]
```

## 8. 拡張性・保守性

### 8.1 [EXTENSIBILITY_ASPECT_1]

```[CODE_LANGUAGE_EXT_1]
[EXTENSIBILITY_IMPLEMENTATION_1]
```

### 8.2 [EXTENSIBILITY_ASPECT_2]

```[CODE_LANGUAGE_EXT_2]
[EXTENSIBILITY_IMPLEMENTATION_2]
```

## 9. 技術的決定事項

### 9.1 アーキテクチャ原則
- **[PRINCIPLE_1]**: [PRINCIPLE_1_DESC]
- **[PRINCIPLE_2]**: [PRINCIPLE_2_DESC]
- **[PRINCIPLE_3]**: [PRINCIPLE_3_DESC]

### 9.2 技術選定理由
- **[TECH_CHOICE_1]**: [TECH_REASON_1]
- **[TECH_CHOICE_2]**: [TECH_REASON_2]
- **[TECH_CHOICE_3]**: [TECH_REASON_3]

### 9.3 設計トレードオフ
| 選択肢A | 選択肢B | 決定 | 理由 |
|---------|---------|------|------|
| [OPTION_A_1] | [OPTION_B_1] | [DECISION_1] | ユーザビリティと開発効率を重視 |
| [OPTION_A_2] | [OPTION_B_2] | [DECISION_2] | スケーラビリティと保守性を重視 |
| [OPTION_A_3] | [OPTION_B_3] | [DECISION_3] | データ整合性と性能を重視 |

## 10. 非機能要求への対応

### 10.1 性能要求
- **[PERF_REQ_1]**: [PERF_SOLUTION_1]
- **[PERF_REQ_2]**: [PERF_SOLUTION_2]
- **[PERF_REQ_3]**: [PERF_SOLUTION_3]

### 10.2 可用性要求
- **稼働率99.9%以上を目標とする**: [AVAILABILITY_SOLUTION_1]
- **メンテナンス時間は月1回、最大2時間以内**: [AVAILABILITY_SOLUTION_2]
- **障害発生時の復旧時間は30分以内**: [AVAILABILITY_SOLUTION_3]

### 10.3 保守性要求
- **自動デプロイメント機能**: [MAINTENANCE_SOLUTION_1]
- **ログ監視とアラート機能**: [MAINTENANCE_SOLUTION_2]
- **バックアップとリストア機能**: [MAINTENANCE_SOLUTION_3]

## 11. 実装ガイドライン

### 11.1 コーディング規約
```[CODE_LANGUAGE_MAIN]
[CODING_STANDARDS]
```

### 11.2 エラーハンドリング
```[CODE_LANGUAGE_MAIN]
[ERROR_HANDLING_PATTERN]
```

### 11.3 ロギング戦略
```[CODE_LANGUAGE_MAIN]
[LOGGING_STRATEGY]
```

## 12. 開発・運用環境

### 12.1 開発環境
- **[DEV_TOOL_1]**: [DEV_TOOL_1_VERSION]
- **[DEV_TOOL_2]**: [DEV_TOOL_2_VERSION]
- **[DEV_TOOL_3]**: [DEV_TOOL_3_VERSION]

### 12.2 本番環境
- **[PROD_REQUIREMENT_1]**: [PROD_SPEC_1]
- **[PROD_REQUIREMENT_2]**: [PROD_SPEC_2]
- **[PROD_REQUIREMENT_3]**: [PROD_SPEC_3]

### 12.3 CI/CD パイプライン
```yaml
[CICD_PIPELINE_CONFIG]
```

## 13. 移行戦略

### 13.1 段階的実装
- **Phase 1**: [MIGRATION_PHASE_1]
- **Phase 2**: [MIGRATION_PHASE_2]
- **Phase 3**: [MIGRATION_PHASE_3]

### 13.2 リスク軽減策
- **技術的複雑性による開発遅延**: プロトタイプ開発と段階的実装
- **外部API依存による可用性影響**: フォールバック機能の実装
- **セキュリティ脆弱性の発見**: 定期的なセキュリティ監査

## 14. 将来の拡張計画

### 14.1 短期拡張（[SHORT_TERM_PERIOD]）
- [SHORT_TERM_PLAN_1]
- [SHORT_TERM_PLAN_2]
- [SHORT_TERM_PLAN_3]

### 14.2 中期拡張（[MEDIUM_TERM_PERIOD]）
- [MEDIUM_TERM_PLAN_1]
- [MEDIUM_TERM_PLAN_2]
- [MEDIUM_TERM_PLAN_3]

### 14.3 長期ビジョン（[LONG_TERM_PERIOD]）
- [LONG_TERM_PLAN_1]
- [LONG_TERM_PLAN_2]
- [LONG_TERM_PLAN_3]

## 15. 付録

### 15.1 用語集
- **CLI**: Command Line Interface - コマンドライン操作インターフェース
- **Cargo**: Rustのパッケージマネージャー・ビルドシステム
- **crate**: Rustにおけるライブラリ・バイナリの単位

### 15.2 参考資料
- [REFERENCE_1]
- [REFERENCE_2]
- [REFERENCE_3]

### 15.3 変更履歴
| 日付 | バージョン | 変更内容 | 変更者 |
|------|------------|----------|--------|
| 2025-07-08 | 1.0.0 | 初版作成 | your-username |
| 2025-07-08 | 1.1.0 | 要件詳細化 | your-username |
| 2025-07-08 | 1.2.0 | セキュリティ要件追加 | your-username |

## 🔄 PRD要件対応指針

### Agent向け実装ガイダンス

**1. PRD分析時の重点確認事項**
- **コマンド体系**: どのようなサブコマンドが必要か
- **入出力形式**: ファイル、標準入出力、ネットワーク
- **パフォーマンス要件**: 処理速度、メモリ使用量
- **ユーザビリティ**: エラーメッセージ、ヘルプ文書

**2. コマンド設計の決定基準**
- **直感性**: Unix哲学に準拠した設計
- **一貫性**: 引数・オプションの命名規則統一
- **拡張性**: 新しいサブコマンド追加の容易さ
- **後方互換性**: 既存使用方法の保持

**3. パフォーマンス最適化指針**
- **並行処理**: CPU集約的処理の並列化
- **メモリ効率**: ストリーミング処理、適切な所有権管理
- **I/O最適化**: 非同期I/O、バッファリング
- **起動速度**: 依存関係最小化、遅延初期化

**4. エラーハンドリング戦略**
- **早期発見**: 入力検証の徹底
- **分かりやすさ**: ユーザーフレンドリーなエラーメッセージ
- **回復可能性**: 適切なリトライ・フォールバック
- **デバッグ支援**: 詳細ログ、スタックトレース

**5. 配布・運用考慮**
- **インストール方法**: cargo install, バイナリ配布, パッケージマネージャー
- **設定管理**: 設定ファイル、環境変数、コマンドライン引数
- **アップデート**: バージョン管理、自動更新機能
- **ドキュメント**: man ページ、使用例、トラブルシューティング

---

**注意**: `[VARIABLE_NAME]`の部分は、プロジェクト固有の内容に置き換えてください。