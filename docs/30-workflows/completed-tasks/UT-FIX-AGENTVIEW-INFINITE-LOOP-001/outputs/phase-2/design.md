# Phase 2: 設計書 - AgentView無限ループ修正

## メタ情報

| 項目        | 値                                                      |
| ----------- | ------------------------------------------------------- |
| タスクID    | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                      |
| Phase       | 2                                                       |
| 機能名      | AgentView無限ループ修正                                 |
| 分類        | バグ修正                                                |
| 作成日      | 2026-02-12                                              |
| 関連Pitfall | P31（Zustand Store Hooks無限ループ）                    |
| ステータス  | 完了                                                    |
| 依存        | Phase 1 要件定義書（`outputs/phase-1/requirements.md`） |

---

## 1. 設計方針

### 方針: agentSlice既存アクション再利用 + 不足セレクタ追加

AgentView内のローカル`fetchSkills`（`useCallback`）を廃止し、agentSlice内の既存`fetchSkills`アクション（`useFetchSkills()`個別セレクタ経由）に統一する。

### 選択理由

Phase 1セクション8.1で提示された2つの選択肢のうち、**選択肢A（agentSlice.fetchSkillsへの統合）** を採用する。

| 検討項目                    | 選択肢A（agentSlice統合）           | 選択肢B（個別セレクタ修正のみ）      |
| --------------------------- | ----------------------------------- | ------------------------------------ |
| ローディング/エラー状態管理 | agentSlice内で自動管理              | AgentView側で手動管理が必要          |
| 実装量                      | 少ない（fetchSkills呼び出しのみ）   | 多い（useCallback+個別セレクタ移行） |
| P31準拠                     | 完全準拠（個別セレクタのみ使用）    | 準拠可能だが冗長                     |
| 他コンポーネントとの一貫性  | SettingsView/LLMSelectorPanelと同一 | AgentViewのみ独自パターン            |
| 状態の二重管理解消          | 解消される                          | `isLoading`と`isLoadingSkills`が共存 |

**選択肢Aの具体的メリット**:

1. agentSliceの`fetchSkills`は`isLoadingSkills`, `skillError`, `availableSkillsMetadata`, `importedSkills`を内部で管理しており、AgentView側で`setLoading`/`setError`/`setSkills`を個別に操作する必要がない
2. 個別セレクタHookは参照が安定しており、P31パターンの長期解決策に準拠する
3. 既存のSettingsView, LLMSelectorPanel, SkillSelectorと同じパターンになり一貫性が保たれる

### 状態の二重管理問題の解決（Phase 1セクション8.2）

| 現状の二重管理      | 解決方針                                                              |
| ------------------- | --------------------------------------------------------------------- |
| `isLoading` (Agent) | AgentViewでは`isLoadingSkills`を使用する。`isLoading`は他の用途で保持 |
| `error` (Agent)     | AgentViewでは`skillError`を使用する。`error`は他の用途で保持          |
| `skills` (Agent)    | AgentViewでは`importedSkills`を使用する。`skills`はレガシー互換で保持 |

---

## 2. データフロー設計

### 2.1 Before（現状 - 無限ループ発生）

```
AgentView mount
  -> useAppStore((s) => s.setSkills)    // Line 108: インラインセレクタ
  -> useAppStore((s) => s.setLoading)   // Line 117: インラインセレクタ
  -> useAppStore((s) => s.setError)     // Line 118: インラインセレクタ
  -> useCallback(fetchSkills, [setSkills, setLoading, setError])  // Line 145-161
  -> useEffect(() => fetchSkills(), [fetchSkills])                // Line 175-180
  -> fetchSkills() -> setSkills() -> Store状態更新 -> 再レンダー
  -> インラインセレクタ再評価 -> 参照変化 -> useCallback更新
  -> useEffect再トリガー -> fetchSkills()再実行 -> 無限ループ
```

**無限ループの根本原因**: Store状態更新によるコンポーネント再レンダー時に、`useAppStore((state) => state.setSkills)`等のインラインセレクタの返却値の同一性判定が失敗し、関数参照が変わったとみなされること。

### 2.2 After（修正後 - 有限回で収束）

```
AgentView mount
  -> useFetchSkills()         // 個別セレクタ: state.fetchSkills（参照安定）
  -> useImportedSkills()      // 個別セレクタ: state.importedSkills（参照安定）
  -> useIsLoadingSkills()     // 個別セレクタ: state.isLoadingSkills（参照安定）
  -> useSkillError()          // 個別セレクタ: state.skillError（参照安定）
  -> useEffect(() => fetchSkills(), [fetchSkills])
     // fetchSkillsの参照は安定（Zustandのアクション関数は不変）
     // -> 1回だけ実行（StrictMode考慮で最大2回）
```

**収束メカニズム**: Zustandの個別セレクタHookは、セレクタ関数の返却値がプリミティブまたは同一参照のオブジェクトである場合、コンポーネント再レンダーを引き起こさない。アクション関数（`state.fetchSkills`等）はStore作成時に一度だけ生成され、以降は同一参照が返される。

---

## 3. 修正対象ファイルと変更内容

### 3.1 store/index.ts - 不足セレクタHookの追加

Phase 1セクション2.2で特定された21個の不足セレクタHookを追加する。

#### 3.1.1 追加するセレクタHook一覧

**状態セレクタ（10個）**:

```typescript
// --- AgentSlice レガシー状態セレクタ ---
/** スキル一覧（レガシー: Skill[]型） */
export const useAgentSkills = () => useAppStore((state) => state.skills);
/** 利用可能なスキル一覧（レガシー: Skill[]型） */
export const useAgentAvailableSkills = () =>
  useAppStore((state) => state.availableSkills);
/** インポート済みスキルID一覧 */
export const useImportedSkillIds = () =>
  useAppStore((state) => state.importedSkillIds);
/** 選択中のスキル（レガシー: Skill | null型） */
export const useAgentSelectedSkill = () =>
  useAppStore((state) => state.selectedSkill);
/** スキルフィルター文字列 */
export const useSkillFilter = () => useAppStore((state) => state.skillFilter);
/** スキルカテゴリフィルター */
export const useSkillCategory = () =>
  useAppStore((state) => state.skillCategory);
/** インポートダイアログ表示状態 */
export const useIsImportDialogOpen = () =>
  useAppStore((state) => state.isImportDialogOpen);
/** トーストメッセージ */
export const useToastMessage = () => useAppStore((state) => state.toastMessage);
/** エージェントローディング状態（レガシー） */
export const useAgentIsLoading = () => useAppStore((state) => state.isLoading);
/** エージェントエラー（レガシー） */
export const useAgentError = () => useAppStore((state) => state.error);
```

**アクションセレクタ（11個）**:

```typescript
// --- AgentSlice レガシーアクションセレクタ ---
/** スキル一覧を設定 */
export const useSetSkills = () => useAppStore((state) => state.setSkills);
/** 利用可能スキル一覧を設定 */
export const useSetAvailableSkills = () =>
  useAppStore((state) => state.setAvailableSkills);
/** スキルを選択（レガシー） */
export const useSelectSkill = () => useAppStore((state) => state.selectSkill);
/** フィルター文字列を設定 */
export const useSetSkillFilter = () =>
  useAppStore((state) => state.setSkillFilter);
/** カテゴリフィルターを設定 */
export const useSetSkillCategory = () =>
  useAppStore((state) => state.setSkillCategory);
/** インポートダイアログを開く */
export const useOpenImportDialog = () =>
  useAppStore((state) => state.openImportDialog);
/** インポートダイアログを閉じる */
export const useCloseImportDialog = () =>
  useAppStore((state) => state.closeImportDialog);
/** トーストを表示 */
export const useShowToast = () => useAppStore((state) => state.showToast);
/** トーストをクリア */
export const useClearToast = () => useAppStore((state) => state.clearToast);
/** ローディング状態を設定（レガシー） */
export const useSetAgentLoading = () =>
  useAppStore((state) => state.setLoading);
/** エラーを設定（レガシー） */
export const useSetAgentError = () => useAppStore((state) => state.setError);
```

#### 3.1.2 命名規則

| プレフィックス | 用途                                   | 衝突回避                         |
| -------------- | -------------------------------------- | -------------------------------- |
| `useAgent*`    | AgentSlice固有の汎用状態/アクション    | `useAuthLoading`等との衝突を回避 |
| `useSkill*`    | SkillSlice由来の状態（既存命名に準拠） | 既に確立済み                     |
| `useSetSkill*` | SkillSlice由来のsetterアクション       | 既に確立済み                     |
| `useIs*`       | boolean状態                            | 既に確立済み                     |

#### 3.1.3 配置位置

既存の個別セレクタブロック（Line 444-514 `// 個別セレクタ（UT-STORE-HOOKS-REFACTOR-001）`）の直後に、新しいセクションとして追加:

```typescript
// ==========================================================================
// AgentSlice レガシー個別セレクタ（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）
// P31対策: AgentView無限ループ修正のため個別に取得
// ==========================================================================
```

### 3.2 AgentView/index.tsx - 個別セレクタHookへの移行

#### 3.2.1 削除対象

| 行番号（現状） | 対象コード                                                                          | 理由                               |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------------------- |
| Line 91-93     | `const renderCount = useRef(0);` + `renderCount.current += 1;` + `console.log(...)` | NFREQ-1: デバッグログ除去          |
| Line 145-161   | `const fetchSkills = useCallback(async () => { ... }, [...])`                       | agentSlice.fetchSkillsに統合       |
| Line 164-173   | `const fetchAvailableSkills = useCallback(async () => { ... }, [...])`              | agentSlice.rescanSkillsに統合      |
| Line 175-180   | `useEffect(() => { console.log(...); fetchSkills(); }, [fetchSkills])`              | デバッグログ除去 + useEffect簡略化 |

#### 3.2.2 import文の変更

**Before**:

```typescript
import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import { useAppStore } from "../../store";
```

**After**:

```typescript
import React, { useEffect, useCallback, useState, useMemo } from "react";
import {
  useFetchSkills,
  useIsLoadingSkills,
  useSkillError,
  useImportedSkills,
  useAgentAvailableSkills,
  useImportedSkillIds,
  useAgentSelectedSkill,
  useSkillFilter,
  useSkillCategory,
  useIsImportDialogOpen,
  useToastMessage,
  useSetAvailableSkills,
  useSelectSkill,
  useSetSkillFilter,
  useSetSkillCategory,
  useOpenImportDialog,
  useCloseImportDialog,
  useShowToast,
  useClearToast,
  useClearSkillError,
} from "../../store";
```

注意: `useRef`は不要になる（renderCountデバッグ除去のため）。`useCallback`は`handleImportClick`, `handleSkillSelect`, `handleExecute`, `handleDelete`, `handleCloseDetail`, `handleImport`, `handleRetry`で引き続き必要。

#### 3.2.3 インラインセレクタの置換マッピング

| #   | Before (インラインセレクタ)                           | After (個別セレクタHook)    | 状態/アクション | 備考                                       |
| --- | ----------------------------------------------------- | --------------------------- | --------------- | ------------------------------------------ |
| 1   | `useAppStore((s) => s.isLoading)` (Line 96)           | `useIsLoadingSkills()`      | 状態            | agentSlice.isLoadingSkillsに統一           |
| 2   | `useAppStore((s) => s.error)` (Line 97)               | `useSkillError()`           | 状態            | agentSlice.skillErrorに統一                |
| 3   | `useAppStore((s) => s.skills)` (Line 98)              | `useImportedSkills()`       | 状態            | importedSkillsを使用（型変換が必要、後述） |
| 4   | `useAppStore((s) => s.availableSkills)` (Line 99)     | `useAgentAvailableSkills()` | 状態            | レガシーavailableSkills                    |
| 5   | `useAppStore((s) => s.importedSkillIds)` (Line 100)   | `useImportedSkillIds()`     | 状態            | 新規追加セレクタ                           |
| 6   | `useAppStore((s) => s.selectedSkill)` (Line 101)      | `useAgentSelectedSkill()`   | 状態            | レガシーselectedSkill                      |
| 7   | `useAppStore((s) => s.skillFilter)` (Line 102)        | `useSkillFilter()`          | 状態            | 新規追加セレクタ                           |
| 8   | `useAppStore((s) => s.skillCategory)` (Line 103)      | `useSkillCategory()`        | 状態            | 新規追加セレクタ                           |
| 9   | `useAppStore((s) => s.isImportDialogOpen)` (Line 104) | `useIsImportDialogOpen()`   | 状態            | 新規追加セレクタ                           |
| 10  | `useAppStore((s) => s.toastMessage)` (Line 105)       | `useToastMessage()`         | 状態            | 新規追加セレクタ                           |
| 11  | `useAppStore((s) => s.setSkills)` (Line 108)          | 削除                        | アクション      | useFetchSkillsに統合（手動setSkills不要）  |
| 12  | `useAppStore((s) => s.setAvailableSkills)` (Line 109) | `useSetAvailableSkills()`   | アクション      | fetchAvailableSkills内で使用               |
| 13  | `useAppStore((s) => s.selectSkill)` (Line 110)        | `useSelectSkill()`          | アクション      | handleSkillSelect/handleDelete等で使用     |
| 14  | `useAppStore((s) => s.setSkillFilter)` (Line 111)     | `useSetSkillFilter()`       | アクション      | SkillSearchBar.onChange                    |
| 15  | `useAppStore((s) => s.setSkillCategory)` (Line 112)   | `useSetSkillCategory()`     | アクション      | SkillCategoryFilter.onChange               |
| 16  | `useAppStore((s) => s.openImportDialog)` (Line 113)   | `useOpenImportDialog()`     | アクション      | handleImportClick                          |
| 17  | `useAppStore((s) => s.closeImportDialog)` (Line 114)  | `useCloseImportDialog()`    | アクション      | handleImport/SkillImportDialog.onClose     |
| 18  | `useAppStore((s) => s.showToast)` (Line 115)          | `useShowToast()`            | アクション      | handleExecute/handleDelete/handleImport    |
| 19  | `useAppStore((s) => s.clearToast)` (Line 116)         | `useClearToast()`           | アクション      | Toast.onClose                              |
| 20  | `useAppStore((s) => s.setLoading)` (Line 117)         | 削除                        | アクション      | useFetchSkillsに統合（手動setLoading不要） |
| 21  | `useAppStore((s) => s.setError)` (Line 118)           | 削除                        | アクション      | useFetchSkillsに統合（手動setError不要）   |

#### 3.2.4 fetchSkillsの移行

**Before（Line 145-161）**: ローカルuseCallbackで定義

```typescript
const fetchSkills = useCallback(async () => {
  setLoading(true);
  setError(null);
  try {
    const imported = await window.electronAPI.skill.getImported();
    setSkills(imported as unknown as Skill[]);
  } catch (err) {
    setError(/* ... */);
  } finally {
    setLoading(false);
  }
}, [setSkills, setLoading, setError]);
```

**After**: agentSliceの`fetchSkills`を個別セレクタで取得

```typescript
const fetchSkills = useFetchSkills();
```

agentSliceの`fetchSkills`（agentSlice.ts Line 556-577）は以下を内部で管理:

- `isLoadingSkills: true` -> API呼び出し -> `isLoadingSkills: false`
- エラー時: `skillError`にメッセージ設定
- 成功時: `availableSkillsMetadata`と`importedSkills`を更新

**注意**: agentSliceの`fetchSkills`は`window.electronAPI.skill.list()`と`window.electronAPI.skill.getImported()`を**両方**呼び出す（Promise.all）。現状のAgentViewローカル版は`getImported()`のみ。統合により`list()`も同時に呼ばれるようになるが、インポートダイアログ用のデータが事前にキャッシュされるため、パフォーマンスへの影響は許容範囲。

#### 3.2.5 fetchAvailableSkillsの移行

**Before（Line 164-173）**: ローカルuseCallbackで定義

```typescript
const fetchAvailableSkills = useCallback(async () => {
  try {
    const available = await window.electronAPI.skill.list();
    setAvailableSkills(available as unknown as Skill[]);
  } catch (_err) {
    // Silent error
  }
}, [setAvailableSkills]);
```

**After**: agentSliceの`fetchSkills`が`list()`も含むため、個別の`fetchAvailableSkills`は不要。ただし、`handleImportClick`で使われているため、`rescanSkills`に置き換えるか、`fetchSkills`を再呼び出しする。

設計判断: `handleImportClick`では`fetchSkills()`を再呼び出しする。理由:

- `rescanSkills`はファイルシステムを再スキャンする重い操作であり、インポートダイアログを開くだけの場面では過剰
- `fetchSkills()`は`list()`と`getImported()`をPromise.allで取得するため、利用可能スキル一覧のリフレッシュに十分

```typescript
// Before
const handleImportClick = useCallback(() => {
  fetchAvailableSkills();
  openImportDialog();
}, [fetchAvailableSkills, openImportDialog]);

// After
const handleImportClick = useCallback(() => {
  fetchSkills();
  openImportDialog();
}, [fetchSkills, openImportDialog]);
```

#### 3.2.6 useEffectの修正

**Before（Line 175-180）**:

```typescript
useEffect(() => {
  console.log(
    "[AgentView][DEBUG] useEffect triggered - fetchSkills reference changed",
  );
  fetchSkills();
}, [fetchSkills]);
```

**After**:

```typescript
useEffect(() => {
  fetchSkills();
}, [fetchSkills]);
```

- デバッグログを除去
- `fetchSkills`は`useFetchSkills()`による個別セレクタ経由で取得しているため、参照は安定
- React StrictMode下でも最大2回で収束

#### 3.2.7 型の課題と対応方針

agentSliceの`fetchSkills`は`importedSkills: ImportedSkill[]`を設定するが、AgentViewの子コンポーネント（SkillList, SkillDetailPanel等）は`Skill[]`型を期待している。

**対応方針（スコープ外の型統一は別タスク）**:

現在のAgentView内で`useImportedSkills()`の結果を`skills`として使用する際、propsインターフェースの互換性を確認する必要がある。

`importedSkills: ImportedSkill[]`と`skills: Skill[]`の型差異:

- `Skill`型: `id`, `name`, `description`, `path`, `triggers`, `category?` 等
- `ImportedSkill`型: `name`, `description`, `version`, `skillPath`, `importedAt` 等

現状のAgentViewはLine 151で`imported as unknown as Skill[]`の型アサーションを行っている。agentSliceの`fetchSkills`統合後も同様の型不整合が残るため、`skills`（レガシーフィールド）は引き続き子コンポーネントへの受け渡しに使用する。

具体的には:

- `useImportedSkills()`は`availableSkillsMetadata`と`importedSkills`を更新する（agentSlice.fetchSkills内部）
- しかしAgentViewの子コンポーネントは`skills`（Skill[]型）を使用
- agentSliceの`fetchSkills`は`skills`フィールドを更新しない
- そのため、AgentViewでは`fetchSkills()`呼び出し後に`skills`ではなく`importedSkills`を使用し、子コンポーネントには`importedSkills as unknown as Skill[]`として渡す

```typescript
// importedSkills を Skill[] としてキャストして子コンポーネントに渡す
const importedSkills = useImportedSkills();
const skills = importedSkills as unknown as Skill[];
```

#### 3.2.8 handleDelete/handleImportの修正

agentSliceに`removeSkill`と`importSkill`アクションが存在するが、AgentViewは直接`window.electronAPI.skill.remove()`と`window.electronAPI.skill.import()`を呼んでいる。

**設計判断**: 今回のスコープではhandleDelete/handleImportの内部実装は変更しない。ただし、`fetchSkills`参照はagentSlice版に統一する。

```typescript
// handleDelete: fetchSkills参照のみ更新（内部ロジックは維持）
const handleDelete = useCallback(
  async (skill: Skill) => {
    try {
      await window.electronAPI.skill.remove(skill.name);
      showToast("success", `${skill.name} を削除しました`);
      selectSkill(null);
      fetchSkills(); // agentSlice版を呼び出し
    } catch (err) {
      showToast("error" /* ... */);
    }
  },
  [fetchSkills, selectSkill, showToast],
);

// handleImport: fetchSkills参照のみ更新（内部ロジックは維持）
const handleImport = useCallback(
  async (skillIds: string[]) => {
    try {
      for (const skillName of skillIds) {
        await window.electronAPI.skill.import(skillName);
      }
      showToast("success", `${skillIds.length}件のスキルをインポートしました`);
      closeImportDialog();
      fetchSkills(); // agentSlice版を呼び出し
    } catch (err) {
      showToast("error" /* ... */);
    }
  },
  [closeImportDialog, fetchSkills, showToast],
);
```

#### 3.2.9 AgentView修正後の全体コード構成

```typescript
export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  // Store state - 個別セレクタHook使用
  const isLoading = useIsLoadingSkills();
  const error = useSkillError();
  const importedSkillsData = useImportedSkills();
  const skills = importedSkillsData as unknown as Skill[];
  const availableSkills = useAgentAvailableSkills();
  const importedSkillIds = useImportedSkillIds();
  const selectedSkill = useAgentSelectedSkill();
  const skillFilter = useSkillFilter();
  const skillCategory = useSkillCategory();
  const isImportDialogOpen = useIsImportDialogOpen();
  const toastMessage = useToastMessage();

  // Store actions - 個別セレクタHook使用
  const fetchSkills = useFetchSkills();
  const selectSkill = useSelectSkill();
  const setSkillFilter = useSetSkillFilter();
  const setSkillCategory = useSetSkillCategory();
  const openImportDialog = useOpenImportDialog();
  const closeImportDialog = useCloseImportDialog();
  const showToast = useShowToast();
  const clearToast = useClearToast();

  // Responsive state (変更なし)
  const [windowWidth, setWindowWidth] = useState(/* ... */);
  // ... 以下、既存ロジックを維持 ...

  // fetchSkills on mount - agentSlice版を使用
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Handlers - fetchSkills/fetchAvailableSkillsの参照のみ更新
  // handleImportClick, handleSkillSelect, handleExecute,
  // handleDelete, handleCloseDetail, handleImport, handleRetry
  // ...

  // JSX (変更なし - propsインターフェースは同一)
};
```

---

## 4. テスト設計接続（Phase 4向け）

### 4.1 テストケース一覧

| ID   | テストケース                                            | 種別   | 対応要件 |
| ---- | ------------------------------------------------------- | ------ | -------- |
| TC-1 | マウント時にfetchSkillsが1回だけ呼ばれること            | 機能   | REQ-1    |
| TC-2 | レンダー回数が有限であること（StrictMode考慮で最大4回） | 非機能 | NFREQ-4  |
| TC-3 | isLoadingSkillsがtrue->falseに遷移すること              | 機能   | REQ-4    |
| TC-4 | skillErrorが設定された場合エラーUIが表示されること      | 機能   | REQ-5    |
| TC-5 | 再試行ボタンでfetchSkillsが再度1回呼ばれること          | 機能   | REQ-6    |
| TC-6 | インポート後にfetchSkillsが1回呼ばれること              | 機能   | REQ-3    |
| TC-7 | 削除後にfetchSkillsが1回呼ばれること                    | 機能   | REQ-3    |
| TC-8 | console.logが含まれていないこと                         | 非機能 | NFREQ-1  |
| TC-9 | useAppStoreインラインセレクタが使用されていないこと     | 非機能 | NFREQ-2  |

### 4.2 テストモック戦略

既存テスト（AgentView.test.tsx）は`useAppStore`をモックしてセレクタ関数に模擬状態を返す方式。修正後は個別セレクタHookをモックする方式に変更する。

**Before（現行テスト）**:

```typescript
vi.mock("../../../store", () => ({
  useAppStore: vi.fn((selector) => selector(createMockState())),
}));
```

**After（修正後テスト）**:

```typescript
vi.mock("../../../store", () => ({
  // 個別セレクタHookをモック
  useFetchSkills: vi.fn(() => vi.fn()),
  useIsLoadingSkills: vi.fn(() => false),
  useSkillError: vi.fn(() => null),
  useImportedSkills: vi.fn(() => []),
  useAgentAvailableSkills: vi.fn(() => []),
  useImportedSkillIds: vi.fn(() => []),
  useAgentSelectedSkill: vi.fn(() => null),
  useSkillFilter: vi.fn(() => ""),
  useSkillCategory: vi.fn(() => null),
  useIsImportDialogOpen: vi.fn(() => false),
  useToastMessage: vi.fn(() => null),
  useSelectSkill: vi.fn(() => vi.fn()),
  useSetSkillFilter: vi.fn(() => vi.fn()),
  useSetSkillCategory: vi.fn(() => vi.fn()),
  useOpenImportDialog: vi.fn(() => vi.fn()),
  useCloseImportDialog: vi.fn(() => vi.fn()),
  useShowToast: vi.fn(() => vi.fn()),
  useClearToast: vi.fn(() => vi.fn()),
}));
```

### 4.3 統合テスト連携

| API呼び出し                                  | タイミング                  | 呼び出し元              |
| -------------------------------------------- | --------------------------- | ----------------------- |
| `window.electronAPI.skill.list()`            | マウント時（fetchSkills内） | agentSlice.fetchSkills  |
| `window.electronAPI.skill.getImported()`     | マウント時（fetchSkills内） | agentSlice.fetchSkills  |
| `window.electronAPI.skill.import(skillName)` | インポート実行時            | AgentView.handleImport  |
| `window.electronAPI.skill.remove(skillName)` | 削除実行時                  | AgentView.handleDelete  |
| `window.electronAPI.skill.execute(params)`   | スキル実行時                | AgentView.handleExecute |

---

## 5. 影響分析

### 5.1 影響を受けるファイル

| ファイル                                                                 | 変更種別 | 変更内容                                   |
| ------------------------------------------------------------------------ | -------- | ------------------------------------------ |
| `apps/desktop/src/renderer/store/index.ts`                               | 追加     | 個別セレクタHook 21個追加                  |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                    | 修正     | 個別セレクタ移行 + ローカルfetchSkills廃止 |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 修正     | モック方式変更 + 新規テスト追加            |

### 5.2 影響を受けないファイル

| ファイル                                                                 | 理由                                        |
| ------------------------------------------------------------------------ | ------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                   | 変更なし（既存のfetchSkillsをそのまま使用） |
| `apps/desktop/src/renderer/components/organisms/SkillList.tsx`           | propsインターフェース変更なし               |
| `apps/desktop/src/renderer/components/organisms/SkillDetailPanel.tsx`    | propsインターフェース変更なし               |
| `apps/desktop/src/renderer/components/organisms/SkillImportDialog.tsx`   | propsインターフェース変更なし               |
| `apps/desktop/src/renderer/components/molecules/SkillSearchBar.tsx`      | propsインターフェース変更なし               |
| `apps/desktop/src/renderer/components/molecules/SkillCategoryFilter.tsx` | propsインターフェース変更なし               |

### 5.3 リスク評価

| リスク                                                           | 影響度 | 発生確率 | 対策                                                            |
| ---------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------- |
| importedSkills（ImportedSkill[]）をSkill[]として使用時の型不整合 | 中     | 低       | 既存の`as unknown as Skill[]`と同等。スコープ外で型統一タスク化 |
| agentSlice.fetchSkillsがlist()も呼ぶことによるAPI呼び出し増加    | 低     | 確実     | 初回マウント時のみ。パフォーマンス影響は無視可能                |
| 既存テストのモック構造変更による一時的なテスト失敗               | 中     | 確実     | Phase 4で計画的にテストを修正                                   |
| store/index.tsのセレクタ数増加によるバンドルサイズ増加           | 低     | 低       | tree-shakingにより未使用セレクタは除外される                    |

---

## 6. 設計判断サマリ

| 判断事項                               | 決定内容                                       | 根拠                                   |
| -------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| fetchSkills統合先                      | agentSlice.fetchSkills                         | ローディング/エラー管理の自動化        |
| 状態の二重管理                         | isLoadingSkills/skillErrorを使用               | agentSlice.fetchSkillsと整合           |
| fetchAvailableSkillsの代替             | handleImportClick内でfetchSkills()を再呼び出し | rescanSkillsは過剰、fetchSkillsで十分  |
| 型アサーション（ImportedSkill->Skill） | 維持（スコープ外）                             | 影響範囲が広く別タスクで対応           |
| handleDelete/handleImportの内部実装    | 変更なし（fetchSkills参照のみ更新）            | 最小限の変更範囲で無限ループ修正に集中 |
| テストモック方式                       | 個別セレクタHookモック方式に変更               | 実装に合わせたテスト設計               |

---

## 成果物

| 成果物 | パス                        | 説明   |
| ------ | --------------------------- | ------ |
| 設計書 | `outputs/phase-2/design.md` | 本文書 |

## 完了条件

- [x] 設計方針が明確に選択・根拠付けされている（セクション1）
- [x] Before/Afterのデータフローが図示されている（セクション2）
- [x] 修正対象ファイルと変更内容が詳細に記述されている（セクション3）
- [x] 個別セレクタHookの命名規則と一覧が確定している（セクション3.1）
- [x] AgentViewのインラインセレクタ -> 個別セレクタHookの全置換マッピングが記述されている（セクション3.2.3）
- [x] テスト設計との接続点が定義されている（セクション4）
- [x] 影響分析が完了している（セクション5）
- [x] 設計判断が一覧化されている（セクション6）

## 次のPhase

Phase 3: 設計レビュー（`phase-3-design-review.md`）

- 本設計書の妥当性検証
- agentSlice.fetchSkills統合の妥当性確認
- 型アサーション戦略の適切性確認
