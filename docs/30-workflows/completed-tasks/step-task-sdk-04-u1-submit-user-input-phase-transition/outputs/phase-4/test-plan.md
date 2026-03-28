# Phase 4: テスト作成（TDD-Red）

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 4                                          |
| 機能名 | submitUserInput phase transition semantics |
| 作成日 | 2026-03-27                                 |

## 目的

AC-1〜AC-5 をカバーする失敗テストを先に書く（TDD-Red フェーズ）。Phase 2 の Validation Matrix に基づき、`submitUserInput()` の reason 別 phase 遷移ロジックに対するテストケースを作成する。全テストが RED（失敗）であることを確認し、Phase 5 の実装への入力とする。

## 実行タスク

### T-4-1: engine テスト — plan_review の 2 パターン

`plan_review` reason に対する `ready_to_execute` / `needs_changes` の 2 パターンのテストを追加する。

| テストケース                   | 入力                                                  | 期待出力               | AC   |
| ------------------------------ | ----------------------------------------------------- | ---------------------- | ---- |
| plan_review + ready_to_execute | reason=plan_review, selectedOptionId=ready_to_execute | currentPhase="execute" | AC-1 |
| plan_review + needs_changes    | reason=plan_review, selectedOptionId=needs_changes    | currentPhase="plan"    | AC-2 |

### T-4-2: engine テスト — verification_review の 3 パターン

`verification_review` reason に対する `approve` / `improve` / `reject` の 3 パターンのテストを追加する。

| テストケース                  | 入力                                                 | 期待出力                                              | AC   |
| ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------- | ---- |
| verification_review + approve | reason=verification_review, selectedOptionId=approve | verifyResult.status="pass", nextAction="handoff"      | AC-3 |
| verification_review + improve | reason=verification_review, selectedOptionId=improve | verifyResult.nextAction="improve"                     | AC-4 |
| verification_review + reject  | reason=verification_review, selectedOptionId=reject  | currentPhase="plan", verifyResult.nextAction="review" | AC-5 |

### T-4-3: engine テスト — unknown reason/option のフォールバック

未知の reason や selectedOptionId に対して、`awaitingUserInput` のクリアのみが行われることを確認するテスト。

| テストケース   | 入力                                            | 期待出力                             | AC    |
| -------------- | ----------------------------------------------- | ------------------------------------ | ----- |
| unknown reason | reason=(未定義値)                               | awaitingUserInput=null のみ（no-op） | NFR-3 |
| unknown option | reason=plan_review, selectedOptionId=(未定義値) | awaitingUserInput=null のみ（no-op） | NFR-3 |

### T-4-4: engine テスト — phase_transition artifact の記録検証

phase 遷移が発生した場合に `phase_transition` タイプの artifact が記録されること、遷移が発生しない場合には記録されないことを検証する。

| テストケース                    | 入力                                                  | 期待出力                                            |
| ------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| 遷移あり: artifact 記録される   | reason=plan_review, selectedOptionId=ready_to_execute | phase_transition artifact に fromPhase/toPhase 含む |
| 遷移なし: artifact 記録されない | reason=verification_review, selectedOptionId=approve  | phase_transition artifact なし                      |

## テストファイル

| ファイル | パス                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| Engine   | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` |

## テストケースリスト（Validation Matrix 対応）

| #   | テストケース                       | reason              | selectedOptionId | 期待動作                                              | AC    | タスク |
| --- | ---------------------------------- | ------------------- | ---------------- | ----------------------------------------------------- | ----- | ------ |
| 1   | plan_review + ready_to_execute     | plan_review         | ready_to_execute | currentPhase="execute"                                | AC-1  | T-4-1  |
| 2   | plan_review + needs_changes        | plan_review         | needs_changes    | currentPhase="plan"                                   | AC-2  | T-4-1  |
| 3   | verification_review + approve      | verification_review | approve          | verifyResult.nextAction="handoff", status="pass"      | AC-3  | T-4-2  |
| 4   | verification_review + improve      | verification_review | improve          | verifyResult.nextAction="improve"                     | AC-4  | T-4-2  |
| 5   | verification_review + reject       | verification_review | reject           | currentPhase="plan", verifyResult.nextAction="review" | AC-5  | T-4-2  |
| 6   | unknown reason fallback            | (未定義値)          | —                | awaitingUserInput=null のみ                           | NFR-3 | T-4-3  |
| 7   | unknown option fallback            | plan_review         | (未定義値)       | awaitingUserInput=null のみ                           | NFR-3 | T-4-3  |
| 8   | phase_transition artifact 記録あり | plan_review         | ready_to_execute | artifact に fromPhase/toPhase                         | —     | T-4-4  |
| 9   | phase_transition artifact 記録なし | verification_review | approve          | artifact なし（phase 不変）                           | —     | T-4-4  |

## 実行コマンド

```bash
pnpm exec vitest run apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

> Phase 4 完了時点では全新規テストが RED（失敗）であることが期待される。

## 参照資料

| 参照資料        | パス                                                                       | 内容                           |
| --------------- | -------------------------------------------------------------------------- | ------------------------------ |
| Phase 2 設計書  | `outputs/phase-2/design.md`                                                | 遷移ロジック設計・コード例     |
| Phase 2 遷移表  | `outputs/phase-2/transition-table.md`                                      | reason 別 phase 遷移表（確定） |
| IPC System Core | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md` | IPC 契約                       |

## 成果物

| 成果物       | パス                                 | 説明                                |
| ------------ | ------------------------------------ | ----------------------------------- |
| テスト計画書 | `outputs/phase-4/test-plan.md`       | 本ドキュメント                      |
| テストコード | engine test ファイル内の新規テスト群 | T-4-1〜T-4-4 に対応するテストケース |

## 完了条件

- [ ] T-4-1: plan_review の 2 パターン（ready_to_execute, needs_changes）のテストが追加されている
- [ ] T-4-2: verification_review の 3 パターン（approve, improve, reject）のテストが追加されている
- [ ] T-4-3: unknown reason/option のフォールバックテストが追加されている
- [ ] T-4-4: phase_transition artifact の記録検証テストが追加されている
- [ ] 全新規テストが RED（失敗）で実行される（未実装のため）
- [ ] 既存テストが壊れていない（GREEN のまま）
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 5: 実装（TDD-Green）
