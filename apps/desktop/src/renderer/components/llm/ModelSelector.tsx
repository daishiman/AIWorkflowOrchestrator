/**
 * @file ModelSelector Component
 * @description LLMモデル選択ドロップダウン
 * @feature chat-multi-llm-switching
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { LLMModel } from "@repo/shared/types/llm";

export interface ModelSelectorProps {
  models: LLMModel[];
  selectedModelId: string | null;
  onSelect: (modelId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * Format context window size for display
 */
function formatContextWindow(size: number | undefined): string | null {
  if (!size) return null;
  if (size >= 1000000) {
    return `${Math.round(size / 1000000)}M`;
  }
  if (size >= 1000) {
    return `${Math.round(size / 1000)}k`;
  }
  return `${size}`;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModelId,
  onSelect,
  disabled = false,
  isLoading = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get selected model or fall back to default
  const defaultModel = models.find((m) => m.isDefault);
  const effectiveSelectedId = selectedModelId ?? defaultModel?.id ?? null;
  const selectedModel = models.find((m) => m.id === effectiveSelectedId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = useCallback(() => {
    if (!disabled && !isLoading) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
        setFocusedIndex(
          effectiveSelectedId
            ? models.findIndex((m) => m.id === effectiveSelectedId)
            : 0,
        );
      }
    }
  }, [disabled, isLoading, isOpen, models, effectiveSelectedId]);

  const handleSelect = useCallback(
    (model: LLMModel) => {
      onSelect(model.id);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled || isLoading) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (isOpen && focusedIndex >= 0 && models[focusedIndex]) {
            handleSelect(models[focusedIndex]);
          } else {
            handleToggle();
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(0);
          } else {
            setFocusedIndex((prev) =>
              prev < models.length - 1 ? prev + 1 : prev,
            );
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case "Tab":
          setIsOpen(false);
          break;
      }
    },
    [
      disabled,
      isLoading,
      isOpen,
      focusedIndex,
      models,
      handleSelect,
      handleToggle,
    ],
  );

  // Empty state when disabled without models
  if (disabled && models.length === 0) {
    return (
      <div
        className={`flex items-center px-3 py-2 text-sm text-gray-400 border border-gray-300 rounded-md bg-gray-100 ${className}`}
      >
        先にプロバイダーを選択してください
      </div>
    );
  }

  // Empty state
  if (models.length === 0) {
    return (
      <div
        className={`flex items-center justify-center px-3 py-2 text-sm text-gray-500 ${className}`}
      >
        モデルがありません
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label id="model-selector-label" className="sr-only">
        Model
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-labelledby="model-selector-label"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="model-listbox"
        aria-activedescendant={
          isOpen && focusedIndex >= 0
            ? `model-option-${models[focusedIndex]?.id}`
            : undefined
        }
        disabled={disabled || isLoading}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between px-3 py-2
          rounded-md border border-gray-300 bg-white
          text-left text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100
        `}
      >
        <span className="flex items-center gap-2">
          {isLoading ? (
            <span
              role="progressbar"
              aria-label="Loading"
              className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            />
          ) : selectedModel ? (
            selectedModel.name
          ) : (
            <span className="text-gray-400">モデルを選択</span>
          )}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="model-listbox"
          role="listbox"
          aria-labelledby="model-selector-label"
          className={`
            absolute z-50 mt-1 w-full
            bg-white border border-gray-200 rounded-md shadow-lg
            max-h-60 overflow-auto
            dark:bg-gray-800 dark:border-gray-600
          `}
        >
          {models.map((model, index) => {
            const contextDisplay = formatContextWindow(model.contextWindow);
            return (
              <div
                key={model.id}
                id={`model-option-${model.id}`}
                role="option"
                aria-selected={model.id === effectiveSelectedId}
                data-default={model.isDefault ? "true" : undefined}
                onClick={() => handleSelect(model)}
                className={`
                  px-3 py-2 cursor-pointer text-sm
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  ${model.id === effectiveSelectedId ? "bg-blue-50 dark:bg-blue-900" : ""}
                  ${focusedIndex === index ? "bg-gray-100 dark:bg-gray-700" : ""}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-gray-100">
                      {model.name}
                    </span>
                    {model.isDefault && (
                      <span className="text-xs text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        デフォルト
                      </span>
                    )}
                  </div>
                  {contextDisplay && (
                    <span className="text-xs text-gray-400">
                      {contextDisplay}
                    </span>
                  )}
                </div>
                {model.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {model.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
