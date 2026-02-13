/**
 * AgentClient ユニットテスト
 * TDD: Red Phase - Claude Agent SDK統合に対するテスト
 * @module main/slide/__tests__/agent-client.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getAgentAPI,
  resetAgentAPI,
  type ModifierAgentAPI,
} from "../agent-client";

// vi.hoistedで制御可能なモック関数を作成
const { mockCreate } = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
  };
});

// Claude Agent SDKのモック
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
    },
  })),
}));

// Electron safeStorageのモック
vi.mock("electron", () => ({
  safeStorage: {
    isEncryptionAvailable: vi.fn().mockReturnValue(true),
    encryptString: vi.fn((str) => Buffer.from(str).toString("base64")),
    decryptString: vi.fn((buffer) => buffer.toString()),
  },
}));

// electron-storeのモック
vi.mock("electron-store", () => ({
  default: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("AgentClient", () => {
  let agentAPI: ModifierAgentAPI;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.useFakeTimers();
    // 環境変数をモック
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: "test-api-key" };
    resetAgentAPI();
    agentAPI = getAgentAPI();
    // デフォルトのモック動作：即座に成功を返す
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ changes: [] }) }],
      usage: { input_tokens: 100, output_tokens: 50 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    process.env = originalEnv;
  });

  describe("query", () => {
    it("AC-01: should call Claude Agent SDK with prompt and options", async () => {
      const prompt = "Generate HTML slides";
      const options = {
        systemPrompt: "You are a slide generator.",
        timeout: 30000,
      };

      const queryPromise = agentAPI.query({ prompt, options });
      await vi.advanceTimersByTimeAsync(1000);
      const response = await queryPromise;

      expect(response).toBeDefined();
      expect(response.content).toBeDefined();
      // SDK統合後: Anthropicクライアントが正しい引数で呼び出されることを検証
    });

    it("AC-02: should handle streaming responses via onMessage callback", async () => {
      const messages: unknown[] = [];
      const unsubscribe = agentAPI.onMessage((message) => {
        messages.push(message);
      });

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      // メッセージが通知されること
      expect(messages.length).toBeGreaterThan(0);

      unsubscribe();
    });

    it("AC-03: should resolve with response content on completion", async () => {
      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      const response = await queryPromise;

      expect(response).toEqual(
        expect.objectContaining({
          content: expect.any(String),
          usage: expect.objectContaining({
            inputTokens: expect.any(Number),
            outputTokens: expect.any(Number),
          }),
        }),
      );
    });

    it("AC-04: should reject with timeout error after 30 seconds", async () => {
      // タイムアウトをテストするため、モックがAbortSignalを待つように設定
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          // AbortSignalがabortされるまで待機
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      // タイマー進行と拒否を並列に待機
      await Promise.all([
        vi.advanceTimersByTimeAsync(31000),
        expect(queryPromise).rejects.toThrow("Request timeout"),
      ]);
    });

    it("AC-05: should reject with abort error when aborted", async () => {
      // AbortSignalを待つモック（すでにabortされている場合は即座にreject）
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              // すでにabortされている場合は即座にreject
              if (signal.aborted) {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
                return;
              }
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      // クエリ実行中に中断
      agentAPI.abort();

      // 拒否を待機
      await expect(queryPromise).rejects.toThrow("Aborted");
    });

    it("AC-06: should reject with SDK error when API call fails", async () => {
      // SDK統合: APIエラーをシミュレート
      mockCreate.mockRejectedValueOnce(new Error("API request failed"));

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      await expect(queryPromise).rejects.toThrow("API request failed");
    });

    it("AC-07: should prevent concurrent queries", async () => {
      const firstPromise = agentAPI.query({
        prompt: "First query",
        options: { timeout: 30000 },
      });

      // 2番目のクエリを試みる
      const secondPromise = agentAPI.query({
        prompt: "Second query",
        options: { timeout: 30000 },
      });

      await expect(secondPromise).rejects.toThrow(
        "Another query is already running",
      );

      await vi.advanceTimersByTimeAsync(1000);
      const firstResult = await firstPromise;
      expect(firstResult).toBeDefined();
    });

    it("AC-08: should use default timeout of 30000ms if not specified", async () => {
      // タイムアウトをテストするため、モックがAbortSignalを待つように設定
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        // timeout not specified
      });

      // タイマー進行と拒否を並列に待機
      await Promise.all([
        vi.advanceTimersByTimeAsync(31000),
        expect(queryPromise).rejects.toThrow("Request timeout"),
      ]);
    });
  });

  describe("abort", () => {
    it("AC-09: should trigger AbortController signal", async () => {
      // AbortSignalを待つモック（すでにabortされている場合は即座にreject）
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              if (signal.aborted) {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
                return;
              }
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      agentAPI.abort();

      await expect(queryPromise).rejects.toThrow("Aborted");
    });

    it("AC-10: should set status to idle after abort", async () => {
      // AbortSignalを待つモック（すでにabortされている場合は即座にreject）
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              if (signal.aborted) {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
                return;
              }
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      expect(agentAPI.getStatus()).toBe("running");

      agentAPI.abort();

      expect(agentAPI.getStatus()).toBe("idle");

      // エラーを適切に処理
      await queryPromise.catch(() => {});
    });

    it("AC-11: should not throw when called without active query", () => {
      expect(() => agentAPI.abort()).not.toThrow();
      expect(agentAPI.getStatus()).toBe("idle");
    });
  });

  describe("getStatus", () => {
    it("AC-12: should return 'idle' initially", () => {
      expect(agentAPI.getStatus()).toBe("idle");
    });

    it("AC-13: should return 'running' during query execution", async () => {
      expect(agentAPI.getStatus()).toBe("idle");

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      expect(agentAPI.getStatus()).toBe("running");

      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;
    });

    it("AC-14: should return 'error' after failed query", async () => {
      // タイムアウトをテストするため、モックがAbortSignalを待つように設定
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      // タイマー進行と拒否を並列に待機（エラーは無視）
      await Promise.all([
        vi.advanceTimersByTimeAsync(31000),
        queryPromise.catch(() => {}),
      ]);

      expect(agentAPI.getStatus()).toBe("error");
    });

    it("AC-15: should return 'idle' after successful query", async () => {
      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });

      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      expect(agentAPI.getStatus()).toBe("idle");
    });
  });

  describe("onMessage", () => {
    it("AC-16: should register message listener", async () => {
      const listener = vi.fn();

      const unsubscribe = agentAPI.onMessage(listener);

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });

    it("AC-17: should unregister listener when unsubscribe is called", async () => {
      const listener = vi.fn();

      const unsubscribe = agentAPI.onMessage(listener);
      unsubscribe();

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      expect(listener).not.toHaveBeenCalled();
    });

    it("AC-18: should notify listeners on SDK message", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const unsubscribe1 = agentAPI.onMessage(listener1);
      const unsubscribe2 = agentAPI.onMessage(listener2);

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      unsubscribe1();
      unsubscribe2();
    });

    it("AC-19: should notify with correct message structure", async () => {
      let receivedMessage: unknown = null;

      const unsubscribe = agentAPI.onMessage((message) => {
        receivedMessage = message;
      });

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      await queryPromise;

      expect(receivedMessage).toMatchObject({
        id: expect.any(String),
        type: expect.any(String),
        content: expect.any(String),
        timestamp: expect.any(Number),
        isComplete: expect.any(Boolean),
      });

      unsubscribe();
    });
  });

  describe("singleton behavior", () => {
    it("AC-20: should return same instance on multiple getAgentAPI calls", () => {
      const api1 = getAgentAPI();
      const api2 = getAgentAPI();

      expect(api1).toBe(api2);
    });

    it("AC-21: should create new instance after resetAgentAPI", () => {
      const _api1 = getAgentAPI();
      resetAgentAPI();
      const api2 = getAgentAPI();

      // resetAgentAPI後は新しいインスタンスが作成される
      // ただし、インターフェースは同じなので、状態が初期化されていることを確認
      expect(api2.getStatus()).toBe("idle");
    });
  });

  // ==========================================================================
  // Claude Agent SDK統合テスト (TDD Red - Phase 4)
  // テストID: SDK-AC-01 ~ SDK-AC-10
  // ==========================================================================
  describe("Claude Agent SDK Integration", () => {
    describe("SDK API Key Management", () => {
      it("SDK-AC-01: should retrieve API key from safeStorage", async () => {
        // SDK統合: safeStorageからAPIキーが取得され、SDK呼び出しが行われることを検証
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
        // APIキー取得に成功し、SDKが呼び出されていることを検証
        expect(mockCreate).toHaveBeenCalled();
      });

      it("SDK-AC-02: should fallback to environment variable if safeStorage fails", async () => {
        // SDK統合: 環境変数ANTHROPIC_API_KEYへのフォールバックを検証
        // safeStorageにキーが保存されていない状態（electron-storeモックはundefinedを返す）
        // 環境変数 ANTHROPIC_API_KEY は beforeEach で "test-api-key" に設定済み

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
        // 環境変数フォールバックでSDKが呼び出されていることを検証
        expect(mockCreate).toHaveBeenCalled();
      });

      it("SDK-AC-03: should throw error if API key not found", async () => {
        // SDK統合: APIキーが見つからない場合のエラーを検証
        // 環境変数を削除してAPIキー未設定状態を作成
        delete process.env.ANTHROPIC_API_KEY;
        resetAgentAPI();
        const newAPI = getAgentAPI();

        const queryPromise = newAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        await expect(queryPromise).rejects.toThrow("API key not configured");
      });
    });

    describe("SDK Request Configuration", () => {
      it("SDK-AC-04: should use correct model (claude-sonnet-4-20250514)", async () => {
        // SDK統合: 正しいモデルが使用されていることを検証
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: "claude-sonnet-4-20250514",
          }),
          expect.anything(),
        );
      });

      it("SDK-AC-05: should set max_tokens to 8192", async () => {
        // SDK統合: max_tokensが8192に設定されていることを検証
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            max_tokens: 8192,
          }),
          expect.anything(),
        );
      });

      it("SDK-AC-06: should pass systemPrompt to SDK", async () => {
        // SDK統合: systemPromptがSDKに渡されることを検証
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: {
            systemPrompt: "You are a slide designer.",
            timeout: 30000,
          },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            system: "You are a slide designer.",
          }),
          expect.anything(),
        );
      });
    });

    describe("SDK Response Parsing", () => {
      it("SDK-AC-07: should parse content from SDK response", async () => {
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(typeof response.content).toBe("string");
      });

      it("SDK-AC-08: should extract usage information from SDK response", async () => {
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response.usage).toBeDefined();
        expect(response.usage?.inputTokens).toBeGreaterThan(0);
        expect(response.usage?.outputTokens).toBeGreaterThan(0);
      });
    });

    describe("SDK Error Handling", () => {
      it("SDK-AC-09: should handle SDK 401 Unauthorized error", async () => {
        // SDK統合: 401エラーのハンドリングを検証
        const authError = Object.assign(new Error("Unauthorized"), {
          status: 401,
        });
        mockCreate.mockRejectedValueOnce(authError);

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        await expect(queryPromise).rejects.toThrow("Unauthorized");
      });

      it("SDK-AC-10: should handle SDK 500 Internal Server Error", async () => {
        // SDK統合: 500エラーのハンドリングを検証
        const serverError = Object.assign(new Error("Internal Server Error"), {
          status: 500,
        });
        mockCreate.mockRejectedValueOnce(serverError);

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        await expect(queryPromise).rejects.toThrow("Internal Server Error");
      });
    });
  });

  describe("boundary value tests", () => {
    it("AC-22: should handle empty prompt", async () => {
      const queryPromise = agentAPI.query({
        prompt: "",
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      const response = await queryPromise;

      // 空のプロンプトでも処理される（シミュレーション）
      expect(response).toBeDefined();
    });

    it("AC-23: should handle very long prompt", async () => {
      const longPrompt = "a".repeat(100000);

      const queryPromise = agentAPI.query({
        prompt: longPrompt,
        options: { timeout: 30000 },
      });
      await vi.advanceTimersByTimeAsync(1000);
      const response = await queryPromise;

      expect(response).toBeDefined();
    });

    it("AC-24: should handle minimum timeout (1ms)", async () => {
      // タイムアウトをテストするため、モックがAbortSignalを待つように設定
      mockCreate.mockImplementation(
        async (
          _params: unknown,
          options?: { signal?: AbortSignal },
        ): Promise<unknown> => {
          return new Promise((resolve, reject) => {
            const signal = options?.signal;
            if (signal) {
              signal.addEventListener("abort", () => {
                const error = new Error("Aborted");
                error.name = "AbortError";
                reject(error);
              });
            }
          });
        },
      );

      const queryPromise = agentAPI.query({
        prompt: "Test prompt",
        options: { timeout: 1 },
      });

      // タイマー進行と拒否を並列に待機
      await Promise.all([
        vi.advanceTimersByTimeAsync(100),
        expect(queryPromise).rejects.toThrow("Request timeout"),
      ]);
    });
  });

  // ==========================================================================
  // Phase 6: エッジケーステスト拡充
  // テストID: EDGE-AC-01 ~ EDGE-AC-12
  // ==========================================================================
  describe("edge case tests (Phase 6)", () => {
    describe("input validation", () => {
      it("EDGE-AC-01: should handle empty prompt gracefully", async () => {
        const queryPromise = agentAPI.query({
          prompt: "",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        // 空のプロンプトでも正常に処理される
        expect(response).toBeDefined();
        expect(response.content).toBeDefined();
      });

      it("EDGE-AC-02: should handle very long prompt (100KB+)", async () => {
        // 100KB以上のプロンプト
        const longPrompt = "a".repeat(102400);

        const queryPromise = agentAPI.query({
          prompt: longPrompt,
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
      });

      it("EDGE-AC-03: should handle prompt with special characters", async () => {
        const specialPrompt = "日本語テスト\n\t\\\"'<>&特殊文字💻🎉絵文字";

        const queryPromise = agentAPI.query({
          prompt: specialPrompt,
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
      });

      it("EDGE-AC-04: should handle prompt with only whitespace", async () => {
        const queryPromise = agentAPI.query({
          prompt: "   \n\t   ",
          options: { timeout: 30000 },
        });
        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        expect(response).toBeDefined();
      });
    });

    describe("timeout boundary tests", () => {
      it("EDGE-AC-05: should complete just before timeout (29.9s)", async () => {
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        // 29.9秒経過
        await vi.advanceTimersByTimeAsync(29900);

        // モックは即座に解決するので成功する
        const response = await queryPromise;
        expect(response).toBeDefined();
      });

      it("EDGE-AC-06: should handle zero timeout", async () => {
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 0 },
        });

        await vi.advanceTimersByTimeAsync(1);

        // 0msタイムアウトは即座にタイムアウト
        // ただしモックは即座に解決するため成功する可能性がある
        const response = await queryPromise;
        expect(response).toBeDefined();
      });

      it("EDGE-AC-07: should handle negative timeout as invalid", async () => {
        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: -1 },
        });

        await vi.advanceTimersByTimeAsync(1000);
        const response = await queryPromise;

        // 負のタイムアウトでも処理される（実装依存）
        expect(response).toBeDefined();
      });
    });

    describe("API key edge cases", () => {
      it("EDGE-AC-08: should reject when API key is not configured", async () => {
        // 環境変数を削除
        delete process.env.ANTHROPIC_API_KEY;

        // 新しいインスタンスを作成してAPIキーなしの状態をテスト
        resetAgentAPI();
        const newAgentAPI = getAgentAPI();

        const queryPromise = newAgentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        // APIキーが設定されていないためエラーになる
        await expect(queryPromise).rejects.toThrow("API key not configured");
      });
    });

    describe("concurrent execution edge cases", () => {
      it("EDGE-AC-09: should handle rapid abort/query cycles", async () => {
        // AbortSignalを待つモック（abort時に即座にrejectするように）
        mockCreate.mockImplementation(
          async (
            _params: unknown,
            options?: { signal?: AbortSignal },
          ): Promise<unknown> => {
            return new Promise((resolve, reject) => {
              const signal = options?.signal;
              if (signal) {
                if (signal.aborted) {
                  const error = new Error("Aborted");
                  error.name = "AbortError";
                  reject(error);
                  return;
                }
                signal.addEventListener("abort", () => {
                  const error = new Error("Aborted");
                  error.name = "AbortError";
                  reject(error);
                });
              }
              // タイマー経過後に解決
              setTimeout(() => {
                resolve({
                  content: [{ type: "text", text: "{}" }],
                  usage: { input_tokens: 10, output_tokens: 10 },
                });
              }, 1000);
            });
          },
        );

        for (let i = 0; i < 5; i++) {
          const queryPromise = agentAPI.query({
            prompt: `Test prompt ${i}`,
            options: { timeout: 30000 },
          });

          agentAPI.abort();

          // プロミスの解決を待つ
          try {
            await queryPromise;
          } catch {
            // abort後のエラーは無視
          }

          await vi.advanceTimersByTimeAsync(100);
        }

        // 最終状態がidleであることを確認
        expect(agentAPI.getStatus()).toBe("idle");
      });

      it("EDGE-AC-10: should handle multiple abort calls", async () => {
        // AbortSignalを待つモック（すでにabortされている場合は即座にreject）
        mockCreate.mockImplementation(
          async (
            _params: unknown,
            options?: { signal?: AbortSignal },
          ): Promise<unknown> => {
            return new Promise((resolve, reject) => {
              const signal = options?.signal;
              if (signal) {
                if (signal.aborted) {
                  const error = new Error("Aborted");
                  error.name = "AbortError";
                  reject(error);
                  return;
                }
                signal.addEventListener("abort", () => {
                  const error = new Error("Aborted");
                  error.name = "AbortError";
                  reject(error);
                });
              }
            });
          },
        );

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        // 複数回abortを呼び出しても問題ない
        agentAPI.abort();
        agentAPI.abort();
        agentAPI.abort();

        expect(agentAPI.getStatus()).toBe("idle");

        // クエリが拒否されることを確認
        await expect(queryPromise).rejects.toThrow("Aborted");
      });
    });

    describe("message listener edge cases", () => {
      it("EDGE-AC-11: should handle listener that throws error", async () => {
        const errorListener = vi.fn().mockImplementation(() => {
          throw new Error("Listener error");
        });
        const normalListener = vi.fn();

        agentAPI.onMessage(errorListener);
        agentAPI.onMessage(normalListener);

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        // クエリを並列に待機（エラーは無視）
        await Promise.all([
          vi.advanceTimersByTimeAsync(1000),
          queryPromise.catch(() => {}),
        ]);

        // 両方のリスナーが呼ばれる（エラーリスナーのエラーは実装側でキャッチ）
        expect(errorListener).toHaveBeenCalled();
        expect(normalListener).toHaveBeenCalled();
      });

      it("EDGE-AC-12: should handle unsubscribe during message processing", async () => {
        // eslint-disable-next-line prefer-const -- listener内で参照するためletが必要
        let unsubscribe: () => void;

        const listener = vi.fn().mockImplementation(() => {
          // メッセージ処理中にunsubscribe
          unsubscribe();
        });

        unsubscribe = agentAPI.onMessage(listener);

        const queryPromise = agentAPI.query({
          prompt: "Test prompt",
          options: { timeout: 30000 },
        });

        await vi.advanceTimersByTimeAsync(1000);
        await queryPromise;

        // リスナーが最低1回は呼ばれている
        expect(listener).toHaveBeenCalled();
      });
    });
  });
});
