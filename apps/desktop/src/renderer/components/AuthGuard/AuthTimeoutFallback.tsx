/**
 * 認証タイムアウトフォールバックコンポーネント
 *
 * 認証確認が10秒以上かかった場合に表示されるフォールバックUI。
 * リトライと設定画面への遷移オプションを提供する。
 *
 * @module AuthGuard/AuthTimeoutFallback
 */

import type { FC } from "react";
import { Icon } from "../atoms/Icon";

interface AuthTimeoutFallbackProps {
  /** リトライボタンクリック時のコールバック */
  onRetry: () => void;
  /** 設定画面への遷移ボタンクリック時のコールバック */
  onNavigateSettings: () => void;
}

/**
 * 認証タイムアウト時に表示されるフォールバックUI
 *
 * @component
 * @example
 * ```tsx
 * <AuthTimeoutFallback
 *   onRetry={() => initializeAuth()}
 *   onNavigateSettings={() => setCurrentView("settings")}
 * />
 * ```
 */
export const AuthTimeoutFallback: FC<AuthTimeoutFallbackProps> = ({
  onRetry,
  onNavigateSettings,
}) => {
  return (
    <div
      className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg-primary)]"
      role="alert"
      aria-label="認証タイムアウト"
    >
      <div className="mb-6">
        <Icon
          name="alert-triangle"
          size={48}
          className="text-[var(--status-warning)]"
        />
      </div>

      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
        認証の確認に時間がかかっています
      </h2>
      <p className="text-sm text-[var(--text-secondary)] mb-8 text-center max-w-md px-4">
        ネットワーク接続を確認するか、以下のオプションをお試しください
      </p>

      <div className="flex flex-col gap-3 w-64">
        <button
          type="button"
          onClick={onRetry}
          className="w-full px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:opacity-90 active:opacity-80 transition-opacity duration-200"
          aria-label="リトライ"
        >
          リトライ
        </button>
        <button
          type="button"
          onClick={onNavigateSettings}
          className="w-full px-6 py-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-medium hover:opacity-90 active:opacity-80 transition-opacity duration-200"
          aria-label="設定画面へ"
        >
          設定画面へ
        </button>
      </div>
    </div>
  );
};

AuthTimeoutFallback.displayName = "AuthTimeoutFallback";
