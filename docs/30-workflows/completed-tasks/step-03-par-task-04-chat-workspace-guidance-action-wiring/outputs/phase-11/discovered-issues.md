# Phase 11: 発見事項

## メタ情報

| 項目     | 内容                                               |
| -------- | -------------------------------------------------- |
| タスクID | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| Phase    | 11                                                 |
| 作成日   | 2026-03-22                                         |

## 1. walkthrough 結果サマリー

- TC-11-01〜TC-11-04 はすべて PASS
- ChatView / WorkspaceView の blocked message と primary CTA は shared guidance mapping に整列した
- Settings 遷移は 1クリックで成立し、ready 状態では banner が消えることを視覚確認した

## 2. residual follow-up

| ID       | 問題                                                                 | 影響度 | 対応方針                                                            |
| -------- | -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------- |
| DI-11-01 | `openTerminal` secondary CTA は dispatcher handler 不在のため未表示  | 中     | `UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001` として formalize |
| DI-11-02 | `retryConnection` の UI / IPC 契約が存在せず manual walkthrough 不可 | 中     | `UT-IMP-CHAT-WORKSPACE-GUIDANCE-RETRY-CONNECTION-IPC-001` で追跡    |
| DI-11-03 | 複数 blocked reason 同時存在時の優先度が未定義                       | 中     | `UT-DESIGN-CHAT-WORKSPACE-GUIDANCE-REASON-PRIORITY-001` で設計化    |
| DI-11-04 | guidance 導入後も stale state cleanup が残る                         | 低     | `UT-CLEANUP-CHAT-WORKSPACE-GUIDANCE-STATE-001` で整理               |

## 3. 視覚的差異の有無

| 観点                       | 判定 | メモ                                                        |
| -------------------------- | ---- | ----------------------------------------------------------- |
| Chat blocked banner 表示   | PASS | warning banner と `設定を見る` CTA が意図通り表示された     |
| Settings 遷移              | PASS | Chat banner から 1クリックで Settings へ遷移                |
| Chat ready 状態            | PASS | banner が消え、入力欄と送信ボタンが通常状態で描画された     |
| Workspace blocked guidance | PASS | GuidanceBlock が中央 card で表示され、Chat と同一文言を使用 |

## 4. 証跡取得方法

- capture script: `apps/desktop/scripts/capture-task-chat-workspace-guidance-action-wiring-phase11.mjs`
- metadata: `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- screenshot directory: `outputs/phase-11/screenshots/`
