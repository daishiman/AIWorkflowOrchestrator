import { clsx } from "clsx";
import type { PromptTemplate } from "@renderer/store/types";
import { SystemPromptHeader } from "@renderer/components/molecules/SystemPromptHeader";
import { SystemPromptTextArea } from "@renderer/components/molecules/SystemPromptTextArea";
import { CharacterCounter } from "@renderer/components/atoms/CharacterCounter";
import { SYSTEM_PROMPT_MAX_LENGTH } from "@renderer/constants/systemPrompt";

export interface SystemPromptPanelProps {
  isExpanded: boolean;
  systemPrompt: string;
  onSystemPromptChange: (value: string) => void;
  templates: PromptTemplate[];
  selectedTemplateId?: string | null;
  onSelectTemplate: (template: PromptTemplate) => void;
  onSaveTemplate: (content: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
  onClear: () => void;
  className?: string;
}

/**
 * システムプロンプト設定パネル
 * - 展開/折りたたみ対応
 * - GlassPanelスタイル
 */
export function SystemPromptPanel({
  isExpanded,
  systemPrompt,
  onSystemPromptChange,
  templates,
  selectedTemplateId = null,
  onSelectTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onClear,
  className,
}: SystemPromptPanelProps) {
  if (!isExpanded) {
    return null;
  }

  const hasContent = systemPrompt.trim().length > 0;

  const handleSaveClick = () => {
    onSaveTemplate(systemPrompt);
  };

  return (
    <div
      id="system-prompt-panel"
      role="region"
      aria-labelledby="system-prompt-label"
      className={clsx(
        "mx-4 mt-2",
        "bg-white/5 backdrop-blur-md",
        "border border-white/10 rounded-lg",
        "transition-all duration-200 ease-out",
        className,
      )}
    >
      <span id="system-prompt-label" className="sr-only">
        システムプロンプト設定
      </span>

      <SystemPromptHeader
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={onSelectTemplate}
        onSaveClick={handleSaveClick}
        onClearClick={onClear}
        hasContent={hasContent}
        onDeleteTemplate={onDeleteTemplate}
      />

      <div className="p-3">
        <SystemPromptTextArea
          value={systemPrompt}
          onChange={onSystemPromptChange}
          maxLength={SYSTEM_PROMPT_MAX_LENGTH}
        />

        <CharacterCounter
          current={systemPrompt.length}
          max={SYSTEM_PROMPT_MAX_LENGTH}
          className="mt-2"
        />
      </div>
    </div>
  );
}

export default SystemPromptPanel;
