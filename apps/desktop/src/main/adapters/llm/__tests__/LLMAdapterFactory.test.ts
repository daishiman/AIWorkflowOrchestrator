/**
 * LLMAdapterFactory Tests
 *
 * TDD Phase: Red (failing tests - implementation not yet created)
 *
 * Tests for AC-ADAPTER-005: LLMAdapterFactory
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock SecureStorage
vi.mock("@/main/services/secureStorage", () => ({
  SecureStorage: {
    getApiKey: vi.fn(),
    setApiKey: vi.fn(),
  },
}));

import { SecureStorage } from "@/main/services/secureStorage";

// Factory to be implemented
import { LLMAdapterFactory } from "../LLMAdapterFactory";

// Adapters to be implemented (for type checking)
import { OpenAIAdapter } from "../OpenAIAdapter";
import { AnthropicAdapter } from "../AnthropicAdapter";
import { GoogleAdapter } from "../GoogleAdapter";
import { xAIAdapter } from "../xAIAdapter";

describe("LLMAdapterFactory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cached instances
    LLMAdapterFactory.clearAllInstances();
  });

  describe("ADP-014: OpenAIアダプター取得", () => {
    it("should return OpenAIAdapter instance for 'openai' providerId", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-openai-test-key",
      );

      const adapter = await LLMAdapterFactory.getAdapter("openai");

      expect(adapter).toBeInstanceOf(OpenAIAdapter);
      expect(adapter.providerId).toBe("openai");
    });

    it("should pass API key from SecureStorage", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-specific-key",
      );

      const adapter = await LLMAdapterFactory.getAdapter("openai");

      expect(SecureStorage.getApiKey).toHaveBeenCalledWith("openai");
      // Adapter should be created with the key
      expect(adapter).toBeDefined();
    });
  });

  describe("ADP-015: Anthropicアダプター取得", () => {
    it("should return AnthropicAdapter instance for 'anthropic' providerId", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-ant-test-key",
      );

      const adapter = await LLMAdapterFactory.getAdapter("anthropic");

      expect(adapter).toBeInstanceOf(AnthropicAdapter);
      expect(adapter.providerId).toBe("anthropic");
    });
  });

  describe("ADP-016: Googleアダプター取得", () => {
    it("should return GoogleAdapter instance for 'google' providerId", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "google-test-key",
      );

      const adapter = await LLMAdapterFactory.getAdapter("google");

      expect(adapter).toBeInstanceOf(GoogleAdapter);
      expect(adapter.providerId).toBe("google");
    });
  });

  describe("ADP-017: xAIアダプター取得", () => {
    it("should return xAIAdapter instance for 'xai' providerId", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "xai-test-key",
      );

      const adapter = await LLMAdapterFactory.getAdapter("xai");

      expect(adapter).toBeInstanceOf(xAIAdapter);
      expect(adapter.providerId).toBe("xai");
    });
  });

  describe("ADP-018: 未知のプロバイダー", () => {
    it("should throw error for unknown providerId", async () => {
      await expect(
        LLMAdapterFactory.getAdapter("unknown" as never),
      ).rejects.toThrow("Unknown provider");
    });

    it("should include providerId in error message", async () => {
      await expect(
        LLMAdapterFactory.getAdapter("invalid-provider" as never),
      ).rejects.toThrow(/invalid-provider/);
    });
  });

  describe("ADP-019: アダプターキャッシング", () => {
    it("should return same instance for repeated calls", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const adapter1 = await LLMAdapterFactory.getAdapter("openai");
      const adapter2 = await LLMAdapterFactory.getAdapter("openai");

      expect(adapter1).toBe(adapter2);
      // SecureStorage should only be called once
      expect(SecureStorage.getApiKey).toHaveBeenCalledTimes(1);
    });

    it("should cache adapters per provider", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "test-key",
      );

      const openaiAdapter = await LLMAdapterFactory.getAdapter("openai");
      const anthropicAdapter = await LLMAdapterFactory.getAdapter("anthropic");

      expect(openaiAdapter).not.toBe(anthropicAdapter);
      expect(SecureStorage.getApiKey).toHaveBeenCalledTimes(2);
    });
  });

  describe("ADP-020: キャッシュクリア", () => {
    it("should return new instance after clearInstance", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const adapter1 = await LLMAdapterFactory.getAdapter("openai");
      LLMAdapterFactory.clearInstance("openai");
      const adapter2 = await LLMAdapterFactory.getAdapter("openai");

      expect(adapter1).not.toBe(adapter2);
      expect(SecureStorage.getApiKey).toHaveBeenCalledTimes(2);
    });

    it("should only clear specified provider instance", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "test-key",
      );

      const openai1 = await LLMAdapterFactory.getAdapter("openai");
      const anthropic1 = await LLMAdapterFactory.getAdapter("anthropic");

      LLMAdapterFactory.clearInstance("openai");

      const openai2 = await LLMAdapterFactory.getAdapter("openai");
      const anthropic2 = await LLMAdapterFactory.getAdapter("anthropic");

      // OpenAI should be new instance
      expect(openai1).not.toBe(openai2);
      // Anthropic should be same instance
      expect(anthropic1).toBe(anthropic2);
    });

    it("should clear all instances with clearAllInstances", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "test-key",
      );

      const openai1 = await LLMAdapterFactory.getAdapter("openai");
      const anthropic1 = await LLMAdapterFactory.getAdapter("anthropic");

      LLMAdapterFactory.clearAllInstances();

      const openai2 = await LLMAdapterFactory.getAdapter("openai");
      const anthropic2 = await LLMAdapterFactory.getAdapter("anthropic");

      expect(openai1).not.toBe(openai2);
      expect(anthropic1).not.toBe(anthropic2);
    });
  });

  describe("API Key Not Found", () => {
    it("should throw error when API key is not found", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(LLMAdapterFactory.getAdapter("openai")).rejects.toThrow(
        /API key not found/i,
      );
    });

    it("should include provider name in error message", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      await expect(LLMAdapterFactory.getAdapter("anthropic")).rejects.toThrow(
        /anthropic/i,
      );
    });
  });

  describe("hasApiKey", () => {
    it("should return true when API key exists", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "sk-test-key",
      );

      const hasKey = await LLMAdapterFactory.hasApiKey("openai");

      expect(hasKey).toBe(true);
    });

    it("should return false when API key does not exist", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const hasKey = await LLMAdapterFactory.hasApiKey("openai");

      expect(hasKey).toBe(false);
    });

    it("should return false for empty string API key", async () => {
      (SecureStorage.getApiKey as ReturnType<typeof vi.fn>).mockResolvedValue(
        "",
      );

      const hasKey = await LLMAdapterFactory.hasApiKey("openai");

      expect(hasKey).toBe(false);
    });
  });

  describe("getAllProviderIds", () => {
    it("should return all supported provider IDs", () => {
      const providerIds = LLMAdapterFactory.getAllProviderIds();

      expect(providerIds).toEqual(
        expect.arrayContaining(["openai", "anthropic", "google", "xai"]),
      );
      expect(providerIds).toHaveLength(4);
    });
  });
});
