/**
 * BreakpointEditor テスト
 *
 * ブレークポイントの追加・削除・有効/無効トグルのテスト。
 * FR-3C-05: ブレークポイントを追加・削除・有効/無効トグルする
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import type { Breakpoint } from "@repo/shared/types/skill-debug";
import { BreakpointEditor } from "../components/BreakpointEditor";

// --- IPC モック ---
const mockAddBreakpoint = vi.fn();
const mockRemoveBreakpoint = vi.fn();

// --- テストデータ ---
const createBreakpoint = (overrides: Partial<Breakpoint> = {}): Breakpoint => ({
  id: "bp-1",
  type: "tool",
  toolName: "Bash",
  enabled: true,
  ...overrides,
});

const defaultProps = {
  sessionId: "session-1",
  breakpoints: [] as Breakpoint[],
  onBreakpointAdded: vi.fn(),
  onBreakpointRemoved: vi.fn(),
  onBreakpointToggled: vi.fn(),
};

describe("BreakpointEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      window as unknown as {
        electronAPI: {
          skill: {
            debug: {
              addBreakpoint: typeof mockAddBreakpoint;
              removeBreakpoint: typeof mockRemoveBreakpoint;
            };
          };
        };
      }
    ).electronAPI = {
      skill: {
        debug: {
          addBreakpoint: mockAddBreakpoint,
          removeBreakpoint: mockRemoveBreakpoint,
        },
      },
    } as unknown as typeof window.electronAPI;
  });

  it("data-testid='breakpoint-editor'が表示される", () => {
    render(<BreakpointEditor {...defaultProps} />);
    expect(screen.getByTestId("breakpoint-editor")).toBeInTheDocument();
  });

  it("ブレークポイントが0件の場合、空状態メッセージが表示される", () => {
    render(<BreakpointEditor {...defaultProps} />);
    expect(screen.getByTestId("breakpoint-empty-state")).toBeInTheDocument();
    expect(
      screen.getByText("ブレークポイントがありません"),
    ).toBeInTheDocument();
  });

  it("ブレークポイントが存在する場合、BreakpointRowが表示される", () => {
    const breakpoints = [
      createBreakpoint({ id: "bp-1", toolName: "Bash" }),
      createBreakpoint({ id: "bp-2", toolName: "Read", type: "tool" }),
    ];
    render(<BreakpointEditor {...defaultProps} breakpoints={breakpoints} />);
    expect(screen.getAllByTestId("breakpoint-row")).toHaveLength(2);
  });

  it("件数がヘッダーに表示される", () => {
    const breakpoints = [createBreakpoint()];
    render(<BreakpointEditor {...defaultProps} breakpoints={breakpoints} />);
    expect(screen.getByText("(1)")).toBeInTheDocument();
  });

  it("追加ボタンクリックで追加フォームが表示される", () => {
    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));

    expect(screen.getByTestId("breakpoint-add-form")).toBeInTheDocument();
    expect(screen.getByTestId("breakpoint-type-select")).toBeInTheDocument();
    expect(screen.getByTestId("breakpoint-target-input")).toBeInTheDocument();
  });

  it("キャンセルボタンクリックで追加フォームが閉じる", () => {
    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    expect(screen.getByTestId("breakpoint-add-form")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("breakpoint-cancel-btn"));
    expect(screen.queryByTestId("breakpoint-add-form")).not.toBeInTheDocument();
  });

  it("ターゲット未入力時、追加ボタンが無効化される", () => {
    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));

    const submitBtn = screen.getByTestId("breakpoint-submit-btn");
    expect(submitBtn).toBeDisabled();
  });

  it("ターゲット入力後、追加ボタンが有効化される", () => {
    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    fireEvent.change(screen.getByTestId("breakpoint-target-input"), {
      target: { value: "Bash" },
    });

    const submitBtn = screen.getByTestId("breakpoint-submit-btn");
    expect(submitBtn).not.toBeDisabled();
  });

  it("ブレークポイント追加成功時、onBreakpointAddedが呼ばれる", async () => {
    const newBp = createBreakpoint({ id: "bp-new" });
    mockAddBreakpoint.mockResolvedValue(newBp);

    const onBreakpointAdded = vi.fn();
    render(
      <BreakpointEditor
        {...defaultProps}
        onBreakpointAdded={onBreakpointAdded}
      />,
    );

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    fireEvent.change(screen.getByTestId("breakpoint-target-input"), {
      target: { value: "Bash" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("breakpoint-submit-btn"));
    });

    expect(mockAddBreakpoint).toHaveBeenCalledWith({
      sessionId: "session-1",
      breakpoint: expect.objectContaining({
        type: "tool",
        toolName: "Bash",
        enabled: true,
      }),
    });
    expect(onBreakpointAdded).toHaveBeenCalledWith(newBp);
  });

  it("追加成功後、フォームが閉じる", async () => {
    const newBp = createBreakpoint({ id: "bp-new" });
    mockAddBreakpoint.mockResolvedValue(newBp);

    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    fireEvent.change(screen.getByTestId("breakpoint-target-input"), {
      target: { value: "Bash" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("breakpoint-submit-btn"));
    });

    expect(screen.queryByTestId("breakpoint-add-form")).not.toBeInTheDocument();
  });

  it("追加失敗時、エラーメッセージが表示される", async () => {
    mockAddBreakpoint.mockRejectedValue(new Error("追加に失敗しました"));

    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    fireEvent.change(screen.getByTestId("breakpoint-target-input"), {
      target: { value: "Bash" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("breakpoint-submit-btn"));
    });

    expect(screen.getByTestId("breakpoint-error")).toBeInTheDocument();
    expect(screen.getByText("追加に失敗しました")).toBeInTheDocument();
  });

  it("sessionIdがnullの場合、追加ボタンが無効化される", () => {
    render(<BreakpointEditor {...defaultProps} sessionId={null} />);

    const addBtn = screen.getByTestId("breakpoint-add-btn");
    expect(addBtn).toBeDisabled();
  });

  it("ブレークポイント削除時、onBreakpointRemovedが呼ばれる", async () => {
    const bp = createBreakpoint({ id: "bp-1", toolName: "Bash" });
    mockRemoveBreakpoint.mockResolvedValue(undefined);
    const onBreakpointRemoved = vi.fn();

    render(
      <BreakpointEditor
        {...defaultProps}
        breakpoints={[bp]}
        onBreakpointRemoved={onBreakpointRemoved}
      />,
    );

    // 削除ボタンはホバー時に表示。グループホバーをシミュレートするため直接クリック可能状態でテスト
    const removeBtn = screen.getByTestId("breakpoint-remove-btn");

    await act(async () => {
      fireEvent.click(removeBtn);
    });

    expect(mockRemoveBreakpoint).toHaveBeenCalledWith({
      sessionId: "session-1",
      breakpointId: "bp-1",
    });
    expect(onBreakpointRemoved).toHaveBeenCalledWith("bp-1");
  });

  it("ブレークポイントトグル時、onBreakpointToggledが呼ばれる", () => {
    const bp = createBreakpoint({ id: "bp-1", enabled: true });
    const onBreakpointToggled = vi.fn();

    render(
      <BreakpointEditor
        {...defaultProps}
        breakpoints={[bp]}
        onBreakpointToggled={onBreakpointToggled}
      />,
    );

    fireEvent.click(screen.getByTestId("breakpoint-toggle"));
    expect(onBreakpointToggled).toHaveBeenCalledWith("bp-1", false);
  });

  it("ブレークポイント一覧にrole='list'が設定されている", () => {
    render(<BreakpointEditor {...defaultProps} />);
    expect(
      screen.getByRole("list", { name: "ブレークポイント一覧" }),
    ).toBeInTheDocument();
  });

  it("hookタイプを選択するとターゲットプレースホルダーが変わる", () => {
    render(<BreakpointEditor {...defaultProps} />);

    fireEvent.click(screen.getByTestId("breakpoint-add-btn"));
    fireEvent.change(screen.getByTestId("breakpoint-type-select"), {
      target: { value: "hook" },
    });

    const input = screen.getByTestId("breakpoint-target-input");
    expect(input).toHaveAttribute(
      "placeholder",
      "フックタイプ（PreToolUse / PostToolUse）",
    );
  });
});
