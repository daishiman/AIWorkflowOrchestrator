/**
 * EnvironmentSelector Edge Cases Tests (Phase 6 - Test Expansion)
 * @module EnvironmentSelector.edge-cases.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EnvironmentSelector } from "../index";
import type { EnvironmentType } from "@repo/shared/types/agent";

const ALL_ENVIRONMENTS: EnvironmentType[] = [
  "none",
  "html",
  "markdown",
  "terminal",
  "code",
];

describe("EnvironmentSelector - Edge Cases", () => {
  describe("ボタンの連続クリック", () => {
    it("リフレッシュボタンの連続クリックは複数回コールバックを呼ぶ", () => {
      const onRefresh = vi.fn();
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onRefresh={onRefresh}
        />,
      );

      const refreshButton = screen.getByTestId("refresh-button");
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(3);
    });

    it("フルスクリーンボタンの連続クリック", () => {
      const onFullscreen = vi.fn();
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onFullscreen={onFullscreen}
        />,
      );

      const fullscreenButton = screen.getByTestId("fullscreen-button");
      fireEvent.click(fullscreenButton);
      fireEvent.click(fullscreenButton);

      expect(onFullscreen).toHaveBeenCalledTimes(2);
    });
  });

  describe("環境タイプの切り替え", () => {
    it("全ての環境タイプが選択可能", () => {
      ALL_ENVIRONMENTS.forEach((type) => {
        const { unmount } = render(
          <EnvironmentSelector
            currentEnvironment={type}
            availableEnvironments={ALL_ENVIRONMENTS}
            onEnvironmentChange={vi.fn()}
          />,
        );
        expect(screen.getByTestId("environment-selector")).toBeInTheDocument();
        unmount();
      });
    });

    it("同じ環境タイプを選択しても問題なく動作", () => {
      const onEnvironmentChange = vi.fn();
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={onEnvironmentChange}
        />,
      );

      const select = screen.getByTestId("environment-select");
      fireEvent.change(select, { target: { value: "html" } });

      expect(onEnvironmentChange).toHaveBeenCalledWith("html");
    });
  });

  describe("ボタン表示条件", () => {
    it("onRefreshが渡されていない場合、リフレッシュボタンは表示されない", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          // onRefresh is not passed
        />,
      );

      expect(screen.queryByTestId("refresh-button")).not.toBeInTheDocument();
    });

    it("onFullscreenが渡されていない場合、フルスクリーンボタンは表示されない", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          // onFullscreen is not passed
        />,
      );

      expect(screen.queryByTestId("fullscreen-button")).not.toBeInTheDocument();
    });

    it("currentEnvironmentがnoneの場合、リフレッシュボタンは表示されない", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="none"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("refresh-button")).not.toBeInTheDocument();
    });

    it("currentEnvironmentがnoneの場合、フルスクリーンボタンは表示されない", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="none"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onFullscreen={vi.fn()}
        />,
      );

      expect(screen.queryByTestId("fullscreen-button")).not.toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("セレクトボックスにaria-labelが設定されている", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
        />,
      );

      const select = screen.getByTestId("environment-select");
      expect(select).toHaveAttribute("aria-label", "実行環境を選択");
    });

    it("ボタンにaria-labelが設定されている", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onRefresh={vi.fn()}
          onFullscreen={vi.fn()}
        />,
      );

      const refreshButton = screen.getByTestId("refresh-button");
      const fullscreenButton = screen.getByTestId("fullscreen-button");

      expect(refreshButton).toHaveAttribute("aria-label", "リフレッシュ");
      expect(fullscreenButton).toHaveAttribute("aria-label", "フルスクリーン");
    });
  });

  describe("disabled状態", () => {
    it("disabledの場合、セレクトボックスが無効化される", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          disabled
        />,
      );

      const select = screen.getByTestId("environment-select");
      expect(select).toBeDisabled();
    });

    it("disabledの場合、ボタンも無効化される", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          onRefresh={vi.fn()}
          onFullscreen={vi.fn()}
          disabled
        />,
      );

      const refreshButton = screen.getByTestId("refresh-button");
      const fullscreenButton = screen.getByTestId("fullscreen-button");

      expect(refreshButton).toBeDisabled();
      expect(fullscreenButton).toBeDisabled();
    });
  });

  describe("カスタムクラス", () => {
    it("classNameが適用される", () => {
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={ALL_ENVIRONMENTS}
          onEnvironmentChange={vi.fn()}
          className="custom-class"
        />,
      );

      const container = screen.getByTestId("environment-selector");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("限定された環境一覧", () => {
    it("availableEnvironmentsで指定された環境のみが選択肢に表示される", () => {
      const limitedEnvironments: EnvironmentType[] = ["html", "markdown"];
      render(
        <EnvironmentSelector
          currentEnvironment="html"
          availableEnvironments={limitedEnvironments}
          onEnvironmentChange={vi.fn()}
        />,
      );

      const select = screen.getByTestId("environment-select");
      const options = select.querySelectorAll("option");

      expect(options).toHaveLength(2);
    });
  });
});
