/**
 * AuthKeyService Unit Tests
 *
 * TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE: Claude Agent SDK用認証キー管理基盤
 * Phase 4-5: テスト作成と実装（TDD Green Phase）
 *
 * AuthKeyService は認証キーの設定・取得・検証・削除を提供する。
 * IAuthKeyService インターフェースを実装し、SkillExecutor から DI される。
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// electron モックを最初に設定
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn(),
    encryptString: vi.fn(),
    decryptString: vi.fn(),
  },
}));

// electron-store モックを設定
const mockStoreInstance = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
};

vi.mock("electron-store", () => ({
  default: vi.fn(() => mockStoreInstance),
}));

// モック後にインポート
import { safeStorage } from "electron";
import {
  AuthKeyService,
  createAuthKeyStorage,
  resetAuthKeyStore,
} from "../AuthKeyService";
import type { IAuthKeyStorage } from "../types";

describe("AuthKeyService", () => {
  let service: AuthKeyService;
  let mockStorage: IAuthKeyStorage;

  // テスト用の有効なAPIキー
  const validApiKey = "sk-ant-api03-valid-test-key-1234567890abcdef";
  const invalidApiKey = "invalid-key";
  const emptyApiKey = "";

  beforeEach(() => {
    // モックをリセット
    vi.clearAllMocks();
    mockStoreInstance.get.mockReset();
    mockStoreInstance.set.mockReset();
    mockStoreInstance.delete.mockReset();
    mockStoreInstance.clear.mockReset();

    // Store インスタンスをリセット
    resetAuthKeyStore();

    // safeStorage のデフォルト動作を設定
    vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(true);
    vi.mocked(safeStorage.encryptString).mockImplementation((value: string) =>
      Buffer.from(`encrypted:${value}`),
    );
    vi.mocked(safeStorage.decryptString).mockImplementation((buffer: Buffer) =>
      buffer.toString().replace("encrypted:", ""),
    );

    // モックストレージを作成
    mockStorage = {
      store: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue(null),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(false),
    };

    // サービスインスタンスを作成
    service = new AuthKeyService(mockStorage);

    // 環境変数をクリア
    delete process.env.ANTHROPIC_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe("setKey", () => {
    it("Anthropic APIキーを暗号化して保存できる", async () => {
      // Act
      await service.setKey(validApiKey);

      // Assert
      expect(mockStorage.store).toHaveBeenCalledWith(validApiKey);
    });

    it("safeStorageが利用不可の場合は警告を出して保存する", async () => {
      // Arrange - 実際のストレージを使用
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const realStorage = createAuthKeyStorage();
      const realService = new AuthKeyService(realStorage);

      // Act
      await realService.setKey(validApiKey);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Encryption not available"),
      );
      expect(mockStoreInstance.set).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("空文字のキーはバリデーションエラーを返す", async () => {
      // Act & Assert
      await expect(service.setKey(emptyApiKey)).rejects.toThrow(
        /cannot be empty/i,
      );
    });

    it("無効なキー形式はバリデーションエラーを返す", async () => {
      // Act & Assert
      await expect(service.setKey(invalidApiKey)).rejects.toThrow(
        /Invalid.*format|must start with 'sk-'/i,
      );
    });
  });

  describe("getKey", () => {
    it("保存済みのAPIキーを復号して取得できる", async () => {
      // Arrange
      vi.mocked(mockStorage.retrieve).mockResolvedValue(validApiKey);

      // Act
      const result = await service.getKey();

      // Assert
      expect(result).toBe(validApiKey);
      expect(mockStorage.retrieve).toHaveBeenCalled();
    });

    it("キーが未設定の場合はnullを返す", async () => {
      // Arrange
      vi.mocked(mockStorage.retrieve).mockResolvedValue(null);

      // Act
      const result = await service.getKey();

      // Assert
      expect(result).toBeNull();
    });

    it("環境変数からフォールバックできる", async () => {
      // Arrange
      vi.mocked(mockStorage.retrieve).mockResolvedValue(null);
      process.env.ANTHROPIC_API_KEY = validApiKey;

      // Act
      const result = await service.getKey();

      // Assert
      expect(result).toBe(validApiKey);
    });
  });

  describe("deleteKey", () => {
    it("保存済みのAPIキーを削除できる", async () => {
      // Act
      await service.deleteKey();

      // Assert
      expect(mockStorage.delete).toHaveBeenCalled();
    });

    it("存在しないキーの削除は何もしない", async () => {
      // Act & Assert - エラーが発生しないことを確認
      await expect(service.deleteKey()).resolves.not.toThrow();
    });

    it("削除後はキャッシュもクリアされる", async () => {
      // Arrange - 事前にキーを設定してキャッシュを作成
      vi.mocked(mockStorage.retrieve).mockResolvedValue(validApiKey);

      // 一度取得してキャッシュを作成
      await service.getKey();

      // Act
      await service.deleteKey();

      // キャッシュクリア後はストレージから再取得
      vi.mocked(mockStorage.retrieve).mockResolvedValue(null);

      // Assert
      const result = await service.getKey();
      expect(result).toBeNull();
    });
  });

  describe("validateKey", () => {
    it("有効なAPIキーを検証できる", async () => {
      // Arrange - fetch が 200 を返す
      const mockFetch = vi.fn().mockResolvedValue({
        status: 200,
        ok: true,
      });
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(validApiKey);

      // Assert
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.anthropic.com/v1/messages",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "x-api-key": validApiKey,
          }),
        }),
      );

      vi.unstubAllGlobals();
    });

    it("無効なキーの場合はfalseを返す", async () => {
      // Arrange - fetch が 401 を返す
      const mockFetch = vi.fn().mockResolvedValue({
        status: 401,
        ok: false,
      });
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(validApiKey);

      // Assert
      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });

    it("403エラーの場合もfalseを返す", async () => {
      // Arrange - fetch が 403 を返す
      const mockFetch = vi.fn().mockResolvedValue({
        status: 403,
        ok: false,
      });
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(validApiKey);

      // Assert
      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });

    it("ネットワークエラーの場合はfalseを返す", async () => {
      // Arrange
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(validApiKey);

      // Assert
      expect(result).toBe(false);

      consoleSpy.mockRestore();
      vi.unstubAllGlobals();
    });

    it("APIレートリミット(429)の場合はtrueを返す（有効なキーとみなす）", async () => {
      // Arrange - fetch が 429 を返す
      const mockFetch = vi.fn().mockResolvedValue({
        status: 429,
        ok: false,
      });
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(validApiKey);

      // Assert - 429 は有効なキーとしてtrueを返す
      expect(result).toBe(true);

      vi.unstubAllGlobals();
    });

    it("無効なキー形式は形式チェックでfalseを返す", async () => {
      // Arrange
      const mockFetch = vi.fn();
      vi.stubGlobal("fetch", mockFetch);

      // Act
      const result = await service.validateKey(invalidApiKey);

      // Assert
      expect(result).toBe(false);
      // API呼び出しは行われない
      expect(mockFetch).not.toHaveBeenCalled();

      vi.unstubAllGlobals();
    });
  });

  describe("hasKey", () => {
    it("キーが設定されている場合はtrueを返す", async () => {
      // Arrange
      vi.mocked(mockStorage.exists).mockResolvedValue(true);

      // Act
      const result = await service.hasKey();

      // Assert
      expect(result).toBe(true);
    });

    it("キーが未設定の場合はfalseを返す", async () => {
      // Arrange
      vi.mocked(mockStorage.exists).mockResolvedValue(false);

      // Act
      const result = await service.hasKey();

      // Assert
      expect(result).toBe(false);
    });

    it("環境変数のみ設定されている場合もtrueを返す", async () => {
      // Arrange
      vi.mocked(mockStorage.exists).mockResolvedValue(false);
      process.env.ANTHROPIC_API_KEY = validApiKey;

      // Act
      const result = await service.hasKey();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("キャッシュ動作", () => {
    it("getKey()はキャッシュを使用する", async () => {
      // Arrange
      vi.mocked(mockStorage.retrieve).mockResolvedValue(validApiKey);

      // Act - 2回呼び出し
      await service.getKey();
      await service.getKey();

      // Assert - retrieveは1回のみ呼ばれる（キャッシュ使用）
      expect(mockStorage.retrieve).toHaveBeenCalledTimes(1);
    });

    it("setKey()後はキャッシュが更新される", async () => {
      // Act
      await service.setKey(validApiKey);
      const result = await service.getKey();

      // Assert - storeを読まずにキャッシュから取得
      expect(result).toBe(validApiKey);
      expect(mockStorage.retrieve).not.toHaveBeenCalled();
    });

    it("clearCache()でキャッシュをクリアできる", async () => {
      // Arrange
      vi.mocked(mockStorage.retrieve).mockResolvedValue(validApiKey);

      await service.getKey(); // キャッシュを作成
      service.clearCache();
      await service.getKey(); // 再度取得

      // Assert - retrieveが2回呼ばれる（キャッシュクリア後）
      expect(mockStorage.retrieve).toHaveBeenCalledTimes(2);
    });
  });

  describe("セキュリティ", () => {
    it("認証キーはログに出力されない", async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // safeStorage を無効化してログを出力させる
      vi.mocked(safeStorage.isEncryptionAvailable).mockReturnValue(false);

      // 実際のストレージを使用
      const realStorage = createAuthKeyStorage();
      const realService = new AuthKeyService(realStorage);

      // fetch モックを設定
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      // Act - 様々な操作を実行
      await realService.setKey(validApiKey);
      await realService.getKey();
      // validateKey はネットワークエラーをログ出力する可能性がある
      await realService.validateKey(validApiKey);
      await realService.deleteKey();

      // Assert - ログにAPIキーが含まれていないことを確認
      const allLogs = [
        ...consoleSpy.mock.calls,
        ...errorSpy.mock.calls,
        ...warnSpy.mock.calls,
      ];

      allLogs.forEach((call) => {
        const message = call.join(" ");
        expect(message).not.toContain(validApiKey);
      });

      consoleSpy.mockRestore();
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      vi.unstubAllGlobals();
    });
  });
});
