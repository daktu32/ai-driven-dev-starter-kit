# アーキテクチャ仕様書 - test-web-nextjs

プロジェクトタイプ: web-nextjs

## 📋 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: Headless UI / Radix UI
- **アイコン**: Heroicons / Lucide Icons
- **フォント**: Inter / Google Fonts

### 状態管理
- **グローバル状態**: Zustand / Redux Toolkit
- **サーバー状態**: TanStack Query (React Query)
- **フォーム**: React Hook Form + Zod
- **URL状態**: Next.js Router + useSearchParams

### バックエンド（Next.js）
- **API Routes**: App Router API
- **認証**: NextAuth.js / Auth0
- **データベース**: Prisma + PostgreSQL / Supabase
- **バリデーション**: Zod
- **ファイルアップロード**: Uploadthing / Cloudinary

### 開発ツール
- **ビルド**: Next.js Turbopack
- **型チェック**: TypeScript strict mode
- **リンター**: ESLint + Prettier
- **テスト**: Vitest + Testing Library
- **E2E**: Playwright

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
test-web-nextjs/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # ルートグループ: 認証が必要なページ
│   │   │   ├── dashboard/
│   │   │   └── settings/
│   │   ├── (public)/          # ルートグループ: 公開ページ
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── api/               # API Routes
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── [feature]/
│   │   ├── globals.css        # グローバルスタイル
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # ホームページ
│   │   ├── loading.tsx        # ローディングUI
│   │   ├── error.tsx          # エラーUI
│   │   └── not-found.tsx      # 404ページ
│   ├── components/            # UIコンポーネント
│   │   ├── ui/               # 基本UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts      # re-export
│   │   ├── layout/           # レイアウトコンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── forms/            # フォームコンポーネント
│   │   │   ├── LoginForm.tsx
│   │   │   ├── ContactForm.tsx
│   │   │   └── [feature]Form.tsx
│   │   └── [feature]/        # 機能別コンポーネント
│   │       ├── [Feature]List.tsx
│   │       ├── [Feature]Card.tsx
│   │       └── [Feature]Detail.tsx
│   ├── lib/                   # ユーティリティ・設定
│   │   ├── auth.ts           # 認証設定
│   │   ├── db.ts             # データベース設定
│   │   ├── utils.ts          # 汎用ユーティリティ
│   │   ├── validations.ts    # Zodスキーマ
│   │   └── constants.ts      # 定数定義
│   ├── hooks/                # カスタムフック
│   │   ├── useAuth.ts        # 認証フック
│   │   ├── useLocalStorage.ts # ローカルストレージ
│   │   └── use[Feature].ts   # 機能別フック
│   ├── store/                # 状態管理
│   │   ├── index.ts          # ストア設定
│   │   ├── authStore.ts      # 認証状態
│   │   └── [feature]Store.ts # 機能別状態
│   ├── types/                # 型定義
│   │   ├── index.ts          # 共通型定義
│   │   ├── api.ts            # API型定義
│   │   ├── auth.ts           # 認証型定義
│   │   └── [feature].ts      # 機能別型定義
│   └── styles/               # スタイル
│       ├── globals.css       # Tailwindベース
│       └── components.css    # コンポーネント専用
├── public/                   # 静的ファイル
│   ├── images/
│   ├── icons/
│   └── favicon.ico
├── prisma/                   # データベーススキーマ（Prisma使用時）
│   ├── schema.prisma
│   └── migrations/
├── tests/                    # テストコード
│   ├── __mocks__/           # モック
│   ├── components/          # コンポーネントテスト
│   ├── pages/               # ページテスト
│   └── e2e/                 # E2Eテスト
├── docs/                     # ドキュメント
├── package.json             # プロジェクト設定
├── next.config.js           # Next.js設定
├── tailwind.config.js       # Tailwind設定
├── tsconfig.json            # TypeScript設定
├── .env.local               # 環境変数
└── README.md                # プロジェクト説明
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

### ページコンポーネント (app/*/page.tsx)
**責務**: ページレベルのデータ取得、SEO、レイアウト
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Server Component でのデータ取得
  const data = await fetchUserData();
  
  return (
    <div>
      <PageHeader title="Dashboard" />
      <DashboardContent data={data} />
    </div>
  );
}

export const metadata: Metadata = {
  title: 'Dashboard - test-web-nextjs',
  description: 'User dashboard'
};
```

### UIコンポーネント (components/ui/)
**責務**: 再利用可能な基本UIコンポーネント
```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={loading}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
};
```

### フォームコンポーネント (components/forms/)
**責務**: 入力検証、送信処理、エラーハンドリング
```typescript
// components/forms/ContactForm.tsx
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message too short')
});

export const ContactForm: React.FC = () => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });
  
  const mutation = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      toast.success('Message sent successfully!');
      form.reset();
    }
  });
  
  return (
    <form onSubmit={form.handleSubmit(mutation.mutate)}>
      {/* フォームフィールド */}
    </form>
  );
};
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
- **SSR**: Server-Side Rendering - サーバーサイドレンダリング
- **SSG**: Static Site Generation - 静的サイト生成
- **ISR**: Incremental Static Regeneration - 増分静的再生成

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
- **ユーザーペルソナ**: どのようなUIが適切か
- **データ要件**: どのような状態管理が必要か
- **パフォーマンス要件**: SSR/CSR/SSGの選択
- **デバイス対応**: レスポンシブ要件

**2. ページ構成の決定基準**
- **情報アーキテクチャ**: サイトマップに基づくルーティング
- **ユーザーフロー**: 認証状態・権限に基づくアクセス制御
- **SEO要件**: 静的生成・動的生成の選択
- **国際化**: 多言語対応の必要性

**3. コンポーネント設計指針**
- **再利用性**: Design System準拠
- **アクセシビリティ**: WCAG基準クリア
- **パフォーマンス**: 遅延読み込み・仮想化
- **テスト容易性**: Props駆動設計

**4. 状態管理戦略**
- **グローバル vs ローカル**: 状態のスコープ決定
- **永続化**: ローカルストレージ・セッション管理
- **サーバー状態**: キャッシュ戦略・楽観的更新
- **フォーム状態**: 検証・送信・エラー処理

**5. API設計指針**
- **RESTful**: 標準的なHTTPメソッド・ステータスコード
- **バリデーション**: 入力検証・型安全性
- **エラーハンドリング**: 適切なエラーレスポンス
- **パフォーマンス**: ページネーション・フィルタリング

---

**注意**: `[VARIABLE_NAME]`の部分は、プロジェクト固有の内容に置き換えてください。