# Phase 2 成果物: 設計書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-SW-FIX-FEEDBACK-008                      |
| 機能名     | `fetchSkills()` 非ブロッキング化（follow-up） |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 設計方針

| 論点              | 方針                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| 失敗時の制御      | `fetchSkills` の失敗を局所 `catch` で吸収し、後続の `selectSkillByName` を継続する             |
| ログ方針          | `console.warn("[SkillLifecyclePanel] fetchSkills failed:", error)` に統一する                  |
| 実装形            | `void fetchSkills().catch(...)` を共通 helper に切り出し、後続処理を止めない                   |
| 適用範囲          | `processWorkflowOutcome` と `handleExecutePlan` の 2 箇所に限定する                            |
| `generationError` | 触れない。`fetchSkills` 失敗は UI リフレッシュの補助失敗であり、ユーザー向けエラーに昇格しない |

## 実装形: refreshSkillsInBackground helper

```typescript
const refreshSkillsInBackground = useCallback(() => {
  void fetchSkills().catch((error) => {
    console.warn("[SkillLifecyclePanel] fetchSkills failed:", error);
  });
}, [fetchSkills]);
```

## Before / After: processWorkflowOutcome

### Before

```typescript
try {
  await fetchSkills();
} catch (error) {
  setGenerationError(
    error instanceof Error ? error.message : "スキル一覧の取得に失敗しました。",
  );
  return true;
}
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
```

### After

```typescript
if (executeResult.skillName) {
  selectSkillByName(executeResult.skillName);
}
refreshSkillsInBackground();
setLocalPlanResult(null);
clearGenerationState();
return true;
```

## Before / After: handleExecutePlan

### Before

```typescript
try {
  await fetchSkills();
} catch (error) {
  setGenerationError(
    error instanceof Error ? error.message : "スキル一覧の取得に失敗しました。",
  );
  return;
}
if (executeResponse.skillName) {
  selectSkillByName(executeResponse.skillName);
}
```

### After

```typescript
if (executeResponse.skillName) {
  selectSkillByName(executeResponse.skillName);
}
await loadVerifyDetail(planId);
refreshSkillsInBackground();
setLocalPlanResult(null);
clearGenerationState();
```

## generationError を更新しない理由

`fetchSkills()` はスキル一覧 UI のリフレッシュを担う補助処理であり、スキル生成の成功・失敗判定とは責務が分離されている。生成が成功している状況で `fetchSkills` が失敗しても、ユーザーが行った操作（スキル生成→選択）は完了しているため、`generationError` に昇格してユーザーに提示すべきではない。

## Phase 3 レビュー観点

| 観点        | 確認内容                                                   |
| ----------- | ---------------------------------------------------------- |
| lint 互換性 | `void fetchSkills().catch(...)` が lint で問題にならないか |
| outer catch | `handleExecutePlan` の外側 `try-catch` と競合しないか      |
| 回帰影響    | U-8 / U-13 の期待動作を壊さないか                          |
| 失敗時 UX   | `generationError` を上げない設計が AC-3 と一致するか       |
