# Unassigned Task Detection

## 判定

新規 unassigned task: 4 件

## 理由

- review と 2回確認により、Task02 scope 内の未完了事項が 4 系統残っていることを確認した
- `verify-all-specs` / `validate-phase-output` は PASS だが、state machine 厳密性、Phase 11/12 準拠、system spec same-wave sync、workflow path 整合は未達だった

## formalized tasks

| task_id                                                    | path                                                                                                | 概要                                                                                                      |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001       | `docs/30-workflows/unassigned-task/task-fix-runtime-workflow-engine-failure-lifecycle-001.md`       | execute reject / `success:false` / `verification_review` / invalid transition を含む state lifecycle 是正 |
| UT-IMP-RUNTIME-WORKFLOW-CONTRACT-DRIFT-GUARD-001           | `docs/30-workflows/unassigned-task/task-imp-runtime-workflow-contract-drift-guard-001.md`           | IPC / preload / shared の cross-layer contract drift guard 強化                                           |
| UT-IMP-TASK-SDK-02-PHASE11-PHASE12-EVIDENCE-COMPLIANCE-001 | `docs/30-workflows/unassigned-task/task-imp-task-sdk-02-phase11-phase12-evidence-compliance-001.md` | Phase 11/12 成果物、implementation guide、manual test evidence の準拠是正                                 |
| UT-IMP-TASK-SDK-02-SYSTEM-SPEC-AND-PATH-SYNC-001           | `docs/30-workflows/unassigned-task/task-imp-task-sdk-02-system-spec-and-path-sync-001.md`           | canonical system spec 同期と workflow path drift 是正                                                     |

## 備考

- 4 件とも GitHub Issue 化済み（#1646, #1647, #1648, #1649）
- TASK-SDK-02 は Phase 12 成果物が存在していても、`validate-phase12-implementation-guide` と `validate-phase11-screenshot-coverage` が失敗しているため completed 移動条件を満たさない
