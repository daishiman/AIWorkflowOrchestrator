# Phase 5 Changed Files

| ファイル                                                                                                       | 区分     | 変更内容                                                             |
| -------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                       | existing | `restoredPendingRequest` の優先・clear 条件を説明する comment を追記 |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` | new      | verify_existing 用 targeted regression を追加                        |

## 補足

- 実装対象は `ConversationalInterview` ドメインに閉じる
- IPC / shared contract / renderer layout 変更はなし
