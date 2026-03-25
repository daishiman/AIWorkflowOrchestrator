/**
 * SessionDisclosureBanner - AI 利用・外部送信開示バナー
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * Session open 時に AI 利用と外部送信の可能性を開示する。
 * DSC-R1〜R5 の表示規則に準拠。
 *
 * 表示ルール:
 * - collapsed → ready 遷移時に自動表示 (DSC-R1)
 * - dismiss 可能。dismiss 後は再表示アイコンを維持 (DSC-R2)
 * - Approval Sheet 内の disclosure は dismiss 不可 (DSC-R4)
 * - guidance-only state では「AI 実行なし」の旨を表示 (DSC-R5)
 */

import React from "react";

export interface SessionDisclosureBannerProps {
  /** AI モデル/サービス名 */
  aiServiceName: string;
  /** 外部送信先の種別リスト */
  externalDestinations: string[];
  /** dismiss コールバック */
  onDismiss: () => void;
  /** 再表示導線の有無 */
  canReopen: boolean;
  /** guidance-only モードか */
  isGuidanceOnly?: boolean;
  /** Approval Sheet 内の dismiss 不可表示か (DSC-R4) */
  isEmbeddedInApproval?: boolean;
}

export const SessionDisclosureBanner: React.FC<
  SessionDisclosureBannerProps
> = ({
  aiServiceName,
  externalDestinations,
  onDismiss,
  canReopen: _canReopen,
  isGuidanceOnly = false,
  isEmbeddedInApproval = false,
}) => {
  if (isGuidanceOnly) {
    return (
      <div
        className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3"
        data-testid="disclosure-banner"
        role="status"
        aria-label="AI 利用情報"
      >
        <p className="text-sm text-[var(--text-secondary)]">
          このセッションでは AI
          による自動実行は行われません。案内のみ表示されます。
        </p>
      </div>
    );
  }

  const destinationText =
    externalDestinations.length > 0 ? externalDestinations.join("、") : "なし";

  return (
    <div
      className="rounded-md border border-[var(--status-warning)] bg-[var(--status-warning-subtle)] px-4 py-3"
      data-testid="disclosure-banner"
      role="status"
      aria-label="AI 利用情報"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            このセッションでは AI（{aiServiceName}）が操作を支援します。
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            外部サービス（{destinationText}
            ）へのデータ送信が発生する場合があります。実行前に確認画面が表示されます。
          </p>
        </div>
        {!isEmbeddedInApproval && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
            data-testid="disclosure-dismiss"
            aria-label="閉じる"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
