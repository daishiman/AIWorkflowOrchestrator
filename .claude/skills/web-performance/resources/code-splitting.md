# Code Splitting

## 概要

Code Splittingは、JavaScriptバンドルを小さなチャンクに分割し、
必要な時に必要なコードだけを読み込む技術です。
Next.js App Routerは自動的にルートベースの分割を行います。

## 自動Code Splitting

### ルートベース分割（自動）

```
app/
├── layout.tsx          # 共有レイアウト（全ページで共有）
├── page.tsx            # ホーム用チャンク
├── about/
│   └── page.tsx        # /about用チャンク
└── blog/
    ├── page.tsx        # /blog用チャンク
    └── [slug]/
        └── page.tsx    # /blog/[slug]用チャンク
```

Next.jsは自動的に：
- 各ページを個別のチャンクに分割
- 共有コード（layout）を別チャンクに抽出
- 動的ルートは個別にバンドル

### 共有コードの抽出

```typescript
// app/layout.tsx - 全ページで共有
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

// これらのコンポーネントは共有チャンクに含まれる
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

## 手動Code Splitting

### コンポーネントベース分割

```typescript
import dynamic from 'next/dynamic'

// 条件付きで表示されるコンポーネントを分割
const Modal = dynamic(() => import('@/components/modal'))
const Drawer = dynamic(() => import('@/components/drawer'))
const Chart = dynamic(() => import('@/components/chart'), { ssr: false })
```

### ライブラリ分割

```typescript
// 大きなライブラリを分割
const DatePicker = dynamic(() =>
  import('react-datepicker').then((mod) => mod.default)
)

const Editor = dynamic(() =>
  import('@tiptap/react').then((mod) => mod.EditorContent)
)

const Map = dynamic(() =>
  import('react-map-gl').then((mod) => mod.Map),
  { ssr: false }
)
```

### 機能ベース分割

```typescript
// features/admin/index.tsx
export const AdminDashboard = dynamic(
  () => import('./components/dashboard'),
  { loading: () => <DashboardSkeleton /> }
)

export const AdminSettings = dynamic(
  () => import('./components/settings'),
  { loading: () => <SettingsSkeleton /> }
)

export const AdminUsers = dynamic(
  () => import('./components/users'),
  { loading: () => <UsersSkeleton /> }
)
```

## バンドル分析

### @next/bundle-analyzer

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // 他の設定
})
```

```bash
# バンドル分析を実行
ANALYZE=true npm run build
```

### 分析結果の読み方

```
バンドル分析で確認すべきポイント：
1. 巨大なチャンク（>100KB）を特定
2. 重複インポートを発見
3. 未使用コードを特定
4. サードパーティライブラリのサイズを確認
```

## 最適化パターン

### 条件付きインポート

```typescript
// ❌ 常にインポート
import { heavyFunction } from '@/lib/heavy'

export function Component({ condition }) {
  if (condition) {
    return heavyFunction()
  }
  return null
}

// ✅ 条件付きで動的インポート
export function Component({ condition }) {
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (condition) {
      import('@/lib/heavy').then((mod) => {
        setResult(mod.heavyFunction())
      })
    }
  }, [condition])

  return result
}
```

### Tree Shaking対応

```typescript
// ❌ 全体インポート
import _ from 'lodash'
_.debounce(fn, 300)

// ✅ 個別インポート（Tree Shakingが効く）
import debounce from 'lodash/debounce'
debounce(fn, 300)

// ✅ ESM対応ライブラリを使用
import { debounce } from 'lodash-es'
```

### Barrel Exports の注意点

```typescript
// ❌ Barrel export（Tree Shakingが効きにくい）
// components/index.ts
export { Button } from './button'
export { Input } from './input'
export { Modal } from './modal'
// ...100個のコンポーネント

// 使用側
import { Button } from '@/components' // 全コンポーネントがバンドルされる可能性

// ✅ 直接インポート
import { Button } from '@/components/button'
```

### サードパーティライブラリの最適化

```typescript
// moment.js → date-fns（より軽量）
import { format } from 'date-fns'

// lodash → lodash-es + 個別インポート
import debounce from 'lodash-es/debounce'

// 巨大なライブラリは動的インポート
const heavyLib = await import('heavy-library')
```

## Route Groups による分割

```
app/
├── (marketing)/          # マーケティングページグループ
│   ├── layout.tsx       # 軽量レイアウト
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── (app)/                # アプリケーショングループ
│   ├── layout.tsx       # 機能豊富なレイアウト
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
└── (admin)/              # 管理者グループ
    ├── layout.tsx       # 管理者専用レイアウト
    └── admin/
        └── page.tsx
```

## Parallel Routes による最適化

```typescript
// app/layout.tsx
export default function Layout({
  children,
  modal,
  sidebar,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  sidebar: React.ReactNode
}) {
  return (
    <div>
      <aside>{sidebar}</aside>
      <main>{children}</main>
      {modal}
    </div>
  )
}

// @modal/default.tsx - モーダルがない場合
export default function Default() {
  return null // モーダルコードは読み込まれない
}

// @modal/(..)photo/[id]/page.tsx
// モーダルが開かれた時のみチャンクが読み込まれる
```

## パフォーマンス予算

### 予算の設定

```javascript
// next.config.js
module.exports = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
      ],
    },
  },
}
```

### 予算チェック

```javascript
// scripts/check-bundle-size.js
const fs = require('fs')
const path = require('path')

const BUDGET = {
  'main': 100 * 1024,      // 100KB
  'vendor': 300 * 1024,    // 300KB
  'page': 50 * 1024,       // 50KB per page
}

// ビルド後にチャンクサイズをチェック
```

## Server Components による最適化

### クライアントバンドルの削減

```typescript
// Server Component（バンドルに含まれない）
import { db } from '@/lib/db'

export default async function ProductList() {
  const products = await db.product.findMany() // サーバーで実行

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  )
}

// Client Component（バンドルに含まれる）
'use client'

export function AddToCartButton({ productId }) {
  // インタラクションが必要な部分のみClient Component
  return <button>Add to Cart</button>
}
```

### 境界の最適化

```typescript
// ❌ 大きなClient Component
'use client'

export function ProductPage({ product }) {
  // 全てがクライアントバンドルに含まれる
  return (
    <div>
      <ProductDetails product={product} />
      <Reviews reviews={product.reviews} />
      <AddToCartButton productId={product.id} />
    </div>
  )
}

// ✅ 最小限のClient Component
// ProductDetails と Reviews は Server Component
export default function ProductPage({ product }) {
  return (
    <div>
      <ProductDetails product={product} />
      <Reviews reviews={product.reviews} />
      <AddToCartButton productId={product.id} /> {/* これだけClient */}
    </div>
  )
}
```

## チェックリスト

- [ ] @next/bundle-analyzerでバンドルを分析
- [ ] 100KB以上のチャンクを特定・分割
- [ ] 条件付きコンポーネントをdynamic importで分割
- [ ] Tree Shakingが効くようにインポート
- [ ] Barrel exportsを避ける
- [ ] サードパーティライブラリの軽量版を使用
- [ ] Server Componentsを活用してクライアントバンドルを削減
- [ ] パフォーマンス予算を設定・監視
