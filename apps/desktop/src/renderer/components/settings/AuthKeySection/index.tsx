import React, { useCallback, useState } from "react";
import type { ApiKeyStatus } from "@repo/shared/types";
import { useAuthKeyManagement } from "../../../hooks/useAuthKeyManagement";

// ============================================================
// 表示キー（ApiKeyStatus + keySource → バッジ設定の導出）
// ============================================================

type DisplayKey =
  | "saved"
  | "env-fallback"
  | "not_set"
  | "check-failed"
  | "validating"
  | "error"
  | "configured";

function getDisplayKey(
  status: ApiKeyStatus,
  keySource: "saved" | "env-fallback" | null,
): DisplayKey {
  if (status === "configured" && keySource) return keySource;
  return status as DisplayKey;
}

/** 各状態に対応するバッジ設定 */
const STATUS_CONFIG: Record<
  DisplayKey,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  saved: {
    label: "保存済み",
    bgClass: "bg-[#34C759]/10",
    textClass: "text-[#34C759]",
    borderClass: "border-[#34C759]/30",
  },
  "env-fallback": {
    label: "環境変数で設定済み",
    bgClass: "bg-[#FF9500]/10",
    textClass: "text-[#FF9500]",
    borderClass: "border-[#FF9500]/30",
  },
  not_set: {
    label: "未設定",
    bgClass: "bg-[#FF3B30]/10",
    textClass: "text-[#FF3B30]",
    borderClass: "border-[#FF3B30]/30",
  },
  "check-failed": {
    label: "確認失敗",
    bgClass: "bg-gray-100",
    textClass: "text-gray-500",
    borderClass: "border-gray-300",
  },
  validating: {
    label: "確認中...",
    bgClass: "bg-[#007AFF]/10",
    textClass: "text-[#007AFF]",
    borderClass: "border-[#007AFF]/30",
  },
  error: {
    label: "エラー",
    bgClass: "bg-[#FF3B30]/10",
    textClass: "text-[#FF3B30]",
    borderClass: "border-[#FF3B30]/30",
  },
  configured: {
    label: "設定済み",
    bgClass: "bg-[#34C759]/10",
    textClass: "text-[#34C759]",
    borderClass: "border-[#34C759]/30",
  },
};

// ============================================================
// Props
// ============================================================

interface AuthKeySectionProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
}

// ============================================================
// コンポーネント
// ============================================================

export const AuthKeySection: React.FC<AuthKeySectionProps> = ({
  onStatusChange,
}) => {
  const {
    status,
    keySource,
    inputValue,
    isSubmitting,
    validationError,
    apiError,
    setInputValue,
    handleSave: hookHandleSave,
    handleDelete: hookHandleDelete,
  } = useAuthKeyManagement({ onStatusChange });

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    setSuccessMessage(null);
    const ok = await hookHandleSave();
    if (ok) setSuccessMessage("APIキーを保存しました");
  }, [hookHandleSave]);

  const handleDelete = useCallback(async () => {
    setSuccessMessage(null);
    const ok = await hookHandleDelete();
    if (ok) setSuccessMessage("APIキーを削除しました");
  }, [hookHandleDelete]);

  const displayKey = getDisplayKey(status, keySource);
  const currentConfig = STATUS_CONFIG[displayKey];

  // 表示するメッセージ（成功優先、次にAPIエラー）
  const displayMessage = successMessage ?? validationError ?? apiError;
  const displayType: "success" | "error" | null = successMessage
    ? "success"
    : validationError || apiError
      ? "error"
      : null;

  return (
    <div
      className="mt-4 space-y-4"
      data-testid="auth-key-section"
      role="group"
      aria-label="APIキー管理"
    >
      {/* ステータスバッジ */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          APIキーの状態:
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentConfig.bgClass} ${currentConfig.textClass} ${currentConfig.borderClass}`}
          data-testid="auth-key-status-badge"
          data-status={displayKey}
        >
          {currentConfig.label}
        </span>
      </div>

      {/* APIキー入力フォーム */}
      <div className="space-y-2">
        <label
          htmlFor="auth-key-input"
          className="block text-sm font-medium text-gray-700"
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
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
              aria-label="Anthropic APIキー入力"
              aria-describedby="auth-key-description"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#007AFF] hover:bg-[#0066D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="save-auth-key-button"
          >
            {isSubmitting ? "処理中..." : "保存"}
          </button>
          {displayKey === "saved" && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#FF3B30] border border-[#FF3B30] hover:bg-[#FF3B30]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="delete-auth-key-button"
            >
              {isSubmitting ? "処理中..." : "削除"}
            </button>
          )}
        </div>
        <p id="auth-key-description" className="text-xs text-gray-500">
          APIキーはセキュアストレージに暗号化して保存されます
        </p>
      </div>

      {/* ステータスメッセージ */}
      {displayMessage && displayType && (
        <div
          className={`text-sm px-3 py-2 rounded-lg ${
            displayType === "success"
              ? "bg-[#34C759]/10 text-[#34C759]"
              : "bg-[#FF3B30]/10 text-[#FF3B30]"
          }`}
          data-testid="auth-key-status-message"
          role="status"
          aria-live="polite"
        >
          {displayMessage}
        </div>
      )}
    </div>
  );
};

AuthKeySection.displayName = "AuthKeySection";
