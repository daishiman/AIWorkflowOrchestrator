# Phase 8: 簡素化候補

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. 簡素化比較表

| 候補                             | 現設計              | 簡素化案                            | 判断   | 理由                                                 |
| -------------------------------- | ------------------- | ----------------------------------- | ------ | ---------------------------------------------------- |
| status indicator 共通化          | 3コンポーネント個別 | 共通 StatusIndicator 抽出           | 不採用 | premature abstraction。3つの表示パターンが十分異なる |
| TerminalLauncher の slot 統合    | 独立コンポーネント  | AppLayout の slot に inline 実装    | 不採用 | 配置変更時の影響が増大する                           |
| guidance-only 専用コンポーネント | 条件分岐            | GuidanceOnlyView 分離               | 不採用 | DRY 原則違反。同一 Props の重複                      |
| health 状態を capability に統合  | 分離管理            | AccessCapability に health を含める | 不採用 | SRP 違反。health は独立した関心事                    |

## 2. Phase 9 への引き渡し

- RG-01〜RG-06 が品質検証で個別チェックされること
- 不変条件に変更がないことを Phase 9 で再確認すること
