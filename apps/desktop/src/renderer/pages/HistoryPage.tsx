/**
 * HistoryPage Component
 *
 * A page component that displays version history for a file.
 * Integrates VersionHistory, VersionDetail, and RestoreDialog components.
 *
 * @module @repo/desktop/renderer/pages/HistoryPage
 */
import { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { VersionHistory } from "../components/history/VersionHistory";
import { VersionDetail } from "../components/history/VersionDetail";
import { RestoreDialog } from "../components/history/RestoreDialog";
import { useRestore } from "../hooks/useRestore";
import type { VersionHistoryItem } from "../components/history/types";

/**
 * HistoryPage Props
 */
export interface HistoryPageProps {
  /** Optional file ID (overrides URL parameter) */
  fileId?: string;
}

/**
 * HistoryPage Component
 *
 * Displays version history with a split layout:
 * - Left panel: Version history list
 * - Right panel: Version details or placeholder
 */
export function HistoryPage({ fileId: propFileId }: HistoryPageProps = {}) {
  // Get fileId from URL params or props
  const { fileId: paramFileId } = useParams<{ fileId: string }>();
  const fileId = propFileId || paramFileId || "";

  // State management
  const [selectedVersion, setSelectedVersion] =
    useState<VersionHistoryItem | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<VersionHistoryItem | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Restore hook
  const { restore, isRestoring, error, clearError } = useRestore();

  // Check if historyAPI is available
  if (typeof window === "undefined" || !window.historyAPI) {
    return (
      <div
        className="flex h-full items-center justify-center"
        role="alert"
        aria-live="polite"
      >
        <p className="text-red-500">History API not available</p>
      </div>
    );
  }

  // Handle version selection
  const handleVersionSelect = useCallback((item: VersionHistoryItem) => {
    setSelectedVersion(item);
  }, []);

  // Handle restore button click
  const handleRestoreClick = useCallback((item: VersionHistoryItem) => {
    setRestoreTarget(item);
  }, []);

  // Handle restore confirmation
  const handleRestoreConfirm = useCallback(async () => {
    if (!restoreTarget) return;

    const result = await restore(
      restoreTarget.fileId,
      restoreTarget.conversionId,
    );

    if (result) {
      // Success: close dialog and refresh history
      setRestoreTarget(null);
      setSelectedVersion(null);
      setRefreshKey((prev) => prev + 1);
    }
  }, [restoreTarget, restore]);

  // Handle restore cancellation
  const handleRestoreCancel = useCallback(() => {
    setRestoreTarget(null);
    clearError();
  }, [clearError]);

  // Handle close from version detail
  const handleClose = useCallback(() => {
    setSelectedVersion(null);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b px-4 py-2">
        <h1 className="text-lg font-semibold">バージョン履歴</h1>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Version History List */}
        <div className="w-1/3 overflow-auto border-r">
          <VersionHistory
            key={refreshKey}
            fileId={fileId}
            onVersionSelect={handleVersionSelect}
            onRestore={handleRestoreClick}
          />
        </div>

        {/* Right Panel: Version Detail or Placeholder */}
        <div className="w-2/3 overflow-auto">
          {selectedVersion ? (
            <VersionDetail
              conversionId={selectedVersion.conversionId}
              onRestore={() => handleRestoreClick(selectedVersion)}
              onClose={handleClose}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              バージョンを選択してください
            </div>
          )}
        </div>
      </div>

      {/* Restore Dialog */}
      {restoreTarget && (
        <RestoreDialog
          isOpen={!!restoreTarget}
          version={restoreTarget}
          isLoading={isRestoring}
          error={error}
          onConfirm={handleRestoreConfirm}
          onCancel={handleRestoreCancel}
        />
      )}
    </div>
  );
}

export default HistoryPage;
