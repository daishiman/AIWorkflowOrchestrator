/**
 * CodeView - コード/ステップ表示（Organism）
 *
 * 現在のデバッグステップの入力/出力をコードブロックとして表示する。
 * ステップが選択されていない場合は案内メッセージを表示する。
 *
 * @module CodeView
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { DebugStep } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";

export interface CodeViewProps {
  /** 現在表示中のステップ */
  currentStep?: DebugStep;
}

/** JSON値を整形表示する */
function formatJson(value: unknown): string {
  if (value === undefined || value === null) return "なし";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export const CodeView: React.FC<CodeViewProps> = memo(({ currentStep }) => {
  if (!currentStep) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center h-full",
          "text-[var(--text-muted)]",
        )}
        data-testid="code-view-empty"
      >
        <Icon name="file-text" size={32} className="mb-2 opacity-50" />
        <p className="text-sm">ステップを選択してください</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex flex-col h-full",
        "bg-[var(--bg-primary)]",
        "border border-[var(--border-primary)] rounded-lg",
        "overflow-hidden",
      )}
      data-testid="code-view"
    >
      {/* ヘッダー */}
      <div
        className={clsx(
          "flex items-center gap-2 px-3 py-2",
          "bg-[var(--bg-secondary)] border-b border-[var(--border-primary)]",
        )}
      >
        <Icon name="file-text" size={14} className="text-[var(--text-muted)]" />
        <span className="text-xs font-medium text-[var(--text-primary)]">
          ステップ #{currentStep.stepNumber}:{" "}
          {currentStep.toolName ?? currentStep.hookType ?? currentStep.type}
        </span>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 入力セクション */}
        <div>
          <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">
            入力
          </h4>
          <pre
            className={clsx(
              "p-2 rounded text-xs font-mono",
              "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
              "overflow-x-auto whitespace-pre-wrap break-words",
            )}
            data-testid="code-view-input"
          >
            {formatJson(currentStep.input)}
          </pre>
        </div>

        {/* 出力セクション */}
        <div>
          <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-1">
            出力
          </h4>
          <pre
            className={clsx(
              "p-2 rounded text-xs font-mono",
              "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
              "overflow-x-auto whitespace-pre-wrap break-words",
            )}
            data-testid="code-view-output"
          >
            {formatJson(currentStep.output)}
          </pre>
        </div>
      </div>
    </div>
  );
});

CodeView.displayName = "CodeView";
