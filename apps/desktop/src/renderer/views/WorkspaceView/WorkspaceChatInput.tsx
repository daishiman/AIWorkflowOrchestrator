import { useEffect, useRef } from "react";
import { WorkspaceMentionDropdown } from "./WorkspaceMentionDropdown";
import type { WorkspaceChatController } from "./hooks/useWorkspaceChatController";

interface WorkspaceChatInputProps {
  controller: WorkspaceChatController;
}

export function WorkspaceChatInput({
  controller,
}: WorkspaceChatInputProps): JSX.Element {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (controller.pendingCursorPosition === null || !inputRef.current) {
      return;
    }

    inputRef.current.focus();
    inputRef.current.setSelectionRange(
      controller.pendingCursorPosition,
      controller.pendingCursorPosition,
    );
    controller.clearPendingCursorPosition();
  }, [controller]);

  const canSend =
    controller.input.trim().length > 0 &&
    !controller.isSending &&
    !controller.isStreaming &&
    controller.selectedModelId !== null;

  return (
    <div className="space-y-3">
      {controller.selectedFilePath ? (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-xs text-[var(--text-primary)] transition hover:border-[var(--status-primary)]"
          onClick={controller.attachSelectedFile}
          data-testid="workspace-chat-attach-selected"
        >
          <span className="rounded-full border border-[var(--border-subtle)] px-1.5 py-0.5 text-[10px]">
            添付
          </span>
          選択中ファイルを背景情報に追加
        </button>
      ) : null}

      <div className="relative rounded-2xl border-2 border-[var(--status-primary)] bg-[var(--bg-primary)] p-3">
        <textarea
          ref={inputRef}
          value={controller.input}
          rows={3}
          placeholder="何でも聞いてみよう..."
          className="min-h-[96px] w-full resize-none border-none bg-transparent text-base text-[var(--text-primary)] outline-none placeholder:text-[var(--text-primary)] placeholder:opacity-60"
          onChange={(event) =>
            controller.setInputValue(
              event.currentTarget.value,
              event.currentTarget.selectionStart ??
                event.currentTarget.value.length,
            )
          }
          onClick={(event) =>
            controller.setInputValue(
              event.currentTarget.value,
              event.currentTarget.selectionStart ??
                event.currentTarget.value.length,
            )
          }
          onKeyDown={(event) => {
            void controller.handleComposerKeyDown({
              key: event.key,
              shiftKey: event.shiftKey,
              preventDefault: () => event.preventDefault(),
            });
          }}
          data-testid="workspace-chat-input"
        />

        {controller.mention.isOpen ? (
          <WorkspaceMentionDropdown
            options={controller.mention.options}
            activeIndex={controller.mention.highlightedIndex}
            onHover={controller.mention.setHighlightedIndex}
            onSelect={(index) => {
              void controller.selectMentionAtIndex(index);
            }}
            onPreview={(index) => controller.openMentionPreviewAtIndex(index)}
          />
        ) : null}

        <div className="mt-3 flex items-center justify-end gap-2">
          {controller.selectedModelId === null ? (
            <span
              className="text-xs text-[var(--text-primary)] opacity-50"
              data-testid="workspace-chat-model-missing"
            >
              Settings でモデルを選択してください
            </span>
          ) : null}

          {controller.isStreaming ? (
            <button
              type="button"
              className="rounded-full border border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-primary)]"
              onClick={() => {
                void controller.cancelStream();
              }}
              data-testid="workspace-chat-cancel"
            >
              応答を停止
            </button>
          ) : null}

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--status-primary)] text-white transition hover:scale-[1.02] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!canSend}
            onClick={() => {
              void controller.sendMessage();
            }}
            aria-label="メッセージを送信"
            data-testid="workspace-chat-send"
          >
            ↑
          </button>
        </div>
      </div>

      {controller.errorMessage && !controller.streamingError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          data-testid="workspace-chat-error"
        >
          {controller.errorMessage}
        </p>
      ) : null}
    </div>
  );
}
