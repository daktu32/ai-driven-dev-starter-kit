# language: ja

機能: プロジェクトのカスタマイズ
  プロジェクトオーナーとして
  生成されたプロジェクトをカスタマイズしたい
  プロジェクト固有の要件に合わせるため

  背景:
    前提 プロジェクトが生成済み
    かつ プロジェクトディレクトリに移動済み

  シナリオ: プロジェクト情報の更新
    もし README.mdを開く
    かつ プロジェクト名を"AI-Powered Task Manager"に変更する
    かつ プロジェクトの説明を追加する:
      """
      AIを活用したタスク管理ツール。
      自然言語でタスクを作成し、優先順位を自動判定します。
      """
    かつ package.jsonのnameフィールドを"ai-task-manager"に更新する
    ならば プロジェクト情報が正しく更新される
    かつ 全ての設定ファイルで一貫性が保たれる

  シナリオ: 環境変数の設定
    もし .env.exampleファイルが存在する
    かつ .envファイルを作成する
    かつ 以下の環境変数を設定する:
      | 変数名               | 値                          |
      | DATABASE_URL        | postgresql://localhost/db   |
      | API_KEY             | your-api-key-here          |
      | NODE_ENV            | development                |
    ならば アプリケーションが環境変数を正しく読み込める
    かつ .envファイルは.gitignoreに含まれている

  シナリオ: 依存関係の追加
    もし プロジェクトがNext.jsベースである
    かつ 追加のライブラリが必要である
    かつ 以下のコマンドを実行する:
      """
      npm install @tanstack/react-query axios zod
      npm install -D @types/node
      """
    ならば package.jsonに依存関係が追加される
    かつ node_modulesがインストールされる
    かつ TypeScriptの型定義が利用可能になる

  シナリオ: カスタムスクリプトの追加
    もし package.jsonを編集する
    かつ scriptsセクションに以下を追加する:
      | スクリプト名    | コマンド                          |
      | db:migrate     | prisma migrate dev                |
      | db:seed        | tsx scripts/seed.ts               |
      | analyze        | next-bundle-analyzer              |
      | check-types    | tsc --noEmit                      |
    ならば "npm run db:migrate"でマイグレーションが実行できる
    かつ カスタムスクリプトが開発ワークフローに統合される

  シナリオ: ディレクトリ構造のカスタマイズ
    もし 追加のディレクトリが必要である
    かつ 以下のディレクトリを作成する:
      | ディレクトリ        | 用途                              |
      | src/features/      | 機能別モジュール                  |
      | src/shared/        | 共有コンポーネント                |
      | src/utils/         | ユーティリティ関数                |
      | scripts/           | 開発用スクリプト                  |
    かつ 各ディレクトリにREADME.mdを追加する
    ならば プロジェクト構造が組織のニーズに合致する
    かつ 開発者が適切な場所にコードを配置できる

  シナリオ: CI/CD設定のカスタマイズ
    もし .github/workflows/ci.ymlが存在する
    かつ テストカバレッジの閾値を設定する:
      """
      - name: Check test coverage
        run: npm run test:coverage
        env:
          COVERAGE_THRESHOLD: 80
      """
    かつ デプロイ環境を追加する:
      | 環境         | ブランチ    | URL                          |
      | staging     | develop    | https://staging.example.com  |
      | production  | main       | https://app.example.com      |
    ならば CI/CDパイプラインがプロジェクト要件に適合する