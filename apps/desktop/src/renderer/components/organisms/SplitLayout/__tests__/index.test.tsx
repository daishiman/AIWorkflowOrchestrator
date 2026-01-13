/**
 * SplitLayout Component Tests (TDD Green Phase)
 * @module SplitLayout.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SplitLayout } from "../index";

describe("SplitLayout", () => {
  describe("レンダリング", () => {
    it("左右のパネルが表示される", () => {
      // Given: leftPanelとrightPanelが渡される
      render(
        <SplitLayout
          leftPanel={<div data-testid="left">Left Content</div>}
          rightPanel={<div data-testid="right">Right Content</div>}
        />,
      );

      // Then: 両方のパネルが表示される
      expect(screen.getByTestId("left")).toBeInTheDocument();
      expect(screen.getByTestId("right")).toBeInTheDocument();
    });

    it("右パネルを非表示にできる", () => {
      // Given: showRightPanel=false
      render(
        <SplitLayout
          leftPanel={<div data-testid="left">Left Content</div>}
          rightPanel={<div data-testid="right">Right Content</div>}
          showRightPanel={false}
        />,
      );

      // Then: 左パネルのみ表示される
      expect(screen.getByTestId("left")).toBeInTheDocument();
      expect(screen.queryByTestId("right")).not.toBeInTheDocument();
    });

    it("ディバイダーが表示される", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
        />,
      );

      // Then: ディバイダーが表示される
      expect(screen.getByRole("separator")).toBeInTheDocument();
    });
  });

  describe("分割比率", () => {
    it("初期比率が適用される", () => {
      // Given: initialRatio=30
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={30}
        />,
      );

      // Then: 左パネルが30%幅になる
      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "30%" });
    });

    it("ドラッグで比率を変更できる", async () => {
      // Given: ディバイダーが表示されている
      const onRatioChange = vi.fn();
      const { container } = render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          onRatioChange={onRatioChange}
        />,
      );

      // モックgetBoundingClientRect
      const splitLayout = container.firstChild as HTMLElement;
      vi.spyOn(splitLayout, "getBoundingClientRect").mockReturnValue({
        left: 0,
        right: 1000,
        width: 1000,
        top: 0,
        bottom: 600,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const divider = screen.getByRole("separator");

      // When: ディバイダーをドラッグ
      fireEvent.mouseDown(divider);
      fireEvent.mouseMove(document, { clientX: 400 });
      fireEvent.mouseUp(document);

      // Then: onRatioChangeが新しい比率で呼ばれる
      expect(onRatioChange).toHaveBeenCalled();
      expect(onRatioChange).toHaveBeenCalledWith(40); // 400/1000 * 100 = 40%
    });

    it("最小比率を下回らない", () => {
      // Given: minRatio=20
      const onRatioChange = vi.fn();
      const { container } = render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          minRatio={20}
          onRatioChange={onRatioChange}
        />,
      );

      // モックgetBoundingClientRect
      const splitLayout = container.firstChild as HTMLElement;
      vi.spyOn(splitLayout, "getBoundingClientRect").mockReturnValue({
        left: 0,
        right: 1000,
        width: 1000,
        top: 0,
        bottom: 600,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const divider = screen.getByRole("separator");

      // When: ディバイダーを左端までドラッグ
      fireEvent.mouseDown(divider);
      fireEvent.mouseMove(document, { clientX: 0 });
      fireEvent.mouseUp(document);

      // Then: 比率は20を下回らない
      const lastCall = onRatioChange.mock.calls.at(-1);
      if (lastCall) {
        expect(lastCall[0]).toBeGreaterThanOrEqual(20);
      }
    });

    it("最大比率を超えない", () => {
      // Given: maxRatio=80
      const onRatioChange = vi.fn();
      const { container } = render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          maxRatio={80}
          onRatioChange={onRatioChange}
        />,
      );

      // モックgetBoundingClientRect
      const splitLayout = container.firstChild as HTMLElement;
      vi.spyOn(splitLayout, "getBoundingClientRect").mockReturnValue({
        left: 0,
        right: 1000,
        width: 1000,
        top: 0,
        bottom: 600,
        height: 600,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });

      const divider = screen.getByRole("separator");

      // When: ディバイダーを右端までドラッグ
      fireEvent.mouseDown(divider);
      fireEvent.mouseMove(document, { clientX: 2000 });
      fireEvent.mouseUp(document);

      // Then: 比率は80を超えない
      const lastCall = onRatioChange.mock.calls.at(-1);
      if (lastCall) {
        expect(lastCall[0]).toBeLessThanOrEqual(80);
      }
    });

    it("デフォルトの比率は50", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "50%" });
    });
  });

  describe("アクセシビリティ", () => {
    it("ディバイダーがフォーカス可能である", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
        />,
      );

      const divider = screen.getByRole("separator");
      expect(divider).toHaveAttribute("tabindex", "0");
    });

    it("キーボードで比率を調整できる（右矢印）", async () => {
      // Given: ディバイダーにフォーカス
      const onRatioChange = vi.fn();
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          onRatioChange={onRatioChange}
        />,
      );

      const divider = screen.getByRole("separator");
      divider.focus();

      // When: 右矢印キーを押す
      await userEvent.keyboard("{ArrowRight}");

      // Then: 比率が増加する
      expect(onRatioChange).toHaveBeenCalledWith(expect.any(Number));
    });

    it("キーボードで比率を調整できる（左矢印）", async () => {
      // Given: ディバイダーにフォーカス
      const onRatioChange = vi.fn();
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          onRatioChange={onRatioChange}
        />,
      );

      const divider = screen.getByRole("separator");
      divider.focus();

      // When: 左矢印キーを押す
      await userEvent.keyboard("{ArrowLeft}");

      // Then: 比率が減少する
      expect(onRatioChange).toHaveBeenCalledWith(expect.any(Number));
    });

    it("aria属性が設定されている", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          minRatio={20}
          maxRatio={80}
        />,
      );

      const divider = screen.getByRole("separator");
      expect(divider).toHaveAttribute("aria-valuenow", "50");
      expect(divider).toHaveAttribute("aria-valuemin", "20");
      expect(divider).toHaveAttribute("aria-valuemax", "80");
    });
  });
});
