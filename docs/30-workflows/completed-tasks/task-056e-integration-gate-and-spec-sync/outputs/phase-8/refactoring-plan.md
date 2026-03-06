# Phase 8 リファクタ計画

## 整備対象

| 項目        | 方針                                              |
| ----------- | ------------------------------------------------- |
| task 名表記 | `TASK-UI-02-GLOBAL-NAV-CORE` など完全IDで統一する |
| path 表記   | current workflow と parent docs を分けて表記する  |
| sync 区分   | `常時更新 / 条件付き更新 / 更新不要` に統一する   |
| B の役割    | `entry spec 正本` の表現に統一する                |

## 重複統合

| 重複候補               | 統合方針                                                    |
| ---------------------- | ----------------------------------------------------------- |
| sync target の同一列挙 | `spec-sync-targets.md` を単一正本とする                     |
| handoff 条件の重複記述 | `dependency-handoff-plan.md` を正本とし、他成果物は参照のみ |
| path 正規化の説明      | `review-findings.md` と `spec-sync-targets.md` に集約       |
