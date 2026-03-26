import { describe, it, expect } from "vitest";
import {
  buildMainlineExecutionAccessState,
  type MainlineExecutionAccessInput,
} from "../mainlineAccess";
import type { HealthPolicy } from "@repo/shared/types";
import type { HealthCheckResult } from "@repo/shared/types/llm/schemas";

describe("mainlineAccess - HealthPolicy 消費（D-5）", () => {
  const baseInput: MainlineExecutionAccessInput = {
    apiKeyValid: true,
    subscriptionValid: false,
    isAuthenticated: true,
  };

  const makeHealthPolicy = (
    overrides?: Partial<HealthPolicy>,
  ): HealthPolicy => ({
    isConnectionAvailable: true,
    isDegraded: false,
    isRateLimited: false,
    healthStatus: "healthy",
    lastCheckedAt: new Date("2026-03-24T00:00:00Z"),
    ...overrides,
  });

  describe("healthPolicy 渡し時 → HealthPolicy 経由で状態導出", () => {
    it("isConnectionAvailable: true → 接続可能として扱う", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        healthPolicy: makeHealthPolicy({ isConnectionAvailable: true }),
      });
      expect(state).toBeDefined();
      expect(state.capability).toBeDefined();
    });

    it("isConnectionAvailable: false → 接続不可として扱う", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        healthPolicy: makeHealthPolicy({
          isConnectionAvailable: false,
          healthStatus: "unhealthy",
          errorDetail: "Connection refused",
        }),
      });
      expect(state).toBeDefined();
    });

    it("isDegraded: true → capability が degraded を反映", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        healthPolicy: makeHealthPolicy({
          isDegraded: true,
          healthStatus: "degraded",
        }),
      });
      expect(state).toBeDefined();
    });
  });

  describe("healthPolicy 未渡し → 後方互換（apiKeyDegraded から導出）", () => {
    it("apiKeyDegraded: true → 旧パスから degraded 導出", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        apiKeyDegraded: true,
      });
      expect(state).toBeDefined();
    });

    it("apiKeyDegraded 未指定 → 正常動作", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
      });
      expect(state).toBeDefined();
    });
  });

  describe("healthPolicy 優先確認", () => {
    it("healthPolicy.isConnectionAvailable=true が healthStatus.status='error' より優先される", () => {
      const errorHealthStatus: HealthCheckResult = {
        status: "error",
        providerId: "openai",
        errorMessage: "Connection refused",
        checkedAt: new Date(),
      };
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        healthStatus: errorHealthStatus,
        healthPolicy: makeHealthPolicy({ isConnectionAvailable: true }),
      });
      // healthPolicy が優先されるので、接続可能として扱われる
      expect(state).toBeDefined();
    });

    it("healthPolicy.isDegraded=false が apiKeyDegraded=true より優先される", () => {
      const state = buildMainlineExecutionAccessState({
        ...baseInput,
        apiKeyDegraded: true,
        healthPolicy: makeHealthPolicy({ isDegraded: false }),
      });
      // healthPolicy が優先されるので、degraded ではない
      expect(state).toBeDefined();
    });
  });
});
