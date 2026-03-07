/**
 * SkillChip コンポーネントテスト（TASK-UI-03 Phase 4 - TDD Red）
 *
 * P39対策: happy-dom環境では userEvent 使用禁止。fireEvent のみ使用。
 * P47対策: CSS変数ベースのスタイルテストでは Record定数パターンを使用。
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
// P39対策: userEvent は使用しない

// Red状態: コンポーネントはまだ実装されていない
import { SkillChip } from "../SkillChip";

describe("SkillChip", () => {
  const defaultProps = {
    skillName: "test-skill",
    displayName: "テストスキル",
    isSelected: false,
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("未選択チップの表示（aria-checked='false'）", () => {
    render(<SkillChip {...defaultProps} />);

    const chip = screen.getByRole("radio");
    expect(chip).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("テストスキル")).toBeInTheDocument();
  });

  it("選択済みチップの表示（aria-checked='true'）", () => {
    render(<SkillChip {...defaultProps} isSelected={true} />);

    const chip = screen.getByRole("radio");
    expect(chip).toHaveAttribute("aria-checked", "true");
  });

  it("チップクリックで onSelect 発火", async () => {
    const onSelect = vi.fn();
    render(<SkillChip {...defaultProps} onSelect={onSelect} />);

    const chip = screen.getByRole("radio");
    await act(async () => {
      fireEvent.click(chip);
    });

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("無効状態でクリック不可（isDisabled=true）", async () => {
    const onSelect = vi.fn();
    render(
      <SkillChip {...defaultProps} onSelect={onSelect} isDisabled={true} />,
    );

    const chip = screen.getByRole("radio");
    await act(async () => {
      fireEvent.click(chip);
    });

    expect(onSelect).not.toHaveBeenCalled();
    expect(chip).toHaveAttribute("aria-disabled", "true");
  });

  it("アイコン未設定時のデフォルトアイコン", () => {
    render(<SkillChip {...defaultProps} />);

    // デフォルトアイコンが表示されること
    const icon = screen.getByTestId("skill-chip-icon");
    expect(icon).toBeInTheDocument();
  });

  it("アクセシビリティ属性（role='radio', aria-label）", () => {
    render(<SkillChip {...defaultProps} />);

    const chip = screen.getByRole("radio");
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute(
      "aria-label",
      expect.stringContaining("テストスキル"),
    );
  });

  // === Phase 6: テスト拡充 ===

  describe("境界値テスト", () => {
    it("長いdisplayNameがtruncateクラスで省略表示される", () => {
      render(
        <SkillChip
          {...defaultProps}
          displayName="これはとても長いスキル名称テスト用文字列です"
        />,
      );

      const textElement = screen.getByText(
        "これはとても長いスキル名称テスト用文字列です",
      );
      expect(textElement.className).toContain("truncate");
    });

    it("空文字列のskillNameでもクラッシュしない", () => {
      expect(() => {
        render(<SkillChip {...defaultProps} skillName="" displayName="" />);
      }).not.toThrow();
    });

    it("特殊文字を含むskillNameでも正常表示", () => {
      render(
        <SkillChip
          {...defaultProps}
          skillName="test/skill@v2.0<>"
          displayName="テスト/スキル@v2.0<>"
        />,
      );

      expect(screen.getByText("テスト/スキル@v2.0<>")).toBeInTheDocument();
    });
  });

  describe("組み合わせテスト", () => {
    it("isDisabled + isSelected の組み合わせ表示", () => {
      render(
        <SkillChip {...defaultProps} isSelected={true} isDisabled={true} />,
      );

      const chip = screen.getByRole("radio");
      expect(chip).toHaveAttribute("aria-checked", "true");
      expect(chip).toHaveAttribute("aria-disabled", "true");
      expect(chip.className).toContain("opacity-50");
    });

    it("isDisabled + isSelected でクリック無効", async () => {
      const onSelect = vi.fn();
      render(
        <SkillChip
          {...defaultProps}
          isSelected={true}
          isDisabled={true}
          onSelect={onSelect}
        />,
      );

      const chip = screen.getByRole("radio");
      await act(async () => {
        fireEvent.click(chip);
      });

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe("キーボード操作テスト", () => {
    it("Enterキーで onSelect 発火", async () => {
      const onSelect = vi.fn();
      render(<SkillChip {...defaultProps} onSelect={onSelect} />);

      const chip = screen.getByRole("radio");
      await act(async () => {
        fireEvent.keyDown(chip, { key: "Enter", code: "Enter" });
      });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("Spaceキーで onSelect 発火", async () => {
      const onSelect = vi.fn();
      render(<SkillChip {...defaultProps} onSelect={onSelect} />);

      const chip = screen.getByRole("radio");
      await act(async () => {
        fireEvent.keyDown(chip, { key: " ", code: "Space" });
      });

      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it("isDisabled時はキーボード操作も無効", async () => {
      const onSelect = vi.fn();
      render(
        <SkillChip {...defaultProps} isDisabled={true} onSelect={onSelect} />,
      );

      const chip = screen.getByRole("radio");
      await act(async () => {
        fireEvent.keyDown(chip, { key: "Enter", code: "Enter" });
      });

      expect(onSelect).not.toHaveBeenCalled();
      expect(chip).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("アイコン表示テスト", () => {
    it("カスタムアイコン指定時にアイコン文字を表示", () => {
      render(<SkillChip {...defaultProps} icon="🔧" />);

      expect(screen.getByText("🔧")).toBeInTheDocument();
    });
  });
});
