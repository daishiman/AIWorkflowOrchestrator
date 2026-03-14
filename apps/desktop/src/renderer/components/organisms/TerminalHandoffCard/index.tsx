/**
 * TerminalHandoffCard - terminal handoff 案内カード
 *
 * TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001
 *
 * Skill / Agent 実行結果として terminal_handoff が返った場合に
 * ユーザーへ案内するカードコンポーネント。
 * Apple HIG 準拠（ライト/ダークモード対応）。
 */
"use client";

import { useState, useCallback } from "react";

export interface TerminalHandoffBundle {
  launcher: string;
  promptBundle: string;
  cwd: string;
  suggestedCommand: string;
  manualRetryRule: string;
  runbook?: string;
}

export interface TerminalHandoffCardProps {
  bundle: TerminalHandoffBundle;
  onClose?: () => void;
  onOpenTerminal?: () => void;
}

/**
 * TerminalHandoffCard
 *
 * Terminal で実行する必要がある場合に表示するガイドカード。
 * - suggestedCommand をコピーできる
 * - 作業ディレクトリを表示
 * - terminal を開くボタン（省略可能）
 */
export function TerminalHandoffCard({
  bundle,
  onClose,
  onOpenTerminal,
}: TerminalHandoffCardProps) {
  const [copied, setCopied] = useState(false);
  // TODO(human): コピー失敗時のエラー状態を追加してください
  // - useState で copyError: boolean を追加
  // - catch ブロックのフォールバックも失敗した場合に copyError = true をセット
  // - JSX で copyError が true のとき「コピーに失敗しました」フィードバックを表示

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(bundle.suggestedCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API が使えない場合はフォールバック
      try {
        const el = document.createElement("textarea");
        el.value = bundle.suggestedCommand;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // TODO(human): フォールバックも失敗した場合のエラー処理をここに追加
      }
    }
  }, [bundle.suggestedCommand]);

  return (
    <div
      role="region"
      aria-label="ターミナルでの実行案内"
      className="rounded-xl border border-[var(--separator)] bg-[var(--secondary-bg)] p-5 shadow-sm"
    >
      {/* ヘッダー */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base font-semibold text-[var(--label)]">
          Terminal で続けてください
        </span>
      </div>

      {/* 案内文 */}
      <p className="mb-4 text-sm text-[var(--secondary-label)]">
        {bundle.manualRetryRule}
      </p>

      {/* コマンド表示 */}
      <div className="mb-3 rounded-lg bg-[var(--tertiary-bg)] px-4 py-3 font-mono text-sm text-[var(--label)]">
        <span className="select-all break-all">{bundle.suggestedCommand}</span>
      </div>

      {/* コピーボタン */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="コマンドをクリップボードにコピー"
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 active:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>

      {/* 作業ディレクトリ */}
      <p className="mb-4 text-xs text-[var(--secondary-label)]">
        作業ディレクトリ: <code className="font-mono">{bundle.cwd}</code>
      </p>

      {/* runbook（任意） */}
      {bundle.runbook && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-[var(--accent)]">
            詳細手順を見る ▼
          </summary>
          <div className="mt-2 rounded-lg bg-[var(--tertiary-bg)] p-3 text-sm text-[var(--label)]">
            <pre className="whitespace-pre-wrap">{bundle.runbook}</pre>
          </div>
        </details>
      )}

      {/* アクションボタン */}
      <div className="flex gap-3">
        {onOpenTerminal && (
          <button
            type="button"
            onClick={onOpenTerminal}
            className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            terminal を開く
          </button>
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--separator)] bg-[var(--secondary-bg)] px-4 py-1.5 text-sm font-medium text-[var(--label)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            閉じる
          </button>
        )}
      </div>
    </div>
  );
}

export default TerminalHandoffCard;
