/**
 * skillAPI.execute Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 * Tests for the skillAPI.execute method that executes skills from the renderer process.
 *
 * @see docs/30-workflows/skill-execution-implementation/outputs/phase-2/interface-design.md
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Define the window type extension for tests
declare global {
  interface Window {
    electronAPI?: {
      invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
    };
  }
}

// Mock OperationResult type
interface OperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// SkillRunResult from Phase 2 design
interface SkillRunResult {
  executionId: string;
  status: "success" | "failed";
  output?: string;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

describe("skillAPI.execute", () => {
  let mockInvoke: ReturnType<typeof vi.fn>;
  let originalElectronAPI: typeof window.electronAPI;

  beforeEach(() => {
    originalElectronAPI = window.electronAPI;
    mockInvoke = vi.fn();
    window.electronAPI = { invoke: mockInvoke };
  });

  afterEach(() => {
    window.electronAPI = originalElectronAPI;
    vi.clearAllMocks();
    vi.resetModules();
  });

  // ===========================================================================
  // TC-4-001: スキルIDを指定して実行できる
  // ===========================================================================

  describe("TC-4-001: スキルIDを指定して実行できる", () => {
    it("should execute skill with skillId and return success result", async () => {
      const mockResult: OperationResult<SkillRunResult> = {
        success: true,
        data: {
          executionId: "exec-123",
          status: "success",
          output: "Skill executed successfully",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      };
      mockInvoke.mockResolvedValue(mockResult);

      const { skillAPI } = await import("../index");

      // When: execute メソッドを呼び出す
      const result = await skillAPI.execute("skill-1");

      // Then: IPCがオブジェクト形式で呼び出される
      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: "skill-1",
      });

      // Then: 成功結果が返される
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.executionId).toBe("exec-123");
      expect(result.data?.status).toBe("success");
    });

    it("should call IPC with correct channel name", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: {} });

      const { skillAPI } = await import("../index");

      await skillAPI.execute("any-skill-id");

      expect(mockInvoke).toHaveBeenCalledWith(
        "skill:execute",
        expect.any(Object),
      );
    });
  });

  // ===========================================================================
  // TC-4-002: パラメータ付きで実行できる
  // ===========================================================================

  describe("TC-4-002: パラメータ付きで実行できる", () => {
    it("should execute skill with params", async () => {
      const mockResult: OperationResult<SkillRunResult> = {
        success: true,
        data: {
          executionId: "exec-456",
          status: "success",
          output: "Skill executed with params",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      };
      mockInvoke.mockResolvedValue(mockResult);

      const { skillAPI } = await import("../index");

      // When: パラメータ付きで execute を呼び出す
      const params = { key1: "value1", key2: 123 };
      const result = await skillAPI.execute("skill-2", params);

      // Then: IPCがパラメータ付きで呼び出される
      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: "skill-2",
        params: { key1: "value1", key2: 123 },
      });

      // Then: 成功結果が返される
      expect(result.success).toBe(true);
    });

    it("should handle empty params object", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: {} });

      const { skillAPI } = await import("../index");

      await skillAPI.execute("skill-3", {});

      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: "skill-3",
        params: {},
      });
    });

    it("should handle complex nested params", async () => {
      mockInvoke.mockResolvedValue({ success: true, data: {} });

      const { skillAPI } = await import("../index");

      const complexParams = {
        nested: { deep: { value: "test" } },
        array: [1, 2, 3],
      };
      await skillAPI.execute("skill-4", complexParams);

      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: "skill-4",
        params: complexParams,
      });
    });
  });

  // ===========================================================================
  // TC-4-003: 存在しないスキルIDでエラーを返す
  // ===========================================================================

  describe("TC-4-003: 存在しないスキルIDでエラーを返す", () => {
    it("should return error for non-existent skillId", async () => {
      const mockResult: OperationResult<SkillRunResult> = {
        success: false,
        error: "スキルが見つかりません",
      };
      mockInvoke.mockResolvedValue(mockResult);

      const { skillAPI } = await import("../index");

      // When: 存在しないスキルIDで実行
      const result = await skillAPI.execute("nonexistent-skill");

      // Then: エラー結果が返される
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should propagate error message from IPC", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Skill not found: invalid-id",
      });

      const { skillAPI } = await import("../index");

      const result = await skillAPI.execute("invalid-id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Skill not found: invalid-id");
    });
  });

  // ===========================================================================
  // TC-4-004: 空のスキルIDでエラーを返す
  // ===========================================================================

  describe("TC-4-004: 空のスキルIDでエラーを返す", () => {
    it("should return error for empty skillId", async () => {
      mockInvoke.mockResolvedValue({
        success: false,
        error: "スキルIDが必要です",
      });

      const { skillAPI } = await import("../index");

      // When: 空のスキルIDで実行
      const result = await skillAPI.execute("");

      // Then: エラー結果が返される
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // ===========================================================================
  // TC-6-002: nullパラメータで実行（Phase 6）
  // ===========================================================================

  describe("TC-6-002: nullパラメータで実行", () => {
    it("should execute skill with undefined params", async () => {
      mockInvoke.mockResolvedValue({
        success: true,
        data: {
          executionId: "exec-null-001",
          status: "success",
          output: "Executed without params",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });

      const { skillAPI } = await import("../index");

      const result = await skillAPI.execute("skill-1");

      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: "skill-1",
      });
      expect(result.success).toBe(true);
    });
  });

  // ===========================================================================
  // TC-6-003: 非常に長いskillIdで実行（Phase 6）
  // ===========================================================================

  describe("TC-6-003: 非常に長いskillIdで実行", () => {
    it("should handle very long skillId", async () => {
      const longSkillId = "a".repeat(1000);
      mockInvoke.mockResolvedValue({
        success: false,
        error: "Invalid skillId",
      });

      const { skillAPI } = await import("../index");

      const result = await skillAPI.execute(longSkillId);

      expect(mockInvoke).toHaveBeenCalledWith("skill:execute", {
        skillId: longSkillId,
      });
      expect(result.success).toBe(false);
    });
  });

  // ===========================================================================
  // Additional edge cases
  // ===========================================================================

  describe("edge cases", () => {
    it("should handle IPC error", async () => {
      mockInvoke.mockRejectedValue(new Error("IPC Error"));

      const { skillAPI } = await import("../index");

      await expect(skillAPI.execute("skill-1")).rejects.toThrow("IPC Error");
    });

    it("should handle timeout error", async () => {
      mockInvoke.mockRejectedValue(new Error("Request timed out"));

      const { skillAPI } = await import("../index");

      await expect(skillAPI.execute("skill-1")).rejects.toThrow(
        "Request timed out",
      );
    });

    it("should handle failed status in result", async () => {
      const mockResult: OperationResult<SkillRunResult> = {
        success: true,
        data: {
          executionId: "exec-789",
          status: "failed",
          error: "Execution error occurred",
          startedAt: new Date(),
          completedAt: new Date(),
        },
      };
      mockInvoke.mockResolvedValue(mockResult);

      const { skillAPI } = await import("../index");

      const result = await skillAPI.execute("skill-1");

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("failed");
      expect(result.data?.error).toBe("Execution error occurred");
    });
  });

  // ===========================================================================
  // Non-Electron environment fallback
  // ===========================================================================

  describe("non-Electron environment", () => {
    it("should return error fallback when electronAPI is not available", async () => {
      vi.resetModules();
      delete (window as Window & { electronAPI?: unknown }).electronAPI;

      const { skillAPI: freshSkillAPI } = await import("../index");

      const result = await freshSkillAPI.execute("skill-1");

      expect(result).toEqual({
        success: false,
        error: "Electron API not available",
      });
    });
  });
});
