import React from "react";

export interface ComposerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ComposerInput: React.FC<ComposerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "メッセージを入力",
}) => {
  return (
    <textarea
      data-testid="composer-input"
      aria-label="メッセージを入力"
      aria-multiline="true"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onSubmit?.();
        }
      }}
    />
  );
};
