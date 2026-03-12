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
- タスク2: Batch A-D の実行順序と並列化設計
- タスク3: Codex 実装 lane への引き渡し仕様作成

### タスク1: ファイル別移行方針

| ファイル群      | 現状問題                                | 設計方針                                   |
| --------------- | --------------------------------------- | ------------------------------------------ |
| Settings shell  | `text-white` / `border-white/10` 直書き | `var(--text-*)` / `var(--border-*)` へ統一 |
| ThemeSelector   | `bg-white/5` / `text-white/60` 直書き   | theme token へ寄せる                       |
| Dashboard/Auth  | 白文字前提 header                       | light/dark 両対応へ置換                    |
| WorkspaceSearch | `slate-*` / `white` 固定                | token ベース panel 契約へ移行              |

### タスク2: 並列化設計

| Lane | 対象バッチ | 並列条件                                   |
| ---- | ---------- | ------------------------------------------ |
| B    | Batch A    | token foundation Phase 3 PASS 後           |
| C    | Batch B    | Batch A と並列可                           |
| D    | Batch C    | Batch A/B と並列可だが review は最後に統合 |

### タスク3: Codex 実装 lane 仕様

- 1 PR / 1 commit 相当の修正単位を batch 単位に分割する
- UI shell と search panel を同時に触らない
- `WorkspaceSearchPanel` は単独 batch として扱う

## 参照資料

| 参照資料                | パス                                                                                    | 説明           |
| ----------------------- | --------------------------------------------------------------------------------------- | -------------- |
| Phase 1 成果物          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/` | 対象一覧       |
| Token foundation        | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`      | token 契約参照 |
| requirements-definition | `outputs/phase-1/requirements-definition.md`                                            | Phase 1 成果物 |
| priority-batches        | `outputs/phase-1/priority-batches.md`                                                   | Phase 1 成果物 |
| backlog-mapping         | `outputs/phase-1/backlog-mapping.md`                                                    | Phase 1 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------- |
| ui-ux-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | component 期待責務                    |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Settings / Workspace / Dashboard 導線 |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | shell / navigation 影響確認           |

## 成果物

| 成果物         | パス                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| migration-plan | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/migration-plan.md` |
| batch-plan     | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/batch-plan.md`     |
| codex-handoff  | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/codex-handoff.md`  |

## 統合テスト連携

| 観点                    | 連携内容                                                        |
| ----------------------- | --------------------------------------------------------------- |
| Batch to test           | Batch A-D ごとに Phase 4 の testcase と対応づける               |
| Token contract bridge   | token foundation の設計値を直接参照し、色の再定義を避ける       |
| Regression guard bridge | representative file 群を regression guard task の監査対象へ渡す |

## 完了条件

- [ ] ファイル別移行方針がある
- [ ] batch 単位の並列化ルールがある
- [ ] Codex 実装 lane へ渡す単位が明確である
- [ ] token foundation task 依存が明記されている

## 次Phase

Phase 3: 設計レビュー
