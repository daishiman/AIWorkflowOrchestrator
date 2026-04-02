/**
 * GovernanceSummaryPanel テスト
 * UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001
 * Phase 4: TDD Red
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 * fake timers 注意: waitFor は内部で setTimeout を使うため fake timers と
 * 組み合わせると永久待機になる。act + await Promise.resolve() パターンを使用。
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import type { SkillCreatorGovernanceState } from "@repo/shared/types";
import { GovernanceSummaryPanel } from "../GovernanceSummaryPanel";

const mockGovernanceState: SkillCreatorGovernanceState = {
  phase: "execute",
  activePolicy: {
    phase: "execute",
    permissionMode: "acceptEdits",
    allowedTools: ["Read", "Write", "Edit"],
    disallowedTools: [],
  },
  recentAuditEvents: [
    {
      eventType: "session_start",
      timestamp: "2026-04-02T00:00:00Z",
      sessionId: "s1",
      phase: "execute",
    },
    {
      eventType: "pre_tool_use",
      timestamp: "2026-04-02T00:00:01Z",
      sessionId: "s1",
      phase: "execute",
      toolName: "Write",
    },
  ],
  recentDenials: [
    { toolName: "Bash", reason: "Bash is not allowed in execute phase" },
  ],
};

const mockGetGovernanceState = vi.fn();

describe("GovernanceSummaryPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockGetGovernanceState.mockResolvedValue({
      success: true,
      data: mockGovernanceState,
    });
    Object.defineProperty(window, "electronAPI", {
      value: {
        skillCreator: {
          getGovernanceState: mockGetGovernanceState,
        },
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("TC-R-01: state.phase が正しく表示される", async () => {
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-phase")).toHaveTextContent("execute");
  });

  it("TC-R-02: permissionMode が表示される", async () => {
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-permission-mode")).toHaveTextContent(
      "acceptEdits",
    );
  });

  it("TC-R-03: recentDenials リストが表示される（最大5件）", async () => {
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-denials")).toBeInTheDocument();
    expect(
      screen.queryByTestId("governance-no-denials"),
    ).not.toBeInTheDocument();
  });

  it("TC-R-04: recentDenials が空の場合は No recent denials が表示される", async () => {
    mockGetGovernanceState.mockResolvedValueOnce({
      success: true,
      data: { ...mockGovernanceState, recentDenials: [] },
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-no-denials")).toBeInTheDocument();
  });

  it("TC-R-05: IPC 取得失敗時にフォールバックが表示される", async () => {
    mockGetGovernanceState.mockResolvedValueOnce({
      success: false,
      error: "IPC error occurred",
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-error")).toBeInTheDocument();
  });

  it("TC-R-06: session summary（audit event 数）が表示される", async () => {
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByTestId("governance-session-summary"),
    ).toBeInTheDocument();
  });

  it("TC-R-07: 定期ポーリングが設定される（useEffect + setInterval）", async () => {
    render(<GovernanceSummaryPanel />);

    // 初回フェッチを完了させる
    await act(async () => {
      await Promise.resolve();
    });

    const callCountAfterMount = mockGetGovernanceState.mock.calls.length;
    expect(callCountAfterMount).toBeGreaterThanOrEqual(1);

    // 5秒進める
    await act(async () => {
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    expect(mockGetGovernanceState.mock.calls.length).toBeGreaterThan(
      callCountAfterMount,
    );
  });

  // Phase 6: 拡充テスト
  it("TC-R-08: IPC が例外をスローした場合にエラー表示される", async () => {
    mockGetGovernanceState.mockRejectedValueOnce(new Error("Network error"));
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-error")).toBeInTheDocument();
  });

  it("TC-R-09: recentDenials が5件超の場合は最大5件のみ表示される", async () => {
    const manyDenials = Array.from({ length: 8 }, (_, i) => ({
      toolName: `Tool${i}`,
      reason: `Reason ${i}`,
    }));
    mockGetGovernanceState.mockResolvedValueOnce({
      success: true,
      data: { ...mockGovernanceState, recentDenials: manyDenials },
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    const denialList = screen.getByTestId("governance-denials");
    expect(denialList.querySelectorAll("li").length).toBe(5);
  });

  it("TC-R-10: コンポーネントアンマウント時にポーリングが停止する", async () => {
    const { unmount } = render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });

    const callCountBeforeUnmount = mockGetGovernanceState.mock.calls.length;
    unmount();

    await act(async () => {
      vi.advanceTimersByTime(10_000);
      await Promise.resolve();
    });

    // アンマウント後は呼び出し回数が増えない
    expect(mockGetGovernanceState.mock.calls.length).toBe(
      callCountBeforeUnmount,
    );
  });

  it("TC-R-11: recentDenials が null 相当（空配列）の場合 No recent denials が表示される", async () => {
    mockGetGovernanceState.mockResolvedValueOnce({
      success: true,
      data: { ...mockGovernanceState, recentDenials: [] },
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-no-denials")).toBeInTheDocument();
  });

  it("TC-R-12: activePolicy.allowedTools が空配列でもクラッシュしない", async () => {
    mockGetGovernanceState.mockResolvedValueOnce({
      success: true,
      data: {
        ...mockGovernanceState,
        activePolicy: {
          ...mockGovernanceState.activePolicy,
          allowedTools: [],
        },
      },
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-panel")).toBeInTheDocument();
  });

  it("TC-R-13: preload API が未注入でもフォールバックエラーを表示する", async () => {
    Object.defineProperty(window, "electronAPI", {
      value: {},
      writable: true,
      configurable: true,
    });
    render(<GovernanceSummaryPanel />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("governance-error")).toHaveTextContent(
      "Governance API が利用できません",
    );
  });
});
