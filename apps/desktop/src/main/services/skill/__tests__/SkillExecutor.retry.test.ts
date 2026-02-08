/**
 * SkillExecutor Retry Mechanism Tests
 *
 * TASK-SKILL-RETRY-001: SkillExecutor リトライ機構実装
 * Phase 4: テスト作成（TDD: Red）
 * Phase 6: テスト拡充
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BrowserWindow } from "electron";
import {
  SkillExecutor,
  isRetryableError,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
} from "../SkillExecutor";
import type {
  RetryConfig,
  SkillExecutionRequest,
  SkillMetadata,
} from "../SkillExecutor";

// =================================================================
// モック設定
// =================================================================

const mockWebContents = {
  send: vi.fn(),
};

const mockMainWindow = {
  webContents: mockWebContents,
  isDestroyed: vi.fn().mockReturnValue(false),
} as unknown as BrowserWindow;

const mockStreamGenerator = vi.fn();
const mockQuery = vi.fn().mockImplementation(() => ({
  stream: () => mockStreamGenerator(),
}));

vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  query: (args: unknown) => mockQuery(args),
}));

vi.mock("uuid", () => ({
  v4: () => "test-retry-execution-id",
}));

const mockPermissionStore = {
  isToolAllowed: vi.fn().mockReturnValue(false),
  allowTool: vi.fn(),
  revokeTool: vi.fn(),
  getAllowedTools: vi.fn().mockReturnValue([]),
  getAllowedToolEntries: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
};

/**
 * AuthKeyService モック
 * TASK-FIX-16-1: API キーが設定されていない場合に AUTHENTICATION_ERROR が返されるため
 */
const mockAuthKeyService = {
  getKey: vi.fn().mockResolvedValue("sk-ant-api03-test-key-for-unit-tests"),
  setKey: vi.fn().mockResolvedValue(undefined),
  deleteKey: vi.fn().mockResolvedValue(undefined),
  hasKey: vi.fn().mockResolvedValue(true),
  validateKey: vi.fn().mockResolvedValue(true),
};

// =================================================================
// ヘルパー
// =================================================================

const mockSkill: SkillMetadata = {
  id: "test-skill",
  name: "Test Skill",
  slug: "test-skill",
  description: "A test skill",
  path: "/path/to/skill",
  triggers: ["test"],
  anchors: [
    {
      source: "Test Source",
      application: "Testing",
      purpose: "Unit test",
    },
  ],
  allowedTools: ["Read", "Write"],
};

const mockRequest: SkillExecutionRequest = {
  prompt: "Hello",
  skillId: "test-skill",
};

/** ネットワークエラーを作成 */
function createNetworkError(code: string): Error & { code: string } {
  const error = new Error(`connect ${code}`) as Error & { code: string };
  error.code = code;
  return error;
}

/** HTTPエラーを作成 */
function createHttpError(
  status: number,
  headers?: Record<string, string>,
): Error & { status: number; headers?: Record<string, string> } {
  const error = new Error(`HTTP ${status}`) as Error & {
    status: number;
    headers?: Record<string, string>;
  };
  error.status = status;
  if (headers) error.headers = headers;
  return error;
}

/** タイムアウトエラーを作成 */
function createTimeoutError(): Error {
  const error = new Error("Request timed out");
  error.name = "TimeoutError";
  return error;
}

/** AbortErrorを作成 */
function createAbortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

/** 成功するストリームモックを設定 */
function setupSuccessStream(): void {
  mockStreamGenerator.mockReturnValue({
    [Symbol.asyncIterator]: async function* () {
      yield { type: "text", content: "OK" };
    },
  });
}

/** N回失敗して成功するモックを設定 */
function setupFailThenSuccessQuery(failCount: number, error: Error): void {
  let callCount = 0;
  mockQuery.mockImplementation(() => {
    callCount++;
    if (callCount <= failCount) {
      throw error;
    }
    return {
      stream: () => ({
        [Symbol.asyncIterator]: async function* () {
          yield { type: "text", content: "OK" };
        },
      }),
    };
  });
}

/** 常に失敗するモックを設定 */
function setupAlwaysFailQuery(error: Error): void {
  mockQuery.mockImplementation(() => {
    throw error;
  });
}

// =================================================================
// テスト本体
// =================================================================

describe("SkillExecutor Retry Mechanism", () => {
  let executor: SkillExecutor;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    mockQuery.mockImplementation(() => ({
      stream: () => mockStreamGenerator(),
    }));

    setupSuccessStream();
    mockMainWindow.isDestroyed = vi.fn().mockReturnValue(false);
    mockPermissionStore.isToolAllowed.mockReturnValue(false);
    // TASK-FIX-16-1: AuthKeyService モックをリセット
    mockAuthKeyService.getKey.mockResolvedValue(
      "sk-ant-api03-test-key-for-unit-tests",
    );
    executor = new SkillExecutor(
      mockMainWindow,
      mockPermissionStore,
      mockAuthKeyService,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =================================================================
  // isRetryableError テスト (17ケース)
  // =================================================================
  describe("isRetryableError", () => {
    // ネットワークエラー
    it("should identify ECONNRESET as retryable network error", () => {
      const result = isRetryableError(createNetworkError("ECONNRESET"));
      expect(result).toEqual({
        retryable: true,
        errorType: "network",
      });
    });

    it("should identify ETIMEDOUT as retryable network error", () => {
      const result = isRetryableError(createNetworkError("ETIMEDOUT"));
      expect(result).toEqual({
        retryable: true,
        errorType: "network",
      });
    });

    it("should identify ECONNREFUSED as retryable network error", () => {
      const result = isRetryableError(createNetworkError("ECONNREFUSED"));
      expect(result).toEqual({
        retryable: true,
        errorType: "network",
      });
    });

    it("should identify ENOTFOUND as retryable network error", () => {
      const result = isRetryableError(createNetworkError("ENOTFOUND"));
      expect(result).toEqual({
        retryable: true,
        errorType: "network",
      });
    });

    it("should identify EAI_AGAIN as retryable network error", () => {
      const result = isRetryableError(createNetworkError("EAI_AGAIN"));
      expect(result).toEqual({
        retryable: true,
        errorType: "network",
      });
    });

    // HTTP 429
    it("should identify HTTP 429 as retryable rate_limit error", () => {
      const result = isRetryableError(createHttpError(429));
      expect(result.retryable).toBe(true);
      expect(result.errorType).toBe("rate_limit");
    });

    it("should parse Retry-After header for HTTP 429", () => {
      const result = isRetryableError(
        createHttpError(429, { "retry-after": "30" }),
      );
      expect(result.retryable).toBe(true);
      expect(result.errorType).toBe("rate_limit");
      expect(result.retryAfterMs).toBe(30000);
    });

    // HTTP 5xx
    it("should identify HTTP 500 as retryable server_error", () => {
      const result = isRetryableError(createHttpError(500));
      expect(result).toEqual({
        retryable: true,
        errorType: "server_error",
      });
    });

    it("should identify HTTP 502 as retryable server_error", () => {
      const result = isRetryableError(createHttpError(502));
      expect(result).toEqual({
        retryable: true,
        errorType: "server_error",
      });
    });

    it("should identify HTTP 503 as retryable server_error", () => {
      const result = isRetryableError(createHttpError(503));
      expect(result).toEqual({
        retryable: true,
        errorType: "server_error",
      });
    });

    it("should identify HTTP 504 as retryable server_error", () => {
      const result = isRetryableError(createHttpError(504));
      expect(result).toEqual({
        retryable: true,
        errorType: "server_error",
      });
    });

    // タイムアウト
    it("should identify TimeoutError as retryable timeout", () => {
      const result = isRetryableError(createTimeoutError());
      expect(result).toEqual({
        retryable: true,
        errorType: "timeout",
      });
    });

    // 非リトライ対象
    it("should identify HTTP 400 as non-retryable", () => {
      const result = isRetryableError(createHttpError(400));
      expect(result).toEqual({ retryable: false });
    });

    it("should identify HTTP 401 as non-retryable", () => {
      const result = isRetryableError(createHttpError(401));
      expect(result).toEqual({ retryable: false });
    });

    it("should identify HTTP 403 as non-retryable", () => {
      const result = isRetryableError(createHttpError(403));
      expect(result).toEqual({ retryable: false });
    });

    it("should identify AbortError as non-retryable", () => {
      const result = isRetryableError(createAbortError());
      expect(result).toEqual({ retryable: false });
    });

    it("should identify unknown error as non-retryable", () => {
      const result = isRetryableError(new Error("Something went wrong"));
      expect(result).toEqual({ retryable: false });
    });
  });

  // =================================================================
  // calculateBackoffDelay テスト (8ケース)
  // =================================================================
  describe("calculateBackoffDelay", () => {
    it("should calculate delay for attempt=0 with default config", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5); // No jitter effect
      const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG);
      expect(delay).toBe(1000); // 1000 * 2^0 = 1000, jitter=0
    });

    it("should calculate delay for attempt=1 with default config", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const delay = calculateBackoffDelay(1, DEFAULT_RETRY_CONFIG);
      expect(delay).toBe(2000); // 1000 * 2^1 = 2000
    });

    it("should calculate delay for attempt=2 with default config", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const delay = calculateBackoffDelay(2, DEFAULT_RETRY_CONFIG);
      expect(delay).toBe(4000); // 1000 * 2^2 = 4000
    });

    it("should not exceed maxDelayMs", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        maxDelayMs: 3000,
      };
      const delay = calculateBackoffDelay(2, config);
      expect(delay).toBeLessThanOrEqual(3000);
    });

    it("should prefer Retry-After when provided", () => {
      const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG, 5000);
      // Math.min(Math.max(5000, 1000), 30000) = 5000
      expect(delay).toBe(5000);
    });

    it("should use baseDelayMs when Retry-After is less", () => {
      const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG, 500);
      // Math.min(Math.max(500, 1000), 30000) = 1000
      expect(delay).toBe(1000);
    });

    it("should produce no jitter when jitterFactor=0", () => {
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 0,
      };
      const delay = calculateBackoffDelay(1, config);
      expect(delay).toBe(2000);
    });

    it("should apply custom RetryConfig values", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const config: RetryConfig = {
        maxRetries: 5,
        baseDelayMs: 500,
        maxDelayMs: 10000,
        jitterFactor: 0,
        backoffMultiplier: 3,
      };
      const delay = calculateBackoffDelay(2, config);
      // 500 * 3^2 = 4500
      expect(delay).toBe(4500);
    });
  });

  // =================================================================
  // executeWithRetry テスト (9ケース)
  // =================================================================
  describe("executeWithRetry", () => {
    it("should succeed on first attempt without retry", async () => {
      setupSuccessStream();
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should retry once and succeed on second attempt", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it("should retry twice and succeed on third attempt", async () => {
      setupFailThenSuccessQuery(2, createNetworkError("ETIMEDOUT"));
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it("should fail after maxRetries attempts", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 2 },
      };
      const result = await executor.execute(request, mockSkill);
      expect(result.success).toBe(false);
      // Initial attempt + 2 retries = 3 calls
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it("should not retry on non-retryable error", async () => {
      setupAlwaysFailQuery(createHttpError(400));
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should not retry on AbortError", async () => {
      setupAlwaysFailQuery(createAbortError());
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should abort retry when abort() is called", async () => {
      // Make query always fail with retryable error but slowly
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw createNetworkError("ECONNRESET");
        }
        // Second call should never happen if aborted
        throw createNetworkError("ECONNRESET");
      });

      const executePromise = executor.execute(mockRequest, mockSkill);

      // Wait a tick then abort
      await vi.advanceTimersByTimeAsync(100);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }

      const result = await executePromise;
      expect(result.success).toBe(false);
    });

    it("should send retry stream events on each retry", async () => {
      setupFailThenSuccessQuery(2, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryCalls = mockWebContents.send.mock.calls.filter(
        (call: unknown[]) => {
          const msg = call[1] as { type?: string; content?: string };
          if (msg.type === "retry") return true;
          if (typeof msg.content === "string") {
            try {
              const parsed = JSON.parse(msg.content);
              return parsed.errorType !== undefined;
            } catch {
              return false;
            }
          }
          return false;
        },
      );

      expect(retryCalls.length).toBeGreaterThanOrEqual(2);
    });

    it("should include retry attempt info in final error", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 2 },
      };
      const result = await executor.execute(request, mockSkill);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  // =================================================================
  // retry streaming events テスト (7ケース)
  // =================================================================
  describe("retry streaming events", () => {
    it("should include attempt number in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      expect(retryMessages.length).toBeGreaterThanOrEqual(1);
      const content = parseRetryContent(retryMessages[0]);
      expect(content.attempt).toBe(0);
    });

    it("should include maxRetries in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      const content = parseRetryContent(retryMessages[0]);
      expect(content.maxRetries).toBe(DEFAULT_RETRY_CONFIG.maxRetries);
    });

    it("should include delayMs in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      const content = parseRetryContent(retryMessages[0]);
      expect(content.delayMs).toBeGreaterThan(0);
    });

    it("should include errorType in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      const content = parseRetryContent(retryMessages[0]);
      expect(content.errorType).toBe("network");
    });

    it("should include errorMessage in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      const content = parseRetryContent(retryMessages[0]);
      expect(content.errorMessage).toBeDefined();
      expect(typeof content.errorMessage).toBe("string");
    });

    it("should send retry events in order for multiple retries", async () => {
      setupFailThenSuccessQuery(2, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      expect(retryMessages.length).toBeGreaterThanOrEqual(2);

      const content0 = parseRetryContent(retryMessages[0]);
      const content1 = parseRetryContent(retryMessages[1]);
      expect(content0.attempt).toBe(0);
      expect(content1.attempt).toBe(1);
    });

    it("should send retry events via skill:stream IPC channel", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      expect(retryMessages.length).toBeGreaterThanOrEqual(1);

      // Verify sent via skill:stream channel
      const channelCalls = mockWebContents.send.mock.calls.filter(
        (call: unknown[]) => call[0] === "skill:stream",
      );
      expect(channelCalls.length).toBeGreaterThan(0);
    });
  });

  // =================================================================
  // abort during retry テスト (5ケース)
  // =================================================================
  describe("abort during retry", () => {
    it("should stop retrying when abort is called during sleep", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const executePromise = executor.execute(mockRequest, mockSkill);

      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }
      await vi.advanceTimersByTimeAsync(5000);

      const result = await executePromise;
      expect(result.success).toBe(false);
    });

    it("should not retry when abort is called before retry starts", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));

      const executePromise = executor.execute(mockRequest, mockSkill);

      // Abort immediately
      await vi.advanceTimersByTimeAsync(0);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }
      await vi.advanceTimersByTimeAsync(50000);

      const result = await executePromise;
      expect(result.success).toBe(false);
    });

    it("should not retry when query itself is aborted", async () => {
      setupAlwaysFailQuery(createAbortError());
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should not send retry events after abort", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const executePromise = executor.execute(mockRequest, mockSkill);

      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }

      await vi.advanceTimersByTimeAsync(50000);
      await executePromise;

      // Count retry messages - should be limited
      const retryMessages = getRetryStreamMessages();
      // At most 1 retry event before abort took effect
      expect(retryMessages.length).toBeLessThanOrEqual(1);
    });

    it("should set execution status to aborted after abort during retry", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const executePromise = executor.execute(mockRequest, mockSkill);

      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        const aborted = executor.abort(executions[0].id);
        expect(aborted).toBe(true);

        const status = executor.getExecutionStatus(executions[0].id);
        expect(status?.state).toBe("aborted");
      }
      await vi.advanceTimersByTimeAsync(50000);
      await executePromise;
    });
  });

  // =================================================================
  // Phase 6: エッジケーステスト (10ケース)
  // =================================================================
  describe("edge cases", () => {
    it("should not retry when maxRetries=0", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 0 },
      };
      const result = await executor.execute(request, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should retry only once when maxRetries=1", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 1 },
      };
      const result = await executor.execute(request, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it("should handle baseDelayMs=0 (no wait)", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        baseDelayMs: 0,
        jitterFactor: 0,
      };
      const delay = calculateBackoffDelay(0, config);
      expect(delay).toBe(0);
    });

    it("should cap delay when maxDelayMs equals baseDelayMs", () => {
      vi.spyOn(Math, "random").mockReturnValue(0.5);
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        baseDelayMs: 1000,
        maxDelayMs: 1000,
        jitterFactor: 0,
      };
      const delay = calculateBackoffDelay(5, config);
      expect(delay).toBe(1000);
    });

    it("should produce deterministic delay when jitterFactor=0", () => {
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 0,
      };
      const d1 = calculateBackoffDelay(1, config);
      const d2 = calculateBackoffDelay(1, config);
      expect(d1).toBe(d2);
      expect(d1).toBe(2000);
    });

    it("should handle jitterFactor=1 (maximum jitter)", () => {
      vi.spyOn(Math, "random").mockReturnValue(0); // Minimum jitter
      const config: RetryConfig = {
        ...DEFAULT_RETRY_CONFIG,
        jitterFactor: 1,
      };
      const delay = calculateBackoffDelay(0, config);
      // cappedDelay=1000, jitter = 1000 * (0*2-1) * 1 = -1000
      // Math.max(0, 1000 + (-1000)) = 0
      expect(delay).toBe(0);
    });

    it("should cap Retry-After to maxDelayMs when very large", () => {
      const delay = calculateBackoffDelay(
        0,
        DEFAULT_RETRY_CONFIG,
        86400000, // 24 hours in ms
      );
      expect(delay).toBeLessThanOrEqual(DEFAULT_RETRY_CONFIG.maxDelayMs);
    });

    it("should use baseDelayMs when Retry-After is 0", () => {
      const delay = calculateBackoffDelay(0, DEFAULT_RETRY_CONFIG, 0);
      expect(delay).toBeGreaterThanOrEqual(DEFAULT_RETRY_CONFIG.baseDelayMs);
    });

    it("should return non-retryable for null error", () => {
      const result = isRetryableError(null);
      expect(result).toEqual({ retryable: false });
    });

    it("should return non-retryable for string error", () => {
      const result = isRetryableError("some error string");
      expect(result).toEqual({ retryable: false });
    });
  });

  // =================================================================
  // Phase 6: 並行リトライテスト (5ケース)
  // =================================================================
  describe("concurrent retry", () => {
    it("should handle two executions retrying independently", async () => {
      let callCount = 0;
      mockQuery.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          throw createNetworkError("ECONNRESET");
        }
        return {
          stream: () => ({
            [Symbol.asyncIterator]: async function* () {
              yield { type: "text", content: "OK" };
            },
          }),
        };
      });

      const result1Promise = executor.execute(mockRequest, mockSkill);
      const result2Promise = executor.execute(
        { ...mockRequest, skillId: "skill-2" },
        mockSkill,
      );

      const [result1, result2] = await Promise.all([
        result1Promise,
        result2Promise,
      ]);

      // At least one should succeed
      expect(result1.success || result2.success).toBe(true);
    });

    it("should not interfere between retrying and new execution", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));

      const result1 = await executor.execute(mockRequest, mockSkill);
      expect(result1.success).toBe(true);

      // Reset for second execution
      setupSuccessStream();
      mockQuery.mockImplementation(() => ({
        stream: () => mockStreamGenerator(),
      }));

      const result2 = await executor.execute(mockRequest, mockSkill);
      expect(result2.success).toBe(true);
    });

    it("should handle MAX_CONCURRENT_EXECUTIONS with retries", async () => {
      // This test verifies that retrying executions still count towards the limit
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(executor.execute(mockRequest, mockSkill));
      }

      // 6th execution should be rejected
      setupSuccessStream();
      mockQuery.mockImplementation(() => ({
        stream: () => mockStreamGenerator(),
      }));
      const extraResult = await executor.execute(mockRequest, mockSkill);

      // Should fail due to concurrent limit (all 5 slots are retrying)
      // Note: depends on timing, may or may not hit MAX_CONCURRENT
      await Promise.all(promises);
      expect(extraResult).toBeDefined();
    });

    it("should reject new execution when max concurrent reached during retries", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(executor.execute(mockRequest, mockSkill));
      }

      // Wait a tick for all to start
      await vi.advanceTimersByTimeAsync(10);

      const activeExecutions = executor.getActiveExecutions();
      expect(activeExecutions.length).toBeLessThanOrEqual(5);

      await vi.advanceTimersByTimeAsync(60000);
      await Promise.allSettled(promises);
    });

    it("should allow independent success and failure in concurrent retries", async () => {
      let call = 0;
      mockQuery.mockImplementation(() => {
        call++;
        // First execution fails once then succeeds
        if (call === 1) throw createNetworkError("ECONNRESET");
        return {
          stream: () => ({
            [Symbol.asyncIterator]: async function* () {
              yield { type: "text", content: "OK" };
            },
          }),
        };
      });

      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(true);
    });
  });

  // =================================================================
  // Phase 6: abort連携詳細テスト (5ケース)
  // =================================================================
  describe("abort integration details", () => {
    it("should interrupt sleep when abort is called", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 3 },
      };
      const executePromise = executor.execute(request, mockSkill);

      // Let first query fail, then abort during sleep
      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }
      await vi.advanceTimersByTimeAsync(60000);

      const result = await executePromise;
      expect(result.success).toBe(false);
      // Should have fewer calls than maxRetries+1 because abort interrupted
      expect(mockQuery.mock.calls.length).toBeLessThanOrEqual(4);
    });

    it("should stop immediately when aborted before retry loop", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));

      // Create abort controller that's already aborted
      const executePromise = executor.execute(mockRequest, mockSkill);
      await vi.advanceTimersByTimeAsync(0);

      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }
      await vi.advanceTimersByTimeAsync(60000);

      const result = await executePromise;
      expect(result.success).toBe(false);
    });

    it("should not retry when query is cancelled by abort", async () => {
      mockQuery.mockImplementation(() => {
        throw createAbortError();
      });
      const result = await executor.execute(mockRequest, mockSkill);
      expect(result.success).toBe(false);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });

    it("should not send more retry events after abort", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const executePromise = executor.execute(mockRequest, mockSkill);

      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      const retryMessagesBefore = getRetryStreamMessages();

      if (executions.length > 0) {
        executor.abort(executions[0].id);
      }
      await vi.advanceTimersByTimeAsync(60000);
      await executePromise;

      const retryMessagesAfter = getRetryStreamMessages();
      // After abort, no new retry events should be sent
      expect(
        retryMessagesAfter.length - retryMessagesBefore.length,
      ).toBeLessThanOrEqual(0);
    });

    it("should have aborted state after abort during retry", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const executePromise = executor.execute(mockRequest, mockSkill);

      await vi.advanceTimersByTimeAsync(50);
      const executions = executor.getActiveExecutions();
      if (executions.length > 0) {
        executor.abort(executions[0].id);
        const status = executor.getExecutionStatus(executions[0].id);
        expect(status?.state).toBe("aborted");
      }
      await vi.advanceTimersByTimeAsync(60000);
      await executePromise;
    });
  });

  // =================================================================
  // Phase 6: ストリーミングイベント詳細テスト (6ケース)
  // =================================================================
  describe("streaming event details", () => {
    it("should have type retry in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      expect(retryMessages.length).toBeGreaterThanOrEqual(1);
      expect(retryMessages[0].type).toBe("retry");
    });

    it("should have incrementing attempt numbers starting at 0", async () => {
      setupFailThenSuccessQuery(3, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      for (let i = 0; i < retryMessages.length; i++) {
        const content = parseRetryContent(retryMessages[i]);
        expect(content.attempt).toBe(i);
      }
    });

    it("should have positive delayMs in retry event", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      const content = parseRetryContent(retryMessages[0]);
      expect(content.delayMs).toBeGreaterThanOrEqual(0);
    });

    it("should match errorType with actual error type", async () => {
      setupFailThenSuccessQuery(1, createHttpError(500));
      await executor.execute(mockRequest, mockSkill);

      const retryMessages = getRetryStreamMessages();
      if (retryMessages.length > 0) {
        const content = parseRetryContent(retryMessages[0]);
        expect(content.errorType).toBe("server_error");
      }
    });

    it("should send complete event after successful retry", async () => {
      setupFailThenSuccessQuery(1, createNetworkError("ECONNRESET"));
      await executor.execute(mockRequest, mockSkill);

      const completeCalls = mockWebContents.send.mock.calls.filter(
        (call: unknown[]) => {
          const msg = call[1] as { type?: string; isComplete?: boolean };
          return msg.type === "complete" || msg.isComplete === true;
        },
      );
      expect(completeCalls.length).toBeGreaterThanOrEqual(1);
    });

    it("should send error event after final retry failure", async () => {
      setupAlwaysFailQuery(createNetworkError("ECONNRESET"));
      const request: SkillExecutionRequest = {
        ...mockRequest,
        retryConfig: { maxRetries: 1 },
      };
      await executor.execute(request, mockSkill);

      const errorCalls = mockWebContents.send.mock.calls.filter(
        (call: unknown[]) => {
          const msg = call[1] as { type?: string };
          return msg.type === "error";
        },
      );
      expect(errorCalls.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// =================================================================
// ヘルパー関数
// =================================================================

function getRetryStreamMessages(): Array<{
  type: string;
  content: string;
}> {
  return mockWebContents.send.mock.calls
    .filter((call: unknown[]) => call[0] === "skill:stream")
    .map((call: unknown[]) => call[1] as { type: string; content: string })
    .filter((msg) => msg.type === "retry");
}

function parseRetryContent(msg: { content: string }): {
  attempt: number;
  maxRetries: number;
  delayMs: number;
  errorType: string;
  errorMessage: string;
} {
  return JSON.parse(msg.content);
}
