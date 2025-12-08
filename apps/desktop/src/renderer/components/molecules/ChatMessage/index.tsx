import React from "react";
import clsx from "clsx";
import { Avatar } from "../../atoms/Avatar";

export interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  loading?: boolean;
  streamingContent?: string;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  loading = false,
  streamingContent,
  className,
}) => {
  const displayContent = streamingContent || content;
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const isSystem = role === "system";

  const containerClasses = clsx(
    "flex w-full gap-3 px-4 py-3",
    {
      "justify-end": isUser,
      "justify-start": isAssistant,
      "justify-center": isSystem,
    },
    className,
  );

  const bubbleClasses = clsx("rounded-lg px-4 py-2 max-w-[80%] break-words", {
    "bg-blue-600 text-white": isUser,
    "bg-white/10 text-white backdrop-blur-sm": isAssistant,
    "bg-yellow-500/10 text-yellow-200 italic text-center": isSystem,
  });

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div
      className={containerClasses}
      role="article"
      aria-label={`${role} message`}
    >
      {isAssistant && (
        <Avatar
          alt="Assistant"
          size="sm"
          fallback="AI"
          className="mt-1 flex-shrink-0"
        />
      )}

      <div className="flex flex-col gap-1">
        <div className={bubbleClasses}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {displayContent}
            {streamingContent && (
              <span
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current"
                aria-label="typing"
              />
            )}
          </div>
        </div>

        {timestamp && !loading && (
          <div
            className={clsx("text-xs text-white/40", {
              "text-right": isUser,
              "text-left": isAssistant,
              "text-center": isSystem,
            })}
          >
            {formatTimestamp(timestamp)}
          </div>
        )}

        {loading && (
          <div
            className={clsx("flex items-center gap-1", {
              "justify-end": isUser,
              "justify-start": isAssistant,
              "justify-center": isSystem,
            })}
            role="status"
            aria-label="Loading message"
          >
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" />
          </div>
        )}
      </div>
    </div>
  );
};

ChatMessage.displayName = "ChatMessage";
