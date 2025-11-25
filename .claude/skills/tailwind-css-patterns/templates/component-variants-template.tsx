/**
 * コンポーネントバリアント テンプレート
 *
 * 使用方法:
 * 1. {{ComponentName}} を実際のコンポーネント名に置換
 * 2. バリアント定義をカスタマイズ
 * 3. Propsインターフェースを拡張
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';

// =============================================================================
// ユーティリティ関数
// =============================================================================

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// バリアント定義
// =============================================================================

const {{componentName}}Variants = cva(
  // ベーススタイル
  [
    'inline-flex items-center justify-center',
    'rounded-md font-medium',
    'transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      // バリアント
      variant: {
        default: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground',
          'hover:bg-secondary/80',
        ],
        outline: [
          'border border-input bg-background',
          'hover:bg-accent hover:text-accent-foreground',
        ],
        ghost: [
          'hover:bg-accent hover:text-accent-foreground',
        ],
        link: [
          'text-primary underline-offset-4',
          'hover:underline',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
        ],
      },
      // サイズ
      size: {
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      // フルワイド
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    // 複合バリアント
    compoundVariants: [
      // linkバリアントの時はサイズによるパディングを無効化
      {
        variant: 'link',
        className: 'h-auto p-0',
      },
      // iconサイズの時はパディングを無効化
      {
        size: 'icon',
        className: 'p-0',
      },
    ],
    // デフォルト値
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

// =============================================================================
// 型定義
// =============================================================================

type {{ComponentName}}VariantProps = VariantProps<typeof {{componentName}}Variants>;

interface {{ComponentName}}Props
  extends ComponentPropsWithoutRef<'button'>,
    {{ComponentName}}VariantProps {
  /** ローディング状態 */
  isLoading?: boolean;
  /** 左側アイコン */
  leftIcon?: React.ReactNode;
  /** 右側アイコン */
  rightIcon?: React.ReactNode;
}

// =============================================================================
// コンポーネント
// =============================================================================

const {{ComponentName}} = forwardRef<ElementRef<'button'>, {{ComponentName}}Props>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          {{componentName}}Variants({ variant, size, fullWidth }),
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

{{ComponentName}}.displayName = '{{ComponentName}}';

// =============================================================================
// スピナーコンポーネント
// =============================================================================

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =============================================================================
// エクスポート
// =============================================================================

export { {{ComponentName}}, {{componentName}}Variants };
export type { {{ComponentName}}Props, {{ComponentName}}VariantProps };

// =============================================================================
// 使用例
// =============================================================================

/*
import { {{ComponentName}} } from './{{ComponentName}}';

// 基本使用
<{{ComponentName}}>クリック</{{ComponentName}}>

// バリアント
<{{ComponentName}} variant="secondary">Secondary</{{ComponentName}}>
<{{ComponentName}} variant="outline">Outline</{{ComponentName}}>
<{{ComponentName}} variant="ghost">Ghost</{{ComponentName}}>
<{{ComponentName}} variant="link">Link</{{ComponentName}}>
<{{ComponentName}} variant="destructive">Delete</{{ComponentName}}>

// サイズ
<{{ComponentName}} size="sm">Small</{{ComponentName}}>
<{{ComponentName}} size="default">Default</{{ComponentName}}>
<{{ComponentName}} size="lg">Large</{{ComponentName}}>
<{{ComponentName}} size="icon"><IconComponent /></{{ComponentName}}>

// フルワイド
<{{ComponentName}} fullWidth>Full Width</{{ComponentName}}>

// ローディング
<{{ComponentName}} isLoading>送信中</{{ComponentName}}>

// アイコン付き
<{{ComponentName}} leftIcon={<PlusIcon />}>追加</{{ComponentName}}>
<{{ComponentName}} rightIcon={<ArrowRightIcon />}>次へ</{{ComponentName}}>

// カスタムクラス（twMergeで安全にマージ）
<{{ComponentName}} className="bg-purple-500 hover:bg-purple-600">
  カスタムカラー
</{{ComponentName}}>
*/

// =============================================================================
// バリアントのみエクスポートして外部で使用
// =============================================================================

/*
// 別のコンポーネントでバリアントを再利用
import { {{componentName}}Variants } from './{{ComponentName}}';

function CustomButton({ className, variant, size, ...props }) {
  return (
    <button
      className={cn({{componentName}}Variants({ variant, size }), className)}
      {...props}
    />
  );
}

// リンクコンポーネントとして使用
import Link from 'next/link';

function LinkButton({ href, variant, size, className, children }) {
  return (
    <Link
      href={href}
      className={cn({{componentName}}Variants({ variant, size }), className)}
    >
      {children}
    </Link>
  );
}
*/
