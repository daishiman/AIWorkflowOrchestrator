import React, {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
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
  useExecuteSkill,
  useSkillExecutionStatus,
  useAddExecutionToHistory,
  useLLMProviders,
  useSelectedProviderId,
  useSelectedModelId,
  useLLMHealthStatus,
  useFetchProviders,
  useSelectProvider,
  useSelectModel,
} from "../../store";
import { GlassPanel } from "../../components/organisms/GlassPanel";
import { SkillChip } from "../../components/organisms/AgentView/SkillChip";
import { SkillImportDialog } from "../../components/organisms/SkillImportDialog";
import { ExecuteButton } from "../../components/organisms/AgentView/ExecuteButton";
import { FloatingExecutionBar } from "../../components/organisms/AgentView/FloatingExecutionBar";
import { RecentExecutionList } from "../../components/organisms/AgentView/RecentExecutionList";
import { AdvancedSettingsPanel } from "../../components/organisms/AgentView/AdvancedSettingsPanel";
import {
  toSkillId,
  type ImportedSkill,
  type Skill,
  type SkillMetadata,
  type SkillName,
} from "@repo/shared/types/skill";
import { Plus, RefreshCw, X, Settings, Search } from "lucide-react";
import type {
  AgentFloatingStatus,
  AgentPermissionMode,
  ModelCardItem,
} from "../../components/organisms/AgentView/types";

export interface AgentViewProps {
  className?: string;
}

/** 共通のコンテナクラス */
const containerClassName = "flex flex-col gap-6 p-6 h-full overflow-hidden";

type PermissionApi = {
  getMode?: () => Promise<string>;
  getRemembered?: () => Promise<unknown[]>;
  setMode?: (mode: AgentPermissionMode) => Promise<unknown>;
  clearRemembered?: () => Promise<unknown>;
};

function getPermissionApi(): PermissionApi | undefined {
  return (
    window.electronAPI as typeof window.electronAPI & {
      permissions?: PermissionApi;
    }
  ).permissions;
}

function toViewSkill(skill: Skill | SkillMetadata | ImportedSkill): Skill {
  if ("id" in skill) {
    return skill;
  }

  return {
    id: toSkillId(`agent-view:${skill.name}`),
    name: skill.name,
    slug: String(skill.name),
    description: skill.description,
    path: skill.path,
    triggers: [],
    anchors: [],
    lastModified: skill.updatedAt,
  };
}

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
        aria-label="詳細設定を開く"
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
  const executeSkill = useExecuteSkill();
  const skillExecutionStatus = useSkillExecutionStatus();
  const addExecutionToHistory = useAddExecutionToHistory();
  const providers = useLLMProviders();
  const selectedProviderId = useSelectedProviderId();
  const selectedModelId = useSelectedModelId();
  const llmHealthStatus = useLLMHealthStatus();
  const fetchProviders = useFetchProviders();
  const selectProvider = useSelectProvider();
  const selectModel = useSelectModel();

  // Store actions - 個別セレクタ（P31対策）
  const fetchSkills = useFetchSkills();
  const selectSkill = useSelectSkill();
  const setSkillFilter = useSetSkillFilter();
  const openImportDialog = useOpenImportDialog();
  const closeImportDialog = useCloseImportDialog();
  const showToast = useShowToast();
  const clearToast = useClearToast();
  const importSkillAction = useImportSkill();
  const [permissionMode, setPermissionMode] =
    useState<AgentPermissionMode>("default");
  const [rememberedCount, setRememberedCount] = useState(0);
  const [floatingStatus, setFloatingStatus] =
    useState<AgentFloatingStatus>("idle");
  const [floatingStartedAt, setFloatingStartedAt] = useState<Date | null>(null);
  const [activeExecution, setActiveExecution] = useState<{
    skillName: string;
    displayName: string;
    startedAt: Date;
  } | null>(null);
  const terminalTimerRef = useRef<number | null>(null);

  // Fetch skills on mount - 個別セレクタで参照安定
  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  useEffect(() => {
    let isMounted = true;

    const loadPermissions = async () => {
      const permissionsApi = getPermissionApi();
      if (!permissionsApi) {
        return;
      }

      try {
        const [mode, remembered] = await Promise.all([
          permissionsApi.getMode?.(),
          permissionsApi.getRemembered?.(),
        ]);

        if (!isMounted) {
          return;
        }

        if (typeof mode === "string") {
          setPermissionMode(mode as AgentPermissionMode);
        }

        if (Array.isArray(remembered)) {
          setRememberedCount(remembered.length);
        }
      } catch {
        // 権限設定APIが利用できない環境では既定値のまま表示する。
      }
    };

    void loadPermissions();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (skillExecutionStatus === "running") {
      setFloatingStatus("executing");
      return;
    }

    if (!activeExecution) {
      return;
    }

    const finishedAt = new Date();
    const duration = finishedAt.getTime() - activeExecution.startedAt.getTime();

    if (skillExecutionStatus === "completed") {
      addExecutionToHistory({
        executionId: crypto.randomUUID(),
        skillName: activeExecution.skillName,
        skillDisplayName: activeExecution.displayName,
        status: "completed",
        startedAt: activeExecution.startedAt,
        completedAt: finishedAt,
        duration,
      });
      setFloatingStatus("completed");
      setActiveExecution(null);
      return;
    }

    if (skillExecutionStatus === "error") {
      addExecutionToHistory({
        executionId: crypto.randomUUID(),
        skillName: activeExecution.skillName,
        skillDisplayName: activeExecution.displayName,
        status: "failed",
        startedAt: activeExecution.startedAt,
        completedAt: finishedAt,
        duration,
      });
      setFloatingStatus("failed");
      setActiveExecution(null);
      return;
    }

    if (skillExecutionStatus === "cancelled") {
      addExecutionToHistory({
        executionId: crypto.randomUUID(),
        skillName: activeExecution.skillName,
        skillDisplayName: activeExecution.displayName,
        status: "cancelled",
        startedAt: activeExecution.startedAt,
        completedAt: finishedAt,
        duration,
      });
      setFloatingStatus("idle");
      setActiveExecution(null);
    }
  }, [activeExecution, addExecutionToHistory, skillExecutionStatus]);

  useEffect(() => {
    if (terminalTimerRef.current) {
      window.clearTimeout(terminalTimerRef.current);
      terminalTimerRef.current = null;
    }

    if (floatingStatus === "completed") {
      terminalTimerRef.current = window.setTimeout(() => {
        setFloatingStatus("idle");
      }, 1500);
    }

    if (floatingStatus === "failed") {
      terminalTimerRef.current = window.setTimeout(() => {
        setFloatingStatus("idle");
      }, 3000);
    }

    return () => {
      if (terminalTimerRef.current) {
        window.clearTimeout(terminalTimerRef.current);
        terminalTimerRef.current = null;
      }
    };
  }, [floatingStatus]);

  const skills = useMemo(
    () => importedSkills.map(toViewSkill),
    [importedSkills],
  );
  const availableSkills = useMemo(
    () => availableSkillsMetadata.map(toViewSkill),
    [availableSkillsMetadata],
  );

  // 検索バー表示判定: 11個以上で表示
  const shouldShowSearchBar = skills.length > 10;
  const filteredSkills = useMemo(() => {
    const normalizedFilter = skillFilter.trim().toLowerCase();
    if (!normalizedFilter) {
      return skills;
    }

    return skills.filter((skill) =>
      skill.name.toLowerCase().includes(normalizedFilter),
    );
  }, [skillFilter, skills]);

  const modelCards = useMemo<ModelCardItem[]>(() => {
    return providers.flatMap((provider) =>
      provider.models.map((model) => {
        const health = llmHealthStatus[provider.id];
        const healthStatus: ModelCardItem["healthStatus"] =
          health?.status === "connected"
            ? "healthy"
            : health?.status === "disconnected"
              ? "degraded"
              : health?.status === "error"
                ? "unavailable"
                : "unknown";

        return {
          providerId: provider.id,
          modelId: model.id,
          displayName: model.name,
          description: model.description,
          healthStatus,
          isSelected:
            provider.id === selectedProviderId && model.id === selectedModelId,
        };
      }),
    );
  }, [llmHealthStatus, providers, selectedModelId, selectedProviderId]);

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
      const startedAt = new Date();
      setActiveExecution({
        skillName: skill.name,
        displayName: skill.name,
        startedAt,
      });
      setFloatingStartedAt(startedAt);
      setFloatingStatus("executing");
      await executeSkill("");
    },
    [executeSkill],
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

  const handleModelSelect = useCallback(
    (providerId: string, modelId: string) => {
      selectProvider(providerId as Parameters<typeof selectProvider>[0]);
      selectModel(modelId);
    },
    [selectModel, selectProvider],
  );

  const handlePermissionModeChange = useCallback(
    async (mode: AgentPermissionMode) => {
      setPermissionMode(mode);

      const permissionsApi = getPermissionApi();
      if (!permissionsApi?.setMode) {
        return;
      }

      try {
        await permissionsApi.setMode(mode);
      } catch (error) {
        showToast(
          "error",
          error instanceof Error
            ? `許可モードの更新に失敗しました: ${error.message}`
            : "許可モードの更新に失敗しました",
        );
      }
    },
    [showToast],
  );

  const handleResetRemembered = useCallback(async () => {
    const permissionsApi = getPermissionApi();
    if (!permissionsApi?.clearRemembered) {
      setRememberedCount(0);
      return;
    }

    try {
      await permissionsApi.clearRemembered();
      setRememberedCount(0);
      showToast("success", "記憶済みの許可をリセットしました");
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? `記憶済み許可のリセットに失敗しました: ${error.message}`
          : "記憶済み許可のリセットに失敗しました",
      );
    }
  }, [showToast]);

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
            {filteredSkills.map((skill) => (
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
      {floatingStatus !== "idle" && (
        <FloatingExecutionBar
          skillName={activeExecution?.displayName ?? selectedSkillName ?? ""}
          status={floatingStatus}
          startedAt={floatingStartedAt}
          onStop={() => {
            abortExecution();
          }}
        />
      )}

      {/* Advanced Settings Panel */}
      {isAdvancedSettingsOpen && (
        <AdvancedSettingsPanel
          isOpen={isAdvancedSettingsOpen}
          onClose={() => setAdvancedSettingsOpen(false)}
          models={modelCards}
          selectedProviderId={selectedProviderId}
          selectedModelId={selectedModelId}
          onSelectModel={handleModelSelect}
          permissionMode={permissionMode}
          onModeChange={handlePermissionModeChange}
          rememberedCount={rememberedCount}
          onResetRemembered={handleResetRemembered}
        />
      )}

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
