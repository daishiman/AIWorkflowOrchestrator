/**
 * authModeSlice - 認証方式管理Zustand Slice
 *
 * Claude Agent SDKの認証方式（サブスクリプション / APIキー）を管理する。
 *
 * セキュリティ対策:
 * - トークン・APIキーは状態に保存しない
 * - 認証情報はMain Processのみで管理
 * - Rendererには最小限の状態のみを渡す
 *
 * @see docs/30-workflows/TASK-AUTH-MODE-SELECTION-001/outputs/phase-2/state-management-design.md
 */
import { StateCreator } from "zustand";

// ============================================================
// 型定義
// ============================================================

/**
 * 認証方式
 * @description Claude Agent SDKの認証に使用する方式
 */
export type AuthMode = "subscription" | "api-key";

/**
 * 認証方式エラーコード
 */
export type AuthModeErrorCode =
  | "NOT_LOGGED_IN"
  | "TOKEN_EXPIRED"
  | "KEYCHAIN_ACCESS_DENIED"
  | "API_KEY_NOT_SET"
  | "API_KEY_INVALID"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

/**
 * 認証状態
 * @description 現在の認証方式での認証有効性
 */
export interface AuthModeStatus {
  /** 認証方式 */
  mode: AuthMode;
  /** 認証が有効か */
  isValid: boolean;
  /** 詳細メッセージ */
  message: string;
  /** エラーコード（エラー時のみ） */
  errorCode?: AuthModeErrorCode;
  /** 最終確認日時 */
  lastCheckedAt: number;
}

/**
 * 認証方式バリデーション結果
 */
export interface AuthModeValidationResult {
  isValid: boolean;
  message?: string;
  errorCode?: AuthModeErrorCode;
}

/**
 * 認証方式エラーメッセージマッピング
 */
export const AUTH_MODE_ERROR_MESSAGES: Record<AuthModeErrorCode, string> = {
  NOT_LOGGED_IN: "Claude Code CLIでログインしてください",
  TOKEN_EXPIRED: "認証の有効期限が切れました。再度ログインしてください",
  KEYCHAIN_ACCESS_DENIED: "Keychainへのアクセスが拒否されました",
  API_KEY_NOT_SET: "APIキーを設定してください",
  API_KEY_INVALID: "APIキーの形式が正しくありません",
  NETWORK_ERROR: "ネットワーク接続を確認してください",
  UNKNOWN_ERROR: "予期しないエラーが発生しました",
};

// ============================================================
// リスナー管理（二重登録防止）
// @see 06-known-pitfalls.md#P5
// ============================================================

/**
 * onModeChanged リスナーの登録状態
 * 二重登録を防止するためのモジュールスコープフラグ
 */
let authModeListenerRegistered = false;

/**
 * リスナー登録状態をリセット
 * resetAuthMode時に呼び出され、再初期化を可能にする
 */
export function resetAuthModeListenerFlag(): void {
  authModeListenerRegistered = false;
}

// ============================================================
// Slice定義
// ============================================================

/**
 * 認証方式管理スライス
 */
export interface AuthModeSlice {
  // ============================================================
  // State
  // ============================================================

  /** 現在の認証方式 */
  mode: AuthMode;

  /** 認証状態（有効性情報） */
  status: AuthModeStatus | null;

  /** ローディング状態 */
  isLoading: boolean;

  /** エラーメッセージ（日本語） */
  error: string | null;

  /** 確認ダイアログ表示状態 */
  isConfirmDialogOpen: boolean;

  /** 切り替え先の認証方式（確認ダイアログ用） */
  pendingMode: AuthMode | null;

  // ============================================================
  // Actions
  // ============================================================

  /** 現在の認証方式を取得 */
  fetchMode: () => Promise<void>;

  /** 認証方式を設定 */
  setMode: (mode: AuthMode) => Promise<void>;

  /** 認証状態を取得 */
  fetchStatus: () => Promise<void>;

  /** 認証方式のバリデーション */
  validate: () => Promise<AuthModeValidationResult>;

  /** 確認ダイアログを表示 */
  openConfirmDialog: (targetMode: AuthMode) => void;

  /** 確認ダイアログを閉じる */
  closeConfirmDialog: () => void;

  /** 切り替えを確定 */
  confirmModeChange: () => Promise<void>;

  /** エラーをクリア */
  clearError: () => void;

  /** 状態をリセット */
  resetAuthMode: () => void;

  /** 認証方式の初期化 */
  initializeAuthMode: () => void;
}

// ============================================================
// エラーハンドリング
// ============================================================

/**
 * エラーからユーザー向けメッセージを生成
 */
function handleAuthModeError(error: unknown): string {
  if (!(error instanceof Error)) {
    return AUTH_MODE_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const message = error.message.toLowerCase();

  if (message.includes("network") || message.includes("fetch")) {
    return AUTH_MODE_ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (message.includes("keychain") || message.includes("access")) {
    return AUTH_MODE_ERROR_MESSAGES.KEYCHAIN_ACCESS_DENIED;
  }

  return AUTH_MODE_ERROR_MESSAGES.UNKNOWN_ERROR;
}

// ============================================================
// Slice Creator
// ============================================================

export const createAuthModeSlice: StateCreator<
  AuthModeSlice,
  [],
  [],
  AuthModeSlice
> = (set, get) => ({
  // ============================================================
  // Initial State
  // ============================================================

  mode: "subscription", // デフォルトはサブスクリプション認証
  status: null,
  isLoading: false,
  error: null,
  isConfirmDialogOpen: false,
  pendingMode: null,

  // ============================================================
  // Actions
  // ============================================================

  fetchMode: async () => {
    set({ isLoading: true, error: null });

    try {
      // Guard: Skip IPC if electronAPI is not available
      if (!window.electronAPI?.authMode?.get) {
        console.warn("[AuthModeSlice] authMode.get not available");
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.authMode.get();

      if (response.success && response.data) {
        set({
          mode: response.data.mode,
          isLoading: false,
        });

        // 認証状態も取得
        get().fetchStatus();
      } else {
        set({
          isLoading: false,
          error: response.error?.message ?? "認証方式の取得に失敗しました",
        });
      }
    } catch (error) {
      console.error("[AuthModeSlice] fetchMode error:", error);
      set({
        isLoading: false,
        error: handleAuthModeError(error),
      });
    }
  },

  setMode: async (mode: AuthMode) => {
    set({ isLoading: true, error: null });

    try {
      if (!window.electronAPI?.authMode?.set) {
        console.warn("[AuthModeSlice] authMode.set not available");
        set({ isLoading: false });
        return;
      }

      const response = await window.electronAPI.authMode.set({ mode });

      if (response.success) {
        set({
          mode,
          isLoading: false,
          isConfirmDialogOpen: false,
          pendingMode: null,
        });

        // 新しい認証方式の状態を取得
        get().fetchStatus();
      } else {
        set({
          isLoading: false,
          error: response.error?.message ?? "認証方式の設定に失敗しました",
        });
      }
    } catch (error) {
      console.error("[AuthModeSlice] setMode error:", error);
      set({
        isLoading: false,
        error: handleAuthModeError(error),
      });
    }
  },

  fetchStatus: async () => {
    try {
      if (!window.electronAPI?.authMode?.status) {
        console.warn("[AuthModeSlice] authMode.status not available");
        return;
      }

      const response = await window.electronAPI.authMode.status();

      if (response.success && response.data) {
        set({ status: response.data });
      }
    } catch (error) {
      console.error("[AuthModeSlice] fetchStatus error:", error);
    }
  },

  validate: async (): Promise<AuthModeValidationResult> => {
    try {
      if (!window.electronAPI?.authMode?.validate) {
        console.warn("[AuthModeSlice] authMode.validate not available");
        return { isValid: false };
      }

      const response = await window.electronAPI.authMode.validate();

      if (response.success && response.data) {
        return {
          isValid: response.data.isValid,
          message: response.data.message,
          errorCode: response.data.errorCode,
        };
      }

      return { isValid: false };
    } catch (error) {
      console.error("[AuthModeSlice] validate error:", error);
      return { isValid: false };
    }
  },

  openConfirmDialog: (targetMode: AuthMode) => {
    set({
      isConfirmDialogOpen: true,
      pendingMode: targetMode,
    });
  },

  closeConfirmDialog: () => {
    set({
      isConfirmDialogOpen: false,
      pendingMode: null,
    });
  },

  confirmModeChange: async () => {
    const { pendingMode } = get();

    if (!pendingMode) {
      return;
    }

    await get().setMode(pendingMode);
  },

  clearError: () => {
    set({ error: null });
  },

  resetAuthMode: () => {
    resetAuthModeListenerFlag();

    set({
      mode: "subscription",
      status: null,
      isLoading: false,
      error: null,
      isConfirmDialogOpen: false,
      pendingMode: null,
    });
  },

  initializeAuthMode: () => {
    // 現在の認証方式を取得
    get().fetchMode();

    // リスナーを設定（二重登録防止付き）
    setupAuthModeListener(set, get);
  },
});

// ============================================================
// リスナー設定
// ============================================================

/**
 * 認証方式変更リスナーの設定
 *
 * 二重登録を防止するためのパターン:
 * 1. モジュールスコープのフラグで登録状態を管理
 * 2. 登録前にフラグをチェック
 * 3. resetAuthMode時にフラグをリセット
 *
 * @see 06-known-pitfalls.md#P5
 */
function setupAuthModeListener(
  set: (state: Partial<AuthModeSlice>) => void,
  get: () => AuthModeSlice,
): void {
  // 二重登録チェック
  if (authModeListenerRegistered) {
    console.log("[AuthModeSlice] Listener already registered, skipping");
    return;
  }

  // Guard: electronAPI存在チェック
  if (!window.electronAPI?.authMode?.onModeChanged) {
    console.warn("[AuthModeSlice] authMode.onModeChanged not available");
    return;
  }

  // リスナー登録
  authModeListenerRegistered = true;
  console.log("[AuthModeSlice] Registering auth mode change listener");

  window.electronAPI.authMode.onModeChanged((event) => {
    console.log("[AuthModeSlice] Auth mode changed:", event);

    set({
      mode: event.mode,
      status: event.status ?? null,
    });

    // 認証状態を更新
    get().fetchStatus();
  });
}
