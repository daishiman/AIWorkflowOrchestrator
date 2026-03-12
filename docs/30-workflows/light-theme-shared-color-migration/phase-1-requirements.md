# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 1                                               |
| Phase名    | 要件定義                                        |
| ステータス | completed                                       |
| 前提Phase  | なし                                            |
| 後続Phase  | Phase 2                                         |

## 目的

ライトテーマで見えなくなる shared view / component を、token 問題と分離して対象化する。

## 実行タスク

- タスク1: current worktree の hardcoded color inventory を補正する
- タスク2: 優先度と Batch A-E を定義する
- タスク3: verification-only lane と既存 backlog 境界を定義する

### タスク1: 高頻度対象の確定

1. `outputs/phase-1/requirements-definition.md` の監査結果を正本にする
2. primary target と verification-only を分離する
3. shared selector / settings organisms / auth surface / search surface に分ける

### タスク2: 優先度とバッチ定義

| バッチ  | 対象                                                  | 優先度 |
| ------- | ----------------------------------------------------- | ------ |
| Batch A | ThemeSelector / AuthModeSelector / AuthKeySection     | P1     |
| Batch B | AccountSection / ApiKeysSection                       | P1     |
| Batch C | AuthView                                              | P1     |
| Batch D | WorkspaceSearchPanel                                  | P1     |
| Batch E | SettingsView / SettingsCard / DashboardView（Verify） | Verify |

### タスク3: backlog 統合方針

- token foundation 起因の課題は親 workflow へ戻す
- shared color migration は current workflow `docs/30-workflows/light-theme-shared-color-migration/` を正本にする
- screenshot / audit 由来の運用課題は contrast regression guard へ渡す

## 参照資料

| 参照資料                 | パス                                                                                                                                   | 説明                        |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| inventory audit          | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/requirements-definition.md`                                      | current worktree の監査結果 |
| priority batches         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/priority-batches.md`                                             | Batch A-E の正本            |
| parent backlog           | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-fix-light-theme-shared-color-migration-001.md`    | 起票元の未タスク            |
| regression guard backlog | `docs/30-workflows/completed-tasks/light-theme-token-foundation/unassigned-task/task-imp-light-theme-contrast-regression-guard-001.md` | 後続運用課題                |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                                |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | token / contrast の正本             |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | Settings domain の正本              |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | shared component 正本               |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Auth / Workspace の機能正本         |
| ui-ux-search-panel         | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`         | WorkspaceSearchPanel の正本         |
| ui-ux-portal-patterns      | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`      | dialog / overlay の正本             |
| rag-desktop-state          | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`          | renderer state / panel state の境界 |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | auth surface の IPC 契約            |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | system IPC 契約                     |
| architecture-auth-security | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | auth shell の安全境界               |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload / IPC 安全境界              |
| security-principles        | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | renderer security 原則              |

## Atent Team / SubAgent 設計

- 直列: inventory correction と system spec 抽出が終わるまで batch 設計へ進まない
- 並列: Batch B（Settings organisms）と Batch C（Auth surface）は Phase 2 で並列設計可
- 直列: Batch E は verification-only lane として最後に扱う

## 統合テスト連携

| 観点                  | 連携内容                                                                                |
| --------------------- | --------------------------------------------------------------------------------------- |
| Token foundation 依存 | token foundation の contract ID を参照し、shared 側の責務だけを対象化する               |
| Representative UI     | Settings / Dashboard / Auth / WorkspaceSearch の代表画面を Phase 4 テスト設計へ引き継ぐ |
| IPC/Preload           | 本タスクは renderer 見た目の修正が中心で、新規 IPC 追加は扱わない                       |

## 成果物

| 成果物                  | パス                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| requirements-definition | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/requirements-definition.md` |
| priority-batches        | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/priority-batches.md`        |
| backlog-mapping         | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/backlog-mapping.md`         |

## 完了条件

- [x] P1/P2/verification-only 対象ファイルが定義されている
- [x] token 問題との境界が明記されている
- [x] 既存 backlog の扱いが決まっている
- [x] Phase 1-3 完了前に実装へ進まない条件がある

## 次Phase

Phase 2: 設計
