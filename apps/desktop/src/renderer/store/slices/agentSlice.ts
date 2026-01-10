import { StateCreator } from "zustand";

/**
 * スキルのアンカー情報
 * 参照文献と適用方法を定義
 */
export interface Anchor {
  /** 参照元（書籍、ドキュメント等） */
  source: string;
  /** 適用方法 */
  application: string;
  /** 目的 */
  purpose: string;
}

/**
 * スキル基本情報
 */
export interface Skill {
  /** 一意識別子 */
  id: string;
  /** スキル名 */
  name: string;
  /** 説明文 */
  description: string;
  /** スキルファイルパス */
  path: string;
  /** トリガーキーワード */
  triggers: string[];
  /** カテゴリ（任意） */
  category?: string;
}

/**
 * スキル詳細情報（Skill拡張）
 */
export interface SkillDetail extends Skill {
  /** アンカー情報 */
  anchors: Anchor[];
  /** ワークフロー定義（任意） */
  workflow?: string;
  /** ベストプラクティス（任意） */
  bestPractices?: string[];
}

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
  /** スキル一覧 */
  skills: Skill[];
  /** 選択中のスキル */
  selectedSkill: Skill | null;
  /** スキルフィルター文字列 */
  skillFilter: string;
  /** スキルカテゴリフィルター */
  skillCategory: string | null;

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
  /** スキルを選択 */
  selectSkill: (skill: Skill | null) => void;
  /** フィルター文字列を設定 */
  setSkillFilter: (filter: string) => void;
  /** カテゴリフィルターを設定 */
  setSkillCategory: (category: string | null) => void;

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
  selectedSkill: null,
  skillFilter: "",
  skillCategory: null,

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
  setSkills: (skills) => set({ skills }),

  selectSkill: (skill) => set({ selectedSkill: skill }),

  setSkillFilter: (filter) => set({ skillFilter: filter }),

  setSkillCategory: (category) => set({ skillCategory: category }),

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
