import { useCallback, useRef, useEffect } from "react";

export interface FreeTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function FreeTextInput({
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled,
}: FreeTextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (value.trim()) {
          onSubmit();
        }
      }
    },
    [onSubmit, value],
  );

  return (
    <div className="mt-3" data-testid="free-text-input">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder={placeholder ?? "回答を入力してください..."}
        disabled={disabled}
        className="w-full resize-none rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:border-[var(--status-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--status-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="free-text-textarea"
      />
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Enter で送信 / Shift+Enter で改行
      </p>
    </div>
  );
}
