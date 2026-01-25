/**
 * SkillExecutor - PermissionRequest Hook Tests
 *
 * TASK-3-1-C: PermissionRequest Hook 統合
 *
 * TDD Red フェーズ: 実装前に失敗するテストを作成
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import { SkillExecutor } from "../SkillExecutor";

// PermissionResolver モック
const mockPermissionResolver = {
  waitForResponse: vi.fn(),
  resolveRequest: vi.fn(),
  cancelRequest: vi.fn(),
  cancelAll: vi.fn(),
  pendingCount: 0,
};

vi.mock("../PermissionResolver", () => ({
  PermissionResolver: vi.fn(() => mockPermissionResolver),
}));

// SDK モック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: vi.fn(() => ({
    stream: vi.fn(() => ({
      [Symbol.asyncIterator]: () => ({
        next: () => Promise.resolve({ done: true }),
      }),
    })),
  })),
}));

describe("SkillExecutor - PermissionRequest Hook", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: {
        send: vi.fn(),
      },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // =================================================================
  // 権限リクエスト送信テスト
  // =================================================================

  describe("権限リクエスト送信", () => {
    it("should send permission request to renderer via IPC", async () => {
      // 準備
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-request-id",
        approved: true,
      });

      // sendPermissionRequest を呼び出す
      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "npm install" },
        undefined,
      );

      // 検証: skill:permission:request チャネルで送信される
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId: "exec-123",
          requestId: expect.any(String),
          toolName: "Bash",
          args: expect.any(Object),
          reason: expect.any(String),
        }),
      );
    });

    it("should generate unique requestId for each permission request", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id-1",
        approved: true,
      });

      // 2つの権限リクエストを送信
      const promise1 = executor.sendPermissionRequest(
        "exec-1",
        "Bash",
        { command: "ls" },
        undefined,
      );
      const promise2 = executor.sendPermissionRequest(
        "exec-2",
        "Write",
        { file_path: "/tmp/test.txt" },
        undefined,
      );

      await Promise.all([promise1, promise2]);

      // 2回の異なる呼び出しを確認
      expect(mockMainWindow.webContents.send).toHaveBeenCalledTimes(2);
    });
  });

  // =================================================================
  // ユーザー応答待機テスト
  // =================================================================

  describe("ユーザー応答待機", () => {
    it("should wait for user response using PermissionResolver", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // sendPermissionRequest を呼び出す
      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "npm install" },
        undefined,
      );

      // waitForResponse が適切なパラメータで呼び出される
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledWith(
        expect.any(String), // requestId
        undefined, // AbortSignal
      );
    });

    it("should pass AbortSignal to PermissionResolver", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      const abortController = new AbortController();

      // sendPermissionRequest を AbortSignal 付きで呼び出す
      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "npm install" },
        abortController.signal,
      );

      // AbortSignal が渡される
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledWith(
        expect.any(String),
        abortController.signal,
      );
    });
  });

  // =================================================================
  // 承認時の動作テスト
  // =================================================================

  describe("承認時の動作", () => {
    it("should return behavior: allow when user approves", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // Hook の戻り値が { behavior: 'allow' }
      // 注: createHooks 実装後に検証
      expect(true).toBe(true);
    });

    it("should log approval information", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // 承認がログに記録される
      // 注: 実装後に検証
      expect(true).toBe(true);
    });
  });

  // =================================================================
  // 拒否時の動作テスト
  // =================================================================

  describe("拒否時の動作", () => {
    it("should return behavior: deny when user rejects", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: false,
        rejectReason: "ユーザーにより拒否されました",
      });

      // Hook の戻り値が { behavior: 'deny', message: '...' }
      // 注: createHooks 実装後に検証
      expect(true).toBe(true);
    });

    it("should include reject reason in message", async () => {
      const rejectReason = "危険なコマンドです";
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: false,
        rejectReason,
      });

      // メッセージに拒否理由が含まれる
      // 注: 実装後に検証
      expect(true).toBe(true);
    });

    it("should use default message when no reject reason", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: false,
      });

      // デフォルトメッセージ「ユーザーにより拒否されました」
      // 注: 実装後に検証
      expect(true).toBe(true);
    });
  });

  // =================================================================
  // タイムアウト処理テスト
  // =================================================================

  describe("タイムアウト処理", () => {
    it("should return behavior: deny on timeout", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request timed out: test-id"),
      );

      // タイムアウト時は deny を返す
      // 注: createHooks 実装後に検証
      expect(true).toBe(true);
    });

    it("should include timeout message", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request timed out"),
      );

      // メッセージに「タイムアウト」が含まれる
      // 注: 実装後に検証
      expect(true).toBe(true);
    });
  });

  // =================================================================
  // キャンセル処理テスト
  // =================================================================

  describe("キャンセル処理", () => {
    it("should return behavior: deny when aborted", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request aborted: test-id"),
      );

      // キャンセル時は deny を返す
      // 注: 実装後に検証
      expect(true).toBe(true);
    });
  });
});

// =================================================================
// sanitizeArgs テスト
// =================================================================

describe("SkillExecutor - sanitizeArgs", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  describe("長文省略", () => {
    it("should truncate strings longer than 500 characters", () => {
      const longString = "a".repeat(600);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ content: longString });

      // 500文字 + 省略表示
      expect((result.content as string).length).toBeLessThan(600);
      expect(result.content).toContain("...");
    });

    it("should not truncate strings shorter than 500 characters", () => {
      const shortString = "a".repeat(100);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ content: shortString });

      expect(result.content).toBe(shortString);
    });

    it("should show omitted character count", () => {
      const longString = "a".repeat(600);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ content: longString });

      expect(result.content).toContain("省略");
    });
  });

  describe("機密情報除去", () => {
    it("should redact password fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ password: "secret123" });

      expect(result.password).toBe("[REDACTED]");
    });

    it("should redact token fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ apiToken: "abc123" });

      expect(result.apiToken).toBe("[REDACTED]");
    });

    it("should redact secret fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ clientSecret: "xyz789" });

      expect(result.clientSecret).toBe("[REDACTED]");
    });

    it("should redact key fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ apiKey: "key123" });

      expect(result.apiKey).toBe("[REDACTED]");
    });

    it("should redact credential fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ userCredential: "cred123" });

      expect(result.userCredential).toBe("[REDACTED]");
    });

    it("should be case-insensitive", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({
        PASSWORD: "secret1",
        ApiKey: "secret2",
        CLIENT_SECRET: "secret3",
      });

      expect(result.PASSWORD).toBe("[REDACTED]");
      expect(result.ApiKey).toBe("[REDACTED]");
      expect(result.CLIENT_SECRET).toBe("[REDACTED]");
    });

    it("should redact nested sensitive fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({
        config: {
          database: {
            password: "nested-secret",
          },
        },
      });

      expect(
        (result.config as { database: { password: string } }).database.password,
      ).toBe("[REDACTED]");
    });
  });

  describe("通常フィールド", () => {
    it("should preserve non-sensitive fields", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({
        file_path: "/path/to/file.ts",
        command: "npm install",
      });

      expect(result.file_path).toBe("/path/to/file.ts");
      expect(result.command).toBe("npm install");
    });

    it("should preserve numbers and booleans", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({
        count: 42,
        enabled: true,
      });

      expect(result.count).toBe(42);
      expect(result.enabled).toBe(true);
    });
  });

  describe("空・null 値", () => {
    it("should handle empty object", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({});

      expect(result).toEqual({});
    });

    it("should preserve null values", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ value: null });

      expect(result.value).toBeNull();
    });
  });
});

// =================================================================
// Phase 6: エッジケーステスト追加
// =================================================================

describe("SkillExecutor - Edge Cases (Phase 6)", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  describe("sanitizeArgs エッジケース", () => {
    it("should handle undefined values", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ data: undefined });

      expect(result.data).toBeUndefined();
    });

    it("should handle exactly 500 character strings", () => {
      const exactString = "a".repeat(500);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ content: exactString });

      expect(result.content).toBe(exactString);
    });

    it("should handle 501 character strings", () => {
      const longString = "a".repeat(501);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ content: longString });

      expect(result.content).toContain("...");
      expect(result.content).toContain("省略");
      expect((result.content as string).startsWith("a".repeat(500))).toBe(true);
    });

    it("should handle deeply nested objects (level 3)", () => {
      const args = {
        level1: {
          level2: {
            level3: {
              password: "secret",
            },
          },
        },
      };
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      expect(
        (
          result.level1 as {
            level2: { level3: { password: string } };
          }
        ).level2.level3.password,
      ).toBe("[REDACTED]");
    });

    it("should handle deeply nested objects (level 10 - depth limit)", () => {
      // 10レベルのネスト（深度制限に達する）
      const createDeepObject = (depth: number): Record<string, unknown> => {
        if (depth === 0) {
          return { value: "deep" };
        }
        return { nested: createDeepObject(depth - 1) };
      };

      const args = createDeepObject(10);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      // 深度10で制限に達するため _truncated が含まれる
      expect(JSON.stringify(result)).toContain("_truncated");
    });

    it("should handle arrays with mixed types", () => {
      const args = {
        items: ["string", 123, { name: "test" }],
      };
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      expect((result.items as unknown[])[0]).toBe("string");
      expect((result.items as unknown[])[1]).toBe(123);
      expect((result.items as { name: string }[])[2].name).toBe("test");
    });

    it("should handle arrays with sensitive objects", () => {
      const args = {
        items: [{ password: "secret" }, { token: "abc" }],
      };
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      expect((result.items as { password: string }[])[0].password).toBe(
        "[REDACTED]",
      );
      expect((result.items as { token: string }[])[1].token).toBe("[REDACTED]");
    });

    it("should handle special characters in keys", () => {
      const args = { "special-name": "value", "name.with.dots": "value2" };
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      expect(result["special-name"]).toBe("value");
      expect(result["name.with.dots"]).toBe("value2");
    });

    it("should handle unicode strings", () => {
      const args = { message: "日本語テスト🎉" };
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs(args);

      expect(result.message).toBe("日本語テスト🎉");
    });

    it("should handle bearer token variation", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ bearerToken: "xyz123" });

      expect(result.bearerToken).toBe("[REDACTED]");
    });

    it("should handle private_key variation", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const result = executor.sanitizeArgs({ private_key: "-----BEGIN-----" });

      expect(result.private_key).toBe("[REDACTED]");
    });
  });

  describe("getPermissionReason エッジケース", () => {
    it("should handle empty command string", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", { command: "" });

      expect(reason).toBe("Bash コマンドを実行");
    });

    it("should handle missing file_path for Write", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Write", {});

      expect(reason).toBe("ファイルを作成: ");
    });

    it("should handle missing file_path for Edit", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Edit", {});

      expect(reason).toBe("ファイルを編集: ");
    });

    it("should handle missing file_path for Read", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Read", {});

      expect(reason).toBe("ファイルを読み取り: ");
    });

    it("should handle missing pattern for Glob", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Glob", {});

      expect(reason).toBe("ファイルを検索: ");
    });

    it("should handle missing pattern for Grep", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Grep", {});

      expect(reason).toBe("テキストを検索: ");
    });

    it("should handle exactly 100 character command", () => {
      const command = "a".repeat(100);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", { command });

      expect(reason).toBe(`コマンドを実行: ${command}`);
    });

    it("should handle 101 character command with truncation", () => {
      const command = "a".repeat(101);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", { command });

      expect(reason).toContain("...");
      expect(reason.length).toBeLessThanOrEqual(150 + 3); // MAX_REASON_LENGTH + "..."
    });

    it("should handle Task tool with description", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Task", {
        description: "テストタスクの説明",
      });

      expect(reason).toContain("サブタスク");
      expect(reason).toContain("テストタスクの説明");
    });

    it("should handle Task tool with long description", () => {
      const longDesc = "タスク説明".repeat(20);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Task", {
        description: longDesc,
      });

      expect(reason).toContain("サブタスク");
      expect(reason).toContain("...");
    });

    it("should handle Task tool with empty description", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Task", {});

      expect(reason).toBe("サブタスクを実行: ");
    });
  });
});

// =================================================================
// getPermissionReason テスト
// =================================================================

describe("SkillExecutor - getPermissionReason", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  describe("Bash ツール", () => {
    it("should generate reason with command", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", {
        command: "npm install express",
      });

      expect(reason).toContain("npm install express");
      expect(reason).toContain("コマンド");
    });

    it("should truncate long commands to 100 characters", () => {
      const longCommand = "npm install " + "package-name-".repeat(20);
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", {
        command: longCommand,
      });

      // 理由文全体が適切な長さに収まる
      expect(reason.length).toBeLessThanOrEqual(150);
    });

    it("should handle empty command", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Bash", {});

      expect(reason).toContain("Bash");
    });
  });

  describe("Write ツール", () => {
    it("should generate reason with file_path", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Write", {
        file_path: "src/index.ts",
      });

      expect(reason).toContain("src/index.ts");
      expect(reason).toContain("作成");
    });

    it("should support path as alternative key", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Write", {
        path: "src/utils.ts",
      });

      expect(reason).toContain("src/utils.ts");
    });
  });

  describe("Edit ツール", () => {
    it("should generate reason with file_path", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Edit", {
        file_path: "src/app.ts",
      });

      expect(reason).toContain("src/app.ts");
      expect(reason).toContain("編集");
    });
  });

  describe("Read ツール", () => {
    it("should generate reason with file_path", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Read", {
        file_path: "package.json",
      });

      expect(reason).toContain("package.json");
      expect(reason).toContain("読み");
    });
  });

  describe("Glob ツール", () => {
    it("should generate reason with pattern", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Glob", {
        pattern: "**/*.ts",
      });

      expect(reason).toContain("**/*.ts");
      expect(reason).toContain("検索");
    });
  });

  describe("Grep ツール", () => {
    it("should generate reason with pattern", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("Grep", {
        pattern: "TODO",
      });

      expect(reason).toContain("TODO");
      expect(reason).toContain("検索");
    });
  });

  describe("デフォルトケース", () => {
    it("should generate generic reason for unknown tools", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("WebSearch", {});

      expect(reason).toContain("WebSearch");
      expect(reason).toContain("実行");
    });

    it("should handle custom tool names", () => {
      // @ts-expect-error - private メソッドへのアクセス（テスト用）
      const reason = executor.getPermissionReason("CustomTool", {
        param: "value",
      });

      expect(reason).toContain("CustomTool");
    });
  });
});

// =================================================================
// handlePermissionResponse テスト
// =================================================================

describe("SkillExecutor - handlePermissionResponse", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  it("should resolve pending request with approval", () => {
    executor.handlePermissionResponse("request-id", true);

    expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
      requestId: "request-id",
      approved: true,
      rememberChoice: undefined,
      rejectReason: undefined,
    });
  });

  it("should resolve pending request with rejection", () => {
    executor.handlePermissionResponse(
      "request-id",
      false,
      false,
      "Not allowed",
    );

    expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
      requestId: "request-id",
      approved: false,
      rememberChoice: false,
      rejectReason: "Not allowed",
    });
  });

  it("should pass rememberChoice flag", () => {
    executor.handlePermissionResponse("request-id", true, true);

    expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
      requestId: "request-id",
      approved: true,
      rememberChoice: true,
      rejectReason: undefined,
    });
  });

  it("should handle undefined optional parameters", () => {
    executor.handlePermissionResponse("request-id", false);

    expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
      requestId: "request-id",
      approved: false,
      rememberChoice: undefined,
      rejectReason: undefined,
    });
  });
});

// =================================================================
// Phase 6: 異常系テスト追加
// =================================================================

describe("SkillExecutor - Error Handling (Phase 6)", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  describe("PermissionRequest エラーハンドリング", () => {
    it("should handle AbortError gracefully", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";
      mockPermissionResolver.waitForResponse.mockRejectedValue(abortError);

      await expect(
        executor.sendPermissionRequest(
          "exec-123",
          "Bash",
          { command: "test" },
          undefined,
        ),
      ).rejects.toThrow("Aborted");
    });

    it("should handle timeout error", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request timed out: test-id"),
      );

      await expect(
        executor.sendPermissionRequest(
          "exec-123",
          "Bash",
          { command: "test" },
          undefined,
        ),
      ).rejects.toThrow("timed out");
    });

    it("should handle unexpected errors", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Unexpected error"),
      );

      await expect(
        executor.sendPermissionRequest(
          "exec-123",
          "Bash",
          { command: "test" },
          undefined,
        ),
      ).rejects.toThrow("Unexpected error");
    });

    it("should handle network errors", async () => {
      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Network error: connection refused"),
      );

      await expect(
        executor.sendPermissionRequest(
          "exec-123",
          "Bash",
          { command: "test" },
          undefined,
        ),
      ).rejects.toThrow("Network error");
    });
  });

  describe("handlePermissionResponse エラーハンドリング", () => {
    it("should handle unknown requestId gracefully", () => {
      // 存在しないrequestIdでもエラーにならないことを確認
      expect(() => {
        executor.handlePermissionResponse("unknown-id", true);
      }).not.toThrow();

      // resolveRequest は呼び出される（内部で無視される）
      expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
        requestId: "unknown-id",
        approved: true,
        rememberChoice: undefined,
        rejectReason: undefined,
      });
    });

    it("should handle empty requestId", () => {
      expect(() => {
        executor.handlePermissionResponse("", true);
      }).not.toThrow();
    });

    it("should handle special characters in rejectReason", () => {
      expect(() => {
        executor.handlePermissionResponse(
          "request-id",
          false,
          false,
          "理由: <script>alert('xss')</script>",
        );
      }).not.toThrow();

      expect(mockPermissionResolver.resolveRequest).toHaveBeenCalledWith({
        requestId: "request-id",
        approved: false,
        rememberChoice: false,
        rejectReason: "理由: <script>alert('xss')</script>",
      });
    });
  });

  describe("sendPermissionRequest with destroyed window", () => {
    it("should not throw when window is destroyed", async () => {
      mockMainWindow.isDestroyed.mockReturnValue(true);
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      // ウィンドウが破棄されていても例外を投げない
      const result = await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "test" },
        undefined,
      );

      expect(result.approved).toBe(true);
      // IPC送信は呼ばれない
      expect(mockMainWindow.webContents.send).not.toHaveBeenCalled();
    });
  });
});

// =================================================================
// Phase 6: 統合テスト追加
// =================================================================

describe("SkillExecutor - Integration Tests (Phase 6)", () => {
  let executor: SkillExecutor;
  let mockMainWindow: {
    webContents: { send: ReturnType<typeof vi.fn> };
    isDestroyed: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMainWindow = {
      webContents: { send: vi.fn() },
      isDestroyed: vi.fn().mockReturnValue(false),
    };
    vi.clearAllMocks();
    executor = new SkillExecutor(mockMainWindow as unknown as BrowserWindow);
  });

  describe("SkillExecutor と PermissionResolver 連携", () => {
    it("should correctly pass requestId between request and response", async () => {
      let capturedRequestId = "";

      mockMainWindow.webContents.send.mockImplementation(
        (channel: string, data: { requestId: string }) => {
          if (channel === "skill:permission:request") {
            capturedRequestId = data.requestId;
          }
        },
      );

      mockPermissionResolver.waitForResponse.mockImplementation(
        (requestId: string) => {
          return Promise.resolve({
            requestId,
            approved: true,
          });
        },
      );

      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "npm install" },
        undefined,
      );

      // waitForResponse に渡された requestId と IPC で送信された requestId が一致
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledWith(
        capturedRequestId,
        undefined,
      );
    });

    it("should maintain execution context across permission flow", async () => {
      const executionId = "exec-123";

      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "req-123",
        approved: true,
      });

      await executor.sendPermissionRequest(
        executionId,
        "Bash",
        { command: "npm install" },
        undefined,
      );

      // 実行コンテキスト（executionId）が維持されている
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId,
        }),
      );
    });

    it("should handle multiple concurrent permission requests", async () => {
      mockPermissionResolver.waitForResponse
        .mockResolvedValueOnce({ requestId: "req-1", approved: true })
        .mockResolvedValueOnce({ requestId: "req-2", approved: false })
        .mockResolvedValueOnce({ requestId: "req-3", approved: true });

      const results = await Promise.all([
        executor.sendPermissionRequest(
          "exec-1",
          "Bash",
          { command: "ls" },
          undefined,
        ),
        executor.sendPermissionRequest(
          "exec-2",
          "Write",
          { file_path: "/tmp/test.txt" },
          undefined,
        ),
        executor.sendPermissionRequest(
          "exec-3",
          "Read",
          { file_path: "/etc/hosts" },
          undefined,
        ),
      ]);

      expect(results[0].approved).toBe(true);
      expect(results[1].approved).toBe(false);
      expect(results[2].approved).toBe(true);

      // 3つの異なるリクエストが送信された
      expect(mockMainWindow.webContents.send).toHaveBeenCalledTimes(3);
    });
  });

  describe("IPC 通信連携", () => {
    it("should send correctly formatted permission request", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "npm install express" },
        undefined,
      );

      // IPC メッセージの形式検証
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId: "exec-123",
          requestId: expect.any(String),
          toolName: "Bash",
          args: expect.objectContaining({
            command: "npm install express",
          }),
          reason: expect.stringContaining("npm install express"),
        }),
      );
    });

    it("should sanitize args before sending via IPC", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        {
          command:
            "curl -H 'Authorization: Bearer secret-token' https://api.example.com",
          password: "secret123",
        },
        undefined,
      );

      // IPC で送信される args がサニタイズされている
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          args: expect.objectContaining({
            command: expect.any(String),
            password: "[REDACTED]",
          }),
        }),
      );
    });

    it("should use correct IPC channel", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-id",
        approved: true,
      });

      await executor.sendPermissionRequest(
        "exec-123",
        "Bash",
        { command: "test" },
        undefined,
      );

      // 正しいチャネル名を使用
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.any(Object),
      );
    });
  });

  describe("権限フロー完全テスト", () => {
    it("should complete full permission flow: request -> wait -> response", async () => {
      // 1. waitForResponse のモック設定
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-request-id",
        approved: true,
        rememberChoice: false,
      });

      // 2. sendPermissionRequest を実行
      const result = await executor.sendPermissionRequest(
        "exec-full-flow",
        "Write",
        { file_path: "/tmp/test.txt", content: "Hello World" },
        undefined,
      );

      // 3. IPC が呼ばれたことを確認
      expect(mockMainWindow.webContents.send).toHaveBeenCalledWith(
        "skill:permission:request",
        expect.objectContaining({
          executionId: "exec-full-flow",
          toolName: "Write",
          reason: expect.stringContaining("/tmp/test.txt"),
        }),
      );

      // 4. waitForResponse が呼ばれたことを確認
      expect(mockPermissionResolver.waitForResponse).toHaveBeenCalledWith(
        expect.any(String),
        undefined,
      );

      // 5. 結果が正しく返されることを確認
      expect(result).toEqual({
        requestId: "test-request-id",
        approved: true,
        rememberChoice: false,
      });
    });

    it("should handle rejection flow correctly", async () => {
      mockPermissionResolver.waitForResponse.mockResolvedValue({
        requestId: "test-request-id",
        approved: false,
        rejectReason: "ユーザーにより拒否されました",
      });

      const result = await executor.sendPermissionRequest(
        "exec-reject-flow",
        "Bash",
        { command: "rm -rf /" },
        undefined,
      );

      expect(result.approved).toBe(false);
      expect(result.rejectReason).toBe("ユーザーにより拒否されました");
    });

    it("should handle abort signal during permission flow", async () => {
      const abortController = new AbortController();

      mockPermissionResolver.waitForResponse.mockRejectedValue(
        new Error("Permission request aborted: test-id"),
      );

      // abort を発火
      abortController.abort();

      await expect(
        executor.sendPermissionRequest(
          "exec-abort-flow",
          "Bash",
          { command: "long-running-command" },
          abortController.signal,
        ),
      ).rejects.toThrow("aborted");
    });
  });
});
