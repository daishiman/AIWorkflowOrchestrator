/**
 * SlideProgressRow コンポーネントテスト
 * P39: happy-dom環境では userEvent 禁止 → fireEvent のみ使用
 * @module renderer/slide/components/SlideProgressRow.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SlideProgressRow } from "./SlideProgressRow";

describe("SlideProgressRow", () => {
  const defaultProps = {
    percent: 50,
    message: "スライドを生成中...",
    onCancel: vi.fn(),
  };

  describe("data-testid", () => {
    it("data-testid='slide-progress-row'が設定される", () => {
      render(<SlideProgressRow {...defaultProps} />);
      expect(screen.getByTestId("slide-progress-row")).toBeInTheDocument();
    });
  });

  describe("プログレスバー（percent 0/50/100）", () => {
    it("percent=0のとき width: 0%", () => {
      render(<SlideProgressRow {...defaultProps} percent={0} />);
      const progressbar = screen.getByRole("progressbar");
      const bar = progressbar.firstElementChild as HTMLElement;
      expect(bar).toHaveStyle({ width: "0%" });
    });

    it("percent=50のとき width: 50%", () => {
      render(<SlideProgressRow {...defaultProps} percent={50} />);
      const progressbar = screen.getByRole("progressbar");
      const bar = progressbar.firstElementChild as HTMLElement;
      expect(bar).toHaveStyle({ width: "50%" });
    });

    it("percent=100のとき width: 100%", () => {
      render(<SlideProgressRow {...defaultProps} percent={100} />);
      const progressbar = screen.getByRole("progressbar");
      const bar = progressbar.firstElementChild as HTMLElement;
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("percent > 100 は 100% にクランプされる", () => {
      render(<SlideProgressRow {...defaultProps} percent={120} />);
      const progressbar = screen.getByRole("progressbar");
      const bar = progressbar.firstElementChild as HTMLElement;
      expect(bar).toHaveStyle({ width: "100%" });
    });

    it("percent < 0 は 0% にクランプされる", () => {
      render(<SlideProgressRow {...defaultProps} percent={-10} />);
      const progressbar = screen.getByRole("progressbar");
      const bar = progressbar.firstElementChild as HTMLElement;
      expect(bar).toHaveStyle({ width: "0%" });
    });
  });

  describe("メッセージ表示", () => {
    it("messageテキストが表示される", () => {
      render(
        <SlideProgressRow
          {...defaultProps}
          message="HTMLを生成しています..."
        />,
      );
      expect(screen.getByText("HTMLを生成しています...")).toBeInTheDocument();
    });

    it("空文字のメッセージも表示できる", () => {
      render(<SlideProgressRow {...defaultProps} message="" />);
      expect(screen.getByTestId("slide-progress-row")).toBeInTheDocument();
    });
  });

  describe("キャンセルCTA（P39: fireEvent）", () => {
    it("キャンセルボタンクリックでonCancelが呼ばれる", () => {
      const onCancel = vi.fn();
      render(<SlideProgressRow {...defaultProps} onCancel={onCancel} />);
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("複数回クリックで複数回呼ばれる", () => {
      const onCancel = vi.fn();
      render(<SlideProgressRow {...defaultProps} onCancel={onCancel} />);
      const cancelButton = screen.getByRole("button", { name: "キャンセル" });
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(2);
    });
  });

  describe("ARIA 属性", () => {
    it("role='progressbar'が設定される", () => {
      render(<SlideProgressRow {...defaultProps} percent={50} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("aria-valuenow がpercentと一致する", () => {
      render(<SlideProgressRow {...defaultProps} percent={75} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "75",
      );
    });

    it("aria-valuemin='0'が設定される", () => {
      render(<SlideProgressRow {...defaultProps} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemin",
        "0",
      );
    });

    it("aria-valuemax='100'が設定される", () => {
      render(<SlideProgressRow {...defaultProps} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuemax",
        "100",
      );
    });

    it("percent=0のとき aria-valuenow='0'", () => {
      render(<SlideProgressRow {...defaultProps} percent={0} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    });

    it("percent=100のとき aria-valuenow='100'", () => {
      render(<SlideProgressRow {...defaultProps} percent={100} />);
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "100",
      );
    });
  });
});
