/**
 * ApprovalRequestPanel - approval:request surface コンポーネント
 *
 * UT-SDK-07-APPROVAL-REQUEST-SURFACE-001
 *
 * Main から push される approval:request イベントを受け取り、
 * ユーザーが approve/reject を選択できる UI を提供する。
 * TTL（300s）超過時は expired 状態に遷移してボタンを無効化する。
 */

import React, { useEffect, useState } from "react";
import type { ApprovalRequestPayload } from "@repo/shared/types";

export interface ApprovalRequestPanelProps {
  request: ApprovalRequestPayload | null;
  onApprove: (sessionId: string, operationId: string) => Promise<void>;
  onReject: (sessionId: string, operationId: string) => Promise<void>;
}

/** Renderer 側の TTL（Main の ApprovalGate と同じ 300s） */
const APPROVAL_TTL_MS = 300 * 1000;

type ApprovalUIStatus = "pending" | "expired" | "resolving";

export function ApprovalRequestPanel({
  request,
  onApprove,
  onReject,
}: ApprovalRequestPanelProps) {
  const [status, setStatus] = useState<ApprovalUIStatus>("pending");
  const [remainingMs, setRemainingMs] = useState(APPROVAL_TTL_MS);

  // request が変わったら状態をリセット
  useEffect(() => {
    if (!request) return;
    setStatus("pending");
    const startedAt = Date.now();
    setRemainingMs(APPROVAL_TTL_MS);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = APPROVAL_TTL_MS - elapsed;
      if (remaining <= 0) {
        setRemainingMs(0);
        setStatus("expired");
        clearInterval(interval);
      } else {
        setRemainingMs(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [request]);

  if (!request) return null;

  const isDisabled = status === "expired" || status === "resolving";
  const remainingSec = Math.ceil(remainingMs / 1000);

  const handleApprove = async () => {
    if (isDisabled) return;
    setStatus("resolving");
    try {
      await onApprove(request.sessionId, request.operationId);
    } catch {
      setStatus("pending");
    }
  };

  const handleReject = async () => {
    if (isDisabled) return;
    setStatus("resolving");
    try {
      await onReject(request.sessionId, request.operationId);
    } catch {
      setStatus("pending");
    }
  };

  return (
    <div
      role="dialog"
      aria-label="操作の承認が必要です"
      data-testid="approval-request-panel"
      className="rounded-2xl border border-amber-500 bg-amber-500/5 p-5"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0 text-amber-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              承認リクエスト
            </p>
            <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
              操作の実行前に確認が必要です
            </h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                操作種別:
              </span>
              <span
                className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-700"
                data-testid="approval-operation-type"
              >
                {request.operationType}
              </span>
            </div>

            <p className="text-[var(--text-primary)]">{request.description}</p>

            {request.destination ? (
              <p
                className="text-xs text-[var(--text-secondary)]"
                data-testid="approval-destination"
              >
                送信先: <span className="font-mono">{request.destination}</span>
              </p>
            ) : null}
          </div>

          {status === "expired" ? (
            <div
              className="rounded-lg bg-[var(--status-error)]/10 px-3 py-2 text-xs font-medium text-[var(--status-error)]"
              data-testid="approval-expired-message"
              role="alert"
            >
              この承認リクエストは期限切れです（TTL
              超過）。操作は自動的に拒否されました。
            </div>
          ) : (
            <p className="text-xs text-[var(--text-secondary)]">
              残り時間: {remainingSec}s
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              data-testid="approval-approve-button"
              disabled={isDisabled}
              onClick={() => void handleApprove()}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "resolving" ? "処理中..." : "承認する"}
            </button>
            <button
              type="button"
              data-testid="approval-reject-button"
              disabled={isDisabled}
              onClick={() => void handleReject()}
              className="rounded-md border border-[var(--border-primary)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--status-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              拒否する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
