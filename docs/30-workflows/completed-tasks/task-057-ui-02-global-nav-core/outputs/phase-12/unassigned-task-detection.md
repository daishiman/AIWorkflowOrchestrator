# 未タスク検出

## 判定

- 派生未タスク件数: **2件**
- `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` への今回差分起因の新規配置: **実施**

## 監査結果

| コマンド                                                                                                                                                                                                                                                                                                                                     | 結果                                           | 判定                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                                                                                                                                   | `currentViolations=0`, `baselineViolations=93` | 今回差分としては新規違反なし                           |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --unassigned-dir docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task --target-file docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` | `currentViolations=0`, `baselineViolations=22` | domain UI spec 同期ガード仕様書は配置後も監査PASS      |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --unassigned-dir docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task --target-file docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` | `currentViolations=0`, `baselineViolations=22` | workflow 本文 stale ガード仕様書は配置後も監査PASS     |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`                                                                                                                                                                                                                                                    | `currentViolations=93`, `baselineViolations=0` | repo-wide の既存負債を観測。今回タスク起因とは分離管理 |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                              | `103/103 PASS`                                 | task-workflow の未タスクリンク整合は維持               |

## 理由

- Step 3 `AppDock` 削除は本 workflow 内の既知未完了事項であり、Phase 8/10 成果物で readiness / No-Go として管理済み。
- ただし再監査で、domain 正本同期漏れと workflow 本文 stale を再発防止するための派生未タスク 2 件は必要と判断した。
- repo-wide の既存違反 93件は今回差分の失敗ではなく、`docs/30-workflows/unassigned-task/` 全体の既存負債として別管理する。

## 配置判定

| 条件                                                                                             | 判定                                      |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 今回差分で新規未タスクが必要か                                                                   | はい（2件）                               |
| `docs/30-workflows/unassigned-task/` に新規ファイルを置く必要があるか                            | いいえ。completed workflow 配下へ移管する |
| `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` へ配置するか | はい                                      |
| `docs/30-workflows/completed-tasks/unassigned-task/` へ移管する既存完了UTがあるか                | 今回差分ではなし                          |

## 既知事項の所在

| 項目                       | 記録先                                                              |
| -------------------------- | ------------------------------------------------------------------- |
| `AppDock` 削除 readiness   | `outputs/phase-8/appdock-removal-readiness.md`                      |
| 技術負債                   | `outputs/phase-8/technical-debt-register.md`                        |
| 軽微な視覚観察事項         | `outputs/phase-11/discovered-issues.md`                             |
| domain UI spec 同期ガード  | `unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md` |
| workflow 本文 stale ガード | `unassigned-task/task-imp-phase12-workflow-body-stale-guard-001.md` |

## 結論

TASK-UI-02 の再監査・再々監査では、再発防止用の派生未タスク 2 件が必要と判定された。  
これらは Phase 12 完了済み workflow に紐づく残課題として `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` へ移管し、必要な監査は current/baseline を分離して記録済みであり、current は 0件である。
