/**
 * authModeSlice エラーハンドリングテスト
 *
 * Phase 6: テスト拡充 - IPC障害・タイムアウト・エッジケースのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/phase-6-test-expansion.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createAuthModeSlice,
  resetAuthModeListenerFlag,
  type AuthModeSlice,
} from "../authModeSlice";

// =============================================================================
// モック定義
// =============================================================================

const mockElectronAPI = {
  authMode: {
    get: vi.fn(),
    set: vi.fn(),
    status: vi.fn(),
    validate: vi.fn(),
    onModeChanged: vi.fn(),
  },
};

// =============================================================================
// ヘルパー関数
// =============================================================================

function createTestSlice() {
  let state: AuthModeSlice | null = null;
  const set = vi.fn(
    (
      updater:
        | Partial<AuthModeSlice>
        | ((s: AuthModeSlice) => Partial<AuthModeSlice>),
    ) => {
      if (typeof updater === "function" && state) {
        state = { ...state, ...updater(state) };
      } else {
        state = { ...state!, ...updater };
      }
    },
  );
  const get = vi.fn(() => state as AuthModeSlice);

  // @ts-expect-error - Creating test slice with mock functions
  state = createAuthModeSlice(set, get, {});

  return { state: () => state as AuthModeSlice, set, get };
}

// =============================================================================
// グローバルモック設定
// =============================================================================

beforeEach(() => {
  vi.clearAllMocks();
  resetAuthModeListenerFlag();
  // @ts-expect-error - Mock window.electronAPI
  global.window = {
    electronAPI: mockElectronAPI,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  // @ts-expect-error - Clean up
  delete global.window;
});

// =============================================================================
// テストスイート
// =============================================================================

describe("authModeSlice エラーハンドリング", () => {
  // ===========================================================================
  // IPC 障害テスト
  // ===========================================================================
  describe("IPC障害", () => {
    it("fetchMode で IPC 呼び出しが失敗した場合のエラー処理", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue(new Error("IPC failed"));

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("予期しないエラーが発生しました");
      expect(state().isLoading).toBe(false);
    });

    it("setMode で IPC 呼び出しが失敗した場合のエラー処理", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockRejectedValue(
        new Error("Connection refused"),
      );

      const { state } = createTestSlice();

      // Act
      await state().setMode("api-key");

      // Assert
      expect(state().error).toBe("予期しないエラーが発生しました");
      expect(state().isLoading).toBe(false);
      expect(state().mode).toBe("subscription"); // 変更されない
    });

    it("fetchStatus で IPC 呼び出しが失敗した場合は fallback status を設定する", async () => {
      // Arrange
      mockElectronAPI.authMode.status.mockRejectedValue(
        new Error("Status fetch failed"),
      );

      const { state } = createTestSlice();

      // Act
      await state().fetchStatus();

      // Assert
      expect(state().status).toEqual(
        expect.objectContaining({
          mode: "subscription",
          isValid: false,
          hasCredentials: false,
          message: "ネットワーク接続を確認してください",
          errorCode: "auth-mode/unknown-error",
        }),
      );
    });
  });

  // ===========================================================================
  // レスポンスエラーテスト
  // ===========================================================================
  describe("レスポンスエラー", () => {
    it("fetchMode で success:false の場合のエラー処理", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: false,
        error: { message: "認証エラー" },
      });

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("認証エラー");
      expect(state().isLoading).toBe(false);
    });

    it("fetchMode で success:false かつ error が undefined の場合", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: false,
      });

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("認証方式の取得に失敗しました");
    });

    it("setMode で success:false かつ error.message が undefined の場合", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockResolvedValue({
        success: false,
        error: {},
      });

      const { state } = createTestSlice();

      // Act
      await state().setMode("api-key");

      // Assert
      expect(state().error).toBe("認証方式の設定に失敗しました");
    });

    it("validate で success:false の場合は isValid:false を返す", async () => {
      // Arrange
      mockElectronAPI.authMode.validate.mockResolvedValue({
        success: false,
      });

      const { state } = createTestSlice();

      // Act
      const result = await state().validate();

      // Assert
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe("auth-mode/unknown-error");
    });
  });

  // ===========================================================================
  // ネットワークエラー変換テスト
  // ===========================================================================
  describe("ネットワークエラー変換", () => {
    it("fetch failed を含むエラーはネットワークエラーに変換", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue(
        new Error("fetch failed: ECONNREFUSED"),
      );

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("ネットワーク接続を確認してください");
    });

    it("Network を含むエラーはネットワークエラーに変換", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockRejectedValue(
        new Error("Network request failed"),
      );

      const { state } = createTestSlice();

      // Act
      await state().setMode("api-key");

      // Assert
      expect(state().error).toBe("ネットワーク接続を確認してください");
    });
  });

  // ===========================================================================
  // Keychain エラー変換テスト
  // ===========================================================================
  describe("Keychain エラー変換", () => {
    it("keychain を含むエラーは Keychain エラーに変換", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue(
        new Error("Keychain access failed"),
      );

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("Keychainへのアクセスが拒否されました");
    });

    it("access denied を含むエラーは Keychain エラーに変換", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockRejectedValue(
        new Error("User access denied"),
      );

      const { state } = createTestSlice();

      // Act
      await state().setMode("subscription");

      // Assert
      expect(state().error).toBe("Keychainへのアクセスが拒否されました");
    });
  });

  // ===========================================================================
  // 非 Error オブジェクトのエラー処理テスト
  // ===========================================================================
  describe("非 Error オブジェクトのエラー処理", () => {
    it("文字列がスローされた場合は汎用エラーメッセージ", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue("String error");

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("予期しないエラーが発生しました");
    });

    it("数値がスローされた場合は汎用エラーメッセージ", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockRejectedValue(500);

      const { state } = createTestSlice();

      // Act
      await state().setMode("api-key");

      // Assert
      expect(state().error).toBe("予期しないエラーが発生しました");
    });

    it("null がスローされた場合は汎用エラーメッセージ", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue(null);

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().error).toBe("予期しないエラーが発生しました");
    });
  });

  // ===========================================================================
  // electronAPI が利用不可のテスト
  // ===========================================================================
  describe("electronAPI 利用不可", () => {
    it("authMode オブジェクト自体が undefined の場合", async () => {
      // Arrange
      // @ts-expect-error - Mock missing authMode
      global.window.electronAPI = {};

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert: エラーにならず、デフォルト値のまま
      expect(state().mode).toBe("subscription");
      expect(state().isLoading).toBe(false);
      expect(state().error).toBeNull();
    });

    it("window.electronAPI 自体が undefined の場合", async () => {
      // Arrange
      // @ts-expect-error - Mock missing electronAPI
      global.window = {};

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert: エラーにならず、デフォルト値のまま
      expect(state().mode).toBe("subscription");
      expect(state().isLoading).toBe(false);
    });
  });

  // ===========================================================================
  // ローディング状態管理テスト
  // ===========================================================================
  describe("ローディング状態管理", () => {
    it("fetchMode 開始時に isLoading が true になる", async () => {
      // Arrange
      let _loadingState: boolean | undefined;
      mockElectronAPI.authMode.get.mockImplementation(async () => {
        // 非同期処理開始直後の状態をキャプチャ
        return { success: true, data: { mode: "subscription" } };
      });

      const { state, set } = createTestSlice();

      // ローディング状態をキャプチャするために set をモニタリング
      set.mockImplementation((updater) => {
        const newState =
          typeof updater === "function" ? updater(state()) : updater;
        if (newState.isLoading !== undefined) {
          _loadingState = newState.isLoading;
        }
      });

      // Act
      const promise = state().fetchMode();

      // Assert: 開始直後は isLoading: true
      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ isLoading: true }),
      );

      await promise;
    });

    it("エラー発生時も isLoading が false になる", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockRejectedValue(new Error("Error"));

      const { state } = createTestSlice();

      // Act
      await state().fetchMode();

      // Assert
      expect(state().isLoading).toBe(false);
    });
  });

  // ===========================================================================
  // confirmModeChange エッジケーステスト
  // ===========================================================================
  describe("confirmModeChange エッジケース", () => {
    it("pendingMode が null の場合は何もしない", async () => {
      // Arrange
      const { state } = createTestSlice();

      // Act
      await state().confirmModeChange();

      // Assert: setMode は呼ばれない
      expect(mockElectronAPI.authMode.set).not.toHaveBeenCalled();
    });

    it("confirmModeChange 後は pendingMode がクリアされる", async () => {
      // Arrange
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          hasCredentials: true,
          message: "キー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();
      state().openConfirmDialog("api-key");

      // Act
      await state().confirmModeChange();

      // Assert
      expect(state().pendingMode).toBeNull();
      expect(state().isConfirmDialogOpen).toBe(false);
    });
  });

  // ===========================================================================
  // リスナー登録エッジケーステスト
  // ===========================================================================
  describe("リスナー登録エッジケース", () => {
    it("onModeChanged が undefined の場合は登録をスキップ", () => {
      // Arrange
      mockElectronAPI.authMode.onModeChanged = undefined;
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: true,
        data: { mode: "subscription" },
      });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: null,
      });

      const { state } = createTestSlice();

      // Act & Assert: エラーにならない
      expect(() => state().initializeAuthMode()).not.toThrow();
    });

    it("二重初期化でもリスナーは1回だけ登録", () => {
      // Arrange
      const mockCallback = vi.fn();
      mockElectronAPI.authMode.onModeChanged = mockCallback;
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: true,
        data: { mode: "subscription" },
      });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: null,
      });

      const { state } = createTestSlice();

      // Act
      state().initializeAuthMode();
      state().initializeAuthMode();
      state().initializeAuthMode();

      // Assert: 1回だけ登録
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  // ===========================================================================
  // clearError テスト
  // ===========================================================================
  describe("clearError", () => {
    it("エラーがない状態で clearError を呼んでもエラーにならない", () => {
      // Arrange
      const { state } = createTestSlice();

      // Act & Assert
      expect(() => state().clearError()).not.toThrow();
      expect(state().error).toBeNull();
    });
  });

  // ===========================================================================
  // resetAuthMode テスト
  // ===========================================================================
  describe("resetAuthMode", () => {
    it("エラー状態もリセットされる", async () => {
      // Arrange
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: false,
        error: { message: "エラー" },
      });

      const { state } = createTestSlice();
      await state().fetchMode();
      expect(state().error).toBe("エラー");

      // Act
      state().resetAuthMode();

      // Assert
      expect(state().error).toBeNull();
      expect(state().mode).toBe("subscription");
    });
  });
});
