import React, { useState, useCallback } from "react";
import clsx from "clsx";
import { useAppStore } from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { Icon } from "../../components/atoms/Icon";
import { Button } from "../../components/atoms/Button";
import { Spinner } from "../../components/atoms/Spinner";
import { ProviderIcon } from "../../components/atoms/ProviderIcon";
import type { OAuthProvider } from "../../../preload/types";

/**
 * AuthViewのProps
 */
export interface AuthViewProps {
  /** クラス名（スタイル拡張用） */
  className?: string;
}

/**
 * プロバイダー設定
 */
interface ProviderConfig {
  id: OAuthProvider;
  name: string;
  label: string;
}

const PROVIDERS: ProviderConfig[] = [
  { id: "google", name: "Google", label: "Googleで続ける" },
  { id: "github", name: "GitHub", label: "GitHubで続ける" },
  { id: "discord", name: "Discord", label: "Discordで続ける" },
];

/**
 * ログイン画面コンポーネント
 *
 * OAuth認証（Google/GitHub/Discord）のUIを提供
 */
export const AuthView: React.FC<AuthViewProps> = ({ className }) => {
  // 認証状態
  const isLoading = useAppStore((state) => state.isLoading);
  const authError = useAppStore((state) => state.authError);
  const login = useAppStore((state) => state.login);
  const setAuthError = useAppStore((state) => state.setAuthError);

  // クリック中のプロバイダー（スピナー表示用）
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(
    null,
  );

  // ログインハンドラー
  const handleLogin = useCallback(
    async (provider: OAuthProvider) => {
      setLoadingProvider(provider);
      setAuthError(null);
      await login(provider);
      // 注: ログイン後の状態更新はauth:state-changedイベント経由
    },
    [login, setAuthError],
  );

  // エラークローズハンドラー
  const handleCloseError = useCallback(() => {
    setAuthError(null);
  }, [setAuthError]);

  return (
    <div
      className={clsx(
        "h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a]",
        className,
      )}
    >
      {/* ロゴ */}
      <div className="mb-6">
        <Icon name="sparkles" size={64} className="text-blue-400" />
      </div>

      {/* アプリ名 */}
      <h1 className="text-2xl font-bold text-white mb-8">
        AIWorkflowOrchestrator
      </h1>

      {/* ログインカード */}
      <GlassPanel radius="lg" blur="md" className="p-8 w-full max-w-sm">
        {/* タイトル */}
        <div className="text-center mb-6">
          <Icon name="user" size={48} className="mx-auto text-white/40 mb-4" />
          <h2 className="text-lg font-semibold text-white">
            アカウント登録・ログイン
          </h2>
          <p className="text-white/60 text-sm mt-1">
            アカウントを連携してデータを同期しましょう
          </p>
        </div>

        {/* エラー表示 */}
        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="flex items-center justify-between">
              <span className="text-red-400 text-sm">{authError}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseError}
                aria-label="閉じる"
              >
                <Icon name="x" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* OAuthボタン */}
        <div className="space-y-3">
          {PROVIDERS.map((provider) => (
            <Button
              key={provider.id}
              variant="secondary"
              fullWidth
              onClick={() => handleLogin(provider.id)}
              disabled={isLoading}
              aria-label={provider.label}
            >
              <span className="flex items-center justify-center gap-3">
                {isLoading && loadingProvider === provider.id ? (
                  <Spinner size="sm" />
                ) : (
                  <ProviderIcon provider={provider.id} />
                )}
                <span className="text-sm font-medium">{provider.label}</span>
              </span>
            </Button>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};

AuthView.displayName = "AuthView";
