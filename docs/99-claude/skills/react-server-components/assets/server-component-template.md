# Server Component テンプレート

## 基本構造

```tsx
// app/components/UserProfile.tsx
// Server Component（デフォルト）

import { db } from "@/lib/db";
import { Suspense } from "react";

interface Props {
  userId: string;
}

export default async function UserProfile({ userId }: Props) {
  // サーバーで直接データフェッチ
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <Suspense fallback={<div>Loading posts...</div>}>
        <UserPosts userId={userId} />
      </Suspense>
    </div>
  );
}

// 別のServer Component
async function UserPosts({ userId }: { userId: string }) {
  const posts = await db.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## レイアウトパターン

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        {/* Client ComponentでServer Componentsをラップ */}
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## 並列データフェッチ

```tsx
// app/dashboard/page.tsx
async function DashboardPage() {
  // 並列実行
  const [user, stats, notifications] = await Promise.all([
    fetchUser(),
    fetchStats(),
    fetchNotifications(),
  ]);

  return (
    <div>
      <Header user={user} />
      <Stats data={stats} />
      <Notifications items={notifications} />
    </div>
  );
}
```

## チェックリスト

- [ ] `'use client'` なしでServer Componentとして定義
- [ ] `async/await` を直接使用
- [ ] データフェッチはサーバー側で実行
- [ ] 機密情報（APIキー等）はサーバー側で処理
- [ ] 適切なSuspense境界を配置
- [ ] 並列フェッチでウォーターフォールを回避
