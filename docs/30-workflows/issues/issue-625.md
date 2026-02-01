# [#625] [task-permission-risk-level-styles-shared] RISK_LEVEL_STYLES定数の共有モジュール抽出

## タスク概要

PermissionDialog.tsxからRISK_LEVEL_STYLESを共有モジュールに抽出し、PermissionSettings等の他コンポーネントでの再利用を可能にしてDRY違反を解消する。

## メタ情報

| 項目     | 値                                             |
| -------- | ---------------------------------------------- |
| タスクID | task-permission-risk-level-styles-shared       |
| 分類     | リファクタリング                               |
| 優先度   | 低                                             |
| 規模     | 小規模                                         |
| 発見元   | task-imp-permission-tool-metadata-001 Phase 12 |

## 仕様書

`docs/30-workflows/completed-tasks/task-permission-risk-level-styles-shared.md`
