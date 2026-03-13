# Phase 12: Unassigned Task Detection

## 実行コマンド

- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

## 検出結果

| 指標                    | 値          |
| ----------------------- | ----------- |
| currentViolations       | `0`         |
| baselineViolations      | `134`       |
| formatViolations        | `91`        |
| namingViolations        | `5`         |
| misplacedFiles          | `38`        |
| verify-unassigned-links | `221 / 221` |

## 判断

- Task04 follow-up で新規未タスク 2 件を formalize した。
- 今回差分では `docs/30-workflows/unassigned-task/` に 2 件を追加作成した。
- `baselineViolations=134` は `docs/30-workflows/unassigned-task/` の既存 legacy backlog であり、今回差分に起因しない。
- Task05 本流 UI への全面展開は既存親責務として継続し、Task04 では Phase 12 follow-up の再発防止ガードだけを切り出した。

## 観測した事項

| 内容                                              | 扱い                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| public preload API / shared export の Step 2 判断 | `UT-IMP-PHASE12-STEP2-PUBLIC-CONTRACT-GUARD-001` として formalize    |
| 未タスク 0 件証跡の stale 化                      | `UT-IMP-PHASE12-ZERO-UNASSIGNED-EVIDENCE-GUARD-001` として formalize |
| Task05 全面展開                                   | Task05 本体の責務として継続                                          |
| global `unassigned-task/` の legacy backlog       | baseline として継続監視、今回差分とは分離して報告                    |

## 作成した未タスク

| タスクID                                          | 概要                                                                                | 配置先                                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| UT-IMP-PHASE12-STEP2-PUBLIC-CONTRACT-GUARD-001    | 既存 IPC 再利用でも public preload API / shared export 増分を Step 2 必須として扱う | `docs/30-workflows/unassigned-task/task-imp-phase12-step2-public-contract-guard-001.md`    |
| UT-IMP-PHASE12-ZERO-UNASSIGNED-EVIDENCE-GUARD-001 | 0 件証跡を `current` / `baseline` / link count / 配置結果へ分解し stale 文言を防ぐ  | `docs/30-workflows/unassigned-task/task-imp-phase12-zero-unassigned-evidence-guard-001.md` |
