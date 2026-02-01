/**
 * @file permissionHistorySlice - 権限要求履歴の状態管理
 * @description 権限履歴のCRUD・フィルタリング・永続化を管理するZustandスライス
 * @feature task-imp-permission-history-001
 */

import { StateCreator } from "zustand";
import {
  type PermissionHistoryEntry,
  type PermissionHistoryFilter,
  PERMISSION_HISTORY_MAX_ENTRIES,
} from "../../components/skill/permissionHistory";

// ==========================================================================
// Types
// ==========================================================================

export interface PermissionHistorySlice {
  /** 権限要求履歴（最新が先頭、最大1000件） */
  permissionHistory: PermissionHistoryEntry[];

  /** フィルタ条件（非永続化） */
  historyFilter: PermissionHistoryFilter;

  /** 履歴エントリを追加（先頭挿入、1000件上限） */
  addHistoryEntry: (
    entry: Omit<PermissionHistoryEntry, "id" | "timestamp">,
  ) => void;

  /** 全履歴をクリア */
  clearHistory: () => void;

  /** フィルタ条件を設定 */
  setHistoryFilter: (filter: PermissionHistoryFilter) => void;
}

// ==========================================================================
// Slice Creator
// ==========================================================================

export const createPermissionHistorySlice: StateCreator<
  PermissionHistorySlice,
  [],
  [],
  PermissionHistorySlice
> = (set) => ({
  // ===== 初期状態 =====
  permissionHistory: [],
  historyFilter: {},

  // ===== アクション =====

  addHistoryEntry: (entry) => {
    set((state) => {
      const newEntry: PermissionHistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };

      const updated = [newEntry, ...state.permissionHistory];

      // 1000件上限を適用
      if (updated.length > PERMISSION_HISTORY_MAX_ENTRIES) {
        return {
          permissionHistory: updated.slice(0, PERMISSION_HISTORY_MAX_ENTRIES),
        };
      }

      return { permissionHistory: updated };
    });
  },

  clearHistory: () => {
    set({ permissionHistory: [] });
  },

  setHistoryFilter: (filter) => {
    set({ historyFilter: filter });
  },
});
