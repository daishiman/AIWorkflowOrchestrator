import React from "react";
import { useSelectedModelId, useSelectedProviderId } from "../../store";
import {
  createGuidanceActionDispatcher,
  deriveModelSelectionBlockedReason,
  getModelSelectionGuidance,
} from "../../guidance/modelSelectionGuidance";
import { openExecutionConsole } from "../../actions/executionConsole";

interface LLMGuidanceBannerProps {
  onNavigateToSettings: () => void;
}

export const LLMGuidanceBanner: React.FC<LLMGuidanceBannerProps> = ({
  onNavigateToSettings,
}) => {
  const selectedModelId = useSelectedModelId();
  const selectedProviderId = useSelectedProviderId();
  const blockedReason = deriveModelSelectionBlockedReason({
    selectedProviderId,
    selectedModelId,
  });
  const guidance = getModelSelectionGuidance(blockedReason);
  const resolveAction = createGuidanceActionDispatcher({
    openSettings: onNavigateToSettings,
    openExecutionConsole: () => openExecutionConsole(),
  });
  const primaryAction = guidance?.primaryAction;
  const onPrimaryAction = primaryAction
    ? resolveAction(primaryAction.type)
    : undefined;
  const secondaryAction = guidance?.secondaryAction;
  const onSecondaryAction = secondaryAction
    ? resolveAction(secondaryAction.type)
    : undefined;

  if (!guidance) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mx-4 mt-2 flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm dark:border-orange-800 dark:bg-orange-950 transition-opacity duration-200"
    >
      <span className="text-orange-500 dark:text-orange-400" aria-hidden="true">
        &#x26A0;
      </span>
      <span className="flex-1 text-gray-900 dark:text-gray-100">
        {guidance.message}
      </span>
      {primaryAction && onPrimaryAction ? (
        <button
          type="button"
          onClick={onPrimaryAction}
          aria-label={primaryAction.ariaLabel ?? primaryAction.label}
          className="shrink-0 rounded-md px-3 py-1 text-sm font-medium text-[#007AFF] hover:bg-blue-50 dark:text-[#0A84FF] dark:hover:bg-blue-950 transition-colors duration-200"
        >
          {primaryAction.label}
        </button>
      ) : null}
      {secondaryAction && onSecondaryAction ? (
        <button
          type="button"
          onClick={onSecondaryAction}
          aria-label={secondaryAction.ariaLabel ?? secondaryAction.label}
          className="shrink-0 rounded-md px-3 py-1 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors duration-200"
        >
          {secondaryAction.label}
        </button>
      ) : null}
    </div>
  );
};

LLMGuidanceBanner.displayName = "LLMGuidanceBanner";
