# React Server Components 基礎

> **相対パス**: `references/basics.md`
> **読み込み条件**: RSC初学者、基本概念の理解時

---

## 1. RSCとは

### 1.1 基本概念

React Server Components（RSC）は、サーバーでのみ実行されるReactコンポーネント。

| 特徴                | 説明                                   |
| ------------------- | -------------------------------------- |
| サーバー実行        | サーバーでのみレンダリング             |
| ゼロバンドル        | クライアントJSに含まれない             |
| 直接データアクセス  | DB、ファイルシステムに直接アクセス可能 |
| async/await使用可能 | useEffect不要で非同期処理              |

### 1.2 メンタルモデル

```
                    ┌─────────────────┐
                    │  Server         │
                    │  ┌───────────┐  │
                    │  │   RSC     │  │
                    │  │  (async)  │  │
                    │  └─────┬─────┘  │
                    │        │        │
                    │   HTML/RSC      │
                    │   Payload       │
                    └────────┼────────┘
                             │
                    ┌────────▼────────┐
                    │  Client         │
                    │  ┌───────────┐  │
                    │  │   RCC     │  │
                    │  │ useState  │  │
                    │  └───────────┘  │
                    └─────────────────┘
```

---

## 2. Server vs Client Components

### 2.1 判断基準

| 機能が必要              | 使用すべきComponent |
| ----------------------- | ------------------- |
| useState, useEffect     | Client Component    |
| イベントハンドラ        | Client Component    |
| ブラウザAPI             | Client Component    |
| async/await             | Server Component    |
| DB/ファイル直接アクセス | Server Component    |
| 機密情報（APIキー等）   | Server Component    |

### 2.2 デフォルトはServer

Next.js App Routerでは、全てのコンポーネントがデフォルトでServer Component。

```tsx
// これはServer Component（デフォルト）
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

```tsx
"use client";

// これはClient Component
export default function Button() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

---

## 3. 基本パターン

### 3.1 データフェッチ

```tsx
// Server Component
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } });

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### 3.2 コンポジション

```tsx
// Server Component（親）
async function Layout({ children }) {
  const user = await getUser();

  return (
    <div>
      <Header user={user} />
      {children}
      <Footer />
    </div>
  );
}

// Client Component（インタラクティブ部分のみ）
("use client");
function Header({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}
```

---

## 関連リソース

- **境界定義**: See [server-client-boundaries.md](server-client-boundaries.md)
- **データフェッチ**: See [data-fetching-patterns.md](data-fetching-patterns.md)
