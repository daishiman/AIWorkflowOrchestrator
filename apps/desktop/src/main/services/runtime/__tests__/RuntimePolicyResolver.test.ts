/**
 * RuntimePolicyResolver Unit Tests - 4 state capability bridge
 *
 * TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
 * Phase 4: TC-01〜TC-06 + assertNoSilentFallback enforcement
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { IAuthKeyService } from "../../auth/types";

describe("RuntimePolicyResolver", () => {
  let resolver: RuntimePolicyResolver;
  let mockAuthKeyService: { getKey: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthKeyService = { getKey: vi.fn() };
    resolver = new RuntimePolicyResolver(
      mockAuthKeyService as unknown as IAuthKeyService,
    );
  });

  describe("4状態判定テスト", () => {
    it("TC-01: apiKeyValid=true, subscriptionValid=false → integratedRuntime", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: false,
      });
      expect(result.capability).toBe("integratedRuntime");
    });

    it("TC-02: apiKeyValid=false, subscriptionValid=true → terminalSurface", () => {
      const result = resolver.resolve({
        apiKeyValid: false,
        subscriptionValid: true,
      });
      expect(result.capability).toBe("terminalSurface");
    });

    it("TC-03: apiKeyValid=true, subscriptionValid=true → both", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: true,
      });
      expect(result.capability).toBe("both");
    });

    it("TC-04: apiKeyValid=false, subscriptionValid=false → none で例外", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: false,
          subscriptionValid: false,
        }),
      ).toThrow("assertNoSilentFallback");
    });

    it("TC-05: apiKeyValid=true, apiKeyDegraded=true → none で例外", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: true,
          subscriptionValid: false,
          apiKeyDegraded: true,
        }),
      ).toThrow("assertNoSilentFallback");
    });

    it("TC-06: apiKeyValid=true, subscriptionValid=true, apiKeyDegraded=true → terminalSurface", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: true,
        apiKeyDegraded: true,
      });
      expect(result.capability).toBe("terminalSurface");
    });
  });

  describe("assertNoSilentFallback enforcement", () => {
    it("capability none のとき例外が throw される", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: false,
          subscriptionValid: false,
        }),
      ).toThrow("assertNoSilentFallback");
    });

    it("capability integratedRuntime のとき例外が throw されない", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: true,
          subscriptionValid: false,
        }),
      ).not.toThrow();
    });

    it("capability terminalSurface のとき例外が throw されない", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: false,
          subscriptionValid: true,
        }),
      ).not.toThrow();
    });

    it("capability both のとき例外が throw されない", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: true,
          subscriptionValid: true,
        }),
      ).not.toThrow();
    });
  });

  describe("RuntimeDecision 構造", () => {
    it("integratedRuntime decision は capability のみを返す", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: false,
      });
      expect(result).toEqual({ capability: "integratedRuntime" });
    });

    it("terminalSurface decision は bundle を保持する", () => {
      const result = resolver.resolve({
        apiKeyValid: false,
        subscriptionValid: true,
      });
      expect(result.capability).toBe("terminalSurface");
      if (result.capability === "terminalSurface") {
        expect(result.bundle).toBeDefined();
        expect(result.bundle.launcher).toBe("claude");
      }
    });

    it("both decision は capability のみを返す", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: true,
      });
      expect(result).toEqual({ capability: "both" });
    });
  });

  describe("apiKeyDegraded 境界値テスト (Phase 6)", () => {
    it("TC-07: apiKeyValid=true, subscriptionValid=false, apiKeyDegraded=undefined → integratedRuntime", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: false,
      });
      expect(result.capability).toBe("integratedRuntime");
    });

    it("TC-08: apiKeyValid=true, subscriptionValid=false, apiKeyDegraded=false → integratedRuntime", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: false,
        apiKeyDegraded: false,
      });
      expect(result.capability).toBe("integratedRuntime");
    });

    it("TC-09: apiKeyValid=true, subscriptionValid=true, apiKeyDegraded=undefined → both", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: true,
      });
      expect(result.capability).toBe("both");
    });

    it("TC-10: apiKeyValid=true, subscriptionValid=true, apiKeyDegraded=false → both", () => {
      const result = resolver.resolve({
        apiKeyValid: true,
        subscriptionValid: true,
        apiKeyDegraded: false,
      });
      expect(result.capability).toBe("both");
    });

    it("TC-11: apiKeyValid=false, subscriptionValid=false, apiKeyDegraded=true → none で例外", () => {
      expect(() =>
        resolver.resolve({
          apiKeyValid: false,
          subscriptionValid: false,
          apiKeyDegraded: true,
        }),
      ).toThrow("assertNoSilentFallback");
    });
  });

  describe("resolveFromServices", () => {
    it("authKeyService から apiKey を取得して capability を返す", async () => {
      mockAuthKeyService.getKey.mockResolvedValue("sk-service-key");
      const result = await resolver.resolveFromServices();
      expect(mockAuthKeyService.getKey).toHaveBeenCalledOnce();
      expect(result.capability).toBe("integratedRuntime");
    });

    it("authKeyService が null を返すとき none で例外", async () => {
      mockAuthKeyService.getKey.mockResolvedValue(null);
      await expect(resolver.resolveFromServices()).rejects.toThrow(
        "assertNoSilentFallback",
      );
    });

    it("silent: true のとき none でも例外を throw しない", async () => {
      mockAuthKeyService.getKey.mockResolvedValue(null);
      const result = await resolver.resolveFromServices({ silent: true });
      expect(result.capability).toBe("none");
    });

    it("authKeyService なしの場合 none で例外", async () => {
      const resolverWithout = new RuntimePolicyResolver();
      await expect(resolverWithout.resolveFromServices()).rejects.toThrow(
        "assertNoSilentFallback",
      );
    });
  });
});
