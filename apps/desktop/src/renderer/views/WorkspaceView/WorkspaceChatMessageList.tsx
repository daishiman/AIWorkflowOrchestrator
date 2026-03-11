import type { WorkspaceChatMessage } from "./hooks/useWorkspaceChatController";

interface WorkspaceChatMessageListProps {
  messages: WorkspaceChatMessage[];
  streamContent: string;
  isStreaming: boolean;
}

function bubbleClassName(role: WorkspaceChatMessage["role"]): string {
  if (role === "user") {
    return "ml-auto max-w-[90%] rounded-2xl rounded-br-md bg-[var(--status-primary)] px-4 py-3 text-sm text-white";
  }

  if (role === "assistant") {
    return "mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)]";
  }

  return "mx-auto max-w-[90%] rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-4 py-2 text-xs text-[var(--text-primary)] opacity-80";
}

export function WorkspaceChatMessageList({
  messages,
  streamContent,
  isStreaming,
}: WorkspaceChatMessageListProps): JSX.Element {
  const hasMessages = messages.length > 0 || isStreaming;

  return (
    <div
      role="log"
      aria-live="polite"
      className="min-h-0 flex-1 overflow-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3"
      data-testid="workspace-chat-log"
    >
      {!hasMessages ? (
        <p
          className="px-2 py-6 text-center text-sm text-[var(--text-primary)] opacity-60"
          data-testid="workspace-chat-empty"
        >
          まだ会話は始まっていません。下の入力欄か提案バブルから始めてください。
        </p>
      ) : null}

      <div className="space-y-3">
        {messages.map((message, index) => (
          <article
            key={message.id}
            className={bubbleClassName(message.role)}
            data-testid={`workspace-message-${message.role}-${index}`}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          </article>
        ))}

        {isStreaming ? (
          <article
            className={bubbleClassName("assistant")}
            data-testid="workspace-message-streaming"
          >
            <div className="whitespace-pre-wrap break-words">
              {streamContent.length > 0 ? streamContent : "回答を生成中です..."}
            </div>
            <p
              role="status"
              className="mt-2 text-xs text-[var(--text-primary)] opacity-60"
            >
              応答中
            </p>
          </article>
        ) : null}
      </div>
    </div>
  );
}
