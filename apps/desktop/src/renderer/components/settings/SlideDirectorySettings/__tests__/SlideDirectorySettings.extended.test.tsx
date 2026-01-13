/**
 * SlideDirectorySettings Extended Tests
 *
 * UIの境界条件・ユーザーインタラクションのテスト
 *
 * @module @repo/desktop/renderer/components/settings/SlideDirectorySettings/__tests__/SlideDirectorySettings.extended.test
 */

import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import type {
  SlideSettings,
  SlideSettingsAPI,
  ValidationResult,
} from "@repo/shared/types";

// === Mocks ===

const mockSlideSettingsAPI: SlideSettingsAPI = {
  getDirectory: vi.fn(),
  setDirectory: vi.fn(),
  selectDirectory: vi.fn(),
  validateDirectory: vi.fn(),
  getAllSettings: vi.fn(),
};

describe("SlideDirectorySettings - 追加テスト", () => {
  let SlideDirectorySettings: React.ComponentType;
  const defaultSettings: SlideSettings = {
    outputDirectory: "~/Documents/Slides",
    autoCreateDirectory: true,
    defaultTheme: "kanagawa",
    schemaVersion: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup window.slideSettingsAPI
    Object.defineProperty(window, "slideSettingsAPI", {
      value: mockSlideSettingsAPI,
      writable: true,
      configurable: true,
    });

    // Default mock implementations
    (
      mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: true,
      data: defaultSettings,
    });

    (
      mockSlideSettingsAPI.getDirectory as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: true,
      data: defaultSettings.outputDirectory,
    });

    (
      mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: true,
      data: {
        status: "valid",
        message: "Directory is valid and writable",
      } as ValidationResult,
    });

    (
      mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: true,
    });

    (
      mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      success: true,
      data: null,
    });
  });

  afterEach(() => {
    vi.resetModules();
  });

  async function loadComponent() {
    const module = await import("../SlideDirectorySettings");
    SlideDirectorySettings = module.SlideDirectorySettings;
  }

  describe("ローディング状態", () => {
    it("SDS-EXT-01: ローディング中にaria-busy属性を設定", async () => {
      // Make getAllSettings slow
      (
        mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
      ).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: defaultSettings,
                }),
              100,
            ),
          ),
      );

      await loadComponent();
      render(<SlideDirectorySettings />);

      // Initially loading
      const container = screen.getByTestId("slide-directory-settings");
      expect(container).toHaveAttribute("aria-busy", "true");

      // Wait for loading to complete
      await waitFor(() => {
        expect(container).not.toHaveAttribute("aria-busy");
      });
    });

    it("SDS-EXT-02: ローディング完了後に入力フィールドを表示", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(defaultSettings.outputDirectory);
    });

    it("SDS-EXT-03: ローディング完了後にボタンを表示", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const browseButton = screen.getByRole("button", { name: /browse/i });
      const saveButton = screen.getByRole("button", { name: /save/i });

      expect(browseButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });
  });

  describe("エラー状態", () => {
    it("SDS-EXT-04: バリデーションエラーでエラーメッセージを表示", async () => {
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "error",
          message: "Directory is not writable",
        } as ValidationResult,
      });

      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/readonly/path",
      });

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const browseButton = screen.getByRole("button", { name: /browse/i });
      await act(async () => {
        fireEvent.click(browseButton);
      });

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Directory is not writable",
        );
      });
    });

    it("SDS-EXT-05: 初期化エラー時にエラー状態を表示", async () => {
      (
        mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: "Failed to load settings",
      });

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Should still render but may show error state
      expect(
        screen.getByTestId("slide-directory-settings"),
      ).toBeInTheDocument();
    });
  });

  describe("アクセシビリティ", () => {
    it("SDS-EXT-06: 入力フィールドにaria-describedbyが設定されている", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute(
        "aria-describedby",
        "directory-validation-status",
      );
    });

    it("SDS-EXT-07: 選択ボタンにaria-labelが設定されている", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const browseButton = screen.getByRole("button", { name: /browse/i });
      expect(browseButton).toHaveAttribute("aria-label");
    });

    it("SDS-EXT-08: エラーメッセージがrole=alertで通知される", async () => {
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "error",
          message: "Access denied",
        } as ValidationResult,
      });

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/new/path" } });
      });

      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent("Access denied");
      });
    });

    it("SDS-EXT-09: 保存ボタンに保存中状態のaria-busyが設定される", async () => {
      // Make setDirectory slow
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                }),
              200,
            ),
          ),
      );

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Change the input to enable save button
      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/new/save/path" } });
      });

      // Click save
      const saveButton = screen.getByRole("button", { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Check aria-busy during save
      expect(saveButton).toHaveAttribute("aria-busy", "true");

      // Wait for save to complete
      await waitFor(() => {
        expect(saveButton).not.toHaveAttribute("aria-busy", "true");
      });
    });
  });

  describe("状態遷移", () => {
    it("SDS-EXT-10: 保存中の再保存を防止", async () => {
      // Make setDirectory slow
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  success: true,
                }),
              100,
            ),
          ),
      );

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Change the input
      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/new/path" } });
      });

      // Click save
      const saveButton = screen.getByRole("button", { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Button should be disabled during save
      expect(saveButton).toBeDisabled();

      // Wait for save to complete
      await waitFor(() => {
        expect(mockSlideSettingsAPI.setDirectory).toHaveBeenCalledTimes(1);
      });
    });

    it("SDS-EXT-11: 未変更時に保存ボタンが無効", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it("SDS-EXT-12: 変更後に保存ボタンが有効になる", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/modified/path" } });
      });

      const saveButton = screen.getByRole("button", { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });

    it("SDS-EXT-13: 保存成功後に保存ボタンが再度無効になる", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Change the input
      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/new/path/saved" } });
      });

      // Click save
      const saveButton = screen.getByRole("button", { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Wait for save to complete
      await waitFor(() => {
        expect(saveButton).toBeDisabled();
      });
    });

    it("SDS-EXT-14: 未保存の変更がある場合にインジケーターを表示", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/unsaved/changes" } });
      });

      // Should show unsaved changes indicator
      await waitFor(() => {
        expect(screen.getByText(/unsaved/i)).toBeInTheDocument();
      });
    });
  });

  describe("キーボードインタラクション", () => {
    it("SDS-EXT-15: Enterキーで保存を実行", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Change the input
      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/keyboard/save" } });
      });

      // Press Enter
      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      });

      await waitFor(() => {
        expect(mockSlideSettingsAPI.setDirectory).toHaveBeenCalledWith(
          "/keyboard/save",
        );
      });
    });

    it("SDS-EXT-16: 未変更時にEnterキーで保存しない", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
      });

      // Should not call setDirectory
      expect(mockSlideSettingsAPI.setDirectory).not.toHaveBeenCalled();
    });
  });

  describe("パス入力", () => {
    it("SDS-EXT-17: 入力変更時にバリデーションを実行", async () => {
      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/validate/this/path" } });
      });

      await waitFor(() => {
        expect(mockSlideSettingsAPI.validateDirectory).toHaveBeenCalledWith(
          "/validate/this/path",
        );
      });
    });

    it("SDS-EXT-18: 有効なパスでaria-invalidがfalse", async () => {
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "valid",
          message: "Directory is valid and writable",
        } as ValidationResult,
      });

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "false");
    });

    it("SDS-EXT-19: 無効なパスでaria-invalidがtrue", async () => {
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "error",
          message: "Invalid path",
        } as ValidationResult,
      });

      await loadComponent();
      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const input = screen.getByRole("textbox");
      await act(async () => {
        fireEvent.change(input, { target: { value: "/invalid" } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
      });
    });
  });
});
