import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { useAppStore } from "../../../store";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Icon } from "../../atoms/Icon";
import { GlassPanel } from "../GlassPanel";
import type { OAuthProvider } from "../../../../preload/types";

export interface AccountSectionProps {
  className?: string;
}

type AuthResultType = "new_registration" | "login" | null;

const PROVIDERS: { id: OAuthProvider; name: string; icon: string }[] = [
  { id: "google", name: "Google", icon: "google" },
  { id: "github", name: "GitHub", icon: "github" },
  { id: "discord", name: "Discord", icon: "discord" },
];

/**
 * アカウント設定セクション
 * - 未認証時: OAuthログインボタン表示
 * - 認証済み時: プロフィール表示・編集、ログアウト、プロバイダー連携
 */
export const AccountSection: React.FC<AccountSectionProps> = ({
  className,
}) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const isLoading = useAppStore((state) => state.isLoading);
  const authUser = useAppStore((state) => state.authUser);
  const profile = useAppStore((state) => state.profile);
  const linkedProviders = useAppStore((state) => state.linkedProviders);
  const isOffline = useAppStore((state) => state.isOffline);
  const authError = useAppStore((state) => state.authError);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const linkProvider = useAppStore((state) => state.linkProvider);
  const setAuthError = useAppStore((state) => state.setAuthError);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [authResult, setAuthResult] = useState<AuthResultType>(null);
  const [previousAuthState, setPreviousAuthState] = useState(isAuthenticated);

  // 認証状態が変わったときに新規登録かログインかを判定
  useEffect(() => {
    if (!previousAuthState && isAuthenticated && authUser) {
      // 認証成功時: created_at と last_sign_in_at を比較
      // 30秒以内の差なら新規登録とみなす
      const createdAt = new Date(authUser.createdAt).getTime();
      const lastSignIn = new Date(authUser.lastSignInAt).getTime();
      const isNewUser = Math.abs(lastSignIn - createdAt) < 30000;

      setAuthResult(isNewUser ? "new_registration" : "login");

      // 5秒後にメッセージを非表示
      const timer = setTimeout(() => {
        setAuthResult(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
    setPreviousAuthState(isAuthenticated);
  }, [isAuthenticated, authUser, previousAuthState]);

  const handleStartEdit = useCallback(() => {
    setEditDisplayName(profile?.displayName ?? authUser?.displayName ?? "");
    setIsEditing(true);
  }, [profile?.displayName, authUser?.displayName]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditDisplayName("");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    await updateProfile({ displayName: editDisplayName });
    setIsEditing(false);
  }, [updateProfile, editDisplayName]);

  const handleLogin = useCallback(
    (provider: OAuthProvider) => {
      login(provider);
    },
    [login],
  );

  const handleLinkProvider = useCallback(
    (provider: OAuthProvider) => {
      linkProvider(provider);
    },
    [linkProvider],
  );

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleCloseError = useCallback(() => {
    setAuthError(null);
  }, [setAuthError]);

  const displayName = profile?.displayName ?? authUser?.displayName ?? "User";
  const email = profile?.email ?? authUser?.email ?? "";
  const avatarUrl = profile?.avatarUrl ?? authUser?.avatarUrl ?? null;
  const plan = profile?.plan ?? "free";

  const linkedProviderIds = linkedProviders.map((p) => p.provider);
  const unlinkedProviders = PROVIDERS.filter(
    (p) => !linkedProviderIds.includes(p.id),
  );

  return (
    <section
      role="region"
      aria-label="アカウント設定"
      className={clsx("space-y-4", className)}
    >
      {/* Error Display */}
      {authError && (
        <GlassPanel
          radius="md"
          blur="sm"
          className="p-4 bg-red-500/20 border-red-500/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-red-400">{authError}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseError}
              aria-label="閉じる"
            >
              <Icon name="x" size={16} />
            </Button>
          </div>
        </GlassPanel>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className="flex items-center gap-2 text-yellow-400 text-sm">
          <Icon name="wifi-off" size={16} />
          <span>オフライン</span>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div role="status" className="flex items-center justify-center py-4">
          <Icon name="loader-2" size={24} spin className="text-blue-400" />
          <span className="sr-only">読み込み中</span>
        </div>
      )}

      {!isAuthenticated ? (
        /* Unauthenticated State */
        <GlassPanel radius="md" blur="md" className="p-6">
          <div className="text-center space-y-4">
            <Icon name="user" size={48} className="mx-auto text-white/40" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                アカウント登録・ログイン
              </h3>
              <p className="text-white/60 text-sm mt-1">
                アカウントを連携してデータを同期しましょう
              </p>
            </div>

            <div className="space-y-3">
              {PROVIDERS.map((provider) => (
                <Button
                  key={provider.id}
                  variant="secondary"
                  fullWidth
                  onClick={() => handleLogin(provider.id)}
                  disabled={isLoading}
                  aria-label={`${provider.name}で続ける`}
                >
                  <span className="flex items-center justify-center gap-3">
                    <ProviderIcon provider={provider.id} />
                    <span className="text-sm font-medium">
                      {provider.name}で続ける
                    </span>
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </GlassPanel>
      ) : (
        /* Authenticated State */
        <>
          {/* Auth Success Message */}
          {authResult && (
            <GlassPanel
              radius="md"
              blur="sm"
              className={clsx(
                "p-4 border",
                authResult === "new_registration"
                  ? "bg-green-500/20 border-green-500/30"
                  : "bg-blue-500/20 border-blue-500/30",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  name={
                    authResult === "new_registration" ? "user-plus" : "log-in"
                  }
                  size={20}
                  className={
                    authResult === "new_registration"
                      ? "text-green-400"
                      : "text-blue-400"
                  }
                />
                <span
                  className={
                    authResult === "new_registration"
                      ? "text-green-400"
                      : "text-blue-400"
                  }
                >
                  {authResult === "new_registration"
                    ? "アカウント登録が完了しました"
                    : "ログインしました"}
                </span>
              </div>
            </GlassPanel>
          )}

          {/* Profile Card */}
          <GlassPanel radius="md" blur="md" className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={`${displayName}のavatar`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon name="user" size={32} className="text-white/40" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="edit-display-name" className="sr-only">
                        表示名
                      </label>
                      <Input
                        id="edit-display-name"
                        aria-label="表示名"
                        value={editDisplayName}
                        onChange={setEditDisplayName}
                        placeholder="表示名を入力"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={isLoading}
                      >
                        保存
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        キャンセル
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {displayName}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEdit}
                        aria-label="編集"
                      >
                        <Icon name="pencil" size={14} />
                      </Button>
                    </div>
                    <p className="text-white/60 text-sm truncate">{email}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 capitalize">
                      {plan}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </GlassPanel>

          {/* Linked Providers */}
          <GlassPanel radius="md" blur="md" className="p-6">
            <h4 className="text-sm font-medium text-white/80 mb-3">
              連携サービス
            </h4>
            <div className="space-y-2">
              {linkedProviders.map((provider) => (
                <div
                  key={provider.provider}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-500/10 border border-green-500/20"
                >
                  <div className="flex items-center gap-2">
                    <ProviderIcon
                      provider={provider.provider as OAuthProvider}
                    />
                    <div className="flex flex-col">
                      <span className="text-white capitalize">
                        {provider.provider}
                      </span>
                      {provider.email && (
                        <span className="text-white/40 text-xs">
                          {provider.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <Icon name="check-circle" size={16} />
                    <span className="text-sm">登録済み</span>
                  </div>
                </div>
              ))}

              {unlinkedProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="ghost"
                  fullWidth
                  onClick={() => handleLinkProvider(provider.id)}
                  disabled={isLoading}
                  className="justify-between"
                  aria-label={`${provider.name}を連携`}
                >
                  <div className="flex items-center gap-2">
                    <ProviderIcon provider={provider.id} />
                    <span>{provider.name}</span>
                  </div>
                  <span className="text-white/40">連携する</span>
                </Button>
              ))}
            </div>
          </GlassPanel>

          {/* Logout Button */}
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
            disabled={isLoading}
          >
            ログアウト
          </Button>
        </>
      )}
    </section>
  );
};

AccountSection.displayName = "AccountSection";

/**
 * OAuth Provider Icon Component
 */
const ProviderIcon: React.FC<{ provider: OAuthProvider }> = ({ provider }) => {
  switch (provider) {
    case "google":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      );
    case "github":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      );
    case "discord":
      return (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
        </svg>
      );
  }
};
