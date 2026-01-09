/**
 * @file LLM状態管理スライス
 * @description LLMプロバイダー/モデル選択の状態管理
 * @feature chat-multi-llm-switching
 */

import { StateCreator } from "zustand";
import type {
  LLMProvider,
  LLMProviderId,
  LLMModel,
  LLMError,
  HealthCheckResult,
} from "@repo/shared/types/llm/schemas";

// ============================================
// Types
// ============================================

export interface LLMSlice {
  // State
  providers: LLMProvider[];
  selectedProviderId: LLMProviderId | null;
  selectedModelId: string | null;
  llmIsLoading: boolean;
  llmError: LLMError | null;
  healthStatus: Record<LLMProviderId, HealthCheckResult | undefined>;

  // Actions
  fetchProviders: () => Promise<void>;
  selectProvider: (providerId: LLMProviderId) => void;
  selectModel: (modelId: string) => void;
  checkHealth: (providerId: LLMProviderId) => Promise<void>;
  resetSelection: () => void;
  clearLLMError: () => void;
  setLLMLoading: (loading: boolean) => void;
  setLLMError: (error: LLMError | null) => void;

  // Selectors
  getSelectedProvider: () => LLMProvider | undefined;
  getSelectedModel: () => LLMModel | undefined;
  isProviderAvailable: (providerId: LLMProviderId) => boolean;
}

// ============================================
// Helper Functions
// ============================================

/**
 * プロバイダーからデフォルトモデルを取得
 */
function getDefaultModel(provider: LLMProvider): LLMModel | undefined {
  return (
    provider.models.find((m: LLMModel) => m.isDefault) || provider.models[0]
  );
}

/**
 * プロバイダー一覧を取得（IPC経由）
 */
async function fetchProvidersFromIPC(): Promise<LLMProvider[]> {
  if (typeof window === "undefined" || !window.electronAPI?.llm?.getProviders) {
    throw new Error("LLM API not available");
  }
  return window.electronAPI.llm.getProviders();
}

/**
 * ヘルスチェック実行（IPC経由）
 */
async function checkHealthFromIPC(
  providerId: LLMProviderId,
): Promise<HealthCheckResult> {
  if (typeof window === "undefined" || !window.electronAPI?.llm?.checkHealth) {
    throw new Error("LLM API not available");
  }
  return window.electronAPI.llm.checkHealth(providerId);
}

// ============================================
// Slice Creator
// ============================================

export const createLLMSlice: StateCreator<LLMSlice, [], [], LLMSlice> = (
  set,
  get,
) => ({
  // Initial State
  providers: [],
  selectedProviderId: null,
  selectedModelId: null,
  llmIsLoading: false,
  llmError: null,
  healthStatus: {} as Record<LLMProviderId, HealthCheckResult | undefined>,

  // Actions
  fetchProviders: async () => {
    set({ llmIsLoading: true, llmError: null });

    try {
      const providers = await fetchProvidersFromIPC();
      const firstProvider = providers[0];
      const defaultModel = firstProvider
        ? getDefaultModel(firstProvider)
        : undefined;

      set({
        providers,
        selectedProviderId: firstProvider?.id || null,
        selectedModelId: defaultModel?.id || null,
        llmIsLoading: false,
      });
    } catch (error) {
      set({
        llmIsLoading: false,
        llmError: {
          code: "UNKNOWN",
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch providers",
          retryable: true,
        },
      });
    }
  },

  selectProvider: (providerId) => {
    const state = get();
    const provider = state.providers.find((p) => p.id === providerId);

    if (provider) {
      const defaultModel = getDefaultModel(provider);
      set({
        selectedProviderId: providerId,
        selectedModelId: defaultModel?.id || null,
      });
    }
  },

  selectModel: (modelId) => {
    set({ selectedModelId: modelId });
  },

  checkHealth: async (providerId) => {
    try {
      const result = await checkHealthFromIPC(providerId);
      set((state) => ({
        healthStatus: {
          ...state.healthStatus,
          [providerId]: result,
        },
      }));
    } catch (error) {
      set((state) => ({
        healthStatus: {
          ...state.healthStatus,
          [providerId]: {
            status: "error",
            providerId,
            errorMessage:
              error instanceof Error ? error.message : "Health check failed",
            checkedAt: new Date(),
          },
        },
      }));
    }
  },

  resetSelection: () => {
    const state = get();
    const firstProvider = state.providers[0];

    if (firstProvider) {
      const defaultModel = getDefaultModel(firstProvider);
      set({
        selectedProviderId: firstProvider.id,
        selectedModelId: defaultModel?.id || null,
      });
    } else {
      set({
        selectedProviderId: null,
        selectedModelId: null,
      });
    }
  },

  clearLLMError: () => {
    set({ llmError: null });
  },

  setLLMLoading: (loading) => {
    set({ llmIsLoading: loading });
  },

  setLLMError: (llmError) => {
    set({ llmError });
  },

  // Selectors
  getSelectedProvider: () => {
    const state = get();
    if (!state.selectedProviderId) return undefined;
    return state.providers.find((p) => p.id === state.selectedProviderId);
  },

  getSelectedModel: () => {
    const state = get();
    const provider = state.getSelectedProvider();
    if (!provider || !state.selectedModelId) return undefined;
    return provider.models.find(
      (m: LLMModel) => m.id === state.selectedModelId,
    );
  },

  isProviderAvailable: (providerId) => {
    const state = get();
    const provider = state.providers.find((p) => p.id === providerId);
    return provider?.isAvailable ?? false;
  },
});
