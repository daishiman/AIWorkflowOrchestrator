import { describe, it, expect } from "vitest";
import { MessageContent } from "../MessageContent.js";

describe("MessageContent", () => {
  describe("create", () => {
    it("有効なコンテンツで作成できる", () => {
      // Arrange
      const validContent = "これは有効なメッセージコンテンツです。";

      // Act
      const result = MessageContent.create(validContent);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(validContent);
      }
    });

    it("空文字でエラーを返す", () => {
      // Arrange
      const emptyContent = "";

      // Act
      const result = MessageContent.create(emptyContent);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_CONTENT");
      }
    });

    it("50000文字超でエラーを返す", () => {
      // Arrange
      const longContent = "あ".repeat(50001);

      // Act
      const result = MessageContent.create(longContent);

      // Assert
      expect(result.ok).toBe(false);
    });

    it("50000文字でちょうど作成できる（境界値）", () => {
      // Arrange
      const maxContent = "あ".repeat(50000);

      // Act
      const result = MessageContent.create(maxContent);

      // Assert
      expect(result.ok).toBe(true);
    });

    it("空白のみのコンテンツは許可される（値はそのまま保持）", () => {
      // Arrange
      const whitespaceOnly = "   \n\t  ";

      // Act
      const result = MessageContent.create(whitespaceOnly);

      // Assert
      // MessageContentはトリミングしないので空白のみでも作成可能
      expect(result.ok).toBe(true);
    });

    it("1文字で作成できる（境界値：最小値）", () => {
      // Arrange
      const minContent = "a";

      // Act
      const result = MessageContent.create(minContent);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(minContent);
        expect(result.value.length).toBe(1);
      }
    });
  });

  describe("preview", () => {
    it("100文字以下はそのまま返す", () => {
      // Arrange
      const shortContent = "これは短いメッセージ";
      const result = MessageContent.create(shortContent);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.preview).toBe(shortContent);
      }
    });

    it("100文字超は省略される", () => {
      // Arrange
      const longContent = "あ".repeat(150);
      const result = MessageContent.create(longContent);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.preview.length).toBeLessThanOrEqual(100);
        expect(result.value.preview).toContain("...");
      }
    });

    it("ちょうど100文字はそのまま返す（境界値）", () => {
      // Arrange
      const exactContent = "あ".repeat(100);
      const result = MessageContent.create(exactContent);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.preview).toBe(exactContent);
        expect(result.value.preview.length).toBe(100);
      }
    });

    it("101文字でプレビューが切り詰められる（境界値超過）", () => {
      // Arrange
      const content101 = "あ".repeat(101);
      const result = MessageContent.create(content101);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.preview.length).toBeLessThanOrEqual(100);
        expect(result.value.preview).toContain("...");
      }
    });
  });

  describe("length", () => {
    it("文字数を取得できる", () => {
      // Arrange
      const content = "12345";
      const result = MessageContent.create(content);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(5);
      }
    });
  });

  describe("equals", () => {
    it("同じ値のコンテンツは等価である", () => {
      // Arrange
      const contentStr = "テストコンテンツ";
      const content1 = MessageContent.create(contentStr);
      const content2 = MessageContent.create(contentStr);

      // Assert
      expect(
        content1.ok && content2.ok && content1.value.equals(content2.value),
      ).toBe(true);
    });
  });
});
