# Phase 1 スコープ定義

## In Scope

| 項目               | 内容                                                       |
| ------------------ | ---------------------------------------------------------- |
| 統合レビューゲート | C/D を中心に A/B を根拠へ含めた判定軸の統合                |
| 仕様同期台帳       | aiworkflow と task-specification-creator への更新対象整理  |
| downstream handoff | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A` の解除条件整理 |
| 証跡整備           | Phase 1〜12 の outputs と `artifacts.json` 更新            |
| path 正規化        | current/completed/parent の参照先ドリフト検出              |

## Out Of Scope

| 項目                          | 理由                                       |
| ----------------------------- | ------------------------------------------ |
| C/D の既存実装コード変更      | 本タスクは統合ゲートと仕様同期の文書タスク |
| 新規 IPC / preload API の追加 | B/C 正本を参照して判断するのみ             |
| GlobalNavStrip 本体実装       | `TASK-UI-02` の責務                        |
| AgentView UI リデザイン実装   | `TASK-UI-03` の責務                        |
| Workspace レイアウト本体実装  | `TASK-UI-04A` の責務                       |
| コミット / PR                 | ユーザー明示禁止、Phase 13 も未実施        |

## 委譲境界

| 受け渡し先    | 本タスクが確定するもの                        | 受け渡し先が実装するもの      |
| ------------- | --------------------------------------------- | ----------------------------- |
| `TASK-UI-02`  | ViewType / nav handoff 条件、判定軸、参照正本 | GlobalNavStrip / AppDock 移行 |
| `TASK-UI-03`  | state / ipc / security 境界、解除条件         | AgentView UI と interaction   |
| `TASK-UI-04A` | `workspace` 導線、正本リンク、同期判断        | Workspace 画面レイアウト      |
| B 正本        | sender / whitelist / Result 契約の判断基準    | IPC 実装詳細の維持            |

## 非スコープだが監視する項目

| 項目                            | 扱い                            |
| ------------------------------- | ------------------------------- |
| parent docs の旧参照パス        | Phase 5/12 の同期対象として監視 |
| aiworkflow 正本への新ルール追加 | Step 2 条件付き更新で判定       |
| 未タスク化が必要な品質リスク    | Phase 10 / 12 で判断            |
