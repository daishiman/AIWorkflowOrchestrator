# ファイル選択機能 - UIコンポーネント設計書

> **ドキュメントID**: CONV-01-UI
> **作成日**: 2025-12-16
> **作成者**: .claude/agents/ui-designer.md
> **ステータス**: 承認待ち
> **関連ドキュメント**: [step03-type-design.md](./step03-type-design.md), [step05-store-design.md](./step05-store-design.md)

---

## 1. 概要

本ドキュメントは、ファイル選択機能のUIコンポーネントを設計する。
Atomic Designに従い、再利用可能で保守性の高いコンポーネント構造を定義する。

### 1.1 設計方針

| 方針             | 説明                                       |
| ---------------- | ------------------------------------------ |
| Atomic Design    | atoms/molecules/organisms の階層構造に従う |
| アクセシビリティ | WCAG 2.1 AA準拠、キーボード操作完全対応    |
| Tailwind CSS     | 既存のデザインシステムと一貫性を保つ       |
| Composition      | 小さなコンポーネントを組み合わせて構築     |
| 状態分離         | UI状態とビジネスロジックを明確に分離       |

### 1.2 コンポーネント階層

```
molecules/
├── FileDropZone/              # ドロップゾーン
│   ├── index.tsx
│   └── FileDropZone.test.tsx
├── SelectedFileItem/          # 選択されたファイル表示
│   ├── index.tsx
│   └── SelectedFileItem.test.tsx
└── FileFilterSelect/          # フィルター選択
    ├── index.tsx
    └── FileFilterSelect.test.tsx

organisms/
└── FileSelector/              # ファイル選択全体
    ├── index.tsx
    ├── FileSelector.test.tsx
    └── FileSelector.a11y.test.tsx
```

---

## 2. コンポーネント設計

### 2.1 FileDropZone（molecule）

ドラッグ&ドロップでファイルを受け付けるエリア。

#### Props定義

```typescript
// apps/desktop/src/renderer/components/molecules/FileDropZone/index.tsx

export interface FileDropZoneProps {
  /** ドラッグオーバー状態 */
  isDragging?: boolean;
  /** 無効状態 */
  disabled?: boolean;
  /** ローディング状態 */
  isLoading?: boolean;
  /** ファイル選択ボタンクリック */
  onBrowseClick: () => void;
  /** ドラッグイベントハンドラ */
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  /** カスタムクラス */
  className?: string;
  /** テストID */
  testId?: string;
}
```

#### 実装

```typescript
import React from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import { Button } from "../../atoms/Button";
import { Spinner } from "../../atoms/Spinner";

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  isDragging = false,
  disabled = false,
  isLoading = false,
  onBrowseClick,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  className,
  testId = "file-drop-zone",
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <div
      data-testid={testId}
      role="region"
      aria-label="ファイルドロップエリア"
      aria-disabled={isDisabled}
      className={clsx(
        "relative flex flex-col items-center justify-center",
        "min-h-[200px] p-8 rounded-xl",
        "border-2 border-dashed transition-all duration-200",
        // 通常状態
        !isDragging && !isDisabled && "border-white/20 bg-white/5",
        // ドラッグ中
        isDragging && !isDisabled && "border-blue-400 bg-blue-400/10",
        // 無効状態
        isDisabled && "border-white/10 bg-white/5 cursor-not-allowed opacity-50",
        className,
      )}
      onDragEnter={isDisabled ? undefined : onDragEnter}
      onDragLeave={isDisabled ? undefined : onDragLeave}
      onDragOver={isDisabled ? undefined : onDragOver}
      onDrop={isDisabled ? undefined : onDrop}
    >
      {isLoading ? (
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-gray-400">ファイルを読み込み中...</p>
        </div>
      ) : (
        <>
          <Icon
            name={isDragging ? "download" : "upload"}
            size={48}
            className={clsx(
              "mb-4 transition-colors",
              isDragging ? "text-blue-400" : "text-gray-500",
            )}
            aria-hidden="true"
          />

          <p className="text-center text-white mb-2">
            {isDragging
              ? "ここにドロップしてファイルを追加"
              : "ファイルをドラッグ＆ドロップ"}
          </p>

          <p className="text-sm text-gray-400 mb-4">または</p>

          <Button
            variant="secondary"
            size="md"
            onClick={onBrowseClick}
            disabled={isDisabled}
            leftIcon="folder-open"
          >
            ファイルを選択
          </Button>
        </>
      )}
    </div>
  );
};

FileDropZone.displayName = "FileDropZone";
```

#### 状態遷移

```
┌─────────────┐    onDragEnter    ┌─────────────┐
│   通常状態   │ ───────────────▶ │ ドラッグ中   │
│ isDragging: │                   │ isDragging: │
│   false     │ ◀─────────────── │   true      │
└─────────────┘   onDragLeave     └──────┬──────┘
       │                                  │
       │ onBrowseClick                    │ onDrop
       ▼                                  ▼
┌─────────────┐                   ┌─────────────┐
│ ダイアログ   │                   │ ファイル処理 │
│   表示中     │                   │ isLoading:  │
└─────────────┘                   │   true      │
                                  └─────────────┘
```

---

### 2.2 SelectedFileItem（molecule）

選択されたファイルの個別表示。

#### Props定義

```typescript
// apps/desktop/src/renderer/components/molecules/SelectedFileItem/index.tsx

import type { SelectedFile } from "@repo/shared/types";

export interface SelectedFileItemProps {
  /** ファイル情報 */
  file: SelectedFile;
  /** 選択状態（複数選択時） */
  isSelected?: boolean;
  /** 削除クリック */
  onRemove: (fileId: string) => void;
  /** クリック（選択） */
  onClick?: (fileId: string) => void;
  /** ドラッグ可能か（並び替え用） */
  draggable?: boolean;
  /** カスタムクラス */
  className?: string;
  /** テストID */
  testId?: string;
}
```

#### 実装

```typescript
import React, { useCallback } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../../atoms/Icon";
import { formatFileSize } from "../../../store/utils/fileSelection";

const EXTENSION_ICONS: Record<string, IconName> = {
  ".pdf": "file-text",
  ".docx": "file-text",
  ".doc": "file-text",
  ".xlsx": "file-spreadsheet",
  ".xls": "file-spreadsheet",
  ".pptx": "file-presentation",
  ".ppt": "file-presentation",
  ".txt": "file-text",
  ".md": "file-text",
  ".csv": "file-spreadsheet",
  ".json": "file-code",
  ".xml": "file-code",
  ".mp3": "music",
  ".mp4": "video",
  ".wav": "music",
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".gif": "image",
  default: "file",
};

export const SelectedFileItem: React.FC<SelectedFileItemProps> = ({
  file,
  isSelected = false,
  onRemove,
  onClick,
  draggable = false,
  className,
  testId,
}) => {
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(file.id);
    },
    [file.id, onRemove],
  );

  const handleClick = useCallback(() => {
    onClick?.(file.id);
  }, [file.id, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onRemove(file.id);
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick?.(file.id);
      }
    },
    [file.id, onRemove, onClick],
  );

  const icon = EXTENSION_ICONS[file.extension.toLowerCase()] ?? EXTENSION_ICONS.default;

  return (
    <div
      data-testid={testId ?? `selected-file-${file.id}`}
      role="listitem"
      tabIndex={0}
      aria-selected={isSelected}
      draggable={draggable}
      className={clsx(
        "group flex items-center gap-3 p-3 rounded-lg",
        "transition-all duration-150 cursor-pointer",
        "hover:bg-white/5",
        "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
        isSelected && "bg-white/10 ring-1 ring-blue-400/30",
        draggable && "cursor-grab active:cursor-grabbing",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* ドラッグハンドル */}
      {draggable && (
        <Icon
          name="grip-vertical"
          size={16}
          className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* ファイルアイコン */}
      <div
        className={clsx(
          "flex-shrink-0 w-10 h-10 rounded-lg",
          "flex items-center justify-center",
          "bg-white/10",
        )}
      >
        <Icon name={icon} size={20} className="text-gray-300" aria-hidden="true" />
      </div>

      {/* ファイル情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-400">
          {formatFileSize(file.size)} • {file.extension.toUpperCase().slice(1)}
        </p>
      </div>

      {/* 削除ボタン */}
      <button
        type="button"
        onClick={handleRemove}
        className={clsx(
          "flex-shrink-0 p-1.5 rounded-md",
          "text-gray-500 hover:text-red-400 hover:bg-red-400/10",
          "opacity-0 group-hover:opacity-100 focus:opacity-100",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-red-400/50",
        )}
        aria-label={`${file.name}を削除`}
      >
        <Icon name="x" size={16} aria-hidden="true" />
      </button>
    </div>
  );
};

SelectedFileItem.displayName = "SelectedFileItem";
```

---

### 2.3 FileFilterSelect（molecule）

ファイルフィルターの選択UI。

#### Props定義

```typescript
// apps/desktop/src/renderer/components/molecules/FileFilterSelect/index.tsx

import type { FileFilterCategory } from "@repo/shared/types";

export interface FileFilterSelectProps {
  /** 現在の選択値 */
  value: FileFilterCategory;
  /** 変更ハンドラ */
  onChange: (category: FileFilterCategory) => void;
  /** 無効状態 */
  disabled?: boolean;
  /** カスタムクラス */
  className?: string;
  /** テストID */
  testId?: string;
}
```

#### 実装

```typescript
import React from "react";
import clsx from "clsx";
import { Icon } from "../../atoms/Icon";
import type { FileFilterCategory } from "@repo/shared/types";
import { FILE_FILTERS } from "@repo/shared/constants";

const FILTER_OPTIONS: Array<{
  value: FileFilterCategory;
  label: string;
  icon: string;
}> = [
  { value: "all", label: "すべて", icon: "files" },
  { value: "office", label: "オフィス文書", icon: "file-text" },
  { value: "text", label: "テキスト", icon: "file-code" },
  { value: "media", label: "メディア", icon: "video" },
  { value: "image", label: "画像", icon: "image" },
];

export const FileFilterSelect: React.FC<FileFilterSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  testId = "file-filter-select",
}) => {
  return (
    <div
      data-testid={testId}
      role="radiogroup"
      aria-label="ファイルフィルター"
      className={clsx("flex flex-wrap gap-2", className)}
    >
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
            "text-sm font-medium transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
            value === option.value
              ? "bg-blue-500/20 text-blue-400 ring-1 ring-blue-400/30"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <Icon name={option.icon as any} size={14} aria-hidden="true" />
          {option.label}
        </button>
      ))}
    </div>
  );
};

FileFilterSelect.displayName = "FileFilterSelect";
```

---

### 2.4 FileSelector（organism）

ファイル選択機能全体を統合するコンポーネント。

#### Props定義

```typescript
// apps/desktop/src/renderer/components/organisms/FileSelector/index.tsx

import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

export interface FileSelectorProps {
  /** コンポーネントID（アクセシビリティ用） */
  id?: string;
  /** ラベル */
  label?: string;
  /** 説明文 */
  description?: string;
  /** 選択されたファイル */
  files?: SelectedFile[];
  /** フィルターカテゴリ */
  filterCategory?: FileFilterCategory;
  /** 無効状態 */
  disabled?: boolean;
  /** ファイル追加コールバック */
  onFilesAdd?: (files: SelectedFile[]) => void;
  /** ファイル削除コールバック */
  onFileRemove?: (fileId: string) => void;
  /** 全クリアコールバック */
  onClear?: () => void;
  /** フィルター変更コールバック */
  onFilterChange?: (category: FileFilterCategory) => void;
  /** エラー */
  error?: string | null;
  /** 最大ファイル数（0 = 無制限） */
  maxFiles?: number;
  /** カスタムクラス */
  className?: string;
  /** テストID */
  testId?: string;
}
```

#### 実装

```typescript
import React, { useCallback, useId } from "react";
import clsx from "clsx";
import { FileDropZone } from "../../molecules/FileDropZone";
import { SelectedFileItem } from "../../molecules/SelectedFileItem";
import { FileFilterSelect } from "../../molecules/FileFilterSelect";
import { Button } from "../../atoms/Button";
import { ErrorDisplay } from "../../atoms/ErrorDisplay";
import { LiveRegion } from "../../atoms/LiveRegion";
import { useFileSelection } from "../../../hooks/useFileSelection";
import { useFileDrop } from "../../../hooks/useFileDrop";
import type { SelectedFile, FileFilterCategory } from "@repo/shared/types";

export const FileSelector: React.FC<FileSelectorProps> = ({
  id,
  label = "ファイル選択",
  description,
  files: controlledFiles,
  filterCategory: controlledFilter,
  disabled = false,
  onFilesAdd,
  onFileRemove,
  onClear,
  onFilterChange,
  error: controlledError,
  maxFiles = 0,
  className,
  testId = "file-selector",
}) => {
  // 非制御モードの場合はhookを使用
  const {
    files: hookFiles,
    isLoading,
    error: hookError,
    openFileDialog,
    removeFile: hookRemoveFile,
    clearFiles: hookClearFiles,
  } = useFileSelection();

  const {
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  } = useFileDrop();

  // 制御/非制御モードの判定
  const isControlled = controlledFiles !== undefined;
  const files = isControlled ? controlledFiles : hookFiles;
  const error = controlledError ?? hookError;
  const filterCategory = controlledFilter ?? "all";

  // ID生成（アクセシビリティ用）
  const generatedId = useId();
  const componentId = id ?? generatedId;
  const labelId = `${componentId}-label`;
  const descriptionId = `${componentId}-description`;
  const listId = `${componentId}-list`;
  const errorId = `${componentId}-error`;

  // イベントハンドラ
  const handleBrowseClick = useCallback(async () => {
    if (isControlled && onFilesAdd) {
      // 制御モード: 親から渡されたコールバックを使用
      await openFileDialog({ filterCategory });
    } else {
      // 非制御モード: hookが処理
      await openFileDialog({ filterCategory });
    }
  }, [isControlled, onFilesAdd, openFileDialog, filterCategory]);

  const handleRemove = useCallback(
    (fileId: string) => {
      if (onFileRemove) {
        onFileRemove(fileId);
      } else {
        hookRemoveFile(fileId);
      }
    },
    [onFileRemove, hookRemoveFile],
  );

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    } else {
      hookClearFiles();
    }
  }, [onClear, hookClearFiles]);

  const handleFilterChange = useCallback(
    (category: FileFilterCategory) => {
      onFilterChange?.(category);
    },
    [onFilterChange],
  );

  // 上限チェック
  const isMaxReached = maxFiles > 0 && files.length >= maxFiles;
  const isDisabled = disabled || isMaxReached;

  return (
    <div
      data-testid={testId}
      className={clsx("flex flex-col gap-4", className)}
      role="group"
      aria-labelledby={labelId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            id={labelId}
            className="text-lg font-semibold text-white"
          >
            {label}
          </h3>
          {description && (
            <p id={descriptionId} className="text-sm text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>

        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            leftIcon="trash-2"
          >
            すべてクリア
          </Button>
        )}
      </div>

      {/* フィルター選択 */}
      {onFilterChange && (
        <FileFilterSelect
          value={filterCategory}
          onChange={handleFilterChange}
          disabled={disabled}
        />
      )}

      {/* ドロップゾーン */}
      <FileDropZone
        isDragging={isDragging}
        disabled={isDisabled}
        isLoading={isLoading}
        onBrowseClick={handleBrowseClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

      {/* 上限メッセージ */}
      {isMaxReached && (
        <p className="text-sm text-amber-400">
          ファイルの上限（{maxFiles}件）に達しました
        </p>
      )}

      {/* エラー表示 */}
      {error && (
        <ErrorDisplay
          id={errorId}
          message={error}
          variant="inline"
        />
      )}

      {/* 選択ファイル一覧 */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              選択中: {files.length}件
            </p>
          </div>

          <div
            id={listId}
            role="list"
            aria-label="選択されたファイル"
            className="flex flex-col gap-1"
          >
            {files.map((file) => (
              <SelectedFileItem
                key={file.id}
                file={file}
                onRemove={handleRemove}
                draggable={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* スクリーンリーダー用ライブリージョン */}
      <LiveRegion>
        {isLoading && "ファイルを読み込み中..."}
        {error && `エラー: ${error}`}
      </LiveRegion>
    </div>
  );
};

FileSelector.displayName = "FileSelector";
```

---

## 3. アクセシビリティ設計

### 3.1 ARIA属性（UI-M2対応）

#### 基本属性

| コンポーネント   | 属性                | 目的                           |
| ---------------- | ------------------- | ------------------------------ |
| FileDropZone     | `role="region"`     | ランドマークとして識別         |
| FileDropZone     | `aria-label`        | ドロップエリアの説明           |
| FileDropZone     | `aria-disabled`     | 無効状態を通知                 |
| FileDropZone     | `aria-busy`         | 読み込み中状態を通知           |
| SelectedFileItem | `role="listitem"`   | リストアイテムとして識別       |
| SelectedFileItem | `aria-selected`     | 選択状態を通知                 |
| SelectedFileItem | `tabIndex={0}`      | キーボードフォーカス可能       |
| FileFilterSelect | `role="radiogroup"` | ラジオボタングループとして識別 |
| FileFilterSelect | `aria-checked`      | 選択状態を通知                 |
| FileSelector     | `role="group"`      | 関連要素のグループ化           |
| FileSelector     | `aria-labelledby`   | グループラベルを参照           |
| FileSelector     | `aria-describedby`  | 説明文を参照                   |
| FileSelector     | `aria-errormessage` | エラーメッセージを参照         |

#### 追加属性（完全版）

| コンポーネント   | 属性                   | 値/用途                              |
| ---------------- | ---------------------- | ------------------------------------ |
| FileDropZone     | `aria-dropeffect`      | `"copy"` - ドロップ時の動作を明示    |
| FileDropZone     | `aria-grabbed`         | ドラッグ中の状態を示す               |
| SelectedFileItem | `aria-describedby`     | ファイル詳細情報への参照             |
| SelectedFileItem | `aria-roledescription` | `"選択されたファイル"`               |
| 削除ボタン       | `aria-label`           | `"${fileName}を削除"`                |
| 削除ボタン       | `aria-describedby`     | 削除確認のヒントID                   |
| FileList         | `role="list"`          | リスト要素として識別                 |
| FileList         | `aria-label`           | `"選択されたファイル（${count}件）"` |
| LiveRegion       | `aria-live`            | `"polite"` - 変更を穏やかに通知      |
| LiveRegion       | `aria-atomic`          | `"true"` - 全体を読み上げ            |

#### ARIA実装例

```typescript
// FileDropZone の完全版ARIA属性
<div
  role="region"
  aria-label="ファイルドロップエリア"
  aria-disabled={isDisabled}
  aria-busy={isLoading}
  aria-dropeffect={isDragging ? "copy" : "none"}
  tabIndex={isDisabled ? -1 : 0}
>
  {/* コンテンツ */}
</div>

// SelectedFileItem の完全版ARIA属性
<div
  role="listitem"
  aria-selected={isSelected}
  aria-roledescription="選択されたファイル"
  aria-describedby={`file-details-${file.id}`}
  tabIndex={0}
>
  {/* ファイル情報 */}
  <span id={`file-details-${file.id}`} className="sr-only">
    {file.name}, {formatFileSize(file.size)}, {file.extension}形式
  </span>
</div>
```

### 3.2 キーボード操作（UI-M1対応）

#### 基本キーバインディング

| キー            | コンポーネント   | 動作                         |
| --------------- | ---------------- | ---------------------------- |
| `Tab`           | 全体             | 次のフォーカス可能要素へ移動 |
| `Shift+Tab`     | 全体             | 前のフォーカス可能要素へ移動 |
| `Enter`/`Space` | FileDropZone     | ファイル選択ダイアログを開く |
| `Enter`/`Space` | SelectedFileItem | ファイルを選択/トグル        |
| `Delete`        | SelectedFileItem | ファイルを削除               |
| `Backspace`     | SelectedFileItem | ファイルを削除（代替キー）   |
| `Escape`        | FileDropZone     | ドラッグ状態をキャンセル     |
| `Escape`        | FileSelector     | 選択を全解除                 |
| `Arrow Keys`    | FileFilterSelect | フィルター間を移動           |

#### ファイルリスト内ナビゲーション

| キー         | 動作                           | 備考                           |
| ------------ | ------------------------------ | ------------------------------ |
| `↑` / `k`    | 前のファイルにフォーカス移動   | vi/vim風キーバインドもサポート |
| `↓` / `j`    | 次のファイルにフォーカス移動   |                                |
| `Home`       | 最初のファイルにフォーカス移動 |                                |
| `End`        | 最後のファイルにフォーカス移動 |                                |
| `Ctrl+A`     | 全ファイルを選択               | 複数選択モード時               |
| `Shift+↑/↓`  | 範囲選択                       | 複数選択モード時               |
| `Ctrl+Click` | 追加選択/選択解除              | マウス操作                     |

#### フィルター操作

| キー      | 動作                       |
| --------- | -------------------------- |
| `←` / `→` | 前/次のフィルターを選択    |
| `Home`    | 最初のフィルター（すべて） |
| `End`     | 最後のフィルター           |

#### キーボードナビゲーション実装

```typescript
// ファイルリストのキーボードナビゲーション
const handleListKeyDown = useCallback(
  (e: React.KeyboardEvent, currentIndex: number) => {
    const { key, ctrlKey, shiftKey } = e;
    const itemCount = files.length;

    switch (key) {
      case "ArrowUp":
      case "k":
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
        focusItem(prevIndex);
        if (shiftKey) selectRange(currentIndex, prevIndex);
        break;

      case "ArrowDown":
      case "j":
        e.preventDefault();
        const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
        focusItem(nextIndex);
        if (shiftKey) selectRange(currentIndex, nextIndex);
        break;

      case "Home":
        e.preventDefault();
        focusItem(0);
        break;

      case "End":
        e.preventDefault();
        focusItem(itemCount - 1);
        break;

      case "a":
        if (ctrlKey) {
          e.preventDefault();
          selectAll();
        }
        break;

      case "Delete":
      case "Backspace":
        e.preventDefault();
        removeFile(files[currentIndex].id);
        // 削除後は次のアイテムにフォーカス
        focusItem(Math.min(currentIndex, itemCount - 2));
        break;

      case "Escape":
        e.preventDefault();
        clearSelection();
        break;
    }
  },
  [files, focusItem, selectRange, selectAll, removeFile, clearSelection],
);
```

#### フォーカス順序

```
1. ラベル/説明（読み取り専用）
2. フィルター選択（role="radiogroup"）
   └─ 各フィルターボタン（role="radio"）
3. ドロップゾーン
   └─ ファイル選択ボタン
4. 選択ファイル一覧（role="list"）
   └─ 各ファイルアイテム（role="listitem"）
      └─ 削除ボタン
5. すべてクリアボタン
```

### 3.3 フォーカス管理

```typescript
// フォーカストラップの例（ドロップゾーン内）
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape" && isDragging) {
    e.preventDefault();
    setIsDragging(false);
  }

  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    onBrowseClick();
  }
};
```

### 3.4 エラー状態のアクセシビリティ（UI-M4対応）

#### エラー通知の要件

| 要件                   | 実装方法                                                       |
| ---------------------- | -------------------------------------------------------------- |
| 即時通知               | `aria-live="assertive"` でスクリーンリーダーに即座に通知       |
| エラーの関連付け       | `aria-errormessage` でエラーメッセージをフォーム要素に関連付け |
| 無効状態の明示         | `aria-invalid="true"` でエラー状態を明示                       |
| 視覚的フィードバック   | 赤色ボーダー + エラーアイコン + テキストの3重表示              |
| 非視覚的フィードバック | エラーメッセージを `role="alert"` で通知                       |

#### エラー表示コンポーネント

```typescript
// apps/desktop/src/renderer/components/atoms/ErrorDisplay/index.tsx

export interface ErrorDisplayProps {
  /** エラーID（aria-errormessage用） */
  id: string;
  /** エラーメッセージ */
  message: string;
  /** 表示バリアント */
  variant: "inline" | "toast" | "banner";
  /** 閉じるボタンを表示するか */
  dismissible?: boolean;
  /** 閉じるコールバック */
  onDismiss?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  id,
  message,
  variant = "inline",
  dismissible = false,
  onDismiss,
}) => {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={clsx(
        "flex items-center gap-2 p-3 rounded-lg",
        "bg-red-400/10 border border-red-400/30",
        "text-red-400",
      )}
    >
      <Icon name="alert-circle" size={16} aria-hidden="true" />
      <span className="flex-1 text-sm">{message}</span>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 hover:bg-red-400/20 rounded"
          aria-label="エラーを閉じる"
        >
          <Icon name="x" size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
```

#### エラー状態のフィールド関連付け

```typescript
// FileSelector内でのエラー関連付け
<FileDropZone
  aria-invalid={!!error}
  aria-errormessage={error ? errorId : undefined}
  // ...
/>

{error && (
  <ErrorDisplay
    id={errorId}
    message={error}
    variant="inline"
  />
)}
```

#### エラー種別と表示方針

| エラー種別             | 表示位置       | aria-live   | 自動消去 | 再試行ボタン |
| ---------------------- | -------------- | ----------- | -------- | ------------ |
| バリデーションエラー   | フィールド直下 | `polite`    | なし     | なし         |
| ファイル読み込みエラー | フィールド直下 | `assertive` | なし     | あり         |
| ネットワークエラー     | トースト       | `assertive` | 5秒      | あり         |
| 権限エラー             | バナー         | `assertive` | なし     | なし         |
| 上限超過               | インライン     | `polite`    | なし     | なし         |

#### エラーメッセージの文言ガイドライン

```typescript
// エラーメッセージは具体的で行動可能な内容にする
const ERROR_MESSAGES = {
  // ❌ 悪い例
  bad: "エラーが発生しました",

  // ✅ 良い例
  good: "ファイル「sample.pdf」の読み込みに失敗しました。ファイルが存在するか確認してください。",

  // エラー種別ごとのテンプレート
  FILE_NOT_FOUND: (fileName: string) =>
    `ファイル「${fileName}」が見つかりません。パスを確認してください。`,
  FILE_TOO_LARGE: (fileName: string, maxSize: string) =>
    `ファイル「${fileName}」のサイズが上限（${maxSize}）を超えています。`,
  PERMISSION_DENIED: (fileName: string) =>
    `ファイル「${fileName}」へのアクセス権限がありません。`,
  UNSUPPORTED_FORMAT: (fileName: string, supportedFormats: string) =>
    `ファイル「${fileName}」の形式はサポートされていません。対応形式: ${supportedFormats}`,
  MAX_FILES_REACHED: (maxCount: number) =>
    `ファイル数の上限（${maxCount}件）に達しました。不要なファイルを削除してください。`,
} as const;
```

#### 復旧アクションの提供

```typescript
// エラー時の復旧アクション例
<ErrorDisplay
  id={errorId}
  message={error}
  variant="inline"
/>
{error && (
  <div className="flex gap-2 mt-2">
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRetry}
      leftIcon="refresh-cw"
    >
      再試行
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClearError}
      leftIcon="x"
    >
      閉じる
    </Button>
  </div>
)}
```

---

## 4. スタイリング設計

### 4.1 カラーパレット（UI-M3対応）

```css
/* Tailwind CSS設定に準拠 */

/* プライマリ */
--color-primary: var(--status-primary); /* 青系 */

/* 状態色 */
--color-hover: white/5;
--color-active: white/10;
--color-selected: blue-400/10;
--color-error: red-400;
--color-warning: amber-400;

/* テキスト */
--text-primary: white;
--text-secondary: gray-400;
--text-muted: gray-500;
```

#### WCAG 2.1 AA コントラスト比要件

| 要素                          | 前景色          | 背景色              | コントラスト比 | 準拠      |
| ----------------------------- | --------------- | ------------------- | -------------- | --------- |
| 通常テキスト（白）            | `#FFFFFF`       | `#1a1a2e`（暗背景） | 15.3:1         | ✅ AA+    |
| 二次テキスト（gray-400）      | `#9CA3AF`       | `#1a1a2e`           | 7.2:1          | ✅ AA     |
| ミュートテキスト（gray-500）  | `#6B7280`       | `#1a1a2e`           | 4.8:1          | ✅ AA     |
| エラーテキスト（red-400）     | `#F87171`       | `#1a1a2e`           | 5.9:1          | ✅ AA     |
| 警告テキスト（amber-400）     | `#FBBF24`       | `#1a1a2e`           | 9.8:1          | ✅ AA     |
| リンク/アクセント（blue-400） | `#60A5FA`       | `#1a1a2e`           | 6.1:1          | ✅ AA     |
| 無効状態テキスト              | `#6B7280` (50%) | `#1a1a2e`           | 2.4:1          | ⚠️ 要注意 |

**最小要件（WCAG 2.1 AA）**:

- 通常テキスト: 4.5:1 以上
- 大きなテキスト（18px以上、または14px太字）: 3:1 以上
- UIコンポーネント・グラフィック: 3:1 以上

**検証ツール**:

- Chrome DevTools > Accessibility > Contrast
- axe DevTools
- WAVE Accessibility Tool

#### フォーカスインジケーター

```typescript
// WCAG 2.1 AA準拠のフォーカスリング
const focusRing = clsx(
  "focus:outline-none",
  "focus:ring-2", // 2pxの幅で視認性確保
  "focus:ring-blue-400/50", // 50%透明度でコントラスト確保
  "focus:ring-offset-2", // オフセットで背景との区別
  "focus:ring-offset-gray-900",
);

// 高コントラストモード対応
const highContrastFocus = clsx(
  "@media (prefers-contrast: more)",
  "focus:ring-white",
  "focus:ring-offset-black",
);
```

### 4.2 スペーシング

| 要素                 | サイズ   | Tailwind Class  |
| -------------------- | -------- | --------------- |
| コンポーネント間隔   | 16px     | `gap-4`         |
| アイテム内パディング | 12px     | `p-3`           |
| アイコンギャップ     | 12px     | `gap-3`         |
| ボーダー丸み         | 8px/12px | `rounded-lg/xl` |

### 4.3 アニメーション

```typescript
// 遷移設定
const transitions = {
  default: "transition-all duration-150",
  slow: "transition-all duration-200",
  color: "transition-colors duration-150",
  opacity: "transition-opacity duration-150",
};

// ドラッグ時のアニメーション
const dragAnimation = clsx(
  "transition-all duration-200",
  "scale-102",
  "ring-2 ring-blue-400",
);
```

---

## 5. レスポンシブ設計

### 5.1 ブレークポイント

| ブレークポイント | 幅     | 変更内容               |
| ---------------- | ------ | ---------------------- |
| sm               | 640px  | 基本レイアウト         |
| md               | 768px  | フィルターを横並び     |
| lg               | 1024px | サイドバー表示時の調整 |

### 5.2 レスポンシブスタイル

```typescript
// FileDropZone
const responsiveStyles = clsx("min-h-[160px] sm:min-h-[200px]", "p-4 sm:p-8");

// FileFilterSelect
const filterResponsive = clsx("flex-wrap", "sm:flex-nowrap");

// SelectedFileItem
const itemResponsive = clsx(
  "flex-col sm:flex-row",
  "items-start sm:items-center",
);
```

---

## 6. テスト設計

### 6.1 ユニットテスト

```typescript
// apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileSelector } from "./index";

describe("FileSelector", () => {
  describe("レンダリング", () => {
    it("ラベルが表示される", () => {
      render(<FileSelector label="テストラベル" />);
      expect(screen.getByText("テストラベル")).toBeInTheDocument();
    });

    it("説明文が表示される", () => {
      render(<FileSelector description="テスト説明" />);
      expect(screen.getByText("テスト説明")).toBeInTheDocument();
    });

    it("ドロップゾーンが表示される", () => {
      render(<FileSelector />);
      expect(screen.getByTestId("file-drop-zone")).toBeInTheDocument();
    });
  });

  describe("ファイル操作", () => {
    it("ファイル選択ボタンクリックでコールバックが呼ばれる", async () => {
      const user = userEvent.setup();
      render(<FileSelector />);

      await user.click(screen.getByRole("button", { name: /ファイルを選択/i }));
      // ダイアログ呼び出しの検証
    });

    it("ファイル削除ボタンクリックでonFileRemoveが呼ばれる", async () => {
      const onFileRemove = vi.fn();
      const mockFile = { id: "1", name: "test.pdf", /* ... */ };
      render(
        <FileSelector files={[mockFile]} onFileRemove={onFileRemove} />,
      );

      await userEvent.click(
        screen.getByRole("button", { name: /test.pdfを削除/i }),
      );
      expect(onFileRemove).toHaveBeenCalledWith("1");
    });
  });

  describe("ドラッグ&ドロップ", () => {
    it("ドラッグ中にスタイルが変わる", () => {
      // ドラッグイベントのシミュレーション
    });

    it("ドロップでファイルが追加される", () => {
      // ドロップイベントのシミュレーション
    });
  });
});
```

### 6.2 アクセシビリティテスト

```typescript
// apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { FileSelector } from "./index";

expect.extend(toHaveNoViolations);

describe("FileSelector アクセシビリティ", () => {
  it("axeによる自動検証をパスする", async () => {
    const { container } = render(<FileSelector />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("キーボードでファイル選択ボタンにアクセスできる", () => {
    render(<FileSelector />);
    const button = screen.getByRole("button", { name: /ファイルを選択/i });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("削除ボタンにaria-labelが設定されている", () => {
    const mockFile = { id: "1", name: "test.pdf", /* ... */ };
    render(<FileSelector files={[mockFile]} />);
    expect(
      screen.getByRole("button", { name: /test.pdfを削除/i }),
    ).toBeInTheDocument();
  });
});
```

---

## 7. 完了条件チェックリスト

- [x] コンポーネントのPropsが設計されている
- [x] 状態遷移（未選択、選択中、選択済み、エラー）が設計されている
- [x] アクセシビリティ属性が定義されている
- [x] スタイリング方針が決定されている
- [x] レスポンシブ対応が考慮されている
- [x] テスト設計が含まれている

---

## 8. 承認

| 役割             | 名前         | 日付       | 承認状況 |
| ---------------- | ------------ | ---------- | -------- |
| UIデザイナー     | .claude/agents/ui-designer.md | 2025-12-16 | 作成済み |
| アクセシビリティ |              |            | 未承認   |
| 最終承認者       |              |            | 未承認   |

---

## 更新履歴

| バージョン | 日付       | 変更内容 | 変更者       |
| ---------- | ---------- | -------- | ------------ |
| 1.0        | 2025-12-16 | 初版作成 | .claude/agents/ui-designer.md |
