# Phase 5: 実装（TDD-Green）

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 5                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

Phase 4 で作成した全テストを GREEN（パス）にする最小限の実装を行う。`SkillCreatorWorkflowEngine.submitUserInput()` に reason 別の phase 遷移ロジックを追加し、canonical な state 更新を engine に集約する。

## 実行タスク

### T-5-1: `applyPhaseTransition()` private メソッド追加

`submitUserInput()` から呼び出される分岐エントリポイントを追加する。

```typescript
private applyPhaseTransition(
  state: SkillCreatorWorkflowState,
  reason: SkillCreatorAwaitingUserInputReason,
  submission: SkillCreatorUserInputSubmission,
): void {
  switch (reason) {
    case "plan_review":
      this.applyPlanReviewTransition(state, submission);
      break;
    case "verification_review":
      this.applyVerificationReviewTransition(state, submission);
      break;
    default:
      // NFR-3: unknown reason はフォールバック（何もしない）
      break;
  }
}
```

### T-5-2: `applyPlanReviewTransition()` 実装

`plan_review` reason に対する 2 パターンの phase 遷移を実装する。

```typescript
private applyPlanReviewTransition(
  state: SkillCreatorWorkflowState,
  submission: SkillCreatorUserInputSubmission,
): void {
  switch (submission.selectedOptionId) {
    case "ready_to_execute":
      state.currentPhase = "execute";
      break;
    case "needs_changes":
      state.currentPhase = "plan";
      break;
    // unknown option: no-op (fallback)
  }
}
```

### T-5-3: `applyVerificationReviewTransition()` 実装

`verification_review` reason に対する 3 パターンの遷移を実装する。

```typescript
private applyVerificationReviewTransition(
  state: SkillCreatorWorkflowState,
  submission: SkillCreatorUserInputSubmission,
): void {
  const base = state.verifyResult ?? {
    status: "fail" as const,
    nextAction: "review" as const,
    updatedAt: nowIso(),
  };

  switch (submission.selectedOptionId) {
    case "approve":
      state.verifyResult = {
        ...base,
        status: "pass",
        nextAction: "handoff",
        updatedAt: nowIso(),
      };
      break;
    case "improve":
      state.verifyResult = {
        ...base,
        nextAction: "improve",
        updatedAt: nowIso(),
      };
      break;
    case "reject":
      state.verifyResult = {
        ...base,
        status: "fail",
        nextAction: "review",
        updatedAt: nowIso(),
      };
      state.currentPhase = "plan";
      break;
    // unknown option: no-op
  }
}
```

### T-5-4: `submitUserInput()` 内で `applyPhaseTransition()` 呼び出し追加

既存の `state.awaitingUserInput = null;` の直後に `applyPhaseTransition()` を呼び出す。遷移前の phase を保存し、遷移判定に使用する。

```typescript
// submitUserInput() 内
const beforePhase = state.currentPhase;
state.awaitingUserInput = null;
this.applyPhaseTransition(state, request.reason, submission);
```

### T-5-5: phase_transition artifact 記録の追加

`applyPhaseTransition()` 呼び出し後、phase が変化した場合のみ artifact を記録する。

```typescript
const afterPhase = state.currentPhase;
if (beforePhase !== afterPhase) {
  this.appendArtifact(state, afterPhase, "phase_transition", {
    fromPhase: beforePhase,
    toPhase: afterPhase,
    reason: request.reason,
    selectedOptionId: submission.selectedOptionId,
  });
}
```

## 変更ファイル

| ファイル | パス                                                                   | 変更内容                                 |
| -------- | ---------------------------------------------------------------------- | ---------------------------------------- |
| Engine   | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | private メソッド 3 つ追加 + 呼び出し追加 |

## 実装方針

1. **変更箇所を最小化**: 既存の `submitUserInput()` フローを壊さないよう、遷移ロジックは private メソッドに分離
2. **switch-case で拡張可能**: 将来の追加 reason や option に対応可能な設計
3. **既存型の活用**: `currentPhase` と `verifyResult` は既存の型定義で表現可能（新規型不要）
4. **フォールバック安全**: unknown reason/option では no-op として既存動作を維持

## 検証コマンド

```bash
# Phase 4 のテストが全て GREEN になることを確認
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts

# 既存テストも壊れていないことを確認
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/
```

## 参照資料

| 参照資料             | パス                                  | 内容                           |
| -------------------- | ------------------------------------- | ------------------------------ |
| Phase 2 設計書       | `outputs/phase-2/design.md`           | 遷移ロジック設計・コード例     |
| Phase 2 遷移表       | `outputs/phase-2/transition-table.md` | reason 別 phase 遷移表（確定） |
| Phase 4 テスト計画書 | `outputs/phase-4/test-plan.md`        | テストケース一覧               |

## 成果物

| 成果物     | パス                                | 説明                        |
| ---------- | ----------------------------------- | --------------------------- |
| 実装計画書 | `outputs/phase-5/implementation.md` | 本ドキュメント              |
| 実装コード | engine ファイル内の新規メソッド群   | T-5-1〜T-5-5 に対応する実装 |

## 完了条件

- [ ] T-5-1: `applyPhaseTransition()` が追加されている
- [ ] T-5-2: `applyPlanReviewTransition()` が実装され、ready_to_execute / needs_changes を処理する
- [ ] T-5-3: `applyVerificationReviewTransition()` が実装され、approve / improve / reject を処理する
- [ ] T-5-4: `submitUserInput()` 内で `applyPhaseTransition()` が呼び出されている
- [ ] T-5-5: phase_transition artifact が遷移発生時のみ記録される
- [ ] Phase 4 の全テストが GREEN（パス）になる
- [ ] 既存テストが壊れていない（GREEN のまま）
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
