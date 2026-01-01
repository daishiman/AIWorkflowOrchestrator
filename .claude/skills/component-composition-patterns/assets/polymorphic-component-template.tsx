/**
 * Polymorphic Component テンプレート
 *
 * 使用方法:
 * 1. {{ComponentName}} を実際のコンポーネント名に置換
 * 2. OwnPropsにコンポーネント固有のpropsを追加
 * 3. デフォルト要素タイプを適切に設定
 */

import {
  ElementType,
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  forwardRef,
  ForwardedRef,
  ReactNode,
} from 'react';

// =============================================================================
// 型定義
// =============================================================================

/**
 * コンポーネント固有のprops
 * ここにカスタムpropsを追加
 */
interface {{ComponentName}}OwnProps {
  /** バリアント */
  variant?: 'default' | 'primary' | 'secondary';
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** 子要素 */
  children?: ReactNode;
}

/**
 * Polymorphic props型（refなし）
 */
type {{ComponentName}}Props<T extends ElementType = 'div'> = {{ComponentName}}OwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof {{ComponentName}}OwnProps | 'as'> & {
    as?: T;
  };

/**
 * Polymorphic props型（refあり）
 */
type {{ComponentName}}PropsWithRef<T extends ElementType = 'div'> = {{ComponentName}}OwnProps &
  Omit<ComponentPropsWithRef<T>, keyof {{ComponentName}}OwnProps | 'as'> & {
    as?: T;
    ref?: ForwardedRef<ComponentPropsWithRef<T>['ref']>;
  };

// =============================================================================
// コンポーネント実装（refなし版）
// =============================================================================

function {{ComponentName}}Simple<T extends ElementType = 'div'>({
  as,
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: {{ComponentName}}Props<T>) {
  const Component = as || 'div';

  const classes = [
    '{{componentName}}',
    `{{componentName}}--${variant}`,
    `{{componentName}}--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

// =============================================================================
// コンポーネント実装（forwardRef版）
// =============================================================================

/**
 * forwardRef対応のPolymorphic Component
 *
 * 注意: TypeScriptの制限により、forwardRefとジェネリクスの組み合わせは
 * 完全な型推論が難しいため、型アサーションを使用
 */
const {{ComponentName}}WithRef = forwardRef(function {{ComponentName}}<
  T extends ElementType = 'div'
>(
  {
    as,
    variant = 'default',
    size = 'md',
    className,
    children,
    ...props
  }: {{ComponentName}}Props<T>,
  ref: ForwardedRef<Element>
) {
  const Component = (as || 'div') as ElementType;

  const classes = [
    '{{componentName}}',
    `{{componentName}}--${variant}`,
    `{{componentName}}--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component ref={ref} className={classes} {...props}>
      {children}
    </Component>
  );
}) as <T extends ElementType = 'div'>(
  props: {{ComponentName}}PropsWithRef<T>
) => JSX.Element | null;

// =============================================================================
// Export
// =============================================================================

// refが不要な場合はこちらを使用
export { {{ComponentName}}Simple as {{ComponentName}} };

// refが必要な場合はこちらを使用
export { {{ComponentName}}WithRef as {{ComponentName}}Ref };

export type { {{ComponentName}}Props, {{ComponentName}}PropsWithRef };

// =============================================================================
// 使用例
// =============================================================================

/*
import { {{ComponentName}}, {{ComponentName}}Ref } from './{{ComponentName}}';

// 基本使用
<{{ComponentName}}>デフォルトはdiv</{{ComponentName}}>

// as propで要素変更
<{{ComponentName}} as="section">セクション要素</{{ComponentName}}>
<{{ComponentName}} as="article">記事要素</{{ComponentName}}>

// バリアントとサイズ
<{{ComponentName}} variant="primary" size="lg">
  大きなプライマリ
</{{ComponentName}}>

// リンクとして使用（hrefが型推論される）
<{{ComponentName}} as="a" href="/home">
  ホームへ
</{{ComponentName}}>

// カスタムコンポーネントと組み合わせ
import { Link } from 'react-router-dom';
<{{ComponentName}} as={Link} to="/about">
  Aboutへ
</{{ComponentName}}>

// refの使用
const ref = useRef<HTMLButtonElement>(null);
<{{ComponentName}}Ref as="button" ref={ref} onClick={handleClick}>
  ボタン
</{{ComponentName}}Ref>
*/

// =============================================================================
// 高度なパターン: 要素タイプ制限
// =============================================================================

/*
// 特定の要素タイプのみ許可する場合

type AllowedElements = 'button' | 'a' | typeof Link;

interface RestrictedButtonOwnProps {
  variant?: 'primary' | 'secondary';
}

type RestrictedButtonProps<T extends AllowedElements = 'button'> =
  RestrictedButtonOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof RestrictedButtonOwnProps | 'as'> & {
    as?: T;
  };

function RestrictedButton<T extends AllowedElements = 'button'>({
  as,
  variant = 'primary',
  ...props
}: RestrictedButtonProps<T>) {
  const Component = (as || 'button') as ElementType;
  return <Component className={`btn btn--${variant}`} {...props} />;
}
*/

// =============================================================================
// 高度なパターン: 条件付きProps
// =============================================================================

/*
// asの値に応じて必須propsを変える場合

type ConditionalProps<T extends ElementType> = T extends 'a'
  ? { href: string }
  : T extends 'button'
  ? { type?: 'button' | 'submit' | 'reset' }
  : {};

interface SmartButtonOwnProps<T extends ElementType = 'button'> {
  as?: T;
  variant?: 'primary' | 'secondary';
}

type SmartButtonProps<T extends ElementType = 'button'> =
  SmartButtonOwnProps<T> &
  ConditionalProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof SmartButtonOwnProps<T>>;

// 使用時:
// <SmartButton>ボタン</SmartButton>           // OK
// <SmartButton as="a" href="/home">リンク</SmartButton>  // OK
// <SmartButton as="a">エラー</SmartButton>    // TypeScriptエラー: hrefが必要
*/
