/**
 * RuntimeResolver Tests
 *
 * authMode x API Key の組み合わせからランタイムを決定するロジックの検証
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RuntimeResolver } from "../RuntimeResolver";
import type { IAuthKeyService, IAuthModeService } from "../../auth/types";

describe("RuntimeResolver", () => {
  let mockAuthKeyService: {
    hasKey: ReturnType<typeof vi.fn>;
    getKey: ReturnType<typeof vi.fn>;
    setKey: ReturnType<typeof vi.fn>;
    validateKey: ReturnType<typeof vi.fn>;
    deleteKey: ReturnType<typeof vi.fn>;
  };
  let mockAuthModeService: {
    getMode: ReturnType<typeof vi.fn>;
    setMode: ReturnType<typeof vi.fn>;
    getStatus: ReturnType<typeof vi.fn>;
    getCredential: ReturnType<typeof vi.fn>;
    onModeChange: ReturnType<typeof vi.fn>;
    validateMode: ReturnType<typeof vi.fn>;
  };
  let resolver: RuntimeResolver;

  beforeEach(() => {
    vi.clearAllMocks();

    mockAuthKeyService = {
      hasKey: vi.fn(),
      getKey: vi.fn(),
      setKey: vi.fn(),
      validateKey: vi.fn(),
      deleteKey: vi.fn(),
    };

    mockAuthModeService = {
      getMode: vi.fn(),
      setMode: vi.fn(),
      getStatus: vi.fn(),
      getCredential: vi.fn(),
      onModeChange: vi.fn(),
      validateMode: vi.fn(),
    };

    resolver = new RuntimeResolver(
      mockAuthKeyService as unknown as IAuthKeyService,
      mockAuthModeService as unknown as IAuthModeService,
    );
  });

  it("authMode=api-key かつ API Key 存在 → integrated を返す", async () => {
    mockAuthModeService.getMode.mockReturnValue("api-key");
    mockAuthKeyService.hasKey.mockResolvedValue(true);
    mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-test-key");

    const result = await resolver.resolve();

    expect(result).toEqual({ type: "integrated" });
  });

  it("authMode=subscription → handoff を返す", async () => {
    mockAuthModeService.getMode.mockReturnValue("subscription");

    const result = await resolver.resolve();

    expect(result).toEqual({
      type: "handoff",
      reason: "subscription mode: use Claude Code CLI",
    });
    expect(mockAuthKeyService.hasKey).not.toHaveBeenCalled();
  });

  it("authMode=api-key かつ API Key 未設定 (hasKey=false) → handoff を返す", async () => {
    mockAuthModeService.getMode.mockReturnValue("api-key");
    mockAuthKeyService.hasKey.mockResolvedValue(false);

    const result = await resolver.resolve();

    expect(result).toEqual({
      type: "handoff",
      reason: "API key not configured",
    });
    expect(mockAuthKeyService.getKey).not.toHaveBeenCalled();
  });

  it("authMode=api-key かつ API Key null (hasKey=true, getKey=null) → handoff を返す", async () => {
    mockAuthModeService.getMode.mockReturnValue("api-key");
    mockAuthKeyService.hasKey.mockResolvedValue(true);
    mockAuthKeyService.getKey.mockResolvedValue(null);

    const result = await resolver.resolve();

    expect(result).toEqual({
      type: "handoff",
      reason: "API key unavailable",
    });
  });

  it("複数回呼び出し → 毎回 Service を参照（キャッシュしない）", async () => {
    mockAuthModeService.getMode.mockReturnValue("api-key");
    mockAuthKeyService.hasKey.mockResolvedValue(true);
    mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-key1");

    const result1 = await resolver.resolve();
    expect(result1.type).toBe("integrated");

    // 2回目: subscription に変更
    mockAuthModeService.getMode.mockReturnValue("subscription");

    const result2 = await resolver.resolve();
    expect(result2.type).toBe("handoff");

    // getMode が2回呼ばれたことを確認（キャッシュしていない）
    expect(mockAuthModeService.getMode).toHaveBeenCalledTimes(2);
  });

  describe("edge cases", () => {
    it("authMode が空文字列 → api-key でも subscription でもないため hasKey を評価する", async () => {
      mockAuthModeService.getMode.mockReturnValue("");
      mockAuthKeyService.hasKey.mockResolvedValue(false);

      const result = await resolver.resolve();

      expect(result).toEqual({
        type: "handoff",
        reason: "API key not configured",
      });
      expect(mockAuthKeyService.hasKey).toHaveBeenCalled();
    });

    it("authKeyService.hasKey() が例外を投げる → エラーが伝播する", async () => {
      mockAuthModeService.getMode.mockReturnValue("api-key");
      mockAuthKeyService.hasKey.mockRejectedValue(
        new Error("Keychain access denied"),
      );

      await expect(resolver.resolve()).rejects.toThrow(
        "Keychain access denied",
      );
    });

    it("authKeyService.getKey() が空文字列を返す → handoff を返す", async () => {
      mockAuthModeService.getMode.mockReturnValue("api-key");
      mockAuthKeyService.hasKey.mockResolvedValue(true);
      mockAuthKeyService.getKey.mockResolvedValue("");

      const result = await resolver.resolve();

      expect(result).toEqual({
        type: "handoff",
        reason: "API key unavailable",
      });
    });
  });
});
