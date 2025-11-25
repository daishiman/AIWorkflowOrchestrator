# コンパウンドコンポーネントテンプレート

## 概要

コンパウンドコンポーネントパターンは、関連するコンポーネント群が暗黙的に状態を共有するパターンです。
HTMLの`<select>`と`<option>`のような関係を実現します。

## 基本パターン: Selectコンポーネント

```typescript
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Children,
  cloneElement,
  isValidElement,
} from 'react';

// Context型定義
interface SelectContextType {
  value: string;
  onChange: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

// メインコンポーネント
interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

function Select({ value, onChange, children, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className={`select ${className ?? ''}`}>
        <button
          className="select-trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {value || 'Select...'}
        </button>
        {isOpen && (
          <div className="select-options" role="listbox">
            {children}
          </div>
        )}
      </div>
    </SelectContext.Provider>
  );
}

// Optionコンポーネント
interface OptionProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}

function Option({ value, children, disabled }: OptionProps) {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select.Option must be used within a Select');
  }

  const isSelected = context.value === value;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      className={`option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && context.onChange(value)}
    >
      {children}
    </div>
  );
}

// サブコンポーネントを親に紐付け
Select.Option = Option;

// 使用例
function App() {
  const [country, setCountry] = useState('');

  return (
    <Select value={country} onChange={setCountry}>
      <Select.Option value="jp">日本</Select.Option>
      <Select.Option value="us">アメリカ</Select.Option>
      <Select.Option value="uk">イギリス</Select.Option>
      <Select.Option value="cn" disabled>中国</Select.Option>
    </Select>
  );
}
```

## アコーディオンコンポーネント

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
interface AccordionItemProps {
  id: string;
  children: ReactNode;
}

function Item({ id, children }: AccordionItemProps) {
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
interface TriggerProps {
  children: ReactNode;
  itemId: string;
}

function Trigger({ children, itemId }: TriggerProps) {
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
interface ContentProps {
  children: ReactNode;
  itemId: string;
}

function Content({ children, itemId }: ContentProps) {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion.Content must be used within an Accordion');
  }

  const isActive = context.activeItems.has(itemId);

  if (!isActive) return null;

  return <div className="accordion-content">{children}</div>;
}

// 紐付け
Accordion.Item = Item;
Accordion.Trigger = Trigger;
Accordion.Content = Content;

// 使用例
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

## タブコンポーネント

```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

// Context
interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

// メインコンポーネント
interface TabsProps {
  children: ReactNode;
  defaultTab: string;
  onChange?: (tabId: string) => void;
}

function Tabs({ children, defaultTab, onChange }: TabsProps) {
  const [activeTab, setActiveTabState] = useState(defaultTab);

  const setActiveTab = (id: string) => {
    setActiveTabState(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// TabListコンポーネント
function TabList({ children }: { children: ReactNode }) {
  return (
    <div className="tab-list" role="tablist">
      {children}
    </div>
  );
}

// Tabコンポーネント
interface TabProps {
  id: string;
  children: ReactNode;
  disabled?: boolean;
}

function Tab({ id, children, disabled }: TabProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs.Tab must be used within Tabs');
  }

  const isActive = context.activeTab === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      className={`tab ${isActive ? 'active' : ''}`}
      onClick={() => !disabled && context.setActiveTab(id)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// TabPanelsコンポーネント
function TabPanels({ children }: { children: ReactNode }) {
  return <div className="tab-panels">{children}</div>;
}

// TabPanelコンポーネント
interface TabPanelProps {
  id: string;
  children: ReactNode;
}

function TabPanel({ id, children }: TabPanelProps) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs.Panel must be used within Tabs');
  }

  if (context.activeTab !== id) return null;

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  );
}

// 紐付け
Tabs.List = TabList;
Tabs.Tab = Tab;
Tabs.Panels = TabPanels;
Tabs.Panel = TabPanel;

// 使用例
function ProductPage() {
  return (
    <Tabs defaultTab="description" onChange={(tab) => console.log(`Tab changed: ${tab}`)}>
      <Tabs.List>
        <Tabs.Tab id="description">商品説明</Tabs.Tab>
        <Tabs.Tab id="specs">仕様</Tabs.Tab>
        <Tabs.Tab id="reviews">レビュー</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panels>
        <Tabs.Panel id="description">
          <p>この商品は...</p>
        </Tabs.Panel>
        <Tabs.Panel id="specs">
          <ul>
            <li>サイズ: 10cm x 20cm</li>
            <li>重量: 500g</li>
          </ul>
        </Tabs.Panel>
        <Tabs.Panel id="reviews">
          <div>レビュー一覧...</div>
        </Tabs.Panel>
      </Tabs.Panels>
    </Tabs>
  );
}
```

## モーダルコンポーネント

```typescript
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';

// Context
interface ModalContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

// Root
interface ModalProps {
  children: ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function Modal({ children, defaultOpen = false, onOpenChange }: ModalProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = () => {
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const close = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <ModalContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ModalContext.Provider>
  );
}

// Trigger
function Trigger({ children }: { children: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Trigger must be used within Modal');

  return (
    <button onClick={context.open} type="button">
      {children}
    </button>
  );
}

// Portal + Overlay + Content
function Content({ children, className }: { children: ReactNode; className?: string }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Content must be used within Modal');

  const contentRef = useRef<HTMLDivElement>(null);

  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') context.close();
    };
    if (context.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [context.isOpen, context]);

  // 背景スクロール防止
  useEffect(() => {
    if (context.isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [context.isOpen]);

  if (!context.isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={context.close}>
      <div
        ref={contentRef}
        className={`modal-content ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// Close Button
function Close({ children }: { children?: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Close must be used within Modal');

  return (
    <button className="modal-close" onClick={context.close} aria-label="Close">
      {children ?? '×'}
    </button>
  );
}

// Header, Body, Footer
function Header({ children }: { children: ReactNode }) {
  return <div className="modal-header">{children}</div>;
}

function Body({ children }: { children: ReactNode }) {
  return <div className="modal-body">{children}</div>;
}

function Footer({ children }: { children: ReactNode }) {
  return <div className="modal-footer">{children}</div>;
}

// 紐付け
Modal.Trigger = Trigger;
Modal.Content = Content;
Modal.Close = Close;
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;

// 使用例
function App() {
  return (
    <Modal onOpenChange={(open) => console.log(`Modal ${open ? 'opened' : 'closed'}`)}>
      <Modal.Trigger>モーダルを開く</Modal.Trigger>

      <Modal.Content>
        <Modal.Header>
          <h2>確認</h2>
          <Modal.Close />
        </Modal.Header>

        <Modal.Body>
          <p>この操作を実行しますか？</p>
        </Modal.Body>

        <Modal.Footer>
          <Modal.Close>
            <button>キャンセル</button>
          </Modal.Close>
          <button onClick={() => console.log('Confirmed')}>確認</button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}
```

## ベストプラクティス

1. **Contextは内部に隠す**: 消費者はContextを直接触らない
2. **エラーメッセージを明確に**: 正しい使用方法を示す
3. **デフォルト値を提供**: 単独使用時の振る舞いを定義
4. **アクセシビリティを考慮**: ARIA属性を適切に設定
5. **型安全性を確保**: TypeScriptで厳密に型付け
