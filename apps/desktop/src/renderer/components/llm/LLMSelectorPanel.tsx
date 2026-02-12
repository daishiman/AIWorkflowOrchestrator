/**
 * @file LLMSelectorPanel Component
 * @description LLM選択統合パネル（Provider, Model, Health を統合）
 * @feature chat-multi-llm-switching
 */

import React, { useEffect, useCallback, useRef } from "react";
import {
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useLLMIsLoading,
  useLLMError,
  useLLMHealthStatus,
  useFetchProviders,
  useSelectProvider,
  useSelectModel,
  useCheckLLMHealth,
} from "@/renderer/store";
import { ProviderSelector } from "./ProviderSelector";
import { ModelSelector } from "./ModelSelector";
import { HealthIndicator } from "./HealthIndicator";

export interface LLMSelectorPanelProps {
  isVisible?: boolean;
  onClose?: () => void;
  compact?: boolean;
  className?: string;
}

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  isVisible = true,
  onClose,
  compact = false,
  className = "",
}) => {
  // 個別セレクタ（P31対策: 参照が安定）
  const providers = useLLMProviders();
  const selectedProviderId = useSelectedProviderId();
  const selectedModelId = useSelectedModelId();
  const isLoading = useLLMIsLoading();
  const error = useLLMError();
  const healthStatus = useLLMHealthStatus();
  const fetchProviders = useFetchProviders();
  const selectProvider = useSelectProvider();
  const selectModel = useSelectModel();
  const checkHealth = useCheckLLMHealth();

  // Get selected provider's models
  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const models = selectedProvider?.models ?? [];

  // Get health status for selected provider
  const currentHealth = selectedProviderId
    ? healthStatus[selectedProviderId]
    : undefined;

  // Fetch providers on mount
  // 個別セレクタは参照が安定するため、useRefガード不要
  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Check health when provider changes
  // 個別セレクタは参照が安定するため、prevProviderIdRefのみ使用
  const prevProviderIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      selectedProviderId &&
      selectedProviderId !== prevProviderIdRef.current
    ) {
      prevProviderIdRef.current = selectedProviderId;
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]);

  const handleRetry = useCallback(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleRefreshHealth = useCallback(() => {
    if (selectedProviderId) {
      checkHealth(selectedProviderId);
    }
  }, [selectedProviderId, checkHealth]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="group"
      aria-label="LLM設定"
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm
        ${compact ? "p-2" : "p-4"}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          LLM設定
        </h3>
        <HealthIndicator
          healthStatus={currentHealth}
          onRefresh={handleRefreshHealth}
          isChecking={isLoading}
          size={compact ? "sm" : "md"}
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div
          className={`
            mb-4 p-3 rounded-md
            bg-red-50 dark:bg-red-900/20
            border border-red-200 dark:border-red-800
          `}
        >
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300">
                {error.message}
              </p>
              {error.retryable && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className={`
                    mt-2 text-sm font-medium text-red-600 dark:text-red-400
                    hover:text-red-800 dark:hover:text-red-200
                    focus:outline-none focus:underline
                  `}
                >
                  リトライ
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          data-testid="loading-overlay"
          className={`
            absolute inset-0 bg-white/50 dark:bg-gray-800/50
            flex items-center justify-center rounded-lg
            z-10
          `}
        >
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Selectors */}
      <div className={`space-y-4 ${compact ? "space-y-2" : ""}`}>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Provider
          </label>
          <ProviderSelector
            providers={providers}
            selectedProviderId={selectedProviderId}
            onSelect={selectProvider}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
            Model
          </label>
          <ModelSelector
            models={models}
            selectedModelId={selectedModelId}
            onSelect={selectModel}
            disabled={isLoading || !selectedProviderId}
          />
        </div>
      </div>

      {/* Footer (for modal mode) */}
      {onClose && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`
              px-4 py-2 text-sm font-medium
              text-gray-700 dark:text-gray-200
              bg-gray-100 dark:bg-gray-700
              rounded-md hover:bg-gray-200 dark:hover:bg-gray-600
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            閉じる
          </button>
        </div>
      )}
    </div>
  );
};
