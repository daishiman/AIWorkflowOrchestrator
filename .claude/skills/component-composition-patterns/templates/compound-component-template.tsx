/**
 * Compound Component テンプレート
 *
 * 使用方法:
 * 1. {{ComponentName}} を実際のコンポーネント名に置換
 * 2. 必要なサブコンポーネントを追加/削除
 * 3. 状態管理ロジックをカスタマイズ
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
  ComponentPropsWithoutRef,
} from 'react';

// =============================================================================
// 型定義
// =============================================================================

interface {{ComponentName}}ContextType {
  // 状態
  activeItem: string | null;
  // 操作
  setActiveItem: (item: string | null) => void;
  toggleItem: (item: string) => void;
}

interface {{ComponentName}}Props extends ComponentPropsWithoutRef<'div'> {
  /** 初期選択アイテム */
  defaultValue?: string;
  /** 選択変更時のコールバック */
  onValueChange?: (value: string | null) => void;
  children: ReactNode;
}

interface {{ComponentName}}ItemProps extends ComponentPropsWithoutRef<'div'> {
  /** アイテムの識別子 */
  value: string;
  /** 無効状態 */
  disabled?: boolean;
  children: ReactNode;
}

interface {{ComponentName}}TriggerProps extends ComponentPropsWithoutRef<'button'> {
  /** 対象アイテムの識別子 */
  value: string;
  children: ReactNode;
}

interface {{ComponentName}}ContentProps extends ComponentPropsWithoutRef<'div'> {
  /** 対象アイテムの識別子 */
  value: string;
  children: ReactNode;
}

// =============================================================================
// Context
// =============================================================================

const {{ComponentName}}Context = createContext<{{ComponentName}}ContextType | null>(null);

function use{{ComponentName}}() {
  const context = useContext({{ComponentName}}Context);
  if (!context) {
    throw new Error(
      'use{{ComponentName}} must be used within a {{ComponentName}} component'
    );
  }
  return context;
}

// =============================================================================
// Root Component
// =============================================================================

function {{ComponentName}}Root({
  defaultValue,
  onValueChange,
  children,
  className,
  ...props
}: {{ComponentName}}Props) {
  const [activeItem, setActiveItemInternal] = useState<string | null>(
    defaultValue ?? null
  );

  const setActiveItem = useCallback(
    (item: string | null) => {
      setActiveItemInternal(item);
      onValueChange?.(item);
    },
    [onValueChange]
  );

  const toggleItem = useCallback(
    (item: string) => {
      setActiveItem(activeItem === item ? null : item);
    },
    [activeItem, setActiveItem]
  );

  const contextValue = useMemo(
    () => ({
      activeItem,
      setActiveItem,
      toggleItem,
    }),
    [activeItem, setActiveItem, toggleItem]
  );

  return (
    <{{ComponentName}}Context.Provider value={contextValue}>
      <div
        className={`{{componentName}} ${className || ''}`}
        {...props}
      >
        {children}
      </div>
    </{{ComponentName}}Context.Provider>
  );
}

// =============================================================================
// Item Component
// =============================================================================

function {{ComponentName}}Item({
  value,
  disabled = false,
  children,
  className,
  ...props
}: {{ComponentName}}ItemProps) {
  const { activeItem } = use{{ComponentName}}();
  const isActive = activeItem === value;

  return (
    <div
      className={`
        {{componentName}}-item
        ${isActive ? '{{componentName}}-item--active' : ''}
        ${disabled ? '{{componentName}}-item--disabled' : ''}
        ${className || ''}
      `.trim()}
      data-state={isActive ? 'active' : 'inactive'}
      data-disabled={disabled || undefined}
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Trigger Component
// =============================================================================

function {{ComponentName}}Trigger({
  value,
  children,
  className,
  ...props
}: {{ComponentName}}TriggerProps) {
  const { activeItem, toggleItem } = use{{ComponentName}}();
  const isActive = activeItem === value;

  return (
    <button
      type="button"
      className={`
        {{componentName}}-trigger
        ${isActive ? '{{componentName}}-trigger--active' : ''}
        ${className || ''}
      `.trim()}
      aria-expanded={isActive}
      aria-controls={`{{componentName}}-content-${value}`}
      onClick={() => toggleItem(value)}
      {...props}
    >
      {children}
    </button>
  );
}

// =============================================================================
// Content Component
// =============================================================================

function {{ComponentName}}Content({
  value,
  children,
  className,
  ...props
}: {{ComponentName}}ContentProps) {
  const { activeItem } = use{{ComponentName}}();
  const isActive = activeItem === value;

  if (!isActive) {
    return null;
  }

  return (
    <div
      id={`{{componentName}}-content-${value}`}
      className={`{{componentName}}-content ${className || ''}`}
      role="region"
      {...props}
    >
      {children}
    </div>
  );
}

// =============================================================================
// Compound Component Export
// =============================================================================

interface {{ComponentName}}Component
  extends React.FC<{{ComponentName}}Props> {
  Item: typeof {{ComponentName}}Item;
  Trigger: typeof {{ComponentName}}Trigger;
  Content: typeof {{ComponentName}}Content;
}

const {{ComponentName}}: {{ComponentName}}Component = Object.assign(
  {{ComponentName}}Root,
  {
    Item: {{ComponentName}}Item,
    Trigger: {{ComponentName}}Trigger,
    Content: {{ComponentName}}Content,
  }
);

export { {{ComponentName}}, use{{ComponentName}} };
export type {
  {{ComponentName}}Props,
  {{ComponentName}}ItemProps,
  {{ComponentName}}TriggerProps,
  {{ComponentName}}ContentProps,
};

// =============================================================================
// 使用例
// =============================================================================

/*
import { {{ComponentName}} } from './{{ComponentName}}';

function Example() {
  return (
    <{{ComponentName}} defaultValue="item-1" onValueChange={console.log}>
      <{{ComponentName}}.Item value="item-1">
        <{{ComponentName}}.Trigger value="item-1">
          アイテム1
        </{{ComponentName}}.Trigger>
        <{{ComponentName}}.Content value="item-1">
          アイテム1の内容
        </{{ComponentName}}.Content>
      </{{ComponentName}}.Item>

      <{{ComponentName}}.Item value="item-2">
        <{{ComponentName}}.Trigger value="item-2">
          アイテム2
        </{{ComponentName}}.Trigger>
        <{{ComponentName}}.Content value="item-2">
          アイテム2の内容
        </{{ComponentName}}.Content>
      </{{ComponentName}}.Item>
    </{{ComponentName}}>
  );
}
*/
