# Phase 5: 実装

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 対象機能   | TASK-SW-FIX-FEEDBACK-008 |
| 前提Phase  | Phase 4: テスト作成      |
| 次Phase    | Phase 6: テスト拡充      |
| ステータス | completed                |
| 作成日     | 2026-04-15               |

## 目的

`SkillLifecyclePanel.tsx` の `processWorkflowOutcome` および `handleExecutePlan` における
`fetchSkills()` 呼び出しを非ブロッキング化し、失敗時でも `selectSkillByName` が必ず実行されるよう修正する。

Phase 4 で定義した fail-first テスト（TC-F8-01/TC-F8-02）を PASS に反転させる。

## 実行タスク

### Task 1: processWorkflowOutcome 内の fetchSkills 非ブロッキング化（L769-784）

- `SkillLifecyclePanel.tsx` の `processWorkflowOutcome` 関数内で `fetchSkills()` を `.catch()` パターンに変更する
- `catch` ブロック内の `setGenerationError` 呼び出しと `return true` を削除する
- `fetchSkills` 失敗時は `console.warn` でエラーをログ出力するのみとする
- `if (executeResult.skillName)` ブロックが `fetchSkills` の成否に関わらず実行されることを確認する

### Task 2: handleExecutePlan 内の fetchSkills 非ブロッキング化（L1110-1113）

- `SkillLifecyclePanel.tsx` の `handleExecutePlan` 関数内で `fetchSkills()` を `.catch()` パターンに変更する
- `fetchSkills` 失敗時は `console.warn` でエラーをログ出力するのみとする
- `selectSkillByName` が `fetchSkills` の成否に関わらず実行されることを確認する

### Task 3: workflowSnapshot 遅延到着時の再処理追加（L903-917）

- `SkillLifecyclePanel.tsx` で `workflowSnapshot` を監視する `useEffect` を追加する
- `processedWorkflowOutcomePlanIdRef` を使い、同一 `planId` の重複再処理を防ぐ
- 未処理の `workflowSnapshot` が到着した場合は `processWorkflowOutcome` を再実行する
- `processWorkflowOutcome` が true を返した場合は `loadVerifyDetail(planId)` を再度呼び、遅延到着でも verify/detail を維持する

## 実装パターン

`try-catch + early return` パターンから `.catch()` Promise chain パターンへの変更。

### processWorkflowOutcome（L769-784）

**Before:**

```typescript
try {
  await fetchSkills();
} catch (error) {
  setGenerationError(
    error instanceof Error ? error.message : "スキル一覧の取得に失敗しました。",
  );
  return true; // early return → selectSkillByName が実行されない
}
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

**After:**

```typescript
await fetchSkills().catch((error) => {
  console.warn(
    "[SkillLifecyclePanel] fetchSkills failed (non-blocking):",
    error,
  );
});
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

### handleExecutePlan（L1110-1113）

**Before:**

```typescript
try {
  await fetchSkills();
} catch (error) {
  setGenerationError(
    error instanceof Error ? error.message : "スキル一覧の取得に失敗しました。",
  );
  return true; // early return → selectSkillByName が実行されない
}
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

**After:**

```typescript
await fetchSkills().catch((error) => {
  console.warn(
    "[SkillLifecyclePanel] fetchSkills failed (non-blocking):",
    error,
  );
});
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

### workflowSnapshot 遅延再処理（L903-917）

```typescript
useEffect(() => {
  if (!workflowSnapshot) {
    return;
  }

  if (processedWorkflowOutcomePlanIdRef.current === workflowSnapshot.planId) {
    return;
  }

  void (async () => {
    if (await processWorkflowOutcome(workflowSnapshot)) {
      await loadVerifyDetail(workflowSnapshot.planId);
    }
  })();
}, [workflowSnapshot]);
```

- `workflowSnapshot` が ack 後に遅れて到着しても、既存の outcome 処理を再利用できる
- `processedWorkflowOutcomePlanIdRef` により、同じ snapshot の二重処理を避ける
- `loadVerifyDetail` を再実行し、遅延経路でも検証詳細の表示を維持する

## 参照資料

| 資料名                 | パス                                                                                               | 説明                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 修正対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | L769-784 / L1110-1113                |
| テスト仕様書           | `docs/30-workflows/TASK-SW-FIX-FEEDBACK-008/phase-4-test-creation.md`                              | fail-first 対象テスト                |
| テストファイル         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | テスト実行ファイル（U-NEW-1 を含む） |
| 実装PR                 | #2179                                                                                              | マージ済み                           |

## 実行手順

```bash
# 実装後のテスト実行
pnpm --filter @repo/desktop test

# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint
```

## 統合テスト連携

- Phase 4 で定義した TC-F8-01/TC-F8-02 が本 Phase の実装後に PASS に反転することを確認する
- 既存テスト U-8/U-13 が引き続き PASS であることをテスト実行で確認する
- `workflowSnapshot` の遅延到着再処理は U-NEW-1 で回帰確認する
- Phase 6 でエッジケースのテストをさらに追加する

## 多角的チェック観点（AIが判断）

- `.catch()` パターンへの変更により `setGenerationError` が削除されているため、fetchSkills 失敗時に UI にエラーが表示されなくなる点を意識的に許容している（非ブロッキング化の意図）
- `console.warn` の引数フォーマット（プレフィックス付き）が統一されているか確認する
- `workflowSnapshot` の重複再処理が `processedWorkflowOutcomePlanIdRef` で防止されているか確認する
- TypeScript の strict モードで `.catch()` の型推論に問題がないことを確認する

## サブタスク管理

| サブタスクID | 内容                                         | ステータス |
| ------------ | -------------------------------------------- | ---------- |
| ST-F8-5-01   | processWorkflowOutcome の fetchSkills 修正   | completed  |
| ST-F8-5-02   | handleExecutePlan の fetchSkills 修正        | completed  |
| ST-F8-5-03   | テスト実行（TC-F8-01/02 PASS 確認）          | completed  |
| ST-F8-5-04   | 既存テスト U-8/U-13 PASS 確認                | completed  |
| ST-F8-5-05   | TypeScript 型チェック・ESLint エラーなし確認 | completed  |

## 成果物

| 成果物       | パス                                                                 | 説明                           |
| ------------ | -------------------------------------------------------------------- | ------------------------------ |
| 修正ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | L769-784 / L1110-1113 修正済み |
| 実装PR       | #2179                                                                | マージ済み                     |

## 完了条件

- [x] processWorkflowOutcome 内の fetchSkills が `.catch()` パターンに変更されている
- [x] handleExecutePlan 内の fetchSkills が `.catch()` パターンに変更されている
- [x] fetchSkills 失敗時の `setGenerationError` 呼び出しが削除されている
- [x] fetchSkills 失敗時の `return true`（early return）が削除されている
- [x] fetchSkills 失敗時に `console.warn` でエラーがログ出力される
- [x] Phase 4 のテスト（TC-F8-01/02）が PASS になっている
- [x] 既存テスト U-8/U-13 が引き続き PASS である
- [x] TypeScript 型エラー・ESLint エラーなし（AC-5）
- [x] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスクの成果物が生成されている
- [x] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
