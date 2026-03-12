# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 2                                               |
| Phase名    | 設計                                            |
| ステータス | not_started                                     |
| 前提Phase  | Phase 1                                         |
| 後続Phase  | Phase 3                                         |

## 目的

旧 view 名ベースの優先順位を破棄し、concern-based batch と system spec traceability に基づく実装 lane を設計する。

## 実行タスク

- タスク1: concern-based file group の移行方針を設計する
- タスク2: Batch A-E の実行順序と並列化設計
- タスク3: Codex 実装 lane への引き渡し仕様作成
- タスク4: current build capture と system spec 同期条件を設計する

### タスク1: ファイル別移行方針

| ファイル群                       | 現状問題                                                                                               | 設計方針                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Batch A: shared selector control | `ThemeSelector` / `AuthModeSelector` に neutral / accent hardcode が残る                               | selector container と control state を semantic token へ寄せる          |
| Batch B: settings auth surface   | `AuthKeySection` / `AccountSection` / `ApiKeysSection` に white glass / hex / gray hardcode が集中する | settings/auth 契約を守ったまま text / border / status / CTA を token 化 |
| Batch C: auth entry              | `AuthView` が white text 前提                                                                          | auth state → UI 契約を維持しつつ readable text へ移行                   |
| Batch D: search surface          | `WorkspaceSearchPanel` が slate / blue / white 固定                                                    | search panel contract を壊さず panel / input / result list を token 化  |
| Batch E: verification-only       | `SettingsView` / `SettingsCard` / `DashboardView` は主要残件でない                                     | regression-only とし、実装 diff ではなく non-regression の基準に置く    |

### タスク2: 並列化設計

| Lane | 対象バッチ | 並列条件                                           |
| ---- | ---------- | -------------------------------------------------- |
| B    | Batch A    | token foundation Phase 3 PASS 後                   |
| C    | Batch B    | Batch A の shared control 方針確定後に着手         |
| D    | Batch C    | Batch A 後、Batch B と並列可                       |
| E    | Batch D    | Batch A 後、専用 review を前提に独立して進める     |
| F    | Batch E    | Batch B/C/D の設計確定後に regression 条件だけ整備 |

### タスク3: Codex 実装 lane 仕様

- 1 PR / 1 commit 相当の修正単位を batch 単位に分割する
- `AuthKeySection` は `AccountSection` / `ApiKeysSection` と同じ settings auth surface batch で扱う
- UI shell と search panel を同時に触らない
- `WorkspaceSearchPanel` は単独 batch として扱う
- verification-only 対象は Phase 5 実装 diff を前提にしない

### タスク4: current build capture / spec sync 設計

- Phase 11 は current worktree build を capture source に固定し、old workflow 配下の stale screenshot を使わない
- Phase 12 の同期先に `ui-ux-design-system.md` / `workflow-light-theme-global-remediation.md` / `ui-ux-settings.md` / `architecture-auth-security.md` / `api-ipc-auth.md` / `api-ipc-system.md` / `error-handling.md` を含める
- compatibility bridge は token foundation 側の責務として扱い、本タスクでは component migration に限定する

## 参照資料

| 参照資料         | パス                                                                                                                         | 説明                     |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/`                                      | 対象一覧                 |
| Phase 1 抽出表   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/aiworkflow-requirements-extraction.md` | system spec traceability |
| Token foundation | `docs/30-workflows/completed-tasks/light-theme-token-foundation/phase-2-design.md`                                           | token 契約参照           |
| Global workflow  | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`                               | 横断手順正本             |

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                                   | 内容                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| ui-ux-design-system                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                             | baseline / token 契約                    |
| ui-ux-components                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                | shared component 期待責務                |
| rag-desktop-state                   | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                               | `ThemeSelector` の state ownership       |
| ui-ux-settings                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | settings/auth surface 契約               |
| ui-ux-forms                         | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                                     | `AuthView` の readable text 契約         |
| architecture-auth-security          | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                      | `AccountSection` / `AuthView` の境界     |
| api-ipc-auth                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                    | auth state → UI 契約                     |
| api-ipc-system                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `ApiKeysSection` / `AuthKeySection` 契約 |
| workflow-apikey-chat-tool-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | auth-key visibility 契約                 |
| error-handling                      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                  | fallback / shape guard 契約              |
| ui-ux-search-panel                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                              | `WorkspaceSearchPanel` の正本            |
| ui-ux-feature-components            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | verification-only の feature log         |
| task-workflow                       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | capture / evidence 運用                  |
| lessons-learned                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | stale screenshot 防止教訓                |

## 実行手順

1. Phase 1 inventory と抽出マトリクスを Batch A-E と Lane B-F に落とし込み、直列条件と並列条件を固定する。
2. 各 batch について token baseline / compatibility bridge を触らない migration 方針と、守るべき system spec contract をファイル単位で定義する。
3. current build capture、Phase 12 同期先、future Codex lane への handoff 条件を成果物へ反映する。

## 成果物

| 成果物         | パス                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| migration-plan | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/migration-plan.md` |
| batch-plan     | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/batch-plan.md`     |
| codex-handoff  | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-2/codex-handoff.md`  |

## 統合テスト連携

| 観点                    | 連携内容                                                        |
| ----------------------- | --------------------------------------------------------------- |
| Batch to test           | Batch A-E ごとに Phase 4 の testcase と対応づける               |
| Token contract bridge   | token foundation の設計値を直接参照し、色の再定義を避ける       |
| Regression guard bridge | representative file 群を regression guard task の監査対象へ渡す |

## 完了条件

- [ ] ファイル別移行方針がある
- [ ] batch 単位の並列化ルールがある
- [ ] Codex 実装 lane へ渡す単位が明確である
- [ ] token foundation task 依存が明記されている
- [ ] batch ごとの system spec traceability がある
- [ ] current build capture と Phase 12 同期先が設計に含まれている

## 次Phase

Phase 3: 設計レビュー
