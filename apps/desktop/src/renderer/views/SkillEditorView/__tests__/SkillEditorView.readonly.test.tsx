/**
 * SkillEditorView 読み取り専用表示強化 テスト
 * UT-UI-05A-005: 読み取り専用表示強化
 *
 * Phase 4 - TDD Red
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillEditorView } from "../index";
import { setupSkillApiMocks } from "./helpers/test-factories";

describe("SkillEditorView 読み取り専用表示", () => {
  beforeEach(() => {
    setupSkillApiMocks();
    vi.clearAllMocks();
    // Default to desktop mode
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("isReadOnly=true で Lock アイコンがファイル名付近に表示される", () => {
    render(
      <SkillEditorView
        skillName="test-skill"
        isReadOnly={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByTestId("toolbar-lock-icon")).toBeInTheDocument();
  });

  it("isReadOnly=true で保存ボタンが非表示になる", () => {
    render(
      <SkillEditorView
        skillName="test-skill"
        isReadOnly={true}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText("保存")).not.toBeInTheDocument();
  });

  it("isReadOnly=true で aria-readonly='true' がエディターに設定される", () => {
    render(
      <SkillEditorView
        skillName="test-skill"
        isReadOnly={true}
        onClose={vi.fn()}
      />,
    );
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-readonly", "true");
  });

  it("isReadOnly=true でもテキスト選択が可能（user-select: none ではない）", () => {
    render(
      <SkillEditorView
        skillName="test-skill"
        isReadOnly={true}
        onClose={vi.fn()}
      />,
    );
    const textarea = screen.getByRole("textbox");
    const computedStyle = window.getComputedStyle(textarea);
    expect(computedStyle.userSelect).not.toBe("none");
  });

  it("isReadOnly=false でバナー・Lock両要素が非表示になる", () => {
    render(
      <SkillEditorView
        skillName="test-skill"
        isReadOnly={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText(/読み取り専用/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("toolbar-lock-icon")).not.toBeInTheDocument();
  });
});
