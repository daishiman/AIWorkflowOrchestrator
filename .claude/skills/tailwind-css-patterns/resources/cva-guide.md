# Class Variance Authority (CVA) 詳細ガイド

## 概要

CVAは、Tailwind CSSでコンポーネントのバリアントを型安全に管理するためのライブラリです。

---

## 基本使用法

### インストール

```bash
npm install class-variance-authority
```

### 基本構造

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const componentVariants = cva(
  // ベーススタイル（常に適用）
  'base-classes here',
  {
    // バリアント定義
    variants: {
      variant: {
        primary: 'primary-classes',
        secondary: 'secondary-classes',
      },
      size: {
        sm: 'small-classes',
        md: 'medium-classes',
        lg: 'large-classes',
      },
    },
    // 複合バリアント（条件の組み合わせ）
    compoundVariants: [
      {
        variant: 'primary',
        size: 'lg',
        className: 'additional-classes-for-primary-lg',
      },
    ],
    // デフォルト値
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

// 型の抽出
type ComponentVariants = VariantProps<typeof componentVariants>;
```

---

## 実践例

### Button

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // ベース
  [
    'inline-flex items-center justify-center',
    'rounded-md font-medium',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-blue-600 text-white',
          'hover:bg-blue-700',
          'focus-visible:ring-blue-500',
        ],
        secondary: [
          'bg-gray-100 text-gray-900',
          'hover:bg-gray-200',
          'focus-visible:ring-gray-500',
        ],
        outline: [
          'border border-gray-300',
          'bg-transparent',
          'hover:bg-gray-50',
          'focus-visible:ring-gray-500',
        ],
        ghost: [
          'bg-transparent',
          'hover:bg-gray-100',
          'focus-visible:ring-gray-500',
        ],
        destructive: [
          'bg-red-600 text-white',
          'hover:bg-red-700',
          'focus-visible:ring-red-500',
        ],
        link: [
          'text-blue-600 underline-offset-4',
          'hover:underline',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      // アウトラインのdestructive
      {
        variant: 'outline',
        className: 'border-current',
      },
      // iconサイズの時はpaddingをリセット
      {
        size: 'icon',
        className: 'p-0',
      },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Badge

```tsx
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-current text-foreground',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

### Alert

```tsx
const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-500',
        success: 'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-500',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-500',
        destructive: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

---

## 高度なパターン

### 複合バリアント

```tsx
const inputVariants = cva(
  'flex w-full rounded-md border px-3 py-2 text-sm',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-500',
        success: 'border-green-500',
      },
      size: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      hasIcon: {
        left: 'pl-10',
        right: 'pr-10',
        both: 'px-10',
        false: '',
      },
    },
    compoundVariants: [
      // エラー時のリング色
      {
        variant: 'error',
        className: 'focus:ring-red-500',
      },
      // 成功時のリング色
      {
        variant: 'success',
        className: 'focus:ring-green-500',
      },
      // smサイズでアイコンありの場合
      {
        size: 'sm',
        hasIcon: 'left',
        className: 'pl-8',
      },
      {
        size: 'sm',
        hasIcon: 'right',
        className: 'pr-8',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      hasIcon: false,
    },
  }
);
```

### Boolean バリアント

```tsx
const cardVariants = cva('rounded-lg border', {
  variants: {
    // boolean型
    interactive: {
      true: 'cursor-pointer hover:shadow-md transition-shadow',
      false: '',
    },
    elevated: {
      true: 'shadow-lg',
      false: 'shadow-none',
    },
    bordered: {
      true: 'border-gray-200',
      false: 'border-transparent',
    },
  },
  defaultVariants: {
    interactive: false,
    elevated: false,
    bordered: true,
  },
});
```

### Null バリアント

```tsx
const textVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      // nullを許可（クラスを適用しない）
      inherit: null,
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      bold: 'font-bold',
      inherit: null,
    },
  },
  defaultVariants: {
    size: 'md',
    weight: 'normal',
  },
});
```

---

## twMerge との統合

```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cnユーティリティ
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// CVAと組み合わせ
const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  />
);

// これにより外部からクラスを上書き可能
<Button className="bg-purple-500 hover:bg-purple-600">
  カスタムカラー
</Button>
```

---

## TypeScript統合

### 型の抽出と拡張

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva('...', { variants: { /* ... */ } });

// バリアント型の抽出
type ButtonVariants = VariantProps<typeof buttonVariants>;

// コンポーネントProps型
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariants {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// 非null化
type RequiredButtonVariants = Required<ButtonVariants>;
```

### 条件付き型

```tsx
// variantに応じて必須propsを変える
type ButtonProps<V extends ButtonVariant> = V extends 'link'
  ? { href: string; variant: V }
  : { variant?: V };
```

---

## ベストプラクティス

### 1. 配列でクラスを整理

```tsx
// 読みやすさのために配列を使用
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center',
    'rounded-md font-medium',
    'transition-colors',
    'focus-visible:outline-none',
  ],
  { /* variants */ }
);
```

### 2. セマンティックな名前

```tsx
// ❌ 色ベースの名前
variants: {
  color: {
    blue: '...',
    red: '...',
  }
}

// ✅ セマンティックな名前
variants: {
  variant: {
    primary: '...',
    destructive: '...',
  }
}
```

### 3. デフォルトの設定

```tsx
// 必ずデフォルト値を設定
defaultVariants: {
  variant: 'primary',
  size: 'md',
}
```

### 4. コンポーネントとの分離

```tsx
// variants定義は別ファイルで管理も可能
// button.variants.ts
export const buttonVariants = cva('...', { /* ... */ });
export type ButtonVariants = VariantProps<typeof buttonVariants>;

// Button.tsx
import { buttonVariants, type ButtonVariants } from './button.variants';
```

---

## チェックリスト

- [ ] ベーススタイルが適切に定義されているか
- [ ] バリアント名がセマンティックか
- [ ] デフォルト値が設定されているか
- [ ] twMergeと組み合わせてclassNameの上書きを許可しているか
- [ ] TypeScript型が正しくエクスポートされているか
- [ ] 複合バリアントが必要な場合、適切に定義されているか
