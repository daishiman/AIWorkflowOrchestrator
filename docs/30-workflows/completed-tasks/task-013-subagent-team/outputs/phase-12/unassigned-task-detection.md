# TASK-013 再監査 未タスク検出レポート

## 実行結果（2026-02-25 再確認）

| 区分         | コマンド                                                                                  | 結果                               |
| ------------ | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| current      | `detect-unassigned-tasks --scan docs/30-workflows/completed-tasks/task-013-subagent-team` | 0件                                |
| baseline     | `audit-unassigned-tasks`                                                                  | format 67 / naming 5 / misplaced 0 |
| 参照整合     | `verify-unassigned-links`                                                                 | 97/97 PASS                         |
| 配置逸脱確認 | `rg ... docs/30-workflows/completed-tasks/unassigned-task`                                | 未実施/未着手/進行中 0件           |

## 判定

- 今回差分で新規未タスクは検出されない
- baseline違反は既存バックログ（`UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001` 管理対象）
- 誤配置6件は今回是正済み（`misplaced 0`）

## 補足

- `UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001` は未着手継続ではなく、再評価クローズへ変更済み
- 監査報告は baseline/current を分離して継続運用する
