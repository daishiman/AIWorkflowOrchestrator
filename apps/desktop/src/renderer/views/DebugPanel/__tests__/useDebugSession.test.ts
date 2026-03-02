/**
 * useDebugSession Hook テスト
 *
 * セッション開始、コマンド実行、エラーハンドリング、リセットのテスト。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebugSession } from "../hooks/useDebugSession";
import type {
  DebugSessionState,
  DebugStartRequest,
} from "@repo/shared/types/skill-debug";

// --- IPC モック ---
const mockDebugAPI = {
  startSession: vi.fn(),
  executeCommand: vi.fn(),
  addBreakpoint: vi.fn(),
  removeBreakpoint: vi.fn(),
  inspectVariable: vi.fn(),
  evaluateExpression: vi.fn(),
  onDebugEvent: vi.fn().mockReturnValue(vi.fn()),
};

beforeEach(() => {
  vi.clearAllMocks();
  (
    window as unknown as {
      electronAPI: { skill: { debug: typeof mockDebugAPI } };
    }
  ).electronAPI = {
    skill: { debug: mockDebugAPI },
  } as unknown as typeof window.electronAPI;
});

// --- テストデータ ---
const createMockSession = (
  overrides: Partial<DebugSessionState> = {},
): DebugSessionState => ({
  id: "session-1",
  skillName: "test-skill",
  status: "running",
  breakpoints: [],
  variables: {},
  callStack: [],
  startedAt: "2026-03-01T00:00:00Z",
  steps: [],
  ...overrides,
});

const createStartRequest = (
  overrides: Partial<DebugStartRequest> = {},
): DebugStartRequest => ({
  skillName: "test-skill",
  prompt: "テストプロンプト",
  breakpoints: [],
  ...overrides,
});

describe("useDebugSession", () => {
  it("初期状態ではsessionがnull、isLoadingがfalse、errorがnullである", () => {
    const { result } = renderHook(() => useDebugSession());

    expect(result.current.session).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("startSessionが成功するとセッション状態が設定される", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useDebugSession());

    let returnedSession: DebugSessionState | null = null;
    await act(async () => {
      returnedSession = await result.current.startSession(createStartRequest());
    });

    expect(result.current.session).toEqual(mockSession);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(returnedSession).toEqual(mockSession);
    expect(mockDebugAPI.startSession).toHaveBeenCalledWith({
      skillName: "test-skill",
      prompt: "テストプロンプト",
      breakpoints: [],
    });
  });

  it("startSessionが失敗するとエラーメッセージが設定される", async () => {
    mockDebugAPI.startSession.mockRejectedValue(
      new Error("接続に失敗しました"),
    );

    const { result } = renderHook(() => useDebugSession());

    let returnedSession: DebugSessionState | null = null;
    await act(async () => {
      returnedSession = await result.current.startSession(createStartRequest());
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBe("接続に失敗しました");
    expect(result.current.isLoading).toBe(false);
    expect(returnedSession).toBeNull();
  });

  it("startSessionがError以外を投げるとデフォルトメッセージが設定される", async () => {
    mockDebugAPI.startSession.mockRejectedValue("unknown error");

    const { result } = renderHook(() => useDebugSession());

    await act(async () => {
      await result.current.startSession(createStartRequest());
    });

    expect(result.current.error).toBe("デバッグセッション開始に失敗しました");
  });

  it("executeCommandがセッションありの場合にIPC呼び出しを行う", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);
    mockDebugAPI.executeCommand.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDebugSession());

    // セッション開始
    await act(async () => {
      await result.current.startSession(createStartRequest());
    });

    // コマンド実行
    await act(async () => {
      await result.current.executeCommand("continue");
    });

    expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
      sessionId: "session-1",
      command: "continue",
    });
  });

  it("executeCommandがセッションなしの場合は何もしない", async () => {
    const { result } = renderHook(() => useDebugSession());

    await act(async () => {
      await result.current.executeCommand("continue");
    });

    expect(mockDebugAPI.executeCommand).not.toHaveBeenCalled();
  });

  it("executeCommandが失敗するとエラーメッセージが設定される", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);
    mockDebugAPI.executeCommand.mockRejectedValue(
      new Error("コマンドタイムアウト"),
    );

    const { result } = renderHook(() => useDebugSession());

    await act(async () => {
      await result.current.startSession(createStartRequest());
    });

    await act(async () => {
      await result.current.executeCommand("stepOver");
    });

    expect(result.current.error).toBe("コマンドタイムアウト");
  });

  it("resetSessionでセッション・エラー・ローディングがリセットされる", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useDebugSession());

    await act(async () => {
      await result.current.startSession(createStartRequest());
    });

    expect(result.current.session).not.toBeNull();

    act(() => {
      result.current.resetSession();
    });

    expect(result.current.session).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("setSessionで直接セッション状態を更新できる", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    const { result } = renderHook(() => useDebugSession());

    await act(async () => {
      await result.current.startSession(createStartRequest());
    });

    act(() => {
      result.current.setSession((prev) =>
        prev ? { ...prev, status: "paused" } : prev,
      );
    });

    expect(result.current.session?.status).toBe("paused");
  });
});
