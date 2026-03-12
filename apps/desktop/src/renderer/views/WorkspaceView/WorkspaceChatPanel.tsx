import { WorkspaceChatInput } from "./WorkspaceChatInput";
import { WorkspaceChatMessageList } from "./WorkspaceChatMessageList";
import { WorkspaceFileContextChips } from "./WorkspaceFileContextChips";
import { WorkspaceSuggestionBubbles } from "./WorkspaceSuggestionBubbles";
import {
  getWorkspaceSuggestions,
  type WorkspaceChatController,
} from "./hooks/useWorkspaceChatController";

interface WorkspaceChatPanelProps {
  controller: WorkspaceChatController;
  selectedFileCount?: number;
  onOpenChat?: () => void;
}

export function WorkspaceChatPanel({
  controller,
  selectedFileCount = 0,
  onOpenChat,
}: WorkspaceChatPanelProps): JSX.Element {
  const showSuggestionBubbles =
    controller.messages.length === 0 &&
    controller.streamContent.length === 0 &&
    !controller.isStreaming;

  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-[var(--text-primary)]">
              Workspace Chat
            </h1>
            <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
              ファイル背景情報と会話履歴を使って、作業コンテキストに沿った回答を得られます。
            </p>
          </div>
          {onOpenChat ? (
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs text-[var(--text-primary)] opacity-70">
                選択済み背景情報: {selectedFileCount}件
              </span>
              <button
                type="button"
                className="rounded-full bg-[var(--status-primary)] px-4 py-2 text-sm text-white"
                data-testid="workspace-open-chat"
                onClick={onOpenChat}
              >
                Workspace mode で開く
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-5">
        {showSuggestionBubbles ? (
          <div className="space-y-2" data-testid="workspace-chat-zero-state">
            <p className="text-sm text-[var(--text-primary)] opacity-70">
              最初の質問を選ぶか、そのまま入力して始めてください。
            </p>
            <WorkspaceSuggestionBubbles
              suggestions={getWorkspaceSuggestions()}
              onSelect={controller.applySuggestion}
            />
          </div>
        ) : null}

        <WorkspaceChatMessageList
          messages={controller.messages}
          streamContent={controller.streamContent}
          isStreaming={controller.isStreaming}
        />

        <WorkspaceFileContextChips
          selectedFiles={controller.selectedFiles}
          onRemove={controller.removeSelectedFile}
        />

        <WorkspaceChatInput controller={controller} />
      </div>
    </section>
  );
}
