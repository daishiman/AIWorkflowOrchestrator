import React from "react";

export interface ComposerAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  canSubmit: boolean;
  isStreaming: boolean;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ComposerArea: React.FC<ComposerAreaProps> = ({
  value,
  onChange,
  onSubmit,
  canSubmit,
  isStreaming,
  onCancel,
  placeholder,
  disabled,
}) => {
  return (
    <div data-testid="composer-area">
      <textarea
        data-testid="composer-input"
        aria-label="メッセージを入力"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || (!canSubmit && !isStreaming)}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSubmit) onSubmit(value);
          }
        }}
      />
      <button
        data-testid="send-button"
        aria-label="メッセージを送信"
        aria-disabled={!canSubmit}
        disabled={!canSubmit}
        onClick={() => canSubmit && onSubmit(value)}
      >
        送信
      </button>
      {isStreaming && onCancel && (
        <button
          data-testid="cancel-stream-button"
          aria-label="Cancel response"
          onClick={onCancel}
        >
          停止
        </button>
      )}
    </div>
  );
};
