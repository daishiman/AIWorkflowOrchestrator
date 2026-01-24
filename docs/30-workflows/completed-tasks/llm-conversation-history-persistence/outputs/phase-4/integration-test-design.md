# 統合テスト設計書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-LLM-HISTORY-001                   |
| 機能名     | llm-conversation-history-persistence |
| バージョン | 1.0.0                                |
| 作成日     | 2026-01-24                           |

---

## 概要

本ドキュメントは、LLM会話履歴永続化機能の統合テストシナリオを定義する。Renderer→IPC→Repository→SQLiteの全レイヤーを通したEnd-to-Endテストを設計する。

---

## テストファイル構成

| ファイル名                         | 説明                     |
| ---------------------------------- | ------------------------ |
| `conversation.ipc.test.ts`         | IPCチャンネル接続テスト  |
| `conversation.flow.test.ts`        | データフローテスト       |
| `conversation.error.test.ts`       | エラーハンドリングテスト |
| `conversation.integrity.test.ts`   | データ整合性テスト       |
| `conversation.persistence.test.ts` | 永続化テスト             |

---

## 1. IPC接続テスト（conversation.ipc.test.ts）

### 目的

conversation:\* チャンネルの疎通確認とレスポンス形式の検証。

### テストシナリオ

```typescript
// apps/desktop/src/main/__tests__/conversation.ipc.test.ts

describe("Conversation IPC Integration Tests", () => {
  describe("Channel Registration", () => {
    it("should register all conversation IPC channels", () => {
      // Given: IPCハンドラーが登録された状態
      // When: チャンネル一覧を確認
      // Then: 7つのチャンネルがすべて登録されている
      const expectedChannels = [
        "conversation:list",
        "conversation:get",
        "conversation:create",
        "conversation:update",
        "conversation:delete",
        "conversation:addMessage",
        "conversation:search",
      ];
      expectedChannels.forEach((channel) => {
        expect(handlers.has(channel)).toBe(true);
      });
    });
  });

  describe("Response Format", () => {
    it("should return IPCResponse format on success", async () => {
      // Given: 正常なリクエスト
      // When: conversation:listを呼び出し
      // Then: { success: true, data: [...] } 形式で返される
      const response = await invoke("conversation:list", {
        userId: "local-user",
      });
      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("data");
      expect(Array.isArray(response.data)).toBe(true);
    });

    it("should return IPCResponse format on error", async () => {
      // Given: 不正なリクエスト
      // When: conversation:getを空IDで呼び出し
      // Then: { success: false, error: {...} } 形式で返される
      const response = await invoke("conversation:get", { id: "" });
      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("error");
      expect(response.error).toHaveProperty("code");
      expect(response.error).toHaveProperty("message");
    });
  });

  describe("Type Safety", () => {
    it("should return ConversationSummary[] for list", async () => {
      // Given: 会話が存在する
      // When: conversation:listを呼び出し
      // Then: ConversationSummary型の配列が返される
      const response = await invoke("conversation:list", {
        userId: "local-user",
      });
      if (response.success && response.data.length > 0) {
        const item = response.data[0];
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("createdAt");
        expect(item).toHaveProperty("updatedAt");
        expect(item).toHaveProperty("messageCount");
      }
    });

    it("should return Conversation with messages for get", async () => {
      // Given: 会話とメッセージが存在する
      // When: conversation:getを呼び出し
      // Then: Conversation型（messages含む）が返される
      const response = await invoke("conversation:get", { id: existingId });
      if (response.success && response.data) {
        expect(response.data).toHaveProperty("messages");
        expect(Array.isArray(response.data.messages)).toBe(true);
      }
    });
  });
});
```

---

## 2. データフローテスト（conversation.flow.test.ts）

### 目的

Renderer→IPC→Repository→SQLite→Repository→IPC→Rendererの往復データフローを検証。

### テストシナリオ

```typescript
// apps/desktop/src/main/__tests__/conversation.flow.test.ts

describe("Conversation Data Flow Tests", () => {
  describe("Create and Retrieve Flow", () => {
    it("should create conversation and retrieve it", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Test Conversation",
      });
      expect(createResponse.success).toBe(true);
      const conversationId = createResponse.data.id;

      // Step 2: 作成した会話を取得
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.success).toBe(true);
      expect(getResponse.data.title).toBe("Test Conversation");

      // Step 3: 一覧に表示される
      const listResponse = await invoke("conversation:list", {
        userId: "local-user",
      });
      expect(listResponse.success).toBe(true);
      const found = listResponse.data.find(
        (c: ConversationSummary) => c.id === conversationId,
      );
      expect(found).toBeDefined();
    });

    it("should add message and update conversation state", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Message Test",
      });
      const conversationId = createResponse.data.id;

      // Step 2: メッセージを追加
      const addResponse = await invoke("conversation:addMessage", {
        sessionId: conversationId,
        message: {
          role: "user",
          content: "Hello, AI!",
        },
      });
      expect(addResponse.success).toBe(true);

      // Step 3: 会話を取得して確認
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.data.messageCount).toBe(1);
      expect(getResponse.data.messages).toHaveLength(1);
      expect(getResponse.data.messages[0].content).toBe("Hello, AI!");
    });
  });

  describe("Update and Delete Flow", () => {
    it("should update conversation title", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Original Title",
      });
      const conversationId = createResponse.data.id;

      // Step 2: タイトルを更新
      const updateResponse = await invoke("conversation:update", {
        id: conversationId,
        data: { title: "Updated Title" },
      });
      expect(updateResponse.success).toBe(true);
      expect(updateResponse.data.title).toBe("Updated Title");

      // Step 3: 取得して確認
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.data.title).toBe("Updated Title");
    });

    it("should soft delete conversation", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "To Be Deleted",
      });
      const conversationId = createResponse.data.id;

      // Step 2: 削除
      const deleteResponse = await invoke("conversation:delete", {
        id: conversationId,
      });
      expect(deleteResponse.success).toBe(true);
      expect(deleteResponse.data.deleted).toBe(true);

      // Step 3: 取得するとnull
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.success).toBe(true);
      expect(getResponse.data).toBeNull();

      // Step 4: 一覧に表示されない
      const listResponse = await invoke("conversation:list", {
        userId: "local-user",
      });
      const found = listResponse.data.find(
        (c: ConversationSummary) => c.id === conversationId,
      );
      expect(found).toBeUndefined();
    });
  });

  describe("Search Flow", () => {
    it("should find conversations by title keyword", async () => {
      // Step 1: 複数の会話を作成
      await invoke("conversation:create", {
        userId: "local-user",
        title: "TypeScript Tutorial",
      });
      await invoke("conversation:create", {
        userId: "local-user",
        title: "JavaScript Basics",
      });
      await invoke("conversation:create", {
        userId: "local-user",
        title: "Python Guide",
      });

      // Step 2: "Script"で検索
      const searchResponse = await invoke("conversation:search", {
        userId: "local-user",
        query: "Script",
      });
      expect(searchResponse.success).toBe(true);
      expect(searchResponse.data.length).toBe(2);
    });
  });
});
```

---

## 3. エラーハンドリングテスト（conversation.error.test.ts）

### 目的

DB接続エラー・制約違反時のエラーレスポンスを検証。

### テストシナリオ

```typescript
// apps/desktop/src/main/__tests__/conversation.error.test.ts

describe("Conversation Error Handling Tests", () => {
  describe("Validation Errors", () => {
    it("should return error for empty userId", async () => {
      const response = await invoke("conversation:list", { userId: "" });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return error for empty title on create", async () => {
      const response = await invoke("conversation:create", {
        userId: "local-user",
        title: "",
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return error for title too short", async () => {
      const response = await invoke("conversation:create", {
        userId: "local-user",
        title: "ab", // 2文字
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return error for empty content on addMessage", async () => {
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Test",
      });
      const response = await invoke("conversation:addMessage", {
        sessionId: createResponse.data.id,
        message: {
          role: "user",
          content: "",
        },
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("Not Found Errors", () => {
    it("should return NOT_FOUND for non-existent conversation", async () => {
      const response = await invoke("conversation:update", {
        id: "non-existent-id",
        data: { title: "New Title" },
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("NOT_FOUND");
    });

    it("should return error for addMessage on non-existent session", async () => {
      const response = await invoke("conversation:addMessage", {
        sessionId: "non-existent-id",
        message: {
          role: "user",
          content: "Hello",
        },
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toMatch(/NOT_FOUND|DB_ERROR/);
    });
  });

  describe("Database Errors", () => {
    it("should handle DB connection error gracefully", async () => {
      // Given: DBが閉じられている状態をシミュレート
      mockRepository.listConversations.mockImplementation(() => {
        throw new Error("Database is closed");
      });

      const response = await invoke("conversation:list", {
        userId: "local-user",
      });
      expect(response.success).toBe(false);
      expect(response.error.code).toBe("DB_ERROR");
    });
  });
});
```

---

## 4. データ整合性テスト（conversation.integrity.test.ts）

### 目的

会話作成→メッセージ追加→messageCount更新の整合性を検証。

### テストシナリオ

```typescript
// apps/desktop/src/main/__tests__/conversation.integrity.test.ts

describe("Conversation Data Integrity Tests", () => {
  describe("Message Count Integrity", () => {
    it("should maintain accurate messageCount", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Count Test",
      });
      const conversationId = createResponse.data.id;
      expect(createResponse.data.messageCount).toBe(0);

      // Step 2: 3つのメッセージを追加
      for (let i = 0; i < 3; i++) {
        await invoke("conversation:addMessage", {
          sessionId: conversationId,
          message: {
            role: i % 2 === 0 ? "user" : "assistant",
            content: `Message ${i + 1}`,
          },
        });
      }

      // Step 3: messageCountが3であることを確認
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.data.messageCount).toBe(3);
      expect(getResponse.data.messages).toHaveLength(3);
    });
  });

  describe("Message Index Integrity", () => {
    it("should maintain sequential messageIndex", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Index Test",
      });
      const conversationId = createResponse.data.id;

      // Step 2: 5つのメッセージを追加
      for (let i = 0; i < 5; i++) {
        await invoke("conversation:addMessage", {
          sessionId: conversationId,
          message: {
            role: "user",
            content: `Message ${i}`,
          },
        });
      }

      // Step 3: messageIndexが0,1,2,3,4であることを確認
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      getResponse.data.messages.forEach((msg: Message, index: number) => {
        expect(msg.messageIndex).toBe(index);
      });
    });
  });

  describe("Last Message Preview Integrity", () => {
    it("should update lastMessagePreview on addMessage", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Preview Test",
      });
      const conversationId = createResponse.data.id;

      // Step 2: メッセージを追加
      const content =
        "This is a long message that should be truncated in the preview.";
      await invoke("conversation:addMessage", {
        sessionId: conversationId,
        message: {
          role: "user",
          content,
        },
      });

      // Step 3: lastMessagePreviewが更新されている
      const listResponse = await invoke("conversation:list", {
        userId: "local-user",
      });
      const conv = listResponse.data.find(
        (c: ConversationSummary) => c.id === conversationId,
      );
      expect(conv.lastMessagePreview).toBe(content.substring(0, 50));
    });
  });

  describe("Timestamp Integrity", () => {
    it("should update updatedAt on message addition", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Timestamp Test",
      });
      const conversationId = createResponse.data.id;
      const originalUpdatedAt = createResponse.data.updatedAt;

      // Step 2: 少し待ってからメッセージを追加
      await new Promise((resolve) => setTimeout(resolve, 100));
      await invoke("conversation:addMessage", {
        sessionId: conversationId,
        message: {
          role: "user",
          content: "New message",
        },
      });

      // Step 3: updatedAtが更新されている
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(new Date(getResponse.data.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime(),
      );
    });
  });

  describe("Concurrent Access Integrity", () => {
    it("should handle concurrent message additions correctly", async () => {
      // Step 1: 会話を作成
      const createResponse = await invoke("conversation:create", {
        userId: "local-user",
        title: "Concurrent Test",
      });
      const conversationId = createResponse.data.id;

      // Step 2: 5つのメッセージを並行追加
      const promises = Array.from({ length: 5 }, (_, i) =>
        invoke("conversation:addMessage", {
          sessionId: conversationId,
          message: {
            role: "user",
            content: `Concurrent message ${i}`,
          },
        }),
      );
      await Promise.all(promises);

      // Step 3: 全メッセージが保存され、indexがユニーク
      const getResponse = await invoke("conversation:get", {
        id: conversationId,
      });
      expect(getResponse.data.messages).toHaveLength(5);
      const indices = new Set(
        getResponse.data.messages.map((m: Message) => m.messageIndex),
      );
      expect(indices.size).toBe(5);
    });
  });
});
```

---

## 5. 永続化テスト（conversation.persistence.test.ts）

### 目的

会話作成→DB再接続→会話復元の永続性を検証。

### テストシナリオ

```typescript
// apps/desktop/src/main/__tests__/conversation.persistence.test.ts

describe("Conversation Persistence Tests", () => {
  describe("Data Persistence", () => {
    it("should persist conversation across repository instances", async () => {
      // Step 1: 最初のRepositoryインスタンスで会話を作成
      const firstRepo = new ConversationRepository(db);
      const created = firstRepo.createConversation({
        userId: "local-user",
        title: "Persistence Test",
      });

      // Step 2: メッセージを追加
      firstRepo.addMessage(created.id, {
        role: "user",
        content: "Hello!",
      });
      firstRepo.addMessage(created.id, {
        role: "assistant",
        content: "Hi there!",
      });

      // Step 3: 新しいRepositoryインスタンスを作成
      const secondRepo = new ConversationRepository(db);

      // Step 4: 会話とメッセージが復元される
      const restored = secondRepo.getConversation(created.id);
      expect(restored).not.toBeNull();
      expect(restored!.title).toBe("Persistence Test");
      expect(restored!.messages).toHaveLength(2);
      expect(restored!.messages[0].content).toBe("Hello!");
      expect(restored!.messages[1].content).toBe("Hi there!");
    });

    it("should persist soft deleted state", async () => {
      // Step 1: 会話を作成して削除
      const repo1 = new ConversationRepository(db);
      const created = repo1.createConversation({
        userId: "local-user",
        title: "Delete Test",
      });
      repo1.deleteConversation(created.id);

      // Step 2: 新しいRepositoryインスタンス
      const repo2 = new ConversationRepository(db);

      // Step 3: 削除状態が保持されている
      const restored = repo2.getConversation(created.id);
      expect(restored).toBeNull();

      // Step 4: 一覧にも表示されない
      const list = repo2.listConversations("local-user");
      const found = list.find((c) => c.id === created.id);
      expect(found).toBeUndefined();
    });
  });

  describe("Full State Persistence", () => {
    it("should persist all conversation metadata", async () => {
      // Step 1: 会話を作成して全メタデータを設定
      const repo1 = new ConversationRepository(db);
      const created = repo1.createConversation({
        userId: "local-user",
        title: "Full Metadata Test",
      });
      repo1.updateConversation(created.id, {
        isFavorite: true,
        isPinned: true,
        pinOrder: 1,
      });

      // Step 2: 新しいRepositoryインスタンス
      const repo2 = new ConversationRepository(db);

      // Step 3: 全メタデータが保持されている
      const restored = repo2.getConversation(created.id);
      expect(restored!.isFavorite).toBe(true);
      expect(restored!.isPinned).toBe(true);
      expect(restored!.pinOrder).toBe(1);
    });

    it("should persist LLM metadata in messages", async () => {
      // Step 1: 会話とLLMメタデータ付きメッセージを作成
      const repo1 = new ConversationRepository(db);
      const created = repo1.createConversation({
        userId: "local-user",
        title: "LLM Metadata Test",
      });
      repo1.addMessage(created.id, {
        role: "assistant",
        content: "AI response",
        llmProvider: "openai",
        llmModel: "gpt-4",
        llmMetadata: {
          tokensUsed: 150,
          finishReason: "stop",
        },
        systemPrompt: "You are a helpful assistant",
      });

      // Step 2: 新しいRepositoryインスタンス
      const repo2 = new ConversationRepository(db);

      // Step 3: LLMメタデータが保持されている
      const restored = repo2.getConversation(created.id);
      const message = restored!.messages[0];
      expect(message.llmProvider).toBe("openai");
      expect(message.llmModel).toBe("gpt-4");
      expect(message.llmMetadata).toEqual({
        tokensUsed: 150,
        finishReason: "stop",
      });
      expect(message.systemPrompt).toBe("You are a helpful assistant");
    });
  });
});
```

---

## テスト実行手順

### 1. 統合テスト実行

```bash
# 全統合テスト実行
pnpm --filter @repo/desktop test conversation

# 特定カテゴリのみ
pnpm --filter @repo/desktop test conversation.ipc
pnpm --filter @repo/desktop test conversation.flow
pnpm --filter @repo/desktop test conversation.error
pnpm --filter @repo/desktop test conversation.integrity
pnpm --filter @repo/desktop test conversation.persistence
```

### 2. カバレッジ確認

```bash
pnpm --filter @repo/desktop test:coverage -- --testPathPattern="conversation"
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-24 | 初版作成 |
