/**
 * ExecutionManager Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for multiple execution management and lifecycle control
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExecutionManager } from "../ExecutionManager";
import type { BrowserWindow } from "electron";
import type { AgentExecutionRequest } from "@repo/shared";

// AgentExecutor モック
// startは終わらないPromiseを返すことで、実行がアクティブなままになる
const createNeverResolvingPromise = () => new Promise<void>(() => {});

vi.mock("../AgentExecutor", () => ({
  AgentExecutor: vi.fn().mockImplementation(() => ({
    start: vi.fn().mockImplementation(createNeverResolvingPromise),
    stop: vi.fn(),
    resolvePermission: vi.fn(),
  })),
}));

describe("ExecutionManager", () => {
  let manager: ExecutionManager;
  let mockWindow: BrowserWindow;

  beforeEach(() => {
    manager = new ExecutionManager();
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;
  });

  it("should start execution and return id", async () => {
    const request: AgentExecutionRequest = {
      executionId: "test-id",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    const id = await manager.startExecution(request, mockWindow);
    expect(id).toBe("test-id");
  });

  it("should generate id if not provided", async () => {
    const request: Partial<AgentExecutionRequest> = {
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    const id = await manager.startExecution(
      request as AgentExecutionRequest,
      mockWindow,
    );
    expect(id).toBeDefined();
    expect(typeof id).toBe("string");
  });

  it("should track active executions", async () => {
    const request1: AgentExecutionRequest = {
      executionId: "exec-1",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test 1",
    };
    const request2: AgentExecutionRequest = {
      executionId: "exec-2",
      skillId: "skill-2",
      skillPath: "/path",
      prompt: "Test 2",
    };

    await manager.startExecution(request1, mockWindow);
    await manager.startExecution(request2, mockWindow);

    const active = manager.getActiveExecutions();
    expect(active).toContain("exec-1");
    expect(active).toContain("exec-2");
  });

  it("should stop specific execution", async () => {
    const request: AgentExecutionRequest = {
      executionId: "exec-to-stop",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    await manager.startExecution(request, mockWindow);
    const result = manager.stopExecution("exec-to-stop");

    expect(result).toBe(true);
  });

  it("should return false when stopping non-existent execution", () => {
    const result = manager.stopExecution("non-existent");
    expect(result).toBe(false);
  });

  it("should stop all executions", async () => {
    const request1: AgentExecutionRequest = {
      executionId: "exec-1",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test 1",
    };
    const request2: AgentExecutionRequest = {
      executionId: "exec-2",
      skillId: "skill-2",
      skillPath: "/path",
      prompt: "Test 2",
    };

    await manager.startExecution(request1, mockWindow);
    await manager.startExecution(request2, mockWindow);

    manager.stopAllExecutions();

    // Note: 実際の実装ではstopが呼ばれることを検証
  });

  it("should resolve permission for specific execution", async () => {
    const request: AgentExecutionRequest = {
      executionId: "exec-perm",
      skillId: "skill-1",
      skillPath: "/path",
      prompt: "Test",
    };

    await manager.startExecution(request, mockWindow);

    const result = manager.resolvePermission("exec-perm", {
      requestId: "req-1",
      approved: true,
    });

    expect(result).toBe(true);
  });

  it("should return false when resolving permission for non-existent execution", () => {
    const result = manager.resolvePermission("non-existent", {
      requestId: "req-1",
      approved: true,
    });

    expect(result).toBe(false);
  });

  // Phase 6: Edge Cases
  describe("Edge Cases", () => {
    it("should handle concurrent start requests", async () => {
      const request1: AgentExecutionRequest = {
        executionId: "concurrent-1",
        prompt: "Test 1",
      };
      const request2: AgentExecutionRequest = {
        executionId: "concurrent-2",
        prompt: "Test 2",
      };

      // Start both concurrently
      const [id1, id2] = await Promise.all([
        manager.startExecution(request1, mockWindow),
        manager.startExecution(request2, mockWindow),
      ]);

      expect(id1).toBe("concurrent-1");
      expect(id2).toBe("concurrent-2");
      expect(manager.getActiveExecutions()).toContain("concurrent-1");
      expect(manager.getActiveExecutions()).toContain("concurrent-2");
    });

    it("should handle double stop gracefully", async () => {
      const request: AgentExecutionRequest = {
        executionId: "double-stop",
        prompt: "Test",
      };

      await manager.startExecution(request, mockWindow);

      const result1 = manager.stopExecution("double-stop");
      const result2 = manager.stopExecution("double-stop");

      expect(result1).toBe(true);
      expect(result2).toBe(true); // Should still return true because it's in the map
    });

    it("should handle stop all with no active executions", () => {
      // No executions started
      expect(() => manager.stopAllExecutions()).not.toThrow();
    });

    it("should handle permission resolution with wrong requestId", async () => {
      const request: AgentExecutionRequest = {
        executionId: "perm-test",
        prompt: "Test",
      };

      await manager.startExecution(request, mockWindow);

      // This should not throw, just return true/false
      const result = manager.resolvePermission("perm-test", {
        requestId: "wrong-id",
        approved: true,
      });

      // Should still return true because the execution exists
      expect(result).toBe(true);
    });

    it("should reject starting execution when max concurrent limit reached", async () => {
      // Start 5 executions (MAX_CONCURRENT_EXECUTIONS)
      for (let i = 0; i < 5; i++) {
        await manager.startExecution(
          { executionId: `max-${i}`, prompt: "Test" },
          mockWindow,
        );
      }

      // 6th should fail
      await expect(
        manager.startExecution(
          { executionId: "max-6", prompt: "Test" },
          mockWindow,
        ),
      ).rejects.toThrow("Maximum concurrent executions");
    });
  });
});
