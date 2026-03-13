# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 2                                               |
| Phase名    | 設計                                            |
| ステータス | completed                                       |
| 前提Phase  | Phase 1                                         |
| 後続Phase  | Phase 3                                         |

## 目的

対象ファイルごとの修正バッチ、token 適用方針、SubAgent 実装 lane を設計する。

## 実行タスク

- タスク1: ファイル別移行方針の設計
- タスク2: Batch A-E の実行順序と並列化設計
- タスク3: Codex 実装 lane への引き渡し仕様作成

### タスク1: ファイル別移行方針

| ファイル群                 | 現状問題                                           | 設計方針                                                                  |
| -------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| shared selector / CTA      | neutral / accent hardcode が selector に残る       | `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` を Batch A で統一 |
| Settings organisms         | white glass / text hardcode が section に集中      | `AccountSection` / `ApiKeysSection` を Batch B で統一                     |
| auth surface               | login surface の white text 前提が残る             | `AuthView` を Batch C で light token へ寄せる                             |
| search surface             | panel / input / result listに slate / blue が残る  | `WorkspaceSearchPanel` を Batch D で単独移行                              |
| verification-only wrappers | wrapper 自体は主因でなく regression guard だけ必要 | `SettingsView` / `SettingsCard` / `DashboardView` は Batch E で確認専用   |

### タスク2: 並列化設計

| Lane | 対象バッチ | 並列条件                                           |
| ---- | ---------- | -------------------------------------------------- |
| A    | Batch A    | token/component 境界確定後に先行                   |
| B    | Batch B    | Batch A 後、Batch C と並列可                       |
| C    | Batch C    | Batch A 後、Batch B と並列可                       |
| D    | Batch D    | review コストが高いため単独                        |
| E    | Batch E    | Batch B/C/D 後、verification-only として最後に確認 |

### タスク3: Codex 実装 lane 仕様

- 1 batch = 1 concern を守る
- token foundation の再設計は含めず、component migration だけを扱う
- `WorkspaceSearchPanel` は単独 batch として扱い、Batch E は verification-only にする

## 参照資料

| 参照資料         | パス                                                                               | 説明           |
| ---------------- | ---------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物   | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/`            | 対象一覧       |
| Token foundation | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md` | token 契約参照 |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                            |
| -------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| ui-ux-design-system        | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | token / verification-only 境界  |
| ui-ux-settings             | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`             | Settings domain 設計            |
| ui-ux-components           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | shared component 期待責務       |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Auth / Workspace surface の正本 |
| ui-ux-search-panel         | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`         | WorkspaceSearchPanel 契約       |
| ui-ux-portal-patterns      | `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`      | dialog / portal 設計            |
| rag-desktop-state          | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`          | panel / search state の境界     |
| api-ipc-auth               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`               | auth surface の IPC 依存        |
| api-ipc-system             | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | system IPC 依存                 |
| architecture-auth-security | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | auth shell の安全境界           |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload / IPC 境界              |
| security-principles        | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | renderer security 原則          |

## 成果物

| 成果物         | パス                                                                                     |
| -------------- | ---------------------------------------------------------------------------------------- |
| migration-plan | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/migration-plan.md` |
| batch-plan     | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/batch-plan.md`     |
| codex-handoff  | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-2/codex-handoff.md`  |

## 統合テスト連携

| 観点                    | 連携内容                                                        |
| ----------------------- | --------------------------------------------------------------- |
| Batch to test           | Batch A-D ごとに Phase 4 の testcase と対応づける               |
| Token contract bridge   | token foundation の設計値を直接参照し、色の再定義を避ける       |
| Regression guard bridge | representative file 群を regression guard task の監査対象へ渡す |

## 完了条件

- [x] ファイル別移行方針がある
- [x] batch 単位の並列化ルールがある
- [x] Codex 実装 lane へ渡す単位が明確である
- [x] token foundation task 依存が明記されている

## 次Phase

Phase 3: 設計レビュー
