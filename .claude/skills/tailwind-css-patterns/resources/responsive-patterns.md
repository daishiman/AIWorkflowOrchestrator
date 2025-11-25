# レスポンシブデザインパターン

## 概要

Tailwind CSSのモバイルファーストアプローチを活用した
レスポンシブデザインパターンを解説します。

---

## ブレークポイント

### デフォルトブレークポイント

| プレフィックス | 最小幅 | CSS |
|---------------|--------|-----|
| `sm` | 640px | `@media (min-width: 640px)` |
| `md` | 768px | `@media (min-width: 768px)` |
| `lg` | 1024px | `@media (min-width: 1024px)` |
| `xl` | 1280px | `@media (min-width: 1280px)` |
| `2xl` | 1536px | `@media (min-width: 1536px)` |

### カスタムブレークポイント

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // 最大幅（max-width）
      'max-md': { max: '767px' },
      // 範囲指定
      'tablet': { min: '640px', max: '1023px' },
    },
  },
};
```

---

## レイアウトパターン

### 1. カラムレイアウト

```tsx
// 1列 → 2列 → 3列
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card />
  <Card />
  <Card />
</div>

// 1列 → 2列（サイドバー付き）
<div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
  <aside>サイドバー</aside>
  <main>メインコンテンツ</main>
</div>

// 自動フィット
<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### 2. スタック切り替え

```tsx
// 縦→横
<div className="flex flex-col md:flex-row gap-4">
  <div className="flex-1">左</div>
  <div className="flex-1">右</div>
</div>

// 横→縦（逆方向）
<div className="flex flex-row md:flex-col gap-4">
  <div>上（モバイルでは左）</div>
  <div>下（モバイルでは右）</div>
</div>
```

### 3. コンテナ

```tsx
// 中央寄せ + パディング
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* コンテンツ */}
</div>

// 最大幅制限
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* コンテンツ */}
</div>

// フル幅 → コンテナ
<div className="w-full lg:container lg:mx-auto">
  {/* コンテンツ */}
</div>
```

---

## コンポーネントパターン

### 1. ナビゲーション

```tsx
// モバイル: ハンバーガー、デスクトップ: 水平メニュー
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative">
      {/* モバイルメニューボタン */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>

      {/* メニュー */}
      <ul className={cn(
        // モバイル: 縦並び、隠し
        'absolute left-0 top-full w-full flex-col bg-white shadow-lg',
        'md:static md:flex md:flex-row md:shadow-none md:bg-transparent',
        isOpen ? 'flex' : 'hidden md:flex'
      )}>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  );
}
```

### 2. カード

```tsx
// 縦→横レイアウト
<div className="flex flex-col sm:flex-row overflow-hidden rounded-lg border">
  <img
    src={image}
    className="w-full sm:w-48 h-48 object-cover"
    alt=""
  />
  <div className="p-4 flex-1">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-gray-600 mt-2">{description}</p>
  </div>
</div>
```

### 3. ヒーローセクション

```tsx
<section className="
  py-12 md:py-20 lg:py-32
  px-4 sm:px-6 lg:px-8
  text-center lg:text-left
">
  <div className="
    max-w-7xl mx-auto
    grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16
    items-center
  ">
    <div>
      <h1 className="
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl
        font-bold tracking-tight
      ">
        見出しテキスト
      </h1>
      <p className="mt-4 text-lg sm:text-xl text-gray-600">
        説明文
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Button size="lg">主ボタン</Button>
        <Button size="lg" variant="outline">副ボタン</Button>
      </div>
    </div>
    <div className="order-first lg:order-last">
      <img src={heroImage} alt="" className="w-full" />
    </div>
  </div>
</section>
```

### 4. フォームレイアウト

```tsx
<form className="space-y-6">
  {/* フィールドグループ */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label>姓</label>
      <input className="w-full" />
    </div>
    <div>
      <label>名</label>
      <input className="w-full" />
    </div>
  </div>

  {/* フル幅フィールド */}
  <div>
    <label>メールアドレス</label>
    <input className="w-full" />
  </div>

  {/* ボタングループ */}
  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
    <Button variant="outline">キャンセル</Button>
    <Button>送信</Button>
  </div>
</form>
```

---

## テキスト・タイポグラフィ

### レスポンシブフォントサイズ

```tsx
// 見出し
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">

// 本文
<p className="text-sm sm:text-base lg:text-lg">

// clampを使用（CSS）
.heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

### 行数制限

```tsx
// 1行で省略
<p className="truncate">長いテキスト...</p>

// 複数行で省略
<p className="line-clamp-2 sm:line-clamp-3">
  複数行のテキスト...
</p>
```

---

## 表示/非表示

### 条件付き表示

```tsx
// モバイルのみ
<div className="block md:hidden">モバイル表示</div>

// デスクトップのみ
<div className="hidden md:block">デスクトップ表示</div>

// タブレット以上
<div className="hidden sm:block">タブレット以上</div>

// 特定の範囲のみ
<div className="hidden md:block lg:hidden">タブレットのみ</div>
```

---

## スペーシング

### レスポンシブ間隔

```tsx
// パディング
<div className="p-4 sm:p-6 lg:p-8">

// マージン
<div className="my-8 sm:my-12 lg:my-16">

// ギャップ
<div className="flex gap-2 sm:gap-4 lg:gap-6">
```

---

## 実践的なレイアウト

### ダッシュボードレイアウト

```tsx
function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="flex h-14 items-center px-4 lg:px-6">
          {/* ロゴ、ナビゲーション */}
        </div>
      </header>

      <div className="flex">
        {/* サイドバー - モバイルでは非表示 */}
        <aside className="hidden lg:block w-64 border-r min-h-[calc(100vh-3.5rem)]">
          <nav className="p-4">
            {/* ナビゲーションリンク */}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### ブログレイアウト

```tsx
function BlogLayout({ children, sidebar }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <main>{children}</main>
        <aside className="order-first lg:order-last">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
```

---

## ベストプラクティス

### 1. モバイルファースト

```tsx
// ✅ Good: モバイルファースト
<div className="text-sm md:text-base lg:text-lg">

// ❌ Bad: デスクトップファースト（避ける）
<div className="text-lg md:text-base sm:text-sm">
```

### 2. 意味のあるブレークポイント

```tsx
// ✅ Good: コンテンツに基づいて決定
<div className="grid grid-cols-1 md:grid-cols-2">
  {/* カードが2列で収まるサイズで切り替え */}
</div>

// ❌ Bad: デバイスに基づいて決定
// 「iPhoneでは〜」という考え方は避ける
```

### 3. 過度なブレークポイントを避ける

```tsx
// ❌ Too many breakpoints
<div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">

// ✅ 必要な分だけ
<div className="text-sm md:text-base lg:text-lg">
```

---

## チェックリスト

- [ ] モバイルファーストで実装しているか
- [ ] 必要最小限のブレークポイントか
- [ ] コンテンツがすべてのサイズで読みやすいか
- [ ] タッチターゲットが適切なサイズか（44px以上）
- [ ] 横スクロールが発生していないか
- [ ] 画像がレスポンシブか
