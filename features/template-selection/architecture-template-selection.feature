# language: ja

機能: アーキテクチャテンプレートの選択
  システムアーキテクトとして
  プロジェクトに適したアーキテクチャテンプレートを選択したい
  効率的にシステム設計を開始できるようにするため

  背景:
    前提 プロジェクトセットアップ中である
    かつ プロジェクトタイプと開発プロンプトが選択済み
    かつ アーキテクチャテンプレートの追加を選択している

  シナリオ: モノリシックアーキテクチャの選択
    もし アーキテクチャテンプレートの選択画面が表示される
    かつ "Monolithic"を選択する
    ならば monolithic-architectureテンプレートが適用される
    かつ 以下の構造が生成される:
      | ディレクトリ       | 説明                           |
      | src/controllers    | コントローラー層               |
      | src/services       | ビジネスロジック層             |
      | src/repositories   | データアクセス層               |
      | src/models         | ドメインモデル                 |
      | docs/architecture  | アーキテクチャドキュメント     |

  シナリオ: マイクロサービスアーキテクチャの選択
    もし アーキテクチャテンプレートの選択画面が表示される
    かつ "Microservices"を選択する
    ならば microservices-architectureテンプレートが適用される
    かつ 以下の構造が生成される:
      | ディレクトリ           | 説明                         |
      | services/              | 個別サービスディレクトリ     |
      | api-gateway/           | APIゲートウェイ              |
      | shared/                | 共通ライブラリ               |
      | docker-compose.yml     | ローカル開発環境             |
      | k8s/                   | Kubernetesマニフェスト       |

  シナリオ: サーバーレスアーキテクチャの選択
    もし アーキテクチャテンプレートの選択画面が表示される
    かつ "AWS Serverless"を選択する
    ならば aws-serverless-architectureテンプレートが適用される
    かつ 以下の構造が生成される:
      | ファイル/ディレクトリ    | 説明                         |
      | functions/              | Lambda関数                   |
      | layers/                 | Lambda Layers                |
      | infrastructure/         | CDK/Terraformコード          |
      | serverless.yml          | Serverless Framework設定     |
      | .aws/                   | AWS設定テンプレート          |

  シナリオ: イベント駆動アーキテクチャの選択
    もし アーキテクチャテンプレートの選択画面が表示される
    かつ "Event-Driven"を選択する
    ならば event-driven-architectureテンプレートが適用される
    かつ 以下の構造が生成される:
      | ディレクトリ           | 説明                         |
      | events/                | イベント定義                 |
      | producers/             | イベントプロデューサー       |
      | consumers/             | イベントコンシューマー       |
      | message-bus/           | メッセージバス設定           |
      | docs/event-catalog     | イベントカタログ             |

  シナリオ: 複数アーキテクチャの組み合わせ
    もし アーキテクチャテンプレートの選択画面が表示される
    かつ "Microservices"と"Event-Driven"を選択する
    ならば 両方のテンプレートが統合される
    かつ マイクロサービス間のイベント通信構造が生成される
    かつ 統合されたアーキテクチャドキュメントが作成される