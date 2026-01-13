/**
 * AgentExecutor Tests
 * Phase 4: TDD Red - All tests should fail until implementation
 *
 * Tests for Claude Agent SDK integration and streaming
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AgentExecutor } from "../AgentExecutor";
import type { BrowserWindow } from "electron";
import type { AgentExecutionRequest } from "@repo/shared";

// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(),
}));

import { query } from "@anthropic-ai/claude-agent-sdk";

describe("AgentExecutor", () => {
  let mockWindow: BrowserWindow;
  let mockRequest: AgentExecutionRequest;

  beforeEach(() => {
    mockWindow = {
      webContents: {
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;

    mockRequest = {
      executionId: "test-exec-id",
      skillId: "test-skill",
      skillPath: "/path/to/skill",
      prompt: "Test prompt",
      workingDirectory: "/test/dir",
    };

    vi.clearAllMocks();
  });

  it("should call SDK query() with correct options", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "Hello" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Test prompt",
        options: expect.objectContaining({
          tools: expect.arrayContaining(["Read", "Edit", "Write", "Bash"]),
          signal: expect.any(AbortSignal),
        }),
      }),
    );
  });

  it("should stream messages via IPC", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "First message" };
      yield { type: "assistant", message: "Second message" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:stream",
      expect.objectContaining({
        executionId: "test-exec-id",
        type: "assistant",
      }),
    );
  });

  it("should send completion status on success", async () => {
    const mockStream = (async function* () {
      yield { type: "assistant", message: "Done" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "completed",
      }),
    );
  });

  it("should send cancelled status on abort", async () => {
    const mockStream = (async function* () {
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield { type: "assistant", message: "This should not be sent" };
    })();

    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    const startPromise = executor.start();

    executor.stop();

    await startPromise;

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "cancelled",
      }),
    );
  });

  it("should send error status on exception", async () => {
    (query as vi.Mock).mockImplementation(() => {
      throw new Error("SDK Error");
    });

    const executor = new AgentExecutor(mockRequest, mockWindow);
    await executor.start();

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:stream",
      expect.objectContaining({
        executionId: "test-exec-id",
        type: "error",
      }),
    );

    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      "agent:status",
      expect.objectContaining({
        executionId: "test-exec-id",
        status: "error",
        error: "SDK Error",
      }),
    );
  });

  it("should apply permission rules correctly", async () => {
    const customRules = {
      allow: [{ tool: "Read" }],
      deny: [{ tool: "Bash" }],
      ask: [{ tool: "Write" }],
    };

    const mockStream = (async function* () {})();
    (query as vi.Mock).mockReturnValue({
      stream: () => mockStream,
    });

    const executor = new AgentExecutor(mockRequest, mockWindow, customRules);
    await executor.start();

    expect(query).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          permissions: expect.objectContaining({
            allow: expect.arrayContaining([{ tool: "Read" }]),
          }),
        }),
      }),
    );
  });

  // Phase 6: Edge Cases
  describe("Edge Cases", () => {
    it("should handle stream interruption gracefully", async () => {
      const mockStream = (async function* () {
        yield { type: "assistant", message: "First" };
        throw new Error("Stream interrupted");
      })();

      (query as vi.Mock).mockReturnValue({
        stream: () => mockStream,
      });

      const executor = new AgentExecutor(mockRequest, mockWindow);
      await executor.start();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          status: "error",
        }),
      );
    });

    it("should handle SDK timeout", async () => {
      (query as vi.Mock).mockImplementation(() => {
        throw new Error("Request timeout");
      });

      const executor = new AgentExecutor(mockRequest, mockWindow);
      await executor.start();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          status: "error",
          error: "Request timeout",
        }),
      );
    });

    it("should handle invalid response from SDK", async () => {
      const mockStream = (async function* () {
        yield null;
        yield undefined;
        yield { type: "unknown", message: "Unknown type" };
      })();

      (query as vi.Mock).mockReturnValue({
        stream: () => mockStream,
      });

      const executor = new AgentExecutor(mockRequest, mockWindow);
      await executor.start();

      // Should complete successfully even with invalid messages
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          status: "completed",
        }),
      );
    });

    it("should send running status at start", async () => {
      const mockStream = (async function* () {
        yield { type: "assistant", message: "Hello" };
      })();

      (query as vi.Mock).mockReturnValue({
        stream: () => mockStream,
      });

      const executor = new AgentExecutor(mockRequest, mockWindow);
      await executor.start();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          status: "running",
        }),
      );
    });

    it("should use default working directory if not provided", async () => {
      const requestWithoutDir: AgentExecutionRequest = {
        executionId: "no-dir",
        prompt: "Test",
      };

      const mockStream = (async function* () {})();
      (query as vi.Mock).mockReturnValue({
        stream: () => mockStream,
      });

      const executor = new AgentExecutor(requestWithoutDir, mockWindow);
      await executor.start();

      // Should not throw
      expect(query).toHaveBeenCalled();
    });

    it("should handle empty stream", async () => {
      const mockStream = (async function* () {})();

      (query as vi.Mock).mockReturnValue({
        stream: () => mockStream,
      });

      const executor = new AgentExecutor(mockRequest, mockWindow);
      await executor.start();

      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          status: "completed",
        }),
      );
    });
  });
});
