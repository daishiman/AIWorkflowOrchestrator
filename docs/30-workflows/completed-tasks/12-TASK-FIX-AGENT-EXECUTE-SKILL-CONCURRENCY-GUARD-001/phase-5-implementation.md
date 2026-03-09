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
- UI層回帰確認: 既存の実行中UIガード面に回帰がないことを確認
- テスト通過確認: Phase 4のT-01〜T-08が全てPASSすることを確認

## 参照資料

| 資料名                         | パス                                                                                                               | 説明                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Phase 2 設計                   | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`        | ガード設計詳細                     |
| Phase 4 テスト                 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md` | テストケース定義                   |
| agentSlice実装                 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                             | 修正対象ファイル（L742-797）       |
| ChatPanel                      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                          | `skill-management-toggle` 回帰対象 |
| ExecuteButton                  | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`                                       | 実行ボタンの既存ガード面           |
| AgentExecutionView             | `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx`                                        | 入力 disabled の既存ガード面       |
| 個別セレクタ                   | `apps/desktop/src/renderer/store/index.ts`                                                                         | `useIsSkillExecuting` 定義済み     |
| Store層ガードテスト T-01〜T-05 | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`                            | Phase 4 成果物                     |

### 前提Phase成果物

| 資料名           | パス                                                                                                               | 用途                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 要件     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md`  | 受入基準 AC-01〜AC-06    |
| Phase 2 設計     | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md`        | ガード設計詳細           |
| Phase 3 レビュー | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-3-design-review.md` | 設計レビュー結果（PASS） |
| Phase 4 テスト   | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md` | テストケース T-01〜T-08  |

## 実行手順

### ステップ1: Store層ガード実装

**対象ファイル:** `apps/desktop/src/renderer/store/slices/agentSlice.ts`

**修正箇所:** `executeSkill` 関数（L742-797）

**変更内容:**

```typescript
// Before（現在のコード — L742付近）
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

### ステップ2: UI層回帰確認

**対象ファイル:**

- `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`
- `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx`
- `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`

**確認内容:**

1. `ExecuteButton` は `isExecuting === true` で null render を維持する
2. `AgentExecutionView` は `AgentMessageInput` に `disabled={isExecuting}` を維持する
3. `ChatPanel` は `skill-management-toggle` に `disabled={isExecuting}` を維持し、`SkillStreamingView` の条件表示が崩れていない
4. UI側は必要な回帰がなければ無理に selector 置換を行わない

### ステップ3: 個別セレクタの確認

`useIsSkillExecuting` は `store/index.ts` に定義済み:

```typescript
export const useIsSkillExecuting = () =>
  useAppStore((state) => state.isExecuting);
```

**補足:** `isExecuting` はプリミティブ型（boolean）のため `useShallow` は不要（P48非該当）。`useAppStore((s) => s.isExecuting)` も P31 非該当であり、今回の必須変更ではない

### ステップ4: テスト通過確認（Green Phase）

```bash
# Store層テスト
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts

# UI層テスト
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/AgentView/__tests__/ExecuteButton.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/views/AgentExecutionView/__tests__/AgentExecutionView.test.tsx
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

# 既存テストの回帰確認
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice
```

- T-01〜T-08が全てPASSすることを確認
- 既存のagentSliceテスト（17ファイル）が全てPASSすることを確認（AC-06）

## 統合テスト連携（Phase 1〜11は必須）

- Store層ガードのユニットテスト（T-01〜T-05）がPASSすることを確認
- UI層コンポーネントテスト（T-06〜T-08）がPASSすることを確認
- 既存テストの回帰テストがPASSすることを確認

## 多角的チェック観点（AIが判断）

| 観点     | 適用 | チェック内容                                                                         |
| -------- | ---- | ------------------------------------------------------------------------------------ |
| 状態管理 | 該当 | `get()` の分割代入に `isExecuting` が正しく含まれること                              |
| UI/UX    | 該当 | 既存UIガード面が `isExecuting` を一貫して反映していること                            |
| P31対策  | 該当 | 合成Hookを増やさず、`isExecuting` を個別またはプリミティブセレクタで参照していること |
| 後方互換 | 該当 | 既存テスト（17ファイル）が全てPASSすること                                           |

## 成果物

| 成果物            | パス                                                                                                                | 説明                                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 実装仕様書        | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 本ドキュメント                       |
| Store層ガード実装 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                              | executeSkill L742付近にガード追加    |
| UI層回帰確認      | `apps/desktop/src/renderer/components/organisms/AgentView/ExecuteButton.tsx`                                        | 実行中 null render 維持              |
| UI層回帰確認      | `apps/desktop/src/renderer/views/AgentExecutionView/AgentExecutionView.tsx`                                         | 実行中入力 disabled 維持             |
| UI層回帰確認      | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                                           | toggle disabled + streaming 表示維持 |

## 完了条件

- [ ] `executeSkill` 関数冒頭（L742付近）に `if (isExecuting) return;` ガードが追加されている
- [ ] `ExecuteButton` / `AgentExecutionView` / `ChatPanel` の既存UIガード面に回帰がない
- [ ] T-01〜T-08のテストが全てPASSしている
- [ ] 既存のagentSliceテスト（17ファイル）が全てPASSしている（回帰なし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
