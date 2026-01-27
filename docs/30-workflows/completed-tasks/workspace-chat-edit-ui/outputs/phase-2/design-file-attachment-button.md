# FileAttachmentButton 設計書

## 1. 概要

ファイル選択ダイアログを開くボタンコンポーネントの詳細設計。

## 2. Propsインターフェース

```typescript
export interface FileAttachmentButtonProps {
  /** ファイル選択後コールバック */
  onFilesSelected?: (paths: string[]) => void;
  /** 複数選択許可（デフォルト: true） */
  multiple?: boolean;
  /** 許可する拡張子（デフォルト: ['*']） */
  accept?: string[];
  /** 最大選択数（デフォルト: 10） */
  maxFiles?: number;
  /** 無効化フラグ */
  disabled?: boolean;
  /** 追加CSSクラス */
  className?: string;
  /** ボタンテキスト（デフォルト: "ファイルを添付"） */
  children?: React.ReactNode;
}
```

## 3. コンポーネント階層

```
FileAttachmentButton (molecules)
├── <button> - クリック領域
│   ├── <svg> (atoms) - 添付アイコン (Paperclip)
│   └── <span> - ボタンテキスト
└── <div aria-live="polite"> - スクリーンリーダー通知用
```

## 4. 状態管理連携

### 使用するフック

```typescript
const { fileContexts, canAddContext, attachFile, error } = useFileContext();
```

### 内部状態

```typescript
const [isLoading, setIsLoading] = useState(false);
```

## 5. イベントフロー

### クリックハンドラ

```typescript
const handleClick = async () => {
  if (disabled || !canAddContext || isLoading) return;

  setIsLoading(true);
  try {
    // 1. ファイル選択ダイアログを開く
    const result = await window.electronAPI.fileSelection.openDialog({
      title: "ファイルを選択",
      multiSelections: multiple,
      filterCategory: accept?.[0] === "*" ? "all" : undefined,
      customFilters:
        accept?.[0] !== "*"
          ? [
              {
                name: "Allowed Files",
                extensions: accept.map((ext) => ext.replace(".", "")),
              },
            ]
          : undefined,
    });

    if (!result.success || result.data?.canceled) {
      return;
    }

    const filePaths = result.data.filePaths;

    // 2. 最大ファイル数制限
    const limitedPaths = filePaths.slice(0, maxFiles);

    // 3. 各ファイルを添付
    for (const filePath of limitedPaths) {
      await attachFile(filePath);
    }

    // 4. コールバック通知
    onFilesSelected?.(limitedPaths);
  } finally {
    setIsLoading(false);
  }
};
```

### キーボードハンドラ

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
};
```

## 6. アクセシビリティ設計

### ARIA属性

| 属性          | 値                 | 条件                |
| ------------- | ------------------ | ------------------- |
| role          | `button`           | 常時                |
| aria-label    | `"ファイルを添付"` | children未指定時    |
| aria-disabled | `true`             | disabled/最大数到達 |
| tabIndex      | `0` / `-1`         | 有効時/無効時       |

### フォーカス管理

- `focus:ring-2 focus:ring-blue-500` でフォーカス可視化
- `focus:outline-none` でデフォルトアウトライン無効化

## 7. スタイリング

### ベーススタイル

```typescript
const baseStyles = cn(
  // レイアウト
  "inline-flex items-center gap-2 px-4 py-2",
  // 外観
  "bg-blue-500 text-white rounded-md",
  "border border-blue-600",
  // ホバー
  "hover:bg-blue-600",
  // 無効化
  "disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500",
  // フォーカス
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
  // トランジション
  "transition-colors duration-200",
);
```

### アイコン

```tsx
<svg
  className="w-5 h-5"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  aria-hidden="true"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
  />
</svg>
```

## 8. エラーハンドリング

| エラーケース           | 対応                         |
| ---------------------- | ---------------------------- |
| API未利用可能          | console.error + ユーザー通知 |
| ダイアログキャンセル   | 何もしない（正常フロー）     |
| ファイル読み込みエラー | useFileContextのerrorに委譲  |
| 最大数超過             | 超過分を無視 + aria-live通知 |

## 9. テスト観点

### ユニットテスト

1. デフォルトレンダリング
2. クリックでダイアログが開く
3. 複数ファイル選択
4. disabled時にクリック無効
5. 最大数到達時にクリック無効
6. キーボード操作（Enter/Space）
7. コールバック呼び出し確認

### アクセシビリティテスト

1. ARIA属性の正しさ
2. キーボードナビゲーション
3. フォーカス可視化

## 10. 完了条件

- [x] Props型定義
- [x] コンポーネント階層設計
- [x] 状態管理連携設計
- [x] イベントフロー設計
- [x] アクセシビリティ設計
- [x] スタイリング設計
- [x] エラーハンドリング設計
- [x] テスト観点定義
