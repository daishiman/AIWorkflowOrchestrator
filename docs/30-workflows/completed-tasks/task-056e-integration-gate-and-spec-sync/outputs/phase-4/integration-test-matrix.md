# Phase 4 統合テストマトリクス

| 軸            | テストケース                                                    | `coverage-standards.md` カテゴリ      | 主な検証コマンド      |
| ------------- | --------------------------------------------------------------- | ------------------------------------- | --------------------- | ------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------- |
| state         | `TC-04-001`, `TC-04-007`, `TC-04-009`                           | モジュール間インターフェース / 正常系 | `rg -n "state         | ViewType                                   | workspace" outputs/phase-2 outputs/phase-5`     |
| ipc           | `TC-04-001`, `TC-04-008`                                        | APIエンドポイント / 異常系            | `rg -n "notification: | history:" outputs/phase-2 outputs/phase-5` |
| security      | `TC-04-001`, `TC-04-008`                                        | モジュール間インターフェース / 異常系 | `rg -n "sender        | whitelist                                  | AUTH_REQUIRED" outputs/phase-2 outputs/phase-5` |
| navigation    | `TC-04-001`, `TC-04-007`, `TC-04-009`                           | 正常系シナリオ / 外部連携ポイント     | `rg -n "TASK-UI-02    | workspace                                  | skillCenter                                     | historySearch" outputs/phase-2 outputs/phase-5`            |
| documentation | `TC-04-004`, `TC-04-005`, `TC-04-006`, `TC-04-011`, `TC-04-012` | 外部連携ポイント / 状態同期           | `rg -n "task-workflow | lessons-learned                            | spec_created                                    | verify-unassigned-links" outputs/phase-2 outputs/phase-12` |
