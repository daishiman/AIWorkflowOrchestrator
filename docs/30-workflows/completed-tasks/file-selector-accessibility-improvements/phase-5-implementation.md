# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 5                                                    |
| Phase名    | 実装（TDD: Green）                                   |
| 前提Phase  | Phase 4                                              |
| 後続Phase  | Phase 6                                              |
| ステータス | 未実施                                               |
| 作成日     | 2026-01-13                                           |
| 機能名     | FileSelector アクセシビリティ改善（WCAG 2.1 AA準拠） |

---

## 目的

Phase 4で作成したテストを通過させる最小限の実装を行う（Green状態）。TDDのGreenフェーズとして、テストを通すことに集中する。

## 背景

Phase 4で作成したテストケースに基づき、以下を実装する:

- useFocusTrapカスタムフック
- FileSelectorModalのaria属性とフォーカストラップ統合
- FileSelectorTriggerのaria属性
- FileSelectorFileListのrole/aria属性とaria-live通知

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: useFocusTrap カスタムフック実装

**目的**: フォーカストラップの再利用可能なカスタムフックを実装する

**実行手順**:

1. フックファイルを作成:
   - `apps/desktop/src/renderer/hooks/useFocusTrap.ts`

2. 実装コード:

```typescript
import { RefObject, useCallback, useEffect, useRef } from "react";

export interface UseFocusTrapOptions {
  initialFocusSelector?: string;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
}

export interface UseFocusTrapReturn {
  activate: () => void;
  deactivate: () => void;
  isActive: boolean;
}

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  options: UseFocusTrapOptions = {},
): UseFocusTrapReturn {
  const {
    initialFocusSelector,
    returnFocusOnDeactivate = true,
    escapeDeactivates = true,
  } = options;

  const previousActiveElement = useRef<HTMLElement | null>(null);
  const isActiveRef = useRef(isActive);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
  }, [containerRef]);

  const activate = useCallback(() => {
    if (!containerRef.current) return;

    previousActiveElement.current = document.activeElement as HTMLElement;
    isActiveRef.current = true;

    // 初期フォーカス設定
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      let elementToFocus: HTMLElement | null = null;

      if (initialFocusSelector) {
        elementToFocus =
          containerRef.current.querySelector(initialFocusSelector);
      }

      if (!elementToFocus) {
        const focusable = getFocusableElements();
        elementToFocus = focusable[0] || null;
      }

      elementToFocus?.focus();
    });
  }, [containerRef, initialFocusSelector, getFocusableElements]);

  const deactivate = useCallback(() => {
    isActiveRef.current = false;

    if (returnFocusOnDeactivate && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [returnFocusOnDeactivate]);

  // Tab キーハンドリング
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActiveRef.current) return;

      if (event.key === "Escape" && escapeDeactivates) {
        deactivate();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    isActive,
    containerRef,
    escapeDeactivates,
    deactivate,
    getFocusableElements,
  ]);

  return {
    activate,
    deactivate,
    isActive: isActiveRef.current,
  };
}
```

3. テスト実行で確認:

```bash
pnpm --filter @repo/desktop test:run -- useFocusTrap
```

**期待される成果物**:

- useFocusTrap.ts ファイル

---

### タスク2: FileSelectorModal aria属性とフォーカストラップ実装

**目的**: FileSelectorModalにaria属性を追加し、useFocusTrapを統合する

**実行手順**:

1. FileSelectorModal.tsx を修正:

```typescript
import { useRef, useEffect } from 'react';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

interface FileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... その他のprops
}

export function FileSelectorModal({ isOpen, onClose, ...props }: FileSelectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const { activate, deactivate } = useFocusTrap(modalRef, isOpen, {
    initialFocusSelector: '[data-autofocus]',
    returnFocusOnDeactivate: true,
    escapeDeactivates: false, // 独自でEscape処理を行う
  });

  useEffect(() => {
    if (isOpen) {
      activate();
    } else {
      deactivate();
    }
  }, [isOpen, activate, deactivate]);

  // Escapeキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      id="file-selector-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="file-selector-modal-title"
      aria-describedby="file-selector-modal-description"
      // ... その他の属性
    >
      <h2 id="file-selector-modal-title">ファイルを選択</h2>
      <p id="file-selector-modal-description" className="sr-only">
        上下矢印キーでファイルを選択し、Enterキーで決定します。Escapeキーで閉じます。
      </p>
      {/* モーダルコンテンツ */}
    </div>
  );
}
```

2. テスト実行で確認:

```bash
pnpm --filter @repo/desktop test:run -- FileSelectorModal.accessibility
```

**期待される成果物**:

- FileSelectorModal.tsx の修正

---

### タスク3: FileSelectorTrigger aria属性実装

**目的**: FileSelectorTriggerに適切なaria属性を追加する

**実行手順**:

1. FileSelectorTrigger.tsx を修正:

```typescript
interface FileSelectorTriggerProps {
  isOpen: boolean;
  selectedFileName?: string;
  onClick: () => void;
  // ... その他のprops
}

export function FileSelectorTrigger({
  isOpen,
  selectedFileName,
  onClick,
  ...props
}: FileSelectorTriggerProps) {
  const ariaLabel = selectedFileName
    ? `選択中: ${selectedFileName}。クリックしてファイルを変更`
    : 'ファイルを選択';

  return (
    <button
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={ariaLabel}
      aria-controls="file-selector-modal"
      onClick={onClick}
      {...props}
    >
      {/* ボタンコンテンツ */}
    </button>
  );
}
```

2. テスト実行で確認:

```bash
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.accessibility
```

**期待される成果物**:

- FileSelectorTrigger.tsx の修正

---

### タスク4: FileSelectorFileList role/aria属性実装

**目的**: FileSelectorFileListにrole属性とaria-selected属性を追加する

**実行手順**:

1. FileSelectorFileList.tsx を修正:

```typescript
interface FileSelectorFileListProps {
  files: FileItem[];
  selectedFiles: FileItem[];
  onSelectFile: (file: FileItem) => void;
  multiple?: boolean;
  // ... その他のprops
}

export function FileSelectorFileList({
  files,
  selectedFiles,
  onSelectFile,
  multiple = false,
  ...props
}: FileSelectorFileListProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const isSelected = (file: FileItem) =>
    selectedFiles.some(f => f.path === file.path);

  const handleKeyDown = (event: React.KeyboardEvent, file: FileItem, index: number) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(Math.min(index + 1, files.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(Math.max(index - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(files.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelectFile(file);
        break;
    }
  };

  // フォーカス管理
  useEffect(() => {
    const items = listRef.current?.querySelectorAll('[role="option"]');
    items?.[focusedIndex]?.focus();
  }, [focusedIndex]);

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="ファイル一覧"
      aria-multiselectable={multiple}
      {...props}
    >
      {files.map((file, index) => (
        <li
          key={file.path}
          role="option"
          aria-selected={isSelected(file)}
          tabIndex={index === focusedIndex ? 0 : -1}
          onClick={() => onSelectFile(file)}
          onKeyDown={(e) => handleKeyDown(e, file, index)}
        >
          {/* ファイル項目コンテンツ */}
        </li>
      ))}
    </ul>
  );
}
```

2. テスト実行で確認:

```bash
pnpm --filter @repo/desktop test:run -- FileSelectorFileList.accessibility
```

**期待される成果物**:

- FileSelectorFileList.tsx の修正

---

### タスク5: aria-live通知実装

**目的**: ファイル選択時のスクリーンリーダー通知を実装する

**実行手順**:

1. FileSelectorFileList.tsx に aria-live 領域を追加:

```typescript
export function FileSelectorFileList({
  files,
  selectedFiles,
  onSelectFile,
  multiple = false,
  ...props
}: FileSelectorFileListProps) {
  const [announcement, setAnnouncement] = useState('');
  // ... 他の state

  const handleSelect = (file: FileItem) => {
    const isCurrentlySelected = isSelected(file);
    const message = isCurrentlySelected
      ? `${file.name}の選択を解除しました`
      : `${file.name}を選択しました`;

    setAnnouncement(message);
    onSelectFile(file);

    // アナウンス後にクリア（次のアナウンスのため）
    setTimeout(() => setAnnouncement(''), 1000);
  };

  return (
    <>
      {/* スクリーンリーダー通知用の非表示領域 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <ul role="listbox" aria-label="ファイル一覧">
        {/* ... リストコンテンツ */}
      </ul>
    </>
  );
}
```

2. テスト実行で確認:

```bash
pnpm --filter @repo/desktop test:run -- aria-live
```

**期待される成果物**:

- FileSelectorFileList.tsx の修正（aria-live追加）

---

### タスク6: Green状態確認

**目的**: 全てのテストが成功状態（Green）であることを確認する

**実行手順**:

1. 全テストを実行:

```bash
pnpm --filter @repo/desktop test:run -- --grep "アクセシビリティ"
```

2. 全てのテストが成功することを確認

3. 成功状況を記録

**期待される成果物**:

- Green状態確認レポート（outputs/phase-5/green-state-verification.md）

---

## 参照資料

| 参照資料                 | パス                                                                       | 内容                       |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------- |
| Phase 2設計書            | `outputs/phase-2/`                                                         | 実装仕様                   |
| Phase 4テスト            | テストファイル                                                             | テストケース               |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | 既存のアクセシビリティ仕様 |

---

## 成果物

| 成果物                   | パス                                                                                   | 内容                     |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------ |
| useFocusTrap             | `apps/desktop/src/renderer/hooks/useFocusTrap.ts`                                      | フォーカストラップフック |
| FileSelectorModal修正    | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorModal.tsx`    | aria属性追加             |
| FileSelectorTrigger修正  | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorTrigger.tsx`  | aria属性追加             |
| FileSelectorFileList修正 | `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelectorFileList.tsx` | role/aria属性追加        |
| Green状態確認レポート    | `outputs/phase-5/green-state-verification.md`                                          | テスト成功状態の確認     |

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 5での統合テスト連携アクション

- [ ] フロントエンド・バックエンド接続の実装（該当する場合）
- [ ] テスト支援コードの整備
- [ ] useFocusTrapとFileSelectorModalの統合確認

---

## 完了条件

- [ ] useFocusTrapが実装されている
- [ ] FileSelectorModalにaria属性が追加されている
- [ ] FileSelectorTriggerにaria属性が追加されている
- [ ] FileSelectorFileListにrole/aria属性が追加されている
- [ ] aria-live通知が実装されている
- [ ] 全てのテストが成功状態（Green）である
- [ ] Green状態確認レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- --grep "アクセシビリティ"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/file-selector-accessibility-improvements/phase-6-test-expansion.md`
