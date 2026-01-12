import { StateCreator } from "zustand";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";
import type {
  AgentExecutionStatus,
  AgentMessage,
  PermissionRequest,
  PermissionResponse,
  AgentExecutionState,
} from "@repo/shared/types/agent";

// Re-export for backward compatibility
export type { AgentExecutionStatus } from "@repo/shared/types/agent";

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
  importedSkillIds: string[];
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
  setImportedSkillIds: (ids: string[]) => void;
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
});
