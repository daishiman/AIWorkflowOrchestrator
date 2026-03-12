import React, { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { useAuthModeStatus } from "../../../store";

/**
 * AuthKey の状態を表す4状態
 * - saved: 保存済み（Main Process のセキュアストレージに格納されている）
 * - env-fallback: 環境変数 ANTHROPIC_API_KEY で代替している
 * - not-set: 未設定
 * - check-failed: 状態確認に失敗
 */
export type AuthKeyStatus =
  | "saved"
  | "env-fallback"
  | "not-set"
  | "check-failed";

/** 各状態に対応するバッジ設定 */
const STATUS_CONFIG: Record<
  AuthKeyStatus,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  saved: {
    label: "保存済み",
    bgClass: "bg-[var(--status-success-subtle)]",
    textClass: "text-[var(--status-success)]",
    borderClass: "border-[var(--status-success)]/30",
  },
  "env-fallback": {
    label: "環境変数で設定済み",
    bgClass: "bg-[var(--status-warning-subtle)]",
    textClass: "text-[var(--status-warning)]",
    borderClass: "border-[var(--status-warning)]/30",
  },
  "not-set": {
    label: "未設定",
    bgClass: "bg-[var(--status-error)]/10",
    textClass: "text-[var(--status-error)]",
    borderClass: "border-[var(--status-error)]/30",
  },
  "check-failed": {
    label: "確認失敗",
    bgClass: "bg-[var(--bg-tertiary)]",
    textClass: "text-[var(--text-muted)]",
    borderClass: "border-[var(--border-primary)]",
  },
};

export const AuthKeySection: React.FC = () => {
  const authModeStatus = useAuthModeStatus();

  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [authKeyStatus, setAuthKeyStatus] = useState<AuthKeyStatus>("not-set");

  /** 状態を判定して authKeyStatus を更新する */
  const checkAuthKeyStatus = useCallback(async () => {
    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.exists) {
        setAuthKeyStatus("check-failed");
        return;
      }

      const existsResult = await authKeyApi.exists();
      if (!existsResult.exists) {
        setAuthKeyStatus("not-set");
        return;
      }

      if (existsResult.source === "saved") {
        setAuthKeyStatus("saved");
        return;
      }

      if (existsResult.source === "env-fallback") {
        setAuthKeyStatus("env-fallback");
        return;
      }

      // 旧実装互換: source が未提供の場合は hasCredentials を補助判定に使う
      const hasCredentials = authModeStatus?.hasCredentials ?? false;
      setAuthKeyStatus(hasCredentials ? "saved" : "env-fallback");
    } catch {
      setAuthKeyStatus("check-failed");
    }
  }, [authModeStatus?.hasCredentials]);

  useEffect(() => {
    checkAuthKeyStatus();
  }, [checkAuthKeyStatus]);

  /** APIキーを保存する */
  const handleSave = useCallback(async () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue === "") {
      setStatusMessage("APIキーを入力してください");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.set) {
        setStatusMessage("APIキー設定機能が利用できません");
        setStatusType("error");
        return;
      }

      const result = await authKeyApi.set(trimmedValue);
      if (result.success) {
        setInputValue("");
        setStatusMessage("APIキーを保存しました");
        setStatusType("success");
        await checkAuthKeyStatus();
      } else {
        setStatusMessage(result.error ?? "APIキーの保存に失敗しました");
        setStatusType("error");
      }
    } catch {
      setStatusMessage("APIキーの保存中にエラーが発生しました");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, checkAuthKeyStatus]);

  /** APIキーを削除する */
  const handleDelete = useCallback(async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    setStatusType(null);

    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.delete) {
        setStatusMessage("APIキー削除機能が利用できません");
        setStatusType("error");
        return;
      }

      const result = await authKeyApi.delete();
      if (result.success) {
        setStatusMessage("APIキーを削除しました");
        setStatusType("success");
        await checkAuthKeyStatus();
      } else {
        setStatusMessage(result.error ?? "APIキーの削除に失敗しました");
        setStatusType("error");
      }
    } catch {
      setStatusMessage("APIキーの削除中にエラーが発生しました");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  }, [checkAuthKeyStatus]);

  const currentConfig = STATUS_CONFIG[authKeyStatus];

  return (
    <div
      className="mt-4 space-y-4"
      data-testid="auth-key-section"
      role="group"
      aria-label="APIキー管理"
    >
      {/* ステータスバッジ */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          APIキーの状態:
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentConfig.bgClass} ${currentConfig.textClass} ${currentConfig.borderClass}`}
          data-testid="auth-key-status-badge"
          data-status={authKeyStatus}
        >
          {currentConfig.label}
        </span>
      </div>

      {/* APIキー入力フォーム */}
      <div className="space-y-2">
        <label
          htmlFor="auth-key-input"
          className="block text-sm font-medium text-[var(--text-primary)]"
        >
          Anthropic APIキー
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              id="auth-key-input"
              type={showPassword ? "text" : "password"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="sk-ant-..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--status-primary)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              aria-label="Anthropic APIキー入力"
              aria-describedby="auth-key-description"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label={
                showPassword ? "パスワードを隠す" : "パスワードを表示"
              }
              data-testid="toggle-password-visibility"
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || inputValue.trim() === ""}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-inverse)] bg-[var(--status-primary)] hover:bg-[var(--status-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="save-auth-key-button"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
          {authKeyStatus === "saved" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--status-error)] border border-[var(--status-error)] hover:bg-[var(--status-error)]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="delete-auth-key-button"
            >
              削除
            </button>
          )}
        </div>
        <p
          id="auth-key-description"
          className="text-xs text-[var(--text-muted)]"
        >
          APIキーはセキュアストレージに暗号化して保存されます
        </p>
      </div>

      {/* ステータスメッセージ */}
      {statusMessage && (
        <div
          className={clsx(
            "text-sm px-3 py-2 rounded-lg",
            statusType === "success"
              ? "bg-[var(--status-success-subtle)] text-[var(--status-success)]"
              : "bg-[var(--status-error)]/10 text-[var(--status-error)]",
          )}
          data-testid="auth-key-status-message"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </div>
      )}
    </div>
  );
};

AuthKeySection.displayName = "AuthKeySection";
