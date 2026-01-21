import { describe, it, expect } from "vitest";
import { ChatSessionId } from "../ChatSessionId.js";

describe("ChatSessionId", () => {
  describe("create", () => {
    it("有効なUUIDで作成できる", () => {
      // Arrange
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";

      // Act
      const result = ChatSessionId.create(validUuid);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(validUuid);
      }
    });

    it("無効な形式でエラーを返す", () => {
      // Arrange
      const invalidUuid = "not-a-valid-uuid";

      // Act
      const result = ChatSessionId.create(invalidUuid);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
      }
    });

    it("空文字でエラーを返す", () => {
      // Arrange
      const emptyId = "";

      // Act
      const result = ChatSessionId.create(emptyId);

      // Assert
      expect(result.ok).toBe(false);
    });
  });

  describe("generate", () => {
    it("新しいUUIDを生成できる", () => {
      // Act
      const id = ChatSessionId.generate();

      // Assert
      expect(id.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it("生成されたIDはユニークである", () => {
      // Act
      const id1 = ChatSessionId.generate();
      const id2 = ChatSessionId.generate();

      // Assert
      expect(id1.value).not.toBe(id2.value);
    });
  });

  describe("equals", () => {
    it("同じ値のIDは等価である", () => {
      // Arrange
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const id1 = ChatSessionId.create(uuid);
      const id2 = ChatSessionId.create(uuid);

      // Assert
      expect(id1.ok && id2.ok && id1.value.equals(id2.value)).toBe(true);
    });

    it("異なる値のIDは等価ではない", () => {
      // Arrange
      const uuid1 = "550e8400-e29b-41d4-a716-446655440000";
      const uuid2 = "550e8400-e29b-41d4-a716-446655440001";
      const id1 = ChatSessionId.create(uuid1);
      const id2 = ChatSessionId.create(uuid2);

      // Assert
      expect(id1.ok && id2.ok && id1.value.equals(id2.value)).toBe(false);
    });
  });
});
