import React, { useState, useCallback, useEffect } from "react";
import clsx from "clsx";
import { useAppStore } from "../../../store";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Icon } from "../../atoms/Icon";
import { ProviderIcon } from "../../atoms/ProviderIcon";
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
