/**
 * ScriptExecutor Unit Tests
 * Phase 4: TDD Red State - Tests created before implementation
 *
 * Test Coverage:
 * - SE-001〜SE-008: execute() and executeJson() methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ChildProcess } from "child_process";
import { EventEmitter } from "events";

// Use vi.hoisted to create the mock function before hoisting
const mockSpawn = vi.hoisted(() => vi.fn());

// Mock child_process before importing (needs default for ESM)
vi.mock("child_process", () => ({
  default: { spawn: mockSpawn },
  spawn: mockSpawn,
}));

// Import after mocking
import { ScriptExecutor } from "../ScriptExecutor";

describe("ScriptExecutor", () => {
  const mockSkillCreatorPath = "/mock/skill-creator";
  let executor: ScriptExecutor;

  beforeEach(() => {
    executor = new ScriptExecutor(mockSkillCreatorPath);
    mockSpawn.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Helper function to create a mock ChildProcess
   */
  function createMockProcess(
    exitCode: number,
    stdout: string = "",
    stderr: string = "",
  ): ChildProcess {
    const mockProcess = new EventEmitter() as ChildProcess & {
      stdout: EventEmitter;
      stderr: EventEmitter;
      kill: ReturnType<typeof vi.fn>;
    };
    mockProcess.stdout = new EventEmitter();
    mockProcess.stderr = new EventEmitter();
    mockProcess.kill = vi.fn();

    // Simulate async process execution
    setTimeout(() => {
      if (stdout) {
        mockProcess.stdout.emit("data", Buffer.from(stdout));
      }
      if (stderr) {
        mockProcess.stderr.emit("data", Buffer.from(stderr));
      }
      mockProcess.emit("close", exitCode);
    }, 0);

    return mockProcess as ChildProcess;
  }

  describe("execute()", () => {
    it("SE-001: should return success when script exits with code 0", async () => {
      // Arrange
      const mockProcess = createMockProcess(0, "output", "");
      mockSpawn.mockReturnValue(mockProcess);

      // Act
      const result = await executor.execute("test-script.js", ["arg1"]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe("output");
      expect(result.stderr).toBe("");
      expect(mockSpawn).toHaveBeenCalledWith("node", [
        `${mockSkillCreatorPath}/scripts/test-script.js`,
        "arg1",
      ]);
    });

    it("SE-002: should return failure when script exits with non-zero code", async () => {
      // Arrange
      const mockProcess = createMockProcess(1, "", "error message");
      mockSpawn.mockReturnValue(mockProcess);

      // Act
      const result = await executor.execute("failing-script.js", []);

      // Assert
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe("error message");
    });

    it("SE-003: should throw error when spawn fails", async () => {
      // Arrange
      const mockProcess = new EventEmitter() as ChildProcess & {
        stdout: EventEmitter;
        stderr: EventEmitter;
      };
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();

      mockSpawn.mockReturnValue(mockProcess as ChildProcess);

      // Simulate spawn error
      setTimeout(() => {
        mockProcess.emit("error", new Error("ENOENT: file not found"));
      }, 0);

      // Act & Assert
      await expect(
        executor.execute("nonexistent-script.js", []),
      ).rejects.toThrow("Failed to execute script");
    });

    it("SE-004: should collect stdout output", async () => {
      // Arrange
      const expectedOutput = "line1\nline2\nline3";
      const mockProcess = createMockProcess(0, expectedOutput, "");
      mockSpawn.mockReturnValue(mockProcess);

      // Act
      const result = await executor.execute("output-script.js", []);

      // Assert
      expect(result.stdout).toBe(expectedOutput);
    });

    it("SE-005: should collect stderr output", async () => {
      // Arrange
      const expectedError = "warning: something happened";
      const mockProcess = createMockProcess(0, "", expectedError);
      mockSpawn.mockReturnValue(mockProcess);

      // Act
      const result = await executor.execute("warning-script.js", []);

      // Assert
      expect(result.stderr).toBe(expectedError);
    });

    it("SE-ABORT-001: should abort the child process when signal is cancelled", async () => {
      // Arrange
      const mockProcess = createMockProcess(0, "output", "");
      mockSpawn.mockReturnValue(mockProcess);
      const controller = new AbortController();

      // Act
      const execution = executor.execute("abortable-script.js", [], {
        signal: controller.signal,
      });
      controller.abort();

      // Assert
      await expect(execution).rejects.toMatchObject({
        name: "AbortError",
      });
      expect(mockProcess.kill).toHaveBeenCalledTimes(1);
    });
  });

  describe("executeJson()", () => {
    it("SE-006: should parse JSON output on success", async () => {
      // Arrange
      const expectedData = { mode: "collaborative", confidence: 0.95 };
      const mockProcess = createMockProcess(
        0,
        JSON.stringify(expectedData),
        "",
      );
      mockSpawn.mockReturnValue(mockProcess);

      // Act
      const result = await executor.executeJson<{
        mode: string;
        confidence: number;
      }>("json-script.js", []);

      // Assert
      expect(result).toEqual(expectedData);
    });

    it("SE-007: should throw SyntaxError on invalid JSON output", async () => {
      // Arrange
      const invalidJson = "{ invalid json }";
      const mockProcess = createMockProcess(0, invalidJson, "");
      mockSpawn.mockReturnValue(mockProcess);

      // Act & Assert
      await expect(executor.executeJson("invalid-json.js", [])).rejects.toThrow(
        SyntaxError,
      );
    });

    it("SE-008: should throw error when script fails", async () => {
      // Arrange
      const mockProcess = createMockProcess(1, "", "script error");
      mockSpawn.mockReturnValue(mockProcess);

      // Act & Assert
      await expect(
        executor.executeJson("failing-script.js", []),
      ).rejects.toThrow(/failed/i);
    });

    it("SE-009: should reject with AbortError when the signal is aborted", async () => {
      // Arrange
      const controller = new AbortController();
      const mockProcess = new EventEmitter() as ChildProcess & {
        stdout: EventEmitter;
        stderr: EventEmitter;
        kill: ReturnType<typeof vi.fn>;
      };
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = vi.fn(() => true);
      mockSpawn.mockReturnValue(mockProcess as ChildProcess);

      // Act
      const promise = executor.execute("long-running-script.js", [], {
        signal: controller.signal,
      });
      controller.abort();

      // Assert
      await expect(promise).rejects.toMatchObject({ name: "AbortError" });
      expect(mockProcess.kill).toHaveBeenCalledWith("SIGTERM");
    });
  });

  describe("Security", () => {
    it("BC-003: should reject path traversal attempts", async () => {
      // パストラバーサル防止のテスト
      await expect(executor.execute("../../../etc/passwd", [])).rejects.toThrow(
        "Invalid script name",
      );

      // スラッシュを含むパスも拒否
      await expect(executor.execute("subdir/script.js", [])).rejects.toThrow(
        "Invalid script name",
      );

      // バックスラッシュを含むパスも拒否
      await expect(executor.execute("subdir\\script.js", [])).rejects.toThrow(
        "Invalid script name",
      );
    });
  });
});
