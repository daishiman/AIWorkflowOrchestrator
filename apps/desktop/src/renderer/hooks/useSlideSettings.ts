/**
 * useSlideSettings Hook - スライド設定管理フック
 *
 * スライド出力設定の状態管理とIPCレイヤーとの通信を抽象化するカスタムフック。
 *
 * @module @repo/desktop/renderer/hooks/useSlideSettings
 */

import { useState, useEffect, useCallback } from "react";
import type { SlideSettings, ValidationResult } from "@repo/shared/types";

/**
 * フックの状態インターフェース
 */
export interface UseSlideSettingsState {
  /** 現在の設定 */
  settings: SlideSettings | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 設定が変更されたかどうか */
  isModified: boolean;
  /** 現在のバリデーション結果 */
  validation: ValidationResult | null;
  /** 保存中かどうか */
  isSaving: boolean;
}

/**
 * フックのアクションインターフェース
 */
export interface UseSlideSettingsActions {
  /** 設定を初期化（再読み込み） */
  initialize: () => Promise<void>;
  /** ディレクトリを直接設定 */
  setDirectory: (path: string) => Promise<void>;
  /** ディレクトリ選択ダイアログを開く */
  selectDirectory: () => Promise<string | null>;
  /** 設定を保存 */
  save: () => Promise<boolean>;
  /** エラーをクリア */
  clearError: () => void;
  /** ディレクトリパスを展開（~ -> ホームディレクトリ） */
  expandPath: (path: string) => string;
  /** 自動作成フラグを設定 */
  setAutoCreateDirectory: (value: boolean) => void;
  /** 設定を元の状態にリセット */
  reset: () => void;
}

/**
 * フックの戻り値型
 */
export type UseSlideSettingsReturn = UseSlideSettingsState &
  UseSlideSettingsActions;

/**
 * パスを展開するユーティリティ
 *
 * @param path - 入力パス
 * @returns 展開されたパス（実際の展開はMain側で行われるため、ここでは表示用）
 */
function expandPathClient(path: string): string {
  // クライアント側ではホームディレクトリを取得できないため、
  // 表示用には ~ のまま返す
  return path;
}

/**
 * useSlideSettings - スライド設定管理フック
 *
 * @returns スライド設定の状態とアクション
 *
 * @example
 * ```tsx
 * function SlideSettingsPanel() {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     isModified,
 *     validation,
 *     setDirectory,
 *     selectDirectory,
 *     save,
 *   } = useSlideSettings();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ErrorMessage message={error} />;
 *
 *   return (
 *     <div>
 *       <input
 *         value={settings?.outputDirectory || ""}
 *         onChange={(e) => setDirectory(e.target.value)}
 *       />
 *       <button onClick={selectDirectory}>Browse</button>
 *       <button onClick={save} disabled={!isModified}>Save</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSlideSettings(): UseSlideSettingsReturn {
  // State
  const [settings, setSettings] = useState<SlideSettings | null>(null);
  const [originalSettings, setOriginalSettings] =
    useState<SlideSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 変更検知
  const isModified =
    settings !== null &&
    originalSettings !== null &&
    settings.outputDirectory !== originalSettings.outputDirectory;

  /**
   * 設定を初期化
   */
  const initialize = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await window.slideSettingsAPI.getAllSettings();

      if (!response.success) {
        throw new Error(response.error || "Failed to load settings");
      }

      if (response.data) {
        setSettings(response.data);
        setOriginalSettings(response.data);

        // 初期バリデーション
        const validationResponse =
          await window.slideSettingsAPI.validateDirectory(
            response.data.outputDirectory,
          );

        if (validationResponse.success && validationResponse.data) {
          setValidation(validationResponse.data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ディレクトリを設定
   */
  const setDirectory = useCallback(async (path: string) => {
    if (!path) {
      setError("Directory path cannot be empty");
      return;
    }

    // 状態を更新
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            outputDirectory: path,
          }
        : null,
    );

    // バリデーション
    try {
      const validationResponse =
        await window.slideSettingsAPI.validateDirectory(path);

      if (validationResponse.success && validationResponse.data) {
        setValidation(validationResponse.data);
        // バリデーションエラーがある場合は表示
        if (validationResponse.data.status === "error") {
          setError(validationResponse.data.message);
        } else {
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    }
  }, []);

  /**
   * ディレクトリ選択ダイアログを開く
   */
  const selectDirectory = useCallback(async (): Promise<string | null> => {
    try {
      const response = await window.slideSettingsAPI.selectDirectory();

      if (!response.success) {
        throw new Error(response.error || "Failed to select directory");
      }

      if (response.data) {
        // 選択されたパスで状態を更新
        await setDirectory(response.data);
        return response.data;
      }

      // キャンセルされた場合
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Selection failed");
      return null;
    }
  }, [setDirectory]);

  /**
   * 設定を保存
   */
  const save = useCallback(async (): Promise<boolean> => {
    if (!settings || !isModified) {
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await window.slideSettingsAPI.setDirectory(
        settings.outputDirectory,
      );

      if (!response.success) {
        throw new Error(response.error || "Failed to save settings");
      }

      // 成功した場合、originalSettingsを更新
      setOriginalSettings(settings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [settings, isModified]);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * パスを展開
   */
  const expandPath = useCallback((path: string): string => {
    return expandPathClient(path);
  }, []);

  /**
   * 自動作成フラグを設定
   */
  const setAutoCreateDirectory = useCallback((value: boolean) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            autoCreateDirectory: value,
          }
        : null,
    );
  }, []);

  /**
   * 設定を元の状態にリセット
   */
  const reset = useCallback(() => {
    if (originalSettings) {
      setSettings({ ...originalSettings });
      setError(null);
      setValidation(null);
    }
  }, [originalSettings]);

  // 初期化
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    // State
    settings,
    isLoading,
    error,
    isModified,
    validation,
    isSaving,
    // Actions
    initialize,
    setDirectory,
    selectDirectory,
    save,
    clearError,
    expandPath,
    setAutoCreateDirectory,
    reset,
  };
}

export default useSlideSettings;
