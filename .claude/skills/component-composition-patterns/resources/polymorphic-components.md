# Polymorphic Components 実装ガイド

## 概要

Polymorphic Componentsは、`as` propを使用してレンダリングする要素タイプを
動的に変更できるコンポーネントパターンです。
セマンティックHTMLとアクセシビリティを維持しながら、スタイルの再利用を可能にします。

---

## 基本実装

### シンプルなPolymorphic Component

```tsx
import {
  ElementType,
  ComponentPropsWithoutRef,
  ReactNode,
  forwardRef,
} from 'react';

interface BoxOwnProps<T extends ElementType = 'div'> {
  as?: T;
  children?: ReactNode;
}

type BoxProps<T extends ElementType = 'div'> = BoxOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof BoxOwnProps<T>>;

function Box<T extends ElementType = 'div'>({
  as,
  children,
  ...props
}: BoxProps<T>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// 使用例
<Box>デフォルトはdiv</Box>
<Box as="section">セクション要素</Box>
<Box as="article">記事要素</Box>
<Box as="span" className="inline">インライン要素</Box>
```

### forwardRefとの組み合わせ

```tsx
import {
  ElementType,
  ComponentPropsWithRef,
  forwardRef,
  ForwardedRef,
} from 'react';

interface PolymorphicRef<T extends ElementType> {
  ref?: ForwardedRef<ComponentPropsWithRef<T>['ref']>;
}

type PolymorphicComponentProps<
  T extends ElementType,
  Props = {}
> = Props &
  Omit<ComponentPropsWithRef<T>, keyof Props | 'as'> &
  PolymorphicRef<T> & {
    as?: T;
  };

// Buttonコンポーネント例
interface ButtonOwnProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

type ButtonProps<T extends ElementType = 'button'> = PolymorphicComponentProps<
  T,
  ButtonOwnProps
>;

const Button = forwardRef(function Button<T extends ElementType = 'button'>(
  { as, variant = 'primary', size = 'md', isLoading, children, ...props }: ButtonProps<T>,
  ref: ForwardedRef<Element>
) {
  const Component = as || 'button';

  return (
    <Component
      ref={ref}
      className={`btn btn--${variant} btn--${size}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : children}
    </Component>
  );
});

// 使用例
<Button>通常のボタン</Button>
<Button as="a" href="/home">リンクボタン</Button>
<Button as={Link} to="/about">React Routerリンク</Button>
```

---

## 高度な型安全性

### 要素タイプの制限

```tsx
// 特定の要素タイプのみ許可
type AllowedElements = 'button' | 'a' | typeof Link;

interface RestrictedButtonProps<T extends AllowedElements = 'button'> {
  as?: T;
  children: ReactNode;
}

type RestrictedButtonFullProps<T extends AllowedElements = 'button'> =
  RestrictedButtonProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof RestrictedButtonProps<T>>;

function RestrictedButton<T extends AllowedElements = 'button'>({
  as,
  children,
  ...props
}: RestrictedButtonFullProps<T>) {
  const Component = (as || 'button') as ElementType;
  return <Component {...props}>{children}</Component>;
}

// OK
<RestrictedButton>ボタン</RestrictedButton>
<RestrictedButton as="a" href="#">リンク</RestrictedButton>

// TypeScriptエラー
<RestrictedButton as="div">エラー</RestrictedButton>
```

### 条件付きProps

```tsx
// asがaの時はhrefが必須
type ConditionalProps<T extends ElementType> = T extends 'a'
  ? { href: string }
  : {};

interface SmartButtonOwnProps<T extends ElementType = 'button'> {
  as?: T;
  variant?: 'primary' | 'secondary';
}

type SmartButtonProps<T extends ElementType = 'button'> =
  SmartButtonOwnProps<T> &
  ConditionalProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SmartButtonOwnProps<T>>;

function SmartButton<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  ...props
}: SmartButtonProps<T>) {
  const Component = as || 'button';
  return <Component className={`btn btn--${variant}`} {...props} />;
}

// OK
<SmartButton>ボタン</SmartButton>
<SmartButton as="a" href="/home">リンク</SmartButton>

// TypeScriptエラー: hrefが必要
<SmartButton as="a">エラー</SmartButton>
```

---

## 実践的なコンポーネント例

### Headingコンポーネント

```tsx
type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps extends ComponentPropsWithoutRef<'h1'> {
  as?: HeadingLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

function Heading({
  as = 'h2',
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = as;
  // サイズが指定されない場合、見出しレベルからデフォルトサイズを決定
  const defaultSizes: Record<HeadingLevel, string> = {
    h1: '2xl',
    h2: 'xl',
    h3: 'lg',
    h4: 'md',
    h5: 'sm',
    h6: 'xs',
  };
  const computedSize = size || defaultSizes[as];

  return (
    <Component
      className={`heading heading--${computedSize} ${className || ''}`}
      {...props}
    >
      {children}
    </Component>
  );
}

// 使用例
<Heading as="h1">ページタイトル</Heading>
<Heading as="h2" size="lg">大きなh2</Heading>
<Heading as="h3" size="sm">小さなh3</Heading>
```

### Textコンポーネント

```tsx
type TextElement = 'p' | 'span' | 'div' | 'label' | 'strong' | 'em';

interface TextOwnProps<T extends TextElement = 'span'> {
  as?: T;
  variant?: 'body' | 'caption' | 'label' | 'helper';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'error';
}

type TextProps<T extends TextElement = 'span'> = TextOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof TextOwnProps<T>>;

function Text<T extends TextElement = 'span'>({
  as,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  className,
  children,
  ...props
}: TextProps<T>) {
  const Component = (as || 'span') as ElementType;

  return (
    <Component
      className={`
        text
        text--${variant}
        text--${weight}
        text--${color}
        ${className || ''}
      `.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

// 使用例
<Text>インラインテキスト</Text>
<Text as="p" variant="body">段落テキスト</Text>
<Text as="label" variant="label" htmlFor="email">ラベル</Text>
<Text as="span" color="error">エラーメッセージ</Text>
```

---

## ユーティリティ型

### 再利用可能な型定義

```tsx
// polymorphic-types.ts

import {
  ElementType,
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ForwardedRef,
} from 'react';

/**
 * Polymorphic component の基本props型
 */
export type PolymorphicProps<
  T extends ElementType,
  OwnProps = {}
> = OwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | 'as'> & {
    as?: T;
  };

/**
 * forwardRef対応のPolymorphic props型
 */
export type PolymorphicPropsWithRef<
  T extends ElementType,
  OwnProps = {}
> = OwnProps &
  Omit<ComponentPropsWithRef<T>, keyof OwnProps | 'as'> & {
    as?: T;
    ref?: ForwardedRef<ComponentPropsWithRef<T>['ref']>;
  };

/**
 * Polymorphic componentのRef型
 */
export type PolymorphicRef<T extends ElementType> = ForwardedRef<
  ComponentPropsWithRef<T>['ref']
>;
```

---

## ベストプラクティス

### 1. デフォルト要素の選択

```tsx
// セマンティックに適切なデフォルトを選択
function Card<T extends ElementType = 'article'>({ as, ...props }: CardProps<T>) {
  // カードコンテンツにはarticleが適切
}

function Button<T extends ElementType = 'button'>({ as, ...props }: ButtonProps<T>) {
  // インタラクティブ要素にはbuttonが適切
}

function Text<T extends ElementType = 'span'>({ as, ...props }: TextProps<T>) {
  // インラインテキストにはspanが適切
}
```

### 2. アクセシビリティの維持

```tsx
function Button<T extends ElementType = 'button'>({
  as,
  disabled,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';

  // aタグの場合、disabledの代わりにaria-disabledを使用
  const disabledProps = Component === 'a'
    ? { 'aria-disabled': disabled, tabIndex: disabled ? -1 : undefined }
    : { disabled };

  return <Component {...disabledProps} {...props} />;
}
```

### 3. スタイルの一貫性

```tsx
// as propが変わってもスタイルが一貫するようにする
const buttonStyles = cva('btn', {
  variants: {
    variant: {
      primary: 'btn--primary',
      secondary: 'btn--secondary',
    },
  },
});

function Button<T extends ElementType = 'button'>({
  as,
  variant,
  className,
  ...props
}: ButtonProps<T>) {
  const Component = as || 'button';
  return (
    <Component
      className={buttonStyles({ variant, className })}
      {...props}
    />
  );
}
```

---

## チェックリスト

- [ ] デフォルト要素がセマンティックに適切か
- [ ] 型定義が完全で、as propに応じた正しいpropsが推論されるか
- [ ] forwardRefが必要な場合、正しく実装されているか
- [ ] アクセシビリティ属性が要素タイプに応じて適切に処理されているか
- [ ] スタイルが要素タイプに関係なく一貫しているか
