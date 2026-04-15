# TASK-SW-FIX-FEEDBACK-008 実装ガイド

## 概要

`fetchSkills()` の非ブロッキング化に加えて、`workflowSnapshot` が遅れて到着した場合でも `processWorkflowOutcome` を再適用する follow-up を実装した。

このタスクは `NON_VISUAL` なので、Phase 11 の正本証跡は `manual-test-result.md` と `phase11-capture-metadata.json` で足りる。スクリーンショット画像は要求しない。

## Part 1: 問題と修正内容

### 問題 1: `fetchSkills()` が後続処理を止めていた

`processWorkflowOutcome` と `handleExecutePlan` の両方で `fetchSkills()` を待機していたため、一覧更新に失敗すると `selectSkillByName` まで到達しない経路があった。

### 問題 2: ack 後に届く workflow snapshot の再処理が弱かった

`executePlan` の ack が先に返り、workflow state の snapshot があとから到着する場合、snapshot を store に反映した後の再評価が必要だった。

### 修正方針

`fetchSkills()` は UI リフレッシュ用の補助処理として切り離し、`selectSkillByName` と `loadVerifyDetail` を止めないようにした。

また、`workflowSnapshot` を監視する effect を追加し、遅延 snapshot が入った場合は `processWorkflowOutcome` を再実行するようにした。

### 変更ファイル

| ファイル                                                                                           | 変更内容                                                                                                       |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                               | `refreshSkillsInBackground` helper 追加、`workflowSnapshot` 再処理 effect 追加、fetchSkills を非ブロッキング化 |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U-8 / U-NEW-1 / U-NEW-2 / U-NEW-3 / U-NEW-5 / U-NEW-6 の回帰テストを追加・更新                                 |

## Part 2: 実装詳細

### 1. `refreshSkillsInBackground`

```typescript
const refreshSkillsInBackground = useCallback(() => {
  try {
    void fetchSkills().catch((error) => {
      console.warn("[SkillLifecyclePanel] fetchSkills failed:", error);
    });
  } catch (error) {
    console.warn("[SkillLifecyclePanel] fetchSkills failed:", error);
  }
}, [fetchSkills]);
```

`fetchSkills()` の失敗を `console.warn` に閉じ込め、`setGenerationError` へ昇格させない。

### 2. `workflowSnapshot` 再処理 effect

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

遅延 snapshot が到着しても、`processWorkflowOutcome` の既存ロジックを使い回して `selectSkillByName` と `loadVerifyDetail` を再実行する。

### 3. 呼び出し順序の保証

- `processWorkflowOutcome` は `selectSkillByName` を先に実行し、その後で `refreshSkillsInBackground()` を呼ぶ
- `handleExecutePlan` も同じく `selectSkillByName` を先に通す
- どちらも `fetchSkills` の成否で選択処理を止めない

## 受入条件充足状況

| AC                                                   | 充足 |
| ---------------------------------------------------- | ---- |
| AC-1 (`processWorkflowOutcome` 失敗時も選択継続)     | ✓    |
| AC-2 (`handleExecutePlan` 失敗時も選択継続)          | ✓    |
| AC-3 (`console.warn` のみ、`generationError` 非更新) | ✓    |
| AC-4 (既存フロー回帰なし)                            | ✓    |
| AC-5 (対象テストの PASS)                             | ✓    |

## テスト結果

```
✓ SkillLifecyclePanel.llm-generation.test.tsx (42 tests | 13 skipped)
```

### 証跡

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/phase11-capture-metadata.json`

## 補足

Phase 11 は `NON_VISUAL` のため、スクリーンショット画像は生成していない。画面差分ではなく、ユニットテストと手動テスト結果を正本証跡として扱う。
