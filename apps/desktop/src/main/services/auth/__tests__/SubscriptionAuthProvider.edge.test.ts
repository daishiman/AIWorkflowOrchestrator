/**
 * SubscriptionAuthProvider エッジケーステスト
 *
 * Phase 6: テスト拡充 - キャッシュ境界値・競合状態・異常系のテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-6-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SubscriptionAuthProvider } from "../SubscriptionAuthProvider";

// =============================================================================
// 定数定義
// =============================================================================

const KEYCHAIN_SERVICE_NAME = "Claude Code-credentials";
// キャッシュTTL: 5分（ミリ秒）
const TOKEN_CACHE_TTL_MS = 5 * 60 * 1000;

// =============================================================================
// モック定義
// =============================================================================

const mockKeychainAccess = {
  getPassword: vi.fn(),
  setPassword: vi.fn(),
  deletePassword: vi.fn(),
};

// =============================================================================
// テストスイート
// =============================================================================

describe("SubscriptionAuthProvider エッジケース", () => {
  const originalEnv = process.env;
  const originalPlatform = process.platform;

  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.useRealTimers();
    process.env = originalEnv;
    Object.defineProperty(process, "platform", {
      value: originalPlatform,
      writable: true,
    });
  });

  // ===========================================================================
  // キャッシュ境界値テスト
  // ===========================================================================
  describe("キャッシュ有効期限境界", () => {
    it("キャッシュTTL直前はキャッシュから返される", async () => {
      // Arrange
      vi.useFakeTimers();
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-boundary-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 1回目の取得
      await provider.getToken();

      // TTL - 1ms 進める（ギリギリ有効）
      vi.advanceTimersByTime(TOKEN_CACHE_TTL_MS - 1);

      // 2回目の取得
      const token = await provider.getToken();

      // Assert: キャッシュから返されるため、Keychainへのアクセスは1回のみ
      expect(token).toBe("sk-ant-oat01-boundary-test-token");
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(1);
    });

    it("キャッシュTTLちょうどで期限切れ", async () => {
      // Arrange
      vi.useFakeTimers();
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-boundary-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 1回目の取得
      await provider.getToken();

      // TTL ちょうど進める（期限切れ）
      vi.advanceTimersByTime(TOKEN_CACHE_TTL_MS);

      // 2回目の取得
      await provider.getToken();

      // Assert: キャッシュが期限切れなので再取得
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(2);
    });

    it("キャッシュTTL+1msで確実に期限切れ", async () => {
      // Arrange
      vi.useFakeTimers();
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-boundary-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 1回目の取得
      await provider.getToken();

      // TTL + 1ms 進める（確実に期限切れ）
      vi.advanceTimersByTime(TOKEN_CACHE_TTL_MS + 1);

      // 2回目の取得
      await provider.getToken();

      // Assert: 期限切れなので再取得
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // トークン長境界テスト
  // ===========================================================================
  describe("トークン長境界", () => {
    it("最小長トークンは有効", async () => {
      // Arrange: 最小長 20 文字のトークン
      const minLengthToken = "sk-ant-oat01-abcdefg"; // 21文字
      mockKeychainAccess.getPassword.mockResolvedValue(minLengthToken);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(true);
    });

    it("最小長未満のトークンは無効", async () => {
      // Arrange: 最小長 20 文字未満のトークン
      const shortToken = "sk-ant-oat01-abc"; // 17文字
      mockKeychainAccess.getPassword.mockResolvedValue(shortToken);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const isValid = await provider.validateToken();

      // Assert
      expect(isValid).toBe(false);
    });

    it("最大長を超えるトークンは無効", async () => {
      // Arrange: 500文字を超えるトークン
      const longToken = "sk-ant-oat01-" + "a".repeat(500);
      mockKeychainAccess.getPassword.mockResolvedValue(longToken);

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
  // 同時リクエスト競合状態テスト
  // ===========================================================================
  describe("同時リクエスト競合状態", () => {
    it("同時に複数のgetTokenを呼び出してもエラーにならない", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-concurrent-test-token",
      });
      // 少し遅延を入れて競合状態をシミュレート
      mockKeychainAccess.getPassword.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve(tokenData), 10)),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act: 10個の同時リクエスト
      const promises = Array.from({ length: 10 }, () => provider.getToken());

      // Assert: すべて同じ値が返る
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach((token) => {
        expect(token).toBe("sk-ant-oat01-concurrent-test-token");
      });
    });

    it("キャッシュクリアと同時取得の競合でもエラーにならない", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-concurrent-clear-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // 初回キャッシュ作成
      await provider.getToken();

      // Act: キャッシュクリアと同時取得
      const operations = [
        provider.getToken(),
        Promise.resolve().then(() => provider.clearCache()),
        provider.getToken(),
        provider.getToken(),
      ];

      // Assert: エラーなく完了
      await expect(Promise.all(operations)).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // 環境変数フォールバック境界
  // ===========================================================================
  describe("環境変数フォールバック", () => {
    it("Keychainが空で環境変数に有効なトークンがある場合", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);
      process.env.CLAUDE_CODE_OAUTH_TOKEN =
        "sk-ant-oat01-env-fallback-token-valid";

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBe("sk-ant-oat01-env-fallback-token-valid");
    });

    it("環境変数に無効な形式のトークンがある場合はnull", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);
      process.env.CLAUDE_CODE_OAUTH_TOKEN = "invalid-env-token";

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("環境変数に短すぎるトークンがある場合はnull", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(null);
      process.env.CLAUDE_CODE_OAUTH_TOKEN = "sk-ant-oat01-x"; // 短すぎる

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
  // プラットフォーム境界テスト
  // ===========================================================================
  describe("プラットフォーム境界", () => {
    it("Linux環境では環境変数のみが使用される", async () => {
      // Arrange
      Object.defineProperty(process, "platform", {
        value: "linux",
        writable: true,
      });
      process.env.CLAUDE_CODE_OAUTH_TOKEN =
        "sk-ant-oat01-linux-env-token-valid";

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert: Keychainはアクセスされない
      expect(mockKeychainAccess.getPassword).not.toHaveBeenCalled();
      expect(token).toBe("sk-ant-oat01-linux-env-token-valid");
    });

    it("Windows環境ではKeychainアクセスせず環境変数をチェック", async () => {
      // Arrange
      Object.defineProperty(process, "platform", {
        value: "win32",
        writable: true,
      });
      mockKeychainAccess.getPassword.mockResolvedValue(
        JSON.stringify({ accessToken: "sk-ant-oat01-should-not-be-used" }),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert: Keychainはアクセスされない
      expect(mockKeychainAccess.getPassword).not.toHaveBeenCalled();
      expect(token).toBeNull(); // 環境変数も設定されていないのでnull
    });
  });

  // ===========================================================================
  // Keychain異常系テスト
  // ===========================================================================
  describe("Keychain異常系", () => {
    it("Keychainタイムアウトでもエラーにならず null を返す", async () => {
      // Arrange: タイムアウトをシミュレート
      mockKeychainAccess.getPassword.mockRejectedValue(
        new Error("Operation timed out"),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("Keychain アクセス拒否でもエラーにならず null を返す", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockRejectedValue(
        new Error("User denied access to keychain"),
      );

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("Keychain が破損したJSONを返した場合も安全に処理", async () => {
      // Arrange: 不正なJSON
      mockKeychainAccess.getPassword.mockResolvedValue(
        '{"accessToken": "sk-ant-oat01-token',
      ); // JSONが壊れている

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert: 直接トークンとして解釈もできない形式なのでnull
      expect(token).toBeNull();
    });

    it("Keychain が空オブジェクトを返した場合は null", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue("{}");

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      const token = await provider.getToken();

      // Assert
      expect(token).toBeNull();
    });

    it("Keychain が accessToken に数値を返した場合は null", async () => {
      // Arrange
      mockKeychainAccess.getPassword.mockResolvedValue(
        JSON.stringify({ accessToken: 12345 }),
      );

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
  // clearCache 境界テスト
  // ===========================================================================
  describe("clearCache 境界", () => {
    it("キャッシュがない状態でclearCacheを呼んでもエラーにならない", () => {
      // Arrange
      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act & Assert: エラーなく完了
      expect(() => provider.clearCache()).not.toThrow();
    });

    it("連続してclearCacheを呼んでもエラーにならない", async () => {
      // Arrange
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-clear-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      await provider.getToken(); // キャッシュ作成

      // Act: 連続クリア
      provider.clearCache();
      provider.clearCache();
      provider.clearCache();

      // Assert: エラーなく完了
      expect(true).toBe(true);
    });
  });

  // ===========================================================================
  // アカウント名取得境界テスト
  // ===========================================================================
  describe("アカウント名取得", () => {
    it("USER環境変数がない場合はUSERNAMEを使用", async () => {
      // Arrange
      delete process.env.USER;
      process.env.USERNAME = "test-user";
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-username-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      await provider.getToken();

      // Assert
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledWith(
        KEYCHAIN_SERVICE_NAME,
        "test-user",
      );
    });

    it("USER/USERNAME両方ない場合はunknownを使用", async () => {
      // Arrange
      delete process.env.USER;
      delete process.env.USERNAME;
      const tokenData = JSON.stringify({
        accessToken: "sk-ant-oat01-unknown-test-token",
      });
      mockKeychainAccess.getPassword.mockResolvedValue(tokenData);

      const provider = new SubscriptionAuthProvider({
        keychainAccess: mockKeychainAccess,
      });

      // Act
      await provider.getToken();

      // Assert
      expect(mockKeychainAccess.getPassword).toHaveBeenCalledWith(
        KEYCHAIN_SERVICE_NAME,
        "unknown",
      );
    });
  });
});
