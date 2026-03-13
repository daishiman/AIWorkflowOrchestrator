# Phase 12 Unassigned Task Detection

## サマリー

| 項目                         | 値                       |
| ---------------------------- | ------------------------ |
| 新規 unassigned task         | 1                        |
| workflow baseline backlog    | 64                       |
| directory current violation  | 0                        |
| directory baseline violation | 134                      |
| `verify-unassigned-links`    | existing 214 / missing 0 |

## 判定

今回の workflow から新規に起票すべき未タスクを 1 件検出した。contrast 問題そのものは引き続き `task-fix-light-theme-shared-color-migration-001` で扱うべき baseline backlog だが、current build screenshot の preflight が build / harness / baseUrl の複数確認へ分散しており、同種タスクの初動を毎回手作業でやり直していたため、運用ガードを独立未タスクとして formalize した。

## 指定ディレクトリ監査

| 項目               | 結果                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 今回差分の配置可否 | `docs/30-workflows/unassigned-task/` 配下に今回 task 由来の新規未タスク 1 件を追加        |
| 今回差分の品質可否 | `audit-unassigned-tasks --json --diff-from HEAD` は `currentViolations=0`                 |
| 全体 legacy 状況   | `audit-unassigned-tasks --json` は `baselineViolations=134`。既存改善タスクで継続監視する |

## 起票した未タスク

| 未タスクID                                        | 目的                                                                                                   | 参照                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE11-CURRENT-BUILD-PREFLIGHT-BUNDLE-001 | current build capture の native dependency / build / harness / baseUrl preflight を 1 コマンドへ束ねる | `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` |

## 既存 routing

| backlog              | 参照                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| guard archived spec  | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-light-theme-contrast-regression-guard-001.md`                           |
| remediation workflow | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md` |
| legacy normalization | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`                                            |
| legacy normalization | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`                                            |
| baseline remediation | `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md`                                         |

## 3 ステップ確認

1. `docs/30-workflows/unassigned-task/task-imp-phase11-current-build-preflight-bundle-001.md` を新規作成した。
2. `task-workflow.md` と `ui-ux-feature-components.md` に新規未タスク導線を追加する。
3. `discovered-issues.md` と `spec-update-summary.md` に workflow baseline backlog と global directory legacy の両方を残す。
