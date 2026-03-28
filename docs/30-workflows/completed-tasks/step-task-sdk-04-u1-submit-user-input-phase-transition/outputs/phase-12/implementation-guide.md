# Implementation Guide

## Part 1: まず何を解決するのか

### 日常生活での例え

郵便局の窓口で、お客さんの返事（「送ります」か「直します」）を聞いたのに、それを次の担当者に伝えずに紙だけ回していたら、次の人は何をすればいいか分からない。`submitUserInput()` も同じで、答えを受け取るだけでなく、「先へ進む合図」か「戻って直す合図」かを workflow engine が理解して state を更新する必要がある。

### この task でやったこと

| 項目                           | 説明                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| 合図の意味を engine に固定した | `plan_review` の 2 パターン、`verification_review` の 3 パターンの遷移を switch-case で実装 |
| 判断する場所を 1 つに集約した  | engine owner が state を更新し、facade / IPC / preload は運ぶだけ                           |
| 後で確認できるようにした       | 10 件のテストと `phase_transition` artifact で遷移を追跡可能にした                          |

## Part 2: 技術者向けガイド

### 変更サマリ

| ファイル                               | 変更内容                                                                                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillCreatorWorkflowEngine.ts`        | `applyPhaseTransition` + 2 private メソッド追加、`submitUserInput` に遷移・artifact 呼び出し追加、artifact kind に `"phase_transition"` 追加 |
| `skillCreator.ts` (shared)             | `SkillCreatorVerifyResult.nextAction` に `"handoff"` 追加                                                                                    |
| `SkillCreatorWorkflowEngine.test.ts`   | 8 テストケース追加（AC-1〜AC-5, NFR-3, artifact 2 件）                                                                                       |
| `skillCreatorHandlers.runtime.test.ts` | 2 テストケース追加（AC-6, AC-7）                                                                                                             |

### Phase 遷移表（実装結果）

#### plan_review

| selectedOptionId   | currentPhase 遷移 | verifyResult 変更 |
| ------------------ | ----------------- | ----------------- |
| `ready_to_execute` | → `"execute"`     | 変更なし          |
| `needs_changes`    | → `"plan"`        | 変更なし          |
| (unknown)          | 変更なし          | 変更なし          |

#### verification_review

| selectedOptionId | currentPhase 遷移 | verifyResult 変更                       |
| ---------------- | ----------------- | --------------------------------------- |
| `approve`        | 変更なし          | status→`"pass"`, nextAction→`"handoff"` |
| `improve`        | 変更なし          | nextAction→`"improve"`                  |
| `reject`         | → `"plan"`        | status→`"fail"`, nextAction→`"review"`  |
| (unknown)        | 変更なし          | 変更なし                                |

### AC 検証結果

| AC   | 基準                                         | テスト       | 結果 |
| ---- | -------------------------------------------- | ------------ | ---- |
| AC-1 | plan_review + ready_to_execute → execute     | Engine test  | PASS |
| AC-2 | plan_review + needs_changes → plan           | Engine test  | PASS |
| AC-3 | verification_review + approve → handoff/pass | Engine test  | PASS |
| AC-4 | verification_review + improve → improve      | Engine test  | PASS |
| AC-5 | verification_review + reject → plan/review   | Engine test  | PASS |
| AC-6 | facade snapshot = engine snapshot            | Runtime test | PASS |
| AC-7 | state-changed event に遷移後 snapshot        | Runtime test | PASS |

### 型変更

```ts
// packages/shared/src/types/skillCreator.ts
interface SkillCreatorVerifyResult {
  // ...
  nextAction?: "review" | "improve" | "handoff"; // "handoff" 追加
}

// apps/desktop/src/.../SkillCreatorWorkflowEngine.ts
interface SkillCreatorWorkflowArtifact {
  kind:
    | "route_snapshot"
    | "plan_result"
    | "execute_result"
    | "handoff_bundle"
    | "verify_result"
    | "user_input_submission"
    | "phase_transition"; // 追加
}
```

### 設定値と定数

| 項目          | 値                                                                                                                               |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Issue number  | #1672                                                                                                                            |
| Parent task   | TASK-SDK-04                                                                                                                      |
| Primary files | `SkillCreatorWorkflowEngine.ts`, `SkillCreatorWorkflowEngine.test.ts`, `skillCreatorHandlers.runtime.test.ts`, `skillCreator.ts` |

### エラーハンドリング

| 条件              | 動作                                  | 変更有無 |
| ----------------- | ------------------------------------- | -------- |
| `planId` 不一致   | `planId mismatch` throw               | 既存維持 |
| stale `requestId` | `stale requestId` throw               | 既存維持 |
| 未知 reason       | no-op（awaitingUserInput クリアのみ） | 新規     |
| 未知 option       | no-op（awaitingUserInput クリアのみ） | 新規     |
