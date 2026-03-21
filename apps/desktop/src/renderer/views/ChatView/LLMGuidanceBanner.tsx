import React from "react";
import { useSelectedModelId, useSelectedProviderId } from "../../store";

interface LLMGuidanceBannerProps {
  onNavigateToSettings: () => void;
}

export const LLMGuidanceBanner: React.FC<LLMGuidanceBannerProps> = ({
  onNavigateToSettings,
}) => {
  const selectedModelId = useSelectedModelId();
  const selectedProviderId = useSelectedProviderId();

  const isModelSelected = selectedModelId != null && selectedProviderId != null;

  if (isModelSelected) {
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
        AIモデルが選択されていません
      </span>
      <button
        type="button"
        onClick={onNavigateToSettings}
        aria-label="設定画面へ移動"
        className="shrink-0 rounded-md px-3 py-1 text-sm font-medium text-[#007AFF] hover:bg-blue-50 dark:text-[#0A84FF] dark:hover:bg-blue-950 transition-colors duration-200"
      >
        設定画面へ
      </button>
    </div>
  );
};

LLMGuidanceBanner.displayName = "LLMGuidanceBanner";
