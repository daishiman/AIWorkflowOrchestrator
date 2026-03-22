import { useCallback } from "react";
import { WorkspaceChatInput } from "./WorkspaceChatInput";
import { WorkspaceChatMessageList } from "./WorkspaceChatMessageList";
import { WorkspaceFileContextChips } from "./WorkspaceFileContextChips";
import { WorkspaceSuggestionBubbles } from "./WorkspaceSuggestionBubbles";
import {
  createGuidanceActionDispatcher,
  getModelSelectionGuidance,
} from "../../guidance/modelSelectionGuidance";
import { GuidanceBlock } from "./components/GuidanceBlock";
import { StreamingErrorDisplay } from "./components/StreamingErrorDisplay";
import {
  getWorkspaceSuggestions,
  type WorkspaceChatController,
} from "./hooks/useWorkspaceChatController";
import { useSetCurrentView } from "../../store";

interface WorkspaceChatPanelProps {
  controller: WorkspaceChatController;
}

export function WorkspaceChatPanel({
  controller,
}: WorkspaceChatPanelProps): JSX.Element {
  const showSuggestionBubbles =
    controller.messages.length === 0 &&
    controller.streamContent.length === 0 &&
    !controller.isStreaming;

  const setCurrentView = useSetCurrentView();
  const blockedGuidance = getModelSelectionGuidance(controller.blockedReason);
  const resolveAction = createGuidanceActionDispatcher({
    openSettings: () => setCurrentView("settings"),
  });
  const primaryAction = blockedGuidance?.primaryAction;
  const secondaryAction = blockedGuidance?.secondaryAction;
  const onPrimaryAction = primaryAction
    ? resolveAction(primaryAction.type)
    : undefined;
  const onSecondaryAction = secondaryAction
    ? resolveAction(secondaryAction.type)
    : undefined;

  const handleOpenSettings = useCallback(() => {
    setCurrentView("settings");
  }, [setCurrentView]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Workspace Chat
        </h1>
        <p className="mt-1 text-sm text-[var(--text-primary)] opacity-70">
          ファイル背景情報と会話履歴を使って、作業コンテキストに沿った回答を得られます。
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-5 py-5">
        {blockedGuidance ? (
          <GuidanceBlock
            variant="blocked"
            message={blockedGuidance.message}
            actionLabel={primaryAction?.label}
            onAction={onPrimaryAction}
            secondaryActionLabel={secondaryAction?.label}
            onSecondaryAction={onSecondaryAction}
          />
        ) : null}

        {showSuggestionBubbles && !blockedGuidance ? (
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

        {controller.streamingError ? (
          <StreamingErrorDisplay
            error={controller.streamingError}
            onDismiss={controller.dismissStreamingError}
            onRetry={controller.retryLastMessage}
            onOpenSettings={handleOpenSettings}
            isRetrying={controller.isSending}
          />
        ) : null}

        <WorkspaceChatInput controller={controller} />
      </div>
    </section>
  );
}
