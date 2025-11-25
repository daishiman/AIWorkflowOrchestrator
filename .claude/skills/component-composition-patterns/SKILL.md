# component-composition-patterns

コンポーネント合成パターンと再利用可能なUI構造設計の専門知識

---

## 概要

### 目的
Reactおよびモダンフロントエンドフレームワークにおけるコンポーネント合成パターンを体系化し、
柔軟で保守性の高いUIコンポーネント設計を支援する。

### 対象者
- UIコンポーネント設計者
- フロントエンドエンジニア
- デザインシステム開発者

---

## コア知識領域

### 1. 合成パターン基礎

#### Children Pattern
最もシンプルな合成パターン。コンポーネントの内容を外部から注入。

```tsx
// 基本的なChildren Pattern
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// 使用例
<Card>
  <h2>タイトル</h2>
  <p>内容</p>
</Card>
```

#### Compound Components
関連するコンポーネントをグループ化し、暗黙的な状態共有を実現。

```tsx
// Compound Components Pattern
const Tabs = ({ children, defaultValue }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
};

Tabs.List = ({ children }) => <div role="tablist">{children}</div>;
Tabs.Tab = ({ value, children }) => { /* ... */ };
Tabs.Panel = ({ value, children }) => { /* ... */ };

// 使用例
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Tab value="tab1">タブ1</Tabs.Tab>
    <Tabs.Tab value="tab2">タブ2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab1">コンテンツ1</Tabs.Panel>
  <Tabs.Panel value="tab2">コンテンツ2</Tabs.Panel>
</Tabs>
```

### 2. 高度な合成パターン

#### Slot Pattern
名前付きスロットによる柔軟なコンテンツ配置。

```tsx
interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ header, footer, children }: CardProps) {
  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
```

#### Render Props Pattern
レンダリングロジックを外部から注入。

```tsx
interface MouseTrackerProps {
  render: (position: { x: number; y: number }) => ReactNode;
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // マウス追跡ロジック...
  return <>{render(position)}</>;
}
```

### 3. 制御パターン

#### Controlled vs Uncontrolled
状態管理の責任分離。

```tsx
// Controlled Component
interface ControlledInputProps {
  value: string;
  onChange: (value: string) => void;
}

// Uncontrolled Component
interface UncontrolledInputProps {
  defaultValue?: string;
  onBlur?: (value: string) => void;
}

// Hybrid Pattern（両方サポート）
interface InputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}
```

### 4. レイアウトパターン

#### Polymorphic Component
`as` propによる要素タイプの動的変更。

```tsx
interface BoxProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
}

function Box<T extends ElementType = 'div'>({
  as,
  children,
  ...props
}: BoxProps<T> & ComponentPropsWithoutRef<T>) {
  const Component = as || 'div';
  return <Component {...props}>{children}</Component>;
}

// 使用例
<Box as="section">セクション</Box>
<Box as="article">記事</Box>
<Box as={Link} href="/home">リンク</Box>
```

---

## パターン選択ガイド

### 選択フローチャート

```
コンポーネント設計開始
    │
    ├─ 単純なコンテンツラッパー？
    │   └─ Yes → Children Pattern
    │
    ├─ 複数の関連コンポーネント？
    │   └─ Yes → Compound Components
    │
    ├─ 名前付きコンテンツ領域が必要？
    │   └─ Yes → Slot Pattern
    │
    ├─ レンダリングロジックの注入が必要？
    │   └─ Yes → Render Props
    │
    └─ 要素タイプを柔軟に変更したい？
        └─ Yes → Polymorphic Component
```

### パターン比較表

| パターン | 柔軟性 | 複雑性 | 型安全性 | 使用場面 |
|---------|--------|--------|----------|----------|
| Children | 低 | 低 | 高 | シンプルなラッパー |
| Compound | 高 | 中 | 高 | タブ、アコーディオン |
| Slot | 中 | 低 | 高 | カード、モーダル |
| Render Props | 高 | 高 | 中 | データ共有 |
| Polymorphic | 高 | 中 | 高 | 汎用コンポーネント |

---

## アンチパターン

### 1. Prop Drilling
❌ 深い階層へのprop伝播
```tsx
// Bad: 中間コンポーネントが不要なpropsを受け取る
<App user={user}>
  <Layout user={user}>
    <Sidebar user={user}>
      <UserInfo user={user} />
```

✅ Context または Compound Components を使用
```tsx
// Good: Contextで状態共有
<UserProvider user={user}>
  <Layout>
    <Sidebar>
      <UserInfo />
```

### 2. 過度な抽象化
❌ 1回しか使わないコンポーネントの過度な汎用化

✅ 3回以上使う時に抽象化を検討

### 3. 巨大コンポーネント
❌ 1ファイル500行超のコンポーネント

✅ 単一責任原則に基づいて分割

---

## リソース

- `resources/compound-components-guide.md` - Compound Componentsの詳細ガイド
- `resources/slot-pattern-guide.md` - Slot Patternの実装ガイド
- `resources/polymorphic-components.md` - Polymorphic Componentの型安全な実装
- `templates/compound-component-template.tsx` - Compound Componentテンプレート
- `templates/polymorphic-component-template.tsx` - Polymorphic Componentテンプレート

---

## 関連スキル

- `design-system-architecture` - デザインシステム設計
- `headless-ui-principles` - ヘッドレスUI原則
- `accessibility-wcag` - アクセシビリティ対応

---

## バージョン情報

- 作成日: 2025-01-13
- 最終更新: 2025-01-13
- バージョン: 1.0.0
