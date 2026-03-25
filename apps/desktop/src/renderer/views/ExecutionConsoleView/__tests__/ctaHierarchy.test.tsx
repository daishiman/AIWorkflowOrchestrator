/**
 * @vitest-environment happy-dom
 */

/**
 * CTA 階層テスト
 *
 * TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 Phase 4
 * テストケース: CTA-01〜CTA-05
 *
 * 注意: happy-dom 環境では userEvent を使用しない。fireEvent + act() を使用する (P39)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, cleanup } from "@testing-library/react";
import {
  AdvancedConsolePanel,
  type SessionState,
} from "../../../components/execution/AdvancedConsolePanel";

// ExecutionConsoleView uses hooks that need IPC - test CTA rules at component level
vi.mock("../../../hooks/useApprovalFlow", () => ({
  useApprovalFlow: () => ({
    currentRequest: null,
    approve: vi.fn(),
    reject: vi.fn(),
  }),
}));

vi.mock("../../../hooks/useAdvancedConsole", () => ({
  useAdvancedConsole: () => ({
    isOpen: false,
    toggle: vi.fn(),
    terminalOutput: [],
    copyCommand: null,
  }),
}));

describe("CTA Hierarchy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  const defaultPanelProps = {
    isOpen: false,
    onToggle: vi.fn(),
    terminalOutput: ["$ claude -p 'test'"],
    copyCommand: 'claude -p "test"',
    sessionState: "ready" as SessionState,
  };

  // CTA-01: Primary CTA が常に 1 個（Advanced Console toggle は secondary）
  it("CTA-01: only one toggle CTA exists in AdvancedConsolePanel", () => {
    const { container } = render(
      <AdvancedConsolePanel {...defaultPanelProps} />,
    );
    const toggleButtons = container.querySelectorAll(
      '[data-testid="advanced-console-toggle"]',
    );
    expect(toggleButtons.length).toBe(1);
  });

  // CTA-02: Primary CTA ラベルに "terminal" / "端末" が含まれない (state !== handoff)
  it("CTA-02: toggle CTA does not contain terminal/端末 in non-handoff states", () => {
    const nonHandoffStates: SessionState[] = [
      "ready",
      "running",
      "done",
      "aborted",
    ];

    for (const state of nonHandoffStates) {
      cleanup();
      const { getByTestId } = render(
        <AdvancedConsolePanel {...defaultPanelProps} sessionState={state} />,
      );
      const toggleText =
        getByTestId("advanced-console-toggle").textContent ?? "";
      expect(toggleText).not.toMatch(/terminal/i);
      expect(toggleText).not.toMatch(/端末/);
    }
  });

  // CTA-03: handoff state で toggle CTA は引き続き「高度な表示」
  // (「端末で続ける」は Session Dock 側の Primary CTA であり、Advanced Console toggle とは別)
  it("CTA-03: toggle CTA in handoff state remains secondary label", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel {...defaultPanelProps} sessionState="handoff" />,
    );
    const toggleText = getByTestId("advanced-console-toggle").textContent ?? "";
    expect(toggleText).toContain("高度な表示");
  });

  // CTA-04: 「高度な表示」が secondary 以下に配置される
  // text-xs + text-tertiary class は secondary/tertiary styling を示す
  it("CTA-04: advanced console toggle is styled as secondary CTA", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel {...defaultPanelProps} />,
    );
    const toggle = getByTestId("advanced-console-toggle");
    expect(toggle.className).toContain("text-xs");
    expect(toggle.className).toContain("text-[var(--text-tertiary)]");
  });

  // CTA-05: Advanced console 内 CTA がパネル内に閉じている
  it("CTA-05: copy button is contained within the panel", () => {
    const { getByTestId } = render(
      <AdvancedConsolePanel {...defaultPanelProps} isOpen={true} />,
    );

    const panel = getByTestId("advanced-console-panel");
    const copyBtn = getByTestId("advanced-console-copy");

    // copy button は panel 要素の子孫である
    expect(panel.contains(copyBtn)).toBe(true);
  });

  // CTA-05b: パネル外にコピーボタンが漏れていない
  it("CTA-05b: no copy button exists outside the panel", () => {
    const { container, getByTestId } = render(
      <AdvancedConsolePanel {...defaultPanelProps} isOpen={true} />,
    );

    const panelContainer = getByTestId("advanced-console-container");
    const allCopyButtons = container.querySelectorAll(
      '[data-testid="advanced-console-copy"]',
    );

    // コピーボタンは1つのみ、かつパネルコンテナ内に存在
    expect(allCopyButtons.length).toBe(1);
    expect(panelContainer.contains(allCopyButtons[0]!)).toBe(true);
  });
});
