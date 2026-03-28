# Unassigned Task Detection

## Summary

新規未タスクを 3 件検出した。既存 backlog `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` は Task07 scope との関係再点検が必要である。

## SF-03 4パターン確認

| パターン                 | 判定 | note                                                                                 |
| ------------------------ | ---- | ------------------------------------------------------------------------------------ |
| 型定義 -> 実装           | あり | `packages/shared/src/ipc/channels.ts` と desktop preload channel 定義に drift が残る |
| 契約 -> テスト           | あり | approval request surface 未接続のため renderer coverage が閉じていない               |
| UI仕様 -> コンポーネント | あり | visible handoff / disclosure / execution host の screenshot evidence が欠落          |
| 仕様書間差異 -> 設計決定 | あり | Phase 12 close-out と aiworkflow 正本記述の間に current facts 差分が残る             |

## Existing Backlog Mapping

| item                                          | status            | note                                                                   |
| --------------------------------------------- | ----------------- | ---------------------------------------------------------------------- |
| `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` | covered by Task07 | public Skill Creator IPC wiring と governance alignment を本仕様へ統合 |

## New Unassigned Tasks

| item                                        | status | note                                                                         |
| ------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| `UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001` | new    | Phase 11 の visible handoff / disclosure / execution host の screenshot 取得 |
| `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001` | new    | `packages/shared/src/ipc/channels.ts` を desktop 実装へ同期                  |
| `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001`    | new    | Skill Creator preload/renderer に `approval:request` surface を追加          |

## Ledger / Backlog Decision

| 対象                                                         | 判定     | 根拠                                                                |
| ------------------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/` 新規作成                | 必要     | 新規未タスク 3 件を formalize する                                  |
| `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` の再 formalize | 要再確認 | backlog / completed / Task07 吸収の 3 系統で事実確認が必要          |
| `task-workflow-backlog.md` 追記                              | 必要     | current gap を backlog に反映する                                   |
| completed ledger 更新                                        | 不要     | Task07 は `spec_created` のままで、実装完了 record 追加対象ではない |
