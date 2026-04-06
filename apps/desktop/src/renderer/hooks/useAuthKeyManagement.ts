/**
 * useAuthKeyManagement - AuthKey IPC 呼び出し共通フック
 *
 * TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001
 * AuthKeySection / ApiKeySettingsPanel の共通 IPC ロジックを統合する。
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiKeyStatus } from "@repo/shared/types";

// ============================================================
// バリデーション（ApiKeySettingsPanel から移植・統合）
// ============================================================

export function validateApiKey(key: string): string | null {
  const trimmed = key.trim();
  if (trimmed === "") return "APIキーを入力してください";
  if (trimmed.length > 200) return "APIキーの長さが不正です";
  if (!/^sk-/.test(trimmed)) return "APIキーの形式が正しくありません";
  return null;
}

// ============================================================
// 型定義
// ============================================================

export interface UseAuthKeyManagementReturn {
  /** APIキーの現在ステータス */
  status: ApiKeyStatus;
  /** キーの取得元（configured 状態のとき有効） */
  keySource: "saved" | "env-fallback" | null;
  /** 入力欄の値 */
  inputValue: string;
  /** IPC 呼び出し中フラグ */
  isSubmitting: boolean;
  /** バリデーションエラー */
  validationError: string | null;
  /** API エラー */
  apiError: string | null;
  /** 入力値を更新する */
  setInputValue: (value: string) => void;
  /** APIキーを保存する。成功時 true を返す */
  handleSave: () => Promise<boolean>;
  /** APIキーを削除する。成功時 true を返す */
  handleDelete: () => Promise<boolean>;
  /** ステータスを再取得する */
  refresh: () => Promise<boolean>;
}

export interface UseAuthKeyManagementOptions {
  /** ステータスが変化したときに呼ばれるコールバック */
  onStatusChange?: (status: ApiKeyStatus) => void;
}

// ============================================================
// フック本体
// ============================================================

export function useAuthKeyManagement(
  options?: UseAuthKeyManagementOptions,
): UseAuthKeyManagementReturn {
  const [status, setStatus] = useState<ApiKeyStatus>("not_set");
  const [keySource, setKeySource] = useState<"saved" | "env-fallback" | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // onStatusChange を ref で保持してコールバックの安定性を確保
  const onStatusChangeRef = useRef(options?.onStatusChange);
  useEffect(() => {
    onStatusChangeRef.current = options?.onStatusChange;
  }, [options?.onStatusChange]);

  const updateStatus = useCallback((newStatus: ApiKeyStatus) => {
    setStatus(newStatus);
    onStatusChangeRef.current?.(newStatus);
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.exists) {
        updateStatus("check-failed");
        setKeySource(null);
        setApiError("ステータスの確認に失敗しました");
        return false;
      }
      const result = await authKeyApi.exists();
      if (result.exists) {
        updateStatus("configured");
        setKeySource(
          result.source === "saved" || result.source === "env-fallback"
            ? result.source
            : null,
        );
      } else {
        updateStatus("not_set");
        setKeySource(null);
      }
      setApiError(null);
      return true;
    } catch {
      updateStatus("check-failed");
      setKeySource(null);
      setApiError("ステータスの確認に失敗しました");
      return false;
    }
  }, [updateStatus]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (isSubmittingRef.current) return false;

    setValidationError(null);
    setApiError(null);

    const trimmed = inputValue.trim();
    const error = validateApiKey(trimmed);
    if (error) {
      setValidationError(error);
      return false;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    updateStatus("validating");

    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.set) {
        setApiError("APIキー設定機能が利用できません");
        updateStatus("error");
        return false;
      }
      const result = await authKeyApi.set(trimmed);
      if (result.success) {
        updateStatus("configured");
        setKeySource("saved");
        setInputValue("");
        return true;
      } else {
        updateStatus("error");
        setApiError(result.error ?? "保存に失敗しました");
        return false;
      }
    } catch {
      updateStatus("error");
      setApiError("予期しないエラーが発生しました");
      return false;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [inputValue, updateStatus]);

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (isSubmittingRef.current) return false;

    setValidationError(null);
    setApiError(null);
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const authKeyApi = window.electronAPI?.authKey;
      if (!authKeyApi?.delete) {
        setApiError("APIキー削除機能が利用できません");
        updateStatus("error");
        return false;
      }
      const result = await authKeyApi.delete();
      if (result.success) {
        const refreshOk = await refresh();
        if (!refreshOk) {
          setApiError("ステータスの再確認に失敗しました");
          return false;
        }
        return true;
      } else {
        setApiError(result.error ?? "削除に失敗しました");
        updateStatus("error");
        return false;
      }
    } catch {
      setApiError("予期しないエラーが発生しました");
      updateStatus("error");
      return false;
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [refresh]);

  return {
    status,
    keySource,
    inputValue,
    isSubmitting,
    validationError,
    apiError,
    setInputValue,
    handleSave,
    handleDelete,
    refresh,
  };
}
