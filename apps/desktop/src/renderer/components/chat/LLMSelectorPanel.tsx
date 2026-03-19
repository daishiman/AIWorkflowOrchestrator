import React from "react";

export interface LLMSelectorPanelProps {
  providers: unknown[];
  selectedProviderId: string | null;
  selectedModelId: string | null;
  onSelectProvider: (id: string) => void;
  onSelectModel: (id: string) => void;
  isLoading?: boolean;
}

export const LLMSelectorPanel: React.FC<LLMSelectorPanelProps> = ({
  selectedProviderId,
  selectedModelId,
}) => {
  return (
    <div data-testid="llm-selector-panel">
      <span data-testid="selected-provider">
        {selectedProviderId ?? "none"}
      </span>
      <span data-testid="selected-model">{selectedModelId ?? "none"}</span>
    </div>
  );
};
