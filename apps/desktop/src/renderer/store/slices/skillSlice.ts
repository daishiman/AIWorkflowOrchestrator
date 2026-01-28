/**
 * @file SkillSlice - スキル機能の状態管理
 * @description スキルのインポート・実行・権限管理の状態を管理するZustandスライス
 * @feature skill-import-agent-system
 * @see specification.md §5.5 Zustand Store設計
 */

import { StateCreator } from "zustand";
import type {
  SkillMetadata,
  ImportedSkill,
  SkillExecutionStatus,
  SkillStreamMessage,
  SkillPermissionRequest,
} from "@repo/shared";

// ============================================
// エラーメッセージ定数
// ============================================

const SKILL_ERRORS = {
  FETCH_FAILED: "スキル一覧の取得に失敗",
  SCAN_FAILED: "スキル再スキャンに失敗",
  IMPORT_FAILED: "スキルのインポートに失敗",
  REMOVE_FAILED: "スキルの削除に失敗",
  EXECUTE_FAILED: "実行開始に失敗",
} as const;

// ============================================
// Types
// ============================================

export interface SkillSlice {
  // ===== 状態 =====
  /** 利用可能なスキル一覧（未インポート） */
  availableSkillsMetadata: SkillMetadata[];

  /** インポート済みスキル一覧 */
  importedSkills: ImportedSkill[];

  /** 選択中のスキル名（nullは未選択） */
  selectedSkillName: string | null;

  /** 実行中フラグ */
  isExecuting: boolean;

  /** 実行ID（nullは未実行） */
  executionId: string | null;

  /** 実行ステータス */
  skillExecutionStatus: SkillExecutionStatus | null;

  /** ストリーミングメッセージ一覧 */
  streamingMessages: SkillStreamMessage[];

  /** 保留中の権限リクエスト */
  pendingPermission: SkillPermissionRequest | null;

  /** エラー情報 */
  skillError: string | null;

  // ===== ローディング状態 =====
  /** スキル一覧読み込み中 */
  isLoadingSkills: boolean;

  /** スキャン中 */
  isScanning: boolean;

  /** インポート中 */
  isImporting: boolean;

  /** インポート中のスキル名 */
  importingSkillName: string | null;

  // ===== アクション =====
  /** スキル一覧を取得 */
  fetchSkills: () => Promise<void>;

  /** スキルを再スキャン */
  rescanSkills: () => Promise<void>;

  /** スキルをインポート */
  importSkill: (skillName: string) => Promise<void>;

  /** スキルを削除 */
  removeSkill: (skillName: string) => Promise<void>;

  /** スキルを選択 */
  selectSkillByName: (skillName: string | null) => void;

  /** スキルを実行 */
  executeSkill: (prompt: string) => Promise<void>;

  /** 実行を中断 */
  abortExecution: () => void;

  /** 権限リクエストに応答 */
  respondToSkillPermission: (approved: boolean, remember?: boolean) => void;

  /** エラーをクリア */
  clearError: () => void;

  /** ストリーミングメッセージをクリア */
  clearStreamingMessages: () => void;

  // ===== 内部アクション（IPCイベントハンドラ用） =====
  _handleStreamMessage: (msg: SkillStreamMessage) => void;
  _handleComplete: (executionId: string) => void;
  _handleError: (executionId: string, error: string) => void;
  _handlePermissionRequest: (req: SkillPermissionRequest) => void;
}

// ============================================
// Helper Functions
// ============================================

/**
 * スキル一覧をIPCから取得
 */
async function fetchSkillsFromIPC(): Promise<{
  available: SkillMetadata[];
  imported: ImportedSkill[];
}> {
  if (typeof window === "undefined" || !window.electronAPI?.skill) {
    throw new Error("Skill API not available");
  }
  const [available, imported] = await Promise.all([
    window.electronAPI.skill.list(),
    window.electronAPI.skill.getImported(),
  ]);
  return { available, imported };
}

/**
 * エラーメッセージをフォーマット
 */
function formatErrorMessage(prefix: string, error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return `${prefix}: ${message}`;
}

// ============================================
// Slice Creator
// ============================================

export const createSkillSlice: StateCreator<SkillSlice, [], [], SkillSlice> = (
  set,
  get,
) => ({
  // ===== 初期状態 =====
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

  // ===== アクション実装 =====

  fetchSkills: async () => {
    set({ isLoadingSkills: true, skillError: null });
    try {
      const { available, imported } = await fetchSkillsFromIPC();
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
    set({ isImporting: true, importingSkillName: skillName, skillError: null });
    try {
      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }
      const imported = await window.electronAPI.skill.import(skillName);
      set((state) => ({
        importedSkills: [...state.importedSkills, imported],
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

  executeSkill: async (prompt) => {
    const { selectedSkillName } = get();
    if (!selectedSkillName) return;

    try {
      set({
        isExecuting: true,
        skillExecutionStatus: "running",
        streamingMessages: [],
        skillError: null,
      });

      if (!window.electronAPI?.skill) {
        throw new Error("Skill API not available");
      }

      const response = await window.electronAPI.skill.execute({
        skillName: selectedSkillName,
        prompt,
      });

      set({ executionId: response.executionId });
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
    const { pendingPermission } = get();
    if (pendingPermission) {
      window.electronAPI?.skill?.sendPermissionResponse({
        requestId: pendingPermission.requestId,
        approved,
        rememberChoice: remember,
      });
      set({ pendingPermission: null });
    }
  },

  clearError: () => {
    set({ skillError: null });
  },

  clearStreamingMessages: () => {
    set({ streamingMessages: [] });
  },

  // ===== 内部ハンドラ =====

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
