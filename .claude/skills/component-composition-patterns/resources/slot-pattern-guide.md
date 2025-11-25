# Slot Pattern 実装ガイド

## 概要

Slot Patternは、コンポーネントの特定の領域に外部からコンテンツを注入するパターンです。
Vue.jsのnamed slotsに似た概念をReactで実現します。

---

## 基本パターン

### Props-based Slots

```tsx
interface CardProps {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function Card({ header, footer, children }: CardProps) {
  return (
    <div className="card">
      {header && (
        <div className="card-header">{header}</div>
      )}
      <div className="card-body">{children}</div>
      {footer && (
        <div className="card-footer">{footer}</div>
      )}
    </div>
  );
}

// 使用例
<Card
  header={<h2>タイトル</h2>}
  footer={<Button>送信</Button>}
>
  <p>カードの内容</p>
</Card>
```

### Children Inspection Pattern

```tsx
import { Children, isValidElement, ReactElement } from 'react';

// スロットコンポーネントの定義
const CardHeader = ({ children }: { children: ReactNode }) => <>{children}</>;
const CardBody = ({ children }: { children: ReactNode }) => <>{children}</>;
const CardFooter = ({ children }: { children: ReactNode }) => <>{children}</>;

interface CardProps {
  children: ReactNode;
}

function Card({ children }: CardProps) {
  let header: ReactNode = null;
  let body: ReactNode = null;
  let footer: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    if (child.type === CardHeader) {
      header = child.props.children;
    } else if (child.type === CardBody) {
      body = child.props.children;
    } else if (child.type === CardFooter) {
      footer = child.props.children;
    }
  });

  return (
    <div className="card">
      {header && <div className="card-header">{header}</div>}
      {body && <div className="card-body">{body}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// 使用例
<Card>
  <Card.Header>タイトル</Card.Header>
  <Card.Body>内容</Card.Body>
  <Card.Footer>
    <Button>閉じる</Button>
  </Card.Footer>
</Card>
```

---

## 高度なSlotパターン

### Render Function Slots

```tsx
interface DialogProps {
  renderHeader?: (onClose: () => void) => ReactNode;
  renderFooter?: (onClose: () => void) => ReactNode;
  children: ReactNode;
  onClose: () => void;
}

function Dialog({ renderHeader, renderFooter, children, onClose }: DialogProps) {
  return (
    <div className="dialog">
      {renderHeader && (
        <div className="dialog-header">
          {renderHeader(onClose)}
        </div>
      )}
      <div className="dialog-body">{children}</div>
      {renderFooter && (
        <div className="dialog-footer">
          {renderFooter(onClose)}
        </div>
      )}
    </div>
  );
}

// 使用例
<Dialog
  onClose={handleClose}
  renderHeader={(close) => (
    <>
      <h2>確認</h2>
      <button onClick={close}>×</button>
    </>
  )}
  renderFooter={(close) => (
    <>
      <Button onClick={close}>キャンセル</Button>
      <Button variant="primary" onClick={handleSubmit}>確定</Button>
    </>
  )}
>
  <p>本当によろしいですか？</p>
</Dialog>
```

### Conditional Slots

```tsx
interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

function Alert({ type, icon, action, children }: AlertProps) {
  // デフォルトアイコンの提供
  const defaultIcons = {
    info: <InfoIcon />,
    warning: <WarningIcon />,
    error: <ErrorIcon />,
    success: <SuccessIcon />,
  };

  const displayIcon = icon ?? defaultIcons[type];

  return (
    <div className={`alert alert--${type}`} role="alert">
      <div className="alert-icon">{displayIcon}</div>
      <div className="alert-content">{children}</div>
      {action && (
        <div className="alert-action">{action}</div>
      )}
    </div>
  );
}

// 使用例
<Alert
  type="error"
  action={<Button size="sm">再試行</Button>}
>
  エラーが発生しました
</Alert>
```

---

## Layout Slots

### Grid Layout with Slots

```tsx
interface PageLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

function PageLayout({ header, sidebar, footer, children }: PageLayoutProps) {
  return (
    <div className="page-layout">
      {header && (
        <header className="page-header">{header}</header>
      )}
      <div className="page-content">
        {sidebar && (
          <aside className="page-sidebar">{sidebar}</aside>
        )}
        <main className="page-main">{children}</main>
      </div>
      {footer && (
        <footer className="page-footer">{footer}</footer>
      )}
    </div>
  );
}

// CSS
.page-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: auto 1fr;
  min-height: 100vh;
}

.page-header {
  grid-column: 1 / -1;
}

.page-content {
  display: contents;
}

.page-footer {
  grid-column: 1 / -1;
}
```

### Responsive Slots

```tsx
interface ResponsiveLayoutProps {
  mobileHeader?: ReactNode;
  desktopHeader?: ReactNode;
  children: ReactNode;
}

function ResponsiveLayout({
  mobileHeader,
  desktopHeader,
  children
}: ResponsiveLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="responsive-layout">
      <header>
        {isMobile ? mobileHeader : desktopHeader}
      </header>
      <main>{children}</main>
    </div>
  );
}
```

---

## TypeScript型定義

### 厳密なSlot型

```tsx
interface StrictSlotProps {
  // 必須スロット
  children: ReactNode;

  // オプションスロット（ReactNode）
  header?: ReactNode;

  // 特定の要素型のみ許可
  icon?: ReactElement<SVGProps<SVGSVGElement>>;

  // 関数スロット
  renderEmpty?: () => ReactNode;

  // 条件付きスロット
  actions?: ReactNode | ReactNode[];
}
```

### ジェネリックSlot

```tsx
interface SlotComponentProps<T> {
  data: T;
  renderItem: (item: T) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
}

function DataDisplay<T>({
  data,
  renderItem,
  renderEmpty,
  renderLoading
}: SlotComponentProps<T>) {
  if (data === null || data === undefined) {
    return <>{renderEmpty?.() ?? 'データがありません'}</>;
  }

  return <>{renderItem(data)}</>;
}
```

---

## パターン比較

| 実装方法 | 柔軟性 | 型安全性 | 使いやすさ |
|----------|--------|----------|------------|
| Props-based | 中 | 高 | 高 |
| Children Inspection | 高 | 中 | 中 |
| Render Function | 高 | 高 | 中 |
| Compound + Slot | 最高 | 高 | 中 |

---

## ベストプラクティス

### 1. デフォルト値の提供

```tsx
// デフォルトコンテンツでUXを向上
function EmptyState({
  icon = <EmptyIcon />,
  title = 'データがありません',
  action,
  children
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
```

### 2. Slot検証

```tsx
function validateSlots(children: ReactNode) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;

    const validTypes = [CardHeader, CardBody, CardFooter];
    if (!validTypes.includes(child.type as any)) {
      console.warn(`Card: Invalid child type ${child.type}`);
    }
  });
}
```

### 3. アクセシビリティ考慮

```tsx
interface ModalProps {
  title: ReactNode;        // スクリーンリーダー用に必須
  description?: ReactNode; // aria-describedby用
  children: ReactNode;
}

function Modal({ title, description, children }: ModalProps) {
  const titleId = useId();
  const descId = useId();

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <h2 id={titleId}>{title}</h2>
      {description && <p id={descId}>{description}</p>}
      {children}
    </div>
  );
}
```

---

## チェックリスト

- [ ] スロットの目的が明確か
- [ ] デフォルト値が適切に設定されているか
- [ ] 型定義が完全か
- [ ] アクセシビリティが考慮されているか
- [ ] 空の状態が適切に処理されているか
