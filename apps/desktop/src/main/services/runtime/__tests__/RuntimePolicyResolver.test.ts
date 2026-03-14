/**
 * RuntimePolicyResolver Unit Tests
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 * test-matrix.md TC-4-01〜TC-4-06 に対応
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

  describe("TC-4-01: api-key モード + 有効な apiKey → integrated_api", () => {
    it("should return integrated_api when authMode is api-key and apiKey is valid", async () => {
      const result = await resolver.resolve("api-key", "sk-ant-test-key");
      expect(result.type).toBe("integrated_api");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-ant-test-key");
        expect(result.permissionMode).toBe("default");
      }
    });

    it("should trim apiKey whitespace", async () => {
      const result = await resolver.resolve("api-key", "  sk-ant-key  ");
      expect(result.type).toBe("integrated_api");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-ant-key");
      }
    });
  });

  describe("TC-4-02: subscription モード → terminal_handoff", () => {
    it("should return terminal_handoff when authMode is subscription", async () => {
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.launcher).toBe("claude");
        expect(result.bundle.manualRetryRule).toBeTruthy();
      }
    });

    it("should return terminal_handoff for subscription even with apiKey", async () => {
      const result = await resolver.resolve("subscription", "sk-ant-key");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("TC-4-03: api-key モード + apiKey なし → terminal_handoff", () => {
    it("should return terminal_handoff when authMode is api-key but apiKey is null", async () => {
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });

    it("should return terminal_handoff when apiKey is empty string", async () => {
      const result = await resolver.resolve("api-key", "");
      expect(result.type).toBe("terminal_handoff");
    });

    it("should return terminal_handoff when apiKey is whitespace only", async () => {
      const result = await resolver.resolve("api-key", "   ");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("TC-4-04: resolveWithService - authKeyService 経由の解決", () => {
    it("should use authKeyService.getKey() when resolving with service", async () => {
      mockAuthKeyService.getKey.mockResolvedValue("sk-ant-service-key");
      const result = await resolver.resolveWithService("api-key");
      expect(mockAuthKeyService.getKey).toHaveBeenCalledOnce();
      expect(result.type).toBe("integrated_api");
    });

    it("should return terminal_handoff when authKeyService returns null", async () => {
      mockAuthKeyService.getKey.mockResolvedValue(null);
      const result = await resolver.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
    });

    it("should return terminal_handoff for subscription regardless of service key", async () => {
      mockAuthKeyService.getKey.mockResolvedValue("sk-ant-key");
      const result = await resolver.resolveWithService("subscription");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("TC-4-05: authKeyService なしで構築", () => {
    it("should work without authKeyService", async () => {
      const resolverWithout = new RuntimePolicyResolver();
      const result = await resolverWithout.resolve("api-key", "sk-key");
      expect(result.type).toBe("integrated_api");
    });

    it("resolveWithService without authKeyService returns terminal_handoff", async () => {
      const resolverWithout = new RuntimePolicyResolver();
      const result = await resolverWithout.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("TC-4-06: terminal_handoff bundle の内容", () => {
    it("bundle should have required fields", async () => {
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle).toHaveProperty("launcher");
        expect(result.bundle).toHaveProperty("promptBundle");
        expect(result.bundle).toHaveProperty("cwd");
        expect(result.bundle).toHaveProperty("suggestedCommand");
        expect(result.bundle).toHaveProperty("manualRetryRule");
        expect(result.bundle.launcher).toBe("claude");
      }
    });
  });
});
