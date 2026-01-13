/**
 * SplitLayout Edge Cases Tests (Phase 6 - Test Expansion)
 * @module SplitLayout.edge-cases.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SplitLayout } from "../index";

describe("SplitLayout - Edge Cases", () => {
  describe("境界値テスト", () => {
    it("initialRatio=0でも正しく動作する", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={0}
          minRatio={0}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "0%" });
    });

    it("initialRatio=100でも正しく動作する", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={100}
          maxRatio={100}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "100%" });
    });

    it("minRatio > initialRatioの場合、minRatioにクランプされる", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={10}
          minRatio={20}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "20%" });
    });

    it("maxRatio < initialRatioの場合、maxRatioにクランプされる", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={90}
          maxRatio={80}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveStyle({ width: "80%" });
    });
  });

  describe("キーボードナビゲーション", () => {
    it("Homeキーで最小比率に移動する", () => {
      const onRatioChange = vi.fn();
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          minRatio={20}
          onRatioChange={onRatioChange}
        />,
      );

      const divider = screen.getByRole("separator");
      fireEvent.keyDown(divider, { key: "Home" });

      expect(onRatioChange).toHaveBeenCalledWith(20);
    });

    it("Endキーで最大比率に移動する", () => {
      const onRatioChange = vi.fn();
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          maxRatio={80}
          onRatioChange={onRatioChange}
        />,
      );

      const divider = screen.getByRole("separator");
      fireEvent.keyDown(divider, { key: "End" });

      expect(onRatioChange).toHaveBeenCalledWith(80);
    });

    it("連続したキー押下が累積する", () => {
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

      // 右に2回移動 (50 -> 55 -> 60)
      fireEvent.keyDown(divider, { key: "ArrowRight" });
      fireEvent.keyDown(divider, { key: "ArrowRight" });

      expect(onRatioChange).toHaveBeenCalledTimes(2);
    });

    it("境界値での追加キー押下は変化しない", () => {
      const onRatioChange = vi.fn();
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={80}
          maxRatio={80}
          onRatioChange={onRatioChange}
        />,
      );

      const divider = screen.getByRole("separator");

      // 既に最大値なので右矢印は80のまま
      fireEvent.keyDown(divider, { key: "ArrowRight" });

      expect(onRatioChange).toHaveBeenCalledWith(80);
    });
  });

  describe("タッチイベント", () => {
    it("タッチドラッグ開始でドラッグ状態になる", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
        />,
      );

      const divider = screen.getByRole("separator");

      fireEvent.touchStart(divider, {
        touches: [{ clientX: 500 }],
      });

      // ドラッグ中はカーソルスタイルが変わる
      const container = screen.getByTestId("split-layout");
      expect(container).toHaveClass("cursor-col-resize");
    });

    it("タッチエンドでドラッグ状態が解除される", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
        />,
      );

      const divider = screen.getByRole("separator");

      fireEvent.touchStart(divider, {
        touches: [{ clientX: 500 }],
      });

      fireEvent.touchEnd(document);

      const container = screen.getByTestId("split-layout");
      expect(container).not.toHaveClass("cursor-col-resize");
    });
  });

  describe("onRatioChangeがない場合", () => {
    it("コールバックなしでもドラッグは動作する", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
          // onRatioChangeは渡さない
        />,
      );

      const divider = screen.getByRole("separator");

      // エラーなくドラッグ開始できる
      expect(() => {
        fireEvent.mouseDown(divider);
        fireEvent.mouseMove(document, { clientX: 400 });
        fireEvent.mouseUp(document);
      }).not.toThrow();
    });

    it("コールバックなしでもキーボード操作は動作する", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
        />,
      );

      const divider = screen.getByRole("separator");

      expect(() => {
        fireEvent.keyDown(divider, { key: "ArrowRight" });
      }).not.toThrow();
    });
  });

  describe("パネルコンテンツ", () => {
    it("空のパネルでもレイアウトが崩れない", () => {
      render(
        <SplitLayout leftPanel={null} rightPanel={null} initialRatio={50} />,
      );

      expect(screen.getByTestId("split-layout")).toBeInTheDocument();
      expect(screen.getByTestId("left-panel")).toBeInTheDocument();
      expect(screen.getByTestId("right-panel")).toBeInTheDocument();
    });

    it("大きなコンテンツを持つパネルでオーバーフローが隠される", () => {
      const largeContent = <div style={{ width: "2000px" }}>Large content</div>;

      render(
        <SplitLayout
          leftPanel={largeContent}
          rightPanel={<div>Right</div>}
          initialRatio={50}
        />,
      );

      const leftPanel = screen.getByTestId("left-panel");
      expect(leftPanel).toHaveClass("overflow-hidden");
    });
  });

  describe("aria属性", () => {
    it("aria-valuenowが比率変更で更新される", () => {
      render(
        <SplitLayout
          leftPanel={<div>Left</div>}
          rightPanel={<div>Right</div>}
          initialRatio={50}
        />,
      );

      const divider = screen.getByRole("separator");
      expect(divider).toHaveAttribute("aria-valuenow", "50");

      fireEvent.keyDown(divider, { key: "ArrowRight" }); // 55に増加

      expect(divider).toHaveAttribute("aria-valuenow", "55");
    });
  });
});
