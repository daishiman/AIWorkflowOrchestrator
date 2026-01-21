import { describe, it, expect } from "vitest";
import { ChatSessionTitle } from "../ChatSessionTitle.js";

describe("ChatSessionTitle", () => {
  describe("create", () => {
    it("有効なタイトルで作成できる", () => {
      // Arrange
      const validTitle = "テストセッション";

      // Act
      const result = ChatSessionTitle.create(validTitle);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe(validTitle);
      }
    });

    it("空文字でエラーを返す", () => {
      // Arrange
      const emptyTitle = "";

      // Act
      const result = ChatSessionTitle.create(emptyTitle);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_TITLE");
      }
    });

    it("100文字超でエラーを返す", () => {
      // Arrange
      const longTitle = "あ".repeat(101);

      // Act
      const result = ChatSessionTitle.create(longTitle);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_TITLE");
      }
    });

    it("1文字で作成できる（境界値）", () => {
      // Arrange
      const minTitle = "a";

      // Act
      const result = ChatSessionTitle.create(minTitle);

      // Assert
      expect(result.ok).toBe(true);
    });

    it("100文字でちょうど作成できる（境界値）", () => {
      // Arrange
      const maxTitle = "あ".repeat(100);

      // Act
      const result = ChatSessionTitle.create(maxTitle);

      // Assert
      expect(result.ok).toBe(true);
    });

    it("前後の空白がトリミングされる", () => {
      // Arrange
      const titleWithSpaces = "  テストセッション  ";

      // Act
      const result = ChatSessionTitle.create(titleWithSpaces);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.value).toBe("テストセッション");
      }
    });
  });

  describe("createDefault", () => {
    it("デフォルトタイトルを作成する", () => {
      // Act
      const title = ChatSessionTitle.createDefault();

      // Assert
      expect(title.value).toMatch(
        /^新しいチャット \d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
      );
    });
  });

  describe("equals", () => {
    it("同じ値のタイトルは等価である", () => {
      // Arrange
      const titleStr = "テストタイトル";
      const title1 = ChatSessionTitle.create(titleStr);
      const title2 = ChatSessionTitle.create(titleStr);

      // Assert
      expect(title1.ok && title2.ok && title1.value.equals(title2.value)).toBe(
        true,
      );
    });
  });
});
