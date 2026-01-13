/**
 * SlideDirectorySettings - スライド出力ディレクトリ設定コンポーネント
 *
 * presentation-slide-generatorスキルの出力先ディレクトリを設定するUIコンポーネント。
 *
 * @module @repo/desktop/renderer/components/settings/SlideDirectorySettings
 */

import React, { useCallback } from "react";
import { useSlideSettings } from "../../../hooks/useSlideSettings";

/**
 * コンポーネントプロパティ
 */
export interface SlideDirectorySettingsProps {
  /** カスタムクラス名 */
  className?: string;
}

/**
 * バリデーションステータスの表示コンポーネント
 */
function ValidationStatus({
  validation,
  error,
}: {
  validation: ReturnType<typeof useSlideSettings>["validation"];
  error: string | null;
}) {
  if (error) {
    return (
      <div
        className="mt-2 text-sm text-red-600 dark:text-red-400"
        role="alert"
        aria-live="polite"
      >
        {error}
      </div>
    );
  }

  if (!validation) {
    return null;
  }

  if (validation.status === "warning") {
    return (
      <div
        className="mt-2 text-sm text-yellow-600 dark:text-yellow-400"
        role="status"
        aria-live="polite"
      >
        {validation.message}
      </div>
    );
  }

  if (validation.status === "valid") {
    return (
      <div
        className="mt-2 text-sm text-green-600 dark:text-green-400"
        role="status"
        aria-live="polite"
      >
        {validation.message}
      </div>
    );
  }

  return null;
}

/**
 * SlideDirectorySettings コンポーネント
 *
 * スライド出力先ディレクトリの設定UI
 *
 * @example
 * ```tsx
 * <SlideDirectorySettings className="mt-4" />
 * ```
 */
export function SlideDirectorySettings({
  className = "",
}: SlideDirectorySettingsProps): React.ReactElement {
  const {
    settings,
    isLoading,
    error,
    isModified,
    validation,
    isSaving,
    setDirectory,
    selectDirectory,
    save,
    clearError,
  } = useSlideSettings();

  /**
   * 入力変更ハンドラー
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearError();
      setDirectory(e.target.value);
    },
    [setDirectory, clearError],
  );

  /**
   * ディレクトリ選択ボタンクリックハンドラー
   */
  const handleSelectClick = useCallback(async () => {
    clearError();
    await selectDirectory();
  }, [selectDirectory, clearError]);

  /**
   * 保存ボタンクリックハンドラー
   */
  const handleSaveClick = useCallback(async () => {
    clearError();
    await save();
  }, [save, clearError]);

  /**
   * キーダウンハンドラー（Enter で保存）
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && isModified && !isSaving) {
        handleSaveClick();
      }
    },
    [isModified, isSaving, handleSaveClick],
  );

  // ローディング状態
  if (isLoading) {
    return (
      <div
        className={`slide-directory-settings ${className}`}
        data-testid="slide-directory-settings"
        aria-busy="true"
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`slide-directory-settings ${className}`}
      data-testid="slide-directory-settings"
    >
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Slide Output Directory
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Set the directory where generated slides will be saved.
      </p>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="slide-directory-input" className="sr-only">
            Output directory path
          </label>
          <input
            id="slide-directory-input"
            type="text"
            value={settings?.outputDirectory || ""}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="~/Documents/Slides"
            aria-describedby="directory-validation-status"
            aria-invalid={
              !!error || Boolean(validation && validation.status === "error")
            }
          />
        </div>

        <button
          type="button"
          onClick={handleSelectClick}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Browse for directory"
        >
          Browse
        </button>

        <button
          type="button"
          onClick={handleSaveClick}
          disabled={!isModified || isSaving}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isModified && !isSaving
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
          aria-busy={isSaving}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <div id="directory-validation-status">
        <ValidationStatus validation={validation} error={error} />
      </div>

      {isModified && (
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
          Unsaved changes
        </p>
      )}
    </div>
  );
}

export default SlideDirectorySettings;
