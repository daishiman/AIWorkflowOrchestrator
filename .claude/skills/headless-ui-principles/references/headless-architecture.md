# ヘッドレスUIアーキテクチャ詳細ガイド

## 概要

ヘッドレスUIアーキテクチャは、UIコンポーネントの**ロジック**と**プレゼンテーション**を
完全に分離する設計パターンです。

---

## アーキテクチャ層

### レイヤー構造

```
┌─────────────────────────────────────────────────────────────┐
│                    消費者層（Consumer）                      │
│  アプリケーションコード、ビジネスロジック                    │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│                 スタイル層（Styling）                        │
│  CSS, Tailwind, CSS-in-JS, etc.                             │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│               コンポジション層（Composition）                │
│  JSX構造、レイアウト、コンポーネント配置                    │
└─────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────┐
│                 ヘッドレス層（Headless）                     │
│  状態管理、イベント処理、アクセシビリティ、キーボード操作   │
└─────────────────────────────────────────────────────────────┘
```

### 各層の責任

| 層               | 責任                 | 出力                   |
| ---------------- | -------------------- | ---------------------- |
| ヘッドレス層     | ロジック、状態、A11y | Props, Handlers, State |
| コンポジション層 | 構造、配置           | JSX構造                |
| スタイル層       | 視覚表現             | クラス、スタイル       |
| 消費者層         | ビジネスロジック     | 最終的なUI             |

---

## 実装アプローチ

### アプローチ1: Hooks First

最も柔軟なアプローチ。すべてをhookとして提供。

```tsx
// ヘッドレス層
function useAccordion(options: AccordionOptions) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  return {
    // 状態
    expandedItems,

    // 操作
    expand: (id: string) => {
      /* ... */
    },
    collapse: (id: string) => {
      /* ... */
    },
    toggle: (id: string) => {
      /* ... */
    },

    // Props生成関数
    getRootProps: () => ({
      role: "presentation",
    }),
    getTriggerProps: (id: string) => ({
      role: "button",
      "aria-expanded": expandedItems.has(id),
      "aria-controls": `panel-${id}`,
      onClick: () => toggle(id),
    }),
    getPanelProps: (id: string) => ({
      id: `panel-${id}`,
      role: "region",
      hidden: !expandedItems.has(id),
    }),
  };
}

// コンポジション層
function Accordion({ items }: AccordionProps) {
  const { expandedItems, getRootProps, getTriggerProps, getPanelProps } =
    useAccordion({ type: "single" });

  return (
    <div {...getRootProps()}>
      {items.map((item) => (
        <div key={item.id}>
          <button {...getTriggerProps(item.id)}>{item.title}</button>
          <div {...getPanelProps(item.id)}>{item.content}</div>
        </div>
      ))}
    </div>
  );
}
```

### アプローチ2: Component Composition

Radix UIスタイル。コンポーネントとして提供しつつ、スタイルは消費者に委譲。

```tsx
// ヘッドレスコンポーネント
const AccordionContext = createContext<AccordionContextType | null>(null);

function AccordionRoot({ children, type = "single" }: AccordionRootProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  return (
    <AccordionContext.Provider
      value={{ expandedItems, setExpandedItems, type }}
    >
      {children}
    </AccordionContext.Provider>
  );
}

function AccordionItem({ value, children }: AccordionItemProps) {
  const { expandedItems } = useAccordionContext();
  const isExpanded = expandedItems.has(value);

  return (
    <AccordionItemContext.Provider value={{ value, isExpanded }}>
      {children}
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ children, asChild }: AccordionTriggerProps) {
  const { value, isExpanded } = useAccordionItemContext();
  const { toggleItem } = useAccordionContext();

  const Comp = asChild ? Slot : "button";

  return (
    <Comp aria-expanded={isExpanded} onClick={() => toggleItem(value)}>
      {children}
    </Comp>
  );
}

function AccordionContent({ children }: AccordionContentProps) {
  const { isExpanded } = useAccordionItemContext();

  if (!isExpanded) return null;

  return <div role="region">{children}</div>;
}

// エクスポート
const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
```

### アプローチ3: Render Props

完全なレンダリング制御を提供。

```tsx
interface AccordionProps {
  items: AccordionItem[];
  children: (props: AccordionRenderProps) => ReactNode;
}

interface AccordionRenderProps {
  items: Array<{
    item: AccordionItem;
    isExpanded: boolean;
    triggerProps: TriggerProps;
    contentProps: ContentProps;
  }>;
  expandAll: () => void;
  collapseAll: () => void;
}

function Accordion({ items, children }: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const renderProps: AccordionRenderProps = {
    items: items.map((item) => ({
      item,
      isExpanded: expandedItems.has(item.id),
      triggerProps: {
        "aria-expanded": expandedItems.has(item.id),
        onClick: () => toggleItem(item.id),
      },
      contentProps: {
        hidden: !expandedItems.has(item.id),
      },
    })),
    expandAll: () => setExpandedItems(new Set(items.map((i) => i.id))),
    collapseAll: () => setExpandedItems(new Set()),
  };

  return <>{children(renderProps)}</>;
}
```

---

## asChild パターン

### Slot コンポーネント

```tsx
import { cloneElement, isValidElement, ReactElement, ReactNode } from "react";

interface SlotProps {
  children: ReactNode;
  [key: string]: any;
}

function Slot({ children, ...props }: SlotProps) {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...children.props,
      className: mergeClassNames(props.className, children.props.className),
      style: { ...props.style, ...children.props.style },
    });
  }

  return <>{children}</>;
}

// 使用例
function AccordionTrigger({ children, asChild, ...props }: TriggerProps) {
  const Comp = asChild ? Slot : "button";

  return <Comp {...props}>{children}</Comp>;
}

// 消費者のコード
<AccordionTrigger asChild>
  <CustomButton variant="primary">Click me</CustomButton>
</AccordionTrigger>;
```

---

## 状態管理パターン

### Controlled/Uncontrolled ハイブリッド

```tsx
interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T;
  onChange?: (value: T) => void;
}

function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T | ((prev: T) => T)) => {
      const newValue =
        typeof nextValue === "function"
          ? (nextValue as (prev: T) => T)(value as T)
          : nextValue;

      if (!isControlled) {
        setUncontrolledValue(newValue);
      }

      onChange?.(newValue);
    },
    [isControlled, value, onChange],
  );

  return [value, setValue] as const;
}

// 使用例
function useAccordion({
  value,
  defaultValue,
  onValueChange,
}: AccordionOptions) {
  const [expandedItems, setExpandedItems] = useControllableState({
    value,
    defaultValue: defaultValue ?? new Set(),
    onChange: onValueChange,
  });

  // ...
}
```

---

## フォーカス管理

### Roving Focus

```tsx
function useRovingFocus(items: string[]) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    itemRefs.current.get(focusedIndex)?.focus();
  }, [focusedIndex]);

  const getItemProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(index, el);
      else itemRefs.current.delete(index);
    },
    tabIndex: index === focusedIndex ? 0 : -1,
    onKeyDown: handleKeyDown,
  });

  return { focusedIndex, getItemProps };
}
```

---

## ベストプラクティス

### 1. Props Spreading の順序

```tsx
// 消費者のpropsが優先されるようにする
function HeadlessButton({ className, ...userProps }, ref) {
  const { buttonProps } = useButton();

  return (
    <button
      {...buttonProps} // ヘッドレスのpropsが先
      {...userProps} // ユーザーのpropsで上書き可能
      ref={ref}
      className={mergeClassNames(buttonProps.className, className)}
    />
  );
}
```

### 2. TypeScript型の拡張性

```tsx
// 消費者が型を拡張できるようにする
interface HeadlessButtonProps<T extends ElementType = "button"> {
  as?: T;
}

type ButtonProps<T extends ElementType = "button"> = HeadlessButtonProps<T> &
  Omit<ComponentPropsWithRef<T>, keyof HeadlessButtonProps<T>>;
```

### 3. デフォルト値の提供

```tsx
// 合理的なデフォルトを提供しつつ、カスタマイズを許可
function useDialog({
  closeOnEscape = true,
  closeOnOutsideClick = true,
  initialFocusRef,
  returnFocusOnClose = true,
}: UseDialogOptions = {}) {
  // ...
}
```

---

## チェックリスト

### 設計時

- [ ] ロジックとスタイルが完全に分離されているか
- [ ] アクセシビリティが組み込まれているか
- [ ] キーボードナビゲーションが実装されているか
- [ ] 型定義が拡張可能か

### 実装時

- [ ] Controlled/Uncontrolled両方サポートしているか
- [ ] asChildパターンが必要か検討したか
- [ ] フォーカス管理が適切か
- [ ] イベントハンドラの順序が正しいか

### テスト時

- [ ] ロジックのみのユニットテストが書けるか
- [ ] アクセシビリティテストが通るか
- [ ] キーボード操作テストが通るか
