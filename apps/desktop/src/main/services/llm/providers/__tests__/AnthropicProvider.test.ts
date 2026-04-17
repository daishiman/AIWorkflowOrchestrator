import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnthropicProvider } from "../AnthropicProvider";

const { mockMessagesCreate, mockAnthropicCtor } = vi.hoisted(() => {
  const create = vi.fn();
  const ctor = vi.fn().mockImplementation(() => ({
    messages: {
      create,
    },
  }));

  return {
    mockMessagesCreate: create,
    mockAnthropicCtor: ctor,
  };
});

vi.mock("@anthropic-ai/sdk", () => ({
  default: mockAnthropicCtor,
  APIError: class APIError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("AnthropicProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("constructs Anthropic client with retries disabled and timeout set", async () => {
    mockMessagesCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "ok" }],
    });

    const provider = new AnthropicProvider({
      apiKey: "sk-ant-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 12_345,
    });

    const result = await provider.call("prompt");

    expect(result).toEqual({ success: true, content: "ok" });
    expect(mockAnthropicCtor).toHaveBeenCalledWith({
      apiKey: "sk-ant-valid-key",
      maxRetries: 0,
      timeout: 12_345,
    });
  });

  it.each([
    [401, "API_KEY_INVALID"],
    [403, "API_KEY_INVALID"],
    [429, "RATE_LIMIT"],
    [500, "SERVER_ERROR"],
    [502, "SERVER_ERROR"],
    [503, "SERVER_ERROR"],
    [529, "SERVER_ERROR"],
  ] as const)("maps HTTP %i to %s", async (status, errorCode) => {
    const { APIError } = await import("@anthropic-ai/sdk");
    mockMessagesCreate.mockRejectedValueOnce(
      new APIError(status, "Sensitive token sk-ant-secret-value"),
    );

    const provider = new AnthropicProvider({
      apiKey: "sk-ant-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
    });

    const result = await provider.call("prompt");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errorCode).toBe(errorCode);
    }
  });

  it("maps APIConnectionTimeoutError-style errors to TIMEOUT", async () => {
    const timeoutError = new Error("request timed out");
    timeoutError.name = "APIConnectionTimeoutError";
    mockMessagesCreate.mockRejectedValueOnce(timeoutError);

    const provider = new AnthropicProvider({
      apiKey: "sk-ant-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
    });

    const result = await provider.call("prompt");

    expect(result).toEqual({
      success: false,
      errorCode: "TIMEOUT",
      message: "タイムアウトしました。再試行してください。",
    });
  });

  it("maps network-like errors to NETWORK_ERROR", async () => {
    const networkError = new Error("fetch failed");
    networkError.name = "APIConnectionError";
    mockMessagesCreate.mockRejectedValueOnce(networkError);

    const provider = new AnthropicProvider({
      apiKey: "sk-ant-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
    });

    const result = await provider.call("prompt");

    expect(result).toEqual({
      success: false,
      errorCode: "NETWORK_ERROR",
      message: "ネットワークエラーが発生しました。接続を確認してください。",
    });
  });

  it("returns INTERNAL_ERROR for unexpected failures", async () => {
    mockMessagesCreate.mockRejectedValueOnce({ foo: "bar" });

    const provider = new AnthropicProvider({
      apiKey: "sk-ant-valid-key",
      model: "claude-haiku-4-5-20251001",
      timeoutMs: 30_000,
    });

    const result = await provider.call("prompt");

    expect(result).toEqual({
      success: false,
      errorCode: "INTERNAL_ERROR",
      message: "内部エラーが発生しました。",
    });
  });
});
