import { describe, it, expect } from "vitest";
import { resolveHealthPolicy } from "../health-policy";
import type { HealthPolicyInput } from "../health-policy";
import type { HealthCheckResult } from "../llm/schemas/health";

// HealthCheckResult の最小 shape（実際の型から参照）
const makeHealthCheckResult = (
  overrides?: Partial<{ checkedAt: Date; errorMessage: string | null }>,
): HealthCheckResult => ({
  status: "connected",
  providerId: "openai",
  checkedAt: overrides?.checkedAt ?? new Date("2026-03-24T00:00:00Z"),
  errorMessage: overrides?.errorMessage ?? undefined,
});

// =============================================================================
// 基本導出ルールテスト（P1〜P5 + P3+P4 複合）
// =============================================================================

describe("resolveHealthPolicy", () => {
  // P1: lastHealthCheck === null → unknown
  describe("P1: lastHealthCheck === null → unknown", () => {
    it("lastHealthCheck が null の場合、healthStatus が unknown になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unknown");
      expect(result.isConnectionAvailable).toBe(false);
      expect(result.isDegraded).toBe(false);
      expect(result.lastCheckedAt).toBeNull();
    });
  });

  // P2: connectionStatus === "disconnected" → unhealthy
  describe("P2: connectionStatus === 'disconnected' → unhealthy", () => {
    it("disconnected の場合、healthStatus が unhealthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isConnectionAvailable).toBe(false);
    });
  });

  // P2b: connectionStatus === "error" → unhealthy
  describe("P2b: connectionStatus === 'error' → unhealthy", () => {
    it("error の場合、healthStatus が unhealthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "error",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({
          errorMessage: "Connection refused",
        }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isConnectionAvailable).toBe(false);
      expect(result.errorDetail).toBe("Connection refused");
    });
  });

  // P3: isRateLimited === true → degraded
  describe("P3: isRateLimited === true → degraded", () => {
    it("isRateLimited が true の場合、healthStatus が degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: true,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
      expect(result.isRateLimited).toBe(true);
    });
  });

  // P4: apiKeyDegraded === true → degraded
  describe("P4: apiKeyDegraded === true → degraded", () => {
    it("apiKeyDegraded が true の場合、healthStatus が degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
    });
  });

  // P5: healthy（全て正常）
  describe("P5: 全て正常 → healthy", () => {
    it("connected で degraded なし・rateLimited なし の場合、healthStatus が healthy になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("healthy");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(false);
      expect(result.isRateLimited).toBe(false);
    });
  });

  // P3+P4: isRateLimited && apiKeyDegraded → degraded（複合）
  describe("P3+P4: isRateLimited && apiKeyDegraded → degraded", () => {
    it("isRateLimited かつ apiKeyDegraded の場合も degraded になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: true,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isConnectionAvailable).toBe(true);
      expect(result.isDegraded).toBe(true);
    });
  });

  // lastCheckedAt の検証
  describe("lastCheckedAt の設定", () => {
    it("lastHealthCheck が非 null の場合、lastCheckedAt が設定される", () => {
      const checkedAt = new Date("2026-03-24T12:00:00Z");
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({ checkedAt }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.lastCheckedAt).toEqual(checkedAt);
    });

    it("lastHealthCheck が null の場合、lastCheckedAt が null になる", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.lastCheckedAt).toBeNull();
    });
  });

  // =============================================================================
  // エッジケーステスト（Phase 6 相当）
  // =============================================================================

  describe("エッジケース: 優先順位の競合", () => {
    it("lastHealthCheck: null + disconnected → P1 が優先され unknown を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unknown");
      expect(result.isConnectionAvailable).toBe(false);
      expect(result.lastCheckedAt).toBeNull();
    });

    it("lastHealthCheck: null + rateLimited → P1 が優先され unknown を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: true,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unknown");
    });

    it("disconnected + rateLimited → P2 が優先され unhealthy を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: true,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isConnectionAvailable).toBe(false);
      expect(result.isRateLimited).toBe(true);
    });

    it("error + apiKeyDegraded → P2 が優先され unhealthy を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "error",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({
          errorMessage: "Connection refused",
        }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unhealthy");
      expect(result.isDegraded).toBe(false);
      expect(result.errorDetail).toBe("Connection refused");
    });

    it("lastHealthCheck: null + disconnected + rateLimited + apiKeyDegraded → P1 が優先され unknown を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: false,
        apiKeyDegraded: true,
        isRateLimited: true,
        lastHealthCheck: null,
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("unknown");
      expect(result.lastCheckedAt).toBeNull();
    });
  });

  describe("エッジケース: errorDetail の導出", () => {
    it("unhealthy + errorMessage あり → errorMessage が errorDetail に設定される", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({
          errorMessage: "Server timeout",
        }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.errorDetail).toBe("Server timeout");
    });

    it("unhealthy + errorMessage なし → fallback 文字列が errorDetail に設定される", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "disconnected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({ errorMessage: null }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.errorDetail).toBe("Connection disconnected");
    });

    it("error 状態 + errorMessage なし → Connection error が errorDetail に設定される", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "error",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult({ errorMessage: null }),
      };
      const result = resolveHealthPolicy(input);
      expect(result.errorDetail).toBe("Connection error");
    });

    it("healthy 状態 → errorDetail は undefined", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.errorDetail).toBeUndefined();
    });

    it("degraded 状態 → errorDetail は undefined", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.errorDetail).toBeUndefined();
    });
  });

  // =============================================================================
  // 後方互換テスト
  // =============================================================================

  describe("後方互換: @deprecated apiKeyDegraded との結果一致", () => {
    it("apiKeyDegraded: true → degraded ステータスと isDegraded: true を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: true,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("degraded");
      expect(result.isDegraded).toBe(true);
      expect(result.isConnectionAvailable).toBe(true);
    });

    it("apiKeyDegraded: false + isRateLimited: false → healthy ステータスと isDegraded: false を返す", () => {
      const input: HealthPolicyInput = {
        connectionStatus: "connected",
        isApiKeyValid: true,
        apiKeyDegraded: false,
        isRateLimited: false,
        lastHealthCheck: makeHealthCheckResult(),
      };
      const result = resolveHealthPolicy(input);
      expect(result.healthStatus).toBe("healthy");
      expect(result.isDegraded).toBe(false);
      expect(result.isConnectionAvailable).toBe(true);
    });
  });

  // =============================================================================
  // @deprecated マーク確認
  // =============================================================================

  describe("ExecutionCapabilityInput - @deprecated 移行確認", () => {
    it("apiKeyDegraded フィールドは optional で後方互換が維持されている", () => {
      const input: import("../execution-capability").ExecutionCapabilityInput =
        {
          apiKeyValid: true,
          subscriptionValid: true,
          apiKeyDegraded: false,
        };
      expect(input.apiKeyDegraded).toBe(false);
    });

    it("apiKeyDegraded を省略しても ExecutionCapabilityInput が構築できる", () => {
      const input: import("../execution-capability").ExecutionCapabilityInput =
        {
          apiKeyValid: true,
          subscriptionValid: true,
        };
      expect(input.apiKeyDegraded).toBeUndefined();
    });
  });
});
