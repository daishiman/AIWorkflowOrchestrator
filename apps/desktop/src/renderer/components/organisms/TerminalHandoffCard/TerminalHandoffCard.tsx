import React, { useState, useCallback, useEffect } from "react";

interface TerminalHandoffCardProps {
  guidance: {
    terminalCommand: string;
    contextSummary: string;
    reason: string;
  };
  onCopyCommand: () => void;
  onDismiss: () => void;
}

function localizeReason(reason: string): string {
  switch (reason) {
    case "subscription mode: use Claude Code CLI":
    case "サブスクリプションモードのため、Claude Code CLI で続行してください。":
      return "サブスクリプションモードのため、Claude Code CLI で続行してください。";
    case "API key not configured":
    case "APIキーが設定されていません。":
      return "APIキーが設定されていません。";
    case "API key unavailable":
    case "APIキーを取得できませんでした。":
      return "APIキーを取得できませんでした。";
    default:
      return reason;
  }
}

function localizeContextSummary(contextSummary: string): string {
  const match = contextSummary.match(/^surface=(\S+)\s+skill=(.+)$/);
  if (!match) {
    return contextSummary;
  }

  const [, surface, skill] = match;
  const surfaceLabel =
    surface === "skill"
      ? "スキル"
      : surface === "agent"
        ? "エージェント"
        : surface;

  return `対象画面: ${surfaceLabel} / スキル: ${skill}`;
}

export const TerminalHandoffCard: React.FC<TerminalHandoffCardProps> = ({
  guidance,
  onCopyCommand,
  onDismiss,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const localizedReason = localizeReason(guidance.reason);
  const localizedContextSummary = localizeContextSummary(
    guidance.contextSummary,
  );

  const handleCopy = useCallback(() => {
    onCopyCommand();
    setIsCopied(true);
  }, [onCopyCommand]);

  useEffect(() => {
    if (!isCopied) return;
    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  return (
    <div
      role="alert"
      aria-label="ターミナル引き継ぎ案内"
      className="rounded-xl border p-4"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Terminal icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--accent-primary)" }}
          >
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            ターミナル引き継ぎ
          </span>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="案内を閉じる"
          className="rounded-lg p-1 transition-colors hover:opacity-70"
          style={{ color: "var(--text-secondary)" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Reason */}
      <p className="mb-3 text-sm" style={{ color: "var(--text-secondary)" }}>
        {localizedReason}
      </p>

      {/* Command */}
      <div
        className="mb-3 flex items-center justify-between gap-2 rounded-lg p-3"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <code
          className="font-mono text-sm break-all"
          style={{ color: "var(--text-primary)" }}
        >
          {guidance.terminalCommand}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="コマンドをコピー"
          className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors"
          style={{
            backgroundColor: "var(--accent-primary)",
            color: "#fff",
          }}
        >
          {isCopied ? "コピー済み" : "コピー"}
        </button>
      </div>

      {/* Context summary */}
      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
        {localizedContextSummary}
      </p>
    </div>
  );
};
