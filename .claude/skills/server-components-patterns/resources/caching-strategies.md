# キャッシュ戦略

## Next.js のキャッシュレイヤー

```
1. Request Memoization (React)
   └── 同一リクエスト内でのfetch重複排除

2. Data Cache (Next.js)
   └── fetchの結果をサーバーで永続化

3. Full Route Cache (Next.js)
   └── ビルド時にレンダリング結果をキャッシュ

4. Router Cache (Client)
   └── クライアントでのRoute Segmentキャッシュ
```

## fetch オプション

### キャッシュモード

```typescript
// 1. 静的キャッシュ（デフォルト）
fetch("https://api.example.com/data");
// または明示的に
fetch("https://api.example.com/data", { cache: "force-cache" });

// 2. キャッシュなし（常に最新）
fetch("https://api.example.com/data", { cache: "no-store" });

// 3. 時間ベースの再検証
fetch("https://api.example.com/data", {
  next: { revalidate: 3600 }, // 1時間
});

// 4. タグベースの再検証
fetch("https://api.example.com/data", {
  next: { tags: ["posts"] },
});
```

### 設定の優先順位

```
fetch オプション > Route Segment Config > 動的関数の使用

例:
- fetch({ cache: 'no-store' }) → 常に動的
- cookies() の使用 → 常に動的
- export const revalidate = 3600 → ISR
- export const dynamic = 'force-static' → 常に静的
```

## Route Segment Config

### ページ/レイアウトレベルの設定

```typescript
// app/blog/page.tsx

// 動的レンダリングを強制
export const dynamic = "force-dynamic";

// 静的レンダリングを強制
export const dynamic = "force-static";

// 再検証間隔（ISR）
export const revalidate = 3600; // 1時間

// フェッチキャッシュの制御
export const fetchCache = "force-cache";
```

### 設定オプション一覧

| オプション   | 値                | 説明                            |
| ------------ | ----------------- | ------------------------------- |
| `dynamic`    | `'auto'`          | Next.jsが自動判断（デフォルト） |
|              | `'force-dynamic'` | 常に動的レンダリング            |
|              | `'error'`         | 動的になるとエラー              |
|              | `'force-static'`  | 常に静的レンダリング            |
| `revalidate` | `false`           | 再検証しない                    |
|              | `0`               | 常にリクエスト時にレンダリング  |
|              | `number`          | 秒数で再検証間隔を指定          |

## 再検証（Revalidation）

### 時間ベースの再検証

```typescript
// ページ全体の再検証間隔
export const revalidate = 3600; // 1時間

// 個別fetchの再検証
const posts = await fetch("https://api.example.com/posts", {
  next: { revalidate: 3600 },
});
```

### On-Demand 再検証

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { secret, path, tag } = await request.json();

  // シークレットの検証
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // パスベースの再検証
  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, path });
  }

  // タグベースの再検証
  if (tag) {
    revalidateTag(tag);
    return Response.json({ revalidated: true, tag });
  }

  return Response.json({ error: "Missing path or tag" }, { status: 400 });
}
```

### Server Actions での再検証

```typescript
"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;

  await db.post.create({
    data: { title },
  });

  // 作成後にパスを再検証
  revalidatePath("/posts");

  // または特定のタグを再検証
  revalidateTag("posts");
}
```

## タグベースのキャッシュ

### タグの設定

```typescript
// lib/data.ts
export async function getPosts() {
  const res = await fetch("https://api.example.com/posts", {
    next: { tags: ["posts"] },
  });
  return res.json();
}

export async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { tags: ["posts", `post-${slug}`] },
  });
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`, {
    next: { tags: ["users", `user-${id}`] },
  });
  return res.json();
}
```

### タグの再検証

```typescript
"use server";

import { revalidateTag } from "next/cache";

// すべての投稿を再検証
export async function revalidateAllPosts() {
  revalidateTag("posts");
}

// 特定の投稿のみ再検証
export async function revalidatePost(slug: string) {
  revalidateTag(`post-${slug}`);
}
```

## キャッシュ戦略の選択

### 判断フロー

```
このデータは...
├─ 変更されない（静的アセット、設定等）
│  └─ cache: 'force-cache' + 再検証なし
├─ 定期的に変更（ブログ投稿、製品情報）
│  └─ next: { revalidate: 適切な秒数 }
├─ イベント駆動で変更（ユーザー操作後）
│  └─ next: { tags: ['tag'] } + revalidateTag()
├─ ユーザー固有（ダッシュボード、設定）
│  └─ cache: 'no-store'
└─ リアルタイム必須（チャット、通知）
   └─ cache: 'no-store' + クライアントポーリング/WebSocket
```

### ユースケース別設定例

```typescript
// 1. 静的コンテンツ（ドキュメント、About）
export const dynamic = "force-static";

// 2. ブログ投稿（1時間毎に更新）
export const revalidate = 3600;

// 3. ECサイト商品（CMSから即時更新）
const product = await fetch(`/api/products/${id}`, {
  next: { tags: [`product-${id}`] },
});

// 4. ユーザーダッシュボード（常に最新）
export const dynamic = "force-dynamic";

// 5. 検索結果（キャッシュしない）
const results = await fetch(`/api/search?q=${query}`, {
  cache: "no-store",
});
```

## ORM/データベースのキャッシュ

### unstable_cache の使用

```typescript
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (id: string) => {
    return db.user.findUnique({ where: { id } });
  },
  ["user"],
  {
    tags: ["users"],
    revalidate: 3600,
  },
);

// 使用
const user = await getCachedUser(userId);

// 再検証
revalidateTag("users");
```

### Reactのcacheとの併用

```typescript
import { cache } from "react";
import { unstable_cache } from "next/cache";

// リクエスト間でキャッシュ（Next.js）
const getCachedUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ["user"],
  { tags: ["users"] },
);

// 同一リクエスト内で重複排除（React）
export const getUser = cache(getCachedUser);
```

## チェックリスト

### キャッシュ設計時

- [ ] 各データソースの更新頻度を把握している
- [ ] 適切なキャッシュモードを選択している
- [ ] タグが論理的に設計されている
- [ ] On-demand再検証のエンドポイントがセキュア

### パフォーマンス

- [ ] 不必要な動的レンダリングを避けている
- [ ] ISRで適切な再検証間隔を設定している
- [ ] タグの粒度が適切（細かすぎず粗すぎず）
- [ ] キャッシュヒット率を監視している
