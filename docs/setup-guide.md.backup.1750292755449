# 開発環境セットアップガイド

バージョン: 1.0  
作成日: 2025-06-04  
プロジェクト: サンプルMVP (AWS版)

---

## 🚀 セットアップ手順

### Step 1: 必要なツールのインストール

#### 1.1 Node.js (18以上)
```bash
# Node.js バージョン確認
node --version
npm --version

# 18以上でない場合は以下からインストール
# https://nodejs.org/
```

#### 1.2 AWS CLI v2
```bash
# macOS (Homebrew)
brew install awscli

# インストール確認
aws --version
```

#### 1.3 AWS CDK CLI
```bash
# CDK CLI インストール
npm install -g aws-cdk

# バージョン確認
cdk --version
```

#### 1.4 Docker (LocalStack用)
```bash
# macOS (Homebrew)
brew install docker

# Docker Desktop起動確認
docker --version
```

---

### Step 2: AWSアカウント・認証設定

#### 2.1 AWS アカウント
- [ ] AWSアカウント作成（未作成の場合）
- [ ] 管理者ユーザー作成（IAMユーザー）
- [ ] アクセスキー生成

#### 2.2 AWS CLI 設定
```bash
# AWS認証情報設定
aws configure

# 以下を入力
AWS Access Key ID: [アクセスキー]
AWS Secret Access Key: [シークレットキー]
Default region name: ap-northeast-1
Default output format: json

# 設定確認
aws sts get-caller-identity
```

#### 2.3 CDK Bootstrap
```bash
# CDKリソース初期化（初回のみ）
cdk bootstrap aws://[ACCOUNT-ID]/ap-northeast-1
```

---

### Step 3: プロジェクト初期化

#### 3.1 プロジェクトディレクトリ作成
```bash
# GitHubリポジトリをクローン
git clone [YOUR-REPO-URL] careerfm
cd careerfm

# プロジェクト構造作成
mkdir -p {backend,frontend,infrastructure,docs}
```

#### 3.2 CDKプロジェクト初期化
```bash
# インフラ用CDKプロジェクト
cd infrastructure
cdk init app --language typescript

# 必要なパッケージ追加
npm install @aws-cdk/aws-cognito @aws-cdk/aws-dynamodb @aws-cdk/aws-s3 @aws-cdk/aws-lambda @aws-cdk/aws-apigateway @aws-cdk/aws-cloudfront

cd ..
```

#### 3.3 フロントエンドプロジェクト初期化
```bash
# Next.jsプロジェクト作成
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# AWS SDK等の追加
npm install aws-amplify @aws-amplify/ui-react uuid
npm install -D @types/uuid

cd ..
```

#### 3.4 バックエンドプロジェクト初期化
```bash
# Lambda関数用プロジェクト
cd backend
npm init -y
npm install aws-sdk uuid
npm install -D @types/node @types/uuid @types/aws-lambda typescript ts-node esbuild

# TypeScript設定
npx tsc --init

# フォルダ構造作成
mkdir -p {src/handlers,src/utils,src/types}

cd ..
```

---

### Step 4: 開発環境設定

#### 4.1 VS Code拡張機能（推奨）
```json
// .vscode/extensions.json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-json",
    "amazonwebservices.aws-toolkit-vscode"
  ]
}
```

#### 4.2 環境変数設定
```bash
# frontend/.env.local
NEXT_PUBLIC_AWS_REGION=ap-northeast-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_API_ENDPOINT=

# backend/.env
AWS_REGION=ap-northeast-1
DYNAMO_TABLE_NAME=
S3_BUCKET_NAME=
```

#### 4.3 Git設定
```bash
# .gitignore (ルートディレクトリ)
echo "
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# CDK
infrastructure/cdk.out/
infrastructure/node_modules/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# AWS
.aws/
" > .gitignore
```

---

### Step 5: ローカル開発環境（LocalStack）

#### 5.1 LocalStack設定
```yaml
# docker-compose.yml
version: '3.8'
services:
  localstack:
    container_name: localstack-career-fm
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=cognito-idp,dynamodb,s3,lambda,apigateway
      - DEBUG=1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - ./localstack-data:/tmp/localstack
      - /var/run/docker.sock:/var/run/docker.sock
```

#### 5.2 LocalStack起動
```bash
# LocalStack起動
docker-compose up -d

# 確認
curl http://localhost:4566/_localstack/health
```

---

### Step 6: 開発ツール設定

#### 6.1 ESLint + Prettier設定
```json
// package.json (ルート)
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "lint:fix": "eslint . --ext .ts,.tsx,.js,.jsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### 6.2 Husky (pre-commit hooks)
```bash
# Husky設定
npm install -D husky lint-staged
npx husky install

# pre-commit hook作成
npx husky add .husky/pre-commit "npx lint-staged"

# lint-staged設定（package.json）
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

### Step 7: 動作確認

#### 7.1 CDK動作確認
```bash
cd infrastructure
cdk synth
```

#### 7.2 フロントエンド動作確認
```bash
cd frontend
npm run dev
# http://localhost:3000 でアクセス確認
```

#### 7.3 バックエンド動作確認
```bash
cd backend
npm run build
```

---

## ✅ セットアップ完了チェック

- [ ] Node.js 18+ インストール済み
- [ ] AWS CLI v2 設定済み
- [ ] CDK CLI インストール・Bootstrap完了
- [ ] GitHubリポジトリクローン済み
- [ ] CDKプロジェクト初期化完了
- [ ] Next.jsプロジェクト初期化完了
- [ ] バックエンドプロジェクト初期化完了
- [ ] 環境変数ファイル作成済み
- [ ] LocalStack起動確認済み
- [ ] ESLint/Prettier設定済み
- [ ] CDK synth成功
- [ ] Next.js開発サーバー起動成功

---

## 🚀 次のステップ

セットアップ完了後、以下を開始できます：

1. **インフラ実装**: CDKでCognito User Pool作成
2. **API実装**: Lambda関数作成
3. **フロントエンド実装**: 認証画面作成

---

## ❓ トラブルシューティング

### よくある問題

#### AWS CLI認証エラー
```bash
# 認証情報再設定
aws configure

# プロファイル確認
aws configure list
```

#### CDK Bootstrap エラー
```bash
# 権限確認
aws sts get-caller-identity

# 再Bootstrap
cdk bootstrap --force
```

#### Node.js バージョンエラー
```bash
# nvm使用の場合
nvm install 18
nvm use 18
```

---

**完了お疲れさまでした！** 🎉  
何か問題があれば、エラーメッセージと一緒にお知らせください。
