import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import type { PromptTemplate } from "@renderer/store/types";
import { TemplateListItem } from "../TemplateListItem";

export interface TemplateSelectorProps {
  templates: PromptTemplate[];
  selectedTemplateId: string | null;
  onSelect: (template: PromptTemplate) => void;
  onDelete?: (templateId: string) => void;
  onRename?: (templateId: string, newName: string) => void;
  disabled?: boolean;
}

/**
 * テンプレート選択ドロップダウン
 * - プリセットとカスタムをグループ分けして表示
 * - キーボードナビゲーション対応
 */
export function TemplateSelector({
  templates,
  selectedTemplateId,
  onSelect,
  onDelete,
  onRename,
  disabled = false,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId],
  );

  const presetTemplates = useMemo(
    () => templates.filter((t) => t.isPreset),
    [templates],
  );

  const customTemplates = useMemo(
    () => templates.filter((t) => !t.isPreset),
    [templates],
  );

  const allItems = useMemo(
    () => [...presetTemplates, ...customTemplates],
    [presetTemplates, customTemplates],
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (template: PromptTemplate) => {
      onSelect(template);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && allItems[focusedIndex]) {
          handleSelect(allItems[focusedIndex]);
        }
        break;
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        data-testid="template-selector"
        className={clsx(
          "flex items-center justify-between",
          "w-48 px-3 py-2",
          "bg-white/5 border border-white/10 rounded-md",
          "text-sm text-left text-white/80",
          "transition-colors duration-150",
          "hover:bg-white/10 hover:border-white/20",
          "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary,#7aa2f7)]/20",
          disabled && "opacity-50 cursor-not-allowed",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`テンプレートを選択${selectedTemplate ? `: ${selectedTemplate.name}` : ""}`}
      >
        <span className="truncate">
          {selectedTemplate?.name || "テンプレートを選択"}
        </span>
        <ChevronDown
          size={16}
          className={clsx(
            "ml-2 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <ul
          ref={listboxRef}
          data-testid="template-list"
          role="listbox"
          aria-activedescendant={
            selectedTemplateId
              ? `template-${selectedTemplateId}`
              : focusedIndex >= 0 && allItems[focusedIndex]
                ? `template-${allItems[focusedIndex].id}`
                : undefined
          }
          onKeyDown={handleKeyDown}
          tabIndex={0}
          className={clsx(
            "absolute z-50 mt-1",
            "w-64 max-h-80 overflow-auto",
            "bg-[var(--bg-glass,#1f1f28)] border border-white/10 rounded-md",
            "shadow-lg backdrop-blur-md",
          )}
        >
          {/* プリセットグループ */}
          {presetTemplates.length > 0 && (
            <div className="py-1">
              <div
                className="px-3 py-1 text-xs text-white/50"
                role="presentation"
              >
                プリセット
              </div>
              {presetTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  isSelected={template.id === selectedTemplateId}
                  onClick={handleSelect}
                />
              ))}
            </div>
          )}

          {/* 区切り線 */}
          {presetTemplates.length > 0 && (
            <div className="border-t border-white/10" role="separator" />
          )}

          {/* カスタムグループ */}
          <div className="py-1">
            <div
              className="px-3 py-1 text-xs text-white/50"
              role="presentation"
            >
              カスタム
            </div>
            {customTemplates.length > 0 ? (
              customTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                  isSelected={template.id === selectedTemplateId}
                  onClick={handleSelect}
                  onEdit={(id) => onRename?.(id, template.name)}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-white/40">
                「保存」ボタンで追加できます
              </div>
            )}
          </div>
        </ul>
      )}
    </div>
  );
}

export default TemplateSelector;
