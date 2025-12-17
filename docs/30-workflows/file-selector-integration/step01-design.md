# Step 01: 設計書 - FileSelectorModal コンポーネント

## 概要

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | T-01-1, T-01-2                   |
| フェーズ   | Phase 1: 設計                    |
| 作成日     | 2025-12-16                       |
| ステータス | 完了                             |
| 参照元     | MobileDrawer（既存モーダル実装） |

## 1. コンポーネント設計

### 1.1 アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                   FileSelectorModal                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Portal (document.body)                              │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Overlay (クリックで閉じる)                   │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │  Modal Container (GlassPanel)       │    │    │    │
│  │  │  │  ┌─────────────────────────────┐    │    │    │    │
│  │  │  │  │  Header                      │    │    │    │    │
│  │  │  │  │  - タイトル                   │    │    │    │    │
│  │  │  │  │  - 閉じるボタン               │    │    │    │    │
│  │  │  │  └─────────────────────────────┘    │    │    │    │
│  │  │  │  ┌─────────────────────────────┐    │    │    │    │
│  │  │  │  │  Body                        │    │    │    │    │
│  │  │  │  │  - FileSelector コンポーネント │    │    │    │    │
│  │  │  │  └─────────────────────────────┘    │    │    │    │
│  │  │  │  ┌─────────────────────────────┐    │    │    │    │
│  │  │  │  │  Footer                      │    │    │    │    │
│  │  │  │  │  - キャンセルボタン           │    │    │    │    │
│  │  │  │  │  - 確定ボタン                │    │    │    │    │
│  │  │  │  └─────────────────────────────┘    │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Props定義

```typescript
import type { SelectedFile } from "@repo/shared/types";

export interface FileSelectorModalProps {
  /** モーダルの開閉状態 */
  open: boolean;

  /** モーダルを閉じるコールバック */
  onClose: () => void;

  /** ファイル選択確定時のコールバック */
  onConfirm: (files: SelectedFile[]) => void;

  /** モーダルのタイトル（オプション） */
  title?: string;

  /** 確定ボタンのラベル（オプション） */
  confirmLabel?: string;

  /** キャンセルボタンのラベル（オプション） */
  cancelLabel?: string;

  /** 追加のCSSクラス */
  className?: string;
}
```

### 1.3 デフォルト値

| プロパティ     | デフォルト値       |
| -------------- | ------------------ |
| `title`        | `"ファイルを選択"` |
| `confirmLabel` | `"選択"`           |
| `cancelLabel`  | `"キャンセル"`     |

## 2. 動作仕様

### 2.1 開閉アニメーション

```css
/* Overlay */
.overlay {
  transition: opacity 200ms ease-out;
}
.overlay-enter {
  opacity: 0;
}
.overlay-enter-active {
  opacity: 1;
}

/* Modal */
.modal {
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}
.modal-enter {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}
.modal-enter-active {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

### 2.2 オーバーレイ動作

| イベント             | 動作                           |
| -------------------- | ------------------------------ |
| オーバーレイクリック | `onClose()` を呼び出し         |
| モーダル内クリック   | イベント伝播を停止（閉じない） |
| ESCキー押下          | `onClose()` を呼び出し         |
| 確定ボタンクリック   | `onConfirm(files)` を呼び出し  |
| キャンセルボタン     | `onClose()` を呼び出し         |

### 2.3 フォーカス管理

```
モーダル開く
    │
    ▼
┌─────────────────────────────┐
│ 1. 前のアクティブ要素を保存  │
│ 2. モーダル内にフォーカス移動│
│ 3. フォーカストラップ有効化  │
└─────────────────────────────┘
    │
    ▼
モーダル閉じる
    │
    ▼
┌─────────────────────────────┐
│ 1. フォーカストラップ解除    │
│ 2. 前のアクティブ要素に戻す  │
└─────────────────────────────┘
```

## 3. キーボード操作

| キー          | 動作                               |
| ------------- | ---------------------------------- |
| `Escape`      | モーダルを閉じる                   |
| `Tab`         | モーダル内の次の要素にフォーカス   |
| `Shift + Tab` | モーダル内の前の要素にフォーカス   |
| `Enter`       | フォーカス中のボタンをアクティブ化 |
| `Space`       | フォーカス中のボタンをアクティブ化 |

## 4. アクセシビリティ

### 4.1 ARIA属性

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="file-selector-modal-title"
  aria-describedby="file-selector-modal-description"
>
  <h2 id="file-selector-modal-title">{title}</h2>
  <p id="file-selector-modal-description" className="sr-only">
    ファイルを選択してください。Escapeキーで閉じることができます。
  </p>
  {/* ... */}
</div>
```

### 4.2 スクリーンリーダー対応

- モーダル開閉時にアナウンス
- 選択ファイル数の変更をライブリージョンで通知
- ボタンに適切な `aria-label` を設定

## 5. 状態管理設計 (T-01-2)

### 5.1 useFileSelectorModal フック

```typescript
interface UseFileSelectorModalReturn {
  /** モーダルの開閉状態 */
  isOpen: boolean;

  /** モーダルを開く */
  openModal: () => void;

  /** モーダルを閉じる */
  closeModal: () => void;

  /** 選択されたファイル */
  selectedFiles: SelectedFile[];

  /** ファイル選択を確定 */
  confirmSelection: () => SelectedFile[];

  /** 選択をリセット */
  resetSelection: () => void;
}

export function useFileSelectorModal(): UseFileSelectorModalReturn {
  const [isOpen, setIsOpen] = useState(false);

  // 既存のファイル選択ストアから取得
  const selectedFiles = useSelectedFiles();
  const clearFiles = useClearFiles();

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const confirmSelection = useCallback(() => {
    const files = [...selectedFiles];
    setIsOpen(false);
    return files;
  }, [selectedFiles]);

  const resetSelection = useCallback(() => {
    clearFiles();
  }, [clearFiles]);

  return {
    isOpen,
    openModal,
    closeModal,
    selectedFiles,
    confirmSelection,
    resetSelection,
  };
}
```

### 5.2 状態フロー

```
┌──────────────────────────────────────────────────────────┐
│                    状態フロー                              │
└──────────────────────────────────────────────────────────┘

openModal()
    │
    ▼
┌─────────┐     addFiles()     ┌─────────────┐
│ isOpen: │────────────────────▶│ selectedFiles│
│  true   │◀────────────────────│ [...]        │
└─────────┘     removeFile()   └─────────────┘
    │
    │ confirmSelection() or closeModal()
    ▼
┌─────────┐
│ isOpen: │
│  false  │
└─────────┘
```

## 6. レスポンシブ対応

### 6.1 ブレークポイント

| 画面サイズ          | モーダル幅   | 高さ                   |
| ------------------- | ------------ | ---------------------- |
| Desktop (≥1024px)   | 600px (固定) | auto (最大80vh)        |
| Tablet (768-1023px) | 90vw         | auto (最大80vh)        |
| Mobile (≤767px)     | 100vw        | 100vh (フルスクリーン) |

### 6.2 Tailwind CSS クラス

```tsx
<div className={clsx(
  // Base
  "relative flex flex-col",
  "bg-[var(--bg-glass)] backdrop-blur-xl",
  "border border-[var(--border-subtle)]",
  "rounded-lg shadow-2xl",

  // Responsive width
  "w-full max-w-[600px]",
  "md:w-[90vw]",
  "lg:w-[600px]",

  // Responsive height
  "max-h-[80vh]",
  "sm:max-h-[100vh] sm:h-screen sm:rounded-none",
  "md:max-h-[80vh] md:h-auto md:rounded-lg",
)}>
```

## 7. ファイル構成

```
apps/desktop/src/renderer/components/organisms/FileSelectorModal/
├── index.tsx                    # メインコンポーネント
├── FileSelectorModal.test.tsx   # ユニットテスト
├── useFileSelectorModal.ts      # カスタムフック
└── useFileSelectorModal.test.ts # フックテスト
```

## 8. 依存関係

### 8.1 インポート

```typescript
// React
import React, { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

// External
import clsx from "clsx";

// Internal Components
import { Button } from "../../atoms/Button";
import { GlassPanel } from "../GlassPanel";
import { FileSelector } from "../FileSelector/FileSelector";

// Store
import { useSelectedFiles, useClearFiles } from "../../../store";

// Types
import type { SelectedFile } from "@repo/shared/types";
```

### 8.2 依存コンポーネント

| コンポーネント | 用途                  |
| -------------- | --------------------- |
| `Button`       | 確定/キャンセルボタン |
| `GlassPanel`   | モーダルコンテナ      |
| `FileSelector` | ファイル選択UI        |
| `Icon`         | 閉じるボタンアイコン  |

---

# FileSelectorTrigger コンポーネント設計

## 概要

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| タスクID | T-01-2                                |
| 種類     | molecule                              |
| 配置先   | WorkspaceSidebar内                    |
| 目的     | FileSelectorModalを開くトリガーボタン |

## 10. トリガーボタン設計

### 10.1 Props定義

```typescript
export interface FileSelectorTriggerProps {
  /** クリック時のコールバック */
  onClick: () => void;

  /** ボタンのバリエーション */
  variant?: "default" | "compact" | "icon-only";

  /** ボタンのサイズ */
  size?: "sm" | "md" | "lg";

  /** 無効状態 */
  disabled?: boolean;

  /** ローディング状態 */
  loading?: boolean;

  /** カスタムラベル */
  label?: string;

  /** 追加のCSSクラス */
  className?: string;
}
```

### 10.2 デフォルト値

| プロパティ | デフォルト値       |
| ---------- | ------------------ |
| `variant`  | `"default"`        |
| `size`     | `"md"`             |
| `disabled` | `false`            |
| `loading`  | `false`            |
| `label`    | `"ファイルを追加"` |

### 10.3 バリエーション

```
┌─────────────────────────────────────────────────────────────┐
│                    variant: "default"                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [+] ファイルを追加                                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                    variant: "compact"                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [+] 追加                                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                    variant: "icon-only"                      │
│  ┌───────┐                                                  │
│  │  [+]  │                                                  │
│  └───────┘                                                  │
└─────────────────────────────────────────────────────────────┘
```

### 10.4 サイズバリエーション

| サイズ | パディング  | フォントサイズ | アイコンサイズ |
| ------ | ----------- | -------------- | -------------- |
| `sm`   | `px-2 py-1` | `text-xs`      | 14px           |
| `md`   | `px-3 py-2` | `text-sm`      | 16px           |
| `lg`   | `px-4 py-3` | `text-base`    | 18px           |

### 10.5 アイコン

| 状態    | アイコン名 | 説明                     |
| ------- | ---------- | ------------------------ |
| 通常    | `plus`     | ファイル追加を示す       |
| Loading | `loader-2` | スピンアニメーション付き |

### 10.6 状態別スタイル

```typescript
// Base styles
const baseStyles = clsx(
  "inline-flex items-center justify-center gap-2",
  "rounded-lg font-medium transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:ring-offset-2",
  "focus:ring-offset-gray-900 focus:ring-[var(--status-primary)]",
);

// State styles
const stateStyles = {
  default: clsx(
    "bg-white/10 text-white",
    "hover:bg-white/15",
    "active:bg-white/20",
  ),
  hover: clsx("bg-white/15", "shadow-sm"),
  focus: clsx(
    "ring-2 ring-[var(--status-primary)]",
    "ring-offset-2 ring-offset-gray-900",
  ),
  active: clsx("bg-white/20", "scale-[0.98]"),
  disabled: clsx("opacity-50", "cursor-not-allowed", "pointer-events-none"),
};
```

### 10.7 Tailwind CSS 実装

```tsx
<button
  type="button"
  onClick={onClick}
  disabled={disabled || loading}
  className={clsx(
    // Base
    "inline-flex items-center justify-center gap-2",
    "rounded-lg font-medium transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "focus:ring-offset-gray-900 focus:ring-[var(--status-primary)]",

    // Variant: default
    variant === "default" &&
      "bg-white/10 text-white hover:bg-white/15 active:bg-white/20",

    // Size
    size === "sm" && "px-2 py-1 text-xs",
    size === "md" && "px-3 py-2 text-sm",
    size === "lg" && "px-4 py-3 text-base",

    // Disabled
    (disabled || loading) && "opacity-50 cursor-not-allowed",

    className,
  )}
  aria-label={variant === "icon-only" ? label : undefined}
  aria-busy={loading}
  aria-disabled={disabled || loading}
>
  {loading ? (
    <Icon name="loader-2" size={iconSize[size]} spin aria-hidden="true" />
  ) : (
    <Icon name="plus" size={iconSize[size]} aria-hidden="true" />
  )}
  {variant !== "icon-only" && (
    <span>{variant === "compact" ? "追加" : label}</span>
  )}
</button>
```

### 10.8 アクセシビリティ

| 属性            | 値                | 条件            |
| --------------- | ----------------- | --------------- |
| `aria-label`    | `{label}`         | icon-onlyの場合 |
| `aria-busy`     | `true`/`false`    | loading状態     |
| `aria-disabled` | `true`/`false`    | disabled状態    |
| `role`          | `button` (暗黙的) | -               |

### 10.9 キーボード操作

| キー    | 動作           |
| ------- | -------------- |
| `Enter` | onClick を実行 |
| `Space` | onClick を実行 |
| `Tab`   | 次の要素へ移動 |

### 10.10 使用例

```tsx
// WorkspaceSidebar内での使用
import { FileSelectorTrigger } from "../molecules/FileSelectorTrigger";
import {
  FileSelectorModal,
  useFileSelectorModal,
} from "../organisms/FileSelectorModal";

const WorkspaceSidebar: React.FC = () => {
  const { isOpen, openModal, closeModal, confirmSelection } =
    useFileSelectorModal();

  const handleConfirm = (files: SelectedFile[]) => {
    console.log("Selected files:", files);
    // ファイル処理ロジック
  };

  return (
    <aside>
      {/* 既存のフォルダツリー */}

      {/* ファイル追加トリガー */}
      <FileSelectorTrigger onClick={openModal} />

      {/* モーダル */}
      <FileSelectorModal
        open={isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
      />
    </aside>
  );
};
```

### 10.11 ファイル構成

```
apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/
├── index.tsx                      # メインコンポーネント
└── FileSelectorTrigger.test.tsx   # ユニットテスト
```

> **注記**: FileSelectorTriggerは当初moleculesに配置予定でしたが、
> FileSelectorModal（organisms）に依存するため、Atomic Design原則に従い
> organismsに配置されています。

## 11. 完了条件チェックリスト

### T-01-1: モーダルUI設計

- [x] モーダルのProps定義が完了している
- [x] 開閉アニメーションが設計されている
- [x] オーバーレイ動作が定義されている
- [x] キーボード操作（Escape閉じ）が考慮されている

### T-01-2: トリガーボタン設計

- [x] ボタンのバリエーション（サイズ、状態）が定義されている
- [x] アイコンとラベルが決定されている
- [x] hover/focus/active状態が設計されている

### T-01-3: 状態管理設計

- [x] useFileSelectorModalフックが設計されている
- [x] 状態フローが定義されている
- [x] ストア連携方法が明確である

---

**次のステップ:** Phase 2: 専門レビュー (T-02-1, T-02-2, T-02-3)

## 関連タスク

- [ディレクトリツリー選択機能](../unassigned-task/task-01-selectable-directory-tree.md) - 次期実装予定
