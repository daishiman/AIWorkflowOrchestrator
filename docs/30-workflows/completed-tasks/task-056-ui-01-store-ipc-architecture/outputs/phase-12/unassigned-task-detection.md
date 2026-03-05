# Phase 12 成果物: 未タスク検出

## 判定サマリー

- 検出件数: **3件（non-blocking）**
- 検出方針:
  - `detect-unassigned-tasks.js` の TODO 検出は既存コードベース起因が大半のため、今回タスクに直接関係する項目のみを採用
  - Phase 11 の視覚検証で検出した改善提案を未タスク化し、追跡可能性を確保

## 3ステップ実施結果（必須）

1. 指示書作成: ✅ 完了
2. 台帳登録（task-workflow）: ✅ 完了
3. 関連仕様書への参照追加: ✅ 完了

## 追加した未タスク

| 未タスクID                                           | 概要                                                                     | 優先度 | 指示書                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| UT-UI-01-NAV-ACCESSIBILITY-POLISH-001                | AppDock のコントラスト改善とモバイル配置最適化                           | 中     | `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-ui-01-nav-accessibility-polish-001.md`                |
| UT-UI-01-PLACEHOLDER-GUIDANCE-001                    | Workspace/HistorySearch のプレースホルダ導線改善                         | 中     | `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-ui-01-placeholder-guidance-001.md`                    |
| UT-IMP-TASK-UI-01-PHASE12-EVIDENCE-CLEANUP-GUARD-001 | TASK-UI-01 再監査運用ガード（検証経路固定/証跡時刻同期/再撮影後cleanup） | 中     | `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-imp-task-ui-01-phase12-evidence-cleanup-guard-001.md` |

## 検証ログ

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 結果                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan apps/desktop/src --output .tmp/task056-unassigned-candidates-desktop.json`                                                                                                                                                                                                                                                                                                                                                        | 20件検出（今回タスク直接対象は2件採用） |
| `node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --scan packages/shared/src --output .tmp/task056-unassigned-candidates-shared.json`                                                                                                                                                                                                                                                                                                                                                      | 7件検出（今回タスク直接対象なし）       |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL_LINKS_EXIST`                       |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-ui-01-nav-accessibility-polish-001.md,docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-ui-01-placeholder-guidance-001.md,docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/unassigned-task/task-imp-task-ui-01-phase12-evidence-cleanup-guard-001.md` | `currentViolations=0`                   |

## 補足

- 既存の TODO/XXX コメントは過去タスク由来の backlog を含むため、今回の未タスク判定からは除外した。
