import { StateCreator } from "zustand";
import type {
  Skill,
  SkillCategory,
  SkillId,
  SkillName,
} from "@repo/shared/types/skill";
import type {
  AgentExecutionStatus,
  AgentMessage,
  PermissionRequest,
  PermissionResponse,
  AgentExecutionState,
  EnvironmentType,
  PreviewContent,
} from "@repo/shared/types/agent";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";
import type {
  SkillAnalysis,
  Suggestion,
} from "@repo/shared/types/skill-improver";
import type { HandoffGuidance } from "../../features/workspace-chat-edit/types";
import { preflightSkillExecutionAuth } from "../../utils/skillExecutionAuthPreflight";

// Re-export for backward compatibility
export type { AgentExecutionStatus } from "@repo/shared/types/agent";

/**
 * 実行サマリ型（TASK-UI-03: 実行履歴管理用）
 */
export interface ExecutionSummary {
  executionId: string;
  skillName: string;
  skillDisplayName: string;
  status: "completed" | "failed" | "executing" | "cancelled";
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
}

const MAX_EXECUTION_HISTORY = 10;
type SkillReviewOutcome = Extract<
  SkillExecutionStatus,
  "improve_ready" | "reuse_ready"
>;

const REVIEWABLE_SKILL_STATUSES: readonly SkillExecutionStatus[] = [
  "completed",
  "review",
  "improve_ready",
  "reuse_ready",
];

const RESETTABLE_SKILL_STATUSES: readonly SkillExecutionStatus[] = [
  "idle",
  "completed",
  "review",
  "improve_ready",
  "reuse_ready",
  "cancelled",
  "error",
];

function deriveSkillReviewOutcome(analysis: SkillAnalysis): SkillReviewOutcome {
  return analysis.suggestions.length > 0 ? "improve_ready" : "reuse_ready";
}

// ============================================
// エラーメッセージ定数（skillSliceから統合）
// ============================================

const SKILL_ERRORS = {
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;

/**
 * エラーメッセージをフォーマット
 */
function formatErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}

/**
 * executionIdを生成（UUID v4形式）
 * race condition対策: IPC呼び出し前にexecutionIdを事前生成
 */
function generateExecutionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // フォールバック: RFC 4122準拠のUUID v4生成
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * agentSlice状態インターフェース
 */
export interface AgentState {
  // スキル関連
  /** スキル一覧（インポート済み） */
  skills: Skill[];
  /** 利用可能なスキル一覧（インポート用） */
  availableSkills: Skill[];
  /** インポート済みスキルID一覧 */
  importedSkillIds: SkillId[];
  /** 選択中のスキル */
  selectedSkill: Skill | null;
  /** スキルフィルター文字列 */
  skillFilter: string;
  /** スキルカテゴリフィルター */
  skillCategory: SkillCategory | null;
  /** インポートダイアログ表示状態 */
  isImportDialogOpen: boolean;
  /** トーストメッセージ */
  toastMessage: { type: "success" | "error"; message: string } | null;

  // 実行関連（レガシー）
  /** 実行状態 */
  executionStatus: AgentExecutionStatus;
  /** 現在の実行ID */
  currentExecutionId: string | null;
  /** 実行出力 */
  executionOutput: string[];

  // エージェント実行状態（新規）
  /** エージェント実行状態 */
  executionState: AgentExecutionState;

  // 共通状態
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;

  // プレビュー関連 (AGENT-006)
  /** プレビューコンテンツ */
  previewContent: PreviewContent | null;
  /** 選択中の環境タイプ */
  selectedEnvironment: EnvironmentType;
  /** 分割比率 (0-100) */
  splitRatio: number;

  // === skillSliceから統合する状態（TASK-FIX-6-1） ===
  /** 利用可能なスキルメタデータ一覧（未インポート） */
  availableSkillsMetadata: SkillMetadata[];
  /** インポート済みスキル一覧 */
  importedSkills: ImportedSkill[];
  /** 選択中のスキル名（nullは未選択） */
  selectedSkillName: SkillName | null;
  /** スキル実行中フラグ */
  isExecuting: boolean;
  /** 実行ID（nullは未実行） */
  executionId: string | null;
  /** スキル実行ステータス */
  skillExecutionStatus: SkillExecutionStatus | null;
  /** ストリーミングメッセージ一覧 */
  streamingMessages: SkillStreamMessage[];
  /** 保留中の権限リクエスト */
  pendingPermission: SkillPermissionRequest | null;
  /** スキルエラー情報 */
  skillError: string | null;
  /** スキル一覧読み込み中 */
  isLoadingSkills: boolean;
  /** スキャン中 */
  isScanning: boolean;
  /** インポート中 */
  isImporting: boolean;
  /** インポート中のスキル名 */
  importingSkillName: SkillName | null;

  // === スキルライフサイクル状態（TASK-10A-D） ===
  /** 最新の分析結果 */
  currentAnalysis: SkillAnalysis | null;
  /** 改善適用前のスナップショット分析結果（Δスコア表示用） */
  previousAnalysis: SkillAnalysis | null;
  /** 分析処理中フラグ */
  isAnalyzing: boolean;
  /** 改善適用処理中フラグ */
  isImproving: boolean;

  // === TASK-UI-03: 実行履歴・詳細設定 ===
  /** 最近の実行履歴（最大10件、新しい順） */
  recentExecutions: ExecutionSummary[];
  /** 詳細設定パネルの開閉状態 */
  isAdvancedSettingsOpen: boolean;

  // === Terminal Handoff ===
  /** ターミナルハンドオフ案内（null は非表示） */
  handoffGuidance: HandoffGuidance | null;
}

/**
 * agentSliceアクションインターフェース
 */
export interface AgentActions {
  // スキル操作
  /** スキル一覧を設定 */
  setSkills: (skills: Skill[]) => void;
  /** 利用可能スキル一覧を設定 */
  setAvailableSkills: (skills: Skill[]) => void;
  /** インポート済みスキルIDを設定 */
  setImportedSkillIds: (ids: SkillId[]) => void;
  /** スキルを選択 */
  selectSkill: (skill: Skill | null) => void;
  /** フィルター文字列を設定 */
  setSkillFilter: (filter: string) => void;
  /** カテゴリフィルターを設定 */
  setSkillCategory: (category: SkillCategory | null) => void;
  /** インポートダイアログを開く */
  openImportDialog: () => void;
  /** インポートダイアログを閉じる */
  closeImportDialog: () => void;
  /** トーストを表示 */
  showToast: (type: "success" | "error", message: string) => void;
  /** トーストをクリア */
  clearToast: () => void;

  // 実行操作（レガシー）
  /** 実行状態を設定 */
  setExecutionStatus: (status: AgentExecutionStatus) => void;
  /** 実行IDを設定 */
  setCurrentExecutionId: (id: string | null) => void;
  /** 出力を追加 */
  appendOutput: (output: string) => void;
  /** 実行をクリア */
  clearExecution: () => void;

  // エージェント実行操作（新規）
  /** 実行を開始 */
  startExecution: (skill: Skill, executionId: string) => void;
  /** 実行を停止 */
  stopExecution: () => void;
  /** ユーザーメッセージを追加 */
  addUserMessage: (content: string) => void;
  /** アシスタントメッセージを追加 */
  addAssistantMessage: (options: {
    content: string;
    type?: AgentMessage["type"];
  }) => void;
  /** ストリーミングコンテンツを追加 */
  appendStreamingContent: (content: string) => void;
  /** ストリーミングメッセージを確定 */
  finalizeStreamingMessage: () => void;
  /** 実行エラーを設定 */
  setExecutionError: (error: string) => void;
  /** メッセージをクリア */
  clearMessages: () => void;
  /** 実行状態をリセット */
  resetExecutionState: () => void;

  // Permission操作
  /** 権限リクエストを設定 */
  setPermissionRequest: (request: PermissionRequest | null) => void;
  /** 権限に応答 */
  respondToPermission: (response: PermissionResponse) => void;
  /** 権限選択を記憶 */
  rememberPermissionChoice: (toolName: string, approved: boolean) => void;
  /** 記憶された選択を取得 */
  getRememberedChoice: (toolName: string) => boolean | undefined;
  /** 記憶された選択をクリア */
  clearRememberedChoices: () => void;

  // 共通操作
  /** ローディング状態を設定 */
  setLoading: (isLoading: boolean) => void;
  /** エラーを設定 */
  setError: (error: string | null) => void;
  /** 状態をリセット */
  resetAgentState: () => void;

  // プレビュー操作 (AGENT-006)
  /** プレビューコンテンツを設定 */
  setPreviewContent: (content: PreviewContent | null) => void;
  /** 環境タイプを設定 */
  setSelectedEnvironment: (type: EnvironmentType) => void;
  /** 分割比率を設定 */
  setSplitRatio: (ratio: number) => void;
  /** プレビューをクリア */
  clearPreview: () => void;

  // === skillSliceから統合するアクション（TASK-FIX-6-1） ===
  /** スキル一覧を取得 */
  fetchSkills: () => Promise<void>;
  /** スキルを再スキャン */
  rescanSkills: () => Promise<void>;
  /** スキルをインポート */
  importSkill: (skillName: SkillName) => Promise<void>;
  /** スキルを削除 */
  removeSkill: (skillName: SkillName) => Promise<void>;
  /** スキルを選択 */
  selectSkillByName: (skillName: SkillName | null) => void;
  /** スキルを実行（race condition対策版） */
  executeSkill: (prompt: string) => Promise<void>;
  /** 実行を中断 */
  abortExecution: () => void;
  /** 権限リクエストに応答 */
  respondToSkillPermission: (approved: boolean, remember?: boolean) => void;
  /** スキルエラーをクリア */
  clearSkillError: () => void;
  /** ストリーミングメッセージをクリア */
  clearStreamingMessages: () => void;

  // === スキルライフサイクルアクション（TASK-10A-D） ===
  /** スキルを分析し結果をcurrentAnalysisに格納する */
  analyzeSkill: (skillName: string) => Promise<void>;
  /** 選択した改善提案を適用する */
  applySkillImprovements: (
    skillName: string,
    suggestions: Suggestion[],
  ) => Promise<void>;
  /** 全自動改善を実行する */
  autoImproveSkill: (skillName: string) => Promise<void>;
  /** スキルを新規作成する */
  createSkill: (
    description: string,
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => Promise<string>;
  /** 分析結果をクリアする */
  clearAnalysis: () => void;
  /** 実行完了後のレビューを開始する */
  beginSkillReview: () => void;
  /** レビュー結果を確定する */
  completeSkillReview: (outcome: SkillReviewOutcome) => void;
  /** 改善後の再実行サイクルを開始する */
  reExecuteAfterImprovement: (prompt: string) => Promise<void>;
  /** スキル実行サイクルを待機状態へ戻す */
  resetSkillExecutionCycle: () => void;

  // === TASK-UI-03: 実行履歴・詳細設定アクション ===
  /** 実行履歴に追加（先頭に挿入、MAX_EXECUTION_HISTORY件制限） */
  addExecutionToHistory: (execution: ExecutionSummary) => void;
  /** 実行履歴を全クリア */
  clearExecutionHistory: () => void;
  /** 詳細設定パネルの開閉制御 */
  setAdvancedSettingsOpen: (isOpen: boolean) => void;

  // === Terminal Handoff アクション ===
  /** ハンドオフ案内を設定 */
  setHandoffGuidance: (guidance: HandoffGuidance) => void;
  /** ハンドオフ案内をクリア */
  clearHandoffGuidance: () => void;

  // === 内部アクション（IPCイベントハンドラ用） ===
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}

/**
 * agentSlice統合インターフェース
 */
export interface AgentSlice extends AgentState, AgentActions {}

/**
 * 初期状態
 */
const initialAgentState: AgentState = {
  // スキル関連
  skills: [],
  availableSkills: [],
  importedSkillIds: [],
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,
  isImportDialogOpen: false,
  toastMessage: null,

  // 実行関連（レガシー）
  executionStatus: "idle",
  currentExecutionId: null,
  executionOutput: [],

  // エージェント実行状態（新規）
  executionState: {
    status: "idle",
    currentSkill: null,
    messages: [],
    currentStreamingContent: "",
    error: null,
    startedAt: null,
    completedAt: null,
    pendingPermission: null,
    rememberedChoices: {},
  },

  // 共通状態
  isLoading: false,
  error: null,

  // プレビュー関連 (AGENT-006)
  previewContent: null,
  selectedEnvironment: "none",
  splitRatio: 50,

  // === skillSliceから統合する初期状態（TASK-FIX-6-1） ===
  availableSkillsMetadata: [],
  importedSkills: [],
  selectedSkillName: null,
  isExecuting: false,
  executionId: null,
  skillExecutionStatus: null,
  streamingMessages: [],
  pendingPermission: null,
  skillError: null,
  isLoadingSkills: false,
  isScanning: false,
  isImporting: false,
  importingSkillName: null,

  // === スキルライフサイクル初期状態（TASK-10A-D） ===
  currentAnalysis: null,
  previousAnalysis: null,
  isAnalyzing: false,
  isImproving: false,

  // === TASK-UI-03: 実行履歴・詳細設定初期状態 ===
  recentExecutions: [],
  isAdvancedSettingsOpen: false,

  // === Terminal Handoff 初期状態 ===
  handoffGuidance: null,
};

/**
 * agentSlice作成関数
 */
export const createAgentSlice: StateCreator<AgentSlice, [], [], AgentSlice> = (
  set,
  get,
) => ({
  // Initial state
  ...initialAgentState,

  // スキル操作
  setSkills: (skills) =>
    set({
      skills,
      importedSkillIds: skills.map((s) => s.id),
    }),

  setAvailableSkills: (skills) => set({ availableSkills: skills }),

  setImportedSkillIds: (ids) => set({ importedSkillIds: ids }),

  selectSkill: (skill) => set({ selectedSkill: skill }),

  setSkillFilter: (filter) => set({ skillFilter: filter }),

  setSkillCategory: (category) => set({ skillCategory: category }),

  openImportDialog: () => set({ isImportDialogOpen: true }),

  closeImportDialog: () => set({ isImportDialogOpen: false }),

  showToast: (type, message) => set({ toastMessage: { type, message } }),

  clearToast: () => set({ toastMessage: null }),

  // 実行操作
  setExecutionStatus: (status) => set({ executionStatus: status }),

  setCurrentExecutionId: (id) => set({ currentExecutionId: id }),

  appendOutput: (output) =>
    set((state) => ({
      executionOutput: [...state.executionOutput, output],
    })),

  clearExecution: () =>
    set({
      executionStatus: "idle",
      currentExecutionId: null,
      executionOutput: [],
    }),

  // エージェント実行操作（新規）
  startExecution: (skill, executionId) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "executing",
        currentSkill: skill,
        messages: [],
        currentStreamingContent: "",
        error: null,
        startedAt: new Date(),
        completedAt: null,
        pendingPermission: null,
      },
      currentExecutionId: executionId,
    })),

  stopExecution: () =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "cancelled",
        currentStreamingContent: "",
        completedAt: new Date(),
      },
    })),

  addUserMessage: (content) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        messages: [
          ...state.executionState.messages,
          {
            id: `msg-${Date.now()}`,
            role: "user" as const,
            content,
            timestamp: new Date(),
          },
        ],
      },
    })),

  addAssistantMessage: ({ content, type }) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        messages: [
          ...state.executionState.messages,
          {
            id: `msg-${Date.now()}`,
            role: "assistant" as const,
            content,
            timestamp: new Date(),
            type,
          },
        ],
      },
    })),

  appendStreamingContent: (content) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "streaming",
        currentStreamingContent:
          state.executionState.currentStreamingContent + content,
      },
    })),

  finalizeStreamingMessage: () =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        messages: [
          ...state.executionState.messages,
          {
            id: `msg-${Date.now()}`,
            role: "assistant" as const,
            content: state.executionState.currentStreamingContent,
            timestamp: new Date(),
            isStreaming: false,
          },
        ],
        currentStreamingContent: "",
      },
    })),

  setExecutionError: (error) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "error",
        error,
      },
    })),

  clearMessages: () =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "idle",
        messages: [],
        currentStreamingContent: "",
      },
    })),

  resetExecutionState: () =>
    set({
      executionState: {
        status: "idle",
        currentSkill: null,
        messages: [],
        currentStreamingContent: "",
        error: null,
        startedAt: null,
        completedAt: null,
        pendingPermission: null,
        rememberedChoices: {},
      },
    }),

  // Permission操作
  setPermissionRequest: (request) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: request ? "awaiting_permission" : state.executionState.status,
        pendingPermission: request,
      },
    })),

  respondToPermission: (_response) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        status: "executing",
        pendingPermission: null,
      },
    })),

  rememberPermissionChoice: (toolName, approved) =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        rememberedChoices: {
          ...state.executionState.rememberedChoices,
          [toolName]: approved,
        },
      },
    })),

  getRememberedChoice: (toolName) => {
    const state = get();
    return state.executionState.rememberedChoices[toolName];
  },

  clearRememberedChoices: () =>
    set((state) => ({
      executionState: {
        ...state.executionState,
        rememberedChoices: {},
      },
    })),

  // 共通操作
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetAgentState: () => set(initialAgentState),

  // プレビュー操作 (AGENT-006)
  setPreviewContent: (content) => set({ previewContent: content }),

  setSelectedEnvironment: (type) => set({ selectedEnvironment: type }),

  setSplitRatio: (ratio) =>
    set({ splitRatio: Math.max(0, Math.min(100, ratio)) }),

  clearPreview: () =>
    set({
      previewContent: null,
      selectedEnvironment: "none",
    }),

  // === skillSliceから統合するアクション（TASK-FIX-6-1） ===

  fetchSkills: async () => {
    set({ isLoadingSkills: true, skillError: null });
    try {
      if (typeof window === "undefined" || !window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const [available, imported] = await Promise.all([
        window.electronAPI.skill.list(),
        window.electronAPI.skill.getImported(),
      ]);
      set({
        availableSkillsMetadata: available,
        importedSkills: imported,
        isLoadingSkills: false,
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.FETCH_FAILED, error),
        isLoadingSkills: false,
      });
    }
  },

  rescanSkills: async () => {
    set({ isScanning: true, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const available = await window.electronAPI.skill.rescan();
      const imported = await window.electronAPI.skill.getImported();
      set({
        availableSkillsMetadata: available,
        importedSkills: imported,
        isScanning: false,
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.SCAN_FAILED, error),
        isScanning: false,
      });
    }
  },

  importSkill: async (skillName) => {
    // 冪等化: 既にインポート済みならIPCを呼ばずに終了
    if (get().importedSkills.some((s) => s.name === skillName)) {
      set((state) => ({
        skillError: null,
        availableSkillsMetadata: state.availableSkillsMetadata.filter(
          (s) => s.name !== skillName,
        ),
      }));
      return;
    }

    set({ isImporting: true, importingSkillName: skillName, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const imported = await window.electronAPI.skill.import(skillName);
      set((state) => ({
        importedSkills: state.importedSkills.some((s) => s.name === skillName)
          ? state.importedSkills
          : [...state.importedSkills, imported],
        availableSkillsMetadata: state.availableSkillsMetadata.filter(
          (s) => s.name !== skillName,
        ),
        isImporting: false,
        importingSkillName: null,
      }));
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.IMPORT_FAILED, error),
        isImporting: false,
        importingSkillName: null,
      });
    }
  },

  removeSkill: async (skillName) => {
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      await window.electronAPI.skill.remove(skillName);
      set((state) => ({
        importedSkills: state.importedSkills.filter(
          (s) => s.name !== skillName,
        ),
        selectedSkillName:
          state.selectedSkillName === skillName
            ? null
            : state.selectedSkillName,
      }));
    } catch (error) {
      set({
        skillError: formatErrorMessage(SKILL_ERRORS.REMOVE_FAILED, error),
      });
    }
  },

  selectSkillByName: (skillName) => {
    set({ selectedSkillName: skillName });
  },

  // race condition対策版 executeSkill
  executeSkill: async (prompt) => {
    const { selectedSkillName, isExecuting } = get();
    if (!selectedSkillName) return;

    // 並行実行ガード: 既に実行中の場合は即座に拒否（FR-01）
    if (isExecuting) return;

    const hasAuthPreflightAPI =
      typeof window !== "undefined" &&
      typeof window.electronAPI?.authKey?.exists === "function";

    // authKey API がある場合のみ事前検証を実施する。
    // API 未提供環境では従来どおり同期的に実行開始し、既存の race condition 対策テストとの互換を保つ。
    if (hasAuthPreflightAPI) {
      const preflightResult = await preflightSkillExecutionAuth();
      if (!preflightResult.ok) {
        set({
          isExecuting: false,
          skillExecutionStatus: "error",
          skillError:
            preflightResult.error?.message ||
            "APIキーが設定されていません。設定画面でAPIキーを登録してください。",
          executionId: null,
        });
        return;
      }
    }

    // race condition対策: IPC呼び出し前にexecutionIdを事前生成
    const tempExecutionId = generateExecutionId();

    try {
      set({
        isExecuting: true,
        skillExecutionStatus: "running",
        streamingMessages: [],
        skillError: null,
        handoffGuidance: null,
        executionId: tempExecutionId, // 事前設定
      });

      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }

      const response = await window.electronAPI.skill.execute({
        skillName: selectedSkillName,
        prompt,
      });

      if (response.handoff && response.guidance) {
        set({
          isExecuting: false,
          skillExecutionStatus: "error",
          skillError: response.error || response.guidance.reason,
          executionId: null,
          handoffGuidance: response.guidance,
        });
        return;
      }

      if (response.success !== false) {
        // サーバーからの正式なexecutionIdで更新
        set({
          executionId: response.executionId,
          handoffGuidance: null,
        });
        return;
      }

      set({
        isExecuting: false,
        skillExecutionStatus: "error",
        skillError:
          typeof response.error === "string" && response.error.trim() !== ""
            ? response.error
            : "スキル実行に失敗しました",
      });
    } catch (error) {
      set({
        isExecuting: false,
        skillExecutionStatus: "error",
        skillError: formatErrorMessage(SKILL_ERRORS.EXECUTE_FAILED, error),
      });
    }
  },

  abortExecution: () => {
    const { executionId } = get();
    if (executionId) {
      window.electronAPI?.skill?.abort(executionId);
      set({
        isExecuting: false,
        skillExecutionStatus: "cancelled",
      });
    }
  },

  respondToSkillPermission: (approved, remember = false) => {
    const state = get();
    const { pendingPermission } = state;
    if (pendingPermission) {
      // 権限履歴記録（PermissionHistorySliceが統合されている場合）
      const addHistoryEntry = (
        state as unknown as { addHistoryEntry?: (entry: unknown) => void }
      ).addHistoryEntry;
      if (addHistoryEntry) {
        const decision = !approved
          ? "denied"
          : remember
            ? "approved"
            : "approved_once";
        addHistoryEntry({
          toolName: pendingPermission.toolName,
          args: (pendingPermission.args ?? {}) as Record<string, unknown>,
          decision,
          timestamp: new Date(),
        });
      }

      window.electronAPI?.skill?.sendPermissionResponse({
        requestId: pendingPermission.requestId,
        approved,
        rememberChoice: remember,
      });
      set({ pendingPermission: null });
    }
  },

  clearSkillError: () => {
    set({ skillError: null });
  },

  clearStreamingMessages: () => {
    set({ streamingMessages: [] });
  },

  // === スキルライフサイクルアクション（TASK-10A-D） ===

  analyzeSkill: async (skillName: string) => {
    // P42準拠: 3段バリデーション
    if (typeof skillName !== "string" || skillName.trim() === "") {
      set({ skillError: "スキル名が無効です" });
      return;
    }
    set({
      isAnalyzing: true,
      skillError: null,
      currentAnalysis: null,
      previousAnalysis: null,
      skillExecutionStatus: REVIEWABLE_SKILL_STATUSES.includes(
        get().skillExecutionStatus ?? "idle",
      )
        ? "review"
        : get().skillExecutionStatus,
    });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const result = await window.electronAPI.skill.analyze(skillName.trim());
      set({
        currentAnalysis: result,
        isAnalyzing: false,
        skillExecutionStatus: REVIEWABLE_SKILL_STATUSES.includes(
          get().skillExecutionStatus ?? "idle",
        )
          ? deriveSkillReviewOutcome(result)
          : get().skillExecutionStatus,
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage("スキル分析に失敗", error),
        isAnalyzing: false,
      });
    }
  },

  applySkillImprovements: async (
    skillName: string,
    suggestions: Suggestion[],
  ) => {
    // P42準拠: 3段バリデーション
    if (typeof skillName !== "string" || skillName.trim() === "") {
      set({ skillError: "スキル名が無効です" });
      return;
    }
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      set({ skillError: "改善提案が選択されていません" });
      return;
    }
    // 改善適用前に現在の分析結果をスナップショット（Δスコア表示用）
    set({
      isImproving: true,
      skillError: null,
      previousAnalysis: get().currentAnalysis,
    });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      await window.electronAPI.skill.applyImprovements(
        skillName.trim(),
        suggestions,
      );
      // 改善適用後に再分析して最新状態を取得
      const result = await window.electronAPI.skill.analyze(skillName.trim());
      set({
        currentAnalysis: result,
        isImproving: false,
        skillExecutionStatus: deriveSkillReviewOutcome(result),
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage("改善適用に失敗", error),
        isImproving: false,
      });
    }
  },

  autoImproveSkill: async (skillName: string) => {
    // P42準拠: 3段バリデーション
    if (typeof skillName !== "string" || skillName.trim() === "") {
      set({ skillError: "スキル名が無効です" });
      return;
    }
    set({ isImproving: true, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      await window.electronAPI.skill.autoImprove(skillName.trim());
      // 全自動改善後に再分析
      const result = await window.electronAPI.skill.analyze(skillName.trim());
      set({
        currentAnalysis: result,
        isImproving: false,
        skillExecutionStatus: deriveSkillReviewOutcome(result),
      });
    } catch (error) {
      set({
        skillError: formatErrorMessage("全自動改善に失敗", error),
        isImproving: false,
      });
    }
  },

  createSkill: async (
    description: string,
    options: {
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => {
    // P42準拠: 3段バリデーション
    if (typeof description !== "string" || description.trim() === "") {
      set({ skillError: "スキルの説明が無効です" });
      return "";
    }
    set({ skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const result = await window.electronAPI.skill.create({
        description: description.trim(),
        options,
      });
      // 作成後にスキル一覧を再取得
      await get().fetchSkills();
      return result.path;
    } catch (error) {
      set({
        skillError: formatErrorMessage("スキル作成に失敗", error),
      });
      return "";
    }
  },

  clearAnalysis: () => {
    set({ currentAnalysis: null, previousAnalysis: null });
  },

  beginSkillReview: () => {
    set((state) => {
      if (!state.skillExecutionStatus) {
        return {};
      }
      if (!REVIEWABLE_SKILL_STATUSES.includes(state.skillExecutionStatus)) {
        return {};
      }
      return {
        skillExecutionStatus: "review",
        skillError: null,
      };
    });
  },

  completeSkillReview: (outcome) => {
    set((state) => {
      if (!state.skillExecutionStatus) {
        return {};
      }
      if (
        state.skillExecutionStatus !== "review" &&
        state.skillExecutionStatus !== "completed"
      ) {
        return {};
      }
      return {
        skillExecutionStatus: outcome,
      };
    });
  },

  reExecuteAfterImprovement: async (prompt) => {
    const { skillExecutionStatus } = get();
    if (skillExecutionStatus !== "improve_ready") {
      return;
    }
    await get().executeSkill(prompt);
  },

  resetSkillExecutionCycle: () => {
    set((state) => {
      if (state.isExecuting || state.skillExecutionStatus === "running") {
        return {};
      }
      if (
        state.skillExecutionStatus === "permission_pending" ||
        !RESETTABLE_SKILL_STATUSES.includes(
          state.skillExecutionStatus ?? "idle",
        )
      ) {
        return {};
      }
      return {
        isExecuting: false,
        executionId: null,
        pendingPermission: null,
        skillExecutionStatus: "idle",
        skillError: null,
        streamingMessages: [],
        handoffGuidance: null,
      };
    });
  },

  // === TASK-UI-03: 実行履歴・詳細設定アクション ===

  addExecutionToHistory: (execution) =>
    set((state) => ({
      recentExecutions: [execution, ...state.recentExecutions].slice(
        0,
        MAX_EXECUTION_HISTORY,
      ),
    })),

  clearExecutionHistory: () => set({ recentExecutions: [] }),

  setAdvancedSettingsOpen: (isOpen) => set({ isAdvancedSettingsOpen: isOpen }),

  // === Terminal Handoff アクション ===

  setHandoffGuidance: (guidance) => set({ handoffGuidance: guidance }),

  clearHandoffGuidance: () => set({ handoffGuidance: null }),

  // === 内部ハンドラ（IPCイベント用） ===

  _handleStreamMessage: (msg) => {
    set((state) => ({
      streamingMessages: [...state.streamingMessages, msg],
    }));
  },

  _handleComplete: (_executionId) => {
    set({
      isExecuting: false,
      skillExecutionStatus: "completed",
    });
  },

  _handleError: (_executionId, error) => {
    set({
      isExecuting: false,
      skillExecutionStatus: "error",
      skillError: error,
    });
  },

  _handlePermissionRequest: (req) => {
    set({
      pendingPermission: req,
      skillExecutionStatus: "permission_pending",
    });
  },
});
