# Phase 1 aiworkflow仕様参照抽出

## 抽出結果

| 区分 | 参照                            | 反映内容                                      |
| ---- | ------------------------------- | --------------------------------------------- |
| 必須 | `task-workflow.md`              | 未タスク管理3ステップ（指示書/台帳/関連仕様） |
| 必須 | `task-workflow-rules.md`        | Phase品質ゲートと完了条件整合                 |
| 必須 | `quality-requirements.md`       | 検証可能な受入基準の定義                      |
| 必須 | `error-handling.md`             | invalid input の exit 2 方針                  |
| 必須 | `phase-11-12-guide.md`          | 対象監査→全体監査の運用順                     |
| 必須 | `unassigned-task-guidelines.md` | 未タスク検出と証跡の運用要件                  |

## 今回の設計制約

1. baseline違反は「資産健全性監視」として残す。
2. current違反のみを今回変更の合否判定に使う。
3. 運用上の誤判定防止のためJSONに分離フィールドを追加する。

## 抽出ログ

- 参照抽出コマンド: `rg -n "UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001|audit-unassigned" .claude/skills/aiworkflow-requirements/references .claude/skills/task-specification-creator/references`
- 関連行: `outputs/phase-12/task-id-grep.log` に再記録済み
