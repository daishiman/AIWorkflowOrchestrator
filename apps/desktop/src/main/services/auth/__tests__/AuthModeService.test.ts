/**
 * AuthModeService テスト
 *
 * Phase 5: TDD Green - 認証方式管理サービスのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/auth-mode-service-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthModeService } from "../AuthModeService";
import type { AuthMode } from "../types";

// =============================================================================
// モック定義
// =============================================================================

/**
 * AuthKeyService モック
 * @see P21: 既存テストへの DI 追加時の大規模修正
 */
const mockAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn(),
  hasKey: vi.fn(),
  validateKey: vi.fn(),
  deleteKey: vi.fn(),
};

/**
 * SubscriptionAuthProvider モック
 */
const mockSubscriptionAuthProvider = {
  getToken: vi.fn(),
  hasToken: vi.fn(),
  validateToken: vi.fn(),
  clearCache: vi.fn(),
};

/**
 * electron-store モック
 */
const mockSettingsStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

// =============================================================================
// テストスイート
// =============================================================================

describe("AuthModeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // デフォルトのモック動作を設定
    mockSettingsStore.get.mockReturnValue(undefined);
    mockAuthKeyService.hasKey.mockResolvedValue(false);
    mockSubscriptionAuthProvider.hasToken.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // getMode テスト
  // ===========================================================================
  describe("getMode", () => {
    it("デフォルトではsubscriptionモードを返す", () => {
      // Arrange: ストアに設定なし
      mockSettingsStore.get.mockReturnValue(undefined);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const mode = service.getMode();

      // Assert
      expect(mode).toBe("subscription");
    });

    it("設定されたモードを正しく返す", () => {
      // Arrange: ストアに api-key が設定されている
      mockSettingsStore.get.mockReturnValue("api-key");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const mode = service.getMode();

      // Assert
      expect(mode).toBe("api-key");
    });

    it("無効なモード値が保存されている場合はデフォルトを返す", () => {
      // Arrange: ストアに無効な値が設定されている
      mockSettingsStore.get.mockReturnValue("invalid-mode");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const mode = service.getMode();

      // Assert
      expect(mode).toBe("subscription");
    });
  });

  // ===========================================================================
  // setMode テスト
  // ===========================================================================
  describe("setMode", () => {
    it("認証方式をsubscriptionに設定できる", async () => {
      // Arrange
      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      await service.setMode("subscription");

      // Assert
      expect(mockSettingsStore.set).toHaveBeenCalledWith(
        "authMode",
        "subscription",
      );
    });

    it("認証方式をapi-keyに設定できる", async () => {
      // Arrange
      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      await service.setMode("api-key");

      // Assert
      expect(mockSettingsStore.set).toHaveBeenCalledWith("authMode", "api-key");
    });

    it("設定が永続化される", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      await service.setMode("api-key");
      // 設定を再取得
      mockSettingsStore.get.mockReturnValue("api-key");
      const mode = service.getMode();

      // Assert
      expect(mode).toBe("api-key");
    });

    it("無効なモードを設定しようとするとエラーがスローされる", async () => {
      // Arrange
      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert
      await expect(service.setMode("invalid" as AuthMode)).rejects.toThrow(
        "Invalid auth mode",
      );
    });

    it("モード変更時にイベントが発行される", async () => {
      // Arrange
      const mockListener = vi.fn();
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });
      service.onModeChange(mockListener);

      // Act
      await service.setMode("api-key");

      // queueMicrotaskでイベントが発行されるため、次のマイクロタスクを待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert
      expect(mockListener).toHaveBeenCalledWith({
        previousMode: "subscription",
        newMode: "api-key",
        timestamp: expect.any(Number),
      });
    });

    it("同じモードへの変更ではイベントが発行されない", async () => {
      // Arrange
      const mockListener = vi.fn();
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });
      service.onModeChange(mockListener);

      // Act
      await service.setMode("subscription");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getStatus テスト
  // ===========================================================================
  describe("getStatus", () => {
    describe("subscription モード", () => {
      it("ログイン済みの場合、isAuthenticated が true", async () => {
        // Arrange
        mockSettingsStore.get.mockReturnValue("subscription");
        mockSubscriptionAuthProvider.hasToken.mockResolvedValue(true);

        const service = new AuthModeService({
          authKeyService: mockAuthKeyService,
          subscriptionAuthProvider: mockSubscriptionAuthProvider,
          settingsStore: mockSettingsStore,
        });

        // Act
        const status = await service.getStatus();

        // Assert
        expect(status.mode).toBe("subscription");
        expect(status.isAuthenticated).toBe(true);
        expect(status.details?.hasSubscriptionToken).toBe(true);
      });

      it("未ログインの場合、isAuthenticated が false でエラーメッセージあり", async () => {
        // Arrange
        mockSettingsStore.get.mockReturnValue("subscription");
        mockSubscriptionAuthProvider.hasToken.mockResolvedValue(false);

        const service = new AuthModeService({
          authKeyService: mockAuthKeyService,
          subscriptionAuthProvider: mockSubscriptionAuthProvider,
          settingsStore: mockSettingsStore,
        });

        // Act
        const status = await service.getStatus();

        // Assert
        expect(status.mode).toBe("subscription");
        expect(status.isAuthenticated).toBe(false);
        expect(status.error).toBeDefined();
        expect(status.error?.code).toBe("auth-mode/no-subscription-token");
        expect(status.error?.message).toBe(
          "サブスクリプションが見つかりません",
        );
        expect(status.details?.hasSubscriptionToken).toBe(false);
      });
    });

    describe("api-key モード", () => {
      it("キー設定済みの場合、isAuthenticated が true", async () => {
        // Arrange
        mockSettingsStore.get.mockReturnValue("api-key");
        mockAuthKeyService.hasKey.mockResolvedValue(true);

        const service = new AuthModeService({
          authKeyService: mockAuthKeyService,
          subscriptionAuthProvider: mockSubscriptionAuthProvider,
          settingsStore: mockSettingsStore,
        });

        // Act
        const status = await service.getStatus();

        // Assert
        expect(status.mode).toBe("api-key");
        expect(status.isAuthenticated).toBe(true);
        expect(status.details?.hasApiKey).toBe(true);
      });

      it("キー未設定の場合、isAuthenticated が false でエラーメッセージあり", async () => {
        // Arrange
        mockSettingsStore.get.mockReturnValue("api-key");
        mockAuthKeyService.hasKey.mockResolvedValue(false);

        const service = new AuthModeService({
          authKeyService: mockAuthKeyService,
          subscriptionAuthProvider: mockSubscriptionAuthProvider,
          settingsStore: mockSettingsStore,
        });

        // Act
        const status = await service.getStatus();

        // Assert
        expect(status.mode).toBe("api-key");
        expect(status.isAuthenticated).toBe(false);
        expect(status.error).toBeDefined();
        expect(status.error?.code).toBe("auth-mode/no-api-key");
        expect(status.error?.message).toBe("APIキーが設定されていません");
        expect(status.details?.hasApiKey).toBe(false);
      });
    });
  });

  // ===========================================================================
  // getCredential テスト
  // ===========================================================================
  describe("getCredential", () => {
    it("subscription モードではトークンを返す", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");
      mockSubscriptionAuthProvider.getToken.mockResolvedValue(
        "sk-ant-oat01-test-token",
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const credential = await service.getCredential();

      // Assert
      expect(credential).toBe("sk-ant-oat01-test-token");
      expect(mockSubscriptionAuthProvider.getToken).toHaveBeenCalled();
    });

    it("api-key モードではAPIキーを返す", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("api-key");
      mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-test-key");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const credential = await service.getCredential();

      // Assert
      expect(credential).toBe("sk-ant-api03-test-key");
      expect(mockAuthKeyService.getKey).toHaveBeenCalled();
    });

    it("認証情報がない場合はnullを返す", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");
      mockSubscriptionAuthProvider.getToken.mockResolvedValue(null);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const credential = await service.getCredential();

      // Assert
      expect(credential).toBeNull();
    });
  });

  // ===========================================================================
  // validateMode テスト
  // ===========================================================================
  describe("validateMode", () => {
    it("subscription選択時、トークンが存在すれば有効", async () => {
      // Arrange
      mockSubscriptionAuthProvider.hasToken.mockResolvedValue(true);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const isValid = await service.validateMode("subscription");

      // Assert
      expect(isValid).toBe(true);
    });

    it("subscription選択時、トークンがなければ無効", async () => {
      // Arrange
      mockSubscriptionAuthProvider.hasToken.mockResolvedValue(false);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const isValid = await service.validateMode("subscription");

      // Assert
      expect(isValid).toBe(false);
    });

    it("api-key選択時、キーが設定されていれば有効", async () => {
      // Arrange
      mockAuthKeyService.hasKey.mockResolvedValue(true);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const isValid = await service.validateMode("api-key");

      // Assert
      expect(isValid).toBe(true);
    });

    it("api-key選択時、キーが設定されていなければ無効", async () => {
      // Arrange
      mockAuthKeyService.hasKey.mockResolvedValue(false);

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const isValid = await service.validateMode("api-key");

      // Assert
      expect(isValid).toBe(false);
    });
  });

  // ===========================================================================
  // onModeChange テスト
  // ===========================================================================
  describe("onModeChange", () => {
    it("リスナーを登録できる", () => {
      // Arrange
      const mockListener = vi.fn();

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const unsubscribe = service.onModeChange(mockListener);

      // Assert
      expect(typeof unsubscribe).toBe("function");
    });

    it("リスナーを解除できる", async () => {
      // Arrange
      const mockListener = vi.fn();
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      const unsubscribe = service.onModeChange(mockListener);
      unsubscribe();

      // Act
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert
      expect(mockListener).not.toHaveBeenCalled();
    });

    it("複数のリスナーを登録できる", async () => {
      // Arrange
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      service.onModeChange(mockListener1);
      service.onModeChange(mockListener2);

      // Act
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert
      expect(mockListener1).toHaveBeenCalledTimes(1);
      expect(mockListener2).toHaveBeenCalledTimes(1);
    });
  });
});
