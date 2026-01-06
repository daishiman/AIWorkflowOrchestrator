# アコーディオンコンポーネントテンプレート

## 概要

アコーディオンコンポーネントは、複数のセクションを折りたたみ可能にするUI。
単一展開モードと複数展開モードの両方をサポートする。

## 構造

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// Context
interface AccordionContextType {
  activeItem: string | null;
  toggle: (id: string) => void;
  allowMultiple: boolean;
  activeItems: Set<string>;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// メインコンポーネント
interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultActive?: string | string[];
}

function Accordion({
  children,
  allowMultiple = false,
  defaultActive,
}: AccordionProps) {
  const [activeItems, setActiveItems] = useState<Set<string>>(() => {
    if (!defaultActive) return new Set();
    return new Set(Array.isArray(defaultActive) ? defaultActive : [defaultActive]);
  });

  const toggle = (id: string) => {
    setActiveItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!allowMultiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider
      value={{
        activeItem: [...activeItems][0] ?? null,
        toggle,
        allowMultiple,
        activeItems,
      }}
    >
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// Itemコンポーネント
function Item({ id, children }: { id: string; children: ReactNode }) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion.Item must be used within an Accordion');
  }
  const isActive = context.activeItems.has(id);
  return (
    <div className={`accordion-item ${isActive ? 'active' : ''}`} data-item-id={id}>
      {children}
    </div>
  );
}

// Triggerコンポーネント
function Trigger({ children, itemId }: { children: ReactNode; itemId: string }) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion.Trigger must be used within an Accordion');
  }
  const isActive = context.activeItems.has(itemId);
  return (
    <button
      className="accordion-trigger"
      onClick={() => context.toggle(itemId)}
      aria-expanded={isActive}
    >
      {children}
    </button>
  );
}

// Contentコンポーネント
function Content({ children, itemId }: { children: ReactNode; itemId: string }) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion.Content must be used within an Accordion');
  }
  if (!context.activeItems.has(itemId)) return null;
  return <div className="accordion-content">{children}</div>;
}

// 紐付け
Accordion.Item = Item;
Accordion.Trigger = Trigger;
Accordion.Content = Content;
```

## 使用例

```typescript
function FAQ() {
  return (
    <Accordion allowMultiple defaultActive="q1">
      <Accordion.Item id="q1">
        <Accordion.Trigger itemId="q1">質問1: 返品はできますか？</Accordion.Trigger>
        <Accordion.Content itemId="q1">
          はい、30日以内であれば返品可能です。
        </Accordion.Content>
      </Accordion.Item>

      <Accordion.Item id="q2">
        <Accordion.Trigger itemId="q2">質問2: 送料はいくらですか？</Accordion.Trigger>
        <Accordion.Content itemId="q2">
          5,000円以上のご注文で送料無料です。
        </Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

## 実装のポイント

- **複数展開モード**: allowMultipleでSet管理に切り替え
- **デフォルト展開**: defaultActiveで初期状態を指定可能
- **Item/Trigger/Content分離**: 柔軟なレイアウト構成を実現
- **ARIA対応**: aria-expanded属性でスクリーンリーダー対応
