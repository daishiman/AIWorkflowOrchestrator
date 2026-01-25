# workspace-chat-edit-ui 実装ガイド

## Overview

workspace-chat-edit UI機能の包括的な実装ガイドです。

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 機能の概要

### この機能は何をするものか

workspace-chat-edit-uiは、**AIアシスタントとのチャット中にファイル編集を依頼できる機能**です。

ユーザーは以下の操作が可能です：

1. **ファイルをドラッグ&ドロップで添付**
2. **編集コマンドを入力して送信**
3. **AIが提案した変更を差分プレビューで確認**
4. **変更を適用または却下**

### 使用イメージ

```
┌─────────────────────────────────────────────┐
│  💬 AIアシスタントとのチャット画面          │
├─────────────────────────────────────────────┤
│                                             │
│  📁 ファイルをここにドロップ               │
│  ┌─────────────────────────────────────┐    │
│  │ 📄 index.ts                         │    │
│  │ ✕                                   │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │ edit ▼ │ コメントを追加してください  │    │
│  └─────────────────────────────────────┘    │
│  [送信]                                     │
│                                             │
└─────────────────────────────────────────────┘
```

### 差分プレビュー画面

AIが変更を提案すると、差分プレビューが表示されます：

```
┌─────────────────────────────────────────────┐
│  🔍 差分プレビュー                   [×]    │
├─────────────────────────────────────────────┤
│  - const hello = "world";                   │
│  + // コメントを追加                        │
│  + const hello = "world";                   │
├─────────────────────────────────────────────┤
│  追加: 2行 / 削除: 1行                      │
├─────────────────────────────────────────────┤
│        [却下]        [適用 ✓]               │
└─────────────────────────────────────────────┘
```

---

## 各コンポーネントの役割と使い方

### 1. FileContextDropZone（ファイルドロップ領域）

**役割**: ファイルをドラッグ&ドロップで添付する領域

**使い方**:

- ファイルをドラッグすると青い破線のオーバーレイが表示される
- ファイルをドロップするとコンテキストとして追加される
- 最大10ファイル、各10MBまで添付可能

### 2. FileContextBadge（ファイルバッジ）

**役割**: 添付されたファイルの表示と削除

**使い方**:

- ファイル名とアイコンが表示される
- ×ボタンをクリックまたはDeleteキーで削除
- 長いファイル名は省略表示される

### 3. EditCommandInput（編集コマンド入力）

**役割**: 編集種別の選択とコマンドテキストの入力

**使い方**:

- ドロップダウンで編集タイプを選択（edit/refactor/comment/format）
- テキスト入力欄に指示を入力
- 送信ボタンまたはCtrl+Enterで送信

### 4. DiffPreview（差分プレビュー）

**役割**: AIが提案した変更内容の表示

**使い方**:

- モーダルダイアログとして表示
- 追加行は緑、削除行は赤で表示
- 追加/削除の行数カウントを表示

### 5. DiffEditor（差分エディタ）

**役割**: Monaco Editorによる詳細な差分表示

**使い方**:

- 左側に元のコード、右側に変更後のコードを表示
- シンタックスハイライト対応
- スクロール同期

### 6. ApplyControls（適用コントロール）

**役割**: 変更の適用または却下

**使い方**:

- 「適用」ボタンで変更をファイルに書き込み
- 「却下」ボタンで変更を破棄

---

## 全体のアーキテクチャ概要

### システム構成図

```
┌──────────────────────────────────────────────────────┐
│                  Renderer Process                     │
├───────────────────────┬──────────────────────────────┤
│     UIコンポーネント   │      状態管理                │
│  ┌─────────────────┐  │  ┌─────────────────────────┐│
│  │FileContextDropZone│─┬┼─│ useFileContext (Zustand)││
│  │FileContextBadge │  │ │  │                        ││
│  └─────────────────┘  │ │  │ - files: FileContext[] ││
│                       │ │  │ - attachFile()         ││
│  ┌─────────────────┐  │ │  │ - detachFile()         ││
│  │ EditCommandInput │─┼─┼──│ - clearAll()           ││
│  └─────────────────┘  │ │  └─────────────────────────┘│
│                       │ │                            │
│  ┌─────────────────┐  │ │  ┌─────────────────────────┐│
│  │   DiffPreview   │─┼─┼──│ useDiffApply (Zustand)  ││
│  │   DiffEditor    │  │ │  │                        ││
│  │  ApplyControls  │  │ │  │ - status: 'idle'|...   ││
│  └─────────────────┘  │ │  │ - applyResult()        ││
│                       │ │  │ - rejectResult()       ││
│                       │ │  └─────────────────────────┘│
└───────────────────────┴──┴───────────────────────────┘
                          │
                          │ IPC
                          ▼
┌──────────────────────────────────────────────────────┐
│                   Main Process                        │
│  ┌─────────────────────────────────────────────────┐│
│  │             File System Access                   ││
│  │  - readFile()                                   ││
│  │  - writeFile()                                  ││
│  └─────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

### データフロー

1. ユーザーがファイルをドロップ → `useFileContext.attachFile()` → ファイル内容読み込み
2. ユーザーがコマンドを送信 → AIがDiff生成 → `useDiffApply` で状態管理
3. ユーザーが適用をクリック → `useDiffApply.applyResult()` → ファイル書き込み

---

# Part 2: 技術的詳細（開発者向け）

## 各コンポーネントのAPI詳細

### FileContextBadge

```typescript
interface FileContextBadgeProps {
  /** ファイルコンテキストオブジェクト */
  file: FileContext;
  /** 選択状態 */
  isSelected?: boolean;
  /** 削除ボタンクリック時のコールバック */
  onRemove?: (fileId: string) => void;
  /** バッジクリック時のコールバック */
  onClick?: (fileId: string) => void;
}
```

**使用例**:

```tsx
<FileContextBadge
  file={{ id: "1", path: "/src/index.ts", name: "index.ts", content: "..." }}
  isSelected={selectedFileId === "1"}
  onRemove={(id) => detachFile(id)}
  onClick={(id) => setSelectedFileId(id)}
/>
```

### ApplyControls

```typescript
interface ApplyControlsProps {
  /** 結果ID（差分適用の識別子） */
  resultId: string;
  /** 適用完了時のコールバック */
  onApplied?: () => void;
  /** 却下完了時のコールバック */
  onRejected?: () => void;
}
```

**使用例**:

```tsx
<ApplyControls
  resultId="result-123"
  onApplied={() => {
    closeDiffPreview();
    showSuccessToast();
  }}
  onRejected={() => closeDiffPreview()}
/>
```

### FileContextDropZone

```typescript
interface FileContextDropZoneProps {
  /** 子要素（ドロップ可能領域内に表示） */
  children: React.ReactNode;
  /** 無効化フラグ */
  disabled?: boolean;
  /** ファイルドロップ時のコールバック */
  onFilesDropped?: (files: FileContext[]) => void;
}
```

**使用例**:

```tsx
<FileContextDropZone
  disabled={isExecuting}
  onFilesDropped={(files) => {
    files.forEach((file) => attachFile(file));
  }}
>
  <ChatInput />
</FileContextDropZone>
```

### DiffPreview

```typescript
interface DiffPreviewProps {
  /** オリジナルコンテンツ */
  original: string;
  /** 変更後のコンテンツ */
  modified: string;
  /** ファイル名 */
  fileName: string;
  /** 言語識別子（シンタックスハイライト用） */
  language?: string;
  /** 結果ID */
  resultId: string;
  /** モーダルを閉じる時のコールバック */
  onClose: () => void;
  /** 適用完了時のコールバック */
  onApplied?: () => void;
}
```

**使用例**:

```tsx
<DiffPreview
  original={fileContext.content}
  modified={aiSuggestedContent}
  fileName={fileContext.name}
  language="typescript"
  resultId="result-123"
  onClose={() => setShowPreview(false)}
  onApplied={() => refreshFileList()}
/>
```

### DiffEditor

```typescript
interface DiffEditorProps {
  /** オリジナルコンテンツ */
  original: string;
  /** 変更後のコンテンツ */
  modified: string;
  /** 言語識別子 */
  language?: string;
  /** エディタの高さ */
  height?: string | number;
}
```

**使用例**:

```tsx
<DiffEditor
  original={originalCode}
  modified={modifiedCode}
  language="typescript"
  height="400px"
/>
```

### EditCommandInput

```typescript
interface EditCommandInputProps {
  /** 送信時のコールバック */
  onSubmit: (command: EditCommand) => void;
  /** 無効化フラグ */
  disabled?: boolean;
  /** プレースホルダーテキスト */
  placeholder?: string;
}

interface EditCommand {
  type: "edit" | "refactor" | "comment" | "format";
  instruction: string;
  contexts: FileContext[];
}
```

**使用例**:

```tsx
<EditCommandInput
  onSubmit={(command) => {
    sendToAgent(command);
  }}
  disabled={isExecuting}
  placeholder="編集指示を入力..."
/>
```

---

## 状態管理とHooks連携

### useFileContext Hook

```typescript
interface FileContextState {
  files: FileContext[];
  error: string | null;
  isDragging: boolean;
  attachFile: (file: FileContext) => Promise<void>;
  detachFile: (fileId: string) => void;
  clearAll: () => void;
  setDragging: (isDragging: boolean) => void;
  clearError: () => void;
}
```

**Store定義** (`store/fileContextSlice.ts`):

```typescript
import { create } from "zustand";

export const useFileContext = create<FileContextState>((set, get) => ({
  files: [],
  error: null,
  isDragging: false,

  attachFile: async (file) => {
    const { files } = get();
    if (files.length >= 10) {
      set({ error: "添付ファイル数の上限（10）に達しました" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      set({ error: "ファイルサイズが10MBを超えています" });
      return;
    }
    set({ files: [...files, file], error: null });
  },

  detachFile: (fileId) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
    }));
  },

  clearAll: () => set({ files: [], error: null }),
  setDragging: (isDragging) => set({ isDragging }),
  clearError: () => set({ error: null }),
}));
```

### useDiffApply Hook

```typescript
interface DiffApplyState {
  status: "idle" | "applying" | "applied" | "error";
  error: string | null;
  applyResult: (resultId: string) => Promise<void>;
  rejectResult: (resultId: string) => Promise<void>;
  reset: () => void;
}
```

**使用パターン**:

```tsx
function DiffPreviewContainer() {
  const { applyResult, rejectResult, status, error } = useDiffApply();

  const handleApply = async () => {
    await applyResult(resultId);
    onApplied?.();
  };

  const handleReject = async () => {
    await rejectResult(resultId);
    onRejected?.();
  };

  return (
    <ApplyControls
      isLoading={status === "applying"}
      error={error}
      onApply={handleApply}
      onReject={handleReject}
    />
  );
}
```

---

## カスタマイズ方法と拡張ポイント

### テーマカスタマイズ

Monaco Editorのテーマは以下で切り替え可能:

```tsx
<DiffEditor
  original={original}
  modified={modified}
  options={{
    theme: isDarkMode ? "vs-dark" : "vs",
  }}
/>
```

### バリデーションルールの拡張

ファイルバリデーションをカスタマイズする場合:

```typescript
// store/fileContextSlice.ts
const validateFile = (file: FileContext, config: ValidationConfig) => {
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `ファイルサイズが${config.maxFileSize / 1024 / 1024}MBを超えています`,
    };
  }
  if (!config.allowedExtensions.includes(file.extension)) {
    return { valid: false, error: "許可されていないファイル形式です" };
  }
  return { valid: true, error: null };
};
```

### 新しい編集コマンドタイプの追加

`EditCommandInput`に新しいコマンドタイプを追加する場合:

```typescript
// types.ts
export type EditCommandType =
  | "edit"
  | "refactor"
  | "comment"
  | "format"
  | "translate" // 新規追加
  | "optimize"; // 新規追加

// EditCommandInput.tsx
const commandOptions = [
  { value: "edit", label: "編集" },
  { value: "refactor", label: "リファクタリング" },
  { value: "comment", label: "コメント追加" },
  { value: "format", label: "フォーマット" },
  { value: "translate", label: "翻訳" }, // 新規追加
  { value: "optimize", label: "最適化" }, // 新規追加
];
```

### DiffEditorのオプション拡張

```typescript
<DiffEditor
  original={original}
  modified={modified}
  options={{
    renderSideBySide: true,        // 横並び表示
    originalEditable: false,       // 元コード編集不可
    readOnly: true,                // 読み取り専用
    minimap: { enabled: false },   // ミニマップ非表示
    wordWrap: 'on',                // ワードラップ
    fontSize: 14,                  // フォントサイズ
  }}
/>
```

---

## パフォーマンス最適化

### React.memoの適用

全コンポーネントに`React.memo`を適用済み:

```typescript
export const FileContextBadge = React.memo(function FileContextBadge(props) {
  // ...
});
```

### useMemo/useCallbackの使用

```typescript
// DiffPreview.tsx
const diffStats = useMemo(() => {
  return calculateDiffStats(original, modified);
}, [original, modified]);

// EditCommandInput.tsx
const handleSubmit = useCallback(() => {
  onSubmit({ type: commandType, instruction, contexts });
}, [commandType, instruction, contexts, onSubmit]);
```

### Monaco Editorの遅延読み込み

```typescript
const DiffEditor = lazy(() => import('./DiffEditor'));

// 使用時
<Suspense fallback={<Spinner />}>
  <DiffEditor {...props} />
</Suspense>
```

---

## ファイル構造

```
apps/desktop/src/renderer/features/workspace-chat-edit/
├── components/
│   ├── FileContextBadge.tsx
│   ├── ApplyControls.tsx
│   ├── FileContextDropZone.tsx
│   ├── DiffEditor.tsx
│   ├── DiffPreview.tsx
│   ├── EditCommandInput.tsx
│   ├── index.ts
│   ├── common/
│   │   ├── Spinner.tsx
│   │   ├── CloseIcon.tsx
│   │   └── index.ts
│   └── __tests__/
│       ├── FileContextBadge.test.tsx
│       ├── ApplyControls.test.tsx
│       ├── FileContextDropZone.test.tsx
│       ├── DiffEditor.test.tsx
│       ├── DiffPreview.test.tsx
│       ├── EditCommandInput.test.tsx
│       ├── integration.test.tsx
│       ├── snapshots.test.tsx
│       └── __snapshots__/
└── hooks/
    ├── useFileContext.ts
    └── useDiffApply.ts
```

---

## 作成日

2026-01-25
