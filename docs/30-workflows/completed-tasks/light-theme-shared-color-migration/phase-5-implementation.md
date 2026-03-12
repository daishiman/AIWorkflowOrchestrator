# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 5                                               |
| Phase名    | 実装                                            |
| ステータス | not_started                                     |
| 前提Phase  | Phase 4                                         |
| 後続Phase  | Phase 6                                         |

## 目的

Codex 実装 lane が batch 単位で安全に色直書きを移行できるようにする。

## 実行タスク

- タスク1: Batch A-D を順に実装する
- タスク2: token 直参照へ寄せる
- タスク3: batch を跨いだ無関係修正を禁止する

## 参照資料

| 参照資料                   | パス                                                                                                     | 説明                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 4 テスト仕様         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/phase-4-test-creation.md`          | 守るべきテスト観点                       |
| Batch plan                 | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/batch-plan.md`     | 実装順序                                 |
| migration plan             | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/migration-plan.md` | batch ごとの contract                    |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                  | 共通 component の責務                    |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                    | settings/auth surface 契約               |
| architecture-auth-security | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                        | auth/account 境界                        |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                    | `ApiKeysSection` / `AuthKeySection` 契約 |
| error-handling             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                    | fallback UI を壊さない                   |
| ui-ux-search-panel         | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                                | WorkspaceSearchPanel の正本              |

## 実行手順

1. Phase 4 testcase と Phase 3 PASS/MINOR を確認し、user が実装を明示依頼した場合のみ Batch A から開始する。
2. batch 境界を跨がない最小差分で semantic token へ移行し、token baseline / compatibility bridge / IPC / preload は触らない。
3. 各 batch ごとに review を挟み、Batch E は regression-only として扱い、`implementation-summary.md` へ変更範囲と残課題を記録する。

## Atent Team / Codex 指示

- Batch A 完了後に review
- Batch B/C は review 後に並列可
- Batch D は最後に統合

## 統合テスト連携

| 観点                      | 連携内容                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| Batch-safe implementation | 各 batch は対応 testcase を満たす最小差分で実装する                 |
| Token foundation bridge   | token の再定義を避け、foundation task の contract を使う            |
| Evidence                  | batch ごとの変更内容を `implementation-summary.md` に分けて記録する |

## 成果物

| 成果物                 | パス                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| implementation-summary | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-5/implementation-summary.md` |

## 完了条件

- [ ] batch ごとの修正境界が守られている
- [ ] token foundation 契約から逸脱していない

## 次Phase

Phase 6: テスト拡充
