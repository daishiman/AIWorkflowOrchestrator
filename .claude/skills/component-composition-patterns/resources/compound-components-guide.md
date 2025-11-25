# Compound Components パターン詳細ガイド

## 概要

Compound Componentsは、関連するコンポーネント群が暗黙的に状態を共有し、
一貫したAPIを提供するデザインパターンです。

---

## 基本構造

### Contextベースの実装

```tsx
import { createContext, useContext, useState, ReactNode } from 'react';

// 1. Context作成
interface AccordionContextType {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextType | null>(null);

// 2. カスタムフック
function useAccordion() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within AccordionProvider');
  }
  return context;
}

// 3. ルートコンポーネント
interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultExpanded?: string[];
}

function Accordion({ children, type = 'single', defaultExpanded = [] }: AccordionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (type === 'single') {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}

// 4. サブコンポーネント
interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

function AccordionItem({ id, children }: AccordionItemProps) {
  return (
    <div className="accordion-item" data-item-id={id}>
      {children}
    </div>
  );
}

interface AccordionTriggerProps {
  id: string;
  children: ReactNode;
}

function AccordionTrigger({ id, children }: AccordionTriggerProps) {
  const { expandedItems, toggleItem } = useAccordion();
  const isExpanded = expandedItems.has(id);

  return (
    <button
      className="accordion-trigger"
      aria-expanded={isExpanded}
      onClick={() => toggleItem(id)}
    >
      {children}
    </button>
  );
}

interface AccordionContentProps {
  id: string;
  children: ReactNode;
}

function AccordionContent({ id, children }: AccordionContentProps) {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(id);

  if (!isExpanded) return null;

  return (
    <div className="accordion-content" role="region">
      {children}
    </div>
  );
}

// 5. コンポーネント結合
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

export { Accordion };
```

---

## 使用パターン

### 基本使用

```tsx
<Accordion defaultExpanded={['item-1']}>
  <Accordion.Item id="item-1">
    <Accordion.Trigger id="item-1">
      セクション1
    </Accordion.Trigger>
    <Accordion.Content id="item-1">
      セクション1の内容
    </Accordion.Content>
  </Accordion.Item>

  <Accordion.Item id="item-2">
    <Accordion.Trigger id="item-2">
      セクション2
    </Accordion.Trigger>
    <Accordion.Content id="item-2">
      セクション2の内容
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### 複数展開モード

```tsx
<Accordion type="multiple" defaultExpanded={['item-1', 'item-2']}>
  {/* ... */}
</Accordion>
```

---

## 高度なパターン

### Render Props との組み合わせ

```tsx
interface AccordionItemRenderProps {
  isExpanded: boolean;
  toggle: () => void;
}

interface AccordionItemProps {
  id: string;
  children: (props: AccordionItemRenderProps) => ReactNode;
}

function AccordionItem({ id, children }: AccordionItemProps) {
  const { expandedItems, toggleItem } = useAccordion();
  const isExpanded = expandedItems.has(id);

  return (
    <div className="accordion-item">
      {children({
        isExpanded,
        toggle: () => toggleItem(id),
      })}
    </div>
  );
}

// 使用例
<Accordion.Item id="item-1">
  {({ isExpanded, toggle }) => (
    <>
      <button onClick={toggle}>
        {isExpanded ? '閉じる' : '開く'}
      </button>
      {isExpanded && <div>内容</div>}
    </>
  )}
</Accordion.Item>
```

### Controlled Mode

```tsx
interface ControlledAccordionProps {
  expanded: string[];
  onExpandedChange: (expanded: string[]) => void;
  children: ReactNode;
}

function ControlledAccordion({
  expanded,
  onExpandedChange,
  children
}: ControlledAccordionProps) {
  const expandedSet = new Set(expanded);

  const toggleItem = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onExpandedChange(Array.from(next));
  };

  return (
    <AccordionContext.Provider value={{ expandedItems: expandedSet, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  );
}
```

---

## 実装例：タブコンポーネント

```tsx
// TabsContext
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within Tabs');
  return context;
}

// Tabs Root
interface TabsProps {
  defaultValue: string;
  children: ReactNode;
  onChange?: (value: string) => void;
}

function Tabs({ defaultValue, children, onChange }: TabsProps) {
  const [activeTab, setActiveTabInternal] = useState(defaultValue);

  const setActiveTab = (tab: string) => {
    setActiveTabInternal(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// Tabs.List
function TabsList({ children }: { children: ReactNode }) {
  return (
    <div className="tabs-list" role="tablist">
      {children}
    </div>
  );
}

// Tabs.Tab
interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

function Tab({ value, children, disabled }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={`tab ${isActive ? 'tab--active' : ''}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

// Tabs.Panel
interface TabPanelProps {
  value: string;
  children: ReactNode;
}

function TabPanel({ value, children }: TabPanelProps) {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  );
}

// 結合
Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;

export { Tabs };
```

---

## ベストプラクティス

### 1. Context分離
```tsx
// 状態と操作を分離して不要な再レンダリングを防ぐ
const AccordionStateContext = createContext<{ expandedItems: Set<string> } | null>(null);
const AccordionActionsContext = createContext<{ toggleItem: (id: string) => void } | null>(null);
```

### 2. 型安全性の確保
```tsx
// サブコンポーネントの型を明示
interface AccordionComponent extends React.FC<AccordionProps> {
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
}

const Accordion: AccordionComponent = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});
```

### 3. デフォルト値の提供
```tsx
// 適切なデフォルト値で使いやすさを向上
<Accordion
  type="single"           // デフォルト: single
  collapsible={true}      // デフォルト: true
  defaultExpanded={[]}    // デフォルト: []
>
```

---

## チェックリスト

### 実装時
- [ ] Contextが適切にエラーハンドリングしているか
- [ ] サブコンポーネントが親なしで使用された時のエラーメッセージが明確か
- [ ] 型定義が完全か
- [ ] アクセシビリティ属性が適切か

### 使用時
- [ ] ルートコンポーネントで必要なpropsが設定されているか
- [ ] 子コンポーネントの順序は正しいか
- [ ] IDの重複がないか
