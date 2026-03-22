/**
 * RuntimePolicyResolver Unit Tests
 *
 * UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001
 * AuthMode + apiKey ベースの resolve / resolveWithService を検証
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

  describe("resolve - integrated_api 判定", () => {
    it("api-key モードかつ有効な apiKey → integrated_api", async () => {
      const result = await resolver.resolve("api-key", "sk-test-key");
      expect(result.type).toBe("integrated_api");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-test-key");
      }
    });

    it("api-key モードかつ空白のみ apiKey → terminal_handoff", async () => {
      const result = await resolver.resolve("api-key", "   ");
      expect(result.type).toBe("terminal_handoff");
    });

    it("api-key モードかつ null apiKey → terminal_handoff", async () => {
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
    });

    it("api-key モードかつ空文字列 apiKey → terminal_handoff", async () => {
      const result = await resolver.resolve("api-key", "");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("resolve - terminal_handoff 判定", () => {
    it("subscription モード → terminal_handoff", async () => {
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle).toBeDefined();
        expect(result.bundle.launcher).toBe("claude");
        expect(result.bundle.cwd).toBeDefined();
        expect(result.bundle.suggestedCommand).toBeDefined();
      }
    });

    it("subscription モードでも apiKey を渡す → terminal_handoff", async () => {
      const result = await resolver.resolve("subscription", "sk-key");
      expect(result.type).toBe("terminal_handoff");
    });
  });

  describe("resolve - integrated_api の構造", () => {
    it("permissionMode が default であること", async () => {
      const result = await resolver.resolve("api-key", "sk-test");
      if (result.type === "integrated_api") {
        expect(result.permissionMode).toBe("default");
      }
    });

    it("apiKey が trim されること", async () => {
      const result = await resolver.resolve("api-key", "  sk-test  ");
      if (result.type === "integrated_api") {
        expect(result.apiKey).toBe("sk-test");
      }
    });
  });

  describe("resolve - terminal_handoff の構造", () => {
    it("bundle に必須フィールドが含まれること", async () => {
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.launcher).toBe("claude");
        expect(typeof result.bundle.cwd).toBe("string");
        expect(typeof result.bundle.suggestedCommand).toBe("string");
        expect(typeof result.bundle.manualRetryRule).toBe("string");
        expect(typeof result.bundle.promptBundle).toBe("string");
      }
    });
  });

  describe("resolveWithService", () => {
    it("authKeyService から apiKey を取得して integrated_api を返す", async () => {
      mockAuthKeyService.getKey.mockResolvedValue("sk-service-key");
      const result = await resolver.resolveWithService("api-key");
      expect(mockAuthKeyService.getKey).toHaveBeenCalledOnce();
      expect(result.type).toBe("integrated_api");
    });

    it("authKeyService が null を返すとき terminal_handoff", async () => {
      mockAuthKeyService.getKey.mockResolvedValue(null);
      const result = await resolver.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
    });

    it("authKeyService なしの場合 terminal_handoff", async () => {
      const resolverWithout = new RuntimePolicyResolver();
      const result = await resolverWithout.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
    });
  });
});
