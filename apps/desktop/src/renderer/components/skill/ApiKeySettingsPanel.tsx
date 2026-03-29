/**
 * @file ApiKeySettingsPanel.tsx
 * @description Anthropic API キーの設定・検証・削除を行うコンポーネント (TASK-RT-04)
 */

import React, { useCallback, useEffect, useState } from "react";
import type { ApiKeyStatus } from "@repo/shared/types";

// ============================================================
// バリデーション
// ============================================================

function validateApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (trimmed === "") return "APIキーを入力してください";
  if (trimmed.length > 200) return "APIキーの長さが不正です";
  if (!/^sk-/.test(trimmed)) return "APIキーの形式が正しくありません";
  return null;
}

// ============================================================
// コンポーネント
// ============================================================

interface ApiKeySettingsPanelProps {
  onStatusChange?: (status: ApiKeyStatus) => void;
}

export function ApiKeySettingsPanel({
  onStatusChange,
}: ApiKeySettingsPanelProps): React.ReactNode {
  const [status, setStatus] = useState<ApiKeyStatus>("not_set");
  const [inputValue, setInputValue] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [keySource, setKeySource] = useState<"saved" | "env-fallback" | null>(
    null,
  );

  const updateStatus = useCallback(
    (newStatus: ApiKeyStatus) => {
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    },
    [onStatusChange],
  );

  // 初期ロード: キーの存在確認
  useEffect(() => {
    let cancelled = false;
    const checkExisting = async () => {
      try {
        const result = await window.electronAPI.authKey.exists();
        if (cancelled) return;
        if (result.exists) {
          updateStatus("configured");
          setKeySource(
            result.source === "saved" || result.source === "env-fallback"
              ? result.source
              : null,
          );
        } else {
          updateStatus("not_set");
        }
      } catch {
        if (!cancelled) updateStatus("not_set");
      }
    };
    void checkExisting();
    return () => {
      cancelled = true;
    };
  }, [updateStatus]);

  const handleSave = async () => {
    setValidationError(null);
    setApiError(null);

    const normalizedApiKey = inputValue.trim();
    const error = validateApiKey(normalizedApiKey);
    if (error) {
      setValidationError(error);
      return;
    }

    updateStatus("validating");

    try {
      const result = await window.electronAPI.authKey.set(normalizedApiKey);
      if (result.success) {
        updateStatus("configured");
        setKeySource("saved");
        setInputValue("");
      } else {
        updateStatus("error");
        setApiError(result.error ?? "保存に失敗しました");
      }
    } catch {
      updateStatus("error");
      setApiError("予期しないエラーが発生しました");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await window.electronAPI.authKey.delete();
      if (result.success) {
        try {
          const latest = await window.electronAPI.authKey.exists();
          if (latest.exists) {
            updateStatus("configured");
            setKeySource(
              latest.source === "saved" || latest.source === "env-fallback"
                ? latest.source
                : null,
            );
          } else {
            updateStatus("not_set");
            setKeySource(null);
          }
        } catch {
          updateStatus("not_set");
          setKeySource(null);
        }
        setApiError(null);
      } else {
        setApiError(result.error ?? "削除に失敗しました");
      }
    } catch {
      setApiError("予期しないエラーが発生しました");
    }
  };

  // ============================================================
  // レンダリング
  // ============================================================

  const statusBadge = () => {
    switch (status) {
      case "not_set":
        return (
          <span
            className="rounded-full bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
            data-testid="skill-api-key-status-badge"
          >
            未設定
          </span>
        );
      case "validating":
        return (
          <span
            className="rounded-full bg-[var(--status-primary)] px-2 py-0.5 text-xs text-white"
            data-testid="skill-api-key-status-badge"
          >
            検証中...
          </span>
        );
      case "configured":
        return (
          <span
            className="rounded-full bg-[var(--status-success)] px-2 py-0.5 text-xs text-white"
            data-testid="skill-api-key-status-badge"
          >
            設定済み
          </span>
        );
      case "error":
        return (
          <span
            className="rounded-full bg-[var(--status-error)] px-2 py-0.5 text-xs text-white"
            data-testid="skill-api-key-status-badge"
          >
            エラー
          </span>
        );
    }
  };

  return (
    <div
      className="rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4"
      data-testid="skill-api-key-panel"
    >
      {/* ヘッダー */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          APIキー設定
        </h3>
        {statusBadge()}
      </div>

      {/* コンテンツ: 状態に応じて切り替え */}
      {status === "configured" ? (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--text-secondary)]">
                Anthropic API キー
              </span>
              <span className="font-mono text-xs text-[var(--text-primary)]">
                sk-ant-***...***
              </span>
              {keySource && (
                <span
                  className="text-xs text-[var(--text-tertiary)]"
                  data-testid="skill-api-key-source"
                >
                  {keySource === "saved" ? "保存済み" : "環境変数"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleDelete}
              data-testid="skill-api-key-delete-button"
              className="rounded-md border border-[var(--status-error)] px-3 py-1.5 text-xs text-[var(--status-error)] transition-opacity hover:opacity-80"
            >
              削除
            </button>
          </div>
          {apiError && (
            <p
              className="mt-2 text-xs text-[var(--status-error)]"
              data-testid="skill-api-key-message"
            >
              {apiError}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <input
            type="password"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setValidationError(null);
            }}
            placeholder="sk-ant-api..."
            disabled={status === "validating"}
            data-testid="skill-api-key-input"
            className="rounded-md border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--status-primary)] focus:outline-none disabled:opacity-50"
          />
          {validationError && (
            <p
              className="text-xs text-[var(--status-error)]"
              data-testid="skill-api-key-message"
            >
              {validationError}
            </p>
          )}
          {apiError && (
            <p
              className="text-xs text-[var(--status-error)]"
              data-testid="skill-api-key-message"
            >
              {apiError}
            </p>
          )}
          {status === "validating" ? (
            <span className="text-xs text-[var(--text-secondary)]">
              検証中...
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              data-testid="skill-api-key-save-button"
              className="self-start rounded-md bg-[var(--status-primary)] px-4 py-1.5 text-xs text-white transition-opacity hover:opacity-90"
            >
              保存
            </button>
          )}
        </div>
      )}
    </div>
  );
}
