# Phase 2 設計サマリー — SkillEditorView 実装残課題収束

## メタ情報

| 項目           | 内容                                 |
| -------------- | ------------------------------------ |
| タスクID       | UT-UI-05A-IMPLEMENTATION-CLOSURE-001 |
| Phase番号      | 2（設計）                            |
| GitHub Issue   | #947                                 |
| 作成日         | 2026-03-03                           |
| 完了ステータス | completed                            |

---

## 概要

Phase 1 で確定した7件の要件を実現するための差分設計を策定した。既存コンポーネントへの最小限の変更で要件を満たし、4つの新規 hooks、4つの新規コンポーネント、および Zustand store の型拡張を設計した。

---

## 新規 Hooks 設計

### 1. useKeyboardNavigation

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 対象課題 | UT-UI-05A-001（FileTree キーボードナビゲーション）        |
| ファイル | `hooks/useKeyboardNavigation.ts`                          |
| 設計方針 | WAI-ARIA Tree Pattern 1.2 準拠の Roving tabIndex パターン |

**インターフェース**:

- **入力**: `UseKeyboardNavigationOptions`
  - `flatNodes: FlatNode[]` -- フラット化されたノードリスト（表示中のみ）
  - `focusedIndex: number` -- 現在フォーカスされているノードのインデックス
  - `onFocusChange: (index: number) => void` -- フォーカス変更コールバック
  - `onSelect: (path: string) => void` -- ノード選択コールバック
  - `onToggleExpand: (path: string) => void` -- ディレクトリ展開/折り畳みコールバック

- **返却**: `UseKeyboardNavigationReturn`
  - `treeProps` -- FileTreePanel root div に付与する Props（role, aria-label, tabIndex, onKeyDown）
  - `isFocused(index)` -- 特定ノードがフォーカス中か判定する関数
  - `getTabIndex(index)` -- Roving tabIndex 値を返す関数（0 または -1）

**FlatNode 型**: path, name, type("file"|"directory"), depth, isExpanded, parentPath

**キーボードマッピング**:

| キー       | 動作                                               |
| ---------- | -------------------------------------------------- |
| ArrowDown  | 次の表示ノードへフォーカス移動                     |
| ArrowUp    | 前の表示ノードへフォーカス移動                     |
| ArrowRight | ディレクトリ: 展開（未展開時）/ ファイルへ移動     |
| ArrowLeft  | ディレクトリ: 折り畳み（展開時）/ 親へ移動         |
| Enter      | ノード選択（ファイル選択・ディレクトリ展開トグル） |
| Space      | Enter と同じ                                       |
| Escape     | フォーカスをツリーコンテナに戻す                   |
| Home       | 最初の表示ノードへ移動                             |
| End        | 最後の表示ノードへ移動                             |

---

### 2. useMediaQuery

| 項目     | 内容                                                   |
| -------- | ------------------------------------------------------ |
| 対象課題 | UT-UI-05A-002（モバイルドロワー）                      |
| ファイル | `hooks/useMediaQuery.ts`                               |
| 設計方針 | `window.matchMedia` API で効率的にブレークポイント検出 |

**インターフェース**: `useMediaQuery(query: string): boolean`

**使用例**: `const isMobile = useMediaQuery("(max-width: 767px)");`

---

### 3. useSaveShortcut

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 対象課題 | UT-UI-05A-003（Cmd/Ctrl+S 保存ショートカット）       |
| ファイル | `hooks/useSaveShortcut.ts`                           |
| 設計方針 | document.addEventListener でキーボードイベントを監視 |

**インターフェース**: `UseSaveShortcutOptions`

- `onSave: () => Promise<void>` -- 保存実行コールバック
- `isReadOnly: boolean` -- 読み取り専用フラグ
- `isSaving: boolean` -- 保存中フラグ
- `isFileSelected: boolean` -- ファイル選択済みフラグ

**実装方針**:

- `(e.metaKey || e.ctrlKey) && e.key === "s"` で判定
- `e.preventDefault()` でブラウザデフォルト抑制
- `useEffect` cleanup で `removeEventListener` 実行（P5対策）

---

### 4. useToast

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 対象課題 | UT-UI-05A-004（保存成功 Toast 通知）   |
| ファイル | `hooks/useToast.ts`                    |
| 設計方針 | Toast 状態の一元管理と自動消去タイマー |

**インターフェース**: `UseToastReturn`

- `toasts: ToastState[]` -- 現在表示中の Toast リスト
- `showToast(message, variant, autoClose?)` -- Toast 表示
- `dismissToast(id)` -- 手動 Toast 閉じ

**ToastState 型**: id(string), message(string), variant("success"|"error"), autoClose?(number)

---

## 新規コンポーネント設計

### 1. MobileDrawer（molecules）

| 項目     | 内容                                                 |
| -------- | ---------------------------------------------------- |
| 対象課題 | UT-UI-05A-002                                        |
| ファイル | `components/MobileDrawer.tsx`                        |
| Props    | `isOpen: boolean`, `onClose: () => void`, `children` |

**構造**:

- Overlay: `bg-black/30` + `backdrop-blur-sm`、クリックで閉じる
- Drawer Panel: `w-[280px]`、`transform translateX` で左からスライド
- トランジション: `transform 250ms ease-in-out`

---

### 2. Toast（atoms）

| 項目     | 内容                                   |
| -------- | -------------------------------------- | --------------------------------- |
| 対象課題 | UT-UI-05A-004                          |
| ファイル | `components/Toast.tsx`                 |
| Props    | `message: string`, `variant: "success" | "error"`, `onDismiss: () => void` |

**UI仕様**:

- 成功: `bg-[var(--status-success)]` + CheckCircle アイコン
- エラー: `bg-[var(--status-error)]` + XCircle アイコン
- フォント: `text-sm font-medium`、角丸: `rounded-lg`、影: `shadow-md`
- WCAG: 成功は `role="status"`、エラーは `role="alert"`

---

### 3. ToastContainer（organisms）

| 項目     | 内容                                                      |
| -------- | --------------------------------------------------------- |
| 対象課題 | UT-UI-05A-004                                             |
| ファイル | `components/ToastContainer.tsx`                           |
| Props    | `toasts: ToastState[]`, `onDismiss: (id: string) => void` |
| 配置     | `fixed bottom-4 right-4 flex flex-col gap-2 z-50`         |

---

### 4. ReadOnlyBanner（atoms）

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| 対象課題 | UT-UI-05A-005                               |
| ファイル | `components/EditorPanel/ReadOnlyBanner.tsx` |
| Props    | `isVisible: boolean`                        |

**UI仕様**:

- 背景: `bg-[var(--bg-tertiary)]` + ボーダー下線
- テキスト: `text-[var(--text-secondary)]`、Lock アイコン（14px）+ 「読み取り専用 -- 編集できません」
- WCAG: `role="status"`, `aria-label="読み取り専用モード"`

---

## Zustand Store 拡張

### NavigationSlice 変更

**ViewType 型拡張**:

```
type ViewType = "agent" | "skill-center" | "skill-editor" | "settings" | ...
```

`"skill-editor"` を新規追加。

**NavigationState 追加フィールド**:

- `currentSkillName: string | null` -- 現在編集中のスキル名

**NavigationActions 追加**:

- `openSkillEditor(skillName: string)` -- skill-editor ビューに遷移
- `closeSkillEditor()` -- SkillCenter に戻る

**個別セレクタ追加**（P31対策）:

- `useCurrentSkillName()` -- currentSkillName を取得
- `useOpenSkillEditor()` -- openSkillEditor アクションを取得
- `useCloseSkillEditor()` -- closeSkillEditor アクションを取得

---

## アニメーション仕様

| 対象                         | Tailwind クラス                                           | 時間  |
| ---------------------------- | --------------------------------------------------------- | ----- |
| FileTreeNode ホバー          | `transition-colors duration-150 ease-in-out`              | 150ms |
| FileTreeNode 選択背景        | `transition-colors duration-150 ease-in-out`              | 150ms |
| ディレクトリ展開/折り畳み    | `transition-all duration-200 ease-in-out overflow-hidden` | 200ms |
| エディターコンテンツ切り替え | `transition-opacity duration-150 ease-in-out`             | 150ms |
| ツールバーボタン ホバー      | `transition-colors duration-150 ease-in-out`              | 150ms |
| MobileDrawer スライドイン    | `transition-transform duration-250 ease-in-out`           | 250ms |
| Toast 出現/消去              | `transition-opacity duration-200 ease-in-out`             | 200ms |

**prefers-reduced-motion 対応**: 全コンポーネントで Tailwind の `motion-reduce:transition-none` 修飾子を使用し、アニメーション無効化を実装する。

**ディレクトリ展開アニメーション**: CSS `max-height` アニメーションを採用。展開時は `max-h-[2000px]`、折り畳み時は `max-h-0` を設定。

---

## ファイル変更一覧

### 新規ファイル（8件）

| ファイルパス                                | 目的                         |
| ------------------------------------------- | ---------------------------- |
| `hooks/useKeyboardNavigation.ts`            | キーボードナビゲーション管理 |
| `hooks/useMediaQuery.ts`                    | レスポンシブブレークポイント |
| `hooks/useSaveShortcut.ts`                  | Cmd/Ctrl+S ショートカット    |
| `hooks/useToast.ts`                         | Toast 状態管理               |
| `components/MobileDrawer.tsx`               | モバイルドロワー             |
| `components/Toast.tsx`                      | Toast 単体コンポーネント     |
| `components/ToastContainer.tsx`             | Toast コンテナ               |
| `components/EditorPanel/ReadOnlyBanner.tsx` | 読み取り専用バナー           |

### 変更ファイル（6件）

| ファイルパス                                 | 変更内容                                      |
| -------------------------------------------- | --------------------------------------------- |
| `index.tsx`（SkillEditorView）               | ドロワー・Toast・ショートカット統合           |
| `components/FileTreePanel/FileTreeNode.tsx`  | キーボードナビゲーション + アニメーション     |
| `components/FileTreePanel/FileTreePanel.tsx` | useKeyboardNavigation 呼び出し                |
| `components/EditorPanel/EditorPanel.tsx`     | ReadOnlyBanner + コンテンツ切替アニメーション |
| `components/EditorToolBar.tsx`               | ハンバーガーボタン + 読み取り専用ボタン非表示 |
| `store/slices/navigationSlice.ts`            | ViewType / currentSkillName 拡張              |

---

## 完了ステータス

Phase 2（設計）は **completed** として完了済み。7件全ての課題について差分設計が策定され、新規 hooks のインターフェース定義、新規コンポーネントの Props/構造定義、NavigationSlice の型拡張設計、アニメーション仕様の Tailwind CSS クラス定義が完了している。
