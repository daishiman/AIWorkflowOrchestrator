# writer・更新トリガー調査結果

> Phase 1 Step 2 成果物
> 作成日: 2026-04-21

## スクリプト調査結果

`.claude/skills/task-specification-creator/scripts/` および `.agents/skills/task-specification-creator/scripts/` 配下で `qualityInsights` を参照・更新するスクリプトを調査した。

### 調査方法

```bash
grep -rn "qualityInsights" .claude/skills/task-specification-creator/scripts/
grep -rn "qualityInsights" .agents/skills/task-specification-creator/scripts/
```

### 調査結果

`qualityInsights` を自動更新するスクリプトは **0件** であることを確認した。

- `log_usage.js` / `log-usage.js`: `qualityInsights` セクションを参照・更新していない
- `collect_feedback.js`: 存在しない or `qualityInsights` を扱っていない
- `init_skill.js`: EVALS.json の初期化のみ（`qualityInsights` セクションは手動追加）

## writer・更新タイミング調査結果

| フィールド名                                                    | 現在のwriter            | 更新トリガー                          | 自動/手動 | 更新頻度       |
| --------------------------------------------------------------- | ----------------------- | ------------------------------------- | --------- | -------------- |
| `qualityInsights.patternAdoptionRate`                           | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.coverageTargetHitRate`                         | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.unassignedTaskDetectionRate`                   | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.notes`                                         | Phase 12 実行者（人間） | Phase 12 closeout 時（追記）          | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics`                                   | Phase 12 実行者（人間） | Phase 12 closeout 時（1エントリ追加） | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | Phase 12 実行者（人間） | Phase 12 closeout 時                  | 手動      | タスク完了ごと |

## 未管理フィールド

自動更新スクリプトが存在しないため、全フィールドが「未管理（手動のみ）」である。

**既知制約**: `qualityInsights.*` の reader も現状 0 件（将来 `select_skill.js` 等での活用予定）。

## 結論

- 全10フィールドが **手動メンテナンス** によって更新される
- 更新タイミングは **Phase 12 closeout** 時に統一
- 自動更新スクリプトは存在せず、将来の自動化は別タスク（UNASSIGNED-EVALS-VALIDATOR-GUARD-001 等）で追跡
