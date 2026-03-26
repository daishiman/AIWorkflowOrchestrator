/**
 * @file Provider Registry SSoT 検証テスト
 * @description PROVIDER_CONFIGS を SSoT として LLMProviderIdSchema と inferProviderId が
 *   自動導出されることを検証するテスト群。
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect } from "vitest";
import {
  PROVIDER_CONFIGS,
  PROVIDER_IDS,
  inferProviderId,
} from "../provider-registry";
import { LLMProviderIdSchema } from "../provider";

// =============================================================================
// SSoT 検証: PROVIDER_CONFIGS → LLMProviderIdSchema
// =============================================================================

describe("SSoT 検証: PROVIDER_CONFIGS → LLMProviderIdSchema", () => {
  it("PROVIDER_CONFIGS の全 id が LLMProviderIdSchema で valid", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const result = LLMProviderIdSchema.safeParse(provider.id);
      expect(result.success).toBe(true);
    }
  });

  it("LLMProviderIdSchema の全 enum 値が PROVIDER_CONFIGS に存在する", () => {
    const configIds = PROVIDER_CONFIGS.map((p) => p.id);
    for (const enumValue of LLMProviderIdSchema.options) {
      expect(configIds).toContain(enumValue);
    }
  });

  it("PROVIDER_IDS と PROVIDER_CONFIGS の id が完全一致する", () => {
    const configIds = PROVIDER_CONFIGS.map((p) => p.id);
    expect(PROVIDER_IDS).toEqual(configIds);
  });
});

// =============================================================================
// inferProviderId
// =============================================================================

describe("inferProviderId", () => {
  it("PROVIDER_CONFIGS の全モデルが正しいプロバイダーに解決される", () => {
    for (const provider of PROVIDER_CONFIGS) {
      for (const model of provider.models) {
        const result = inferProviderId(model.id);
        expect(result).toBe(provider.id);
      }
    }
  });

  it("OpenRouter のスラッシュ形式モデルIDが 'openrouter' に解決される", () => {
    expect(inferProviderId("anthropic/claude-sonnet-4-6")).toBe("openrouter");
    expect(inferProviderId("openai/gpt-5.4")).toBe("openrouter");
  });

  it("既知の prefix パターンが正しく解決される", () => {
    expect(inferProviderId("gpt-5.4")).toBe("openai");
    expect(inferProviderId("o3-mini")).toBe("openai");
    expect(inferProviderId("o4-mini")).toBe("openai");
    expect(inferProviderId("claude-sonnet-4-6")).toBe("anthropic");
    expect(inferProviderId("gemini-2.5-pro")).toBe("google");
    expect(inferProviderId("grok-3")).toBe("xai");
  });

  it("未知のモデルIDに対して null を返す", () => {
    expect(inferProviderId("unknown-model")).toBeNull();
    expect(inferProviderId("mistral-large")).toBeNull();
  });
});

// =============================================================================
// SSoT 自動追従検証
// =============================================================================

describe("SSoT 自動追従検証", () => {
  it("PROVIDER_CONFIGS の id 数と PROVIDER_IDS の要素数が一致する", () => {
    expect(PROVIDER_IDS.length).toBe(PROVIDER_CONFIGS.length);
  });

  it("PROVIDER_CONFIGS の id に重複がない", () => {
    const ids = PROVIDER_CONFIGS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("全プロバイダーが modelPrefixes または specialMatcher を持つ", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const hasPrefixes = provider.modelPrefixes.length > 0;
      const hasMatcher = typeof provider.specialMatcher === "function";
      expect(hasPrefixes || hasMatcher).toBe(true);
    }
  });
});

// =============================================================================
// Phase 6: エッジケーステスト
// =============================================================================

describe("inferProviderId - エッジケース", () => {
  it("空文字に対して null を返す", () => {
    expect(inferProviderId("")).toBeNull();
  });

  it("空白文字のみに対して null を返す", () => {
    expect(inferProviderId("   ")).toBeNull();
  });

  it("prefix と完全一致するモデルIDに対して正しく解決する", () => {
    expect(inferProviderId("gpt-")).toBe("openai");
  });

  it("大文字小文字が異なるモデルIDに対して null を返す（case-sensitive）", () => {
    expect(inferProviderId("GPT-5.4")).toBeNull();
    expect(inferProviderId("Claude-sonnet-4-6")).toBeNull();
  });
});

describe("inferProviderId - OpenRouter 形式", () => {
  it("'provider/model' 形式が openrouter に解決される", () => {
    expect(inferProviderId("anthropic/claude-sonnet-4-6")).toBe("openrouter");
    expect(inferProviderId("openai/gpt-5.4")).toBe("openrouter");
    expect(inferProviderId("google/gemini-2.5-pro")).toBe("openrouter");
    expect(inferProviderId("meta-llama/llama-3.1-70b")).toBe("openrouter");
  });

  it("スラッシュを含むがプロバイダー prefix にもマッチするモデルIDはOpenRouterが優先", () => {
    expect(inferProviderId("openai/gpt-4o")).toBe("openrouter");
  });
});

describe("PROVIDER_CONFIGS 構造検証", () => {
  it("PROVIDER_IDS が空でない", () => {
    expect(PROVIDER_IDS.length).toBeGreaterThan(0);
  });

  it("各プロバイダーに isDefault: true のモデルがちょうど1つ存在する", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const defaults = provider.models.filter((m) => m.isDefault);
      expect(defaults.length).toBe(1);
    }
  });

  it("各プロバイダーのモデルIDに重複がない", () => {
    for (const provider of PROVIDER_CONFIGS) {
      const modelIds = provider.models.map((m) => m.id);
      expect(new Set(modelIds).size).toBe(modelIds.length);
    }
  });
});

describe("modelPrefixes 競合検証", () => {
  it("各プロバイダーの modelPrefixes が他プロバイダーのモデルIDにマッチしない", () => {
    for (const provider of PROVIDER_CONFIGS) {
      for (const otherProvider of PROVIDER_CONFIGS) {
        if (provider.id === otherProvider.id) continue;

        for (const model of otherProvider.models) {
          for (const prefix of provider.modelPrefixes) {
            expect(model.id.startsWith(prefix)).toBe(false);
          }
        }
      }
    }
  });

  it("modelPrefixes 間に包含関係がない", () => {
    const allPrefixes = PROVIDER_CONFIGS.flatMap((p) =>
      p.modelPrefixes.map((prefix) => ({ providerId: p.id, prefix })),
    );
    for (const a of allPrefixes) {
      for (const b of allPrefixes) {
        if (a.providerId === b.providerId) continue;
        expect(a.prefix.startsWith(b.prefix)).toBe(false);
      }
    }
  });
});
