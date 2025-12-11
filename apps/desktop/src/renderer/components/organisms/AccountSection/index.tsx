import React, { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useAppStore } from "../../../store";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { Icon } from "../../atoms/Icon";
import { ProviderIcon } from "../../atoms/ProviderIcon";
import { GlassPanel } from "../GlassPanel";
import type { OAuthProvider } from "../../../../preload/types";

/**
 * 確認ダイアログの状態
 */
interface ConfirmDialogState {
  isOpen: boolean;
  type: "unlink" | "remove-avatar" | "delete-account" | null;
  provider?: OAuthProvider;
}

/**
 * AccountSectionコンポーネントのProps
 */
export interface AccountSectionProps {
  /** 追加のCSSクラス */
  className?: string;
}

/**
 * 認証操作の結果タイプ
 *
 * - `new_registration`: 新規登録
 * - `login`: 既存アカウントでのログイン
 */
type AuthResultType = "new_registration" | "login" | null;

/**
 * 利用可能な認証プロバイダー一覧
 */
const PROVIDERS: { id: OAuthProvider; name: string; icon: string }[] = [
  { id: "google", name: "Google", icon: "google" },
  { id: "github", name: "GitHub", icon: "github" },
  { id: "discord", name: "Discord", icon: "discord" },
];

/**
 * プロバイダーIDから表示名を取得
 */
const getProviderDisplayName = (providerId: string): string => {
  const provider = PROVIDERS.find((p) => p.id === providerId);
  return provider?.name ?? providerId;
};

/**
 * アカウント管理セクション
 *
 * ユーザーのアカウント情報を表示し、以下の機能を提供する:
 * - プロフィール情報の表示（アバター、名前、メール）
 * - ソーシャルアカウント連携状態の表示と管理
 * - ログアウト機能
 *
 * @component
 * @example
 * ```tsx
 * // 設定画面での使用
 * <AccountSection className="mt-4" />
 * ```
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
  const unlinkProvider = useAppStore((state) => state.unlinkProvider);
  const uploadAvatar = useAppStore((state) => state.uploadAvatar);
  const useProviderAvatar = useAppStore((state) => state.useProviderAvatar);
  const removeAvatar = useAppStore((state) => state.removeAvatar);
  const deleteAccount = useAppStore((state) => state.deleteAccount);
  const setAuthError = useAppStore((state) => state.setAuthError);

  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [authResult, setAuthResult] = useState<AuthResultType>(null);
  const [previousAuthState, setPreviousAuthState] = useState(isAuthenticated);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    type: null,
  });
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const avatarButtonRef = useRef<HTMLDivElement>(null);

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

  // アバターメニュー外クリックで閉じる（Portal対応）
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // アバターボタンコンテナとPortalメニュー両方をチェック
      const isInsideButtonContainer = avatarButtonRef.current?.contains(target);
      const isInsideMenu = avatarMenuRef.current?.contains(target);

      if (!isInsideButtonContainer && !isInsideMenu) {
        setIsAvatarMenuOpen(false);
        setMenuPosition(null);
      }
    };

    if (isAvatarMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAvatarMenuOpen]);

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

  // 連携解除ハンドラー（確認ダイアログを表示）
  const handleUnlinkProvider = useCallback((provider: OAuthProvider) => {
    setConfirmDialog({
      isOpen: true,
      type: "unlink",
      provider,
    });
  }, []);

  // 連携解除確定
  const handleConfirmUnlink = useCallback(() => {
    if (confirmDialog.provider) {
      unlinkProvider(confirmDialog.provider);
    }
    setConfirmDialog({ isOpen: false, type: null });
  }, [confirmDialog.provider, unlinkProvider]);

  // アバターメニュー操作
  const handleToggleAvatarMenu = useCallback(() => {
    setIsAvatarMenuOpen((prev) => {
      if (!prev && avatarButtonRef.current) {
        // メニューを開く時に位置を計算
        const rect = avatarButtonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + 8, // mt-2相当
          left: rect.left,
        });
      } else {
        setMenuPosition(null);
      }
      return !prev;
    });
  }, []);

  const handleUploadAvatar = useCallback(() => {
    uploadAvatar();
    setIsAvatarMenuOpen(false);
    setMenuPosition(null);
  }, [uploadAvatar]);

  const handleUseProviderAvatar = useCallback(
    (provider: OAuthProvider) => {
      useProviderAvatar(provider);
      setIsAvatarMenuOpen(false);
      setMenuPosition(null);
    },
    [useProviderAvatar],
  );

  // アバター削除ハンドラー（確認ダイアログを表示）
  const handleRemoveAvatarClick = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      type: "remove-avatar",
    });
    setIsAvatarMenuOpen(false);
    setMenuPosition(null);
  }, []);

  // アバター削除確定
  const handleConfirmRemoveAvatar = useCallback(() => {
    removeAvatar();
    setConfirmDialog({ isOpen: false, type: null });
  }, [removeAvatar]);

  // 確認ダイアログキャンセル
  const handleCancelConfirm = useCallback(() => {
    setConfirmDialog({ isOpen: false, type: null });
    setDeleteConfirmEmail("");
  }, []);

  // アカウント削除ダイアログを表示
  const handleDeleteAccountClick = useCallback(() => {
    setConfirmDialog({
      isOpen: true,
      type: "delete-account",
    });
    setDeleteConfirmEmail("");
  }, []);

  // アカウント削除確定
  const handleConfirmDeleteAccount = useCallback(async () => {
    const success = await deleteAccount(deleteConfirmEmail);
    if (success) {
      setConfirmDialog({ isOpen: false, type: null });
      setDeleteConfirmEmail("");
    }
  }, [deleteAccount, deleteConfirmEmail]);

  const displayName = profile?.displayName || authUser?.displayName || "User";
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
              {/* Avatar with Edit Button */}
              <div className="flex-shrink-0 relative" ref={avatarButtonRef}>
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
                {/* Avatar Edit Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleAvatarMenu}
                  aria-label="アバターを編集"
                  className="absolute -bottom-1 -right-1 w-6 h-6 !p-0 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <Icon name="pencil" size={12} />
                </Button>
              </div>

              {/* Avatar Edit Menu - Portal to escape stacking context */}
              {isAvatarMenuOpen &&
                menuPosition &&
                createPortal(
                  <div
                    ref={avatarMenuRef}
                    role="menu"
                    className="fixed w-48 bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-lg z-[9999]"
                    style={{ top: menuPosition.top, left: menuPosition.left }}
                  >
                    <button
                      role="menuitem"
                      onClick={handleUploadAvatar}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                    >
                      <Icon name="upload" size={14} />
                      アップロード
                    </button>
                    {/* Provider Avatar Options - 現在使用中のアバターのプロバイダーは非表示 */}
                    {linkedProviders
                      .filter((p) => p.avatarUrl && p.avatarUrl !== avatarUrl)
                      .map((provider) => (
                        <button
                          key={provider.provider}
                          role="menuitem"
                          onClick={() =>
                            handleUseProviderAvatar(
                              provider.provider as OAuthProvider,
                            )
                          }
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                        >
                          <ProviderIcon
                            provider={provider.provider as OAuthProvider}
                            size={14}
                          />
                          {getProviderDisplayName(provider.provider)}
                          のアバターを使用
                        </button>
                      ))}
                    {/* Remove Avatar Option */}
                    <button
                      role="menuitem"
                      onClick={handleRemoveAvatarClick}
                      disabled={!avatarUrl}
                      className={clsx(
                        "w-full px-4 py-2 text-left text-sm flex items-center gap-2",
                        avatarUrl
                          ? "text-red-400 hover:bg-red-500/10"
                          : "text-white/30 cursor-not-allowed",
                      )}
                    >
                      <Icon name="trash-2" size={14} />
                      アバターを削除
                    </button>
                  </div>,
                  document.body,
                )}

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
                        aria-label="名前を編集"
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
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-green-400">
                      <Icon name="check-circle" size={16} />
                      <span className="text-sm">登録済み</span>
                    </div>
                    {/* 連携解除ボタン - 複数プロバイダー連携時のみ表示 */}
                    {linkedProviders.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleUnlinkProvider(
                            provider.provider as OAuthProvider,
                          )
                        }
                        disabled={isLoading}
                        aria-label={`${provider.provider}の連携を解除`}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        解除
                      </Button>
                    )}
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

          {/* Account Delete Section */}
          <GlassPanel
            radius="md"
            blur="md"
            className="p-6 border border-red-500/30"
          >
            <h4 className="text-sm font-medium text-red-400 mb-2">
              危険な操作
            </h4>
            <p className="text-white/60 text-sm mb-4">
              アカウントを削除すると、全てのデータが削除されます。この操作は取り消せません。
            </p>
            <Button
              variant="ghost"
              onClick={handleDeleteAccountClick}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
              aria-label="アカウントを削除"
            >
              アカウントを削除
            </Button>
          </GlassPanel>
        </>
      )}

      {/* 確認ダイアログ */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <GlassPanel radius="lg" blur="md" className="p-6 max-w-md mx-4">
            <div className="text-center space-y-4">
              <Icon
                name="alert-triangle"
                size={48}
                className={clsx(
                  "mx-auto",
                  confirmDialog.type === "delete-account"
                    ? "text-red-400"
                    : "text-yellow-400",
                )}
              />
              <h3 className="text-lg font-semibold text-white">
                {confirmDialog.type === "unlink"
                  ? "連携解除の確認"
                  : confirmDialog.type === "delete-account"
                    ? "アカウント削除の確認"
                    : "アバター削除の確認"}
              </h3>
              <p className="text-white/60 text-sm">
                {confirmDialog.type === "unlink"
                  ? `${confirmDialog.provider}との連携を本当に連携を解除しますか？`
                  : confirmDialog.type === "delete-account"
                    ? "アカウントを削除すると、全てのデータが完全に削除されます。この操作は取り消せません。"
                    : "アバターを本当に削除しますか？"}
              </p>
              {/* アカウント削除時のみメール確認入力 */}
              {confirmDialog.type === "delete-account" && (
                <div className="text-left space-y-2">
                  <label
                    htmlFor="delete-confirm-email"
                    className="text-white/80 text-sm"
                  >
                    確認のため、メールアドレスを入力してください:
                  </label>
                  <Input
                    id="delete-confirm-email"
                    aria-label="確認用メールアドレス"
                    value={deleteConfirmEmail}
                    onChange={setDeleteConfirmEmail}
                    placeholder={email}
                    type="email"
                  />
                  <p className="text-white/40 text-xs">
                    削除するアカウント: {email}
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <Button variant="ghost" onClick={handleCancelConfirm}>
                  キャンセル
                </Button>
                <Button
                  variant="danger"
                  disabled={
                    confirmDialog.type === "delete-account"
                      ? deleteConfirmEmail !== email || isLoading
                      : isLoading
                  }
                  onClick={
                    confirmDialog.type === "unlink"
                      ? handleConfirmUnlink
                      : confirmDialog.type === "delete-account"
                        ? handleConfirmDeleteAccount
                        : handleConfirmRemoveAvatar
                  }
                >
                  {confirmDialog.type === "unlink"
                    ? "解除する"
                    : confirmDialog.type === "delete-account"
                      ? "アカウントを削除"
                      : "削除する"}
                </Button>
              </div>
            </div>
          </GlassPanel>
        </div>
      )}
    </section>
  );
};

AccountSection.displayName = "AccountSection";
