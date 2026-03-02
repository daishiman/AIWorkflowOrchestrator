/**
 * CallStackView - コールスタック表示（Organism）
 *
 * デバッグセッション中のコールスタックをツリービューで表示する。
 *
 * @module CallStackView
 */

import React, { memo } from "react";
import clsx from "clsx";
import type { CallStackEntry } from "@repo/shared/types/skill-debug";
import { Icon } from "../../../components/atoms/Icon";
import { CallStackEntryComponent } from "./CallStackEntry";

export interface CallStackViewProps {
  /** コールスタック */
  callStack: CallStackEntry[];
}

export const CallStackView: React.FC<CallStackViewProps> = memo(
  ({ callStack }) => {
    return (
      <div
        className={clsx(
          "flex flex-col",
          "bg-[var(--bg-primary)]",
          "border border-[var(--border-primary)] rounded-lg",
        )}
        data-testid="callstack-view"
      >
        {/* ヘッダー */}
        <div
          className={clsx(
            "flex items-center gap-2 px-3 py-2",
            "border-b border-[var(--border-primary)]",
          )}
        >
          <Icon
            name="folder-tree"
            size={14}
            className="text-[var(--text-muted)]"
          />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            コールスタック
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            ({callStack.length})
          </span>
        </div>

        {/* スタック一覧 */}
        <div
          className="overflow-y-auto py-1"
          role="tree"
          aria-label="コールスタック"
        >
          {callStack.length === 0 ? (
            <div
              className="flex items-center justify-center py-6 text-xs text-[var(--text-muted)]"
              data-testid="callstack-empty"
            >
              コールスタックが空です
            </div>
          ) : (
            callStack.map((entry, index) => (
              <CallStackEntryComponent
                key={`${entry.depth}-${entry.name}`}
                entry={entry}
                isActive={index === 0}
              />
            ))
          )}
        </div>
      </div>
    );
  },
);

CallStackView.displayName = "CallStackView";
