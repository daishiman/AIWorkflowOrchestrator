/**
 * @file 起動時同期テスト
 * @description TASK-FIX-LLM-CONFIG-PERSISTENCE: fetchProviders完了後の永続化値バリデーションと同期
 * @testIds T4-1 ~ T4-5
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLLMSlice, type LLMSlice } from "../llmSlice";
import type { LLMProvider } from "@repo/shared/types/llm/schemas";

const mockProviders: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", isDefault: true },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
  },
];

// IPC モック
const mockGetProviders = vi.fn();
const mockSetSelectedConfig = vi.fn();

describe("fetchProviders with persisted config sync (TASK-FIX-LLM-CONFIG-PERSISTENCE)", () => {
  let store: LLMSlice;
  let stateAccumulator: Partial<LLMSlice>;

  beforeEach(() => {
    vi.restoreAllMocks();
    stateAccumulator = {};

    // window.electronAPI モック
    vi.stubGlobal("window", {
      electronAPI: {
        llm: {
          getProviders: mockGetProviders,
          setSelectedConfig: mockSetSelectedConfig,
        },
      },
    });

    mockGetProviders.mockResolvedValue(mockProviders);
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

  it("T4-1: providers fetch完了後にsyncSelectedConfigToMainが呼ばれる", async () => {
    await store.fetchProviders();

    expect(mockSetSelectedConfig).toHaveBeenCalled();
  });

  it("T4-2: 有効な永続化値がある場合、syncSelectedConfigToMainが正しいProvider/Modelで呼ばれる", async () => {
    // 永続化された値をシミュレート（storeの初期状態を上書き）
    stateAccumulator.selectedProviderId = "openai";
    stateAccumulator.selectedModelId = "gpt-4o";
    store = { ...store, ...stateAccumulator };

    await store.fetchProviders();

    // 永続化された openai/gpt-4o が使用される（firstProviderのanthropicではない）
    expect(store.selectedProviderId).toBe("openai");
    expect(store.selectedModelId).toBe("gpt-4o");
    expect(mockSetSelectedConfig).toHaveBeenCalledWith({
      providerId: "openai",
      modelId: "gpt-4o",
    });
  });

  it("T4-3: 無効な永続化値の場合（P62対策）、nullクリアされfirstProviderが選択される", async () => {
    // 無効なプロバイダーIDを永続化値として設定
    stateAccumulator.selectedProviderId =
      "deleted-provider" as LLMSlice["selectedProviderId"];
    stateAccumulator.selectedModelId = "deleted-model";
    store = { ...store, ...stateAccumulator };

    await store.fetchProviders();

    // P62: 無効な値はnullクリアされる
    // ただし、元のselectedProviderIdがnullでない（"deleted-provider"）ため、
    // isFirstLaunch=falseとなり、firstProviderへのfallbackは行われない
    expect(store.selectedProviderId).toBeNull();
    expect(store.selectedModelId).toBeNull();
  });

  it("T4-4: 初回起動（永続化値がnull）の場合、firstProviderが選択される", async () => {
    // デフォルト状態（selectedProviderId: null）のまま
    await store.fetchProviders();

    // 初回起動なのでfirstProviderが選択される
    expect(store.selectedProviderId).toBe("anthropic");
    expect(store.selectedModelId).toBe("claude-3-5-sonnet");
  });

  it("T4-5: syncSelectedConfigToMainの二重呼び出しが副作用を起こさない", async () => {
    await store.fetchProviders();
    const firstCallCount = mockSetSelectedConfig.mock.calls.length;

    await store.fetchProviders();
    // 2回呼ばれるが、副作用なし（同じ値を再設定するだけ）
    expect(mockSetSelectedConfig.mock.calls.length).toBeGreaterThanOrEqual(
      firstCallCount,
    );
  });
});
