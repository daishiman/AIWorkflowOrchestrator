/**
 * OutputConsole テスト
 *
 * ログ表示・空状態・自動スクロール・クリアのテスト。
 * FR-3C-07: 出力コンソール（OutputConsole）にログを表示する
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { DebugStep } from "@repo/shared/types/skill-debug";
import { OutputConsole } from "../components/OutputConsole";
import type { ConsoleLog } from "../components/OutputConsole";

// --- テストデータ ---
const createStep = (overrides: Partial<DebugStep> = {}): DebugStep => ({
  stepNumber: 1,
  type: "tool_call",
  toolName: "Bash",
  timestamp: "2026-03-02T10:00:00.000Z",
  ...overrides,
});

const createLog = (overrides: Partial<ConsoleLog> = {}): ConsoleLog => ({
  id: "log-1",
  timestamp: "2026-03-02T10:00:00.000Z",
  level: "info",
  message: "テストメッセージ",
  ...overrides,
});

describe("OutputConsole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("data-testid='output-console'が表示される", () => {
    render(<OutputConsole steps={[]} />);
    expect(screen.getByTestId("output-console")).toBeInTheDocument();
  });

  it("ログが0件の場合、空状態メッセージが表示される", () => {
    render(<OutputConsole steps={[]} />);
    expect(screen.getByTestId("output-empty-state")).toBeInTheDocument();
    expect(screen.getByText("出力がありません")).toBeInTheDocument();
  });

  it("ステップがログに変換されて表示される", () => {
    const step = createStep({ stepNumber: 1, toolName: "Bash" });
    render(<OutputConsole steps={[step]} />);

    expect(screen.getByTestId("output-log-area")).toBeInTheDocument();
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
    expect(screen.getByText(/Bash/)).toBeInTheDocument();
  });

  it("追加ログが表示される", () => {
    const logs = [createLog({ message: "カスタムログメッセージ" })];
    render(<OutputConsole steps={[]} logs={logs} />);

    expect(screen.getByText("カスタムログメッセージ")).toBeInTheDocument();
  });

  it("複数ステップが全て表示される", () => {
    const steps = [
      createStep({ stepNumber: 1, type: "tool_call", toolName: "Bash" }),
      createStep({
        stepNumber: 2,
        type: "hook_execution",
        hookType: "PreToolUse",
        timestamp: "2026-03-02T10:00:01.000Z",
      }),
      createStep({
        stepNumber: 3,
        type: "agent_response",
        timestamp: "2026-03-02T10:00:02.000Z",
      }),
    ];
    render(<OutputConsole steps={steps} />);

    const entries = screen.getAllByTestId("output-log-entry");
    expect(entries).toHaveLength(3);
  });

  it("hook_executionステップが正しく変換される", () => {
    const step = createStep({
      type: "hook_execution",
      hookType: "PreToolUse",
    });
    render(<OutputConsole steps={[step]} />);

    expect(screen.getByText(/PreToolUse/)).toBeInTheDocument();
  });

  it("agent_responseステップが正しく変換される", () => {
    const step = createStep({ type: "agent_response" });
    render(<OutputConsole steps={[step]} />);

    expect(screen.getByText(/エージェント応答/)).toBeInTheDocument();
  });

  it("ログエリアにrole='log'が設定されている", () => {
    render(<OutputConsole steps={[createStep()]} />);
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("ログエリアにaria-live='polite'が設定されている", () => {
    render(<OutputConsole steps={[createStep()]} />);
    const logArea = screen.getByRole("log");
    expect(logArea).toHaveAttribute("aria-live", "polite");
  });

  it("onClearが渡された場合、クリアボタンが表示される", () => {
    const onClear = vi.fn();
    const logs = [createLog()];
    render(<OutputConsole steps={[]} logs={logs} onClear={onClear} />);

    expect(screen.getByTestId("output-clear-btn")).toBeInTheDocument();
  });

  it("ログが0件の場合、クリアボタンが表示されない", () => {
    const onClear = vi.fn();
    render(<OutputConsole steps={[]} logs={[]} onClear={onClear} />);

    expect(screen.queryByTestId("output-clear-btn")).not.toBeInTheDocument();
  });

  it("クリアボタンクリックでonClearが呼ばれる", () => {
    const onClear = vi.fn();
    const logs = [createLog()];
    render(<OutputConsole steps={[]} logs={logs} onClear={onClear} />);

    fireEvent.click(screen.getByTestId("output-clear-btn"));
    expect(onClear).toHaveBeenCalled();
  });

  it("件数がヘッダーに表示される", () => {
    const steps = [
      createStep({ stepNumber: 1 }),
      createStep({ stepNumber: 2, timestamp: "2026-03-02T10:00:01.000Z" }),
    ];
    render(<OutputConsole steps={steps} />);

    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("warnレベルのログが正しく表示される", () => {
    const logs = [createLog({ level: "warn", message: "警告メッセージ" })];
    render(<OutputConsole steps={[]} logs={logs} />);

    expect(screen.getByText("[WARN]")).toBeInTheDocument();
    expect(screen.getByText("警告メッセージ")).toBeInTheDocument();
  });

  it("errorレベルのログが正しく表示される", () => {
    const logs = [createLog({ level: "error", message: "エラーメッセージ" })];
    render(<OutputConsole steps={[]} logs={logs} />);

    expect(screen.getByText("[ERROR]")).toBeInTheDocument();
  });

  it("自動スクロール用のアンカーが存在する", () => {
    render(<OutputConsole steps={[createStep()]} />);
    expect(screen.getByTestId("output-scroll-anchor")).toBeInTheDocument();
  });
});
