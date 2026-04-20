---
phase: 4
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: verification-commands
created_date: 2026-04-20
status: completed
---

# Phase 4 成果物: 検証コマンド定義（TC-01〜TC-05）

## 検証コマンド一覧

| TC    | AC   | コマンド                                                                                                                   | 期待結果       |
| ----- | ---- | -------------------------------------------------------------------------------------------------------------------------- | -------------- |
| TC-01 | AC-1 | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`                       | 1 件以上ヒット |
| TC-02 | AC-2 | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`                          | 1 件以上ヒット |
| TC-03 | AC-3 | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`                     | 1 件以上ヒット |
| TC-04 | AC-4 | `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | 3 件以上ヒット |
| TC-05 | AC-5 | `grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`       | 該当行存在     |

## TC ごとの詳細

### TC-01: task-spec-creator LOGS 追記

- **実行ディレクトリ**: リポジトリルート
- **実行コマンド**: `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`
- **PASS 条件**: 少なくとも 1 行ヒット（`## 2026-04-20 - TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001 ... sync` 等）
- **FAIL 条件**: 0 件 → Lane A 未実施
- **スナップショット保存先**: `outputs/phase-11/grep-snapshots/tc-01-task-spec-creator-logs.txt`

### TC-02: aiworkflow-req LOGS 追記

- **実行コマンド**: `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`
- **PASS 条件**: 1 行以上ヒット
- **スナップショット保存先**: `outputs/phase-11/grep-snapshots/tc-02-aiworkflow-req-logs.txt`

### TC-03: canonical spec 追記

- **実行コマンド**: `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`
- **PASS 条件**: `task-workflow-completed-recent-2026-04g.md` か同等の completed 系ファイルでヒット
- **追加確認**: `task-workflow-active.md` ではヒット 0（エントリが移動済）
- **スナップショット保存先**: `outputs/phase-11/grep-snapshots/tc-03-task-workflow-references.txt`

### TC-04: lessons-learned 3 知見追記

- **実行コマンド**: `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md`
- **PASS 条件**: 3 件以上ヒット（各知見が少なくとも 1 件）
- **代替コマンド**: `grep -n "L-SC-CANCEL-NON-VISUAL-001\|L-SC-CANCEL-SCOPE-BOUNDARY-001\|L-SC-CANCEL-REPO-WIDE-SYNC-001" .claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md`
- **スナップショット保存先**: `outputs/phase-11/grep-snapshots/tc-04-lessons-learned.txt`

### TC-05: 親 index.md Phase 12 完了宣言

- **実行コマンド**: `grep -n "Phase 12.*completed\|status.*completed\|status:.*pending_pr" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`
- **PASS 条件**: Phase 一覧テーブル Phase 12 行 + フロントマター `status` 両方がヒット
- **スナップショット保存先**: `outputs/phase-11/grep-snapshots/tc-05-parent-index.txt`

## 一括実行スクリプト（Phase 11 で使用）

```bash
#!/bin/bash
cd "$(git rev-parse --show-toplevel)"
OUT=docs/30-workflows/TASK-SC-CANCEL-LOGS-SYNC-001/outputs/phase-11/grep-snapshots
mkdir -p "$OUT"

grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md > "$OUT/tc-01-task-spec-creator-logs.txt"
grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md > "$OUT/tc-02-aiworkflow-req-logs.txt"
grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/ > "$OUT/tc-03-task-workflow-references.txt"
grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md > "$OUT/tc-04-lessons-learned.txt"
grep -n "Phase 12.*completed\|status.*completed\|status:.*pending_pr" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md > "$OUT/tc-05-parent-index.txt"
```

## 判定ロジック

- TC-01〜TC-05 を **all-must-pass** で判定
- 1 件でも FAIL なら Phase 10 で CRITICAL 判定し、該当 Lane へ戻し

## 参照資料

- [format-fixture-snapshots.md](format-fixture-snapshots.md)
- [../phase-1/acceptance-criteria.md](../phase-1/acceptance-criteria.md)
- [../../phase-4-test-design.md](../../phase-4-test-design.md)
