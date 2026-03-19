import React from "react";

export interface SendButtonProps {
  disabled?: boolean;
  isStreaming?: boolean;
  onClick: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({
  disabled,
  isStreaming,
  onClick,
}) => {
  return (
    <button
      data-testid="send-button"
      aria-label={isStreaming ? "送信中..." : "メッセージを送信"}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={onClick}
    >
      {isStreaming ? "送信中..." : "送信"}
    </button>
  );
};
