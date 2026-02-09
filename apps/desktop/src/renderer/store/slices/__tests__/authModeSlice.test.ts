/**
 * authModeSlice テスト
 *
 * Phase 5: TDD Green - 認証方式管理Zustand Sliceのテスト
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/state-management-design.md
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

/**
 * electronAPI モック - 各テストでリセットされるようにファクトリ関数で作成
 */
function createMockElectronAPI() {
  return {
    authMode: {
      get: vi.fn(),
      set: vi.fn(),
      status: vi.fn(),
      validate: vi.fn(),
      onModeChanged: vi.fn(),
    },
  };
}

const mockElectronAPI = createMockElectronAPI();

// =============================================================================
// ヘルパー関数
// =============================================================================

/**
 * テスト用のSlice状態とセッターを作成
 */
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
  // モックオブジェクトを再作成してリセット
  mockElectronAPI.authMode = {
    get: vi.fn(),
    set: vi.fn(),
    status: vi.fn(),
    validate: vi.fn(),
    onModeChanged: vi.fn(),
  };
  // @ts-expect-error - Mock window.electronAPI
  global.window = {
    electronAPI: mockElectronAPI,
  };
});

afterEach(() => {
  vi.restoreAllMocks();
  // @ts-expect-error - Clean up
  delete global.window;
});

// =============================================================================
// テストスイート
// =============================================================================

describe("authModeSlice", () => {
  // ===========================================================================
  // 初期状態テスト
  // ===========================================================================
  describe("Initial State", () => {
    it("デフォルトモードはsubscription", () => {
      const { state } = createTestSlice();
      expect(state().mode).toBe("subscription");
    });

    it("初期状態でisLoadingはfalse", () => {
      const { state } = createTestSlice();
      expect(state().isLoading).toBe(false);
    });

    it("初期状態でerrorはnull", () => {
      const { state } = createTestSlice();
      expect(state().error).toBeNull();
    });

    it("初期状態でstatusはnull", () => {
      const { state } = createTestSlice();
      expect(state().status).toBeNull();
    });

    it("初期状態でisConfirmDialogOpenはfalse", () => {
      const { state } = createTestSlice();
      expect(state().isConfirmDialogOpen).toBe(false);
    });

    it("初期状態でpendingModeはnull", () => {
      const { state } = createTestSlice();
      expect(state().pendingMode).toBeNull();
    });
  });

  // ===========================================================================
  // fetchMode テスト
  // ===========================================================================
  describe("fetchMode", () => {
    it("IPCから認証方式を取得して状態を更新する", async () => {
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: true,
        data: { mode: "api-key" },
      });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          message: "APIキー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().mode).toBe("api-key");
      expect(state().isLoading).toBe(false);
    });

    it("electronAPIが利用不可の場合はデフォルト値のまま", async () => {
      // @ts-expect-error - Remove authMode.get
      delete global.window.electronAPI.authMode.get;

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().mode).toBe("subscription");
      expect(state().isLoading).toBe(false);
    });

    it("IPCエラー時はエラー状態を設定する", async () => {
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: false,
        error: { message: "接続エラー" },
      });

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().error).toBe("接続エラー");
      expect(state().isLoading).toBe(false);
    });
  });

  // ===========================================================================
  // setMode テスト
  // ===========================================================================
  describe("setMode", () => {
    it("認証方式をapi-keyに設定できる", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          message: "キー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();

      await state().setMode("api-key");

      expect(state().mode).toBe("api-key");
      expect(mockElectronAPI.authMode.set).toHaveBeenCalledWith({
        mode: "api-key",
      });
    });

    it("認証方式をsubscriptionに設定できる", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          message: "認証済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();
      // 事前にapi-keyに設定
      await state().setMode("api-key");

      await state().setMode("subscription");

      expect(state().mode).toBe("subscription");
    });

    it("設定失敗時はエラー状態を設定する", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({
        success: false,
        error: { message: "設定に失敗しました" },
      });

      const { state } = createTestSlice();

      await state().setMode("api-key");

      expect(state().error).toBe("設定に失敗しました");
      expect(state().mode).toBe("subscription"); // 変更されない
    });

    it("設定成功時は確認ダイアログを閉じる", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          message: "キー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();
      state().openConfirmDialog("api-key");
      expect(state().isConfirmDialogOpen).toBe(true);
      expect(state().pendingMode).toBe("api-key");

      await state().setMode("api-key");

      expect(state().isConfirmDialogOpen).toBe(false);
      expect(state().pendingMode).toBeNull();
    });
  });

  // ===========================================================================
  // fetchStatus テスト
  // ===========================================================================
  describe("fetchStatus", () => {
    it("認証状態を取得して状態を更新する", async () => {
      const now = Date.now();
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "subscription",
          isValid: true,
          message: "認証済み",
          lastCheckedAt: now,
        },
      });

      const { state } = createTestSlice();

      await state().fetchStatus();

      expect(state().status).toEqual({
        mode: "subscription",
        isValid: true,
        message: "認証済み",
        lastCheckedAt: now,
      });
    });

    it("electronAPIが利用不可の場合は何もしない", async () => {
      // @ts-expect-error - Remove authMode.status
      delete global.window.electronAPI.authMode.status;

      const { state } = createTestSlice();

      await state().fetchStatus();

      expect(state().status).toBeNull();
    });
  });

  // ===========================================================================
  // validate テスト
  // ===========================================================================
  describe("validate", () => {
    it("有効な認証方式の場合はisValid=trueを返す", async () => {
      mockElectronAPI.authMode.validate.mockResolvedValue({
        success: true,
        data: { isValid: true },
      });

      const { state } = createTestSlice();

      const result = await state().validate();

      expect(result.isValid).toBe(true);
    });

    it("無効な認証方式の場合はisValid=falseを返す", async () => {
      mockElectronAPI.authMode.validate.mockResolvedValue({
        success: true,
        data: { isValid: false },
      });

      const { state } = createTestSlice();

      const result = await state().validate();

      expect(result.isValid).toBe(false);
    });

    it("IPCエラー時はisValid=falseを返す", async () => {
      mockElectronAPI.authMode.validate.mockRejectedValue(
        new Error("Connection error"),
      );

      const { state } = createTestSlice();

      const result = await state().validate();

      expect(result.isValid).toBe(false);
    });

    it("electronAPIが利用不可の場合はisValid=falseを返す", async () => {
      // @ts-expect-error - Remove authMode.validate
      delete global.window.electronAPI.authMode.validate;

      const { state } = createTestSlice();

      const result = await state().validate();

      expect(result.isValid).toBe(false);
    });
  });

  // ===========================================================================
  // 確認ダイアログテスト
  // ===========================================================================
  describe("Confirm Dialog", () => {
    it("openConfirmDialogで確認ダイアログを開ける", () => {
      const { state } = createTestSlice();

      state().openConfirmDialog("api-key");

      expect(state().isConfirmDialogOpen).toBe(true);
      expect(state().pendingMode).toBe("api-key");
    });

    it("closeConfirmDialogで確認ダイアログを閉じる", () => {
      const { state } = createTestSlice();
      state().openConfirmDialog("api-key");

      state().closeConfirmDialog();

      expect(state().isConfirmDialogOpen).toBe(false);
      expect(state().pendingMode).toBeNull();
    });

    it("confirmModeChangeでpendingModeに切り替える", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          message: "キー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();
      state().openConfirmDialog("api-key");

      await state().confirmModeChange();

      expect(state().mode).toBe("api-key");
      expect(mockElectronAPI.authMode.set).toHaveBeenCalledWith({
        mode: "api-key",
      });
    });

    it("pendingModeがない場合はconfirmModeChangeは何もしない", async () => {
      const { state } = createTestSlice();

      await state().confirmModeChange();

      expect(mockElectronAPI.authMode.set).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // clearError テスト
  // ===========================================================================
  describe("clearError", () => {
    it("エラー状態をクリアできる", async () => {
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: false,
        error: { message: "エラーメッセージ" },
      });

      const { state } = createTestSlice();
      await state().fetchMode();
      expect(state().error).toBe("エラーメッセージ");

      state().clearError();

      expect(state().error).toBeNull();
    });
  });

  // ===========================================================================
  // resetAuthMode テスト
  // ===========================================================================
  describe("resetAuthMode", () => {
    it("状態を初期状態にリセットする", async () => {
      mockElectronAPI.authMode.set.mockResolvedValue({ success: true });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: {
          mode: "api-key",
          isValid: true,
          message: "キー設定済み",
          lastCheckedAt: Date.now(),
        },
      });

      const { state } = createTestSlice();

      // 状態を変更
      await state().setMode("api-key");
      state().openConfirmDialog("subscription");

      // リセット
      state().resetAuthMode();

      expect(state().mode).toBe("subscription");
      expect(state().isLoading).toBe(false);
      expect(state().error).toBeNull();
      expect(state().isConfirmDialogOpen).toBe(false);
      expect(state().pendingMode).toBeNull();
      expect(state().status).toBeNull();
    });
  });

  // ===========================================================================
  // リスナー二重登録防止テスト
  // ===========================================================================
  describe("Listener Registration", () => {
    it("リスナーは1回だけ登録される（二重登録防止）", () => {
      const mockOnModeChanged = vi.fn();
      mockElectronAPI.authMode.onModeChanged = mockOnModeChanged;
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: true,
        data: { mode: "subscription" },
      });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: null,
      });

      const { state: state1 } = createTestSlice();
      const { state: state2 } = createTestSlice();

      // 2回初期化
      state1().initializeAuthMode();
      state2().initializeAuthMode();

      // リスナーは1回だけ登録される
      expect(mockOnModeChanged).toHaveBeenCalledTimes(1);
    });

    it("resetAuthMode後は再登録可能", () => {
      const mockOnModeChanged = vi.fn();
      mockElectronAPI.authMode.onModeChanged = mockOnModeChanged;
      mockElectronAPI.authMode.get.mockResolvedValue({
        success: true,
        data: { mode: "subscription" },
      });
      mockElectronAPI.authMode.status.mockResolvedValue({
        success: true,
        data: null,
      });

      const { state } = createTestSlice();

      // 初期化
      state().initializeAuthMode();

      // リセット
      state().resetAuthMode();

      // 再初期化
      state().initializeAuthMode();

      // 2回登録される（リセット後の再登録）
      expect(mockOnModeChanged).toHaveBeenCalledTimes(2);
    });
  });

  // ===========================================================================
  // エラーハンドリングテスト
  // ===========================================================================
  describe("Error Handling", () => {
    it("ネットワークエラーは適切なメッセージに変換される", async () => {
      mockElectronAPI.authMode.get.mockRejectedValue(
        new Error("Network error: fetch failed"),
      );

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().error).toBe("ネットワーク接続を確認してください");
    });

    it("Keychainアクセスエラーは適切なメッセージに変換される", async () => {
      mockElectronAPI.authMode.get.mockRejectedValue(
        new Error("Keychain access denied"),
      );

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().error).toBe("Keychainへのアクセスが拒否されました");
    });

    it("不明なエラーはデフォルトメッセージに変換される", async () => {
      mockElectronAPI.authMode.get.mockRejectedValue(
        new Error("Unknown error"),
      );

      const { state } = createTestSlice();

      await state().fetchMode();

      expect(state().error).toBe("予期しないエラーが発生しました");
    });
  });
});
