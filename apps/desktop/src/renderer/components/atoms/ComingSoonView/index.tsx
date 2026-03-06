import React, { memo } from "react";
import clsx from "clsx";
import { Icon, type IconName } from "../Icon";

export interface ComingSoonViewProps {
  title?: string;
  description?: string;
  icon?: IconName;
  className?: string;
}

export const ComingSoonView = memo<ComingSoonViewProps>(
  ({
    title = "準備中です",
    description = "この画面は現在接続中です。後続タスクで機能を有効化します。",
    icon = "aperture",
    className,
  }) => {
    return (
      <section
        className={clsx(
          "flex h-full min-h-[320px] items-center justify-center",
          className,
        )}
        aria-label={title}
      >
        <div className="flex max-w-xl flex-col items-center gap-4 rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-8 py-10 text-center shadow-sm">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-4 text-[var(--status-primary)]">
            <Icon name={icon} size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>
      </section>
    );
  },
);

ComingSoonView.displayName = "ComingSoonView";
