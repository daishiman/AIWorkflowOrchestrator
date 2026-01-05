# データフェッチパターン

## 基本パターン

### Server Componentでの直接フェッチ

```typescript
// app/users/[id]/page.tsx
async function UserProfile({ userId }: { userId: string }) {
  // Server Componentでは直接awaitが使用可能
  const user = await db.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    notFound()
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### fetch APIの使用

```typescript
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    // キャッシュオプション
    cache: 'force-cache', // デフォルト
  })

  if (!res.ok) {
    throw new Error('Failed to fetch posts')
  }

  return res.json()
}

async function PostList() {
  const posts = await getPosts()
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

## 並列フェッチ

### Promise.allによる並列実行

```typescript
// ✅ 推奨: 並列フェッチ
async function Dashboard() {
  // 3つのリクエストが同時に実行される
  const [user, posts, analytics] = await Promise.all([
    getUser(),
    getPosts(),
    getAnalytics(),
  ])

  return (
    <div>
      <UserCard user={user} />
      <PostList posts={posts} />
      <AnalyticsChart data={analytics} />
    </div>
  )
}

// ❌ 避けるべき: 逐次フェッチ（ウォーターフォール）
async function Dashboard() {
  const user = await getUser()      // 1秒
  const posts = await getPosts()    // 1秒
  const analytics = await getAnalytics() // 1秒
  // 合計: 3秒

  return <div>...</div>
}
```

### 依存関係がある場合

```typescript
async function UserPosts({ userId }: { userId: string }) {
  // userを取得してから、そのIDでpostsを取得
  const user = await getUser(userId)

  // 依存するフェッチは逐次で OK
  const posts = await getPostsByAuthor(user.id)

  return (
    <div>
      <h1>{user.name}'s Posts</h1>
      <PostList posts={posts} />
    </div>
  )
}
```

## プリロード/プリフェッチ

### プリロードパターン

```typescript
// lib/data.ts
import { cache } from "react";

// cacheで同一リクエスト内の重複を排除
export const getUser = cache(async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});

// プリロード関数
export const preloadUser = (id: string) => {
  void getUser(id);
};
```

```typescript
// app/users/[id]/page.tsx
import { preloadUser, getUser } from '@/lib/data'

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // 早期にプリロードを開始
  preloadUser(id)

  // 他の処理...

  // 後でデータを使用（既にキャッシュされている可能性）
  const user = await getUser(id)
  return <UserProfile user={user} />
}
```

## リクエスト重複排除

### Reactのcache関数

```typescript
import { cache } from "react";

// 同一リクエスト内で複数回呼び出しても1回のみ実行
export const getUser = cache(async (id: string) => {
  console.log("Fetching user:", id); // 1回のみログ出力
  const res = await fetch(`/api/users/${id}`);
  return res.json();
});
```

```typescript
// Layout と Page で同じ関数を呼んでも重複しない
// app/users/[id]/layout.tsx
export default async function Layout({ children, params }) {
  const { id } = await params
  const user = await getUser(id) // フェッチ実行
  return <UserNav user={user}>{children}</UserNav>
}

// app/users/[id]/page.tsx
export default async function Page({ params }) {
  const { id } = await params
  const user = await getUser(id) // キャッシュから取得（重複なし）
  return <UserProfile user={user} />
}
```

### fetchの自動重複排除

```typescript
// Next.jsはfetchを自動的に重複排除
// 同じURLとオプションのfetchは1回のみ実行される

async function ComponentA() {
  const data = await fetch('https://api.example.com/data')
  return <div>{/* ... */}</div>
}

async function ComponentB() {
  // 同じURL → ComponentAと同じリクエスト、重複排除
  const data = await fetch('https://api.example.com/data')
  return <div>{/* ... */}</div>
}
```

## データ取得関数の構造化

### 推奨構造

```typescript
// lib/db/users.ts
import { db } from "@/lib/db";
import { cache } from "react";

export const getUser = cache(async (id: string) => {
  return db.user.findUnique({
    where: { id },
    include: { profile: true },
  });
});

export const getUsers = cache(async () => {
  return db.user.findMany({
    orderBy: { createdAt: "desc" },
  });
});

export const getUserWithPosts = cache(async (id: string) => {
  return db.user.findUnique({
    where: { id },
    include: {
      posts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
});
```

```typescript
// lib/api/posts.ts
import { cache } from "react";

const API_URL = process.env.API_URL;

export const getPosts = cache(async () => {
  const res = await fetch(`${API_URL}/posts`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }

  return res.json();
});

export const getPost = cache(async (slug: string) => {
  const res = await fetch(`${API_URL}/posts/${slug}`, {
    next: { tags: [`post-${slug}`] },
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch post");
  }

  return res.json();
});
```

## エラーハンドリング

### try-catchパターン

```typescript
async function UserProfile({ userId }: { userId: string }) {
  try {
    const user = await getUser(userId)

    if (!user) {
      notFound()
    }

    return <div>{user.name}</div>
  } catch (error) {
    // エラーはerror.tsxで捕捉される
    throw error
  }
}
```

### Result型パターン

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

async function getUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) {
      return { success: false, error: 'User not found' }
    }
    return { success: true, data: user }
  } catch (error) {
    return { success: false, error: 'Failed to fetch user' }
  }
}

async function UserProfile({ userId }: { userId: string }) {
  const result = await getUser(userId)

  if (!result.success) {
    return <ErrorMessage message={result.error} />
  }

  return <div>{result.data.name}</div>
}
```

## チェックリスト

### データフェッチ実装時

- [ ] Server Componentでデータを取得している
- [ ] 独立したフェッチはPromise.allで並列化している
- [ ] cache関数で重複排除している
- [ ] エラーハンドリングが適切
- [ ] キャッシュオプションが設定されている

### パフォーマンス最適化

- [ ] N+1問題を避けている
- [ ] 必要なフィールドのみ取得している
- [ ] プリロードを活用している
- [ ] 不要な再フェッチを避けている
