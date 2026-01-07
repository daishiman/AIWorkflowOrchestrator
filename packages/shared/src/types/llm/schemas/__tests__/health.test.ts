/**
 * @file ヘルスチェック関連Zodスキーマのテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  ConnectionStatusSchema,
  HealthCheckResultSchema,
  type HealthCheckResult,
} from "../health";

// =============================================================================
// ConnectionStatusSchema
// =============================================================================

describe("ConnectionStatusSchema", () => {
  describe("有効な接続状態", () => {
    it("connectedを受け入れること", () => {
      const result = ConnectionStatusSchema.safeParse("connected");
      expect(result.success).toBe(true);
    });

    it("disconnectedを受け入れること", () => {
      const result = ConnectionStatusSchema.safeParse("disconnected");
      expect(result.success).toBe(true);
    });

    it("errorを受け入れること", () => {
      const result = ConnectionStatusSchema.safeParse("error");
      expect(result.success).toBe(true);
    });
  });

  describe("無効な接続状態", () => {
    it("未定義の状態を拒否すること", () => {
      const result = ConnectionStatusSchema.safeParse("pending");
      expect(result.success).toBe(false);
    });

    it("空文字列を拒否すること", () => {
      const result = ConnectionStatusSchema.safeParse("");
      expect(result.success).toBe(false);
    });

    it("大文字を拒否すること", () => {
      const result = ConnectionStatusSchema.safeParse("CONNECTED");
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// HealthCheckResultSchema
// =============================================================================

describe("HealthCheckResultSchema", () => {
  describe("有効なヘルスチェック結果", () => {
    it("最小構成の成功結果", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("レイテンシ付きの成功結果", () => {
      const input = {
        status: "connected",
        providerId: "anthropic",
        latency: 150,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("disconnected状態", () => {
      const input = {
        status: "disconnected",
        providerId: "google",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("error状態（エラーメッセージ付き）", () => {
      const input = {
        status: "error",
        providerId: "xai",
        errorMessage: "Invalid API key",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("ISO文字列のcheckedAtを受け入れること", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        checkedAt: "2026-01-07T12:00:00.000Z",
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.checkedAt).toBeInstanceOf(Date);
      }
    });

    it("各プロバイダーIDでチェック可能", () => {
      const providers = ["openai", "anthropic", "google", "xai"] as const;
      providers.forEach((providerId) => {
        const input = {
          status: "connected",
          providerId,
          checkedAt: new Date(),
        };
        const result = HealthCheckResultSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("無効なヘルスチェック結果", () => {
    it("無効なstatus", () => {
      const input = {
        status: "invalid",
        providerId: "openai",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効なproviderId", () => {
      const input = {
        status: "connected",
        providerId: "invalid",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("負のlatency", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        latency: -1,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("小数のlatency", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        latency: 150.5,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("checkedAtの欠落", () => {
      const input = {
        status: "connected",
        providerId: "openai",
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });

    it("無効な日付文字列", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        checkedAt: "not-a-date",
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(false);
    });
  });

  describe("境界値テスト", () => {
    it("latency=0を受け入れること", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        latency: 0,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("大きなlatencyを受け入れること", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        latency: 999999,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("空のerrorMessageを受け入れること", () => {
      const input = {
        status: "error",
        providerId: "openai",
        errorMessage: "",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("実際のユースケース", () => {
    it("OpenAI接続成功", () => {
      const input = {
        status: "connected",
        providerId: "openai",
        latency: 120,
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("Anthropic APIキーエラー", () => {
      const input = {
        status: "error",
        providerId: "anthropic",
        errorMessage: "Invalid API key. Please check your configuration.",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("Google タイムアウト", () => {
      const input = {
        status: "error",
        providerId: "google",
        latency: 30000,
        errorMessage: "Connection timed out after 30000ms",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });

    it("xAI 未設定", () => {
      const input = {
        status: "disconnected",
        providerId: "xai",
        checkedAt: new Date(),
      };
      const result = HealthCheckResultSchema.safeParse(input);
      expect(result.success).toBe(true);
    });
  });

  describe("型推論", () => {
    it("推論された型がHealthCheckResultであること", () => {
      const input = {
        status: "connected" as const,
        providerId: "openai" as const,
        latency: 100,
        checkedAt: new Date(),
      };
      const parsed = HealthCheckResultSchema.parse(input);
      const _typeCheck: HealthCheckResult = parsed;
      expect(_typeCheck.status).toBe("connected");
    });
  });
});
