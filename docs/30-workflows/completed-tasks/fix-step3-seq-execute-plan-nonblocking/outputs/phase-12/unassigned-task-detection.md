# Phase 12 成果物: 未タスク検出

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 12                           |
| タスクID | TASK-FIX-EXECUTE-PLAN-FF-001 |
| 作成日   | 2026-04-01                   |

## 検出件数: 4 件

本タスクの調査・実装過程で検出された未タスク候補を記録する。

| #   | 未タスク候補                                            | 内容                                                                                                                                                                                                                                        | 優先度     | 推奨タスクID                                             | Issue |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------- | ----- |
| 1   | `executePlan` consumer 契約整合                         | `SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx` が `{ accepted: true, planId }` の ack と `onWorkflowStateChanged` による snapshot 購読の両方に整合するか最終確認が必要。現在は `SkillCreatorExecutePlanAck` compat path で一時吸収済み | **high**   | `TASK-SKILL-CREATOR-EXECUTE-PLAN-CONSUMER-ALIGNMENT-001` | #1838 |
| 2   | `CHANNEL_TIMEOUTS` P0 値の恒久対応                      | `1_800_000` は暫定値。fire-and-forget 完全移行後は `safeInvoke` 呼び出し方式そのものを見直すか、不要な timeout 設定を整理する必要がある                                                                                                     | **low**    | `TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001`                   | #1840 |
| 3   | before-quit guard の実装                                | Electron アプリ終了時にバックグラウンドで実行中のスキル生成を適切に処理（中断通知 or 待機）する機能が未実装                                                                                                                                 | **medium** | `TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001`               | #1839 |
| 4   | `skill-creator:*` 他ハンドラーの fire-and-forget 化調査 | 同様の長時間タイムアウト問題が他ハンドラーに存在しないか確認する調査タスク                                                                                                                                                                  | **low**    | `TASK-CREATOR-HANDLERS-AUDIT-001`                        | #1841 |

## 優先度別サマリー

| 優先度 | 件数                                     |
| ------ | ---------------------------------------- |
| high   | 1 件（consumer 契約整合）                |
| medium | 1 件（before-quit guard）                |
| low    | 2 件（timeout cleanup / handlers audit） |
