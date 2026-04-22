# Phase 4 既存テスト棚卸し

## 対象テストファイル

| ファイル                                              | テスト数 | restoredPendingRequest 関連 |
| ----------------------------------------------------- | -------- | --------------------------- |
| `__tests__/ConversationalInterview.test.tsx`          | 14       | 間接的（undo テスト1件）    |
| `__tests__/ConversationalInterview.ipc-edge.test.tsx` | 6        | なし                        |
| `__tests__/useInterviewState.test.ts`                 | 別フック | なし                        |

## restoredPendingRequest を間接的にテストする既存ケース

| TC ID                                         | 説明                                  | restoredPendingRequest の関与                     |
| --------------------------------------------- | ------------------------------------- | ------------------------------------------------- |
| restores previous question and answer on undo | undo で前の質問と回答が復元される     | `handleUndo` → `setRestoredPendingRequest` を経由 |
| disables undo button at first question        | 最初の質問では戻るボタンが無効        | `canUndo=false` のケース                          |
| shows waiting message when no pending request | pendingRequest が null のとき待機表示 | null 経路のカバー                                 |

## ギャップ分析

| シナリオ                                                           | 既存テスト                 | 不足           |
| ------------------------------------------------------------------ | -------------------------- | -------------- |
| 優先ルール（restoredPendingRequest が awaitingUserInput より優先） | なし                       | 新規作成必要   |
| clear 条件（requestId 変化でクリア）                               | なし                       | 新規作成必要   |
| submit 完了後のクリア                                              | 間接的（undo テスト）      | 明示テスト不在 |
| undo 後の priority 検証                                            | なし（既存は回答復元のみ） | 新規作成必要   |

## 棚卸し結論

- 既存テストは UI 描画・送信フロー・エラーハンドリングをカバーする
- `restoredPendingRequest` の優先ルールと clear 条件を直接テストするケースが存在しない
- 新規ファイル `ConversationalInterview.restoredPendingRequest.test.tsx` を作成して targeted regression test を追加する
