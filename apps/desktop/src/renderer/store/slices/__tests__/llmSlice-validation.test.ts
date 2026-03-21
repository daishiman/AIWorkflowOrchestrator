/**
 * @file validateAndSyncPersistedConfig のテスト
 * @description TASK-FIX-LLM-CONFIG-PERSISTENCE: 起動時バリデーション関数の検証
 * @testIds T3-1 ~ T3-6
 */

import { describe, it, expect } from "vitest";
import { validateAndSyncPersistedConfig } from "../llmSlice";
import type { LLMProvider } from "@repo/shared/types/llm/schemas";

const mockProviders: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      {
        id: "claude-3-5-sonnet",
        name: "Claude 3.5 Sonnet",
        isDefault: true,
      },
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        isDefault: false,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        isDefault: true,
      },
    ],
  },
];

describe("validateAndSyncPersistedConfig (TASK-FIX-LLM-CONFIG-PERSISTENCE)", () => {
  it("T3-1: 有効なProviderID + 有効なModelIDの場合、そのまま返す", () => {
    const result = validateAndSyncPersistedConfig(
      "anthropic",
      "claude-3-5-sonnet",
      mockProviders,
    );
    expect(result).toEqual({
      providerId: "anthropic",
      modelId: "claude-3-5-sonnet",
    });
  });

  it("T3-2: 有効なProviderID + 無効なModelIDの場合、modelIdをnullにする", () => {
    const result = validateAndSyncPersistedConfig(
      "anthropic",
      "non-existent-model",
      mockProviders,
    );
    expect(result).toEqual({
      providerId: "anthropic",
      modelId: null,
    });
  });

  it("T3-3: 無効なProviderIDの場合、providerId/modelId両方をnullにする（P62対策）", () => {
    const result = validateAndSyncPersistedConfig(
      "non-existent-provider" as "anthropic",
      "some-model",
      mockProviders,
    );
    expect(result).toEqual({ providerId: null, modelId: null });
  });

  it("T3-4: persistedProviderIdがnullの場合、{providerId: null, modelId: null}を返す", () => {
    const result = validateAndSyncPersistedConfig(null, null, mockProviders);
    expect(result).toEqual({ providerId: null, modelId: null });
  });

  it("T3-5: availableProvidersが空配列の場合、nullクリアせず永続化値を保持する（fetch失敗対策）", () => {
    const result = validateAndSyncPersistedConfig(
      "anthropic",
      "claude-3-5-sonnet",
      [],
    );
    expect(result.providerId).toBe("anthropic");
    expect(result.modelId).toBe("claude-3-5-sonnet");
  });

  it("T3-6: DEFAULT_CONFIGへのfallbackが行われないこと（P62対策の明示的確認）", () => {
    // 無効なProviderIDを渡した場合、何らかのデフォルト値ではなくnullが返る
    const result = validateAndSyncPersistedConfig(
      "deleted-provider" as "anthropic",
      "deleted-model",
      mockProviders,
    );
    expect(result.providerId).toBeNull();
    expect(result.modelId).toBeNull();
    // DEFAULT_CONFIGの典型的な値（openai, gpt-4o等）にfallbackしていないことを確認
    expect(result.providerId).not.toBe("openai");
    expect(result.modelId).not.toBe("gpt-4o");
  });
});
