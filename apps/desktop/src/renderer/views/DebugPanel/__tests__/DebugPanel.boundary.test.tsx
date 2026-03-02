/**
 * DebugPanel 境界値・エラー・a11y テスト
 *
 * Phase 6 テスト拡充: 境界値テスト、IPCエラー、a11yテスト
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type {
  DebugSessionState,
  DebugStartRequest,
} from "@repo/shared/types/skill-debug";

// --- 子コンポーネントモック ---
vi.mock("../components/DebugToolbar", () => ({
  DebugToolbar: vi.fn(
    ({
      status,
      skillName,
      onStop,
    }: {
      status: string;
      skillName: string;
      onCommand: (cmd: string) => void;
      onStop: () => void;
    }) => (
      <div data-testid="debug-toolbar" role="toolbar" aria-label="デバッグ操作">
        <span data-testid="toolbar-status">{status}</span>
        <span data-testid="toolbar-skill-name">{skillName}</span>
        <button data-testid="toolbar-stop-btn" onClick={onStop}>
          停止
        </button>
      </div>
    ),
  ),
}));

vi.mock("../components/CodeView", () => ({
  CodeView: vi.fn(() => <div data-testid="code-view" />),
}));

vi.mock("../components/StepHistoryList", () => ({
  StepHistoryList: vi.fn(() => <div data-testid="step-history-list" />),
}));

vi.mock("../components/VariableInspector", () => ({
  VariableInspector: vi.fn(() => <div data-testid="variable-inspector" />),
}));

vi.mock("../components/CallStackView", () => ({
  CallStackView: vi.fn(() => <div data-testid="callstack-view" />),
}));

vi.mock("../components/EvaluateConsole", () => ({
  EvaluateConsole: vi.fn(() => <div data-testid="evaluate-console" />),
}));

vi.mock("../components/StartDebugDialog", () => ({
  StartDebugDialog: vi.fn(
    ({
      onStart,
      isLoading,
    }: {
      onStart: (req: DebugStartRequest) => void;
      isLoading: boolean;
    }) => (
      <div data-testid="start-debug-dialog">
        <span data-testid="dialog-loading">
          {isLoading ? "loading" : "idle"}
        </span>
        <button
          data-testid="dialog-start-btn"
          onClick={() =>
            onStart({
              skillName: "test-skill",
              prompt: "テスト",
              breakpoints: [],
            })
          }
        >
          開始
        </button>
      </div>
    ),
  ),
}));

// --- IPC モック ---
const mockCleanup = vi.fn();
const mockDebugAPI = {
  startSession: vi.fn(),
  executeCommand: vi.fn(),
  addBreakpoint: vi.fn(),
  removeBreakpoint: vi.fn(),
  inspectVariable: vi.fn(),
  evaluateExpression: vi.fn(),
  onDebugEvent: vi.fn().mockReturnValue(mockCleanup),
};

// --- テストデータ ---
const createMockSession = (
  overrides: Partial<DebugSessionState> = {},
): DebugSessionState => ({
  id: "session-1",
  skillName: "test-skill",
  status: "running",
  breakpoints: [],
  variables: { result: "hello" },
  callStack: [],
  startedAt: "2026-03-01T00:00:00Z",
  steps: [],
  ...overrides,
});

import { DebugPanel } from "../index";

describe("DebugPanel - 境界値テスト", () => {
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

  it("空のステップ履歴でセッションが表示される", async () => {
    const mockSession = createMockSession({ steps: [] });
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("step-history-list")).toBeInTheDocument();
  });

  it("空の変数リストでセッションが表示される", async () => {
    const mockSession = createMockSession({ variables: {} });
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("variable-inspector")).toBeInTheDocument();
  });

  it("長いスキル名でセッションが正常に表示される", async () => {
    const longName = "very-long-skill-name-" + "x".repeat(200);
    const mockSession = createMockSession({ skillName: longName });
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("toolbar-skill-name")).toHaveTextContent(
      longName,
    );
  });

  it("大量の変数（100個）を含むセッションが正常に表示される", async () => {
    const variables: Record<string, unknown> = {};
    for (let i = 0; i < 100; i++) {
      variables[`var_${i}`] = `value_${i}`;
    }
    const mockSession = createMockSession({ variables });
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("variable-inspector")).toBeInTheDocument();
  });
});

describe("DebugPanel - エラー系テスト", () => {
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

  it("セッション開始のIPC失敗でエラーが表示される", async () => {
    mockDebugAPI.startSession.mockRejectedValue(new Error("IPC接続失敗"));

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("ネットワークタイムアウトエラーが表示される", async () => {
    mockDebugAPI.startSession.mockRejectedValue(
      new Error("ネットワークタイムアウト"),
    );

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("非Errorオブジェクトの例外でもエラーが表示される", async () => {
    mockDebugAPI.startSession.mockRejectedValue("文字列エラー");

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("DebugPanel - a11y テスト", () => {
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

  it("メインコンテナのdata-testid='debug-panel'が設定されている", () => {
    render(<DebugPanel />);
    expect(screen.getByTestId("debug-panel")).toBeInTheDocument();
  });

  it("停止確認ダイアログにdata-testidが設定されている", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("toolbar-stop-btn"));
    });

    expect(screen.getByTestId("stop-confirm-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("stop-cancel-btn")).toBeInTheDocument();
    expect(screen.getByTestId("stop-confirm-btn")).toBeInTheDocument();
  });

  it("停止確認ダイアログの確認ボタンでexecuteCommandが呼ばれる", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);
    mockDebugAPI.executeCommand.mockResolvedValue(undefined);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("toolbar-stop-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("stop-confirm-btn"));
    });

    expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
      sessionId: "session-1",
      command: "stop",
    });
  });

  it("セッション未開始時にStartDebugDialogのisLoadingがfalseである", () => {
    render(<DebugPanel />);

    expect(screen.getByTestId("dialog-loading")).toHaveTextContent("idle");
  });
});
