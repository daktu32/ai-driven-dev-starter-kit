# アーキテクチャ仕様書 - test-api-fastapi

プロジェクトタイプ: api-fastapi

## 📋 技術スタック

### バックエンド
- **フレームワーク**: FastAPI
- **言語**: Python 3.11+
- **ASGI サーバー**: Uvicorn
- **バリデーション**: Pydantic v2
- **型ヒント**: Python Typing

### データベース
- **ORM**: SQLAlchemy 2.0
- **マイグレーション**: Alembic
- **データベース**: PostgreSQL / SQLite (開発用)
- **接続プール**: SQLAlchemy Engine

### 認証・セキュリティ
- **JWT**: PyJWT
- **パスワードハッシュ**: bcrypt / Passlib
- **OAuth2**: FastAPI OAuth2 scheme
- **CORS**: FastAPI CORS middleware
- **レート制限**: slowapi

### 開発ツール
- **依存関係管理**: Poetry / pip-tools
- **コードフォーマット**: Black + isort
- **リンター**: Ruff / Flake8
- **型チェック**: mypy
- **テスト**: pytest + pytest-asyncio

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
test-api-fastapi/
├── src/
│   ├── test-api-fastapi/          # メインパッケージ
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPIアプリケーション
│   │   ├── core/                 # 核となる設定・ユーティリティ
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # 設定管理
│   │   │   ├── security.py       # セキュリティ・認証
│   │   │   ├── database.py       # データベース設定
│   │   │   └── dependencies.py   # 依存性注入
│   │   ├── api/                  # API エンドポイント
│   │   │   ├── __init__.py
│   │   │   ├── main.py           # APIルーター統合
│   │   │   ├── v1/               # API v1
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py       # 認証エンドポイント
│   │   │   │   ├── users.py      # ユーザー管理
│   │   │   │   └── [feature].py  # 機能別エンドポイント
│   │   │   └── deps.py           # API依存関係
│   │   ├── models/               # SQLAlchemyモデル
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # ベースモデル
│   │   │   ├── user.py           # ユーザーモデル
│   │   │   └── [feature].py      # 機能別モデル
│   │   ├── schemas/              # Pydanticスキーマ
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # ベーススキーマ
│   │   │   ├── user.py           # ユーザースキーマ
│   │   │   ├── auth.py           # 認証スキーマ
│   │   │   └── [feature].py      # 機能別スキーマ
│   │   ├── services/             # ビジネスロジック
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # ベースサービス
│   │   │   ├── user_service.py   # ユーザー操作
│   │   │   ├── auth_service.py   # 認証ロジック
│   │   │   └── [feature]_service.py # 機能別サービス
│   │   ├── repositories/         # データアクセス層
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # ベースリポジトリ
│   │   │   ├── user_repository.py # ユーザーデータアクセス
│   │   │   └── [feature]_repository.py # 機能別リポジトリ
│   │   ├── utils/                # ユーティリティ
│   │   │   ├── __init__.py
│   │   │   ├── logging.py        # ログ設定
│   │   │   ├── validators.py     # カスタムバリデーター
│   │   │   └── helpers.py        # ヘルパー関数
│   │   └── exceptions/           # カスタム例外
│   │       ├── __init__.py
│   │       ├── base.py           # ベース例外
│   │       ├── auth.py           # 認証例外
│   │       └── [feature].py      # 機能別例外
├── tests/                        # テストコード
│   ├── __init__.py
│   ├── conftest.py              # pytest設定
│   ├── unit/                    # ユニットテスト
│   │   ├── test_services/
│   │   ├── test_repositories/
│   │   └── test_utils/
│   ├── integration/             # 統合テスト
│   │   ├── test_api/
│   │   └── test_database/
│   └── fixtures/                # テストフィクスチャ
├── alembic/                     # データベースマイグレーション
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── docs/                        # API ドキュメント
├── requirements/                # 依存関係
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── pyproject.toml               # プロジェクト設定
├── alembic.ini                  # Alembic設定
├── .env.example                 # 環境変数例
└── README.md                    # プロジェクト説明
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

### FastAPI Application (main.py)
**責務**: アプリケーション初期化、ミドルウェア設定
```python
# src/test-api-fastapi/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.main import api_router
from .core.config import settings

app = FastAPI(
    title="test-api-fastapi",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# APIルーター登録
app.include_router(api_router, prefix=settings.API_V1_STR)
```

### Pydantic Models (schemas/)
**責務**: リクエスト・レスポンスの型定義、バリデーション
```python
# schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)

class UserInDB(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}

class User(UserInDB):
    pass
```

### SQLAlchemy Models (models/)
**責務**: データベーステーブル定義、リレーション
```python
# models/user.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func

from .base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Repository Pattern (repositories/)
**責務**: データアクセス抽象化、クエリ実装
```python
# repositories/user_repository.py
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from .base import BaseRepository

class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        statement = select(User).where(User.email == email)
        return db.execute(statement).scalar_one_or_none()
    
    def get_active_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        statement = select(User).where(User.is_active == True).offset(skip).limit(limit)
        return db.execute(statement).scalars().all()
```

### Service Layer (services/)
**責務**: ビジネスロジック、複数リポジトリの調整
```python
# services/user_service.py
from typing import Optional
from sqlalchemy.orm import Session

from ..core.security import get_password_hash, verify_password
from ..repositories.user_repository import UserRepository
from ..schemas.user import UserCreate, UserUpdate
from ..models.user import User

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    def create_user(self, db: Session, user_create: UserCreate) -> User:
        # パスワードハッシュ化
        hashed_password = get_password_hash(user_create.password)
        
        # ユーザー作成データ準備
        user_data = user_create.model_dump()
        user_data["hashed_password"] = hashed_password
        del user_data["password"]
        
        return self.user_repo.create(db, obj_in=user_data)
    
    def authenticate(self, db: Session, email: str, password: str) -> Optional[User]:
        user = self.user_repo.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
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
- **REST**: Representational State Transfer - アーキテクチャスタイル
- **OpenAPI**: API仕様記述の標準フォーマット
- **Pydantic**: Pythonのデータバリデーションライブラリ

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
- **データモデル**: どのようなエンティティが必要か
- **API設計**: どのようなエンドポイントが必要か
- **認証要件**: どのようなセキュリティレベルが必要か
- **パフォーマンス要件**: 同期/非同期処理の選択

**2. エンドポイント設計の決定基準**
- **RESTful設計**: 標準的なHTTPメソッド使用
- **バージョニング**: API進化への対応
- **ページネーション**: 大量データの効率的取得
- **フィルタリング**: 柔軟な検索・絞り込み

**3. データモデル設計指針**
- **正規化**: 適切なテーブル設計
- **インデックス**: クエリパフォーマンス最適化
- **制約**: データ整合性保証
- **マイグレーション**: スキーマ変更管理

**4. セキュリティ実装**
- **認証方式**: JWT vs Session の選択
- **認可レベル**: ロールベース vs リソースベース
- **入力検証**: Pydantic + カスタムバリデーター
- **レート制限**: API乱用防止

**5. パフォーマンス最適化**
- **非同期処理**: I/O集約的処理の最適化
- **キャッシュ戦略**: Redis・インメモリキャッシュ
- **データベース最適化**: クエリ・インデックス最適化
- **スケーリング**: 水平・垂直スケーリング対応

---

**注意**: `[VARIABLE_NAME]`の部分は、プロジェクト固有の内容に置き換えてください。