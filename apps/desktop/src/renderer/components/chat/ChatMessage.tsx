import React from "react";
import type { ChatMessage as ChatMessageType } from "../../store/types";

export interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      data-testid={`chat-message-${message.id}`}
      className={`chat-message chat-message--${message.role}`}
    >
      <div className="chat-message__content">{message.content}</div>
    </div>
  );
};
