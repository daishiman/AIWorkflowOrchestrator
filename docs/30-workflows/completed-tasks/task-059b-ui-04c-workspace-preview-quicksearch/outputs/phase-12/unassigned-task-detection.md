# Phase 12 未タスク検出レポート

## 結果

- 新規未タスク: **1 件**

| タスクID                                             | 概要                                                                                                                 | タスク仕様書                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| UT-IMP-WORKSPACE-PREVIEW-SEARCH-RESILIENCE-GUARD-001 | Workspace Preview / QuickFileSearch の fuzzy no-match、renderer timeout+retry、error taxonomy を共通ガードへ昇格する | `docs/30-workflows/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` |

## 判定理由

| 観点                   | 判定           | 理由                                                                                                                               |
| ---------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| timeout / retry        | backlog 化     | 04C 内では修正できたが、preview / inspector 系で再利用する標準 helper / 契約は未整備                                               |
| false positive search  | backlog 化     | `score=0` 除外と stable sort を Workspace search 共通ガードとして formalize する価値がある                                         |
| parse / transport 分離 | backlog 化     | recoverable / fatal の error taxonomy を 04C feature ローカルに閉じず system spec と再利用導線へ昇格する必要がある                 |
| current build capture  | backlog 化不要 | static serve capture は this task で導入済みで、別未タスク `UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001` が既に追跡中 |
| visual quality         | backlog 化不要 | Apple UI/UX 観点レビューで blocking なし                                                                                           |

## 補足

- Step 1: `docs/30-workflows/unassigned-task/task-imp-workspace-preview-search-resilience-guard-001.md` を新規作成した
- Step 2: `task-workflow.md` と関連 system spec に同一 ID を登録した
- Step 3: `verify-unassigned-links` は PASS、`audit-unassigned-tasks --json --diff-from HEAD --target-file ...` は `currentViolations=0` を確認した
