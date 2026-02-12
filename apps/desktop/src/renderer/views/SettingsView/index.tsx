import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { SettingsCard } from "../../components/organisms/SettingsCard";
import { AccountSection } from "../../components/organisms/AccountSection";
import { ApiKeysSection } from "../../components/organisms/ApiKeysSection";
import { ProfileSection } from "./ProfileSection";
import { Checkbox } from "../../components/atoms/Checkbox";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { AuthModeSelector } from "../../components/settings/AuthModeSelector";
import {
  useAppStore,
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";

export interface SettingsViewProps {
  className?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ className }) => {
  // Use flat store structure
  const autoSyncEnabled = useAppStore((state) => state.autoSyncEnabled);
  const setAutoSyncEnabledAction = useAppStore(
    (state) => state.setAutoSyncEnabled,
  );

  // Auth mode - 個別セレクタ（P31対策: 参照が安定）
  const authMode = useAuthMode();
  const authModeStatus = useAuthModeStatus();
  const authModeLoading = useAuthModeLoading();
  const setAuthMode = useSetAuthMode();
  const initializeAuthMode = useInitializeAuthMode();

  // Initialize auth mode on mount
  // 個別セレクタは参照が安定するため、useRefガード不要
  useEffect(() => {
    initializeAuthMode();
  }, [initializeAuthMode]);

  // Local state
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [ragEnabled, setRagEnabled] = useState(false);

  const handleRagToggle = useCallback((checked: boolean) => {
    setRagEnabled(checked);
  }, []);

  const handleAutoSyncToggle = useCallback(
    (checked: boolean) => {
      setAutoSyncEnabledAction(checked);
    },
    [setAutoSyncEnabledAction],
  );

  const handleSave = useCallback(async () => {
    // Save logic would go here
  }, []);

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div
      className={clsx("flex flex-col h-full overflow-auto", className)}
      data-testid="settings-view"
    >
      {/* Header */}
      <header className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">設定</h1>
        <p className="text-gray-400 mt-1">Knowledge Studioの設定を管理します</p>
      </header>

      {/* Settings Content */}
      <main className="flex-1 p-6 space-y-6">
        {/* Account Settings */}
        <section role="region" aria-labelledby="account-settings-heading">
          <SettingsCard
            title="アカウント"
            description="ログインとプロフィール管理"
            id="account-settings-heading"
          >
            <AccountSection />
          </SettingsCard>
        </section>

        {/* Auth Mode Settings - Claude Agent SDK認証方式選択 */}
        <section role="region" aria-labelledby="auth-mode-settings-heading">
          <SettingsCard
            title="Claude Agent SDK 認証方式"
            description="スキル実行時の認証方式を選択します"
            id="auth-mode-settings-heading"
          >
            <div className="space-y-4">
              <AuthModeSelector
                currentMode={authMode}
                onModeChange={setAuthMode}
                disabled={authModeLoading}
              />
              {/* 認証状態の表示 */}
              {authModeStatus && (
                <div
                  className={clsx(
                    "text-sm px-3 py-2 rounded-md",
                    authModeStatus.isValid
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200",
                  )}
                  data-testid="auth-mode-status"
                >
                  {authModeStatus.message}
                </div>
              )}
            </div>
          </SettingsCard>
        </section>

        {/* API Keys Settings - 全4プロバイダー対応 */}
        <section role="region" aria-labelledby="api-keys-settings-heading">
          <ApiKeysSection />
        </section>

        {/* Profile Settings - 拡張プロフィール設定 */}
        <section role="region" aria-labelledby="profile-settings-heading">
          <h2 id="profile-settings-heading" className="sr-only">
            プロフィール設定
          </h2>
          <ProfileSection />
        </section>

        {/* RAG Settings */}
        <section role="region" aria-labelledby="rag-settings-heading">
          <SettingsCard
            title="RAG設定"
            description="ナレッジベースの検索設定"
            id="rag-settings-heading"
          >
            <div className="space-y-4">
              <Checkbox
                label="RAGを有効にする"
                description="チャットでナレッジベースを参照して回答を生成します"
                checked={ragEnabled}
                onChange={handleRagToggle}
                disabled={isLoading}
              />
              <Checkbox
                label="自動同期を有効にする"
                description="ファイル変更時に自動的にインデックスを更新します"
                checked={autoSyncEnabled}
                onChange={handleAutoSyncToggle}
                disabled={isLoading}
              />
            </div>
          </SettingsCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-6 border-t border-white/10">
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
          >
            設定を保存
          </Button>
        </div>
      </footer>
    </div>
  );
};

SettingsView.displayName = "SettingsView";
