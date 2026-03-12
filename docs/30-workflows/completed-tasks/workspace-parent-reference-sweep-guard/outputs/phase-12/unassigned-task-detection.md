# 未タスク検出レポート

## 実行結果

| コマンド                                                                                                                                                                                                               | 結果                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                    | PASS（total 220 / missing 0）           |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md` | PASS（current 0 / baseline 134）        |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                             | PASS（current 0 / global baseline 134） |

## current / baseline 分離

| 区分                     | 件数 | 意味                                                                   |
| ------------------------ | ---- | ---------------------------------------------------------------------- |
| currentViolations        | 0    | 今回差分で新たに未配置・未同期の未タスクはない                         |
| scopedBaselineViolations | 134  | root `unassigned-task/` を含む今回差分監査で持ち越した legacy backlog  |
| globalBaselineViolations | 134  | repo 全体の legacy backlog。今回タスクの fail 条件ではなく、別管理対象 |

## 対象未タスク指示書の配置確認

| 項目         | 判定 | 備考                                                                                                   |
| ------------ | ---- | ------------------------------------------------------------------------------------------------------ |
| 配置先       | PASS | `docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md` に存在 |
| フォーマット | PASS | `audit-unassigned-tasks --json --diff-from HEAD --target-file ...` で `currentViolations=0`            |
| 参照整合     | PASS | `verify-unassigned-links` で `missing=0`                                                               |

## 新規未タスク

1 件。related unassigned row を completed 実績へ移した後、`verify-unassigned-links` exact count の current 値を `task-workflow.md` / workflow spec / Phase 12 outputs へ同値再同期する follow-up を formalize した。

| タスクID                                               | 概要                                                                                                                                                       | 配置先                                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| UT-IMP-PHASE12-RELATED-UT-EXACT-COUNT-RESYNC-GUARD-001 | related UT moved/closed 後の `verify-unassigned-links` exact count を `.claude` / `.agents` mirror sync 込みで再取得し、summary/system spec へ同値転記する | `docs/30-workflows/unassigned-task/task-imp-phase12-related-ut-exact-count-resync-guard-001.md` |

## 3ステップ確認

| 項目                         | 判定 | 備考                                                                                                        |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| unassigned task 指示書の存在 | PASS | `task-imp-phase12-related-ut-exact-count-resync-guard-001.md` を root `unassigned-task/` に新規作成         |
| system spec への導線         | PASS | `task-workflow.md` / `lessons-learned.md` / `workflow-workspace-parent-reference-sweep-guard.md` に同期済み |
| 関連リンク整合               | PASS | `verify-unassigned-links` で missing 0                                                                      |
