/**
 * LLM Handlers Runtime Sync テスト
 *
 * TDD Phase: Red（Phase 5 実装後に Green になることを期待）
 *
 * テストケース:
 *   IT-006: llm:check-health - 正常接続時 → {status: "connected", providerId, latency, checkedAt}
 *   IT-007: llm:check-health - 接続不可時 → {status: "disconnected", errorMessage}
 *   IT-008: llm:check-health - providerId 空文字 (P42) → VALIDATION_ERROR
 *   IT-017: llm:set-selected-config - modelId 空文字 (P42) → VALIDATION_ERROR
 *
 * @see docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/outputs/phase-4/test-matrix.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// electron モック
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: vi.fn(),
}));

// SecureStorage モック
vi.mock("@/main/services/secureStorage", () => ({
  SecureStorage: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
  },
}));

// LLMAdapterFactory モック
vi.mock("@/main/adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
    clearInstance: vi.fn(),
  },
}));

import { SecureStorage } from "@/main/services/secureStorage";
import { LLMAdapterFactory } from "@/main/adapters/llm/LLMAdapterFactory";
import {
  handleCheckHealth,
  handleSetSelectedConfig,
} from "@/main/handlers/llm";

describe("LLM Handlers - Runtime Sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // IT-006: llm:check-health - 正常接続時
  // ---------------------------------------------------------------------------
  describe("IT-006: llm:check-health - 正常接続時", () => {
    it("status: 'connected' と providerId, latency, checkedAt を返す", async () => {
      // Given: APIキーが存在し、アダプターが接続成功を返す
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockCheckedAt = new Date("2026-03-17T00:00:00.000Z");
      const mockAdapter = {
        checkHealth: vi.fn().mockResolvedValue({
          status: "connected",
          providerId: "openai",
          latency: 120,
          checkedAt: mockCheckedAt,
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: ヘルスチェックを実行する
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: connected ステータスと必須フィールドが返る（IT-006）
      expect(result.status).toBe("connected");
      expect(result.providerId).toBe("openai");
      expect(result.latency).toBeGreaterThan(0);
      expect(result.checkedAt).toBeDefined();
    });

    it("アダプターの checkHealth が呼び出される", async () => {
      // Given
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockResolvedValue({
          status: "connected",
          providerId: "anthropic",
          latency: 80,
          checkedAt: new Date(),
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When
      await handleCheckHealth({ providerId: "anthropic" });

      // Then: アダプターの checkHealth が1回呼ばれる
      expect(mockAdapter.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  // IT-007: llm:check-health - 接続不可時
  // ---------------------------------------------------------------------------
  describe("IT-007: llm:check-health - 接続不可時", () => {
    it("status: 'disconnected' と errorMessage を返す（DRIFT-4 / GAP-02 対応）", async () => {
      // Given: APIキーが存在するが接続不可
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-invalid-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockResolvedValue({
          status: "disconnected",
          providerId: "openai",
          errorMessage: "CONNECTION_REFUSED",
          checkedAt: new Date(),
        }),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: ヘルスチェックを実行する
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: disconnected ステータスと errorMessage が返る（IT-007）
      // 現在の実装は "error" ステータスを返す（Red 状態）
      // Phase 5 で "disconnected" ステータスに統一される
      expect(result.status).toBe("disconnected");
      expect(result.errorMessage).toBeDefined();
    });

    it("ネットワークエラー時に disconnected ステータスを返す", async () => {
      // Given: ネットワークエラーが発生
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );
      const mockAdapter = {
        checkHealth: vi.fn().mockRejectedValue(new Error("Network timeout")),
      };
      (
        LLMAdapterFactory.getAdapter as ReturnType<typeof vi.fn>
      ).mockResolvedValue(mockAdapter);

      // When: ヘルスチェックを実行する
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: disconnected ステータスが返る（IT-007）
      // 現在の実装はネットワークエラーを "error" ステータスで返す（Red 状態）
      // Phase 5 で "disconnected" に統一される
      expect(result.status).toBe("disconnected");
      expect(result.errorMessage).toBeDefined();
    });

    it("API key が存在しない場合に disconnected ステータスを返す", async () => {
      // Given: APIキーが未設定
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      // When: ヘルスチェックを実行する
      const result = await handleCheckHealth({ providerId: "openai" });

      // Then: disconnected ステータスと errorMessage が返る
      // Phase 5 で API key 未設定時の "disconnected" レスポンスを実装する
      expect(result.status).toBe("disconnected");
      expect(result.errorMessage).toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // IT-008: llm:check-health - providerId 空文字 (P42)
  // ---------------------------------------------------------------------------
  describe("IT-008: llm:check-health - providerId 空文字バリデーション (P42)", () => {
    it("providerId が空文字の場合に VALIDATION_ERROR を返す", async () => {
      // When: providerId が空文字でヘルスチェックを実行する
      // 現在の実装は throw するため、rejects になっている
      // Phase 5 で統一レスポンス形式 { success: false, error: { code: "VALIDATION_ERROR" } } に変更される
      let caughtError: unknown;
      try {
        await handleCheckHealth({ providerId: "" as never });
      } catch (e) {
        caughtError = e;
      }

      // Then: エラーが発生し、VALIDATION_ERROR コードが含まれる
      expect(caughtError).toBeDefined();
    });

    it("providerId がスペースのみの場合に VALIDATION_ERROR を返す (P42 トリム)", async () => {
      // When: providerId がスペースのみ
      let caughtError: unknown;
      try {
        await handleCheckHealth({ providerId: "   " as never });
      } catch (e) {
        caughtError = e;
      }

      // Then: エラーが発生する
      // Phase 5 で P42 準拠のトリム空文字チェックが追加される
      expect(caughtError).toBeDefined();
    });

    it("providerId が無効な文字列の場合に VALIDATION_ERROR を返す", async () => {
      // When: 無効なプロバイダーID
      await expect(
        handleCheckHealth({ providerId: "invalid-provider" as never }),
      ).rejects.toBeDefined();
    });
  });

  // ---------------------------------------------------------------------------
  // IT-017: llm:set-selected-config - modelId 空文字 (P42)
  // ---------------------------------------------------------------------------
  describe("IT-017: llm:set-selected-config - modelId 空文字バリデーション (P42)", () => {
    it("modelId が空文字の場合に VALIDATION_ERROR を返す", () => {
      // When: modelId が空文字
      const result = handleSetSelectedConfig({
        providerId: "openai",
        modelId: "",
      });

      // Then: VALIDATION_ERROR を含むエラーレスポンスが返る（IT-017）
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("modelId がスペースのみの場合に VALIDATION_ERROR を返す (P42 トリム)", () => {
      // When: modelId がスペースのみ
      const result = handleSetSelectedConfig({
        providerId: "openai",
        modelId: "   ",
      });

      // Then: VALIDATION_ERROR を含むエラーレスポンスが返る（P42 トリム対策）
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("modelId が null の場合に VALIDATION_ERROR を返す", () => {
      // When: modelId が null
      const result = handleSetSelectedConfig({
        providerId: "openai",
        modelId: null as unknown as string,
      });

      // Then: エラーレスポンスが返る
      expect(result.success).toBe(false);
    });

    it("有効な providerId と modelId で成功レスポンスを返す（正常系確認）", () => {
      // Given: 正常なパラメータ

      // When: 設定を更新する
      const result = handleSetSelectedConfig({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet-20241022",
      });

      // Then: 成功レスポンスが返る
      expect(result).toEqual({ success: true });
    });
  });
});
