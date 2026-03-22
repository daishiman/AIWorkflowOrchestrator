/**
 * @file InlineModelSelector
 * @description チャット画面向けコンパクトモデルセレクタ（共通コンポーネント）
 * @feature chat-inline-model-selector
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/renderer/lib/utils";
import type { LLMProvider, LLMProviderId } from "@repo/shared/types/llm";
import {
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useLLMHealthStatus,
  useFetchProviders,
  useSelectProvider,
  useSelectModel,
  useCheckLLMHealth,
} from "@/renderer/store";

// ============================================
// Types
// ============================================

export type HealthStatus =
  | "healthy"
  | "degraded"
  | "checking"
  | "error"
  | "unknown";

export interface InlineModelSelectorProps {
  /** コンパクト表示モード（デフォルト: false） */
  compact?: boolean;
  /** 追加CSSクラス名 */
  className?: string;
  /** Provider/Model選択変更時のコールバック */
  onSelectionChange?: (selection: {
    providerId: string;
    modelId: string;
  }) => void;
  /** 無効化フラグ（デフォルト: false） */
  disabled?: boolean;
  /** プロバイダーリスト（Store経由で取得しない場合に直接渡す） */
  providers?: LLMProvider[];
  /** 選択中プロバイダーID（Store経由で取得しない場合に直接渡す） */
  selectedProviderId?: LLMProviderId | null;
  /** 選択中モデルID（Store経由で取得しない場合に直接渡す） */
  selectedModelId?: string | null;
  /** ヘルスステータス（Store経由で取得しない場合に直接渡す） */
  healthStatus?: HealthStatus;
}

// ============================================
// Design Tokens (P47: exported for test import)
// ============================================

export const selectorTriggerStyles = {
  base: "inline-flex items-center gap-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer select-none",
  default:
    "border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]",
  active:
    "border border-[var(--accent)] bg-[var(--bg-secondary)] text-[var(--text-primary)]",
  disabled:
    "border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-tertiary)] cursor-not-allowed opacity-60",
  normalSize: "px-3 py-1.5",
  compactSize: "px-2 py-1 text-xs",
} as const;

export const healthDotStyles: Record<HealthStatus, string> = {
  healthy: "bg-[var(--status-success)]",
  degraded: "bg-[var(--status-warning)]",
  checking: "bg-[var(--status-warning)] animate-pulse",
  error: "bg-[var(--status-error)]",
  unknown: "bg-[var(--text-tertiary)]",
} as const;

export const dropdownStyles = {
  container:
    "absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-lg",
  sectionLabel:
    "px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]",
  option:
    "flex w-full items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-[var(--bg-tertiary)]",
  optionSelected: "text-[var(--accent)] font-medium",
  optionDefault: "text-[var(--text-primary)]",
  emptyMessage: "px-3 py-2 text-sm text-[var(--text-tertiary)] italic",
} as const;

// ============================================
// Helper
// ============================================

function resolveHealthStatus(
  healthStatusMap: Record<string, { status?: string } | undefined> | undefined,
  providerId: LLMProviderId | string | null,
): HealthStatus {
  if (!providerId || !healthStatusMap) return "unknown";
  const result = healthStatusMap[providerId];
  if (!result) return "unknown";
  const status = result.status;
  if (
    status === "healthy" ||
    status === "degraded" ||
    status === "checking" ||
    status === "error"
  ) {
    return status;
  }
  return "unknown";
}

// ============================================
// SelectorTrigger (atom)
// ============================================

interface SelectorTriggerProps {
  providerName?: string;
  modelName?: string;
  healthStatus: HealthStatus;
  isOpen: boolean;
  compact?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function SelectorTrigger({
  providerName,
  modelName,
  healthStatus,
  isOpen,
  compact,
  disabled,
  onClick,
}: SelectorTriggerProps) {
  const hasSelection = providerName && modelName;
  const displayText = hasSelection
    ? compact
      ? modelName
      : `${providerName} / ${modelName}`
    : "モデルを選択";

  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-label={`LLMモデル選択: ${hasSelection ? `${providerName} / ${modelName}` : "モデルを選択"}`}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        selectorTriggerStyles.base,
        compact
          ? selectorTriggerStyles.compactSize
          : selectorTriggerStyles.normalSize,
        disabled
          ? selectorTriggerStyles.disabled
          : isOpen
            ? selectorTriggerStyles.active
            : selectorTriggerStyles.default,
      )}
    >
      {/* Health Dot */}
      <span
        className={cn(
          "inline-block h-2 w-2 shrink-0 rounded-full",
          healthDotStyles[healthStatus],
        )}
        aria-hidden="true"
        data-testid={`health-dot-${healthStatus}`}
      />

      {/* Display Text */}
      <span className="truncate">{displayText}</span>

      {/* Chevron */}
      <svg
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform",
          isOpen && "rotate-180",
        )}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

// ============================================
// SelectorDropdown (molecule)
// ============================================

interface SelectorDropdownProps {
  providers: LLMProvider[];
  selectedProviderId: LLMProviderId | string | null;
  selectedModelId: string | null;
  onProviderSelect: (providerId: LLMProviderId) => void;
  onModelSelect: (modelId: string) => void;
}

function SelectorDropdown({
  providers,
  selectedProviderId,
  selectedModelId,
  onProviderSelect,
  onModelSelect,
}: SelectorDropdownProps) {
  const selectedProvider = providers.find((p) => p.id === selectedProviderId);
  const models = selectedProvider?.models ?? [];

  return (
    <div
      role="listbox"
      aria-label="LLMモデル一覧"
      className={dropdownStyles.container}
    >
      {/* Provider Section */}
      <div role="group" aria-label="Provider">
        <div className={dropdownStyles.sectionLabel}>Provider</div>
        {providers.length === 0 ? (
          <div className={dropdownStyles.emptyMessage}>
            プロバイダーがありません
          </div>
        ) : (
          providers.map((provider) => (
            <button
              key={provider.id}
              type="button"
              role="option"
              aria-selected={provider.id === selectedProviderId}
              onClick={() => onProviderSelect(provider.id)}
              className={cn(
                dropdownStyles.option,
                provider.id === selectedProviderId
                  ? dropdownStyles.optionSelected
                  : dropdownStyles.optionDefault,
              )}
            >
              {provider.id === selectedProviderId && (
                <span aria-hidden="true">&#10003;</span>
              )}
              {provider.name}
            </button>
          ))
        )}
      </div>

      {/* Model Section */}
      {selectedProvider && (
        <div role="group" aria-label="Model">
          <div
            className={cn(
              dropdownStyles.sectionLabel,
              "mt-1 border-t border-[var(--border-primary)] pt-1.5",
            )}
          >
            Model
          </div>
          {models.length === 0 ? (
            <div className={dropdownStyles.emptyMessage}>
              モデルがありません
            </div>
          ) : (
            models.map((model) => (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={model.id === selectedModelId}
                onClick={() => onModelSelect(model.id)}
                className={cn(
                  dropdownStyles.option,
                  model.id === selectedModelId
                    ? dropdownStyles.optionSelected
                    : dropdownStyles.optionDefault,
                )}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    {model.id === selectedModelId && (
                      <span aria-hidden="true">&#10003;</span>
                    )}
                    {model.name}
                  </div>
                  {model.contextWindow && (
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {Math.round(model.contextWindow / 1000)}K context
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// InlineModelSelector (main component)
// ============================================

export function InlineModelSelector({
  compact = false,
  className,
  onSelectionChange,
  disabled = false,
  providers: providersProp,
  selectedProviderId: selectedProviderIdProp,
  selectedModelId: selectedModelIdProp,
  healthStatus: healthStatusProp,
}: InlineModelSelectorProps) {
  // Store selectors (P31: individual selectors only)
  const storeProviders = useLLMProviders();
  const storeSelectedProviderId = useSelectedProviderId();
  const storeSelectedModelId = useSelectedModelId();
  const storeHealthStatus = useLLMHealthStatus();
  const fetchProviders = useFetchProviders();
  const selectProvider = useSelectProvider();
  const selectModel = useSelectModel();
  const checkHealth = useCheckLLMHealth();

  // Props override Store (for standalone usage / testing)
  const providers = providersProp ?? storeProviders ?? [];
  const currentProviderId =
    selectedProviderIdProp !== undefined
      ? selectedProviderIdProp
      : storeSelectedProviderId;
  const currentModelId =
    selectedModelIdProp !== undefined
      ? selectedModelIdProp
      : storeSelectedModelId;
  const currentHealthStatus =
    healthStatusProp ??
    resolveHealthStatus(storeHealthStatus, currentProviderId);

  // Local state
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const prevProviderIdRef = useRef<string | null>(null);

  // Derived
  const selectedProvider = providers.find((p) => p.id === currentProviderId);
  const selectedModel = selectedProvider?.models.find(
    (m) => m.id === currentModelId,
  );

  // Handlers
  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleProviderSelect = useCallback(
    (providerId: LLMProviderId) => {
      const provider = providers.find((p) => p.id === providerId);
      const defaultModel =
        provider?.models.find((model) => model.isDefault) ??
        provider?.models[0];
      if (!defaultModel) return;

      // Provider選択時は既定モデルを即時選択しつつ、dropdownは開いたままにして
      // 後続のモデル再選択を同じ操作内で続けられるようにする。
      if (providersProp) {
        onSelectionChange?.({ providerId, modelId: defaultModel.id });
        return;
      }

      selectProvider(providerId);
      onSelectionChange?.({ providerId, modelId: defaultModel.id });
    },
    [providersProp, providers, selectProvider, onSelectionChange],
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      if (providersProp) {
        // Standalone mode
        const providerId = currentProviderId;
        if (providerId) {
          onSelectionChange?.({ providerId, modelId });
        }
      } else {
        selectModel(modelId);
        if (currentProviderId) {
          onSelectionChange?.({ providerId: currentProviderId, modelId });
        }
      }
      setIsOpen(false);
    },
    [providersProp, currentProviderId, selectModel, onSelectionChange],
  );

  // Outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Store-backed mode lazily hydrates providers the first time the selector appears.
  useEffect(() => {
    if (providersProp !== undefined || storeProviders.length > 0) {
      return;
    }
    void fetchProviders();
  }, [providersProp, storeProviders.length, fetchProviders]);

  // Refresh the health badge whenever the effective provider changes.
  useEffect(() => {
    if (healthStatusProp !== undefined) {
      return;
    }

    if (!currentProviderId) {
      prevProviderIdRef.current = null;
      return;
    }

    if (prevProviderIdRef.current === currentProviderId) {
      return;
    }

    prevProviderIdRef.current = currentProviderId;
    void checkHealth(currentProviderId as LLMProviderId);
  }, [healthStatusProp, currentProviderId, checkHealth]);

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        // Return focus to trigger (T10-5)
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div
        ref={(el) => {
          triggerRef.current = el?.querySelector("button") ?? null;
        }}
      >
        <SelectorTrigger
          providerName={selectedProvider?.name}
          modelName={selectedModel?.name}
          healthStatus={currentHealthStatus}
          isOpen={isOpen}
          compact={compact}
          disabled={disabled}
          onClick={handleToggle}
        />
      </div>
      {isOpen && (
        <SelectorDropdown
          providers={providers}
          selectedProviderId={currentProviderId}
          selectedModelId={currentModelId}
          onProviderSelect={handleProviderSelect}
          onModelSelect={handleModelSelect}
        />
      )}
    </div>
  );
}
