---
name: error-handling-pages
description: |
  Next.js App Routerのエラーハンドリングを専門とするスキル。
  error.tsx、not-found.tsx、global-error.tsxを使用したエラー境界とリカバリーを実現します。

  専門分野:
  - error.tsx: ルートセグメントのエラー境界、リトライ機能
  - not-found.tsx: 404エラーページ、notFound()関数
  - global-error.tsx: アプリケーション全体のエラーハンドリング
  - loading.tsx: ローディング状態の管理

  使用タイミング:
  - エラーページを実装する時
  - 404ページをカスタマイズする時
  - グローバルエラーハンドリングを設定する時
  - ローディング状態を実装する時

  Use proactively when implementing error boundaries, 404 pages,
  or global error handling in Next.js applications.
version: 1.0.0
---

# Error Handling Pages

## 概要

このスキルは、Next.js App Routerにおけるエラーハンドリングの
ベストプラクティスを提供します。ユーザーフレンドリーなエラー体験と
適切なリカバリーメカニズムを実現します。

**核心哲学**:
- **Graceful Degradation**: エラー発生時も可能な限り機能を維持
- **User-Friendly**: 技術的詳細を隠し、ユーザーに分かりやすいメッセージを表示
- **Recovery-Oriented**: エラーからの復帰方法を提供

**主要な価値**:
- React Error Boundariesを活用した堅牢なエラーハンドリング
- セグメントレベルでのエラー分離
- ユーザーフレンドリーなエラー体験

## リソース構造

```
error-handling-pages/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── error-tsx-guide.md                      # error.tsx ガイド
│   ├── not-found-guide.md                      # not-found.tsx ガイド
│   ├── global-error-guide.md                   # global-error.tsx ガイド
│   └── loading-tsx-guide.md                    # loading.tsx ガイド
├── scripts/
│   └── check-error-handling.mjs                # エラーハンドリングチェック
└── templates/
    ├── error-page-template.md                  # エラーページテンプレート
    └── not-found-template.md                   # 404ページテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# error.tsx ガイド
cat .claude/skills/error-handling-pages/resources/error-tsx-guide.md

# not-found.tsx ガイド
cat .claude/skills/error-handling-pages/resources/not-found-guide.md

# global-error.tsx ガイド
cat .claude/skills/error-handling-pages/resources/global-error-guide.md

# loading.tsx ガイド
cat .claude/skills/error-handling-pages/resources/loading-tsx-guide.md
```

### スクリプト実行

```bash
# エラーハンドリング設定チェック
node .claude/skills/error-handling-pages/scripts/check-error-handling.mjs <app-directory>
```

### テンプレート参照

```bash
# エラーページテンプレート
cat .claude/skills/error-handling-pages/templates/error-page-template.md

# 404ページテンプレート
cat .claude/skills/error-handling-pages/templates/not-found-template.md
```

## いつ使うか

### シナリオ1: ルートエラーハンドリング
**状況**: 特定のルートでエラーが発生した場合の処理を実装する

**適用条件**:
- [ ] 特定のセグメントでエラーを捕捉したい
- [ ] リトライ機能を提供したい
- [ ] エラー時も他のセグメントは正常に表示したい

**期待される成果**: 局所的なエラー捕捉とリカバリー

### シナリオ2: 404ページのカスタマイズ
**状況**: 存在しないページへのアクセス時の表示をカスタマイズする

**適用条件**:
- [ ] ブランドに合った404ページを作成したい
- [ ] 動的ルートでnotFound()を使用したい
- [ ] 有用なナビゲーションを提供したい

**期待される成果**: ユーザーフレンドリーな404体験

### シナリオ3: グローバルエラーハンドリング
**状況**: Root Layout含むアプリ全体のエラーを処理する

**適用条件**:
- [ ] Root Layoutのエラーを捕捉したい
- [ ] 最終的なフォールバックを提供したい
- [ ] クリティカルエラーをログに記録したい

**期待される成果**: アプリ全体のエラー安全性

## 知識領域

### 領域1: error.tsx

**基本構造**:
```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={() => reset()}>再試行</button>
    </div>
  )
}
```

**詳細は**: `resources/error-tsx-guide.md` を参照

### 領域2: not-found.tsx

**基本構造**:
```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <Link href="/">ホームに戻る</Link>
    </div>
  )
}
```

**詳細は**: `resources/not-found-guide.md` を参照

### 領域3: global-error.tsx

**基本構造**:
```typescript
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>深刻なエラーが発生しました</h2>
        <button onClick={() => reset()}>再試行</button>
      </body>
    </html>
  )
}
```

**詳細は**: `resources/global-error-guide.md` を参照

### 領域4: loading.tsx

**基本構造**:
```typescript
export default function Loading() {
  return <div>読み込み中...</div>
}
```

**詳細は**: `resources/loading-tsx-guide.md` を参照

## ファイル階層とスコープ

```
app/
├── layout.tsx
├── error.tsx          # /以下すべてのエラーを捕捉（Root Layout除く）
├── not-found.tsx      # グローバル404
├── global-error.tsx   # Root Layout含むすべてのエラー
├── loading.tsx        # グローバルローディング
├── page.tsx
└── dashboard/
    ├── layout.tsx
    ├── error.tsx      # /dashboard以下のエラーを捕捉
    ├── not-found.tsx  # /dashboard専用404
    ├── loading.tsx    # /dashboard専用ローディング
    └── page.tsx
```

## ワークフロー

### Phase 1: 要件分析
1. エラーハンドリングが必要なルートを特定
2. エラーの種類を分類（認証、データ、システム等）
3. リカバリー戦略を決定

### Phase 2: 基本実装
1. app/error.tsxを作成（グローバル）
2. app/not-found.tsxを作成
3. app/global-error.tsxを作成

### Phase 3: セグメント別実装
1. 重要なルートに個別error.tsxを作成
2. 動的ルートにnot-found.tsxを作成
3. loading.tsxを必要なセグメントに追加

### Phase 4: テスト
1. エラーケースのテスト
2. リトライ機能のテスト
3. ユーザー体験の確認

### Phase 5: 監視
1. エラーログの設定
2. エラーレポーティング統合
3. 継続的な改善

## 設計原則

### エラー分離の原則
エラーは可能な限り局所的に捕捉し、他の部分への影響を最小化する。

### リカバリーの原則
単なるエラー表示ではなく、ユーザーが次に何をすべきか明示する。

### ログの原則
ユーザーには友好的なメッセージを、開発者には詳細なエラー情報を。

### 階層の原則
より具体的なerror.tsxが優先される。グローバルはフォールバック。

## 関連スキル

- `.claude/skills/nextjs-app-router/SKILL.md` - ルーティング構造
- `.claude/skills/server-components-patterns/SKILL.md` - データフェッチエラー
- `.claude/skills/web-performance/SKILL.md` - ローディング最適化

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版リリース |
