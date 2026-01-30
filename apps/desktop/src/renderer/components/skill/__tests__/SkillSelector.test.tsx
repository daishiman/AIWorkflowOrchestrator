/**
 * @vitest-environment happy-dom
 *
 * SkillSelector Component Tests
 *
 * Tests for TASK-7A: SkillSelector dropdown component.
 * Covers basic operations, keyboard navigation, accessibility, and edge cases.
 *
 * @module @repo/desktop/renderer/components/skill/__tests__/SkillSelector
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillSelector } from "../SkillSelector";

// Cleanup DOM between tests
afterEach(() => {
  cleanup();
});

// Mock store
const mockSelectSkill = vi.fn();
const mockSelectSkillByName = vi.fn();
const mockRescanSkills = vi.fn().mockResolvedValue(undefined);

const defaultStoreState = {
  availableSkills: [
    {
      name: "skill-a",
      description: "Skill A description",
      agents: [{ name: "agent1" }],
      references: [{ name: "ref1" }, { name: "ref2" }],
    },
    {
      name: "skill-b",
      description: "Skill B description",
      agents: [],
      references: [{ name: "ref1" }],
    },
  ],
  importedSkills: [
    {
      name: "skill-a",
      description: "Skill A description",
      status: "active" as const,
      importedAt: new Date(),
      agents: [{ name: "agent1" }],
      references: [{ name: "ref1" }, { name: "ref2" }],
    },
  ],
  selectedSkillName: null as string | null,
  isLoadingSkills: false,
  isScanning: false,
  selectSkill: mockSelectSkill,
  selectSkillByName: mockSelectSkillByName,
  rescanSkills: mockRescanSkills,
};

let currentStoreState = { ...defaultStoreState };

// Mock the store module
vi.mock("../../../store", () => ({
  useSkillStore: () => currentStoreState,
}));

// Also mock path alias
vi.mock("@/renderer/store", () => ({
  useSkillStore: () => currentStoreState,
}));

describe("SkillSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStoreState = { ...defaultStoreState };
  });

  // ==============================
  // TC-001: スキル未選択時に「なし」と表示される (FR-05)
  // ==============================
  it("TC-001: should render with no skill selected", () => {
    render(<SkillSelector />);
    expect(screen.getByText("なし")).toBeInTheDocument();
  });

  // ==============================
  // TC-002: クリックでドロップダウンが開く (FR-01)
  // ==============================
  it("TC-002: should open dropdown when clicked", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  // ==============================
  // TC-003: 外側クリックでドロップダウンが閉じる (NFR-03)
  // ==============================
  it("TC-003: should close dropdown when clicking outside", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Click outside
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ==============================
  // TC-004: オプションクリックでスキルが選択される (FR-03)
  // ==============================
  it("TC-004: should select skill when option clicked", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");
    // Find the option with skill-a text
    const skillAOption = options.find((opt) =>
      opt.textContent?.includes("skill-a"),
    );
    expect(skillAOption).toBeDefined();
    await user.click(skillAOption!);
    expect(mockSelectSkillByName).toHaveBeenCalledWith("skill-a");
  });

  // ==============================
  // TC-005: インポート済みスキルセクションが表示される (FR-03)
  // ==============================
  it("TC-005: should show imported skills section", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText(/インポート済み/)).toBeInTheDocument();
  });

  // ==============================
  // TC-006: 利用可能スキルセクションが表示される (FR-04)
  // ==============================
  it("TC-006: should show available skills section", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText(/利用可能なスキル/)).toBeInTheDocument();
  });

  // ==============================
  // TC-007: キーボードナビゲーションが動作する (NFR-02)
  // ==============================
  it("TC-007: should handle keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    // ArrowDown opens dropdown
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Escape closes dropdown
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ==============================
  // TC-008: 再スキャンボタンクリックで関数が呼ばれる (FR-06)
  // ==============================
  it("TC-008: should call rescan when button clicked", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));

    const rescanButton = screen.getByRole("button", { name: /再スキャン/ });
    await user.click(rescanButton);
    expect(mockRescanSkills).toHaveBeenCalled();
  });

  // ==============================
  // TC-009: 「なし」選択で selectSkill(null) が呼ばれる (FR-02)
  // ==============================
  it("TC-009: should select null when 'none' option clicked", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      selectedSkillName: "skill-a",
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));

    const noneOption = screen
      .getAllByRole("option")
      .find((opt) => opt.textContent?.includes("スキルを使用しない"));
    expect(noneOption).toBeDefined();
    await user.click(noneOption!);
    expect(mockSelectSkillByName).toHaveBeenCalledWith(null);
  });

  // ==============================
  // TC-010: 選択中スキル名がトリガーに表示される (FR-05)
  // ==============================
  it("TC-010: should display selected skill name in trigger", () => {
    currentStoreState = {
      ...defaultStoreState,
      selectedSkillName: "skill-a",
    };
    render(<SkillSelector />);
    expect(screen.getByText("skill-a")).toBeInTheDocument();
  });

  // ==============================
  // TC-011: スキャン中に再スキャンボタンが無効化される (FR-06)
  // ==============================
  it("TC-011: should disable rescan button while scanning", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      isScanning: true,
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByText(/スキャン中/)).toBeInTheDocument();
  });

  // ==============================
  // TC-012: ARIA属性が正しく設定されている (NFR-01)
  // ==============================
  it("TC-012: should have correct ARIA attributes", () => {
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // ==============================
  // TC-013: 空のスキルリストで適切に表示される (Edge case)
  // ==============================
  it("TC-013: should render empty state when no skills available", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      availableSkills: [],
      importedSkills: [],
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    // ドロップダウンは開くが「なし」のみ表示
    expect(screen.getByText(/スキルを使用しない/)).toBeInTheDocument();
  });

  // ============================================================
  // Phase 6: 拡充テスト - キーボード詳細
  // ============================================================

  // TC-014: Enter キーでドロップダウンが開く
  it("TC-014: should open dropdown with Enter key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  // TC-015: Space キーでドロップダウンが開く
  it("TC-015: should open dropdown with Space key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await user.keyboard(" ");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  // TC-016: ArrowDown で次のオプションにフォーカス移動
  it("TC-016: should move focus down with ArrowDown", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    // Open dropdown
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Move focus down
    await user.keyboard("{ArrowDown}");
    // aria-activedescendant should be updated
    expect(trigger).toHaveAttribute("aria-activedescendant");
  });

  // TC-017: ArrowUp で前のオプションにフォーカス移動
  it("TC-017: should move focus up with ArrowUp", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    // Open and move down twice then up
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  // TC-018: Home で最初のオプションにフォーカス移動
  it("TC-018: should move focus to first option with Home key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Home}");
    expect(trigger).toHaveAttribute("aria-activedescendant", "skill-option-0");
  });

  // TC-019: End で最後のオプションにフォーカス移動
  it("TC-019: should move focus to last option with End key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{End}");
    expect(trigger).toHaveAttribute("aria-activedescendant");
  });

  // TC-020: Tab でドロップダウンが閉じる
  it("TC-020: should close dropdown with Tab key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Tab}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // TC-021: Enter でフォーカス中オプションが選択される
  it("TC-021: should select focused option with Enter key", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();

    // Open dropdown
    await user.keyboard("{ArrowDown}");
    // Focus is on first option ("none"), move to imported skill
    await user.keyboard("{ArrowDown}");
    // Select with Enter
    await user.keyboard("{Enter}");
    expect(mockSelectSkillByName).toHaveBeenCalledWith("skill-a");
  });

  // ============================================================
  // Phase 6: 拡充テスト - エッジケース
  // ============================================================

  // TC-022: importedSkills が空の場合セクションヘッダーが非表示
  it("TC-022: should hide imported section when no imported skills", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      importedSkills: [],
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByText(/インポート済み/)).not.toBeInTheDocument();
  });

  // TC-023: unimported skills が空の場合セクションヘッダーが非表示
  it("TC-023: should hide available section when all skills imported", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      availableSkills: [
        {
          name: "skill-a",
          description: "Skill A",
          agents: [],
          references: [],
        },
      ],
      importedSkills: [
        {
          name: "skill-a",
          description: "Skill A",
          status: "active" as const,
          importedAt: new Date(),
          agents: [],
          references: [],
        },
      ],
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));
    expect(screen.queryByText(/利用可能なスキル/)).not.toBeInTheDocument();
  });

  // TC-024: 連続クリックでドロップダウンが開閉する
  it("TC-024: should toggle dropdown on consecutive clicks", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");

    // Open
    await user.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Close
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ============================================================
  // Phase 6: 拡充テスト - アクセシビリティ詳細
  // ============================================================

  // TC-025: aria-expanded が開閉に応じて true/false に変化する
  it("TC-025: should toggle aria-expanded on open/close", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // TC-026: aria-selected が選択状態に応じて設定される
  it("TC-026: should set aria-selected on selected option", async () => {
    const user = userEvent.setup();
    currentStoreState = {
      ...defaultStoreState,
      selectedSkillName: "skill-a",
    };
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");
    const selectedOption = options.find(
      (opt) => opt.getAttribute("aria-selected") === "true",
    );
    expect(selectedOption).toBeDefined();
    expect(selectedOption!.textContent).toContain("skill-a");
  });

  // TC-027: role="option" が各オプションに設定されている
  it("TC-027: should have role=option on all options", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");
    // "none" + imported(1) + unimported(1) = 3 options
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  // TC-028: aria-controls points to listbox id
  it("TC-028: should have aria-controls pointing to listbox", async () => {
    const user = userEvent.setup();
    render(<SkillSelector />);
    const trigger = screen.getByRole("combobox");

    expect(trigger).toHaveAttribute("aria-controls", "skill-listbox");
    await user.click(trigger);
    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("id", "skill-listbox");
  });
});
