# Phase 12 Output: Unassigned Task Detection

## 今回差分の判定

| 項目                                                               | 結果                                                                                           |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| 今回タスク由来の新規未タスク                                       | 1件                                                                                            |
| 配置先                                                             | `docs/30-workflows/unassigned-task/`                                                           |
| `verify-unassigned-links`                                          | `existing=222 / missing=0`                                                                     |
| `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` | `currentViolations=0 / baselineViolations=134`                                                 |
| `audit-unassigned-tasks --json --diff-from HEAD`                   | `currentViolations=0 / baselineViolations=134`                                                 |
| `audit-unassigned-tasks --json`                                    | repo 全体 baseline 参考値として `format=91 / naming=5 / misplaced=38 / baselineViolations=134` |

## formalized task

| タスクID                                                        | パス                                                                                                 | 配置 | フォーマット                                   | 理由                                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001` | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` | 正常 | `## メタ情報 + ## 1..9` の10見出しへ正規化済み | generated `topic-map.md` `3520` 行は docs-only scope で恒久解消できないため |

## current / baseline の分離

- current task の品質判定は PASS。active 未タスク 1件は指定ディレクトリへ配置済みで、個別監査でも `currentViolations=0` を確認した。
- baseline は継続して残る。これは repo 全体の既存負債であり、今回タスクの FAIL 理由にはしない。
- `verify-unassigned-links` は split 親 `task-workflow.md` を起点に sibling `task-workflow*.md` を走査し、未タスクリンク `222` 件の実在を確認した。

## 既存 remediation task

- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md`

## resolved history

- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-req-phase12-phase-12-artifacts-missing-001.md`
  - Phase 12 artifact drift は outputs 実体化と verification rerun で解消済み

## 結論

- manual docs reform 自体の未完了は 0
- active backlog は generated `topic-map.md` sharding follow-up 1件のみ
- 指定ディレクトリ配置、10見出し、links/audit の 3 点は今回差分で満たしている
