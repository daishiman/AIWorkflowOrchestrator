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

ライトテーマで見えなくなる shared view / component を、token 問題と分離して対象化する。

## 実行タスク

- タスク1: 直書き色の高頻度対象を確定する
- タスク2: 優先度とバッチ単位を定義する
- タスク3: 既存 backlog との統合方針を定義する

### タスク1: 高頻度対象の確定

1. `text-white` / `bg-slate-*` / `bg-zinc-*` の調査結果を取り込む
2. high-hit ファイルを P1/P2 に分類する
3. shared shell / view / organism / selector に分ける

### タスク2: 優先度とバッチ定義

| バッチ  | 対象                                        | 優先度 |
| ------- | ------------------------------------------- | ------ |
| Batch A | SettingsView / SettingsCard / ThemeSelector | P1     |
| Batch B | DashboardView / AuthView                    | P1     |
| Batch C | WorkspaceSearchPanel                        | P1     |
| Batch D | AccountSection / Profile selectors          | P2     |

### タスク3: backlog 統合方針

- Settings 単体未タスクは本タスクへ取り込む
- token 起因課題は Task 1 へ戻す
- screenshot / audit 由来の運用課題は Task 3 へ渡す

## 参照資料

| 参照資料             | パス                                                                                                                              | 説明                  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| ライトテーマ調査メモ | 会話ログ                                                                                                                          | 高頻度 file 調査      |
| Settings 未タスク    | `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md` | 既存 Settings backlog |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                      |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------- |
| ui-ux-components         | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | component 正本            |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | feature 単位の正本        |
| ui-ux-design-principles  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | contrast / hierarchy 方針 |

## Atent Team / SubAgent 設計

- 直列: Task 1（token foundation）の Phase 3 設計レビューが PASS するまで本 task の Phase 4 以降へ進まない
- Phase 1 では backlog 整理と priority 付けを直列で実施する

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

- [ ] P1/P2 対象ファイルが定義されている
- [ ] token 問題との境界が明記されている
- [ ] 既存 backlog の扱いが決まっている
- [ ] Phase 1-3 完了前に実装へ進まない条件がある

## 次Phase

Phase 2: 設計
