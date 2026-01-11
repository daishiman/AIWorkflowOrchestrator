import { StateCreator } from "zustand";
import type { Skill, SkillCategory } from "@repo/shared/types/skill";

/**
 * エージェント実行状態
 */
export type AgentExecutionStatus =
  | "idle"
  | "executing"
  | "completed"
  | "error"
  | "aborted";

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

  // 実行関連
  /** 実行状態 */
  executionStatus: AgentExecutionStatus;
  /** 現在の実行ID */
  currentExecutionId: string | null;
  /** 実行出力 */
  executionOutput: string[];

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

  // 実行操作
  /** 実行状態を設定 */
  setExecutionStatus: (status: AgentExecutionStatus) => void;
  /** 実行IDを設定 */
  setCurrentExecutionId: (id: string | null) => void;
  /** 出力を追加 */
  appendOutput: (output: string) => void;
  /** 実行をクリア */
  clearExecution: () => void;

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

  // 実行関連
  executionStatus: "idle",
  currentExecutionId: null,
  executionOutput: [],

  // 共通状態
  isLoading: false,
  error: null,
};

/**
 * agentSlice作成関数
 */
export const createAgentSlice: StateCreator<AgentSlice, [], [], AgentSlice> = (
  set,
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

  // 共通操作
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  resetAgentState: () => set(initialAgentState),
});
