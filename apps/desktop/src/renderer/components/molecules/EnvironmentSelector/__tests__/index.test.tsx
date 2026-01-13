/**
 * EnvironmentSelector Component Tests (TDD Green Phase)
 * @module EnvironmentSelector.test
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EnvironmentType } from "@repo/shared/types/agent";
import { EnvironmentSelector } from "../index";

describe("EnvironmentSelector", () => {
  const defaultProps = {
    currentEnvironment: "html" as EnvironmentType,
    availableEnvironments: ["none", "html", "markdown"] as EnvironmentType[],
    onEnvironmentChange: vi.fn(),
  };

  describe("環境選択", () => {
    it("現在の環境が表示される", () => {
      // Given: currentEnvironment="html"
      render(<EnvironmentSelector {...defaultProps} />);

      // Then: "HTML"が選択状態で表示される
      expect(screen.getByText("HTML")).toBeInTheDocument();
    });

    it("環境を切り替えられる", async () => {
      // Given: 複数の環境が利用可能
      const onEnvironmentChange = vi.fn();
      render(
        <EnvironmentSelector
          {...defaultProps}
          onEnvironmentChange={onEnvironmentChange}
        />,
      );

      // When: ドロップダウンで別の環境を選択
      const dropdown = screen.getByRole("combobox");
      await userEvent.selectOptions(dropdown, "markdown");

      // Then: onEnvironmentChangeが呼ばれる
      expect(onEnvironmentChange).toHaveBeenCalledWith("markdown");
    });

    it("利用可能な環境のみ表示される", async () => {
      // Given: availableEnvironments=["none", "html"]
      render(
        <EnvironmentSelector
          {...defaultProps}
          availableEnvironments={["none", "html"]}
        />,
      );

      // When: ドロップダウンを開く
      const dropdown = screen.getByRole("combobox");
      await userEvent.click(dropdown);

      // Then: 利用可能な環境のみ表示
      expect(screen.getByRole("option", { name: /なし/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /HTML/i })).toBeInTheDocument();
      expect(
        screen.queryByRole("option", { name: /Markdown/i }),
      ).not.toBeInTheDocument();
    });

    it("環境タイプごとに正しいラベルが表示される", async () => {
      render(
        <EnvironmentSelector
          {...defaultProps}
          currentEnvironment="none"
          availableEnvironments={["none", "html", "markdown"]}
        />,
      );

      const dropdown = screen.getByRole("combobox");
      await userEvent.click(dropdown);

      // 日本語ラベルの確認
      expect(screen.getByRole("option", { name: /なし/i })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /HTML/i })).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Markdown/i }),
      ).toBeInTheDocument();
    });
  });

  describe("アクションボタン", () => {
    it("更新ボタンでonRefreshが呼ばれる", async () => {
      // Given: onRefreshコールバック
      const onRefresh = vi.fn();
      render(<EnvironmentSelector {...defaultProps} onRefresh={onRefresh} />);

      // When: 更新ボタンをクリック
      const refreshButton = screen.getByRole("button", {
        name: /リフレッシュ/i,
      });
      await userEvent.click(refreshButton);

      // Then: onRefreshが呼ばれる
      expect(onRefresh).toHaveBeenCalled();
    });

    it("全画面ボタンでonFullscreenが呼ばれる", async () => {
      // Given: onFullscreenコールバック
      const onFullscreen = vi.fn();
      render(
        <EnvironmentSelector {...defaultProps} onFullscreen={onFullscreen} />,
      );

      // When: 全画面ボタンをクリック
      const fullscreenButton = screen.getByRole("button", {
        name: /フルスクリーン/i,
      });
      await userEvent.click(fullscreenButton);

      // Then: onFullscreenが呼ばれる
      expect(onFullscreen).toHaveBeenCalled();
    });

    it("onRefreshが未設定の場合、更新ボタンが表示されない", () => {
      render(<EnvironmentSelector {...defaultProps} onRefresh={undefined} />);

      expect(
        screen.queryByRole("button", { name: /リフレッシュ/i }),
      ).not.toBeInTheDocument();
    });

    it("onFullscreenが未設定の場合、全画面ボタンが表示されない", () => {
      render(
        <EnvironmentSelector {...defaultProps} onFullscreen={undefined} />,
      );

      expect(
        screen.queryByRole("button", { name: /フルスクリーン/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("無効状態", () => {
    it("disabled時はドロップダウンが操作不可", async () => {
      // Given: disabled=true
      const onEnvironmentChange = vi.fn();
      render(
        <EnvironmentSelector
          {...defaultProps}
          disabled={true}
          onEnvironmentChange={onEnvironmentChange}
        />,
      );

      // When: ドロップダウンが無効
      const dropdown = screen.getByRole("combobox");

      // Then: ドロップダウンが無効状態
      expect(dropdown).toBeDisabled();

      // 操作を試みてもコールバックが呼ばれない
      await userEvent.selectOptions(dropdown, "markdown");
      expect(onEnvironmentChange).not.toHaveBeenCalled();
    });

    it("disabled時はボタンも操作不可", async () => {
      const onRefresh = vi.fn();
      const onFullscreen = vi.fn();
      render(
        <EnvironmentSelector
          {...defaultProps}
          disabled={true}
          onRefresh={onRefresh}
          onFullscreen={onFullscreen}
        />,
      );

      const refreshButton = screen.getByRole("button", {
        name: /リフレッシュ/i,
      });
      const fullscreenButton = screen.getByRole("button", {
        name: /フルスクリーン/i,
      });

      expect(refreshButton).toBeDisabled();
      expect(fullscreenButton).toBeDisabled();
    });
  });

  describe("アクセシビリティ", () => {
    it("ドロップダウンにaria-labelが設定されている", () => {
      render(<EnvironmentSelector {...defaultProps} />);

      const dropdown = screen.getByRole("combobox");
      expect(dropdown).toHaveAttribute("aria-label");
    });

    it("ボタンにaria-labelが設定されている", () => {
      render(
        <EnvironmentSelector
          {...defaultProps}
          onRefresh={vi.fn()}
          onFullscreen={vi.fn()}
        />,
      );

      const refreshButton = screen.getByRole("button", {
        name: /リフレッシュ/i,
      });
      const fullscreenButton = screen.getByRole("button", {
        name: /フルスクリーン/i,
      });

      expect(refreshButton).toHaveAccessibleName();
      expect(fullscreenButton).toHaveAccessibleName();
    });
  });
});
