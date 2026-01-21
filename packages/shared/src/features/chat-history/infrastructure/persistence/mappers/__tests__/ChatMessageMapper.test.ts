import { describe, it, expect } from "vitest";
import {
  ChatMessageMapper,
  type ChatMessageRecord,
} from "../ChatMessageMapper.js";
import { ChatMessage } from "../../../../domain/entities/ChatMessage.js";

describe("ChatMessageMapper", () => {
  describe("toDomain", () => {
    it("DBレコードからドメインエンティティに変換できる（ユーザーメッセージ）", () => {
      // Arrange
      const dbRecord: ChatMessageRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        role: "user",
        content: "こんにちは",
        messageIndex: 0,
        llmModel: null,
        llmProvider: null,
        llmMetadata: null,
        timestamp: "2024-01-18T00:00:00.000Z",
      };

      // Act
      const result = ChatMessageMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id.value).toBe(dbRecord.id);
        expect(result.value.sessionId.value).toBe(dbRecord.sessionId);
        expect(result.value.role.value).toBe("user");
        expect(result.value.content.value).toBe(dbRecord.content);
        expect(result.value.messageIndex).toBe(0);
        expect(result.value.llmMetadata).toBeNull();
      }
    });

    it("LLMメタデータがJSONパースされる", () => {
      // Arrange
      const dbRecord: ChatMessageRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        role: "assistant",
        content: "お手伝いします",
        messageIndex: 1,
        llmModel: "gpt-4o",
        llmProvider: "openai",
        llmMetadata: JSON.stringify({
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
          responseTime: 500,
        }),
        timestamp: "2024-01-18T00:00:00.000Z",
      };

      // Act
      const result = ChatMessageMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.llmMetadata).not.toBeNull();
        expect(result.value.llmMetadata?.provider).toBe("openai");
        expect(result.value.llmMetadata?.model).toBe("gpt-4o");
        expect(result.value.llmMetadata?.tokenUsage?.inputTokens).toBe(100);
        expect(result.value.llmMetadata?.tokenUsage?.outputTokens).toBe(50);
        expect(result.value.llmMetadata?.tokenUsage?.totalTokens).toBe(150);
        expect(result.value.llmMetadata?.responseTime).toBe(500);
      }
    });

    it("nullのLLMメタデータはnullのまま保持される", () => {
      // Arrange
      const dbRecord: ChatMessageRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        role: "user",
        content: "こんにちは",
        messageIndex: 0,
        llmModel: null,
        llmProvider: null,
        llmMetadata: null,
        timestamp: "2024-01-18T00:00:00.000Z",
      };

      // Act
      const result = ChatMessageMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.llmMetadata).toBeNull();
      }
    });

    it("日付が正しく変換される", () => {
      // Arrange
      const isoString = "2024-01-18T00:00:00.000Z";
      const dbRecord: ChatMessageRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        role: "user",
        content: "こんにちは",
        messageIndex: 0,
        llmModel: null,
        llmProvider: null,
        llmMetadata: null,
        timestamp: isoString,
      };

      // Act
      const result = ChatMessageMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.createdAt.toISOString()).toBe(isoString);
      }
    });

    it("不正なJSONのLLMメタデータはnullとして処理される", () => {
      // Arrange
      const dbRecord: ChatMessageRecord = {
        id: "550e8400-e29b-41d4-a716-446655440001",
        sessionId: "550e8400-e29b-41d4-a716-446655440000",
        role: "assistant",
        content: "お手伝いします",
        messageIndex: 1,
        llmModel: "gpt-4o",
        llmProvider: "openai",
        llmMetadata: "invalid json", // 不正なJSON
        timestamp: "2024-01-18T00:00:00.000Z",
      };

      // Act
      const result = ChatMessageMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        // 不正なJSONの場合、パースに失敗してllmMetadataがnullになる
        // ChatMessage.reconstituteはllmMetadataがnullだとLLMMetadataを作成しないため
        // 結果的にllmMetadataはnullになる
        expect(result.value.llmMetadata).toBeNull();
      }
    });
  });

  describe("toPersistence", () => {
    it("ドメインエンティティからDBレコードに変換できる（ユーザーメッセージ）", () => {
      // Arrange
      const message = createTestUserMessage();

      // Act
      const record = ChatMessageMapper.toPersistence(message);

      // Assert
      expect(record.id).toBe(message.id.value);
      expect(record.sessionId).toBe(message.sessionId.value);
      expect(record.role).toBe(message.role.value);
      expect(record.content).toBe(message.content.value);
      expect(record.messageIndex).toBe(message.messageIndex);
      expect(record.llmMetadata).toBeNull();
      expect(record.llmModel).toBeNull();
      expect(record.llmProvider).toBeNull();
    });

    it("LLMメタデータがJSON文字列化される", () => {
      // Arrange
      const message = createTestAssistantMessage();

      // Act
      const record = ChatMessageMapper.toPersistence(message);

      // Assert
      expect(record.llmProvider).toBe("openai");
      expect(record.llmModel).toBe("gpt-4o");
      expect(typeof record.llmMetadata).toBe("string");

      const parsed = JSON.parse(record.llmMetadata!);
      expect(parsed.inputTokens).toBe(100);
      expect(parsed.outputTokens).toBe(50);
      expect(parsed.totalTokens).toBe(150);
      expect(parsed.responseTime).toBe(500);
    });

    it("nullのLLMメタデータはnullのまま保持される", () => {
      // Arrange
      const message = createTestUserMessage();

      // Act
      const record = ChatMessageMapper.toPersistence(message);

      // Assert
      expect(record.llmMetadata).toBeNull();
    });

    it("日付がISO文字列に変換される", () => {
      // Arrange
      const message = createTestUserMessage();

      // Act
      const record = ChatMessageMapper.toPersistence(message);

      // Assert
      expect(record.timestamp).toBe(message.createdAt.toISOString());
    });
  });

  describe("toDTO", () => {
    it("ドメインエンティティからDTOに変換できる（ユーザーメッセージ）", () => {
      // Arrange
      const message = createTestUserMessage();

      // Act
      const dto = ChatMessageMapper.toDTO(message);

      // Assert
      expect(dto.id).toBe(message.id.value);
      expect(dto.sessionId).toBe(message.sessionId.value);
      expect(dto.role).toBe(message.role.value);
      expect(dto.content).toBe(message.content.value);
      expect(dto.messageIndex).toBe(message.messageIndex);
      expect(dto.llmMetadata).toBeNull();
      expect(typeof dto.createdAt).toBe("string"); // ISO文字列
    });

    it("アシスタントメッセージのDTOにLLM情報が含まれる", () => {
      // Arrange
      const message = createTestAssistantMessage();

      // Act
      const dto = ChatMessageMapper.toDTO(message);

      // Assert
      expect(dto.llmMetadata).not.toBeNull();
      expect(dto.llmMetadata?.provider).toBe("openai");
      expect(dto.llmMetadata?.model).toBe("gpt-4o");
      expect(dto.llmMetadata?.tokenUsage?.inputTokens).toBe(100);
      expect(dto.llmMetadata?.tokenUsage?.outputTokens).toBe(50);
      expect(dto.llmMetadata?.tokenUsage?.totalTokens).toBe(150);
      expect(dto.llmMetadata?.responseTime).toBe(500);
    });

    it("日付がISO文字列に変換される", () => {
      // Arrange
      const message = createTestUserMessage();

      // Act
      const dto = ChatMessageMapper.toDTO(message);

      // Assert
      expect(dto.createdAt).toBe(message.createdAt.toISOString());
    });
  });
});

function createTestUserMessage(): ChatMessage {
  const result = ChatMessage.createUserMessage({
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    content: "こんにちは",
    messageIndex: 0,
  });
  if (!result.ok) throw new Error("Failed to create test message");
  return result.value;
}

function createTestAssistantMessage(): ChatMessage {
  const result = ChatMessage.createAssistantMessage({
    sessionId: "550e8400-e29b-41d4-a716-446655440000",
    content: "お手伝いします",
    messageIndex: 1,
    llmProvider: "openai",
    llmModel: "gpt-4o",
    llmMetadata: {
      tokenUsage: {
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
      },
      responseTime: 500,
    },
  });
  if (!result.ok) throw new Error("Failed to create test message");
  return result.value;
}
