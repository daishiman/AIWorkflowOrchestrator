/**
 * SubscriptionAuthProvider テスト
 *
 * Phase 5: TDD Green - サブスクリプション認証プロバイダーのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/subscription-auth-provider-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SubscriptionAuthProvider } from "../SubscriptionAuthProvider";

// =============================================================================
// 定数定義
// =============================================================================

const KEYCHAIN_SERVICE_NAME = "Claude Code-credentials";

// =============================================================================
// モック定義
// =============================================================================

/**
 * Keychain (keytar) アクセスモック
 */
const mockKeychainAccess = {
  getPassword: vi.fn(),
  setPassword: vi.fn(),
  deletePassword: vi.fn(),
};

// =============================================================================
// テストスイート
// =============================================================================

describe("SubscriptionAuthProvider", () => {
  // 環境変数のバックアップ
  const originalEnv = process.env;
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
    // 環境変数をクリア
    process.env = { ...originalEnv };
    delete process.env.CLAUDE_CODE_OAUTH_TOKEN;

    // macOS プラットフォームをモック
    Object.defineProperty(process, "platform", {
      value: "darwin",
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
    });
  });

  // ===========================================================================
  // getToken テスト
  // ===========================================================================
  describe("getToken", () => {
    it("Keychainからトークンを取得する", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
        refreshToken: "sk-ant-ort01-refresh-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledWith(
        KEYCHAIN_SERVICE_NAME,
        expect.any(String),
      );
    });

    it("キャッシュがある場合はキャッシュを返す", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 1回目の取得（Keychainから）
      await provider.getToken();
      // 2回目の取得（キャッシュから）
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(1);
    });

    it("キャッシュ期限切れの場合はKeychainから再取得する", async () => {
      // Arrange
      vi.useFakeTimers();
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 1回目の取得
      await provider.getToken();
      // キャッシュTTLを超過（5分 + 1秒）
      vi.advanceTimersByTime(5 * 60 * 1000 + 1000);
      // 2回目の取得（キャッシュ期限切れなので再取得）
      await provider.getToken();

      // Assert
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(2);

      vi.useRealTimers();
    });

    it("トークンが存在しない場合はnullを返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("環境変数にトークンがある場合はそれを返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);
      process.env.CLAUDE_CODE_OAUTH_TOKEN = "sk-ant-oat01-env-token";

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-env-token");
    });

    it("非macOSプラットフォームではnullを返す", async () => {
      // Arrange
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
      expect(mockKeychainAccess.getPassword).not.toHaveBeenCalled();
    });

    it("Keychainアクセスエラー時はnullを返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockRejectedValue(
        new Error("Keychain access denied"),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("無効なJSON形式の場合でも直接トークンとして解釈する", async () => {
      // Arrange: JSON形式ではなく直接トークンが保存されている場合
      mockKeychainAccess.getPassword.mockResolvedValue(
        "sk-ant-oat01-direct-token",
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-direct-token");
    });
  });

  // ===========================================================================
  // hasToken テスト
  // ===========================================================================
  describe("hasToken", () => {
    it("トークンが存在する場合はtrueを返す", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const hasToken = await provider.hasToken();

      // Assert
      expect(hasToken).toBe(true);
    });

    it("トークンが存在しない場合はfalseを返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const hasToken = await provider.hasToken();

      // Assert
      expect(hasToken).toBe(false);
    });
  });

  // ===========================================================================
  // validateToken テスト
  // ===========================================================================
  describe("validateToken", () => {
    it("有効なトークンならtrueを返す", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-valid-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(true);
    });

    it("トークンが存在しない場合はfalseを返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(false);
    });

    it("無効なフォーマットのトークンはfalseを返す", async () => {
      // Arrange: 無効なプレフィックスのトークン
      mockKeychainAccess.getPassword.mockResolvedValue("invalid-token-format");

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(false);
    });

    it("短すぎるトークンはfalseを返す", async () => {
      // Arrange: 最小長未満のトークン
      mockKeychainAccess.getPassword.mockResolvedValue("sk-ant-oat01-x");

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(false);
    });
  });

  // ===========================================================================
  // clearCache テスト
  // ===========================================================================
  describe("clearCache", () => {
    it("キャッシュをクリアできる", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // 1回目の取得（Keychainから）
      await provider.getToken();

      // Act
      provider.clearCache();
      // 2回目の取得（キャッシュクリア後なのでKeychainから）
      await provider.getToken();

      // Assert
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // トークンデータパース テスト
  // ===========================================================================
  describe("parseTokenData", () => {
    it("有効なJSONからaccessTokenを抽出する", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-test-token",
        refreshToken: "sk-ant-ort01-refresh-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-test-token");
    });

    it("accessTokenがないJSONの場合はnullを返す", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        refreshToken: "sk-ant-ort01-refresh-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });
  });

  // ===========================================================================
  // トークンフォーマット検証 テスト
  // ===========================================================================
  describe("isValidTokenFormat", () => {
    it("OAuth Access Token プレフィックスを持つトークンは有効", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(
        "sk-ant-oat01-valid-token-with-sufficient-length",
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(true);
    });

    it("API Key プレフィックスを持つトークンも有効", async () => {
      // Arrange: sk-ant-api で始まるキーもOK（互換性のため）
      mockKeychainAccess.getPassword.mockResolvedValue(
        "sk-ant-api03-valid-key-with-sufficient-length",
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(true);
    });

    it("空文字列は無効", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue("");

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(false);
    });
  });

  // ===========================================================================
  // 統合テスト
  // ===========================================================================
  describe("Integration", () => {
    it("完全なフロー: Keychainから取得 -> キャッシュ -> キャッシュクリア -> 再取得", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-integration-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act & Assert
      // Step 1: 初回取得（Keychainから）
      const token1 = await provider.getToken();
      expect(token1).toBe("sk-ant-oat01-integration-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(1);

      // Step 2: 2回目取得（キャッシュから）
      const token2 = await provider.getToken();
      expect(token2).toBe("sk-ant-oat01-integration-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(1); // 増えない

      // Step 3: キャッシュクリア
      provider.clearCache();

      // Step 4: 3回目取得（Keychainから再取得）
      const token3 = await provider.getToken();
      expect(token3).toBe("sk-ant-oat01-integration-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(2);
    });
  });
});
