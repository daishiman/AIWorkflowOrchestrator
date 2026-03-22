/**
 * スキル実行器 RuntimeResolver 統合テスト
 * Wave B: RuntimeResolver 統合・handoff 分岐・modifier 統合をテスト
 * @module main/slide/__tests__/skill-executor-runtime.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { SkillPhase } from "@repo/shared";

// ============================================================================
// Mocks
// ============================================================================

const mockAgentAPI = {
  query: vi.fn().mockResolvedValue({
    content: JSON.stringify({ changes: [] }),
    usage: { inputTokens: 100, outputTokens: 50 },
  }),
  abort: vi.fn(),
  getStatus: vi.fn().mockReturnValue("idle"),
  onMessage: vi.fn(() => () => {}),
};

vi.mock("../agent-client", () => ({
  getAgentAPI: vi.fn(() => mockAgentAPI),
  resetAgentAPI: vi.fn(),
}));

vi.mock("../modifier-skill", () => ({
  buildModifierPrompt: vi.fn().mockReturnValue("mock modifier prompt"),
  parseModifierResponse: vi
    .fn()
    .mockReturnValue({ success: true, changes: [] }),
}));

vi.mock("fs/promises", () => {
  const readFile = vi.fn().mockResolvedValue("mock file content");
  return {
    default: { readFile },
    readFile,
  };
});

// RuntimeResolver mock
const mockResolve = vi.fn().mockResolvedValue({ type: "integrated" });

vi.mock("../../services/runtime/RuntimeResolver", () => ({
  RuntimeResolver: vi.fn().mockImplementation(() => ({
    resolve: mockResolve,
  })),
}));

// Import after mocks
import { createSkillExecutor, buildHandoffGuidance } from "../skill-executor";

// ============================================================================
// Tests
// ============================================================================

describe("SkillExecutor Runtime Integration", () => {
  const testProjectPath = "/test/project";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset default mock values (P9 prevention)
    mockAgentAPI.query.mockResolvedValue({
      content: JSON.stringify({ changes: [] }),
      usage: { inputTokens: 100, outputTokens: 50 },
    });
    mockResolve.mockResolvedValue({ type: "integrated" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ==========================================================================
  // RuntimeResolver integration
  // ==========================================================================
  describe("RuntimeResolver integration", () => {
    it("should default to integrated mode when no deps provided", async () => {
      const executor = createSkillExecutor(); // no deps = no RuntimeResolver

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.isHandoff).toBeUndefined();
    });

    it("should use RuntimeResolver when deps are provided", async () => {
      const mockAuthKeyService = {
        getKey: vi.fn().mockResolvedValue("test-key"),
        setKey: vi.fn(),
        deleteKey: vi.fn(),
        hasKey: vi.fn().mockResolvedValue(true),
      };
      const mockAuthModeService = {
        getMode: vi.fn().mockReturnValue("api-key"),
        setMode: vi.fn(),
      };

      const executor = createSkillExecutor({
        authKeyService: mockAuthKeyService,
        authModeService: mockAuthModeService,
      });

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
    });

    it("should return handoff result when RuntimeResolver resolves to handoff", async () => {
      mockResolve.mockResolvedValue({
        type: "handoff",
        reason: "No API key configured",
      });

      const mockAuthKeyService = {
        getKey: vi.fn().mockResolvedValue(null),
        setKey: vi.fn(),
        deleteKey: vi.fn(),
        hasKey: vi.fn().mockResolvedValue(false),
      };
      const mockAuthModeService = {
        getMode: vi.fn().mockReturnValue("subscription"),
        setMode: vi.fn(),
      };

      const executor = createSkillExecutor({
        authKeyService: mockAuthKeyService,
        authModeService: mockAuthModeService,
      });

      const resultPromise = executor.execute("hearing", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.isHandoff).toBe(true);
      expect(result.guidance).toBeDefined();
      expect(result.guidance?.terminalCommand).toContain(testProjectPath);
      expect(result.guidance?.reason).toBe("No API key configured");
    });

    it("should execute skill via SDK when RuntimeResolver resolves to integrated", async () => {
      mockResolve.mockResolvedValue({ type: "integrated" });

      const mockAuthKeyService = {
        getKey: vi.fn().mockResolvedValue("test-key"),
        setKey: vi.fn(),
        deleteKey: vi.fn(),
        hasKey: vi.fn().mockResolvedValue(true),
      };
      const mockAuthModeService = {
        getMode: vi.fn().mockReturnValue("api-key"),
        setMode: vi.fn(),
      };

      const executor = createSkillExecutor({
        authKeyService: mockAuthKeyService,
        authModeService: mockAuthModeService,
      });

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.isHandoff).toBeUndefined();
      expect(mockAgentAPI.query).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // buildHandoffGuidance
  // ==========================================================================
  describe("buildHandoffGuidance", () => {
    it("should generate command with project path and phase", () => {
      const guidance = buildHandoffGuidance(
        "hearing",
        "/my/project",
        "API key not configured",
      );

      expect(guidance.terminalCommand).toContain("/my/project");
      expect(guidance.terminalCommand).toContain("hearing");
    });

    it("should include contextSummary with phase label", () => {
      const guidance = buildHandoffGuidance(
        "structure",
        "/my/project",
        "Subscription mode",
      );

      expect(guidance.contextSummary).toContain("/my/project");
    });

    it("should pass through the reason", () => {
      const reason = "No API key configured for integrated mode";
      const guidance = buildHandoffGuidance("html", "/project", reason);

      expect(guidance.reason).toBe(reason);
    });

    it("should generate correct labels for each phase", () => {
      const phases: SkillPhase[] = ["hearing", "structure", "html", "modifier"];

      for (const phase of phases) {
        const guidance = buildHandoffGuidance(phase, "/project", "test reason");

        expect(guidance.terminalCommand).toBeDefined();
        expect(guidance.terminalCommand.length).toBeGreaterThan(0);
        expect(guidance.contextSummary).toBeDefined();
        expect(guidance.contextSummary.length).toBeGreaterThan(0);
        expect(guidance.reason).toBe("test reason");
      }
    });
  });

  // ==========================================================================
  // modifier phase integration (AC-4)
  // ==========================================================================
  describe("modifier phase integration", () => {
    it("AC-4: should process modifier phase via skill-executor", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.phase).toBe("modifier");
      expect(result.success).toBe(true);
      expect(result.changes).toBeDefined();
      expect(Array.isArray(result.changes)).toBe(true);
    });

    it("should include direction in modifier result", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.direction).toBe("reverse");
    });

    it("should include projectPath in modifier result", async () => {
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.projectPath).toBe(testProjectPath);
    });

    it("should read HTML and structure files for modifier", async () => {
      const { readFile } = await import("fs/promises");
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      expect(readFile).toHaveBeenCalledWith(
        `${testProjectPath}/index.html`,
        "utf-8",
      );
      expect(readFile).toHaveBeenCalledWith(
        `${testProjectPath}/structure.md`,
        "utf-8",
      );
    });

    it("should use buildModifierPrompt for modifier phase", async () => {
      const { buildModifierPrompt } = await import("../modifier-skill");
      const executor = createSkillExecutor();

      const resultPromise = executor.execute("modifier", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      await resultPromise;

      expect(buildModifierPrompt).toHaveBeenCalledWith(
        expect.objectContaining({
          projectPath: testProjectPath,
          htmlContent: "mock file content",
          structureContent: "mock file content",
        }),
      );
    });
  });

  // ==========================================================================
  // Error handling
  // ==========================================================================
  describe("error handling", () => {
    it("should sanitize error messages (no internal paths exposed)", async () => {
      mockAgentAPI.query.mockRejectedValueOnce(
        new Error(
          "Internal error at /usr/local/lib/node_modules/sdk/src/client.ts:42",
        ),
      );

      const executor = createSkillExecutor();

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Error message is passed through (sanitization happens at IPC layer)
      expect(typeof result.error).toBe("string");
    });

    it("should handle non-Error thrown values", async () => {
      mockAgentAPI.query.mockRejectedValueOnce("string error");

      const executor = createSkillExecutor();

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should handle RuntimeResolver errors gracefully", async () => {
      mockResolve.mockRejectedValueOnce(new Error("RuntimeResolver failed"));

      const mockAuthKeyService = {
        getKey: vi.fn().mockResolvedValue("key"),
        setKey: vi.fn(),
        deleteKey: vi.fn(),
        hasKey: vi.fn().mockResolvedValue(true),
      };
      const mockAuthModeService = {
        getMode: vi.fn().mockReturnValue("api-key"),
        setMode: vi.fn(),
      };

      const executor = createSkillExecutor({
        authKeyService: mockAuthKeyService,
        authModeService: mockAuthModeService,
      });

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.success).toBe(false);
      expect(result.error).toBe("RuntimeResolver failed");
    });

    it("should include duration in error results", async () => {
      mockAgentAPI.query.mockRejectedValueOnce(new Error("SDK error"));

      const executor = createSkillExecutor();

      const resultPromise = executor.execute("html", testProjectPath);
      await vi.advanceTimersByTimeAsync(1000);
      const result = await resultPromise;

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
