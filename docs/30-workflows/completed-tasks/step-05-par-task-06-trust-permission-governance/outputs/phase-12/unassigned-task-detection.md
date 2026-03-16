# 未タスク検出レポート - TASK-SKILL-LIFECYCLE-06 Phase 12

## メタ情報

| 項目     | 値                                                                           |
| -------- | ---------------------------------------------------------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-06                                                      |
| Phase    | 12                                                                           |
| 検出日   | 2026-03-16                                                                   |
| 検出元   | `outputs/phase-7/coverage-gaps.md` + `outputs/phase-11/discovered-issues.md` |

## 方針

未タスク検出件数が1件以上のため、`docs/30-workflows/unassigned-task/` に指示書を formalize し、task-workflow-backlog とリンク同期した。

## 検出件数

- 合計: 8件
- 指示書作成: 8/8 完了
- task-workflow-backlog 反映: 完了
- リンク整合確認: 完了（`verify-unassigned-links` PASS）

## 未タスク一覧

| UT ID     | タスク名                                | 優先度 | 指示書                                                                                       |
| --------- | --------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| UT-06-001 | ToolRiskConfig 実装                     | 高     | `docs/30-workflows/unassigned-task/task-ut-06-001-tool-risk-config-implementation.md`        |
| UT-06-002 | AllowedToolEntryV2 PermissionStore 適用 | 高     | `docs/30-workflows/unassigned-task/task-ut-06-002-allowed-tool-entry-v2-permission-store.md` |
| UT-06-003 | SafetyGatePort 具象クラス実装           | 高     | `docs/30-workflows/unassigned-task/task-ut-06-003-safety-gate-port-implementation.md`        |
| UT-06-004 | INS-01〜03 UI コンポーネント実装        | 中     | `docs/30-workflows/unassigned-task/task-ut-06-004-ins-01-03-ui-components.md`                |
| UT-06-005 | abort/skip/retry fallback 組み込み      | 高     | `docs/30-workflows/unassigned-task/task-ut-06-005-abort-skip-retry-fallback.md`              |
| UT-06-006 | high × time_24h テスト追加              | 低     | `docs/30-workflows/unassigned-task/task-ut-06-006-high-time-24h-test.md`                     |
| UT-06-007 | high × time_7d テスト追加               | 低     | `docs/30-workflows/unassigned-task/task-ut-06-007-high-time-7d-test.md`                      |
| UT-06-008 | タイムアウトカウンタリセット仕様明確化  | 低     | `docs/30-workflows/unassigned-task/task-ut-06-008-timeout-counter-reset-spec.md`             |

## 引き継ぎ

TASK-SKILL-LIFECYCLE-08 開始時に、上表8件を要件定義へ取り込み、優先度「高」から順に実施する。
