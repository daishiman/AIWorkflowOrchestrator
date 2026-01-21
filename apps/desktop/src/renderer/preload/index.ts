/**
 * Renderer-side preload API module
 * Provides typed access to IPC APIs exposed by the preload script
 */

import type {
  Skill,
  OperationResult,
  SkillRunResult,
} from "@repo/shared/types/skill";

/**
 * Skill API for managing skills via IPC
 */
export interface SkillAPI {
  /** List all available skills from the global repository */
  listAvailable: () => Promise<OperationResult<Skill[]>>;
  /** List imported skills */
  listImported: () => Promise<OperationResult<Skill[]>>;
  /** Import skills by IDs */
  import: (skillIds: string[]) => Promise<OperationResult<void>>;
  /** Remove a skill by ID */
  remove: (skillId: string) => Promise<OperationResult<void>>;
  /** Get skill detail by ID */
  getDetail: (skillId: string) => Promise<OperationResult<Skill>>;
  /** Execute a skill by ID with optional parameters */
  execute: (
    skillId: string,
    params?: Record<string, unknown>,
  ) => Promise<OperationResult<SkillRunResult>>;
}

/**
 * Type guard for window.electronAPI
 */
function hasElectronAPI(win: Window): win is Window & {
  electronAPI: {
    invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
  };
} {
  return "electronAPI" in win;
}

/**
 * Skill API implementation using IPC
 */
export const skillAPI: SkillAPI = {
  listAvailable: async () => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<Skill[]>>(
        "skill:list-available",
      );
    }
    // Fallback for non-electron environment (development/testing)
    return { success: true, data: [] };
  },

  listImported: async () => {
    console.log("[skillAPI][DEBUG] listImported called");
    console.log("[skillAPI][DEBUG] hasElectronAPI:", hasElectronAPI(window));
    if (hasElectronAPI(window)) {
      console.log("[skillAPI][DEBUG] Invoking skill:list-imported via IPC...");
      const result = await window.electronAPI.invoke<OperationResult<Skill[]>>(
        "skill:list-imported",
      );
      console.log("[skillAPI][DEBUG] IPC result received:", result);
      return result;
    }
    console.log("[skillAPI][DEBUG] No electronAPI, returning empty array");
    return { success: true, data: [] };
  },

  import: async (skillIds: string[]) => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<void>>("skill:import", {
        skillIds,
      });
    }
    return { success: true };
  },

  remove: async (skillId: string) => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<void>>("skill:remove", {
        skillId,
      });
    }
    return { success: true };
  },

  getDetail: async (skillId: string) => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<Skill>>(
        "skill:get-detail",
        { skillId },
      );
    }
    return { success: false, error: "Skill not found" };
  },

  execute: async (skillId: string, params?: Record<string, unknown>) => {
    if (hasElectronAPI(window)) {
      return window.electronAPI.invoke<OperationResult<SkillRunResult>>(
        "skill:execute",
        params !== undefined ? { skillId, params } : { skillId },
      );
    }
    return { success: false, error: "Electron API not available" };
  },
};
