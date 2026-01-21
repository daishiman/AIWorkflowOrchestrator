import { describe, it, expect } from "vitest";
import { ChatMessage } from "../ChatMessage.js";

describe("ChatMessage", () => {
  const validSessionId = "550e8400-e29b-41d4-a716-446655440000";

  describe("createUserMessage", () => {
    it("ユーザーメッセージを作成できる", () => {
      // Arrange
      const content = "こんにちは、これはテストメッセージです。";
      const messageIndex = 0;

      // Act
      const result = ChatMessage.createUserMessage({
        sessionId: validSessionId,
        content,
        messageIndex,
      });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.sessionId.value).toBe(validSessionId);
        expect(result.value.content.value).toBe(content);
        expect(result.value.role.value).toBe("user");
        expect(result.value.messageIndex).toBe(messageIndex);
        expect(result.value.llmMetadata).toBeNull();
      }
    });

    it("空のコンテンツでエラーを返す", () => {
      // Arrange
      const content = "";
      const messageIndex = 0;

      // Act
      const result = ChatMessage.createUserMessage({
        sessionId: validSessionId,
        content,
        messageIndex,
      });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONTENT");
      }
    });

    it("無効なセッションIDでエラーを返す", () => {
      // Arrange
      const content = "テストメッセージ";
      const messageIndex = 0;

      // Act
      const result = ChatMessage.createUserMessage({
        sessionId: "invalid-id",
        content,
        messageIndex,
      });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_SESSION_ID");
      }
    });
  });

  describe("createAssistantMessage", () => {
    it("アシスタントメッセージを作成できる", () => {
      // Arrange
      const content = "こんにちは、お手伝いできることはありますか？";
      const messageIndex = 1;
      const llmModel = "gpt-4o";
      const llmProvider = "openai";

      // Act
      const result = ChatMessage.createAssistantMessage({
        sessionId: validSessionId,
        content,
        messageIndex,
        llmModel,
        llmProvider,
      });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.sessionId.value).toBe(validSessionId);
        expect(result.value.content.value).toBe(content);
        expect(result.value.role.value).toBe("assistant");
        expect(result.value.messageIndex).toBe(messageIndex);
        expect(result.value.llmMetadata).not.toBeNull();
        expect(result.value.llmMetadata?.model).toBe(llmModel);
        expect(result.value.llmMetadata?.provider).toBe(llmProvider);
      }
    });

    it("LLMメタデータを含めて作成できる", () => {
      // Arrange
      const content = "これはテスト応答です。";
      const messageIndex = 1;
      const llmModel = "gpt-4o";
      const llmProvider = "openai";
      const llmMetadata = {
        tokenUsage: {
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
        },
        responseTime: 1500,
      };

      // Act
      const result = ChatMessage.createAssistantMessage({
        sessionId: validSessionId,
        content,
        messageIndex,
        llmModel,
        llmProvider,
        llmMetadata,
      });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.llmMetadata).not.toBeNull();
        expect(result.value.llmMetadata?.tokenUsage?.inputTokens).toBe(100);
        expect(result.value.llmMetadata?.tokenUsage?.outputTokens).toBe(50);
        expect(result.value.llmMetadata?.tokenUsage?.totalTokens).toBe(150);
        expect(result.value.llmMetadata?.responseTime).toBe(1500);
      }
    });

    it("空のコンテンツでエラーを返す", () => {
      // Arrange
      const content = "";
      const messageIndex = 1;

      // Act
      const result = ChatMessage.createAssistantMessage({
        sessionId: validSessionId,
        content,
        messageIndex,
        llmModel: "gpt-4o",
        llmProvider: "openai",
      });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONTENT");
      }
    });
  });

  describe("properties", () => {
    it("isUserMessageがユーザーメッセージで正しく動作する", () => {
      // Arrange
      const result = ChatMessage.createUserMessage({
        sessionId: validSessionId,
        content: "テスト",
        messageIndex: 0,
      });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isUserMessage).toBe(true);
        expect(result.value.isAssistantMessage).toBe(false);
      }
    });

    it("isAssistantMessageがアシスタントメッセージで正しく動作する", () => {
      // Arrange
      const result = ChatMessage.createAssistantMessage({
        sessionId: validSessionId,
        content: "テスト",
        messageIndex: 1,
        llmModel: "gpt-4o",
        llmProvider: "openai",
      });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.isUserMessage).toBe(false);
        expect(result.value.isAssistantMessage).toBe(true);
      }
    });
  });
});
