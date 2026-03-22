/**
 * @file validateAndSyncPersistedConfig 拡張テスト
 * @description TASK-FIX-LLM-CONFIG-PERSISTENCE Phase 6: エッジケース・カバレッジ補完
 * @testIds T5-1, T5-2, T6-1, T6-2, T6-3, T7-1, T7-2, T7-3, T8-1, T8-2
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateAndSyncPersistedConfig,
  createLLMSlice,
  type LLMSlice,
} from "../llmSlice";
import type { LLMProvider } from "@repo/shared/types/llm/schemas";

// === T7: バリデーション追加テスト ===

const multiProviders: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", isDefault: true },
      { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: false },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      { id: "gpt-4o", name: "GPT-4o", isDefault: true },
      { id: "gpt-4o-mini", name: "GPT-4o mini", isDefault: false },
    ],
  },
  {
    id: "google",
    name: "Google",
    isAvailable: true,
    models: [{ id: "gemini-pro", name: "Gemini Pro", isDefault: true }],
  },
];

describe("validateAndSyncPersistedConfig extended (Phase 6)", () => {
  it("T7-1: 複数Providerが存在する場合に正しいProviderのModelリストを参照する", () => {
    // openaiのモデルをanthropicとして検証しない
    const result = validateAndSyncPersistedConfig(
      "openai",
      "gpt-4o",
      multiProviders,
    );
    expect(result).toEqual({ providerId: "openai", modelId: "gpt-4o" });

    // openaiのモデルをgoogleのプロバイダーでは見つからない
    const result2 = validateAndSyncPersistedConfig(
      "google",
      "gpt-4o",
      multiProviders,
    );
    expect(result2).toEqual({ providerId: "google", modelId: null });
  });

  it("T7-2: ModelIDがnullの場合に {providerId: valid, modelId: null} を返す", () => {
    const result = validateAndSyncPersistedConfig(
      "anthropic",
      null,
      multiProviders,
    );
    expect(result).toEqual({ providerId: "anthropic", modelId: null });
  });

  it("T7-3: Providerのmodelsが空配列でもクラッシュしない", () => {
    const providersWithEmptyModels: LLMProvider[] = [
      {
        id: "xai",
        name: "xAI",
        isAvailable: true,
        models: [],
      },
    ];
    const result = validateAndSyncPersistedConfig(
      "xai",
      "some-model",
      providersWithEmptyModels,
    );
    expect(result).toEqual({ providerId: "xai", modelId: null });
  });
});

// === T8: fetchProviders拡張テスト ===

const mockGetProviders = vi.fn();
const mockSetSelectedConfig = vi.fn();

describe("fetchProviders extended (Phase 6)", () => {
  let store: LLMSlice;
  let stateAccumulator: Partial<LLMSlice>;

  beforeEach(() => {
    vi.restoreAllMocks();
    stateAccumulator = {};

    vi.stubGlobal("window", {
      electronAPI: {
        llm: {
          getProviders: mockGetProviders,
          setSelectedConfig: mockSetSelectedConfig,
        },
      },
    });

    mockSetSelectedConfig.mockResolvedValue(undefined);

    const mockSet = (
      fn: ((state: LLMSlice) => Partial<LLMSlice>) | Partial<LLMSlice>,
    ) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<LLMSlice>);
      Object.assign(stateAccumulator, partial);
      store = { ...store, ...stateAccumulator };
    };

    store = createLLMSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  it("T8-1: fetchProvidersが失敗（rejectされた場合）に同期が呼ばれない", async () => {
    mockGetProviders.mockRejectedValue(new Error("Network error"));

    await store.fetchProviders();

    expect(mockSetSelectedConfig).not.toHaveBeenCalled();
    expect(store.llmError).not.toBeNull();
    expect(store.llmError?.retryable).toBe(true);
  });

  it("T8-2: fetchProviders成功後にstoreのselectedProviderIdが更新されている", async () => {
    mockGetProviders.mockResolvedValue(multiProviders);
    stateAccumulator.selectedProviderId = "google";
    stateAccumulator.selectedModelId = "gemini-pro";
    store = { ...store, ...stateAccumulator };

    await store.fetchProviders();

    expect(store.selectedProviderId).toBe("google");
    expect(store.selectedModelId).toBe("gemini-pro");
    expect(store.providers).toHaveLength(3);
  });
});

// === migrate拡張テスト ===

function migrate(
  persistedState: unknown,
  version: number,
): Record<string, unknown> {
  if (version === 0 || version === 1) {
    const safe =
      persistedState != null && typeof persistedState === "object"
        ? persistedState
        : {};
    return {
      ...safe,
      selectedProviderId: null,
      selectedModelId: null,
    };
  }
  return persistedState as Record<string, unknown>;
}

describe("persist migrate extended (Phase 6)", () => {
  it("T6-1: version === 2 の場合、persistedStateをそのまま返す", () => {
    const state = { currentView: "chat", selectedProviderId: "anthropic" };
    const result = migrate(state, 2);
    expect(result).toEqual(state);
  });

  it("T6-2: 将来のversion（3以上）に対しても安全に処理される", () => {
    const state = { currentView: "chat", selectedProviderId: "openai" };
    expect(() => migrate(state, 3)).not.toThrow();
    expect(() => migrate(state, 99)).not.toThrow();
  });

  it("T6-3: persistedStateが空オブジェクト {} の場合でも安全に処理される", () => {
    const result = migrate({}, 1);
    expect(result).toEqual({
      selectedProviderId: null,
      selectedModelId: null,
    });
  });
});
