# FileSelector アクセシビリティ改善 実装ガイド

## 概要

本ドキュメントは、FileSelectorコンポーネント群のWCAG 2.1 AA準拠を達成するための実装ガイドです。

---

## Part 1: 概念ガイド

### 1.1 アーキテクチャ概要

```
FileSelectorTrigger ─────────────────────────────────────────┐
│ aria-expanded={isOpen}                                      │
│ aria-haspopup="dialog"                                      │
│ aria-controls="file-selector-modal"                         │
└─────────────┬───────────────────────────────────────────────┘
              │ click
              ▼
FileSelectorModal ────────────────────────────────────────────┐
│ role="dialog"                                               │
│ aria-modal="true"                                           │
│ aria-labelledby="file-selector-modal-title"                 │
│                                                             │
│   ┌─ useFocusTrap ────────────────────────────────────────┐ │
│   │ • Focus moves to modal on open                        │ │
│   │ • Tab cycles within modal                             │ │
│   │ • Focus returns to trigger on close                   │ │
│   └───────────────────────────────────────────────────────┘ │
│                                                             │
│   FileSelectorFileList ───────────────────────────────────┐ │
│   │ role="listbox"                                        │ │
│   │ aria-label="ファイル一覧"                             │ │
│   │                                                       │ │
│   │   <li role="option" aria-selected={selected}>         │ │
│   │   <li role="option" aria-selected={selected}>         │ │
│   └───────────────────────────────────────────────────────┘ │
│                                                             │
│   <div aria-live="polite">                                  │
│     {/* 選択通知 */}                                        │
│   </div>                                                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 WCAG要件マッピング

| WCAG基準 | 実装要件                       | 対象コンポーネント   |
| -------- | ------------------------------ | -------------------- |
| 2.4.3    | フォーカス移動・トラップ・復元 | useFocusTrap         |
| 4.1.2    | aria-expanded状態同期          | FileSelectorTrigger  |
| 4.1.2    | aria-selected状態同期          | FileSelectorFileList |
| 4.1.2    | role="dialog"                  | FileSelectorModal    |
| 1.3.1    | role="listbox", role="option"  | FileSelectorFileList |
| 4.1.3    | aria-live通知                  | FileSelectorModal    |

---

## Part 2: 技術リファレンス

### 2.1 useFocusTrap フック

#### インターフェース

```typescript
interface UseFocusTrapOptions {
  initialFocusSelector?: string;
  returnFocusOnDeactivate?: boolean;
  escapeDeactivates?: boolean;
}

interface UseFocusTrapReturn {
  activate: () => void;
  deactivate: () => void;
  isActive: boolean;
}

function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean,
  options?: UseFocusTrapOptions,
): UseFocusTrapReturn;
```

#### 使用例

```typescript
const modalRef = useRef<HTMLDivElement>(null);
const { activate, deactivate } = useFocusTrap(modalRef, isOpen, {
  initialFocusSelector: "[data-autofocus]",
  returnFocusOnDeactivate: true,
  escapeDeactivates: true,
});

useEffect(() => {
  if (isOpen) {
    activate();
  } else {
    deactivate();
  }
}, [isOpen, activate, deactivate]);
```

### 2.2 FileSelectorTrigger

#### aria属性

```tsx
<button
  ref={triggerRef}
  aria-expanded={isOpen}
  aria-haspopup="dialog"
  aria-label={
    selectedFileName
      ? `選択中: ${selectedFileName}。クリックしてファイルを変更`
      : "ファイルを選択"
  }
  aria-controls="file-selector-modal"
  onClick={handleClick}
>
  {children}
</button>
```

### 2.3 FileSelectorModal

#### aria属性

```tsx
<div
  ref={modalRef}
  id="file-selector-modal"
  role="dialog"
  aria-modal="true"
  aria-labelledby="file-selector-modal-title"
  aria-describedby="file-selector-modal-description"
>
  <h2 id="file-selector-modal-title">ファイルを選択</h2>
  <p id="file-selector-modal-description" className="sr-only">
    上下矢印キーでファイルを選択し、Enterキーで決定します。Escapeキーで閉じます。
  </p>
  {children}
</div>
```

### 2.4 FileSelectorFileList

#### aria属性とキーボードナビゲーション

```tsx
<>
  <div aria-live="polite" aria-atomic="true" className="sr-only">
    {announcement}
  </div>
  <ul
    role="listbox"
    aria-label="ファイル一覧"
    aria-multiselectable={multiple}
    tabIndex={0}
  >
    {files.map((file, index) => (
      <li
        key={file.path}
        role="option"
        aria-selected={isSelected(file)}
        tabIndex={isSelected(file) ? 0 : -1}
        onClick={() => handleSelect(file)}
        onKeyDown={(e) => handleKeyDown(e, file, index)}
      >
        {file.name}
      </li>
    ))}
  </ul>
</>
```

#### キーボードイベント処理

| キー        | 動作                 |
| ----------- | -------------------- |
| ↓           | 次の項目にフォーカス |
| ↑           | 前の項目にフォーカス |
| Home        | 先頭項目にフォーカス |
| End         | 末尾項目にフォーカス |
| Enter/Space | 項目を選択/選択解除  |
| Escape      | モーダルを閉じる     |

---

## 関連ドキュメント

| ドキュメント         | パス                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| ファイルセレクターUI | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` |
| Phase 2 設計書       | `phase-2-design.md`                                                        |
| WAI-ARIA Dialog      | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/                     |
| WAI-ARIA Listbox     | https://www.w3.org/WAI/ARIA/apg/patterns/listbox/                          |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-14 | 初版作成 |
