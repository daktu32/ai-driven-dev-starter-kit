# ADR-0002: Next.js フロントエンドフレームワークの選択

**日付**: 2025-06-06  
**ステータス**: 承認済み  
**決定者**: 開発チーム

## 背景

Career.fm フロントエンドの技術選定で、React系フレームワークの中からNext.js、Vite+React、Create React Appを比較検討。

## 検討した選択肨

### Option 1: Next.js 14 (App Router)
- **メリット**: 
  - SSG/SSRによるSEO最適化
  - 音声名刺の公開ページに最適
  - TypeScript標準サポート
  - Vercel/AWS統合実績
- **デメリット**: 
  - 学習コーブやや急
  - App Routerの新しさ

### Option 2: Vite + React
- **メリット**: 
  - 高速開発体験
  - 軽量構成
  - プラグインエコシステム
- **デメリット**: 
  - SSG設定の複雑性
  - AWS統合の追加設定

### Option 3: Create React App
- **メリット**: 
  - 学習コスト低
  - 豊富なドキュメント
- **デメリット**: 
  - メンテナンス停止
  - パフォーマンス課題

## 決定

**Next.js 14 (App Router) を採用**

### 理由

1. **SEO要件**: 音声名刺公開ページのSNSシェア対応
2. **パフォーマンス**: 静的生成によるCDN最適化  
3. **AWSサポート**: CloudFront + S3での配信実績
4. **開発効率**: TypeScript + TailwindCSSとの統合性

### 設定方針

```typescript
// Next.js構成
- App Router (stable)
- TypeScript strict mode
- TailwindCSS
- AWS Amplify SDK統合
- Cognito認証連携
```

## 実装計画

### Phase 2 (Week 2-3)
- [ ] Next.jsプロジェクト初期化
- [ ] TailwindCSS設定
- [ ] Cognito SDK統合
- [ ] 基本認証フロー

### Phase 4 (Week 6)  
- [ ] 音声名刺SSG実装
- [ ] OGP/Twitter Card対応
- [ ] CloudFront配信最適化

## リスク軽減策

1. **Cognito統合複雑性**: AWS Amplify vs 手動統合の早期検証
2. **App Router学習**: 公式ドキュメント + 実装例の事前調査
3. **パフォーマンス**: Core Web Vitals監視の設定

## 成功指標

- [ ] 認証フロー実装完了
- [ ] 音声名刺ページのSSG成功  
- [ ] Lighthouse Score 90+
- [ ] 音声ファイル再生成功率 95%+
