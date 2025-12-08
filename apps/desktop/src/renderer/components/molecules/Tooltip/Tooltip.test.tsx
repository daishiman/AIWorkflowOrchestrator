import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Tooltip } from "./index";

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("レンダリング", () => {
    it("子要素をレンダリングする", () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );
      expect(screen.getByText("Hover me")).toBeInTheDocument();
    });

    it("初期状態でツールチップを表示しない", () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  describe("ホバー", () => {
    it("ホバー後にデフォルト遅延（300ms）でツールチップを表示する", async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      // 遅延前はツールチップは表示されない
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      // 遅延を進める
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("カスタム遅延を適用する", async () => {
      render(
        <Tooltip content="Tooltip text" delay={500}>
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("マウスリーブでツールチップを非表示にする", async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();

      fireEvent.mouseLeave(wrapper);
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("遅延中にマウスリーブするとツールチップを表示しない", async () => {
      render(
        <Tooltip content="Tooltip text" delay={300}>
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.mouseLeave(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  describe("コンテンツ", () => {
    it("ツールチップにコンテンツを表示する", async () => {
      render(
        <Tooltip content="Tooltip content">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip content");
    });
  });

  describe("ポジション", () => {
    it("デフォルトでrightポジション", async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("left-full");
    });

    it("topポジションを適用する", async () => {
      render(
        <Tooltip content="Tooltip text" position="top">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("bottom-full");
    });

    it("bottomポジションを適用する", async () => {
      render(
        <Tooltip content="Tooltip text" position="bottom">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("top-full");
    });

    it("leftポジションを適用する", async () => {
      render(
        <Tooltip content="Tooltip text" position="left">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveClass("right-full");
    });
  });

  describe("アクセシビリティ", () => {
    it("ツールチップにrole=tooltipを持つ", async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    it("表示時にaria-hidden=falseを設定する", async () => {
      render(
        <Tooltip content="Tooltip text">
          <button>Hover me</button>
        </Tooltip>,
      );

      const wrapper = screen.getByText("Hover me").parentElement!;
      fireEvent.mouseEnter(wrapper);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByRole("tooltip")).toHaveAttribute(
        "aria-hidden",
        "false",
      );
    });
  });

  describe("displayName", () => {
    it("displayNameが設定されている", () => {
      expect(Tooltip.displayName).toBe("Tooltip");
    });
  });
});
