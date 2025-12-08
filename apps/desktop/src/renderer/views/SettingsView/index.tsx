import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { SettingsCard } from "../../components/organisms/SettingsCard";
import { AccountSection } from "../../components/organisms/AccountSection";
import { FormField } from "../../components/molecules/FormField";
import { ThemeSelector } from "../../components/molecules/ThemeSelector";
import { Input } from "../../components/atoms/Input";
import { Checkbox } from "../../components/atoms/Checkbox";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { useAppStore } from "../../store";
import { useTheme } from "../../hooks/useTheme";

export interface SettingsViewProps {
  className?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ className }) => {
  // Use flat store structure
  const apiKey = useAppStore((state) => state.apiKey);
  const autoSyncEnabled = useAppStore((state) => state.autoSyncEnabled);
  const setApiKeyAction = useAppStore((state) => state.setApiKey);
  const setAutoSyncEnabledAction = useAppStore(
    (state) => state.setAutoSyncEnabled,
  );

  // Theme from useTheme hook
  const { themeMode, setTheme } = useTheme();

  // Local state
  const [isLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [ragEnabled, setRagEnabled] = useState(false);

  const handleApiKeyChange = useCallback(
    (value: string) => {
      setApiKeyAction(value);
    },
    [setApiKeyAction],
  );

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

        {/* API Settings */}
        <section role="region" aria-labelledby="api-settings-heading">
          <SettingsCard
            title="API設定"
            description="AIサービスへの接続設定"
            id="api-settings-heading"
          >
            <FormField
              label="APIキー"
              description="OpenAI APIキーを入力してください"
              required
            >
              <Input
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                placeholder="sk-..."
                disabled={isLoading}
              />
            </FormField>
          </SettingsCard>
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

        {/* Appearance Settings */}
        <section role="region" aria-labelledby="appearance-settings-heading">
          <SettingsCard
            title="外観設定"
            description="テーマとディスプレイ設定"
            id="appearance-settings-heading"
          >
            <FormField label="テーマ" htmlFor="theme-label">
              <ThemeSelector
                value={themeMode}
                onChange={setTheme}
                disabled={isLoading}
                aria-labelledby="theme-label"
              />
            </FormField>
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
