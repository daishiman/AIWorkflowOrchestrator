# UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001: runtime workflow failure verify artifact append 是正

## メタ情報

```yaml
issue_number: 1652
task_id: UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001
task_name: runtime workflow failure verify artifact append 是正
category: バグ修正
target_feature: SkillCreatorWorkflowEngine の failure lifecycle artifact 履歴
priority: 高
scale: 小規模
status: 完了
source_phase: UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Phase 12 再レビュー / 2回確認
created_date: 2026-03-26
completed_date: 2026-03-26
dependencies:
  [UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001, TASK-SDK-02]
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-ut-imp-runtime-workflow-verify-artifact-append-001.md
completion_workflow: docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-verify-artifact-append-001/
```

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001   |
| タスク名   | runtime workflow failure verify artifact append 是正 |
| 優先度     | 高                                                   |
| 規模       | 小規模                                               |
| ステータス | 完了                                                 |
| 発見日     | 2026-03-26                                           |
| 完了日     | 2026-03-26                                           |

## 1. なぜこのタスクが必要か（Why）

`recordVerifyFailure()` は `state.verifyResult` を failure payload へ更新するが、`phaseArtifacts` へ `verify_result` を append していない。さらに `recordExecuteResult()` 側でも pending `verify_result` を履歴として蓄積しておらず、artifact を正本として読む consumer が success/pending/failure の時系列を再構成できない。

## 2. 何を達成するか（What）

- failure path でも `verify_result` artifact を append する
- engine test と facade test で failure 時の artifact 追記を固定する
- 親 workflow の append 正本契約と code / test を一致させる

## 3. どのように実行するか（How）

1. `SkillCreatorWorkflowEngine.recordExecuteResult()` と `recordVerifyFailure()` の更新順を確認する
2. pending/failure の `verifyResult` payload を `verify_result` artifact として append する
3. `SkillCreatorWorkflowEngine.test.ts` と `RuntimeSkillCreatorFacade.workflow-orchestration.test.ts` に failure path 検証を追加する
4. targeted vitest で regression を確認する

## 4. 参照先

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`
- `docs/30-workflows/completed-tasks/step-02-seq-task-02-workflow-engine-runtime-orchestration/outputs/phase-2/ownership-matrix.md`
- `https://github.com/daishiman/AIWorkflowOrchestrator/issues/1652`

## 5. 完了条件

- [x] failure path で `verify_result` artifact が append される
- [x] engine test が failure 時の `verify_result` 追記を検証する
- [x] facade test が failure 時の artifact 正本を検証する
- [x] append 正本契約と code / tests が一致する

## 6. 完了記録

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 完了日     | 2026-03-26                                                                                                |
| 実装仕様書 | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-verify-artifact-append-001/`                   |
| 補足       | unassigned task から standalone workflow pack へ昇格し、Phase 1-12 完了 / Phase 13 blocked でクローズした |
