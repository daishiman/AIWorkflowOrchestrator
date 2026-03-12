# Phase 1 成果物: requirements-definition

## 目的

ライトテーマで視認性を壊している shared 色直書きを、token foundation task の責務と混線させずに renderer 側の適用問題として切り分ける。

## スコープ定義

### 対象

| 区分         | ファイル                                                                                  | 実測ヒット | 主な問題                                                              |
| ------------ | ----------------------------------------------------------------------------------------- | ---------: | --------------------------------------------------------------------- |
| P1 / Batch A | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx`                  |          4 | `bg-white/5` `border-white/10` `text-white/60` 依存                   |
| P1 / Batch B | `apps/desktop/src/renderer/views/AuthView/index.tsx`                                      |          4 | hero / title / subtitle が `text-white*` 前提                         |
| P1 / Batch C | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx` |         39 | `slate-*` / `text-white` / `border-slate-*` が集中                    |
| P2 / Batch D | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`                 |         22 | profile / menu / dialog 内の `text-white*` `bg-white/10`              |
| P2 / Batch D | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/TimezoneSelector.tsx`        |         16 | input / dropdown / helper text の `white` 依存                        |
| P2 / Batch D | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/LocaleSelector.tsx`          |          9 | combobox / option の `white` 依存                                     |
| Reference    | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                  |          0 | shell は token 済み。Batch A/D の親導線として確認のみ                 |
| Reference    | `apps/desktop/src/renderer/components/organisms/SettingsCard/index.tsx`                   |          0 | token 済み。GlassPanel 契約の前提として確認のみ                       |
| Reference    | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                                 |          0 | index 仕様上 P1 だが現行ファイルは token 済み。回帰確認対象として扱う |
| Reference    | `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`                  |          1 | `text-white` 1件のみ。今回は残課題候補として監査扱い                  |

### 非対象

- `apps/desktop/src/renderer/styles/tokens.css` の token 値そのものの再設計
- global override (`globals.css`) の repo-wide 一括置換
- target 外 component への横展開修正
- commit / PR / branch 操作

## 受入基準の具体化

| AC   | 実施内容                                                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Batch A-D の対象ファイルで `white/slate/zinc` 直書き色を semantic token / token-based color-mix へ移行する                                          |
| AC-2 | ThemeSelector / AuthView / WorkspaceSearchPanel / AccountSection / LocaleSelector / TimezoneSelector を少なくとも修正・テスト対象に含める           |
| AC-3 | `text-white` `bg-white/5` `border-white/10` `bg-slate-*` `text-slate-*` `border-slate-*` `bg-zinc-*` の target file 残存を contract test で監査する |
| AC-4 | Settings/Auth/AgentView 由来の既存 contrast backlog は mapping して重複実装を避ける                                                                 |
| AC-5 | Batch A-D 単位で設計・テスト・実装・Phase 11 証跡を追跡できるように成果物を分離する                                                                 |

## token foundation との境界

| 項目                                            | token foundation task | 本タスク                 |
| ----------------------------------------------- | --------------------- | ------------------------ |
| `--bg-*` `--text-*` `--border-*` の値決定       | 責務内                | 対象外                   |
| component でどの token を使うか                 | 引き継ぎ仕様          | 責務内                   |
| glare を避けるための `color-mix(...)` 利用      | token 契約内で可      | 責務内                   |
| `globals.css` による hardcoded class の暫定吸収 | 既存資産              | 原則依存しない方向で削減 |

## 既存 backlog 統合方針

| 既存 backlog / 指示書                                                                                                                          | 判定               | 理由                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | -------------------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md`              | 本タスクへ吸収     | Settings shell / profile 系の light contrast と重複                  |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | 参照のみ           | AuthTimeoutFallback は本タスクの direct scope 外。残件なら未タスク化 |
| `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`       | token scope と分離 | AgentView 固有ではなく global token 寄りの所見は再利用教訓のみ継承   |

## Atent Team / Lane 分担

| Lane | 関心ごと                                                                     | Phase   |
| ---- | ---------------------------------------------------------------------------- | ------- |
| A    | requirements / design / backlog mapping / Phase 12 spec sync                 | 1-3, 12 |
| B    | ThemeSelector / AuthView / AccountSection / Profile selectors の実装とテスト | 4-10    |
| C    | WorkspaceSearchPanel / Phase 11 harness / screenshot capture                 | 4-11    |

## Phase 1 完了判定

- P1/P2 の実ファイルと優先順位を実測値付きで固定した
- token foundation task と component migration task の境界を明記した
- 既存 backlog の吸収先 / 参照先 / 非対象を整理した
- Phase 4 以降で使う lane 分担を確定した
