import type { LLMAdapterStatus } from "@repo/shared/types";

export interface LLMAdapterErrorBannerProps {
  status: LLMAdapterStatus;
  failureReason: string | null;
  onOpenSettings?: () => void;
}

function buildMessage(failureReason: string | null): string {
  if (/api key/i.test(failureReason ?? "")) {
    return "APIキーが設定されていないか、無効です。設定画面でAPIキーを確認してください。";
  }
  return `LLMアダプターの初期化に失敗しました: ${failureReason ?? "不明なエラー"}`;
}

export function LLMAdapterErrorBanner({
  status,
  failureReason,
  onOpenSettings,
}: LLMAdapterErrorBannerProps) {
  if (status !== "failed") {
    return null;
  }

  return (
    <div
      role="alert"
      data-testid="llm-adapter-error-banner"
      className="flex items-start justify-between gap-3 rounded-xl border border-[var(--status-error)]/30 bg-[var(--status-error)]/5 px-4 py-3"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-0.5 shrink-0 text-[var(--status-error)]"
          aria-hidden="true"
        >
          ⚠
        </span>
        <p className="text-sm text-[var(--status-error)]">
          {buildMessage(failureReason)}
        </p>
      </div>
      {onOpenSettings && (
        <button
          type="button"
          onClick={onOpenSettings}
          className="shrink-0 rounded-lg border border-[var(--status-error)]/30 px-3 py-1 text-xs font-medium text-[var(--status-error)] transition-colors duration-200 hover:bg-[var(--status-error)]/10"
        >
          設定を開く
        </button>
      )}
    </div>
  );
}
