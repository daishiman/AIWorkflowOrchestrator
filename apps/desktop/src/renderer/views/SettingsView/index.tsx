import React, { useState, useCallback, useEffect, useRef } from "react";
import clsx from "clsx";
import { SettingsCard } from "../../components/organisms/SettingsCard";
import { AccountSection } from "../../components/organisms/AccountSection";
import { ApiKeysSection } from "../../components/organisms/ApiKeysSection";
import { ProfileSection } from "./ProfileSection";
import { Checkbox } from "../../components/atoms/Checkbox";
import { Button } from "../../components/atoms/Button";
import { ErrorDisplay } from "../../components/atoms/ErrorDisplay";
import { AuthModeSelector } from "../../components/settings/AuthModeSelector";
import { AuthKeySection } from "../../components/settings/AuthKeySection";
import { ThemeSelector } from "../../components/molecules/ThemeSelector";
import { MainlineAccessMatrixSection } from "./MainlineAccessMatrixSection";
import { AnalyticsDashboardPanel } from "../../components/analytics/AnalyticsDashboardPanel";
import {
  MAINLINE_HELP_URL,
  MAINLINE_SETUP_GUIDE_URL,
  copyTextToClipboard,
  launchMainlineTerminal,
  openRuntimeAccessUrl,
} from "../../utils/runtimeAccess";
import {
  useAppStore,
  useAuthMode,
  useAuthModeStatus,
  useAuthModeLoading,
  useSetAuthMode,
  useInitializeAuthMode,
} from "../../store";
import type { ThemeMode } from "../../store/types";
import type { MainlineExecutionAccessState } from "../../features/mainline-access/mainlineAccess";

export interface SettingsViewProps {
  className?: string;
  onOpenOnboarding?: () => void;
  mainlineAccess?: MainlineExecutionAccessState;
  onRefreshMainlineHealth?: () => void;
  onNavigateMainlineExecution?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  className,
  onOpenOnboarding,
  mainlineAccess,
  onRefreshMainlineHealth,
  onNavigateMainlineExecution,
}) => {
  const authModeSectionRef = useRef<HTMLElement | null>(null);

  // Use flat store structure
  const autoSyncEnabled = useAppStore((state) => state.autoSyncEnabled);
  const setAutoSyncEnabledAction = useAppStore(
    (state) => state.setAutoSyncEnabled,
  );
  const themeMode = useAppStore((state) => state.themeMode);
  const setThemeModeAction = useAppStore((state) => state.setThemeMode);

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
  const [mainlineFeedback, setMainlineFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!mainlineFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setMainlineFeedback(null);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [mainlineFeedback]);

  const handleRagToggle = useCallback((checked: boolean) => {
    setRagEnabled(checked);
  }, []);

  const handleAutoSyncToggle = useCallback(
    (checked: boolean) => {
      setAutoSyncEnabledAction(checked);
    },
    [setAutoSyncEnabledAction],
  );

  const handleThemeChange = useCallback(
    async (mode: ThemeMode) => {
      await setThemeModeAction(mode);
    },
    [setThemeModeAction],
  );

  const handleSave = useCallback(async () => {
    // Save logic would go here
  }, []);

  const copyMainlineCommand = useCallback(async () => {
    if (!mainlineAccess) {
      return;
    }

    const copied = await copyTextToClipboard(
      mainlineAccess.suggestedTerminalCommand,
    );

    if (copied) {
      setMainlineFeedback("ターミナル実行コマンドをコピーしました");
    } else {
      setMainlineFeedback("ターミナル実行コマンドのコピーに失敗しました");
    }
  }, [mainlineAccess]);

  const handleMainlineAction = useCallback(
    async (action: string) => {
      switch (action) {
        case "executeIntegrated":
          onNavigateMainlineExecution?.();
          return;
        case "executeTerminalHandoff":
          if (mainlineAccess) {
            const launched = await launchMainlineTerminal(
              mainlineAccess.suggestedTerminalCommand,
            );
            setMainlineFeedback(
              launched
                ? "terminal を起動し、コマンドをコピーしました"
                : "terminal 起動に失敗しました。コマンドはコピー済みです",
            );
          }
          return;
        case "copyCommandToClipboard":
          await copyMainlineCommand();
          return;
        case "openHelp":
          openRuntimeAccessUrl(MAINLINE_HELP_URL);
          return;
        case "openSetupGuide":
          openRuntimeAccessUrl(MAINLINE_SETUP_GUIDE_URL);
          return;
        case "refreshHealth":
          onRefreshMainlineHealth?.();
          return;
        case "openSettings":
          authModeSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
          setMainlineFeedback("認証方式セクションへ移動しました");
          return;
        default:
          return;
      }
    },
    [
      mainlineAccess,
      copyMainlineCommand,
      onNavigateMainlineExecution,
      onRefreshMainlineHealth,
    ],
  );

  if (error) {
    return <ErrorDisplay message={error} className={className} />;
  }

  return (
    <div
      className={clsx("flex flex-col h-full overflow-auto", className)}
      data-testid="settings-view"
    >
      {/* Header */}
      <header className="border-b border-[var(--border-primary)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              設定
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              Knowledge Studioの設定を管理します
            </p>
          </div>

          {onOpenOnboarding ? (
            <Button
              variant="secondary"
              onClick={onOpenOnboarding}
              data-testid="settings-open-onboarding"
            >
              はじめてガイドを再表示
            </Button>
          ) : null}
        </div>
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
        <section
          ref={authModeSectionRef}
          role="region"
          aria-labelledby="auth-mode-settings-heading"
        >
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
                    "space-y-1 text-sm px-3 py-2 rounded-md",
                    authModeStatus.isValid
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200",
                  )}
                  data-testid="auth-mode-status"
                >
                  <p data-testid="auth-mode-status-message">
                    {authModeStatus.message}
                  </p>
                  {authModeStatus.errorCode && (
                    <p
                      className="text-xs font-medium opacity-90"
                      data-testid="auth-mode-status-code"
                    >
                      コード: {authModeStatus.errorCode}
                    </p>
                  )}
                  {authModeStatus.guidance && (
                    <p
                      className="text-xs opacity-90"
                      data-testid="auth-mode-status-guidance"
                    >
                      {authModeStatus.guidance}
                    </p>
                  )}
                </div>
              )}
            </div>
          </SettingsCard>
        </section>

        {/* Auth Key Settings - auth-mode=api-key のときのみ表示 */}
        {authMode === "api-key" && (
          <section role="region" aria-labelledby="auth-key-settings-heading">
            <SettingsCard
              title="Claude Agent SDK APIキー"
              description="Anthropic APIキーを設定してスキル実行に利用します"
              id="auth-key-settings-heading"
            >
              <AuthKeySection />
            </SettingsCard>
          </section>
        )}

        {mainlineAccess ? (
          <section role="region" aria-labelledby="mainline-access-heading">
            <SettingsCard
              title="実行アクセスマトリクス"
              description="mainline UI で利用できる runtime / terminal 導線を確認します"
              id="mainline-access-heading"
            >
              <div className="space-y-3">
                <MainlineAccessMatrixSection
                  access={mainlineAccess}
                  onAction={handleMainlineAction}
                />
                {mainlineFeedback ? (
                  <p
                    className="text-sm text-[var(--text-secondary)]"
                    data-testid="mainline-access-feedback"
                  >
                    {mainlineFeedback}
                  </p>
                ) : null}
              </div>
            </SettingsCard>
          </section>
        ) : null}

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

        {/* Theme Settings */}
        <section role="region" aria-labelledby="theme-settings-heading">
          <SettingsCard
            title="テーマ設定"
            description="表示テーマを切り替えます"
            id="theme-settings-heading"
          >
            <ThemeSelector
              value={themeMode}
              onChange={handleThemeChange}
              fullWidth
              aria-labelledby="theme-settings-heading"
            />
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

        {/* Analytics Dashboard */}
        <section role="region" aria-labelledby="analytics-settings-heading">
          <SettingsCard
            title="Analytics ダッシュボード"
            description="分析データの収集状態を確認します"
            id="analytics-settings-heading"
          >
            <AnalyticsDashboardPanel />
          </SettingsCard>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] p-6">
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
