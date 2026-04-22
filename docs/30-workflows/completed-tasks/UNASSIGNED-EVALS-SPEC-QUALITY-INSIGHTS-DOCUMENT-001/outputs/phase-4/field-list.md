# qualityInsights フィールド確定一覧

> Phase 4 タスク1 成果物
> 作成日: 2026-04-21

## 確定フィールド一覧（実際の EVALS.json に基づく）

| フィールド名                                                    | 型                       | 役割（確定）                                               |
| --------------------------------------------------------------- | ------------------------ | ---------------------------------------------------------- |
| `qualityInsights.patternAdoptionRate`                           | number (0.0〜1.0)        | parent-skill pattern の採用率                              |
| `qualityInsights.coverageTargetHitRate`                         | number (0.0〜1.0)        | coverage target 達成率                                     |
| `qualityInsights.unassignedTaskDetectionRate`                   | number (0.0〜1.0)        | 未タスク検出率（Phase 12 Task 4 件数 / 全 Phase 発見件数） |
| `qualityInsights.notes`                                         | string                   | 運用者メモ（フリーテキスト）                               |
| `qualityInsights.taskMetrics`                                   | Record\<string, object\> | 完了タスクIDをキーとした詳細メトリクス辞書                 |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number (整数 1〜13)      | そのタスクで完了した Phase 数                              |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number (整数 0以上)      | 総テスト数（docs-only: 0）                                 |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number (0.0〜100.0)      | 平均コードカバレッジ（%）（docs-only: 0）                  |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number (整数 0以上)      | 更新したシステム仕様書数                                   |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number (整数 0以上)      | Phase 12 で検出した未タスク数                              |

**合計: 10 フィールド**

## evals-schema-spec.md §6 との差分（修正対象）

| 現行 spec §6 の誤記述        | 実際の正しい構造                                       |
| ---------------------------- | ------------------------------------------------------ |
| `taskMetrics.createdCount`   | 存在しない → 削除                                      |
| `taskMetrics.completedCount` | 存在しない → 削除                                      |
| `taskMetrics.failedCount`    | 存在しない → 削除                                      |
| `taskMetrics.retriedCount`   | 存在しない → 削除                                      |
| `taskMetrics.cancelRate`     | 存在しない → 削除                                      |
| `taskMetrics.blockedCount`   | 存在しない → 削除                                      |
| `taskMetrics.lastUpdated`    | 存在しない → 削除                                      |
| （なし）                     | `taskMetrics.{TASK_ID}.completedPhases` → 追加         |
| （なし）                     | `taskMetrics.{TASK_ID}.totalTests` → 追加              |
| （なし）                     | `taskMetrics.{TASK_ID}.avgCoverage` → 追加             |
| （なし）                     | `taskMetrics.{TASK_ID}.systemSpecsUpdated` → 追加      |
| （なし）                     | `taskMetrics.{TASK_ID}.unassignedTasksDetected` → 追加 |
