# Phase 5: 実装

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 5                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 2の設計に基づき、Store層の `isExecuting` ガードとUI層のdisabled制御を実装し、Phase 4で作成したテストをPASSさせる（Green Phase）。

## 実行タスク

- Store層ガード実装: `executeSkill` 関数冒頭に `isExecuting` ガードを追加
- UI層disabled制御実装: スキル実行ボタンにdisabled属性と視覚的フィードバックを追加
- テスト通過確認: Phase 4のT-01〜T-08が全てPASSすることを確認

## 参照資料

| 資料名         | パス                                                                                               | 説明             |
| -------------- | -------------------------------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計   | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`        | ガード設計詳細   |
| Phase 4 テスト | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md` | テストケース定義 |
| agentSlice実装 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                             | 修正対象ファイル |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Zustand Storeの状態更新パターン
- `interfaces-agent-sdk.md`: executeSkill型定義

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: Store層ガード実装

**対象ファイル:** `apps/desktop/src/renderer/store/slices/agentSlice.ts`

**修正箇所:** `executeSkill` 関数（742行目付近）

**変更内容:**

```typescript
// Before（現在のコード）
executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;
    // ... authKey事前検証 ...

// After（修正後）
executeSkill: async (prompt) => {
    const { selectedSkillName, isExecuting } = get();
    if (!selectedSkillName) return;

    // 並行実行ガード: 既に実行中の場合は即座に拒否（FR-01）
    if (isExecuting) return;

    // ... authKey事前検証（変更なし） ...
```

**変更量:** 2行追加（`isExecuting` の分割代入追加 + `if` ガード追加）

### ステップ2: UI層disabled制御実装

**対象:** `apps/desktop/src/renderer/components/agent/` 配下でスキル実行ボタンを含むコンポーネント

1. `executeSkill` を呼び出しているコンポーネントを `grep -rn "executeSkill" apps/desktop/src/renderer/components/agent/` で特定
2. 各コンポーネントに以下の変更を適用:

```typescript
// isExecuting を個別セレクタで取得（P31対策）
const isExecuting = useIsExecuting();
// もし useIsExecuting() が未定義の場合は useAppStore(state => state.isExecuting) を使用
```

3. ボタン要素に以下の属性を追加:

```tsx
<button
  disabled={isExecuting}
  className={isExecuting ? "opacity-50 cursor-not-allowed" : ""}
>
  {isExecuting ? "実行中..." : "実行"}
</button>
```

### ステップ3: 個別セレクタの確認・作成

1. `grep -rn "useIsExecuting" apps/desktop/src/renderer/` で既存セレクタを検索
2. 存在しない場合、agentSlice のセレクタファイルに以下を追加:

```typescript
export const useIsExecuting = () => useAppStore((state) => state.isExecuting);
```

**注意:** `isExecuting` はプリミティブ型（boolean）のため `useShallow` は不要（P48非該当）

### ステップ4: テスト通過確認（Green Phase）

```bash
# Store層テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts

# UI層テスト
cd apps/desktop && pnpm vitest run src/renderer/components/agent/__tests__/execute-button-disabled.test.tsx

# 既存テストの回帰確認
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice
```

- T-01〜T-08が全てPASSすることを確認
- 既存のagentSliceテストが全てPASSすることを確認（AC-06）

## 統合テスト連携（Phase 1〜11は必須）

- Store層ガードのユニットテスト（T-01〜T-05）がPASSすることを確認
- UI層コンポーネントテスト（T-06〜T-08）がPASSすることを確認
- 既存テストの回帰テストがPASSすることを確認

## 多角的チェック観点（AIが判断）

| 観点     | 適用 | チェック内容                                            |
| -------- | ---- | ------------------------------------------------------- |
| 状態管理 | 該当 | `get()` の分割代入に `isExecuting` が正しく含まれること |
| UI/UX    | 該当 | disabled状態のスタイルがHIG準拠であること               |
| 後方互換 | 該当 | 既存テストが全てPASSすること                            |

## 成果物

| 成果物            | パス                                                                                                | 説明                   |
| ----------------- | --------------------------------------------------------------------------------------------------- | ---------------------- |
| 実装仕様書        | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 本ドキュメント         |
| Store層ガード実装 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                              | executeSkillガード追加 |
| UI層disabled制御  | `apps/desktop/src/renderer/components/agent/` 配下                                                  | ボタンdisabled制御     |

## 完了条件

- [ ] `executeSkill` 関数冒頭に `if (isExecuting) return;` ガードが追加されている
- [ ] UI コンポーネントのスキル実行ボタンに `disabled={isExecuting}` が適用されている
- [ ] 実行中のボタンに視覚的フィードバック（opacity + テキスト変更）が実装されている
- [ ] T-01〜T-08のテストが全てPASSしている
- [ ] 既存のagentSliceテストが全てPASSしている（回帰なし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
