# qualityInsights フィールド仕様定義表

> Phase 2 Step 1 成果物
> 作成日: 2026-04-21
> 入力: outputs/phase-1/field-inventory.md

## フィールド定義表

実際の `task-specification-creator/EVALS.json` の実装に基づく正式仕様。

| フィールド名                                                    | 型                       | 必須/省略可            | 値域・制約           | 説明                                                                     |
| --------------------------------------------------------------- | ------------------------ | ---------------------- | -------------------- | ------------------------------------------------------------------------ |
| `qualityInsights.patternAdoptionRate`                           | number                   | 省略可                 | 0.0〜1.0             | parent-skill の成功パターンがタスク実行で採用された割合                  |
| `qualityInsights.coverageTargetHitRate`                         | number                   | 省略可                 | 0.0〜1.0             | カバレッジ目標値に到達したタスクの割合                                   |
| `qualityInsights.unassignedTaskDetectionRate`                   | number                   | 省略可                 | 0.0〜1.0             | Phase 12 で未タスク検出が正しく実施されたタスクの割合                    |
| `qualityInsights.notes`                                         | string                   | 省略可                 | 自由記述・上限なし   | スキル改善・タスク実行に関する自由記述メモ（Phase 12 closeout 時に追記） |
| `qualityInsights.taskMetrics`                                   | Record\<string, object\> | 省略可                 | キー: タスクID文字列 | 完了済みタスクごとの詳細メトリクスを格納するオブジェクト                 |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number                   | 必須（エントリ存在時） | 整数・1〜13          | そのタスクで完了した Phase 数                                            |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number                   | 必須（エントリ存在時） | 整数・0以上          | そのタスクで作成・実行した総テスト数（docs-only: 0 を記録）              |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number                   | 必須（エントリ存在時） | 0.0〜100.0           | そのタスクにおける平均コードカバレッジ（%）（docs-only: 0 を記録）       |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number                   | 必須（エントリ存在時） | 整数・0以上          | そのタスクで更新したシステム仕様書のファイル数                           |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number                   | 必須（エントリ存在時） | 整数・0以上          | そのタスクの Phase 12 で検出・記録した未タスク数                         |

**合計フィールド数: 10**（4スカラー + 1コンテナ + 5サブフィールド）

## evals-schema-spec.md §6 との差分

| 差分点             | 現行 spec §6                                                                                                 | 実際の EVALS.json                                                                               | 対応                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------- |
| `taskMetrics` 構造 | flat（`taskMetrics.createdCount` 等 7件）                                                                    | タスクIDキー辞書（`taskMetrics.{TASK_ID}.*` 5件）                                               | spec を実装に合わせて修正 |
| フィールド名       | `createdCount`, `completedCount`, `failedCount`, `retriedCount`, `cancelRate`, `blockedCount`, `lastUpdated` | `completedPhases`, `totalTests`, `avgCoverage`, `systemSpecsUpdated`, `unassignedTasksDetected` | spec を修正               |
| フィールド数       | 11（4スカラー + 7 flat）                                                                                     | 10（4スカラー + 1コンテナ + 5サブ）                                                             | 正確な数を記録            |

## 設計方針の根拠

- `patternAdoptionRate` / `coverageTargetHitRate` / `unassignedTaskDetectionRate`: 0〜1の正規化率として定義することで複数スキル間の比較を可能にする。
- `notes`: 長文のフリーテキストであり自動集計が困難なため手動管理とする。
- `taskMetrics`: タスクIDをキーとした動的オブジェクト。各タスク完了時に1エントリを追加する運用とする。サブフィールドは実際の EVALS.json 実装（TASK-8A, TASK-7D 等）に準拠する。
