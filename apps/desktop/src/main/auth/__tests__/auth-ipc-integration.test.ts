/**
 * IPC統合テスト
 * Phase 4: TDD Red - 実装前のテスト作成
 *
 * テストID: IPC-01 ~ IPC-06
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../../../preload/channels";

describe("IPC統合テスト", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("IPC-01: auth:loginチャネルが定義されている", () => {
    expect(IPC_CHANNELS.AUTH_LOGIN).toBe("auth:login");
  });

  it("IPC-02: auth:state-changedチャネルが定義されている", () => {
    expect(IPC_CHANNELS.AUTH_STATE_CHANGED).toBe("auth:state-changed");
  });

  it("IPC-03: 新規auth:start-oauth-flowチャネルが定義されている", () => {
    expect(IPC_CHANNELS.AUTH_START_OAUTH_FLOW).toBeDefined();
    expect(IPC_CHANNELS.AUTH_START_OAUTH_FLOW).toBe("auth:start-oauth-flow");
  });

  it("IPC-04: auth:start-oauth-flowがPreloadホワイトリストに存在する", () => {
    expect(ALLOWED_INVOKE_CHANNELS).toContain("auth:start-oauth-flow");
  });

  it("IPC-05: 既存の認証チャネルがホワイトリストに存在する", () => {
    // 既存チャネルがホワイトリストから消えていないことを確認
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_LOGIN);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_LOGOUT);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_GET_SESSION);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_REFRESH);
    expect(ALLOWED_INVOKE_CHANNELS).toContain(IPC_CHANNELS.AUTH_CHECK_ONLINE);
  });

  it("IPC-06: AUTH_STATE_CHANGEDがlistenerチャネルに存在する", () => {
    expect(ALLOWED_ON_CHANNELS).toContain(IPC_CHANNELS.AUTH_STATE_CHANGED);
  });

  // === Phase 6: 追加リグレッション・統合テスト ===

  describe("追加リグレッション", () => {
    it("REG-01: LinkedProvider型がPKCEフロー導入後も定義されている", async () => {
      // LinkedProvider型は @repo/shared/types/auth から提供される
      // 型定義が壊れていないことをランタイムで間接確認
      const { isValidProvider } = await import("@repo/shared/types/auth");
      expect(isValidProvider("google")).toBe(true);
      expect(isValidProvider("github")).toBe(true);
      expect(isValidProvider("invalid")).toBe(false);
    });

    it("REG-03: resetAuthListenerFlagがエクスポートされている", async () => {
      const { resetAuthListenerFlag } =
        await import("../../../renderer/store/slices/authSlice");
      expect(typeof resetAuthListenerFlag).toBe("function");
      // 呼び出してもエラーにならないこと
      expect(() => resetAuthListenerFlag()).not.toThrow();
    });

    it("REG-04: calculateRefreshTokenExpiryがPKCEトークンでも動作する", async () => {
      const { calculateRefreshTokenExpiry } =
        await import("../oauth-error-handler");
      const now = Math.floor(Date.now() / 1000);
      const expiry = calculateRefreshTokenExpiry(now);
      // 7日後（604800秒）
      expect(expiry).toBe(now + 7 * 24 * 60 * 60);
      expect(expiry).toBeGreaterThan(now);
    });
  });
});
