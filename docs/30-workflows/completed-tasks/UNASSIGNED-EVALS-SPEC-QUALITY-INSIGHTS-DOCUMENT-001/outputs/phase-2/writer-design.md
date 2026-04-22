# writer 設計・更新タイミング・運用責任

> Phase 2 Step 2 成果物
> 作成日: 2026-04-21

## writer 設計表

| フィールド名                                                   | writer          | 更新タイミング                               | 自動/手動 | 運用責任者   |
| -------------------------------------------------------------- | --------------- | -------------------------------------------- | --------- | ------------ |
| `qualityInsights.patternAdoptionRate`                          | Phase 12 実行者 | タスク Phase 12 closeout 時                  | 手動      | タスク担当者 |
| `qualityInsights.coverageTargetHitRate`                        | Phase 12 実行者 | タスク Phase 12 closeout 時                  | 手動      | タスク担当者 |
| `qualityInsights.unassignedTaskDetectionRate`                  | Phase 12 実行者 | タスク Phase 12 closeout 時                  | 手動      | タスク担当者 |
| `qualityInsights.notes`                                        | Phase 12 実行者 | タスク Phase 12 closeout 時（追記）          | 手動      | タスク担当者 |
| `qualityInsights.taskMetrics.{TASK_ID}.*`（全5サブフィールド） | Phase 12 実行者 | タスク Phase 12 closeout 時（1エントリ追加） | 手動      | タスク担当者 |

## 設計方針の根拠

### 手動管理を正式化する理由

現状では `qualityInsights.*` の自動更新スクリプトが**0件**である（Phase 1 スクリプト調査で確認）。自動化は将来の別タスクとして分離し、本タスクでは「**手動更新が正式な運用**」として明文化する。

### 更新タイミングを Phase 12 closeout に固定する理由

Phase 12 は `documentation-changelog.md` / `skill-feedback-report.md` / `unassigned-task-detection.md` を作成するフェーズであり、スキルの quality evaluation を行うタイミングとして適切である。

### 各フィールドの計算方法

| フィールド                                      | 計算元                                                 |
| ----------------------------------------------- | ------------------------------------------------------ |
| `patternAdoptionRate`                           | 過去タスクで `patterns.md` 採用パターン数 / 全タスク数 |
| `coverageTargetHitRate`                         | カバレッジ目標達成タスク数 / 全タスク数                |
| `unassignedTaskDetectionRate`                   | 未タスク検出済みタスク数 / 全タスク数                  |
| `taskMetrics.{TASK_ID}.completedPhases`         | そのタスクで完了した Phase 数を記録                    |
| `taskMetrics.{TASK_ID}.totalTests`              | そのタスクの総テスト数（docs-only: 0）                 |
| `taskMetrics.{TASK_ID}.avgCoverage`             | そのタスクの平均カバレッジ（docs-only: 0）             |
| `taskMetrics.{TASK_ID}.systemSpecsUpdated`      | そのタスクで更新したシステム仕様書数                   |
| `taskMetrics.{TASK_ID}.unassignedTasksDetected` | そのタスクの未タスク検出数                             |

## 自動化の将来方針（スコープ外）

以下は本タスクのスコープ外だが、将来の自動化タスクへの引き継ぎとして記録する。

- `patternAdoptionRate` / `coverageTargetHitRate` / `unassignedTaskDetectionRate` は `phase-12-documentation-guide.md` に記載された数値から機械的に算出可能
- `taskMetrics.*` は各タスクの `artifacts.json` から集計可能であり、`log-usage.js` 系スクリプトの拡張として実装できる

追跡タスク: `UNASSIGNED-EVALS-VALIDATOR-GUARD-001`

## dual root 更新方針

- 正本: `.claude/skills/task-specification-creator/EVALS.json`
- mirror: `.agents/skills/task-specification-creator/EVALS.json`
- 同期タイミング: 正本更新時に同一 wave で mirror を更新する
