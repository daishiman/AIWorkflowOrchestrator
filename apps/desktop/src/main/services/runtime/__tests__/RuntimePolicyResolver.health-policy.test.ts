import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { HealthPolicy } from "@repo/shared/types";
import type { ISubscriptionAuthProvider } from "@repo/shared/types/auth-mode";

describe("RuntimePolicyResolver - HealthPolicy 統合（D-4）", () => {
  let mockSubscriptionAuthProvider: {
    validateToken: ReturnType<typeof vi.fn>;
    hasToken: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    clearCache: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscriptionAuthProvider = {
      validateToken: vi.fn().mockResolvedValue(false),
      hasToken: vi.fn().mockResolvedValue(false),
      getToken: vi.fn().mockResolvedValue(null),
      clearCache: vi.fn(),
    };
  });

  const makeDegradedPolicy = (): HealthPolicy => ({
    isConnectionAvailable: true,
    isDegraded: true,
    isRateLimited: false,
    healthStatus: "degraded",
    lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
  });

  const makeHealthyPolicy = (): HealthPolicy => ({
    isConnectionAvailable: true,
    isDegraded: false,
    isRateLimited: false,
    healthStatus: "healthy",
    lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
  });

  describe("isDegraded === true → terminal_handoff", () => {
    it("isDegraded が true の場合、terminal_handoff を返す", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        makeDegradedPolicy(),
      );
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });

    it("isDegraded が true + 有効APIキーでも integrated_api を返さない（P62）", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        makeDegradedPolicy(),
      );
      const result = await resolver.resolve("api-key", "sk-valid-key");
      expect(result.type).toBe("terminal_handoff");
      expect(result.type).not.toBe("integrated_api");
    });

    it("isDegraded + subscription有効 → degraded bundle（runbook含む）", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const resolver = new RuntimePolicyResolver(
        undefined,
        mockSubscriptionAuthProvider as unknown as ISubscriptionAuthProvider,
        makeDegradedPolicy(),
      );
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain("接続品質が低下");
        expect(result.bundle.runbook).toBeDefined();
      }
    });

    it("isDegraded + subscription無効 → no-auth bundle", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const resolver = new RuntimePolicyResolver(
        undefined,
        mockSubscriptionAuthProvider as unknown as ISubscriptionAuthProvider,
        makeDegradedPolicy(),
      );
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
      }
    });
  });

  describe("healthPolicy 未指定 → 既存ロジック維持（後方互換）", () => {
    it("未指定 + APIキーあり → integrated_api", async () => {
      const resolver = new RuntimePolicyResolver();
      const result = await resolver.resolve("api-key", "sk-valid-key");
      expect(result.type).toBe("integrated_api");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-valid-key");
      }
    });

    it("未指定 + APIキーなし → terminal_handoff", async () => {
      const resolver = new RuntimePolicyResolver();
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("isDegraded === false → 既存ロジック通り", () => {
    it("isDegraded false + APIキーあり → integrated_api", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        makeHealthyPolicy(),
      );
      const result = await resolver.resolve("api-key", "sk-valid-key");
      expect(result.type).toBe("integrated_api");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-valid-key");
      }
    });

    it("isDegraded false + APIキーなし → terminal_handoff", async () => {
      const resolver = new RuntimePolicyResolver(
        undefined,
        undefined,
        makeHealthyPolicy(),
      );
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });
  });
});
