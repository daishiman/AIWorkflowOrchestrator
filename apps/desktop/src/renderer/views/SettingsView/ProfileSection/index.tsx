/**
 * ProfileSection コンポーネント
 *
 * プロフィール設定セクション
 * 通知設定、エクスポート/インポートを統合
 *
 * NOTE: タイムゾーン・言語選択は将来実装予定（現在は日本固定）
 * 未完了タスク: docs/30-workflows/unassigned-task/task-locale-timezone-selection.md
 */

import React, { useCallback, useState, useEffect } from "react";
import clsx from "clsx";
import { SettingsCard } from "../../../components/organisms/SettingsCard";
import { NotificationToggle } from "./NotificationToggle";
import { ProfileExportImport } from "./ProfileExportImport";
import { useAppStore } from "../../../store";
import type { NotificationSettings } from "@repo/shared/types/auth";

// IPC チャネル
const IPC_CHANNELS = {
  PROFILE_UPDATE_NOTIFICATIONS: "profile:update-notifications",
  PROFILE_EXPORT: "profile:export",
  PROFILE_IMPORT: "profile:import",
} as const;

export interface ProfileSectionProps {
  collapsed?: boolean;
  onExpand?: () => void;
  className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  collapsed = false,
  onExpand,
  className,
}) => {
  const profile = useAppStore((state) => state.profile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカル状態（楽観的更新用）
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(
      profile?.notificationSettings ?? {
        email: true,
        desktop: true,
        sound: true,
        workflowComplete: true,
        workflowError: true,
      },
    );

  // プロフィールが更新されたら同期
  useEffect(() => {
    if (profile) {
      setNotificationSettings(
        profile.notificationSettings ?? {
          email: true,
          desktop: true,
          sound: true,
          workflowComplete: true,
          workflowError: true,
        },
      );
    }
  }, [profile]);

  // IPC呼び出しヘルパー
  const invokeIpc = useCallback(
    async <T,>(channel: string, payload?: unknown): Promise<T> => {
      const electronAPI = (
        window as unknown as {
          electronAPI?: {
            invoke: (channel: string, payload?: unknown) => Promise<T>;
          };
        }
      ).electronAPI;
      if (!electronAPI?.invoke) {
        throw new Error("IPC not available");
      }
      return electronAPI.invoke(channel, payload);
    },
    [],
  );

  // 通知設定更新
  const handleNotificationChange = useCallback(
    async (updates: Partial<NotificationSettings>): Promise<void> => {
      const newSettings = { ...notificationSettings, ...updates };
      setNotificationSettings(newSettings); // 楽観的更新
      setIsLoading(true);
      setError(null);
      try {
        const result = await invokeIpc<{
          success: boolean;
          error?: { message: string };
        }>(IPC_CHANNELS.PROFILE_UPDATE_NOTIFICATIONS, {
          notificationSettings: updates,
        });
        if (!result.success) {
          setNotificationSettings(
            profile?.notificationSettings ?? {
              email: true,
              desktop: true,
              sound: true,
              workflowComplete: true,
              workflowError: true,
            },
          ); // ロールバック
          setError(result.error?.message ?? "通知設定の更新に失敗しました");
        }
      } catch {
        setNotificationSettings(
          profile?.notificationSettings ?? {
            email: true,
            desktop: true,
            sound: true,
            workflowComplete: true,
            workflowError: true,
          },
        ); // ロールバック
        setError("通知設定の更新に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [invokeIpc, notificationSettings, profile?.notificationSettings],
  );

  // エクスポート
  const handleExport = useCallback(async (): Promise<{
    success: boolean;
    filePath?: string;
    error?: string;
  }> => {
    return invokeIpc<{ success: boolean; filePath?: string; error?: string }>(
      IPC_CHANNELS.PROFILE_EXPORT,
    );
  }, [invokeIpc]);

  // インポート
  const handleImport = useCallback(
    async (filePath: string): Promise<{ success: boolean; error?: string }> => {
      return invokeIpc<{ success: boolean; error?: string }>(
        IPC_CHANNELS.PROFILE_IMPORT,
        { filePath },
      );
    },
    [invokeIpc],
  );

  // プロフィールがない場合のローディング表示
  if (!profile) {
    return (
      <div
        role="status"
        className={clsx("flex items-center justify-center p-8", className)}
        data-testid="profile-section"
      >
        <p className="text-white/50">プロフィールを読み込み中...</p>
      </div>
    );
  }

  // 折りたたみ状態
  if (collapsed) {
    return (
      <div className={className} data-testid="profile-section">
        <button
          onClick={onExpand}
          aria-label="展開"
          className={clsx(
            "w-full p-4 text-left rounded-lg",
            "bg-white/5 border border-white/10",
            "text-white/80 hover:bg-white/10",
            "transition-colors duration-200",
          )}
        >
          プロフィール設定 ▶
        </button>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="プロフィール設定"
      className={clsx("space-y-6", className)}
      data-testid="profile-section"
    >
      {/* エラー表示 */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm">
          {error}
        </div>
      )}

      {/* 地域設定 - 将来実装予定（現在は日本固定） */}
      {/* タイムゾーン・言語選択は未完了タスクとして記録済み */}
      {/* docs/30-workflows/unassigned-task/task-locale-timezone-selection.md 参照 */}

      {/* 通知設定 */}
      <section role="region" aria-label="通知" className="relative z-20">
        <SettingsCard title="通知" description="通知の受け取り方を設定します">
          <NotificationToggle
            value={notificationSettings}
            onChange={handleNotificationChange}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </SettingsCard>
      </section>

      {/* データ管理 */}
      <section role="region" aria-label="データ管理" className="relative z-10">
        <SettingsCard
          title="データ管理"
          description="プロフィール設定のエクスポート・インポート"
        >
          <ProfileExportImport
            onExport={handleExport}
            onImport={handleImport}
            disabled={isLoading}
          />
        </SettingsCard>
      </section>
    </div>
  );
};

ProfileSection.displayName = "ProfileSection";

// 将来実装用にコンポーネントをエクスポート（現在は未使用）
export { TimezoneSelector } from "./TimezoneSelector";
export { LocaleSelector } from "./LocaleSelector";
export { NotificationToggle } from "./NotificationToggle";
export { ProfileExportImport } from "./ProfileExportImport";
