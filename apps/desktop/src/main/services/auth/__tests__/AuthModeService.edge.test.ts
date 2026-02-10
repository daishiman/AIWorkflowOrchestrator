/**
 * AuthModeService エッジケーステスト
 *
 * Phase 6: テスト拡充 - 境界値・競合状態・エラーリカバリーのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-6-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthModeService } from "../AuthModeService";
import type { AuthModeChangeEvent } from "../types";

// =============================================================================
// モック定義
// =============================================================================

const mockAuthKeyService = {
  setKey: vi.fn(),
  getKey: vi.fn(),
  hasKey: vi.fn(),
  validateKey: vi.fn(),
  deleteKey: vi.fn(),
};

const mockSubscriptionAuthProvider = {
  getToken: vi.fn(),
  hasToken: vi.fn(),
  validateToken: vi.fn(),
  clearCache: vi.fn(),
};

const mockSettingsStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

// =============================================================================
// テストスイート
// =============================================================================

describe("AuthModeService エッジケース", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettingsStore.get.mockReturnValue(undefined);
    mockAuthKeyService.hasKey.mockResolvedValue(false);
    mockSubscriptionAuthProvider.hasToken.mockResolvedValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ===========================================================================
  // ストア破損シナリオ
  // ===========================================================================
  describe("ストア破損時の動作", () => {
    it("ストア読み取りエラー時はデフォルト値を返す", () => {
      // Arrange: ストアが例外をスロー
      mockSettingsStore.get.mockImplementation(() => {
        throw new Error("Corrupted store");
      });

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      const mode = service.getMode();

      // Assert: デフォルト値が返される
      expect(mode).toBe("subscription");
    });

    it("ストアに null が保存されている場合はデフォルト値を返す", () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue(null);

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

    it("ストアに数値が保存されている場合はデフォルト値を返す", () => {
      // Arrange: 不正な型の値
      mockSettingsStore.get.mockReturnValue(123);

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

    it("ストアに空文字が保存されている場合はデフォルト値を返す", () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("");

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
  // 並行呼び出しシナリオ
  // ===========================================================================
  describe("並行setMode呼び出し", () => {
    it("同時に複数のsetModeを呼び出しても最後の値が有効", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act: 並行して複数回呼び出し
      await Promise.all([
        service.setMode("api-key"),
        service.setMode("subscription"),
        service.setMode("api-key"),
      ]);

      // Assert: set が3回呼ばれている
      expect(mockSettingsStore.set).toHaveBeenCalledTimes(6); // authMode と authModeUpdatedAt 各3回
    });

    it("高速連続呼び出しでもエラーが発生しない", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act: 連続して10回呼び出し
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          service.setMode(i % 2 === 0 ? "api-key" : "subscription"),
        );
      }

      // Assert: エラーなく完了する
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });

  // ===========================================================================
  // リスナーエラー分離
  // ===========================================================================
  describe("リスナーエラー分離", () => {
    it("1つのリスナーでエラーが発生しても他のリスナーは実行される", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      const listener1 = vi.fn(() => {
        throw new Error("Listener 1 error");
      });
      const listener2 = vi.fn();
      const listener3 = vi.fn();

      service.onModeChange(listener1);
      service.onModeChange(listener2);
      service.onModeChange(listener3);

      // Act
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert: エラーを出したリスナー以外も呼ばれる
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it("すべてのリスナーでエラーが発生してもサービス自体はエラーにならない", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      service.onModeChange(() => {
        throw new Error("Error 1");
      });
      service.onModeChange(() => {
        throw new Error("Error 2");
      });

      // Act & Assert: setMode自体はエラーなく完了する
      await expect(service.setMode("api-key")).resolves.toBeUndefined();
    });
  });

  // ===========================================================================
  // モード変更イベントの詳細
  // ===========================================================================
  describe("モード変更イベント詳細", () => {
    it("イベントには正確なタイムスタンプが含まれる", async () => {
      // Arrange
      vi.useFakeTimers();
      const fixedTime = 1704067200000; // 2024-01-01 00:00:00 UTC
      vi.setSystemTime(fixedTime);

      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      let capturedEvent: AuthModeChangeEvent | null = null;
      service.onModeChange((event) => {
        capturedEvent = event;
      });

      // Act
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await Promise.resolve();

      // Assert
      expect(capturedEvent).not.toBeNull();
      expect(capturedEvent!.timestamp).toBe(fixedTime);
      expect(capturedEvent!.previousMode).toBe("subscription");
      expect(capturedEvent!.newMode).toBe("api-key");

      vi.useRealTimers();
    });

    it("authModeUpdatedAt も正しく保存される", async () => {
      // Arrange
      vi.useFakeTimers();
      const fixedTime = 1704067200000;
      vi.setSystemTime(fixedTime);

      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act
      await service.setMode("api-key");

      // Assert
      expect(mockSettingsStore.set).toHaveBeenCalledWith(
        "authModeUpdatedAt",
        fixedTime,
      );

      vi.useRealTimers();
    });
  });

  // ===========================================================================
  // getStatus エッジケース
  // ===========================================================================
  describe("getStatus エッジケース", () => {
    it("hasToken/hasKeyが例外をスローした場合もエラーハンドリングされる", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");
      mockSubscriptionAuthProvider.hasToken.mockRejectedValue(
        new Error("Keychain access failed"),
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert: 例外がスローされる
      await expect(service.getStatus()).rejects.toThrow(
        "Keychain access failed",
      );
    });
  });

  // ===========================================================================
  // getCredential エッジケース
  // ===========================================================================
  describe("getCredential エッジケース", () => {
    it("subscription モードで getToken がエラーの場合は例外が伝播する", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");
      mockSubscriptionAuthProvider.getToken.mockRejectedValue(
        new Error("Token retrieval failed"),
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert
      await expect(service.getCredential()).rejects.toThrow(
        "Token retrieval failed",
      );
    });

    it("api-key モードで getKey がエラーの場合は例外が伝播する", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("api-key");
      mockAuthKeyService.getKey.mockRejectedValue(
        new Error("Key retrieval failed"),
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert
      await expect(service.getCredential()).rejects.toThrow(
        "Key retrieval failed",
      );
    });
  });

  // ===========================================================================
  // validateMode エッジケース
  // ===========================================================================
  describe("validateMode エッジケース", () => {
    it("hasToken がエラーの場合は例外が伝播する", async () => {
      // Arrange
      mockSubscriptionAuthProvider.hasToken.mockRejectedValue(
        new Error("Validation failed"),
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert
      await expect(service.validateMode("subscription")).rejects.toThrow(
        "Validation failed",
      );
    });

    it("hasKey がエラーの場合は例外が伝播する", async () => {
      // Arrange
      mockAuthKeyService.hasKey.mockRejectedValue(
        new Error("Key validation failed"),
      );

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      // Act & Assert
      await expect(service.validateMode("api-key")).rejects.toThrow(
        "Key validation failed",
      );
    });
  });

  // ===========================================================================
  // onModeChange 解除シナリオ
  // ===========================================================================
  describe("onModeChange 解除", () => {
    it("解除したリスナーは呼ばれない", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      const listener = vi.fn();
      const unsubscribe = service.onModeChange(listener);

      // Act: 解除してからモード変更
      unsubscribe();
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert
      expect(listener).not.toHaveBeenCalled();
    });

    it("同じリスナーを複数回登録しても解除は1回で完了する", async () => {
      // Arrange
      mockSettingsStore.get.mockReturnValue("subscription");

      const service = new AuthModeService({
        authKeyService: mockAuthKeyService,
        subscriptionAuthProvider: mockSubscriptionAuthProvider,
        settingsStore: mockSettingsStore,
      });

      const listener = vi.fn();
      // 同じリスナーを2回登録（Setなので実質1回）
      service.onModeChange(listener);
      const unsubscribe = service.onModeChange(listener);

      // Act: 1回解除
      unsubscribe();
      await service.setMode("api-key");

      // queueMicrotaskで処理を待つ
      await new Promise((resolve) => queueMicrotask(resolve));

      // Assert: Set なので1回の登録しかされず、解除されている
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
