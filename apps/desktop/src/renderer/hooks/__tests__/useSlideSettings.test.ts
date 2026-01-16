/**
 * useSlideSettings Hook Tests
 *
 * TDD Red Phase: These tests are designed to fail until implementation is complete.
 *
 * @see docs/30-workflows/slide-directory-settings/outputs/phase-2/component-design.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type {
  SlideSettings,
  DirectoryValidationResult,
  SlideSettingsAPI,
} from "@repo/shared/types";

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
      valid: true,
      exists: true,
      writable: true,
    },
  });
};

describe("useSlideSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupDefaultMocks();
  });

  afterEach(() => {
    vi.resetModules();
  });

  // ===========================================================================
  // initialize
  // ===========================================================================

  describe("initialize", () => {
    it("USS-INIT-01: 初期化時に設定を読み込む", async () => {
      // Given: デフォルトモック設定

      // When: フックをレンダリング
      let useSlideSettings: () => unknown;
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      // Then: getAllSettingsが呼び出される
      await waitFor(() => {
        expect(mockSlideSettingsAPI.getAllSettings).toHaveBeenCalled();
      });

      // 設定が取得される
      await waitFor(() => {
        expect(
          (result.current as { settings: SlideSettings }).settings,
        ).toEqual({
          outputDirectory: "~/Documents/Slides",
          autoCreateDirectory: true,
          defaultTheme: "kanagawa",
          schemaVersion: 1,
        });
      });
    });

    it("USS-INIT-02: 読み込みエラー時にエラー状態を設定", async () => {
      // Given: API がエラーを返す
      mockSlideSettingsAPI.getAllSettings.mockResolvedValue({
        success: false,
        error: "Failed to load settings",
      });

      // When: フックをレンダリング
      let useSlideSettings: () => unknown;
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      // Then: エラー状態が設定される
      await waitFor(() => {
        expect(
          (result.current as { error: string | null }).error,
        ).toBeDefined();
      });
    });

    it("USS-INIT-03: ローディング状態を管理する", async () => {
      // Given: 遅延するAPI
      mockSlideSettingsAPI.getAllSettings.mockImplementation(
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
              100,
            );
          }),
      );

      // When: フックをレンダリング
      let useSlideSettings: () => unknown;
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      // Then: 最初はisLoading=true
      expect((result.current as { isLoading: boolean }).isLoading).toBe(true);

      // 読み込み後はisLoading=false
      await waitFor(() => {
        expect((result.current as { isLoading: boolean }).isLoading).toBe(
          false,
        );
      });
    });
  });

  // ===========================================================================
  // setDirectory
  // ===========================================================================

  describe("setDirectory", () => {
    it("USS-SD-01: ディレクトリを設定する", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        setDirectory: (path: string) => Promise<void>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: setDirectoryを呼び出す
      await act(async () => {
        await result.current.setDirectory("/new/path");
      });

      // Then: validateDirectoryが呼び出される
      expect(mockSlideSettingsAPI.validateDirectory).toHaveBeenCalledWith(
        "/new/path",
      );
    });

    it("USS-SD-02: バリデーションエラーを処理する", async () => {
      // Given: バリデーションエラー
      (
        mockSlideSettingsAPI.validateDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: {
          valid: false,
          exists: false,
          writable: false,
          error: "パストラバーサルは許可されていません",
        },
      });

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        validation: DirectoryValidationResult | null;
        setDirectory: (path: string) => Promise<void>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: 無効なパスを設定
      await act(async () => {
        await result.current.setDirectory("../invalid/path");
      });

      // Then: バリデーションエラーが設定される
      expect(result.current.validation?.valid).toBe(false);
    });

    it("USS-SD-03: 楽観的UI更新を行う", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        setDirectory: (path: string) => Promise<void>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: setDirectoryを呼び出す
      act(() => {
        result.current.setDirectory("/optimistic/path");
      });

      // Then: すぐにUIが更新される（楽観的更新）
      expect(result.current.settings?.outputDirectory).toBe("/optimistic/path");
    });
  });

  // ===========================================================================
  // selectDirectory
  // ===========================================================================

  describe("selectDirectory", () => {
    it("USS-SLD-01: ダイアログを開いて結果を返す", async () => {
      // Given: ダイアログで選択されたパス
      mockSlideSettingsAPI.selectDirectory.mockResolvedValue({
        success: true,
        data: "/dialog/selected/path",
      });

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        selectDirectory: () => Promise<string | null>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: selectDirectoryを呼び出す
      let selectedPath: string | null = null;
      await act(async () => {
        selectedPath = await result.current.selectDirectory();
      });

      // Then: 選択されたパスが返される
      expect(selectedPath).toBe("/dialog/selected/path");
      expect(mockSlideSettingsAPI.selectDirectory).toHaveBeenCalled();
    });

    it("USS-SLD-02: キャンセル時は状態を変更しない", async () => {
      // Given: ダイアログがキャンセルされる
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: null,
      });

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        selectDirectory: () => Promise<string | null>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      const originalDirectory = result.current.settings?.outputDirectory;

      // When: selectDirectoryを呼び出す（キャンセル）
      let selectedPath: string | null = null;
      await act(async () => {
        selectedPath = await result.current.selectDirectory();
      });

      // Then: nullが返され、状態は変更されない
      expect(selectedPath).toBeNull();
      expect(result.current.settings?.outputDirectory).toBe(originalDirectory);
    });

    it("USS-SLD-03: 選択が完了すると結果を返す", async () => {
      // Given: ダイアログが選択を返す
      (
        mockSlideSettingsAPI.selectDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: true,
        data: "/selected/path",
      });

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        selectDirectory: () => Promise<string | null>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: selectDirectoryを呼び出す
      let selectedPath: string | null = null;
      await act(async () => {
        selectedPath = await result.current.selectDirectory();
      });

      // Then: 選択されたパスが返され、状態が更新される
      expect(selectedPath).toBe("/selected/path");
      expect(result.current.settings?.outputDirectory).toBe("/selected/path");
    });
  });

  // ===========================================================================
  // save
  // ===========================================================================

  describe("save", () => {
    it("USS-SAVE-01: 設定を永続化する", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        setDirectory: (path: string) => Promise<void>;
        save: () => Promise<boolean>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // パスを変更
      await act(async () => {
        await result.current.setDirectory("/new/path");
      });

      // When: saveを呼び出す
      await act(async () => {
        await result.current.save();
      });

      // Then: setDirectoryAPIが呼び出される
      expect(mockSlideSettingsAPI.setDirectory).toHaveBeenCalledWith(
        "/new/path",
      );
    });

    it("USS-SAVE-02: 保存成功でisModifiedをfalseに", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        isModified: boolean;
        setDirectory: (path: string) => Promise<void>;
        save: () => Promise<boolean>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // パスを変更
      await act(async () => {
        await result.current.setDirectory("/new/path");
      });

      // isModified=true
      expect(result.current.isModified).toBe(true);

      // When: saveを呼び出す
      await act(async () => {
        await result.current.save();
      });

      // Then: isModified=false
      expect(result.current.isModified).toBe(false);
    });

    it("USS-SAVE-03: 保存失敗でエラーを返す", async () => {
      // Given: 保存が失敗
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        success: false,
        error: "保存に失敗しました",
      });

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        error: string | null;
        setDirectory: (path: string) => Promise<void>;
        save: () => Promise<boolean>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // パスを変更
      await act(async () => {
        await result.current.setDirectory("/new/path");
      });

      // When: saveを呼び出す
      let success: boolean;
      await act(async () => {
        success = await result.current.save();
      });

      // Then: 失敗が返される
      expect(success!).toBe(false);
      expect(result.current.error).toBeDefined();
    });

    it("USS-SAVE-04: 保存中の状態を管理する", async () => {
      // Given: 遅延する保存API
      (
        mockSlideSettingsAPI.setDirectory as ReturnType<typeof vi.fn>
      ).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () =>
                resolve({
                  success: true,
                }),
              100,
            );
          }),
      );

      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        isSaving: boolean;
        setDirectory: (path: string) => Promise<void>;
        save: () => Promise<boolean>;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      await act(async () => {
        await result.current.setDirectory("/new/path");
      });

      // When: saveを呼び出す
      let savePromise: Promise<boolean>;
      act(() => {
        savePromise = result.current.save();
      });

      // Then: 保存中はisSaving=true
      expect(result.current.isSaving).toBe(true);

      // 保存後はisSaving=false
      await act(async () => {
        await savePromise;
      });

      expect(result.current.isSaving).toBe(false);
    });
  });

  // ===========================================================================
  // その他のユーティリティ
  // ===========================================================================

  describe("utilities", () => {
    it("USS-UTIL-01: autoCreateDirectoryを更新する", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        setAutoCreateDirectory: (value: boolean) => void;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      // When: autoCreateDirectoryを変更
      act(() => {
        result.current.setAutoCreateDirectory(false);
      });

      // Then: 値が更新される
      expect(result.current.settings?.autoCreateDirectory).toBe(false);
    });

    it("USS-UTIL-02: resetを呼ぶと元の設定に戻る", async () => {
      // When: フックをレンダリング
      let useSlideSettings: () => {
        settings: SlideSettings | null;
        setDirectory: (path: string) => Promise<void>;
        reset: () => void;
      };
      try {
        const module = await import("../useSlideSettings");
        useSlideSettings = module.useSlideSettings;
      } catch {
        throw new Error("useSlideSettings hook not implemented");
      }

      const { result } = renderHook(() => useSlideSettings());

      await waitFor(() => {
        expect(result.current.settings).not.toBeNull();
      });

      const originalDirectory = result.current.settings?.outputDirectory;

      // パスを変更
      await act(async () => {
        await result.current.setDirectory("/changed/path");
      });

      // When: resetを呼び出す
      act(() => {
        result.current.reset();
      });

      // Then: 元の設定に戻る
      expect(result.current.settings?.outputDirectory).toBe(originalDirectory);
    });
  });
});
