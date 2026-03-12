# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| Phase      | 1                                               |
| Phase名    | 要件定義                                        |
| ステータス | not_started                                     |
| 前提Phase  | なし                                            |
| 後続Phase  | Phase 2                                         |

## 目的

ライトテーマの hardcoded color 残件を inventory ベースで確定し、token 問題と分離した concern-based batch に再定義する。

## 実行タスク

- タスク1: 直書き色 inventory を確定する
- タスク2: concern-based priority batch を定義する
- タスク3: 既存 backlog との統合方針を定義する
- タスク4: system spec 前提を固定する
- タスク5: `aiworkflow-requirements` 抽出マトリクスを作成する

### タスク1: 高頻度対象の確定

1. `text-white` / `bg-white` / `border-white` / `bg-slate-*` / `text-slate-*` / `#hex` の hit lines を regex 監査で確定する
2. high-hit ファイルを Batch A-E と verification-only に分類する
3. shared control / settings authenticated surface / auth entry / search surface に concern 分離する

### タスク2: 優先度とバッチ定義

| バッチ  | 対象                                                   | 優先度 | 主要 concern                     |
| ------- | ------------------------------------------------------ | ------ | -------------------------------- |
| Batch A | `ThemeSelector` / `AuthModeSelector`                   | P1     | shared selector control          |
| Batch B | `AuthKeySection` / `AccountSection` / `ApiKeysSection` | P1     | settings authenticated surface   |
| Batch C | `AuthView`                                             | P1     | unauthenticated auth entry       |
| Batch D | `WorkspaceSearchPanel`                                 | P1     | isolated search surface          |
| Batch E | `SettingsView` / `SettingsCard` / `DashboardView`      | Verify | verification-only regression set |

### タスク3: backlog 統合方針

- Settings 単体未タスクは本タスクへ取り込む
- token 起因課題は Task 1 へ戻す
- screenshot / audit 由来の運用課題は Task 3 へ渡す

### タスク4: system spec 前提の固定

- `ui-ux-design-system.md` の `white background / black text` baseline を入力契約にし、本タスクでは light token 値を再設計しない
- `workflow-light-theme-global-remediation.md` の token / compatibility bridge / component migration 分離を維持する
- `ui-ux-settings.md` / `architecture-auth-security.md` / `api-ipc-system.md` / `api-ipc-auth.md` / `error-handling.md` を batch ごとの input-only contract とする
- Phase 11 の screenshot 証跡は current build capture を使う前提で、Phase 1 時点から stale evidence 禁止を明記する

### タスク5: `aiworkflow-requirements` 抽出マトリクス

- resource-map → keyword search → direct reference の順に最小限参照する
- Batch A-E ごとに必須仕様と条件付き仕様を `aiworkflow-requirements-extraction.md` へ記録する
- `.claude/skills` を canonical root とし、mirror root の解釈を混ぜない

## 参照資料

| 参照資料             | パス                                                                                                                              | 説明                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| ライトテーマ調査メモ | 会話ログ                                                                                                                          | 高頻度 file 調査      |
| Settings 未タスク    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md` | 既存 Settings backlog |
| global remediation   | `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`                                    | concern 分離の正本    |

### システム仕様（aiworkflow-requirements）

| 参照資料                            | パス                                                                                                   | 内容                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| ui-ux-design-system                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                             | light token baseline 前提                |
| ui-ux-components                    | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                | shared component 正本                    |
| ui-ux-feature-components            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | feature 単位の正本                       |
| ui-ux-design-principles             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                         | contrast / hierarchy 方針                |
| rag-desktop-state                   | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`                               | `ThemeSelector` の state ownership       |
| ui-ux-settings                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                  | settings authenticated surface 契約      |
| ui-ux-forms                         | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`                                     | `AuthView` の readable text 契約         |
| architecture-auth-security          | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                      | `AccountSection` / `AuthView` の境界     |
| api-ipc-auth                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                                    | auth state → UI 契約                     |
| api-ipc-system                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                  | `ApiKeysSection` / `AuthKeySection` 契約 |
| workflow-apikey-chat-tool-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | auth-key 表示契約と既存 workflow 正本    |
| error-handling                      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                  | fallback / shape guard UI を壊さない     |
| ui-ux-search-panel                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`                              | `WorkspaceSearchPanel` の正本            |
| task-workflow                       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                   | screenshot 証跡運用                      |
| lessons-learned                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | light theme 再発教訓                     |

## 実行手順

1. `rg` 監査や既存調査メモから hardcoded color inventory を確定し、Batch A-E / verification-only に分類する。
2. 既存未タスクを token foundation / shared migration / regression guard / timeout fallback / functional warning に責務分離して棚卸しする。
3. `resource-map.md` と keyword search から batch ごとの必須仕様・条件付き仕様を抽出し、`aiworkflow-requirements-extraction.md` に固定する。
4. `.claude/skills/aiworkflow-requirements/` を canonical root とし、current build capture を前提にした Phase 11/12 入力契約を固定する。

## Atent Team / SubAgent 設計

- 直列: token foundation の Phase 3 設計レビューが PASS するまで本 task の Phase 4 以降へ進まない
- 直列: Lane A で inventory / backlog / system spec extraction を確定してから Batch A-E 設計へ渡す

## 統合テスト連携

| 観点                  | 連携内容                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Token foundation 依存 | token foundation の contract ID を参照し、shared 側の責務だけを対象化する                                               |
| Representative UI     | Settings authenticated surface / Auth entry / WorkspaceSearch / verification-only shell を Phase 4 テスト設計へ引き継ぐ |
| IPC/Preload           | 本タスクは renderer 見た目の修正が中心で、新規 IPC 追加は扱わない                                                       |

## 成果物

| 成果物                  | パス                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| requirements-definition | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/requirements-definition.md`            |
| priority-batches        | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/priority-batches.md`                   |
| backlog-mapping         | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/backlog-mapping.md`                    |
| aiworkflow extraction   | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-1/aiworkflow-requirements-extraction.md` |

## 完了条件

- [ ] Batch A-E と verification-only が定義されている
- [ ] token 問題との境界が明記されている
- [ ] 既存 backlog の扱いが決まっている
- [ ] batch ごとの `aiworkflow-requirements` 抽出結果が記録されている
- [ ] current build capture を前提とした Phase 11 証跡方針がある
- [ ] Phase 1-3 完了前に実装へ進まない条件がある

## 次Phase

Phase 2: 設計
