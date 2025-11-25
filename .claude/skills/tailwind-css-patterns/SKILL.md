# tailwind-css-patterns

Tailwind CSSを活用した効率的で保守性の高いスタイリングパターンの専門知識

---

## 概要

### 目的
Tailwind CSSのユーティリティファーストアプローチを最大限活用し、
一貫性のある保守しやすいUIスタイリングを実現するパターンを提供する。

### 対象者
- フロントエンドエンジニア
- UIコンポーネント開発者
- デザインシステム実装者

---

## コアパターン

### 1. Class Variance Authority (CVA)

コンポーネントのバリアント管理に最適なパターン。

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const button = cva(
  // ベーススタイル
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
        outline: 'border border-gray-300 bg-transparent hover:bg-gray-100',
        ghost: 'hover:bg-gray-100',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

type ButtonProps = VariantProps<typeof button>;
```

### 2. Tailwind Merge (twMerge)

クラスの競合を解決し、安全にマージ。

```tsx
import { twMerge } from 'tailwind-merge';

// 競合するクラスは後者が優先
twMerge('px-4 py-2', 'px-6');  // → 'py-2 px-6'

// clsxと組み合わせ
import clsx from 'clsx';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 使用例
cn(
  'base-class',
  isActive && 'active-class',
  { 'conditional-class': condition },
  className  // 外部からのクラスで上書き可能
);
```

### 3. Responsive Design

モバイルファーストのレスポンシブパターン。

```tsx
// モバイルファースト（小さい画面から大きい画面へ）
<div className="
  flex flex-col           // モバイル: 縦並び
  md:flex-row             // タブレット以上: 横並び
  lg:gap-8                // デスクトップ: 間隔を広く
">

// ブレークポイント
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
// 2xl: 1536px
```

### 4. Dark Mode

ダークモード対応パターン。

```tsx
// クラスベース（推奨）
<div className="
  bg-white text-gray-900
  dark:bg-gray-900 dark:text-white
">

// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
};

// CSS変数との組み合わせ
<div className="
  bg-[var(--color-background)]
  text-[var(--color-text)]
">
```

---

## 高度なパターン

### 5. 条件付きスタイル

```tsx
// 状態ベースのスタイル
const itemClasses = cn(
  'px-4 py-2 rounded-md transition-colors',
  {
    'bg-blue-500 text-white': isSelected,
    'bg-gray-100 hover:bg-gray-200': !isSelected,
    'opacity-50 cursor-not-allowed': isDisabled,
  }
);

// グループとピアセレクタ
<div className="group">
  <button>Hover me</button>
  <div className="hidden group-hover:block">
    ホバーで表示
  </div>
</div>

<input className="peer" />
<label className="peer-focus:text-blue-500">
  入力フォーカスで色が変わる
</label>
```

### 6. アニメーション

```tsx
// 組み込みアニメーション
<div className="animate-spin">  // 回転
<div className="animate-pulse"> // 点滅
<div className="animate-bounce">// バウンス

// カスタムアニメーション（tailwind.config.js）
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};

// トランジション
<div className="transition-all duration-300 ease-in-out hover:scale-105">
```

### 7. レイアウトパターン

```tsx
// Flexbox
<div className="flex items-center justify-between gap-4">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// コンテナ
<div className="container mx-auto px-4">

// スタック（縦並び）
<div className="flex flex-col space-y-4">

// インラインスタック（横並び）
<div className="flex items-center space-x-2">
```

---

## コンポーネントパターン

### Button

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### Card

```tsx
const Card = ({ className, ...props }) => (
  <div
    className={cn(
      'rounded-lg border bg-card text-card-foreground shadow-sm',
      className
    )}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);
```

### Input

```tsx
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

---

## 設定パターン

### tailwind.config.js

```javascript
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ...
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## リソース

- `resources/cva-guide.md` - CVA詳細ガイド
- `resources/responsive-patterns.md` - レスポンシブデザインパターン
- `resources/dark-mode-guide.md` - ダークモード実装ガイド
- `templates/tailwind-config-template.js` - 設定ファイルテンプレート
- `templates/component-variants-template.tsx` - コンポーネントバリアントテンプレート

---

## 関連スキル

- `design-system-architecture` - デザイントークンとの統合
- `component-composition-patterns` - コンポーネント設計
- `accessibility-wcag` - アクセシブルなスタイリング

---

## バージョン情報

- 作成日: 2025-01-13
- 最終更新: 2025-01-13
- バージョン: 1.0.0
