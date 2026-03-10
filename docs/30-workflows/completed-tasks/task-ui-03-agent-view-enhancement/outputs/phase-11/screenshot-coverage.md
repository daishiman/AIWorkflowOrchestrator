# Phase 11: スクリーンショットカバレッジ

## カバレッジ集計

| カバレッジ種別                 | 対象数 | 撮影数 | カバレッジ率 | 判定     |
| ------------------------------ | -----: | -----: | -----------: | -------- |
| コンポーネントカバレッジ       |      6 |      6 |         100% | PASS     |
| 表示状態カバレッジ             |     13 |     13 |         100% | PASS     |
| インタラクション状態カバレッジ |      2 |      2 |         100% | PASS     |
| テーマカバレッジ               |      2 |      2 |         100% | PASS     |
| **総合**                       | **23** | **23** |     **100%** | **PASS** |

## 撮影済みファイル

| テストケース | ファイル                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------- |
| TC-01        | `screenshots/TC-01-main-view-light.png`                                                            |
| TC-02        | `screenshots/TC-02-chip-selected-light.png`                                                        |
| TC-03        | `screenshots/TC-03-button-disabled-light.png`, `screenshots/TC-03-button-enabled-light.png`        |
| TC-04        | `screenshots/TC-04-floating-executing-light.png`, `screenshots/TC-04-floating-completed-light.png` |
| TC-05        | `screenshots/TC-05-floating-error-light.png`                                                       |
| TC-06        | `screenshots/TC-06-panel-open-light.png`                                                           |
| TC-07        | `screenshots/TC-07-recent-list-light.png`                                                          |
| TC-08        | `screenshots/TC-08-empty-state-light.png`                                                          |
| TC-09        | `screenshots/TC-09-no-search-light.png`, `screenshots/TC-09-with-search-light.png`                 |
| TC-11        | `screenshots/TC-11-main-view-dark.png`                                                             |

## N/A 理由

| コンポーネント        | スキップ状態 | 理由                              | 優先度 |
| --------------------- | ------------ | --------------------------------- | ------ |
| SkillChip             | ホバー       | 静止画で中間状態を証跡化しにくい  | D      |
| ExecuteButton         | ホバー       | 静止画で中間状態を証跡化しにくい  | D      |
| FloatingExecutionBar  | idle 非表示  | TC-01 で非表示状態を間接確認済み  | A      |
| AdvancedSettingsPanel | 非表示       | TC-01 で main view として確認済み | A      |
| TC-10                 | 非視覚テスト | キーボード / IPC 手動確認のみ     | A      |

## validator 実行予定コマンド

```bash
node .agents/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --allow-non-visual-tc TC-10
```
