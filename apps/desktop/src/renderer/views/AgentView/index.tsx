import React, { useEffect, useCallback, useState, useMemo } from "react";
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
  useSkillCategory,
  useIsImportDialogOpen,
  useToastMessage,
  useSelectSkill,
  useSetSkillFilter,
  useSetSkillCategory,
  useOpenImportDialog,
  useCloseImportDialog,
  useShowToast,
  useClearToast,
  useImportSkill,
  useRemoveSkill,
} from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { SkillSearchBar } from "../../components/molecules/SkillSearchBar";
import { SkillCategoryFilter } from "../../components/molecules/SkillCategoryFilter";
import { SkillList } from "../../components/organisms/SkillList";
import { SkillDetailPanel } from "../../components/organisms/SkillDetailPanel";
import { SkillImportDialog } from "../../components/organisms/SkillImportDialog";
import { preflightSkillExecutionAuth } from "../../utils/skillExecutionAuthPreflight";
import type {
  Skill,
  SkillCategory as SkillCategoryType,
  SkillName,
} from "@repo/shared/types/skill";
import { Plus, RefreshCw, X } from "lucide-react";

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
}> = ({ onImportClick }) => (
  <header role="banner" className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-white">Agent</h1>
      <p className="text-gray-400 mt-1">スキルの管理と実行</p>
    </div>
    <button
      type="button"
      onClick={onImportClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    >
      <Plus className="h-4 w-4" />
      インポート
    </button>
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
    message.type === "success" ? "bg-green-600/90" : "bg-red-600/90";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3`}
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
  const skillCategory = useSkillCategory();
  const isImportDialogOpen = useIsImportDialogOpen();
  const toastMessage = useToastMessage();

  // Store actions - 個別セレクタ（P31対策）
  const fetchSkills = useFetchSkills();
  const selectSkill = useSelectSkill();
  const setSkillFilter = useSetSkillFilter();
  const setSkillCategory = useSetSkillCategory();
  const openImportDialog = useOpenImportDialog();
  const closeImportDialog = useCloseImportDialog();
  const showToast = useShowToast();
  const clearToast = useClearToast();
  const importSkillAction = useImportSkill();
  const removeSkillAction = useRemoveSkill();

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 1024;

  // Extract unique categories from imported skills
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    importedSkills.forEach((skill) => {
      if ("category" in skill && skill.category) {
        categories.add(skill.category as string);
      }
    });
    return Array.from(categories) as SkillCategoryType[];
  }, [importedSkills]);

  // Fetch skills on mount - 個別セレクタで参照安定
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  // Handlers
  const handleImportClick = useCallback(() => {
    fetchSkills();
    openImportDialog();
  }, [fetchSkills, openImportDialog]);

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

  const handleDelete = useCallback(
    async (skill: Skill) => {
      try {
        await removeSkillAction(skill.name);
        showToast("success", `${skill.name} を削除しました`);
        selectSkill(null);
      } catch (err) {
        showToast(
          "error",
          err instanceof Error
            ? `削除に失敗しました: ${err.message}`
            : "削除に失敗しました",
        );
      }
    },
    [removeSkillAction, selectSkill, showToast],
  );

  const handleCloseDetail = useCallback(() => {
    selectSkill(null);
  }, [selectSkill]);

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

  // スキル一覧: importedSkillsをSkill[]として扱う（型互換性のため）
  const skills = importedSkills as unknown as Skill[];

  // 利用可能スキル: availableSkillsMetadataをSkill[]として扱う（型互換性のため）
  const availableSkills = availableSkillsMetadata as unknown as Skill[];

  // Error state
  if (error) {
    return (
      <div
        data-testid="agent-view"
        className={clsx(containerClassName, className)}
      >
        <AgentHeader onImportClick={handleImportClick} />
        <section role="region" aria-label="エラー" className="flex-1">
          <GlassPanel className="h-full flex flex-col items-center justify-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
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
      <AgentHeader onImportClick={handleImportClick} />

      {/* Search and Filter */}
      <div className="flex gap-4">
        <SkillSearchBar
          value={skillFilter}
          onChange={setSkillFilter}
          className="flex-1"
        />
        <SkillCategoryFilter
          value={skillCategory}
          onChange={setSkillCategory}
          categories={availableCategories}
          className="w-48"
        />
      </div>

      {/* Main content */}
      <section
        role="region"
        aria-label="メインコンテンツ"
        className="flex-1 flex gap-6 overflow-hidden"
      >
        {/* Skill List */}
        <div className="flex-1 overflow-auto">
          <SkillList
            skills={skills}
            selectedSkillId={selectedSkill?.id ?? null}
            onSkillSelect={handleSkillSelect}
            isLoading={isLoading}
            filter={skillFilter}
            category={skillCategory}
            onImportClick={handleImportClick}
          />
        </div>

        {/* Detail Panel */}
        {selectedSkill && (
          <div
            className={
              isMobile
                ? "fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4"
                : "w-96 flex-shrink-0"
            }
          >
            <SkillDetailPanel
              skill={selectedSkill}
              onExecute={handleExecute}
              onDelete={handleDelete}
              onClose={handleCloseDetail}
              className={
                isMobile
                  ? "fixed w-full max-w-lg max-h-[90vh] overflow-auto"
                  : "h-full overflow-auto"
              }
            />
          </div>
        )}
      </section>

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
