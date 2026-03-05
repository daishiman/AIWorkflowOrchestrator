import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  createNavigationSlice,
  type NavigationSlice,
} from "./slices/navigationSlice";
import { createEditorSlice, type EditorSlice } from "./slices/editorSlice";
import { createChatSlice, type ChatSlice } from "./slices/chatSlice";
import { createGraphSlice, type GraphSlice } from "./slices/graphSlice";
import {
  createSettingsSlice,
  type SettingsSlice,
} from "./slices/settingsSlice";
import { createUISlice, type UISlice } from "./slices/uiSlice";
import {
  createDashboardSlice,
  type DashboardSlice,
} from "./slices/dashboardSlice";
import { createAuthSlice, type AuthSlice } from "./slices/authSlice";
import {
  createWorkspaceSlice,
  type WorkspaceSlice,
} from "./slices/workspaceSlice";
import {
  createFileSelectionSlice,
  type FileSelectionSlice,
} from "./slices/fileSelectionSlice";
import {
  createSystemPromptTemplateSlice,
  type SystemPromptTemplateSlice,
} from "./slices/systemPromptTemplateSlice";
import { createLLMSlice, type LLMSlice } from "./slices/llmSlice";
import { createAgentSlice, type AgentSlice } from "./slices/agentSlice";
import {
  createChatEditSlice,
  type ChatEditSlice,
} from "../features/workspace-chat-edit/store/chatEditSlice";
// TASK-FIX-6-1: skillSliceは削除済み。状態はagentSliceに統合
import {
  createPermissionHistorySlice,
  type PermissionHistorySlice,
} from "./slices/permissionHistorySlice";
import {
  createAuthModeSlice,
  type AuthModeSlice,
} from "./slices/authModeSlice";

// Combined store type
// TASK-FIX-6-1: SkillSliceは削除済み。状態はAgentSliceに統合
export type AppStore = NavigationSlice &
  EditorSlice &
  ChatSlice &
  GraphSlice &
  SettingsSlice &
  UISlice &
  DashboardSlice &
  AuthSlice &
  AuthModeSlice &
  WorkspaceSlice &
  FileSelectionSlice &
  SystemPromptTemplateSlice &
  LLMSlice &
  AgentSlice &
  ChatEditSlice &
  PermissionHistorySlice;

// Custom storage for Set serialization
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    const parsed = JSON.parse(str);
    // Convert expandedFolders array back to Set
    if (parsed.state?.expandedFolders) {
      parsed.state.expandedFolders = new Set(parsed.state.expandedFolders);
    }
    return parsed;
  },
  setItem: (name: string, value: unknown) => {
    const valueWithSerializedSet = {
      ...(value as Record<string, unknown>),
      state: {
        ...((value as Record<string, unknown>).state as Record<
          string,
          unknown
        >),
        // Convert Set to array for JSON serialization
        expandedFolders: Array.from(
          ((value as Record<string, unknown>).state as Record<string, unknown>)
            .expandedFolders as Set<string>,
        ),
      },
    };
    localStorage.setItem(name, JSON.stringify(valueWithSerializedSet));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

// Create the combined store
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (...args) => ({
        ...createNavigationSlice(...args),
        ...createEditorSlice(...args),
        ...createChatSlice(...args),
        ...createGraphSlice(...args),
        ...createSettingsSlice(...args),
        ...createUISlice(...args),
        ...createDashboardSlice(...args),
        ...createAuthSlice(...args),
        ...createAuthModeSlice(...args),
        ...createWorkspaceSlice(...args),
        ...createFileSelectionSlice(...args),
        ...createSystemPromptTemplateSlice(...args),
        ...createLLMSlice(...args),
        ...createAgentSlice(...args),
        ...createChatEditSlice(...args),
        // TASK-FIX-6-1: skillSliceは削除済み。状態はagentSliceに統合
        ...createPermissionHistorySlice(...args),
      }),
      {
        name: "knowledge-studio-store",
        storage: customStorage,
        partialize: (state) => ({
          // Only persist these fields
          currentView: state.currentView,
          selectedFile: state.selectedFile,
          expandedFolders: state.expandedFolders,
          userProfile: state.userProfile,
          autoSyncEnabled: state.autoSyncEnabled,
          windowSize: state.windowSize,
          permissionHistory: state.permissionHistory,
        }),
      },
    ),
    { name: "KnowledgeStudio" },
  ),
);

// Export types
export * from "./types";
export * from "./sliceBaseline";

// Alias for tests
export const useStore = useAppStore;

// Selector hooks for better performance
export const useCurrentView = () => useAppStore((state) => state.currentView);
export const useSelectedFile = () => useAppStore((state) => state.selectedFile);
export const useFileTree = () => useAppStore((state) => state.fileTree);
export const useExpandedFolders = () =>
  useAppStore((state) => state.expandedFolders);
export const useChatMessages = () => useAppStore((state) => state.chatMessages);
export const useIsSending = () => useAppStore((state) => state.isSending);
export const useGraphNodes = () => useAppStore((state) => state.graphNodes);
export const useGraphLinks = () => useAppStore((state) => state.graphLinks);
export const useIsAnimating = () => useAppStore((state) => state.isAnimating);
export const useDynamicIsland = () =>
  useAppStore((state) => state.dynamicIsland);
export const useResponsiveMode = () =>
  useAppStore((state) => state.responsiveMode);
export const useMobileDrawerOpen = () =>
  useAppStore((state) => state.mobileDrawerOpen);
export const useDashboardStats = () =>
  useAppStore((state) => state.dashboardStats);
export const useActivityFeed = () => useAppStore((state) => state.activityFeed);

// Theme selectors
export const useThemeMode = () => useAppStore((state) => state.themeMode);
export const useResolvedTheme = () =>
  useAppStore((state) => state.resolvedTheme);
export const useSetThemeMode = () => useAppStore((state) => state.setThemeMode);
export const useSetResolvedTheme = () =>
  useAppStore((state) => state.setResolvedTheme);
export const useInitializeTheme = () =>
  useAppStore((state) => state.initializeTheme);

// Auth selectors
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAppStore((state) => state.authUser);
export const useSessionExpiresAt = () =>
  useAppStore((state) => state.sessionExpiresAt);
export const useUserProfile = () => useAppStore((state) => state.profile);
export const useLinkedProviders = () =>
  useAppStore((state) => state.linkedProviders);
export const useAuthLoading = () => useAppStore((state) => state.isLoading);
export const useAuthError = () => useAppStore((state) => state.authError);
export const useIsOffline = () => useAppStore((state) => state.isOffline);

// Computed selectors
export const useIsDesktop = () =>
  useAppStore((state) => state.responsiveMode === "desktop");
export const useIsMobile = () =>
  useAppStore((state) => state.responsiveMode === "mobile");
export const useStoragePercentage = () =>
  useAppStore((state) =>
    state.dashboardStats.storageTotal > 0
      ? (state.dashboardStats.storageUsed / state.dashboardStats.storageTotal) *
        100
      : 0,
  );

// Auth computed selectors
export const useDisplayName = () =>
  useAppStore(
    (state) =>
      state.profile?.displayName ?? state.authUser?.displayName ?? "User",
  );
export const useUserEmail = () =>
  useAppStore((state) => state.profile?.email ?? state.authUser?.email ?? "");
export const useUserAvatar = () =>
  useAppStore(
    (state) => state.profile?.avatarUrl ?? state.authUser?.avatarUrl ?? null,
  );

// Workspace selectors
export const useWorkspace = () => useAppStore((state) => state.workspace);
export const useFolderFileTrees = () =>
  useAppStore((state) => state.folderFileTrees);
export const useWorkspaceLoading = () =>
  useAppStore((state) => state.workspaceIsLoading);
export const useWorkspaceError = () =>
  useAppStore((state) => state.workspaceError);
export const useLoadWorkspace = () =>
  useAppStore((state) => state.loadWorkspace);
export const useSaveWorkspace = () =>
  useAppStore((state) => state.saveWorkspace);
export const useAddFolder = () => useAppStore((state) => state.addFolder);
export const useRemoveFolder = () => useAppStore((state) => state.removeFolder);
export const useToggleFolderExpansion = () =>
  useAppStore((state) => state.toggleFolderExpansion);
export const useToggleSubfolder = () =>
  useAppStore((state) => state.toggleSubfolder);
export const useSetWorkspaceSelectedFile = () =>
  useAppStore((state) => state.setWorkspaceSelectedFile);

// File selection selectors
export const useSelectedFiles = () =>
  useAppStore((state) => state.selectedFiles);
export const useHasSelectedFiles = () =>
  useAppStore((state) => state.selectedFiles.length > 0);
export const useFileFilterCategory = () =>
  useAppStore((state) => state.filterCategory);
export const useFileSelectionIsDragging = () =>
  useAppStore((state) => state.isDragging);
export const useFileSelectionIsLoading = () =>
  useAppStore((state) => state.isLoading);
export const useFileSelectionError = () => useAppStore((state) => state.error);
export const useLastSelectedId = () =>
  useAppStore((state) => state.lastSelectedId);

// File selection actions
export const useAddFiles = () => useAppStore((state) => state.addFiles);
export const useRemoveFile = () => useAppStore((state) => state.removeFile);
export const useRemoveFiles = () => useAppStore((state) => state.removeFiles);
export const useClearFiles = () => useAppStore((state) => state.clearFiles);
export const useReorderFile = () => useAppStore((state) => state.reorderFile);
export const useSetFileFilterCategory = () =>
  useAppStore((state) => state.setFilterCategory);
export const useSetFileSelectionIsDragging = () =>
  useAppStore((state) => state.setIsDragging);
export const useSetFileSelectionIsLoading = () =>
  useAppStore((state) => state.setIsLoading);
export const useSetFileSelectionError = () =>
  useAppStore((state) => state.setError);
export const useClearFileSelectionError = () =>
  useAppStore((state) => state.clearError);
export const useResetFileSelection = () =>
  useAppStore((state) => state.resetFileSelection);

// ============================================
// LLM selectors - 合成Store Hook（非推奨）
// ============================================

/**
 * LLM関連の状態とアクションをまとめて取得する合成Store Hook
 *
 * @deprecated P31対策: このHookはオブジェクトを返すため、関数参照が毎回変わり
 * useEffectの依存配列に含めると無限ループの原因となる。
 * 個別セレクタ（useLLMProviders, useFetchProviders等）を使用してください。
 *
 * @see .claude/rules/06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/phase-5-implementation.md
 */
export const useLLMStore = () =>
  useAppStore((state) => ({
    providers: state.providers,
    selectedProviderId: state.selectedProviderId,
    selectedModelId: state.selectedModelId,
    isLoading: state.llmIsLoading,
    error: state.llmError,
    healthStatus: state.healthStatus,
    fetchProviders: state.fetchProviders,
    selectProvider: state.selectProvider,
    selectModel: state.selectModel,
    checkHealth: state.checkHealth,
    resetSelection: state.resetSelection,
    clearError: state.clearLLMError,
    setLoading: state.setLLMLoading,
    setError: state.setLLMError,
    getSelectedProvider: state.getSelectedProvider,
    getSelectedModel: state.getSelectedModel,
    isProviderAvailable: state.isProviderAvailable,
  }));

// ============================================
// LLM selectors - 個別セレクタ（P31対策）
// ============================================

// --- 状態セレクタ ---

/**
 * LLMプロバイダー一覧を取得
 */
export const useLLMProviders = () => useAppStore((state) => state.providers);

/**
 * 選択中のプロバイダーIDを取得
 */
export const useSelectedProviderId = () =>
  useAppStore((state) => state.selectedProviderId);

/**
 * 選択中のモデルIDを取得
 */
export const useSelectedModelId = () =>
  useAppStore((state) => state.selectedModelId);

/**
 * LLMローディング状態を取得
 */
export const useLLMIsLoading = () => useAppStore((state) => state.llmIsLoading);

/**
 * LLMエラー状態を取得
 */
export const useLLMError = () => useAppStore((state) => state.llmError);

/**
 * LLMヘルスステータスを取得
 */
export const useLLMHealthStatus = () =>
  useAppStore((state) => state.healthStatus);

// --- アクションセレクタ ---

/**
 * プロバイダー取得関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useFetchProviders = () =>
  useAppStore((state) => state.fetchProviders);

/**
 * プロバイダー選択関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSelectProvider = () =>
  useAppStore((state) => state.selectProvider);

/**
 * モデル選択関数を取得
 * P31対策: 個別セレクタで関数参照を安定化
 */
export const useSelectModel = () => useAppStore((state) => state.selectModel);

/**
 * ヘルスチェック関数を取得
 */
export const useCheckLLMHealth = () =>
  useAppStore((state) => state.checkHealth);

/**
 * LLM選択リセット関数を取得
 */
export const useResetLLMSelection = () =>
  useAppStore((state) => state.resetSelection);

/**
 * LLMエラークリア関数を取得
 */
export const useClearLLMError = () =>
  useAppStore((state) => state.clearLLMError);

/**
 * LLMローディング設定関数を取得
 */
export const useSetLLMLoading = () =>
  useAppStore((state) => state.setLLMLoading);

/**
 * LLMエラー設定関数を取得
 */
export const useSetLLMError = () => useAppStore((state) => state.setLLMError);

// --- 計算セレクタ ---

/**
 * 選択中のプロバイダーを取得
 */
export const useSelectedLLMProvider = () =>
  useAppStore((state) => state.getSelectedProvider());

/**
 * 選択中のモデルを取得
 */
export const useSelectedLLMModel = () =>
  useAppStore((state) => state.getSelectedModel());

/**
 * Skill selectors - single hook for all Skill-related state and actions
 * TASK-FIX-6-1: agentSliceから統合された状態を使用
 *
 * @deprecated UT-STORE-HOOKS-REFACTOR-001: 無限ループ防止のため個別セレクタを使用してください。
 * この合成Hookは毎回新しいオブジェクトを返すため、useEffectの依存配列に含めると無限ループの原因になります。
 * 代わりに以下の個別セレクタを使用:
 * - 状態: useAvailableSkillsMetadata, useImportedSkills, useSelectedSkillName, useIsSkillExecuting など
 * - アクション: useFetchSkills, useRescanSkills, useImportSkill, useExecuteSkill など
 * @see 06-known-pitfalls.md#P31
 */
export const useSkillStore = () =>
  useAppStore((state) => ({
    // 状態 (agentSliceから)
    availableSkillsMetadata: state.availableSkillsMetadata,
    importedSkills: state.importedSkills,
    selectedSkillName: state.selectedSkillName,
    isExecuting: state.isExecuting,
    executionId: state.executionId,
    skillExecutionStatus: state.skillExecutionStatus,
    streamingMessages: state.streamingMessages,
    pendingPermission: state.pendingPermission,
    skillError: state.skillError,
    // ローディング状態
    isLoadingSkills: state.isLoadingSkills,
    isScanning: state.isScanning,
    isImporting: state.isImporting,
    importingSkillName: state.importingSkillName,
    // アクション (agentSliceから)
    fetchSkills: state.fetchSkills,
    rescanSkills: state.rescanSkills,
    importSkill: state.importSkill,
    removeSkill: state.removeSkill,
    selectSkill: state.selectSkill,
    selectSkillByName: state.selectSkillByName,
    executeSkill: state.executeSkill,
    abortExecution: state.abortExecution,
    respondToSkillPermission: state.respondToSkillPermission,
    clearSkillError: state.clearSkillError,
    clearStreamingMessages: state.clearStreamingMessages,
  }));

// ==========================================================================
// 個別セレクタ（UT-STORE-HOOKS-REFACTOR-001）
// P31対策: 無限ループ防止のため、状態とアクションを個別に取得
// ==========================================================================

// --- 状態セレクタ（Skill関連） ---
/** 利用可能なスキルメタデータ一覧 */
export const useAvailableSkillsMetadata = () =>
  useAppStore((state) => state.availableSkillsMetadata);
/** インポート済みスキル一覧 */
export const useImportedSkills = () =>
  useAppStore((state) => state.importedSkills);
/** 選択中のスキル名 */
export const useSelectedSkillName = () =>
  useAppStore((state) => state.selectedSkillName);
/** スキル実行中フラグ */
export const useIsSkillExecuting = () =>
  useAppStore((state) => state.isExecuting);
/** 実行ID */
export const useSkillExecutionId = () =>
  useAppStore((state) => state.executionId);
/** スキル実行ステータス */
export const useSkillExecutionStatus = () =>
  useAppStore((state) => state.skillExecutionStatus);
/** ストリーミングメッセージ一覧 */
export const useStreamingMessages = () =>
  useAppStore((state) => state.streamingMessages);
/** 保留中の権限リクエスト */
export const usePendingSkillPermission = () =>
  useAppStore((state) => state.pendingPermission);
/** スキルエラー情報 */
export const useSkillError = () => useAppStore((state) => state.skillError);
/** スキル一覧読み込み中 */
export const useIsLoadingSkills = () =>
  useAppStore((state) => state.isLoadingSkills);
/** スキャン中 */
export const useIsScanningSkills = () =>
  useAppStore((state) => state.isScanning);
/** インポート中 */
export const useIsImportingSkill = () =>
  useAppStore((state) => state.isImporting);
/** インポート中のスキル名 */
export const useImportingSkillName = () =>
  useAppStore((state) => state.importingSkillName);

// --- アクションセレクタ（Skill関連） ---
/** スキル一覧を取得 */
export const useFetchSkills = () => useAppStore((state) => state.fetchSkills);
/** スキルを再スキャン */
export const useRescanSkills = () => useAppStore((state) => state.rescanSkills);
/** スキルをインポート */
export const useImportSkill = () => useAppStore((state) => state.importSkill);
/** スキルを削除 */
export const useRemoveSkill = () => useAppStore((state) => state.removeSkill);
/** スキルを名前で選択 */
export const useSelectSkillByName = () =>
  useAppStore((state) => state.selectSkillByName);
/** スキルを実行 */
export const useExecuteSkill = () => useAppStore((state) => state.executeSkill);
/** 実行を中断 */
export const useAbortSkillExecution = () =>
  useAppStore((state) => state.abortExecution);
/** 権限リクエストに応答 */
export const useRespondToSkillPermission = () =>
  useAppStore((state) => state.respondToSkillPermission);
/** スキルエラーをクリア */
export const useClearSkillError = () =>
  useAppStore((state) => state.clearSkillError);
/** ストリーミングメッセージをクリア */
export const useClearStreamingMessages = () =>
  useAppStore((state) => state.clearStreamingMessages);

// ==========================================================================
// スキルライフサイクルセレクタ（TASK-10A-D）
// P31対策: 無限ループ防止のため個別セレクタで取得
// ==========================================================================

// --- 状態セレクタ ---
/** 現在の分析結果 */
export const useCurrentAnalysis = () =>
  useAppStore((state) => state.currentAnalysis);
/** スキル分析中フラグ */
export const useIsAnalyzingSkill = () =>
  useAppStore((state) => state.isAnalyzing);
/** スキル改善中フラグ */
export const useIsImprovingSkill = () =>
  useAppStore((state) => state.isImproving);

// --- アクションセレクタ ---
/** スキル分析アクション */
export const useAnalyzeSkill = () => useAppStore((state) => state.analyzeSkill);
/** 選択改善適用アクション */
export const useApplySkillImprovements = () =>
  useAppStore((state) => state.applySkillImprovements);
/** 全自動改善アクション */
export const useAutoImproveSkill = () =>
  useAppStore((state) => state.autoImproveSkill);
/** スキル作成アクション */
export const useCreateSkill = () => useAppStore((state) => state.createSkill);
/** 分析結果クリアアクション */
export const useClearAnalysis = () =>
  useAppStore((state) => state.clearAnalysis);

// ==========================================================================
// AgentView用 個別セレクタ（UT-FIX-AGENTVIEW-INFINITE-LOOP-001）
// P31対策: AgentViewのインラインセレクタを個別Hookに移行
// ==========================================================================

// --- AgentView状態セレクタ ---
/** スキル一覧（レガシー） */
export const useSkills = () => useAppStore((state) => state.skills);
/** 利用可能スキル一覧（レガシー） */
export const useAvailableSkills = () =>
  useAppStore((state) => state.availableSkills);
/** インポート済みスキルID一覧 */
export const useImportedSkillIds = () =>
  useAppStore((state) => state.importedSkillIds);
/** 選択中のスキル */
export const useSelectedSkill = () =>
  useAppStore((state) => state.selectedSkill);
/** スキルフィルター文字列 */
export const useSkillFilter = () => useAppStore((state) => state.skillFilter);
/** スキルカテゴリフィルター */
export const useSkillCategory = () =>
  useAppStore((state) => state.skillCategory);
/** インポートダイアログ表示状態 */
export const useIsImportDialogOpen = () =>
  useAppStore((state) => state.isImportDialogOpen);
/** トーストメッセージ */
export const useToastMessage = () => useAppStore((state) => state.toastMessage);

// --- AgentViewアクションセレクタ ---
/** スキルを選択 */
export const useSelectSkill = () => useAppStore((state) => state.selectSkill);
/** フィルター設定 */
export const useSetSkillFilter = () =>
  useAppStore((state) => state.setSkillFilter);
/** カテゴリ設定 */
export const useSetSkillCategory = () =>
  useAppStore((state) => state.setSkillCategory);
/** インポートダイアログを開く */
export const useOpenImportDialog = () =>
  useAppStore((state) => state.openImportDialog);
/** インポートダイアログを閉じる */
export const useCloseImportDialog = () =>
  useAppStore((state) => state.closeImportDialog);
/** トースト表示 */
export const useShowToast = () => useAppStore((state) => state.showToast);
/** トーストクリア */
export const useClearToast = () => useAppStore((state) => state.clearToast);

/**
 * AuthMode selectors - single hook for all AuthMode-related state and actions
 *
 * @deprecated UT-STORE-HOOKS-REFACTOR-001: 無限ループ防止のため個別セレクタを使用してください。
 *
 * このHookは毎回新しいオブジェクトを返すため、useEffectの依存配列に含めると
 * 無限ループが発生します。代わりに個別セレクタを使用してください。
 *
 * 推奨される個別セレクタ:
 * - 状態: useAuthMode, useAuthModeStatus, useAuthModeLoading, useAuthModeError, useIsConfirmDialogOpen, usePendingMode
 * - アクション: useSetAuthMode, useInitializeAuthMode, useFetchAuthMode, useFetchAuthModeStatus, useValidateAuthMode, useOpenConfirmDialog, useCloseConfirmDialog, useConfirmModeChange, useClearAuthModeError, useResetAuthMode
 *
 * @see 06-known-pitfalls.md#P31
 * @see docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/
 *
 * @example
 * // NG: 無限ループの原因
 * const { initializeAuthMode } = useAuthModeStore();
 * useEffect(() => {
 *   initializeAuthMode();
 * }, [initializeAuthMode]); // 毎回新しい参照
 *
 * // OK: 個別セレクタは参照が安定
 * const initializeAuthMode = useInitializeAuthMode();
 * useEffect(() => {
 *   initializeAuthMode();
 * }, [initializeAuthMode]); // 参照が安定
 */
export const useAuthModeStore = () =>
  useAppStore((state) => ({
    // 状態
    mode: state.mode,
    status: state.status,
    isLoading: state.isLoading,
    error: state.error,
    isConfirmDialogOpen: state.isConfirmDialogOpen,
    pendingMode: state.pendingMode,
    // アクション
    fetchMode: state.fetchMode,
    setMode: state.setMode,
    fetchStatus: state.fetchStatus,
    validate: state.validate,
    openConfirmDialog: state.openConfirmDialog,
    closeConfirmDialog: state.closeConfirmDialog,
    confirmModeChange: state.confirmModeChange,
    clearError: state.clearError,
    resetAuthMode: state.resetAuthMode,
    initializeAuthMode: state.initializeAuthMode,
  }));

// ==========================================================================
// AuthMode State Selectors（状態セレクタ）
// UT-STORE-HOOKS-REFACTOR-001: P31対策 - 無限ループ防止のため個別に取得
// ==========================================================================

/** 現在の認証モード（subscription | api-key）を取得 */
export const useAuthMode = () => useAppStore((state) => state.mode);

/** 認証状態（有効性情報）を取得 */
export const useAuthModeStatus = () => useAppStore((state) => state.status);

/** AuthModeのローディング状態を取得 */
export const useAuthModeLoading = () => useAppStore((state) => state.isLoading);

/** AuthModeのエラーを取得 */
export const useAuthModeError = () => useAppStore((state) => state.error);

/** 認証が有効かどうか（computed） */
export const useIsAuthModeValid = () =>
  useAppStore((state) => state.status?.isValid ?? false);

/** 確認ダイアログの表示状態を取得 */
export const useIsConfirmDialogOpen = () =>
  useAppStore((state) => state.isConfirmDialogOpen);

/** 保留中の認証モードを取得 */
export const usePendingMode = () => useAppStore((state) => state.pendingMode);

// ==========================================================================
// AuthMode Action Selectors（アクションセレクタ）
// UT-STORE-HOOKS-REFACTOR-001: P31対策 - 無限ループ防止のため個別に取得
// ==========================================================================

/**
 * 認証モードを設定するアクション
 * @returns setMode関数
 */
export const useSetAuthMode = () => useAppStore((state) => state.setMode);

/**
 * 認証モードを初期化するアクション
 * @returns initializeAuthMode関数
 */
export const useInitializeAuthMode = () =>
  useAppStore((state) => state.initializeAuthMode);

/**
 * 認証モードを取得するアクション
 * @returns fetchMode関数
 */
export const useFetchAuthMode = () => useAppStore((state) => state.fetchMode);

/**
 * 認証状態を取得するアクション
 * @returns fetchStatus関数
 */
export const useFetchAuthModeStatus = () =>
  useAppStore((state) => state.fetchStatus);

/**
 * 認証モードをバリデーションするアクション
 * @returns validate関数
 */
export const useValidateAuthMode = () => useAppStore((state) => state.validate);

/**
 * 確認ダイアログを開くアクション
 * @returns openConfirmDialog関数
 */
export const useOpenConfirmDialog = () =>
  useAppStore((state) => state.openConfirmDialog);

/**
 * 確認ダイアログを閉じるアクション
 * @returns closeConfirmDialog関数
 */
export const useCloseConfirmDialog = () =>
  useAppStore((state) => state.closeConfirmDialog);

/**
 * モード変更を確定するアクション
 * @returns confirmModeChange関数
 */
export const useConfirmModeChange = () =>
  useAppStore((state) => state.confirmModeChange);

/**
 * AuthModeのエラーをクリアするアクション
 * @returns clearError関数
 */
export const useClearAuthModeError = () =>
  useAppStore((state) => state.clearError);

/**
 * AuthModeの状態をリセットするアクション
 * @returns resetAuthMode関数
 */
export const useResetAuthMode = () =>
  useAppStore((state) => state.resetAuthMode);
