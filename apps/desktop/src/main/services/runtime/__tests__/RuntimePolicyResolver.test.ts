/**
 * RuntimePolicyResolver Unit Tests
 *
 * TASK-SC-02-RUNTIME-POLICY-CLOSURE
 * 3パターン分岐（integrated_api / terminal_handoff subscription / terminal_handoff no-auth）を検証
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RuntimePolicyResolver } from "../RuntimePolicyResolver";
import type { IAuthKeyService } from "../../auth/types";
import type { ISubscriptionAuthProvider } from "@repo/shared/types/auth-mode";

describe("RuntimePolicyResolver", () => {
  let resolver: RuntimePolicyResolver;
  let mockAuthKeyService: { getKey: ReturnType<typeof vi.fn> };
  let mockSubscriptionAuthProvider: {
    validateToken: ReturnType<typeof vi.fn>;
    hasToken: ReturnType<typeof vi.fn>;
    getToken: ReturnType<typeof vi.fn>;
    clearCache: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockAuthKeyService = { getKey: vi.fn() };
    mockSubscriptionAuthProvider = {
      validateToken: vi.fn().mockResolvedValue(false),
      hasToken: vi.fn().mockResolvedValue(false),
      getToken: vi.fn().mockResolvedValue(null),
      clearCache: vi.fn(),
    };
    resolver = new RuntimePolicyResolver(
      mockAuthKeyService as unknown as IAuthKeyService,
      mockSubscriptionAuthProvider as unknown as ISubscriptionAuthProvider,
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

  describe("resolve - パターンC: subscription terminal_handoff", () => {
    it("apiKey 無効かつ subscription 有効 → terminal_handoff (subscription)", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle).toBeDefined();
        expect(result.bundle.launcher).toBe("claude");
        expect(result.bundle.manualRetryRule).toContain("サブスクリプション");
      }
    });

    it("apiKey 無効かつ subscription 有効 → bundle に runbook が含まれる", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.runbook).toBeDefined();
      }
    });
  });

  describe("resolve - パターンB: no-auth terminal_handoff", () => {
    it("apiKey 無効かつ subscription 無効 → terminal_handoff (no-auth)", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
      }
    });

    it("subscription モードでも apiKey が有効なら integrated_api（パターンA優先）", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("subscription", "sk-key");
      expect(result.type).toBe("integrated_api");
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
    it("no-auth bundle に必須フィールドが含まれること", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.launcher).toBe("claude");
        expect(typeof result.bundle.cwd).toBe("string");
        expect(typeof result.bundle.suggestedCommand).toBe("string");
        expect(typeof result.bundle.manualRetryRule).toBe("string");
        expect(typeof result.bundle.promptBundle).toBe("string");
      }
    });

    it("subscription bundle に必須フィールドが含まれること", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.launcher).toBe("claude");
        expect(typeof result.bundle.cwd).toBe("string");
        expect(typeof result.bundle.suggestedCommand).toBe("string");
        expect(typeof result.bundle.manualRetryRule).toBe("string");
        expect(typeof result.bundle.promptBundle).toBe("string");
        expect(result.bundle.runbook).toBeDefined();
      }
    });
  });

  describe("graceful degradation (AC-5)", () => {
    it("SubscriptionAuthProvider.validateToken() が例外 → no-auth にフォールバック", async () => {
      mockSubscriptionAuthProvider.validateToken.mockRejectedValue(
        new Error("Keychain access error"),
      );
      const result = await resolver.resolve("api-key", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
      }
    });

    it("SubscriptionAuthProvider 未注入 → no-auth にフォールバック", async () => {
      const resolverNoSub = new RuntimePolicyResolver(
        mockAuthKeyService as unknown as IAuthKeyService,
      );
      const result = await resolverNoSub.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
      }
    });

    it("AuthKeyService.getKey() が例外 → subscription 判定に進み subscription 有効なら subscription bundle", async () => {
      mockAuthKeyService.getKey.mockRejectedValue(new Error("Storage error"));
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain("サブスクリプション");
      }
    });

    it("AuthKeyService.getKey() が例外かつ subscription 無効 → no-auth", async () => {
      mockAuthKeyService.getKey.mockRejectedValue(new Error("Storage error"));
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolveWithService("api-key");
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
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

  describe("エッジケース (Phase 6)", () => {
    it("apiKey が undefined の場合 → subscription 判定に進む", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolve(
        "api-key",
        undefined as unknown as string | null,
      );
      expect(result.type).toBe("terminal_handoff");
    });

    it("subscription 期限切れ（validateToken false） → no-auth", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolve("subscription", null);
      expect(result.type).toBe("terminal_handoff");
      if (result.type === "terminal_handoff") {
        expect(result.bundle.manualRetryRule).toContain(
          "認証情報が設定されていません",
        );
        expect(result.bundle.runbook).toBeUndefined();
      }
    });

    it("subscription と apiKey の両方有効 → パターンA（apiKey 優先）", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("api-key", "sk-valid-key");
      expect(result.type).toBe("integrated_api");
      expect(mockSubscriptionAuthProvider.validateToken).not.toHaveBeenCalled();
    });

    it("no-auth bundle に runbook が含まれないこと", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(false);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.runbook).toBeUndefined();
      }
    });

    it("subscription bundle の runbook に手順が含まれること", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.runbook).toContain("ターミナルを開く");
      }
    });

    it("subscription bundle の suggestedCommand が正しい形式であること", async () => {
      mockSubscriptionAuthProvider.validateToken.mockResolvedValue(true);
      const result = await resolver.resolve("api-key", null);
      if (result.type === "terminal_handoff") {
        expect(result.bundle.suggestedCommand).toContain("claude -p");
      }
    });
  });
});
