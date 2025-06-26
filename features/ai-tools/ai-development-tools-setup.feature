# language: ja

機能: AI開発ツールの設定
  AI駆動開発を実践する開発者として
  AIコーディングアシスタントを設定したい
  効率的にAIと協働できるようにするため

  背景:
    前提 プロジェクトが生成済み
    かつ AI開発ツールの設定を選択している

  シナリオ: Claude Codeの設定
    もし "Claude Code"の設定を選択する
    ならば .claude/ディレクトリが作成される
    かつ .claude/CLAUDE.mdが生成される
    かつ CLAUDE.mdには以下の内容が含まれる:
      | セクション                | 内容                                    |
      | プロジェクト概要          | プロジェクトの目的と技術スタック        |
      | アーキテクチャ            | システム構成とコンポーネント            |
      | 開発ガイドライン          | コーディング規約とベストプラクティス    |
      | 禁止事項                  | 避けるべき実装パターン                  |
    かつ .claude/prompts/にプロンプトテンプレートが配置される

  シナリオ: GitHub Copilotの設定
    もし "GitHub Copilot"の設定を選択する
    ならば .github/copilot-instructions.mdが作成される
    かつ .vscode/settings.jsonに以下が追加される:
      """
      {
        "github.copilot.enable": {
          "*": true,
          "yaml": true,
          "plaintext": true,
          "markdown": true
        }
      }
      """
    かつ copilot-instructions.mdにプロジェクト固有の指示が含まれる

  シナリオ: Cursorの設定
    もし "Cursor"の設定を選択する
    ならば .cursorrules ファイルが作成される
    かつ カーソルルールには以下が含まれる:
      | ルールタイプ              | 内容                                    |
      | コード生成ルール          | プロジェクトのコーディング規約          |
      | インポート規則            | 依存関係の管理方法                      |
      | テスト作成ルール          | テストの書き方とカバレッジ要件          |
      | ドキュメント生成          | コメントとドキュメントのスタイル        |

  シナリオ: 複数AIツールの統合設定
    もし "Claude Code"と"GitHub Copilot"と"Cursor"を選択する
    ならば 各ツールの設定ファイルが作成される
    かつ .ai-tools/ディレクトリに統合設定が作成される
    かつ 各ツール間で一貫性のある設定が保たれる
    かつ README.mdにAIツールの使い分けガイドが追加される

  シナリオ: カスタムAIプロンプトの作成
    もし AIツール設定後にカスタムプロンプトを追加する
    かつ .claude/prompts/custom/にファイルを作成する:
      | ファイル名                | 用途                                |
      | refactoring.md           | リファクタリング支援                |
      | bug-fix.md               | バグ修正支援                        |
      | feature-implementation.md | 新機能実装支援                      |
      | code-review.md           | コードレビュー支援                  |
    ならば 各プロンプトがプロジェクトコンテキストを含む
    かつ AIツールがこれらのプロンプトを活用できる

  シナリオ: AIツール用の.gitignore設定
    もし AIツール設定が完了する
    かつ .gitignoreファイルを確認する
    ならば 以下のエントリが含まれている:
      """
      # AI Tools
      .ai-cache/
      .cursor-tutor/
      .copilot/
      *.ai-generated
      .ai-tools/cache/
      """
    かつ AI生成の一時ファイルがリポジトリに含まれない