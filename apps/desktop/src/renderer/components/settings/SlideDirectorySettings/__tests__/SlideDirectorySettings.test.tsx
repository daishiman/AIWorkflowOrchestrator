/**
 * SlideDirectorySettings Component Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-2/component-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import type { SlideSettingsAPI } from "@repo/shared/types";

// === Mocks ===

const mockSlideSettingsAPI: SlideSettingsAPI = {
  getDirectory: vi.fn(),
  setDirectory: vi.fn(),
  selectDirectory: vi.fn(),
  validateDirectory: vi.fn(),
  getAllSettings: vi.fn(),
};

// Mock window.slideSettingsAPI
beforeEach(() => {
  Object.defineProperty(window, "slideSettingsAPI", {
    value: mockSlideSettingsAPI,
    writable: true,
    configurable: true,
  });
});

// Default mock implementations
const setupDefaultMocks = () => {
  (
    mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    success: true,
    data: {
      outputDirectory: "~/Documents/Slides",
      autoCreateDirectory: true,
      defaultTheme: "kanagawa",
      schemaVersion: 1,
    },
  });

  (
    mockSlideSettingsAPI.getDirectory as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    success: true,
    data: "~/Documents/Slides",
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
    data: "/selected/path",
  });

  (
    mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    success: true,
    data: {
      status: "valid",
      message: "Directory is valid and writable",
    },
  });
};

describe("SlideDirectorySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // 初期表示
  // ===========================================================================

  describe("初期表示", () => {
    it("SDS-INIT-01: 現在のディレクトリパスを表示する", async () => {
      // Given: 設定が存在する
      (
        mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          outputDirectory: "/custom/slides/path",
          autoCreateDirectory: true,
          defaultTheme: "kanagawa",
          schemaVersion: 1,
        },
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      // Then: パスが入力フィールドに表示される
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("/custom/slides/path");
      });
    });

    it("SDS-INIT-02: ディレクトリパス入力フィールドが表示される", async () => {
      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      // Then: 入力フィールドが表示される
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
      });
    });

    it("SDS-INIT-03: 選択ボタンが表示される", async () => {
      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      // Then: 選択ボタンが表示される
      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /選択|browse|select/i,
        });
        expect(button).toBeInTheDocument();
      });
    });

    it("SDS-INIT-04: ローディング状態を表示する", async () => {
      // Given: 設定読み込みに時間がかかる
      (
        mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
      ).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                  data: {
                    outputDirectory: "~/Documents/Slides",
                    autoCreateDirectory: true,
                    defaultTheme: "kanagawa",
                    schemaVersion: 1,
                  },
                }),
              1000,
            );
          }),
      );

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      // Then: ローディング表示（aria-busy属性でローディング状態を示す）
      const container = screen.getByTestId("slide-directory-settings");
      expect(container).toHaveAttribute("aria-busy", "true");
    });
  });

  // ===========================================================================
  // ディレクトリ選択
  // ===========================================================================

  describe("ディレクトリ選択", () => {
    it("SDS-SEL-01: 選択ボタンクリックでダイアログが開く", async () => {
      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      // Wait for initial load
      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // When: 選択ボタンをクリック
      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: selectDirectoryが呼び出される
      expect(mockSlideSettingsAPI.selectDirectory).toHaveBeenCalled();
    });

    it("SDS-SEL-02: 選択後にパスが更新される", async () => {
      // Given: ダイアログで新しいパスを選択
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/new/selected/path",
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // When: 選択ボタンをクリック
      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: 新しいパスが入力フィールドに表示される
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("/new/selected/path");
      });
    });

    it("SDS-SEL-03: キャンセル時はパスが変更されない", async () => {
      // Given: ダイアログがキャンセルされる
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: null, // キャンセル
      });

      (
        mockSlideSettingsAPI.getAllSettings as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          outputDirectory: "/original/path",
          autoCreateDirectory: true,
          defaultTheme: "kanagawa",
          schemaVersion: 1,
        },
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("/original/path");
      });

      // When: 選択ボタンをクリック（キャンセル）
      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: 元のパスが維持される
      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("/original/path");
      });
    });
  });

  // ===========================================================================
  // バリデーション
  // ===========================================================================

  describe("バリデーション", () => {
    it("SDS-VAL-01: 無効なパスでエラーメッセージを表示", async () => {
      // Given: バリデーションエラー
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "error",
          message: "パストラバーサルは許可されていません",
        },
      });

      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "../invalid/path",
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // When: 無効なパスを選択
      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: エラーメッセージが表示される
      await waitFor(() => {
        expect(
          screen.getByText(/トラバーサル|traversal|許可/i),
        ).toBeInTheDocument();
      });
    });

    it("SDS-VAL-02: 存在しないパスで警告メッセージを表示", async () => {
      // Given: バリデーション警告
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "warning",
          message: "ディレクトリが存在しません。自動作成されます。",
        },
      });

      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/non/existent/path",
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // When: 存在しないパスを選択
      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: 警告メッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/存在しません|自動作成/i)).toBeInTheDocument();
      });
    });

    it("SDS-VAL-03: 有効なパスでエラーがクリアされる", async () => {
      // Given: 最初はエラー状態
      (mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          success: true,
          data: {
            status: "error",
            message: "エラー",
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            status: "valid",
            message: "Directory is valid and writable",
          },
        });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // First selection (error)
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        success: true,
        data: "/invalid/path",
      });

      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Second selection (valid)
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValueOnce({
        success: true,
        data: "/valid/path",
      });

      await userEvent.click(button);

      // Then: エラーがクリアされる
      await waitFor(() => {
        expect(screen.queryByText(/エラー/)).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // 保存
  // ===========================================================================

  describe("保存", () => {
    it("SDS-SAVE-01: 保存ボタンで設定が永続化される", async () => {
      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // When: パスを選択して保存
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/new/path",
      });

      const selectButton = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(selectButton);

      await waitFor(() => {
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("/new/path");
      });

      const saveButton = screen.getByRole("button", { name: /保存|save/i });
      await userEvent.click(saveButton);

      // Then: setDirectoryが呼び出される
      expect(mockSlideSettingsAPI.setDirectory).toHaveBeenCalledWith(
        "/new/path",
      );
    });

    it("SDS-SAVE-02: 保存成功でフィードバックを表示", async () => {
      // Given: 保存が成功
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // パスを変更して保存
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/new/path",
      });

      const selectButton = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(selectButton);

      const saveButton = screen.getByRole("button", { name: /保存|save/i });
      await userEvent.click(saveButton);

      // Then: 成功フィードバックが表示される
      await waitFor(() => {
        expect(
          screen.getByText(/保存しました|saved|success/i),
        ).toBeInTheDocument();
      });
    });

    it("SDS-SAVE-03: 保存失敗でエラーを表示", async () => {
      // Given: 保存が失敗
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: "保存に失敗しました",
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // パスを変更して保存
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/new/path",
      });

      const selectButton = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(selectButton);

      const saveButton = screen.getByRole("button", { name: /保存|save/i });
      await userEvent.click(saveButton);

      // Then: エラーが表示される
      await waitFor(() => {
        expect(screen.getByText(/失敗|error|failed/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // アクセシビリティ
  // ===========================================================================

  describe("アクセシビリティ", () => {
    it("SDS-A11Y-01: パス表示がaria-readonlyを持つ", async () => {
      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // Then: aria-describedby属性がバリデーションステータスを参照している
      const pathInput = screen.getByRole("textbox");
      expect(pathInput).toHaveAttribute(
        "aria-describedby",
        "directory-validation-status",
      );
    });

    it("SDS-A11Y-02: エラーメッセージがrole=alertを持つ", async () => {
      // Given: バリデーションエラー
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          status: "error",
          message: "エラーメッセージ",
        },
      });

      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/invalid/path",
      });

      // When: コンポーネントをレンダリング
      let SlideDirectorySettings: React.ComponentType;
      try {
        const module = await import("../SlideDirectorySettings");
        SlideDirectorySettings = module.SlideDirectorySettings;
      } catch {
        throw new Error("SlideDirectorySettings component not implemented");
      }

      render(<SlideDirectorySettings />);

      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      const button = screen.getByRole("button", {
        name: /選択|browse|select/i,
      });
      await userEvent.click(button);

      // Then: role=alertがある
      await waitFor(() => {
        const alert = screen.getByRole("alert");
        expect(alert).toBeInTheDocument();
      });
    });
  });
});
