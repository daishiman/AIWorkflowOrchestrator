/**
 * ipc-utils チャンネル別タイムアウトテスト
 *
 * TASK-FIX-IPC-TIMEOUT-001
 * Phase 4: TDD テストファースト (T-001〜T-012)
 * Phase 6: エッジケース拡張 (T-013〜T-018)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ALLOWED_INVOKE_CHANNELS, IPC_CHANNELS } from "../channels";

// Mock electron module
const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcRenderer: {
    invoke: mockInvoke,
  },
}));

// Import after mocking
import {
  invokeWithTimeout,
  IPC_TIMEOUT_MS,
  getChannelTimeout,
} from "../ipc-utils";

const DEFAULT_TIMEOUT_CHANNEL = IPC_CHANNELS.FILE_GET_TREE;

// ============================================================
// getChannelTimeout ユニットテスト (T-001〜T-008)
// ============================================================
describe("getChannelTimeout", () => {
  // T-001: auth:login は 500ms
  it("T-001: should return 500 for auth:login", () => {
    expect(getChannelTimeout(IPC_CHANNELS.AUTH_LOGIN)).toBe(500);
  });

  // T-002: auth:get-session は 10000ms
  it("T-002: should return 10000 for auth:get-session", () => {
    expect(getChannelTimeout(IPC_CHANNELS.AUTH_GET_SESSION)).toBe(10000);
  });

  // T-003: auth:refresh は 10000ms
  it("T-003: should return 10000 for auth:refresh", () => {
    expect(getChannelTimeout(IPC_CHANNELS.AUTH_REFRESH)).toBe(10000);
  });

  // T-004: skill-creator:plan は 30000ms
  it("T-004: should return 30000 for skill-creator:plan", () => {
    expect(getChannelTimeout(IPC_CHANNELS.SKILL_CREATOR_PLAN)).toBe(30000);
  });

  // T-005: skill:execute は 60000ms
  it("T-005: should return 60000 for skill:execute", () => {
    expect(getChannelTimeout(IPC_CHANNELS.SKILL_EXECUTE)).toBe(60000);
  });

  // T-006: 未定義チャンネルは IPC_TIMEOUT_MS (5000ms) にフォールバック
  it("T-006: should return IPC_TIMEOUT_MS (5000) for unknown:channel", () => {
    expect(getChannelTimeout("unknown:channel")).toBe(5000);
  });

  // T-007: 空文字は IPC_TIMEOUT_MS にフォールバック
  it("T-007: should return IPC_TIMEOUT_MS (5000) for empty string", () => {
    expect(getChannelTimeout("")).toBe(5000);
  });

  // T-008: IPC_TIMEOUT_MS の値が 5000 であること
  it("T-008: IPC_TIMEOUT_MS should be 5000", () => {
    expect(IPC_TIMEOUT_MS).toBe(5000);
  });
});

// ============================================================
// invokeWithTimeout チャンネル別タイムアウト動作テスト (T-009〜T-012)
// ============================================================
describe("invokeWithTimeout channel-specific timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // T-009: skill:execute チャンネルで 60000ms 以内に応答があれば resolve
  it("T-009: should resolve for skill:execute when IPC responds within 60000ms", async () => {
    const expectedResult = { status: "success" };
    mockInvoke.mockResolvedValue(expectedResult);

    const promise = invokeWithTimeout(
      ALLOWED_INVOKE_CHANNELS,
      IPC_CHANNELS.SKILL_EXECUTE,
    );

    const result = await promise;
    expect(result).toEqual(expectedResult);
  });

  // T-010: skill:execute チャンネルで 60000ms を超えると timeout error
  it("T-010: should reject with 60000ms timeout error for skill:execute", async () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const promise = invokeWithTimeout(
      ALLOWED_INVOKE_CHANNELS,
      IPC_CHANNELS.SKILL_EXECUTE,
    );

    vi.advanceTimersByTime(60000);

    await expect(promise).rejects.toThrow(
      "IPC timeout: skill:execute did not respond within 60000ms",
    );
  });

  // T-011: 未定義チャンネルで 5000ms を超えると timeout error
  it("T-011: should reject with 5000ms timeout error for undefined channel in allowed list", async () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    // file:get-tree は CHANNEL_TIMEOUTS に未定義 → IPC_TIMEOUT_MS = 5000 が適用される
    const channel = DEFAULT_TIMEOUT_CHANNEL;
    const promise = invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    await expect(promise).rejects.toThrow(
      `IPC timeout: ${channel} did not respond within ${IPC_TIMEOUT_MS}ms`,
    );
  });

  // T-012: 許可されていないチャンネルは即座に reject
  it("T-012: should reject immediately for channels not in allowedChannels", async () => {
    await expect(
      invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, "not:allowed:channel"),
    ).rejects.toThrow("Channel not:allowed:channel is not allowed");

    expect(mockInvoke).not.toHaveBeenCalled();
  });
});

// ============================================================
// getChannelTimeout エッジケース (T-013〜T-015)
// ============================================================
describe("getChannelTimeout edge cases", () => {
  // T-013: ランダムな未知文字列は IPC_TIMEOUT_MS にフォールバック
  it("T-013: should return IPC_TIMEOUT_MS for any undefined channel string", () => {
    expect(getChannelTimeout("random:channel:xyz")).toBe(IPC_TIMEOUT_MS);
    expect(getChannelTimeout("totally-unknown")).toBe(IPC_TIMEOUT_MS);
  });

  // T-014: CHANNEL_TIMEOUTS の全エントリが正の整数である
  it("T-014: all defined channel timeouts should be positive integers", () => {
    const channels = [
      IPC_CHANNELS.AUTH_LOGIN,
      IPC_CHANNELS.AUTH_GET_SESSION,
      IPC_CHANNELS.AUTH_REFRESH,
      IPC_CHANNELS.SKILL_CREATOR_PLAN,
      IPC_CHANNELS.SKILL_EXECUTE,
    ];
    for (const channel of channels) {
      const timeout = getChannelTimeout(channel);
      expect(timeout).toBeGreaterThan(0);
      expect(Number.isInteger(timeout)).toBe(true);
    }
  });

  // T-015: auth:login が他の auth チャンネルより短いタイムアウト値を持つ
  it("T-015: auth:login timeout should be shorter than auth:get-session timeout", () => {
    expect(getChannelTimeout(IPC_CHANNELS.AUTH_LOGIN)).toBeLessThan(
      getChannelTimeout(IPC_CHANNELS.AUTH_GET_SESSION),
    );
  });
});

// ============================================================
// invokeWithTimeout エッジケース (T-016〜T-018)
// ============================================================
describe("invokeWithTimeout edge cases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // T-016: タイムアウト後に ipcRenderer が応答しても二重 reject しない
  it("T-016: should not double-reject when IPC responds after timeout", async () => {
    let resolveDelayed: ((value: unknown) => void) | undefined;
    mockInvoke.mockReturnValue(
      new Promise((resolve) => {
        resolveDelayed = resolve;
      }),
    );

    const channel = DEFAULT_TIMEOUT_CHANNEL;
    const promise = invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);
    await expect(promise).rejects.toThrow("IPC timeout:");

    // 遅延 resolve が来ても例外は発生しない
    expect(resolveDelayed).toBeDefined();
    resolveDelayed?.({ data: "delayed" });
  });

  // T-017: skill:execute タイムアウトエラーメッセージに 60000ms が含まれる
  it("T-017: skill:execute timeout error should contain '60000ms'", async () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const promise = invokeWithTimeout(
      ALLOWED_INVOKE_CHANNELS,
      IPC_CHANNELS.SKILL_EXECUTE,
    );

    vi.advanceTimersByTime(60000);

    await expect(promise).rejects.toThrow("60000ms");
  });

  // T-018: デフォルトチャンネルのタイムアウトエラーメッセージに 5000ms が含まれる
  it("T-018: default channel timeout error should contain '5000ms'", async () => {
    mockInvoke.mockReturnValue(new Promise(() => {}));

    const channel = DEFAULT_TIMEOUT_CHANNEL; // CHANNEL_TIMEOUTS 未定義チャンネル
    const promise = invokeWithTimeout(ALLOWED_INVOKE_CHANNELS, channel);

    vi.advanceTimersByTime(IPC_TIMEOUT_MS);

    await expect(promise).rejects.toThrow("5000ms");
  });
});
