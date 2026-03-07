# Phase 2: 実装計画（Execution Plan）

> タスク: TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001
> 作成日: 2026-03-07

---

## 実装順序

### Step 1: navigationSlice.ts のガード追加（viewHistory）

**対象**: `apps/desktop/src/renderer/store/slices/navigationSlice.ts`
**設計判断**: DD-03, DD-04, DD-05

| 順序 | 変更内容                                                        | 行範囲 |
| ---- | --------------------------------------------------------------- | ------ |
| 1-1  | `setCurrentView`: `Array.isArray(state.viewHistory)` ガード追加 | L35-38 |
| 1-2  | `goBack`: `Array.isArray(history)` ガード追加                   | L42-43 |
| 1-3  | `canGoBack`: `Array.isArray` ガード追加                         | L54-56 |

**依存関係**: なし（独立して実装可能）

---

### Step 2: store/index.ts customStorage.getItem のガード追加（expandedFolders）

**対象**: `apps/desktop/src/renderer/store/index.ts`
**設計判断**: DD-01

| 順序 | 変更内容                                                         | 行範囲 |
| ---- | ---------------------------------------------------------------- | ------ |
| 2-1  | `getItem` 内の expandedFolders 変換を Array.isArray ガードで保護 | L84-88 |
| 2-2  | 非配列時に空 Set を生成し、`console.warn` で診断ログを出力       | 同上   |
| 2-3  | 配列要素の string フィルタリング追加                             | 同上   |

**依存関係**: なし（Step 1 と並列実装可能）

---

### Step 3: store/index.ts customStorage.setItem のガード追加（expandedFolders）

**対象**: `apps/desktop/src/renderer/store/index.ts`
**設計判断**: DD-02

| 順序 | 変更内容                                                                | 行範囲  |
| ---- | ----------------------------------------------------------------------- | ------- |
| 3-1  | `setItem` 内の expandedFolders 直列化を instanceof Set + isArray で保護 | L91-107 |
| 3-2  | 非 Set / 非配列時に空配列にフォールバックし、`console.warn` 出力        | 同上    |

**依存関係**: なし（Step 1, 2 と並列実装可能）

---

### Step 3.5: store/index.ts useCanGoBack セレクタのガード追加

**対象**: `apps/desktop/src/renderer/store/index.ts` L228-229
**設計判断**: DD-05

| 順序 | 変更内容                                               | 行範囲   |
| ---- | ------------------------------------------------------ | -------- |
| 3.5  | `useCanGoBack` セレクタに `Array.isArray` チェック追加 | L228-229 |

**依存関係**: なし

---

### Step 4: テスト追加（破損 fixture）

**対象**:

- `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`（既存ファイルに追加）
- `apps/desktop/src/renderer/store/__tests__/customStorage.test.ts`（新規作成）

| 順序 | テスト内容                                                          | 対象 DD  |
| ---- | ------------------------------------------------------------------- | -------- |
| 4-1  | navigationSlice: viewHistory 破損時の setCurrentView フォールバック | DD-03    |
| 4-2  | navigationSlice: viewHistory 破損時の goBack 安全リターン           | DD-04    |
| 4-3  | navigationSlice: viewHistory 破損時の canGoBack false 返却          | DD-05    |
| 4-4  | customStorage.getItem: 非配列 expandedFolders の空 Set 復旧         | DD-01    |
| 4-5  | customStorage.getItem: 混合型配列のフィルタリング                   | DD-01    |
| 4-6  | customStorage.setItem: Set -> Array 正常変換                        | DD-02    |
| 4-7  | customStorage.setItem: 非 Set 値のフォールバック                    | DD-02    |
| 4-8  | customStorage ラウンドトリップ: setItem -> getItem の一貫性         | DD-01,02 |

**破損 fixture 一覧**:

```typescript
// 非配列の expandedFolders
const corruptedExpandedFolders = [
  null,
  undefined,
  42,
  "string",
  { key: "value" },
];

// 混合型配列
const mixedArray = [1, "folder-a", null, "folder-b", true];

// 非配列の viewHistory
const corruptedViewHistory = [
  null,
  undefined,
  42,
  "dashboard",
  { view: "editor" },
];
```

**依存関係**: Step 1-3 の実装完了後に実行

---

## 委譲境界

### SubAgent 委譲対象

| Step | 委譲内容                                       | 推定ツール使用回数 |
| ---- | ---------------------------------------------- | ------------------ |
| 1-3  | navigationSlice.ts + store/index.ts の実装変更 | 5-8                |
| 4    | テストファイルの作成・既存テストへの追加       | 8-12               |

### Codex 委譲対象

- なし（本タスクの変更量は SubAgent で完結する規模）

---

## commit/PR 非実行ポリシー

本設計フェーズ（Phase 2）は設計成果物の作成のみを行う。以下の操作は Phase 2 では実行しない:

- `git commit` の実行
- `git push` の実行
- PR の作成
- プロダクションコードの変更

これらは Phase 4（テスト作成）および Phase 5（実装）で実施する。

---

## リスク分析

| リスク                                            | 影響度 | 対策                                                   |
| ------------------------------------------------- | ------ | ------------------------------------------------------ |
| customStorage 変更が他の persist フィールドに波及 | 中     | expandedFolders のみスコープ限定、他フィールドは不変   |
| console.warn の頻度が高すぎてログが埋まる         | 低     | getItem/setItem は Store 初期化時に1回ずつのみ呼ばれる |
| viewHistory ガードの追加で既存テストが壊れる      | 低     | ガードは非配列の場合のみ発動、正常パスは影響なし       |
