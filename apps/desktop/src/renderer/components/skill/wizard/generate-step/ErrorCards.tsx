/**
 * @file ErrorCards.tsx
 * @description エラー種別ごとのカードコンポーネント（atoms）
 * @task TASK-SC-07-STREAMING-PROGRESS-UI Phase 8
 *
 * P47 対策: Record<GenerationErrorCode, ...> で型安全マッピング
 */

import type { ReactNode } from "react";
import type { GenerationErrorCode } from "../GenerateStep";

export function ApiKeyErrorCard({
  message,
  onOpenSettings,
}: {
  message: string;
  onOpenSettings?: () => void;
}): ReactNode {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--status-warning)] bg-[var(--bg-secondary)]"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--status-warning)]">
        <span>⚠</span>
        <span>APIキーが未設定です</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">{message}</p>
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="self-start px-3 py-1.5 text-xs rounded-md bg-[var(--status-primary)] text-white hover:opacity-90 transition-opacity"
        >
          設定を開く
        </button>
      )}
    </div>
  );
}

export function LlmErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): ReactNode {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--status-error)] bg-[var(--bg-secondary)]"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--status-error)]">
        <span>✕</span>
        <span>生成エラー</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start px-3 py-1.5 text-xs rounded-md bg-[var(--status-primary)] text-white hover:opacity-90 transition-opacity"
        >
          リトライ
        </button>
      )}
    </div>
  );
}

export function NetworkErrorCard({ message }: { message: string }): ReactNode {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--text-tertiary)] bg-[var(--bg-secondary)]"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <span>⊘</span>
        <span>ネットワークエラー</span>
      </div>
      <p className="text-xs text-[var(--text-secondary)]">{message}</p>
      <p className="text-xs text-[var(--text-tertiary)]">
        接続を確認してください
      </p>
    </div>
  );
}

// P47 対策: Record<GenerationErrorCode, ...> で型安全マッピング
export const ERROR_CARD_MAP: Record<
  GenerationErrorCode,
  (
    message: string,
    onRetry?: () => void,
    onOpenSettings?: () => void,
  ) => ReactNode
> = {
  API_KEY_NOT_SET: (message, _onRetry, onOpenSettings) => (
    <ApiKeyErrorCard message={message} onOpenSettings={onOpenSettings} />
  ),
  LLM_ERROR: (message, onRetry) => (
    <LlmErrorCard message={message} onRetry={onRetry} />
  ),
  NETWORK_ERROR: (message) => <NetworkErrorCard message={message} />,
};

export function renderErrorCard(
  code: GenerationErrorCode,
  message: string,
  onRetry?: () => void,
  onOpenSettings?: () => void,
): ReactNode {
  return ERROR_CARD_MAP[code](message, onRetry, onOpenSettings);
}
