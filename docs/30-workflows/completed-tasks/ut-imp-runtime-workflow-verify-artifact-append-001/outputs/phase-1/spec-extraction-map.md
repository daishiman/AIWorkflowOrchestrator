# Phase 1 要件抽出マップ

| 論点                     | 正本仕様                                                                                                       | 実コード/文書アンカー                                                                                                                         | 今回の判断                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| runtime workflow owner   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                    | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                                                        | artifact write owner は engine に限定する                     |
| public bridge 境界       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                         | facade は read bridge として snapshot を返すだけに留める      |
| parent failure lifecycle | `docs/30-workflows/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`                  | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`                                                         | append/upsert のズレを親課題の縮小スコープとして是正する      |
| task 個別要求            | `docs/30-workflows/completed-tasks/unassigned-task/task-ut-imp-runtime-workflow-verify-artifact-append-001.md` | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`                                   | engine test と facade test の両面で failure append を固定する |
| フェーズ完了条件         | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-verify-artifact-append-001/phase-1-requirements.md` | `docs/30-workflows/completed-tasks/ut-imp-runtime-workflow-verify-artifact-append-001/outputs/phase-12/phase12-task-spec-compliance-check.md` | AC-01〜04 を Phase 4/6/7/9/10/12 まで追跡可能にする           |

## 要件固定メモ

- failure path でも `verify_result` を append し、履歴正本を欠かさない
- `state.verifyResult` は latest snapshot、`phaseArtifacts.verify_result` は履歴正本として役割を分離する
- public IPC / preload / shared contract は今回の修正対象に含めない
