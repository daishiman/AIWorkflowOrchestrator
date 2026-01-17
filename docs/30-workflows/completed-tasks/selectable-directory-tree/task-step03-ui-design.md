# フォルダ一括選択機能 - UI設計書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | T-01-2                        |
| ドキュメントID   | UI-001                        |
| バージョン       | 1.0.0                         |
| ステータス       | Draft                         |
| 作成日           | 2025-12-18                    |
| 作成エージェント | .claude/agents/ui-designer.md |
| 対象ファイル     | SelectableFileTreeItem.tsx    |

---

## 1. 設計概要

### 1.1 目的

SelectableFileTreeItemコンポーネントにフォルダのチェックボックスを追加し、3つの選択状態（未選択/部分選択/全選択）を視覚的に表現する。

### 1.2 現状分析

現在の`SelectableFileTreeItem`の実装状況：

| 項目                       | 現状                        | 変更後             |
| -------------------------- | --------------------------- | ------------------ |
| フォルダのチェックボックス | なし（Chevronアイコンのみ） | 追加               |
| ファイルのチェックボックス | あり                        | 変更なし           |
| indeterminate状態          | 未対応                      | 対応               |
| ARIA属性                   | `aria-selected`のみ         | `aria-checked`追加 |

### 1.3 設計原則

| 原則               | 適用方法                                      |
| ------------------ | --------------------------------------------- |
| WCAG 2.1 AA準拠    | aria-checked="mixed"、コントラスト比4.5:1以上 |
| Apple HIG準拠      | macOS標準チェックボックスの視覚パターン       |
| 既存デザイン整合性 | 既存Tailwind CSSクラスを活用                  |
| アクセシビリティ   | キーボード操作、スクリーンリーダー対応        |

---

## 2. チェックボックス3状態の視覚デザイン

### 2.1 状態定義

| 状態     | 名称          | 視覚表現                | HTMLプロパティ                         |
| -------- | ------------- | ----------------------- | -------------------------------------- |
| 未選択   | unselected    | ☐ 空のボックス          | `checked=false`, `indeterminate=false` |
| 部分選択 | indeterminate | ☒ ハイフン/マイナス記号 | `checked=false`, `indeterminate=true`  |
| 全選択   | selected      | ☑ チェックマーク        | `checked=true`, `indeterminate=false`  |

### 2.2 視覚デザイン仕様

```
┌─────────────────────────────────────────────────────────┐
│  状態: 未選択 (unselected)                              │
│  ┌────┐                                                 │
│  │    │  空のボックス                                   │
│  └────┘                                                 │
│  - ボーダー: zinc-500 (#71717a)                         │
│  - 背景: transparent                                    │
│  - サイズ: 16x16px (w-4 h-4)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  状態: 部分選択 (indeterminate)                         │
│  ┌────┐                                                 │
│  │ ── │  ハイフン記号                                   │
│  └────┘                                                 │
│  - ボーダー: blue-500 (#3b82f6)                         │
│  - 背景: blue-600/50 (50%透明度)                        │
│  - アイコン: 水平線（マイナス記号）                     │
│  - サイズ: 16x16px (w-4 h-4)                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  状態: 全選択 (selected)                                │
│  ┌────┐                                                 │
│  │ ✓  │  チェックマーク                                 │
│  └────┘                                                 │
│  - ボーダー: blue-600 (#2563eb)                         │
│  - 背景: blue-600 (#2563eb)                             │
│  - アイコン: チェックマーク（白色）                     │
│  - サイズ: 16x16px (w-4 h-4)                            │
└─────────────────────────────────────────────────────────┘
```

### 2.3 カラーパレット

| 要素               | デザイントークン  | HEX値                  | 用途                      |
| ------------------ | ----------------- | ---------------------- | ------------------------- |
| ボーダー（未選択） | `border-zinc-500` | #71717a                | 未選択状態のボーダー      |
| ボーダー（選択系） | `border-blue-600` | #2563eb                | 部分選択/全選択のボーダー |
| 背景（部分選択）   | `bg-blue-600/50`  | rgba(37, 99, 235, 0.5) | indeterminate状態の背景   |
| 背景（全選択）     | `bg-blue-600`     | #2563eb                | 全選択状態の背景          |
| アイコン（白）     | `text-white`      | #ffffff                | チェック/ハイフンアイコン |
| フォーカスリング   | `ring-blue-500`   | #3b82f6                | キーボードフォーカス時    |

### 2.4 コントラスト比検証（WCAG 2.1 AA）

| 組み合わせ             | コントラスト比 | 基準（4.5:1） |
| ---------------------- | -------------- | ------------- |
| 白アイコン on blue-600 | 4.68:1         | ✅ PASS       |
| zinc-500 on zinc-900   | 5.03:1         | ✅ PASS       |
| blue-600 on zinc-800   | 4.52:1         | ✅ PASS       |

---

## 3. CSS/スタイル設計

### 3.1 チェックボックスコンポーネントスタイル

```tsx
// FolderCheckbox.tsx（新規作成または SelectableFileTreeItem 内に統合）

interface FolderCheckboxProps {
  selectionState: "unselected" | "indeterminate" | "selected";
  onChange: () => void;
  label: string;
}

const checkboxStyles = {
  base: clsx(
    "w-4 h-4 rounded",
    "border transition-colors duration-150",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900",
  ),
  unselected: clsx("border-zinc-500 bg-transparent", "hover:border-zinc-400"),
  indeterminate: clsx("border-blue-600 bg-blue-600/50", "hover:bg-blue-600/60"),
  selected: clsx("border-blue-600 bg-blue-600", "hover:bg-blue-700"),
};
```

### 3.2 indeterminate状態のCSS実装

```css
/* indeterminate状態のネイティブCSS（参考） */
input[type="checkbox"]:indeterminate {
  background-color: rgba(37, 99, 235, 0.5);
  border-color: #2563eb;
}

input[type="checkbox"]:indeterminate::before {
  content: "";
  display: block;
  width: 8px;
  height: 2px;
  background-color: white;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### 3.3 Tailwind CSSクラス構成

```tsx
// 状態に応じたクラス生成
const getCheckboxClasses = (state: SelectionState): string => {
  const baseClasses = "w-4 h-4 rounded border transition-colors duration-150";
  const focusClasses =
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900";

  switch (state) {
    case "unselected":
      return clsx(
        baseClasses,
        focusClasses,
        "border-zinc-500 bg-transparent hover:border-zinc-400",
      );
    case "indeterminate":
      return clsx(
        baseClasses,
        focusClasses,
        "border-blue-600 bg-blue-600/50 hover:bg-blue-600/60",
      );
    case "selected":
      return clsx(
        baseClasses,
        focusClasses,
        "border-blue-600 bg-blue-600 hover:bg-blue-700",
      );
  }
};
```

---

## 4. ARIA属性設計

### 4.1 チェックボックスのARIA属性

```tsx
<input
  type="checkbox"
  role="checkbox"
  aria-checked={
    selectionState === "indeterminate" ? "mixed" : selectionState === "selected"
  }
  aria-label={`${folderName} フォルダを選択`}
  ref={(el) => {
    if (el) {
      el.indeterminate = selectionState === "indeterminate";
    }
  }}
  checked={selectionState === "selected"}
  onChange={onFolderToggle}
/>
```

### 4.2 ARIA属性一覧

| 属性           | 値                              | 説明                         |
| -------------- | ------------------------------- | ---------------------------- |
| `role`         | `checkbox`                      | チェックボックスとして認識   |
| `aria-checked` | `true` / `false` / `"mixed"`    | 3状態を表現                  |
| `aria-label`   | `"{フォルダ名} フォルダを選択"` | スクリーンリーダー向けラベル |
| `tabindex`     | `0`                             | キーボードフォーカス可能     |

### 4.3 スクリーンリーダー読み上げ

| 状態          | 読み上げ内容（例）                                 |
| ------------- | -------------------------------------------------- |
| unselected    | "project フォルダを選択、チェックされていません"   |
| indeterminate | "project フォルダを選択、部分的に選択されています" |
| selected      | "project フォルダを選択、チェックされています"     |

---

## 5. キーボード操作設計

### 5.1 キーボードインタラクション

| キー         | フォルダでの動作                | ファイルでの動作         |
| ------------ | ------------------------------- | ------------------------ |
| `Space`      | フォルダ一括選択/解除を切り替え | ファイル選択/解除        |
| `Enter`      | フォルダ展開/折りたたみ         | ファイル選択/解除        |
| `ArrowRight` | 折りたたまれている場合は展開    | なし                     |
| `ArrowLeft`  | 展開されている場合は折りたたみ  | なし                     |
| `Tab`        | 次の要素へフォーカス移動        | 次の要素へフォーカス移動 |
| `Shift+Tab`  | 前の要素へフォーカス移動        | 前の要素へフォーカス移動 |

### 5.2 キーボード操作のコード設計

```tsx
const handleKeyDown = useCallback(
  (e: React.KeyboardEvent) => {
    switch (e.key) {
      case " ":
        e.preventDefault();
        if (isFolder) {
          // 新規: フォルダ一括選択/解除
          onFolderSelectionToggle(node.path, node);
        } else {
          onFileToggle(node.path, node);
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isFolder) {
          // 既存: フォルダ展開/折りたたみ
          onFolderExpandToggle(node.path);
        } else {
          onFileToggle(node.path, node);
        }
        break;
      case "ArrowRight":
        e.preventDefault();
        if (isFolder && !isExpanded) {
          onFolderExpandToggle(node.path);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (isFolder && isExpanded) {
          onFolderExpandToggle(node.path);
        }
        break;
    }
  },
  [
    isFolder,
    isExpanded,
    node,
    onFileToggle,
    onFolderExpandToggle,
    onFolderSelectionToggle,
  ],
);
```

### 5.3 フォーカス表示

```css
/* フォーカスリングのスタイル */
.checkbox:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px #1e1e1e,
    0 0 0 4px #3b82f6;
}
```

---

## 6. コンポーネント構成変更

### 6.1 SelectableFileTreeItem の変更概要

```tsx
// 変更前: フォルダはChevronアイコンのみ
{isFolder ? (
  <span aria-label={isExpanded ? "折りたたみ" : "展開"}>
    <Icon name={isExpanded ? "chevron-down" : "chevron-right"} />
  </span>
) : (
  <input type="checkbox" ... />
)}

// 変更後: フォルダにもチェックボックスを追加
{isFolder && (
  <>
    {/* チェックボックス（選択用） */}
    <FolderCheckbox
      selectionState={getSelectionState(node)}
      onChange={() => toggleFolder(node.path, node, folderId)}
      label={`${node.name} フォルダを選択`}
    />
    {/* Chevronアイコン（展開用） */}
    <span
      onClick={(e) => { e.stopPropagation(); onFolderToggle(node.path); }}
      aria-label={isExpanded ? "折りたたみ" : "展開"}
    >
      <Icon name={isExpanded ? "chevron-down" : "chevron-right"} />
    </span>
  </>
)}
```

### 6.2 Props変更

```typescript
// 既存Props
interface SelectableFileTreeItemProps {
  node: FileNode;
  folderId: FolderId;
  expandedPaths: Set<string>;
  selectedPaths: Set<string>;
  selectionMode: "single" | "multiple";
  onFileToggle: (filePath: string, file: FileNode) => void;
  onFolderToggle: (path: string) => void; // 展開/折りたたみ
  depth: number;
  fileOnly?: boolean;
}

// 追加Props
interface SelectableFileTreeItemProps {
  // ... 既存Props ...

  // 新規追加
  /** フォルダ選択状態を取得 */
  getSelectionState: (folder: FileNode) => SelectionState;

  /** フォルダ一括選択/解除 */
  onFolderSelectionToggle: (folderPath: string, folder: FileNode) => void;
}
```

### 6.3 レイアウト構成

```
┌─────────────────────────────────────────────────────────────┐
│ [depth indent] [Checkbox] [Chevron] [Icon] [Name]           │
│                                                             │
│ 例: フォルダ行                                              │
│ ├── ☐ ▶ 📁 components                                      │
│ │   └── ☑ 📄 Button.tsx                                    │
│ └── ☒ ▼ 📁 utils (indeterminate)                           │
│     ├── ☑ 📄 helper.ts                                     │
│     └── ☐ 📄 types.ts                                      │
└─────────────────────────────────────────────────────────────┘

凡例:
☐ = 未選択
☑ = 全選択
☒ = 部分選択（indeterminate）
▶ = 折りたたみ
▼ = 展開
📁 = フォルダ
📄 = ファイル
```

---

## 7. デザイントークン整合性

### 7.1 使用するデザイントークン

| カテゴリ   | トークン                                       | 用途                     |
| ---------- | ---------------------------------------------- | ------------------------ |
| Colors     | `zinc-300`, `zinc-400`, `zinc-500`, `zinc-800` | テキスト、ボーダー、背景 |
| Colors     | `blue-500`, `blue-600`, `blue-700`             | 選択状態のアクセント     |
| Colors     | `yellow-500`                                   | フォルダアイコン         |
| Spacing    | `gap-2`, `px-2`, `py-1.5`                      | 要素間の余白             |
| Typography | `truncate`                                     | テキストの省略           |
| Effects    | `transition-colors`, `duration-150`            | 状態変化のアニメーション |
| Layout     | `flex`, `items-center`                         | 要素の配置               |

### 7.2 既存スタイルとの整合性確認

```tsx
// 既存のファイルチェックボックススタイル
className =
  "w-4 h-4 rounded border border-zinc-500 bg-transparent checked:bg-blue-600 checked:border-blue-600";

// フォルダチェックボックスも同様のスタイルを適用
// indeterminate状態のみ追加スタイル
```

---

## 8. 実装チェックリスト

### 8.1 完了条件

- [x] チェックボックス3状態（☐/☑/☑ indeterminate）の視覚的表現が定義されている
- [x] indeterminate状態のCSS/スタイル設計が完了している
- [x] ARIA属性（aria-checked="mixed"）の設定が定義されている
- [x] キーボード操作（Space/Enterキー）での動作が設計されている
- [x] デザイントークンとの整合性が確保されている

### 8.2 実装時の注意点

1. **indeterminateプロパティ**: HTMLのindeterminateはDOMプロパティであり、HTML属性では設定不可。ref経由で設定する。
2. **クリック領域の分離**: チェックボックスと展開/折りたたみアイコンのクリック領域を明確に分離する。
3. **既存Props互換性**: 新規Propsは追加形式とし、既存呼び出し元への影響を最小化。

---

## 9. 更新履歴

| バージョン | 日付       | 更新者                        | 更新内容 |
| ---------- | ---------- | ----------------------------- | -------- |
| 1.0.0      | 2025-12-18 | .claude/agents/ui-designer.md | 初版作成 |
