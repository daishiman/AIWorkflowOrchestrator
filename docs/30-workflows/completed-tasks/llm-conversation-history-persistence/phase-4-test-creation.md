# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 4                                    |
| 機能名 | llm-conversation-history-persistence |
| 作成日 | 2026-01-24                           |

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 実行タスク

- **Repository テスト作成**: ConversationRepositoryのユニットテスト
- **IPC テスト作成**: IPCハンドラーの統合テスト
- **統合テスト設計**: Main-Renderer間の統合テストシナリオ
- **境界値テスト**: エッジケースのテスト追加

## 参照資料

| 資料名             | パス                                                                   | 説明          |
| ------------------ | ---------------------------------------------------------------------- | ------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`                           | Phase 1成果物 |
| 設計書             | `outputs/phase-2/architecture-design.md`                               | Phase 2成果物 |
| 設計レビュー       | `outputs/phase-3/design-review-result.md`                              | Phase 3成果物 |
| database-schema.md | `.claude/skills/aiworkflow-requirements/references/database-schema.md` | DBスキーマ    |

## 実行手順

### ステップ1: Repositoryユニットテスト作成

```typescript
// apps/desktop/src/main/repositories/__tests__/conversationRepository.test.ts

describe("ConversationRepository", () => {
  describe("listConversations", () => {
    it("should return empty array when no conversations exist", () => {});
    it("should return conversations sorted by updatedAt DESC", () => {});
    it("should filter by userId", () => {});
    it("should support pagination with limit and offset", () => {});
  });

  describe("getConversation", () => {
    it("should return null when conversation not found", () => {});
    it("should return conversation with all messages", () => {});
    it("should order messages by messageIndex ASC", () => {});
  });

  describe("createConversation", () => {
    it("should create conversation with generated UUID", () => {});
    it("should set createdAt and updatedAt to current time", () => {});
    it("should set messageCount to 0", () => {});
    it("should throw error when title is empty", () => {});
  });

  describe("updateConversation", () => {
    it("should update title", () => {});
    it("should update updatedAt timestamp", () => {});
    it("should throw error when conversation not found", () => {});
  });

  describe("deleteConversation", () => {
    it("should soft delete conversation", () => {});
    it("should not return deleted conversations in list", () => {});
    it("should cascade delete messages", () => {});
  });

  describe("addMessage", () => {
    it("should add message with correct messageIndex", () => {});
    it("should update conversation messageCount", () => {});
    it("should update conversation updatedAt", () => {});
    it("should update lastMessagePreview", () => {});
    it("should throw error when session not found", () => {});
  });

  describe("searchConversations", () => {
    it("should find conversations by title keyword", () => {});
    it("should return empty array when no match", () => {});
    it("should be case-insensitive", () => {});
  });
});
```

### ステップ2: IPCハンドラーテスト作成

```typescript
// apps/desktop/src/main/handlers/__tests__/conversation.test.ts

describe("Conversation IPC Handlers", () => {
  describe("conversation:list", () => {
    it("should return conversation list from repository", () => {});
    it("should return empty array on error with error message", () => {});
  });

  describe("conversation:get", () => {
    it("should return conversation details", () => {});
    it("should return null when not found", () => {});
  });

  describe("conversation:create", () => {
    it("should create and return new conversation", () => {});
    it("should return error when validation fails", () => {});
  });

  describe("conversation:update", () => {
    it("should update and return conversation", () => {});
    it("should return error when not found", () => {});
  });

  describe("conversation:delete", () => {
    it("should delete and return success", () => {});
    it("should return success false when not found", () => {});
  });

  describe("conversation:addMessage", () => {
    it("should add message and return it", () => {});
    it("should return error when session not found", () => {});
  });

  describe("conversation:search", () => {
    it("should return matching conversations", () => {});
  });
});
```

### ステップ3: 統合テストシナリオ作成

```typescript
// apps/desktop/src/main/__tests__/conversation.integration.test.ts

describe("Conversation Integration Tests", () => {
  describe("Full Conversation Flow", () => {
    it("should create conversation, add messages, and retrieve them", () => {});
    it("should persist across repository instances", () => {});
  });

  describe("IPC Integration", () => {
    it("should handle IPC calls end-to-end", () => {});
    it("should handle concurrent requests correctly", () => {});
  });

  describe("Error Handling", () => {
    it("should handle DB connection errors gracefully", () => {});
    it("should handle constraint violations", () => {});
  });

  describe("Data Integrity", () => {
    it("should maintain message order under concurrent additions", () => {});
    it("should update messageCount correctly", () => {});
  });
});
```

### ステップ4: 境界値テスト作成

```typescript
describe("Boundary Tests", () => {
  describe("Title Validation", () => {
    it("should accept title with 3 characters (minimum)", () => {});
    it("should accept title with 100 characters (maximum)", () => {});
    it("should reject title with 2 characters", () => {});
    it("should reject title with 101 characters", () => {});
  });

  describe("Message Content", () => {
    it("should accept empty content (system messages)", () => {});
    it("should accept content with 100000 characters (maximum)", () => {});
    it("should handle unicode characters correctly", () => {});
  });

  describe("Large Data Sets", () => {
    it("should handle 1000 conversations efficiently", () => {});
    it("should handle conversation with 1000 messages", () => {});
  });
});
```

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                                   | テストファイル                     |
| ------------------ | ---------------------------------------------------------- | ---------------------------------- |
| IPC接続テスト      | conversation:\* チャンネル疎通・レスポンス形式             | `conversation.ipc.test.ts`         |
| データフローテスト | Renderer→IPC→Repository→SQLite→Repository→IPC→Renderer往復 | `conversation.flow.test.ts`        |
| エラーハンドリング | DB接続エラー・制約違反時のエラーレスポンス                 | `conversation.error.test.ts`       |
| データ整合性テスト | 会話作成→メッセージ追加→messageCount更新                   | `conversation.integrity.test.ts`   |
| 永続化テスト       | 会話作成→DB再接続→会話復元                                 | `conversation.persistence.test.ts` |

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/*.test.ts`              | 実際のテストコード |

## 完了条件

- [ ] ConversationRepositoryのユニットテストが作成されている
- [ ] IPCハンドラーのテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] 境界値テストが含まれている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

## 次のPhase

Phase 5: 実装（TDD: Green）
