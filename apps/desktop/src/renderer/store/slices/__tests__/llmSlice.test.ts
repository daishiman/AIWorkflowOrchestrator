/**
 * @file llmSlice 状態管理のテスト
 * @description TDD Red Phase - 実装前にテストを作成
 * @testIds TS-020
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLLMSlice, type LLMSlice } from "../llmSlice";
import type {
  LLMProvider,
  LLMProviderId,
} from "@repo/shared/types/llm/schemas";

describe("llmSlice", () => {
  let store: LLMSlice;
  let mockSet: (
    fn: ((state: LLMSlice) => Partial<LLMSlice>) | Partial<LLMSlice>,
  ) => void;

  beforeEach(() => {
    const state: Partial<LLMSlice> = {};
    mockSet = (fn) => {
      const partial =
        typeof fn === "function" ? fn(store) : (fn as Partial<LLMSlice>);
      Object.assign(state, partial);
      store = { ...store, ...state };
    };

    store = createLLMSlice(
      mockSet as never,
      (() => store) as never,
      {} as never,
    );
  });

  // ==========================================================================
  // TS-020-01: 初期状態
  // ==========================================================================
  describe("TS-020-01: 初期状態", () => {
    it("providersが空配列である", () => {
      expect(store.providers).toEqual([]);
    });

    it("selectedProviderIdがnullである", () => {
      expect(store.selectedProviderId).toBeNull();
    });

    it("selectedModelIdがnullである", () => {
      expect(store.selectedModelId).toBeNull();
    });

    it("isLoadingがfalseである", () => {
      expect(store.llmIsLoading).toBe(false);
    });

    it("errorがnullである", () => {
      expect(store.llmError).toBeNull();
    });

    it("healthStatusが空オブジェクトである", () => {
      expect(store.healthStatus).toEqual({});
    });
  });

  // ==========================================================================
  // TS-020-02: fetchProviders 成功
  // ==========================================================================
  describe("TS-020-02: fetchProviders 成功", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [
          { id: "gpt-4o", name: "GPT-4o", isDefault: true },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo", isDefault: false },
        ],
      },
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: true },
          { id: "claude-3-sonnet", name: "Claude 3 Sonnet", isDefault: false },
        ],
      },
    ];

    beforeEach(() => {
      // Mock IPC API
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockResolvedValue(mockProviders),
          },
        },
      };
    });

    it("providersに値が設定される", async () => {
      await store.fetchProviders();
      expect(store.providers).toHaveLength(2);
      expect(store.providers[0].id).toBe("openai");
      expect(store.providers[1].id).toBe("anthropic");
    });

    it("デフォルトプロバイダーが選択される", async () => {
      await store.fetchProviders();
      expect(store.selectedProviderId).toBe("openai");
    });

    it("デフォルトモデルが選択される", async () => {
      await store.fetchProviders();
      expect(store.selectedModelId).toBe("gpt-4o");
    });

    it("isLoadingがfalseになる", async () => {
      await store.fetchProviders();
      expect(store.llmIsLoading).toBe(false);
    });

    it("errorがnullのままである", async () => {
      await store.fetchProviders();
      expect(store.llmError).toBeNull();
    });
  });

  // ==========================================================================
  // TS-020-03: fetchProviders 失敗
  // ==========================================================================
  describe("TS-020-03: fetchProviders 失敗", () => {
    beforeEach(() => {
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi
              .fn()
              .mockRejectedValue(new Error("Failed to fetch providers")),
          },
        },
      };
    });

    it("errorに値が設定される", async () => {
      await store.fetchProviders();
      expect(store.llmError).not.toBeNull();
      expect(store.llmError?.message).toBe("Failed to fetch providers");
    });

    it("providersが空のままである", async () => {
      await store.fetchProviders();
      expect(store.providers).toEqual([]);
    });

    it("isLoadingがfalseになる", async () => {
      await store.fetchProviders();
      expect(store.llmIsLoading).toBe(false);
    });
  });

  // ==========================================================================
  // TS-020-04: selectProvider
  // ==========================================================================
  describe("TS-020-04: selectProvider", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
      },
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: true },
        ],
      },
    ];

    beforeEach(() => {
      // 初期状態を設定
      store.providers = mockProviders;
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
    });

    it("selectedProviderIdが更新される", () => {
      store.selectProvider("anthropic");
      expect(store.selectedProviderId).toBe("anthropic");
    });
  });

  // ==========================================================================
  // TS-020-05: selectProvider でモデル自動選択
  // ==========================================================================
  describe("TS-020-05: selectProvider でモデル自動選択", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
      },
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          { id: "claude-3-sonnet", name: "Claude 3 Sonnet", isDefault: false },
          { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: true },
        ],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
    });

    it("プロバイダー切り替え時にデフォルトモデルが選択される", () => {
      store.selectProvider("anthropic");
      expect(store.selectedModelId).toBe("claude-3-opus");
    });

    it("デフォルトモデルがない場合は最初のモデルが選択される", () => {
      // デフォルトモデルなしのプロバイダーを設定
      store.providers = [
        {
          id: "google",
          name: "Google",
          isAvailable: true,
          models: [
            { id: "gemini-pro", name: "Gemini Pro", isDefault: false },
            { id: "gemini-ultra", name: "Gemini Ultra", isDefault: false },
          ],
        },
      ];
      store.selectProvider("google");
      expect(store.selectedModelId).toBe("gemini-pro");
    });
  });

  // ==========================================================================
  // TS-020-06: selectModel
  // ==========================================================================
  describe("TS-020-06: selectModel", () => {
    beforeEach(() => {
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
    });

    it("selectedModelIdが更新される", () => {
      store.selectModel("gpt-4-turbo");
      expect(store.selectedModelId).toBe("gpt-4-turbo");
    });
  });

  // ==========================================================================
  // TS-020-07: checkHealth 成功
  // ==========================================================================
  describe("TS-020-07: checkHealth 成功", () => {
    const mockHealthResult = {
      status: "connected",
      providerId: "openai",
      latency: 150,
      checkedAt: new Date(),
    };

    beforeEach(() => {
      (global as any).window = {
        electronAPI: {
          llm: {
            checkHealth: vi.fn().mockResolvedValue(mockHealthResult),
          },
        },
      };
    });

    it("healthStatusが更新される", async () => {
      await store.checkHealth("openai");
      expect(store.healthStatus["openai"]).toBeDefined();
      expect(store.healthStatus["openai"]?.status).toBe("connected");
    });

    it("レイテンシが記録される", async () => {
      await store.checkHealth("openai");
      expect(store.healthStatus["openai"]?.latency).toBe(150);
    });
  });

  // ==========================================================================
  // TS-020-08: resetSelection
  // ==========================================================================
  describe("TS-020-08: resetSelection", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
      store.selectedProviderId = "anthropic";
      store.selectedModelId = "claude-3-opus";
    });

    it("デフォルト値にリセットされる", () => {
      store.resetSelection();
      // プロバイダーが存在する場合、最初のプロバイダーとそのデフォルトモデルに戻る
      expect(store.selectedProviderId).toBe("openai");
      expect(store.selectedModelId).toBe("gpt-4o");
    });

    it("プロバイダーがない場合はnullになる", () => {
      store.providers = [];
      store.resetSelection();
      expect(store.selectedProviderId).toBeNull();
      expect(store.selectedModelId).toBeNull();
    });
  });

  // ==========================================================================
  // TS-020-09: clearError
  // ==========================================================================
  describe("TS-020-09: clearError", () => {
    beforeEach(() => {
      store.llmError = {
        code: "NETWORK_ERROR",
        message: "Connection failed",
        retryable: true,
      };
    });

    it("errorがnullになる", () => {
      store.clearLLMError();
      expect(store.llmError).toBeNull();
    });
  });

  // ==========================================================================
  // 追加テストケース
  // ==========================================================================
  describe("setLLMLoading", () => {
    it("isLoadingをtrueに設定する", () => {
      store.setLLMLoading(true);
      expect(store.llmIsLoading).toBe(true);
    });

    it("isLoadingをfalseに設定する", () => {
      store.setLLMLoading(true);
      store.setLLMLoading(false);
      expect(store.llmIsLoading).toBe(false);
    });
  });

  describe("setLLMError", () => {
    it("エラーを設定する", () => {
      const error = {
        code: "API_KEY_INVALID" as const,
        message: "Invalid API key",
        retryable: false,
      };
      store.setLLMError(error);
      expect(store.llmError).toEqual(error);
    });
  });

  describe("getSelectedProvider", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
      store.selectedProviderId = "openai";
    });

    it("選択中のプロバイダーを返す", () => {
      const provider = store.getSelectedProvider();
      expect(provider?.id).toBe("openai");
    });

    it("選択されていない場合はundefinedを返す", () => {
      store.selectedProviderId = null;
      const provider = store.getSelectedProvider();
      expect(provider).toBeUndefined();
    });
  });

  describe("getSelectedModel", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [
          { id: "gpt-4o", name: "GPT-4o", isDefault: true },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo", isDefault: false },
        ],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4-turbo";
    });

    it("選択中のモデルを返す", () => {
      const model = store.getSelectedModel();
      expect(model?.id).toBe("gpt-4-turbo");
    });

    it("プロバイダーが選択されていない場合はundefinedを返す", () => {
      store.selectedProviderId = null;
      const model = store.getSelectedModel();
      expect(model).toBeUndefined();
    });

    it("モデルが選択されていない場合はundefinedを返す", () => {
      store.selectedModelId = null;
      const model = store.getSelectedModel();
      expect(model).toBeUndefined();
    });
  });

  describe("isProviderAvailable", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
      },
      {
        id: "xai",
        name: "xAI",
        isAvailable: false,
        models: [{ id: "grok-1", name: "Grok-1", isDefault: true }],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
    });

    it("利用可能なプロバイダーでtrueを返す", () => {
      expect(store.isProviderAvailable("openai")).toBe(true);
    });

    it("利用不可のプロバイダーでfalseを返す", () => {
      expect(store.isProviderAvailable("xai")).toBe(false);
    });

    it("存在しないプロバイダーでfalseを返す", () => {
      expect(store.isProviderAvailable("unknown" as LLMProviderId)).toBe(false);
    });
  });

  describe("統合テスト - プロバイダー切り替えフロー", () => {
    const mockProviders: LLMProvider[] = [
      {
        id: "openai",
        name: "OpenAI",
        isAvailable: true,
        models: [
          { id: "gpt-4o", name: "GPT-4o", isDefault: true },
          { id: "gpt-4-turbo", name: "GPT-4 Turbo", isDefault: false },
        ],
      },
      {
        id: "anthropic",
        name: "Anthropic",
        isAvailable: true,
        models: [
          { id: "claude-3-opus", name: "Claude 3 Opus", isDefault: true },
          { id: "claude-3-sonnet", name: "Claude 3 Sonnet", isDefault: false },
        ],
      },
    ];

    beforeEach(() => {
      store.providers = mockProviders;
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
    });

    it("プロバイダー変更→モデル変更→リセットのフロー", () => {
      // プロバイダー変更
      store.selectProvider("anthropic");
      expect(store.selectedProviderId).toBe("anthropic");
      expect(store.selectedModelId).toBe("claude-3-opus"); // デフォルトモデルに切り替わる

      // モデル変更
      store.selectModel("claude-3-sonnet");
      expect(store.selectedModelId).toBe("claude-3-sonnet");

      // リセット
      store.resetSelection();
      expect(store.selectedProviderId).toBe("openai");
      expect(store.selectedModelId).toBe("gpt-4o");
    });
  });
});
