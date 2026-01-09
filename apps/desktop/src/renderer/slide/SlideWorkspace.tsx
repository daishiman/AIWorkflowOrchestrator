/**
 * スライドワークスペース
 * @module renderer/slide/SlideWorkspace
 */

import React, { useCallback } from "react";
import { useSlideProject } from "./useSlideProject";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { SkillPhasePanel } from "./SkillPhasePanel";

/**
 * スライド依存関係管理のメインワークスペースコンポーネント
 */
export const SlideWorkspace: React.FC = () => {
  const {
    project,
    syncStatus,
    currentPhase,
    isExecuting,
    executionProgress,
    error,
    openProject,
    executePhase,
    manualSync,
    cancelExecution,
    closeProject,
  } = useSlideProject();

  /**
   * プロジェクトを開くハンドラ
   */
  const handleOpenProject = useCallback(async () => {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: "スライドプロジェクトを選択",
      properties: ["openDirectory"],
    });

    if (!result.canceled && result.filePaths[0]) {
      await openProject(result.filePaths[0]);
    }
  }, [openProject]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          スライドワークスペース
        </h2>
        {project && (
          <button
            onClick={closeProject}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            プロジェクトを閉じる
          </button>
        )}
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 border-2 border-dashed border-gray-300 rounded-lg dark:border-gray-600">
          <p className="text-gray-500 dark:text-gray-400">
            プロジェクトが選択されていません
          </p>
          <button
            onClick={handleOpenProject}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            プロジェクトを開く
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* プロジェクト情報 */}
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  プロジェクトパス
                </p>
                <p
                  className="text-sm text-gray-800 truncate dark:text-gray-200"
                  title={project.path}
                >
                  {project.path}
                </p>
              </div>
              <SyncStatusIndicator status={syncStatus} className="ml-4" />
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div
              className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800"
              role="alert"
            >
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* スキルフェーズパネル */}
          <SkillPhasePanel
            onExecute={executePhase}
            isExecuting={isExecuting}
            currentPhase={currentPhase}
            onCancel={cancelExecution}
            progress={executionProgress}
          />

          {/* 手動同期ボタン */}
          {syncStatus === "out-of-sync" && !isExecuting && (
            <div className="flex justify-end">
              <button
                onClick={manualSync}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              >
                手動同期
              </button>
            </div>
          )}

          {/* ファイル情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                構成ファイル
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                structure.md
              </p>
            </div>
            <div className="p-4 border rounded-lg dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                出力ファイル
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                index.html
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
