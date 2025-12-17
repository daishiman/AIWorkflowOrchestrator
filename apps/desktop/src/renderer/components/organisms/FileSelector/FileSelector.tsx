/**
 * FileSelector コンポーネント
 *
 * ファイル選択機能のメインUIコンポーネント。
 * ドラッグ&ドロップ、ファイルダイアログ、ファイルリスト表示を提供。
 *
 * @see docs/30-workflows/file-selection/step06-ui-design.md
 */

import { useCallback, type DragEvent, type ChangeEvent } from "react";
import type { FileFilterCategory, SelectedFile } from "@repo/shared/types";
import {
  useSelectedFiles,
  useHasSelectedFiles,
  useFileFilterCategory,
  useFileSelectionIsDragging,
  useFileSelectionIsLoading,
  useFileSelectionError,
  useAddFiles,
  useRemoveFile,
  useClearFiles,
  useSetFileSelectionIsDragging,
  useSetFileSelectionIsLoading,
  useSetFileSelectionError,
  useSetFileFilterCategory,
} from "../../../store";

// =============================================================================
// Types
// =============================================================================

interface ElectronFile extends File {
  path?: string;
}

// =============================================================================
// Component
// =============================================================================

export const FileSelector: React.FC = () => {
  // Store hooks
  const selectedFiles = useSelectedFiles();
  const hasSelectedFiles = useHasSelectedFiles();
  const filterCategory = useFileFilterCategory();
  const isDragging = useFileSelectionIsDragging();
  const isLoading = useFileSelectionIsLoading();
  const error = useFileSelectionError();
  const addFiles = useAddFiles();
  const removeFile = useRemoveFile();
  const clearFiles = useClearFiles();
  const setIsDragging = useSetFileSelectionIsDragging();
  const setIsLoading = useSetFileSelectionIsLoading();
  const setError = useSetFileSelectionError();
  const setFilterCategory = useSetFileFilterCategory();

  // ===========================================================================
  // File Selection Dialog Handler
  // ===========================================================================

  const handleOpenDialog = useCallback(async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const result = await window.electronAPI.fileSelection.openDialog({
        filterCategory,
        multiSelections: true,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.data.canceled || result.data.filePaths.length === 0) {
        setIsLoading(false);
        return;
      }

      const metadataResult =
        await window.electronAPI.fileSelection.getMultipleMetadata({
          filePaths: result.data.filePaths,
        });

      if (!metadataResult.success) {
        setError(metadataResult.error);
        return;
      }

      if (metadataResult.data.files.length > 0) {
        addFiles(metadataResult.data.files);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  }, [isLoading, filterCategory, addFiles, setIsLoading, setError]);

  // ===========================================================================
  // Drag & Drop Handlers
  // ===========================================================================

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isLoading) {
        setIsDragging(true);
      }
    },
    [isLoading, setIsDragging],
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    },
    [setIsDragging],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isLoading) return;

      const droppedFiles = Array.from(e.dataTransfer.files) as ElectronFile[];
      const filePaths = droppedFiles
        .filter((file) => file.path)
        .map((file) => file.path as string);

      if (filePaths.length === 0) return;

      try {
        setIsLoading(true);

        const metadataResult =
          await window.electronAPI.fileSelection.getMultipleMetadata({
            filePaths,
          });

        if (!metadataResult.success) {
          setError(metadataResult.error);
          return;
        }

        if (metadataResult.data.files.length > 0) {
          addFiles(metadataResult.data.files);
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      }
    },
    [isLoading, addFiles, setIsDragging, setIsLoading, setError],
  );

  // ===========================================================================
  // Filter Handler
  // ===========================================================================

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilterCategory(e.target.value as FileFilterCategory);
    },
    [setFilterCategory],
  );

  // ===========================================================================
  // File Actions
  // ===========================================================================

  const handleRemoveFile = useCallback(
    (id: string) => {
      removeFile(id);
    },
    [removeFile],
  );

  const handleClearFiles = useCallback(() => {
    clearFiles();
  }, [clearFiles]);

  const handleCloseError = useCallback(() => {
    setError(null);
  }, [setError]);

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div data-testid="file-selector" className="file-selector">
      {/* Drop Zone */}
      <div
        data-testid="file-drop-zone"
        role="region"
        aria-label="ファイルドロップゾーン"
        aria-busy={isLoading}
        aria-invalid={error !== null}
        className={`file-drop-zone ${isDragging ? "dragging" : ""} ${isLoading ? "loading" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div data-testid="loading-spinner" className="loading-spinner">
            <span className="spinner" aria-hidden="true" />
            <span className="sr-only">読み込み中...</span>
          </div>
        )}

        {/* Drop Zone Content */}
        <div className="drop-zone-content">
          {!isLoading && (
            <>
              <p>ファイルをドラッグ&ドロップ</p>
              <p>または</p>
            </>
          )}
          <button
            type="button"
            data-testid="file-select-button"
            onClick={handleOpenDialog}
            disabled={isLoading}
            className="select-button"
          >
            ファイルを選択
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <label htmlFor="file-filter">
          フィルター
          <select
            id="file-filter"
            data-testid="file-filter-select"
            value={filterCategory}
            onChange={handleFilterChange}
            disabled={isLoading}
          >
            <option value="all">すべて</option>
            <option value="office">オフィス</option>
            <option value="text">テキスト</option>
            <option value="media">メディア</option>
            <option value="image">画像</option>
          </select>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div role="alert" data-testid="error-message" className="error-message">
          <span>{error}</span>
          <button
            type="button"
            onClick={handleCloseError}
            aria-label="閉じる"
            className="close-button"
          >
            ×
          </button>
        </div>
      )}

      {/* Selected Files List */}
      {hasSelectedFiles && (
        <div data-testid="selected-files-list" className="selected-files">
          <div className="files-header">
            <span data-testid="file-count">
              {selectedFiles.length}件のファイル
            </span>
            <button
              type="button"
              onClick={handleClearFiles}
              className="clear-button"
            >
              すべてクリア
            </button>
          </div>
          <ul className="files-list">
            {selectedFiles.map((file: SelectedFile) => (
              <li
                key={file.id}
                data-testid="selected-file-item"
                className="file-item"
              >
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  data-testid="file-delete-button"
                  onClick={() => handleRemoveFile(file.id)}
                  aria-label="削除"
                  className="remove-button"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Screen Reader Live Region */}
      <div role="status" aria-live="polite" className="sr-only">
        {selectedFiles.length > 0
          ? `${selectedFiles.length}件のファイルが選択されています`
          : ""}
      </div>
    </div>
  );
};

// =============================================================================
// Helpers
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}
