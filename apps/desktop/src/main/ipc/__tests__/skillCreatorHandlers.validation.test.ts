/**
 * SkillCreator IPC Handlers - Validation Tests
 * Phase 4: TDD Red State
 * Test IDs: IPC-001 ~ IPC-012
 *
 * P42準拠3段バリデーション:
 * 1. typeof === "string" (型チェック)
 * 2. === "" (空文字列チェック)
 * 3. .trim() === "" (トリム空文字列チェック)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type {
  IpcMainInvokeEvent,
  BrowserWindow as BrowserWindowType,
} from "electron";

// Mock electron
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(
      (channel: string, handler: (...args: unknown[]) => unknown) => {
        handlerMap.set(channel, handler);
      },
    ),
    removeHandler: vi.fn((channel: string) => {
      handlerMap.delete(channel);
    }),
  },
  BrowserWindow: {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  },
}));

// Mock SkillCreatorService
const mockSkillCreatorService = {
  detectMode: vi.fn(),
  createSkill: vi.fn(),
  executeTasks: vi.fn(),
  validateSkill: vi.fn(),
  validateWithSchema: vi.fn(),
  improveSkill: vi.fn(),
  forkSkill: vi.fn(),
  shareSkill: vi.fn(),
  scheduleSkill: vi.fn(),
  debugSkill: vi.fn(),
  generateDocs: vi.fn(),
  getStats: vi.fn(),
  cancelCurrentOperation: vi.fn(),
};

const mockCancelCurrentSkillCreation = vi.fn();

vi.mock("../../services/skill/SkillCreatorService", () => ({
  SkillCreatorService: vi.fn(() => mockSkillCreatorService),
}));

// Handler map for test access
const handlerMap = new Map<string, (...args: unknown[]) => unknown>();

// Import after mocks
import { BrowserWindow } from "electron";
import {
  registerSkillCreatorHandlers,
  unregisterSkillCreatorHandlers,
  sendSkillCreatorProgress,
} from "../skillCreatorHandlers";
import {
  IPC_CHANNELS as CHANNELS_CONST,
  ALLOWED_INVOKE_CHANNELS,
  ALLOWED_ON_CHANNELS,
} from "../../../preload/channels";

// Helper functions
function createMockMainWindow() {
  return {
    id: 1,
    webContents: {
      id: 1,
      getType: () => "window",
      isDevToolsOpened: () => false,
      send: vi.fn(),
    },
    isDestroyed: () => false,
  };
}

function createMockEvent(webContentsId = 1): IpcMainInvokeEvent {
  return {
    sender: {
      id: webContentsId,
      getType: () => "window",
      isDevToolsOpened: () => false,
    },
  } as unknown as IpcMainInvokeEvent;
}

function getHandler(channel: string) {
  return handlerMap.get(channel);
}

describe("SkillCreator IPC Handlers - Validation (P42 Compliance)", () => {
  let mockMainWindow: ReturnType<typeof createMockMainWindow>;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockSkillCreatorService as unknown as any,
      undefined,
      undefined,
      mockCancelCurrentSkillCreation,
    );

    // Default mock responses
    mockSkillCreatorService.detectMode.mockResolvedValue("collaborative");
    mockSkillCreatorService.createSkill.mockResolvedValue("/valid/skill");
    mockSkillCreatorService.executeTasks.mockResolvedValue({
      mode: "execution",
      results: [],
      summary: { total: 0, completed: 0, failed: 0, skipped: 0 },
    });
    mockSkillCreatorService.validateSkill.mockResolvedValue(true);
    mockSkillCreatorService.validateWithSchema.mockResolvedValue(true);
  });

  afterEach(() => {
    unregisterSkillCreatorHandlers();
  });

  describe("skill-creator:detect-mode validation", () => {
    it("IPC-001: should return error for empty string request", async () => {
      const handler = getHandler("skill-creator:detect-mode");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), { request: "" });
      expect(result.success).toBe(false);
    });

    it("IPC-002: should return error for whitespace-only request (P42)", async () => {
      const handler = getHandler("skill-creator:detect-mode");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), { request: "   " });
      expect(result.success).toBe(false);
    });
  });

  describe("skill-creator:create validation", () => {
    it("IPC-003: should require name, description, and mode", async () => {
      const handler = getHandler("skill-creator:create");
      expect(handler).toBeDefined();
      // Missing description
      const result = await handler!(createMockEvent(), {
        name: "test",
        mode: "create",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-003A: should reject empty string fields (P42)", async () => {
      const handler = getHandler("skill-creator:create");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        name: "",
        description: "valid description",
        mode: "create",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-003B: should reject whitespace-only fields (P42)", async () => {
      const handler = getHandler("skill-creator:create");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        name: "valid-name",
        description: "   ",
        mode: "create",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-004: should reject path traversal in tasksDir", async () => {
      const handler = getHandler("skill-creator:create");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        name: "test",
        description: "test",
        mode: "create",
        tasksDir: "../etc/passwd",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("skill-creator:execute-tasks validation", () => {
    it("IPC-005: should reject empty tasksDir", async () => {
      const handler = getHandler("skill-creator:execute-tasks");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), { tasksDir: "" });
      expect(result.success).toBe(false);
    });

    it("IPC-006: should reject UNC paths", async () => {
      const handler = getHandler("skill-creator:execute-tasks");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        tasksDir: "\\\\server\\share",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("skill-creator:validate validation", () => {
    it("IPC-007: should require skillDir parameter", async () => {
      const handler = getHandler("skill-creator:validate");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {});
      expect(result.success).toBe(false);
    });
  });

  describe("skill-creator:validate-schema validation", () => {
    it("IPC-008: should reject schema names not in whitelist", async () => {
      const handler = getHandler("skill-creator:validate-schema");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        schemaName: "evil-schema",
        data: {},
      });
      expect(result.success).toBe(false);
    });

    it("IPC-009: should allow whitelisted schema names", async () => {
      const handler = getHandler("skill-creator:validate-schema");
      expect(handler).toBeDefined();
      const result = await handler!(createMockEvent(), {
        schemaName: "task-spec",
        data: { name: "test" },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Cross-channel security", () => {
    it("IPC-010: should reject requests from invalid sender window", async () => {
      (
        BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>
      ).mockReturnValue(null);
      const handler = getHandler("skill-creator:detect-mode");
      expect(handler).toBeDefined();
      // validateIpcSender 失敗時は toIPCValidationError() で throw される
      await expect(
        handler!(createMockEvent(999), { request: "test" }),
      ).rejects.toBeDefined();
    });

    it("IPC-011: should sanitize file paths in error messages", async () => {
      mockSkillCreatorService.detectMode.mockRejectedValue(
        new Error("File not found: /Users/dm/.secrets/api-key.json"),
      );
      const handler = getHandler("skill-creator:detect-mode");
      const result = await handler!(createMockEvent(), { request: "test" });
      expect(result.success).toBe(false);
      if (result.error) {
        expect(result.error).not.toContain("/Users/dm/.secrets");
      }
    });

    it("IPC-012: should sanitize tokens in error messages", async () => {
      mockSkillCreatorService.detectMode.mockRejectedValue(
        new Error("API error: token=abc123def456 invalid"),
      );
      const handler = getHandler("skill-creator:detect-mode");
      const result = await handler!(createMockEvent(), { request: "test" });
      expect(result.success).toBe(false);
      if (result.error) {
        expect(result.error).not.toContain("abc123def456");
      }
    });
  });

  describe("Phase 6 Expansion Tests", () => {
    it("IPC-EX-001: skill-creator:improve: サービス例外時にsanitizeエラー返却", async () => {
      // Arrange
      mockSkillCreatorService.improveSkill.mockRejectedValue(
        new Error("Internal error at /Users/dm/.secrets/config.json"),
      );
      const handler = getHandler("skill-creator:improve");
      expect(handler).toBeDefined();

      // Act
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        autoApply: false,
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).not.toContain("/Users/dm/.secrets");
    });

    it("IPC-EX-002: skill-creator:fork: sourceName 未指定でエラー", async () => {
      // Arrange
      const handler = getHandler("skill-creator:fork");
      expect(handler).toBeDefined();

      // Act - sourceName を空文字で呼び出し
      const result = await handler!(createMockEvent(), {
        sourceName: "",
        newName: "new-skill",
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("IPC-EX-003: skill-creator:schedule: schedule オブジェクト不正でエラー", async () => {
      // Arrange
      mockSkillCreatorService.scheduleSkill.mockRejectedValue(
        new Error("Invalid schedule configuration"),
      );
      const handler = getHandler("skill-creator:schedule");
      expect(handler).toBeDefined();

      // Act - schedule を不正なオブジェクトで呼び出し
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        schedule: null,
      });

      // Assert
      expect(result.success).toBe(false);
    });

    it("IPC-EX-004: 全ハンドラ: handler存在確認（32チャンネル）", () => {
      // 登録される32チャンネル（progressはsendなのでhandlerMapに含まれない）
      // 12 (skillCreatorHandlers) + 16 (runtimeCreatorHandlers incl. 4 session mgmt + 1 cleanup + 1 governance + 1 adapter-status)
      // + 2 (TASK-UI-02移管: configure-api / output-overwrite-approved)
      // + 1 (TASK-SC-13: verify)
      // + 1 (TASK-SW-CANCEL-003: cancel)
      const expectedChannels = [
        "skill-creator:detect-mode",
        "skill-creator:create",
        "skill-creator:execute-tasks",
        "skill-creator:validate",
        "skill-creator:validate-schema",
        "skill-creator:plan",
        "skill-creator:execute-plan",
        "skill-creator:get-workflow-state",
        "skill-creator:get-verify-detail",
        "skill-creator:submit-user-input",
        "skill-creator:apply-improvement",
        "skill-creator:improve-skill",
        "skill-creator:reverify-workflow",
        "skill-creator:improve",
        "skill-creator:fork",
        "skill-creator:share",
        "skill-creator:schedule",
        "skill-creator:debug",
        "skill-creator:generate-docs",
        "skill-creator:stats",
        "skill-creator:normalize-sdk-messages",
        "skill-creator:get-adapter-status",
        "skill-creator:list-sessions",
        "skill-creator:get-session-detail",
        "skill-creator:resume-session",
        "skill-creator:delete-session",
        "skill-creator:cleanup-expired-sessions",
        "skill-creator:get-governance-state",
        "skill-creator:configure-api",
        "skill-creator:output-overwrite-approved",
        "skill-creator:verify",
        "skill-creator:cancel",
      ];

      for (const channel of expectedChannels) {
        expect(handlerMap.has(channel)).toBe(true);
      }
      expect(handlerMap.size).toBe(expectedChannels.length);
    });

    it("IPC-EX-005: unregisterSkillCreatorHandlers: 全チャンネルが解除される", () => {
      // Arrange - ハンドラが登録済みであることを確認
      expect(handlerMap.size).toBeGreaterThan(0);

      // Act
      unregisterSkillCreatorHandlers();

      // Assert - handlerMapからすべて削除されている
      expect(handlerMap.size).toBe(0);
    });

    it("IPC-EX-006: skill-creator:cancel ハンドラが登録され cancelCurrentOperation を呼ぶ", async () => {
      // Arrange
      const handler = getHandler("skill-creator:cancel");
      expect(handler).toBeDefined();

      // Act
      const result = await handler!(createMockEvent());

      // Assert
      expect(result.success).toBe(true);
      expect(
        mockSkillCreatorService.cancelCurrentOperation,
      ).toHaveBeenCalledTimes(1);
      expect(mockCancelCurrentSkillCreation).toHaveBeenCalledTimes(1);
    });
  });

  describe("New handler success paths (Phase 6 Coverage)", () => {
    it("IPC-SP-001: skill-creator:improve 正常系", async () => {
      mockSkillCreatorService.improveSkill.mockResolvedValue({
        suggestions: [{ category: "prompt", description: "Improve clarity" }],
        applied: false,
      });
      const handler = getHandler("skill-creator:improve");
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        autoApply: false,
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("IPC-SP-002: skill-creator:fork 正常系", async () => {
      mockSkillCreatorService.forkSkill.mockResolvedValue("/path/to/forked");
      const handler = getHandler("skill-creator:fork");
      const result = await handler!(createMockEvent(), {
        sourceName: "original",
        newName: "forked",
        options: { copyAgents: true },
      });
      expect(result.success).toBe(true);
      expect(result.data).toContain("forked");
    });

    it("IPC-SP-003: skill-creator:share 正常系", async () => {
      mockSkillCreatorService.shareSkill.mockResolvedValue(
        "https://gist.github.com/abc",
      );
      const handler = getHandler("skill-creator:share");
      const result = await handler!(createMockEvent(), {
        skillName: "my-skill",
        format: "zip",
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("IPC-SP-004: skill-creator:schedule 正常系", async () => {
      mockSkillCreatorService.scheduleSkill.mockResolvedValue(undefined);
      const handler = getHandler("skill-creator:schedule");
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        schedule: {
          skillName: "test-skill",
          scheduleType: "cron",
          value: "0 9 * * *",
          isEnabled: true,
        },
      });
      expect(result.success).toBe(true);
    });

    it("IPC-SP-005: skill-creator:debug 正常系", async () => {
      mockSkillCreatorService.debugSkill.mockResolvedValue({
        steps: [
          {
            stepNumber: 1,
            toolName: "Read",
            input: {},
            output: "data",
            duration: 50,
            hitBreakpoint: false,
          },
        ],
      });
      const handler = getHandler("skill-creator:debug");
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        options: { verbose: true },
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("IPC-SP-006: skill-creator:generate-docs 正常系", async () => {
      mockSkillCreatorService.generateDocs.mockResolvedValue(
        "/path/to/docs.md",
      );
      const handler = getHandler("skill-creator:generate-docs");
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        format: "markdown",
        sections: ["overview"],
      });
      expect(result.success).toBe(true);
      expect(result.data).toContain("docs");
    });

    it("IPC-SP-007: skill-creator:stats 正常系", async () => {
      mockSkillCreatorService.getStats.mockResolvedValue({
        skillName: "test-skill",
        period: "7d",
        executionCount: 10,
      });
      const handler = getHandler("skill-creator:stats");
      const result = await handler!(createMockEvent(), {
        skillName: "test-skill",
        period: "7d",
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("IPC-SP-008: skill-creator:share スキル名未指定でエラー", async () => {
      const handler = getHandler("skill-creator:share");
      const result = await handler!(createMockEvent(), {
        skillName: "",
        format: "zip",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-009: skill-creator:share フォーマット未指定でエラー", async () => {
      const handler = getHandler("skill-creator:share");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
        format: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-010: skill-creator:debug スキル名未指定でエラー", async () => {
      const handler = getHandler("skill-creator:debug");
      const result = await handler!(createMockEvent(), {
        skillName: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-011: skill-creator:generate-docs スキル名未指定でエラー", async () => {
      const handler = getHandler("skill-creator:generate-docs");
      const result = await handler!(createMockEvent(), {
        skillName: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-012: skill-creator:stats 引数なしで正常動作", async () => {
      mockSkillCreatorService.getStats.mockResolvedValue({ executionCount: 0 });
      const handler = getHandler("skill-creator:stats");
      const result = await handler!(createMockEvent(), {});
      expect(result.success).toBe(true);
    });

    it("IPC-SP-013: skill-creator:fork newName 未指定でエラー", async () => {
      const handler = getHandler("skill-creator:fork");
      const result = await handler!(createMockEvent(), {
        sourceName: "original",
        newName: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-014: skill-creator:improve スキル名未指定でエラー", async () => {
      const handler = getHandler("skill-creator:improve");
      const result = await handler!(createMockEvent(), {
        skillName: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-015: skill-creator:schedule スキル名未指定でエラー", async () => {
      const handler = getHandler("skill-creator:schedule");
      const result = await handler!(createMockEvent(), {
        skillName: "",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-018: skill-creator:fork サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.forkSkill.mockRejectedValue(
        new Error("Fork failed: /Users/dm/.secrets/key"),
      );
      const handler = getHandler("skill-creator:fork");
      const result = await handler!(createMockEvent(), {
        sourceName: "original",
        newName: "forked",
      });
      expect(result.success).toBe(false);
      expect(result.error).not.toContain("/Users/dm/.secrets");
    });

    it("IPC-SP-019: skill-creator:share サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.shareSkill.mockRejectedValue(
        new Error("Share failed"),
      );
      const handler = getHandler("skill-creator:share");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
        format: "zip",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-020: skill-creator:schedule サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.scheduleSkill.mockRejectedValue(
        new Error("Schedule failed"),
      );
      const handler = getHandler("skill-creator:schedule");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
        schedule: {
          skillName: "test",
          scheduleType: "cron",
          value: "bad",
          isEnabled: true,
        },
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-021: skill-creator:debug サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.debugSkill.mockRejectedValue(
        new Error("Debug failed"),
      );
      const handler = getHandler("skill-creator:debug");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-022: skill-creator:generate-docs サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.generateDocs.mockRejectedValue(
        new Error("Docs failed"),
      );
      const handler = getHandler("skill-creator:generate-docs");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
      });
      expect(result.success).toBe(false);
    });

    it("IPC-SP-023: skill-creator:stats サービス例外時にsanitizeエラー返却", async () => {
      mockSkillCreatorService.getStats.mockRejectedValue(
        new Error("Stats failed"),
      );
      const handler = getHandler("skill-creator:stats");
      const result = await handler!(createMockEvent(), {
        skillName: "test",
        period: "7d",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("sendSkillCreatorProgress", () => {
    it("IPC-SP-016: 進捗通知をRendererに送信する", () => {
      const progress = {
        phase: "generating",
        percentage: 50,
        message: "Generating code...",
      };
      sendSkillCreatorProgress(
        mockMainWindow as unknown as BrowserWindowType,
        progress,
      );
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        expect.any(String),
        progress,
      );
    });

    it("IPC-SP-017: ウィンドウ破棄済みの場合は送信しない", () => {
      const destroyedWindow = {
        ...createMockMainWindow(),
        isDestroyed: () => true,
      };
      const progress = { phase: "generating", percentage: 50, message: "Test" };
      sendSkillCreatorProgress(
        destroyedWindow as unknown as BrowserWindowType,
        progress,
      );
      expect(destroyedWindow.webContents.send).not.toHaveBeenCalled();
    });
  });

  describe("P65 dead-end namespace 不在確認", () => {
    it("IPC-P65-001: creator:* namespace のハンドラが登録されていないこと", () => {
      const deadEndChannels = [
        "creator:plan",
        "creator:execute-plan",
        "creator:improve-skill",
        "creator:detect-mode",
        "creator:create",
        "creator:execute-tasks",
        "creator:validate",
        "creator:validate-schema",
      ];

      for (const channel of deadEndChannels) {
        expect(handlerMap.has(channel)).toBe(false);
      }
    });

    it("IPC-P65-002: 全登録チャネルが skill-creator: prefix を持つこと", () => {
      for (const channel of handlerMap.keys()) {
        expect(channel).toMatch(/^skill-creator:/);
      }
    });
  });

  describe("Allowlist 包含確認", () => {
    it("IPC-AL-001: 全16 invoke チャネルが ALLOWED_INVOKE_CHANNELS に含まれること", () => {
      const skillCreatorInvokeChannels = [
        CHANNELS_CONST.SKILL_CREATOR_DETECT_MODE,
        CHANNELS_CONST.SKILL_CREATOR_CREATE,
        CHANNELS_CONST.SKILL_CREATOR_EXECUTE_TASKS,
        CHANNELS_CONST.SKILL_CREATOR_VALIDATE,
        CHANNELS_CONST.SKILL_CREATOR_VALIDATE_SCHEMA,
        CHANNELS_CONST.SKILL_CREATOR_IMPROVE,
        CHANNELS_CONST.SKILL_CREATOR_FORK,
        CHANNELS_CONST.SKILL_CREATOR_SHARE,
        CHANNELS_CONST.SKILL_CREATOR_SCHEDULE,
        CHANNELS_CONST.SKILL_CREATOR_DEBUG,
        CHANNELS_CONST.SKILL_CREATOR_GENERATE_DOCS,
        CHANNELS_CONST.SKILL_CREATOR_STATS,
        CHANNELS_CONST.SKILL_CREATOR_PLAN,
        CHANNELS_CONST.SKILL_CREATOR_EXECUTE_PLAN,
        CHANNELS_CONST.SKILL_CREATOR_IMPROVE_SKILL,
        CHANNELS_CONST.SKILL_CREATOR_CANCEL,
      ];

      for (const channel of skillCreatorInvokeChannels) {
        expect(ALLOWED_INVOKE_CHANNELS).toContain(channel);
      }
    });

    it("IPC-AL-002: progress チャネルが ALLOWED_ON_CHANNELS に含まれること", () => {
      expect(ALLOWED_ON_CHANNELS).toContain(
        CHANNELS_CONST.SKILL_CREATOR_PROGRESS,
      );
    });
  });
});
