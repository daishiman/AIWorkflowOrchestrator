import React, { useEffect, useCallback } from "react";
import clsx from "clsx";
import {
  useFetchSkills,
  useImportedSkills,
  useIsLoadingSkills,
  useSkillError,
  useAvailableSkillsMetadata,
  useImportedSkillIds,
  useSelectedSkill,
  useSkillFilter,
  useIsImportDialogOpen,
  useToastMessage,
  useSelectSkill,
  useSetSkillFilter,
  useOpenImportDialog,
  useCloseImportDialog,
  useShowToast,
  useClearToast,
  useImportSkill,
  useRecentExecutions,
  useIsAdvancedSettingsOpen,
  useSetAdvancedSettingsOpen,
  useSelectedSkillName,
  useIsSkillExecuting,
  useAbortSkillExecution,
} from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { SkillChip } from "../../components/organisms/AgentView/SkillChip";
import { SkillImportDialog } from "../../components/organisms/SkillImportDialog";
import { ExecuteButton } from "../../components/organisms/AgentView/ExecuteButton";
import { FloatingExecutionBar } from "../../components/organisms/AgentView/FloatingExecutionBar";
import { RecentExecutionList } from "../../components/organisms/AgentView/RecentExecutionList";
import { AdvancedSettingsPanel } from "../../components/organisms/AgentView/AdvancedSettingsPanel";
import { preflightSkillExecutionAuth } from "../../utils/skillExecutionAuthPreflight";
import type { Skill, SkillName } from "@repo/shared/types/skill";
import { Plus, RefreshCw, X, Settings, Search } from "lucide-react";

export interface AgentViewProps {
  className?: string;
}

/** 共通のコンテナクラス */
const containerClassName = "flex flex-col gap-6 p-6 h-full overflow-hidden";

/**
 * ヘッダーセクション
 */
const AgentHeader: React.FC<{
  onImportClick: () => void;
  onSettingsClick: () => void;
}> = ({ onImportClick, onSettingsClick }) => (
  <header role="banner" className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        AIアシスタント
      </h1>
      <p className="text-[var(--text-secondary)] mt-1">スキルの管理と実行</p>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onSettingsClick}
        aria-label="詳細設定"
        className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg transition-colors"
      >
        <Settings className="h-5 w-5 text-[var(--text-secondary)]" />
      </button>
      <button
        type="button"
        onClick={onImportClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--status-primary)] hover:opacity-90 text-[var(--text-inverse)] rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        インポート
      </button>
    </div>
  </header>
);

/**
 * トースト通知コンポーネント
 */
const Toast: React.FC<{
  message: { type: "success" | "error"; message: string } | null;
  onClose: () => void;
}> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  const bgColor =
    message.type === "success"
      ? "bg-[var(--status-success)]"
      : "bg-[var(--status-error)]";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${bgColor} text-[var(--text-inverse)] px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
      role="alert"
    >
      <span>{message.message}</span>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

/**
 * AgentView コンポーネント
 * エージェント機能の管理と実行を行うビュー
 *
 * UT-FIX-AGENTVIEW-INFINITE-LOOP-001:
 * インラインセレクタ + ローカルfetchSkills useCallback を廃止し、
 * 個別セレクタHook（P31対策）に移行。無限ループを防止。
 *
 * TASK-UI-03: シングルカラムレイアウト + 新コンポーネント統合
 */
export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  // Store state - 個別セレクタ（P31対策）
  const isLoading = useIsLoadingSkills();
  const error = useSkillError();
  const importedSkills = useImportedSkills();
  const availableSkillsMetadata = useAvailableSkillsMetadata();
  const importedSkillIds = useImportedSkillIds();
  const selectedSkill = useSelectedSkill();
  const skillFilter = useSkillFilter();
  const isImportDialogOpen = useIsImportDialogOpen();
  const toastMessage = useToastMessage();

  // TASK-UI-03 selectors
  const recentExecutions = useRecentExecutions();
  const isAdvancedSettingsOpen = useIsAdvancedSettingsOpen();
  const setAdvancedSettingsOpen = useSetAdvancedSettingsOpen();
  const selectedSkillName = useSelectedSkillName();
  const isExecuting = useIsSkillExecuting();
  const abortExecution = useAbortSkillExecution();

  // Store actions - 個別セレクタ（P31対策）
  const fetchSkills = useFetchSkills();
  const selectSkill = useSelectSkill();
  const setSkillFilter = useSetSkillFilter();
  const openImportDialog = useOpenImportDialog();
  const closeImportDialog = useCloseImportDialog();
  const showToast = useShowToast();
  const clearToast = useClearToast();
  const importSkillAction = useImportSkill();

  // Fetch skills on mount - 個別セレクタで参照安定
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // スキル一覧: importedSkillsをSkill[]として扱う（型互換性のため）
  const skills = importedSkills as unknown as Skill[];

  // 利用可能スキル: availableSkillsMetadataをSkill[]として扱う（型互換性のため）
  const availableSkills = availableSkillsMetadata as unknown as Skill[];

  // 検索バー表示判定: 11個以上で表示
  const shouldShowSearchBar = skills.length > 10;

  // Handlers
  const handleImportClick = useCallback(() => {
    fetchSkills();
    openImportDialog();
  }, [fetchSkills, openImportDialog]);

  const handleSettingsClick = useCallback(() => {
    setAdvancedSettingsOpen(true);
  }, [setAdvancedSettingsOpen]);

  const handleSkillSelect = useCallback(
    (skill: Skill) => {
      selectSkill(skill);
    },
    [selectSkill],
  );

  const handleExecute = useCallback(
    async (skill: Skill) => {
      try {
        const preflightResult = await preflightSkillExecutionAuth();
        if (!preflightResult.ok) {
          showToast(
            "error",
            preflightResult.error?.message ||
              "APIキーが設定されていません。設定画面でAPIキーを登録してください。",
          );
          return;
        }

        await window.electronAPI.skill.execute({
          skillName: skill.name,
          prompt: "",
        });
        showToast("success", `${skill.name} を実行しました`);
      } catch (err) {
        showToast(
          "error",
          err instanceof Error
            ? `スキル実行に失敗しました: ${err.message}`
            : "スキル実行に失敗しました",
        );
      }
    },
    [showToast],
  );

  const handleImport = useCallback(
    async (skillNames: SkillName[]) => {
      try {
        for (const skillName of skillNames) {
          await importSkillAction(skillName);
        }
        showToast(
          "success",
          `${skillNames.length}件のスキルをインポートしました`,
        );
        closeImportDialog();
      } catch (err) {
        showToast(
          "error",
          err instanceof Error
            ? `インポートに失敗しました: ${err.message}`
            : "インポートに失敗しました",
        );
      }
    },
    [closeImportDialog, importSkillAction, showToast],
  );

  const handleRetry = useCallback(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Error state
  if (error) {
    return (
      <div
        data-testid="agent-view"
        className={clsx(containerClassName, className)}
      >
        <AgentHeader
          onImportClick={handleImportClick}
          onSettingsClick={handleSettingsClick}
        />
        <section role="region" aria-label="エラー" className="flex-1">
          <GlassPanel className="h-full flex flex-col items-center justify-center">
            <p className="text-[var(--status-error)] mb-4">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--status-primary)] hover:opacity-90 text-[var(--text-inverse)] rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              再試行
            </button>
          </GlassPanel>
        </section>
        <Toast message={toastMessage} onClose={clearToast} />
      </div>
    );
  }

  return (
    <div
      data-testid="agent-view"
      className={clsx(containerClassName, className)}
    >
      <AgentHeader
        onImportClick={handleImportClick}
        onSettingsClick={handleSettingsClick}
      />

      {/* TASK-UI-03: シングルカラム中央寄せレイアウト */}
      <div className="max-w-[600px] mx-auto w-full flex flex-col gap-6 flex-1 overflow-auto">
        {/* Section 1: できること（SkillChip + Execute） */}
        <section role="region" aria-label="できること">
          <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            できること
          </h2>

          {/* 検索バー（11個以上の場合のみ表示） */}
          {shouldShowSearchBar && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="検索..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
              />
            </div>
          )}

          {/* SkillChip群 */}
          <div
            role="radiogroup"
            aria-label="ツール選択"
            className="flex flex-wrap gap-4 justify-center"
          >
            {skills.map((skill) => (
              <SkillChip
                key={skill.name || skill.id}
                skillName={skill.name}
                displayName={skill.name}
                isSelected={selectedSkillName === skill.name}
                onSelect={() => handleSkillSelect(skill)}
              />
            ))}
          </div>

          {skills.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-[var(--text-secondary)] mb-4">
                Skill Centerでツールをインポート
              </p>
              <button
                type="button"
                onClick={handleImportClick}
                className="px-4 py-2 bg-[var(--status-primary)] text-[var(--text-inverse)] rounded-xl"
              >
                ツールを追加
              </button>
            </div>
          )}

          <ExecuteButton
            selectedSkillName={selectedSkillName}
            onExecute={() => {
              if (selectedSkill) handleExecute(selectedSkill);
            }}
            isExecuting={isExecuting}
          />
        </section>

        {/* Section 2: 最近の実行 */}
        <section role="region" aria-label="最近の実行">
          <h2 className="text-lg font-semibold mb-4">最近の実行</h2>
          <RecentExecutionList
            executions={recentExecutions}
            onSelectExecution={() => {}}
          />
        </section>
      </div>

      {/* FloatingExecutionBar（実行中のみ表示） */}
      {isExecuting && (
        <FloatingExecutionBar
          skillName={selectedSkillName ?? ""}
          status="executing"
          startedAt={new Date()}
          onStop={() => {
            abortExecution();
          }}
        />
      )}

      {/* Advanced Settings Panel - 固定位置オーバーレイ */}
      {isAdvancedSettingsOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30"
          onClick={() => setAdvancedSettingsOpen(false)}
        />
      )}
      <div
        className={`fixed right-0 top-0 bottom-0 z-40 w-80 transform transition-transform duration-300 ease-out ${
          isAdvancedSettingsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <AdvancedSettingsPanel
          isOpen={isAdvancedSettingsOpen}
          onClose={() => setAdvancedSettingsOpen(false)}
          models={[]}
          selectedProviderId={null}
          selectedModelId={null}
          onSelectModel={() => {}}
          permissionMode="default"
          onModeChange={() => {}}
          rememberedCount={0}
          onResetRemembered={() => {}}
        />
      </div>

      {/* Import Dialog */}
      <SkillImportDialog
        isOpen={isImportDialogOpen}
        onClose={closeImportDialog}
        availableSkills={availableSkills}
        importedSkillIds={importedSkillIds}
        onImport={handleImport}
      />

      {/* Toast */}
      <Toast message={toastMessage} onClose={clearToast} />
    </div>
  );
};

AgentView.displayName = "AgentView";
