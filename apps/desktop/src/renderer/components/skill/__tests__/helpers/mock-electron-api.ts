/**
 * IPC API モック定義
 * TASK-10A-B: SkillAnalysisView テスト共通ユーティリティ
 */
import { vi } from "vitest";

export const createMockSkillAPI = () => ({
  analyze: vi.fn(),
  applyImprovements: vi.fn(),
  autoImprove: vi.fn(),
  // 既存メソッド（テスト対象外だがwindow.electronAPI.skillの型互換性のため）
  execute: vi.fn(),
  onStream: vi.fn(() => vi.fn()),
  abort: vi.fn(),
  getExecutionStatus: vi.fn(),
  onPermissionRequest: vi.fn(() => vi.fn()),
  sendPermissionResponse: vi.fn(),
  list: vi.fn(),
  getImported: vi.fn(),
  rescan: vi.fn(),
  import: vi.fn(),
  remove: vi.fn(),
  onComplete: vi.fn(() => vi.fn()),
  onError: vi.fn(() => vi.fn()),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
  listBackups: vi.fn(),
  restoreBackup: vi.fn(),
  importFromSource: vi.fn(),
  exportSkill: vi.fn(),
  validateSource: vi.fn(),
  docsGenerate: vi.fn(),
  docsPreview: vi.fn(),
  docsExport: vi.fn(),
  docsTemplates: vi.fn(),
  analyticsRecord: vi.fn(),
  analyticsStatistics: vi.fn(),
  analyticsSummary: vi.fn(),
  analyticsTrend: vi.fn(),
  analyticsExport: vi.fn(),
  scheduleList: vi.fn(),
  scheduleAdd: vi.fn(),
  scheduleUpdate: vi.fn(),
  scheduleDelete: vi.fn(),
  scheduleToggle: vi.fn(),
  forkSkill: vi.fn(),
  chainList: vi.fn(),
  chainGet: vi.fn(),
  chainSave: vi.fn(),
  chainDelete: vi.fn(),
  chainExecute: vi.fn(),
  debug: {
    startSession: vi.fn(),
    executeCommand: vi.fn(),
    endSession: vi.fn(),
    getSession: vi.fn(),
    addBreakpoint: vi.fn(),
    removeBreakpoint: vi.fn(),
    inspect: vi.fn(),
    evaluate: vi.fn(),
    onDebugEvent: vi.fn(() => vi.fn()),
  },
});

export type MockSkillAPI = ReturnType<typeof createMockSkillAPI>;

export const setupMockElectronAPI = (mockSkillAPI: MockSkillAPI): void => {
  Object.defineProperty(window, "electronAPI", {
    value: {
      skill: mockSkillAPI,
    },
    writable: true,
    configurable: true,
  });
};
