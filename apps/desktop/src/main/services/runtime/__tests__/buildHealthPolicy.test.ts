/**
 * buildHealthPolicy Unit Tests
 *
 * UT-HEALTH-POLICY-RUNTIME-INJECTION-001
 *
 * LLMAdapterFactory.checkHealth() の結果を HealthPolicy に変換して返すことを検証する。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { HealthCheckResult } from "@repo/shared/types/llm/schemas";

// モジュールモック: LLMAdapterFactory
vi.mock("../../../adapters/llm/LLMAdapterFactory", () => ({
  LLMAdapterFactory: {
    getAdapter: vi.fn(),
  },
}));

// モジュールモック: llmConfigProvider
vi.mock("../../../ipc/llmConfigProvider", () => ({
  getSelectedLLMConfig: vi.fn(),
}));

import { buildHealthPolicy } from "../buildHealthPolicy";
import { LLMAdapterFactory } from "../../../adapters/llm/LLMAdapterFactory";
import { getSelectedLLMConfig } from "../../../ipc/llmConfigProvider";

const mockGetAdapter = vi.mocked(LLMAdapterFactory.getAdapter);
const mockGetSelectedLLMConfig = vi.mocked(getSelectedLLMConfig);

const makeHealthCheckResult = (
  status: "connected" | "disconnected" | "error",
  errorMessage?: string,
): HealthCheckResult => ({
  status,
  providerId: "anthropic",
  checkedAt: new Date("2026-04-07T00:00:00Z"),
  ...(errorMessage && { errorMessage }),
});

describe("buildHealthPolicy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系: HealthCheck 成功", () => {
    it("connected → healthy HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
      });
      mockGetAdapter.mockResolvedValue({
        checkHealth: vi
          .fn()
          .mockResolvedValue(makeHealthCheckResult("connected")),
      } as never);

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("healthy");
      expect(policy.isConnectionAvailable).toBe(true);
      expect(policy.isDegraded).toBe(false);
      expect(policy.lastCheckedAt).toEqual(new Date("2026-04-07T00:00:00Z"));
    });

    it("disconnected → unhealthy HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
      });
      mockGetAdapter.mockResolvedValue({
        checkHealth: vi
          .fn()
          .mockResolvedValue(
            makeHealthCheckResult("disconnected", "Connection refused"),
          ),
      } as never);

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("unhealthy");
      expect(policy.isConnectionAvailable).toBe(false);
      expect(policy.isDegraded).toBe(false);
    });

    it("error → unhealthy HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue(null);
      mockGetAdapter.mockResolvedValue({
        checkHealth: vi
          .fn()
          .mockResolvedValue(makeHealthCheckResult("error", "Timeout")),
      } as never);

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("unhealthy");
      expect(policy.isConnectionAvailable).toBe(false);
    });
  });

  describe("プロバイダー選択", () => {
    it("選択中プロバイダーがある場合はそれを使用する", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue({
        providerId: "openai",
        modelId: "gpt-4o",
      });
      const mockCheckHealth = vi
        .fn()
        .mockResolvedValue(makeHealthCheckResult("connected"));
      mockGetAdapter.mockResolvedValue({
        checkHealth: mockCheckHealth,
      } as never);

      await buildHealthPolicy();

      expect(mockGetAdapter).toHaveBeenCalledWith("openai");
    });

    it("選択中プロバイダーが null の場合はデフォルト (anthropic) を使用する", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue(null);
      const mockCheckHealth = vi
        .fn()
        .mockResolvedValue(makeHealthCheckResult("connected"));
      mockGetAdapter.mockResolvedValue({
        checkHealth: mockCheckHealth,
      } as never);

      await buildHealthPolicy();

      expect(mockGetAdapter).toHaveBeenCalledWith("anthropic");
    });

    it("fallbackProviderId を指定した場合はそれを使用する", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue(null);
      const mockCheckHealth = vi
        .fn()
        .mockResolvedValue(makeHealthCheckResult("connected"));
      mockGetAdapter.mockResolvedValue({
        checkHealth: mockCheckHealth,
      } as never);

      await buildHealthPolicy("openai");

      expect(mockGetAdapter).toHaveBeenCalledWith("openai");
    });
  });

  describe("異常系: HealthCheck 失敗", () => {
    it("getAdapter が例外をスローした場合は unknown HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
      });
      mockGetAdapter.mockRejectedValue(new Error("Adapter init failed"));

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("unknown");
      expect(policy.isConnectionAvailable).toBe(false);
      expect(policy.lastCheckedAt).toBeNull();
    });

    it("checkHealth が例外をスローした場合は unknown HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockResolvedValue({
        providerId: "anthropic",
        modelId: "claude-3-5-sonnet",
      });
      mockGetAdapter.mockResolvedValue({
        checkHealth: vi.fn().mockRejectedValue(new Error("Network error")),
      } as never);

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("unknown");
      expect(policy.isConnectionAvailable).toBe(false);
      expect(policy.lastCheckedAt).toBeNull();
    });

    it("getSelectedLLMConfig が例外をスローした場合は unknown HealthPolicy を返す", async () => {
      mockGetSelectedLLMConfig.mockRejectedValue(new Error("Storage error"));

      const policy = await buildHealthPolicy();

      expect(policy.healthStatus).toBe("unknown");
      expect(policy.isConnectionAvailable).toBe(false);
      expect(policy.lastCheckedAt).toBeNull();
    });
  });
});
