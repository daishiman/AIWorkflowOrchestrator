import { useRef, useEffect, useCallback, useState } from "react";
import { clsx } from "clsx";
import {
  SYSTEM_PROMPT_MAX_LENGTH,
  TEXTAREA_MIN_HEIGHT,
  TEXTAREA_MAX_HEIGHT,
  TAB_INDENT_SPACES,
} from "@renderer/constants/systemPrompt";

export interface SystemPromptTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * システムプロンプト入力テキストエリア
 * - 自動リサイズ対応
 * - 文字数制限対応
 * - アクセシビリティ対応
 */
export function SystemPromptTextArea({
  value,
  onChange,
  maxLength = SYSTEM_PROMPT_MAX_LENGTH,
  placeholder = "システムプロンプトを入力...",
  disabled = false,
  className,
}: SystemPromptTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 自動リサイズ
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
    }
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = " ".repeat(TAB_INDENT_SPACES);
      const newValue =
        value.substring(0, start) + indent + value.substring(end);
      onChange(newValue);
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          start + TAB_INDENT_SPACES;
      }, 0);
    }
  };

  const isOverLimit = value.length > maxLength;
  const isAtLimit = value.length >= maxLength;

  const borderClass = isAtLimit
    ? "border-red-400"
    : isFocused
      ? "border-[var(--status-primary)]"
      : "border-white/10";

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      maxLength={maxLength}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="system-prompt-textarea"
      style={{
        minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
        maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
        resize: "vertical",
      }}
      className={clsx(
        "w-full p-3",
        "bg-black/20",
        "border rounded-md",
        "font-mono text-[13px] leading-relaxed",
        "text-white placeholder:text-white/30",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[var(--status-primary,#7aa2f7)]/20",
        borderClass,
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      aria-label="システムプロンプト入力"
      aria-describedby="character-counter"
      aria-invalid={isOverLimit}
      role="textbox"
      aria-multiline="true"
    />
  );
}

export default SystemPromptTextArea;
