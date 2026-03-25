/**
 * Consumer Auth Guard テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: CAG-01〜CAG-03
 *
 * claude.ai consumer 認証の流用防止を検証する。
 */

import { describe, it, expect } from "vitest";
import { RuntimePolicyResolver } from "../../services/runtime/RuntimePolicyResolver";
import {
  IPC_CHANNELS,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../../../preload/channels";

describe("Consumer Auth Guard (CAG)", () => {
  // CAG-01: claude.ai session token が Main で拒否される
  describe("CAG-01: consumer tokens are rejected by RuntimePolicyResolver", () => {
    const resolver = new RuntimePolicyResolver();

    it("rejects sess- prefix token", async () => {
      await expect(
        resolver.resolve("api_key", "sess-abc123def456"),
      ).rejects.toThrow(/Consumer authentication tokens/);
    });

    it("rejects sessionKey= prefix token", async () => {
      await expect(
        resolver.resolve("api_key", "sessionKey=abc123def456"),
      ).rejects.toThrow(/Consumer authentication tokens/);
    });

    it("rejects sess- with whitespace", async () => {
      await expect(
        resolver.resolve("api_key", "  sess-abc123def456  "),
      ).rejects.toThrow(/Consumer authentication tokens/);
    });

    it("allows valid API key format", async () => {
      const result = await resolver.resolve(
        "api_key",
        "sk-ant-valid-key-12345",
      );
      expect(result.type).toBe("integrated_api");
    });
  });

  // CAG-02: cookie API が Preload で公開されていない
  it("CAG-02: no cookie API exposed in preload channels", () => {
    const allChannelValues = Object.values(IPC_CHANNELS) as string[];
    const allAllowed = [
      ...ALLOWED_INVOKE_CHANNELS,
      ...ALLOWED_ON_CHANNELS,
    ] as string[];

    const cookiePatterns = [
      "cookie:get",
      "cookie:set",
      "cookie:delete",
      "cookie:getAll",
      "session:getCookie",
    ];

    for (const pattern of cookiePatterns) {
      expect(allChannelValues).not.toContain(pattern);
      expect(allAllowed).not.toContain(pattern);
    }
  });

  // CAG-03: consumer 認証フロー関連 IPC が存在しない
  it("CAG-03: no consumer auth flow IPC channels exist", () => {
    const allChannelValues = Object.values(IPC_CHANNELS) as string[];
    const allAllowed = [
      ...ALLOWED_INVOKE_CHANNELS,
      ...ALLOWED_ON_CHANNELS,
    ] as string[];

    const consumerAuthPatterns = [
      "auth:claude-session",
      "auth:consumer-login",
      "auth:consumer-token",
      "auth:claude-oauth",
      "session:import",
    ];

    for (const pattern of consumerAuthPatterns) {
      expect(allChannelValues).not.toContain(pattern);
      expect(allAllowed).not.toContain(pattern);
    }
  });
});
