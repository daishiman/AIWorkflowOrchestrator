# フォント最適化

## 概要

next/fontは自動的なフォント最適化を提供します。
セルフホスティング、サブセット化、プリロードを自動化し、
CLSを防止してパフォーマンスを向上させます。

## Google Fonts

### 基本的な使い方

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 日本語フォント

```typescript
import { Noto_Sans_JP } from "next/font/google";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false, // 大きなフォントはpreloadを無効化
});
```

### 複数フォントの使用

```typescript
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

### Tailwind CSSとの統合

```typescript
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
};
```

## ローカルフォント

### 基本的な使い方

```typescript
import localFont from "next/font/local";

const myFont = localFont({
  src: "./fonts/MyFont.woff2",
  display: "swap",
});

// または複数のウェイト
const myFont = localFont({
  src: [
    {
      path: "./fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/MyFont-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  display: "swap",
});
```

### Variable Font

```typescript
import localFont from "next/font/local";

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  display: "swap",
  variable: "--font-inter",
});
```

## display オプション

### swap（推奨）

```typescript
const font = Font({
  subsets: ["latin"],
  display: "swap", // フォールバックフォントを即座に表示、読み込み後スワップ
});
```

### optional

```typescript
const font = Font({
  subsets: ["latin"],
  display: "optional", // フォントがすぐに利用可能な場合のみ使用
});
```

### 各オプションの比較

| display  | FOUT | FOIT | LCP影響 | 推奨用途         |
| -------- | ---- | ---- | ------- | ---------------- |
| swap     | あり | なし | 低      | 本文テキスト     |
| optional | なし | なし | 最低    | アイコンフォント |
| block    | なし | あり | 高      | 非推奨           |
| fallback | 短   | 短   | 中      | バランス重視     |

## サブセット

### 言語別サブセット

```typescript
// 英語サイト
const inter = Inter({
  subsets: ["latin"],
});

// 日本語サイト
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"], // 日本語は自動的に含まれる
});

// 多言語サイト
const notoSans = Noto_Sans({
  subsets: ["latin", "latin-ext", "cyrillic"],
});
```

### カスタム文字セット

```typescript
const font = localFont({
  src: "./fonts/CustomFont.woff2",
  // 特定の文字のみを含める
  unicodeRange: "U+0000-00FF, U+0131, U+0152-0153",
});
```

## 高度な設定

### adjustFontFallback

```typescript
const inter = Inter({
  subsets: ["latin"],
  adjustFontFallback: true, // フォールバックフォントのサイズを自動調整
});
```

### preload制御

```typescript
// 大きなフォントはpreloadを無効化してLCPを改善
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
  preload: false, // 遅延読み込み
});
```

### weight と style

```typescript
// 特定のウェイトのみ
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // 必要なウェイトのみ
});

// Variable font（推奨）
const inter = Inter({
  subsets: ["latin"],
  // weightを指定しない = variable fontとして全ウェイト利用可能
});
```

## パターン

### ヘッディング用フォント

```typescript
// components/heading.tsx
import { Playfair_Display } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
})

export function Heading({ children }) {
  return <h1 className={playfair.className}>{children}</h1>
}
```

### コード用フォント

```typescript
// components/code-block.tsx
import { Fira_Code } from 'next/font/google'

const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
})

export function CodeBlock({ children }) {
  return <pre className={firaCode.className}>{children}</pre>
}
```

### アイコンフォント（非推奨）

```typescript
// ⚠️ アイコンフォントよりSVGアイコンを推奨

// もし使用する場合
import localFont from "next/font/local";

const iconFont = localFont({
  src: "./fonts/icons.woff2",
  display: "optional", // アイコンは遅延しても問題ない
});
```

## パフォーマンス考慮事項

### フォントファイルサイズ

```typescript
// ❌ 全ウェイトを読み込む
const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

// ✅ 必要なウェイトのみ
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600"], // 実際に使用するウェイトのみ
});
```

### 日本語フォントの最適化

```typescript
// 日本語フォントは大きいため特別な配慮が必要
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"], // 最小限のウェイト
  display: "swap",
  preload: false, // プリロードを無効化
});
```

### システムフォントスタックとの併用

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Variable fontをシステムフォントと組み合わせ
        sans: [
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
};
```

## CLS防止

### サイズ調整

```css
/* フォールバックフォントのサイズを調整 */
@font-face {
  font-family: "Adjusted Arial";
  src: local("Arial");
  size-adjust: 100.06%;
  ascent-override: 95%;
  descent-override: 22%;
  line-gap-override: 0%;
}
```

### next/fontの自動調整

```typescript
// adjustFontFallbackがデフォルトで有効
const inter = Inter({
  subsets: ["latin"],
  adjustFontFallback: true, // CLSを最小化
});
```

## チェックリスト

- [ ] 必要なウェイトのみを読み込んでいる
- [ ] display: 'swap'を設定している
- [ ] 日本語フォントはpreload: falseを検討
- [ ] variable fontを可能な限り使用
- [ ] Tailwind CSSとの統合が正しい
- [ ] adjustFontFallbackが有効
- [ ] システムフォントをフォールバックに含めている
