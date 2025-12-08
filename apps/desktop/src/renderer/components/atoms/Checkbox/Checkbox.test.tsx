import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./index";

describe("Checkbox", () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  };

  describe("レンダリング", () => {
    it("チェックボックスをレンダリングする", () => {
      render(<Checkbox {...defaultProps} />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    it("ラベルを表示する", () => {
      render(<Checkbox {...defaultProps} label="Accept terms" />);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    it("ラベルがない場合、ラベル要素をレンダリングしない", () => {
      const { container } = render(<Checkbox {...defaultProps} />);
      // 視覚的なラベル（チェックボックスのアイコン用のラベルは存在するが、テキストラベルはない）
      const textLabels = container.querySelectorAll("label");
      // チェックボックスのアイコン用ラベルのみ
      expect(textLabels.length).toBe(1);
    });

    it("説明文を表示する", () => {
      render(
        <Checkbox
          {...defaultProps}
          label="Accept terms"
          description="By checking this, you agree to our terms."
        />,
      );
      expect(
        screen.getByText("By checking this, you agree to our terms."),
      ).toBeInTheDocument();
    });

    it("説明文がaria-describedbyで関連付けられている", () => {
      render(
        <Checkbox
          {...defaultProps}
          id="terms-cb"
          label="Accept terms"
          description="By checking this, you agree to our terms."
        />,
      );
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-describedby",
        "terms-cb-description",
      );
      expect(
        screen.getByText("By checking this, you agree to our terms."),
      ).toHaveAttribute("id", "terms-cb-description");
    });
  });

  describe("インタラクション", () => {
    it("クリック時にonChangeを呼び出す", () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("チェック済み状態からクリック時にfalseで呼び出す", () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={true} onChange={handleChange} />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it("ラベルクリック時にonChangeを呼び出す", () => {
      const handleChange = vi.fn();
      render(
        <Checkbox checked={false} onChange={handleChange} label="Click me" />,
      );
      const label = screen.getByText("Click me");
      fireEvent.click(label);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe("状態", () => {
    it("チェック状態を表示する", () => {
      render(<Checkbox checked={true} onChange={vi.fn()} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });

    it("未チェック状態を表示する", () => {
      render(<Checkbox checked={false} onChange={vi.fn()} />);
      expect(screen.getByRole("checkbox")).toHaveAttribute(
        "aria-checked",
        "false",
      );
    });

    it("チェック状態でチェックアイコンを表示する", () => {
      const { container } = render(
        <Checkbox checked={true} onChange={vi.fn()} />,
      );
      // checkアイコンが表示される
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it("未チェック状態でチェックアイコンを表示しない", () => {
      const { container } = render(
        <Checkbox checked={false} onChange={vi.fn()} />,
      );
      // sr-only要素以外にアイコンがない
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeNull();
    });

    it("disabled状態ではonChangeを呼び出さない", () => {
      const handleChange = vi.fn();
      render(<Checkbox checked={false} onChange={handleChange} disabled />);
      const checkbox = screen.getByRole("checkbox");
      fireEvent.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });

    it("disabled状態でdisabledスタイルを適用する", () => {
      const { container } = render(<Checkbox {...defaultProps} disabled />);
      // opacity-50クラスを持つ要素が存在
      const disabledLabel = container.querySelector(".opacity-50");
      expect(disabledLabel).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("input要素がsr-onlyクラスを持つ（視覚的に隠れている）", () => {
      render(<Checkbox {...defaultProps} />);
      expect(screen.getByRole("checkbox")).toHaveClass("sr-only");
    });

    it("idを設定できる", () => {
      render(<Checkbox {...defaultProps} id="my-checkbox" />);
      expect(screen.getByRole("checkbox")).toHaveAttribute("id", "my-checkbox");
    });

    it("ラベルとチェックボックスが関連付けられている", () => {
      render(<Checkbox {...defaultProps} label="Test label" id="test-cb" />);
      const checkbox = screen.getByRole("checkbox");
      const label = screen.getByText("Test label");
      expect(label).toHaveAttribute("for", "test-cb");
      expect(checkbox).toHaveAttribute("id", "test-cb");
    });

    it("idが指定されない場合、ランダムなidを生成する", () => {
      render(<Checkbox {...defaultProps} label="Auto ID" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox.id).toMatch(/^checkbox-/);
    });
  });

  describe("className", () => {
    it("カスタムclassNameを追加する", () => {
      const { container } = render(
        <Checkbox {...defaultProps} className="custom-class" />,
      );
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(Checkbox.displayName).toBe("Checkbox");
    });
  });
});
