/**
 * DebugPanel メインビュー テスト
 *
 * 初期状態（セッションなし）、セッション開始ダイアログ、
 * アクティブセッション表示、エラー状態のテスト。
 * FR-3C-05: BreakpointEditor 統合テスト
 * FR-3C-07: OutputConsole 統合テスト
 * FR-3C-10: キーボードショートカットテスト
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
      <div data-testid="debug-toolbar">
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

vi.mock("../components/BreakpointEditor", () => ({
  BreakpointEditor: vi.fn(() => <div data-testid="breakpoint-editor" />),
}));

vi.mock("../components/OutputConsole", () => ({
  OutputConsole: vi.fn(() => <div data-testid="output-console" />),
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

// テスト対象のビュー
import { DebugPanel } from "../index";

describe("DebugPanel", () => {
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

  it("data-testid='debug-panel'が表示される", () => {
    render(<DebugPanel />);
    expect(screen.getByTestId("debug-panel")).toBeInTheDocument();
  });

  it("セッション未開始時にStartDebugDialogが表示される", () => {
    render(<DebugPanel />);
    expect(screen.getByTestId("start-debug-dialog")).toBeInTheDocument();
  });

  it("セッション未開始時にツールバーが表示されない", () => {
    render(<DebugPanel />);
    expect(screen.queryByTestId("debug-toolbar")).not.toBeInTheDocument();
  });

  it("セッション開始後にツールバーが表示される", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("debug-toolbar")).toBeInTheDocument();
  });

  it("セッション開始後にStartDebugDialogが非表示になる", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.queryByTestId("start-debug-dialog")).not.toBeInTheDocument();
  });

  it("セッション開始後に主要コンポーネントが表示される", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("code-view")).toBeInTheDocument();
    expect(screen.getByTestId("step-history-list")).toBeInTheDocument();
    expect(screen.getByTestId("variable-inspector")).toBeInTheDocument();
    expect(screen.getByTestId("callstack-view")).toBeInTheDocument();
    expect(screen.getByTestId("evaluate-console")).toBeInTheDocument();
  });

  it("セッション開始後にBreakpointEditorが表示される（FR-3C-05）", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("breakpoint-editor")).toBeInTheDocument();
  });

  it("セッション開始後にOutputConsoleが表示される（FR-3C-07）", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByTestId("output-console")).toBeInTheDocument();
  });

  it("セッション開始失敗時にエラーが表示される", async () => {
    mockDebugAPI.startSession.mockRejectedValue(
      new Error("接続に失敗しました"),
    );

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("停止ボタンクリックで確認ダイアログが表示される", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    // セッション開始
    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    // 停止ボタンクリック
    await act(async () => {
      fireEvent.click(screen.getByTestId("toolbar-stop-btn"));
    });

    expect(screen.getByTestId("stop-confirm-dialog")).toBeInTheDocument();
    expect(screen.getByText("デバッグを停止しますか？")).toBeInTheDocument();
  });

  it("確認ダイアログのキャンセルで閉じる", async () => {
    const mockSession = createMockSession();
    mockDebugAPI.startSession.mockResolvedValue(mockSession);

    render(<DebugPanel />);

    await act(async () => {
      fireEvent.click(screen.getByTestId("dialog-start-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("toolbar-stop-btn"));
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("stop-cancel-btn"));
    });

    expect(screen.queryByTestId("stop-confirm-dialog")).not.toBeInTheDocument();
  });

  // --- キーボードショートカットテスト（FR-3C-10）---
  describe("キーボードショートカット（FR-3C-10）", () => {
    it("F5キーで続行コマンドが実行される（paused状態）", async () => {
      const mockSession = createMockSession({ status: "paused" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);
      mockDebugAPI.executeCommand.mockResolvedValue(undefined);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F5" });
      });

      expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
        sessionId: "session-1",
        command: "continue",
      });
    });

    it("F6キーで一時停止コマンドが実行される（running状態）", async () => {
      const mockSession = createMockSession({ status: "running" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);
      mockDebugAPI.executeCommand.mockResolvedValue(undefined);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F6" });
      });

      expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
        sessionId: "session-1",
        command: "pause",
      });
    });

    it("F10キーでステップオーバーコマンドが実行される（paused状態）", async () => {
      const mockSession = createMockSession({ status: "paused" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);
      mockDebugAPI.executeCommand.mockResolvedValue(undefined);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F10" });
      });

      expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
        sessionId: "session-1",
        command: "stepOver",
      });
    });

    it("F11キーでステップインコマンドが実行される（paused状態）", async () => {
      const mockSession = createMockSession({ status: "paused" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);
      mockDebugAPI.executeCommand.mockResolvedValue(undefined);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F11" });
      });

      expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
        sessionId: "session-1",
        command: "stepInto",
      });
    });

    it("Shift+F11キーでステップアウトコマンドが実行される（paused状態）", async () => {
      const mockSession = createMockSession({ status: "paused" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);
      mockDebugAPI.executeCommand.mockResolvedValue(undefined);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F11", shiftKey: true });
      });

      expect(mockDebugAPI.executeCommand).toHaveBeenCalledWith({
        sessionId: "session-1",
        command: "stepOut",
      });
    });

    it("Shift+F5キーで停止確認ダイアログが表示される（paused状態）", async () => {
      const mockSession = createMockSession({ status: "paused" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F5", shiftKey: true });
      });

      expect(screen.getByTestId("stop-confirm-dialog")).toBeInTheDocument();
    });

    it("セッション未開始時にF5キーを押してもコマンドが実行されない", async () => {
      render(<DebugPanel />);

      await act(async () => {
        fireEvent.keyDown(window, { key: "F5" });
      });

      expect(mockDebugAPI.executeCommand).not.toHaveBeenCalled();
    });

    it("running状態でF5キー（続行）を押してもコマンドが実行されない", async () => {
      const mockSession = createMockSession({ status: "running" });
      mockDebugAPI.startSession.mockResolvedValue(mockSession);

      render(<DebugPanel />);

      await act(async () => {
        fireEvent.click(screen.getByTestId("dialog-start-btn"));
      });

      await act(async () => {
        fireEvent.keyDown(window, { key: "F5" });
      });

      // running状態ではcontinueは無効
      expect(mockDebugAPI.executeCommand).not.toHaveBeenCalled();
    });
  });
});
