---
phase: 1
task_id: TASK-SC-CANCEL-LOGS-SYNC-001
artifact: acceptance-criteria
created_date: 2026-04-20
status: completed
---

# Phase 1 成果物: 受入基準 (AC) 正本

## 受入基準一覧

| AC   | 対象ファイル                                                                           | 確認方法（grep）                                                                                                           | TC対応 | 判定           |
| ---- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------------- |
| AC-1 | `.claude/skills/task-specification-creator/LOGS.md`                                    | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/task-specification-creator/LOGS.md`                       | TC-01  | 1 件以上ヒット |
| AC-2 | `.claude/skills/aiworkflow-requirements/LOGS.md`                                       | `grep -n "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/LOGS.md`                          | TC-02  | 1 件以上ヒット |
| AC-3 | `.claude/skills/aiworkflow-requirements/references/task-workflow*.md`                  | `grep -rn "TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001" .claude/skills/aiworkflow-requirements/references/`                     | TC-03  | 1 件以上ヒット |
| AC-4 | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` | `grep -rn "NON_VISUAL\|scope.*境界\|repo-wide sync" .claude/skills/aiworkflow-requirements/references/lessons-learned*.md` | TC-04  | 3 件以上ヒット |
| AC-5 | `docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`                    | `grep -n "Phase 12.*completed\|status.*completed" docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/index.md`       | TC-05  | 該当行存在     |

## AC ↔ TC ↔ Phase 11 スナップショット対応

| AC   | TC    | スナップショット出力先                                               | 必須ヒット数         |
| ---- | ----- | -------------------------------------------------------------------- | -------------------- |
| AC-1 | TC-01 | `outputs/phase-11/grep-snapshots/tc-01-task-spec-creator-logs.txt`   | 1+                   |
| AC-2 | TC-02 | `outputs/phase-11/grep-snapshots/tc-02-aiworkflow-req-logs.txt`      | 1+                   |
| AC-3 | TC-03 | `outputs/phase-11/grep-snapshots/tc-03-task-workflow-references.txt` | 1+                   |
| AC-4 | TC-04 | `outputs/phase-11/grep-snapshots/tc-04-lessons-learned.txt`          | 3+（知見ごとに独立） |
| AC-5 | TC-05 | `outputs/phase-11/grep-snapshots/tc-05-parent-index.txt`             | 1+                   |

## AC-4 の 3 知見詳細

| 知見ID                         | タイトル                        | 核心                                                           |
| ------------------------------ | ------------------------------- | -------------------------------------------------------------- |
| L-SC-CANCEL-NON-VISUAL-001     | NON_VISUAL タスクの代替証跡確立 | スクリーンショット不要時の grep 出力スナップショットによる検証 |
| L-SC-CANCEL-SCOPE-BOUNDARY-001 | scope 境界の設計原則            | 親/子タスクの branch 内 vs repo-wide の責務分離                |
| L-SC-CANCEL-REPO-WIDE-SYNC-001 | repo-wide sync wave 手法        | 親タスク close-out の他ファイル波及を別タスクで分離する設計    |

## 判定ロジック

- **PASS**: AC-1〜AC-5 すべて該当 grep がヒット（AC-4 は 3 件以上）
- **FAIL**: 1 件でもヒット 0 → 該当 AC の担当 lane へ戻し
- **PARTIAL**: AC-4 が 1〜2 件のみヒット → lessons-learned 追加実施

## 受入基準は Phase 10 で all-must-pass

Phase 10 の「5 項目最終チェック」が AC-1〜AC-5 と 1:1 対応。
1 件でも FAIL があれば Phase 10 を PASS とせず、戻し先を決定する。

## 参照資料

- [../../phase-1-requirements.md](../../phase-1-requirements.md) AC-1〜AC-5 正本
- [../../phase-4-test-design.md](../../phase-4-test-design.md) TC-01〜TC-05 設計
- [../../phase-10-final-review.md](../../phase-10-final-review.md) 5 項目最終チェック
