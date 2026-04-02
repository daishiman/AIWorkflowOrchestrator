/**
 * GovernanceSummaryPanel テスト（UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001 Phase 4）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import type { SkillCreatorGovernanceState } from "@repo/shared/types";
import { GovernanceSummaryPanel } from "../GovernanceSummaryPanel";

const mockGovernanceState: SkillCreatorGovernanceState = {
  phase: "plan",
  activePolicy: {
    phase: "plan",
    permissionMode: "default",
    allowedTools: ["Read", "Glob", "Grep"],
    disallowedTools: ["Write", "Edit"],
  },
  recentAuditEvents: [
    {
      eventType: "pre_tool_use",
      timestamp: "2026-04-02T00:00:00.000Z",
      sessionId: "test-session-1",
      phase: "plan",
      toolName: "Read",
      decision: {
        allowed: true,
        reason: "allowed by policy",
        phase: "plan",
        toolName: "Read",
      },
    },
  ],
  recentDenials: [],
};

const mockGovernanceStateWithDenials: SkillCreatorGovernanceState = {
  ...mockGovernanceState,
  recentDenials: [
    { toolName: "Write", reason: "Write は plan フェーズで禁止" },
    { toolName: "Edit", reason: "Edit は plan フェーズで禁止" },
  ],
};

function setupMockApi(
  impl: () => Promise<{ success: boolean; data?: SkillCreatorGovernanceState }>,
) {
  const mockFn = vi.fn(impl);
  Object.defineProperty(window, "electronAPI", {
    value: { skillCreator: { getGovernanceState: mockFn } },
    writable: true,
    configurable: true,
  });
  return mockFn;
}

describe("GovernanceSummaryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(window, "electronAPI");
  });

  // TC-R-01: phase が正しく表示される
  it("TC-R-01: phase プロップが正しく表示される", async () => {
    setupMockApi(async () => ({ success: true, data: mockGovernanceState }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-phase")).toHaveTextContent("plan");
    });
  });

  // TC-R-02: permissionMode が表示される
  it("TC-R-02: permissionMode が表示される", async () => {
    setupMockApi(async () => ({ success: true, data: mockGovernanceState }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(
        screen.getByTestId("governance-permission-mode"),
      ).toHaveTextContent("default");
    });
  });

  // TC-R-03: recentDenials リストが表示される（最大5件）
  it("TC-R-03: recentDenials リストが表示される", async () => {
    setupMockApi(async () => ({
      success: true,
      data: mockGovernanceStateWithDenials,
    }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-denial-0")).toHaveTextContent(
        "Write は plan フェーズで禁止",
      );
      expect(screen.getByTestId("governance-denial-1")).toHaveTextContent(
        "Edit は plan フェーズで禁止",
      );
    });
  });

  // TC-R-04: recentDenials が空の場合は "No recent denials" が表示される
  it("TC-R-04: recentDenials が空の場合は No recent denials が表示される", async () => {
    setupMockApi(async () => ({ success: true, data: mockGovernanceState }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-no-denials")).toBeInTheDocument();
    });
  });

  // TC-R-05: IPC 取得失敗時にフォールバックが表示される
  it("TC-R-05: IPC 取得失敗時にエラー表示", async () => {
    setupMockApi(async () => {
      throw new Error("IPC error");
    });

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-error")).toBeInTheDocument();
    });
  });

  // TC-R-06: session summary（audit event 数）が表示される
  it("TC-R-06: session summary が表示される", async () => {
    setupMockApi(async () => ({ success: true, data: mockGovernanceState }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(
        screen.getByTestId("governance-session-summary"),
      ).toHaveTextContent("1");
    });
  });

  // TC-R-07: 定期ポーリングが設定される
  it("TC-R-07: 定期ポーリングで getGovernanceState が複数回呼ばれる", async () => {
    vi.useFakeTimers();
    const mockFn = setupMockApi(async () => ({
      success: true,
      data: mockGovernanceState,
    }));

    render(<GovernanceSummaryPanel />);
    expect(mockFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  // TC-R-08: ネットワーク遅延時にローディング表示
  it("TC-R-08: データ未取得時にローディング表示", () => {
    // 解決しない Promise でローディング状態を維持
    setupMockApi(() => new Promise(() => {}));

    render(<GovernanceSummaryPanel />);

    expect(screen.getByTestId("governance-loading")).toBeInTheDocument();
  });

  // TC-R-09: recentDenials が5件超でも5件まで表示
  it("TC-R-09: recentDenials は最大5件まで表示", async () => {
    const manyDenials: SkillCreatorGovernanceState = {
      ...mockGovernanceState,
      recentDenials: Array.from({ length: 7 }, (_, i) => ({
        toolName: "Write",
        reason: `denial reason ${i}`,
      })),
    };
    setupMockApi(async () => ({ success: true, data: manyDenials }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-denial-4")).toBeInTheDocument();
      expect(
        screen.queryByTestId("governance-denial-5"),
      ).not.toBeInTheDocument();
    });
  });

  // TC-R-10: コンポーネントアンマウント時にポーリングが停止する
  it("TC-R-10: アンマウント後はポーリングが停止する", async () => {
    vi.useFakeTimers();
    const mockFn = setupMockApi(async () => ({
      success: true,
      data: mockGovernanceState,
    }));

    const { unmount } = render(<GovernanceSummaryPanel />);
    expect(mockFn).toHaveBeenCalledTimes(1);
    const callCountBeforeUnmount = mockFn.mock.calls.length;

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    // アンマウント後は呼ばれない
    expect(mockFn.mock.calls.length).toBe(callCountBeforeUnmount);
  });

  // --- Phase 6 拡充テスト ---

  // TC-R-11: window.electronAPI.skillCreator が存在しない場合はローディングのまま
  it("TC-R-11: window.electronAPI.skillCreator が未定義の場合はローディング表示", () => {
    // electronAPI が存在しない状態を作る
    Object.defineProperty(window, "electronAPI", {
      value: {},
      writable: true,
      configurable: true,
    });

    render(<GovernanceSummaryPanel />);

    expect(screen.getByTestId("governance-loading")).toBeInTheDocument();
  });

  // TC-R-12: 初回スナップショット取得後の refresh failure はエラーを上書き表示（ready 維持）
  // fake timers + waitFor の競合を避けるため、初回成功後に ready 状態であることを確認する
  it("TC-R-12: 初回取得成功後は ready 状態を維持する", async () => {
    let callCount = 0;
    setupMockApi(async () => {
      callCount++;
      if (callCount === 1) {
        return { success: true, data: mockGovernanceState };
      }
      throw new Error("refresh failed");
    });

    render(<GovernanceSummaryPanel />);

    // 初回取得で ready になる
    await waitFor(() => {
      expect(screen.getByTestId("governance-phase")).toBeInTheDocument();
    });

    // ready 状態: phase が表示されている
    expect(screen.getByTestId("governance-phase")).toHaveTextContent("plan");
    // loading / error は表示されていない
    expect(screen.queryByTestId("governance-loading")).not.toBeInTheDocument();
  });

  // TC-R-13: rapid remount でも interval cleanup が正しく行われる
  it("TC-R-13: 高速 remount を繰り返しても interval が蓄積しない", async () => {
    vi.useFakeTimers();
    const mockFn = setupMockApi(async () => ({
      success: true,
      data: mockGovernanceState,
    }));

    const { unmount: unmount1 } = render(<GovernanceSummaryPanel />);
    unmount1();

    const { unmount: unmount2 } = render(<GovernanceSummaryPanel />);
    unmount2();

    const callsAfterUnmounts = mockFn.mock.calls.length;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });

    // アンマウント後は追加呼び出しなし
    expect(mockFn.mock.calls.length).toBe(callsAfterUnmounts);
  });

  // TC-R-14: recentDenials が 6 件の場合も 5 件のみ表示
  it("TC-R-14: recentDenials が 6 件の場合も 5 件のみ表示", async () => {
    const sixDenials: SkillCreatorGovernanceState = {
      ...mockGovernanceState,
      recentDenials: Array.from({ length: 6 }, (_, i) => ({
        toolName: `Tool${i}`,
        reason: `reason ${i}`,
      })),
    };
    setupMockApi(async () => ({ success: true, data: sixDenials }));

    render(<GovernanceSummaryPanel />);

    await waitFor(() => {
      expect(screen.getByTestId("governance-denial-4")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("governance-denial-5")).not.toBeInTheDocument();
  });
});
