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
 * Renderer の選択状態を Main Process の ai.chat 実行設定へ同期する。
 * API が未提供でも UI 操作をブロックしない。
 */
async function syncSelectedConfigToMain(
  providerId: LLMProviderId,
  modelId: string,
): Promise<void> {
  if (
    typeof window === "undefined" ||
    !window.electronAPI?.llm?.setSelectedConfig
  ) {
    return;
  }

  try {
    await window.electronAPI.llm.setSelectedConfig({ providerId, modelId });
  } catch (error) {
    console.warn("[LLMSlice] Failed to sync selected config to main:", error);
  }
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
// Validation (TASK-FIX-LLM-CONFIG-PERSISTENCE)
// ============================================

/**
 * 永続化されたLLM選択状態を検証し、有効な値のみを返す。
 *
 * - providers未取得（空配列）の場合は判断保留 → 既存値を保持
 * - 無効なProviderIDはnullクリア（P62対策: DEFAULT_CONFIGへのfallback禁止）
 * - 有効なProviderID + 無効なModelIDの場合、ModelIDのみnullクリア
 */
export function validateAndSyncPersistedConfig(
  persistedProviderId: LLMProviderId | null,
  persistedModelId: string | null,
  availableProviders: LLMProvider[],
): { providerId: LLMProviderId | null; modelId: string | null } {
  // providers未取得（空配列）の場合は判断保留 → 既存値を保持
  if (availableProviders.length === 0) {
    return { providerId: persistedProviderId, modelId: persistedModelId };
  }

  if (persistedProviderId === null) {
    return { providerId: null, modelId: null };
  }

  const providerExists = availableProviders.some(
    (p) => p.id === persistedProviderId,
  );

  if (!providerExists) {
    // P62対策: 無効なProviderIDはnullクリア（DEFAULT_CONFIGへのfallback禁止）
    return { providerId: null, modelId: null };
  }

  const provider = availableProviders.find((p) => p.id === persistedProviderId);
  const modelExists = provider?.models.some(
    (m: LLMModel) => m.id === persistedModelId,
  );

  return {
    providerId: persistedProviderId,
    modelId: modelExists ? persistedModelId : null,
  };
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
      const currentState = get();

      // TASK-FIX-LLM-CONFIG-PERSISTENCE: 永続化された選択状態をバリデーション
      const validated = validateAndSyncPersistedConfig(
        currentState.selectedProviderId,
        currentState.selectedModelId,
        providers,
      );

      // 初回起動（persistedが両方null）の場合のみfirstProviderを選択
      const isFirstLaunch =
        validated.providerId === null &&
        currentState.selectedProviderId === null;
      let finalProviderId = validated.providerId;
      let finalModelId = validated.modelId;

      if (isFirstLaunch && providers.length > 0) {
        const firstProvider = providers[0];
        const defaultModel = firstProvider
          ? getDefaultModel(firstProvider)
          : undefined;
        finalProviderId = firstProvider?.id || null;
        finalModelId = defaultModel?.id || null;
      }

      set({
        providers,
        selectedProviderId: finalProviderId,
        selectedModelId: finalModelId,
        llmIsLoading: false,
      });

      if (finalProviderId && finalModelId) {
        void syncSelectedConfigToMain(finalProviderId, finalModelId);
      }
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

      if (defaultModel?.id) {
        void syncSelectedConfigToMain(providerId, defaultModel.id);
      }
    }
  },

  selectModel: (modelId) => {
    set({ selectedModelId: modelId });

    const { selectedProviderId } = get();
    if (selectedProviderId) {
      void syncSelectedConfigToMain(selectedProviderId, modelId);
    }
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

      if (defaultModel?.id) {
        void syncSelectedConfigToMain(firstProvider.id, defaultModel.id);
      }
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
