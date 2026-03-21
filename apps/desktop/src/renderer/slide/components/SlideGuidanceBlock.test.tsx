import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  SlideGuidanceBlock,
  variantStyles,
  type GuidanceVariant,
} from "./SlideGuidanceBlock";

const defaultProps = {
  variant: "guidance" as GuidanceVariant,
  title: "次のステップ",
  reason: "操作を続けるには以下の手順を実施してください",
  primaryCTA: { label: "実行する", onClick: vi.fn() },
};

describe("SlideGuidanceBlock", () => {
  describe("guidance バリアント表示", () => {
    it("タイトルを表示する", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="guidance" />);
      expect(screen.getByText("次のステップ")).toBeInTheDocument();
    });

    it("理由テキストを表示する", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="guidance" />);
      expect(
        screen.getByText("操作を続けるには以下の手順を実施してください"),
      ).toBeInTheDocument();
    });

    it("P47: guidance バリアントのスタイルが適用される", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="guidance" />);
      const block = screen.getByTestId("slide-guidance-block");
      expect(block.className).toContain(variantStyles.guidance.split(" ")[0]);
    });
  });

  describe("degraded バリアント表示", () => {
    it("degraded バリアントのスタイルが適用される", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="degraded" />);
      const block = screen.getByTestId("slide-guidance-block");
      expect(block.className).toContain(variantStyles.degraded.split(" ")[0]);
    });
  });

  describe("P47: variantStyles export 検証", () => {
    it("variantStyles.guidance が #007AFF ボーダーカラーを含む", () => {
      expect(variantStyles.guidance).toContain("#007AFF");
    });

    it("variantStyles.degraded が #FF9500 ボーダーカラーを含む", () => {
      expect(variantStyles.degraded).toContain("#FF9500");
    });
  });

  describe("primaryCTA", () => {
    it("primaryCTA ラベルを表示する", () => {
      render(<SlideGuidanceBlock {...defaultProps} />);
      expect(screen.getByText("実行する")).toBeInTheDocument();
    });

    it("primaryCTA クリックでコールバックが呼ばれる", () => {
      const onClick = vi.fn();
      render(
        <SlideGuidanceBlock
          {...defaultProps}
          primaryCTA={{ label: "実行する", onClick }}
        />,
      );
      fireEvent.click(screen.getByText("実行する"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("secondaryCTA", () => {
    it("secondaryCTA が指定されたとき表示する", () => {
      render(
        <SlideGuidanceBlock
          {...defaultProps}
          secondaryCTA={{ label: "キャンセル", onClick: vi.fn() }}
        />,
      );
      expect(screen.getByText("キャンセル")).toBeInTheDocument();
    });

    it("secondaryCTA クリックでコールバックが呼ばれる", () => {
      const onClick = vi.fn();
      render(
        <SlideGuidanceBlock
          {...defaultProps}
          secondaryCTA={{ label: "キャンセル", onClick }}
        />,
      );
      fireEvent.click(screen.getByText("キャンセル"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("secondaryCTA が undefined のとき非表示", () => {
      render(<SlideGuidanceBlock {...defaultProps} />);
      expect(screen.queryByText("キャンセル")).not.toBeInTheDocument();
    });
  });

  describe("steps 表示", () => {
    it("steps が指定されたとき順序リストを表示する", () => {
      render(
        <SlideGuidanceBlock
          {...defaultProps}
          steps={[
            { label: "準備", description: "環境を確認する" },
            { label: "実行", description: "コマンドを実行する" },
          ]}
        />,
      );
      expect(screen.getByText("準備")).toBeInTheDocument();
      expect(screen.getByText("実行")).toBeInTheDocument();
    });

    it("steps が空のとき ol は非表示", () => {
      const { container } = render(
        <SlideGuidanceBlock {...defaultProps} steps={[]} />,
      );
      expect(container.querySelector("ol")).not.toBeInTheDocument();
    });

    it("steps が undefined のとき ol は非表示", () => {
      const { container } = render(<SlideGuidanceBlock {...defaultProps} />);
      expect(container.querySelector("ol")).not.toBeInTheDocument();
    });
  });

  describe("role 属性", () => {
    it("degraded バリアントは role=alert を持つ", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="degraded" />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("guidance バリアントは role=complementary を持つ", () => {
      render(<SlideGuidanceBlock {...defaultProps} variant="guidance" />);
      expect(screen.getByRole("complementary")).toBeInTheDocument();
    });
  });

  describe("data-testid", () => {
    it("data-testid=slide-guidance-block を持つ", () => {
      render(<SlideGuidanceBlock {...defaultProps} />);
      expect(screen.getByTestId("slide-guidance-block")).toBeInTheDocument();
    });
  });
});
