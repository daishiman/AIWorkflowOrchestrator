/**
 * ApprovalSheet - 危険操作・外部送信の承認 UI
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001
 *
 * 操作実行前にユーザーの明示的承認を求める。
 * - operationType に応じて表示内容を切替
 * - 「承認」「拒否」「詳細を見る」の3アクション
 * - 初期フォーカスは「拒否」ボタン（安全側デフォルト: NFR-5）
 * - キーボード操作で完結（Tab / Enter / Escape: NFR-5）
 * - 内蔵 disclosure は dismiss 不可（DSC-R4）
 */

import React, { useEffect, useRef, useCallback } from "react";
import { SessionDisclosureBanner } from "./SessionDisclosureBanner";

export interface ApprovalSheetProps {
  /** 承認対象の操作種別 */
  operationType: "dangerous_operation" | "external_send";
  /** 操作の説明（ユーザー向け） */
  description: string;
  /** 外部送信の場合の送信先 */
  destination?: string;
  /** データ概要 */
  dataSummary?: string;
  /** AI サービス名 (disclosure 用) */
  aiServiceName?: string;
  /** 外部送信先リスト (disclosure 用) */
  externalDestinations?: string[];
  /** 承認コールバック */
  onApprove: () => void;
  /** 拒否コールバック */
  onReject: () => void;
  /** 詳細表示コールバック */
  onShowDetails?: () => void;
}

export const ApprovalSheet: React.FC<ApprovalSheetProps> = ({
  operationType,
  description,
  destination,
  dataSummary,
  aiServiceName = "AI",
  externalDestinations = [],
  onApprove,
  onReject,
  onShowDetails,
}) => {
  const rejectRef = useRef<HTMLButtonElement>(null);

  // NFR-5: 初期フォーカスを「拒否」ボタンに設定（安全側デフォルト）
  useEffect(() => {
    rejectRef.current?.focus();
  }, []);

  // NFR-5: Escape キーで拒否
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onReject();
      }
    },
    [onReject],
  );

  const title =
    operationType === "external_send" ? "外部送信の確認" : "操作の確認";

  return (
    <div
      className="rounded-lg border border-[var(--border-warning)] bg-[var(--bg-primary)] p-4 shadow-lg"
      data-testid="approval-sheet"
      role="dialog"
      aria-label={title}
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      {/* タイトル */}
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {/* 操作説明 */}
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>

      {/* 送信先情報（外部送信時のみ） */}
      {operationType === "external_send" && destination && (
        <div className="mt-2 rounded border border-[var(--border-secondary)] bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            送信先:
          </span>
          <span className="ml-2 text-sm text-[var(--text-primary)]">
            {destination}
          </span>
        </div>
      )}

      {/* データ概要 */}
      {dataSummary && (
        <div className="mt-2 rounded border border-[var(--border-secondary)] bg-[var(--bg-secondary)] px-3 py-2">
          <span className="text-xs font-medium text-[var(--text-tertiary)]">
            データ概要:
          </span>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {dataSummary}
          </p>
        </div>
      )}

      {/* DSC-R4: 内蔵 disclosure（dismiss 不可） */}
      <div className="mt-3" data-testid="approval-disclosure">
        <SessionDisclosureBanner
          aiServiceName={aiServiceName}
          externalDestinations={externalDestinations}
          onDismiss={() => {}}
          canReopen={false}
          isEmbeddedInApproval={true}
        />
      </div>

      {/* 停止方法案内 */}
      <p className="mt-3 text-xs text-[var(--text-tertiary)]">
        実行中でも「中止」ボタンで停止できます。
      </p>

      {/* アクションボタン */}
      <div className="mt-4 flex items-center justify-end gap-2">
        {onShowDetails && (
          <button
            type="button"
            onClick={onShowDetails}
            className="rounded px-3 py-1.5 text-sm text-[var(--text-link)] hover:bg-[var(--bg-hover)]"
            data-testid="approval-details"
          >
            詳細を見る
          </button>
        )}
        <button
          ref={rejectRef}
          type="button"
          onClick={onReject}
          className="rounded border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          data-testid="approval-reject"
        >
          拒否
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="rounded bg-[var(--accent-primary)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90"
          data-testid="approval-approve"
        >
          承認
        </button>
      </div>
    </div>
  );
};
