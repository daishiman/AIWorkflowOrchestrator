/**
 * NotificationToggle コンポーネント
 *
 * 通知設定トグルUIコンポーネント
 */

import React, { useCallback, useMemo } from "react";
import clsx from "clsx";
import { Checkbox } from "../../../components/atoms/Checkbox";
import { Button } from "../../../components/atoms/Button";
import type { NotificationSettings } from "@repo/shared/types/auth";

// 通知設定項目定義
const NOTIFICATION_ITEMS: {
  key: keyof NotificationSettings;
  label: string;
  description: string;
}[] = [
  {
    key: "email",
    label: "メール通知",
    description: "重要な通知をメールで受け取る",
  },
  {
    key: "desktop",
    label: "デスクトップ通知",
    description: "デスクトップ通知を表示する",
  },
  {
    key: "sound",
    label: "通知音",
    description: "通知時に音を鳴らす",
  },
  {
    key: "workflowComplete",
    label: "ワークフロー完了",
    description: "ワークフロー完了時に通知",
  },
  {
    key: "workflowError",
    label: "ワークフローエラー",
    description: "ワークフローエラー時に通知",
  },
];

export interface NotificationToggleProps {
  value: NotificationSettings;
  onChange: (settings: Partial<NotificationSettings>) => void;
  disabled?: boolean;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  value,
  onChange,
  disabled = false,
  isLoading = false,
  compact = false,
  className,
}) => {
  // 全てオン/オフの状態を計算
  const allEnabled = useMemo(() => {
    return Object.values(value).every((v) => v === true);
  }, [value]);

  const allDisabled = useMemo(() => {
    return Object.values(value).every((v) => v === false);
  }, [value]);

  // 個別のトグル変更
  const handleToggle = useCallback(
    (key: keyof NotificationSettings, checked: boolean) => {
      onChange({ [key]: checked });
    },
    [onChange],
  );

  // 全て有効
  const handleEnableAll = useCallback(() => {
    onChange({
      email: true,
      desktop: true,
      sound: true,
      workflowComplete: true,
      workflowError: true,
    });
  }, [onChange]);

  // 全て無効
  const handleDisableAll = useCallback(() => {
    onChange({
      email: false,
      desktop: false,
      sound: false,
      workflowComplete: false,
      workflowError: false,
    });
  }, [onChange]);

  const isDisabled = disabled || isLoading;

  return (
    <div
      role="group"
      aria-label="通知設定"
      className={clsx("space-y-4", className)}
      data-testid="notification-toggle"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-white/80">通知設定</h4>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEnableAll}
            disabled={isDisabled || allEnabled}
            aria-label="すべて有効"
          >
            すべて有効
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisableAll}
            disabled={isDisabled || allDisabled}
            aria-label="すべて無効"
          >
            すべて無効
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {NOTIFICATION_ITEMS.map((item) => (
          <Checkbox
            key={item.key}
            label={item.label}
            description={compact ? undefined : item.description}
            checked={value[item.key]}
            onChange={(checked) => handleToggle(item.key, checked)}
            disabled={isDisabled}
            aria-label={item.label}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div role="status" className="text-center text-white/50 text-sm">
          更新中...
        </div>
      )}
    </div>
  );
};

NotificationToggle.displayName = "NotificationToggle";
