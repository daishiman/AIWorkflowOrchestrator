# Phase 5: 実装（TDD Green）

## メタ情報

| 項目           | 値                                                 |
| -------------- | -------------------------------------------------- |
| タスク ID      | UT-UI-05A-IMPLEMENTATION-CLOSURE-001               |
| Phase          | 5 — 実装                                           |
| 前提 Phase     | Phase 4（テスト作成）完了 — 全テストが Red 状態    |
| 作成日         | 2026-03-03                                         |
| 対象課題       | UT-UI-05A-001〜007（7 課題全て）                   |
| スタイリング   | Tailwind CSS + Apple HIG System Colors（CSS 変数） |
| アイコン       | lucide-react のみ（絵文字不使用）                  |
| 実装対象ビュー | `apps/desktop/src/renderer/views/SkillEditorView/` |

## 目的

Phase 4 で作成した全 67 テストを Green（成功）にするプロダクションコードを実装する。7 課題（FileTree キーボードナビゲーション・モバイルドロワー・Cmd/Ctrl+S 保存ショートカット・保存成功 Toast・読み取り専用表示強化・ナビゲーション導線配線・マイクロアニメーション）を Atomic Design に基づいて実装し、WCAG 2.1 AA 準拠・Apple HIG 準拠・prefers-reduced-motion 対応を実現する。

## 実行タスク

- UT-UI-05A-001 実装: FileTree キーボードナビゲーション Hook とコンポーネント修正
- UT-UI-05A-002 実装: モバイルドロワーのレスポンシブ対応
- UT-UI-05A-003 実装: Cmd/Ctrl+S 保存ショートカット Hook 追加
- UT-UI-05A-004 実装: Toast コンポーネントと useToast Hook 新規作成
- UT-UI-05A-005 実装: 読み取り専用バナーと Lock アイコン表示
- UT-UI-05A-006 実装: ナビゲーション ViewType 拡張と Store 設定
- UT-UI-05A-007 実装: マイクロアニメーション CSS トランジション追加
- Green 確認: Phase 4 の Red テストを全て Green 化する

### Task 1: UT-UI-05A-001 FileTree キーボードナビゲーション実装

**目的**: FileTreePanel に WAI-ARIA Tree Pattern 1.2 準拠のキーボードナビゲーションを追加する。

#### 1-1: `useKeyboardNavigation` Hook 新規作成

**配置先**: `apps/desktop/src/renderer/views/SkillEditorView/hooks/useKeyboardNavigation.ts`

| 管理する state / 関数      | 型・説明                                             |
| -------------------------- | ---------------------------------------------------- | ------ | ------ | ------------------------------------- |
| `focusedIndex`             | `number`（-1 = フォーカスなし）                      |
| `expandedNodes`            | `Set<string>`（展開済みノード ID のセット）          |
| `moveFocus(direction)`     | `'up'                                                | 'down' | 'home' | 'end'` でフォーカスインデックスを移動 |
| `toggleExpand(nodeId)`     | ノードの展開/折り畳みを切り替える                    |
| `handleKeyDown(e, nodeId)` | `keydown` イベントを受け取りキー別ロジックを実行する |

**実装パターン**:

```typescript
// P5 対策: cleanup 関数でリスナー解除
useEffect(() => {
  const handler = (e: KeyboardEvent) => handleKeyDown(e);
  // ツリーコンテナへの登録（window ではなくコンテナ要素に登録）
  return () => containerRef.current?.removeEventListener("keydown", handler);
}, [handleKeyDown]);
```

#### 1-2: `FileTreePanel` コンポーネント修正

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/components/FileTreePanel.tsx`

| 修正内容                                           | 具体的な変更                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| ツリーコンテナに `tabIndex={0}` を追加する         | `<div role="tree" tabIndex={0} ref={containerRef}>`                  |
| `useKeyboardNavigation` を統合する                 | Hook の `handleKeyDown` をコンテナの `onKeyDown` に接続              |
| フォーカスリングを追加する                         | `focus:ring-2 focus:ring-[var(--status-primary)] focus:outline-none` |
| `role="tree"` / `role="treeitem"` を付与する       | WAI-ARIA Tree Pattern 1.2 準拠                                       |
| フォーカスされたノードに `aria-current` を追加する | `aria-current={isFocused ? 'page' : undefined}`                      |

#### 1-3: アクセシビリティ要件

| WCAG 基準            | 実装内容                                                           |
| -------------------- | ------------------------------------------------------------------ |
| 2.1.1 キーボード     | Arrow/Enter/Space/Escape/Home/End の全キーを実装する               |
| 4.1.2 名前・役割・値 | `role="tree"`, `role="treeitem"`, `aria-selected`, `aria-expanded` |
| 2.4.7 フォーカス可視 | `focus:ring-2 focus:ring-offset-1` クラスで 2px フォーカスリング   |

### Task 2: UT-UI-05A-002 モバイルドロワー実装

**目的**: 画面幅 768px 未満でドロワー表示モードに切り替える。

#### 2-1: `MobileDrawer` コンポーネント新規作成

**配置先**: `apps/desktop/src/renderer/views/SkillEditorView/components/MobileDrawer.tsx`

| Props      | 型           | 説明                                    |
| ---------- | ------------ | --------------------------------------- |
| `isOpen`   | `boolean`    | ドロワーの開閉状態                      |
| `onClose`  | `() => void` | ドロワーを閉じるコールバック            |
| `children` | `ReactNode`  | ドロワー内のコンテンツ（FileTreePanel） |

**スタイリング**:

| 要素         | スタイル                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| ドロワー本体 | `fixed inset-y-0 left-0 w-[280px] z-40 transition-transform duration-250` |
| 開状態       | `translate-x-0`                                                           |
| 閉状態       | `-translate-x-full`                                                       |
| オーバーレイ | `fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-30`              |

**アクセシビリティ**:

| 属性/動作              | 実装                                          |
| ---------------------- | --------------------------------------------- |
| `aria-expanded` の管理 | ハンバーガーボタンに `aria-expanded={isOpen}` |
| Escape キーで閉じる    | `useEffect` で `keydown` リスナー登録・解除   |
| フォーカストラップ     | ドロワー開時にフォーカスをドロワー内に制限    |

#### 2-2: `SkillEditorView` のレスポンシブ対応修正

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/index.tsx`

| 修正内容                                        | 具体的な変更                                                 |
| ----------------------------------------------- | ------------------------------------------------------------ |
| モバイル判定 Hook を追加する                    | `const isMobile = useMediaQuery('(max-width: 767px)')`       |
| `isMobile` のとき `MobileDrawer` を表示する     | 条件レンダリングで MobileDrawer と通常レイアウトを切り替える |
| ハンバーガーボタンを `EditorToolBar` に追加する | `isMobile` 時のみ表示するボタンを追加                        |
| `isDrawerOpen` 状態を管理する                   | `useState(false)` でローカル UI 状態として管理               |
| ファイル選択時にドロワーを閉じる                | `onFileSelect` コールバックで `setIsDrawerOpen(false)`       |

### Task 3: UT-UI-05A-003 Cmd/Ctrl+S 保存ショートカット実装

**目的**: `useEffect` でキーボードショートカットリスナーを登録し、Cmd/Ctrl+S で保存を実行する。

#### 3-1: `useSkillEditor` Hook への保存ショートカット追加

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/hooks/useSkillEditor.ts`

| 追加内容                              | 実装方針                                                             |
| ------------------------------------- | -------------------------------------------------------------------- | --- | ----------------------------------------------- |
| `isPlatformSaveKey(e)` ユーティリティ | `(e.metaKey                                                          |     | e.ctrlKey) && e.key === 's'` を判定する純粋関数 |
| `useEffect` でリスナー登録・解除      | `document.addEventListener('keydown', handler)` + cleanup（P5 対策） |
| `isReadOnly` / `isSaving` ガード      | 条件を満たすときのみ `handleSave()` を呼び出す                       |
| `e.preventDefault()` の呼び出し       | ブラウザのデフォルト保存ダイアログをキャンセルする                   |

**実装パターン**:

```typescript
// isPlatformSaveKey をモジュールスコープで定義（共通ユーティリティとして）
export const isPlatformSaveKey = (e: KeyboardEvent): boolean =>
  (e.metaKey || e.ctrlKey) && e.key === "s";

// Hook 内での使用
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isPlatformSaveKey(e)) return;
    e.preventDefault();
    if (isReadOnly || isSaving || !selectedFile) return;
    handleSave();
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown); // P5 対策
}, [isReadOnly, isSaving, selectedFile, handleSave]);
```

### Task 4: UT-UI-05A-004 保存成功 Toast 実装

**目的**: 保存成功・失敗時に Toast 通知を表示する。

#### 4-1: `useToast` Hook 新規作成

**配置先**: `apps/desktop/src/renderer/views/SkillEditorView/hooks/useToast.ts`

| 管理する state / 関数          | 型・説明                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| `toasts`                       | `Toast[]`（表示中の Toast 配列）                           |
| `showToast({ type, message })` | Toast を追加し、success の場合は 2500ms タイマーを設定する |
| `dismissToast(id)`             | 指定 ID の Toast を非表示にする                            |
| `TOAST_DURATION_MS`            | `2500`（定数化、success Toast の自動消去タイムアウト）     |

**Toast タイマー実装**:

- `type: 'success'` の場合のみ `setTimeout(() => dismissToast(id), TOAST_DURATION_MS)` を設定
- 連続呼び出し時は前のタイマーを `clearTimeout` してリセット
- `type: 'error'` の場合はタイマーを設定しない（手動消去のみ）
- `useEffect` cleanup で全タイマーを解除する（P13 対策: runAllTimers 非使用）

#### 4-2: `Toast` コンポーネント新規作成

**配置先**: `apps/desktop/src/renderer/views/SkillEditorView/components/Toast.tsx`

| Props       | 型           | 説明                             |
| ----------- | ------------ | -------------------------------- | ------------------------------------------ |
| `type`      | `'success'   | 'error'`                         | Toast の種類（アイコンとスタイルを変える） |
| `message`   | `string`     | 表示メッセージ                   |
| `onDismiss` | `() => void` | × ボタンクリック時のコールバック |

**スタイリング（Apple HIG 準拠）**:

| 要素     | スタイル                                                                             |
| -------- | ------------------------------------------------------------------------------------ |
| コンテナ | `fixed bottom-4 right-4 z-50 rounded-lg shadow-md px-4 py-3 flex items-center gap-2` |
| 成功     | `bg-[var(--status-success)] text-white`                                              |
| エラー   | `bg-[var(--status-error)] text-white`                                                |
| テキスト | `text-sm font-medium`                                                                |
| 出現     | `opacity-0 animate-in fade-in-0 slide-in-from-bottom-2 duration-200`                 |

**アクセシビリティ**:

| 属性            | 実装                                      |
| --------------- | ----------------------------------------- |
| `role="status"` | success Toast（aria-live="polite" 相当）  |
| `role="alert"`  | error Toast（aria-live="assertive" 相当） |

#### 4-3: `ToastContainer` と `SkillEditorView` への統合

- `ToastContainer` を `SkillEditorView` の JSX 末尾に配置する
- `useToast()` を `useSkillEditor` Hook に統合し、保存成功/失敗時に `showToast` を呼び出す

### Task 5: UT-UI-05A-005 読み取り専用表示強化実装

**目的**: `isReadOnly=true` のとき、ロックアイコン・バナー・aria-readonly で明示的に編集不可を伝える。

#### 5-1: `ReadOnlyBanner` コンポーネント新規作成

**配置先**: `apps/desktop/src/renderer/views/SkillEditorView/components/ReadOnlyBanner.tsx`

| Props        | 型        | 説明                        |
| ------------ | --------- | --------------------------- |
| `isReadOnly` | `boolean` | true のときバナーを表示する |

**スタイリング（Apple HIG 準拠）**:

- `bg-[var(--bg-tertiary)] border-b border-[var(--border-default)]`
- `flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)]`
- Lock アイコン: `lucide-react` の `Lock` コンポーネント（size={16}）

**表示テキスト**: 「読み取り専用 — 編集できません」

#### 5-2: `EditorToolBar` の保存/バックアップボタン非表示

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/components/EditorToolBar.tsx`

| 修正内容                             | 具体的な変更                                                     |
| ------------------------------------ | ---------------------------------------------------------------- |
| `isReadOnly` props を追加する        | Props 型定義に `isReadOnly: boolean` を追加（is プレフィックス） |
| 保存ボタンを `isReadOnly` 時に非表示 | `{!isReadOnly && <SaveButton />}` の条件レンダリング             |
| ロックアイコンをファイル名付近に表示 | `isReadOnly` 時にファイル名の横に Lock アイコンを表示            |

#### 5-3: `EditorPanel` への `aria-readonly` 追加

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/components/EditorPanel.tsx`

- `aria-readonly={isReadOnly ? "true" : undefined}` を追加する
- `isReadOnly=true` のとき `readOnly` 属性を textarea/contenteditable に追加する

#### 5-4: `SkillEditorView` レイアウト統合

- `isReadOnly` 時に `<ReadOnlyBanner />` をエディターエリア上部に配置する

### Task 6: UT-UI-05A-006 ナビゲーション導線配線実装

**目的**: `ViewType` に `'skill-editor'` を追加し、AppDock/SkillCenter との遷移を配線する。

#### 6-1: `ViewType` 型の拡張

**修正箇所**: `apps/desktop/src/renderer/types/navigation.ts`（または Store の型定義箇所）

```typescript
// 既存の ViewType ユニオン型に 'skill-editor' を追加
export type ViewType = 'agent' | 'settings' | 'skill-center' | 'skill-editor' | ...;
```

#### 6-2: Zustand Store へ `currentSkillName` を追加

**修正箇所**: `apps/desktop/src/renderer/store/navigationSlice.ts`（または相当するスライス）

| 追加内容                    | 型・説明                     |
| --------------------------- | ---------------------------- | ----------------------------- |
| `currentSkillName`          | `string                      | null`（現在編集中のスキル名） |
| `setCurrentSkillName(name)` | スキル名を設定するアクション |
| `useCurrentSkillName()`     | 個別セレクタ（P31 対策）     |
| `useSetCurrentSkillName()`  | アクションの個別セレクタ     |

#### 6-3: `SkillEditorView` の閉じるボタン配線

**修正箇所**: `apps/desktop/src/renderer/views/SkillEditorView/index.tsx`

- 閉じるボタン（×）を `EditorToolBar` の右端に追加する
- 未保存変更（`isEditorDirty`）があるとき `UnsavedChangesDialog` を表示する
- ダイアログ「破棄」選択時: `setCurrentView('skill-center')` を呼び出す
- ダイアログ「キャンセル」選択時: ダイアログを閉じるのみ

### Task 7: UT-UI-05A-007 マイクロアニメーション実装

**目的**: 各インタラクションに Tailwind CSS トランジションを追加し、`prefers-reduced-motion` でオプトアウト可能にする。

#### 7-1: 実装アニメーション一覧

| 要素                          | Tailwind クラス                                            | 時間  |
| ----------------------------- | ---------------------------------------------------------- | ----- |
| FileTreeNode 選択背景色       | `transition-colors duration-150 ease-in-out`               | 150ms |
| ディレクトリ展開/折り畳み     | `transition-[max-height] duration-200 overflow-hidden`     | 200ms |
| エディターコンテンツ切り替え  | `transition-opacity duration-150`                          | 150ms |
| ツールバーボタン ホバー       | `transition-colors duration-150`                           | 150ms |
| Toast 出現/消去               | `transition-opacity duration-200` + `transition-transform` | 200ms |
| モバイルドロワー スライドイン | `transition-transform duration-250 ease-in-out`            | 250ms |

#### 7-2: `prefers-reduced-motion` 対応

```typescript
// useReducedMotion Hook（新規作成）
export const useReducedMotion = (): boolean => {
  const [isReduced, setIsReduced] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // matchMedia の変化を購読して動的に反映
  return isReduced;
};
```

- `isReduced` が `true` のとき、全 transition クラスを除去する
- Tailwind の `motion-reduce:` バリアントを活用する

```html
<!-- motion-reduce バリアントの使用例 -->
<div class="transition-colors duration-150 motion-reduce:transition-none"></div>
```

#### 7-3: CSS 変数によるアニメーション値の管理

アニメーション値を CSS カスタムプロパティに集約する:

```css
/* 既存のデザイントークンに追加 */
:root {
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 200ms;
  --animation-duration-slow: 250ms;
  --animation-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 参照資料

| 資料                     | パス / 参照先                                                                     |
| ------------------------ | --------------------------------------------------------------------------------- |
| Phase 4 テスト仕様書     | `phase-4-test-creation.md`                                                        |
| Phase 2 設計書           | `phase-2-design.md`                                                               |
| Phase 1 要件定義書       | `phase-1-requirements.md`                                                         |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                                |
| Apple HIG カラーパレット | `.claude/rules/01-architecture.md#カラーパレット`                                 |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                            |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`（P5, P31, P39, P47）                         |
| Preload skill-api        | `apps/desktop/src/preload/skill-api.ts`                                           |
| aiworkflow Feature仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow 層設計        | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         |
| aiworkflow 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow テスト規約    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |

## 実行手順

### Step 1: UT-UI-05A-001 実装（FileTree キーボードナビゲーション）

1. `useKeyboardNavigation.ts` Hook を新規作成する
2. `FileTreePanel.tsx` に `tabIndex`, `role="tree"`, `useKeyboardNavigation` を統合する
3. フォーカスリングのスタイルを追加する
4. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx` で Green を確認する

### Step 2: UT-UI-05A-002 実装（モバイルドロワー）

1. `useMediaQuery` Hook が存在しない場合は作成する
2. `MobileDrawer.tsx` コンポーネントを新規作成する
3. `SkillEditorView/index.tsx` にモバイル分岐を追加する
4. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/SkillEditorView.drawer.test.tsx` で Green を確認する

### Step 3: UT-UI-05A-003 実装（Cmd/Ctrl+S ショートカット）

1. `isPlatformSaveKey` ユーティリティ関数を作成する
2. `useSkillEditor.ts` に保存ショートカット `useEffect` を追加する
3. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/useSkillEditor.shortcut.test.ts` で Green を確認する

### Step 4: UT-UI-05A-004 実装（Toast 通知）

1. `useToast.ts` Hook を新規作成する（`TOAST_DURATION_MS = 2500` 定数を含む）
2. `Toast.tsx` コンポーネントを新規作成する
3. `ToastContainer` を `SkillEditorView` に統合する
4. `useSkillEditor.ts` に保存成功/失敗時の `showToast` 呼び出しを追加する
5. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/useToast.test.ts src/renderer/views/SkillEditorView/__tests__/Toast.test.tsx` で Green を確認する

### Step 5: UT-UI-05A-005 実装（読み取り専用表示強化）

1. `ReadOnlyBanner.tsx` コンポーネントを新規作成する
2. `EditorToolBar.tsx` に `isReadOnly` props と条件レンダリングを追加する
3. `EditorPanel.tsx` に `aria-readonly` を追加する
4. `SkillEditorView/index.tsx` で `ReadOnlyBanner` を統合する
5. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/ReadOnlyBanner.test.tsx src/renderer/views/SkillEditorView/__tests__/SkillEditorView.readonly.test.tsx` で Green を確認する

### Step 6: UT-UI-05A-006 実装（ナビゲーション導線配線）

1. `ViewType` 型に `'skill-editor'` を追加する
2. navigationSlice（または相当箇所）に `currentSkillName` を追加する
3. `SkillEditorView/index.tsx` に閉じるボタンと `UnsavedChangesDialog` 連携を追加する
4. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/SkillEditorView.navigation.test.tsx` で Green を確認する

### Step 7: UT-UI-05A-007 実装（マイクロアニメーション）

1. `useReducedMotion.ts` Hook を新規作成する
2. CSS カスタムプロパティをデザイントークンに追加する
3. 各コンポーネントに `transition-*` と `motion-reduce:transition-none` を追加する
4. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/SkillEditorView.animation.test.tsx` で Green を確認する

### Step 8: 全体テスト確認

1. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/` で全 67 テストが Green であることを確認する

## 統合テスト連携【必須】

| 連携観点           | 実装で満たす条件                                               | 確認出力先                                  |
| ------------------ | -------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 テスト接続 | Red テストの失敗理由を仕様どおりに解消する                     | `outputs/phase-5/implementation-summary.md` |
| IPC 契約接続       | `channels.ts` のチャネル定数を使用し、文字列リテラルを使わない | `outputs/phase-5/implementation-summary.md` |
| セキュリティ接続   | P5 対策（useEffect cleanup）と P31 対策（個別セレクタ）を実装  | `outputs/phase-5/implementation-summary.md` |
| a11y 接続          | Phase 6 で検証可能な ARIA/キーボード対応を実装する             | `outputs/phase-6/test-expansion-report.md`  |

## 成果物

| 成果物                           | パス                                                                             |
| -------------------------------- | -------------------------------------------------------------------------------- |
| 実装サマリー                     | `outputs/phase-5/implementation-summary.md`                                      |
| useKeyboardNavigation Hook       | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useKeyboardNavigation.ts` |
| useToast Hook                    | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useToast.ts`              |
| useReducedMotion Hook            | `apps/desktop/src/renderer/views/SkillEditorView/hooks/useReducedMotion.ts`      |
| isPlatformSaveKey ユーティリティ | `apps/desktop/src/renderer/views/SkillEditorView/utils/keyboardUtils.ts`         |
| Toast コンポーネント             | `apps/desktop/src/renderer/views/SkillEditorView/components/Toast.tsx`           |
| ReadOnlyBanner コンポーネント    | `apps/desktop/src/renderer/views/SkillEditorView/components/ReadOnlyBanner.tsx`  |
| MobileDrawer コンポーネント      | `apps/desktop/src/renderer/views/SkillEditorView/components/MobileDrawer.tsx`    |
| 修正済みコンポーネント群         | `apps/desktop/src/renderer/views/SkillEditorView/components/`（修正ファイル群）  |

## 完了条件

- [ ] Phase 4 で作成した全 67 テストが Green（成功）状態である
- [ ] `useKeyboardNavigation` Hook が Arrow/Enter/Space/Escape/Home/End をサポートしている
- [ ] モバイルドロワーが 768px 未満で表示され、オーバーレイクリック・Escape で閉じられる
- [ ] Cmd/Ctrl+S でファイルが保存される（`isReadOnly`・`isSaving`・未選択時は無効）
- [ ] `e.preventDefault()` でブラウザのデフォルト保存がキャンセルされる
- [ ] Toast が 2500ms 後に自動消去され、エラー Toast は自動消去されない
- [ ] `isReadOnly=true` のとき ReadOnlyBanner・Lock アイコン・aria-readonly が表示される
- [ ] 保存ボタンが `isReadOnly=true` のとき非表示になる
- [ ] `ViewType` に `'skill-editor'` が追加されている
- [ ] `currentSkillName` が Zustand Store に追加されている（P31 対策: 個別セレクタ）
- [ ] `useEffect` の全リスナーに cleanup 関数が実装されている（P5 対策）
- [ ] 個別セレクタのみ使用し、合成 Store Hook を使用していない（P31 対策）
- [ ] `motion-reduce:transition-none` で `prefers-reduced-motion` に対応している
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了していること**

## 次 Phase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテストを追加し、Phase 7 のカバレッジ基準達成を目指す。
