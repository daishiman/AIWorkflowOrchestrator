# Phase 8: リファクタリング計画

## 実施した変更

| タスク                           | 変更内容                                                                                   | 結果     |
| -------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| CONVERSATION_DB_SCHEMA co-locate | ipc/index.ts からスキーマ定義を完全削除。import も `initializeConversationDatabase` に変更 | 完了     |
| DB パス解決ロジック重複排除      | 後方互換パスの内部初期化を `initializeConversationDatabase()` 呼び出し1行に集約            | 完了     |
| エラーメッセージ統一             | `safeRegister` 経由で `sanitizeRegistrationErrorMessage` が適用されることを確認            | 確認済み |

## 後方互換パス（リファクタリング後）

```typescript
// ipc/index.ts Section 13 - 後方互換パス
} else {
  conversationRegistered = safeRegister(
    "registerConversationHandlers",
    () => {
      const db = initializeConversationDatabase();
      const conversationRepository = new ConversationRepository(db);
      registerConversationHandlers(conversationRepository);
    },
    failures,
  );
}
```

## テスト影響

- `register-conversation-handlers.test.ts` に `_resetForTesting()` 呼び出しを追加（P9対策）
- 全42件 PASS（conversationDatabase: 20件 + register-conversation-handlers: 22件）
