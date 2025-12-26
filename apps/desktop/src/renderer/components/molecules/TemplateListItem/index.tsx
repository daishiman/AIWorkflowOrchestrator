import { useState } from "react";
import { clsx } from "clsx";
import { Check, Edit2, Trash2 } from "lucide-react";
import type { PromptTemplate } from "@renderer/store/types";

export interface TemplateListItemProps {
  template: PromptTemplate;
  isSelected: boolean;
  onClick: (template: PromptTemplate) => void;
  onEdit?: (templateId: string) => void;
  onDelete?: (templateId: string) => void;
}

/**
 * テンプレート一覧の個別アイテム
 * - プリセットテンプレートにはアクションボタンを表示しない
 * - カスタムテンプレートには編集/削除ボタンを表示
 */
export function TemplateListItem({
  template,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: TemplateListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(template);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(template);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(template.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(template.id);
  };

  const showActions = !template.isPreset && isHovered;

  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-label={template.name}
      data-testid={`template-item-${template.name}`}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={clsx(
        "flex items-center justify-between",
        "px-3 py-2 cursor-pointer",
        "transition-colors duration-150",
        "hover:bg-white/5",
        isSelected ? "bg-white/10" : "bg-transparent",
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isSelected && (
          <Check size={14} className="text-[var(--status-primary,#7aa2f7)]" />
        )}
        <span className="truncate text-sm text-white/80">{template.name}</span>
      </div>

      {showActions && (
        <div className="flex items-center gap-1 ml-2">
          <button
            type="button"
            onClick={handleEdit}
            aria-label="編集"
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/80 transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            aria-label="削除"
            className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </li>
  );
}

export default TemplateListItem;
