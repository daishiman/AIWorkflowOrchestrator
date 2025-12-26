import { clsx } from "clsx";
import { Save, Trash2 } from "lucide-react";
import type { PromptTemplate } from "@renderer/store/types";
import { TemplateSelector } from "../TemplateSelector";

export interface SystemPromptHeaderProps {
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: PromptTemplate) => void;
  onSaveClick: () => void;
  onClearClick: () => void;
  hasContent: boolean;
  onDeleteTemplate?: (templateId: string) => void;
  onRenameTemplate?: (templateId: string, newName: string) => void;
  disabled?: boolean;
}

// 共通ボタンスタイル
const BUTTON_BASE_CLASSES = clsx(
  "flex items-center gap-1",
  "px-3 py-1.5 rounded-md",
  "text-sm text-white/80",
  "transition-colors duration-150",
  "hover:bg-white/10",
  "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary,#7aa2f7)]/20",
);

/**
 * システムプロンプトヘッダー
 * - テンプレート選択ドロップダウン
 * - 保存・クリアボタン
 */
export function SystemPromptHeader({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onSaveClick,
  onClearClick,
  hasContent,
  onDeleteTemplate,
  onRenameTemplate,
  disabled = false,
}: SystemPromptHeaderProps) {
  const isSaveDisabled = !hasContent || disabled;
  const isClearDisabled = !hasContent || disabled;

  return (
    <div
      data-testid="system-prompt-header"
      className={clsx(
        "flex items-center justify-between",
        "p-3 border-b border-white/10",
      )}
    >
      <TemplateSelector
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelect={onSelectTemplate}
        onDelete={onDeleteTemplate}
        onRename={onRenameTemplate}
        disabled={disabled}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSaveClick}
          disabled={isSaveDisabled}
          data-testid="save-template-button"
          className={clsx(
            BUTTON_BASE_CLASSES,
            isSaveDisabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label="保存"
        >
          <Save size={16} />
          <span>保存</span>
        </button>

        <button
          type="button"
          onClick={onClearClick}
          disabled={isClearDisabled}
          data-testid="clear-prompt-button"
          className={clsx(
            BUTTON_BASE_CLASSES,
            isClearDisabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label="クリア"
        >
          <Trash2 size={16} />
          <span>クリア</span>
        </button>
      </div>
    </div>
  );
}

export default SystemPromptHeader;
