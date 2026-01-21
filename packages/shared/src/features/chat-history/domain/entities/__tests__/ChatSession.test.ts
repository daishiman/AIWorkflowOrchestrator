import { describe, it, expect } from "vitest";
import { ChatSession } from "../ChatSession.js";

describe("ChatSession", () => {
  describe("create", () => {
    it("有効なパラメータでセッションを作成できる", () => {
      // Arrange
      const userId = "user-123";
      const title = "テストセッション";

      // Act
      const result = ChatSession.create({ userId, title });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.userId.value).toBe(userId);
        expect(result.value.title.value).toBe(title);
        expect(result.value.isFavorite).toBe(false);
        expect(result.value.isPinned).toBe(false);
      }
    });

    it("タイトル未指定時はデフォルトタイトルが設定される", () => {
      // Arrange
      const userId = "user-123";

      // Act
      const result = ChatSession.create({ userId });

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.title.value).toMatch(/^新しいチャット/);
      }
    });

    it("無効なユーザーIDでエラーを返す", () => {
      // Arrange
      const userId = "";
      const title = "テストセッション";

      // Act
      const result = ChatSession.create({ userId, title });

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_USER_ID");
      }
    });
  });

  describe("updateTitle", () => {
    it("有効なタイトルで更新できる", () => {
      // Arrange
      const session = createTestSession();
      const newTitle = "更新後のタイトル";

      // Act
      const result = session.updateTitle(newTitle);

      // Assert
      expect(result.ok).toBe(true);
      expect(session.title.value).toBe(newTitle);
    });

    it("無効なタイトルでエラーを返す", () => {
      // Arrange
      const session = createTestSession();
      const invalidTitle = ""; // 空文字

      // Act
      const result = session.updateTitle(invalidTitle);

      // Assert
      expect(result.ok).toBe(false);
    });

    it("更新後にupdatedAtが更新される", async () => {
      // Arrange
      const session = createTestSession();
      const originalUpdatedAt = session.updatedAt;

      // Act
      await new Promise((resolve) => setTimeout(resolve, 10));
      session.updateTitle("新しいタイトル");

      // Assert
      expect(session.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe("toggleFavorite", () => {
    it("お気に入り状態を切り替えられる", () => {
      // Arrange
      const session = createTestSession(); // isFavorite = false

      // Act
      const newState = session.toggleFavorite();

      // Assert
      expect(newState).toBe(true);
      expect(session.isFavorite).toBe(true);

      // 再度トグル
      const newState2 = session.toggleFavorite();
      expect(newState2).toBe(false);
      expect(session.isFavorite).toBe(false);
    });
  });

  describe("togglePinned", () => {
    it("ピン留め状態を切り替えられる", () => {
      // Arrange
      const session = createTestSession(); // isPinned = false

      // Act
      const newState = session.togglePinned();

      // Assert
      expect(newState).toBe(true);
      expect(session.isPinned).toBe(true);

      // 再度トグル
      const newState2 = session.togglePinned();
      expect(newState2).toBe(false);
      expect(session.isPinned).toBe(false);
    });

    // Note: ピン留め数上限（BR-SESSION-002）はUse Case層で検証
  });

  describe("updatePreview", () => {
    it("プレビューを更新できる", () => {
      // Arrange
      const session = createTestSession();
      const newPreview = "これはプレビューです";

      // Act
      session.updatePreview(newPreview);

      // Assert
      expect(session.lastMessagePreview).toBe(newPreview);
    });

    it("100文字を超える場合は切り詰められる", () => {
      // Arrange
      const session = createTestSession();
      const longContent = "あ".repeat(150);

      // Act
      session.updatePreview(longContent);

      // Assert
      expect(session.lastMessagePreview!.length).toBeLessThanOrEqual(100);
      expect(session.lastMessagePreview).toContain("...");
    });
  });

  describe("incrementMessageCount", () => {
    it("メッセージカウントをインクリメントできる", () => {
      // Arrange
      const session = createTestSession();
      expect(session.messageCount).toBe(0);

      // Act
      session.incrementMessageCount();

      // Assert
      expect(session.messageCount).toBe(1);
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
