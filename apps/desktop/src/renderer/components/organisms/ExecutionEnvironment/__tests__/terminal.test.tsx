/**
 * ExecutionEnvironment - terminal 表示 Unit Test
 * C-1: placeholder → TerminalHandoffCard 表示の検証
 * @module terminal.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExecutionEnvironment } from "../index";
import type { HandoffGuidance } from "@repo/shared";

// TerminalHandoffCard をモックして ExecutionEnvironment の分岐ロジックに集中
vi.mock("../../TerminalHandoffCard", () => ({
  TerminalHandoffCard: ({
    guidance,
  }: {
    guidance: {
      terminalCommand: string;
      contextSummary: string;
      reason: string;
    };
  }) => (
    <div data-testid="terminal-handoff-card">
      <span data-testid="terminal-command">{guidance.terminalCommand}</span>
      <span data-testid="context-summary">{guidance.contextSummary}</span>
      <span data-testid="reason">{guidance.reason}</span>
    </div>
  ),
}));

const mockGuidance: HandoffGuidance = {
  terminalCommand: "claude --model gpt-4o",
  contextSummary: "テスト実行",
  reason: "API key 未設定",
};

describe("ExecutionEnvironment - terminal", () => {
  // T-8: environmentType="terminal" + handoffGuidance あり
  it("should render TerminalHandoffCard when guidance is provided", () => {
    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={mockGuidance}
      />,
    );

    expect(screen.getByTestId("terminal-handoff-card")).toBeInTheDocument();
  });

  // T-9: environmentType="terminal" + handoffGuidance が null
  it("should render waiting placeholder when guidance is null", () => {
    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={null}
      />,
    );

    expect(screen.getByTestId("terminal-waiting")).toBeInTheDocument();
  });

  // T-10: environmentType="terminal" + handoffGuidance が undefined
  it("should render waiting placeholder when guidance is undefined", () => {
    render(<ExecutionEnvironment environmentType="terminal" content={null} />);

    expect(screen.getByTestId("terminal-waiting")).toBeInTheDocument();
  });

  // T-11: TerminalHandoffCard に guidance props が渡される
  it("should pass guidance content to TerminalHandoffCard", () => {
    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={mockGuidance}
      />,
    );

    expect(screen.getByTestId("terminal-command")).toHaveTextContent(
      "claude --model gpt-4o",
    );
    expect(screen.getByTestId("context-summary")).toHaveTextContent(
      "テスト実行",
    );
    expect(screen.getByTestId("reason")).toHaveTextContent("API key 未設定");
  });

  // T-12: environmentType="html" の場合に影響なし
  it("should not affect html environment rendering", () => {
    render(
      <ExecutionEnvironment
        environmentType="html"
        content={{
          type: "html",
          content: "<p>test</p>",
          timestamp: new Date(),
        }}
        handoffGuidance={mockGuidance}
      />,
    );

    expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    expect(
      screen.queryByTestId("terminal-handoff-card"),
    ).not.toBeInTheDocument();
  });

  // T-16: environmentType="html" に handoffGuidance を渡しても無視
  it("should ignore handoffGuidance when environmentType is not terminal", () => {
    render(
      <ExecutionEnvironment
        environmentType="html"
        content={{
          type: "html",
          content: "<h1>Hello</h1>",
          timestamp: new Date(),
        }}
        handoffGuidance={mockGuidance}
      />,
    );

    expect(screen.getByTestId("html-preview")).toBeInTheDocument();
    expect(screen.queryByTestId("terminal-waiting")).not.toBeInTheDocument();
  });

  // T-17: environmentType="none" のデフォルト動作が維持される
  it("should maintain default behavior for environmentType=none", () => {
    render(<ExecutionEnvironment environmentType="none" content={null} />);

    expect(screen.getByTestId("no-preview")).toBeInTheDocument();
  });

  // T-18: handoffGuidance の各フィールドが TerminalHandoffCard に渡る
  it("should pass all guidance fields to TerminalHandoffCard", () => {
    const detailedGuidance: HandoffGuidance = {
      terminalCommand: "claude --model claude-sonnet-4-6 --task 'fix bug'",
      contextSummary: "surface=skill skill=code-review",
      reason: "subscription mode: use Claude Code CLI",
    };

    render(
      <ExecutionEnvironment
        environmentType="terminal"
        content={null}
        handoffGuidance={detailedGuidance}
      />,
    );

    expect(screen.getByTestId("terminal-command")).toHaveTextContent(
      "claude --model claude-sonnet-4-6 --task 'fix bug'",
    );
    expect(screen.getByTestId("context-summary")).toHaveTextContent(
      "surface=skill skill=code-review",
    );
    expect(screen.getByTestId("reason")).toHaveTextContent(
      "subscription mode: use Claude Code CLI",
    );
  });
});
