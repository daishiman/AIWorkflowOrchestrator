# コンポーネント設計書

## メタ情報

| 項目   | 内容                   |
| ------ | ---------------------- |
| Phase  | 2                      |
| タスク | コンポーネント設計     |
| 作成日 | 2026-01-24             |
| 機能名 | workspace-chat-edit-ui |

---

## 1. コンポーネント階層構造

```
workspace-chat-edit/
├── components/
│   ├── FileContextBadge/          # Molecules
│   │   ├── index.tsx
│   │   └── FileContextBadge.test.tsx
│   ├── ApplyControls/             # Molecules
│   │   ├── index.tsx
│   │   └── ApplyControls.test.tsx
│   ├── FileContextDropZone/       # Organisms
│   │   ├── index.tsx
│   │   └── FileContextDropZone.test.tsx
│   ├── DiffPreview/               # Organisms
│   │   ├── index.tsx
│   │   └── DiffPreview.test.tsx
│   ├── DiffEditor/                # Organisms
│   │   ├── index.tsx
│   │   └── DiffEditor.test.tsx
│   └── EditCommandInput/          # Molecules
│       ├── index.tsx
│       └── EditCommandInput.test.tsx
```

---

## 2. FileContextBadge

### 2.1 Props インターフェース

```typescript
interface FileContextBadgeProps {
  /** ファイルコンテキスト */
  context: FileContext;
  /** 削除時コールバック */
  onRemove?: () => void;
  /** アクティブ状態 */
  isActive?: boolean;
  /** 選択時コールバック */
  onSelect?: () => void;
  /** ツールチップ表示有無（デフォルト: true） */
  showTooltip?: boolean;
  /** 追加のクラス名 */
  className?: string;
}
```

### 2.2 内部状態

```typescript
// 内部状態なし（全てPropsで管理）
// ツールチップ表示はCSSのみで制御
```

### 2.3 レンダリング構造

```tsx
<div
  role="listitem"
  className={cn(
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md",
    "bg-slate-100 dark:bg-slate-800",
    "border border-slate-200 dark:border-slate-700",
    "max-w-[200px] cursor-pointer",
    "hover:bg-slate-200 dark:hover:bg-slate-700",
    "focus:outline-none focus:ring-2 focus:ring-blue-500",
    isActive && "ring-2 ring-blue-500",
    className,
  )}
  tabIndex={0}
  onClick={onSelect}
  onKeyDown={handleKeyDown}
>
  {/* ファイルアイコン */}
  <FileIcon className="w-4 h-4 flex-shrink-0 text-slate-500" />

  {/* ファイル名（truncate） */}
  <span
    className="truncate text-sm text-slate-700 dark:text-slate-300"
    title={showTooltip ? context.filePath : undefined}
  >
    {context.fileName}
  </span>

  {/* 削除ボタン */}
  {onRemove && (
    <button
      type="button"
      className={cn(
        "flex-shrink-0 p-0.5 rounded",
        "hover:bg-slate-300 dark:hover:bg-slate-600",
        "focus:outline-none focus:ring-1 focus:ring-blue-500",
      )}
      onClick={handleRemove}
      aria-label={`${context.fileName}を削除`}
    >
      <XIcon className="w-3.5 h-3.5 text-slate-500 hover:text-red-500" />
    </button>
  )}
</div>
```

### 2.4 イベントハンドラ

```typescript
const handleRemove = (e: React.MouseEvent) => {
  e.stopPropagation(); // 親のonSelectを発火させない
  onRemove?.();
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Delete" || e.key === "Backspace") {
    e.preventDefault();
    onRemove?.();
  } else if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onSelect?.();
  }
};
```

---

## 3. ApplyControls

### 3.1 Props インターフェース

```typescript
interface ApplyControlsProps {
  /** 結果ID */
  resultId: string;
  /** 適用成功時コールバック */
  onApplied?: (result: ApplyResult) => void;
  /** 却下時コールバック */
  onRejected?: () => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** サイズバリアント */
  size?: "sm" | "md";
  /** 追加のクラス名 */
  className?: string;
}
```

### 3.2 内部状態

```typescript
// 状態はuseDiffApply Hookから取得
// isLoading, error は Hookから取得
```

### 3.3 レンダリング構造

```tsx
<div className={cn("flex items-center gap-2", className)} aria-busy={isLoading}>
  {/* 適用ボタン */}
  <button
    type="button"
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
      "bg-green-600 text-white font-medium",
      "hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      size === "sm" && "px-2 py-1 text-sm",
    )}
    onClick={handleApply}
    disabled={disabled || isLoading}
    aria-label="変更を適用"
  >
    {isLoading ? (
      <Spinner className="w-4 h-4 animate-spin" />
    ) : (
      <CheckIcon className="w-4 h-4" />
    )}
    <span className={cn(size === "sm" && "sr-only")}>適用</span>
  </button>

  {/* 却下ボタン */}
  <button
    type="button"
    className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
      "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300",
      "hover:bg-slate-300 dark:hover:bg-slate-600",
      "focus:outline-none focus:ring-2 focus:ring-slate-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      size === "sm" && "px-2 py-1 text-sm",
    )}
    onClick={handleReject}
    disabled={disabled || isLoading}
    aria-label="変更を却下"
  >
    <XIcon className="w-4 h-4" />
    <span className={cn(size === "sm" && "sr-only")}>却下</span>
  </button>

  {/* エラー表示 */}
  {error && (
    <span className="text-sm text-red-600 dark:text-red-400" role="alert">
      {error}
    </span>
  )}
</div>
```

### 3.4 イベントハンドラ

```typescript
const { applyResult, rejectResult, isLoading, error } = useDiffApply();

const handleApply = async () => {
  const result = await applyResult(resultId);
  if (result.success) {
    onApplied?.(result);
  }
};

const handleReject = () => {
  rejectResult(resultId);
  onRejected?.();
};
```

---

## 4. FileContextDropZone

### 4.1 Props インターフェース

```typescript
interface FileContextDropZoneProps {
  /** ファイルドロップ時コールバック */
  onFilesDropped?: (files: File[]) => void;
  /** 最大ファイル数（デフォルト: 10） */
  maxFiles?: number;
  /** 最大ファイルサイズ（デフォルト: 10MB） */
  maxFileSize?: number;
  /** 子要素 */
  children?: React.ReactNode;
  /** 追加のクラス名 */
  className?: string;
}
```

### 4.2 内部状態

```typescript
// 状態はuseFileContext Hookから取得
// isDragging, error, fileContexts は Hookから取得
```

### 4.3 レンダリング構造

```tsx
<div
  ref={dropZoneRef}
  role="region"
  aria-dropeffect="copy"
  aria-label="ファイルをドロップしてください"
  className={cn("relative", className)}
  onDragEnter={handleDragEnter}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
>
  {/* 子要素 */}
  {children}

  {/* ドロップオーバーレイ */}
  {isDragging && (
    <div
      className={cn(
        "absolute inset-0 z-50",
        "bg-blue-500/10 border-2 border-dashed border-blue-500",
        "flex items-center justify-center rounded-lg",
      )}
    >
      <div className="flex flex-col items-center gap-2 p-4 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-lg">
        <UploadIcon className="w-8 h-8 text-blue-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          ファイルをドロップして添付
        </span>
      </div>
    </div>
  )}

  {/* エラー表示 */}
  {error && (
    <div
      className="absolute bottom-4 left-4 right-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
      role="alert"
    >
      <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      <button
        type="button"
        className="mt-2 text-xs text-red-700 dark:text-red-300 underline"
        onClick={clearError}
      >
        閉じる
      </button>
    </div>
  )}
</div>
```

### 4.4 イベントハンドラ

```typescript
const { setDragging, attachFile, clearError, canAddContext } = useFileContext();

const handleDragEnter = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setDragging(true);
};

const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

const handleDragLeave = (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // ドロップゾーン外に出た場合のみ
  if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
    setDragging(false);
  }
};

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  setDragging(false);

  const files = Array.from(e.dataTransfer.files);

  // バリデーション
  for (const file of files) {
    if (file.size > maxFileSize) {
      setError(`ファイルサイズが${maxFileSize / 1024 / 1024}MBを超えています`);
      return;
    }
  }

  if (!canAddContext) {
    setError(`添付ファイル数の上限（${maxFiles}）に達しました`);
    return;
  }

  onFilesDropped?.(files);
  for (const file of files) {
    await attachFile(file.path);
  }
};
```

---

## 5. DiffPreview

### 5.1 Props インターフェース

```typescript
interface DiffPreviewProps {
  /** 生成結果 */
  result: GeneratedResult;
  /** 閉じる時コールバック */
  onClose?: () => void;
  /** 適用成功時コールバック */
  onApplied?: (result: ApplyResult) => void;
}
```

### 5.2 内部状態

```typescript
// 差分統計（計算結果をメモ化）
const diffStats = useMemo(() => {
  const hunks = calculateDiff(result.originalContent, result.generatedContent);
  let added = 0,
    removed = 0,
    changed = 0;
  for (const hunk of hunks) {
    if (hunk.type === "add") added += hunk.lines.length;
    else if (hunk.type === "remove") removed += hunk.lines.length;
    else if (hunk.type === "change") changed += hunk.lines.length;
  }
  return { added, removed, changed };
}, [result.originalContent, result.generatedContent]);
```

### 5.3 レンダリング構造

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="diff-preview-title"
  className={cn(
    "fixed inset-0 z-50",
    "flex items-center justify-center",
    "bg-black/50",
  )}
  onKeyDown={handleKeyDown}
>
  <div
    className={cn(
      "w-full max-w-5xl max-h-[90vh]",
      "bg-white dark:bg-slate-900 rounded-lg shadow-xl",
      "flex flex-col overflow-hidden",
    )}
  >
    {/* ヘッダー */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <h2
          id="diff-preview-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          {result.fileName}
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600">+{diffStats.added}</span>
          <span className="text-red-600">-{diffStats.removed}</span>
          <span className="text-yellow-600">~{diffStats.changed}</span>
        </div>
      </div>
      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onClose}
        aria-label="閉じる"
      >
        <XIcon className="w-5 h-5" />
      </button>
    </div>

    {/* DiffEditor */}
    <div className="flex-1 overflow-hidden">
      <DiffEditor
        original={result.originalContent}
        modified={result.generatedContent}
        language={detectLanguage(result.fileName)}
        height="100%"
      />
    </div>

    {/* フッター（ApplyControls） */}
    <div className="flex justify-end gap-3 px-4 py-3 border-t border-slate-200 dark:border-slate-700">
      <ApplyControls
        resultId={result.id}
        onApplied={(applyResult) => {
          onApplied?.(applyResult);
          onClose?.();
        }}
        onRejected={onClose}
      />
    </div>
  </div>
</div>
```

### 5.4 イベントハンドラ

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") {
    e.preventDefault();
    onClose?.();
  }
};
```

### 5.5 フォーカストラップ

```typescript
// useFocusTrap Hook使用
const dialogRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const dialog = dialogRef.current;
  if (!dialog) return;

  // 初期フォーカスを適用ボタンに設定
  const applyButton = dialog.querySelector(
    '[aria-label="変更を適用"]',
  ) as HTMLElement;
  applyButton?.focus();

  // フォーカストラップ実装
  const focusableElements = dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  dialog.addEventListener("keydown", handleTab);
  return () => dialog.removeEventListener("keydown", handleTab);
}, []);
```

---

## 6. DiffEditor

### 6.1 Props インターフェース

```typescript
interface DiffEditorProps {
  /** 元のコンテンツ */
  original: string;
  /** 変更後のコンテンツ */
  modified: string;
  /** プログラミング言語 */
  language: string;
  /** 読み取り専用（デフォルト: true） */
  readOnly?: boolean;
  /** 高さ（デフォルト: 400px） */
  height?: string | number;
  /** 追加のクラス名 */
  className?: string;
}
```

### 6.2 内部状態

```typescript
// エディタインスタンス参照
const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);

// マウント状態
const [isMounted, setIsMounted] = useState(false);
```

### 6.3 レンダリング構造

```tsx
<div className={cn("relative", className)} aria-label="差分エディタ">
  {!isMounted && (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
      <Spinner className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )}
  <DiffEditorComponent
    original={original}
    modified={modified}
    language={language}
    height={height}
    options={{
      readOnly,
      renderSideBySide: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
    }}
    onMount={handleEditorMount}
  />
</div>
```

### 6.4 Monaco Editor設定

```typescript
const handleEditorMount = (editor: monaco.editor.IStandaloneDiffEditor) => {
  editorRef.current = editor;
  setIsMounted(true);
};

// レスポンシブ対応
useEffect(() => {
  const handleResize = () => {
    editorRef.current?.layout();
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

---

## 7. EditCommandInput

### 7.1 Props インターフェース

```typescript
interface EditCommandInputProps {
  /** 送信時コールバック */
  onSubmit: (command: EditCommand) => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** デフォルトのコマンドタイプ */
  defaultType?: EditCommandType;
  /** 追加のクラス名 */
  className?: string;
}
```

### 7.2 内部状態

```typescript
const [commandType, setCommandType] = useState<EditCommandType>(
  defaultType ?? "continue",
);
const [instruction, setInstruction] = useState("");
```

### 7.3 レンダリング構造

```tsx
<div className={cn("flex flex-col gap-3", className)}>
  {/* コマンドタイプセレクタ */}
  <div className="flex items-center gap-2">
    <label
      htmlFor="command-type"
      className="text-sm font-medium text-slate-700 dark:text-slate-300"
    >
      コマンド
    </label>
    <select
      id="command-type"
      role="listbox"
      aria-label="編集コマンドタイプを選択"
      value={commandType}
      onChange={(e) => setCommandType(e.target.value as EditCommandType)}
      className={cn(
        "flex-1 px-3 py-2 rounded-md",
        "border border-slate-300 dark:border-slate-600",
        "bg-white dark:bg-slate-800",
        "text-slate-900 dark:text-slate-100",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
      )}
      disabled={disabled}
    >
      <option value="continue">続きを書く</option>
      <option value="refactor">リファクタリング</option>
      <option value="generate-test">テスト生成</option>
      <option value="add-comment">コメント追加</option>
      <option value="custom">カスタム指示</option>
    </select>
  </div>

  {/* カスタム指示入力（customタイプのみ） */}
  {commandType === "custom" && (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="custom-instruction"
        className="text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        カスタム指示
      </label>
      <textarea
        id="custom-instruction"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="カスタム指示を入力..."
        maxLength={10000}
        className={cn(
          "w-full px-3 py-2 rounded-md resize-none",
          "border border-slate-300 dark:border-slate-600",
          "bg-white dark:bg-slate-800",
          "text-slate-900 dark:text-slate-100",
          "placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
        )}
        rows={3}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      <span className="text-xs text-slate-500">
        {instruction.length}/10,000文字
      </span>
    </div>
  )}

  {/* 送信ボタン */}
  <button
    type="button"
    className={cn(
      "w-full px-4 py-2 rounded-md",
      "bg-blue-600 text-white font-medium",
      "hover:bg-blue-700",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
      "disabled:opacity-50 disabled:cursor-not-allowed",
    )}
    onClick={handleSubmit}
    disabled={disabled || (commandType === "custom" && !instruction.trim())}
  >
    送信
  </button>
</div>
```

### 7.4 イベントハンドラ

```typescript
const handleSubmit = () => {
  const command: EditCommand = {
    type: commandType,
    instruction: commandType === "custom" ? instruction.trim() : undefined,
  };
  onSubmit(command);

  // リセット
  if (commandType === "custom") {
    setInstruction("");
  }
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (instruction.trim()) {
      handleSubmit();
    }
  }
};
```

---

## 8. スタイリング方針

### 8.1 Tailwind CSS設計原則

| 原則             | 説明                                              |
| ---------------- | ------------------------------------------------- |
| ダークモード対応 | `dark:` プレフィックスで両モード対応              |
| レスポンシブ     | `sm:`, `md:`, `lg:` プレフィックスで対応          |
| フォーカス可視   | `focus:ring-2` で明確なフォーカスリング           |
| ホバー状態       | `hover:` で視覚的フィードバック                   |
| 無効化状態       | `disabled:opacity-50 disabled:cursor-not-allowed` |

### 8.2 共通カラーパレット

| 用途       | Light Mode | Dark Mode |
| ---------- | ---------- | --------- |
| 背景（主） | white      | slate-900 |
| 背景（副） | slate-100  | slate-800 |
| テキスト   | slate-900  | slate-100 |
| テキスト副 | slate-500  | slate-400 |
| ボーダー   | slate-200  | slate-700 |
| プライマリ | blue-600   | blue-500  |
| 成功       | green-600  | green-500 |
| エラー     | red-600    | red-500   |

### 8.3 cnヘルパー関数

```typescript
// packages/shared/ui/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 作成日時

- 作成: 2026-01-24
- 作成者: Claude Code
