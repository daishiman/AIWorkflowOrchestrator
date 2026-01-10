# データフェッチパターン

> **相対パス**: `references/data-fetching-patterns.md`
> **読み込み条件**: RSCでのデータ取得設計時

---

## 1. 基本パターン

### 1.1 直接フェッチ

```tsx
// Server Component
async function UserList() {
  const users = await db.user.findMany();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 1.2 並列フェッチ

ウォーターフォールを避けて並列実行。

```tsx
// ❌ ウォーターフォール（順次実行）
async function Page() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id); // userを待つ

  return <div>...</div>;
}

// ✅ 並列実行
async function Page() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();

  const [user, posts] = await Promise.all([userPromise, postsPromise]);

  return <div>...</div>;
}
```

---

## 2. Suspense統合

### 2.1 ストリーミング

```tsx
import { Suspense } from "react";

async function Page() {
  return (
    <div>
      <Header />
      <Suspense fallback={<Loading />}>
        <SlowComponent />
      </Suspense>
      <Footer />
    </div>
  );
}

async function SlowComponent() {
  const data = await slowFetch(); // 時間がかかる
  return <div>{data}</div>;
}
```

### 2.2 並列Suspense

```tsx
async function Page() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserProfile />
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <UserPosts />
      </Suspense>
    </div>
  );
}
```

---

## 3. キャッシュ戦略

### 3.1 fetchのキャッシュ

```tsx
// デフォルト: 'force-cache'（キャッシュ有効）
const data = await fetch(url);

// キャッシュ無効
const data = await fetch(url, { cache: "no-store" });

// 再検証（ISR）
const data = await fetch(url, { next: { revalidate: 60 } });
```

### 3.2 unstable_cache

```tsx
import { unstable_cache } from "next/cache";

const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } });
  },
  ["user"],
  { revalidate: 3600 },
);
```

---

## 4. Request Memoization

同一リクエスト内での重複fetch自動排除。

```tsx
// これらは自動的に1回のリクエストにまとめられる
async function Component1() {
  const user = await fetch("/api/user"); // 実際のリクエスト
}

async function Component2() {
  const user = await fetch("/api/user"); // キャッシュから
}
```

---

## 関連リソース

- **基礎**: See [basics.md](basics.md)
- **キャッシュ詳細**: See [caching-strategies.md](caching-strategies.md)
