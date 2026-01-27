# FileContextList 設計書

## 1. 概要

添付ファイル一覧を表示するコンテナコンポーネントの詳細設計。

## 2. Propsインターフェース

```typescript
export interface FileContextListProps {
  /** ファイルコンテキスト配列（省略時はstoreから取得） */
  contexts?: FileContext[];
  /** 削除コールバック */
  onRemove?: (id: string) => void;
  /** 選択コールバック */
  onSelect?: (id: string) => void;
  /** 選択中のコンテキストID */
  selectedId?: string;
  /** 空状態メッセージ */
  emptyMessage?: string;
  /** 最大高さ */
  maxHeight?: string | number;
  /** 追加CSSクラス */
  className?: string;
}
```

## 3. コンポーネント階層

```
FileContextList (organisms)
├── <div> - コンテナ（role="list"）
│   ├── EmptyState (条件付き)
│   │   └── <p> - 空メッセージ
│   └── FileContextBadge[] (molecules)
│       ├── Icon - ファイルアイコン
│       ├── FileName - ファイル名
│       └── RemoveButton - 削除ボタン
└── <div aria-live="polite"> - スクリーンリーダー通知用
```

## 4. 状態管理連携

### 使用するフック

```typescript
const {
  fileContexts: storeContexts,
  activeContextId,
  removeFileContext,
  setActiveContext,
} = useFileContext();
```

### 派生状態

```typescript
// Props優先、なければstoreから取得
const displayContexts = contexts ?? storeContexts;
const currentSelectedId = selectedId ?? activeContextId;
```

## 5. イベントフロー

### 削除ハンドラ

```typescript
const handleRemove = useCallback(
  (id: string) => {
    // コールバック優先
    if (onRemove) {
      onRemove(id);
    } else {
      removeFileContext(id);
    }

    // スクリーンリーダー通知
    const context = displayContexts.find((c) => c.id === id);
    setAnnouncement(`${context?.fileName}を削除しました`);
  },
  [onRemove, removeFileContext, displayContexts],
);
```

### 選択ハンドラ

```typescript
const handleSelect = useCallback(
  (id: string) => {
    // コールバック優先
    if (onSelect) {
      onSelect(id);
    } else {
      setActiveContext(id);
    }
  },
  [onSelect, setActiveContext],
);
```

## 6. アクセシビリティ設計

### コンテナARIA属性

```tsx
<div
  role="list"
  aria-label="添付ファイル一覧"
  aria-describedby={isEmpty ? 'empty-message' : undefined}
  className={containerStyles}
>
```

### 空状態

```tsx
{
  isEmpty && (
    <p
      id="empty-message"
      role="status"
      className="text-slate-500 text-sm p-4 text-center"
    >
      {emptyMessage}
    </p>
  );
}
```

### ライブリージョン

```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {announcement}
</div>
```

## 7. スタイリング

### コンテナスタイル

```typescript
const containerStyles = cn(
  // レイアウト
  "flex flex-wrap gap-2 p-2",
  // スクロール
  "overflow-y-auto",
  // 背景・ボーダー
  "bg-slate-50 dark:bg-slate-900",
  "border border-slate-200 dark:border-slate-700",
  "rounded-lg",
);
```

### maxHeight適用

```typescript
const style: CSSProperties = {
  maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
};
```

### 空状態スタイル

```typescript
const emptyStyles = cn(
  "text-slate-500 dark:text-slate-400",
  "text-sm text-center p-4",
  "w-full",
);
```

## 8. FileContextBadge連携

### Propsマッピング

```typescript
{displayContexts.map((context) => (
  <FileContextBadge
    key={context.id}
    context={context}
    isActive={currentSelectedId === context.id}
    onRemove={() => handleRemove(context.id)}
    onSelect={() => handleSelect(context.id)}
    showTooltip={true}
  />
))}
```

## 9. フォーカス管理

### 削除後のフォーカス移動

```typescript
const handleRemoveWithFocus = useCallback(
  (id: string, index: number) => {
    handleRemove(id);

    // 次のアイテムまたは前のアイテムにフォーカス移動
    requestAnimationFrame(() => {
      const nextIndex = index < displayContexts.length - 1 ? index : index - 1;
      if (nextIndex >= 0) {
        const nextItem = containerRef.current?.querySelector(
          `[data-index="${nextIndex}"]`,
        );
        (nextItem as HTMLElement)?.focus();
      }
    });
  },
  [handleRemove, displayContexts.length],
);
```

## 10. テスト観点

### ユニットテスト

1. 空状態でemptyMessage表示
2. ファイル一覧が正しく表示される
3. 削除ボタンクリックでonRemove呼び出し
4. バッジクリックでonSelect呼び出し
5. selectedIdが正しく適用される
6. maxHeight制限でスクロール表示

### アクセシビリティテスト

1. role="list"の正しさ
2. aria-label属性
3. キーボードナビゲーション
4. スクリーンリーダー通知

### 統合テスト

1. useFileContextとの連携
2. 削除後のフォーカス移動
3. リアルタイム更新

## 11. 完了条件

- [x] Props型定義
- [x] コンポーネント階層設計
- [x] 状態管理連携設計
- [x] イベントフロー設計
- [x] アクセシビリティ設計
- [x] スタイリング設計
- [x] FileContextBadge連携設計
- [x] フォーカス管理設計
- [x] テスト観点定義
