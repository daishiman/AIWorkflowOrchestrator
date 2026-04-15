/**
 * agentHandlers.test.ts
 *
 * UT-FIX-IPC-MAIN-HANDLER-IMPL-001: 未実装チャネル（agent系4チャネル）のハンドラテスト
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import type { SkillService } from "../services/skill/SkillService";

// === Mocks ===

const mockIpcMainHandle = vi.fn();
const mockIpcMainRemoveHandler = vi.fn();

vi.mock("electron", () => ({
  ipcMain: {
    handle: mockIpcMainHandle,
    removeHandler: mockIpcMainRemoveHandler,
  },
  BrowserWindow: {
    fromWebContents: vi.fn().mockReturnValue({ id: 1 }),
  },
  IpcMainInvokeEvent: vi.fn(),
}));

// Mock IPC Sender Validation (always valid)
vi.mock("../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn().mockReturnValue({ valid: true }),
  toIPCValidationError: vi.fn((v: unknown) => v),
}));

// Mock ExecutionManager
const mockStartExecution = vi.fn();
const mockStopExecution = vi.fn();
const mockStopAllExecutions = vi.fn();
const mockGetActiveExecutions = vi.fn();
const mockResolvePermission = vi.fn();

vi.mock("../services/agent", () => ({
  ExecutionManager: vi.fn().mockImplementation(() => ({
    startExecution: mockStartExecution,
    stopExecution: mockStopExecution,
    stopAllExecutions: mockStopAllExecutions,
    getActiveExecutions: mockGetActiveExecutions,
    resolvePermission: mockResolvePermission,
  })),
}));

// Mock SkillService (used for agent:get-skills / agent:get-skill-detail)
const mockScanAvailableSkills = vi.fn();
const mockGetSkillByName = vi.fn();

const mockSkillService = {
  scanAvailableSkills: mockScanAvailableSkills,
  getSkillByName: mockGetSkillByName,
};

// Mock TerminalHandoffBuilder
vi.mock("../services/runtime/TerminalHandoffBuilder", () => ({
  TerminalHandoffBuilder: vi.fn().mockImplementation(() => ({
    buildForSurface: vi.fn().mockReturnValue("handoff-guidance"),
  })),
}));

// Import after mocks
import { IPC_CHANNELS } from "../../preload/channels";
import type { IApprovalGate } from "../services/runtime/ApprovalGate";

const mockMainWindow = {
  webContents: { send: vi.fn() },
  isDestroyed: () => false,
} as unknown as BrowserWindowType;

const mockApprovalGate: IApprovalGate = {
  requestPermission: vi.fn(),
  resolvePermission: vi.fn(),
  revokeAll: vi.fn(),
};

describe("agentHandlers — 新規 4 チャネル (UT-FIX-IPC-MAIN-HANDLER-IMPL-001)", () => {
  let handlers: Map<string, (...args: unknown[]) => Promise<unknown>>;

  beforeEach(async () => {
    vi.clearAllMocks();
    handlers = new Map();

    mockIpcMainHandle.mockImplementation(
      (channel: string, handler: (...args: unknown[]) => Promise<unknown>) => {
        handlers.set(channel, handler);
      },
    );

    const { registerAgentExecutionHandlers } = await import("./agentHandlers");
    registerAgentExecutionHandlers(
      mockMainWindow,
      mockApprovalGate,
      undefined,
      undefined,
      undefined,
      mockSkillService as unknown as SkillService,
    );
  });

  // ─── agent:get-skills ──────────────────────────────────────────────────────

  describe("agent:get-skills", () => {
    it("ハンドラが登録されている", () => {
      expect(handlers.has(IPC_CHANNELS.AGENT_GET_SKILLS)).toBe(true);
    });

    it("スキル一覧を返す", async () => {
      const mockSkills = [
        { id: "skill-1", name: "test-skill", description: "Test" },
      ];
      mockScanAvailableSkills.mockResolvedValue({ skills: mockSkills });

      const handler = handlers.get(IPC_CHANNELS.AGENT_GET_SKILLS)!;
      const result = (await handler({})) as {
        success: boolean;
        data: unknown[];
      };

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSkills);
    });

    it("スキルが0件の場合も空配列を返す", async () => {
      mockScanAvailableSkills.mockResolvedValue({ skills: [] });

      const handler = handlers.get(IPC_CHANNELS.AGENT_GET_SKILLS)!;
      const result = (await handler({})) as {
        success: boolean;
        data: unknown[];
      };

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  // ─── agent:get-skill-detail ────────────────────────────────────────────────

  describe("agent:get-skill-detail", () => {
    it("ハンドラが登録されている", () => {
      expect(handlers.has(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL)).toBe(true);
    });

    it("存在するskillIdを指定するとスキル詳細を返す", async () => {
      const mockSkill = { id: "skill-1", name: "test-skill" };
      mockGetSkillByName.mockResolvedValue(mockSkill);

      const handler = handlers.get(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL)!;
      const result = (await handler({}, { skillId: "skill-1" })) as {
        success: boolean;
        data: unknown;
      };

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSkill);
    });

    it("存在しないskillIdを指定するとNOT_FOUNDエラーを返す", async () => {
      mockGetSkillByName.mockResolvedValue(null);

      const handler = handlers.get(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL)!;
      const result = (await handler({}, { skillId: "nonexistent" })) as {
        success: boolean;
        error: { code: string };
      };

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_FOUND");
    });

    it("skillIdが省略されるとVALIDATION_ERRORをthrowする", async () => {
      const handler = handlers.get(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL)!;

      await expect(handler({}, { skillId: "" })).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  // ─── agent:execute ─────────────────────────────────────────────────────────

  describe("agent:execute", () => {
    it("ハンドラが登録されている", () => {
      expect(handlers.has(IPC_CHANNELS.AGENT_EXECUTE)).toBe(true);
    });

    it("有効なリクエストでエージェント実行を開始できる", async () => {
      mockStartExecution.mockResolvedValue("exec-123");

      const handler = handlers.get(IPC_CHANNELS.AGENT_EXECUTE)!;
      const result = (await handler(
        {},
        { prompt: "Hello", skillId: "skill-1" },
      )) as {
        success: boolean;
        executionId: string;
      };

      expect(result.success).toBe(true);
      expect(result.executionId).toBe("exec-123");
    });

    it("promptが空文字の場合はVALIDATION_ERRORをthrowする", async () => {
      const handler = handlers.get(IPC_CHANNELS.AGENT_EXECUTE)!;

      await expect(
        handler({}, { prompt: "", skillId: "skill-1" }),
      ).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });

  // ─── agent:permission-respond ──────────────────────────────────────────────

  describe("agent:permission-respond", () => {
    it("ハンドラが登録されている", () => {
      expect(handlers.has(IPC_CHANNELS.AGENT_PERMISSION_RESPOND)).toBe(true);
    });

    it("有効なrequestIdとapproved=trueで承認できる", async () => {
      mockGetActiveExecutions.mockReturnValue(["exec-1"]);
      mockResolvePermission.mockReturnValue(true);

      const handler = handlers.get(IPC_CHANNELS.AGENT_PERMISSION_RESPOND)!;
      const result = (await handler(
        {},
        { requestId: "req-1", approved: true },
      )) as {
        success: boolean;
      };

      expect(result.success).toBe(true);
    });

    it("有効なrequestIdとapproved=falseで拒否できる", async () => {
      mockGetActiveExecutions.mockReturnValue(["exec-1"]);
      mockResolvePermission.mockReturnValue(true);

      const handler = handlers.get(IPC_CHANNELS.AGENT_PERMISSION_RESPOND)!;
      const result = (await handler(
        {},
        { requestId: "req-1", approved: false },
      )) as {
        success: boolean;
      };

      expect(result.success).toBe(true);
    });

    it("requestIdが省略されるとVALIDATION_ERRORをthrowする", async () => {
      const handler = handlers.get(IPC_CHANNELS.AGENT_PERMISSION_RESPOND)!;

      await expect(handler({}, { approved: true })).rejects.toMatchObject({
        code: "VALIDATION_ERROR",
      });
    });
  });
});
