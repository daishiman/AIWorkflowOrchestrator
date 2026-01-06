# タブコンポーネントテンプレート

## 概要

タブコンポーネントは、複数のパネルを切り替えて表示するUI。
TabList、Tab、TabPanels、TabPanelの4つのサブコンポーネントで構成される。

## 構造

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
function TabPanel({ id, children }: { id: string; children: ReactNode }) {
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
```

## 使用例

```typescript
function ProductPage() {
  return (
    <Tabs defaultTab="description" onChange={(tab) => console.log(`Tab: ${tab}`)}>
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

## 実装のポイント

- **onChange callback**: タブ切り替え時の外部通知
- **List/Panels分離**: レイアウトの柔軟性（上下左右配置対応）
- **disabled対応**: 特定タブの無効化
- **ARIA対応**: role="tablist", role="tab", role="tabpanel", aria-selected
