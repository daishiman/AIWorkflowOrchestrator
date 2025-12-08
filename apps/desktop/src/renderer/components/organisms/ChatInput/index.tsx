import React from "react";
import clsx from "clsx";
import { Input } from "../../atoms/Input";
import { Button } from "../../atoms/Button";

export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  sending = false,
  disabled = false,
  className,
}) => {
  const handleSendClick = () => {
    if (!disabled && !sending && value.trim()) {
      onSend();
    }
  };

  const handleEnter = () => {
    if (!disabled && !sending && value.trim()) {
      onSend();
    }
  };

  return (
    <div className={clsx("flex items-center gap-2", className)}>
      <Input
        value={value}
        onChange={onChange}
        onEnter={handleEnter}
        placeholder="メッセージを入力..."
        disabled={disabled || sending}
        className="flex-1"
        aria-label="チャットメッセージ入力"
      />
      <Button
        variant="primary"
        onClick={handleSendClick}
        disabled={disabled || sending || !value.trim()}
        loading={sending}
        rightIcon="send"
        aria-label="送信"
      >
        送信
      </Button>
    </div>
  );
};

ChatInput.displayName = "ChatInput";
