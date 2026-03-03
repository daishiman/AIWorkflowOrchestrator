# Phase 2: 設計 — SkillEditorView 実装残課題収束

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| Phase番号    | 2                                                    |
| 機能名       | SkillEditorView 実装残課題収束                       |
| タスクID     | UT-UI-05A-IMPLEMENTATION-CLOSURE-001                 |
| GitHub Issue | #947                                                 |
| 作成日       | 2026-03-03                                           |
| 作成者       | Phase 2 エージェント                                 |
| 依存前Phase  | [phase-1-requirements.md](phase-1-requirements.md)   |
| 次Phase      | [phase-3-design-review.md](phase-3-design-review.md) |

---

## 目的

Phase 1 で確定した7件の要件を実現するための差分設計を策定する。
既存コンポーネントへの最小限の変更で要件を満たし、新規 hooks・コンポーネントの
インターフェースを定義する。

---

## 実行タスク

- 差分設計: 既存コンポーネントへの変更箇所と実装方針を設計する
- Hook設計: 新規 hooks のインターフェース（Props/返却型）を設計する
- 状態設計: Zustand store の型拡張（`ViewType`, `NavigationSlice`）を設計する
- レスポンシブ設計: 768px ブレークポイントを基準にレイアウト切替を設計する
- モーション設計: アニメーション仕様を Tailwind CSS クラスで定義する

---

## 参照資料

| 資料名                      | パス                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------- |
| Phase 1 要件定義書          | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-1-requirements.md` |
| 既存SkillEditorView実装     | `apps/desktop/src/renderer/views/SkillEditorView/`                                    |
| UI/UX共通仕様               | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`               |
| UI/UX機能コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`       |
| UI/UX設計原則               | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`        |
| ナビゲーション仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`               |
| 状態管理アーキテクチャ      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`          |
| Agent SDK型仕様             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`     |

---

## システム仕様参照

- `arch-state-management.md` — Zustand Slice 設計・個別セレクタパターン（P31対策）
- `arch-ui-components.md` — Atomic Design コンポーネント構造
- `ui-ux-navigation.md` — SkillCenter/SkillEditorView の画面遷移仕様
- `ui-ux-design-principles.md` — モーション・レスポンシブ設計の評価軸
- `interfaces-agent-sdk-skill.md` — SkillEditorView の型契約（isReadOnly 等）
- `architecture-overview.md` — Renderer→Preload→Main のレイヤー依存

---

## 1. UT-UI-05A-001: FileTree キーボードナビゲーション設計

### 設計方針

WAI-ARIA Tree Pattern 1.2 に準拠した **Roving tabIndex** パターンを採用する。
`FileTreePanel` レベルでキーボードイベントを管理し、フォーカス対象ノードを
単一のインデックスで追跡する。

### 新規 Hook: `useKeyboardNavigation`

```typescript
// apps/desktop/src/renderer/views/SkillEditorView/hooks/useKeyboardNavigation.ts

interface UseKeyboardNavigationOptions {
  /** フラット化されたノードリスト（表示中のノードのみ）*/
  flatNodes: FlatNode[];
  /** 現在フォーカスされているノードのインデックス */
  focusedIndex: number;
  /** フォーカス変更コールバック */
  onFocusChange: (index: number) => void;
  /** ノード選択コールバック */
  onSelect: (path: string) => void;
  /** ディレクトリ展開/折り畳みコールバック */
  onToggleExpand: (path: string) => void;
}

interface UseKeyboardNavigationReturn {
  /** FileTreePanel の root div に付与する Props */
  treeProps: {
    role: "tree";
    "aria-label": string;
    tabIndex: 0;
    onKeyDown: React.KeyboardEventHandler;
  };
  /** 特定ノードが focused かどうかを判定する関数 */
  isFocused: (index: number) => boolean;
  /** 特定ノードに付与する tabIndex 値を返す（Roving tabIndex） */
  getTabIndex: (index: number) => 0 | -1;
}

export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions,
): UseKeyboardNavigationReturn;
```

#### FlatNode 型

```typescript
/** ツリーをフラット化した表示ノード */
interface FlatNode {
  path: string;
  name: string;
  type: "file" | "directory";
  depth: number;
  isExpanded: boolean;
  parentPath: string | null;
}
```

#### キーボードマッピング

| キー         | 動作                                                     |
| ------------ | -------------------------------------------------------- |
| `ArrowDown`  | 次の表示ノードへフォーカス移動                           |
| `ArrowUp`    | 前の表示ノードへフォーカス移動                           |
| `ArrowRight` | ディレクトリ: 展開（未展開時）/ ファイルへ移動（展開時） |
| `ArrowLeft`  | ディレクトリ: 折り畳み（展開時）/ 親へ移動（未展開時）   |
| `Enter`      | ノード選択（ファイル選択・ディレクトリ展開トグル）       |
| `Space`      | Enter と同じ                                             |
| `Escape`     | フォーカスをツリーコンテナに戻す                         |
| `Home`       | 最初の表示ノードへ移動                                   |
| `End`        | 最後の表示ノードへ移動                                   |

### FileTreeNode 変更点（差分）

```typescript
// 変更前
<div
  role="treeitem"
  aria-selected={isSelected}
  onClick={handleClick}
  ...
>

// 変更後（追加属性のみ記載）
<div
  role="treeitem"
  aria-selected={isSelected}
  aria-expanded={isDirectory ? isExpanded : undefined}
  tabIndex={isFocused ? 0 : -1}      // 追加: Roving tabIndex
  onKeyDown={handleKeyDown}           // 追加: キーボードハンドラ（useKeyboardNavigation から受け取る）
  ref={nodeRef}                       // 追加: フォーカス管理用
  className={`... focus:outline-[2px] focus:outline-[var(--status-primary)] focus:outline-offset-[-2px]`}  // 追加
  onClick={handleClick}
>
```

---

## 2. UT-UI-05A-002: モバイルドロワー設計

### 設計方針

`SkillEditorView` を **コンテナ** として `useMediaQuery` でブレークポイントを検出し、
768px 未満のとき `FileTreePanel` をドロワーモードで表示する。

### 新規 Hook: `useMediaQuery`

```typescript
// apps/desktop/src/renderer/views/SkillEditorView/hooks/useMediaQuery.ts

export function useMediaQuery(query: string): boolean;

// 使用例
const isMobile = useMediaQuery("(max-width: 767px)");
```

### 新規コンポーネント: `MobileDrawer`

```typescript
// apps/desktop/src/renderer/views/SkillEditorView/components/MobileDrawer.tsx

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// 内部構造
// <div> Overlay（bg-black/30 + backdrop-blur-sm、クリックで閉じる）
//   <div> Drawer Panel（w-[280px]、transform translateX で左からスライド）
//     {children}
//   </div>
// </div>
```

### SkillEditorView 変更点（差分）

```typescript
// 追加: useMediaQuery と isDrawerOpen state
const isMobile = useMediaQuery("(max-width: 767px)");
const [isDrawerOpen, setIsDrawerOpen] = useState(false);

// レイアウト変更
return (
  <div className="flex h-full w-full overflow-hidden bg-[var(--bg-primary)]">
    {/* デスクトップ: 従来通り */}
    {!isMobile && <FileTreePanel ... />}

    {/* モバイル: ドロワー */}
    {isMobile && (
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <FileTreePanel ... onSelectFile={(path) => {
          handleSelectFile(path);
          setIsDrawerOpen(false); // ファイル選択後に閉じる
        }} />
      </MobileDrawer>
    )}

    {/* 右ペイン */}
    <div className="flex-1 flex flex-col min-w-0">
      <EditorToolBar
        ...
        isMobile={isMobile}              // 追加
        onOpenDrawer={() => setIsDrawerOpen(true)}  // 追加
      />
      ...
    </div>
  </div>
);
```

### EditorToolBar 変更点（差分）

```typescript
// Props 追加
interface EditorToolBarProps {
  // 既存
  selectedFile: string | null;
  hasChanges: boolean;
  isSaving: boolean;
  isReadOnly: boolean;
  onSave: () => void;
  onClose: () => void;
  onOpenBackups: () => void;
  // 追加
  isMobile?: boolean;
  onOpenDrawer?: () => void;
}

// JSX: isMobile=true のときハンバーガーボタンを表示
{isMobile && (
  <button
    aria-label="ファイルツリーを開く"
    aria-expanded={false}  // SkillEditorView から isDrawerOpen を受け取る場合は動的に
    onClick={onOpenDrawer}
    className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] transition-colors duration-150"
  >
    <Menu size={18} />
  </button>
)}
```

---

## 3. UT-UI-05A-003: Cmd/Ctrl+S 保存ショートカット設計

### 新規 Hook: `useSaveShortcut`

```typescript
// apps/desktop/src/renderer/views/SkillEditorView/hooks/useSaveShortcut.ts

interface UseSaveShortcutOptions {
  onSave: () => Promise<void>;
  isReadOnly: boolean;
  isSaving: boolean;
  isFileSelected: boolean;
}

export function useSaveShortcut(options: UseSaveShortcutOptions): void;
```

#### 実装方針

```typescript
// hooks/useSaveShortcut.ts の内部実装イメージ
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const isSaveKey = (e.metaKey || e.ctrlKey) && e.key === "s";
    if (!isSaveKey) return;
    e.preventDefault();

    if (isReadOnly || isSaving || !isFileSelected) return;
    void onSave();
  };

  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, [onSave, isReadOnly, isSaving, isFileSelected]);
```

### SkillEditorView 変更点（差分）

```typescript
// useSaveShortcut を追加
useSaveShortcut({
  onSave: handleSave,
  isReadOnly,
  isSaving,
  isFileSelected: currentPath !== null,
});
```

---

## 4. UT-UI-05A-004: 保存成功 Toast 通知設計

### 新規 Hook: `useToast`

```typescript
// apps/desktop/src/renderer/views/SkillEditorView/hooks/useToast.ts

type ToastVariant = "success" | "error";

interface ToastState {
  id: string;
  message: string;
  variant: ToastVariant;
  autoClose?: number; // ms、未指定なら手動閉じのみ
}

interface UseToastReturn {
  toasts: ToastState[];
  showToast: (
    message: string,
    variant: ToastVariant,
    autoClose?: number,
  ) => void;
  dismissToast: (id: string) => void;
}

export function useToast(): UseToastReturn;
```

### 新規コンポーネント: `ToastContainer` / `Toast`

```typescript
// atoms: Toast
interface ToastProps {
  message: string;
  variant: "success" | "error";
  onDismiss: () => void;
}

// organisms: ToastContainer
interface ToastContainerProps {
  toasts: ToastState[];
  onDismiss: (id: string) => void;
}
// 配置: fixed bottom-4 right-4 flex flex-col gap-2 z-50
```

#### Toast アニメーション仕様

```
出現: opacity: 0→1 (200ms ease-in) + translateY: 8px→0 (200ms ease-out)
消去: opacity: 1→0 (200ms ease-in)
```

Tailwind CSS: `animate-in fade-in slide-in-from-bottom-2 duration-200`
（または CSS Module で定義）

### SkillEditorView 変更点（差分）

```typescript
const { toasts, showToast, dismissToast } = useToast();

// handleSave 修正
const handleSave = useCallback(async () => {
  setIsSaving(true);
  try {
    await saveFile();
    showToast("保存しました", "success", 2500); // 追加
  } catch {
    showToast("保存に失敗しました", "error"); // 追加（自動消去なし）
  } finally {
    setIsSaving(false);
  }
}, [saveFile, showToast]);

// JSX に ToastContainer 追加
return (
  <div className="flex h-full w-full ...">
    ...
    <ToastContainer toasts={toasts} onDismiss={dismissToast} />
  </div>
);
```

---

## 5. UT-UI-05A-005: 読み取り専用表示強化設計

### EditorPanel 変更点（差分）

```typescript
// 既存: isReadOnly を textarea/CodeMirror の readOnly に渡すのみ
// 追加: ReadOnlyBanner コンポーネント

// atoms: ReadOnlyBanner
interface ReadOnlyBannerProps {
  isVisible: boolean; // isReadOnly
}

// JSX
{isReadOnly && (
  <div
    role="status"
    aria-label="読み取り専用モード"
    className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-tertiary)] border-b border-[var(--border-default)] text-[var(--text-secondary)] text-sm"
  >
    <Lock size={14} className="shrink-0" />
    <span>読み取り専用 — 編集できません</span>
  </div>
)}
```

### EditorToolBar 変更点（差分）

```typescript
// 変更前: isReadOnly のとき保存ボタンを disabled + グレーアウト
// 変更後: isReadOnly のとき保存・バックアップボタンを非表示（hidden）

{!isReadOnly && (
  <button onClick={onSave} disabled={isSaving}>
    <Save size={16} /> 保存
  </button>
)}
{!isReadOnly && (
  <button onClick={onOpenBackups}>
    <History size={16} />
  </button>
)}
```

### EditorToolBar のファイル名表示変更

```typescript
// ファイル名の隣にロックアイコンを追加
<span className="text-sm truncate text-[var(--text-primary)]">
  {selectedFile ?? "ファイル未選択"}
</span>
{isReadOnly && (
  <Lock
    size={14}
    className="shrink-0 text-[var(--text-secondary)]"
    aria-label="読み取り専用"
  />
)}
```

---

## 6. UT-UI-05A-006: ナビゲーション導線配線設計

### Zustand NavigationSlice 拡張

```typescript
// apps/desktop/src/renderer/store/slices/navigationSlice.ts（既存ファイルへの差分）

// 追加: ViewType に skill-editor を追加
type ViewType =
  | "agent"
  | "skill-center"
  | "skill-editor"  // ← 追加
  | "settings"
  | /* ... 既存の他の View */;

// 追加: currentSkillName フィールド
interface NavigationState {
  currentView: ViewType;
  currentSkillName: string | null;  // ← 追加
}

// 追加: アクション
interface NavigationActions {
  openSkillEditor: (skillName: string) => void;  // ← 追加
  closeSkillEditor: () => void;                   // ← 追加
}
```

### 個別セレクタ追加（P31対策）

```typescript
// 追加セレクタ
export const useCurrentSkillName = () =>
  useNavigationStore((state) => state.currentSkillName);

export const useOpenSkillEditor = () =>
  useNavigationStore((state) => state.openSkillEditor);

export const useCloseSkillEditor = () =>
  useNavigationStore((state) => state.closeSkillEditor);
```

### SkillCenter コンポーネント変更点（差分）

```typescript
// SkillCenter の各スキルカードに「編集」ボタンを追加
const openSkillEditor = useOpenSkillEditor();

<button onClick={() => openSkillEditor(skill.name)}>
  編集
</button>
```

### AppLayout / ルーターの変更点

```typescript
// currentView === 'skill-editor' のとき SkillEditorView をレンダリング
const currentView = useCurrentView();
const currentSkillName = useCurrentSkillName();
const closeSkillEditor = useCloseSkillEditor();

{currentView === 'skill-editor' && currentSkillName && (
  <SkillEditorView
    skillName={currentSkillName}
    onClose={closeSkillEditor}
  />
)}
```

---

## 7. UT-UI-05A-007: マイクロアニメーション設計

### アニメーション仕様一覧

| 対象                         | Tailwind クラス                                           | 時間  |
| ---------------------------- | --------------------------------------------------------- | ----- |
| FileTreeNode ホバー          | `transition-colors duration-150 ease-in-out`              | 150ms |
| FileTreeNode 選択背景        | `transition-colors duration-150 ease-in-out`              | 150ms |
| ディレクトリ展開/折り畳み    | `transition-all duration-200 ease-in-out overflow-hidden` | 200ms |
| エディターコンテンツ切り替え | `transition-opacity duration-150 ease-in-out`             | 150ms |
| ツールバーボタン ホバー      | `transition-colors duration-150 ease-in-out`              | 150ms |
| MobileDrawer スライドイン    | `transition-transform duration-250 ease-in-out`           | 250ms |
| Toast 出現/消去              | `transition-opacity duration-200 ease-in-out`             | 200ms |

### `prefers-reduced-motion` 対応

```typescript
// 全コンポーネントで以下のクラスを条件付き適用
// Tailwind の motion-safe / motion-reduce 修飾子を使用

// 例: FileTreeNode
className={`
  transition-colors
  motion-reduce:transition-none
  duration-150
  ease-in-out
`}
```

### ディレクトリ展開アニメーション（差分）

```typescript
// FileTreeNode の子要素コンテナ
{isDirectory && (
  <div
    role="group"
    className={`
      overflow-hidden
      transition-all duration-200 ease-in-out
      motion-reduce:transition-none
      ${isExpanded ? "max-h-[2000px]" : "max-h-0"}
    `}
  >
    {node.children?.map(...)}
  </div>
)}
```

> **注**: CSS `max-height` アニメーションは高さが事前不明のツリーで一般的に使用される手法。
> 実際の高さは子要素に依存するため `max-h-[2000px]` を上限として設定する。

---

## ファイル変更一覧

### 新規ファイル

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

### 変更ファイル（差分）

| ファイルパス                                   | 変更内容                                      |
| ---------------------------------------------- | --------------------------------------------- |
| `index.tsx`（SkillEditorView）                 | ドロワー・Toast・ショートカット統合           |
| `components/FileTreePanel/FileTreeNode.tsx`    | キーボードナビゲーション + アニメーション     |
| `components/FileTreePanel/FileTreePanel.tsx`   | `useKeyboardNavigation` 呼び出し              |
| `components/EditorPanel/EditorPanel.tsx`       | ReadOnlyBanner + コンテンツ切り替えアニメ     |
| `components/EditorToolBar.tsx`                 | ハンバーガーボタン + 読み取り専用ボタン非表示 |
| `store/slices/navigationSlice.ts`（既存store） | `ViewType` / `currentSkillName` 拡張          |

---

## 統合テスト連携

Phase 4 では以下のテストファイルを追加・拡張すること:

| テストファイル                               | 追加テスト内容                                             |
| -------------------------------------------- | ---------------------------------------------------------- |
| `__tests__/useKeyboardNavigation.test.ts`    | Arrow/Enter/Escape キー処理の単体テスト                    |
| `__tests__/useMediaQuery.test.ts`            | `matchMedia` モックを使った768px境界テスト                 |
| `__tests__/useSaveShortcut.test.ts`          | Cmd+S / Ctrl+S イベント + preventDefault 検証              |
| `__tests__/useToast.test.ts`                 | showToast / dismissToast / 自動消去タイマーテスト          |
| `__tests__/MobileDrawer.test.tsx`            | 開閉・Escape・オーバーレイクリックテスト                   |
| `__tests__/Toast.test.tsx`                   | role="status"/role="alert" / 手動閉じテスト                |
| `__tests__/SkillEditorView.test.tsx`（拡張） | 読み取り専用バナー・ロックアイコン・保存ボタン非表示テスト |

---

## 多角的チェック観点

### アーキテクチャ

- [ ] Renderer → Preload → Main の依存方向を守っているか（UT-UI-05A-006の store 変更）
- [ ] 新規 hooks が `useEffect` の依存配列を正しく管理しているか（P31対策）
- [ ] `useSaveShortcut` がアンマウント時に `removeEventListener` しているか（P5対策）

### パフォーマンス

- [ ] `useMediaQuery` が `resize` イベントでなく `matchMedia` API を使っているか（効率的）
- [ ] アニメーションが `transform`/`opacity` のみで、レイアウトリフローを起こさないか
- [ ] `useKeyboardNavigation` でツリーのフラット化が毎レンダーで発生しないか（`useMemo` 使用）

### セキュリティ

- [ ] `document.addEventListener("keydown", ...)` が複数登録されないか（`useEffect` cleanup 確認）
- [ ] `isReadOnly` のとき保存 IPC が呼び出されないか

---

## 成果物

| ファイルパス                                                                    | 内容                 |
| ------------------------------------------------------------------------------- | -------------------- |
| `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-2-design.md` | 本ファイル（設計書） |

---

## 完了条件

- [ ] 7件の課題すべての差分設計が記載されている
- [ ] 新規 hooks のインターフェース（型定義）が定義されている
- [ ] NavigationSlice の型拡張設計が記載されている
- [ ] 変更ファイル一覧が完全に列挙されている
- [ ] アニメーション仕様が Tailwind クラスで具体化されている
- [ ] `prefers-reduced-motion` 対応方針が明記されている
- [ ] **本Phase内の全タスクを100%実行完了していること**
