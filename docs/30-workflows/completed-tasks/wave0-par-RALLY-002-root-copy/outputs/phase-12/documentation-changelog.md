# Documentation Changelog

| 対象                                                      | 種別   | 内容                                                                                                               |
| --------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------ |
| `ConversationalInterview.tsx`                             | update | undo 復元中の submission 生成元を `pendingRequest` に合わせ、送信成功直後の premature clear を削除                 |
| `ConversationalInterview.restoredPendingRequest.test.tsx` | update | payload requestId 検証と stale fallback 防止ケースを追加                                                           |
| workflow outputs phase 4-12                               | update | コメント中心の記録を、実ロジック修正と回帰テスト中心の記録へ更新                                                   |
| `.claude/.agents` logs                                    | update | `aiworkflow-requirements` / `task-specification-creator` の LOGS と completed ledger に RALLY-002 close-out を追記 |
| system spec sync                                          | no-op  | public contract / shared type / IPC が不変のため Step 2 は未実施                                                   |
