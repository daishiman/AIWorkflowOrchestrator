/**
 * TASK-SW-FIX-DATAFLOW-001 Phase 4
 * TC-09: IPC ハンドラ context 伝播確認
 * TC-10: 後方互換テスト（context なし従来呼び出し）
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";

// === Mocks ===

vi.mock("electron-store", () => ({
  default: class MockElectronStore {
    private data: Record<string, unknown> = {};
    get(key: string) {
      return this.data[key];
    }
    set(key: string | Record<string, unknown>, value?: unknown) {
      if (typeof key === "object") {
        Object.assign(this.data, key);
      } else {
        this.data[key] = value;
      }
    }
    clear() {
      this.data = {};
    }
  },
}));

const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(),
  executeSkill: vi.fn(),
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
  createSkillFromWizard: vi.fn(),
};

const mockMainWindow = {
  webContents: {
    send: vi.fn(),
    getURL: vi.fn().mockReturnValue("file://"),
  },
  isDestroyed: () => false,
  id: 1,
} as unknown as BrowserWindowType;

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    removeHandler: vi.fn(),
  },
  BrowserWindow: {
    fromWebContents: vi
      .fn()
      .mockReturnValue({ id: 1, isDestroyed: () => false }),
  },
}));

const mockValidateIpcSender = vi.fn().mockReturnValue({ valid: true });
const mockToIPCValidationError = vi.fn().mockImplementation((result) => ({
  code: result.errorCode ?? "IPC_UNAUTHORIZED",
  message: result.errorMessage ?? "Unauthorized IPC call",
}));

vi.mock("../../infrastructure/security/ipc-validator.js", () => ({
  validateIpcSender: mockValidateIpcSender,
  toIPCValidationError: mockToIPCValidationError,
}));

import { ipcMain } from "electron";

// ==========================================================================
// テスト
// ==========================================================================

describe("skillHandlers skill:create context 伝播テスト (TASK-SW-FIX-DATAFLOW-001)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  const CHANNEL = "skill:create";
  const VALID_DESCRIPTION = "テスト用スキルの説明";
  const VALID_OPTIONS = {
    generateTasks: false,
    addAgents: false,
    addReferences: false,
  } as const;
  const mockEvent = {} as unknown;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    mockValidateIpcSender.mockReturnValue({ valid: true });
    mockToIPCValidationError.mockImplementation((result) => ({
      code: result.errorCode ?? "IPC_UNAUTHORIZED",
      message: result.errorMessage ?? "Unauthorized IPC call",
    }));

    (ipcMain.handle as ReturnType<typeof vi.fn>).mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    mockSkillService.scanAvailableSkills.mockResolvedValue({
      skills: [],
      errors: [],
      scannedAt: new Date(),
    });
    mockSkillService.createSkillFromWizard.mockResolvedValue({
      path: "/mock/skills/new-skill",
    });

    const { registerSkillHandlers } = await import("../skillHandlers");
    registerSkillHandlers(mockMainWindow, mockSkillService as never);
  });

  afterEach(() => {
    vi.resetModules();
  });

  function getHandler(
    channel: string,
  ): (...args: unknown[]) => Promise<unknown> {
    const handler = handlers.get(channel);
    if (!handler) throw new Error(`${channel} handler not registered`);
    return handler;
  }

  // =========================================================================
  // TC-09: IPC ハンドラ context 伝播確認
  // =========================================================================

  describe("TC-09: IPC ハンドラ context 伝播確認", () => {
    it("context ありの場合 createSkillFromWizard に skillName/category と Q1〜Q6 が含まれた説明が渡される", async () => {
      const handler = getHandler(CHANNEL);
      const context = {
        skillName: "mail-organizer",
        category: "automation",
        purpose: "メール整理",
        q1Purpose: "一般ユーザー",
        q2Target: "受信箱",
        q3Tools: "毎日朝9時",
        q4Timing: "フォルダ",
        q5Output: "Gmail API",
        q6Constraints: "完了メッセージ",
      };

      await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS, context);

      const calledDescription = mockSkillService.createSkillFromWizard.mock
        .calls[0][0] as string;

      // enriched prompt に Step 0 / Step 1 の内容が含まれていること
      expect(calledDescription).toContain("mail-organizer");
      expect(calledDescription).toContain("automation");
      expect(calledDescription).toContain("一般ユーザー");
      expect(calledDescription).toContain("受信箱");
      expect(calledDescription).toContain("毎日朝9時");
      expect(calledDescription).toContain("フォルダ");
      expect(calledDescription).toContain("Gmail API");
      expect(calledDescription).toContain("完了メッセージ");
    });
  });

  // =========================================================================
  // TC-10: 後方互換テスト（context なし従来呼び出し）
  // =========================================================================

  describe("TC-10: 後方互換テスト（context なし）", () => {
    it("context なしの場合 createSkillFromWizard に description.trim() が渡される", async () => {
      const handler = getHandler(CHANNEL);

      await handler(mockEvent, "  テストスキル説明  ", VALID_OPTIONS);

      expect(mockSkillService.createSkillFromWizard).toHaveBeenCalledWith(
        "テストスキル説明",
        VALID_OPTIONS,
      );
    });

    it("context が undefined の場合も従来と同じ動作", async () => {
      const handler = getHandler(CHANNEL);

      await handler(mockEvent, VALID_DESCRIPTION, VALID_OPTIONS, undefined);

      expect(mockSkillService.createSkillFromWizard).toHaveBeenCalledWith(
        VALID_DESCRIPTION,
        VALID_OPTIONS,
      );
    });
  });
});
