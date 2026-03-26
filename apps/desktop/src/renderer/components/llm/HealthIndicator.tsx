/**
 * @file HealthIndicator Component
 * @description LLM接続状態インジケーター
 * @feature chat-multi-llm-switching
 */

import React, { useState, useCallback } from "react";
import type { HealthCheckResult } from "@repo/shared/types/llm";
import type { HealthPolicy, HealthStatus } from "@repo/shared/types";

export interface HealthIndicatorProps {
  /** @deprecated HealthPolicy を使用してください（D-6） */
  healthStatus?: HealthCheckResult | undefined;
  /** 統一 HealthPolicy（D-6: healthPolicy.healthStatus で表示切替） */
  healthPolicy?: HealthPolicy;
  onRefresh?: () => void;
  isChecking?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** HealthPolicy.healthStatus → 表示プロパティのマッピング */
const healthPolicyDisplayMap: Record<
  HealthStatus,
  { color: string; text: string }
> = {
  healthy: { color: "bg-green-500", text: "接続良好" },
  degraded: { color: "bg-yellow-500", text: "品質低下" },
  unhealthy: { color: "bg-red-500", text: "接続不可" },
  unknown: { color: "bg-gray-400", text: "未確認" },
};

/**
 * Get display properties based on health status
 *
 * HealthPolicy が渡された場合はそちらを優先（D-6）。
 * 未渡し時は既存の HealthCheckResult から導出（後方互換）。
 */
function getStatusDisplay(
  status: HealthCheckResult | undefined,
  isChecking: boolean,
  healthPolicy?: HealthPolicy,
) {
  if (isChecking) {
    return {
      color: "bg-gray-300",
      text: "Checking...",
      showSpinner: true,
    };
  }

  // HealthPolicy 優先パス（D-6）
  if (healthPolicy) {
    const display = healthPolicyDisplayMap[healthPolicy.healthStatus];
    return {
      color: display.color,
      text: healthPolicy.errorDetail ?? display.text,
      showSpinner: false,
    };
  }

  // 後方互換パス: HealthCheckResult から導出
  if (!status) {
    return {
      color: "bg-gray-400",
      text: "未確認",
      showSpinner: false,
    };
  }

  switch (status.status) {
    case "connected":
      return {
        color: "bg-green-500",
        text: status.latency ? `Connected (${status.latency}ms)` : "Connected",
        showSpinner: false,
      };
    case "disconnected":
      return {
        color: "bg-yellow-500",
        text: "Disconnected",
        showSpinner: false,
      };
    case "error":
      return {
        color: "bg-red-500",
        text: status.errorMessage || "Error",
        showSpinner: false,
      };
    default:
      return {
        color: "bg-gray-400",
        text: "Unknown",
        showSpinner: false,
      };
  }
}

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  healthStatus,
  healthPolicy,
  onRefresh,
  isChecking = false,
  size = "md",
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { color, text, showSpinner } = getStatusDisplay(
    healthStatus,
    isChecking,
    healthPolicy,
  );

  const handleRefresh = useCallback(() => {
    if (onRefresh && !isChecking) {
      onRefresh();
    }
  }, [onRefresh, isChecking]);

  return (
    <div
      className={`relative inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Status Dot */}
      <div
        data-testid="health-indicator"
        aria-label={`Connection status: ${text}`}
        className={`
          ${sizeClasses[size]} rounded-full ${color}
          flex items-center justify-center
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showSpinner && (
          <span
            role="progressbar"
            aria-label="Checking connection"
            className={`
              ${sizeClasses[size]} border-2 border-white border-t-transparent
              rounded-full animate-spin
            `}
          />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            px-2 py-1 text-xs text-white bg-gray-900 rounded
            whitespace-nowrap z-50
          `}
        >
          {text}
          <div
            className={`
              absolute top-full left-1/2 transform -translate-x-1/2
              border-4 border-transparent border-t-gray-900
            `}
          />
        </div>
      )}

      {/* Refresh Button */}
      {onRefresh && (
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isChecking}
          aria-label="Refresh connection status"
          className={`
            p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-blue-500
          `}
        >
          <svg
            className={`w-4 h-4 text-gray-500 ${isChecking ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      )}
    </div>
  );
};
