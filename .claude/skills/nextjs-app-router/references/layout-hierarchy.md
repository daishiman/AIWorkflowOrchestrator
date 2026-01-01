# Layout階層設計

## Layout vs Template

| 特性           | Layout                 | Template                     |
| -------------- | ---------------------- | ---------------------------- |
| 再レンダリング | ナビゲーション時に維持 | ナビゲーション毎に再マウント |
| 状態保持       | 維持される             | リセットされる               |
| Effect         | 再実行されない         | ナビゲーション毎に実行       |
| 主な用途       | 共有UI、重い初期化     | ページ遷移アニメーション     |

## Layout階層構造

```
app/
├── layout.tsx           # Root Layout（必須）
│   ├── (marketing)/
│   │   ├── layout.tsx   # マーケティング用Layout
│   │   └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx   # ダッシュボード用Layout
│   │   └── settings/
│   │       ├── layout.tsx  # 設定用Layout
│   │       └── page.tsx
```

**レンダリング順序**:

```
Root Layout
└── Group Layout
    └── Nested Layout
        └── Page
```

## Root Layout

### 必須要件

```typescript
// app/layout.tsx
import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App',  // 子ページで上書き時のテンプレート
  },
  description: 'My application description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### Root Layoutの責務

- **必須**: `<html>` と `<body>` タグ
- グローバルCSS
- フォント設定（next/font）
- サイト全体のメタデータ
- グローバルプロバイダー（Theme、Auth等）

### Root Layoutに含めないもの

- ページ固有のナビゲーション
- 認証状態に依存するUI
- 特定のRoute Groupのみで使うUI

## Group Layout

### 認証境界の実装

```typescript
// app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex">
      <Sidebar user={session.user} />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### 共有UIの実装

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

## 並列ルートでのLayout

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-4">
      <main className="col-span-8">{children}</main>
      <aside className="col-span-4 space-y-4">
        {analytics}
        {team}
      </aside>
    </div>
  )
}
```

## Template（特殊ケース）

### ページ遷移アニメーション

```typescript
// app/template.tsx
'use client'
import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}
```

### フィードバックフォームのリセット

```typescript
// app/feedback/template.tsx
// ナビゲーション毎にフォーム状態をリセット
export default function FeedbackTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <div key={Date.now()}>{children}</div>
}
```

## 設計判断フロー

```
このUIは...
├─ 全ページで共通？
│  └─ Yes → Root Layout
├─ 複数ページで共有？
│  ├─ 認証状態で分離が必要？
│  │  └─ Yes → Route Group Layout（(public)、(protected)等）
│  └─ 特定機能グループで共有？
│     └─ Yes → Group Layout
├─ ナビゲーション時に状態リセットが必要？
│  └─ Yes → Template
└─ ページ固有？
   └─ Yes → Page内で実装
```

## パフォーマンス考慮

### Layoutの最適化

```typescript
// ✅ 重い初期化はLayoutで（1回のみ実行）
export default async function Layout({ children }: { children: React.ReactNode }) {
  const config = await fetchAppConfig() // ナビゲーション時は再実行されない
  return (
    <ConfigProvider config={config}>
      {children}
    </ConfigProvider>
  )
}

// ❌ 重い処理をPageで（毎回実行）
export default async function Page() {
  const config = await fetchAppConfig() // ナビゲーション毎に実行
  // ...
}
```

### データフェッチの重複排除

```typescript
// LayoutとPageで同じデータをフェッチしても自動的に重複排除される
// app/(dashboard)/layout.tsx
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getUser() // この結果はキャッシュされる
  return <UserNav user={user}>{children}</UserNav>
}

// app/(dashboard)/settings/page.tsx
export default async function SettingsPage() {
  const user = await getUser() // キャッシュからデータを取得（重複リクエストなし）
  return <SettingsForm user={user} />
}
```

## チェックリスト

### Root Layout

- [ ] `<html>` と `<body>` タグが含まれている
- [ ] グローバルCSSがインポートされている
- [ ] next/fontでフォントが設定されている
- [ ] 基本メタデータが設定されている
- [ ] グローバルプロバイダーが配置されている

### Group Layout

- [ ] 認証境界が適切に実装されている
- [ ] 共有UIが正しく配置されている
- [ ] Route Groupの命名が論理的
- [ ] 必要なメタデータが上書きされている

### 全般

- [ ] Layoutの再レンダリング特性を理解している
- [ ] Template と Layout の使い分けが適切
- [ ] 重い処理がLayoutに配置されている
- [ ] 並列ルートが適切に受け取られている
