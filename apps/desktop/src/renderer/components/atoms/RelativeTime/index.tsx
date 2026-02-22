import React, { useState, useEffect, memo } from "react";

export interface RelativeTimeProps {
  timestamp: string;
  format?: "auto" | "short" | "long";
  refreshInterval?: number;
  showAbsoluteOnHover?: boolean;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime());
}

function formatAbsolute(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}:${sec}`;
}

function formatDateShort(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}/${d}`;
}

function formatDateAuto(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}/${m}/${d}`;
}

function formatDateLong(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}年${m}月${d}日`;
}

function getRelativeText(
  diffMs: number,
  format: "auto" | "short" | "long",
  date: Date,
): string {
  if (diffMs < MINUTE) {
    return format === "short" ? "今" : "たった今";
  }

  const minutes = Math.floor(diffMs / MINUTE);
  if (diffMs < HOUR) {
    return format === "short" ? `${minutes}m` : `${minutes}分前`;
  }

  const hours = Math.floor(diffMs / HOUR);
  if (diffMs < DAY) {
    return format === "short" ? `${hours}h` : `${hours}時間前`;
  }

  const days = Math.floor(diffMs / DAY);
  if (diffMs < 2 * DAY) {
    if (format === "long") {
      return "昨日";
    }
    return format === "short" ? `${days}d` : `${days}日前`;
  }

  if (diffMs < 7 * DAY) {
    return format === "short" ? `${days}d` : `${days}日前`;
  }

  // 7日以上
  if (format === "short") {
    return formatDateShort(date);
  }
  if (format === "long") {
    return formatDateLong(date);
  }
  return formatDateAuto(date);
}

const FALLBACK_TEXT = "\u2014";
const DEFAULT_REFRESH_INTERVAL = 60000;

const RelativeTimeComponent: React.FC<RelativeTimeProps> = ({
  timestamp,
  format = "auto",
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  showAbsoluteOnHover = true,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTick((prev) => prev + 1);
    }, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  const date = new Date(timestamp);
  const isValid = timestamp !== "" && isValidDate(date);

  if (!isValid) {
    return (
      <time dateTime="" aria-label={FALLBACK_TEXT}>
        {FALLBACK_TEXT}
      </time>
    );
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const text = getRelativeText(diffMs, format, date);
  const isoString = date.toISOString();
  const titleValue = showAbsoluteOnHover ? formatAbsolute(date) : undefined;

  return (
    <time dateTime={isoString} title={titleValue}>
      {text}
    </time>
  );
};

const RelativeTime = memo(RelativeTimeComponent);
RelativeTime.displayName = "RelativeTime";

export { RelativeTime };
