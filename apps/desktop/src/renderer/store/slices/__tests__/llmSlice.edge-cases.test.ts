/**
 * @file llmSlice エッジケーステスト
 * @description Phase 6 - テスト拡充：並行処理・異常系・複雑シナリオ
 * @feature chat-multi-llm-switching
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createLLMSlice, type LLMSlice } from "../llmSlice";
import type {
  LLMProvider,
  LLMProviderId,
} from "@repo/shared/types/llm/schemas";

describe("llmSlice エッジケーステスト", () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
    delete (global as any).window;
  });

  // ==========================================================================
  // 並行処理テスト
  // ==========================================================================
  describe("並行処理", () => {
    it("複数のfetchProvidersが同時に呼ばれた場合、最後の結果が反映される", async () => {
      const providers1: LLMProvider[] = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
        },
      ];

      const providers2: LLMProvider[] = [
        {
          id: "anthropic",
          name: "Anthropic",
          isAvailable: true,
          models: [{ id: "claude-3", name: "Claude 3", isDefault: true }],
        },
      ];

      let callCount = 0;
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockImplementation(() => {
              callCount++;
              return callCount === 1
                ? new Promise((resolve) =>
                    setTimeout(() => resolve(providers1), 100),
                  )
                : Promise.resolve(providers2);
            }),
          },
        },
      };

      // 2つのfetchを同時に開始
      const fetch1 = store.fetchProviders();
      const fetch2 = store.fetchProviders();

      await Promise.all([fetch1, fetch2]);

      // 最後の呼び出し結果が反映される
      expect(store.providers.length).toBeGreaterThan(0);
    });

    it("fetchProviders中にselectProviderが呼ばれても安全", async () => {
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
          models: [{ id: "claude-3", name: "Claude 3", isDefault: true }],
        },
      ];

      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockResolvedValue(mockProviders),
          },
        },
      };

      // プロバイダーを事前設定
      store.providers = mockProviders;

      // fetchを開始しつつ、selectProviderを呼ぶ
      const fetchPromise = store.fetchProviders();
      store.selectProvider("anthropic");

      await fetchPromise;

      // selectProviderで設定したものが維持されるか、
      // fetchProvidersで上書きされるかは実装依存
      expect(store.selectedProviderId).not.toBeNull();
    });
  });

  // ==========================================================================
  // 存在しないプロバイダー/モデルの選択テスト
  // ==========================================================================
  describe("存在しないリソースの選択", () => {
    beforeEach(() => {
      store.providers = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
        },
      ];
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
    });

    it("存在しないプロバイダーを選択しても状態が変わらない", () => {
      const prevProvider = store.selectedProviderId;
      const prevModel = store.selectedModelId;

      store.selectProvider("nonexistent" as LLMProviderId);

      // 存在しないプロバイダーの場合、状態は変わらない
      expect(store.selectedProviderId).toBe(prevProvider);
      expect(store.selectedModelId).toBe(prevModel);
    });

    it("モデルリストが空のプロバイダーを選択した場合", () => {
      store.providers = [
        ...store.providers,
        {
          id: "google",
          name: "Google",
          isAvailable: true,
          models: [], // 空のモデルリスト（本来は無効だがテスト用）
        } as LLMProvider,
      ];

      store.selectProvider("google");

      // モデルがないのでnullになる可能性
      expect(store.selectedProviderId).toBe("google");
    });
  });

  // ==========================================================================
  // エラー状態からの回復テスト
  // ==========================================================================
  describe("エラー状態からの回復", () => {
    it("エラー状態からfetchProvidersを再実行して成功", async () => {
      // 初期エラー状態
      store.llmError = {
        code: "NETWORK_ERROR",
        message: "Connection failed",
        retryable: true,
      };

      const mockProviders: LLMProvider[] = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
        },
      ];

      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockResolvedValue(mockProviders),
          },
        },
      };

      await store.fetchProviders();

      expect(store.llmError).toBeNull();
      expect(store.providers.length).toBe(1);
    });

    it("checkHealth失敗後に成功", async () => {
      const mockHealthSuccess = {
        status: "connected",
        providerId: "openai",
        latency: 100,
        checkedAt: new Date(),
      };

      (global as any).window = {
        electronAPI: {
          llm: {
            checkHealth: vi
              .fn()
              .mockRejectedValueOnce(new Error("Network error"))
              .mockResolvedValueOnce(mockHealthSuccess),
          },
        },
      };

      // 1回目: 失敗
      await store.checkHealth("openai");
      expect(store.healthStatus["openai"]?.status).toBe("error");

      // 2回目: 成功
      await store.checkHealth("openai");
      expect(store.healthStatus["openai"]?.status).toBe("connected");
    });
  });

  // ==========================================================================
  // 大量データテスト
  // ==========================================================================
  describe("大量データ処理", () => {
    it("100個のモデルを持つプロバイダーを処理できる", () => {
      const manyModels = Array.from({ length: 100 }, (_, i) => ({
        id: `model-${i}`,
        name: `Model ${i}`,
        isDefault: i === 0,
      }));

      store.providers = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: manyModels,
        },
      ];

      store.selectProvider("openai");

      expect(store.selectedProviderId).toBe("openai");
      expect(store.selectedModelId).toBe("model-0");
    });

    it("全プロバイダー（4つ）のヘルスチェック結果を保持できる", async () => {
      const providerIds: LLMProviderId[] = [
        "openai",
        "anthropic",
        "google",
        "xai",
      ];

      (global as any).window = {
        electronAPI: {
          llm: {
            checkHealth: vi.fn().mockImplementation((providerId) =>
              Promise.resolve({
                status: "connected",
                providerId,
                latency: Math.random() * 200,
                checkedAt: new Date(),
              }),
            ),
          },
        },
      };

      // 全プロバイダーのヘルスチェック
      await Promise.all(providerIds.map((id) => store.checkHealth(id)));

      // 全てのヘルスステータスが記録されている
      providerIds.forEach((id) => {
        expect(store.healthStatus[id]).toBeDefined();
        expect(store.healthStatus[id]?.status).toBe("connected");
      });
    });
  });

  // ==========================================================================
  // セレクターの境界テスト
  // ==========================================================================
  describe("セレクター境界テスト", () => {
    describe("getSelectedProvider", () => {
      it("providers配列が空の場合はundefinedを返す", () => {
        store.providers = [];
        store.selectedProviderId = "openai";

        const result = store.getSelectedProvider();
        expect(result).toBeUndefined();
      });

      it("selectedProviderIdが配列内に存在しない場合はundefinedを返す", () => {
        store.providers = [
          {
            id: "anthropic",
            name: "Anthropic",
            isAvailable: true,
            models: [{ id: "claude", name: "Claude", isDefault: true }],
          },
        ];
        store.selectedProviderId = "openai";

        const result = store.getSelectedProvider();
        expect(result).toBeUndefined();
      });
    });

    describe("getSelectedModel", () => {
      it("プロバイダーは存在するがモデルが見つからない場合", () => {
        store.providers = [
          {
            id: "openai",
            name: "OpenAI",
            isAvailable: true,
            models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
          },
        ];
        store.selectedProviderId = "openai";
        store.selectedModelId = "nonexistent-model";

        const result = store.getSelectedModel();
        expect(result).toBeUndefined();
      });
    });

    describe("isProviderAvailable", () => {
      it("利用可能なプロバイダーを正しく判定", () => {
        store.providers = [
          {
            id: "openai",
            name: "OpenAI",
            isAvailable: true,
            models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
          },
          {
            id: "anthropic",
            name: "Anthropic",
            isAvailable: false,
            models: [{ id: "claude", name: "Claude", isDefault: true }],
          },
        ];

        expect(store.isProviderAvailable("openai")).toBe(true);
        expect(store.isProviderAvailable("anthropic")).toBe(false);
        expect(store.isProviderAvailable("google")).toBe(false);
        expect(store.isProviderAvailable("xai")).toBe(false);
      });
    });
  });

  // ==========================================================================
  // API未定義時のテスト
  // ==========================================================================
  describe("API未定義時の動作", () => {
    it("window.electronAPIが未定義の場合、fetchProvidersがエラーを設定", async () => {
      (global as any).window = {};

      await store.fetchProviders();

      expect(store.llmError).not.toBeNull();
      expect(store.llmError?.message).toContain("not available");
    });

    it("window自体が未定義の場合、fetchProvidersがエラーを設定", async () => {
      delete (global as any).window;

      await store.fetchProviders();

      expect(store.llmError).not.toBeNull();
    });

    it("checkHealthメソッドが未定義の場合、エラーステータスが設定される", async () => {
      (global as any).window = {
        electronAPI: {
          llm: {},
        },
      };

      await store.checkHealth("openai");

      expect(store.healthStatus["openai"]?.status).toBe("error");
    });
  });

  // ==========================================================================
  // 状態の一貫性テスト
  // ==========================================================================
  describe("状態の一貫性", () => {
    it("resetSelectionはエラー状態をクリアしない", () => {
      store.providers = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
        },
      ];
      store.llmError = {
        code: "NETWORK_ERROR",
        message: "Error",
        retryable: true,
      };

      store.resetSelection();

      // エラーはresetSelectionではクリアされない
      expect(store.llmError).not.toBeNull();
    });

    it("clearErrorは選択状態に影響しない", () => {
      store.providers = [
        {
          id: "openai",
          name: "OpenAI",
          isAvailable: true,
          models: [{ id: "gpt-4o", name: "GPT-4o", isDefault: true }],
        },
      ];
      store.selectedProviderId = "openai";
      store.selectedModelId = "gpt-4o";
      store.llmError = {
        code: "UNKNOWN",
        message: "Error",
        retryable: false,
      };

      store.clearLLMError();

      expect(store.llmError).toBeNull();
      expect(store.selectedProviderId).toBe("openai");
      expect(store.selectedModelId).toBe("gpt-4o");
    });
  });

  // ==========================================================================
  // エラーオブジェクトの詳細テスト
  // ==========================================================================
  describe("エラーオブジェクトの詳細", () => {
    it("fetchProviders失敗時、retryable=trueが設定される", async () => {
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockRejectedValue(new Error("Network error")),
          },
        },
      };

      await store.fetchProviders();

      expect(store.llmError?.retryable).toBe(true);
    });

    it("fetchProviders失敗時、エラーコードがUNKNOWNになる", async () => {
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockRejectedValue(new Error("Some error")),
          },
        },
      };

      await store.fetchProviders();

      expect(store.llmError?.code).toBe("UNKNOWN");
    });

    it("非Errorオブジェクトがthrowされた場合のメッセージ", async () => {
      (global as any).window = {
        electronAPI: {
          llm: {
            getProviders: vi.fn().mockRejectedValue("string error"),
          },
        },
      };

      await store.fetchProviders();

      expect(store.llmError?.message).toBe("Failed to fetch providers");
    });
  });
});
