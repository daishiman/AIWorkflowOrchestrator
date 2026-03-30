/**
 * @file RetryButton - アダプターリトライボタン
 * @description failed状態のLLMアダプターに対するリトライアクション
 * @feature TASK-RT-02
 */

import React, { memo, useCallback } from "react";
import { Button } from "../Button";

export interface RetryButtonProps {
  providerId: string;
  isRetrying: boolean;
  onRetry: (providerId: string) => void;
  className?: string;
}

export const RetryButton = memo<RetryButtonProps>(
  ({ providerId, isRetrying, onRetry, className }) => {
    const handleClick = useCallback(() => {
      onRetry(providerId);
    }, [providerId, onRetry]);

    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isRetrying}
        loading={isRetrying}
        leftIcon={isRetrying ? undefined : "refresh-cw"}
        aria-label={
          isRetrying
            ? `${providerId} の再接続を実行中`
            : `${providerId} のアダプターを再接続`
        }
        className={className}
      >
        {isRetrying ? "リトライ中" : "再接続"}
      </Button>
    );
  },
);

RetryButton.displayName = "RetryButton";
