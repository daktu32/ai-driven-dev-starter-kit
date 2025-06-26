# language: ja

機能: プロジェクトの初期化
  AI駆動開発を始めたい開発者として
  新しいプロジェクトをセットアップしたい
  効率的に開発環境を構築できるようにするため

  背景:
    前提 開発者がAI Driven Dev Starter Kitをクローン済み
    かつ Node.jsとnpmがインストール済み
    かつ scriptsディレクトリに移動済み

  シナリオ: CLIプロジェクトの新規作成
    もし "npm run scaffold"を実行する
    かつ プロジェクトタイプとして"CLI (Rust)"を選択する
    かつ プロジェクト名として"my-cli-tool"を入力する
    かつ 開発プロンプトとして"Basic Development"を選択する
    ならば "my-cli-tool"ディレクトリが作成される
    かつ Rustプロジェクトの基本構造が生成される
    かつ Cargo.tomlにプロジェクト名"my-cli-tool"が設定される
    かつ .claude/prompts/basic-development.mdが含まれる

  シナリオ: Webアプリケーションの新規作成
    もし "npm run scaffold"を実行する
    かつ プロジェクトタイプとして"Web (Next.js)"を選択する
    かつ プロジェクト名として"my-web-app"を入力する
    かつ 開発プロンプトとして"Startup Development"を選択する
    ならば "my-web-app"ディレクトリが作成される
    かつ Next.jsプロジェクトの基本構造が生成される
    かつ package.jsonにプロジェクト名"my-web-app"が設定される
    かつ .claude/prompts/startup-development.mdが含まれる

  シナリオ: APIサーバーの新規作成
    もし "npm run scaffold"を実行する
    かつ プロジェクトタイプとして"API (FastAPI)"を選択する
    かつ プロジェクト名として"my-api-service"を入力する
    かつ 開発プロンプトとして"Enterprise Development"を選択する
    ならば "my-api-service"ディレクトリが作成される
    かつ FastAPIプロジェクトの基本構造が生成される
    かつ pyproject.tomlにプロジェクト名"my-api-service"が設定される
    かつ .claude/prompts/enterprise-development.mdが含まれる

  シナリオ: 既存プロジェクトのセットアップ
    前提 既存のプロジェクトディレクトリが存在する
    もし "npm run setup"を実行する
    かつ 開発プロンプトとして"Open Source Development"を選択する
    かつ Claude Code設定の追加を選択する
    ならば .claude/ディレクトリが作成される
    かつ .claude/prompts/open-source-development.mdが追加される
    かつ .claude/CLAUDE.mdが生成される
    かつ 既存のファイルは上書きされない