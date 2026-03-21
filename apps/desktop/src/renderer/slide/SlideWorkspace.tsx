/**
 * スライドワークスペース
 * 4領域 UI コンポーネントで再構成
 * @module renderer/slide/SlideWorkspace
 */

import React, { useCallback } from "react";
import { useSlideProject } from "./useSlideProject";
import { deriveSlideUIStatus } from "./types";
import { useHandoffGuidance, useSetCurrentView } from "../store";
import { SlideSyncCard } from "./components/SlideSyncCard";
import { SlideProgressRow } from "./components/SlideProgressRow";
import { SlideWatchStatus } from "./components/SlideWatchStatus";
import { SlideGuidanceBlock } from "./components/SlideGuidanceBlock";
import { TerminalLauncher } from "./components/TerminalLauncher";
import { SkillPhasePanel } from "./SkillPhasePanel";

/**
 * スライド依存関係管理のメインワークスペースコンポーネント
 */
export const SlideWorkspace: React.FC = () => {
  const {
    project,
    syncStatus,
    isExecuting,
    executionProgress,
    error,
    lastSyncedAt,
    isWatching,
    openProject,
    executePhase,
    manualSync,
    cancelExecution,
    closeProject,
    currentPhase,
  } = useSlideProject();
  const handoffGuidance = useHandoffGuidance();
  const setCurrentView = useSetCurrentView();
  const terminalCommand = handoffGuidance?.terminalCommand ?? "claude --resume";

  const uiStatus = deriveSlideUIStatus(
    syncStatus,
    isExecuting,
    handoffGuidance !== null,
    error,
  );

  const handleOpenProject = useCallback(async () => {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: "スライドプロジェクトを選択",
      properties: ["openDirectory"],
    });

    if (!result.canceled && result.filePaths[0]) {
      await openProject(result.filePaths[0]);
    }
  }, [openProject]);

  const handleCopyCommand = useCallback(() => {
    try {
      const result = navigator.clipboard?.writeText(terminalCommand);
      if (result && typeof result.catch === "function") {
        void result.catch(() => undefined);
      }
    } catch {
      // clipboard API unavailable in some environments
    }
  }, [terminalCommand]);

  const handleLaunchTerminal = useCallback(() => {
    handleCopyCommand();
  }, [handleCopyCommand]);

  const handleOpenSettings = useCallback(() => {
    setCurrentView("settings");
  }, [setCurrentView]);

  return (
    <div
      className="relative p-6 space-y-4 max-w-4xl mx-auto"
      data-testid="slide-workspace"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF]">
          スライドワークスペース
        </h2>
        {project && (
          <button
            type="button"
            onClick={closeProject}
            className="rounded-lg px-3 py-1 text-sm text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
          >
            プロジェクトを閉じる
          </button>
        )}
      </div>

      {!project ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 border-2 border-dashed border-[#C6C6C8] dark:border-[#38383A] rounded-xl">
          <p className="text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
            プロジェクトが選択されていません
          </p>
          <button
            onClick={handleOpenProject}
            className="px-6 py-3 bg-[#007AFF] dark:bg-[#0A84FF] text-white rounded-xl font-medium hover:opacity-90 active:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2"
          >
            プロジェクトを開く
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 常時表示: SlideSyncCard */}
          <SlideSyncCard
            projectPath={project.path}
            uiStatus={uiStatus}
            lastSyncedAt={lastSyncedAt}
            degradedReason={
              uiStatus === "degraded" ? (error ?? undefined) : undefined
            }
          />

          {/* 常時表示: SlideWatchStatus */}
          <SlideWatchStatus watching={isWatching} watchPath={project.path} />

          {/* running 時のみ: SlideProgressRow */}
          {uiStatus === "running" && (
            <SlideProgressRow
              percent={executionProgress}
              message={currentPhase === "idle" ? "" : `Phase: ${currentPhase}`}
              onCancel={cancelExecution}
            />
          )}

          {/* degraded / guidance 時のみ: SlideGuidanceBlock */}
          {uiStatus === "degraded" && (
            <SlideGuidanceBlock
              variant="degraded"
              title="AI 同期に失敗しました"
              reason={error ?? "不明なエラーが発生しました"}
              steps={[
                {
                  label: "エラーログを確認",
                  description: "詳細なエラー情報を確認してください",
                },
                {
                  label: "ネットワーク確認",
                  description: "接続状態を確認してください",
                },
                {
                  label: "手動実行",
                  description: "必要なら CLI コマンドへ切り替えて継続できます",
                },
              ]}
              primaryCTA={{ label: "再試行", onClick: manualSync }}
              secondaryCTA={{
                label: "ターミナルで手動実行",
                onClick: handleLaunchTerminal,
              }}
            />
          )}

          {uiStatus === "guidance" && (
            <SlideGuidanceBlock
              variant="guidance"
              title="統合実行の設定が必要です"
              reason={
                handoffGuidance?.reason ??
                "Slide AI 同期を使用するには、Claude API キーの設定が必要です"
              }
              steps={[
                {
                  label: "設定を開く",
                  description: "AI ランタイムを確認します",
                },
                {
                  label: "設定を保存",
                  description:
                    handoffGuidance?.contextSummary ??
                    "必要な API キーを入力します",
                },
                {
                  label: "同期を再実行",
                  description: "この画面に戻って再試行します",
                },
              ]}
              primaryCTA={{
                label: "API キーを設定",
                onClick: handleOpenSettings,
              }}
              secondaryCTA={{
                label: "ターミナルを開く",
                onClick: handleLaunchTerminal,
              }}
            />
          )}

          {/* synced 時のみ: SkillPhasePanel */}
          {uiStatus === "synced" && (
            <SkillPhasePanel
              onExecute={executePhase}
              isExecuting={isExecuting}
              currentPhase={currentPhase}
              onCancel={cancelExecution}
              progress={executionProgress}
            />
          )}

          {/* ファイル情報 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-[#C6C6C8] dark:border-[#38383A] rounded-xl">
              <p className="text-sm font-medium text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
                構成ファイル
              </p>
              <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                structure.md
              </p>
            </div>
            <div className="p-4 border border-[#C6C6C8] dark:border-[#38383A] rounded-xl">
              <p className="text-sm font-medium text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
                出力ファイル
              </p>
              <p className="text-sm text-[#000000] dark:text-[#FFFFFF]">
                index.html
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 全状態: TerminalLauncher（右下固定） */}
      {project && (
        <div className="sticky bottom-4 flex justify-end">
          <TerminalLauncher
            terminalCommand={terminalCommand}
            onCopy={handleCopyCommand}
            onLaunch={handleLaunchTerminal}
          />
        </div>
      )}
    </div>
  );
};
