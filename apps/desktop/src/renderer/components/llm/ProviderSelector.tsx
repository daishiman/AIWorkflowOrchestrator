/**
 * @file ProviderSelector Component
 * @description LLMプロバイダー選択ドロップダウン
 * @feature chat-multi-llm-switching
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { LLMProvider, LLMProviderId } from "@repo/shared/types/llm";

export interface ProviderSelectorProps {
  providers: LLMProvider[];
  selectedProviderId: LLMProviderId | null;
  onSelect: (providerId: LLMProviderId) => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProviderId,
  onSelect,
  disabled = false,
  isLoading = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

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
          selectedProviderId
            ? providers.findIndex((p) => p.id === selectedProviderId)
            : 0,
        );
      }
    }
  }, [disabled, isLoading, isOpen, providers, selectedProviderId]);

  const handleSelect = useCallback(
    (provider: LLMProvider) => {
      if (provider.isAvailable) {
        onSelect(provider.id);
        setIsOpen(false);
      }
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
          if (isOpen && focusedIndex >= 0 && providers[focusedIndex]) {
            handleSelect(providers[focusedIndex]);
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
              prev < providers.length - 1 ? prev + 1 : prev,
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
      providers,
      handleSelect,
      handleToggle,
    ],
  );

  // Empty state
  if (providers.length === 0) {
    return (
      <div
        className={`flex items-center justify-center px-3 py-2 text-sm text-gray-500 ${className}`}
      >
        プロバイダーがありません
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      <label id="provider-selector-label" className="sr-only">
        Provider
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-labelledby="provider-selector-label"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="provider-listbox"
        aria-activedescendant={
          isOpen && focusedIndex >= 0
            ? `provider-option-${providers[focusedIndex]?.id}`
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
          ) : selectedProvider ? (
            selectedProvider.name
          ) : (
            <span className="text-gray-400">プロバイダーを選択</span>
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
          ref={listboxRef}
          id="provider-listbox"
          role="listbox"
          aria-labelledby="provider-selector-label"
          className={`
            absolute z-50 mt-1 w-full
            bg-white border border-gray-200 rounded-md shadow-lg
            max-h-60 overflow-auto
            dark:bg-gray-800 dark:border-gray-600
          `}
        >
          {providers.map((provider, index) => (
            <div
              key={provider.id}
              id={`provider-option-${provider.id}`}
              role="option"
              aria-selected={provider.id === selectedProviderId}
              aria-disabled={!provider.isAvailable}
              onClick={() => handleSelect(provider)}
              className={`
                px-3 py-2 cursor-pointer text-sm
                ${provider.id === selectedProviderId ? "bg-blue-50 dark:bg-blue-900" : ""}
                ${focusedIndex === index ? "bg-gray-100 dark:bg-gray-700" : ""}
                ${!provider.isAvailable ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"}
              `}
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    !provider.isAvailable
                      ? "text-gray-400"
                      : "text-gray-900 dark:text-gray-100"
                  }
                >
                  {provider.name}
                </span>
                {!provider.isAvailable && (
                  <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                    APIキー未設定
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
