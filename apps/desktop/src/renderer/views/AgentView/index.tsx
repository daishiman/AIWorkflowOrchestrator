import React, {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
} from "react";
import clsx from "clsx";
import { useAppStore } from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { SkillSearchBar } from "../../components/molecules/SkillSearchBar";
import { SkillCategoryFilter } from "../../components/molecules/SkillCategoryFilter";
import { SkillList } from "../../components/organisms/SkillList";
import { SkillDetailPanel } from "../../components/organisms/SkillDetailPanel";
import { SkillImportDialog } from "../../components/organisms/SkillImportDialog";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";
import { Plus, RefreshCw, X } from "lucide-react";
import { skillAPI } from "../../preload";

export interface AgentViewProps {
  className?: string;
}

/** 共通のコンテナクラス */
const containerClassName = "flex flex-col gap-6 p-6 h-full overflow-hidden";

/**
 * ヘッダーセクション
 * エージェントビューの共通ヘッダー
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
 */
export const AgentView: React.FC<AgentViewProps> = ({ className }) => {
  // Debug: render counter
  const renderCount = useRef(0);
  renderCount.current += 1;
  console.log("[AgentView][DEBUG] Render #", renderCount.current);

  // Store state
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);
  const skills = useAppStore((state) => state.skills);
  const availableSkills = useAppStore((state) => state.availableSkills);
  const importedSkillIds = useAppStore((state) => state.importedSkillIds);
  const selectedSkill = useAppStore((state) => state.selectedSkill);
  const skillFilter = useAppStore((state) => state.skillFilter);
  const skillCategory = useAppStore((state) => state.skillCategory);
  const isImportDialogOpen = useAppStore((state) => state.isImportDialogOpen);
  const toastMessage = useAppStore((state) => state.toastMessage);

  // Store actions
  const setSkills = useAppStore((state) => state.setSkills);
  const setAvailableSkills = useAppStore((state) => state.setAvailableSkills);
  const selectSkill = useAppStore((state) => state.selectSkill);
  const setSkillFilter = useAppStore((state) => state.setSkillFilter);
  const setSkillCategory = useAppStore((state) => state.setSkillCategory);
  const openImportDialog = useAppStore((state) => state.openImportDialog);
  const closeImportDialog = useAppStore((state) => state.closeImportDialog);
  const showToast = useAppStore((state) => state.showToast);
  const clearToast = useAppStore((state) => state.clearToast);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);

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

  // Extract unique categories from skills
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    skills.forEach((skill) => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories) as SkillCategory[];
  }, [skills]);

  // Fetch imported skills on mount
  const fetchSkills = useCallback(async () => {
    console.log("[AgentView][DEBUG] fetchSkills called - START");
    console.log("[AgentView][DEBUG] Current isLoading:", isLoading);
    setLoading(true);
    setError(null);
    try {
      console.log("[AgentView][DEBUG] Calling skillAPI.listImported()...");
      const result = await skillAPI.listImported();
      console.log("[AgentView][DEBUG] skillAPI.listImported() result:", result);
      if (result.success && result.data) {
        console.log("[AgentView][DEBUG] Setting skills:", result.data.length);
        setSkills(result.data);
      } else {
        throw new Error(result.error || "スキルの取得に失敗しました");
      }
    } catch (err) {
      console.error("[AgentView][DEBUG] Error in fetchSkills:", err);
      setError(
        err instanceof Error
          ? `エラーが発生しました: ${err.message}`
          : "エラーが発生しました",
      );
    } finally {
      console.log(
        "[AgentView][DEBUG] fetchSkills - FINALLY (setLoading false)",
      );
      setLoading(false);
    }
  }, [setSkills, setLoading, setError, isLoading]);

  // Fetch available skills for import dialog
  const fetchAvailableSkills = useCallback(async () => {
    try {
      const result = await skillAPI.listAvailable();
      if (result.success && result.data) {
        setAvailableSkills(result.data);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_err) {
      // Silent error for available skills
    }
  }, [setAvailableSkills]);

  useEffect(() => {
    console.log(
      "[AgentView][DEBUG] useEffect triggered - fetchSkills reference changed",
    );
    fetchSkills();
  }, [fetchSkills]);

  // Handlers
  const handleImportClick = useCallback(() => {
    fetchAvailableSkills();
    openImportDialog();
  }, [fetchAvailableSkills, openImportDialog]);

  const handleSkillSelect = useCallback(
    (skill: Skill) => {
      selectSkill(skill);
    },
    [selectSkill],
  );

  const handleExecute = useCallback(
    async (skill: Skill) => {
      try {
        const result = await skillAPI.execute(skill.id);
        if (result.success && result.data) {
          showToast("success", `${skill.name} を実行しました`);
        } else {
          throw new Error(result.error || "スキル実行に失敗しました");
        }
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
        const result = await skillAPI.remove(skill.id);
        if (result.success) {
          showToast("success", `${skill.name} を削除しました`);
          selectSkill(null);
          fetchSkills();
        } else {
          throw new Error(result.error || "削除に失敗しました");
        }
      } catch (err) {
        showToast(
          "error",
          err instanceof Error
            ? `削除に失敗しました: ${err.message}`
            : "削除に失敗しました",
        );
      }
    },
    [fetchSkills, selectSkill, showToast],
  );

  const handleCloseDetail = useCallback(() => {
    selectSkill(null);
  }, [selectSkill]);

  const handleImport = useCallback(
    async (skillIds: string[]) => {
      try {
        const result = await skillAPI.import(skillIds);
        if (result.success) {
          showToast(
            "success",
            `${skillIds.length}件のスキルをインポートしました`,
          );
          closeImportDialog();
          fetchSkills();
        } else {
          throw new Error(result.error || "インポートに失敗しました");
        }
      } catch (err) {
        showToast(
          "error",
          err instanceof Error
            ? `インポートに失敗しました: ${err.message}`
            : "インポートに失敗しました",
        );
      }
    },
    [closeImportDialog, fetchSkills, showToast],
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

        {/* Detail Panel - Desktop: side panel, Mobile: overlay */}
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
