import { describe, it, expect } from "vitest";
import {
  ChatSessionMapper,
  type ChatSessionRecord,
} from "../ChatSessionMapper.js";
import { ChatSession } from "../../../../domain/entities/ChatSession.js";

describe("ChatSessionMapper", () => {
  describe("toDomain", () => {
    it("DBレコードからドメインエンティティに変換できる", () => {
      // Arrange
      const dbRecord: ChatSessionRecord = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        title: "テストセッション",
        lastMessagePreview: "これはプレビュー",
        messageCount: 5,
        isFavorite: 0,
        isPinned: 1,
        createdAt: "2024-01-18T00:00:00.000Z", // ISO 8601 string
        updatedAt: "2024-01-18T00:00:00.000Z",
      };

      // Act
      const result = ChatSessionMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.id.value).toBe(dbRecord.id);
        expect(result.value.userId.value).toBe(dbRecord.userId);
        expect(result.value.title.value).toBe(dbRecord.title);
        expect(result.value.lastMessagePreview).toBe(
          dbRecord.lastMessagePreview,
        );
        expect(result.value.messageCount).toBe(dbRecord.messageCount);
        expect(result.value.isFavorite).toBe(false);
        expect(result.value.isPinned).toBe(true);
      }
    });

    it("日付が正しく変換される", () => {
      // Arrange
      const isoString = "2024-01-18T00:00:00.000Z";
      const dbRecord: ChatSessionRecord = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        userId: "user-123",
        title: "テストセッション",
        lastMessagePreview: null,
        messageCount: 0,
        isFavorite: 0,
        isPinned: 0,
        createdAt: isoString,
        updatedAt: isoString,
      };

      // Act
      const result = ChatSessionMapper.toDomain(dbRecord);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.createdAt.toISOString()).toBe(isoString);
        expect(result.value.updatedAt.toISOString()).toBe(isoString);
      }
    });
  });

  describe("toPersistence", () => {
    it("ドメインエンティティからDBレコードに変換できる", () => {
      // Arrange
      const session = createTestSession();

      // Act
      const record = ChatSessionMapper.toPersistence(session);

      // Assert
      expect(record.id).toBe(session.id.value);
      expect(record.userId).toBe(session.userId.value);
      expect(record.title).toBe(session.title.value);
      expect(record.messageCount).toBe(session.messageCount);
      expect(typeof record.createdAt).toBe("string");
      expect(typeof record.updatedAt).toBe("string");
    });

    it("boolean値がintegerに変換される", () => {
      // Arrange
      const session = createTestSession();
      session.toggleFavorite(); // isFavorite = true
      session.togglePinned(); // isPinned = true

      // Act
      const record = ChatSessionMapper.toPersistence(session);

      // Assert
      expect(record.isFavorite).toBe(1);
      expect(record.isPinned).toBe(1);
    });

    it("boolean false が 0 に変換される", () => {
      // Arrange
      const session = createTestSession();

      // Act
      const record = ChatSessionMapper.toPersistence(session);

      // Assert
      expect(record.isFavorite).toBe(0);
      expect(record.isPinned).toBe(0);
    });

    it("日付がISO文字列に変換される", () => {
      // Arrange
      const session = createTestSession();

      // Act
      const record = ChatSessionMapper.toPersistence(session);

      // Assert
      expect(record.createdAt).toBe(session.createdAt.toISOString());
      expect(record.updatedAt).toBe(session.updatedAt.toISOString());
    });
  });

  describe("toDTO", () => {
    it("ドメインエンティティからDTOに変換できる", () => {
      // Arrange
      const session = createTestSession();

      // Act
      const dto = ChatSessionMapper.toDTO(session);

      // Assert
      expect(dto.id).toBe(session.id.value);
      expect(dto.userId).toBe(session.userId.value);
      expect(dto.title).toBe(session.title.value);
      expect(dto.messageCount).toBe(session.messageCount);
      expect(dto.isFavorite).toBe(session.isFavorite);
      expect(dto.isPinned).toBe(session.isPinned);
      expect(typeof dto.createdAt).toBe("string"); // ISO文字列
      expect(typeof dto.updatedAt).toBe("string");
    });

    it("日付がISO文字列に変換される", () => {
      // Arrange
      const session = createTestSession();

      // Act
      const dto = ChatSessionMapper.toDTO(session);

      // Assert
      expect(dto.createdAt).toBe(session.createdAt.toISOString());
      expect(dto.updatedAt).toBe(session.updatedAt.toISOString());
    });
  });
});

function createTestSession(): ChatSession {
  const result = ChatSession.create({
    userId: "user-123",
    title: "テストセッション",
  });
  if (!result.ok) throw new Error("Failed to create test session");
  return result.value;
}
