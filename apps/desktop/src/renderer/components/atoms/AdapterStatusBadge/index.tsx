/**
 * @file AdapterStatusBadge - LLMアダプター状態表示バッジ
 * @description LLMAdapterStatus (ready/initializing/failed) を視覚的に表示する
 * @feature TASK-RT-02
 */

import React, { memo } from "react";
import clsx from "clsx";
import { Badge, type BadgeProps } from "../Badge";
import { Spinner } from "../Spinner";
import type { LLMAdapterStatus } from "@repo/shared/types";

// === Types ===

export interface AdapterStatusBadgeProps {
  status: LLMAdapterStatus;
  failureReason?: string | null;
  className?: string;
}

interface StatusConfig {
  variant: BadgeProps["variant"];
  label: string;
  ariaLabel: string;
  showSpinner: boolean;
}

const STATUS_CONFIG_MAP: Record<LLMAdapterStatus, StatusConfig> = {
  ready: {
    variant: "success",
    label: "準備完了",
    ariaLabel: "アダプター準備完了",
    showSpinner: false,
  },
  initializing: {
    variant: "warning",
    label: "初期化中",
    ariaLabel: "アダプター初期化中",
    showSpinner: true,
  },
  failed: {
    variant: "error",
    label: "エラー",
    ariaLabel: "アダプターエラー",
    showSpinner: false,
  },
};

// === Component ===

export const AdapterStatusBadge = memo<AdapterStatusBadgeProps>(
  ({ status, failureReason, className }) => {
    const config = STATUS_CONFIG_MAP[status];

    const ariaLabel = failureReason
      ? `${config.ariaLabel}: ${failureReason}`
      : config.ariaLabel;

    return (
      <Badge
        variant={config.variant}
        size="sm"
        className={clsx("gap-1", className)}
        role="status"
        aria-live="polite"
        aria-label={ariaLabel}
        title={failureReason ?? undefined}
      >
        {config.showSpinner && <Spinner size="sm" />}
        {config.label}
      </Badge>
    );
  },
);

AdapterStatusBadge.displayName = "AdapterStatusBadge";
