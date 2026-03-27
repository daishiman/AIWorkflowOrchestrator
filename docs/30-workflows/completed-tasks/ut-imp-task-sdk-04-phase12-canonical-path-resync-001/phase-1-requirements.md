# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 1                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

Task04 close-out に残った stale evidence の論点を 1 枚に固定し、どの facts を current とみなすかを実装前に明確化する。

## 実行タスク

- old path の定義を固定する
- current canonical path の定義を固定する
- `spec_created` 維持判断の acceptance を固定する
- `UT-SC-02-006`、`TASK-SDK-04-U1..U3`、Task05/07/08 の責務境界を固定する

## 参照資料

| 資料名       | パス                                                                                                                         | 説明                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 元 task      | `../completed-tasks/unassigned-task/task-imp-task-sdk-04-phase12-canonical-path-resync-001.md`                               | 問題定義の正本                |
| 親 workflow  | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/index.md`                                       | close-out 対象の全体像        |
| 親 Phase 12  | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-12/system-spec-update-summary.md` | stale evidence の主対象       |
| 親 Phase 13  | `../completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/outputs/phase-13/local-check-result.md`         | validator path drift の主対象 |
| follow-up U1 | `../unassigned-task/task-imp-task-sdk-04-user-input-transition-semantics-001.md`                                             | runtime semantics 分離        |
| follow-up U2 | `../unassigned-task/task-imp-task-sdk-04-plan-execute-canonical-binding-001.md`                                              | plan binding 分離             |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                                              | 内容                               |
| ----------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------- |
| backlog current fact    | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                      | follow-up と status の基準         |
| completed ledger        | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                    | completed-tasks close-out の基準   |
| Phase 12 lessons        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence 再発防止の教訓      |
| API / IPC current facts | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                        | Task04 が参照した current contract |

## 成果物

| 成果物              | パス                                     | 説明                                                |
| ------------------- | ---------------------------------------- | --------------------------------------------------- |
| spec extraction map | `outputs/phase-1/spec-extraction-map.md` | source issue、parent workflow、system spec の対応表 |

## 統合テスト連携

- Phase 4 は `outputs/phase-1/spec-extraction-map.md` を起点に old path、current path、follow-up current fact の確認観点を固定する。
- Phase 5 は Phase 1 の acceptance を親 workflow の close-out 4 点へ写像する。
- Phase 10 は Phase 1 の acceptance を最終 gate の基準として再確認する。

## 完了条件

- [ ] old path と current path の定義が区別されている
- [ ] `spec_created` 維持判断の acceptance が明記されている
- [ ] `UT-SC-02-006` と `TASK-SDK-04-U1..U3` の責務分離が明記されている
- [ ] parent workflow と system spec の参照起点が固定されている
- [ ] **本Phase内の全タスクを100%実行完了**
