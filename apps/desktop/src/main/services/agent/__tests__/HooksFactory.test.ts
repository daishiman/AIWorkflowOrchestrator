/**
 * HooksFactory and PermissionResolver Tests
 *
 * Claude Agent SDK Hooks system の回帰テスト
 * 危険コマンドブロック、PermissionRequest、PostToolUse の基本挙動を検証する。
 * @see docs/30-workflows/claude-code-integration/outputs/phase-2/architecture-design.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HooksFactory, PermissionResolver } from "../HooksFactory";
import type { BrowserWindow } from "electron";
import type { IApprovalGate } from "../../runtime/ApprovalGate";

describe("HooksFactory", () => {
  let mockWindow: BrowserWindow;
  let permissionResolver: PermissionResolver;
  let hooksFactory: HooksFactory;
  let mockApprovalGate: IApprovalGate;
  const TEST_SESSION_ID = "test-session-id";

  beforeEach(() => {
    mockWindow = {
      isDestroyed: vi.fn().mockReturnValue(false),
      webContents: {
        isDestroyed: vi.fn().mockReturnValue(false),
        send: vi.fn(),
      },
    } as unknown as BrowserWindow;
    permissionResolver = new PermissionResolver();
    mockApprovalGate = {
      grantApproval: vi.fn(),
      rejectApproval: vi.fn(),
      checkApproval: vi.fn(),
      revokeAll: vi.fn(),
    };
    hooksFactory = new HooksFactory(
      mockWindow,
      "test-execution-id",
      permissionResolver,
      mockApprovalGate,
      TEST_SESSION_ID,
    );
  });

  it("should create hooks object with all required hooks", () => {
    const hooks = hooksFactory.createHooks();
    expect(hooks.PreToolUse).toBeDefined();
    expect(hooks.PostToolUse).toBeDefined();
    expect(hooks.PermissionRequest).toBeDefined();
  });

  describe("PreToolUse", () => {
    it("should block dangerous bash commands (rm -rf)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "rm -rf /important" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("rm -rf");
    });

    it("should block dangerous bash commands (sudo)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo apt-get install" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("sudo");
    });

    it("should block dangerous bash commands (chmod 777)", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "chmod 777 /etc/passwd" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
    });

    it("should allow safe commands", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "ls -la" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    it("should allow non-Bash tools", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Read", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    // Phase 6: Edge Cases
    it("should block dd if= command", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "dd if=/dev/zero of=/dev/sda" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("dd if=");
    });

    it("should block mkfs command", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "mkfs.ext4 /dev/sda1" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
      expect(result.message).toContain("mkfs");
    });

    it("should block fork bomb", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: ":(){ :|:& };:" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
    });

    it("should block /dev/ redirect", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "echo test > /dev/null" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
    });

    it("should handle null command gracefully", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: null } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    it("should handle undefined command gracefully", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: {} },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    it("should handle empty command string", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(true);
    });

    it("should block multiple dangerous patterns in one command", async () => {
      const hooks = hooksFactory.createHooks();
      const result = await hooks.PreToolUse!(
        { toolName: "Bash", args: { command: "sudo rm -rf /important" } },
        "tool-use-id",
        { signal: new AbortController().signal },
      );
      expect(result.proceed).toBe(false);
    });
  });

  describe("PostToolUse", () => {
    it("should send status via IPC", async () => {
      const hooks = hooksFactory.createHooks();
      await hooks.PostToolUse!({ toolName: "Read", args: {} }, "tool-use-id", {
        signal: new AbortController().signal,
      });
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:status",
        expect.objectContaining({
          executionId: "test-execution-id",
          type: "tool_completed",
          tool: "Read",
        }),
      );
    });
  });

  describe("PermissionRequest", () => {
    it("should send request and wait for response", async () => {
      const hooks = hooksFactory.createHooks();
      const abortController = new AbortController();

      // 応答を解決するための非同期処理
      const responsePromise = hooks.PermissionRequest!(
        { toolName: "Write", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: abortController.signal },
      );

      // IPC送信を確認
      expect(mockWindow.webContents.send).toHaveBeenCalledWith(
        "agent:permission",
        expect.objectContaining({
          executionId: "test-execution-id",
          toolName: "Write",
        }),
      );

      // 応答を解決
      const requestId = (mockWindow.webContents.send as vi.Mock).mock
        .calls[0][1].requestId;
      permissionResolver.resolveRequest({ requestId, approved: true });

      const result = await responsePromise;
      expect(result.proceed).toBe(true);
    });

    it("should handle abort signal", async () => {
      const hooks = hooksFactory.createHooks();
      const abortController = new AbortController();

      const responsePromise = hooks.PermissionRequest!(
        { toolName: "Write", args: { path: "/some/file.txt" } },
        "tool-use-id",
        { signal: abortController.signal },
      );

      abortController.abort();

      await expect(responsePromise).rejects.toThrow("Aborted");
    });
  });
});

describe("PermissionResolver", () => {
  let resolver: PermissionResolver;

  beforeEach(() => {
    resolver = new PermissionResolver();
  });

  it("should resolve pending request", async () => {
    const signal = new AbortController().signal;
    const promise = resolver.waitForResponse("req-1", signal);

    resolver.resolveRequest({ requestId: "req-1", approved: true });

    const result = await promise;
    expect(result.approved).toBe(true);
  });

  it("should reject on abort signal", async () => {
    const abortController = new AbortController();
    const promise = resolver.waitForResponse("req-1", abortController.signal);

    abortController.abort();

    await expect(promise).rejects.toThrow("Aborted");
  });

  it("should handle multiple pending requests", async () => {
    const signal = new AbortController().signal;

    const promise1 = resolver.waitForResponse("req-1", signal);
    const promise2 = resolver.waitForResponse("req-2", signal);

    resolver.resolveRequest({ requestId: "req-1", approved: true });
    resolver.resolveRequest({ requestId: "req-2", approved: false });

    const [result1, result2] = await Promise.all([promise1, promise2]);
    expect(result1.approved).toBe(true);
    expect(result2.approved).toBe(false);
  });
});
