/**
 * @vitest-environment happy-dom
 */

/**
 * AdvancedConsolePanel テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: ADV-01〜ADV-11
 *
 * 注意: happy-dom 環境では userEvent を使用しない。fireEvent + act() を使用する (P39)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, fireEvent, act, cleanup } from "@testing-library/react";
import { AdvancedConsolePanel } from "../AdvancedConsolePanel";

describe("AdvancedConsolePanel", () => {
  const defaultProps = {
    isOpen: false,
    onToggle: vi.fn(),
    terminalOutput: ["$ claude -p 'test'", "Running..."],
    copyCommand: 'claude -p "test prompt"',
    sessionState: "ready" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  // ADV-01: opt-in toggle でパネルが表示される
  it("ADV-01: shows panel when isOpen=true", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel {...defaultProps} isOpen={true} />,
    );
    expect(getByTestId("advanced-console-panel")).toBeTruthy();
  });

  // ADV-02: 初期状態でパネルが非表示
  it("ADV-02: hides panel when isOpen=false", () => {
    const { queryByTestId } = render(
      <AdvancedConsolePanel {...defaultProps} />,
    );
    expect(queryByTestId("advanced-console-panel")).toBeNull();
  });

  // ADV-03: パネル内に raw terminal output が表示される
  it("ADV-03: displays terminal output", () => {
    const { getByText } = render(
      <AdvancedConsolePanel {...defaultProps} isOpen={true} />,
    );
    expect(getByText("$ claude -p 'test'")).toBeTruthy();
    expect(getByText("Running...")).toBeTruthy();
  });

  // ADV-04: パネル内に copy command が表示される
  it("ADV-04: displays copy command", () => {
    const { getByText } = render(
      <AdvancedConsolePanel {...defaultProps} isOpen={true} />,
    );
    expect(getByText('claude -p "test prompt"')).toBeTruthy();
  });

  // ADV-05: 「閉じる」でパネルが非表示になる（onToggle 発火）
  it("ADV-05: calls onToggle when toggle button is clicked", () => {
    const { getByTestId } = render(<AdvancedConsolePanel {...defaultProps} />);
    act(() => {
      fireEvent.click(getByTestId("advanced-console-toggle"));
    });
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  // ADV-06: collapsed state でパネルが表示不可
  it("ADV-06: returns null for collapsed state", () => {
    const { container } = render(
      <AdvancedConsolePanel {...defaultProps} sessionState="collapsed" />,
    );
    expect(container.innerHTML).toBe("");
  });

  // ADV-07: unavailable state でパネルが表示不可
  it("ADV-07: returns null for unavailable state", () => {
    const { container } = render(
      <AdvancedConsolePanel {...defaultProps} sessionState="unavailable" />,
    );
    expect(container.innerHTML).toBe("");
  });

  // ADV-08: guidance-only state でパネルが表示不可
  it("ADV-08: returns null for guidance-only state", () => {
    const { container } = render(
      <AdvancedConsolePanel {...defaultProps} sessionState="guidance-only" />,
    );
    expect(container.innerHTML).toBe("");
  });

  // ADV-09: running state で read-only モード（copy ボタン disabled）
  it("ADV-09: copy button is disabled in running state", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel
        {...defaultProps}
        isOpen={true}
        sessionState="running"
      />,
    );
    const copyBtn = getByTestId("advanced-console-copy");
    expect(copyBtn.hasAttribute("disabled")).toBe(true);
  });

  // ADV-10: done state で read-only モード
  it("ADV-10: copy button is disabled in done state", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel
        {...defaultProps}
        isOpen={true}
        sessionState="done"
      />,
    );
    const copyBtn = getByTestId("advanced-console-copy");
    expect(copyBtn.hasAttribute("disabled")).toBe(true);
  });

  // Toggle ボタンの aria-expanded 属性
  it("toggle button has correct aria-expanded", () => {
    const { getByTestId, rerender } = render(
      <AdvancedConsolePanel {...defaultProps} />,
    );
    expect(
      getByTestId("advanced-console-toggle").getAttribute("aria-expanded"),
    ).toBe("false");

    rerender(<AdvancedConsolePanel {...defaultProps} isOpen={true} />);
    expect(
      getByTestId("advanced-console-toggle").getAttribute("aria-expanded"),
    ).toBe("true");
  });

  // 空のログ表示
  it("shows empty state when no terminal output", () => {
    const { getByText } = render(
      <AdvancedConsolePanel
        {...defaultProps}
        isOpen={true}
        terminalOutput={[]}
      />,
    );
    expect(getByText("ログなし")).toBeTruthy();
  });
});
