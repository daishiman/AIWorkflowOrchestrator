---
name: .claude/skills/server-components-patterns/SKILL.md
description: |
  React Server Componentsのデータフェッチ最適化とSuspense活用を専門とするスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/server-components-patterns/resources/caching-strategies.md`: Caching Strategiesリソース
  - `.claude/skills/server-components-patterns/resources/data-fetching-patterns.md`: Data Fetching Patternsリソース
  - `.claude/skills/server-components-patterns/resources/server-actions.md`: Server Actionsリソース
  - `.claude/skills/server-components-patterns/resources/suspense-streaming.md`: Suspense Streamingリソース

  - `.claude/skills/server-components-patterns/templates/data-fetch-template.md`: Data Fetchテンプレート
  - `.claude/skills/server-components-patterns/templates/server-action-template.md`: Server Actionテンプレート

  - `.claude/skills/server-components-patterns/scripts/analyze-data-fetching.mjs`: Analyze Data Fetchingスクリプト

version: 1.0.0
---

# Server Components Patterns

## 概要

このスキルは、React Server Components におけるデータフェッチ最適化と
Suspense を活用したストリーミングレンダリングのベストプラクティスを提供します。

**核心哲学**:

- **Server-First**: データはサーバーで取得し、クライアントへの転送を最小化
- **Streaming**: コンテンツを段階的に配信し、ユーザー体験を向上
- **Cache-Aware**: 適切なキャッシュ戦略で効率とフレッシュネスを両立

**主要な価値**:

- サーバーサイドでの効率的なデータフェッチによるパフォーマンス向上
- Suspense による知覚パフォーマンスの改善
- 適切なキャッシュ戦略によるリソース効率化

## リソース構造

```
server-components-patterns/
├── SKILL.md                                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── data-fetching-patterns.md               # データフェッチパターン
│   ├── suspense-streaming.md                   # Suspense/Streamingガイド
│   ├── caching-strategies.md                   # キャッシュ戦略
│   └── server-actions.md                       # Server Actions
├── scripts/
│   └── analyze-data-fetching.mjs               # データフェッチ分析
└── templates/
    ├── data-fetch-template.md                  # データフェッチテンプレート
    └── server-action-template.md               # Server Actionテンプレート
```

## コマンドリファレンス

### リソース読み取り

```bash
# データフェッチパターン
cat .claude/skills/server-components-patterns/resources/data-fetching-patterns.md

# Suspense/Streamingガイド
cat .claude/skills/server-components-patterns/resources/suspense-streaming.md

# キャッシュ戦略
cat .claude/skills/server-components-patterns/resources/caching-strategies.md

# Server Actions
cat .claude/skills/server-components-patterns/resources/server-actions.md
```

### スクリプト実行

```bash
# データフェッチ分析
node .claude/skills/server-components-patterns/scripts/analyze-data-fetching.mjs <file.tsx>
```

### テンプレート参照

```bash
# データフェッチテンプレート
cat .claude/skills/server-components-patterns/templates/data-fetch-template.md

# Server Actionテンプレート
cat .claude/skills/server-components-patterns/templates/server-action-template.md
```

## いつ使うか

### シナリオ 1: データフェッチ実装

**状況**: Server Component でデータを取得する必要がある

**適用条件**:

- [ ] データベースまたは API からデータ取得
- [ ] 複数のデータソースを並列で取得
- [ ] キャッシュ戦略の設計が必要

**期待される成果**: 効率的で保守しやすいデータフェッチ実装

### シナリオ 2: Suspense 設計

**状況**: ページの段階的レンダリングを実装したい

**適用条件**:

- [ ] 非同期コンポーネントが複数ある
- [ ] 重要度の異なるコンテンツがある
- [ ] ローディング UI の設計が必要

**期待される成果**: 最適な Suspense 境界の配置とフォールバック UI

### シナリオ 3: キャッシュ最適化

**状況**: データの鮮度とパフォーマンスのバランスを取りたい

**適用条件**:

- [ ] データの更新頻度が定義されている
- [ ] キャッシュ無効化のタイミングが明確
- [ ] On-demand 再検証が必要

**期待される成果**: 要件に最適なキャッシュ設定

## 知識領域

### 領域 1: データフェッチパターン

**基本パターン**:

```typescript
// Server Componentでの直接フェッチ
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}
```

**並列フェッチ**:

```typescript
async function Dashboard() {
  // 並列実行
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats(),
  ]);
  return <DashboardContent user={user} posts={posts} stats={stats} />;
}
```

**詳細は**: `resources/data-fetching-patterns.md` を参照

### 領域 2: Suspense/Streaming

**自動 Suspense（loading.tsx）**:

```
app/dashboard/
├── loading.tsx  → 自動的にSuspense境界を作成
└── page.tsx
```

**手動 Suspense**:

```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Header /> {/* 即座にレンダリング */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts /> {/* ストリーミング */}
      </Suspense>
    </>
  );
}
```

**詳細は**: `resources/suspense-streaming.md` を参照

### 領域 3: キャッシュ戦略

| 戦略           | 設定                         | 用途               |
| -------------- | ---------------------------- | ------------------ |
| 静的キャッシュ | `cache: 'force-cache'`       | 変更されないデータ |
| 時間ベース     | `next: { revalidate: 3600 }` | 定期更新データ     |
| 動的           | `cache: 'no-store'`          | 常に最新が必要     |
| タグベース     | `next: { tags: ['posts'] }`  | 選択的無効化       |

**詳細は**: `resources/caching-strategies.md` を参照

### 領域 4: Server Actions

**フォーム処理**:

```typescript
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title");
  await db.post.create({ data: { title } });
  revalidatePath("/posts");
}
```

**楽観的更新**:

```typescript
"use client";
import { useOptimistic } from "react";

function PostList({ posts }) {
  const [optimisticPosts, addOptimisticPost] = useOptimistic(
    posts,
    (state, newPost) => [...state, newPost],
  );
  // ...
}
```

**詳細は**: `resources/server-actions.md` を参照

## ワークフロー

### Phase 1: データ要件分析

1. 必要なデータソースを特定
2. データの依存関係を分析
3. 更新頻度を確認

### Phase 2: フェッチ戦略設計

1. 並列/逐次フェッチを決定
2. キャッシュ戦略を選択
3. エラーハンドリングを計画

### Phase 3: Suspense 境界設計

1. コンテンツの優先度を分析
2. Suspense 境界を配置
3. フォールバック UI を設計

### Phase 4: 実装

1. データフェッチ関数を実装
2. Server Component を実装
3. loading.tsx/Suspense を実装

### Phase 5: 検証

1. パフォーマンスを測定
2. キャッシュ動作を確認
3. エラーケースをテスト

## 設計原則

### コロケーションの原則

データフェッチはそれを使用するコンポーネントに近接して配置する。

### 並列化の原則

独立したデータフェッチは Promise.all で並列実行する。

### 段階的開示の原則

重要なコンテンツを優先し、二次的なコンテンツはストリーミングする。

### フォールバック優先の原則

適切なスケルトン UI でユーザーに進行状況を伝える。

## 関連スキル

- `.claude/skills/nextjs-app-router/SKILL.md` - ルーティング構造
- `.claude/skills/seo-optimization/SKILL.md` - Metadata API
- `.claude/skills/web-performance/SKILL.md` - パフォーマンス最適化
- `.claude/skills/error-handling-pages/SKILL.md` - エラーハンドリング

## 変更履歴

| バージョン | 日付       | 変更内容     |
| ---------- | ---------- | ------------ |
| 1.0.0      | 2025-11-25 | 初版リリース |
