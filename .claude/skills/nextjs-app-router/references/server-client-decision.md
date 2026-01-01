# Server/Client Components 判断フロー

## 基本判断フローチャート

```
このコンポーネントは...

1. データフェッチが必要？
   ├─ Yes
   │  ├─ サーバー専用リソース（DB、ファイルシステム）？
   │  │  └─ Server Component（async/await）
   │  └─ 外部API + クライアントインタラクション？
   │     └─ Server Component + Client Component（子に分離）
   └─ No → 次へ

2. インタラクティブ性が必要？
   ├─ Yes
   │  ├─ onClick、onChange等のイベントハンドラ？
   │  │  └─ Client Component（"use client"）
   │  ├─ useState、useEffect等のReact Hooks？
   │  │  └─ Client Component
   │  └─ Context、Custom Hooks？
   │     └─ Client Component（Providerは分離）
   └─ No → 次へ

3. ブラウザAPIが必要？
   ├─ Yes（window、localStorage、document等）
   │  └─ Client Component
   └─ No → Server Component（デフォルト）
```

## Server Components

### 特徴

- **デフォルト**: "use client" なしのコンポーネントはすべてServer Component
- **async/await対応**: 直接データフェッチ可能
- **バンドルサイズ**: クライアントに送信されない
- **アクセス**: サーバー専用リソース（DB、環境変数）に直接アクセス可能

### 適用ケース

```typescript
// ✅ Server Component - データフェッチ
async function UserProfile({ userId }: { userId: string }) {
  const user = await db.user.findUnique({ where: { id: userId } })
  return <div>{user.name}</div>
}

// ✅ Server Component - 静的コンテンツ
function Footer() {
  return <footer>© 2025 Company</footer>
}

// ✅ Server Component - 環境変数アクセス
function ApiInfo() {
  return <div>Version: {process.env.APP_VERSION}</div>
}
```

### 禁止事項

```typescript
// ❌ Server Componentでは使用不可
import { useState, useEffect } from "react";

function ServerComponent() {
  const [count, setCount] = useState(0); // エラー
  useEffect(() => {}, []); // エラー
  const handleClick = () => {}; // onClick使用不可
}
```

## Client Components

### 特徴

- **明示的宣言**: ファイル先頭に `"use client"` が必要
- **Hooks使用可能**: useState、useEffect、useContext等
- **イベントハンドラ**: onClick、onChange等が使用可能
- **ブラウザAPI**: window、localStorage等にアクセス可能

### 適用ケース

```typescript
'use client'

// ✅ Client Component - インタラクティブUI
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// ✅ Client Component - フォーム
function LoginForm() {
  const [email, setEmail] = useState('')
  return <input value={email} onChange={(e) => setEmail(e.target.value)} />
}

// ✅ Client Component - ブラウザAPI
function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  return <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>Toggle</button>
}
```

## 境界最適化パターン

### パターン1: Client Componentを葉に配置

```typescript
// ✅ 推奨: Client Componentは最下層に
// Server Component (親)
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id)
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={id} />  {/* Client Component */}
    </div>
  )
}

// Client Component (葉)
'use client'
function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const handleClick = async () => {
    setLoading(true)
    await addToCart(productId)
    setLoading(false)
  }
  return <button onClick={handleClick} disabled={loading}>Add to Cart</button>
}
```

### パターン2: children propsでServer Componentを渡す

```typescript
// Client Component (Provider)
'use client'
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light')
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}  {/* Server Componentを含められる */}
    </ThemeContext.Provider>
  )
}

// Server Component (親)
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Header />       {/* Server Component */}
      {children}       {/* Server Component */}
      <Footer />       {/* Server Component */}
    </ThemeProvider>
  )
}
```

### パターン3: Context Providerの分離

```typescript
// providers.tsx (Client Component)
'use client'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}

// layout.tsx (Server Component)
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## 判断チェックリスト

### Server Component にすべきか？

- [ ] データベースに直接アクセスする
- [ ] 環境変数（シークレット）を使用する
- [ ] ファイルシステムを読み取る
- [ ] 大きなnpmパッケージを使用する（バンドル除外したい）
- [ ] インタラクティブ性が不要

### Client Component にすべきか？

- [ ] onClick、onChange等のイベントハンドラを使用
- [ ] useState、useReducer、useEffect を使用
- [ ] useContext でContextを消費
- [ ] カスタムHooksを使用
- [ ] ブラウザAPI（window、localStorage）を使用
- [ ] React.lazy、Suspenseを使用
